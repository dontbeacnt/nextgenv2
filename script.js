document.addEventListener('DOMContentLoaded', () => {
    let modalState = 'closed';

    // ==========================================================================
    // 0. SYSTEM SETTINGS MANAGER & LOCALSTORAGE PERSISTENCE ENGINE
    // ==========================================================================
    const ACCENT_PALETTE = {
        purple: { accent: '#c058ff', glow: 'rgba(192, 88, 255, 0.45)' },
        blue:   { accent: '#2997ff', glow: 'rgba(41, 151, 255, 0.45)' },
        cyan:   { accent: '#00f0ff', glow: 'rgba(0, 240, 255, 0.45)' },
        green:  { accent: '#30d158', glow: 'rgba(48, 209, 88, 0.45)' },
        pink:   { accent: '#ff2d55', glow: 'rgba(255, 45, 85, 0.45)' },
        orange: { accent: '#ff9f0a', glow: 'rgba(255, 159, 10, 0.45)' }
    };

    function hexToRgb(hex) {
        let clean = (hex || '#c058ff').replace('#', '');
        if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
        const num = parseInt(clean, 16) || 0;
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    function hexToGlow(hex, alpha = 0.45) {
        const { r, g, b } = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function getContrastText(hex) {
        if (!hex) return '#ffffff';
        const rgb = hexToRgb(hex);
        const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
        return lum > 160 ? '#0b0b10' : '#ffffff';
    }

    function getAccentConfig(state) {
        if (state.accentColor === 'custom' && state.customAccentHex) {
            return {
                accent: state.customAccentHex,
                glow: hexToGlow(state.customAccentHex, 0.45),
                contrast: getContrastText(state.customAccentHex)
            };
        }
        const p = ACCENT_PALETTE[state.accentColor] || ACCENT_PALETTE.purple;
        return {
            accent: p.accent,
            glow: p.glow,
            contrast: getContrastText(p.accent)
        };
    }

    const AURA_PALETTES = {
        purple: {
            glow1: 'rgba(192, 88, 255, 0.20)',
            glow2: 'rgba(140, 50, 255, 0.12)',
            reflection: 'rgba(192, 88, 255, 0.75)'
        },
        blue: {
            glow1: 'rgba(41, 151, 255, 0.20)',
            glow2: 'rgba(0, 200, 255, 0.12)',
            reflection: 'rgba(41, 151, 255, 0.75)'
        },
        cyan: {
            glow1: 'rgba(0, 240, 255, 0.20)',
            glow2: 'rgba(0, 160, 255, 0.12)',
            reflection: 'rgba(0, 240, 255, 0.75)'
        },
        green: {
            glow1: 'rgba(48, 209, 88, 0.18)',
            glow2: 'rgba(0, 240, 255, 0.12)',
            reflection: 'rgba(48, 209, 88, 0.75)'
        },
        pink: {
            glow1: 'rgba(255, 45, 85, 0.20)',
            glow2: 'rgba(255, 100, 160, 0.12)',
            reflection: 'rgba(255, 45, 85, 0.75)'
        },
        orange: {
            glow1: 'rgba(255, 159, 10, 0.20)',
            glow2: 'rgba(255, 80, 0, 0.12)',
            reflection: 'rgba(255, 159, 10, 0.75)'
        }
    };

    function getAuraConfig(state) {
        if (!state) return AURA_PALETTES.purple;
        if (state.accentColor === 'custom') {
            const rgb = hexToRgb(state.customAccentHex || '#c058ff');
            return {
                glow1: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.20)`,
                glow2: `rgba(${Math.round(rgb.r * 0.75)}, ${Math.round(rgb.g * 0.75)}, ${Math.round(rgb.b * 0.95)}, 0.12)`,
                reflection: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`
            };
        }
        return AURA_PALETTES[state.accentColor] || AURA_PALETTES.purple;
    }

    const ANIM_PRESETS = {
        cinematic: {
            name: 'Bounce',
            desc: 'Bounce: збалансована пружинна анімація з м\'яким розквітом',
            openDur: 380,
            closeDur: 260,
            openMobileDur: 330,
            closeMobileDur: 220,
            openEase: 'cubic-bezier(0.22, 1.12, 0.36, 1)',
            closeEase: 'cubic-bezier(0.32, 0, 0.15, 1)'
        },
        fast: {
            name: 'Flash',
            desc: 'Flash: швидкий і чіткий перехід для високої продуктивності',
            openDur: 220,
            closeDur: 160,
            openMobileDur: 200,
            closeMobileDur: 140,
            openEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
            closeEase: 'cubic-bezier(0.25, 1, 0.5, 1)'
        },
        liquid: {
            name: 'Bounce 2',
            desc: 'Bounce 2: соковитий перелив рідкого скла з виразним відскоком',
            openDur: 480,
            closeDur: 320,
            openMobileDur: 420,
            closeMobileDur: 270,
            openEase: 'cubic-bezier(0.34, 1.28, 0.64, 1)',
            closeEase: 'cubic-bezier(0.32, 0, 0.15, 1)'
        },
        slow: {
            name: 'Sweet',
            desc: 'Sweet: м\'яка заспокійлива анімація з глибоким уповільненням',
            openDur: 620,
            closeDur: 420,
            openMobileDur: 520,
            closeMobileDur: 340,
            openEase: 'cubic-bezier(0.16, 1, 0.25, 1)',
            closeEase: 'cubic-bezier(0.25, 1, 0.35, 1)'
        },
        instant: {
            name: 'Flash 2',
            desc: 'Flash 2: надшвидке розгортання практично без затримок',
            openDur: 140,
            closeDur: 110,
            openMobileDur: 130,
            closeMobileDur: 100,
            openEase: 'cubic-bezier(0, 0, 0.2, 1)',
            closeEase: 'cubic-bezier(0.4, 0, 1, 1)'
        }
    };

    const AURA_DESCS = {
        dynamic: 'В колір теми: сяйво фону адаптується до вибраного акценту',
        oled: 'Без сяйва (OLED): чистий глибокий чорний фон без підсвічування'
    };

    function playTapticAudio(type = 'click') {
        if (!window.settingsState?.soundFx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!window._tapticAudioCtx) window._tapticAudioCtx = new AudioCtx();
            const ctx = window._tapticAudioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = ctx.currentTime;
            osc.type = 'sine';

            if (type === 'click') {
                osc.frequency.setValueAtTime(840, t);
                osc.frequency.exponentialRampToValueAtTime(320, t + 0.024);
                gain.gain.setValueAtTime(0.08, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.024);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.025);
            } else if (type === 'open') {
                osc.frequency.setValueAtTime(360, t);
                osc.frequency.exponentialRampToValueAtTime(740, t + 0.06);
                gain.gain.setValueAtTime(0.07, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.065);
            } else if (type === 'close') {
                osc.frequency.setValueAtTime(680, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
                gain.gain.setValueAtTime(0.06, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.055);
            }
        } catch (_) {}
    }

    const AI_SERVICES = {
        gemini: { name: 'Google Gemini', url: 'https://gemini.google.com' },
        chatgpt: { name: 'ChatGPT (OpenAI)', url: 'https://chatgpt.com' },
        claude: { name: 'Claude 3.5 Sonnet', url: 'https://claude.ai' }
    };

    const PERF_TIERS = {
        0: { badge: 'Якість', desc: 'Максимальна якість: соковиті розмиття, м\'який Motion Blur та 3D-глибина (як зараз)' },
        1: { badge: 'Баланс', desc: 'Для слабких пристроїв: легкі розмиття, без зуму фону, стабільні 60 FPS' },
        2: { badge: 'Макс. FPS', desc: 'Для дуже слабких пристроїв: без важких розмиття та тіней, прискорений інтерфейс' }
    };

    function readStoredSettings() {
        const defaults = {
            perfLevel: 0,
            motionBlurStrength: 3.0,
            tiltMode: true,
            hapticMode: true,
            timerDisplay: true,
            accentColor: 'purple',
            customAccentHex: '#c058ff',
            aiService: 'gemini',
            scheduleView: 'bells',
            animPreset: 'cinematic',
            soundFx: true,
            auraStyle: 'dynamic',
            fastSwitch: false
        };

        try {
            const raw = localStorage.getItem('nextgen_settings_v2');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    if (typeof parsed.motionBlurStrength === 'number') {
                        parsed.motionBlurStrength = Math.max(0, Math.min(7, parsed.motionBlurStrength));
                    }
                    if (parsed.auraStyle && !AURA_DESCS[parsed.auraStyle]) {
                        parsed.auraStyle = 'dynamic';
                    }
                    if (parsed.animPreset && !ANIM_PRESETS[parsed.animPreset]) {
                        parsed.animPreset = 'cinematic';
                    }
                    return Object.assign({}, defaults, parsed);
                }
            }
        } catch (_) {}

        try {
            const pLvl = localStorage.getItem('nextgen_perf_level');
            if (pLvl !== null) defaults.perfLevel = Math.max(0, Math.min(2, parseInt(pLvl, 10) || 0));
            else if (localStorage.getItem('nextgen_perf_mode') === 'true') defaults.perfLevel = 1;

            const bStr = parseFloat(localStorage.getItem('nextgen_blur_strength'));
            if (!isNaN(bStr) && bStr >= 0 && bStr <= 7) defaults.motionBlurStrength = bStr;

            const tMode = localStorage.getItem('nextgen_tilt_mode');
            if (tMode !== null) defaults.tiltMode = tMode === 'true';

            const hMode = localStorage.getItem('nextgen_haptic_mode');
            if (hMode !== null) defaults.hapticMode = hMode === 'true';

            const tmDisplay = localStorage.getItem('nextgen_timer_display');
            if (tmDisplay !== null) defaults.timerDisplay = tmDisplay === 'true';

            const accCol = localStorage.getItem('nextgen_accent_color');
            if (accCol && (ACCENT_PALETTE[accCol] || accCol === 'custom')) defaults.accentColor = accCol;

            const cHex = localStorage.getItem('nextgen_custom_hex');
            if (cHex) defaults.customAccentHex = cHex;

            const aiServ = localStorage.getItem('nextgen_ai_service');
            if (aiServ && AI_SERVICES[aiServ]) defaults.aiService = aiServ;

            const sView = localStorage.getItem('nextgen_schedule_view');
            if (sView === 'bells' || sView === 'lessons') defaults.scheduleView = sView;

            const aPreset = localStorage.getItem('nextgen_anim_preset');
            if (aPreset && ANIM_PRESETS[aPreset]) defaults.animPreset = aPreset;

            const sFx = localStorage.getItem('nextgen_sound_fx');
            if (sFx !== null) defaults.soundFx = sFx === 'true';

            const aura = localStorage.getItem('nextgen_aura_style');
            if (aura && AURA_DESCS[aura]) defaults.auraStyle = aura;
            else defaults.auraStyle = 'dynamic';

            const fsMode = localStorage.getItem('nextgen_fast_switch');
            if (fsMode !== null) defaults.fastSwitch = fsMode === 'true';
        } catch (_) {}

        return defaults;
    }

    window.settingsState = readStoredSettings();

    let persistTimer = null;
    function persistSettings(immediate = false) {
        if (immediate) {
            doPersist();
            return;
        }
        if (persistTimer) clearTimeout(persistTimer);
        persistTimer = setTimeout(doPersist, 120);
    }

    function doPersist() {
        try {
            localStorage.setItem('nextgen_settings_v2', JSON.stringify(window.settingsState));
            localStorage.setItem('nextgen_perf_level', String(window.settingsState.perfLevel));
            localStorage.setItem('nextgen_perf_mode', window.settingsState.perfLevel > 0 ? 'true' : 'false');
            localStorage.setItem('nextgen_blur_strength', window.settingsState.motionBlurStrength.toFixed(1));
            localStorage.setItem('nextgen_tilt_mode', String(window.settingsState.tiltMode));
            localStorage.setItem('nextgen_haptic_mode', String(window.settingsState.hapticMode));
            localStorage.setItem('nextgen_timer_display', String(window.settingsState.timerDisplay));
            localStorage.setItem('nextgen_accent_color', window.settingsState.accentColor);
            localStorage.setItem('nextgen_custom_hex', window.settingsState.customAccentHex || '#c058ff');
            localStorage.setItem('nextgen_ai_service', window.settingsState.aiService);
            localStorage.setItem('nextgen_schedule_view', window.settingsState.scheduleView || 'bells');
            localStorage.setItem('nextgen_anim_preset', window.settingsState.animPreset || 'cinematic');
            localStorage.setItem('nextgen_sound_fx', String(window.settingsState.soundFx));
            localStorage.setItem('nextgen_aura_style', window.settingsState.auraStyle || 'dynamic');
            localStorage.setItem('nextgen_fast_switch', String(window.settingsState.fastSwitch));
        } catch (_) {}
    }

    // Instant CSS injection upon launch
    const initialConfig = getAccentConfig(window.settingsState);
    const initialAura = getAuraConfig(window.settingsState);
    document.documentElement.style.setProperty('--purple-accent', initialConfig.accent);
    document.documentElement.style.setProperty('--purple-glow', initialConfig.glow);
    document.documentElement.style.setProperty('--accent-contrast-text', initialConfig.contrast);
    document.documentElement.style.setProperty('--aura-glow-1', initialAura.glow1);
    document.documentElement.style.setProperty('--aura-glow-2', initialAura.glow2);
    document.documentElement.style.setProperty('--hero-reflection-color', initialAura.reflection);
    document.documentElement.style.setProperty('--motion-blur-val', `${window.settingsState.motionBlurStrength}px`);
    document.body.setAttribute('data-perf-level', String(window.settingsState.perfLevel));
    document.body.classList.toggle('perf-mode', window.settingsState.perfLevel > 0);
    document.body.setAttribute('data-aura', window.settingsState.auraStyle || 'dynamic');

    // ==========================================================================
    // 1. LENIS SMOOTH SCROLL (STUDIO FREIGHT / DARKROOM ENGINEERING)
    // ==========================================================================
    let lenis = null;
    const mainContent = document.getElementById('mainContent') || document.querySelector('.main-content');
    let currentScrollBlur = 0;
    let lastNativeScrollY = window.scrollY || 0;
    let lastNativeScrollTime = performance.now();
    let nativeVelocity = 0;

    window.addEventListener('scroll', () => {
        const now = performance.now();
        const dt = Math.max(8, now - lastNativeScrollTime);
        const dy = (window.scrollY || 0) - lastNativeScrollY;
        lastNativeScrollY = window.scrollY || 0;
        lastNativeScrollTime = now;
        nativeVelocity = (dy / dt) * 16.6;
    }, { passive: true });

    function updateScrollMotionBlur() {
        if (!mainContent) return;
        const isMobileDevice = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        const isQuality = !isMobileDevice && (window.settingsState?.perfLevel ?? 0) === 0;
        if (!isQuality || modalState !== 'closed') {
            if (currentScrollBlur !== 0) {
                currentScrollBlur = 0;
                mainContent.style.filter = '';
            }
            return;
        }

        const vel = lenis ? Math.abs(lenis.velocity || 0) : Math.abs(nativeVelocity);
        if (!lenis) nativeVelocity *= 0.88;

        if (vel < 0.8) {
            if (currentScrollBlur !== 0) {
                currentScrollBlur = 0;
                mainContent.style.filter = '';
            }
            return;
        }

        const strength = window.settingsState?.motionBlurStrength ?? 3.0;
        if (strength <= 0) {
            if (currentScrollBlur !== 0) {
                currentScrollBlur = 0;
                mainContent.style.filter = '';
            }
            return;
        }
        const targetBlur = Math.min(4.5, (vel / 2.5) * (strength / 3.0));
        currentScrollBlur += (targetBlur - currentScrollBlur) * 0.35;

        if (currentScrollBlur > 0.5) {
            mainContent.style.filter = `blur(${currentScrollBlur.toFixed(1)}px)`;
        } else if (currentScrollBlur !== 0) {
            currentScrollBlur = 0;
            mainContent.style.filter = '';
        }
    }

    try {
        if (typeof Lenis !== 'undefined') {
            const isMobileDevice = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
            lenis = new Lenis({
                duration: isMobileDevice ? 0.7 : 1.15,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1.0,
                touchMultiplier: 1.0,
                syncTouch: false,
                infinite: false
            });

            window.lenis = lenis;

            function lenisRaf(time) {
                lenis.raf(time);
                updateScrollMotionBlur();
                requestAnimationFrame(lenisRaf);
            }
            requestAnimationFrame(lenisRaf);
        } else {
            function nativeScrollRaf() {
                updateScrollMotionBlur();
                requestAnimationFrame(nativeScrollRaf);
            }
            requestAnimationFrame(nativeScrollRaf);
        }
    } catch (e) {
        console.warn('Lenis smooth scroll init failed:', e);
    }

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

    // ==========================================================================
    // DYNAMIC ISLAND FLUID DROPLET ANIMATION ENGINE FOR NAV MODALS
    // (Розклад, Калькулятор, ІІ, Тривога)
    // ==========================================================================
    let navModalTransitionId = 0;
    let activeNavModalTimer = null;

    function openDynamicIslandModal(backdrop, container, triggerTab) {
        if (!backdrop || !container) return;

        const thisTransition = ++navModalTransitionId;
        if (activeNavModalTimer) {
            clearTimeout(activeNavModalTimer);
            activeNavModalTimer = null;
        }

        // Cancel previous animations on all nav modal containers
        const allNavContainers = document.querySelectorAll('.schedule-modal-container, .calc-modal-container, .alarm-modal-container, .ai-modal-container');
        allNavContainers.forEach(c => {
            c.getAnimations().forEach(a => a.cancel());
            Array.from(c.children).forEach(child => child.getAnimations().forEach(a => a.cancel()));
        });

        // Close any other open backdrops immediately
        const otherBackdrops = [scheduleModalBackdrop, calcModalBackdrop, alarmModalBackdrop, aiModalBackdrop, settingsModalBackdrop, modalBackdrop];
        otherBackdrops.forEach(b => {
            if (b && b !== backdrop && b.classList.contains('is-open')) {
                b.classList.remove('is-open', 'is-closing');
                b.setAttribute('aria-hidden', 'true');
            }
        });

        window.lenis?.stop();

        playTapticAudio('open');
        if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
            try { navigator.vibrate(10); } catch (_) {}
        }

        backdrop.classList.remove('is-closing');
        backdrop.classList.add('is-open');
        backdrop.setAttribute('aria-hidden', 'false');

        // Measure live screen geometry
        const tab = triggerTab || document.querySelector('.nav-capsule');
        const tabRect = tab ? tab.getBoundingClientRect() : { left: window.innerWidth / 2 - 50, top: 20, width: 100, height: 36 };
        const targetRect = container.getBoundingClientRect();

        const tabCenterX = tabRect.left + tabRect.width / 2;
        const tabCenterY = tabRect.top + tabRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const dx = tabCenterX - targetCenterX;
        const dy = tabCenterY - targetCenterY;
        const sx = Math.max(0.08, tabRect.width / targetRect.width);
        const sy = Math.max(0.04, tabRect.height / targetRect.height);

        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        const targetRadius = isMobile ? 22 : 26;

        const hasMotionBlur = !isMobile && (window.settingsState?.perfLevel ?? 0) === 0 && (window.settingsState?.motionBlurStrength ?? 0) > 0;
        const blurStrength = window.settingsState?.motionBlurStrength ?? 3.0;
        const peakBlur = blurStrength * 2.0;

        // CINEMATIC APPLE SPRING BLOOM (2 keyframes, zero hitch, authentic elastic micro-overshoot)
        const dropletKeyframes = [
            {
                transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
                borderRadius: '24px',
                opacity: 0.65,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 rgba(192, 88, 255, 0)',
                offset: 0
            },
            {
                transform: 'translate3d(0, 0, 0) scale(1, 1)',
                borderRadius: `${targetRadius}px`,
                opacity: 1,
                boxShadow: '0 32px 80px -12px rgba(0, 0, 0, 0.75), 0 0 45px var(--purple-glow, rgba(192, 88, 255, 0.35))',
                offset: 1
            }
        ];

        const curPreset = ANIM_PRESETS[window.settingsState?.animPreset] || ANIM_PRESETS.cinematic;
        const duration = isMobile ? curPreset.openMobileDur : curPreset.openDur;
        const easing = curPreset.openEase;

        const anim = container.animate(dropletKeyframes, { duration, easing, fill: 'forwards' });

        // Soft Cinema Motion Blur Track
        if (hasMotionBlur) {
            container.animate([
                { filter: 'blur(0px)' },
                { filter: `blur(${peakBlur.toFixed(1)}px)`, offset: 0.32 },
                { filter: 'blur(0px)', offset: 1 }
            ], { duration, easing: 'ease-out' });
        }

        // STAGGERED CINEMATIC CONTENT CASCADE
        const header = container.querySelector('.schedule-modal-header, .calc-modal-header, .alarm-modal-header, .ai-modal-header');
        const body = container.querySelector('.schedule-modal-body, .calc-body, .alarm-modal-body, .ai-modal-body, .calc-result-area, .ai-modal-frame-wrap');

        if (header) {
            header.animate([
                { opacity: 0, transform: 'translate3d(0, -12px, 0) scale(0.97)', offset: 0 },
                { opacity: 0, transform: 'translate3d(0, -10px, 0) scale(0.97)', offset: 0.15 },
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', offset: 1 }
            ], { duration: Math.round(duration * 0.88), easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)', fill: 'forwards' });
        }

        if (body) {
            body.animate([
                { opacity: 0, transform: 'translate3d(0, 16px, 0) scale(0.96)', offset: 0 },
                { opacity: 0, transform: 'translate3d(0, 14px, 0) scale(0.96)', offset: 0.22 },
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', offset: 1 }
            ], { duration: Math.round(duration * 0.92), easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)', fill: 'forwards' });
        }

        Array.from(container.children).forEach(child => {
            if (child !== header && child !== body) {
                child.animate([
                    { opacity: 0, transform: 'scale(0.96)', offset: 0 },
                    { opacity: 1, transform: 'scale(1)', offset: 1 }
                ], { duration: Math.round(duration * 0.82), easing: 'ease-out', fill: 'forwards' });
            }
        });

        anim.onfinish = () => {
            if (thisTransition === navModalTransitionId) {
                container.style.transform = 'none';
            }
        };
    }

    function closeDynamicIslandModal(backdrop, container, triggerTab, onFinish) {
        if (!backdrop || !container || !backdrop.classList.contains('is-open')) return;

        const thisTransition = ++navModalTransitionId;
        if (activeNavModalTimer) {
            clearTimeout(activeNavModalTimer);
            activeNavModalTimer = null;
        }

        playTapticAudio('close');
        container.getAnimations().forEach(a => a.cancel());
        Array.from(container.children).forEach(child => child.getAnimations().forEach(a => a.cancel()));

        // Release pointer events immediately so clicks during closing pass straight to buttons
        backdrop.classList.add('is-closing');

        const tab = triggerTab || document.querySelector('.nav-capsule');
        const tabRect = tab ? tab.getBoundingClientRect() : { left: window.innerWidth / 2 - 50, top: 20, width: 100, height: 36 };
        const targetRect = container.getBoundingClientRect();

        const tabCenterX = tabRect.left + tabRect.width / 2;
        const tabCenterY = tabRect.top + tabRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const dx = tabCenterX - targetCenterX;
        const dy = tabCenterY - targetCenterY;
        const sx = Math.max(0.08, tabRect.width / targetRect.width);
        const sy = Math.max(0.04, tabRect.height / targetRect.height);

        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        const curPreset = ANIM_PRESETS[window.settingsState?.animPreset] || ANIM_PRESETS.cinematic;
        const duration = isMobile ? curPreset.closeMobileDur : curPreset.closeDur;
        const easing = curPreset.closeEase;

        const hasMotionBlur = !isMobile && (window.settingsState?.perfLevel ?? 0) === 0 && (window.settingsState?.motionBlurStrength ?? 0) > 0;
        const blurStrength = window.settingsState?.motionBlurStrength ?? 3.0;

        // Fluid Dynamic Island Droplet Retraction
        // 3-phase physics: subtle vertical suction tension -> smooth acceleration -> absorption into capsule
        const shrinkKeyframes = [
            {
                transform: 'translate3d(0, 0, 0) scale(1, 1)',
                borderRadius: `${isMobile ? 22 : 26}px`,
                opacity: 1,
                boxShadow: '0 32px 80px -12px rgba(0, 0, 0, 0.75), 0 0 45px var(--purple-glow, rgba(192, 88, 255, 0.35))',
                offset: 0
            },
            {
                transform: `translate3d(${(dx * 0.12).toFixed(1)}px, ${(dy * 0.15).toFixed(1)}px, 0) scale(0.96, 0.97)`,
                borderRadius: `${isMobile ? 24 : 26}px`,
                opacity: 0.95,
                boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.6), 0 0 20px var(--purple-glow, rgba(192, 88, 255, 0.2))',
                offset: 0.28
            },
            {
                transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
                borderRadius: '24px',
                opacity: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 rgba(0, 0, 0, 0)',
                offset: 1
            }
        ];

        const anim = container.animate(shrinkKeyframes, { duration, easing, fill: 'forwards' });

        if (hasMotionBlur) {
            container.animate([
                { filter: 'blur(0px)' },
                { filter: `blur(${(blurStrength * 1.5).toFixed(1)}px)`, offset: 0.35 },
                { filter: 'blur(0px)', offset: 1 }
            ], { duration, easing: 'ease-out' });
        }

        // Staggered smooth upward dissolution of inner content in sync with retraction
        const header = container.querySelector('.schedule-modal-header, .calc-modal-header, .alarm-modal-header, .ai-modal-header');
        const body = container.querySelector('.schedule-modal-body, .calc-body, .alarm-modal-body, .ai-modal-body, .calc-result-area, .ai-modal-frame-wrap');
        const contentDur = Math.round(duration * 0.78);

        if (header) {
            header.animate([
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
                { opacity: 0, transform: 'translate3d(0, -10px, 0) scale(0.96)' }
            ], { duration: contentDur, easing: 'cubic-bezier(0.32, 0, 0.15, 1)', fill: 'forwards' });
        }

        if (body) {
            body.animate([
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
                { opacity: 0, transform: 'translate3d(0, -8px, 0) scale(0.95)' }
            ], { duration: contentDur, easing: 'cubic-bezier(0.32, 0, 0.15, 1)', fill: 'forwards' });
        }

        Array.from(container.children).forEach(child => {
            if (child !== header && child !== body) {
                child.animate([
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(0.95)' }
                ], { duration: contentDur, easing: 'cubic-bezier(0.32, 0, 0.15, 1)', fill: 'forwards' });
            }
        });

        let finished = false;
        const finish = () => {
            if (finished || thisTransition !== navModalTransitionId) return;
            finished = true;
            activeNavModalTimer = null;
            backdrop.classList.remove('is-open', 'is-closing');
            backdrop.setAttribute('aria-hidden', 'true');
            container.style.transform = 'none';
            window.lenis?.start();
            if (typeof onFinish === 'function') onFinish();
        };

        anim.onfinish = finish;
        activeNavModalTimer = setTimeout(finish, duration + 20);
    }

    function closeAllModals() {
        navModalTransitionId++;
        if (activeNavModalTimer) {
            clearTimeout(activeNavModalTimer);
            activeNavModalTimer = null;
        }
        const modalConfigs = [
            { id: 'scheduleModalBackdrop', contId: 'scheduleModalContainer' },
            { id: 'calcModalBackdrop', contId: 'calcModalContainer' },
            { id: 'alarmModalBackdrop', contId: 'alarmModalContainer' },
            { id: 'aiModalBackdrop', contId: 'aiModalContainer' },
            { id: 'settingsModalBackdrop', contId: 'settingsModalContainer' },
            { id: 'splitModalBackdrop', contId: 'splitModalContainer' },
            { id: 'modalBackdrop', contId: 'modalContainer' }
        ];
        modalConfigs.forEach(({ id, contId }) => {
            const el = document.getElementById(id);
            if (el && el.classList.contains('is-open')) {
                el.classList.remove('is-open', 'is-closing');
                el.setAttribute('aria-hidden', 'true');
                const cont = document.getElementById(contId);
                if (cont) {
                    cont.getAnimations().forEach(a => a.cancel());
                    cont.style.transform = 'none';
                    Array.from(cont.children).forEach(child => child.getAnimations().forEach(a => a.cancel()));
                }
            }
        });
        window.lenis?.start();
    }

    const scheduleModalContainer = document.getElementById('scheduleModalContainer');

    function openScheduleModal() {
        if (!scheduleModalBackdrop || !scheduleModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="schedule"]');
        openDynamicIslandModal(scheduleModalBackdrop, scheduleModalContainer, tab);
    }

    function closeScheduleModal() {
        if (!scheduleModalBackdrop || !scheduleModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="schedule"]');
        const gdzTab = document.querySelector('.nav-tab[data-tab="gdz"]');
        if (gdzTab) selectTab(gdzTab, false);
        closeDynamicIslandModal(scheduleModalBackdrop, scheduleModalContainer, tab);
    }

    function switchScheduleView(view, direction = null) {
        const isCurrentBells = segBtnBells?.classList.contains('active');
        const currentView = isCurrentBells ? 'bells' : 'lessons';

        if (view === 'bells') {
            if (segBtnBells) { segBtnBells.classList.add('active'); segBtnBells.setAttribute('aria-selected', 'true'); }
            if (segBtnLessons) { segBtnLessons.classList.remove('active'); segBtnLessons.setAttribute('aria-selected', 'false'); }
        } else {
            if (segBtnLessons) { segBtnLessons.classList.add('active'); segBtnLessons.setAttribute('aria-selected', 'true'); }
            if (segBtnBells) { segBtnBells.classList.remove('active'); segBtnBells.setAttribute('aria-selected', 'false'); }
        }

        if (window.settingsState) {
            window.settingsState.scheduleView = view;
            persistSettings();
        }

        if (currentView === view && direction === null) return;

        const isGoingToLessons = view === 'lessons';
        const effectiveDir = direction || (isGoingToLessons ? 'left' : 'right');
        const outgoing = isGoingToLessons ? wrapBells : wrapLessons;
        const incoming = isGoingToLessons ? wrapLessons : wrapBells;

        if (outgoing && incoming && outgoing !== incoming && outgoing.classList.contains('active')) {
            const outX = effectiveDir === 'left' ? -65 : 65;
            const inX = effectiveDir === 'left' ? 65 : -65;

            outgoing.getAnimations().forEach(a => a.cancel());
            incoming.getAnimations().forEach(a => a.cancel());

            outgoing.style.position = 'absolute';
            outgoing.style.top = '16px';
            outgoing.style.left = '16px';
            outgoing.style.right = '16px';
            outgoing.style.width = 'calc(100% - 32px)';
            outgoing.style.pointerEvents = 'none';

            incoming.style.position = 'relative';
            incoming.style.display = 'flex';
            incoming.classList.add('active');
            incoming.style.pointerEvents = 'auto';

            outgoing.animate([
                { transform: 'translateX(0px)', opacity: 1 },
                { transform: `translateX(${outX}px)`, opacity: 0 }
            ], { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }).onfinish = () => {
                outgoing.classList.remove('active');
                outgoing.style.display = 'none';
                outgoing.style.position = '';
                outgoing.style.top = '';
                outgoing.style.left = '';
                outgoing.style.right = '';
                outgoing.style.width = '';
                outgoing.style.pointerEvents = '';
            };

            incoming.animate([
                { transform: `translateX(${inX}px)`, opacity: 0 },
                { transform: 'translateX(0px)', opacity: 1 }
            ], { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }).onfinish = () => {
                incoming.style.transform = 'none';
            };
        } else {
            if (wrapBells) {
                wrapBells.classList.toggle('active', view === 'bells');
                wrapBells.style.display = view === 'bells' ? 'flex' : 'none';
                wrapBells.style.transform = 'none';
                wrapBells.style.opacity = '1';
            }
            if (wrapLessons) {
                wrapLessons.classList.toggle('active', view === 'lessons');
                wrapLessons.style.display = view === 'lessons' ? 'flex' : 'none';
                wrapLessons.style.transform = 'none';
                wrapLessons.style.opacity = '1';
            }
        }
    }

    // Restore saved schedule view
    switchScheduleView(window.settingsState?.scheduleView || 'bells');

    if (segBtnBells && segBtnLessons) {
        segBtnBells.addEventListener('click', () => switchScheduleView('bells', 'right'));
        segBtnLessons.addEventListener('click', () => switchScheduleView('lessons', 'left'));
    }

    // Touch Swipe Gesture for switching schedule view (Swipe Left = Lessons, Swipe Right = Bells)
    const scheduleViewerEl = document.getElementById('scheduleImageViewer');
    if (scheduleViewerEl) {
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwiping = false;

        scheduleViewerEl.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            const isZoomed = scheduleViewerEl.querySelector('.schedule-view-img.is-zoomed');
            if (isZoomed) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwiping = true;
        }, { passive: true });

        scheduleViewerEl.addEventListener('touchend', (e) => {
            if (!isSwiping || e.changedTouches.length === 0) return;
            isSwiping = false;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;

            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
                if (deltaX < 0) {
                    switchScheduleView('lessons', 'left');
                    if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
                        try { navigator.vibrate(12); } catch (_) {}
                    }
                } else {
                    switchScheduleView('bells', 'right');
                    if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
                        try { navigator.vibrate(12); } catch (_) {}
                    }
                }
            }
        }, { passive: true });

        scheduleViewerEl.addEventListener('touchcancel', () => {
            isSwiping = false;
        }, { passive: true });
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

    // Air Raid Alarm Modal Controls
    const alarmModalBackdrop = document.getElementById('alarmModalBackdrop');
    const alarmModalContainer = document.getElementById('alarmModalContainer');
    const alarmModalCloseBtn = document.getElementById('alarmModalCloseBtn');

    function openAlarmModal() {
        if (!alarmModalBackdrop || !alarmModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="alarm"]');
        openDynamicIslandModal(alarmModalBackdrop, alarmModalContainer, tab);
    }

    function closeAlarmModal() {
        if (!alarmModalBackdrop || !alarmModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="alarm"]');
        const gdzTab = document.querySelector('.nav-tab[data-tab="gdz"]');
        if (gdzTab) selectTab(gdzTab, false);
        closeDynamicIslandModal(alarmModalBackdrop, alarmModalContainer, tab);
    }

    if (alarmModalCloseBtn) {
        alarmModalCloseBtn.addEventListener('click', closeAlarmModal);
    }

    if (alarmModalBackdrop) {
        alarmModalBackdrop.addEventListener('click', (e) => {
            if (e.target === alarmModalBackdrop) {
                closeAlarmModal();
            }
        });
    }

    // AI Assistant Modal Controls (Live Embedded Iframe)
    const aiModalBackdrop = document.getElementById('aiModalBackdrop');
    const aiModalContainer = document.getElementById('aiModalContainer');
    const aiModalCloseBtn = document.getElementById('aiModalCloseBtn');
    const aiQuickSelector = document.getElementById('aiQuickSelector');

    function openAiModal() {
        if (!aiModalBackdrop || !aiModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="ai"]');
        openDynamicIslandModal(aiModalBackdrop, aiModalContainer, tab);
    }

    function closeAiModal() {
        if (!aiModalBackdrop || !aiModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="ai"]');
        const gdzTab = document.querySelector('.nav-tab[data-tab="gdz"]');
        if (gdzTab) selectTab(gdzTab, false);
        closeDynamicIslandModal(aiModalBackdrop, aiModalContainer, tab);
    }

    if (aiModalCloseBtn) {
        aiModalCloseBtn.addEventListener('click', closeAiModal);
    }

    if (aiModalBackdrop) {
        aiModalBackdrop.addEventListener('click', (e) => {
            if (e.target === aiModalBackdrop) {
                closeAiModal();
            }
        });
    }

    if (aiQuickSelector) {
        aiQuickSelector.addEventListener('change', (e) => {
            if (typeof setAiService === 'function') {
                setAiService(e.target.value);
            }
        });
    }

    // ==========================================================================
    // COLUMN CALCULATOR MODAL
    // ==========================================================================
    const calcModalBackdrop = document.getElementById('calcModalBackdrop');
    const calcModalContainer = document.getElementById('calcModalContainer');
    const calcModalCloseBtn = document.getElementById('calcModalCloseBtn');
    const calcSolveBtn = document.getElementById('calcSolveBtn');
    const calcNum1 = document.getElementById('calcNum1');
    const calcNum2 = document.getElementById('calcNum2');
    const calcResultArea = document.getElementById('calcResultArea');
    const calcOpBtns = document.querySelectorAll('.calc-op-btn');
    let calcOp = '+';

    function openCalcModal() {
        if (!calcModalBackdrop || !calcModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="calc"]');
        openDynamicIslandModal(calcModalBackdrop, calcModalContainer, tab);
        if (calcNum1 && window.innerWidth > 768) setTimeout(() => calcNum1.focus(), 250);
    }

    function closeCalcModal() {
        if (!calcModalBackdrop || !calcModalContainer) return;
        const tab = document.querySelector('.nav-tab[data-tab="calc"]');
        const gdzTab = document.querySelector('.nav-tab[data-tab="gdz"]');
        if (gdzTab) selectTab(gdzTab, false);
        closeDynamicIslandModal(calcModalBackdrop, calcModalContainer, tab);
    }

    calcOpBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            calcOpBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            calcOp = btn.getAttribute('data-op');
            if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
                try { navigator.vibrate(8); } catch (_) {}
            }
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

    // Allow only numbers, minus, dot, comma in inputs + Enter key to solve
    [calcNum1, calcNum2].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', () => {
            let val = inp.value.replace(/[^0-9.,-]/g, '').replace(',', '.');
            const parts = val.split('.');
            if (parts.length > 2) {
                val = parts[0] + '.' + parts.slice(1).join('');
            }
            if (val.indexOf('-') > 0) {
                val = (val.startsWith('-') ? '-' : '') + val.replace(/-/g, '');
            }
            inp.value = val;
        });

        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                inp.blur();
                if (calcSolveBtn) calcSolveBtn.click();
            }
        });
    });

    function parseCalcNum(str) {
        if (!str) return NaN;
        return parseFloat(str.replace(',', '.'));
    }

    // ---- Column arithmetic renderers ----

    function padLeft(str, len) {
        let s = String(str);
        while (s.length < len) s = ' ' + s;
        return s;
    }

    function renderAddSub(a, b, op) {
        const isAdd = op === '+';
        const sign = isAdd ? '+' : '−';
        const rawResult = isAdd ? a + b : a - b;
        // Clean floating point micro-inaccuracies (0.1 + 0.2 = 0.3)
        const result = parseFloat(rawResult.toFixed(10));

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
        const rawResult = a * b;
        const result = parseFloat(rawResult.toFixed(10));
        const absA = Math.abs(a);
        const absB = Math.abs(b);
        const isNeg = (a < 0) !== (b < 0);

        // Check if numbers have decimals
        const aDec = (String(absA).split('.')[1] || '').length;
        const bDec = (String(absB).split('.')[1] || '').length;
        const totalDec = aDec + bDec;

        // Integer scaling for classical column multiplication
        const intA = Math.round(absA * Math.pow(10, aDec));
        const intB = Math.round(absB * Math.pow(10, bDec));

        const aDisplay = String(absA);
        const bDisplay = String(absB);
        const intBStr = String(intB);

        const partials = [];
        for (let i = intBStr.length - 1; i >= 0; i--) {
            const digit = parseInt(intBStr[i], 10);
            const partial = intA * digit;
            const shift = intBStr.length - 1 - i;
            partials.push({ value: partial, shift });
        }

        const maxLen = Math.max(
            aDisplay.length,
            bDisplay.length,
            String(Math.abs(result)).length,
            ...partials.map(p => String(p.value).length + p.shift)
        ) + 2;

        let html = '<div class="calc-column-work">';
        html += `<div class="calc-row">${padLeft(aDisplay, maxLen)}</div>`;
        html += `<div class="calc-row"><span class="calc-op-sign">×</span>${padLeft(bDisplay, maxLen - 2)}</div>`;
        html += '<div class="calc-line"></div>';

        if (intBStr.length === 1) {
            html += `<div class="calc-row calc-result-row">${padLeft((isNeg ? '-' : '') + String(Math.abs(result)), maxLen)}</div>`;
        } else {
            partials.forEach((p) => {
                const pStr = String(p.value) + '0'.repeat(p.shift);
                html += `<div class="calc-row">${padLeft(pStr, maxLen)}</div>`;
            });

            if (partials.length > 1) {
                html += '<div class="calc-line"></div>';
                html += `<div class="calc-row calc-result-row">${padLeft((isNeg ? '-' : '') + String(Math.abs(result)), maxLen)}</div>`;
            }
        }

        html += '</div>';
        if (totalDec > 0) {
            html += `<div class="calc-final-answer">Відповідь: <strong>${result}</strong> (відокремлено знаків: <strong>${totalDec}</strong>)</div>`;
        } else {
            html += `<div class="calc-final-answer">Відповідь: <strong>${result}</strong></div>`;
        }
        return html;
    }

    function renderDivision(a, b) {
        if (b === 0) {
            return '<div class="calc-final-answer">На нуль ділити не можна!</div>';
        }

        const rawResult = a / b;
        const result = parseFloat(rawResult.toFixed(10));
        const isInteger = Number.isInteger(result);
        const absA = Math.abs(a);
        const absB = Math.abs(b);
        const isNeg = (a < 0) !== (b < 0);

        // Scale decimals to integers if needed
        const aDec = (String(absA).split('.')[1] || '').length;
        const bDec = (String(absB).split('.')[1] || '').length;
        const maxDec = Math.max(aDec, bDec);
        const scale = Math.pow(10, maxDec);
        const intA = Math.round(absA * scale);
        const intB = Math.round(absB * scale);

        const aStr = String(intA);
        const steps = [];
        let remainder = 0;
        let quotient = '';
        let started = false;

        for (let i = 0; i < aStr.length; i++) {
            remainder = remainder * 10 + parseInt(aStr[i], 10);
            const q = Math.floor(remainder / intB);
            if (q > 0 || started) {
                started = true;
                quotient += q;
            } else {
                quotient += '0';
            }
            steps.push({ dividend: remainder, quotientDigit: q, remainder: remainder - q * intB });
            remainder = remainder - q * intB;
        }

        quotient = quotient.replace(/^0+/, '') || '0';

        let html = '<div class="calc-column-work">';
        html += `<div class="calc-row" style="justify-content:flex-start"><span style="margin-right:12px">${absA}</span>│<span style="margin-left:6px; border-bottom:2px solid rgba(255,255,255,0.5); padding-bottom:2px">${absB}</span></div>`;
        
        let indent = 0;
        steps.forEach((step, idx) => {
            if (step.quotientDigit > 0 || idx > 0) {
                const sub = step.quotientDigit * intB;
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
            html += `<div class="calc-final-answer">Відповідь: <strong>${isNeg ? '-' : ''}${result}</strong></div>`;
        } else {
            html += `<div class="calc-final-answer">Відповідь: <strong>${isNeg ? '-' : ''}${result}</strong> (округлено: <strong>${(Math.round(result * 10000) / 10000)}</strong>)</div>`;
        }
        return html;
    }

    if (calcSolveBtn) {
        calcSolveBtn.addEventListener('click', () => {
            if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
                try { navigator.vibrate(10); } catch (_) {}
            }
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

    let toastTimer = null;
    function showToast(message, icon = '💬') {
        const toast = document.getElementById('glassToast');
        const toastMsg = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        if (!toast) return;
        if (toastMsg) toastMsg.textContent = message;
        if (toastIcon) toastIcon.textContent = icon;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2600);
    }

    function selectTab(tab, triggerAction = true) {
        playTapticAudio('click');
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        springX.setTarget(tab.offsetLeft);
        springY.setTarget(tab.offsetTop);
        springW.setTarget(tab.offsetWidth);
        springH.setTarget(tab.offsetHeight);
        startNavAnim();

        if (window.innerWidth <= 768 && typeof tab.scrollIntoView === 'function') {
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        if (triggerAction) {
            const tabType = tab.getAttribute('data-tab');
            if (tabType === 'schedule') {
                if (scheduleModalBackdrop && scheduleModalBackdrop.classList.contains('is-open') && !scheduleModalBackdrop.classList.contains('is-closing')) {
                    closeScheduleModal();
                } else {
                    openScheduleModal();
                }
            } else if (tabType === 'calc') {
                if (calcModalBackdrop && calcModalBackdrop.classList.contains('is-open') && !calcModalBackdrop.classList.contains('is-closing')) {
                    closeCalcModal();
                } else {
                    openCalcModal();
                }
            } else if (tabType === 'ai') {
                if (aiModalBackdrop && aiModalBackdrop.classList.contains('is-open') && !aiModalBackdrop.classList.contains('is-closing')) {
                    closeAiModal();
                } else {
                    openAiModal();
                }
            } else if (tabType === 'alarm') {
                if (alarmModalBackdrop && alarmModalBackdrop.classList.contains('is-open') && !alarmModalBackdrop.classList.contains('is-closing')) {
                    closeAlarmModal();
                } else {
                    openAlarmModal();
                }
            } else if (tabType === 'gdz') {
                closeAllModals();
                if ((window.scrollY || window.pageYOffset || 0) > 20) {
                    if (window.lenis) {
                        window.lenis.scrollTo(0, { duration: 0.35 });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
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
        let lastRelX = null, lastRelY = null;

        function animCard() {
            if (window.settingsState && (!window.settingsState.tiltMode || window.settingsState.perfLevel === 2)) {
                card.style.transform = '';
                cAnim = null;
                return;
            }
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
            if (hovered && lastRelX !== null) {
                card.style.setProperty('--mouse-x', `${lastRelX}px`);
                card.style.setProperty('--mouse-y', `${lastRelY}px`);
                lastRelX = null;
                lastRelY = null;
            }
            cAnim = requestAnimationFrame(animCard);
        }

        let cardRect = null;

        card.addEventListener('mouseenter', () => {
            cardRect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(pointer: coarse)').matches) return;
            if (window.settingsState && (!window.settingsState.tiltMode || window.settingsState.perfLevel === 2)) return;
            if (!cardRect) cardRect = card.getBoundingClientRect();
            const relX = e.clientX - cardRect.left;
            const relY = e.clientY - cardRect.top;
            lastRelX = relX;
            lastRelY = relY;
            tgtRX = ((relY - cardRect.height / 2) / (cardRect.height / 2)) * -7;
            tgtRY = ((relX - cardRect.width / 2) / (cardRect.width / 2)) * 7;
            hovered = true;
            if (!cAnim) cAnim = requestAnimationFrame(animCard);
        });

        card.addEventListener('mouseleave', () => {
            hovered = false;
            cardRect = null;
            lastRelX = null;
            lastRelY = null;
            tgtRX = 0; tgtRY = 0;
            card.style.removeProperty('--mouse-x');
            card.style.removeProperty('--mouse-y');
        });

        // Tactile touch & scale-down with haptic impulse
        let cardTouchStartX = 0;
        let cardTouchStartY = 0;
        card.addEventListener('pointerdown', (e) => {
            cardTouchStartX = e.clientX;
            cardTouchStartY = e.clientY;
            card._isCardScrolling = false;
            card.classList.add('is-pressed');
            if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
                try { navigator.vibrate(8); } catch (_) {}
            }
        });
        card.addEventListener('pointermove', (e) => {
            const dist = Math.hypot(e.clientX - cardTouchStartX, e.clientY - cardTouchStartY);
            if (dist > 8) {
                card._isCardScrolling = true;
                card.classList.remove('is-pressed');
            }
        });
        const releaseCardPress = () => card.classList.remove('is-pressed');
        card.addEventListener('pointerup', releaseCardPress);
        card.addEventListener('pointercancel', releaseCardPress);
        card.addEventListener('pointerleave', releaseCardPress);

        card.addEventListener('click', (e) => {
            if (card._isCardScrolling) {
                card._isCardScrolling = false;
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }
            if (card.classList.contains('is-no-book')) return;
            if (card.classList.contains('is-dual-card')) return;

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
    const modalLaunchScheduleHeader = document.getElementById('modalLaunchScheduleHeader');
    const modalLaunchLessonNum = document.getElementById('modalLaunchLessonNum');
    const modalLaunchLessonTime = document.getElementById('modalLaunchLessonTime');
    const modalLaunchIconBox = document.getElementById('modalLaunchIconBox');
    const modalLaunchIconPlaceholder = document.getElementById('modalLaunchIconPlaceholder');
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
            book: "https://pidruchnyk.com.ua/2895-angliiska-mova-stairing-8-klas.html",
            image: "assets/books/english.jpg",
            gdz: [
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/901-english-8-styring.html" },
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/3251-hdz-anhliiska-mova-8-klas-stairih.html" }
            ]
        },
        "Українська література": {
            title: "ГДЗ Українська література",
            shortTitle: "УКРАЇНСЬКА ЛІТЕРАТУРА",
            book: "https://pidruchnyk.com.ua/2962-ukrainska-literatura-avramenko-8-klas-2025.html",
            image: "assets/books/ukr_lit.jpg",
            gdz: [
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/2780-hdz-ukrainska-literatura-8-klas-avramenko.html" },
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/906-ukrlit-8-klas-avramenko.html" }
            ]
        },
        "Зарубіжна література": {
            title: "ГДЗ Зарубіжна література",
            shortTitle: "ЗАРУБІЖНА ЛІТЕРАТУРА",
            book: "https://pidruchnyk.com.ua/2991-zarubizhna-literatura-nikolenko-8-klas-2025.html",
            image: "assets/books/world_lit.jpg",
            gdz: [
                { name: "ГДЗ ШКОЛАИНЮА", url: "https://shkola.in.ua/3270-hdz-zarubizhna-literatura-8-klas-nikolenko.html" },
                { name: "ГДЗОНЛАЙН", url: "https://gdzonline.net/905-zarubizhna-8-nikolenko.html" }
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
        "Фізкультура": {
            title: "Фізкультура",
            shortTitle: "ФІЗКУЛЬТУРА",
            book: "#",
            image: null,
            gdz: []
        },
        "Фізична культура": {
            title: "Фізкультура",
            shortTitle: "ФІЗКУЛЬТУРА",
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
    modalState = 'closed';
    let transitionId = 0;
    let modalAnimation = null;
    let contentAnimation = null;
    let chromeAnimation = null;
    let launchViewAnimation = null;
    let homeBarAnimation = null;
    let cardReturnAnimation = null;
    let launchTimer = null;

    // Apple signature spring curves
    let launchEasing = 'cubic-bezier(0.32, 0.72, 0, 1)';
    let closeEasing = 'cubic-bezier(0.32, 0.72, 0, 1)';

    function getCardUnscaledRect(card) {
        if (!card) return null;
        let left = 0, top = 0, curr = card;
        while (curr) {
            left += curr.offsetLeft || 0;
            top += curr.offsetTop || 0;
            curr = curr.offsetParent;
        }
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        const scrollX = window.scrollX || window.pageXOffset || 0;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        return {
            left: left - scrollX,
            top: top - scrollY,
            width,
            height,
            right: (left - scrollX) + width,
            bottom: (top - scrollY) + height
        };
    }

    function syncModalLaunchDetails(card, overrideTitle) {
        if (!card) return;
        const fullTitle = overrideTitle || card.getAttribute('data-title') || '';
        const subject = fullTitle.replace(/^ГДЗ\s*/i, '').trim();
        const subjectData = SUBJECTS_DB[subject];

        // 1. Title
        if (modalLaunchTitle) {
            modalLaunchTitle.textContent = subjectData ? subjectData.title : fullTitle;
        }
        // 2. Schedule header badges (exact match with card)
        const schedHeader = card.querySelector('.card-schedule-header');
        if (schedHeader && modalLaunchScheduleHeader) {
            modalLaunchScheduleHeader.style.display = 'flex';
            const numEl = schedHeader.querySelector('.lesson-num-badge');
            const timeEl = schedHeader.querySelector('.lesson-time-badge');
            if (numEl && modalLaunchLessonNum) {
                modalLaunchLessonNum.textContent = numEl.textContent;
                modalLaunchLessonNum.className = numEl.className;
            }
            if (timeEl && modalLaunchLessonTime) {
                modalLaunchLessonTime.textContent = timeEl.textContent;
            }
        } else if (modalLaunchScheduleHeader) {
            modalLaunchScheduleHeader.style.display = 'none';
        }
        // 3. Media: cover image or SVG icon
        if (subjectData && subjectData.image) {
            if (modalLaunchCoverBox && modalLaunchCoverImg) {
                modalLaunchCoverImg.src = subjectData.image;
                modalLaunchCoverBox.style.display = 'flex';
            }
            if (modalLaunchIconBox) modalLaunchIconBox.style.display = 'none';
        } else {
            const cardImg = card.querySelector('.card-cover-img');
            const cardIcon = card.querySelector('.card-icon-placeholder');
            if (cardImg && modalLaunchCoverBox && modalLaunchCoverImg) {
                modalLaunchCoverImg.src = cardImg.src;
                modalLaunchCoverBox.style.display = 'flex';
                if (modalLaunchIconBox) modalLaunchIconBox.style.display = 'none';
            } else if (cardIcon && modalLaunchIconBox && modalLaunchIconPlaceholder) {
                modalLaunchIconPlaceholder.innerHTML = cardIcon.innerHTML;
                modalLaunchIconBox.style.display = 'flex';
                if (modalLaunchCoverBox) modalLaunchCoverBox.style.display = 'none';
            }
        }
    }

    function rectFrame(rect, radius, opacity) {
        const frame = {
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            borderRadius: `${radius}px`
        };
        if (typeof opacity === 'number') frame.opacity = opacity;
        return frame;
    }

    function interpolateRect(r1, r2, progress) {
        return {
            left: r1.left + (r2.left - r1.left) * progress,
            top: r1.top + (r2.top - r1.top) * progress,
            width: r1.width + (r2.width - r1.width) * progress,
            height: r1.height + (r2.height - r1.height) * progress,
            radius: 22 + ((r2.radius || 28) - 22) * progress
        };
    }

    function getModalRestRect() {
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        const isMobile = vpW <= 768;

        const padX = isMobile ? 24 : (vpW <= 1024 ? 36 : 64);
        const padY = isMobile ? 32 : 64;

        const targetW = isMobile ? Math.min(360, vpW - padX) : Math.min(876, vpW - padX);
        const targetH = isMobile ? Math.min(480, vpH - padY) : Math.min(447, vpH - padY);

        const left = Math.round((vpW - targetW) / 2);
        const top = Math.round((vpH - targetH) / 2);

        return {
            left,
            top,
            width: targetW,
            height: targetH,
            right: left + targetW,
            bottom: top + targetH,
            radius: isMobile ? 24 : 28
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
            borderRadius: `${radius}px`,
            zIndex: '10'
        });
    }
    function spawnClosingClone(closingCard, currentRect, computedRadius) {
        if (!closingCard || !modalBackdrop || !modalContainer || !currentRect || currentRect.width < 10 || currentRect.height < 10) {
            if (closingCard) {
                closingCard.classList.remove('is-opening', 'is-returning');
                closingCard.style.opacity = '1';
                closingCard.style.visibility = 'visible';
            }
            return null;
        }

        // Clean up older clones if any so screen stays clean
        const activeClones = document.querySelectorAll('.modal-closing-clone');
        if (activeClones.length >= 2) {
            activeClones[0]._restoreCard?.();
            activeClones[0].remove();
        }

        let targetRect = closingCard.getBoundingClientRect();
        if (!targetRect || targetRect.width < 10) {
            targetRect = getCardUnscaledRect(closingCard);
        }
        if (!targetRect && originRect && originRect.width > 0 && originRect.height > 0) {
            const dX = (window.scrollX || window.pageXOffset || 0) - (originScrollX || 0);
            const dY = (window.scrollY || window.pageYOffset || 0) - (originScrollY || 0);
            targetRect = {
                left: originRect.left - dX,
                top: originRect.top - dY,
                width: originRect.width,
                height: originRect.height,
                right: originRect.right - dX,
                bottom: originRect.bottom - dY
            };
        }
        if (!targetRect) {
            targetRect = currentRect;
        }

        // Ensure launch view has closingCard details before cloning
        syncModalLaunchDetails(closingCard);

        const clone = modalContainer.cloneNode(true);
        clone.classList.add('modal-closing-clone');
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        Object.assign(clone.style, {
            position: 'fixed',
            left: `${currentRect.left}px`,
            top: `${currentRect.top}px`,
            width: `${currentRect.width}px`,
            height: `${currentRect.height}px`,
            borderRadius: `${computedRadius}px`,
            margin: '0',
            zIndex: '2',
            pointerEvents: 'none',
            transform: 'none',
            transformOrigin: 'center center'
        });

        const cloneLaunchView = clone.querySelector('.modal-launch-view');
        const cloneContent = clone.querySelector('.modal-content-wrapper');
        const cloneCloseBtn = clone.querySelector('.modal-close-btn');
        const cloneHomeBar = clone.querySelector('.modal-home-bar-zone');

        if (cloneLaunchView) {
            cloneLaunchView.style.display = 'flex';
            cloneLaunchView.style.opacity = '1';
            cloneLaunchView.style.zIndex = '5';
        }
        if (cloneContent) {
            cloneContent.style.zIndex = '1';
        }

        modalBackdrop.insertBefore(clone, modalContainer);

        const isMobileDevice = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        const preset = ANIM_PRESETS[window.settingsState?.animPreset] || ANIM_PRESETS.cinematic;
        const baseCloseDur = window.settingsState?.perfLevel === 2 ? 110 : (isMobileDevice ? preset.closeMobileDur : preset.closeDur);
        const restRect = modalRestRect || getModalRestRect();
        const totalDist = Math.hypot(restRect.left - targetRect.left, restRect.top - targetRect.top) || 1;
        const curDist = Math.hypot(currentRect.left - targetRect.left, currentRect.top - targetRect.top);
        const distRatio = Math.min(1, Math.max(0.72, curDist / totalDist));
        const cloneDuration = Math.round(baseCloseDur * distRatio);
        const cloneEasing = preset.closeEase;

        const cloneAnim = clone.animate([
            { ...rectFrame(currentRect, computedRadius, 1), offset: 0 },
            { ...rectFrame(targetRect, isMobileDevice ? 20 : 22, 1), offset: 1 }
        ], { duration: cloneDuration, easing: cloneEasing, fill: 'forwards' });

        // Smoothly dissolve clone into the background card so it never sits as a sharp box on top of the blur
        clone.animate([
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.45 },
            { opacity: 0, offset: 1 }
        ], { duration: cloneDuration, easing: 'ease-out', fill: 'forwards' });

        // Soft Cinema Motion Blur Track on closing clone
        const hasMotionBlur = !isMobileDevice && (window.settingsState?.perfLevel ?? 0) === 0 && (window.settingsState?.motionBlurStrength ?? 0) > 0;
        const blurStrength = window.settingsState?.motionBlurStrength ?? 3.0;
        const peakBlur = blurStrength * 2.0;

        if (hasMotionBlur && peakBlur > 0.5) {
            clone.animate([
                { filter: 'blur(0px)' },
                { filter: `blur(${peakBlur.toFixed(1)}px)`, offset: 0.35 },
                { filter: 'blur(0px)', offset: 1 }
            ], { duration: cloneDuration, easing: 'ease-out' });
        }

        // Smooth crossfades for content inside clone
        const xfadeDur = Math.min(180, Math.round(cloneDuration * 0.6));

        if (cloneContent) {
            cloneContent.animate([
                { opacity: parseFloat(getComputedStyle(cloneContent).opacity) || 1 },
                { opacity: 0 }
            ], { duration: xfadeDur, easing: 'ease-out', fill: 'forwards' });
        }
        if (cloneLaunchView) {
            cloneLaunchView.animate([
                { opacity: parseFloat(getComputedStyle(cloneLaunchView).opacity) || 0 },
                { opacity: 1 }
            ], { duration: xfadeDur, easing: cloneEasing, fill: 'forwards' });
        }
        if (cloneCloseBtn) {
            cloneCloseBtn.animate([
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.8)' }
            ], { duration: Math.min(100, cloneDuration), easing: 'ease-out', fill: 'forwards' });
        }
        if (cloneHomeBar) {
            cloneHomeBar.animate([
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.8)' }
            ], { duration: Math.min(100, cloneDuration), easing: 'ease-out', fill: 'forwards' });
        }

        // Keep closingCard hidden during early flight, then smoothly crossfade in as clone dissolves
        closingCard.classList.remove('is-returning');
        closingCard.classList.add('is-opening');
        closingCard.style.opacity = '0';
        closingCard.animate([
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.40 },
            { opacity: 1, offset: 1 }
        ], { duration: cloneDuration, easing: 'ease-out', fill: 'forwards' });

        let restored = false;
        const restoreCard = () => {
            if (restored) return;
            restored = true;
            if (closingCard && closingCard !== originCard) {
                closingCard.classList.remove('is-opening', 'is-returning');
                closingCard.style.opacity = '1';
                closingCard.style.visibility = 'visible';
                closingCard.style.pointerEvents = '';
                closingCard.style.removeProperty('--mouse-x');
                closingCard.style.removeProperty('--mouse-y');
            }
            try { clone.remove(); } catch (_) {}
            // If modal was closed completely and this was the last clone, ensure backdrop is hidden
            if (modalState === 'closed' && document.querySelectorAll('.modal-closing-clone').length <= 1) {
                modalBackdrop.classList.remove('is-open', 'is-closing');
                appContainer.classList.remove('modal-open', 'modal-closing');
                modalBackdrop.setAttribute('aria-hidden', 'true');
                window.lenis?.start();
            }
        };

        clone._targetCard = closingCard;
        clone._restoreCard = restoreCard;
        cloneAnim.onfinish = restoreCard;
        setTimeout(restoreCard, cloneDuration + 60);

        return clone;
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
    }

    function openModal(card, overrideDbTitle) {
        if (!modalBackdrop || !modalContainer) return;
        if (card && card.classList && card.classList.contains('is-no-book')) return;

        // If clicking the same card that is already open or currently launching, do nothing
        if (card === originCard && ['opening', 'open'].includes(modalState)) {
            return;
        }

        // Haptic touch impulse
        if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
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
            const launchDuration = 320;

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

        // Clean up any existing closing clone for this card, but if one matches this card, capture its mid-air position!
        let startFromCloneRect = null;
        let startFromCloneRadius = null;
        document.querySelectorAll('.modal-closing-clone').forEach(existingClone => {
            if (existingClone._targetCard === card) {
                const r = existingClone.getBoundingClientRect();
                if (r.width > 30 && r.height > 30) {
                    startFromCloneRect = {
                        left: r.left,
                        top: r.top,
                        width: r.width,
                        height: r.height,
                        right: r.right,
                        bottom: r.bottom
                    };
                    startFromCloneRadius = parseFloat(getComputedStyle(existingClone).borderRadius) || 22;
                }
                if (existingClone._restoreCard) existingClone._restoreCard();
                existingClone.remove();
            } else if (existingClone._targetCard !== originCard) {
                if (existingClone._restoreCard) existingClone._restoreCard();
                existingClone.remove();
            }
        });

        // If another card is already open, opening, or closing, cleanly hand off to the new card
        if (modalState !== 'closed') {
            transitionId++;
            if (originCard && originCard !== card) {
                const currentModalRect = modalContainer.getBoundingClientRect();
                const computedModalRadius = parseFloat(getComputedStyle(modalContainer).borderRadius) || 24;
                spawnClosingClone(originCard, currentModalRect, computedModalRadius);
            }
            clearModalAnimation();
            modalBackdrop.classList.remove('is-closing');
            appContainer.classList.remove('modal-closing');
            originCard = null;
            originRect = null;
            modalState = 'closed';
        }

        function populateModalContent(targetCard, overrideTitle) {
            const fullTitle = overrideTitle || targetCard.getAttribute('data-title') || '';
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
            const hasValidBook = !!(subjectData.book && subjectData.book !== '#' && subjectData.book.startsWith('http'));
            if (modalBookLinkBtn) {
                modalBookLinkBtn.href = hasValidBook ? subjectData.book : '#';
                modalBookLinkBtn.style.display = hasValidBook ? 'flex' : 'none';
            }
            if (modalBookPreviewLink) {
                if (hasValidBook) {
                    modalBookPreviewLink.href = subjectData.book;
                    modalBookPreviewLink.style.pointerEvents = '';
                    modalBookPreviewLink.removeAttribute('aria-disabled');
                    modalBookPreviewLink.title = 'Натисніть, щоб відкрити підручник';
                } else {
                    modalBookPreviewLink.removeAttribute('href');
                    modalBookPreviewLink.style.pointerEvents = 'none';
                    modalBookPreviewLink.setAttribute('aria-disabled', 'true');
                    modalBookPreviewLink.title = 'Підручник відсутній для цього предмета';
                }
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

        populateModalContent(card, overrideDbTitle);

        card.classList.remove('is-pressed');
        originCard = card;
        originRect = (startFromCloneRect && startFromCloneRect.width > 30) ? startFromCloneRect : (getCardUnscaledRect(card) || card.getBoundingClientRect());
        syncModalLaunchDetails(card, overrideDbTitle);
        card.classList.add('is-opening');
        card.style.opacity = '0';
        originScrollX = window.scrollX || window.pageXOffset || 0;
        originScrollY = window.scrollY || window.pageYOffset || 0;
        modalState = 'opening';
        const thisTransition = ++transitionId;

        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        const initialRadius = startFromCloneRadius || (isMobile ? 20 : 22);

        modalBackdrop.classList.add('is-open');
        appContainer.classList.add('modal-open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        window.lenis?.stop();
        clearModalAnimation();
        modalContainer.style.visibility = 'visible';
        modalContainer.style.opacity = '1';

        modalRestRect = getModalRestRect();

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

        playTapticAudio('open');
        const curPreset = ANIM_PRESETS[window.settingsState?.animPreset] || ANIM_PRESETS.cinematic;
        const launchDuration = window.settingsState?.perfLevel === 2 ? 140 : (isMobile ? curPreset.openMobileDur : curPreset.openDur);
        launchEasing = curPreset.openEase;
        closeEasing = curPreset.closeEase;
        const hasMotionBlur = !isMobile && (window.settingsState?.perfLevel ?? 0) === 0;
        const blurStrength = window.settingsState?.motionBlurStrength ?? 3.0;
        const peakBlur = blurStrength * 2.2;
        const midBlur = blurStrength * 0.7;

        pinModalToRect(originRect, initialRadius);
        const launchKeyframes = [
            { ...rectFrame(originRect, initialRadius, 1), offset: 0 },
            { ...rectFrame(modalRestRect, modalRestRect.radius || (isMobile ? 24 : 28)), offset: 1 }
        ];

        launch = modalContainer.animate(launchKeyframes, { duration: launchDuration, easing: launchEasing, fill: 'forwards' });

        if (hasMotionBlur) {
            modalContainer.animate([
                { filter: 'blur(0px)' },
                { filter: `blur(${peakBlur.toFixed(1)}px)`, offset: 0.35 },
                { filter: 'blur(0px)', offset: 1 }
            ], { duration: launchDuration, easing: 'ease-out' });
        }

        // 2. Launch Screen Crossfade into active content
        const launchViewLaunch = modalLaunchView?.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: Math.min(180, Math.round(launchDuration * 0.5)), delay: Math.round(launchDuration * 0.1), easing: 'ease-out', fill: 'forwards' });

        const contentDelay = Math.round(launchDuration * 0.18);
        const contentDuration = Math.round(launchDuration * 0.82);
        const contentLaunch = modalContent?.animate([
            { opacity: 0, transform: 'scale(0.95) translateY(6px)' },
            { opacity: 0, transform: 'scale(0.96) translateY(4px)', offset: 0.28 },
            { opacity: 1, transform: 'scale(1) translateY(0)', offset: 1 }
        ], { duration: contentDuration, delay: contentDelay, easing: launchEasing, fill: 'forwards' });

        const chromeDelay = Math.round(launchDuration * 0.22);
        const chromeDuration = Math.round(launchDuration * 0.78);
        const chromeLaunch = modalCloseBtn?.animate([
            { opacity: 0, transform: 'scale(0.75)' },
            { opacity: 1, transform: 'scale(1)' }
        ], { duration: chromeDuration, delay: chromeDelay, easing: launchEasing, fill: 'forwards' });

        const homeBarLaunch = modalHomeBarZone?.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: chromeDuration, delay: chromeDelay, easing: launchEasing, fill: 'forwards' });

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
                modalContainer.style.transform = 'none';
                modalContainer.style.transformOrigin = '';
                modalContainer.style.filter = '';
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
                if (originCard) {
                    originCard.classList.add('is-opening');
                    originCard.style.opacity = '0';
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

        playTapticAudio('close');
        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        const curPreset = ANIM_PRESETS[window.settingsState?.animPreset] || ANIM_PRESETS.cinematic;
        const closeDuration = window.settingsState?.perfLevel === 2 ? 110 : (isMobile ? curPreset.closeMobileDur : curPreset.closeDur);
        closeEasing = curPreset.closeEase;
        modalBackdrop.style.setProperty('--close-duration', `${closeDuration}ms`);

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
            modalContainer.style.transform = 'none';
            modalContainer.style.transformOrigin = '';
            modalContainer.style.filter = '';
            modalContainer.style.opacity = '';
            clearModalAnimation();

            const hasActiveClones = document.querySelectorAll('.modal-closing-clone').length > 0;
            if (!hasActiveClones) {
                modalBackdrop.classList.remove('is-closing');
                modalBackdrop.classList.remove('is-open');
                appContainer.classList.remove('modal-closing');
                appContainer.classList.remove('modal-open');
                modalBackdrop.style.opacity = '';
                modalBackdrop.style.removeProperty('--close-duration');
                appContainer.style.transform = '';
                modalBackdrop.setAttribute('aria-hidden', 'true');
                window.lenis?.start();
            } else {
                modalBackdrop.classList.remove('is-closing');
                appContainer.classList.remove('modal-closing');
            }

            // Ensure exact scroll position remains untouched (fallback if browser shifted)
            if (typeof originScrollY === 'number' && Math.abs((window.scrollY || window.pageYOffset || 0) - originScrollY) > 2) {
                window.scrollTo(originScrollX || 0, originScrollY);
            }

            // Reset any scroll velocity so motion blur never spuriously triggers after close
            nativeVelocity = 0;
            lastNativeScrollY = window.scrollY || 0;
            lastNativeScrollTime = performance.now();
            currentScrollBlur = 0;
            if (mainContent) mainContent.style.filter = '';
            if (window.lenis) window.lenis.velocity = 0;

            if (originCard) {
                const landingCard = originCard;
                landingCard.classList.remove('is-opening', 'is-returning');
                landingCard.style.opacity = '1';
                landingCard.style.visibility = 'visible';
                landingCard.style.pointerEvents = '';
                landingCard.style.removeProperty('--mouse-x');
                landingCard.style.removeProperty('--mouse-y');
            }
            originCard = null;
            originRect = null;
            modalState = 'closed';
        };

        const currentRect = modalContainer.getBoundingClientRect();
        const computedBorderRadius = parseFloat(getComputedStyle(modalContainer).borderRadius) || (modalRestRect?.radius || 28);

        // Sync launch view with origin card (schedule badges, icon/cover, title)
        syncModalLaunchDetails(originCard);

        // Calculate the true unscaled target rectangle of the card
        let targetRect = getCardUnscaledRect(originCard);
        if (!targetRect && originRect && originRect.width > 0 && originRect.height > 0) {
            const currentScrollX = window.scrollX || window.pageXOffset || 0;
            const currentScrollY = window.scrollY || window.pageYOffset || 0;
            const scrollDeltaX = currentScrollX - (originScrollX || 0);
            const scrollDeltaY = currentScrollY - (originScrollY || 0);
            targetRect = {
                left: originRect.left - scrollDeltaX,
                top: originRect.top - scrollDeltaY,
                width: originRect.width,
                height: originRect.height,
                right: originRect.right - scrollDeltaX,
                bottom: originRect.bottom - scrollDeltaY
            };
        }
        if (!targetRect) {
            targetRect = modalRestRect || getModalRestRect();
        }

        // Reset any inline transform from drag gesture before WAAPI frame animation begins
        modalContainer.style.transform = 'none';
        pinModalToRect(currentRect, computedBorderRadius);

        modalContainer.getAnimations().forEach(a => a.cancel());
        modalContent?.getAnimations().forEach(a => a.cancel());
        modalCloseBtn?.getAnimations().forEach(a => a.cancel());
        modalLaunchView?.getAnimations().forEach(a => a.cancel());
        modalHomeBarZone?.getAnimations().forEach(a => a.cancel());

        const hasMotionBlur = !isMobile && (window.settingsState?.perfLevel ?? 0) === 0;
        const blurStrength = window.settingsState?.motionBlurStrength ?? 3.0;
        const peakBlur = blurStrength * 2.0;

        // Pure single-curve ease-out flight from currentRect to targetRect (no intermediate stalls or squash)
        const closeKeyframes = [
            { ...rectFrame(currentRect, computedBorderRadius), offset: 0 },
            { ...rectFrame(targetRect, isMobile ? 20 : 22), offset: 1 }
        ];

        const close = modalContainer.animate(closeKeyframes, { duration: closeDuration, easing: closeEasing, fill: 'forwards' });

        // Seamless dissolve: fade modal container into originCard over the final 30% of flight
        modalContainer.animate([
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.70 },
            { opacity: 0, offset: 1 }
        ], { duration: closeDuration, easing: 'ease-in', fill: 'forwards' });

        // Concurrently fade originCard smoothly in underneath to prevent any sudden brightness snap or pop on landing
        if (originCard) {
            cardReturnAnimation = originCard.animate([
                { opacity: 0, offset: 0 },
                { opacity: 0, offset: 0.60 },
                { opacity: 1, offset: 1 }
            ], { duration: closeDuration, easing: 'ease-out', fill: 'forwards' });
        }

        // Run soft motion blur independently on its own animation track so geometry curve stays completely smooth
        if (hasMotionBlur) {
            modalContainer.animate([
                { filter: 'blur(0px)' },
                { filter: `blur(${peakBlur.toFixed(1)}px)`, offset: 0.35 },
                { filter: 'blur(0px)', offset: 1 }
            ], { duration: closeDuration, easing: 'ease-out' });
        }

        // Smooth visual crossfade between open content and launch view (180ms smooth dissolve)
        const crossfadeDuration = Math.min(180, closeDuration);

        const contentClose = modalContent?.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: crossfadeDuration, easing: 'ease-out', fill: 'forwards' });

        const launchViewClose = modalLaunchView?.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], { duration: crossfadeDuration, easing: closeEasing, fill: 'forwards' });

        const chromeClose = modalCloseBtn?.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' }
        ], { duration: Math.min(100, closeDuration), easing: 'ease-out', fill: 'forwards' });

        const homeBarClose = modalHomeBarZone?.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' }
        ], { duration: Math.min(100, closeDuration), easing: 'ease-out', fill: 'forwards' });

        modalAnimation = close;
        contentAnimation = contentClose || null;
        chromeAnimation = chromeClose || null;
        launchViewAnimation = launchViewClose || null;
        homeBarAnimation = homeBarClose || null;
        close.onfinish = finishClose;
        setTimeout(finishClose, closeDuration + 15);
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
        if (!fromHomeBar && e.target.closest('a, button, input, select, .modal-options-column, .book-preview-card, .calc-body, .settings-modal-body, .schedule-image-viewer')) return;

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

        if (fromHomeBar && e.pointerId !== undefined && modalHomeBarZone && modalHomeBarZone.setPointerCapture) {
            try { modalHomeBarZone.setPointerCapture(e.pointerId); } catch (_) {}
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

        const isMobileDevice = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        if (!isMobileDevice && (!window.settingsState || !window.settingsState.perfMode)) {
            const bgScale = 0.94 + progress * 0.06;
            appContainer.style.transform = `scale(${bgScale.toFixed(3)}) translateY(${((1 - progress) * 4).toFixed(1)}px)`;
        }
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
    if (modalHomeBarZone) {
        modalHomeBarZone.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            handleDragStart(e, true);
        });
    }

    if (modalContainer) {
        modalContainer.addEventListener('pointerdown', (e) => {
            if (e.target.closest('#modalHomeBarZone')) return;
            if (e.target.closest('.modal-content-wrapper, .modal-options-column, .book-preview-card, a, button, input, select')) return;
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
            // Close button inside modalContainer
            if (e.target.closest && e.target.closest('#modalCloseBtn')) {
                e.stopPropagation();
                closeModal();
                return;
            }

            // Click is outside modalContainer (backdrop, background cards, etc.)
            if (modalContainer && !modalContainer.contains(e.target)) {
                // If fastSwitch is turned off OR modal is already open:
                // Any click outside simply closes the modal!
                if (!window.settingsState?.fastSwitch || modalState === 'open') {
                    e.stopPropagation();
                    e.preventDefault();
                    closeModal();
                    return;
                }

                // If fastSwitch is enabled and user clicked during opening transition:
                if (['opening', 'closing'].includes(modalState)) {
                    if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
                        const elements = document.elementsFromPoint(e.clientX, e.clientY);
                        let clickedCard = null;
                        let clickedPill = null;

                        for (const el of elements) {
                            if (el === modalBackdrop || el === modalContainer || modalContainer.contains(el)) continue;
                            if (el.classList?.contains('modal-closing-clone') || el.closest('.modal-closing-clone')) continue;

                            const pill = el.closest('.card-split-pill.has-book');
                            if (pill) {
                                clickedPill = pill;
                                break;
                            }

                            const cardEl = el.closest('.liquid-card');
                            if (cardEl) {
                                clickedCard = cardEl;
                                break;
                            }
                        }

                        if (clickedPill) {
                            const parentCard = clickedPill.closest('.liquid-card');
                            const dbTitle = clickedPill.getAttribute('data-dbtitle');
                            if (parentCard && dbTitle) {
                                e.stopPropagation();
                                e.preventDefault();
                                playTapticAudio('open');
                                openModal(parentCard, dbTitle);
                                return;
                            }
                        }

                        if (clickedCard) {
                            // If user tapped the same card that is currently launching, let it finish opening
                            if (clickedCard === originCard) {
                                e.stopPropagation();
                                e.preventDefault();
                                return;
                            }

                            if (!clickedCard.classList.contains('is-no-book')) {
                                e.stopPropagation();
                                e.preventDefault();

                                if (clickedCard.classList.contains('is-dual-card')) {
                                    closeModal();
                                    clickedCard.click();
                                    return;
                                }

                                const r = clickedCard.getBoundingClientRect();
                                const ripple = document.createElement('span');
                                ripple.classList.add('ripple');
                                const sz = Math.max(r.width, r.height) * 1.3;
                                ripple.style.width = ripple.style.height = `${sz}px`;
                                ripple.style.left = `${e.clientX - r.left - sz / 2}px`;
                                ripple.style.top = `${e.clientY - r.top - sz / 2}px`;
                                clickedCard.appendChild(ripple);
                                setTimeout(() => ripple.remove(), 550);

                                playTapticAudio('open');
                                openModal(clickedCard);
                                return;
                            }
                        }
                    }

                    // If user clicked the dark backdrop outside any card
                    e.stopPropagation();
                    closeModal();
                    return;
                }
            }
        }, true);
        modalBackdrop.addEventListener('touchmove', (e) => {
            const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
            if (isMobile && ['open', 'opening', 'closing'].includes(modalState) && e.target === modalBackdrop) {
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
            if (typeof closeSplitSubjectModal === 'function' && splitModalBackdrop && splitModalBackdrop.classList.contains('is-open')) {
                closeSplitSubjectModal();
            } else if (typeof closeSettingsModal === 'function' && settingsModalBackdrop && settingsModalBackdrop.classList.contains('is-open')) {
                closeSettingsModal();
            } else if (modalBackdrop && modalBackdrop.classList.contains('is-open')) {
                closeModal();
            } else if (scheduleModalBackdrop && scheduleModalBackdrop.classList.contains('is-open')) {
                closeScheduleModal();
            } else if (calcModalBackdrop && calcModalBackdrop.classList.contains('is-open')) {
                closeCalcModal();
            } else if (aiModalBackdrop && aiModalBackdrop.classList.contains('is-open')) {
                closeAiModal();
            } else if (alarmModalBackdrop && alarmModalBackdrop.classList.contains('is-open')) {
                closeAlarmModal();
            }
        }
    });

    window.addEventListener('resize', () => {
        if (modalState === 'open' && modalContainer && typeof getModalRestRect === 'function' && typeof pinModalToRect === 'function') {
            modalRestRect = getModalRestRect();
            pinModalToRect(modalRestRect, modalRestRect.radius);
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
                { num: 3, name: "Фізкультура", time: "09:55 - 10:40", dbTitle: "Фізкультура", icon: "sport" },
                { num: 4, name: "Історія України", time: "10:50 - 11:35", dbTitle: "ГДЗ Історія України", image: "assets/books/ukr_history.jpg" },
                { num: 5, name: "Англійська мова", time: "11:40 - 12:25", dbTitle: "ГДЗ Англійська мова", image: "assets/books/english.jpg" },
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
                { num: 7, name: "Фізкультура", time: "13:20 - 14:05", dbTitle: "Фізкультура", icon: "sport" }
            ]
        },
        // Середа (7 уроків, 08:00 - 14:05)
        3: {
            name: "СЕРЕДА",
            lessons: [
                { num: 1, name: "Фізкультура", time: "08:00 - 08:45", dbTitle: "Фізкультура", icon: "sport" },
                { num: 2, name: "Інформатика", time: "08:55 - 09:40", dbTitle: "ГДЗ Інформатика", icon: "info" },
                { num: 3, name: "Фізика", time: "09:55 - 10:40", dbTitle: "ГДЗ Фізика", image: "assets/books/physics.jpg" },
                { num: 4, name: "Англійська мова", time: "10:50 - 11:35", dbTitle: "ГДЗ Англійська мова", image: "assets/books/english.jpg" },
                { num: 5, name: "Геометрія", time: "11:40 - 12:25", dbTitle: "ГДЗ Геометрія", image: "assets/books/geometry.jpg" },
                { num: 6, name: "Українська література", time: "12:30 - 13:15", dbTitle: "ГДЗ Українська література", image: "assets/books/ukr_lit.jpg" },
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
                { num: 1, name: "Англійська мова", time: "08:00 - 08:45", dbTitle: "ГДЗ Англійська мова", image: "assets/books/english.jpg" },
                { num: 2, name: "Українська мова", time: "08:55 - 09:40", dbTitle: "ГДЗ Українська мова", image: "assets/books/ukr_mova.jpg" },
                { num: 3, name: "Зарубіжна література", time: "09:55 - 10:40", dbTitle: "ГДЗ Зарубіжна література", image: "assets/books/world_lit.jpg" },
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

    const DUAL_SUBJECTS_MAP = {
        "Інформатика / Укр.літ": {
            title: "5 УРОК: Інформатика / Укр.літ",
            subtitle: "Цей урок поділено на підгрупи. Оберіть потрібний предмет:",
            options: [
                {
                    name: "Українська література",
                    shortName: "Укр.літ",
                    dbTitle: "ГДЗ Українська література",
                    hasBook: true,
                    image: "assets/books/ukr_lit.jpg",
                    desc: "Підручник О. Авраменко • 2 ГДЗ"
                },
                {
                    name: "Інформатика",
                    shortName: "Інформатика",
                    dbTitle: null,
                    hasBook: false,
                    icon: "info",
                    desc: "Підручник відсутній"
                }
            ]
        },
        "Алгебра / Геометрія": {
            title: "6 УРОК: Алгебра / Геометрія",
            subtitle: "Оберіть, який підручник або ГДЗ відкрити:",
            options: [
                {
                    name: "Алгебра",
                    shortName: "Алгебра",
                    dbTitle: "ГДЗ Алгебра",
                    hasBook: true,
                    image: "assets/books/algebra.jpg",
                    desc: "Підручник О. Істер • 3 ГДЗ"
                },
                {
                    name: "Геометрія",
                    shortName: "Геометрія",
                    dbTitle: "ГДЗ Геометрія",
                    hasBook: true,
                    image: "assets/books/geometry.jpg",
                    desc: "Підручник О. Істер • 3 ГДЗ"
                }
            ]
        },
        "ЗБД / Підприємництво": {
            title: "7 УРОК: ЗБД / Підприємництво",
            subtitle: "Оберіть, який підручник або ГДЗ відкрити:",
            options: [
                {
                    name: "Здоров'я, безпека та добробут",
                    shortName: "ЗБД",
                    dbTitle: "ГДЗ Здоров'я, безпека та добробут",
                    hasBook: true,
                    image: "assets/books/health.jpg",
                    desc: "Підручник Т. Воронцова • 1 ГДЗ"
                },
                {
                    name: "Підприємництво та фінансова грамотність",
                    shortName: "Підприємництво",
                    dbTitle: "ГДЗ Підприємництво і фінансова грамотність",
                    hasBook: true,
                    image: "assets/books/entrepreneurship.jpg",
                    desc: "Підручник Т. Гільберг"
                }
            ]
        }
    };

    function isNoBookLesson(lesson) {
        if (!lesson) return false;
        const name = (lesson.name || '').trim().toLowerCase();
        if (name.includes('/')) return false; // Dual lessons handled via split picker
        return (
            name === 'технології' ||
            name === 'інформатика' ||
            name === 'фізкультура' ||
            name.includes('технологі') ||
            name.includes('інформатик') ||
            name.includes('фізкультур') ||
            name.includes('фізичн') ||
            name.includes('мистецтв')
        );
    }

    const splitModalBackdrop = document.getElementById('splitModalBackdrop');
    const splitModalContainer = document.getElementById('splitModalContainer');
    const splitModalCloseBtn = document.getElementById('splitModalCloseBtn');
    const splitModalLessonBadge = document.getElementById('splitModalLessonBadge');
    const splitModalTimeBadge = document.getElementById('splitModalTimeBadge');
    const splitModalTitle = document.getElementById('splitModalTitle');
    const splitModalSubtitle = document.getElementById('splitModalSubtitle');
    const splitModalOptions = document.getElementById('splitModalOptions');

    function openSplitSubjectModal(lesson, originCard) {
        if (!splitModalBackdrop || !splitModalContainer) return;
        const config = DUAL_SUBJECTS_MAP[lesson.name] || {
            title: `${lesson.num} УРОК: ${lesson.name}`,
            subtitle: "Цей урок поділено на підгрупи. Оберіть потрібний предмет:",
            options: lesson.name.split('/').map(part => {
                const clean = part.trim();
                const matchedKey = Object.keys(SUBJECTS_DB).find(k => k.toLowerCase() === clean.toLowerCase() || k.toLowerCase().includes(clean.toLowerCase()));
                const subj = matchedKey ? SUBJECTS_DB[matchedKey] : null;
                const hasB = subj && subj.book && subj.book !== '#';
                return {
                    name: matchedKey || clean,
                    shortName: clean,
                    dbTitle: subj ? subj.title : null,
                    hasBook: !!hasB,
                    image: subj?.image || null,
                    icon: subj?.image ? null : 'book',
                    desc: hasB ? 'Підручник та ГДЗ' : 'Підручник відсутній'
                };
            })
        };

        if (splitModalLessonBadge) splitModalLessonBadge.textContent = `${lesson.num} УРОК`;
        if (splitModalTimeBadge) splitModalTimeBadge.textContent = lesson.time || '';
        if (splitModalTitle) splitModalTitle.textContent = config.title;
        if (splitModalSubtitle) splitModalSubtitle.textContent = config.subtitle;

        if (splitModalOptions) {
            splitModalOptions.innerHTML = '';
            config.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `split-option-btn ${opt.hasBook ? '' : 'is-disabled'}`;

                let thumbHtml = '';
                if (opt.image) {
                    thumbHtml = `<img src="${opt.image}" class="split-thumb-img" alt="${opt.name}" loading="lazy" decoding="async" />`;
                } else {
                    const svg = ICONS_SVG[opt.icon] || ICONS_SVG.book;
                    thumbHtml = svg;
                }

                btn.innerHTML = `
                    <div class="split-option-thumb">
                        ${thumbHtml}
                    </div>
                    <div class="split-option-info">
                        <div class="split-option-name">${opt.name}</div>
                        <div class="split-option-desc">${opt.desc}</div>
                    </div>
                    <div class="split-option-action">
                        ${opt.hasBook ? '<span class="split-action-pill">Відкрити →</span>' : '<span class="split-action-pill is-none">Немає</span>'}
                    </div>
                `;

                if (opt.hasBook) {
                    btn.addEventListener('click', () => {
                        closeSplitSubjectModal();
                        setTimeout(() => {
                            openModal(originCard, opt.dbTitle);
                        }, 120);
                    });
                }

                splitModalOptions.appendChild(btn);
            });
        }

        window.lenis?.stop();
        splitModalBackdrop.classList.remove('is-closing');
        splitModalBackdrop.classList.add('is-open');
        splitModalBackdrop.setAttribute('aria-hidden', 'false');

        if (window.settingsState?.hapticMode !== false && 'vibrate' in navigator) {
            try { navigator.vibrate(10); } catch (_) {}
        }
    }

    function closeSplitSubjectModal() {
        if (!splitModalBackdrop || !splitModalBackdrop.classList.contains('is-open')) return;
        splitModalBackdrop.classList.add('is-closing');
        setTimeout(() => {
            splitModalBackdrop.classList.remove('is-open', 'is-closing');
            splitModalBackdrop.setAttribute('aria-hidden', 'true');
            window.lenis?.start();
        }, 220);
    }

    if (splitModalCloseBtn) {
        splitModalCloseBtn.addEventListener('click', closeSplitSubjectModal);
    }
    if (splitModalBackdrop) {
        splitModalBackdrop.addEventListener('click', (e) => {
            if (e.target === splitModalBackdrop) closeSplitSubjectModal();
        });
    }

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

        let liveLessonNum = -1;
        if (isToday) {
            for (let i = 0; i < daySchedule.lessons.length; i++) {
                const times = daySchedule.lessons[i].time.split('-').map(t => t.trim());
                const lStart = parseTimeSec(times[0]);
                const lEnd = parseTimeSec(times[1]);
                if (curSec >= lStart && curSec < lEnd) {
                    liveLessonNum = daySchedule.lessons[i].num;
                    break;
                }
            }
        }

        const stateKey = `${targetDay}_${isToday}_${liveLessonNum}`;
        if (currentRenderedScheduleKey === stateKey) {
            return; // Schedule state hasn't changed; avoid DOM thrashing
        }
        if (modalState && modalState !== 'closed') {
            return; // Don't wipe schedule DOM while a card modal is active
        }
        currentRenderedScheduleKey = stateKey;

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
            const isNoBook = isNoBookLesson(lesson);
            const isDual = !isNoBook && (lesson.name.includes('/') || !!DUAL_SUBJECTS_MAP[lesson.name]);

            const card = document.createElement('button');
            card.className = 'liquid-card schedule-card';
            if (isNoBook) card.classList.add('is-no-book');
            if (isDual) card.classList.add('is-dual-card');

            card.setAttribute('data-title', lesson.dbTitle || lesson.name);
            if (isNoBook) {
                card.setAttribute('aria-disabled', 'true');
                card.setAttribute('tabindex', '-1');
            }

            const isLive = isToday && (lesson.num === liveLessonNum);

            let mediaHtml = '';
            if (lesson.image) {
                mediaHtml = `
                    <div class="card-cover-box">
                        <img src="${lesson.image}" class="card-cover-img" alt="${lesson.name}" loading="lazy" decoding="async" />
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

            const badgesHtml = `
                <div class="card-schedule-header">
                    <span class="lesson-num-badge ${isLive ? 'is-live' : ''}">${isLive ? 'ЗАРАЗ' : `${lesson.num} УРОК`}</span>
                    ${isDual ? '<span class="lesson-split-pill">2 предмети ▾</span>' : ''}
                    <span class="lesson-time-badge">${lesson.time}</span>
                </div>
            `;

            let footerHtml = '';
            if (isNoBook) {
                footerHtml = `<span class="lesson-no-book-badge"><svg class="no-book-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>Без підручника</span>`;
            } else if (isDual) {
                const dualConf = DUAL_SUBJECTS_MAP[lesson.name];
                if (dualConf && dualConf.options) {
                    footerHtml = `
                        <div class="card-split-pills">
                            ${dualConf.options.map(opt => `
                                <span class="card-split-pill ${opt.hasBook ? 'has-book' : 'no-book'}" data-dbtitle="${opt.dbTitle || ''}">
                                    ${opt.shortName}
                                </span>
                            `).join('')}
                        </div>
                    `;
                }
            }

            card.innerHTML = `
                <div class="liquid-lens"></div>
                <div class="liquid-specular-edge"></div>
                ${badgesHtml}
                ${mediaHtml}
                <div class="card-content">
                    <span class="card-title">${lesson.name}</span>
                    ${footerHtml}
                </div>
            `;

            scheduleCardsGrid.appendChild(card);

            if (isNoBook) {
                // Completely non-clickable card
                return;
            }

            initCard(card);

            if (isDual) {
                // Direct pill click listener
                card.querySelectorAll('.card-split-pill.has-book').forEach(pill => {
                    pill.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const dbTitle = pill.getAttribute('data-dbtitle');
                        if (dbTitle) openModal(card, dbTitle);
                    });
                });

                // Card body click opens split modal
                card.addEventListener('click', (e) => {
                    if (card._isCardScrolling) {
                        card._isCardScrolling = false;
                        return;
                    }
                    openSplitSubjectModal(lesson, card);
                });
            }
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
                avatarBtn.classList.add('is-playing');
                document.body.classList.add('audio-playing');
                const playPromise = bgAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch((err) => {
                        console.log('Audio autoplay prevented or file loading:', err);
                    });
                }
            } else {
                bgAudio.pause();
                avatarBtn.classList.remove('is-playing');
                document.body.classList.remove('audio-playing');
            }
        });
        bgAudio.addEventListener('ended', () => {
            avatarBtn.classList.remove('is-playing');
            document.body.classList.remove('audio-playing');
        });
        bgAudio.addEventListener('pause', () => {
            avatarBtn.classList.remove('is-playing');
            document.body.classList.remove('audio-playing');
        });
    }

    // ==========================================================================
    // 8. SETTINGS MODAL & SYSTEM PREFERENCES
    // ==========================================================================
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModalBackdrop = document.getElementById('settingsModalBackdrop');
    const settingsModalCloseBtn = document.getElementById('settingsModalCloseBtn');
    const settingPerfSlider = document.getElementById('settingPerfSlider');
    const perfLevelBadge = document.getElementById('perfLevelBadge');
    const perfLevelDesc = document.getElementById('perfLevelDesc');
    const stepMarks = document.querySelectorAll('.slider-step-marks:not(.blur-step-marks) .step-mark');
    const settingBlurRow = document.getElementById('settingBlurRow');
    const settingBlurSlider = document.getElementById('settingBlurSlider');
    const blurLevelBadge = document.getElementById('blurLevelBadge');
    const blurLevelDesc = document.getElementById('blurLevelDesc');
    const blurStepMarks = document.querySelectorAll('.blur-step-marks .step-mark');
    const settingTiltMode = document.getElementById('settingTiltMode');
    const settingHapticMode = document.getElementById('settingHapticMode');
    const settingTimerDisplay = document.getElementById('settingTimerDisplay');
    const accentColorPicker = document.getElementById('accentColorPicker');

    function setAiService(key) {
        if (!AI_SERVICES[key]) return;
        window.settingsState.aiService = key;
        applySettings();
        if (window.settingsState.hapticMode && 'vibrate' in navigator) {
            try { navigator.vibrate(10); } catch (_) {}
        }
    }

    function applySettings() {
        // 1. Performance level (0 = Quality, 1 = Balance, 2 = Ultra/Max FPS)
        const lvl = window.settingsState.perfLevel || 0;
        document.body.setAttribute('data-perf-level', String(lvl));
        document.body.classList.toggle('perf-mode', lvl > 0);

        if (settingPerfSlider) settingPerfSlider.value = lvl;
        if (perfLevelBadge) {
            perfLevelBadge.textContent = PERF_TIERS[lvl]?.badge || 'Якість';
        }
        if (perfLevelDesc) {
            perfLevelDesc.textContent = PERF_TIERS[lvl]?.desc || '';
        }
        if (stepMarks) {
            stepMarks.forEach(mark => {
                const step = parseInt(mark.getAttribute('data-step'), 10);
                mark.classList.toggle('active', step === lvl);
            });
        }

        // 2. Motion Blur Strength & Lock State (Unlocks only in Quality preset)
        const isQuality = lvl === 0;
        if (settingBlurRow) {
            settingBlurRow.classList.toggle('is-locked', !isQuality);
            settingBlurRow.classList.toggle('is-unlocked', isQuality);
        }
        if (settingBlurSlider) {
            settingBlurSlider.disabled = !isQuality;
            settingBlurSlider.value = window.settingsState.motionBlurStrength;
        }
        if (blurLevelBadge) {
            if (!isQuality) {
                blurLevelBadge.textContent = '🔒 Заблоковано';
            } else if (window.settingsState.motionBlurStrength === 0) {
                blurLevelBadge.textContent = 'Вимкнено';
            } else {
                blurLevelBadge.textContent = `${window.settingsState.motionBlurStrength.toFixed(1)}px`;
            }
        }
        if (blurLevelDesc) {
            if (!isQuality) {
                blurLevelDesc.textContent = 'Доступно лише в пресеті «Якість» (для максимальної плавності)';
            } else if (window.settingsState.motionBlurStrength === 0) {
                blurLevelDesc.textContent = 'Розмиття при русі вікон повністю вимкнено';
            } else {
                blurLevelDesc.textContent = 'Інтенсивність розмиття при швидкому русі вікон';
            }
        }
        if (blurStepMarks) {
            blurStepMarks.forEach(mark => {
                const blurTarget = parseFloat(mark.getAttribute('data-blur'));
                mark.classList.toggle('active', isQuality && Math.abs(blurTarget - window.settingsState.motionBlurStrength) < 0.35);
            });
        }
        document.documentElement.style.setProperty('--motion-blur-val', `${window.settingsState.motionBlurStrength}px`);

        // 3. 3D tilt
        if (settingTiltMode) settingTiltMode.checked = window.settingsState.tiltMode;

        // 4. Haptic
        if (settingHapticMode) settingHapticMode.checked = window.settingsState.hapticMode;

        // 5. Timer display
        const navTimer = document.querySelector('.nav-timer');
        if (navTimer) {
            navTimer.style.display = window.settingsState.timerDisplay ? '' : 'none';
        }
        if (settingTimerDisplay) settingTimerDisplay.checked = window.settingsState.timerDisplay;

        // 6. Accent color (presets or custom hex) & Atmospheric Aura synchronization
        const accentCfg = getAccentConfig(window.settingsState);
        const auraCfg = getAuraConfig(window.settingsState);
        document.documentElement.style.setProperty('--purple-accent', accentCfg.accent);
        document.documentElement.style.setProperty('--purple-glow', accentCfg.glow);
        document.documentElement.style.setProperty('--accent-contrast-text', accentCfg.contrast);
        document.documentElement.style.setProperty('--aura-glow-1', auraCfg.glow1);
        document.documentElement.style.setProperty('--aura-glow-2', auraCfg.glow2);
        document.documentElement.style.setProperty('--hero-reflection-color', auraCfg.reflection);

        const customColorBtn = document.getElementById('customColorBtn');
        const customColorInput = document.getElementById('customColorInput');
        if (customColorInput && window.settingsState.customAccentHex) {
            customColorInput.value = window.settingsState.customAccentHex;
        }

        // Update active dot in picker
        if (accentColorPicker) {
            accentColorPicker.querySelectorAll('.color-dot:not(.custom-color-dot)').forEach(dot => {
                dot.classList.toggle('active', dot.getAttribute('data-color') === window.settingsState.accentColor);
            });
            if (customColorBtn) {
                customColorBtn.classList.toggle('active', window.settingsState.accentColor === 'custom');
            }
        }

        // 7. Animation Preset
        const settingAnimPreset = document.getElementById('settingAnimPreset');
        const animPresetDesc = document.getElementById('animPresetDesc');
        if (settingAnimPreset) settingAnimPreset.value = window.settingsState.animPreset || 'cinematic';
        if (animPresetDesc) {
            const preset = ANIM_PRESETS[window.settingsState.animPreset] || ANIM_PRESETS.cinematic;
            animPresetDesc.textContent = preset.desc;
        }

        // 8. Sound FX
        const settingSoundFx = document.getElementById('settingSoundFx');
        if (settingSoundFx) settingSoundFx.checked = window.settingsState.soundFx !== false;

        // 8b. Fast Card Switch
        const settingFastSwitch = document.getElementById('settingFastSwitch');
        if (settingFastSwitch) settingFastSwitch.checked = !!window.settingsState.fastSwitch;

        // 9. Aura Style
        const settingAuraStyle = document.getElementById('settingAuraStyle');
        const auraStyleDesc = document.getElementById('auraStyleDesc');
        const curAura = window.settingsState.auraStyle || 'dynamic';
        document.body.setAttribute('data-aura', curAura);
        if (settingAuraStyle) settingAuraStyle.value = curAura;
        if (auraStyleDesc) auraStyleDesc.textContent = AURA_DESCS[curAura] || AURA_DESCS.dynamic;

        // 10. AI Service for Live Iframe
        const aiKey = window.settingsState.aiService || 'gemini';
        const aiService = AI_SERVICES[aiKey] || AI_SERVICES.gemini;

        const aiIframe = document.getElementById('aiIframe');
        const aiTitle = document.getElementById('aiModalHeaderTitle');
        const aiExternalBtn = document.getElementById('aiExternalLinkBtn');
        const aiQuickSelect = document.getElementById('aiQuickSelector');
        const settingAiSelect = document.getElementById('settingAiSelect');

        if (aiTitle) aiTitle.textContent = aiService.name;
        if (aiExternalBtn) aiExternalBtn.href = aiService.url;
        if (aiQuickSelect) aiQuickSelect.value = aiKey;
        if (settingAiSelect) settingAiSelect.value = aiKey;
        if (aiIframe && aiIframe.getAttribute('data-current-src') !== aiService.url) {
            aiIframe.setAttribute('data-current-src', aiService.url);
            aiIframe.src = aiService.url;
        }

        persistSettings();
    }

    applySettings();

    function openSettingsModal() {
        if (!settingsModalBackdrop) return;
        window.lenis?.stop();
        playTapticAudio('open');
        settingsModalBackdrop.classList.add('is-open');
        settingsModalBackdrop.setAttribute('aria-hidden', 'false');
        if (window.settingsState.hapticMode && 'vibrate' in navigator) {
            try { navigator.vibrate(8); } catch (_) {}
        }
    }

    function closeSettingsModal() {
        if (!settingsModalBackdrop || !settingsModalBackdrop.classList.contains('is-open')) return;
        playTapticAudio('close');
        settingsModalBackdrop.classList.add('is-closing');
        setTimeout(() => {
            settingsModalBackdrop.classList.remove('is-open', 'is-closing');
            settingsModalBackdrop.setAttribute('aria-hidden', 'true');
            window.lenis?.start();
        }, 240);
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }

    if (settingsModalCloseBtn) {
        settingsModalCloseBtn.addEventListener('click', closeSettingsModal);
    }

    if (settingsModalBackdrop) {
        settingsModalBackdrop.addEventListener('click', (e) => {
            if (e.target === settingsModalBackdrop) closeSettingsModal();
        });
    }

    function setPerfLevel(lvl) {
        lvl = Math.max(0, Math.min(2, parseInt(lvl, 10) || 0));
        window.settingsState.perfLevel = lvl;
        playTapticAudio('click');
        applySettings();
        if (window.settingsState.hapticMode && 'vibrate' in navigator) {
            try { navigator.vibrate(lvl === 2 ? 22 : 10); } catch (_) {}
        }
    }

    function setMotionBlurStrength(val) {
        if (window.settingsState.perfLevel !== 0) return; // Unlocked only in Quality mode
        val = Math.max(0, Math.min(7, parseFloat(val) || 0));
        window.settingsState.motionBlurStrength = val;
        applySettings();
        if (window.settingsState.hapticMode && 'vibrate' in navigator) {
            try { navigator.vibrate(8); } catch (_) {}
        }
    }

    if (settingPerfSlider) {
        settingPerfSlider.addEventListener('input', (e) => {
            setPerfLevel(e.target.value);
        });
    }

    if (stepMarks) {
        stepMarks.forEach(mark => {
            mark.addEventListener('click', () => {
                const step = mark.getAttribute('data-step');
                if (step !== null) setPerfLevel(step);
            });
        });
    }

    if (settingBlurSlider) {
        settingBlurSlider.addEventListener('input', (e) => {
            setMotionBlurStrength(e.target.value);
        });
    }

    if (blurStepMarks) {
        blurStepMarks.forEach(mark => {
            mark.addEventListener('click', () => {
                const bVal = mark.getAttribute('data-blur');
                if (bVal !== null) setMotionBlurStrength(bVal);
            });
        });
    }

    if (settingTiltMode) {
        settingTiltMode.addEventListener('change', (e) => {
            window.settingsState.tiltMode = e.target.checked;
            playTapticAudio('click');
            persistSettings();
            if (!e.target.checked) {
                document.querySelectorAll('.liquid-card').forEach(c => c.style.transform = '');
            }
        });
    }

    if (settingHapticMode) {
        settingHapticMode.addEventListener('change', (e) => {
            window.settingsState.hapticMode = e.target.checked;
            playTapticAudio('click');
            persistSettings();
            if (e.target.checked && 'vibrate' in navigator) {
                try { navigator.vibrate(12); } catch (_) {}
            }
        });
    }

    if (settingTimerDisplay) {
        settingTimerDisplay.addEventListener('change', (e) => {
            window.settingsState.timerDisplay = e.target.checked;
            playTapticAudio('click');
            applySettings();
        });
    }

    const settingFastSwitch = document.getElementById('settingFastSwitch');
    if (settingFastSwitch) {
        settingFastSwitch.addEventListener('change', (e) => {
            window.settingsState.fastSwitch = e.target.checked;
            playTapticAudio('click');
            persistSettings();
        });
    }

    if (accentColorPicker) {
        accentColorPicker.querySelectorAll('.color-dot:not(.custom-color-dot)').forEach(dot => {
            dot.addEventListener('click', () => {
                const colorKey = dot.getAttribute('data-color');
                if (!colorKey) return;
                window.settingsState.accentColor = colorKey;
                window.settingsState.auraStyle = 'dynamic';
                playTapticAudio('click');
                applySettings();
                if (window.settingsState.hapticMode && 'vibrate' in navigator) {
                    try { navigator.vibrate(10); } catch (_) {}
                }
            });
        });
    }

    const customColorInput = document.getElementById('customColorInput');
    if (customColorInput) {
        const handleCustomColor = (e) => {
            const hex = e.target.value;
            if (!hex) return;
            window.settingsState.accentColor = 'custom';
            window.settingsState.customAccentHex = hex;
            window.settingsState.auraStyle = 'dynamic';
            playTapticAudio('click');
            applySettings();
        };
        customColorInput.addEventListener('input', handleCustomColor);
        customColorInput.addEventListener('change', handleCustomColor);
    }

    const settingAnimPreset = document.getElementById('settingAnimPreset');
    if (settingAnimPreset) {
        settingAnimPreset.addEventListener('change', (e) => {
            window.settingsState.animPreset = e.target.value;
            playTapticAudio('click');
            applySettings();
        });
    }

    const settingSoundFx = document.getElementById('settingSoundFx');
    if (settingSoundFx) {
        settingSoundFx.addEventListener('change', (e) => {
            window.settingsState.soundFx = e.target.checked;
            if (e.target.checked) playTapticAudio('click');
            persistSettings();
        });
    }

    const settingAuraStyle = document.getElementById('settingAuraStyle');
    if (settingAuraStyle) {
        settingAuraStyle.addEventListener('change', (e) => {
            window.settingsState.auraStyle = e.target.value;
            playTapticAudio('click');
            applySettings();
        });
    }

    const settingAiSelect = document.getElementById('settingAiSelect');
    if (settingAiSelect) {
        settingAiSelect.addEventListener('change', (e) => {
            setAiService(e.target.value);
            playTapticAudio('click');
        });
    }

    window.WEEK_SCHEDULE = WEEK_SCHEDULE;
    window.SUBJECTS_DB = SUBJECTS_DB;
});
