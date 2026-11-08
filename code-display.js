// One shared tokenizer used by both the highlighter and the source patcher so
// that a number's ordinal index means the same thing in the panel and in the
// code that actually runs. Order matters: comments | strings | numbers | idents.
const TOKEN_RE = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+\.?\d*\b)|([A-Za-z_$][A-Za-z0-9_$]*)/g;

const KEYWORDS = new Set([
    'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for',
    'while', 'new', 'this', 'true', 'false', 'null', 'undefined',
    'of', 'in', 'typeof', 'break', 'continue'
]);

// Properties whose value must stay positive (a zero/negative duration breaks GSAP).
const CLAMP_MIN_PROPS = new Set(['duration', 'delay', 'each', 'stagger']);

// Per-letter numeric overrides, keyed by the number's ordinal index within that
// letter's source: { A: { 3: { text: '2.0', value: 2, decimals: 1 } } }
const overrides = {};

// Live scrub state + a rAF gate so rapid drags rebuild at most once per frame.
let scrub = null;
let rebuildQueued = false;
let pendingLetter = null;

// Cursor-following hint shown over the code area (hidden while scrubbing).
let cursorHintEl = null;
let overCodeArea = false;

function buildCursorHint() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'code-cursor-hint');
    svg.setAttribute('width', '360');
    svg.setAttribute('height', '60');
    const mk = function(y, str) {
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', '2');
        t.setAttribute('y', String(y));
        t.textContent = str;
        return t;
    };
    svg.appendChild(mk(22, 'drag ←→ any number to retune'));
    svg.appendChild(mk(48, 'double-click to reset'));
    document.body.appendChild(svg);
    return svg;
}
function moveCursorHint(x, y) {
    if (cursorHintEl) {
        cursorHintEl.style.left = x + 'px';
        cursorHintEl.style.top = y + 'px';
    }
}
function showCursorHint() { if (cursorHintEl) cursorHintEl.style.display = 'block'; }
function hideCursorHint() { if (cursorHintEl) cursorHintEl.style.display = 'none'; }

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // The permanent code column on the left
    const container = document.getElementById('code-display');
    if (!container) return;

    // Render the current letter's code on load
    renderCode(getCurrentLetter());

    // Drag numbers to retune; double-click a number to reset it.
    container.addEventListener('pointerdown', onScrubStart);
    container.addEventListener('dblclick', onScrubReset);

    // Cursor-following hint, shown only when the cursor is within the rightmost
    // band of the code area (so it never covers the numbers you want to drag).
    cursorHintEl = buildCursorHint();
    const codeArea = document.querySelector('.code-column') || container;
    const HINT_BAND = 0.28; // rightmost 28% of the code area

    // Mobile: no cursor to follow, and the code column sits at the bottom of a
    // window-scrolling page. Instead of tracking the pointer, show the hint
    // (fixed + centred, so it never clips off-screen) for a band of scroll
    // roughly one screen in, then hide it as you keep scrolling down.
    const mqMobile = window.matchMedia('(max-width: 768px)');
    if (mqMobile.matches) {
        cursorHintEl.classList.add('mobile-hint');
        // Tighten the leading for the smaller mobile font, and shrink the SVG
        // box to fit so the (left-aligned) block sits centred on screen.
        const lines = cursorHintEl.querySelectorAll('text');
        if (lines[0]) lines[0].setAttribute('y', '13');
        if (lines[1]) lines[1].setAttribute('y', '31');
        cursorHintEl.setAttribute('height', '40');
        (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function() {
            const prev = cursorHintEl.style.display;
            cursorHintEl.style.visibility = 'hidden';
            cursorHintEl.style.display = 'block';
            let maxW = 0;
            lines.forEach(function(t) {
                try { maxW = Math.max(maxW, t.getComputedTextLength()); } catch (e) {}
            });
            cursorHintEl.style.display = prev || 'none';
            cursorHintEl.style.visibility = '';
            if (maxW > 0) cursorHintEl.setAttribute('width', String(Math.ceil(maxW + 8)));
        });
        let hintTicking = false;
        function updateMobileHint() {
            hintTicking = false;
            if (scrub) { hideCursorHint(); return; }
            const y = window.scrollY || window.pageYOffset || 0;
            const vh = window.innerHeight;
            const showAt = vh * 0.15;   // show early, just after you start scrolling
            const hideAt = vh * 1.1;    // gone once about one screen in
            if (y >= showAt && y <= hideAt) { showCursorHint(); }
            else { hideCursorHint(); }
        }
        window.addEventListener('scroll', function() {
            if (!hintTicking) { hintTicking = true; requestAnimationFrame(updateMobileHint); }
        }, { passive: true });
        updateMobileHint();
    }

    function updateHint(e) {
        if (scrub) { hideCursorHint(); codeArea.classList.remove('hint-active'); return; }
        const rect = codeArea.getBoundingClientRect();
        const inBand = e.clientX >= rect.right - rect.width * HINT_BAND;
        if (inBand) {
            moveCursorHint(e.clientX, e.clientY);
            showCursorHint();
            codeArea.classList.add('hint-active');
        } else {
            hideCursorHint();
            codeArea.classList.remove('hint-active');
        }
    }
    if (!mqMobile.matches) {   // desktop only: pointer-following hint
        codeArea.addEventListener('mouseenter', function(e) { overCodeArea = true; updateHint(e); });
        codeArea.addEventListener('mousemove', updateHint);
        codeArea.addEventListener('mouseleave', function() {
            overCodeArea = false;
            hideCursorHint();
            codeArea.classList.remove('hint-active');
        });
    }

    // Re-render whenever the letter changes, re-applying that letter's overrides.
    document.addEventListener('letterChanged', function(event) {
        const letter = (event.detail && event.detail.letter) || getCurrentLetter();
        renderCode(letter);
        if (hasOverrides(letter) && window.primer && window.primer.run) {
            window.primer.run(letter, buildSource(letter));
        }
    });
});

function hasOverrides(letter) {
    return !!(overrides[letter] && Object.keys(overrides[letter]).length);
}

// Rebuild a letter's source with its numeric overrides applied. Same base and
// same tokenizer as the highlighter, so number indices line up exactly.
function buildSource(letter) {
    const base = getCodeForLetter(letter);
    const ov = overrides[letter];
    if (!ov) return base;

    let out = '';
    let last = 0;
    let n = 0;
    let m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(base)) !== null) {
        if (m[3] !== undefined) {          // a numeric literal
            if (ov[n]) {
                const start = absorbSign(base, m.index);   // swallow a unary sign
                out += base.slice(last, start) + ov[n].text;
                last = m.index + m[0].length;
            }
            n++;
        }
    }
    out += base.slice(last);
    return out;
}

// Look back from a number to find the property it's assigned to (duration:, x:, …)
function numberProp(code, idx) {
    const before = code.slice(Math.max(0, idx - 48), idx);
    const m = before.match(/([A-Za-z_$][\w$]*)\s*:\s*-?\s*$/);
    return m ? m[1] : '';
}

// If a unary minus directly precedes the number in a value position (after
// `:` `,` `(` `[` `{` `=` `?`), treat it as the number's sign so scrubbing can
// cross zero and flip direction. A minus after an operand (e.g. `chars.length - 1`)
// is subtraction and is left alone. Returns the effective token start offset.
function absorbSign(code, idx) {
    const pre = code.slice(0, idx);
    const sm = pre.match(/-\s*$/);
    if (!sm) return idx;
    const beforeMinus = pre.slice(0, sm.index).replace(/\s+$/, '');
    const last = beforeMinus.slice(-1);
    if (last === '' || ':,([{=?&|'.indexOf(last) >= 0) return sm.index;
    return idx;
}

function queueRebuild(letter) {
    pendingLetter = letter;
    if (rebuildQueued) return;
    rebuildQueued = true;
    requestAnimationFrame(function() {
        rebuildQueued = false;
        if (window.primer && window.primer.run) {
            window.primer.run(pendingLetter, buildSource(pendingLetter));
        }
    });
}

function onScrubStart(e) {
    const span = e.target.closest && e.target.closest('.tok-number');
    if (!span) return;
    e.preventDefault();

    const txt = span.textContent.trim();
    // Step by the number's own precision: "2.5" → 0.1, "0.05" → 0.01, "150" → 1.
    const dot = txt.indexOf('.');
    const decimals = dot >= 0 ? (txt.length - dot - 1) : 0;
    scrub = {
        letter: getCurrentLetter(),
        index: parseInt(span.dataset.index, 10),
        span: span,
        startX: e.clientX,
        startVal: parseFloat(txt) || 0,
        decimals: decimals,
        step: decimals > 0 ? Math.pow(10, -decimals) : 1,
        prop: span.dataset.prop || '',
        lastText: txt,
        changed: false
    };
    document.body.classList.add('scrubbing');
    span.classList.add('scrub-active');
    hideCursorHint();               // no hint text while manipulating a number
    window.addEventListener('pointermove', onScrubMove);
    window.addEventListener('pointerup', onScrubEnd);
}

function onScrubMove(e) {
    if (!scrub) return;
    const PX_PER_STEP = 3;   // fewer pixels per step → more responsive
    const STEP_MULT = 3;     // bigger jump per step → more dramatic
    const steps = Math.round((e.clientX - scrub.startX) / PX_PER_STEP);
    let v = scrub.startVal + steps * scrub.step * STEP_MULT;
    if (CLAMP_MIN_PROPS.has(scrub.prop)) v = Math.max(scrub.step, v);
    const f = Math.pow(10, scrub.decimals);
    v = Math.round(v * f) / f;

    const text = scrub.decimals > 0 ? v.toFixed(scrub.decimals) : String(v);
    if (text === scrub.lastText) return;
    scrub.lastText = text;
    scrub.changed = true;

    if (!overrides[scrub.letter]) overrides[scrub.letter] = {};
    overrides[scrub.letter][scrub.index] = { text: text, value: v, decimals: scrub.decimals };
    scrub.span.textContent = text;      // live-update the visible number
    queueRebuild(scrub.letter);
}

function onScrubEnd() {
    if (!scrub) return;
    const letter = scrub.letter;
    const changed = scrub.changed;
    scrub.span.classList.remove('scrub-active');
    document.body.classList.remove('scrubbing');
    window.removeEventListener('pointermove', onScrubMove);
    window.removeEventListener('pointerup', onScrubEnd);
    scrub = null;
    // Hint reappears on the next move into the right band (handled by updateHint).
    if (changed) {
        renderCode(letter);             // clean re-render with the final value
        if (window.primer && window.primer.run) window.primer.run(letter, buildSource(letter));
    }
}

function onScrubReset(e) {
    const span = e.target.closest && e.target.closest('.tok-number');
    if (!span) return;
    const letter = getCurrentLetter();
    const index = parseInt(span.dataset.index, 10);
    if (overrides[letter]) {
        delete overrides[letter][index];
        if (!Object.keys(overrides[letter]).length) delete overrides[letter];
    }
    renderCode(letter);
    if (window.primer && window.primer.run) window.primer.run(letter, buildSource(letter));
}

// Get the current letter being displayed
function getCurrentLetter() {
    // Try to find from the active letter in the alphabet strip
    const currentLetterEl = document.querySelector('.letter.current');
    if (currentLetterEl) {
        return currentLetterEl.getAttribute('data-letter');
    }

    // Try to get from main letter display
    const mainLetter = document.querySelector('.main-letter');
    if (mainLetter) {
        return mainLetter.textContent.trim().charAt(0).toUpperCase();
    }

    return 'A'; // Default to A if we can't determine
}

// Render the code for a letter into the left column
function renderCode(letter) {
    const container = document.getElementById('code-display');
    if (!container) return;

    const code = getCodeForLetter(letter);

    // Clear previous content
    container.innerHTML = '';

    // Title comment
    const title = document.createElement('div');
    title.className = 'code-title';
    title.textContent = '// ' + letter + ' - ' + getLongLetterName(letter) + ' Animation';
    container.appendChild(title);

    // Code body (with token highlight boxes)
    const codeEl = document.createElement('pre');
    codeEl.className = 'code-body';
    codeEl.innerHTML = highlightCode(code, letter);
    container.appendChild(codeEl);

    // Reset scroll to the top on each new letter
    container.scrollTop = 0;
}

// Escape HTML special characters
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Wrap a token in a highlight-box span
function wrapToken(text, type) {
    return '<span class="tok tok-' + type + '">' + escapeHtml(text) + '</span>';
}

// Lightweight JS tokenizer → background highlight boxes (not text color).
// Numbers are additionally made scrubbable: each carries its ordinal index (so
// buildSource can patch the matching literal) and the property it belongs to
// (so we know whether to clamp it positive). Overridden numbers render their
// current value, keeping the panel in sync with the running animation.
function highlightCode(code, letter) {
    const ov = overrides[letter] || {};

    let result = '';
    let lastIndex = 0;
    let numIndex = 0;
    let match;
    TOKEN_RE.lastIndex = 0;

    while ((match = TOKEN_RE.exec(code)) !== null) {
        const full = match[0];
        const comment = match[1];
        const str = match[2];
        const num = match[3];
        const ident = match[4];

        // A number may absorb a preceding unary minus into its token so the sign
        // is scrubbable; every other token starts at its own match index.
        const tokenStart = (num !== undefined) ? absorbSign(code, match.index) : match.index;

        // Plain text between tokens (up to the effective token start)
        result += escapeHtml(code.slice(lastIndex, tokenStart));

        if (comment) {
            result += wrapToken(full, 'comment');
        } else if (str) {
            result += wrapToken(full, 'string');
        } else if (num !== undefined) {
            const defaultText = code.slice(tokenStart, match.index) + full;  // e.g. "-150"
            const text = ov[numIndex] ? ov[numIndex].text : defaultText;
            const prop = numberProp(code, match.index);
            const edited = ov[numIndex] ? ' scrub-edited' : '';
            result += '<span class="tok tok-number scrub' + edited + '" data-index="' + numIndex + '"'
                    + (prop ? ' data-prop="' + escapeHtml(prop) + '"' : '')
                    + '>' + escapeHtml(text) + '</span>';
            numIndex++;
        } else if (ident) {
            if (KEYWORDS.has(full)) {
                result += wrapToken(full, 'keyword');
            } else {
                const before = code[match.index - 1];
                const after = code.slice(match.index + full.length);
                if (/^\s*\(/.test(after)) {
                    result += wrapToken(full, 'func');   // function / method call
                } else if (before === '.' || /^\s*:/.test(after)) {
                    result += wrapToken(full, 'prop');   // property access / object key
                } else {
                    result += escapeHtml(full);          // plain identifier (no box)
                }
            }
        }

        lastIndex = match.index + full.length;
    }

    // Trailing text
    result += escapeHtml(code.slice(lastIndex));
    return result;
}

// Get the full name for a letter
function getLongLetterName(letter) {
    const names = {
        'A': 'Acceleration',
        'B': 'Balance',
        'C': 'Conversion',
        'D': 'Density',
        'E': 'Equilibrium',
        'F': 'Friction',
        'G': 'Gravity',
        'H': 'Harmonic',
        'I': 'Inertia',
        'J': 'Joule',
        'K': 'Kinetic',
        'L': 'Luminosity',
        'M': 'Momentum',
        'N': 'Neutron',
        'O': 'Oscillation',
        'P': 'Potential',
        'Q': 'Quantum',
        'R': 'Resonance',
        'S': 'Symmetry',
        'T': 'Thermal',
        'U': 'Uncertainty',
        'V': 'Voltage',
        'W': 'Wave',
        'X': 'X-ray',
        'Y': 'Yield',
        'Z': 'Zero Point'
    };
    
    return names[letter] || letter;
}

// Strip the common leading indentation so a function printed via
// Function.prototype.toString() reads cleanly in the panel.
function dedent(code) {
    const lines = code.split('\n');
    let min = Infinity;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const indent = lines[i].match(/^ */)[0].length;
        if (indent < min) min = indent;
    }
    if (!isFinite(min) || min === 0) return code;
    return lines.map((line, i) => (i === 0 ? line : line.slice(min))).join('\n');
}

// Get animation code for a specific letter.
// Prints the ACTUAL running animation function (from primer-no-cursor.js) so
// the panel always matches what really executes on screen. The literal strings
// below are kept only as an offline fallback for when the live map is missing.
function getCodeForLetter(letter) {
    const live = window.animationFunctions;
    if (live && live[letter]) {
        return dedent(live[letter].toString());
    }

    // Simple code examples for all 26 letters
    const codes = {
        'A': 'function initAccelerationAnimation() {\n' +
             '  const { splitText, chars } = createSplitTextAnimation();\n' +
             '  \n' +
             '  // Get slider position for acceleration value\n' +
             '  let accelerationRate = 0.05 + getSliderValue() * 0.5;\n' +
             '  \n' +
             '  // Define horizontal movement range (in pixels)\n' +
             '  const minX = -80;\n' +
             '  const maxX = 80;\n' +
             '  \n' +
             '  // Create master timeline\n' +
             '  const masterTl = gsap.timeline({\n' +
             '    repeat: -1,\n' +
             '    onUpdate: function() {\n' +
             '      // Update acceleration rate based on current slider position\n' +
             '      accelerationRate = 0.05 + getSliderValue() * 0.5;\n' +
             '    }\n' +
             '  });\n' +
             '  \n' +
             '  // Set initial position\n' +
             '  gsap.set(chars, { x: 0, y: 0 });\n' +
             '  \n' +
             '  // Create the symmetrical horizontal movement animation\n' +
             '  function createSymmetricalMotion() {\n' +
             '    const tl = gsap.timeline();\n' +
             '    const staggerTime = 0.04;\n' +
             '    \n' +
             '    // Right movement with acceleration\n' +
             '    tl.to(chars, {\n' +
             '      x: maxX,\n' +
             '      duration: 0.8,\n' +
             '      stagger: staggerTime,\n' +
             '      ease: "power3.in" // Acceleration curve\n' +
             '    });\n' +
             '    \n' +
             '    // Left movement with acceleration\n' +
             '    tl.to(chars, {\n' +
             '      x: minX,\n' +
             '      duration: 0.8,\n' +
             '      stagger: staggerTime,\n' +
             '      ease: "power3.in" // Acceleration curve\n' +
             '    });\n' +
             '    \n' +
             '    // Return to center\n' +
             '    tl.to(chars, {\n' +
             '      x: 0,\n' +
             '      duration: 0.5,\n' +
             '      stagger: staggerTime,\n' +
             '      ease: "back.out(1.2)" // Add a slight bounce\n' +
             '    });\n' +
             '    \n' +
             '    return tl;\n' +
             '  }\n' +
             '  \n' +
             '  // Add the symmetrical motion to the master timeline\n' +
             '  masterTl.add(createSymmetricalMotion());\n' +
             '  \n' +
             '  return masterTl;\n' +
             '}',

        'B': 'function initBalanceAnimation() {\n' +
             '  const { splitText, chars } = createSplitTextAnimation();\n' +
             '  \n' +
             '  // Set initial rotation and position\n' +
             '  gsap.set(chars, { rotation: 0, y: 0, transformOrigin: "bottom center" });\n' +
             '  \n' +
             '  // Define the max rotation angles (in degrees)\n' +
             '  const baseMaxRotation = 30; // Base maximum rotation (no cursor)\n' +
             '  const cursorMaxRotation = 45; // Maximum rotation with cursor influence\n' +
             '  \n' +
             '  // Create the continuous swaying timeline\n' +
             '  const baseTl = gsap.timeline({\n' +
             '    repeat: -1,\n' +
             '    yoyo: true\n' +
             '  });\n' +
             '  \n' +
             '  // Continuous side-to-side swaying\n' +
             '  baseTl.to(chars, {\n' +
             '    rotation: -15,\n' +
             '    duration: 1.5,\n' +
             '    ease: "sine.inOut",\n' +
             '    stagger: 0.08\n' +
             '  });\n' +
             '  \n' +
             '  baseTl.to(chars, {\n' +
             '    rotation: 15,\n' +
             '    duration: 1.5,\n' +
             '    ease: "sine.inOut",\n' +
             '    stagger: 0.08\n' +
             '  });\n' +
             '  \n' +
             '  // Use slider to control the balance stability\n' +
             '  const sliderValue = getSliderValue();\n' +
             '  const stabilityFactor = 0.5 + sliderValue * 2; // 0.5 to 2.5\n' +
             '  \n' +
             '  baseTl.timeScale(1 / stabilityFactor); // Slower with more stability\n' +
             '  \n' +
             '  return baseTl;\n' +
             '}',

        'C': 'function initConversionAnimation() {\n' +
             '  const { splitText, chars } = createSplitTextAnimation();\n' +
             '  \n' +
             '  // For "Conversion" - animate changing from one form to another\n' +
             '  // Set initial state\n' +
             '  gsap.set(chars, { \n' +
             '    transformOrigin: "center center",\n' +
             '    scale: 1,\n' +
             '    rotation: 0,\n' +
             '    opacity: 1,\n' +
             '    color: "#000000"\n' +
             '  });\n' +
             '  \n' +
             '  // Create conversion cycle animation\n' +
             '  const tl = gsap.timeline({ repeat: -1 });\n' +
             '  \n' +
             '  // Cycle through color/brightness\n' +
             '  // Blue state\n' +
             '  tl.to(chars, {\n' +
             '    scale: 1.2,\n' +
             '    rotation: 45,\n' +
             '    opacity: 0.8,\n' +
             '    color: "#46EAFF",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  // Red state\n' +
             '  tl.to(chars, {\n' +
             '    scale: 0.8,\n' +
             '    rotation: -20,\n' +
             '    opacity: 0.9,\n' +
             '    color: "#FF565B",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  // Green state\n' +
             '  tl.to(chars, {\n' +
             '    scale: 1.1,\n' +
             '    rotation: 10,\n' +
             '    opacity: 1,\n' +
             '    color: "#B6FF67",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  // Back to original\n' +
             '  tl.to(chars, {\n' +
             '    scale: 1,\n' +
             '    rotation: 0,\n' +
             '    opacity: 1,\n' +
             '    color: "#000000",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  return tl;\n' +
             '}'
    };
    
    // D - Density
    codes['D'] =
        'function initDensityAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  gsap.set(chars, { transformOrigin: "center bottom" });\n' +
        '  \n' +
        '  // Pulse scale to represent mass per unit volume\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  tl.to(chars, {\n' +
        '    scale: 0.85, // More dense (compressed)\n' +
        '    duration: 1.5,\n' +
        '    ease: "sine.inOut"\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    scale: 1.15, // Less dense (expanded)\n' +
        '    duration: 1.5,\n' +
        '    ease: "sine.inOut"\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    scale: 1,\n' +
        '    duration: 1.5,\n' +
        '    ease: "sine.inOut"\n' +
        '  });\n' +
        '  \n' +
        '  // Mouse Y position maps to density state\n' +
        '  document.addEventListener("mousemove", function(e) {\n' +
        '    const rect = mainLetter.getBoundingClientRect();\n' +
        '    if (e.clientX >= rect.left && e.clientX <= rect.right &&\n' +
        '        e.clientY >= rect.top  && e.clientY <= rect.bottom) {\n' +
        '      tl.pause();\n' +
        '      const relY = (e.clientY - rect.top) / rect.height;\n' +
        '      gsap.to(chars, {\n' +
        '        scale: 0.7 + relY * 0.6,\n' +
        '        duration: 0.3,\n' +
        '        ease: "power2.out"\n' +
        '      });\n' +
        '    }\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // E - Equilibrium
    codes['E'] =
        'function initEquilibriumAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  gsap.set(chars, { x: 0, y: 0, rotation: 0,\n' +
        '    transformOrigin: "center center" });\n' +
        '  \n' +
        '  // Gentle pulse outward from center = balanced state\n' +
        '  const tl = gsap.timeline({ repeat: -1, yoyo: true });\n' +
        '  \n' +
        '  tl.to(chars, {\n' +
        '    scale: 1.05,\n' +
        '    duration: 1.5,\n' +
        '    ease: "sine.inOut",\n' +
        '    stagger: { each: 0.1, from: "center" }\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor displaces chars; they snap back to equilibrium\n' +
        '  mainLetter.addEventListener("mousemove", function() {\n' +
        '    chars.forEach(char => {\n' +
        '      gsap.to(char, {\n' +
        '        x: (mouseX - charCenterX) * cursorInfluence * 0.2,\n' +
        '        y: (mouseY - charCenterY) * cursorInfluence * 0.2,\n' +
        '        duration: 0.3, ease: "power2.out"\n' +
        '      });\n' +
        '      gsap.to(char, {\n' +
        '        x: 0, y: 0, delay: 0.3,\n' +
        '        duration: 1, ease: "elastic.out(1, 0.5)"\n' +
        '      });\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // F - Friction
    codes['F'] =
        'function initFrictionAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Start above, slide down against friction\n' +
        '  gsap.set(chars, { y: -120, rotation: -8,\n' +
        '    transformOrigin: "center bottom" });\n' +
        '  \n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Slide down with back.out spring (friction slows it)\n' +
        '  tl.to(chars, {\n' +
        '    y: 0, rotation: 0,\n' +
        '    duration: 1, ease: "back.out(1.7)", stagger: 0.07\n' +
        '  })\n' +
        '  // Bounce at surface\n' +
        '  .to(chars, {\n' +
        '    y: 10, rotation: 2,\n' +
        '    duration: 0.4, ease: "power1.in", stagger: 0.04\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    y: 0, rotation: 0,\n' +
        '    duration: 0.6, ease: "elastic.out(1, 0.3)", stagger: 0.04\n' +
        '  })\n' +
        '  // Slide up (kinetic energy)\n' +
        '  .to(chars, {\n' +
        '    y: -60, rotation: -5,\n' +
        '    duration: 0.8, ease: "power2.inOut", stagger: 0.05\n' +
        '  })\n' +
        '  // Fall back with friction deceleration\n' +
        '  .to(chars, {\n' +
        '    y: 0, rotation: 0,\n' +
        '    duration: 0.8, ease: "elastic.out(1, 0.3)", stagger: 0.04\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // G - Gravity
    codes['G'] =
        'function initGravityAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  gsap.set(chars, { y: 0, x: 0,\n' +
        '    transformOrigin: "center center" });\n' +
        '  \n' +
        '  const gravityStrength = 0.2 + getSliderValue() * 1.5;\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Float up (fighting gravity)\n' +
        '  tl.to(chars, {\n' +
        '    y: -20, duration: 2,\n' +
        '    ease: "power1.inOut", stagger: 0.1\n' +
        '  })\n' +
        '  // Fall with gravitational acceleration\n' +
        '  .to(chars, {\n' +
        '    y: 50, duration: 1 * gravityStrength,\n' +
        '    ease: "power2.in", stagger: 0.05\n' +
        '  })\n' +
        '  // Bounce and settle\n' +
        '  .to(chars, {\n' +
        '    y: 30, duration: 0.5, ease: "power3.out", stagger: 0.05\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    y: 0, duration: 1,\n' +
        '    ease: "elastic.out(1, 0.3)", stagger: 0.05\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor acts as gravity well (inverse square law)\n' +
        '  mainLetter.addEventListener("mousemove", function() {\n' +
        '    chars.forEach(char => {\n' +
        '      const pull = 2000 * gravityStrength * cursorInfluence\n' +
        '                   / Math.max(50, distance * distance);\n' +
        '      gsap.to(char, {\n' +
        '        x: `+=${dirX * pull}`,\n' +
        '        y: `+=${dirY * pull}`,\n' +
        '        duration: 0.3, ease: "power2.out"\n' +
        '      });\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // H - Harmonic
    codes['H'] =
        'function initHarmonicAnimation() {\n' +
        '  // Multi-frequency vibration via requestAnimationFrame\n' +
        '  const spans = splitIntoSpans(mainLetter);\n' +
        '  \n' +
        '  const baseFreq = 5;   // Hz\n' +
        '  const amplitude = 5;  // px\n' +
        '  let startTime = Date.now();\n' +
        '  let running = true;\n' +
        '  \n' +
        '  function animate() {\n' +
        '    if (!running) return;\n' +
        '    const t = (Date.now() - startTime) / 1000;\n' +
        '    \n' +
        '    spans.forEach((span, i) => {\n' +
        '      const phase = i * 0.2;\n' +
        '      const resonance = 1 + cursorInfluence * 4;\n' +
        '      \n' +
        '      // Fundamental + 2nd + 3rd harmonic\n' +
        '      const y = amplitude * resonance * (\n' +
        '        Math.sin(baseFreq * t + phase) +\n' +
        '        0.5 * Math.sin(2.7 * baseFreq * t + phase) +\n' +
        '        0.25 * Math.sin(3.9 * baseFreq * t + phase)\n' +
        '      );\n' +
        '      const x = amplitude * 0.3 * resonance *\n' +
        '        Math.cos(baseFreq * 0.7 * t + phase);\n' +
        '      \n' +
        '      span.style.transform =\n' +
        '        `translate(${x}px, ${y}px)`;\n' +
        '    });\n' +
        '    requestAnimationFrame(animate);\n' +
        '  }\n' +
        '  \n' +
        '  animate();\n' +
        '}';

    // I - Inertia
    codes['I'] =
        'function initInertiaAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Slow breathing pulse at rest (resistance to change)\n' +
        '  const tl = gsap.timeline({ repeat: -1, yoyo: true });\n' +
        '  \n' +
        '  tl.to(chars, {\n' +
        '    scale: 1.05,\n' +
        '    duration: 1.5,\n' +
        '    ease: "sine.inOut",\n' +
        '    stagger: 0.05\n' +
        '  });\n' +
        '  \n' +
        '  // Drag: chars resist and carry momentum after release\n' +
        '  let isDragging = false;\n' +
        '  let velocity = { x: 0, y: 0 };\n' +
        '  \n' +
        '  mainLetter.addEventListener("mousedown", function() {\n' +
        '    isDragging = true;\n' +
        '    tl.pause();\n' +
        '  });\n' +
        '  \n' +
        '  document.addEventListener("mouseup", function() {\n' +
        '    if (!isDragging) return;\n' +
        '    isDragging = false;\n' +
        '    // Momentum carry-through with staggered mass\n' +
        '    chars.forEach((char, i) => {\n' +
        '      gsap.to(char, {\n' +
        '        x: `+=${velocity.x * (1 + i * 0.1)}`,\n' +
        '        y: `+=${velocity.y * (1 + i * 0.1)}`,\n' +
        '        duration: 2,\n' +
        '        ease: "power1.out"\n' +
        '      });\n' +
        '      gsap.to(char, {\n' +
        '        x: 0, y: 0, delay: 2,\n' +
        '        duration: 1, ease: "elastic.out(1, 0.3)"\n' +
        '      });\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // J - Joule
    codes['J'] =
        'function initJouleAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Energy build-up → release cycle\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Build-up: compress and dim\n' +
        '  tl.to(chars, {\n' +
        '    scale: 0.9, opacity: 0.7,\n' +
        '    duration: 1, ease: "sine.in",\n' +
        '    stagger: { each: 0.08, from: "center" }\n' +
        '  })\n' +
        '  // Release: expand and brighten\n' +
        '  .to(chars, {\n' +
        '    scale: 1.2, opacity: 1,\n' +
        '    duration: 0.3, ease: "power2.out",\n' +
        '    stagger: { each: 0.05, from: "center" }\n' +
        '  })\n' +
        '  // Elastic return to rest\n' +
        '  .to(chars, {\n' +
        '    scale: 1, opacity: 1,\n' +
        '    duration: 1, ease: "elastic.out(1, 0.3)",\n' +
        '    stagger: { each: 0.08, from: "center" }\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor proximity triggers color shift (energy transfer)\n' +
        '  document.addEventListener("mousemove", function() {\n' +
        '    if (cursorInfluence > 0.3) {\n' +
        '      gsap.to(chars, {\n' +
        '        color: "#B6FF67",\n' +
        '        duration: 0.3, ease: "power1.out"\n' +
        '      });\n' +
        '    } else {\n' +
        '      gsap.to(chars, {\n' +
        '        color: "#000000",\n' +
        '        duration: 0.5\n' +
        '      });\n' +
        '    }\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // K - Kinetic
    codes['K'] =
        'function initKineticAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Each character moves continuously in random directions\n' +
        '  chars.forEach((char, i) => {\n' +
        '    function randomMove() {\n' +
        '      const tx = (Math.random() - 0.5) * 80;\n' +
        '      const ty = (Math.random() - 0.5) * 40;\n' +
        '      const rot = (Math.random() - 0.5) * 20;\n' +
        '      gsap.to(char, {\n' +
        '        x: tx, y: ty, rotation: rot,\n' +
        '        duration: 0.5 + Math.random() * 0.5,\n' +
        '        ease: "power1.inOut",\n' +
        '        onComplete: randomMove\n' +
        '      });\n' +
        '    }\n' +
        '    // Staggered start\n' +
        '    gsap.delayedCall(i * 0.05, randomMove);\n' +
        '  });\n' +
        '  \n' +
        '  // Click: explosion burst\n' +
        '  mainLetter.addEventListener("click", function() {\n' +
        '    chars.forEach((char, i) => {\n' +
        '      gsap.to(char, {\n' +
        '        x: (Math.random() - 0.5) * 200,\n' +
        '        y: (Math.random() - 0.5) * 200,\n' +
        '        rotation: Math.random() * 360,\n' +
        '        duration: 0.6, ease: "power3.out"\n' +
        '      });\n' +
        '      gsap.to(char, {\n' +
        '        x: 0, y: 0, rotation: 0,\n' +
        '        delay: 0.8, duration: 1,\n' +
        '        ease: "elastic.out(1, 0.3)"\n' +
        '      });\n' +
        '    });\n' +
        '  });\n' +
        '}';

    // L - Luminosity
    codes['L'] =
        'function initLuminosityAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Glow pulse: shadow grows and shrinks\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  tl.to(chars, {\n' +
        '    textShadow: "0 0 5px #fff, 0 0 10px #fff",\n' +
        '    duration: 0.7, ease: "power1.inOut", stagger: 0.08\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    textShadow: "0 0 15px #fff, 0 0 30px #fff, 0 0 60px #fff",\n' +
        '    duration: 0.7, ease: "power1.inOut", stagger: 0.08\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    textShadow: "none",\n' +
        '    duration: 0.7, ease: "power1.inOut", stagger: 0.08\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor proximity brightens with yellow glow\n' +
        '  document.addEventListener("mousemove", function() {\n' +
        '    if (cursorInfluence > 0.2) {\n' +
        '      gsap.to(chars, {\n' +
        '        textShadow: `0 0 ${20 * cursorInfluence}px #ffe066`,\n' +
        '        duration: 0.2\n' +
        '      });\n' +
        '    }\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // M - Momentum
    codes['M'] =
        'function initMomentumAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Heavier chars (further from center) respond slower\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  const maxX = 120;\n' +
        '  \n' +
        '  // Slow acceleration build-up\n' +
        '  tl.to(chars, {\n' +
        '    x: maxX,\n' +
        '    duration: 2, ease: "power1.in",\n' +
        '    stagger: 0.05\n' +
        '  })\n' +
        '  // Constant velocity phase\n' +
        '  .to(chars, {\n' +
        '    x: maxX * 1.1,\n' +
        '    duration: 1, ease: "linear"\n' +
        '  })\n' +
        '  // Direction switch (heavier chars turn last)\n' +
        '  .to(chars, {\n' +
        '    x: -maxX,\n' +
        '    duration: 3, ease: "power1.inOut",\n' +
        '    stagger: 0.1\n' +
        '  })\n' +
        '  // Decelerate and return\n' +
        '  .to(chars, {\n' +
        '    x: 0,\n' +
        '    duration: 2, ease: "power1.out",\n' +
        '    stagger: 0.05\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // N - Neutron
    codes['N'] =
        'function initNeutronAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Each char orbits with randomized radius, speed, and phase\n' +
        '  chars.forEach((char, i) => {\n' +
        '    const radius = 15 + Math.random() * 25;\n' +
        '    const speed = 2 + Math.random() * 3;\n' +
        '    const offset = Math.random() * Math.PI * 2;\n' +
        '    \n' +
        '    gsap.to(char, {\n' +
        '      motionPath: {\n' +
        '        path: "M0,0",  // Computed as sin/cos orbit\n' +
        '        autoRotate: false\n' +
        '      },\n' +
        '      duration: speed,\n' +
        '      ease: "none",\n' +
        '      repeat: -1,\n' +
        '      onUpdate: function() {\n' +
        '        const t = this.time() / speed * Math.PI * 2 + offset;\n' +
        '        gsap.set(char, {\n' +
        '          x: Math.cos(t) * radius,\n' +
        '          y: Math.sin(t) * radius\n' +
        '        });\n' +
        '      }\n' +
        '    });\n' +
        '    \n' +
        '    // Pulsing scale per char\n' +
        '    gsap.to(char, {\n' +
        '      scale: 0.8 + Math.random() * 0.4,\n' +
        '      duration: 1 + Math.random(),\n' +
        '      repeat: -1, yoyo: true,\n' +
        '      ease: "sine.inOut"\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor repels chars\n' +
        '  mainLetter.addEventListener("mousemove", function() {\n' +
        '    chars.forEach(char => {\n' +
        '      gsap.to(char, {\n' +
        '        x: `-=${dirX * 20 * cursorInfluence}`,\n' +
        '        y: `-=${dirY * 20 * cursorInfluence}`,\n' +
        '        duration: 0.3, ease: "power2.out"\n' +
        '      });\n' +
        '    });\n' +
        '  });\n' +
        '}';

    // O - Oscillation
    codes['O'] =
        'function initOscillationAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Each char oscillates at a slightly different frequency\n' +
        '  const baseFreq = 0.5; // Hz\n' +
        '  let startTime = Date.now();\n' +
        '  let running = true;\n' +
        '  \n' +
        '  function animate() {\n' +
        '    if (!running) return;\n' +
        '    const t = (Date.now() - startTime) / 1000;\n' +
        '    \n' +
        '    chars.forEach((char, i) => {\n' +
        '      // Slightly different frequency per character\n' +
        '      const freq = baseFreq + i * 0.03;\n' +
        '      const amplitude = 20 + i * 2;\n' +
        '      const y = amplitude * Math.sin(2 * Math.PI * freq * t);\n' +
        '      gsap.set(char, { y });\n' +
        '    });\n' +
        '    requestAnimationFrame(animate);\n' +
        '  }\n' +
        '  animate();\n' +
        '  \n' +
        '  // Click amplifies current oscillation\n' +
        '  mainLetter.addEventListener("click", function() {\n' +
        '    chars.forEach((char, i) => {\n' +
        '      gsap.to(char, {\n' +
        '        y: `*=2.5`,\n' +
        '        duration: 0.3,\n' +
        '        ease: "power2.out",\n' +
        '        yoyo: true,\n' +
        '        repeat: 3\n' +
        '      });\n' +
        '    });\n' +
        '  });\n' +
        '}';

    // P - Potential
    codes['P'] =
        'function initPotentialAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Rise slowly: storing potential energy\n' +
        '  tl.to(chars, {\n' +
        '    y: -80, scale: 1.05,\n' +
        '    duration: 2, ease: "power1.inOut", stagger: 0.05\n' +
        '  })\n' +
        '  // Hold at top (maximum potential)\n' +
        '  .to(chars, {\n' +
        '    duration: 0.5\n' +
        '  })\n' +
        '  // Fall: potential converts to kinetic (accelerating)\n' +
        '  .to(chars, {\n' +
        '    y: 40, scale: 0.95,\n' +
        '    duration: 0.5, ease: "power2.in", stagger: 0.03\n' +
        '  })\n' +
        '  // Bounce and settle\n' +
        '  .to(chars, {\n' +
        '    y: 0, scale: 1,\n' +
        '    duration: 1, ease: "elastic.out(1, 0.3)", stagger: 0.05\n' +
        '  });\n' +
        '  \n' +
        '  // Drag upward stores potential; release triggers fall\n' +
        '  mainLetter.addEventListener("mousedown", function() {\n' +
        '    tl.pause();\n' +
        '  });\n' +
        '  document.addEventListener("mouseup", function() {\n' +
        '    tl.play();\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // Q - Quantum
    codes['Q'] =
        'function initQuantumAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Superposition: chars exist in uncertain states\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  function randomState() {\n' +
        '    return {\n' +
        '      x: (Math.random() - 0.5) * 20,\n' +
        '      y: (Math.random() - 0.5) * 20,\n' +
        '      scale: 0.7 + Math.random() * 0.6,\n' +
        '      opacity: 0.4 + Math.random() * 0.6,\n' +
        '      filter: `blur(${Math.random() * 3}px)`\n' +
        '    };\n' +
        '  }\n' +
        '  \n' +
        '  // Continuously fluctuate between quantum states\n' +
        '  chars.forEach(char => {\n' +
        '    function fluctuate() {\n' +
        '      gsap.to(char, {\n' +
        '        ...randomState(),\n' +
        '        duration: 0.5 + Math.random() * 0.5,\n' +
        '        ease: "power1.inOut",\n' +
        '        onComplete: fluctuate\n' +
        '      });\n' +
        '    }\n' +
        '    fluctuate();\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor "observation" collapses the quantum state\n' +
        '  mainLetter.addEventListener("click", function() {\n' +
        '    gsap.killTweensOf(chars);\n' +
        '    gsap.to(chars, {\n' +
        '      x: 0, y: 0, scale: 1, opacity: 1,\n' +
        '      filter: "blur(0px)",\n' +
        '      duration: 0.3, ease: "power2.out"\n' +
        '    });\n' +
        '  });\n' +
        '}';

    // R - Resonance
    codes['R'] =
        'function initResonanceAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  let isResonating = false;\n' +
        '  let startTime = Date.now();\n' +
        '  let running = true;\n' +
        '  \n' +
        '  // Base oscillation (small amplitude)\n' +
        '  function animate() {\n' +
        '    if (!running) return;\n' +
        '    const t = (Date.now() - startTime) / 1000;\n' +
        '    const amp = isResonating ? 30 : 10;\n' +
        '    const scl = isResonating ? 1.2 : 1;\n' +
        '    \n' +
        '    chars.forEach((char, i) => {\n' +
        '      const phase = i * 0.3;\n' +
        '      gsap.set(char, {\n' +
        '        y: amp * Math.sin(2 * Math.PI * 0.5 * t + phase),\n' +
        '        scale: scl\n' +
        '      });\n' +
        '    });\n' +
        '    requestAnimationFrame(animate);\n' +
        '  }\n' +
        '  animate();\n' +
        '  \n' +
        '  // Toggle resonance every 3-5 seconds\n' +
        '  function toggleResonance() {\n' +
        '    isResonating = !isResonating;\n' +
        '    const next = 3000 + Math.random() * 2000;\n' +
        '    setTimeout(toggleResonance, next);\n' +
        '  }\n' +
        '  setTimeout(toggleResonance, 3000);\n' +
        '  \n' +
        '  // Cursor X position drives oscillation frequency\n' +
        '  document.addEventListener("mousemove", function(e) {\n' +
        '    const freq = 0.3 + (e.clientX / window.innerWidth) * 1.2;\n' +
        '    // freq near 0.5 triggers resonance\n' +
        '    isResonating = Math.abs(freq - 0.5) < 0.1;\n' +
        '  });\n' +
        '}';

    // S - Symmetry
    codes['S'] =
        'function initSymmetryAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Find center, move chars symmetrically about axis\n' +
        '  const center = Math.floor(chars.length / 2);\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Rotate the axis of symmetry\n' +
        '  tl.to(chars, {\n' +
        '    x: function(i) {\n' +
        '      const dist = i - center;\n' +
        '      return dist * 15;\n' +
        '    },\n' +
        '    rotation: function(i) {\n' +
        '      const dist = i - center;\n' +
        '      return dist * 10; // Mirror angle\n' +
        '    },\n' +
        '    duration: 1.5, ease: "sine.inOut"\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    x: function(i) {\n' +
        '      const dist = i - center;\n' +
        '      return -dist * 15; // Flip axis\n' +
        '    },\n' +
        '    rotation: function(i) {\n' +
        '      const dist = i - center;\n' +
        '      return -dist * 10;\n' +
        '    },\n' +
        '    duration: 1.5, ease: "sine.inOut"\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    x: 0, rotation: 0,\n' +
        '    duration: 1, ease: "elastic.out(1, 0.3)"\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // T - Thermal
    codes['T'] =
        'function initThermalAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Cold state: blue, compressed\n' +
        '  tl.to(chars, {\n' +
        '    scale: 0.9, color: "#46EAFF",\n' +
        '    duration: 2, ease: "sine.inOut", stagger: 0.05\n' +
        '  })\n' +
        '  // Normal state\n' +
        '  .to(chars, {\n' +
        '    scale: 1, color: "#000000",\n' +
        '    duration: 1, ease: "sine.inOut"\n' +
        '  })\n' +
        '  // Hot state: red, expanded + thermal jitter\n' +
        '  .to(chars, {\n' +
        '    scale: 1.1, color: "#FF565B",\n' +
        '    duration: 2, ease: "sine.inOut", stagger: 0.05\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    scale: 1, color: "#000000",\n' +
        '    duration: 1, ease: "sine.inOut"\n' +
        '  });\n' +
        '  \n' +
        '  // High-temp: random rapid jitter\n' +
        '  chars.forEach(char => {\n' +
        '    gsap.to(char, {\n' +
        '      x: () => (Math.random() - 0.5) * 4,\n' +
        '      y: () => (Math.random() - 0.5) * 4,\n' +
        '      duration: 0.1, ease: "none",\n' +
        '      repeat: -1, repeatRefresh: true\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor: left = cool, right = heat\n' +
        '  document.addEventListener("mousemove", function(e) {\n' +
        '    const heat = e.clientX / window.innerWidth;\n' +
        '    const color = heat > 0.6 ? "#FF565B" : heat < 0.4 ? "#46EAFF" : "#000000";\n' +
        '    gsap.to(chars, { color, duration: 0.5 });\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // U - Uncertainty
    codes['U'] =
        'function initUncertaintyAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Heisenberg: know position OR momentum, not both\n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Position-certain phase: fixed x, blurred (velocity uncertain)\n' +
        '  tl.to(chars, {\n' +
        '    x: 0,\n' +
        '    filter: "blur(5px)", // Velocity uncertainty\n' +
        '    duration: 1.5, ease: "sine.inOut", stagger: 0.05\n' +
        '  })\n' +
        '  // Velocity-certain phase: sharp, but position smeared\n' +
        '  .to(chars, {\n' +
        '    x: function(i) { return (Math.random() - 0.5) * 40; },\n' +
        '    filter: "blur(0px)",\n' +
        '    duration: 0.1, ease: "none"\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    x: 0, filter: "blur(0px)",\n' +
        '    duration: 1, ease: "sine.inOut", stagger: 0.05\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor observation blurs velocity dimension\n' +
        '  mainLetter.addEventListener("mousemove", function() {\n' +
        '    gsap.to(chars, {\n' +
        '      filter: `blur(${cursorInfluence * 8}px)`,\n' +
        '      duration: 0.2\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // V - Voltage
    codes['V'] =
        'function initVoltageAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Low voltage: no glow\n' +
        '  tl.to(chars, {\n' +
        '    color: "#000000", scale: 1,\n' +
        '    textShadow: "none",\n' +
        '    duration: 1, ease: "sine.inOut", stagger: 0.1\n' +
        '  })\n' +
        '  // Build up: rising voltage\n' +
        '  .to(chars, {\n' +
        '    color: "#46EAFF", scale: 1.05,\n' +
        '    textShadow: "0 0 10px #46EAFF",\n' +
        '    duration: 1.5, ease: "sine.inOut", stagger: 0.1\n' +
        '  })\n' +
        '  // Peak voltage: bright cyan glow\n' +
        '  .to(chars, {\n' +
        '    color: "#fff", scale: 1.15,\n' +
        '    textShadow: "0 0 30px #46EAFF, 0 0 60px #46EAFF",\n' +
        '    duration: 0.3, ease: "power1.out", stagger: 0.05\n' +
        '  })\n' +
        '  // Discharge\n' +
        '  .to(chars, {\n' +
        '    color: "#000000", scale: 1,\n' +
        '    textShadow: "none",\n' +
        '    duration: 1.5, ease: "power1.in", stagger: 0.1\n' +
        '  });\n' +
        '  \n' +
        '  // Mouse X maps to voltage level (left=low, right=high)\n' +
        '  document.addEventListener("mousemove", function(e) {\n' +
        '    const v = e.clientX / window.innerWidth;\n' +
        '    gsap.to(chars, {\n' +
        '      textShadow: `0 0 ${v * 30}px #46EAFF`,\n' +
        '      duration: 0.3\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // W - Wave
    codes['W'] =
        'function initWaveAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Traveling sine wave across characters\n' +
        '  let startTime = Date.now();\n' +
        '  let running = true;\n' +
        '  \n' +
        '  function animate() {\n' +
        '    if (!running) return;\n' +
        '    const t = (Date.now() - startTime) / 1000;\n' +
        '    const wavelength = chars.length;\n' +
        '    const amplitude = 25;\n' +
        '    const speed = 1.5; // waves per second\n' +
        '    \n' +
        '    chars.forEach((char, i) => {\n' +
        '      const phase = (i / wavelength) * Math.PI * 2;\n' +
        '      const y = amplitude * Math.sin(speed * t * Math.PI * 2 - phase);\n' +
        '      gsap.set(char, { y });\n' +
        '    });\n' +
        '    requestAnimationFrame(animate);\n' +
        '  }\n' +
        '  animate();\n' +
        '  \n' +
        '  // Click: tsunami — sequential rise then crash\n' +
        '  mainLetter.addEventListener("click", function() {\n' +
        '    gsap.timeline()\n' +
        '      .to(chars, {\n' +
        '        y: -60, duration: 0.4,\n' +
        '        stagger: 0.05, ease: "power2.out"\n' +
        '      })\n' +
        '      .to(chars, {\n' +
        '        y: 30, duration: 0.3,\n' +
        '        stagger: 0.05, ease: "power3.in"\n' +
        '      })\n' +
        '      .to(chars, {\n' +
        '        y: 0, duration: 0.6,\n' +
        '        stagger: 0.05, ease: "elastic.out(1, 0.3)"\n' +
        '      });\n' +
        '  });\n' +
        '}';

    // X - X-ray
    codes['X'] =
        'function initXrayAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Normal state\n' +
        '  tl.to(chars, {\n' +
        '    color: "#000000", scale: 1,\n' +
        '    filter: "brightness(1) contrast(1)",\n' +
        '    textShadow: "none",\n' +
        '    duration: 1.5, ease: "sine.inOut", stagger: 0.05\n' +
        '  })\n' +
        '  // X-ray pulse: high energy penetrating radiation\n' +
        '  .to(chars, {\n' +
        '    color: "#46EAFF", scale: 1.05,\n' +
        '    filter: "brightness(2) contrast(1.5)",\n' +
        '    textShadow: "0 0 15px #46EAFF, 0 0 30px #46EAFF",\n' +
        '    duration: 0.3, ease: "power2.in", stagger: 0.05\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    duration: 0.5 // Hold X-ray state\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    color: "#000000", scale: 1,\n' +
        '    filter: "brightness(1) contrast(1)",\n' +
        '    textShadow: "none",\n' +
        '    duration: 1.5, ease: "power2.out", stagger: 0.05\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor creates scanning effect\n' +
        '  document.addEventListener("mousemove", function(e) {\n' +
        '    chars.forEach((char, i) => {\n' +
        '      const rect = char.getBoundingClientRect();\n' +
        '      const dx = e.clientX - (rect.left + rect.width / 2);\n' +
        '      const reveal = Math.max(0, 1 - Math.abs(dx) / 60);\n' +
        '      gsap.to(char, {\n' +
        '        filter: `brightness(${1 + reveal * 1.5})`,\n' +
        '        duration: 0.3\n' +
        '      });\n' +
        '    });\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // Y - Yield
    codes['Y'] =
        'function initYieldAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  const tl = gsap.timeline({ repeat: -1 });\n' +
        '  \n' +
        '  // Compression phase: building stress/tension\n' +
        '  tl.to(chars, {\n' +
        '    scaleY: 0.7, scaleX: 1.2,\n' +
        '    color: "#FF565B",\n' +
        '    duration: 2, ease: "power2.inOut", stagger: 0.03\n' +
        '  })\n' +
        '  // Yield point: rapid energy release\n' +
        '  .to(chars, {\n' +
        '    scaleY: 1.5, scaleX: 0.8,\n' +
        '    color: "#FFE566",\n' +
        '    duration: 0.2, ease: "power3.out", stagger: 0.03\n' +
        '  })\n' +
        '  // Dissipation: energy disperses\n' +
        '  .to(chars, {\n' +
        '    scaleY: 1, scaleX: 1,\n' +
        '    color: "#000000",\n' +
        '    duration: 1.5, ease: "elastic.out(1, 0.3)", stagger: 0.05\n' +
        '  });\n' +
        '  \n' +
        '  // Cursor triggers localized energy release (yellow glow)\n' +
        '  mainLetter.addEventListener("mousemove", function() {\n' +
        '    if (cursorInfluence > 0.3) {\n' +
        '      gsap.to(chars, {\n' +
        '        textShadow: `0 0 ${cursorInfluence * 20}px #FFE566`,\n' +
        '        duration: 0.2\n' +
        '      });\n' +
        '    }\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';

    // Z - Zero Point
    codes['Z'] =
        'function initZeroPointAnimation() {\n' +
        '  const { splitText, chars } = createSplitTextAnimation();\n' +
        '  \n' +
        '  // Lowest possible energy state: continuous subtle fluctuations\n' +
        '  // Even at absolute zero, quantum fluctuations persist\n' +
        '  chars.forEach(char => {\n' +
        '    function fluctuate() {\n' +
        '      const energy = 1 + cursorInfluence * 3; // Cursor adds energy\n' +
        '      gsap.to(char, {\n' +
        '        x: (Math.random() - 0.5) * 5 * energy,\n' +
        '        y: (Math.random() - 0.5) * 5 * energy,\n' +
        '        scale: 1 + (Math.random() - 0.5) * 0.05 * energy,\n' +
        '        opacity: 0.85 + Math.random() * 0.15,\n' +
        '        duration: 0.5 + Math.random() * 0.5,\n' +
        '        ease: "sine.inOut",\n' +
        '        onComplete: fluctuate\n' +
        '      });\n' +
        '    }\n' +
        '    fluctuate();\n' +
        '  });\n' +
        '  \n' +
        '  // Zero-point energy dip: momentary collapse to minimum\n' +
        '  const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });\n' +
        '  tl.to(chars, {\n' +
        '    scale: 0.95, opacity: 0.7,\n' +
        '    duration: 0.5, ease: "sine.inOut"\n' +
        '  })\n' +
        '  .to(chars, {\n' +
        '    scale: 1, opacity: 1,\n' +
        '    duration: 1, ease: "elastic.out(1, 0.5)"\n' +
        '  });\n' +
        '  \n' +
        '  currentAnimation = tl;\n' +
        '  return tl;\n' +
        '}';
    
    return codes[letter] || '// No animation code available for letter ' + letter;
}