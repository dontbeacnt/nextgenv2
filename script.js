document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. iOS SPRING PHYSICS ENGINE
    // ==========================================================================
    class IOSSpring {
        constructor({ response = 0.36, dampingFraction = 0.74 }) {
            this.response = response;
            this.dampingFraction = dampingFraction;
            this.stiffness = Math.pow((2 * Math.PI) / this.response, 2);
            this.damping = (4 * Math.PI * this.dampingFraction) / this.response;
            this.current = 0;
            this.target = 0;
            this.velocity = 0;
        }
        setTarget(t) { this.target = t; }
        setImmediate(v) { this.current = v; this.target = v; this.velocity = 0; }
        update(dt) {
            const force = -this.stiffness * (this.current - this.target) - this.damping * this.velocity;
            this.velocity += force * dt;
            this.current += this.velocity * dt;
            if (Math.abs(this.current - this.target) < 0.05 && Math.abs(this.velocity) < 0.05) {
                this.current = this.target;
                this.velocity = 0;
                return true;
            }
            return false;
        }
    }

    // ==========================================================================
    // 2. NAV INDICATOR — iOS SPRING FLUID SLIDE
    // ==========================================================================
    const navTabs = document.querySelectorAll('.nav-tab');
    const navIndicator = document.getElementById('navIndicator');

    const springX = new IOSSpring({ response: 0.36, dampingFraction: 0.74 });
    const springY = new IOSSpring({ response: 0.36, dampingFraction: 0.74 });
    const springW = new IOSSpring({ response: 0.36, dampingFraction: 0.74 });
    const springH = new IOSSpring({ response: 0.36, dampingFraction: 0.74 });

    let navAnimId = null;
    let navLastTime = performance.now();

    function renderNavSpring(now) {
        const dt = Math.min((now - navLastTime) / 1000, 0.033) || 0.016;
        navLastTime = now;

        const rx = springX.update(dt);
        const ry = springY.update(dt);
        const rw = springW.update(dt);
        const rh = springH.update(dt);

        const vRatio = Math.min(Math.abs(springX.velocity) / 1300, 0.22);
        const sx = 1 + vRatio;
        const sy = 1 - vRatio * 0.45;

        navIndicator.style.transform = `translate3d(${springX.current.toFixed(2)}px, ${springY.current.toFixed(2)}px, 0) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
        navIndicator.style.width = `${springW.current.toFixed(2)}px`;
        navIndicator.style.height = `${springH.current.toFixed(2)}px`;

        if (rx && ry && rw && rh) {
            navIndicator.style.transform = `translate3d(${springX.target.toFixed(2)}px, ${springY.target.toFixed(2)}px, 0) scale(1, 1)`;
            navAnimId = null;
            return;
        }
        navAnimId = requestAnimationFrame(renderNavSpring);
    }

    function startNavAnim() {
        navLastTime = performance.now();
        if (!navAnimId) navAnimId = requestAnimationFrame(renderNavSpring);
    }

    function initIndicator() {
        const active = document.querySelector('.nav-tab.active') || navTabs[0];
        if (!active || !navIndicator) return;
        springX.setImmediate(active.offsetLeft);
        springY.setImmediate(active.offsetTop);
        springW.setImmediate(active.offsetWidth);
        springH.setImmediate(active.offsetHeight);
        navIndicator.style.transform = `translate3d(${active.offsetLeft}px, ${active.offsetTop}px, 0) scale(1, 1)`;
        navIndicator.style.width = `${active.offsetWidth}px`;
        navIndicator.style.height = `${active.offsetHeight}px`;
        navIndicator.style.opacity = '1';
    }

    // Schedule Viewer Modal Controls
    const scheduleModalBackdrop = document.getElementById('scheduleModalBackdrop');
    const scheduleModalCloseBtn = document.getElementById('scheduleModalCloseBtn');
    const segBtnBells = document.getElementById('segBtnBells');
    const segBtnLessons = document.getElementById('segBtnLessons');
    const wrapBells = document.getElementById('wrapBells');
    const wrapLessons = document.getElementById('wrapLessons');

    function openScheduleModal() {
        if (!scheduleModalBackdrop) return;
        scheduleModalBackdrop.classList.add('is-open');
        scheduleModalBackdrop.setAttribute('aria-hidden', 'false');
    }

    function closeScheduleModal() {
        if (!scheduleModalBackdrop) return;
        scheduleModalBackdrop.classList.remove('is-open');
        scheduleModalBackdrop.setAttribute('aria-hidden', 'true');
        const gdzTab = document.querySelector('.nav-tab[data-tab="gdz"]');
        if (gdzTab) selectTab(gdzTab, false);
    }

    function switchScheduleView(view) {
        if (view === 'bells') {
            if (segBtnBells) { segBtnBells.classList.add('active'); segBtnBells.setAttribute('aria-selected', 'true'); }
            if (segBtnLessons) { segBtnLessons.classList.remove('active'); segBtnLessons.setAttribute('aria-selected', 'false'); }
            if (wrapBells) wrapBells.classList.add('active');
            if (wrapLessons) wrapLessons.classList.remove('active');
        } else {
            if (segBtnLessons) { segBtnLessons.classList.add('active'); segBtnLessons.setAttribute('aria-selected', 'true'); }
            if (segBtnBells) { segBtnBells.classList.remove('active'); segBtnBells.setAttribute('aria-selected', 'false'); }
            if (wrapLessons) wrapLessons.classList.add('active');
            if (wrapBells) wrapBells.classList.remove('active');
        }
    }

    if (segBtnBells && segBtnLessons) {
        segBtnBells.addEventListener('click', () => switchScheduleView('bells'));
        segBtnLessons.addEventListener('click', () => switchScheduleView('lessons'));
    }

    if (scheduleModalCloseBtn) {
        scheduleModalCloseBtn.addEventListener('click', closeScheduleModal);
    }

    if (scheduleModalBackdrop) {
        scheduleModalBackdrop.addEventListener('click', (e) => {
            if (e.target === scheduleModalBackdrop) {
                closeScheduleModal();
            }
        });
    }

    // ==========================================================================
    // COLUMN CALCULATOR MODAL
    // ==========================================================================
    const calcModalBackdrop = document.getElementById('calcModalBackdrop');
    const calcModalCloseBtn = document.getElementById('calcModalCloseBtn');
    const calcSolveBtn = document.getElementById('calcSolveBtn');
    const calcNum1 = document.getElementById('calcNum1');
    const calcNum2 = document.getElementById('calcNum2');
    const calcResultArea = document.getElementById('calcResultArea');
    const calcOpBtns = document.querySelectorAll('.calc-op-btn');
    let calcOp = '+';

    function openCalcModal() {
        if (!calcModalBackdrop) return;
        calcModalBackdrop.classList.add('is-open');
        calcModalBackdrop.setAttribute('aria-hidden', 'false');
        if (calcNum1) calcNum1.focus();
    }

    function closeCalcModal() {
        if (!calcModalBackdrop) return;
        calcModalBackdrop.classList.remove('is-open');
        calcModalBackdrop.setAttribute('aria-hidden', 'true');
        const gdzTab = document.querySelector('.nav-tab[data-tab="gdz"]');
        if (gdzTab) selectTab(gdzTab, false);
    }

    calcOpBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            calcOpBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            calcOp = btn.getAttribute('data-op');
        });
    });

    if (calcModalCloseBtn) {
        calcModalCloseBtn.addEventListener('click', closeCalcModal);
    }

    if (calcModalBackdrop) {
        calcModalBackdrop.addEventListener('click', (e) => {
            if (e.target === calcModalBackdrop) closeCalcModal();
        });
    }

    // Allow only numbers, minus, dot, comma in inputs
    [calcNum1, calcNum2].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', () => {
            inp.value = inp.value.replace(/[^0-9.,-]/g, '').replace(',', '.');
        });
    });

    function parseCalcNum(str) {
        if (!str) return NaN;
        return parseFloat(str.replace(',', '.'));
    }

    // ---- Column arithmetic renderers ----

    function padLeft(str, len) {
        while (str.length < len) str = ' ' + str;
        return str;
    }

    function renderAddSub(a, b, op) {
        const isAdd = op === '+';
        const sign = isAdd ? '+' : '−';
        const result = isAdd ? a + b : a - b;

        const aStr = String(a);
        const bStr = String(b);
        const rStr = String(result);
        const maxLen = Math.max(aStr.length, bStr.length, rStr.length);

        let html = '<div class="calc-column-work">';
        html += `<div class="calc-row">${padLeft(aStr, maxLen + 2)}</div>`;
        html += `<div class="calc-row"><span class="calc-op-sign">${sign}</span>${padLeft(bStr, maxLen)}</div>`;
        html += '<div class="calc-line"></div>';
        html += `<div class="calc-row calc-result-row">${padLeft(rStr, maxLen + 2)}</div>`;
        html += '</div>';

        html += `<div class="calc-final-answer">Відповідь: <strong>${result}</strong></div>`;
        return html;
    }

    function renderMultiplication(a, b) {
        const result = a * b;
        const aStr = String(Math.abs(a));
        const bStr = String(Math.abs(b));
        const rStr = String(Math.abs(result));
        const isNeg = (a < 0) !== (b < 0);

        const partials = [];
        for (let i = bStr.length - 1; i >= 0; i--) {
            const digit = parseInt(bStr[i]);
            const partial = Math.abs(a) * digit;
            const shift = bStr.length - 1 - i;
            partials.push({ value: partial, shift });
        }

        const maxLen = Math.max(aStr.length, bStr.length, rStr.length, ...partials.map(p => String(p.value).length + p.shift)) + 2;

        let html = '<div class="calc-column-work">';
        html += `<div class="calc-row">${padLeft(aStr, maxLen)}</div>`;
        html += `<div class="calc-row"><span class="calc-op-sign">×</span>${padLeft(bStr, maxLen - 2)}</div>`;
        html += '<div class="calc-line"></div>';

        if (bStr.length === 1) {
            // Single digit — just show result
            html += `<div class="calc-row calc-result-row">${padLeft((isNeg ? '-' : '') + rStr, maxLen)}</div>`;
        } else {
            // Show partial products
            partials.forEach((p, idx) => {
                const pStr = String(p.value) + '0'.repeat(p.shift);
                const cls = idx === partials.length - 1 ? '' : '';
                html += `<div class="calc-row ${cls}">${padLeft(pStr, maxLen)}</div>`;
            });

            if (partials.length > 1) {
                html += '<div class="calc-line"></div>';
                html += `<div class="calc-row calc-result-row">${padLeft((isNeg ? '-' : '') + rStr, maxLen)}</div>`;
            }
        }

        html += '</div>';
        html += `<div class="calc-final-answer">Відповідь: <strong>${result}</strong></div>`;
        return html;
    }

    function renderDivision(a, b) {
        if (b === 0) {
            return '<div class="calc-final-answer">На нуль ділити не можна!</div>';
        }

        const result = a / b;
        const isInteger = Number.isInteger(result);
        const absA = Math.abs(a);
        const absB = Math.abs(b);
        const isNeg = (a < 0) !== (b < 0);

        // Long division step by step
        const aStr = String(absA);
        const steps = [];
        let remainder = 0;
        let quotient = '';
        let started = false;

        for (let i = 0; i < aStr.length; i++) {
            remainder = remainder * 10 + parseInt(aStr[i]);
            const q = Math.floor(remainder / absB);
            if (q > 0 || started) {
                started = true;
                quotient += q;
            } else {
                quotient += '0';
            }
            steps.push({ dividend: remainder, quotientDigit: q, remainder: remainder - q * absB });
            remainder = remainder - q * absB;
        }

        // Clean leading zeros
        quotient = quotient.replace(/^0+/, '') || '0';

        let html = '<div class="calc-column-work">';
        html += `<div class="calc-row" style="justify-content:flex-start"><span style="margin-right:12px">${aStr}</span>│<span style="margin-left:6px; border-bottom:2px solid rgba(255,255,255,0.5); padding-bottom:2px">${absB}</span></div>`;
        
        // Show steps
        let indent = 0;
        steps.forEach((step, idx) => {
            if (step.quotientDigit > 0 || idx > 0) {
                const sub = step.quotientDigit * absB;
                if (sub > 0) {
                    const spaces = ' '.repeat(indent);
                    html += `<div class="calc-row" style="justify-content:flex-start">${spaces}<span style="color:rgba(255,255,255,0.5)">-${sub}</span></div>`;
                    html += `<div class="calc-row" style="justify-content:flex-start">${spaces}<span style="border-bottom:1px solid rgba(255,255,255,0.3); display:inline-block; min-width:${Math.max(String(sub).length + 1, String(step.remainder).length) + 1}ch"></span></div>`;
                    html += `<div class="calc-row" style="justify-content:flex-start">${spaces} ${step.remainder}</div>`;
                }
            }
            if (step.remainder > 0 || idx < steps.length - 1) {
                indent++;
            }
        });

        html += '</div>';

        if (isInteger) {
            html += `<div class="calc-final-answer">Відповідь: <strong>${isNeg ? '-' : ''}${quotient}</strong></div>`;
        } else {
            html += `<div class="calc-final-answer">Відповідь: <strong>${(Math.round(result * 10000) / 10000)}</strong> (остача: <strong>${remainder}</strong>)</div>`;
        }
        return html;
    }

    if (calcSolveBtn) {
        calcSolveBtn.addEventListener('click', () => {
            const a = parseCalcNum(calcNum1?.value);
            const b = parseCalcNum(calcNum2?.value);
            if (isNaN(a) || isNaN(b)) {
                calcResultArea.innerHTML = '<div class="calc-final-answer">Введіть обидва числа!</div>';
                return;
            }

            let html = '';
            if (calcOp === '+') html = renderAddSub(a, b, '+');
            else if (calcOp === '-') html = renderAddSub(a, b, '-');
            else if (calcOp === '*') html = renderMultiplication(a, b);
            else if (calcOp === '/') html = renderDivision(a, b);

            calcResultArea.innerHTML = html;
        });
    }

    // Escape key closes calc modal too
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && calcModalBackdrop?.classList.contains('is-open')) {
            closeCalcModal();
        }
    });

    // ==========================================================================
    // PRESS-AND-HOLD ZOOM FOR SCHEDULE IMAGES (1-2 SEC DELAY ON MOBILE)
    // ==========================================================================
    const scheduleImages = document.querySelectorAll('.schedule-view-img');
    const scheduleZoomHint = document.getElementById('scheduleZoomHint');

    scheduleImages.forEach(img => {
        let isHolding = false;
        let baseRect = null;
        let activePointerId = null;
        let holdTimer = null;
        let startX = 0, startY = 0;
        let lastMoveEvent = null;

        // Prevent native HTML5 image dragging and context menu completely
        img.addEventListener('dragstart', (e) => e.preventDefault());
        img.addEventListener('contextmenu', (e) => e.preventDefault());

        function updateZoom(clientX, clientY) {
            if (!baseRect) return;
            const percentX = Math.max(0, Math.min(100, ((clientX - baseRect.left) / baseRect.width) * 100));
            const percentY = Math.max(0, Math.min(100, ((clientY - baseRect.top) / baseRect.height) * 100));
            img.style.transformOrigin = `${percentX.toFixed(1)}% ${percentY.toFixed(1)}%`;
        }

        function activateZoom(clientX, clientY, pointerId) {
            isHolding = true;
            activePointerId = pointerId;
            baseRect = img.getBoundingClientRect();

            try {
                img.setPointerCapture(pointerId);
            } catch (_) {}

            img.classList.add('is-zoomed');
            updateZoom(clientX, clientY);
            img.style.transform = 'scale(2.4)';

            if (scheduleZoomHint) scheduleZoomHint.classList.add('hidden');
            if ('vibrate' in navigator) {
                try { navigator.vibrate(25); } catch (_) {}
            }
        }

        function endZoom() {
            clearTimeout(holdTimer);
            holdTimer = null;

            if (!isHolding) return;
            isHolding = false;

            if (activePointerId !== null) {
                try {
                    img.releasePointerCapture(activePointerId);
                } catch (_) {}
                activePointerId = null;
            }

            img.classList.remove('is-zoomed');
            img.style.transform = 'scale(1)';
            setTimeout(() => {
                if (!isHolding) {
                    img.style.transformOrigin = 'center center';
                }
            }, 260);
        }

        img.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;

            startX = e.clientX;
            startY = e.clientY;
            lastMoveEvent = e;

            clearTimeout(holdTimer);

            // On mobile touch: wait 500ms (half a second) so normal scrolling works freely!
            // On desktop mouse: wait 200ms
            const isTouch = e.pointerType === 'touch';
            const delay = isTouch ? 500 : 200;

            holdTimer = setTimeout(() => {
                const cur = lastMoveEvent || e;
                activateZoom(cur.clientX, cur.clientY, e.pointerId);
            }, delay);
        });

        img.addEventListener('pointermove', (e) => {
            lastMoveEvent = e;

            if (isHolding) {
                e.preventDefault();
                updateZoom(e.clientX, e.clientY);
            } else if (holdTimer) {
                // If moved more than 8px while waiting, user is scrolling! Cancel zoom!
                const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
                if (dist > 8) {
                    clearTimeout(holdTimer);
                    holdTimer = null;
                }
            }
        });

        img.addEventListener('pointerup', endZoom);
        img.addEventListener('pointercancel', endZoom);
        img.addEventListener('lostpointercapture', endZoom);
    });

    function selectTab(tab, triggerAction = true) {
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        springX.setTarget(tab.offsetLeft);
        springY.setTarget(tab.offsetTop);
        springW.setTarget(tab.offsetWidth);
        springH.setTarget(tab.offsetHeight);
        startNavAnim();

        if (triggerAction) {
            const tabType = tab.getAttribute('data-tab');
            if (tabType === 'schedule') {
                openScheduleModal();
            } else if (tabType === 'calc') {
                openCalcModal();
            } else if (tabType === 'gdz') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    setTimeout(initIndicator, 50);
    window.addEventListener('load', initIndicator);
    window.addEventListener('resize', () => {
        const a = document.querySelector('.nav-tab.active');
        if (a) {
            springX.setImmediate(a.offsetLeft);
            springY.setImmediate(a.offsetTop);
            springW.setImmediate(a.offsetWidth);
            springH.setImmediate(a.offsetHeight);
            navIndicator.style.transform = `translate3d(${a.offsetLeft}px, ${a.offsetTop}px, 0) scale(1, 1)`;
            navIndicator.style.width = `${a.offsetWidth}px`;
            navIndicator.style.height = `${a.offsetHeight}px`;
        }
    });
    navTabs.forEach(tab => tab.addEventListener('click', () => selectTab(tab)));

    // ==========================================================================
    // 3. CARD 3D TILT & SPECULAR & TOUCH INTERACTION
    // ==========================================================================
    function initCard(card) {
        if (!card || card._initialized) return;
        card._initialized = true;

        let hovered = false, tgtRX = 0, tgtRY = 0, curRX = 0, curRY = 0, cAnim = null;

        function animCard() {
            if (!hovered && Math.abs(curRX) < 0.01 && Math.abs(curRY) < 0.01) {
                card.style.transform = '';
                cAnim = null;
                return;
            }
            curRX += (tgtRX - curRX) * 0.14;
            curRY += (tgtRY - curRY) * 0.14;
            card.style.transform = hovered
                ? `perspective(1000px) rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg) translateY(-6px) scale(1.02)`
                : `perspective(1000px) rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg)`;
            cAnim = requestAnimationFrame(animCard);
        }

        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
            tgtRX = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -7;
            tgtRY = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 7;
            hovered = true;
            if (!cAnim) cAnim = requestAnimationFrame(animCard);
        });

        card.addEventListener('mouseleave', () => {
            hovered = false;
            tgtRX = 0; tgtRY = 0;
            card.style.removeProperty('--mouse-x');
            card.style.removeProperty('--mouse-y');
        });

        // Tactile touch & scale-down with haptic impulse
        card.addEventListener('pointerdown', () => {
            card.classList.add('is-pressed');
            if ('vibrate' in navigator) {
                try { navigator.vibrate(8); } catch (_) {}
            }
        });
        const releaseCardPress = () => card.classList.remove('is-pressed');
        card.addEventListener('pointerup', releaseCardPress);
        card.addEventListener('pointercancel', releaseCardPress);
        card.addEventListener('pointerleave', releaseCardPress);

        card.addEventListener('click', (e) => {
            const r = card.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const sz = Math.max(r.width, r.height) * 1.3;
            ripple.style.width = ripple.style.height = `${sz}px`;
            ripple.style.left = `${e.clientX - r.left - sz / 2}px`;
            ripple.style.top = `${e.clientY - r.top - sz / 2}px`;
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 550);

            openModal(card);
        });
    }

    document.querySelectorAll('.liquid-card').forEach(initCard);

    // ========================================================================== 
    // 4. iOS-STYLE SHARED-ELEMENT OPENING
    //    The dialog starts exactly over the pressed card, then grows into place.
    // ========================================================================== 
    const appContainer = document.getElementById('appContainer');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalContainer = document.getElementById('modalContainer');
    const modalContent = document.querySelector('.modal-content-wrapper');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalSubjectName = document.getElementById('modalSubjectName');
    const modalLaunchView = document.getElementById('modalLaunchView');
    const modalLaunchTitle = document.getElementById('modalLaunchTitle');
    const modalLaunchCoverBox = document.getElementById('modalLaunchCoverBox');
    const modalLaunchCoverImg = document.getElementById('modalLaunchCoverImg');
    const modalHomeBarZone = document.getElementById('modalHomeBarZone');
    const modalGdzList = document.getElementById('modalGdzList');
    const modalBookLinkBtn = document.getElementById('modalBookLinkBtn');
    const modalBookPreviewLink = document.getElementById('modalBookPreviewLink');
    const modalBookCoverImg = document.getElementById('modalBookCoverImg');
    const modalBookPlaceholder = document.getElementById('modalBookPlaceholder');

    // 12 Subjects Database with exact textbook & GDZ links
    const SUBJECTS_DB = {
        "Алгебра": {
            title: "ГДЗ Алгебра",
            shortTitle: "АЛГЕБРА",
            book: "https://pidruchnyk.com.ua/2905-algebra-ister-8-klas-2025.html",
            image: "assets/books/algebra.jpg",
            gdz: [
                { name: "ГДЗ ВШКОЛЕ", url: "https://vshkole.com/8-klass/reshebniki/algebra/os-ister-2025" },
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/848-algebra-8-ister.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/2398-hdz-alhebra-8-klas-ister.html" }
            ]
        },
        "Біологія": {
            title: "ГДЗ Біологія",
            shortTitle: "БІОЛОГІЯ",
            book: "https://pidruchnyk.com.ua/2926-biologiia-zadorozhnyi-8-klas-2025.html",
            image: "assets/books/biology.jpg",
            gdz: [
                { name: "ГДЗ 12БАЛІВ", url: "https://12baliv.com.ua/gdz-8-class-biolohiya-zadorozhnyj-yahenska-2025" }
            ]
        },
        "Всесвітня історія": {
            title: "ГДЗ Всесвітня історія",
            shortTitle: "ВСЕСВІТНЯ ІСТОРІЯ",
            book: "https://pidruchnyk.com.ua/2987-vsesvitnia-istoriia-shchupak-8-klas-2025.html",
            image: "assets/books/world_history.jpg",
            gdz: [
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/909-vsesvitnia-istoriia-8-klas-shchupak.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/2769-hdz-vsesvitnia-istoriia-8-klas-shchupak.html" }
            ]
        },
        "Географія": {
            title: "ГДЗ Географія",
            shortTitle: "ГЕОГРАФІЯ",
            book: "https://pidruchnyk.com.ua/2984-geografiia-gilberg-8-klas-2025.html",
            image: "assets/books/geography.jpg",
            gdz: [
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/730-geografiya-8-klas-gilberg.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/3273-hdz-heohrafiia-8-klas-hilberh.html" }
            ]
        },
        "Геометрія": {
            title: "ГДЗ Геометрія",
            shortTitle: "ГЕОМЕТРІЯ",
            book: "https://pidruchnyk.com.ua/2911-geometriia-ister-8-klas-2025.html",
            image: "assets/books/geometry.jpg",
            gdz: [
                { name: "ГДЗ ВШКОЛЕ", url: "https://vshkole.com/8-klass/reshebniki/geometriya/os-ister-2025" },
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/647-geomeriya-8-klas-ister.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/2408-hdz-heometriia-8-klas-ister.html" }
            ]
        },
        "Громадянська освіта": {
            title: "ГДЗ Громадянська освіта",
            shortTitle: "ГРОМАДЯНСЬКА ОСВІТА",
            book: "https://pidruchnyk.com.ua/2988-gromadianska-osvita-vasylkiv-8-klas-2025.html",
            image: "assets/books/civics.jpg",
            gdz: []
        },
        "Здоров'я, безпека та добробут": {
            title: "ГДЗ Здоров'я, безпека та добробут",
            shortTitle: "ЗДОРОВ'Я, БЕЗПЕКА ТА ДОБРОБУТ",
            book: "https://pidruchnyk.com.ua/2996-zdorovia-bezpeka-ta-dobrobut-voroncova-8-klas-2025.html",
            image: "assets/books/health.jpg",
            gdz: [
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/3286-hdz-zdorovia-bezpeka-ta-dobrobut-8-klas-vorontsova.html" }
            ]
        },
        "Історія України": {
            title: "ГДЗ Історія України",
            shortTitle: "ІСТОРІЯ УКРАЇНИ",
            book: "https://pidruchnyk.com.ua/3020-istoriia-ukrainy-shchupak-8-klas-2025.html",
            image: "assets/books/ukr_history.jpg",
            gdz: [
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/910-istoriia-ukrainy-8-klas-shchupak.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/3145-hdz-istoriia-ukrainy-8-klas-shchupak.html" }
            ]
        },
        "Підприємництво і фінансова грамотність": {
            title: "ГДЗ Підприємництво і фінансова грамотність",
            shortTitle: "ПІДПРИЄМНИЦТВО ТА ФІН. ГРАМОТНІСТЬ",
            book: "https://pidruchnyk.com.ua/2943-pidpryiemnyctvo-i-finansova-gramotnist-gilberg-8-klas-2025.html",
            image: "assets/books/entrepreneurship.jpg",
            gdz: []
        },
        "Українська мова": {
            title: "ГДЗ Українська мова",
            shortTitle: "УКРАЇНСЬКА МОВА",
            book: "https://pidruchnyk.com.ua/2902-ukrainska-mova-zabolotnyi-8-klas-2025.html",
            image: "assets/books/ukr_mova.jpg",
            gdz: [
                { name: "ГДЗ ВШКОЛЕ", url: "https://vshkole.com/8-klass/reshebniki/ukrayinska-mova/vv-zabolotnij-ov-zabolotnij-2025" },
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/651-ukrainska-mova-8-klas-zabolotnyy.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/2414-hdz-ukrainska-mova-8-klas-zabolotnyi.html" }
            ]
        },
        "Фізика": {
            title: "ГДЗ Фізика",
            shortTitle: "ФІЗИКА",
            book: "https://pidruchnyk.com.ua/2971-fizyka-bariakhtar-8-klas-2025.html",
            image: "assets/books/physics.jpg",
            gdz: [
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/652-baryahtar-fizyka-8-klas.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/2415-hdz-fizyka-8-klas-bar-iakhtar.html" }
            ]
        },
        "Хімія": {
            title: "ГДЗ Хімія",
            shortTitle: "ХІМІЯ",
            book: "https://pidruchnyk.com.ua/2921-khimiia-grygorovych-8-klas-2025.html",
            image: "assets/books/chemistry.jpg",
            gdz: [
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/654-himiya-grygorovych-8-klas.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/2417-hdz-khimiia-8-klas-hryhorovych.html" }
            ]
        },
        "Англійська мова": {
            title: "ГДЗ Англійська мова",
            shortTitle: "АНГЛІЙСЬКА МОВА",
            book: "https://pidruchnyk.com.ua/2903-angliyska-mova-karpiuk-8-klas-2025.html",
            image: null,
            gdz: [
                { name: "ГДЗ ВШКОЛЕ", url: "https://vshkole.com/8-klass/reshebniki/anglijska-mova" },
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/8_klas/angliyska_mova_8_klas/" }
            ]
        },
        "Українська література": {
            title: "ГДЗ Українська література",
            shortTitle: "УКРАЇНСЬКА ЛІТЕРАТУРА",
            book: "https://pidruchnyk.com.ua/2908-ukrainska-literatura-avramenko-8-klas-2025.html",
            image: null,
            gdz: [
                { name: "ГДЗ ВШКОЛЕ", url: "https://vshkole.com/8-klass/reshebniki/ukrayinska-literatura" }
            ]
        },
        "Зарубіжна література": {
            title: "ГДЗ Зарубіжна література",
            shortTitle: "ЗАРУБІЖНА ЛІТЕРАТУРА",
            book: "https://pidruchnyk.com.ua/2916-zarubizhna-literatura-nikolenko-8-klas-2025.html",
            image: null,
            gdz: [
                { name: "ГДЗ ВШКОЛЕ", url: "https://vshkole.com/8-klass/reshebniki/zarubizhna-literatura" }
            ]
        },
        "Інформатика": {
            title: "ГДЗ Інформатика",
            shortTitle: "ІНФОРМАТИКА",
            book: "https://pidruchnyk.com.ua/2918-informatyka-ryvkind-8-klas-2025.html",
            image: null,
            gdz: [
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/8_klas/informatika_8_klas/" }
            ]
        },
        "Фізична культура": {
            title: "Фізична культура",
            shortTitle: "ФІЗИЧНА КУЛЬТУРА",
            book: "#",
            image: null,
            gdz: []
        },
        "Образотворче мистецтво": {
            title: "Образотворче мистецтво",
            shortTitle: "ОБРАЗОТВОРЧЕ МИСТЕЦТВО",
            book: "#",
            image: null,
            gdz: []
        },
        "Музичне мистецтво": {
            title: "Музичне мистецтво",
            shortTitle: "МУЗИЧНЕ МИСТЕЦТВО",
            book: "#",
            image: null,
            gdz: []
        },
        "Технології": {
            title: "Технології",
            shortTitle: "ТЕХНОЛОГІЇ",
            book: "#",
            image: null,
            gdz: []
        },
        "ЗБД / Підприємництво": {
            title: "ГДЗ Здоров'я, безпека та добробут",
            shortTitle: "ЗБД / ПІДПРИЄМНИЦТВО",
            book: "https://pidruchnyk.com.ua/2996-zdorovia-bezpeka-ta-dobrobut-voroncova-8-klas-2025.html",
            image: "assets/books/health.jpg",
            gdz: [
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/3286-hdz-zdorovia-bezpeka-ta-dobrobut-8-klas-vorontsova.html" }
            ]
        },
        "Алгебра / Геометрія": {
            title: "ГДЗ Алгебра / Геометрія",
            shortTitle: "АЛГЕБРА / ГЕОМЕТРІЯ",
            book: "https://pidruchnyk.com.ua/2905-algebra-ister-8-klas-2025.html",
            image: "assets/books/algebra.jpg",
            gdz: [
                { name: "ГДЗ АЛГЕБРА", url: "https://vshkole.com/8-klass/reshebniki/algebra/os-ister-2025" },
                { name: "ГДЗ ГЕОМЕТРІЯ", url: "https://vshkole.com/8-klass/reshebniki/geometriya/os-ister-2025" }
            ]
        },
        "Інформатика / Укр.літ": {
            title: "Інформатика / Укр. література",
            shortTitle: "ІНФОРМАТИКА / УКР.ЛІТ",
            book: "https://pidruchnyk.com.ua/2918-informatyka-ryvkind-8-klas-2025.html",
            image: null,
            gdz: [
                { name: "ГДЗ ІНФОРМАТИКА", url: "https://gdzonline.net/8_klas/informatika_8_klas/" },
                { name: "ГДЗ УКР. ЛІТ", url: "https://vshkole.com/8-klass/reshebniki/ukrayinska-literatura" }
            ]
        }
    };

    let originRect = null;
    let originScrollX = 0;
    let originScrollY = 0;
    let modalRestRect = null;
    let originCard = null;
    let modalState = 'closed';
    let transitionId = 0;
    let modalAnimation = null;
    let contentAnimation = null;
    let chromeAnimation = null;
    let launchViewAnimation = null;
    let homeBarAnimation = null;
    let cardReturnAnimation = null;
    let launchTimer = null;

    // Apple signature spring curves
    const launchEasing = 'cubic-bezier(0.32, 0.72, 0, 1)';
    const closeEasing = 'cubic-bezier(0.32, 0.72, 0, 1)';

    function rectFrame(rect, radius, opacity = 1) {
        return {
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            borderRadius: `${radius}px`,
            opacity
        };
    }

    function getModalRestRect() {
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        const isMobile = vpW <= 768;

        const padX = isMobile ? 28 : (vpW <= 1024 ? 36 : 64);
        const padY = isMobile ? 36 : 64;

        const targetW = isMobile ? Math.min(380, vpW - padX) : Math.min(876, vpW - padX);
        const targetH = isMobile ? Math.min(vpH - padY, Math.max(490, Math.min(590, Math.round(vpH * 0.82)))) : Math.min(447, vpH - padY);

        const left = Math.round((vpW - targetW) / 2);
        const top = Math.round((vpH - targetH) / 2);

        return {
            left,
            top,
            width: targetW,
            height: targetH,
            right: left + targetW,
            bottom: top + targetH,
            radius: 28
        };
    }

    function pinModalToRect(rect, radius) {
        Object.assign(modalContainer.style, {
            position: 'fixed',
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            minHeight: '0px',
            transform: 'none',
            borderRadius: `${radius}px`
        });
    }

    function continueClosingInParallel() {
        document.querySelectorAll('.modal-closing-clone').forEach(element => element.remove());
        if (originCard) {
            originCard.classList.remove('is-opening', 'is-returning');
            originCard.style.opacity = '1';
            originCard.style.visibility = 'visible';
            originCard.style.removeProperty('--mouse-x');
            originCard.style.removeProperty('--mouse-y');
        }
    }

    function clearModalAnimation() {
        modalContainer.getAnimations().forEach(animation => animation.cancel());
        modalContent?.getAnimations().forEach(animation => animation.cancel());
        modalCloseBtn?.getAnimations().forEach(animation => animation.cancel());
        modalLaunchView?.getAnimations().forEach(animation => animation.cancel());
        modalHomeBarZone?.getAnimations().forEach(animation => animation.cancel());
        if (launchTimer) {
            clearTimeout(launchTimer);
            launchTimer = null;
        }
        modalAnimation = null;
        contentAnimation = null;
        chromeAnimation = null;
        launchViewAnimation = null;
        homeBarAnimation = null;
        cardReturnAnimation?.cancel();
        cardReturnAnimation = null;
        modalRestRect = null;
        modalContainer.style.transform = '';
        modalContainer.style.opacity = '';
        modalContainer.style.borderRadius = '';
        modalContainer.style.position = '';
        modalContainer.style.left = '';
        modalContainer.style.top = '';
        modalContainer.style.width = '';
        modalContainer.style.height = '';
        modalContainer.style.minHeight = '';
        modalContainer.style.margin = '';
        if (modalLaunchView) {
            modalLaunchView.style.opacity = '0';
            modalLaunchView.style.transform = '';
        }
        if (modalContent) {
            modalContent.style.opacity = '1';
            modalContent.style.transform = '';
        }
        if (modalCloseBtn) {
            modalCloseBtn.style.opacity = '1';
            modalCloseBtn.style.transform = '';
        }
        if (modalHomeBarZone) {
            modalHomeBarZone.style.opacity = '1';
            modalHomeBarZone.style.transform = '';
        }
        if (originCard) originCard.style.opacity = '';
    }

    function openModal(card) {
        if (!modalBackdrop || !modalContainer) return;

        // If clicking the same card that is already open or currently launching, do nothing
        if (card === originCard && ['opening', 'open'].includes(modalState)) {
            return;
        }

        // Haptic touch impulse
        if ('vibrate' in navigator) {
            try { navigator.vibrate(10); } catch (_) {}
        }

        // If reopening the exact same card while it's currently dismissing, cleanly relaunch back to open
        if (modalState === 'closing' && card === originCard) {
            transitionId++;
            if (cardReturnAnimation) {
                cardReturnAnimation.cancel();
                cardReturnAnimation = null;
            }
            originCard.classList.remove('is-returning');
            originCard.classList.add('is-opening');
            modalBackdrop.classList.remove('is-closing');
            appContainer.classList.remove('modal-closing');
            appContainer.classList.add('modal-open');

            // 1. Measure the exact live visual position BEFORE cancelling the closing animation!
            const currentRect = modalContainer.getBoundingClientRect();
            const computedRadius = parseFloat(getComputedStyle(modalContainer).borderRadius) || 22;

            clearModalAnimation();

            modalRestRect = getModalRestRect();
            pinModalToRect(currentRect, computedRadius);

            if (modalContent) modalContent.style.opacity = '1';
            if (modalCloseBtn) modalCloseBtn.style.opacity = '1';
            if (modalHomeBarZone) modalHomeBarZone.style.opacity = '1';

            modalState = 'opening';
            const thisTransition = transitionId;
            const launchDuration = 440;

            const relaunch = modalContainer.animate([
                { ...rectFrame(currentRect, computedRadius, 1), offset: 0 },
                { ...rectFrame(modalRestRect, modalRestRect.radius || 28), offset: 1 }
            ], { duration: launchDuration, easing: launchEasing, fill: 'forwards' });

            const contentRelaunch = modalContent?.animate([
                { opacity: 0.4, transform: 'scale(0.97)' },
                { opacity: 1, transform: 'scale(1)' }
            ], { duration: 200, easing: 'ease-out', fill: 'forwards' });

            modalAnimation = relaunch;
            contentAnimation = contentRelaunch || null;

            const markOpen = () => {
                if (thisTransition === transitionId) {
                    modalState = 'open';
                    modalAnimation = null;
                    launchTimer = null;
                    pinModalToRect(modalRestRect, modalRestRect.radius || 28);
                    if (modalContent) {
                        modalContent.style.opacity = '1';
                        modalContent.style.transform = 'none';
                    }
                    if (modalCloseBtn) {
                        modalCloseBtn.style.opacity = '1';
                        modalCloseBtn.style.transform = 'none';
                    }
                    if (modalHomeBarZone) {
                        modalHomeBarZone.style.opacity = '1';
                        modalHomeBarZone.style.transform = 'none';
                    }
                }
            };
            relaunch.onfinish = markOpen;
            launchTimer = setTimeout(markOpen, launchDuration + 50);
            return;
        }

        // If another card is already open, opening, or closing, cleanly hand off to the new card
        if (modalState !== 'closed') {
            transitionId++;
            clearModalAnimation();
            document.querySelectorAll('.modal-closing-clone').forEach(el => el.remove());
            if (originCard && originCard !== card) {
                originCard.classList.remove('is-opening', 'is-returning');
                originCard.style.opacity = '1';
                originCard.style.visibility = 'visible';
                originCard.style.removeProperty('--mouse-x');
                originCard.style.removeProperty('--mouse-y');
            }
            modalBackdrop.classList.remove('is-closing');
            appContainer.classList.remove('modal-closing');
            originCard = null;
            originRect = null;
            modalState = 'closed';
        }

        function populateModalContent(targetCard) {
            const fullTitle = targetCard.getAttribute('data-title') || '';
            const subject = fullTitle.replace(/^ГДЗ\s*/i, '').trim();
            const subjectData = SUBJECTS_DB[subject] || {
                title: fullTitle,
                shortTitle: subject.toUpperCase(),
                book: '#',
                gdz: []
            };

            if (modalSubjectName) modalSubjectName.textContent = subjectData.shortTitle;
            if (modalLaunchTitle) modalLaunchTitle.textContent = subjectData.title;

            // Populate dynamic GDZ links
            if (modalGdzList) {
                modalGdzList.innerHTML = '';
                if (subjectData.gdz && subjectData.gdz.length > 0) {
                    subjectData.gdz.forEach(item => {
                        const btn = document.createElement('a');
                        btn.href = item.url;
                        btn.target = '_blank';
                        btn.rel = 'noopener';
                        btn.className = 'modal-option-btn';
                        btn.innerHTML = `<span class="option-text">${item.name}</span>`;
                        modalGdzList.appendChild(btn);
                    });
                } else {
                    const emptyNotice = document.createElement('div');
                    emptyNotice.className = 'modal-no-gdz-msg';
                    emptyNotice.textContent = 'ГДЗ ДЛЯ ЦЬОГО ПРЕДМЕТА ЩЕ НЕМАЄ';
                    modalGdzList.appendChild(emptyNotice);
                }
            }

            // Set textbook links
            if (modalBookLinkBtn) {
                modalBookLinkBtn.href = subjectData.book || '#';
                modalBookLinkBtn.style.display = (subjectData.book && subjectData.book !== '#') ? 'flex' : 'none';
            }
            if (modalBookPreviewLink) {
                modalBookPreviewLink.href = subjectData.book || '#';
            }

            // Set book cover image in preview card
            if (modalBookCoverImg) {
                if (subjectData.image) {
                    modalBookCoverImg.src = subjectData.image;
                    modalBookCoverImg.style.display = 'block';
                    if (modalBookPlaceholder) modalBookPlaceholder.style.display = 'none';
                } else {
                    modalBookCoverImg.src = '';
                    modalBookCoverImg.style.display = 'none';
                    if (modalBookPlaceholder) modalBookPlaceholder.style.display = 'flex';
                }
            }

            // Sync launch view cover image for smooth crossfade
            if (modalLaunchCoverBox && modalLaunchCoverImg) {
                if (subjectData.image) {
                    modalLaunchCoverImg.src = subjectData.image;
                    modalLaunchCoverBox.style.display = 'flex';
                } else {
                    modalLaunchCoverImg.src = '';
                    modalLaunchCoverBox.style.display = 'none';
                }
            }
        }

        populateModalContent(card);

        originCard = card;
        card.classList.add('is-opening');
        originRect = card.getBoundingClientRect();
        originScrollX = window.scrollX;
        originScrollY = window.scrollY;
        modalState = 'opening';
        const thisTransition = ++transitionId;

        // Prevent background scrolling on mobile touch devices only
        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        if (isMobile) {
            document.documentElement.classList.add('modal-locked');
            document.body.classList.add('modal-locked');
        }

        modalBackdrop.classList.add('is-open');
        appContainer.classList.add('modal-open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        clearModalAnimation();

        modalRestRect = getModalRestRect();
        pinModalToRect(originRect, 22);

        // Prepare launch screen crossfade
        if (modalLaunchView) {
            modalLaunchView.style.opacity = '1';
        }
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.96) translateY(6px)';
        }
        if (modalCloseBtn) {
            modalCloseBtn.style.opacity = '0';
            modalCloseBtn.style.transform = 'scale(0.8)';
        }
        if (modalHomeBarZone) {
            modalHomeBarZone.style.opacity = '0';
            modalHomeBarZone.style.transform = 'translateY(10px)';
        }

        const launchDuration = 520;

        // 1. Frame Morphing with Apple CASpringAnimation curve (launchEasing)
        const launch = modalContainer.animate([
            { ...rectFrame(originRect, 22, 1), offset: 0 },
            { ...rectFrame(modalRestRect, modalRestRect.radius || 28), offset: 1 }
        ], { duration: launchDuration, easing: launchEasing, fill: 'forwards' });

        // 2. Launch Screen Crossfade into active content
        const launchViewLaunch = modalLaunchView?.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: 180, delay: 40, easing: 'ease-out', fill: 'forwards' });

        const contentLaunch = modalContent?.animate([
            { opacity: 0, transform: 'scale(0.95) translateY(6px)' },
            { opacity: 0, transform: 'scale(0.96) translateY(4px)', offset: 0.28 },
            { opacity: 1, transform: 'scale(1) translateY(0)', offset: 1 }
        ], { duration: 340, delay: 100, easing: launchEasing, fill: 'forwards' });

        const chromeLaunch = modalCloseBtn?.animate([
            { opacity: 0, transform: 'scale(0.75)' },
            { opacity: 1, transform: 'scale(1)' }
        ], { duration: 240, delay: 150, easing: launchEasing, fill: 'forwards' });

        const homeBarLaunch = modalHomeBarZone?.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 240, delay: 160, easing: launchEasing, fill: 'forwards' });

        modalAnimation = launch;
        contentAnimation = contentLaunch || null;
        chromeAnimation = chromeLaunch || null;
        launchViewAnimation = launchViewLaunch || null;
        homeBarAnimation = homeBarLaunch || null;

        const markOpen = () => {
            if (thisTransition === transitionId) {
                modalState = 'open';
                modalAnimation = null;
                launchTimer = null;
                pinModalToRect(modalRestRect, modalRestRect.radius || 28);
                if (modalLaunchView) {
                    modalLaunchView.style.opacity = '0';
                }
                if (modalContent) {
                    modalContent.style.opacity = '1';
                    modalContent.style.transform = 'none';
                }
                if (modalCloseBtn) {
                    modalCloseBtn.style.opacity = '1';
                    modalCloseBtn.style.transform = 'none';
                }
                if (modalHomeBarZone) {
                    modalHomeBarZone.style.opacity = '1';
                    modalHomeBarZone.style.transform = 'none';
                }
            }
        };
        launch.onfinish = markOpen;
        launchTimer = setTimeout(markOpen, launchDuration + 50);
    }

    function closeModal() {
        if (!modalBackdrop || !modalContainer || !modalBackdrop.classList.contains('is-open') || !['opening', 'open'].includes(modalState)) return;

        modalState = 'closing';
        const thisTransition = ++transitionId;
        modalBackdrop.classList.add('is-closing');
        appContainer.classList.add('modal-closing');

        const closeDuration = 340;

        // Keep originCard cleanly hidden during the flight.
        // It must NOT show up early underneath, eliminating the double-card glitch!
        if (originCard) {
            originCard.classList.remove('is-returning');
            originCard.classList.add('is-opening');
            originCard.style.opacity = '0';
        }

        const finishClose = () => {
            if (thisTransition !== transitionId || modalState === 'closed') return;

            modalContainer.style.visibility = 'hidden';
            clearModalAnimation();
            modalBackdrop.classList.remove('is-closing');
            modalBackdrop.classList.remove('is-open');
            appContainer.classList.remove('modal-closing');
            appContainer.classList.remove('modal-open');
            modalBackdrop.style.opacity = '';
            appContainer.style.transform = '';

            // Restore page scrollability
            document.documentElement.classList.remove('modal-locked');
            document.body.classList.remove('modal-locked');

            if (originCard) {
                const landingCard = originCard;
                landingCard.classList.remove('is-opening', 'is-returning');
                landingCard.style.opacity = '1';
                landingCard.style.visibility = 'visible';
                landingCard.style.removeProperty('--mouse-x');
                landingCard.style.removeProperty('--mouse-y');

                // iOS Elastic Bounce overshoot on arriving icon
                landingCard.animate([
                    { transform: 'scale(0.94)' },
                    { transform: 'scale(1.035)', offset: 0.5 },
                    { transform: 'scale(0.99)', offset: 0.78 },
                    { transform: 'scale(1)', offset: 1 }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)',
                    fill: 'none'
                });
            }
            modalBackdrop.setAttribute('aria-hidden', 'true');
            modalState = 'closed';
            requestAnimationFrame(() => {
                modalContainer.style.visibility = '';
            });
        };

        const currentRect = modalContainer.getBoundingClientRect();
        const computedBorderRadius = parseFloat(getComputedStyle(modalContainer).borderRadius) || (modalRestRect?.radius || 28);

        // Calculate the true unscaled target rectangle of the card accounting for any page scroll
        let targetRect = null;
        if (originRect) {
            const scrollDeltaX = window.scrollX - originScrollX;
            const scrollDeltaY = window.scrollY - originScrollY;
            targetRect = {
                left: originRect.left - scrollDeltaX,
                top: originRect.top - scrollDeltaY,
                width: originRect.width,
                height: originRect.height,
                right: originRect.right - scrollDeltaX,
                bottom: originRect.bottom - scrollDeltaY
            };
        } else {
            targetRect = originCard ? originCard.getBoundingClientRect() : currentRect;
        }

        // Reset any inline transform from drag gesture before WAAPI frame animation begins
        modalContainer.style.transform = 'none';
        pinModalToRect(currentRect, computedBorderRadius);

        modalContainer.getAnimations().forEach(a => a.cancel());
        modalContent?.getAnimations().forEach(a => a.cancel());
        modalCloseBtn?.getAnimations().forEach(a => a.cancel());
        modalLaunchView?.getAnimations().forEach(a => a.cancel());
        modalHomeBarZone?.getAnimations().forEach(a => a.cancel());

        // Crossfade launch view back in so the card title appears inside the shrinking container
        if (modalLaunchTitle && originCard) {
            modalLaunchTitle.textContent = originCard.getAttribute('data-title') || '';
        }
        const launchViewClose = modalLaunchView?.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], { duration: 140, easing: closeEasing, fill: 'forwards' });

        // Modal stays solid and visible (opacity: 1) morphing directly into targetRect without fading away
        const close = modalContainer.animate([
            { ...rectFrame(currentRect, computedBorderRadius, 1), offset: 0 },
            { ...rectFrame(targetRect, 22, 1), offset: 1 }
        ], { duration: closeDuration, easing: closeEasing, fill: 'forwards' });

        const contentClose = modalContent?.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.95)' }
        ], { duration: 70, easing: 'ease-out', fill: 'forwards' });

        const chromeClose = modalCloseBtn?.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' }
        ], { duration: 70, easing: 'ease-out', fill: 'forwards' });

        const homeBarClose = modalHomeBarZone?.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' }
        ], { duration: 70, easing: 'ease-out', fill: 'forwards' });

        modalAnimation = close;
        contentAnimation = contentClose || null;
        chromeAnimation = chromeClose || null;
        launchViewAnimation = launchViewClose || null;
        homeBarAnimation = homeBarClose || null;
        close.onfinish = finishClose;
        setTimeout(finishClose, closeDuration + 40);
    }

    // ==========================================================================
    // 5. INTERACTIVE GESTURE TRACKING (SWIPE HOME BAR / DRAG TO DISMISS)
    // ==========================================================================
    let isDragging = false;
    let dragStartY = 0;
    let dragStartX = 0;
    let lastDragY = 0;
    let lastDragTime = 0;
    let dragVelocity = 0;
    let isFromHomeBar = false;
    let dragRafId = null;
    let currentPointerX = 0;
    let currentPointerY = 0;

    function handleDragStart(e, fromHomeBar) {
        if (!['open', 'opening'].includes(modalState)) return;
        if (e.target.closest('a, button:not(#modalHomeBarZone)') && !fromHomeBar) return;

        // If the user clicks or taps the Home Bar while the window is still opening:
        // Immediately smoothly dismiss back to the origin card instead of freezing into a broken state!
        if (modalState === 'opening' && fromHomeBar) {
            closeModal();
            return;
        }

        // Do not interrupt the opening flight for container touches
        if (modalState !== 'open') return;

        isDragging = true;
        isFromHomeBar = fromHomeBar;
        dragStartY = e.clientY;
        dragStartX = e.clientX;
        currentPointerX = e.clientX;
        currentPointerY = e.clientY;
        lastDragY = e.clientY;
        lastDragTime = performance.now();
        dragVelocity = 0;

        modalContainer.style.transition = 'none';
        modalBackdrop.style.transition = 'none';
        appContainer.style.transition = 'none';

        if (e.pointerId !== undefined && modalContainer.setPointerCapture) {
            try { modalContainer.setPointerCapture(e.pointerId); } catch (_) {}
        }
    }

    function renderDragFrame() {
        dragRafId = null;
        if (!isDragging) return;

        const dy = currentPointerY - dragStartY;
        const dx = currentPointerX - dragStartX;

        const effectiveDrag = isFromHomeBar ? Math.abs(dy) : Math.max(0, dy);
        const maxDist = Math.max(220, window.innerHeight * 0.45);
        const progress = Math.min(1, effectiveDrag / maxDist);

        const scale = Math.max(0.72, 1 - progress * 0.25);
        const translateX = dx * 0.4;
        const translateY = dy;

        modalContainer.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;

        // Progressive Z-Axis background scale up from depth (GPU compositing only, no expensive filter re-renders)
        const bgScale = 0.94 + progress * 0.06;
        appContainer.style.transform = `scale(${bgScale.toFixed(3)}) translateY(${((1 - progress) * 4).toFixed(1)}px)`;
        modalBackdrop.style.opacity = `${Math.max(0.3, 1 - progress * 0.5)}`;
    }

    function handleDragMove(e) {
        if (!isDragging) return;

        currentPointerX = e.clientX;
        currentPointerY = e.clientY;

        const now = performance.now();
        const dt = Math.max(1, now - lastDragTime);
        dragVelocity = (e.clientY - lastDragY) / dt;
        lastDragY = e.clientY;
        lastDragTime = now;

        if (!dragRafId) {
            dragRafId = requestAnimationFrame(renderDragFrame);
        }
    }

    function handleDragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        if (dragRafId) {
            cancelAnimationFrame(dragRafId);
            dragRafId = null;
        }

        const dy = e.clientY - dragStartY;
        const totalDist = Math.abs(dy);
        const isUpwardSwipe = dy < -35 && isFromHomeBar;
        const isDownwardSwipe = dy > 45;
        const hasHighVelocity = Math.abs(dragVelocity) > 0.35;

        // Tapping the Home Bar or swiping dismisses smoothly
        if ((isFromHomeBar && totalDist < 12) || isUpwardSwipe || isDownwardSwipe || totalDist > 70 || hasHighVelocity) {
            if ('vibrate' in navigator) {
                try { navigator.vibrate(10); } catch (_) {}
            }
            modalContainer.style.transition = '';
            modalBackdrop.style.transition = '';
            appContainer.style.transition = '';
            closeModal();
        } else {
            // Spring settlement back to resting open position
            modalContainer.style.transition = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';
            modalBackdrop.style.transition = 'opacity 0.28s ease-out';
            appContainer.style.transition = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';

            modalContainer.style.transform = 'none';
            modalBackdrop.style.opacity = '1';
            appContainer.style.transform = 'scale(0.94) translateY(4px)';

            setTimeout(() => {
                modalContainer.style.transition = '';
                modalBackdrop.style.transition = '';
                appContainer.style.transition = '';
            }, 340);
        }
    }

    // Attach interactive gesture listeners
    if (modalContainer) {
        modalContainer.addEventListener('pointerdown', (e) => {
            handleDragStart(e, false);
        });
    }

    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
    window.addEventListener('pointercancel', handleDragEnd);

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
        modalBackdrop.addEventListener('touchmove', (e) => {
            const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
            if (isMobile && ['open', 'opening', 'closing'].includes(modalState)) {
                e.preventDefault();
            }
        }, { passive: false });

        // Propagate mousewheel scroll on PC desktop so page scrolling works normally
        modalBackdrop.addEventListener('wheel', (e) => {
            const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
            if (!isMobile) {
                window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' });
            }
        }, { passive: true });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modalBackdrop && modalBackdrop.classList.contains('is-open')) closeModal();
            if (scheduleModalBackdrop && scheduleModalBackdrop.classList.contains('is-open')) closeScheduleModal();
        }
    });

    // ==========================================================================
    // 5. REAL-TIME LESSON & BREAK SCHEDULE TIMER
    // ==========================================================================
    // 1 зміна (7-11 класи):
    // Пн, Вт, Ср — 7 уроків (до 14:05)
    // Чт, Пт — 6 уроків (до 13:15)
    // Сб, Нд — вихідні
    const LESSON_SCHEDULE = [
        { num: 1, start: "08:00", end: "08:45" },
        { num: 2, start: "08:55", end: "09:40" },
        { num: 3, start: "09:55", end: "10:40" },
        { num: 4, start: "10:50", end: "11:35" },
        { num: 5, start: "11:40", end: "12:25" },
        { num: 6, start: "12:30", end: "13:15" },
        { num: 7, start: "13:20", end: "14:05" }
    ];

    function parseTimeSec(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 3600 + m * 60;
    }

    const SCHEDULE_SECS = LESSON_SCHEDULE.map(item => ({
        num: item.num,
        startSec: parseTimeSec(item.start),
        endSec: parseTimeSec(item.end)
    }));

    const timerLabelEl = document.getElementById('timerLabel');
    const timerPrefixEl = document.getElementById('timerPrefix');
    const timerBadgeEl = document.getElementById('lessonTimer');

    function formatTimerSeconds(sec) {
        sec = Math.max(0, Math.floor(sec));
        const hours = Math.floor(sec / 3600);
        const mins = Math.floor((sec % 3600) / 60);
        const secs = sec % 60;
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateLessonTimer() {
        if (!timerBadgeEl) return;

        const now = new Date();
        const day = now.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
        const curSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        // 1. Weekend (Saturday or Sunday)
        if (day === 0 || day === 6) {
            if (timerLabelEl) timerLabelEl.textContent = 'вихідний';
            if (timerPrefixEl) timerPrefixEl.textContent = 'до уроків:';
            let daysUntilMon = (day === 6) ? 2 : 1;
            const targetMonSec = (daysUntilMon * 86400) + (8 * 3600) - curSec;
            timerBadgeEl.textContent = formatTimerSeconds(targetMonSec);
            return;
        }

        // 2. Weekday: Mon(1), Tue(2), Wed(3) = 7 lessons; Thu(4), Fri(5) = 6 lessons
        const lessonCount = (day === 4 || day === 5) ? 6 : 7;
        const todayLessons = SCHEDULE_SECS.slice(0, lessonCount);

        const firstLessonStart = todayLessons[0].startSec; // 08:00
        const lastLessonEnd = todayLessons[todayLessons.length - 1].endSec;

        // A. Before school starts in the morning (< 08:00)
        if (curSec < firstLessonStart) {
            const diff = firstLessonStart - curSec;
            if (timerLabelEl) timerLabelEl.textContent = 'до початку';
            if (timerPrefixEl) timerPrefixEl.textContent = '1 уроку:';
            timerBadgeEl.textContent = formatTimerSeconds(diff);
            return;
        }

        // B. After all lessons end for today
        if (curSec >= lastLessonEnd) {
            if (timerLabelEl) timerLabelEl.textContent = 'уроки закінчились';
            if (day === 5) {
                if (timerPrefixEl) timerPrefixEl.textContent = 'до понеділка:';
                const diffToMon = (86400 - curSec) + (2 * 86400) + (8 * 3600);
                timerBadgeEl.textContent = formatTimerSeconds(diffToMon);
            } else {
                if (timerPrefixEl) timerPrefixEl.textContent = 'до завтра:';
                const diffToTomorrow = (86400 - curSec) + (8 * 3600);
                timerBadgeEl.textContent = formatTimerSeconds(diffToTomorrow);
            }
            return;
        }

        // C. During school hours: check each lesson and break
        for (let i = 0; i < todayLessons.length; i++) {
            const lesson = todayLessons[i];

            // Currently in lesson i
            if (curSec >= lesson.startSec && curSec < lesson.endSec) {
                const diff = lesson.endSec - curSec;
                if (i === todayLessons.length - 1) {
                    if (timerLabelEl) timerLabelEl.textContent = 'до кінця уроків';
                } else {
                    if (timerLabelEl) timerLabelEl.textContent = 'до перерви';
                }
                if (timerPrefixEl) timerPrefixEl.textContent = `${lesson.num} урок:`;
                timerBadgeEl.textContent = formatTimerSeconds(diff);
                return;
            }

            // Currently on break after lesson i (before lesson i+1)
            if (i < todayLessons.length - 1) {
                const nextLesson = todayLessons[i + 1];
                if (curSec >= lesson.endSec && curSec < nextLesson.startSec) {
                    const diff = nextLesson.startSec - curSec;
                    if (timerLabelEl) timerLabelEl.textContent = 'перерва';
                    if (timerPrefixEl) timerPrefixEl.textContent = `до ${nextLesson.num} уроку:`;
                    timerBadgeEl.textContent = formatTimerSeconds(diff);
                    return;
                }
            }
        }
    }

    updateLessonTimer();
    setInterval(updateLessonTimer, 1000);

    // ==========================================================================
    // 6. DYNAMIC TODAY / TOMORROW SCHEDULE SECTION (8-А КЛАС)
    // ==========================================================================
    const WEEK_SCHEDULE = {
        // Понеділок (7 уроків, 08:00 - 14:05)
        1: {
            name: "ПОНЕДІЛОК",
            lessons: [
                { num: 1, name: "Хімія", time: "08:00 - 08:45", dbTitle: "ГДЗ Хімія", image: "assets/books/chemistry.jpg" },
                { num: 2, name: "Українська мова", time: "08:55 - 09:40", dbTitle: "ГДЗ Українська мова", image: "assets/books/ukr_mova.jpg" },
                { num: 3, name: "Фізичне виховання", time: "09:55 - 10:40", dbTitle: "Фізична культура", icon: "sport" },
                { num: 4, name: "Історія України", time: "10:50 - 11:35", dbTitle: "ГДЗ Історія України", image: "assets/books/ukr_history.jpg" },
                { num: 5, name: "Англійська мова", time: "11:40 - 12:25", dbTitle: "ГДЗ Англійська мова", icon: "lang" },
                { num: 6, name: "Алгебра", time: "12:30 - 13:15", dbTitle: "ГДЗ Алгебра", image: "assets/books/algebra.jpg" },
                { num: 7, name: "Образотворче мистецтво", time: "13:20 - 14:05", dbTitle: "Образотворче мистецтво", icon: "art" }
            ]
        },
        // Вівторок (7 уроків, 08:00 - 14:05)
        2: {
            name: "ВІВТОРОК",
            lessons: [
                { num: 1, name: "Історія України", time: "08:00 - 08:45", dbTitle: "ГДЗ Історія України", image: "assets/books/ukr_history.jpg" },
                { num: 2, name: "Українська мова", time: "08:55 - 09:40", dbTitle: "ГДЗ Українська мова", image: "assets/books/ukr_mova.jpg" },
                { num: 3, name: "Музичне мистецтво", time: "09:55 - 10:40", dbTitle: "Музичне мистецтво", icon: "music" },
                { num: 4, name: "Фізика", time: "10:50 - 11:35", dbTitle: "ГДЗ Фізика", image: "assets/books/physics.jpg" },
                { num: 5, name: "Алгебра", time: "11:40 - 12:25", dbTitle: "ГДЗ Алгебра", image: "assets/books/algebra.jpg" },
                { num: 6, name: "Біологія", time: "12:30 - 13:15", dbTitle: "ГДЗ Біологія", image: "assets/books/biology.jpg" },
                { num: 7, name: "Фізичне виховання", time: "13:20 - 14:05", dbTitle: "Фізична культура", icon: "sport" }
            ]
        },
        // Середа (7 уроків, 08:00 - 14:05)
        3: {
            name: "СЕРЕДА",
            lessons: [
                { num: 1, name: "Фізичне виховання", time: "08:00 - 08:45", dbTitle: "Фізична культура", icon: "sport" },
                { num: 2, name: "Інформатика", time: "08:55 - 09:40", dbTitle: "ГДЗ Інформатика", icon: "info" },
                { num: 3, name: "Фізика", time: "09:55 - 10:40", dbTitle: "ГДЗ Фізика", image: "assets/books/physics.jpg" },
                { num: 4, name: "Англійська мова", time: "10:50 - 11:35", dbTitle: "ГДЗ Англійська мова", icon: "lang" },
                { num: 5, name: "Геометрія", time: "11:40 - 12:25", dbTitle: "ГДЗ Геометрія", image: "assets/books/geometry.jpg" },
                { num: 6, name: "Українська література", time: "12:30 - 13:15", dbTitle: "ГДЗ Українська література", icon: "book" },
                { num: 7, name: "ЗБД / Підприємництво", time: "13:20 - 14:05", dbTitle: "ЗБД / Підприємництво", image: "assets/books/health.jpg" }
            ]
        },
        // Четвер (6 уроків, 08:00 - 13:15)
        4: {
            name: "ЧЕТВЕР",
            lessons: [
                { num: 1, name: "Біологія", time: "08:00 - 08:45", dbTitle: "ГДЗ Біологія", image: "assets/books/biology.jpg" },
                { num: 2, name: "Географія", time: "08:55 - 09:40", dbTitle: "ГДЗ Географія", image: "assets/books/geography.jpg" },
                { num: 3, name: "Всесвітня історія", time: "09:55 - 10:40", dbTitle: "ГДЗ Всесвітня історія", image: "assets/books/world_history.jpg" },
                { num: 4, name: "Українська мова", time: "10:50 - 11:35", dbTitle: "ГДЗ Українська мова", image: "assets/books/ukr_mova.jpg" },
                { num: 5, name: "Хімія", time: "11:40 - 12:25", dbTitle: "ГДЗ Хімія", image: "assets/books/chemistry.jpg" },
                { num: 6, name: "Алгебра / Геометрія", time: "12:30 - 13:15", dbTitle: "Алгебра / Геометрія", image: "assets/books/algebra.jpg" }
            ]
        },
        // П'ятниця (6 уроків, 08:00 - 13:15)
        5: {
            name: "П'ЯТНИЦЯ",
            lessons: [
                { num: 1, name: "Англійська мова", time: "08:00 - 08:45", dbTitle: "ГДЗ Англійська мова", icon: "lang" },
                { num: 2, name: "Українська мова", time: "08:55 - 09:40", dbTitle: "ГДЗ Українська мова", image: "assets/books/ukr_mova.jpg" },
                { num: 3, name: "Зарубіжна література", time: "09:55 - 10:40", dbTitle: "ГДЗ Зарубіжна література", icon: "book" },
                { num: 4, name: "Географія", time: "10:50 - 11:35", dbTitle: "ГДЗ Географія", image: "assets/books/geography.jpg" },
                { num: 5, name: "Інформатика / Укр.літ", time: "11:40 - 12:25", dbTitle: "Інформатика / Укр.літ", icon: "info" },
                { num: 6, name: "Технології", time: "12:30 - 13:15", dbTitle: "Технології", icon: "tech" }
            ]
        }
    };

    const ICONS_SVG = {
        sport: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`,
        art: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`,
        music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
        lang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
        book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
        tech: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
    };

    let currentRenderedScheduleKey = null;

    function renderScheduleSection() {
        const scheduleCardsGrid = document.getElementById('scheduleCardsGrid');
        const scheduleSectionTitle = document.getElementById('scheduleSectionTitle');
        if (!scheduleCardsGrid || !scheduleSectionTitle) return;

        const now = new Date();
        const day = now.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
        const curSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        let targetDay = day;
        let isToday = true;

        if (day === 0 || day === 6) {
            targetDay = 1; // Monday
            isToday = false;
        } else {
            const endSec = (day === 4 || day === 5) ? (13 * 3600 + 15 * 60) : (14 * 3600 + 5 * 60);
            if (curSec >= endSec) {
                if (day === 5) {
                    targetDay = 1; // Friday after school -> Monday
                } else {
                    targetDay = day + 1; // Next weekday
                }
                isToday = false;
            }
        }

        const daySchedule = WEEK_SCHEDULE[targetDay];
        if (!daySchedule) return;

        if (isToday) {
            scheduleSectionTitle.textContent = `УРОКИ НА СЬОГОДНІ (${daySchedule.name})`;
        } else {
            if (targetDay === 1 && (day === 5 || day === 6 || day === 0)) {
                scheduleSectionTitle.textContent = `УРОКИ НА ПОНЕДІЛОК`;
            } else {
                scheduleSectionTitle.textContent = `УРОКИ НА ЗАВТРА (${daySchedule.name})`;
            }
        }

        scheduleCardsGrid.innerHTML = '';

        daySchedule.lessons.forEach(lesson => {
            const card = document.createElement('button');
            card.className = 'liquid-card schedule-card';
            card.setAttribute('data-title', lesson.dbTitle || lesson.name);

            // Check if this lesson is currently in progress
            let isLive = false;
            if (isToday) {
                const times = lesson.time.split('-').map(t => t.trim());
                const lStart = parseTimeSec(times[0]);
                const lEnd = parseTimeSec(times[1]);
                if (curSec >= lStart && curSec < lEnd) {
                    isLive = true;
                }
            }

            let mediaHtml = '';
            if (lesson.image) {
                mediaHtml = `
                    <div class="card-cover-box">
                        <img src="${lesson.image}" class="card-cover-img" alt="${lesson.name}" />
                    </div>`;
            } else {
                const svgContent = ICONS_SVG[lesson.icon] || ICONS_SVG.book;
                mediaHtml = `
                    <div class="card-icon-box">
                        <div class="card-icon-placeholder">
                            ${svgContent}
                        </div>
                    </div>`;
            }

            card.innerHTML = `
                <div class="liquid-lens"></div>
                <div class="liquid-specular-edge"></div>
                <div class="card-schedule-header">
                    <span class="lesson-num-badge ${isLive ? 'is-live' : ''}">${isLive ? 'ЗАРАЗ' : `${lesson.num} УРОК`}</span>
                    <span class="lesson-time-badge">${lesson.time}</span>
                </div>
                ${mediaHtml}
                <div class="card-content">
                    <span class="card-title">${lesson.name}</span>
                </div>
            `;

            scheduleCardsGrid.appendChild(card);
            initCard(card);
        });
    }

    renderScheduleSection();
    // Re-check schedule status every 30 seconds
    setInterval(renderScheduleSection, 30000);

    // ==========================================================================
    // 7. AVATAR AUDIO
    // ==========================================================================
    const avatarBtn = document.getElementById('avatarBtn');
    const bgAudio = document.getElementById('bgAudio');

    if (avatarBtn && bgAudio) {
        avatarBtn.addEventListener('click', () => {
            if (bgAudio.paused) {
                bgAudio.play().then(() => avatarBtn.classList.add('is-playing')).catch(() => {});
            } else {
                bgAudio.pause();
                avatarBtn.classList.remove('is-playing');
            }
        });
        bgAudio.addEventListener('ended', () => avatarBtn.classList.remove('is-playing'));
    }
});
