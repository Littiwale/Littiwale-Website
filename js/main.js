document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("error", (e) => console.error("Global Error:", e.message));

    // ============================================================
    // CUSTOM POPUP SYSTEM — replaces native alert() & confirm()
    // ============================================================
    (function injectCustomPopupSystem() {
        if (document.getElementById('lw-popup-overlay')) return;

        const style = document.createElement('style');
        style.textContent = `
            #lw-popup-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.75);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 999999;
                display: flex; align-items: center; justify-content: center;
                padding: 20px; box-sizing: border-box;
                opacity: 0; visibility: hidden;
                transition: opacity 0.25s, visibility 0.25s;
            }
            #lw-popup-overlay.lw-show { opacity: 1; visibility: visible; }
            #lw-popup-box {
                background: #1a1d26;
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 20px;
                padding: 28px 24px 22px;
                width: 100%; max-width: 420px;
                box-shadow: 0 24px 64px rgba(0,0,0,0.9);
                transform: scale(0.92);
                transition: transform 0.25s cubic-bezier(.175,.885,.32,1.275);
                text-align: center;
            }
            #lw-popup-overlay.lw-show #lw-popup-box { transform: scale(1); }
            #lw-popup-icon { font-size: 2.5rem; margin-bottom: 12px; line-height: 1; }
            #lw-popup-title {
                font-size: 1.15rem; font-weight: 800;
                color: #ffffff; margin-bottom: 8px;
                font-family: 'Outfit', sans-serif;
            }
            #lw-popup-msg {
                font-size: 0.9rem; color: #94a3b8;
                line-height: 1.55; margin-bottom: 20px;
                white-space: pre-line;
            }
            #lw-popup-btns { display: flex; gap: 10px; justify-content: center; }
            .lw-popup-btn {
                flex: 1; padding: 11px 16px; border-radius: 12px;
                font-size: 0.9rem; font-weight: 700; cursor: pointer;
                border: none; transition: all 0.18s; max-width: 160px;
            }
            .lw-popup-btn-ok {
                background: #f59e0b; color: #000;
                box-shadow: 0 4px 14px rgba(245,158,11,0.35);
            }
            .lw-popup-btn-ok:hover { background: #fbbf24; }
            .lw-popup-btn-ok.danger { background: #ef4444; color:#fff; box-shadow: 0 4px 14px rgba(239,68,68,0.35); }
            .lw-popup-btn-ok.success { background: #22c55e; color:#000; box-shadow: 0 4px 14px rgba(34,197,94,0.35); }
            .lw-popup-btn-cancel {
                background: rgba(255,255,255,0.08); color: #cbd5e1;
                border: 1px solid rgba(255,255,255,0.12);
            }
            .lw-popup-btn-cancel:hover { background: rgba(255,255,255,0.14); }
        `;
        document.head.appendChild(style);

        const html = `
            <div id="lw-popup-overlay">
                <div id="lw-popup-box">
                    <div id="lw-popup-icon">⚠️</div>
                    <div id="lw-popup-title">Notice</div>
                    <div id="lw-popup-msg"></div>
                    <div id="lw-popup-btns">
                        <button class="lw-popup-btn lw-popup-btn-cancel" id="lw-popup-cancel">Cancel</button>
                        <button class="lw-popup-btn lw-popup-btn-ok" id="lw-popup-ok">OK</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    })();

    /**
     * showAlert(msg, {title, icon, btnText, type})
     * type: 'warning' | 'error' | 'success' | 'info'
     */
    window.showAlert = function(msg, opts = {}) {
        return new Promise(resolve => {
            const overlay = document.getElementById('lw-popup-overlay');
            const box = document.getElementById('lw-popup-box');
            const iconEl = document.getElementById('lw-popup-icon');
            const titleEl = document.getElementById('lw-popup-title');
            const msgEl = document.getElementById('lw-popup-msg');
            const okBtn = document.getElementById('lw-popup-ok');
            const cancelBtn = document.getElementById('lw-popup-cancel');

            const typeMap = {
                warning: { icon: '⚠️', title: 'Warning', cls: '' },
                error:   { icon: '❌', title: 'Error', cls: 'danger' },
                success: { icon: '✅', title: 'Success', cls: 'success' },
                info:    { icon: 'ℹ️', title: 'Notice', cls: '' },
            };
            const t = typeMap[opts.type] || typeMap.warning;

            iconEl.textContent = opts.icon || t.icon;
            titleEl.textContent = opts.title || t.title;
            msgEl.textContent = msg;

            okBtn.textContent = opts.btnText || 'OK';
            okBtn.className = `lw-popup-btn lw-popup-btn-ok ${t.cls}`;
            cancelBtn.style.display = 'none';

            overlay.classList.add('lw-show');
            const close = () => { overlay.classList.remove('lw-show'); resolve(true); };
            okBtn.onclick = close;
            overlay.onclick = (e) => { if(e.target === overlay) close(); };
        });
    };

    /**
     * showConfirm(msg, {title, icon, okText, cancelText, type})
     * Returns Promise<boolean>
     */
    window.showConfirm = function(msg, opts = {}) {
        return new Promise(resolve => {
            const overlay = document.getElementById('lw-popup-overlay');
            const iconEl = document.getElementById('lw-popup-icon');
            const titleEl = document.getElementById('lw-popup-title');
            const msgEl = document.getElementById('lw-popup-msg');
            const okBtn = document.getElementById('lw-popup-ok');
            const cancelBtn = document.getElementById('lw-popup-cancel');

            iconEl.textContent = opts.icon || '❓';
            titleEl.textContent = opts.title || 'Confirm';
            msgEl.textContent = msg;

            okBtn.textContent = opts.okText || 'Yes';
            okBtn.className = `lw-popup-btn lw-popup-btn-ok ${opts.type === 'danger' ? 'danger' : ''}`;
            cancelBtn.style.display = 'flex';
            cancelBtn.textContent = opts.cancelText || 'Cancel';

            overlay.classList.add('lw-show');
            const close = (val) => { overlay.classList.remove('lw-show'); resolve(val); };
            okBtn.onclick = () => close(true);
            cancelBtn.onclick = () => close(false);
            overlay.onclick = (e) => { if(e.target === overlay) close(false); };
        });
    };
    
    // --- Mobile Navigation Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if(window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        });
    });

    // --- Set Current Year in Footer ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Menu Rendering & Filtering ---
    let menuData = [];
    let isMenuDataLoaded = false;
    let menuImageMap = {};
    const menuGrid = document.getElementById('menu-grid');
    const categoryFilters = document.getElementById('category-filters');

    // Default bundled image map (100% verified dish images from /images/menu/Full Menu/)
    const DEFAULT_IMAGE_MAP = {
        "mumbai street vada pav": "images/menu/Full Menu/Star Special/vadapav.webp",
        "authentic bihari litti chokha": "images/menu/Full Menu/Star Special/littichokha.webp",
        "desi delight chick-a-litti": "images/menu/Full Menu/Star Special/littichicken.webp",
        "a1 swag combo - veg": "images/menu/Full Menu/Star Special/swagveg.webp",
        "a1 swag combo - non veg": "images/menu/Full Menu/Star Special/swagnonveg.webp",
        "a1 punjab da swag": "images/menu/Full Menu/Star Special/punjabswag.webp",
        "masterchef special thecha chowmein": "images/menu/Full Menu/Star Special/thechachowmein.webp",
        "mumbai butter pav bhaji": "images/menu/Full Menu/Star Special/pavbhaji.webp",
        "veg pizza": "images/menu/Full Menu/Pizza/vp.webp",
        "corn pizza": "images/menu/Full Menu/Pizza/cp.webp",
        "paneer pizza": "images/menu/Full Menu/Pizza/pp.webp",
        "chicken pizza": "images/menu/Full Menu/Pizza/chickenpizza.webp",
        "red sauce pasta": "images/menu/Full Menu/Pasta/rsp.webp",
        "white sauce pasta": "images/menu/Full Menu/Pasta/wsp.webp",
        "rajma chawal": "images/menu/Full Menu/Littiwale Rice Bowl Combos/rajmachawal.webp",
        "chole chawal": "images/menu/Full Menu/Littiwale Rice Bowl Combos/cholechawal.webp",
        "kadhi chawal": "images/menu/Full Menu/Littiwale Rice Bowl Combos/kadhichawal.webp",
        "kadi chawal": "images/menu/Full Menu/AI_Generated/kadi_chawal.webp",
        "veg maggie": "images/menu/Full Menu/Maggi/vegmaggi.webp",
        "cheese maggie": "images/menu/Full Menu/Maggi/cheesemaggi.webp",
        "dal tadka": "images/menu/Full Menu/Main Course/eggtadka.webp",
        "dal makhani": "images/menu/Full Menu/Main Course/eggtadka.webp",
        "paneer butter masala": "images/menu/Full Menu/Main Course/paneerbuttermasala.webp",
        "paneer masala": "images/menu/Full Menu/Main Course/paneermasala.webp",
        "palak paneer": "images/menu/Full Menu/Main Course/palakpaneer.webp",
        "chicken chatpata": "images/menu/Full Menu/Main Course/chickenchatpata.webp",
        "chicken masala": "images/menu/Full Menu/Main Course/chickenkadhai.webp",
        "chicken handi": "images/menu/Full Menu/Main Course/chickenhandi.webp",
        "chicken champaran": "images/menu/Full Menu/Main Course/champaranchicken.webp",
        "egg tadka": "images/menu/Full Menu/Main Course/eggtadka.webp",
        "fish curry": "images/menu/Full Menu/Main Course/fishcurry.webp",
        "mix veg": "images/menu/Full Menu/Main Course/mixveg.webp",
        "mushroom masala": "images/menu/Full Menu/Main Course/mushroommasala.webp",
        "kofta malai": "images/menu/Full Menu/Main Course/koftamalai.webp",
        "veg noodles": "images/menu/Full Menu/Noodles/vegnoodles.webp",
        "egg noodles": "images/menu/Full Menu/Noodles/eggnoodles.webp",
        "chicken noodles": "images/menu/Full Menu/Noodles/chickennoodles.webp",
        "mix veg noodles": "images/menu/Full Menu/Noodles/mixvegnoodles.webp",
        "mix non veg noodles": "images/menu/Full Menu/Noodles/mixnonvegnoodles.webp",
        "veg fried rice": "images/menu/Full Menu/Noodles/Rice/vfr.webp",
        "egg fried rice": "images/menu/Full Menu/Noodles/Rice/efr.webp",
        "chicken fried rice": "images/menu/Full Menu/Noodles/Rice/cfr.webp",
        "veg sandwich": "images/menu/Full Menu/Sandwiches/vs.webp",
        "cheese veg grilled sandwich": "images/menu/Full Menu/Sandwiches/vgs.webp",
        "veg sandwich clubbed": "images/menu/Full Menu/Sandwiches/vcs.webp",
        "mix veg sandwich clubbed": "images/menu/Full Menu/Sandwiches/vcs.webp",
        "chicken clubbed sandwich": "images/menu/Full Menu/Sandwiches/ccs.webp",
        "corn cheese sandwich grilled": "images/menu/Full Menu/Sandwiches/cornsandwich.webp",
        "corn sandwich clubbed": "images/menu/Full Menu/Sandwiches/clubbedcorn.webp",
        "paneer sandwich clubbed": "images/menu/Full Menu/Sandwiches/paneerclubbedsandwich.webp",
        "cheese chicken sandwich": "images/menu/Full Menu/Sandwiches/cheesechickensandwich.webp",
        "chilly chicken": "images/menu/Full Menu/Starters/chillychicken.webp",
        "chilly paneer": "images/menu/Full Menu/Starters/paneerchilly.webp",
        "mushroom chilly": "images/menu/Full Menu/Starters/mushroomchilly.webp",
        "veg manchurian": "images/menu/Full Menu/Starters/vegmanchurian.webp",
        "chilly gobi": "images/menu/Full Menu/Starters/gobic.webp",
        "veg thali": "images/menu/Full Menu/Thali/veg.webp",
        "paneer thali": "images/menu/Full Menu/Thali/veg.webp",
        "egg thali": "images/menu/Full Menu/Thali/egg.webp",
        "fish thali": "images/menu/Full Menu/Thali/fish.webp",
        "chicken thali": "images/menu/Full Menu/Thali/chicken.webp",
        "mutton thali": "images/menu/Full Menu/Thali/mutton.webp",
        "meals for one - chicken fried rice chilly chicken": "images/menu/Full Menu/Littiwale Meal for One/cccf.webp",
        "meals for one - chicken noodles chilly chicken": "images/menu/Full Menu/Littiwale Meal for One/cccn.webp",
        "meals for one - egg fried rice chilly chicken": "images/menu/Full Menu/Littiwale Meal for One/ccef.webp",
        "meals for one - egg noodles chilly chicken": "images/menu/Full Menu/Littiwale Meal for One/ccen.webp",
        "meals for one - lacha paratha chicken chilly": "images/menu/Full Menu/Littiwale Meal for One/cclp.webp",
        "meals for one - veg fried rice chicken chilly": "images/menu/Full Menu/Littiwale Meal for One/ccvf.webp",
        "meals for one - veg noodles chicken chilly": "images/menu/Full Menu/Littiwale Meal for One/ccvn.webp",
        "meals for one - veg fried rice paneer chilly": "images/menu/Full Menu/Littiwale Meal for One/pcvf.webp",
        "meals for one - veg noodles paneer chilly": "images/menu/Full Menu/Littiwale Meal for One/pcvn.webp",
        "meals for one - lacha paratha paneer chilly": "images/menu/Full Menu/Littiwale Meal for One/pclp.webp",
        "littiwale mega feast - chilly chicken chicken fried rice lacha paratha": "images/menu/Full Menu/Littiwale Mega Feast/cccflp.webp",
        "littiwale mega feast - chilly chicken egg fried rice lacha paratha": "images/menu/Full Menu/Littiwale Mega Feast/cceflp.webp",
        "littiwale mega feast - chilly chicken veg fried rice lacha paratha": "images/menu/Full Menu/Littiwale Mega Feast/ccvflp.webp",
        "littiwale mega feast - chilly paneer veg fried rice lacha paratha": "images/menu/Full Menu/Littiwale Mega Feast/pcvflp.webp",
        "veg hot n sour soup": "images/menu/Full Menu/Soup/soup.webp",
        "veg manchow soup": "images/menu/Full Menu/Soup/soup.webp",
        "chicken hot n sour soup": "images/menu/Full Menu/Soup/soup.webp",
        "chicken manchow soup": "images/menu/Full Menu/Soup/soup.webp",
        "laccha paratha": "images/menu/Full Menu/Breads/lacchaparatha.webp",
        "butter naan": "images/menu/Full Menu/Breads/lacchaparatha.webp",
        "tawa roti": "images/menu/Full Menu/Breads/tawaroti.webp",
        "garam gobi gully paratha": "images/menu/Full Menu/Breads/gobiparatha.webp",
        "punjabi patiala aloo paratha": "images/menu/Full Menu/Breads/alooparatha.webp",
        "dil se paneer paratha": "images/menu/Full Menu/Breads/paneerparatha.webp",
        "cheesy corn chulbuli paratha": "images/menu/Full Menu/Breads/cheesecornparatha.webp",
        "littiwale loaded paratha": "images/menu/Full Menu/Breads/littiwaleloadedparatha.webp",
        "makke di roti": "images/menu/Full Menu/Breads/makkediroti.webp",
        "aloo paratha": "images/menu/Full Menu/Breads/alooparatha.webp",
        "gobi paratha": "images/menu/Full Menu/Breads/gobiparatha.webp",
        "paneer paratha": "images/menu/Full Menu/Breads/paneerparatha.webp",
        "steam veg momo": "images/menu/Full Menu/AI_Generated/steamed_momos.webp",
        "steam paneer momo": "images/menu/Full Menu/AI_Generated/steamed_momos.webp",
        "kurkure veg momo": "images/menu/Full Menu/AI_Generated/kurkure_momos.webp",
        "paneer kurkure momo": "images/menu/Full Menu/AI_Generated/kurkure_momos.webp",
        "fried veg momo": "images/menu/Full Menu/AI_Generated/fried_momos.webp",
        "fried paneer momo": "images/menu/Full Menu/AI_Generated/fried_momos.webp",
        "pan fried veg momo": "images/menu/Full Menu/AI_Generated/fried_momos.webp",
        "pan fried paneer momo": "images/menu/Full Menu/AI_Generated/fried_momos.webp",
        "chakuli pitha with sabzi": "images/menu/Full Menu/AI_Generated/chakuli_pitha.webp",
        "chakuli pitha": "images/menu/Full Menu/AI_Generated/chakuli_pitha.webp",
        "dahi bara aloo dum": "images/menu/Full Menu/AI_Generated/dahi_bara_aloo_dum.webp",
        "idli": "images/menu/Full Menu/AI_Generated/idli_sambar.webp",
        "dhokla": "images/menu/Full Menu/AI_Generated/khaman_dhokla.webp",
        "puri sabzi": "images/menu/Full Menu/AI_Generated/puri_sabzi.webp",
        "sabzi": "images/menu/Full Menu/AI_Generated/puri_sabzi.webp",
        "chole bhature": "images/menu/Full Menu/AI_Generated/chole_bhature.webp",
        "upma": "images/menu/Full Menu/AI_Generated/rava_upma.webp",
        "lassi": "images/menu/Full Menu/AI_Generated/punjabi_lassi.webp",
        "mango shake": "images/menu/Full Menu/AI_Generated/fruit_shakes.webp",
        "chocolate shake": "images/menu/Full Menu/AI_Generated/fruit_shakes.webp",
        "pineapple shake": "images/menu/Full Menu/AI_Generated/fruit_shakes.webp",
        "butterscotch shake": "images/menu/Full Menu/AI_Generated/fruit_shakes.webp",
        "cold coffee": "images/menu/Full Menu/AI_Generated/cold_coffee.webp",
        "buttermilk": "images/menu/Full Menu/AI_Generated/punjabi_lassi.webp",
        "banana shake": "images/menu/Full Menu/AI_Generated/fruit_shakes.webp",
        "oreo shake": "images/menu/Full Menu/AI_Generated/fruit_shakes.webp",
        "oreo banana shake": "images/menu/Full Menu/AI_Generated/fruit_shakes.webp",
        "dahi": "images/menu/Full Menu/AI_Generated/punjabi_lassi.webp",
        "rice": "images/menu/Full Menu/AI_Generated/plain_rice.webp"
    };
    menuImageMap = Object.assign({}, DEFAULT_IMAGE_MAP);
    
    const ADMIN_API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        ? 'http://localhost:5001/api' 
        : 'https://littiwale-admin.vercel.app/api';

    async function fetchWithTimeout(url, timeoutMs = 8000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                clearTimeout(timeoutId);
                return null;
            }
            const data = await response.json();
            clearTimeout(timeoutId);
            return data;
        } catch (e) {
            clearTimeout(timeoutId);
            return null;
        }
    }

    async function initMenu() {
        // 1. Fast Cache-First Load for Instant UI Display (0ms delay on all devices)
        try {
            const cachedAnnouncementsRaw = localStorage.getItem('lw_cached_announcements');
            if (cachedAnnouncementsRaw) {
                const cachedAnnouncements = JSON.parse(cachedAnnouncementsRaw);
                if (Array.isArray(cachedAnnouncements) && cachedAnnouncements.length > 0) {
                    window.liveAnnouncements = cachedAnnouncements;
                    initAnnouncements(cachedAnnouncements);
                }
            }

            const cachedSettingsRaw = localStorage.getItem('lw_cached_settings');
            if (cachedSettingsRaw) {
                const cachedSettings = JSON.parse(cachedSettingsRaw);
                if (Array.isArray(cachedSettings)) processSettings(cachedSettings);
            }

            const cachedCategoriesRaw = localStorage.getItem('lw_cached_categories');
            if (cachedCategoriesRaw) {
                const cachedCategories = JSON.parse(cachedCategoriesRaw);
                if (Array.isArray(cachedCategories)) applyLiveCategories(cachedCategories);
            }

            const cachedMenuRaw = localStorage.getItem('lw_cached_menu') || sessionStorage.getItem('littiWaleCachedMenu');
            if (cachedMenuRaw) {
                const parsedCachedMenu = JSON.parse(cachedMenuRaw);
                if (Array.isArray(parsedCachedMenu) && parsedCachedMenu.length > 0) {
                    menuData = parsedCachedMenu;
                    console.log('%c⚡ [LITTIWALE] Fast-load: Initial display from Local Cache (' + parsedCachedMenu.length + ' items)', 'color:#f97316; font-weight:bold;');
                    // Restore menuImageMap from cached items and default map
                    menuData.forEach(item => {
                        if (item.name) {
                            const norm = getNormalizedName(item.name);
                            if (item.image && item.image !== 'images/logo.png') {
                                menuImageMap[norm] = item.image;
                            } else if (DEFAULT_IMAGE_MAP[norm]) {
                                menuImageMap[norm] = DEFAULT_IMAGE_MAP[norm];
                            }
                        }
                    });
                    isMenuDataLoaded = true;
                    initMenuDisplay();
                }
            }
        } catch (e) {
            console.warn('Cache load notice:', e);
        }

        // Parallel Independent Async Network Fetching (Never blocks UI)
        
        // 1. Announcements fetch (Instant background update)
        fetchWithTimeout(`${ADMIN_API_BASE_URL}/announcements`, 5000).then(apiAnnouncements => {
            if (apiAnnouncements && Array.isArray(apiAnnouncements) && apiAnnouncements.length > 0) {
                window.liveAnnouncements = apiAnnouncements;
                initAnnouncements(apiAnnouncements);
                try {
                    const lightAnn = apiAnnouncements.map(a => (a.image && a.image.startsWith('data:')) ? Object.assign({}, a, { image: '' }) : a);
                    localStorage.setItem('lw_cached_announcements', JSON.stringify(lightAnn));
                } catch(e) {}
            }
        }).catch(() => {});

        // 2. Settings & Store Status fetch
        fetchWithTimeout(`${ADMIN_API_BASE_URL}/settings`, 5000).then(apiSettings => {
            if (apiSettings && Array.isArray(apiSettings)) {
                processSettings(apiSettings);
                try {
                    localStorage.setItem('lw_cached_settings', JSON.stringify(apiSettings));
                } catch(e) {}
            }
        }).catch(() => {});

        // 3. Coupons fetch
        fetchWithTimeout(`${ADMIN_API_BASE_URL}/coupons`, 5000).then(apiCoupons => {
            if (apiCoupons && Array.isArray(apiCoupons)) {
                availableCoupons = apiCoupons.map(c => ({
                    code: c.code,
                    type: c.discountType === 'percentage' ? 'PERCENT' : 'FLAT',
                    discount: Number(c.discountValue) || 0,
                    discountPercent: Number(c.discountValue) || 0,
                    maxDiscount: Number(c.discountValue) || 0,
                    minOrder: Number(c.minOrderValue) || 0,
                    active: c.isActive !== false
                }));
                window.liveCoupons = availableCoupons;
                try {
                    localStorage.setItem('lw_cached_coupons', JSON.stringify(availableCoupons));
                } catch(e) {}
            }
        }).catch(() => {});

        // 4. Categories fetch
        fetchWithTimeout(`${ADMIN_API_BASE_URL}/categories`, 5000).then(apiCategories => {
            if (apiCategories && Array.isArray(apiCategories)) {
                applyLiveCategories(apiCategories);
                try {
                    localStorage.setItem('lw_cached_categories', JSON.stringify(apiCategories));
                } catch(e) {}
            }
        }).catch(() => {});

        // 5. Menu fetch from MongoDB Admin API
        try {
            console.log('%c🌐 [LITTIWALE] Fetching LIVE MENU directly from Admin MongoDB API: ' + ADMIN_API_BASE_URL + '/menu', 'color:#3b82f6; font-weight:bold;');
            const apiMenu = await fetchWithTimeout(`${ADMIN_API_BASE_URL}/menu`, 9000);

            let finalMenu = [];
            let finalMap = {};
            
            if (apiMenu && Array.isArray(apiMenu) && apiMenu.length > 0) {
                console.log('%c✅ [LITTIWALE] LIVE MENU LOADED FROM API (MongoDB): ' + apiMenu.length + ' items with full details & descriptions', 'color:#22c55e; font-weight:bold; font-size:12px;');
                apiMenu.forEach(item => {
                    const id = item._id || item.id;
                    const norm = getNormalizedName(item.name);
                    let avail = item.locationAvailability || item.availability || 'both';

                    // Category Mappings:
                    if (item.category === 'Tiffin Specials' || item.category === 'Daily Meal Specials' || (item.name && /upma|dhokla|idli|puri sabzi|chakuli/i.test(item.name))) {
                        avail = 'outlet_only';
                    }
                    if (item.category === 'Littiwale Rice Bowl Combos') {
                        avail = 'both';
                    }

                    // Preserve and prioritize item image from MongoDB, fallback to DEFAULT_IMAGE_MAP
                    const resolvedImage = (item.image && item.image !== 'images/logo.png' && item.image.trim() !== '') 
                        ? item.image 
                        : (DEFAULT_IMAGE_MAP[norm] || 'images/logo.png');

                    if (resolvedImage) {
                        finalMap[norm] = resolvedImage;
                    }

                    finalMenu.push({
                        id: id,
                        _id: id,
                        name: item.name,
                        category: item.category,
                        price: Number(item.price) || 0,
                        originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
                        description: (item.description && item.description !== 'nan' && item.description !== 'undefined') ? item.description : '',
                        note: item.note || item.description || '',
                        veg: (item.dietaryPreference === 'non-veg' || item.veg === 'nonveg') ? 'nonveg' : 'veg',
                        dietaryPreference: item.dietaryPreference || ((item.veg === 'nonveg') ? 'non-veg' : 'veg'),
                        inStock: item.isAvailable !== false && item.inStock !== false,
                        isAvailable: item.isAvailable !== false && item.inStock !== false,
                        availability: avail,
                        locationAvailability: avail,
                        isSpicy: item.isSpicy || false,
                        spicyLevel: item.spicyLevel || ((item.name && /thecha/i.test(item.name)) ? 3 : (item.isSpicy ? 1 : 0)),
                        image: resolvedImage,
                        isCraziestDeal: item.isCraziestDeal === true || item.category === 'Craziest Deals of the Hour' || (item.category && item.category.toLowerCase().includes('craziest deal')),
                        isCombo: item.isCombo || false
                    });
                });

                // Set live data and render UI IMMEDIATELY
                menuData = finalMenu;
                menuImageMap = Object.assign({}, DEFAULT_IMAGE_MAP, finalMap);
                isMenuDataLoaded = true;
                initMenuDisplay();

                // Safely cache without crashing on QuotaExceededError
                try {
                    const lightMenu = finalMenu.map(it => (it.image && it.image.startsWith('data:')) ? Object.assign({}, it, { image: '' }) : it);
                    localStorage.setItem('lw_cached_menu', JSON.stringify(lightMenu));
                    sessionStorage.setItem('littiWaleCachedMenu', JSON.stringify(lightMenu));
                } catch (e) {
                    console.warn('Storage quota notice, skipped local storage cache:', e);
                }
            } else if (!menuData || menuData.length === 0) {
                // If API is empty/unreachable and no cache, try loading local data/menu.json
                console.warn("%c⚠️ [LITTIWALE] Admin API unreachable or empty, loading local menu.json fallback", 'color:#eab308; font-weight:bold;');
                try {
                    const localMenu = await fetchWithTimeout('data/menu.json', 3000);
                    if (localMenu && Array.isArray(localMenu)) {
                        console.log('%c📁 [LITTIWALE] Loaded from local data/menu.json (' + localMenu.length + ' items)', 'color:#eab308;');
                        menuData = localMenu.map(it => {
                            const norm = getNormalizedName(it.name);
                            const img = it.image || DEFAULT_IMAGE_MAP[norm] || 'images/logo.png';
                            finalMap[norm] = img;
                            return Object.assign({}, it, { image: img });
                        });
                        menuImageMap = Object.assign({}, DEFAULT_IMAGE_MAP, finalMap);
                        isMenuDataLoaded = true;
                        initMenuDisplay();
                    }
                } catch(errLocal) {}
            }
        } catch (error) {
            console.error('Error processing menu from Admin API:', error);
            if (menuGrid && (!menuData || menuData.length === 0)) {
                menuGrid.innerHTML = '<div class="error" style="grid-column: 1/-1; text-align: center; color: red; padding: 20px;">Failed to load menu items from Admin API. Please refresh or check connection.</div>';
            }
        }
    }

    function applyHeroCms(setting) {
        if (!setting) return;
        const heroTagline = document.querySelector('.hero-text-content .cursive-tagline');
        if (heroTagline && setting.heroTagline) heroTagline.textContent = setting.heroTagline;

        const heroTitle = document.querySelector('.hero-text-content .hero-title');
        if (heroTitle && setting.heroTitle) {
            heroTitle.innerHTML = setting.heroTitle.replace(/♡/g, '<span>♡</span>');
        }

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle && setting.heroDesc) heroSubtitle.textContent = setting.heroDesc;

        const heroBtn1 = document.querySelector('.hero-buttons a.btn-primary');
        if (heroBtn1 && setting.heroBtn1Text) {
            heroBtn1.innerHTML = `<i class="fas fa-shopping-bag" style="margin-right: 8px;"></i> ${setting.heroBtn1Text}`;
            if (setting.heroBtn1Link) heroBtn1.href = setting.heroBtn1Link;
        }

        const heroBtn2 = document.querySelector('.hero-buttons a.btn-whatsapp');
        if (heroBtn2 && setting.heroBtn2Text) {
            heroBtn2.innerHTML = `<i class="fab fa-whatsapp" style="font-size: 1.2rem; margin-right: 6px;"></i> ${setting.heroBtn2Text}`;
            if (setting.heroBtn2Link) heroBtn2.href = setting.heroBtn2Link;
        }

        const heroBtn3 = document.querySelector('.hero-buttons button.btn-outline');
        if (heroBtn3 && setting.heroBtn3Text) heroBtn3.textContent = setting.heroBtn3Text;

        const trust1 = document.querySelector('.trust-badges-bar .trust-badge-item:nth-child(1) span');
        if (trust1 && setting.heroTrust1Text) trust1.textContent = setting.heroTrust1Text;

        const trust2 = document.querySelector('.trust-badges-bar .trust-badge-item:nth-child(2) span');
        if (trust2 && setting.heroTrust2Text) trust2.textContent = setting.heroTrust2Text;

        const badgeText = document.querySelector('.floating-food-badge span:nth-of-type(1)');
        if (badgeText && setting.heroBadgeText) badgeText.textContent = setting.heroBadgeText;

        const badgeSubtext = document.querySelector('.floating-food-badge span:nth-of-type(2)');
        if (badgeSubtext && setting.heroBadgeSubtext) badgeSubtext.textContent = setting.heroBadgeSubtext;

        const heroImg = document.querySelector('.hero-food-presentation img.hero-food-plate');
        if (heroImg) {
            heroImg.onerror = () => {
                heroImg.onerror = null;
                heroImg.src = 'images/logo.png';
            };
            if (setting.heroImage) {
                heroImg.src = setting.heroImage;
            }
        }
    }

    function applyAboutCms(setting) {
        if (!setting) return;
        const aboutTagline = document.querySelector('#about .cursive-tagline');
        if (aboutTagline && setting.aboutTagline) aboutTagline.textContent = setting.aboutTagline;

        const aboutHeading = document.querySelector('#about h2.luxury-heading');
        if (aboutHeading && setting.aboutHeading) {
            const parts = setting.aboutHeading.split(' ');
            if (parts.length > 1) {
                const last = parts.pop();
                aboutHeading.innerHTML = `${parts.join(' ')} <span>${last}</span>`;
            } else {
                aboutHeading.textContent = setting.aboutHeading;
            }
        }

        const storySub = document.querySelector('.about-card-story .cursive-subtitle');
        if (storySub && setting.aboutStorySubtitle) storySub.textContent = setting.aboutStorySubtitle;

        const storyTitle = document.querySelector('.about-card-story h2');
        if (storyTitle && setting.aboutStoryTitle) storyTitle.textContent = setting.aboutStoryTitle;

        const storyText = document.querySelector('.about-card-story p');
        if (storyText && setting.aboutStoryText) storyText.textContent = setting.aboutStoryText;

        const storyCta = document.querySelector('.about-card-story a.btn');
        if (storyCta && setting.aboutStoryCtaText) {
            storyCta.innerHTML = `${setting.aboutStoryCtaText} <i class="fab fa-whatsapp" style="margin-left: 6px;"></i>`;
            if (setting.aboutStoryCtaLink) storyCta.href = setting.aboutStoryCtaLink;
        }

        const aboutImg = document.querySelector('.about-ambience-card img');
        if (aboutImg && setting.aboutImage) aboutImg.src = setting.aboutImage;

        const statNum = document.querySelector('.ambience-stat-badge .stat-num');
        if (statNum && setting.statNum) statNum.textContent = setting.statNum;

        const statText = document.querySelector('.ambience-stat-badge .stat-text');
        if (statText && setting.statText) statText.innerHTML = setting.statText.replace(/\n/g, '<br>');

        // 4 Perks (Why Choose Us feature grid)
        const perk1H = document.querySelector('.about-features-4grid .feature-box-item:nth-child(1) h4');
        const perk1P = document.querySelector('.about-features-4grid .feature-box-item:nth-child(1) p');
        if (perk1H && setting.perk1Title) perk1H.textContent = setting.perk1Title;
        if (perk1P && setting.perk1Text) perk1P.textContent = setting.perk1Text;

        const perk2H = document.querySelector('.about-features-4grid .feature-box-item:nth-child(2) h4');
        const perk2P = document.querySelector('.about-features-4grid .feature-box-item:nth-child(2) p');
        if (perk2H && setting.perk2Title) perk2H.textContent = setting.perk2Title;
        if (perk2P && setting.perk2Text) perk2P.textContent = setting.perk2Text;

        const perk3H = document.querySelector('.about-features-4grid .feature-box-item:nth-child(3) h4');
        const perk3P = document.querySelector('.about-features-4grid .feature-box-item:nth-child(3) p');
        if (perk3H && setting.perk3Title) perk3H.textContent = setting.perk3Title;
        if (perk3P && setting.perk3Text) perk3P.textContent = setting.perk3Text;

        const perk4H = document.querySelector('.about-features-4grid .feature-box-item:nth-child(4) h4');
        const perk4P = document.querySelector('.about-features-4grid .feature-box-item:nth-child(4) p');
        if (perk4H && setting.perk4Title) perk4H.textContent = setting.perk4Title;
        if (perk4P && setting.perk4Text) perk4P.textContent = setting.perk4Text;

        // Bulk Order Banner
        const bulkTitle = document.querySelector('.reserve-banner-card .reserve-info h3');
        if (bulkTitle && setting.bulkBannerTitle) bulkTitle.textContent = setting.bulkBannerTitle;

        const bulkSub = document.querySelector('.reserve-banner-card .reserve-info p');
        if (bulkSub && setting.bulkBannerSub) bulkSub.textContent = setting.bulkBannerSub;

        const bulkCta = document.querySelector('.reserve-banner-card a.btn-whatsapp');
        if (bulkCta && setting.bulkBannerCtaText) {
            bulkCta.innerHTML = `<i class="fab fa-whatsapp" style="font-size: 1.2rem; margin-right: 8px;"></i> ${setting.bulkBannerCtaText}`;
            if (setting.bulkBannerCtaLink) bulkCta.href = setting.bulkBannerCtaLink;
        }
    }

    function applySeoCms(setting) {
        if (!setting) return;
        if (setting.seoTitle) {
            document.title = setting.seoTitle;
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = setting.seoTitle;
        }
        if (setting.seoDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = setting.seoDescription;
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.content = setting.seoDescription;
        }
        if (setting.seoKeywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) metaKeywords.content = setting.seoKeywords;
        }
        if (setting.seoOgImage) {
            const ogImg = document.querySelector('meta[property="og:image"]');
            if (ogImg) ogImg.content = setting.seoOgImage;
        }
        if (setting.googleVerificationTag) {
            let gvMeta = document.querySelector('meta[name="google-site-verification"]');
            if (!gvMeta) {
                gvMeta = document.createElement('meta');
                gvMeta.name = 'google-site-verification';
                document.head.appendChild(gvMeta);
            }
            gvMeta.content = setting.googleVerificationTag;
        }
    }

    function processSettings(apiSettings) {
        if (!apiSettings || !Array.isArray(apiSettings)) return;
        window.littiWaleSettings = apiSettings;

        // Extract Admin-controlled delivery rate (stored in Cloud Kitchen / store settings)
        const cloudSetting = apiSettings.find(s => s.storeId === 'cloud') || apiSettings[0] || {};
        const parsedDeliveryRate = Number(cloudSetting.deliveryRateKm || cloudSetting.deliveryRate || cloudSetting.deliveryRatePerKm);
        if (!isNaN(parsedDeliveryRate) && parsedDeliveryRate > 0) {
            window.adminDeliveryRate = parsedDeliveryRate;
        }

        // Apply Hero, About, Dabba & SEO CMS from live settings
        applyHeroCms(cloudSetting);
        applyAboutCms(cloudSetting);
        applySeoCms(cloudSetting);
        if (typeof window.updatePlanDataFromCms === 'function') {
            window.updatePlanDataFromCms(cloudSetting);
        }

        // Notify timing components
        document.dispatchEvent(new CustomEvent('littiWaleSettingsLoaded', { detail: apiSettings }));

        const currentLoc = sessionStorage.getItem('littiWaleLocation') || 'cloud';
        let isOffline = false;
        let offlineReason = '';
        
        const targetSetting = apiSettings.find(s => s.storeId === currentLoc) || apiSettings.find(s => s.storeId === 'cloud') || apiSettings[0];
        if (targetSetting && targetSetting.isOnline === false) {
            isOffline = true;
            offlineReason = targetSetting.offlineReason || `The ${targetSetting.storeName} is currently offline.`;
        }

        const existingBanner = document.getElementById('store-offline-banner');
        if (isOffline) {
            if (!existingBanner) {
                const banner = document.createElement('div');
                banner.id = 'store-offline-banner';
                banner.style.cssText = 'background-color: #ef4444; color: white; text-align: center; padding: 12px; font-weight: bold; position: sticky; top: 0; z-index: 9999; width: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.2);';
                banner.innerHTML = `⚠️ ${offlineReason}`;
                document.body.prepend(banner);
            } else {
                existingBanner.innerHTML = `⚠️ ${offlineReason}`;
            }
        } else if (existingBanner) {
            existingBanner.remove();
        }
    }

    // Dynamic Instagram Reels Renderer (Syncs 100% Live with Admin CMS)
    async function initReels(reelsData) {
        const grid = document.querySelector('.reels-grid');
        if (!grid) return;

        const defaultReels = [
            { badge: 'Popular', badgeClass: 'popular', image: 'images/instagram/reel1.png', link: 'https://www.instagram.com/reel/DM0OaRuTorz/' },
            { badge: 'Loved', badgeClass: 'loved', image: 'images/instagram/reel2.png', link: 'https://www.instagram.com/reel/DVOCmnIk-Yt/' },
            { badge: 'Popular', badgeClass: 'popular', image: 'images/instagram/reel3.png', link: 'https://www.instagram.com/reel/DUsneR7E1Vh/' },
            { badge: 'Popular', badgeClass: 'popular', image: 'images/instagram/reel4.png', link: 'https://www.instagram.com/reel/DU20uoDE9vY/' },
            { badge: 'Loved', badgeClass: 'loved', image: 'images/instagram/reel5.png', link: 'https://www.instagram.com/reel/DUVd2y6k_bG/' },
            { badge: 'Popular', badgeClass: 'popular', image: 'images/instagram/reel6.png', link: 'https://www.instagram.com/reel/DTcsHKbE2C7/' }
        ];

        let list = reelsData;
        if (!list || !Array.isArray(list) || list.length === 0) {
            try {
                const res = await fetchWithTimeout(`${ADMIN_API_BASE_URL}/reels`, 4000);
                if (res && Array.isArray(res) && res.length > 0) list = res;
            } catch(e) {}
        }

        if (!list || !Array.isArray(list) || list.length === 0) list = defaultReels;

        grid.innerHTML = list.map(item => `
            <a href="${item.link || item.url || '#'}" target="_blank" class="reel-card" title="Watch on Instagram">
                <span class="reel-badge ${item.badgeClass || (item.badge === 'Loved' ? 'loved' : 'popular')}">${item.badge || 'Popular'}</span>
                <img src="${item.image || item.thumbnail || 'images/logo.png'}" alt="Littiwale Customer Review Reel" onerror="this.src='images/logo.png'">
            </a>
        `).join('');
    }

    // Helper: Normalize item name for image lookup
    function getNormalizedName(name) {
        if (!name) return "";
        return name.replace(/\(.*?\)/g, "").toLowerCase().trim();
    }

    // Helper: Get item image with fallback
    function getItemImage(name) {
        if (!name) return 'images/logo.png';
        const normalized = getNormalizedName(name);
        if (menuImageMap && menuImageMap[normalized] && menuImageMap[normalized] !== 'images/logo.png') {
            return menuImageMap[normalized];
        }
        if (typeof DEFAULT_IMAGE_MAP !== 'undefined' && DEFAULT_IMAGE_MAP[normalized]) {
            return DEFAULT_IMAGE_MAP[normalized];
        }
        return 'images/logo.png';
    }

    // Helper: Get Craziest Deal image (Folder based)
    function getDealImage(title) {
        if (!title) return 'images/logo.png';
        const normalized = getNormalizedName(title);
        if (menuImageMap && menuImageMap[normalized] && menuImageMap[normalized] !== 'images/logo.png') {
            return menuImageMap[normalized];
        }
        if (typeof DEFAULT_IMAGE_MAP !== 'undefined' && DEFAULT_IMAGE_MAP[normalized]) {
            return DEFAULT_IMAGE_MAP[normalized];
        }
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `images/menu/Craziest Deal Menu/${slug}.png`;
    }

    // Helper: Determine Smart 3-Tier Spicy Chilli Icon (Clean Emoji Badge, No Text!)
    function getSpicyChilliBadge(item, combinedText) {
        const text = (combinedText || "").toLowerCase();
        const category = (item.category || "").toLowerCase();

        // 1. NON-SPICY EXCLUSIONS (Drinks, Desserts, Shakes, Lassi, Plain Rice, Breads, Mild Sweets)
        const isNonSpicyCategory = /drink|beverage|shake|coffee|tea|lassi|dessert|sweet|bread|paratha|naan|roti/i.test(category);
        const isNonSpicyItem = /shake|coffee|tea|lassi|buttermilk|mojito|soda|water|ice cream|crush|smoothie|juice|sweet|dessert|gulab jamun|rasgulla|kheer|butter masala|shahi|korma|malai|dal makhani|plain|rice|jeera|bread|roti|naan|litti/i.test(text);

        if (isNonSpicyCategory || isNonSpicyItem) {
            // Exception: Only show if explicitly named 'chilly', 'schezwan', 'thecha', or 'naga'
            if (!/thecha|chilly|chilli|schezwan|naga/i.test(text)) {
                return '';
            }
        }

        // 2. LEVEL 3 (Triple Chilli 🌶️🌶️🌶️): Thecha items or explicit spicyLevel === 3
        if (item.spicyLevel === 3 || text.includes('thecha')) {
            return '<span class="spicy-chilli-badge" title="Extreme Spicy Level 3">🌶️🌶️🌶️</span>';
        }

        // 3. LEVEL 2 (Double Chilli 🌶️🌶️): Chilly, Schezwan, Naga, Volcano, Peri Peri, or explicit spicyLevel === 2
        if (item.spicyLevel === 2 || /chilly|chilli|schezwan|naga|volcano|fire/i.test(text)) {
            return '<span class="spicy-chilli-badge" title="Medium Spicy Level 2">🌶️🌶️</span>';
        }

        // 4. LEVEL 1 (Single Chilli 🌶️): Explicitly spicy items, Kadai, Vindaloo, Kolhapuri, Tikka Masala, Chatpata, or item.spicyLevel === 1
        if (item.spicyLevel === 1 || /\b(spicy|chatpata|peri peri|kolhapuri|vindaloo|kadai|tandoori tikka)\b/i.test(text)) {
            return '<span class="spicy-chilli-badge" title="Spicy Level 1">🌶️</span>';
        }

        return '';
    }

    // Initialize Live Admin Announcements
    let announcementInterval = null;
    function initAnnouncements(announcements) {
        const section = document.getElementById('announcement');
        const carousel = document.getElementById('announcement-carousel');
        const dotsContainer = document.getElementById('announcement-dots');
        if (!section || !carousel) return;

        if (announcementInterval) {
            clearInterval(announcementInterval);
            announcementInterval = null;
        }

        if (!announcements || !Array.isArray(announcements) || announcements.length === 0) {
            section.style.display = 'none';
            return;
        }

        const active = announcements.filter(a => a.isActive !== false);
        if (active.length === 0) {
            section.style.display = 'none';
            return;
        }

        let slidesHtml = '';
        let dotsHtml = '';

        active.forEach((item, index) => {
            const imgUrl = item.image || item.imageUrl || 'images/logo.png';
            slidesHtml += `
                <div class="announcement-slide" style="min-width: 100%; box-sizing: border-box; text-align: center; padding: 0 8px;">
                    <div style="width: 100%; max-width: 760px; margin: 0 auto; border-radius: 14px; overflow: hidden; border: 1.5px solid rgba(249, 115, 22, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.6); background: #0c0c0e;">
                        <img src="${imgUrl}" alt="Announcement" style="width: 100%; height: auto; max-height: 400px; object-fit: contain; display: block; margin: 0 auto;">
                    </div>
                </div>
            `;
            dotsHtml += `<span class="dot ${index === 0 ? 'active' : ''}" data-idx="${index}" style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${index === 0 ? '#f97316' : 'rgba(255,255,255,0.3)'}; margin:0 5px; cursor:pointer; transition:all 0.2s ease;"></span>`;
        });

        carousel.innerHTML = slidesHtml;
        section.style.display = 'block';

        let currentIndex = 0;
        function updateSlide(idx) {
            currentIndex = (idx + active.length) % active.length;
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach((d, i) => {
                    d.style.background = (i === currentIndex) ? '#f97316' : 'rgba(255,255,255,0.3)';
                    d.style.transform = (i === currentIndex) ? 'scale(1.25)' : 'scale(1)';
                });
            }
        }

        if (dotsContainer) {
            dotsContainer.innerHTML = dotsHtml;
            dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateSlide(idx);
                });
            });
        }

        // Touch Swipe Navigation for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                updateSlide(currentIndex + 1);
            } else if (touchEndX - touchStartX > 50) {
                updateSlide(currentIndex - 1);
            }
        }, { passive: true });

        if (active.length > 1) {
            announcementInterval = setInterval(() => {
                updateSlide(currentIndex + 1);
            }, 4500);
        }
    }

    let isMenuExpanded = false;
    let initialBestsellers = [];
    let currentFilteredData = [];
    let currentDietaryFilter = 'all';
    let currentLocationFilter = 'all'; // 'all' | 'cloud' | 'outlet'

    let CATEGORY_ORDER = [
        "Star Special", "Littiwale Mega Feast", "Littiwale Meal for One", "Littiwale Rice Bowl Combos",
        "Tiffin Specials", "Momos", "Pizza", "Sandwiches", "Maggi", "Pasta",
        "Soup", "Starters", "Noodles/Rice", "Main Course", "Breads", "Thali",
        "Parathas", "Daily Meal Specials", "Drinks", "Extras"
    ];

    function applyLiveCategories(apiCategories) {
        if (!apiCategories || !Array.isArray(apiCategories) || apiCategories.length === 0) return;
        window.liveCategories = apiCategories;
        const activeCats = apiCategories
            .filter(c => c.isAvailable !== false && c.isActive !== false)
            .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0))
            .map(c => c.name);
        if (activeCats.length > 0) {
            CATEGORY_ORDER = activeCats;
            if (isMenuDataLoaded) {
                initMenuDisplay();
            }
        }
    }

    async function loadLiveCoupons() {
        try {
            const apiCoupons = await fetchWithTimeout(`${ADMIN_API_BASE_URL}/coupons`, 5000);
            if (apiCoupons && Array.isArray(apiCoupons) && apiCoupons.length > 0) {
                availableCoupons = apiCoupons.map(c => ({
                    code: c.code,
                    type: c.discountType === 'percentage' ? 'PERCENT' : 'FLAT',
                    discount: Number(c.discountValue) || 0,
                    discountPercent: Number(c.discountValue) || 0,
                    maxDiscount: Number(c.discountValue) || 0,
                    minOrder: Number(c.minOrderValue) || 0,
                    active: c.isActive !== false
                }));
                window.liveCoupons = availableCoupons;
                return availableCoupons;
            }
        } catch (e) {
            console.error("Error loading coupons from Admin API:", e);
        }
        return availableCoupons || [];
    }

    function initMenuDisplay() {
        const path = window.location.pathname;
        const isFullMenuPage = path.includes('menu.html') || path.endsWith('/menu') || path.endsWith('/menu/');
        const isOutletMenuPage = path.includes('outlet-menu');

        if (isOutletMenuPage) {
            renderOutletMenuPage(menuData);
            return;
        }

        if (isFullMenuPage) {
            isMenuExpanded = true;
            // Filter menuData to include only items available for Cloud Kitchen delivery (excluding Craziest Deals promo combos)
            const cloudOnlyMenu = menuData.filter(item => {
                const avail = (item.availability || item.locationAvailability || 'both').toLowerCase();
                const isCloudAvailable = avail === 'both' || avail.includes('cloud');
                const catLower = (item.category || '').toLowerCase();
                const nameLower = (item.name || '').toLowerCase();
                const isDealOrPromo = catLower.includes('deal') || catLower.includes('craziest') || item.isCraziestDeal === true;
                return isCloudAvailable && !isDealOrPromo;
            });
            currentFilteredData = cloudOnlyMenu;
            if (categoryFilters) categoryFilters.style.display = 'flex';

            setupFilters(cloudOnlyMenu);
            renderMenu(cloudOnlyMenu);
            
            // Hide the "View Full Menu" button on the dedicated menu page
            const toggleContainer = document.getElementById('menu-toggle-container');
            if (toggleContainer) toggleContainer.style.display = 'none';
        } else {
            const itemsPool = (menuData && Array.isArray(menuData) && menuData.length > 0) ? menuData : initialBestsellers;
            if (itemsPool && itemsPool.length > 0) {
                const availableCloudItems = itemsPool.filter(item => {
                    const isInStock = item.inStock !== false;
                    const avail = (item.availability || item.locationAvailability || 'both').toLowerCase();
                    const isCloudAvailable = avail === 'both' || avail.includes('cloud');
                    const catLower = (item.category || '').toLowerCase();
                    const nameLower = (item.name || '').toLowerCase();
                    const isDealOrPromo = catLower.includes('deal') || catLower.includes('craziest') || nameLower.includes('khila de') || nameLower.includes('diet bhool') || nameLower.includes('bhook lagi');
                    return isInStock && isCloudAvailable && !isDealOrPromo;
                });

                // Group all available items into complete variant groups FIRST
                const allCloudGroups = Object.values(buildMenuGrouping(availableCloudItems));
                const shuffledGroups = [...allCloudGroups].sort(() => 0.5 - Math.random()).slice(0, 6);
                renderBestSellers(shuffledGroups);
            }
            
            generateSmartDeals();
        }
    }
    
    // =========================================================================
    // SMART DEALS ENGINE
    // =========================================================================
    const DEAL_NAMES = [
        "Kuch bhi khila de 😭",
        "Tera jo mann wo khila de 😏",
        "Aaj diet bhool ja 😈",
        "Bhook lagi hai boss 🔥",
        "Pet bhar combo 💀"
    ];

    function generateSmartDeals() {
        const dealsSection = document.getElementById('craziest-deals-section');
        const dealsGrid = document.getElementById('deals-grid');
        if (!dealsSection || !dealsGrid) return;
        
        // Priority 1: Check if admin configured custom Craziest Deals exist in DB
        const dbDeals = (menuData || []).filter(item => {
            const cat = (item.category || '').toLowerCase();
            return cat === 'craziest deals of the hour' || cat.includes('craziest deal') || item.isCraziestDeal === true;
        });

        if (dbDeals && dbDeals.length > 0) {
            renderConfiguredDeals(dbDeals, dealsGrid);
            dealsSection.style.display = 'block';
            return;
        }

        // Priority 2: Auto-Generated Hourly Smart Deals Pool
        const now = new Date();
        const hourStr = now.toDateString() + '_' + now.getHours();
        const storedDate = localStorage.getItem('littiWaleDealsDateHour');
        let smartDeals = [];

        if (storedDate === hourStr) {
            const raw = localStorage.getItem('littiWaleDealsData');
            if (raw) {
                try {
                    smartDeals = JSON.parse(raw);
                } catch(e) {}
            }
        }

        if (!smartDeals || smartDeals.length === 0) {
            const pool = menuData.filter(item => {
                const catLower = (item.category || '').toLowerCase();
                const nameLower = (item.name || '').toLowerCase();
                if (catLower.includes('thali') || catLower.includes('combo')) return false;
                if (nameLower.includes('thali') || nameLower.includes('combo')) return false;
                if (catLower.includes('deal') || catLower.includes('craziest')) return false;
                return true;
            });
            
            if (pool.length < 4) return;

            const numDeals = Math.min(pool.length, Math.floor(Math.random() * 3) + 3); // 3 to 5
            smartDeals = [];
            
            const shuffledNames = [...DEAL_NAMES].sort(() => 0.5 - Math.random());
            
            for (let i=0; i<numDeals; i++) {
                const i1 = pool[Math.floor(Math.random() * pool.length)];
                let i2 = pool[Math.floor(Math.random() * pool.length)];
                
                let retries = 0;
                while (retries < 10 && (i1.id === i2.id || (i1.category === i2.category && i1.category !== 'Pizza' && i1.category !== 'Sandwiches'))) {
                    i2 = pool[Math.floor(Math.random() * pool.length)];
                    retries++;
                }

                const price1 = i1.price || i1.full || i1.half || 100;
                const price2 = i2.price || i2.full || i2.half || 100;
                const origTotal = price1 + price2;
                
                const marginPercent = Math.floor(Math.random() * 11) + 5;
                let finalPrice = Math.floor(origTotal * (1 + (marginPercent/100)));
                finalPrice = Math.floor(finalPrice / 10) * 10 + 9;
                
                if (finalPrice <= origTotal) {
                    finalPrice = Math.floor(origTotal) + 9;
                }
                
                const fakeMargin = Math.floor(Math.random() * 21) + 25;
                const fakePrice = Math.floor(origTotal * (1 + (fakeMargin/100)));

                smartDeals.push({
                    id: 'deal_' + Date.now() + '_' + i,
                    title: shuffledNames[i % shuffledNames.length],
                    item1: i1,
                    item2: i2,
                    price1: price1,
                    price2: price2,
                    finalPrice: finalPrice,
                    fakePrice: fakePrice
                });
            }
            localStorage.setItem('littiWaleDealsDateHour', hourStr);
            localStorage.setItem('littiWaleDealsData', JSON.stringify(smartDeals));
        }

        renderSmartDeals(smartDeals, dealsGrid);
        dealsSection.style.display = 'block';
    }

    function renderConfiguredDeals(deals, grid) {
        grid.innerHTML = '';
        deals.forEach(deal => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.style.background = 'linear-gradient(145deg, #1f1f1f, #141414)';
            card.style.border = '1px solid var(--primary-color)';
            
            const origPrice = Number(deal.originalPrice || 0);
            const dealPrice = Number(deal.price || 0);
            const discountPct = (origPrice > dealPrice && origPrice > 0) ? Math.round(((origPrice - dealPrice) / origPrice) * 100) : 0;
            const savings = origPrice > dealPrice ? (origPrice - dealPrice) : 0;
            const dealNote = deal.note || deal.description || 'Special Chef Discount Combo';
            const dealImage = deal.image || getDealImage(deal.name);
            const safeAddCall = `window.addDealToCart('${deal._id || deal.id}', '${(deal.name || '').replace(/'/g, "\\'")}', ${dealPrice}, ${origPrice || dealPrice}, '${dealNote.replace(/'/g, "\\'")}', '${dealImage}');`;

            card.innerHTML = `
                <div class="menu-img-container image-wrapper" style="position:relative;">
                    <img src="${dealImage}" class="menu-img" loading="lazy" onerror="this.src='images/logo.png'">
                    ${discountPct > 0 ? `
                    <div style="position:absolute; top:10px; right:10px; background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; font-size:11px; font-weight:800; padding:4px 8px; border-radius:6px; box-shadow:0 4px 10px rgba(0,0,0,0.5);">
                        🔥 ${discountPct}% OFF
                    </div>
                    ` : ''}
                </div>
                <div class="menu-details menu-card-content">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size: 0.8rem; color: #facc15; font-weight: 800; text-transform:uppercase; letter-spacing:0.5px;">🔥 CRAZIEST DEAL</span>
                        ${savings > 0 ? `<span style="font-size:0.75rem; color:#4ade80; font-weight:700; background:rgba(34,197,94,0.12); padding:2px 6px; border-radius:4px;">Save ₹${savings}</span>` : ''}
                    </div>
                    <div class="menu-title-row" style="margin-bottom: 5px;">
                        <h3 class="menu-title menu-card-title">${deal.name}</h3>
                    </div>
                    <p class="menu-desc" style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px; line-height:1.4;">
                        ${dealNote}
                    </p>
                    <div class="menu-title-row" style="margin-bottom:12px;">
                        <div style="display:flex; align-items:baseline; gap:8px;">
                            <span class="menu-price" style="font-size: 1.35rem; color:#4ade80; font-weight:900;">₹${dealPrice}</span>
                            ${origPrice > dealPrice ? `<span style="text-decoration: line-through; color: #94a3b8; font-size: 0.95rem;">₹${origPrice}</span>` : ''}
                        </div>
                    </div>
                    <div class="button-wrapper">
                        <button class="add-to-cart-btn add-to-cart" onclick="${safeAddCall}">Grab this Deal 🛒</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function renderSmartDeals(deals, grid) {
        grid.innerHTML = '';
        deals.forEach(deal => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.style.background = 'linear-gradient(145deg, #1f1f1f, #141414)';
            card.style.border = '1px solid var(--primary-color)';
            
            const noteText = `Includes: ${deal.item1.name} + ${deal.item2.name}`.replace(/'/g, "\\'");
            const dealImage = getDealImage(deal.title);
            const safeAddCall = `window.addDealToCart('${deal.id}', '${deal.title.replace(/'/g, "\\'")}', ${deal.finalPrice}, ${deal.fakePrice}, '${noteText}', '${dealImage}');`;

            card.innerHTML = `
                <div class="menu-img-container image-wrapper">
                    <img src="${dealImage}" class="menu-img" loading="lazy" onerror="this.src='images/logo.png'">
                </div>
                <div class="menu-details menu-card-content">
                    <div style="font-size: 0.85rem; color: #facc15; font-weight: bold; margin-bottom:5px;">HOURLY DEAL</div>
                    <div class="menu-title-row" style="margin-bottom: 5px;">
                        <h3 class="menu-title menu-card-title">${deal.title}</h3>
                    </div>
                    <p class="menu-desc" style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 10px;">
                        Includes: <strong>${deal.item1.name}</strong> + <strong>${deal.item2.name}</strong>
                    </p>
                    <div class="menu-title-row">
                        <div>
                            <span style="text-decoration: line-through; color: #888; margin-right: 5px; font-size: 0.9rem;">₹${deal.fakePrice}</span>
                            <span class="menu-price" style="font-size: 1.3rem;">₹${deal.finalPrice}</span>
                        </div>
                    </div>
                    <div class="button-wrapper">
                        <button class="add-to-cart-btn add-to-cart" onclick="${safeAddCall}">Grab this Deal</button>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });
    }
    // =========================================================================

    function setupExpandButton() {
        // Obsolete for Best Seller section, button is now static in HTML
    }

    function createMenuCard(group) {
        const card = document.createElement('div');
        card.className = 'menu-card';
        
        let btnHtml = '';
        const itemImg = group.image;

        let allOutOfStock = true;
        const isOutletView = (typeof currentLocationFilter !== 'undefined' && currentLocationFilter === 'outlet');

        // Case 1: Dual Variants (Half & Full, or Option 1 & Option 2 like Sweet / Salted)
        const v1 = group.variants.half || group.variants.opt1;
        const v2 = group.variants.full || group.variants.opt2;
        const v1Label = group.variants.half ? 'Half' : (group.variants.opt1?.label || 'Option 1');
        const v2Label = group.variants.full ? 'Full' : (group.variants.opt2?.label || 'Option 2');

        if (v1 && v2) {
            const v1InStock = isOutletView ? false : v1.inStock;
            const v2InStock = isOutletView ? false : v2.inStock;

            if (v1InStock !== false || v2InStock !== false) {
                allOutOfStock = false;
            }

            // Variants for descriptions with robust fallback across variants
            const sharedDesc = (group.description && group.description !== 'nan' && group.description !== 'undefined' && group.description.trim() !== '') 
                ? group.description 
                : ((v2 && v2.description && v2.description !== 'nan' && v2.description !== 'undefined' && v2.description.trim() !== '') 
                    ? v2.description 
                    : ((v1 && v1.description && v1.description !== 'nan' && v1.description !== 'undefined' && v1.description.trim() !== '') ? v1.description : ""));

            const v1Desc = (v1 && v1.description && v1.description !== 'nan' && v1.description !== 'undefined' && v1.description.trim() !== '') ? v1.description : sharedDesc;
            const v2Desc = (v2 && v2.description && v2.description !== 'nan' && v2.description !== 'undefined' && v2.description.trim() !== '') ? v2.description : sharedDesc;
            
            // Base ID for the description container
            const baseId = v1.id.replace(/-half|_half|-opt1/g, '');

            const v1Controls = v1InStock === false 
                ? (isOutletView 
                    ? `<span style="color:#ef4444; font-weight:bold; font-size:0.75rem; padding:4px 0; display:block; text-align:center;">Not at Outlet</span>`
                    : `<span style="color:#ef4444; font-weight:bold; font-size:0.85rem; padding:4px 0;">Out of stock</span>`)
                : `<button class="hf-btn minus" onclick="event.stopPropagation(); updateQuantity('${v1.id}', -1)">-</button>
                   <span class="hf-value" id="hf-val-${v1.id}">0</span>
                   <button class="hf-btn plus" onclick="event.stopPropagation(); addToCart('${v1.id}', '${v1.name.replace(/'/g, "\\'")}', ${v1.price}, '${itemImg}'); if(document.getElementById('desc-${baseId}')) document.getElementById('desc-${baseId}').innerText = '${v1Desc.replace(/'/g, "\\'")}';">+</button>`;

            const v2Controls = v2InStock === false 
                ? (isOutletView 
                    ? `<span style="color:#ef4444; font-weight:bold; font-size:0.75rem; padding:4px 0; display:block; text-align:center;">Not at Outlet</span>`
                    : `<span style="color:#ef4444; font-weight:bold; font-size:0.85rem; padding:4px 0;">Out of stock</span>`)
                : `<button class="hf-btn minus" onclick="event.stopPropagation(); updateQuantity('${v2.id}', -1)">-</button>
                   <span class="hf-value" id="hf-val-${v2.id}">0</span>
                   <button class="hf-btn plus" onclick="event.stopPropagation(); addToCart('${v2.id}', '${v2.name.replace(/'/g, "\\'")}', ${v2.price}, '${itemImg}'); if(document.getElementById('desc-${baseId}')) document.getElementById('desc-${baseId}').innerText = '${v2Desc.replace(/'/g, "\\'")}';">+</button>`;

            let switchBtn = isOutletView 
                ? `<div style="margin-top: 12px; width: 100%;">
                     <button class="add-to-cart-btn" style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: #fff; border: none; font-weight: 600; box-shadow: 0 4px 15px rgba(124,58,237,0.3); width: 100%; padding: 8px; border-radius: 8px;" onclick="document.querySelector('[data-loc=\\'cloud\\']').click();">
                         ☁️ Check Cloud Kitchen Menu
                     </button>
                   </div>`
                : '';

            btnHtml = `
                <div class="half-full-wrapper">
                    <div class="half-full-box">
                        <div class="hf-label">${v1Label}</div>
                        <div class="hf-price">₹${v1.price}</div>
                        <div class="hf-controls">
                            ${v1Controls}
                        </div>
                    </div>
                    <div class="half-full-box">
                        <div class="hf-label">${v2Label}</div>
                        <div class="hf-price">₹${v2.price}</div>
                        <div class="hf-controls">
                            ${v2Controls}
                        </div>
                    </div>
                </div>
                ${switchBtn}
            `;
        } 
        // Case 2: Standard Single Item
        else {
            const item = group.variants.standard || group.variants.half || group.variants.full || group.variants.opt1;
            const effInStock = isOutletView ? false : item.inStock;

            if (effInStock !== false) {
                allOutOfStock = false;
            }

            if (effInStock === false) {
                if (isOutletView) {
                    btnHtml = `
                        <div style="width:100%; display: flex; flex-direction: column; gap: 8px;">
                            <div style="color: #ef4444; font-size: 0.85rem; font-weight: bold; text-align: center;">Not available at Physical Outlet</div>
                            <button class="add-to-cart-btn" style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: #fff; border: none; font-weight: 600; box-shadow: 0 4px 15px rgba(124,58,237,0.3);" onclick="document.querySelector('[data-loc=\\'cloud\\']').click();">
                                ☁️ Check Cloud Kitchen Menu
                            </button>
                        </div>
                    `;
                } else {
                    btnHtml = `
                        <div style="width:100%;">
                            <button class="add-to-cart-btn" style="background:#333; color:#888; border:1px solid #444; cursor:not-allowed;" disabled>Out of stock</button>
                        </div>
                    `;
                }
            } else {
                // Desktop button HTML (hidden on mobile via CSS .menu-card-actions {display:none})
                btnHtml = `
                    <div id="menu-btn-container-${item.id}" style="width:100%;">
                        <button id="menu-add-btn-${item.id}" class="add-to-cart-btn add-to-cart" onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}',${ item.price}, '${itemImg}')">
                            <span class="btn-desktop-text">Add to Cart — ₹${item.price}</span>
                            <span class="btn-mobile-text">ADD +</span>
                        </button>
                        <div id="menu-qty-ctrl-${item.id}" class="menu-qty-ctrl" style="display:none; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.85); border: 1.5px solid #22c55e; border-radius:10px; padding:2px; height: 32px;">
                            <button class="qty-btn minus" style="background:transparent; border:none; width:30px; height:100%; font-weight:bold; color:#22c55e; cursor:pointer;" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span id="menu-qty-val-${item.id}" class="qty-val" style="font-weight:800; color:#ffffff; font-size:0.95rem;">0</span>
                            <button class="qty-btn plus" style="background:#22c55e; border:none; border-radius:6px; width:28px; height:26px; font-weight:bold; color:#000000; cursor:pointer;" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                `;
                // Store item id for mobile overlay injection after card is built
                card._mobStdItemId   = item.id;
                card._mobStdItemName = item.name;
                card._mobStdItemPrice= item.price;
                card._mobStdItemImg  = itemImg;
            }
        }

        // Determine Veg/Non-Veg FSSAI Icon
        const baseItem = group.variants.standard || group.variants.half || group.variants.full || group.variants.opt1;
        const combinedText = (group.displayName + " " + (group.description || "")).toLowerCase();
        const isEggless = combinedText.includes("eggless");
        const hasNonVegWords = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
        const isNonVeg = baseItem.veg === 'nonveg' || (!isEggless && hasNonVegWords);
        
        const fssaiIcon = isNonVeg 
            ? '<span class="fssai-icon nonveg-icon" title="Non-Veg"><span class="fssai-dot"></span></span>' 
            : '<span class="fssai-icon veg-icon" title="Pure Veg"><span class="fssai-dot"></span></span>';
        
        // Determine 3-Tier Spicy Chilli Icons (Clean Emoji Badge, No Text!)
        const spicyBadge = getSpicyChilliBadge(baseItem, combinedText);

        // Stock Badge
        const stockBadge = allOutOfStock ? '<span class="food-tag out-of-stock-tag">Out of Stock</span>' : '';

        // Determine price display
        let priceDisplay = '';
        if (v1 && v2) {
            priceDisplay = `₹${v1.price} <span style="font-size:0.75rem; color:#94a3b8; font-weight:normal;">(${v1Label})</span> • ₹${v2.price} <span style="font-size:0.75rem; color:#94a3b8; font-weight:normal;">(${v2Label})</span>`;
        } else {
            const stdItem = group.variants.standard || group.variants.half || group.variants.full || group.variants.opt1;
            priceDisplay = `₹${stdItem.price}`;
        }

        // Determine description and baseId for dynamic updates
        const v1Desc = (v1 && v1.description && v1.description !== 'nan' && v1.description !== 'undefined') ? v1.description : "";
        const v2Desc = (v2 && v2.description && v2.description !== 'nan' && v2.description !== 'undefined') ? v2.description : "";
        
        let currentDesc = v1Desc || v2Desc || group.description || "";
        if (currentDesc === 'nan' || currentDesc === 'undefined') currentDesc = "";
        
        const baseId = (group.variants.half || group.variants.full || group.variants.opt1 || group.variants.standard).id.replace(/-half|_half|-full|_full|-opt1/g, '');

        card.innerHTML = `
            <div class="menu-img-container image-wrapper">
                <img src="${itemImg}" class="menu-img" loading="lazy" onerror="this.src='images/logo.png'">
            </div>
            <div class="menu-details menu-card-content">
                <div class="menu-meta-top">
                    <div class="food-tag-container" style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">${fssaiIcon}${spicyBadge}${stockBadge}</div>
                </div>
                <div class="menu-title-row">
                    <h3 class="menu-title menu-card-title">${group.displayName}</h3>
                </div>
                <div class="menu-price-row">
                    <span class="menu-item-price">${priceDisplay}</span>
                </div>
                <p class="menu-desc" id="desc-${baseId}">${currentDesc}</p>
            </div>
            <div class="menu-card-actions button-wrapper">
                ${btnHtml}
            </div>
        `;

        // ---- MOBILE OVERLAY BUTTONS (injected inside image container) ----
        const imgContainer = card.querySelector('.menu-img-container');
        if (imgContainer) {
            if (v1 && v2 && !allOutOfStock) {
                // Dual Variants (Half/Full or Options)
                const v1Qty = getCartQty(v1.id);
                const v2Qty = getCartQty(v2.id);
                const totalInCart = v1Qty + v2Qty;

                const mobAddBtn = document.createElement('button');
                mobAddBtn.className = 'mob-add-btn';
                mobAddBtn.textContent = 'ADD +';

                const mobQty = document.createElement('div');
                mobQty.className = 'mob-qty-ctrl';
                mobQty.innerHTML = `
                    <button class="mq-minus sq-btn">−</button>
                    <span class="mq-val">${totalInCart > 0 ? totalInCart : 1}</span>
                    <button class="mq-plus sq-btn">+</button>
                `;

                if (totalInCart > 0) {
                    mobAddBtn.style.display = 'none';
                    mobQty.style.display = 'flex';
                } else {
                    mobAddBtn.style.display = 'flex';
                    mobQty.style.display = 'none';
                }

                mobAddBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openHFVariantSheet(group.displayName, v1, v2, itemImg, mobAddBtn, v1Label, v2Label);
                });

                mobQty.querySelector('.mq-plus').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openHFVariantSheet(group.displayName, v1, v2, itemImg, mobAddBtn, v1Label, v2Label);
                });
                mobQty.querySelector('.mq-minus').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openHFVariantSheet(group.displayName, v1, v2, itemImg, mobAddBtn, v1Label, v2Label);
                });
                mobQty.querySelector('.mq-val').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openHFVariantSheet(group.displayName, v1, v2, itemImg, mobAddBtn, v1Label, v2Label);
                });

                imgContainer.appendChild(mobAddBtn);
                imgContainer.appendChild(mobQty);

            } else if (card._mobStdItemId) {
                // Standard item: ADD+ → qty ctrl inline
                const id    = card._mobStdItemId;
                const name  = card._mobStdItemName;
                const price = card._mobStdItemPrice;
                const img   = card._mobStdItemImg;
                const existingQty = getCartQty(id);

                const mobAdd = document.createElement('button');
                mobAdd.className = 'mob-add-btn';
                mobAdd.id = `mob-add-${id}`;
                mobAdd.textContent = 'ADD +';

                const mobQty = document.createElement('div');
                mobQty.className = 'mob-qty-ctrl';
                mobQty.id = `mob-qty-${id}`;
                mobQty.innerHTML = `
                    <button class="mq-minus sq-btn" onclick="event.stopPropagation(); mobUpdateQty('${id}','${name.replace(/'/g,"\\'")}',${price},'${img}',-1)">−</button>
                    <span class="mq-val" id="mob-qval-${id}">${existingQty > 0 ? existingQty : 1}</span>
                    <button class="mq-plus sq-btn" onclick="event.stopPropagation(); mobUpdateQty('${id}','${name.replace(/'/g,"\\'")}',${price},'${img}',1)">+</button>
                `;

                if (existingQty > 0) {
                    mobAdd.style.display = 'none';
                    mobQty.style.display = 'flex';
                } else {
                    mobAdd.style.display = 'flex';
                    mobQty.style.display = 'none';
                }

                mobAdd.addEventListener('click', (e) => {
                    e.stopPropagation();
                    addToCart(id, name, price, img);
                });

                imgContainer.appendChild(mobAdd);
                imgContainer.appendChild(mobQty);
            }
        }

        return card;
    }

    function renderOutletMenuPage(data) {
        const outletGrid = document.getElementById('outlet-menu-grid');
        if (!outletGrid) return;
        
        // Strict Filter for 100% Pure Veg items available at Physical Outlet (Exclude cloud_only items)
        const outletItems = data.filter(item => {
            const isVeg = item.dietaryPreference !== 'non-veg' && item.veg !== 'nonveg';
            const combinedText = ((item.name || '') + ' ' + (item.category || '')).toLowerCase();
            const isNonVeg = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
            
            const avail = (item.availability || item.locationAvailability || 'both').toLowerCase();
            const isOutletAllowed = avail === 'both' || avail.includes('outlet');

            return isVeg && !isNonVeg && isOutletAllowed;
        });

        if (!outletItems || outletItems.length === 0) {
            outletGrid.innerHTML = '<div style="color:#aaa; text-align:center; grid-column:1/-1;">Loading Physical Outlet items...</div>';
            return;
        }

        // Group items by category
        const categoriesMap = {};
        
        outletItems.forEach(item => {
            const cat = item.category || 'Specialties';
            if (!categoriesMap[cat]) {
                categoriesMap[cat] = [];
            }
            
            // Deduplicate variants into base items
            const baseName = getNormalizedName(item.name);
            if (!categoriesMap[cat].some(i => getNormalizedName(i.name) === baseName)) {
                categoriesMap[cat].push(item);
            }
        });

        // Order categories using CATEGORY_ORDER plus any extras
        const presentCategories = Object.keys(categoriesMap);
        const orderedCategories = CATEGORY_ORDER.filter(c => presentCategories.includes(c));
        presentCategories.forEach(c => {
            if (!orderedCategories.includes(c)) orderedCategories.push(c);
        });

        let html = '';

        orderedCategories.forEach(catName => {
            const items = categoriesMap[catName];
            if (!items || items.length === 0) return;

            const iconMap = {
                "Star Special": "⭐",
                "Momos": "🥟",
                "Pizza": "🍕",
                "Sandwiches": "🥪",
                "Maggi": "🍜",
                "Pasta": "🍝",
                "Soup": "🍲",
                "Starters": "🍢",
                "Noodles/Rice": "🍚",
                "Main Course": "🍲",
                "Breads": "🫓",
                "Thali": "🍛",
                "Parathas": "🫓",
                "Daily Meal Specials": "🍱",
                "Drinks": "🥤",
                "Extras": "🍟"
            };

            const catIcon = iconMap[catName] || "🥗";

            html += `
                <div style="grid-column: 1 / -1; margin-top: 35px; margin-bottom: 15px; border-bottom: 2px solid rgba(244, 180, 0, 0.35); padding-bottom: 10px;">
                    <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #ffffff; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.8rem;">${catIcon}</span> ${catName}
                        <span style="font-size: 0.85rem; color: var(--amber-gold); font-weight: normal; margin-left: auto;">(${items.length} items)</span>
                    </h3>
                </div>
            `;

            items.forEach(item => {
                const itemImg = getItemImage(item.name);
                const price = item.price || item.full || item.half || 50;
                const displayName = item.name.replace(/\((Half|Full|half|full)\)/g, "").trim();
                const desc = (item.description && item.description !== 'nan' && item.description !== 'undefined') ? item.description : 'Freshly prepared at Barbil Physical Outlet.';

                html += `
                    <div class="menu-card" style="background: rgba(26, 22, 18, 0.75); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div class="menu-img-container image-wrapper" style="height: 180px; margin: -20px -20px 16px -20px; border-radius: 20px 20px 0 0;">
                                <img src="${itemImg}" class="menu-img" loading="lazy" onerror="this.src='images/logo.png'">
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span class="fssai-icon veg-icon" title="100% Pure Veg"><span class="fssai-dot"></span></span>
                                <span style="font-size: 0.72rem; font-weight: 800; color: #4ade80;">100% PURE VEG</span>
                            </div>
                            <h3 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px; font-weight: 700;">${displayName}</h3>
                            <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px; min-height: 20px;">${desc}</p>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08);">
                            <div style="color: var(--amber-gold); font-weight: 800; font-size: 1.15rem;">₹${price}</div>
                            <a href="tel:+916370680744" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 20px; border-color: rgba(244,180,0,0.4); color: var(--amber-gold);">
                                <i class="fas fa-phone-alt" style="margin-right: 4px;"></i> Call Outlet
                            </a>
                        </div>
                    </div>
                `;
            });
        });

        outletGrid.innerHTML = html;
    }

    // Universal Grouping Engine for Half/Full & Custom Variant Pairs (Sweet / Salted)
    function buildMenuGrouping(items) {
        const baseGroups = {};
        (items || []).forEach(item => {
            const rawName = item.name || '';
            const lowerName = rawName.toLowerCase();
            const category = item.category || 'Other';

            // Check if item has dual options in brackets separated by / like "(Sweet / Salted)"
            const slashMatch = rawName.match(/\(([^/)]+)\s*\/\s*([^/)]+)\)/);
            if (slashMatch) {
                const opt1 = slashMatch[1].trim(); // e.g. "Sweet"
                const opt2 = slashMatch[2].trim(); // e.g. "Salted"
                const baseName = getNormalizedName(rawName);
                const displayName = rawName.replace(/\(.*?\)/g, "").trim();
                const groupKey = `${category}_${baseName}`;

                const itemId = String(item._id || item.id || baseName);

                baseGroups[groupKey] = {
                    name: baseName,
                    displayName: displayName,
                    category: category,
                    description: item.description,
                    image: getItemImage(item.name),
                    variants: {
                        opt1: {
                            id: `${itemId}-opt1`,
                            name: `${displayName} (${opt1})`,
                            label: opt1,
                            price: item.price || item.full || 40,
                            inStock: item.inStock,
                            description: item.description
                        },
                        opt2: {
                            id: `${itemId}-opt2`,
                            name: `${displayName} (${opt2})`,
                            label: opt2,
                            price: item.price || item.full || 40,
                            inStock: item.inStock,
                            description: item.description
                        }
                    }
                };
                return;
            }

            const baseName = getNormalizedName(rawName);
            const groupKey = `${category}_${baseName}`;

            if (!baseGroups[groupKey]) {
                let displayName = rawName.replace(/\((Half|Full|half|full)\)/g, "").trim();
                baseGroups[groupKey] = {
                    name: baseName,
                    displayName: displayName,
                    category: category,
                    description: item.description,
                    image: getItemImage(item.name),
                    variants: {}
                };
            }

            if (item.description && item.description !== 'nan' && item.description !== 'undefined' && item.description.trim() !== '') {
                baseGroups[groupKey].description = item.description;
            }

            if (lowerName.includes('(half)')) {
                baseGroups[groupKey].variants.half = item;
                if (item.description && item.description !== 'nan' && item.description !== 'undefined' && item.description.trim() !== '') {
                    baseGroups[groupKey].halfDesc = item.description;
                }
            } else if (lowerName.includes('(full)')) {
                baseGroups[groupKey].variants.full = item;
                if (item.description && item.description !== 'nan' && item.description !== 'undefined' && item.description.trim() !== '') {
                    baseGroups[groupKey].fullDesc = item.description;
                }
            } else {
                baseGroups[groupKey].variants.standard = item;
            }
        });
        return baseGroups;
    }

    function renderBestSellers(itemsOrGroups) {
        const grid = document.getElementById('best-seller-items');
        if (!grid || !itemsOrGroups) return;
        grid.innerHTML = '';

        // If already grouped objects
        const groupsToRender = (Array.isArray(itemsOrGroups) && itemsOrGroups.length > 0 && itemsOrGroups[0].displayName)
            ? itemsOrGroups
            : Object.values(buildMenuGrouping(itemsOrGroups)).slice(0, 6);

        groupsToRender.forEach(group => {
            grid.appendChild(createMenuCard(group));
        });

        if (typeof syncMenuWithCart === 'function') syncMenuWithCart();
    }

    function renderMenu(items) {
        if (!menuGrid) return;
        menuGrid.innerHTML = '';
        
        let displayItems = items;

        // Location filter — reads currentLocationFilter set by location-picker.js
        const loc = (typeof currentLocationFilter !== 'undefined') ? currentLocationFilter : 'all';
        if (loc === 'cloud') {
          displayItems = displayItems.filter(item =>
            !item.availability || item.availability === 'cloud_only' || item.availability === 'both'
          );
        } else if (loc === 'outlet') {
          displayItems = displayItems.filter(item =>
            item.availability === 'outlet_only' || item.availability === 'both'
          );
          // Outlet is pure veg — always force veg filter
          displayItems = displayItems.filter(item => {
            const combinedText = (item.name + ' ' + (item.description || '')).toLowerCase();
            const isEggless = combinedText.includes('eggless');
            const hasNonVegWords = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
            const isNonVeg = item.veg === 'nonveg' || (!isEggless && hasNonVegWords);
            return !isNonVeg;
          });
        }

        // Dietary filter (only for cloud / all views)
        if (loc !== 'outlet' && currentDietaryFilter !== 'all') {
          displayItems = displayItems.filter(item => {
            const combinedText = (item.name + ' ' + (item.description || '')).toLowerCase();
            const isEggless = combinedText.includes('eggless');
            const hasNonVegWords = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
            const isNonVeg = item.veg === 'nonveg' || (!isEggless && hasNonVegWords);
            return currentDietaryFilter === 'veg' ? !isNonVeg : isNonVeg;
          });
        }
        
        if (displayItems.length === 0) {
            if (!isMenuDataLoaded) {
                menuGrid.innerHTML = `
                    <div class="food-loader-wrapper">
                        <div class="food-icons-orbit">
                            <div class="food-center-glow">🔥</div>
                            <div class="food-icon-item item-1">🍛</div>
                            <div class="food-icon-item item-2">🍕</div>
                            <div class="food-icon-item item-3">🍔</div>
                            <div class="food-icon-item item-4">🧋</div>
                        </div>
                        <div class="loader-text-glow">Cooking Up Fresh Flavors...</div>
                        <div class="skeleton-cards-container">
                            <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line title"></div><div class="skeleton-line price"></div><div class="skeleton-btn"></div></div>
                            <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line title"></div><div class="skeleton-line price"></div><div class="skeleton-btn"></div></div>
                            <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line title"></div><div class="skeleton-line price"></div><div class="skeleton-btn"></div></div>
                            <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line title"></div><div class="skeleton-line price"></div><div class="skeleton-btn"></div></div>
                        </div>
                    </div>`;
            } else {
                menuGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No items found.</div>';
            }
            return;
        }

        // Process items into variant groups
        const baseGroups = buildMenuGrouping(displayItems);

        // Group the resulting cards by category for final display
        const groupedByCategory = {};
        Object.values(baseGroups).forEach(group => {
            if (!groupedByCategory[group.category]) groupedByCategory[group.category] = [];
            groupedByCategory[group.category].push(group);
        });

        const orderedCategories = [...new Set([...CATEGORY_ORDER, ...Object.keys(groupedByCategory)])];

        orderedCategories.forEach(category => {
            if (!groupedByCategory[category] || groupedByCategory[category].length === 0) return;
            
            const catHeader = document.createElement('div');
            catHeader.style.gridColumn = '1/-1';
            catHeader.style.marginTop = '20px';
            catHeader.style.marginBottom = '10px';
            catHeader.id = 'cat-' + category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            catHeader.className = 'category-header';
            catHeader.innerHTML = `<h2 style="font-family: var(--font-heading); color: var(--primary-color); border-bottom: 2px solid var(--primary-color); display: inline-block; padding-bottom: 5px;">${category}</h2>`;
            menuGrid.appendChild(catHeader);

            groupedByCategory[category].forEach(group => {
                menuGrid.appendChild(createMenuCard(group));
            });
        });
        
        if (isMenuExpanded) {
            initScrollSpy();
        }
        
        
        if (typeof syncMenuWithCart === 'function') syncMenuWithCart();
    }

    function setupFilters(items) {
        if (!categoryFilters) return;
        
        categoryFilters.innerHTML = ''; // Fresh render
        
        let filterItems = items;
        const loc = (typeof currentLocationFilter !== 'undefined') ? currentLocationFilter : 'all';
        if (loc === 'cloud') {
          filterItems = filterItems.filter(item =>
            !item.availability || item.availability === 'cloud_only' || item.availability === 'both'
          );
        } else if (loc === 'outlet') {
          filterItems = filterItems.filter(item =>
            item.availability === 'outlet_only' || item.availability === 'both'
          );
        }
        
        const dietaryContainer = document.createElement('div');
        dietaryContainer.style.display = 'flex';
        dietaryContainer.style.justifyContent = 'center';
        dietaryContainer.style.gap = '10px';
        dietaryContainer.style.marginBottom = '20px';
        dietaryContainer.style.width = '100%';
        dietaryContainer.innerHTML = `
            <button class="filter-btn active" data-diet="all">All</button>
            <button class="filter-btn" data-diet="veg" style="color: #28a745; border-color: #28a745;">Veg</button>
            <button class="filter-btn" data-diet="non-veg" style="color: #dc3545; border-color: #dc3545;">Non-Veg</button>
        `;
        categoryFilters.appendChild(dietaryContainer);
        
        const catContainer = document.createElement('div');
        catContainer.style.display = 'flex';
        catContainer.style.justifyContent = 'center';
        catContainer.style.flexWrap = 'wrap';
        catContainer.style.gap = '10px';
        categoryFilters.appendChild(catContainer);

        const rawCats = [...new Set(filterItems.map(item => item.category).filter(Boolean))];
        const orderedPresentCats = CATEGORY_ORDER.filter(c => rawCats.includes(c));
        rawCats.forEach(c => {
            if (!orderedPresentCats.includes(c)) orderedPresentCats.push(c);
        });
        const categories = ['all', ...orderedPresentCats];
        catContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All Categories</button>';
        
        categories.slice(1).forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', category);
            btn.textContent = category;
            catContainer.appendChild(btn);
        });

        window.setActiveCategory = function(filterStr) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll(`[data-filter="${filterStr}"]`).forEach(b => b.classList.add('active'));
        };

        window.scrollToCategory = function(filterStr) {
            window.setActiveCategory(filterStr);
            if (!isMenuExpanded) {
                const toggleBtn = document.getElementById('toggle-full-menu-btn');
                if(toggleBtn) toggleBtn.click();
            }
            setTimeout(() => {
                const targetId = filterStr === 'all' ? 'menu-section' : 'cat-' + filterStr.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                const el = document.getElementById(targetId);
                if (el) {
                    const topPos = el.getBoundingClientRect().top + window.scrollY - 120;
                    window.scrollTo({ top: topPos, behavior: 'smooth' });
                } else {
                    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        };

        // Event for Category
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                window.scrollToCategory(filter);
            });
        });
        
        // Event for Dietary
        dietaryContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                dietaryContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentDietaryFilter = e.target.getAttribute('data-diet');
                
                if (isMenuExpanded) {
                    renderMenu(currentFilteredData);
                }
            });
        });
    }

    function initScrollSpy() {
        if (!window.IntersectionObserver) return;
        const sections = document.querySelectorAll('.category-header');
        if (!sections.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    let originalCatName = '';
                    document.querySelectorAll('.filter-btn').forEach(el => {
                        const filterVal = el.getAttribute('data-filter');
                        if (filterVal && filterVal !== 'all' && 'cat-' + filterVal.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() === id) {
                            originalCatName = filterVal;
                        }
                    });
                    if (originalCatName) {
                        window.setActiveCategory(originalCatName);
                    }
                }
            });
        }, { rootMargin: '-120px 0px -40% 0px', threshold: 0 }); // trigger when top crosses ~120px below viewport top
        
        sections.forEach(sec => observer.observe(sec));
    }

    // --- Cart System ---
    let cart = [];
    let availableCoupons = [];
    let appliedCoupon = null;
    let discountAmount = 0;
    
    // Load initial state from localStorage
    try {
        const savedCoupon = localStorage.getItem('littiWaleAppliedCoupon');
        if (savedCoupon) {
            appliedCoupon = JSON.parse(savedCoupon);
            discountAmount = Number(localStorage.getItem('littiWaleDiscountAmount')) || 0;
        }
    } catch (e) { console.error("Error loading coupon state", e); }

    let restaurantNote = '';
    
    // --- Delivery Logic ---
    let deliveryCharge = 0;
    let deliveryStatus = 'UNKNOWN'; // 'AVAILABLE', 'UNAVAILABLE', 'UNKNOWN'
    window.adminDeliveryRate = window.adminDeliveryRate || 30;
    let activeLocForDelivery = sessionStorage.getItem('littiWaleLocation') || 'cloud';
    let RESTAURANT_LAT = activeLocForDelivery === 'outlet' ? 22.099435 : 22.1152751;
    let RESTAURANT_LNG = activeLocForDelivery === 'outlet' ? 85.386035 : 85.3871145;

    document.addEventListener('littiWaleLocationSelected', function(e) {
        let loc = e.detail;
        RESTAURANT_LAT = loc === 'outlet' ? 22.099435 : 22.1152751;
        RESTAURANT_LNG = loc === 'outlet' ? 85.386035 : 85.3871145;
        if (deliveryStatus === 'AVAILABLE' || deliveryStatus === 'CALCULATING') {
            getUserLocation();
        }
    });

    // --- Static Coupon Logic ---
    function getMergedCoupons(staticCoupons) {
        return [...staticCoupons];
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    function getUserLocation() {
        if ("geolocation" in navigator) {
            deliveryStatus = 'CALCULATING';
            updateCartUI();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    const distanceKm = calculateDistance(userLat, userLng, RESTAURANT_LAT, RESTAURANT_LNG);
                    const roundedKm = Math.max(1, Math.round(distanceKm)); // At least 1 km to prevent zero
                    const currentRate = window.adminDeliveryRate || 30;
                    
                    deliveryCharge = roundedKm * currentRate;
                    deliveryStatus = 'AVAILABLE';
                    updateCartUI();
                },
                (error) => {
                    console.warn("Location access denied or failed. Delivery status unknown.");
                    deliveryStatus = 'UNKNOWN';
                    deliveryCharge = 0;
                    updateCartUI();
                },
                { timeout: 10000 }
            );
        } else {
            console.warn("Geolocation not supported. Delivery status unknown.");
            deliveryStatus = 'UNKNOWN';
            deliveryCharge = 0;
            updateCartUI();
        }
    }

    // --- Toast Notification ---
    // ---- Robust Toast Utility (Mobile Optimized) ----
    const TOAST_ID = "add-to-cart";
    const toast = {
        timeoutId: null,
        activeId: null, // Track specific IDs for flow control
        isMobile: window.innerWidth <= 768,

        log(action, status, message = "") {
            const timestamp = new Date().toISOString();
            const logEntry = `[Toast] ${timestamp} | Action: ${action} | Status: ${status} ${message ? "| Msg: " + message : ""}`;
            
            if (status === "failed") {
                console.error(logEntry);
            } else {
                console.log(logEntry);
            }
        },

        isActive(id) {
            return this.activeId === id;
        },

        dismiss(id = null) {
            try {
                if (id && this.activeId !== id) return;
                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                    this.timeoutId = null;
                }
                const toastEl = document.getElementById('cart-toast');
                if (toastEl) {
                    toastEl.classList.remove('show');
                    toastEl.classList.add('hide-toast');
                    setTimeout(() => {
                        toastEl.classList.remove('hide-toast');
                    }, 350);
                }
                this.activeId = null;
                this.log("dismiss", "success", id ? `ID: ${id}` : "");
            } catch (error) {
                this.log("dismiss", "failed", error.message);
            }
        },

        success(message, config = {}) {
            try {
                // Don't show floating toast if cart drawer is already open
                const cartDrawer = document.getElementById('cart-drawer');
                if (cartDrawer && cartDrawer.classList.contains('open')) {
                    return;
                }

                const toastId = config.toastId || null;
                const duration = this.isMobile ? 1200 : 1500;

                this.dismiss();

                const toastEl = document.getElementById('cart-toast');
                if (!toastEl) return;

                this.activeId = toastId;
                toastEl.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
                toastEl.classList.remove('hide-toast');
                toastEl.classList.add('show');

                // Force visual hide after duration
                this.timeoutId = setTimeout(() => {
                    this.dismiss();
                }, duration);

            } catch (error) {
                this.log("show", "failed", error.message);
            }
        }
    };


    // Backward compatibility wrapper
    function showToast(message) {
        toast.success(message);
    }

    // ============================================================
    // MOBILE MENU CARD HELPERS
    // ============================================================

    /** Get current cart quantity for a given item id */
    function getCartQty(id) {
        const item = cart.find(c => c.id === id);
        return item ? item.quantity : 0;
    }

    /** Update mobile overlay qty control and sync cart */
    window.mobUpdateQty = function(id, name, price, img, delta) {
        const current = getCartQty(id);
        const newQty  = current + delta;

        if (newQty <= 0) {
            // Remove from cart and swap back to ADD+
            updateQuantity(id, -current); // set to 0
            const mobAdd = document.getElementById(`mob-add-${id}`);
            const mobQty = document.getElementById(`mob-qty-${id}`);
            if (mobAdd) mobAdd.style.display = 'flex';
            if (mobQty) mobQty.style.display = 'none';
            return;
        }

        updateQuantity(id, delta);
        const valEl = document.getElementById(`mob-qval-${id}`);
        if (valEl) valEl.textContent = newQty;
    };

    /** Inject & open the Variant (Half/Full or Options) bottom sheet */
    function openHFVariantSheet(itemName, v1, v2, img, mobAddBtn, v1Label = 'Half', v2Label = 'Full') {
        // Inject sheet HTML once
        if (!document.getElementById('hf-variant-sheet')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="hf-sheet-overlay"></div>
                <div id="hf-variant-sheet">
                    <div class="hf-sheet-handle"></div>
                    <div class="hf-sheet-title" id="hf-sheet-name"></div>
                    <div class="hf-sheet-subtitle" id="hf-sheet-subtitle">Choose your option</div>
                    <div class="hf-sheet-options">
                        <div class="hf-sheet-opt" id="hf-opt-half">
                            <div class="hf-sheet-opt-label" id="hf-label-v1">Half</div>
                            <div class="hf-sheet-opt-price" id="hf-half-price"></div>
                            <div class="hf-sheet-opt-qty">
                                <button class="sq-btn sq-minus" id="hf-half-minus">−</button>
                                <span class="sq-val" id="hf-half-val">0</span>
                                <button class="sq-btn sq-plus" id="hf-half-plus">+</button>
                            </div>
                        </div>
                        <div class="hf-sheet-opt" id="hf-opt-full">
                            <div class="hf-sheet-opt-label" id="hf-label-v2">Full</div>
                            <div class="hf-sheet-opt-price" id="hf-full-price"></div>
                            <div class="hf-sheet-opt-qty">
                                <button class="sq-btn sq-minus" id="hf-full-minus">−</button>
                                <span class="sq-val" id="hf-full-val">0</span>
                                <button class="sq-btn sq-plus" id="hf-full-plus">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // Dismiss on overlay click
            document.getElementById('hf-sheet-overlay').addEventListener('click', closeHFSheet);
        }

        function syncMobButton() {
            if (!mobAddBtn) return;
            const total = (getCartQty(v1.id) || 0) + (getCartQty(v2.id) || 0);
            if (total > 0) {
                mobAddBtn.textContent = `${total} ✓`;
                mobAddBtn.style.background = '#15803d';
            } else {
                mobAddBtn.textContent = 'ADD +';
                mobAddBtn.style.background = '#16a34a';
            }
        }

        // Populate
        document.getElementById('hf-sheet-name').textContent = itemName;
        const subTitleEl = document.getElementById('hf-sheet-subtitle');
        if (subTitleEl) {
            subTitleEl.textContent = (v1Label === 'Half' && v2Label === 'Full') ? 'Choose your portion size' : 'Choose your flavor / option';
        }

        const label1El = document.getElementById('hf-label-v1');
        if (label1El) label1El.textContent = v1Label;
        const label2El = document.getElementById('hf-label-v2');
        if (label2El) label2El.textContent = v2Label;

        document.getElementById('hf-half-price').textContent = `₹${v1.price}`;
        document.getElementById('hf-full-price').textContent = `₹${v2.price}`;
        document.getElementById('hf-half-val').textContent = getCartQty(v1.id) || 0;
        document.getElementById('hf-full-val').textContent = getCartQty(v2.id) || 0;

        // Wire buttons (remove old listeners by cloning)
        ['hf-half-minus','hf-half-plus','hf-full-minus','hf-full-plus'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const clone = el.cloneNode(true);
                el.parentNode.replaceChild(clone, el);
            }
        });

        document.getElementById('hf-half-plus')?.addEventListener('click', () => {
            addToCart(v1.id, v1.name, v1.price, img);
            document.getElementById('hf-half-val').textContent = getCartQty(v1.id);
            syncMobButton();
        });
        document.getElementById('hf-half-minus')?.addEventListener('click', () => {
            updateQuantity(v1.id, -1);
            document.getElementById('hf-half-val').textContent = getCartQty(v1.id);
            syncMobButton();
        });
        document.getElementById('hf-full-plus')?.addEventListener('click', () => {
            addToCart(v2.id, v2.name, v2.price, img);
            document.getElementById('hf-full-val').textContent = getCartQty(v2.id);
            syncMobButton();
        });
        document.getElementById('hf-full-minus')?.addEventListener('click', () => {
            updateQuantity(v2.id, -1);
            document.getElementById('hf-full-val').textContent = getCartQty(v2.id);
            syncMobButton();
        });

        // Open
        document.getElementById('hf-sheet-overlay').classList.add('open');
        document.getElementById('hf-variant-sheet').classList.add('open');
    }

    function closeHFSheet() {
        const sheet   = document.getElementById('hf-variant-sheet');
        const overlay = document.getElementById('hf-sheet-overlay');
        if (sheet)   sheet.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }
    window.closeHFSheet = closeHFSheet;


    // Initialize Cart
    function initCart() {
        const storedCart = localStorage.getItem('littiWaleCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        
        // Fetch live coupons from Admin API to validate stored coupon state
        loadLiveCoupons().then(coupons => {
            if (appliedCoupon) {
                const stillValid = (coupons || []).find(c => c.code === appliedCoupon.code && c.active === true);
                if (!stillValid || cart.length === 0) {
                    appliedCoupon = null;
                    discountAmount = 0;
                    localStorage.removeItem('littiWaleAppliedCoupon');
                    localStorage.removeItem('littiWaleDiscountAmount');
                }
            }
            updateCartUI();
        }).catch(err => {
            console.error("Error validating coupons:", err);
            updateCartUI();
        });
            
        // Fetch location details exclusively for Delivery Calculation
        getUserLocation();
    }

    // Global add to cart function accessible from inline HTML onclick
    window.addToCart = function(id, name, price, image, selectedOption = null) {
        // Block adding to cart when restaurant is closed (manual or outside operating hours)
        if (window.isRestaurantCurrentlyOpen === false) {
            const reason = window.restaurantClosedReason || 'Outside Operating Hours';
            if (typeof window.showAlert === 'function') {
                window.showAlert(`We are currently closed (${reason}). Online ordering is paused. You can view our menu items!`, { title: 'Ordering Paused (View Only)', icon: '🔒', type: 'warning' });
            } else {
                alert(`We are currently closed (${reason}). Online ordering is paused.`);
            }
            return false;
        }

        if (!selectedOption) {
            const baseId = String(id).replace('_half', '').replace('_full', '');
            const menuItem = (typeof menuData !== 'undefined' && Array.isArray(menuData)) ? menuData.find(i => String(i.id) === String(baseId) || String(i._id) === String(baseId)) : null;
            
            // Check if this item is a Thali dish
            const isThali = (name && name.toLowerCase().includes('thali')) || 
                            (menuItem && menuItem.category && menuItem.category.toLowerCase().includes('thali')) ||
                            (menuItem && menuItem.name && menuItem.name.toLowerCase().includes('thali'));

            const defaultThaliOptions = [
                { label: 'Rice + Dal', desc: 'Steamed Basmati Rice with Homestyle Tadka Dal' },
                { label: '5 Roti (5 Pcs)', desc: '5 Fresh Hot Whole Wheat Tawa Rotis' },
                { label: 'Mix (Rice + Dal + 2 Rotis)', desc: 'Mini Rice, Homestyle Dal & 2 Hot Rotis' }
            ];

            let optionsToPresent = null;
            if (isThali) {
                optionsToPresent = defaultThaliOptions;
            } else if (menuItem && menuItem.options && menuItem.options.length > 0) {
                optionsToPresent = menuItem.options.map(opt => typeof opt === 'string' ? { label: opt, desc: '' } : opt);
            }

            if (optionsToPresent && optionsToPresent.length > 0) {
                const optionsModal = document.getElementById('options-modal');
                const optionsNameEl = document.getElementById('options-item-name');
                const container = document.getElementById('options-container');
                
                if (optionsModal && container) {
                    if (optionsNameEl) {
                        optionsNameEl.innerHTML = `
                            <strong style="color:#ffffff; font-size:1.15rem; display:block; margin-bottom:4px;">${name}</strong>
                            <span style="font-size:0.85rem; color:#f59e0b; font-weight:700;">Select your Thali Combination:</span>
                        `;
                    }
                    container.innerHTML = '';
                    
                    optionsToPresent.forEach(optObj => {
                        const optLabel = optObj.label || optObj;
                        const optDesc = optObj.desc || '';
                        
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'btn btn-outline btn-block';
                        btn.style.textAlign = 'left';
                        btn.style.padding = '14px 18px';
                        btn.style.borderRadius = '12px';
                        btn.style.borderColor = 'rgba(255,255,255,0.15)';
                        btn.style.background = 'rgba(255,255,255,0.04)';
                        btn.style.display = 'flex';
                        btn.style.alignItems = 'center';
                        btn.style.justifyContent = 'space-between';
                        btn.style.cursor = 'pointer';
                        btn.style.transition = 'all 0.2s ease';
                        btn.style.marginBottom = '4px';

                        btn.innerHTML = `
                            <div>
                                <div style="font-weight:800; font-size:1rem; color:#ffffff;">${optLabel}</div>
                                ${optDesc ? `<div style="font-size:0.8rem; color:#9ca3af; margin-top:2px;">${optDesc}</div>` : ''}
                            </div>
                            <span style="font-size:1.1rem; color:#f59e0b; font-weight:900;">+</span>
                        `;

                        btn.onmouseover = () => {
                            btn.style.borderColor = '#f97316';
                            btn.style.background = 'rgba(249,115,22,0.12)';
                            btn.style.transform = 'translateY(-2px)';
                        };
                        btn.onmouseout = () => {
                            btn.style.borderColor = 'rgba(255,255,255,0.15)';
                            btn.style.background = 'rgba(255,255,255,0.04)';
                            btn.style.transform = 'translateY(0)';
                        };

                        btn.onclick = (e) => {
                            if (e) e.stopPropagation();
                            optionsModal.classList.remove('show');
                            window.addToCart(id, name, price, image, optLabel);
                        };
                        container.appendChild(btn);
                    });
                    
                    optionsModal.classList.add('show');
                    return; // Wait for customer choice
                }
            }
        }

        let cartId = selectedOption ? `${id}_${selectedOption.replace(/\s+/g, '-')}` : id;
        let cartName = selectedOption ? `${name} (${selectedOption})` : name;

        const existingItem = cart.find(item => item.id === cartId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id: cartId, name: cartName, price, image, quantity: 1, selectedOption });
        }
        
        saveCart();
        updateCartUI();
        
        if (!toast.isActive(TOAST_ID)) {
            toast.success(`${cartName} added to cart!`, {
                toastId: TOAST_ID,
                autoClose: toast.isMobile ? 1200 : 1500,
                hideProgressBar: true,
                pauseOnHover: false,
                closeOnClick: true
            });
        }
        
        // Auto-open the cart drawer smoothly
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
            cartDrawer.classList.add('open');
        }
        
        return true;
    };

    window.addDealToCart = function(id, name, price, originalPrice, noteText, image) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                originalPrice: originalPrice,
                isCombo: true,
                note: noteText,
                image: image,
                quantity: 1
            });
        }
        saveCart();
        updateCartUI();

        if (!toast.isActive(TOAST_ID)) {
            toast.success(`${name} added to cart!`, {
                toastId: TOAST_ID,
                autoClose: toast.isMobile ? 1200 : 1500,
                hideProgressBar: true,
                pauseOnHover: false,
                closeOnClick: true
            });
        }

        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
            cartDrawer.classList.add('open');
        }
        return true;
    };

    window.updateQuantity = function(id, change) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            
            saveCart();
            updateCartUI();
        }
    };

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    };

    window.reorderItemsIntoCart = function(items) {
        if (!items || !Array.isArray(items) || items.length === 0) return 0;
        let count = 0;
        items.forEach(it => {
            const name = it.name || 'Dish Item';
            const price = Number(it.price) || 100;
            const qty = Number(it.quantity) || 1;
            const id = it.id || it._id || `reorder_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

            const existing = cart.find(c => c.name === name || c.id === id);
            if (existing) {
                existing.quantity += qty;
            } else {
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    quantity: qty,
                    image: it.image || 'images/logo.png',
                    diet: it.diet || 'veg'
                });
            }
            count += qty;
        });

        saveCart();
        updateCartUI();
        syncMenuWithCart();

        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
            cartDrawer.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        return count;
    };

    function saveCart() {
        localStorage.setItem('littiWaleCart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Update badges
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const navBadge = document.getElementById('cart-count');
        const fabBadge = document.getElementById('fab-cart-badge');
        
        if (navBadge) navBadge.textContent = totalItems;
        if (fabBadge) fabBadge.textContent = totalItems;

        // Update Cart Section UI
        const container = document.getElementById('cart-items-container');
        const summary = document.getElementById('cart-summary');
        const subtotalEl = document.getElementById('cart-subtotal-amount');
        const deliveryEl = document.getElementById('cart-delivery-amount');
        const totalEl = document.getElementById('cart-total-amount');
        
        if (!container || !summary || !totalEl) return;

        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-cart-msg" style="text-align:center; padding:40px 20px; color:#9ca3af; font-size:1.05rem;">Your cart is empty</div>';
            summary.style.display = 'none';
            const couponSection = document.getElementById('coupon-section');
            if (couponSection) couponSection.style.display = 'none';
            const freeDeliveryCard = document.getElementById('free-delivery-card');
            if (freeDeliveryCard) freeDeliveryCard.style.display = 'none';
            const footerCta = document.getElementById('cart-footer-cta');
            if (footerCta) footerCta.style.display = 'none';
            
            // Sync checkout.html specific elements for empty state
            const chkContainer = document.getElementById('checkout-items-container');
            if (chkContainer) {
                chkContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">Your cart is empty</div>';
                document.getElementById('checkout-subtotal').textContent = '₹0';
                document.getElementById('checkout-total').textContent = '₹0';
                const chkDiscountRow = document.getElementById('checkout-discount-row');
                if (chkDiscountRow) chkDiscountRow.style.display = 'none';
            }
        } else {
            container.innerHTML = '';
            let subtotalAmount = 0;

            cart.forEach(item => {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity) || 0;
                const itemTotal = priceNum * qtyNum;
                subtotalAmount += itemTotal;

                const spicyTag = getSpicyChilliBadge(item, item.name);

                const cartItemCard = document.createElement('div');
                cartItemCard.className = 'cart-item-card';
                cartItemCard.innerHTML = `
                    <img src="${item.image || 'images/logo.png'}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/logo.png'">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${spicyTag ? spicyTag + ' ' : ''}${item.name}</div>
                        ${item.isCombo && item.note ? `<div style="font-size: 0.78rem; color: #f97316; margin-bottom: 6px;">${item.note}</div>` : ''}
                        <div class="cart-item-qty-pill">
                            <button class="cart-item-qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
                            <span class="cart-item-qty-num">${item.quantity}</span>
                            <button class="cart-item-qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-item-right">
                        <div class="cart-item-price">₹${itemTotal}</div>
                        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove item"><i class="far fa-trash-alt"></i></button>
                    </div>
                `;
                container.appendChild(cartItemCard);
            });

            if (appliedCoupon && appliedCoupon.type === 'PEPSI') {
                const cartItemCard = document.createElement('div');
                cartItemCard.className = 'cart-item-card';
                cartItemCard.innerHTML = `
                    <div style="width: 50px; height: 50px; background: rgba(74, 222, 128, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px dashed #4ade80;">🥤</div>
                    <div class="cart-item-info">
                        <div class="cart-item-title">Pepsi ×1 — FREE 🎁</div>
                        <div class="cart-item-price" style="color: #4ade80; font-size: 0.9rem;">₹0 (Free)</div>
                    </div>
                `;
                container.appendChild(cartItemCard);
            }



            // Update UI Details dynamically considering location logic
            let deliveryText = '';
            let noteHtml = '';
            let finalTotal = subtotalAmount;
            
            const orderTypeDelivery = document.getElementById('order-type-delivery');
            const isDelivery = orderTypeDelivery ? orderTypeDelivery.checked : true;

            if (!isDelivery) {
                deliveryText = 'Pickup (Free)';
                finalTotal = subtotalAmount;
            } else if (deliveryStatus === 'AVAILABLE') {
                const currentRate = window.adminDeliveryRate || 30;
                const distanceVal = Math.round(deliveryCharge / currentRate);
                deliveryText = `₹${deliveryCharge} (${distanceVal} km)`;
                finalTotal += deliveryCharge;
            } else if (deliveryStatus === 'UNAVAILABLE') {
                deliveryText = `Not available`;
            } else if (deliveryStatus === 'CALCULATING') {
                deliveryText = `Calculating...`;
                noteHtml = `<div style="font-size: 0.8rem; color: var(--primary-color); margin-top: 4px; text-align: right;">Fetching location...</div>`;
            } else {
                deliveryText = `Not calculated`;
                noteHtml = `<div style="font-size: 0.8rem; color: #dc3545; margin-top: 4px; text-align: right;">*Delivery calculated at checkout</div>`;
            }

            // Apply Coupon Logic
            const couponSection = document.getElementById('coupon-section');
            const couponContainer = document.getElementById('coupon-container');
            const appliedDisplay = document.getElementById('applied-coupon-display');
            const discountRow = document.getElementById('discount-row');
            const msgEl = document.getElementById('coupon-message');
            
            if (couponSection) couponSection.style.display = 'block';
            
            let baseTotalAmount = finalTotal;
            let eligibilitySubtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

            if (appliedCoupon) {
                if (appliedCoupon.type === 'PEPSI') {
                    discountAmount = 0;
                } else {
                    const pct = appliedCoupon.discount || appliedCoupon.discountPercent || 0;
                    discountAmount = Math.min((baseTotalAmount * pct) / 100, appliedCoupon.maxDiscount || 0);
                    discountAmount = Math.round(discountAmount);
                }
            } else {
                discountAmount = 0;
            }

            const couponInfoContainer = document.getElementById('coupon-applied-info-container');
            const baseTotalRow = document.getElementById('cart-base-total-row');
            const finalTotalLabel = document.getElementById('cart-final-total-label');
            const cartBaseTotalAmount = document.getElementById('cart-base-total-amount');

            if (appliedCoupon) {
                finalTotal -= discountAmount;
                if (finalTotal < 0) finalTotal = 0;
                
                if (couponContainer) couponContainer.style.display = 'none';
                if (appliedDisplay) {
                    appliedDisplay.style.display = 'flex';
                    document.getElementById('applied-code-text').textContent = appliedCoupon.code;
                    let pct = appliedCoupon.discount || appliedCoupon.discountPercent || 0;
                    let desc = appliedCoupon.type === 'PEPSI' ? 'Free Pepsi added to your order' : `${pct}% OFF (Upto ₹${appliedCoupon.maxDiscount || 0})`;
                    document.getElementById('applied-discount-text').textContent = desc;
                }
                
                if (couponInfoContainer) {
                    couponInfoContainer.style.display = 'flex';
                    document.getElementById('cart-coupon-code-text').textContent = appliedCoupon.code;
                    if (appliedCoupon.type === 'PEPSI') {
                        document.getElementById('cart-discount-amount').textContent = `-₹${discountAmount} (Free Pepsi)`;
                    } else {
                        document.getElementById('cart-discount-amount').textContent = `-₹${discountAmount}`;
                    }
                }
                
                if (baseTotalRow) baseTotalRow.style.display = 'flex';
                if (cartBaseTotalAmount) cartBaseTotalAmount.textContent = `₹${baseTotalAmount}`;
                if (finalTotalLabel) finalTotalLabel.textContent = 'Final Total';
                
            } else {
                if (couponContainer) couponContainer.style.display = 'block';
                if (appliedDisplay) appliedDisplay.style.display = 'none';
                
                if (couponInfoContainer) couponInfoContainer.style.display = 'none';
                if (baseTotalRow) baseTotalRow.style.display = 'none';
                if (finalTotalLabel) finalTotalLabel.textContent = 'Total';
            }

            if (subtotalEl && deliveryEl) {
                subtotalEl.textContent = `₹${subtotalAmount}`;
                deliveryEl.innerHTML = `<span>${deliveryText}</span>${noteHtml}`;
            }
            
            totalEl.textContent = `₹${finalTotal}`;
            
            summary.style.display = 'block';
            
            // Sync Sticky Bottom Action Bar Buttons
            const footerCta = document.getElementById('cart-footer-cta');
            const checkoutBtnTotal = document.getElementById('checkout-btn-total');
            if (footerCta) footerCta.style.display = 'flex';
            if (checkoutBtnTotal) checkoutBtnTotal.textContent = `₹${finalTotal}`;
            
            // Sync checkout.html specific elements
            const chkContainer = document.getElementById('checkout-items-container');
            if (chkContainer) {
                chkContainer.innerHTML = '';
                cart.forEach(item => {
                    const priceNum = Number(item.price) || 0;
                    const qtyNum = Number(item.quantity) || 0;
                    const itemTotal = priceNum * qtyNum;
                    chkContainer.innerHTML += `
                        <div style="margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span>${item.quantity}x ${item.name}</span>
                                <span>₹${itemTotal}</span>
                            </div>
                            ${item.isCombo && item.note ? `<div style="font-size: 0.8rem; color: #f4b400; margin-top: 2px;">${item.note}</div>` : ''}
                        </div>
                    `;
                });
                
                if (appliedCoupon && appliedCoupon.type === 'PEPSI') {
                     chkContainer.innerHTML += `
                        <div style="margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color: #4ade80; font-weight: bold;">1x Pepsi — FREE 🎁</span>
                                <span style="color: #4ade80;">₹0</span>
                            </div>
                        </div>
                    `;
                }
                
                document.getElementById('checkout-subtotal').textContent = `₹${subtotalAmount}`;
                
                const chkDiscountRow = document.getElementById('checkout-discount-row');
                if (appliedCoupon && chkDiscountRow) {
                    chkDiscountRow.style.display = 'flex';
                    const discEl = document.getElementById('checkout-discount');
                    if (appliedCoupon.type === 'PEPSI') {
                        discEl.textContent = `-₹${discountAmount} (Free Pepsi)`;
                        discEl.style.fontSize = '0.9rem';
                    } else {
                        discEl.textContent = `-₹${discountAmount}`;
                        discEl.style.fontSize = '';
                    }
                } else if (chkDiscountRow) {
                    chkDiscountRow.style.display = 'none';
                }
                
                const chkDeliveryEl = document.getElementById('checkout-delivery');
                if (chkDeliveryEl) chkDeliveryEl.textContent = deliveryText;
                
                const chkTotalEl = document.getElementById('checkout-total');
                if (chkTotalEl) chkTotalEl.textContent = `₹${finalTotal}`;
            }
        }
        
        syncMenuWithCart();
    }

    function syncMenuWithCart() {
        document.querySelectorAll('.menu-card').forEach(card => {
            const hfWrapper = card.querySelector('.half-full-wrapper');
            const mobAdd = card.querySelector('.mob-add-btn');
            const mobQty = card.querySelector('.mob-qty-ctrl');
            const mobValSpan = card.querySelector('.mq-val');

            // 1. Dual Variant Card (Half/Full or Options)
            if (hfWrapper) {
                const valSpans = hfWrapper.querySelectorAll('.hf-value');
                if (valSpans.length === 2) {
                    const v1Id = valSpans[0].id.replace('hf-val-', '');
                    const v2Id = valSpans[1].id.replace('hf-val-', '');
                    const baseId = v1Id.replace(/-half|_half|-full|_full|-opt1|-opt2/g, '');

                    const v1Qty = cart.find(i => i.id === v1Id)?.quantity || 0;
                    const v2Qty = cart.find(i => i.id === v2Id)?.quantity || 0;

                    // Sync desktop values
                    valSpans[0].textContent = v1Qty;
                    valSpans[1].textContent = v2Qty;

                    // Calculate total quantity in cart for this dish
                    let total = 0;
                    cart.forEach(item => {
                        const itId = String(item.id || '');
                        if (itId === v1Id || itId === v2Id || itId === baseId || itId.startsWith(baseId + '_') || itId.startsWith(baseId + '-')) {
                            total += Number(item.quantity) || 0;
                        }
                    });

                    if (mobAdd && mobQty) {
                        if (total > 0) {
                            mobAdd.classList.add('hidden');
                            mobAdd.style.display = 'none';
                            mobQty.classList.add('active');
                            mobQty.style.display = 'flex';
                            if (mobValSpan) mobValSpan.textContent = total;
                        } else {
                            mobAdd.classList.remove('hidden');
                            mobAdd.style.display = 'flex';
                            mobQty.classList.remove('active');
                            mobQty.style.display = 'none';
                            if (mobValSpan) mobValSpan.textContent = '0';
                        }
                    }
                }
            } 
            // 2. Standard Single Item Card
            else {
                const deskAdd = card.querySelector('[id^="menu-add-btn-"]');
                const deskCtrl = card.querySelector('[id^="menu-qty-ctrl-"]');
                const deskVal = card.querySelector('[id^="menu-qty-val-"]');

                // Extract standard item ID
                let fullId = card._mobStdItemId;
                if (!fullId && deskAdd) {
                    fullId = deskAdd.id.replace('menu-add-btn-', '');
                }
                if (!fullId && mobAdd && mobAdd.id) {
                    fullId = mobAdd.id.replace('mob-add-', '');
                }

                if (fullId) {
                    const matchingItems = cart.filter(item => item.id === fullId || item.id.startsWith(fullId + '_') || item.id.startsWith(fullId + '-'));
                    const totalQty = matchingItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

                    // Sync Desktop buttons
                    if (deskAdd && deskCtrl) {
                        if (totalQty > 0) {
                            deskAdd.style.display = 'none';
                            deskCtrl.style.display = 'flex';
                            if (deskVal) deskVal.textContent = totalQty;
                        } else {
                            deskAdd.style.display = 'block';
                            deskCtrl.style.display = 'none';
                        }
                    }

                    // Sync Mobile buttons
                    if (mobAdd && mobQty) {
                        if (totalQty > 0) {
                            mobAdd.classList.add('hidden');
                            mobAdd.style.display = 'none';
                            mobQty.classList.add('active');
                            mobQty.style.display = 'flex';
                            if (mobValSpan) mobValSpan.textContent = totalQty;
                        } else {
                            mobAdd.classList.remove('hidden');
                            mobAdd.style.display = 'flex';
                            mobQty.classList.remove('active');
                            mobQty.style.display = 'none';
                            if (mobValSpan) mobValSpan.textContent = '0';
                        }
                    }
                }
            }
        });
    }

    function setupCartDrawer() {
        if (document.getElementById('cart-drawer')) return;
        
        const drawerHTML = `
            <div id="cart-drawer" class="cart-drawer">
                <div id="cart-overlay" class="cart-overlay"></div>
                <div class="cart-panel">
                    <div class="cart-header">
                        <h2>Your Cart</h2>
                        <button id="close-cart-btn" class="close-btn">&times;</button>
                    </div>
                    <div class="cart-body" id="cart-drawer-body">
                        <div id="cart-items-container" class="cart-items">
                            <div class="empty-cart-msg">Your cart is empty</div>
                        </div>
                        
                        <div id="restaurant-note-section" style="display: none; margin-top: 15px; margin-bottom: 15px;">
                            <div id="restaurant-note-preview" style="display: none; background: rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 10px; font-size: 0.9rem; color: var(--text-secondary);">
                                <strong>📝 Note:</strong> <span id="restaurant-note-text"></span>
                            </div>
                            <button id="add-note-btn" class="btn btn-outline btn-block" style="border-style: dashed; padding: 10px;">
                                <i class="fas fa-edit"></i> <span id="add-note-btn-text">Add Restaurant Note</span>
                            </button>
                        </div>

                        <div id="coupon-section" style="display: none; margin-bottom: 15px;">
                            <div id="coupon-container">
                                <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                                    <input type="text" id="coupon-input" class="form-control" placeholder="Enter Coupon Code" style="flex: 1; text-transform: uppercase;">
                                    <button id="apply-coupon-btn" class="btn btn-outline" style="white-space: nowrap;">Apply</button>
                                </div>
                                <div id="coupon-message" style="font-size: 0.85rem; padding: 5px;"></div>
                                <div style="text-align: right; margin-top: 5px;">
                                    <button id="view-all-coupons-btn" style="background: none; border: none; color: var(--primary-color); font-size: 0.9rem; cursor: pointer; text-decoration: underline;">View All Coupons</button>
                                </div>
                            </div>
                            <div id="applied-coupon-display" style="display: none; justify-content: space-between; margin-bottom: 5px; color: #4ade80; background: rgba(74, 222, 128, 0.1); padding: 10px; border-radius: 8px; align-items: center;">
                                 <div>
                                     <div style="font-weight: bold;"><i class="fas fa-tag"></i> <span id="applied-code-text"></span> Applied</div>
                                     <div style="font-size: 0.85rem;" id="applied-discount-text"></div>
                                 </div>
                                 <button id="remove-coupon-btn" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem;"><i class="fas fa-times"></i></button>
                            </div>
                        </div>



                        <div class="cart-summary-box" id="cart-summary" style="display: none;">
                            <div class="cart-summary-row">
                                <span>Subtotal</span>
                                <span id="cart-subtotal-amount">₹0</span>
                            </div>
                            <div class="cart-summary-row" id="cart-delivery-row">
                                <span>Delivery Fee</span>
                                <div id="cart-delivery-amount">Not calculated</div>
                            </div>
                            <div id="cart-base-total-row" class="cart-summary-row" style="display: none;">
                                <span>Subtotal</span>
                                <span id="cart-base-total-amount">₹0</span>
                            </div>
                            <div id="coupon-applied-info-container" class="cart-summary-row discount-row" style="display: none;">
                                <span>Discount (<span id="cart-coupon-code-text"></span>)</span>
                                <span id="cart-discount-amount">-₹0</span>
                            </div>
                            <div class="cart-summary-row total-row">
                                <span id="cart-final-total-label">Total</span>
                                <span id="cart-total-amount" class="total-amount">₹0</span>
                            </div>
                            
                            <div class="order-type-selection" style="margin-top: 15px; margin-bottom: 10px;">
                                <label style="display:block; font-weight:600; font-size:0.85rem; color:#9ca3af; margin-bottom:8px;">Order Type:</label>
                                <div style="display:flex; gap:10px;">
                                    <label style="flex:1; background:rgba(255,255,255,0.06); color:#ffffff; padding:8px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); text-align:center; cursor:pointer; font-size:0.85rem;" class="order-type-label">
                                        <input type="radio" name="orderType" id="order-type-delivery" value="delivery" checked style="margin-right:5px; accent-color: #f97316;"> Delivery
                                    </label>
                                    <label style="flex:1; background:rgba(255,255,255,0.06); color:#ffffff; padding:8px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); text-align:center; cursor:pointer; font-size:0.85rem;" class="order-type-label">
                                        <input type="radio" name="orderType" id="order-type-takeaway" value="takeaway" style="margin-right:5px; accent-color: #f97316;"> Takeaway
                                    </label>
                                </div>
                            </div>
                            
                            <div style="text-align: right; margin-top: 10px;">
                                <button id="clear-cart-btn" style="background: none; border: none; color: #9ca3af; font-size: 0.8rem; cursor: pointer; text-decoration: underline;">Clear Cart</button>
                            </div>
                        </div>
                    </div>

                    <!-- Sticky Bottom Action Bar matching reference layout -->
                    <div class="cart-footer-cta" id="cart-footer-cta" style="display: none;">
                        <button type="button" class="btn-view-menu" id="cart-btn-view-menu" onclick="document.getElementById('close-cart-btn')?.click(); if(!window.location.pathname.includes('/menu')) window.location.href='/menu';">View Menu</button>
                        <button type="button" id="checkout-btn" class="btn-checkout-primary">
                            Checkout • <span id="checkout-btn-total">₹0</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Restaurant Note Modal -->
            <div id="restaurant-note-modal" class="payment-modal">
                <div class="payment-modal-content">
                    <span id="close-note-modal" class="close-btn" style="position: absolute; right: 15px; top: 15px;">&times;</span>
                    <h3 class="text-center mb-2" style="font-family: var(--font-heading);"><i class="fas fa-sticky-note"></i> Restaurant Note</h3>
                    <textarea id="restaurant-note-input" class="form-control" rows="3" placeholder="Any special instructions? (Max 120 chars)" maxlength="120"></textarea>
                    <button id="save-note-btn" class="btn btn-primary btn-block mt-3 py-3">Save Note</button>
                    <button id="remove-note-btn" class="btn btn-outline btn-block mt-2 py-3" style="display:none; border-color:#dc3545; color:#dc3545;">Remove Note</button>
                </div>
            </div>

            <!-- Options Modal -->
            <div id="options-modal" class="payment-modal">
                <div class="payment-modal-content">
                    <span id="close-options-modal" class="close-btn" style="position: absolute; right: 15px; top: 15px;">&times;</span>
                    <h3 class="text-center mb-2" style="font-family: var(--font-heading);">Select Option</h3>
                    <p class="text-center" style="color:var(--text-secondary); margin-bottom:15px;" id="options-item-name"></p>
                    <div id="options-container" style="display:flex; flex-direction:column; gap:10px;">
                    </div>
                </div>
            </div>

            <!-- Coupons Modal -->
            <div id="coupons-modal" class="payment-modal">
                <div class="payment-modal-content" style="max-height: 80vh; overflow-y: auto;">
                    <span id="close-coupons-modal" class="close-btn" style="position: absolute; right: 15px; top: 15px;">&times;</span>
                    <h3 class="text-center mb-2" style="font-family: var(--font-heading); font-size: 1.4rem;"><i class="fas fa-ticket-alt"></i> Available Coupons</h3>
                    <div class="divider" style="margin-bottom:1.5rem;"></div>
                    <div id="all-coupons-container" style="display: flex; flex-direction: column; gap: 15px;">
                        <!-- Coupons injected here -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', drawerHTML);
        
        const cartDrawer = document.getElementById('cart-drawer');
        
        // Modal Handlers (Note & Options)
        const optionsModal = document.getElementById('options-modal');
        document.getElementById('close-options-modal')?.addEventListener('click', () => {
            if (optionsModal) optionsModal.classList.remove('show');
        });
        optionsModal?.addEventListener('click', (e) => {
            if (e.target === optionsModal) {
                optionsModal.classList.remove('show');
            }
        });

        const updateNoteUI = () => {
            const btnText = document.getElementById('add-note-btn-text');
            const addBtn = document.getElementById('add-note-btn');
            const previewContainer = document.getElementById('restaurant-note-preview');
            const previewText = document.getElementById('restaurant-note-text');
            
            if (restaurantNote) {
                if (btnText) btnText.textContent = 'Edit Restaurant Note';
                if (addBtn) {
                    addBtn.style.borderStyle = 'solid';
                    addBtn.style.borderColor = 'var(--primary-color)';
                }
                if (previewContainer && previewText) {
                    previewText.textContent = restaurantNote;
                    previewContainer.style.display = 'block';
                }
            } else {
                if (btnText) btnText.textContent = 'Add Restaurant Note';
                if (addBtn) {
                    addBtn.style.borderStyle = 'dashed';
                    addBtn.style.borderColor = '';
                }
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
            }
            
            const checkoutNotesInput = document.getElementById('checkout-notes');
            if (checkoutNotesInput) {
                checkoutNotesInput.value = restaurantNote || '';
            }
        };

        const globalCheckoutNotes = document.getElementById('checkout-notes');
        if (globalCheckoutNotes) {
            globalCheckoutNotes.addEventListener('input', (e) => {
                restaurantNote = e.target.value.substring(0, 120);
                const drawerInput = document.getElementById('restaurant-note-input');
                if (drawerInput) drawerInput.value = restaurantNote;
                if (typeof updateNoteUI === 'function') updateNoteUI();
            });
        }

        const noteModal = document.getElementById('restaurant-note-modal');
        document.getElementById('add-note-btn')?.addEventListener('click', () => {
            document.getElementById('restaurant-note-input').value = restaurantNote || '';
            document.getElementById('remove-note-btn').style.display = restaurantNote ? 'block' : 'none';
            if (noteModal) noteModal.classList.add('show');
        });
        document.getElementById('close-note-modal')?.addEventListener('click', () => {
            if (noteModal) noteModal.classList.remove('show');
        });
        document.getElementById('save-note-btn')?.addEventListener('click', () => {
            const val = document.getElementById('restaurant-note-input').value.trim();
            restaurantNote = val ? val.substring(0, 120) : '';
            if (typeof updateNoteUI === 'function') updateNoteUI();
            if (noteModal) noteModal.classList.remove('show');
        });
        document.getElementById('remove-note-btn')?.addEventListener('click', () => {
            restaurantNote = '';
            document.getElementById('restaurant-note-input').value = '';
            if (typeof updateNoteUI === 'function') updateNoteUI();
            if (noteModal) noteModal.classList.remove('show');
        });

        // Coupon Handlers
        document.getElementById('apply-coupon-btn')?.addEventListener('click', async () => {
            const codeInput = document.getElementById('coupon-input');
            const code = codeInput.value.trim().toUpperCase();
            if (!code) return;
            
            const msgEl = document.getElementById('coupon-message');
            msgEl.textContent = 'Applying...';
            msgEl.style.color = 'var(--text-secondary)';
            
            console.log("Applying coupon code:", code);
            
            // Ensure live coupons are loaded from Admin API
            if (!availableCoupons || availableCoupons.length === 0) {
                await loadLiveCoupons();
            }

            const coupon = (availableCoupons || []).find(c => c.code === code && c.active === true);
            
            if (!coupon) {
                msgEl.textContent = 'Invalid or Inactive Coupon';
                msgEl.style.color = '#dc3545';
                return;
            }
            
            // Check minOrder if present
            const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
            if (coupon.minOrder && subtotal < coupon.minOrder) {
                msgEl.textContent = `Min order ₹${coupon.minOrder} required`;
                msgEl.style.color = '#dc3545';
                return;
            }

            appliedCoupon = coupon;
            console.log("Coupon applied successfully from Live Admin API:", coupon);
            
            // Persist coupon state
            localStorage.setItem('littiWaleAppliedCoupon', JSON.stringify(coupon));
            
            codeInput.value = '';
            msgEl.textContent = 'Applied!';
            msgEl.style.color = '#4ade80';
            updateCartUI();
            localStorage.setItem('littiWaleDiscountAmount', discountAmount);
        });
        
        document.getElementById('remove-coupon-btn')?.addEventListener('click', () => {
            appliedCoupon = null;
            discountAmount = 0;
            localStorage.removeItem('littiWaleAppliedCoupon');
            localStorage.removeItem('littiWaleDiscountAmount');
            const msgEl = document.getElementById('coupon-message');
            if (msgEl) msgEl.textContent = '';
            updateCartUI();
        });
        
        // View All Coupons Modal Logic (100% Live Admin Source)
        const couponsModal = document.getElementById('coupons-modal');
        document.getElementById('view-all-coupons-btn')?.addEventListener('click', async () => {
            if (!couponsModal) return;
            const container = document.getElementById('all-coupons-container');
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">Loading coupons...</p>';
            couponsModal.classList.add('show');
            
            console.log("Fetching all live coupons from Admin API for modal...");
            if (!availableCoupons || availableCoupons.length === 0) {
                await loadLiveCoupons();
            }

            container.innerHTML = '';
            const activeCoupons = (availableCoupons || []).filter(c => c.active === true);
            
            if (activeCoupons.length === 0) {
                console.warn("No active coupons found");
                container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">No coupons available currently</p>';
            } else {
                activeCoupons.forEach(coupon => {
                    const btnHtml = `<button class="btn btn-primary select-modal-coupon-btn" data-code="${coupon.code}" style="padding: 5px 15px; font-size:0.85rem;">Select</button>`;
                    const discountDesc = coupon.type === 'PERCENT' 
                        ? `${coupon.discount}% OFF (Upto ₹${coupon.maxDiscount || coupon.discount})`
                        : `Flat ₹${coupon.discount} OFF`;
                    const html = `
                        <div style="border: 1px dashed var(--primary-color); background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div>
                                <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px; color: var(--primary-color);">${coupon.code}</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">
                                    ${discountDesc}
                                </div>
                                ${coupon.minOrder ? `<div style="color: #888; font-size: 0.75rem; margin-top: 5px;">Min Order: ₹${coupon.minOrder}</div>` : ''}
                            </div>
                            <div>
                                ${btnHtml}
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', html);
                });
                
                document.querySelectorAll('.select-modal-coupon-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const code = e.target.getAttribute('data-code');
                        console.log("Coupon selected from modal:", code);
                        
                        const codeInput = document.getElementById('coupon-input');
                        if (codeInput) {
                            codeInput.value = code;
                            codeInput.focus();
                        }
                        
                        if (couponsModal) couponsModal.classList.remove('show');
                    });
                });
            }
        });
        
        document.getElementById('close-coupons-modal')?.addEventListener('click', () => {
            if (couponsModal) couponsModal.classList.remove('show');
        });

        const closeBtn = document.getElementById('close-cart-btn');
        const overlay = document.getElementById('cart-overlay');
        
        document.getElementById('order-type-delivery')?.addEventListener('change', updateCartUI);
        document.getElementById('order-type-takeaway')?.addEventListener('change', updateCartUI);

        function toggleCart() {
            cartDrawer.classList.toggle('open');
        }
        
        if (closeBtn) closeBtn.addEventListener('click', toggleCart);
        if (overlay) overlay.addEventListener('click', toggleCart);
        
        // Ensure buttons toggle the drawer
        document.querySelectorAll('.cart-link, .nav-cart-btn, .cart-fab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                cartDrawer.classList.toggle('open');
            });
        });

        const clearBtn = document.getElementById('clear-cart-btn');
        const clearBtnGlobal = document.getElementById('clear-cart-global');
        
        const handleClearCart = async () => {
            const confirmed = await window.showConfirm('Are you sure you want to clear your cart?', {
                title: 'Clear Cart',
                icon: '🗑️',
                okText: 'Yes, Clear',
                cancelText: 'Keep it',
                type: 'danger'
            });
            if (confirmed) {
                // Mobile specific: dismiss toast on cart clear
                if (toast.isMobile) {
                    toast.dismiss(TOAST_ID);
                    toast.log("dismiss", "success", "Cleared on cart reset");
                }
                
                cart = [];
                restaurantNote = '';
                if (typeof updateNoteUI === 'function') updateNoteUI();
                saveCart();
                updateCartUI();
                
                if (window.location.pathname.includes('checkout.html')) {
                    location.reload();
                }
            }
        };

        if (clearBtn) {
            clearBtn.addEventListener('click', handleClearCart);
        }
        
        if (clearBtnGlobal) {
            clearBtnGlobal.addEventListener('click', handleClearCart);
        }



        // Delivery Info Modal HTML Injection
        if (!document.getElementById('delivery-info-modal')) {
            const deliveryInfoModalHTML = `
                <div id="delivery-info-modal" class="payment-modal" style="z-index: 99999;">
                    <div class="payment-modal-content" style="text-align:center;">
                        <h3 style="font-family: var(--font-heading); margin-bottom:15px; color:#856404;">⚠️ Important Payment Info</h3>
                        <p style="font-size: 1.1rem; font-weight: bold; margin-bottom:10px;">You have not paid delivery charges.</p>
                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                            <button id="payDeliveryNow" class="btn btn-primary btn-block py-3">Pay delivery now</button>
                            <button id="payAtDelivery" class="btn btn-outline btn-block py-3">Pay at delivery time</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', deliveryInfoModalHTML);

            document.body.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'payDeliveryNow') {
                    document.getElementById('delivery-info-modal').classList.remove('show');
                    paymentModal.classList.add('show');
                    selectedPaymentMode = 'full';
                    document.getElementById('final-pay-amount').textContent = currentOrderTotal;
                    showStep(step3);
                }
                
                if (e.target && e.target.id === 'payAtDelivery') {
                    document.getElementById('delivery-info-modal').classList.remove('show');
                    paymentModal.classList.add('show');
                    selectedPaymentMode = 'items';
                    let itemsToPay = currentOrderSubtotal;
                    if (appliedCoupon) {
                        itemsToPay = Math.max(0, currentOrderSubtotal - discountAmount);
                    }
                    document.getElementById('final-pay-amount').textContent = itemsToPay;
                    showStep(step3);
                }
            });
        }

        // Screenshot Modal HTML Injection
        if (!document.getElementById('screenshot-modal')) {
            const screenshotModalHTML = `
                <div id="screenshot-modal" class="payment-modal">
                    <div class="payment-modal-content" style="text-align:center;">
                        <h3 style="font-family: var(--font-heading); margin-bottom:15px;">Have you shared your payment screenshot?</h3>
                        <p style="color:var(--text-secondary); margin-bottom:20px;">Your order will only be processed after receiving the screenshot.</p>
                        <div style="display:flex; gap:10px;">
                            <button id="btn-scr-yes" class="btn btn-primary btn-block">YES</button>
                            <button id="btn-scr-no" class="btn btn-outline btn-block">NO</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', screenshotModalHTML);
            
            document.getElementById('btn-scr-yes')?.addEventListener('click', () => {
                localStorage.removeItem('paymentSharedPending');
                document.getElementById('screenshot-modal').classList.remove('show');
                
                // NEW: Show Step 2 Modal instead of immediately clearing cart
                const contactModal = document.getElementById('restaurant-contact-modal');
                if (contactModal) contactModal.classList.add('show');
            });
            
            document.getElementById('btn-scr-no')?.addEventListener('click', () => {
                // DO NOT close modal automatically on NO
                // document.getElementById('screenshot-modal').classList.remove('show');
                
                localStorage.setItem('paymentSharedPending', 'true');
                const message = 'Hi, I will share the payment screenshot for order confirmation.';
                const phoneTarget = '916370680744';
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${phoneTarget}?text=${encodedMessage}`;
                window.open(whatsappUrl, '_blank');
                
                // Safety: Re-open modal if closed by environment/re-render
                setTimeout(() => {
                    if (typeof window.openScreenshotModal === "function") {
                        window.openScreenshotModal();
                    }
                }, 800);
                
                return;
            });
            
            window.openScreenshotModal = function() {
                localStorage.removeItem("paymentInitiated");
                const modal = document.getElementById("screenshot-modal");
                if (modal && !modal.classList.contains("show")) {
                    modal.classList.add("show");
                }
            };

            const checkPendingActions = () => {
                if (localStorage.getItem('paymentInitiated') === 'true') {
                    localStorage.removeItem('paymentInitiated');
                    if (typeof window.openScreenshotModal === 'function') window.openScreenshotModal();
                }
                if (localStorage.getItem('restaurantConfirmPending') === 'true') {
                    localStorage.removeItem('restaurantConfirmPending');
                    document.getElementById('restaurant-verify-modal')?.classList.add('show');
                }
            };

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') checkPendingActions();
            });
            
            window.addEventListener('focus', checkPendingActions);

            // CHECK ON PAGE LOAD
            checkPendingActions();
        }

        // Restaurant Contact Modal (Step 2)
        if (!document.getElementById('restaurant-contact-modal')) {
            const contactModalHTML = `
                <div id="restaurant-contact-modal" class="payment-modal">
                    <div class="payment-modal-content" style="text-align:center;">
                        <h3 style="font-family: var(--font-heading); margin-bottom:15px;"><i class="fas fa-phone-alt"></i> Final Confirmation Required</h3>
                        <p style="color:var(--text-secondary); margin-bottom:20px;">To confirm your order, please contact the restaurant and verify your payment with the screenshot you shared.</p>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <a href="tel:+916370680744" id="btn-contact-call" class="btn btn-primary btn-block py-3" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px;">
                                <i class="fas fa-phone"></i> Call Restaurant
                            </a>
                            <button id="btn-contact-wa" class="btn btn-whatsapp btn-block py-3" style="display:flex; align-items:center; justify-content:center; gap:10px;">
                                <i class="fab fa-whatsapp"></i> Confirm via WhatsApp
                            </button>
                            <button id="btn-contact-back" class="btn btn-outline btn-block">Back</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', contactModalHTML);
            
            document.getElementById('btn-contact-call')?.addEventListener('click', () => {
                localStorage.setItem('restaurantConfirmPending', 'true');
            });
            
            document.getElementById('btn-contact-wa')?.addEventListener('click', () => {
                localStorage.setItem('restaurantConfirmPending', 'true');
                const message = 'Hi, I have placed an order and shared my payment screenshot. Please confirm my order.';
                const phoneTarget = '916370680744';
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${phoneTarget}?text=${encodedMessage}`;
                window.open(whatsappUrl, '_blank');
            });
            
            document.getElementById('btn-contact-back')?.addEventListener('click', () => {
                document.getElementById('restaurant-contact-modal').classList.remove('show');
            });
        }

        // Restaurant Verification Modal (Step 3)
        if (!document.getElementById('restaurant-verify-modal')) {
            const verifyModalHTML = `
                <div id="restaurant-verify-modal" class="payment-modal">
                    <div class="payment-modal-content" style="text-align:center;">
                        <h3 style="font-family: var(--font-heading); margin-bottom:15px;">Verify Order Confirmation</h3>
                        <p style="color:var(--text-secondary); margin-bottom:20px;">Did you confirm with the restaurant?</p>
                        <div style="display:flex; gap:10px;">
                            <button id="btn-verify-yes" class="btn btn-primary btn-block">YES</button>
                            <button id="btn-verify-no" class="btn btn-outline btn-block">NO</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', verifyModalHTML);
            
            document.getElementById('btn-verify-yes')?.addEventListener('click', () => {
                localStorage.removeItem('restaurantConfirmPending');
                document.getElementById('restaurant-verify-modal').classList.remove('show');
                
                // Clear form fields
                document.getElementById('checkout-name') && (document.getElementById('checkout-name').value = '');
                document.getElementById('checkout-phone') && (document.getElementById('checkout-phone').value = '');
                document.getElementById('checkout-address') && (document.getElementById('checkout-address').value = '');
                document.getElementById('checkout-notes') && (document.getElementById('checkout-notes').value = '');

                // Execute original confirmation logic
                cart = [];
                restaurantNote = '';
                if (typeof updateNoteUI === 'function') updateNoteUI();
                saveCart();
                updateCartUI();
                
                window.showAlert('Order received!\n\nPlease confirm your payment status.\n\n• If your payment is still pending, contact the restaurant.\n• If the restaurant has confirmed your payment in WhatsApp, your order is successfully placed.', { title: 'Order Received! 🎉', icon: '✅', type: 'success' });
                
                // Sync checkout page if applicable
                if (window.location.pathname.includes('checkout.html')) {
                    location.reload();
                }
            });
            
            document.getElementById('btn-verify-no')?.addEventListener('click', () => {
                window.showAlert('Please confirm your payment first before continuing.', { title: 'Payment Pending', icon: '💳', type: 'warning' });
                document.getElementById('restaurant-verify-modal').classList.remove('show');
                
                // Loop back to screenshot modal
                if (typeof window.openScreenshotModal === 'function') {
                    window.openScreenshotModal();
                }
            });
        }

        // Order Confirmation Modal HTML Injection (Replaces obsolete call popup)
        if (!document.getElementById('cod-confirm-modal')) {
            const codConfirmModalHTML = `
                <div id="cod-confirm-modal" class="payment-modal" style="z-index: 99999;">
                    <div class="payment-modal-content" style="text-align:center; max-width:420px; padding:28px 22px; border-radius:20px; background:#18181b; border:1px solid rgba(255,255,255,0.12); box-shadow:0 20px 50px rgba(0,0,0,0.85);">
                        <div style="font-size:44px; margin-bottom:12px;">🎉</div>
                        <h3 style="font-family: var(--font-heading); margin-bottom:8px; font-size:1.35rem; color:#ffffff;">Order Sent to Kitchen!</h3>
                        <p style="color:var(--text-secondary, #cbd5e1); margin-bottom:14px; font-size:0.95rem; line-height:1.5;">Your order details have been received. The restaurant is confirming your order now.</p>
                        
                        <div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:12px; padding:12px 14px; margin-bottom:20px; text-align:left; display:flex; align-items:center; gap:12px;">
                            <span class="tracker-dot-pulse yellow" style="flex-shrink:0;"></span>
                            <div style="font-size:0.85rem; color:#fde68a;">
                                <strong>Live Tracking Active:</strong> Status will update automatically as soon as kitchen accepts.
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <button id="btn-cod-done" class="btn btn-primary btn-block py-3" style="font-weight:800; font-size:1rem; border-radius:12px; cursor:pointer;">
                                👍 Got It / Track Live Order
                            </button>
                            <a href="tel:+916370680744" id="btn-cod-call" class="btn btn-outline btn-block py-2" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.85rem; color:#a1a1aa; border-color:rgba(255,255,255,0.15);">
                                <i class="fas fa-phone"></i> Need to change order? Call Restaurant
                            </a>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', codConfirmModalHTML);

            const dismissAndClean = () => {
                document.getElementById('cod-confirm-modal')?.classList.remove('show');
                
                // Clear form fields
                document.getElementById('checkout-name') && (document.getElementById('checkout-name').value = '');
                document.getElementById('checkout-phone') && (document.getElementById('checkout-phone').value = '');
                document.getElementById('checkout-address') && (document.getElementById('checkout-address').value = '');
                document.getElementById('checkout-notes') && (document.getElementById('checkout-notes').value = '');
                
                cart = [];
                restaurantNote = '';
                if (typeof updateNoteUI === 'function') updateNoteUI();
                saveCart();
                updateCartUI();
            };

            document.getElementById('btn-cod-call')?.addEventListener('click', dismissAndClean);
            document.getElementById('btn-cod-done')?.addEventListener('click', dismissAndClean);
        }

        // Payment Modal HTML Injection
        if (!document.getElementById('payment-modal')) {
            const paymentModalHTML = `
                <div id="payment-modal" class="payment-modal">
                    <div class="payment-modal-content">
                        <span id="close-payment-modal" class="close-btn" style="position: absolute; right: 15px; top: 15px;">&times;</span>
                        
                        <div id="payment-step-1" class="payment-step">
                            <h3 class="text-center mb-2" style="font-family: var(--font-heading);">Select Payment Method</h3>
                            <div class="divider" style="margin-bottom:1.5rem;"></div>
                            <button id="btn-pay-now" class="btn btn-primary btn-block mb-3 py-3" style="font-size:1.1rem;">Pay Now</button>
                            <button id="btn-cod" class="btn btn-outline btn-block mb-2 py-3" style="font-size:1.1rem;">Cash on Delivery (COD)</button>
                        </div>
                        
                        <div id="payment-step-2" class="payment-step" style="display: none;">
                            <h3 class="text-center mb-2" style="font-family: var(--font-heading);">Payment Details</h3>
                            <div class="divider" style="margin-bottom:1.5rem;"></div>
                            <div id="payment-delivery-warning" style="background-color: rgba(244,180,0,0.15); color: var(--primary-color); padding: 10px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid var(--primary-color); font-size:0.85rem; font-weight:bold; display:none;"></div>
                            <button id="btn-pay-items" class="btn btn-outline btn-block mb-3 py-3" style="font-size:1.1rem;">Pay for Items Only (₹<span id="pay-items-amount">0</span>)</button>
                            <button id="btn-pay-full" class="btn btn-primary btn-block mb-2 py-3" style="font-size:1.1rem;">Pay Full (Items + Delivery) (₹<span id="pay-full-amount">0</span>)</button>
                            <button id="btn-back-step-1" class="btn btn-outline btn-block mt-4" style="border:none; text-decoration:underline;">Back</button>
                        </div>
                        
                        <div id="payment-step-3" class="payment-step" style="display: none; text-align: center;">
                            <h3 style="font-family: var(--font-heading); margin-bottom:10px;">Scan to Pay: ₹<span id="final-pay-amount">0</span></h3>
                            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-bottom:15px;">
                                <img src="images/upi-qr.jpeg" alt="UPI QR Code" style="width: 200px; height: 200px; margin: 0 auto; border-radius:10px; box-shadow:var(--shadow-sm);">
                            </div>
                            <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; color:var(--text-primary);">UPI: manjukarmakar3-2@okaxis</p>
                            <button id="btn-copy-upi" class="btn btn-outline mb-4" style="font-size: 0.9rem; padding: 6px 20px; border-radius: 20px; display:inline-block; width:auto; border-width:2px; font-weight:600;">Copy UPI ID</button>
                            
                            <div style="background-color: rgba(244,180,0,0.15); padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--primary-color); text-align:left;">
                                <p style="color: var(--primary-color); font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">⚠️ Payment Screenshot Required</p>
                                <p style="color: #e0e0e0; font-size: 0.85rem; line-height:1.4;">Please attach your payment screenshot in WhatsApp before sending the order to confirm it.</p>
                            </div>
                            
                            <button id="btn-i-have-paid" class="btn btn-whatsapp btn-block py-3" style="font-size:1.1rem;">
                                <i class="fab fa-whatsapp"></i> I have paid
                            </button>
                            <button id="btn-back-step-2" class="btn btn-outline btn-block mt-3" style="border:none; text-decoration:underline;">Back</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', paymentModalHTML);
        }

        const checkoutBtn = document.getElementById('checkout-btn');
        const paymentModal = document.getElementById('payment-modal');
        const closePaymentModal = document.getElementById('close-payment-modal');
        const step1 = document.getElementById('payment-step-1');
        const step2 = document.getElementById('payment-step-2');
        const step3 = document.getElementById('payment-step-3');
        
        let currentOrderSubtotal = 0;
        let currentOrderTotal = 0;
        let selectedPaymentMode = 'items'; // 'items' or 'full'
        let isCOD = false;

        function showStep(stepNode) {
            step1.style.display = 'none';
            step2.style.display = 'none';
            step3.style.display = 'none';
            stepNode.style.display = 'block';
        }

        window.buildWhatsAppMessage = function(orderData) {
            const { 
                isCOD, 
                cart, 
                subtotalAmount, 
                deliveryCharge, 
                deliveryStatus, 
                isDelivery, 
                appliedCoupon, 
                discountAmount, 
                selectedPaymentMode, 
                name, 
                phone, 
                address,
                restaurantNote
            } = orderData;
            
            let itemsList = '';
            let finalCart = [...cart];
            
            if (appliedCoupon && appliedCoupon.type === 'PEPSI') {
                finalCart.push({
                    name: "Pepsi",
                    quantity: 1,
                    price: 20,
                    isFree: true
                });
            }

            finalCart.forEach(item => {
                if (item.isFree) {
                    itemsList += `• ${item.name} ×${item.quantity} — FREE 🎁\n`;
                } else {
                    const itemTotal = Number(item.price) * (Number(item.quantity) || 1);
                    itemsList += `• ${item.name} ×${item.quantity || 1} — ₹${itemTotal}\n`;
                }
                if (item.isCombo && item.note) {
                    itemsList += `  └ ${item.note}\n`;
                }
            });
            itemsList = itemsList.trimEnd();

            let deliveryText = '';
            let finalTotal = subtotalAmount;

            if (!isDelivery) {
                deliveryText = 'Pickup (Takeaway)';
            } else if (deliveryStatus === 'AVAILABLE') {
                const currentRate = window.adminDeliveryRate || 30;
                const distanceVal = Math.round(deliveryCharge / currentRate);
                deliveryText = `₹${deliveryCharge} (${distanceVal} km)`;
                finalTotal += deliveryCharge;
            } else {
                deliveryText = 'Not calculated';
            }

            if (appliedCoupon) {
                finalTotal -= discountAmount;
                if (finalTotal < 0) finalTotal = 0;
            }

            let paidAmount = 0;
            let deliveryDue = 0;
            let deliveryNoteStr = '';

            if (isCOD) {
                paidAmount = 0;
                deliveryDue = finalTotal;
                deliveryNoteStr = `💵 Payment Mode: Cash on Delivery\nTotal Payable: ₹${finalTotal}`;
            } else if (selectedPaymentMode === 'items') {
                const discountVal = appliedCoupon ? discountAmount : 0;
                paidAmount = Math.max(0, subtotalAmount - discountVal);
                if (isDelivery && deliveryStatus === 'AVAILABLE') {
                    deliveryDue = deliveryCharge;
                    if (appliedCoupon && discountAmount > subtotalAmount) {
                        deliveryDue = Math.max(0, deliveryCharge - (discountAmount - subtotalAmount));
                    }
                }
            } else {
                paidAmount = finalTotal;
                deliveryDue = 0;
            }

            if (!isCOD) {
                if (deliveryDue > 0 && isDelivery && deliveryStatus === 'AVAILABLE') {
                    deliveryNoteStr = `\n🚚 Delivery charge (₹${deliveryDue}) will be paid at the time of delivery.`;
                } else if (isDelivery && deliveryStatus !== 'AVAILABLE') {
                    deliveryNoteStr = '\n🚚 Delivery charge will be informed by the delivery partner at the time of delivery.';
                } else if (!isDelivery || (deliveryDue === 0 && selectedPaymentMode === 'full')) {
                    deliveryNoteStr = '';
                }
            }

            let msg = '';
            
            if (!isCOD) {
                msg += `⚠️ IMPORTANT: Please attach your payment screenshot before sending this message.\n\n`;
            }

            const locLabel = window.littiWaleSelectedLocation === 'outlet'
              ? '🏪 PHYSICAL OUTLET ORDER\n📍 Near Barbil Court, Rabisons Mall\n'
              : '☁️ CLOUD KITCHEN ORDER\n';
            msg += `👋 Hello Littiwale!\n${locLabel}\n`;
            msg += `🛒 Order Details:\n`;
            msg += `${itemsList}\n\n`;
            msg += `-----------------------\n\n`;
            msg += `💰 Bill Summary:\n`;
            msg += `Subtotal: ₹${subtotalAmount}\n`;
            if (appliedCoupon) {
                if (appliedCoupon.type === 'PEPSI') {
                    msg += `Discount: -₹${discountAmount} (Free Pepsi)\n`;
                } else {
                    msg += `Discount: -₹${discountAmount}\n`;
                }
            }
            msg += `Delivery: ${deliveryText}\n`;
            msg += `Total: ₹${finalTotal}\n\n`;
            msg += `-----------------------\n\n`;
            msg += `💳 Payment:\n`;
            msg += `Paid: ₹${paidAmount}\n`;
            msg += `Delivery Due: ₹${deliveryDue}`;

            if (deliveryNoteStr) {
                msg += `\n${deliveryNoteStr}\n`;
            } else {
                msg += `\n`;
            }

            msg += `\n-----------------------\n\n`;
            msg += `📍 Customer Details:\n`;
            msg += `Name: ${name}\n`;
            msg += `Phone: ${phone}\n`;
            
            if (!isDelivery) {
                msg += `Order Type: 🛍️ Takeaway\n\n`;
            } else {
                msg += `Order Type: 🚚 Delivery\n`;
                msg += `Address: ${address}\n`;
                if (window.gpsLink) {
                    msg += `Google Maps GPS: ${window.gpsLink}\n\n`;
                } else {
                    msg += `\n`;
                }
            }
            msg += `-----------------------`;

            if (!isCOD) {
                msg += `\n\n📸 Please attach payment screenshot for confirmation.`;
            }

            if (restaurantNote) {
                msg += `\n\n📝 Note: ${restaurantNote}`;
            }

            return msg;
        };

        async function saveOrderToDatabase(orderData) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const res = await fetch(`${ADMIN_API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.message || `HTTP ${res.status}`);
                }
                const savedDoc = await res.json();
                return { success: true, data: savedDoc };
            } catch (err) {
                console.error("Order save to MongoDB error:", err);
                return { success: false, error: err.message || "Network request failed" };
            }
        }

        async function sendWhatsAppMessage() {
            // Duplicate submission lock
            if (window.isSubmittingOrder) return;
            window.isSubmittingOrder = true;

            const submitBtns = [
                document.getElementById('btn-cod'),
                document.getElementById('btn-i-have-paid'),
                document.getElementById('checkout-place-order-btn')
            ].filter(Boolean);

            const origBtnTexts = submitBtns.map(b => b.innerHTML);
            submitBtns.forEach(b => {
                b.disabled = true;
                b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Order...';
            });

            const getVal = (id1, id2) => {
                const el1 = document.getElementById(id1);
                const el2 = document.getElementById(id2);
                if (el1 && el1.value.trim()) return el1.value.trim();
                if (el2 && el2.value.trim()) return el2.value.trim();
                return '';
            };
            
            const name = getVal('checkout-name', 'cust-name');
            const phone = getVal('checkout-phone', 'cust-phone');
            const isSameWhatsApp = document.getElementById('same-whatsapp-chk') ? document.getElementById('same-whatsapp-chk').checked : true;
            const customWhatsApp = document.getElementById('checkout-whatsapp') ? document.getElementById('checkout-whatsapp').value.trim() : '';
            const whatsappPhone = isSameWhatsApp ? phone : (customWhatsApp || phone);
            
            const orderTypeDel1 = document.getElementById('checkout-type-delivery');
            const orderTypeDel2 = document.getElementById('order-type-delivery');
            let isDelivery = true;
            if (orderTypeDel1 && orderTypeDel1.checked !== undefined) {
                isDelivery = orderTypeDel1.checked;
            } else if (orderTypeDel2 && orderTypeDel2.checked !== undefined) {
                isDelivery = orderTypeDel2.checked;
            }

            const address = isDelivery ? getVal('checkout-address', 'cust-address') : 'Self Pickup (Takeaway)';
            const landmark = isDelivery ? (document.getElementById('checkout-landmark')?.value || '').trim() : '';
            
            let subtotalAmount = 0;
            cart.forEach(item => {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity) || 0;
                subtotalAmount += (priceNum * qtyNum);
            });

            const currentDelCharge = (isDelivery && deliveryStatus === 'AVAILABLE') ? (deliveryCharge || 0) : 0;
            const currentDiscount = (appliedCoupon && typeof discountAmount !== 'undefined') ? discountAmount : 0;
            const computedFinalTotal = Math.max(0, subtotalAmount + currentDelCharge - currentDiscount);

            // Construct Order Payload for MongoDB
            const orderPayload = {
                customerName: name,
                customerPhone: phone,
                whatsappPhone: whatsappPhone,
                deliveryAddress: address,
                landmark: landmark,
                deliveryLocation: sessionStorage.getItem('littiWaleLocation') || 'cloud',
                orderType: isDelivery ? 'delivery' : 'takeaway',
                items: cart.map(item => ({
                    id: item.id || item._id || '',
                    name: item.name,
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1)
                })),
                subtotal: subtotalAmount,
                discount: currentDiscount,
                couponCode: appliedCoupon ? (appliedCoupon.code || appliedCoupon) : '',
                deliveryCharge: currentDelCharge,
                finalTotal: computedFinalTotal,
                paymentMethod: isCOD ? 'COD' : 'UPI',
                paymentMode: selectedPaymentMode || 'full',
                notes: restaurantNote || '',
                orderSource: 'website',
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Save order to MongoDB before WhatsApp
            const saveRes = await saveOrderToDatabase(orderPayload);

            if (!saveRes.success) {
                window.isSubmittingOrder = false;
                submitBtns.forEach((b, i) => {
                    b.disabled = false;
                    b.innerHTML = origBtnTexts[i];
                });
                window.showAlert('Unable to save order to the restaurant system:\n' + (saveRes.error || 'Please check your internet connection and try again.') + '\n\nYour cart has been preserved.', { title: 'Order Failed', icon: '❌', type: 'error' });
                return;
            }

            // Save active order to localStorage for live customer status tracking
            const createdOrder = saveRes.data?.order || saveRes.data;
            if (createdOrder && createdOrder._id) {
                const cleanCustPhone = String(phone || '').replace(/\D/g, '').slice(-10);
                localStorage.setItem('littiWaleActiveOrder', JSON.stringify({
                    _id: createdOrder._id,
                    id: createdOrder._id,
                    shortId: String(createdOrder._id).slice(-6).toUpperCase(),
                    status: 'pending',
                    customerName: createdOrder.customerName || name,
                    customerPhone: cleanCustPhone,
                    deliveryAddress: address,
                    items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, subtotal: i.price * i.quantity })),
                    subtotal: createdOrder.subtotal || subtotalAmount,
                    discount: currentDiscount,
                    deliveryCharge: createdOrder.deliveryCharge || 0,
                    finalTotal: createdOrder.finalTotal || computedFinalTotal,
                    paymentMethod: isCOD ? 'COD' : 'UPI',
                    orderType: isDelivery ? 'delivery' : 'takeaway',
                    createdAt: new Date().toISOString()
                }));
                if (typeof window.initOrderTracker === 'function') {
                    window.initOrderTracker();
                }
            }

            // Save Customer Profile for Instant Reorder & Auto-Fill
            const cleanCustPhone = String(phone || '').replace(/\D/g, '').slice(-10);
            if (cleanCustPhone) {
                localStorage.setItem('littiwale_customer_phone', cleanCustPhone);
                localStorage.setItem('littiwale_customer_profile', JSON.stringify({
                    name: name,
                    phone: cleanCustPhone,
                    address: address,
                    landmark: landmark || ''
                }));
            }

            // Restore button state
            window.isSubmittingOrder = false;
            submitBtns.forEach((b, i) => {
                b.disabled = false;
                b.innerHTML = origBtnTexts[i];
            });

            const message = window.buildWhatsAppMessage({
                isCOD,
                cart,
                subtotalAmount,
                deliveryCharge: typeof deliveryCharge !== 'undefined' ? deliveryCharge : 0,
                deliveryStatus: typeof deliveryStatus !== 'undefined' ? deliveryStatus : 'UNAVAILABLE',
                isDelivery,
                appliedCoupon: typeof appliedCoupon !== 'undefined' ? appliedCoupon : null,
                discountAmount: typeof discountAmount !== 'undefined' ? discountAmount : 0,
                selectedPaymentMode,
                name,
                phone,
                address,
                restaurantNote
            });
            
            const phoneTarget = '916370680744';
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = 'https://wa.me/' + phoneTarget + '?text=' + encodedMessage;
            
            if (!isCOD) {
                localStorage.setItem('paymentInitiated', 'true');
                
                // UNIVERSAL FALLBACK (1.2s)
                setTimeout(() => {
                    const flag = localStorage.getItem("paymentInitiated");
                    if (flag === "true") {
                        if (typeof window.openScreenshotModal === "function") {
                            window.openScreenshotModal();
                        }
                    }
                }, 1200);

                // SECOND SAFETY TIMER (3s)
                setTimeout(() => {
                    const flag = localStorage.getItem("paymentInitiated");
                    if (flag === "true") {
                        if (typeof window.openScreenshotModal === "function") {
                            window.openScreenshotModal();
                        }
                    }
                }, 3000);
            }
            
            // Clear cart immediately
            cart = [];
            restaurantNote = '';
            if (typeof updateNoteUI === 'function') updateNoteUI();
            saveCart();
            updateCartUI();

            // Open WhatsApp in new tab and redirect website to dedicated Live Tracking Page!
            window.open(whatsappUrl, '_blank');
            paymentModal.classList.remove('show');
            cartDrawer.classList.remove('open');

            if (createdOrder && createdOrder._id) {
                setTimeout(() => {
                    window.location.href = `track.html?orderId=${createdOrder._id}`;
                }, 600);
            }
        }

        function executeCheckout(nameId, phoneId, addressId, orderTypeDeliveryId) {
            if (cart.length === 0) return;
            const name = document.getElementById(nameId)?.value.trim();
            const phoneInput = document.getElementById(phoneId);
            const phone = phoneInput?.value.trim();
            const address = document.getElementById(addressId)?.value.trim();

            const orderTypeDelivery = document.getElementById(orderTypeDeliveryId);
            const isDelivery = orderTypeDelivery ? orderTypeDelivery.checked : true;
            
            if (!name || !phone) {
                window.showAlert('Please fill in your Name and Phone Number to continue.', { title: 'Missing Details', icon: '📝', type: 'warning' });
                return;
            }
            if (isDelivery && !address) {
                window.showAlert('Please provide your delivery address.', { title: 'Address Required', icon: '📍', type: 'warning' });
                return;
            }
            
            const phoneRegex = /^(\+91\d{10}|0\d{10}|\d{10})$/;
            if (!phoneRegex.test(phone)) {
                window.showAlert('Please enter a valid 10-digit Indian phone number.', { title: 'Invalid Phone', icon: '📱', type: 'error' });
                phoneInput.style.borderColor = 'red';
                phoneInput.focus();
                return;
            } else {
                phoneInput.style.borderColor = '';
            }

            currentOrderSubtotal = 0;
            cart.forEach(item => {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity) || 0;
                currentOrderSubtotal += (priceNum * qtyNum);
            });
            
            currentOrderTotal = currentOrderSubtotal;
            if (isDelivery && deliveryStatus === 'AVAILABLE') {
                currentOrderTotal += deliveryCharge;
            }
            
            if (appliedCoupon) {
                currentOrderTotal -= discountAmount;
                if (currentOrderTotal < 0) currentOrderTotal = 0;
            }
            
            if (nameId === 'checkout-name') {
               const notesInput = document.getElementById('checkout-notes');
               if (notesInput && notesInput.value.trim() !== '') {
                   restaurantNote = notesInput.value.trim();
               }
            }

            showUpsellModal();
        }

        const cartDrawerCheckoutBtn = document.getElementById('checkout-btn');
        if (cartDrawerCheckoutBtn) {
            cartDrawerCheckoutBtn.addEventListener('click', () => {
                // Block checkout when admin has set restaurant offline
                if (window.isRestaurantCurrentlyOpen === false) {
                    const reason = window.restaurantClosedReason || 'Kitchen is temporarily offline';
                    const overlay = document.getElementById('restaurant-closed-overlay');
                    if (overlay) overlay.classList.add('show');
                    return;
                }
                const deliveryRadio = document.getElementById('order-type-delivery');
                if (deliveryRadio) {
                    localStorage.setItem('littiWaleOrderType', deliveryRadio.checked ? 'delivery' : 'takeaway');
                }
                window.location.href='checkout.html';
            });
        }
        
        const pageCheckoutBtn = document.getElementById('checkout-place-order-btn');
        if (pageCheckoutBtn) {
            pageCheckoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('checkout-name')?.value.trim();
                const phone = document.getElementById('checkout-phone')?.value.trim();
                const address = document.getElementById('checkout-address')?.value.trim();
                const isDelivery = document.getElementById('checkout-type-delivery')?.checked;
                
                if (!name || !phone) {
                    window.showAlert('Please fill in your Name and Phone Number to continue.', { title: 'Missing Details', icon: '📝', type: 'warning' });
                    return;
                }
                if (isDelivery && !address) {
                    window.showAlert('Please provide your delivery address.', { title: 'Address Required', icon: '📍', type: 'warning' });
                    return;
                }

                executeCheckout('checkout-name', 'checkout-phone', 'checkout-address', 'checkout-type-delivery');
            });
        }
        
        const btnGps = document.getElementById('btn-gps');
        if (btnGps) {
            btnGps.addEventListener('click', () => {
                if ("geolocation" in navigator) {
                    btnGps.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
                    deliveryStatus = 'CALCULATING';
                    updateCartUI();
                    navigator.geolocation.getCurrentPosition(position => {
                        window.gpsLink = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
                        btnGps.innerHTML = '<i class="fas fa-check"></i> Location Captured';
                        btnGps.style.background = '#28a745';
                        const dist = calculateDistance(position.coords.latitude, position.coords.longitude, RESTAURANT_LAT, RESTAURANT_LNG);
                        const roundedKm = Math.max(1, Math.round(dist));
                        const currentRate = window.adminDeliveryRate || 30;
                        deliveryCharge = roundedKm * currentRate;
                        deliveryStatus = 'AVAILABLE';
                        updateCartUI();
                    }, error => {
                        window.showAlert('Could not get your location. Please ensure GPS is enabled and try again.', { title: 'Location Error', icon: '📍', type: 'error' });
                        btnGps.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use Current Location (Optional)';
                        deliveryStatus = 'UNKNOWN';
                        deliveryCharge = 0;
                        updateCartUI();
                    });
                } else {
                    window.showAlert('Geolocation is not supported by your browser. Please enter your address manually.', { title: 'Not Supported', icon: '🌍', type: 'info' });
                }
            });
        }


        function showPaymentModalActual() {
            paymentModal.classList.add('show');
            showStep(step1);
        }

        function proceedToPaymentModal() {
            // Recalculate strictly in case upsell modified it
            currentOrderSubtotal = 0;
            cart.forEach(item => {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity) || 0;
                currentOrderSubtotal += (priceNum * qtyNum);
            });
            const orderTypeDelivery = document.getElementById('order-type-delivery');
            const isDelivery = orderTypeDelivery ? orderTypeDelivery.checked : true;
            
            currentOrderTotal = currentOrderSubtotal;
            if (isDelivery && deliveryStatus === 'AVAILABLE') {
                currentOrderTotal += deliveryCharge;
            }
            
            if (appliedCoupon) {
                currentOrderTotal -= discountAmount;
                if (currentOrderTotal < 0) currentOrderTotal = 0;
            }
            
            showPaymentModalActual();
        }
        window.proceedToPaymentModal = proceedToPaymentModal;

        let upsellRefreshCount = 0;
        let upsellShownItems = [];

        function renderUpsellItems() {
            const container = document.getElementById('upsell-items-container');
            const btnsContainer = document.getElementById('upsell-buttons-container');
            container.innerHTML = '';
            
            // Filter out items already shown, in cart, or in excluded categories
            const excludedCategories = ["Tandoori/Kebabs", "Pre Order Specials"];
            let suggestionsPool = menuData.filter(item => {
                const inCart = cart.some(ci => ci.id === item.id || ci.id === item.id + '_half' || ci.id === item.id + '_full');
                const alreadyShown = upsellShownItems.includes(item.id);
                const excluded = excludedCategories.includes(item.category);
                return !inCart && !alreadyShown && !excluded;
            });
            
            // Prefer bestsellers or low-price
            let suggestions = suggestionsPool.filter(item => item.price < 150 || (item.half && item.half < 150) || initialBestsellers.some(b => b.id === item.id));
            if (suggestions.length < 2) suggestions = suggestionsPool; // fallback
            
            // Shuffle
            suggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
            if (suggestions.length === 0) {
                // Out of suggestions
                container.innerHTML = '<p class="text-center" style="color:var(--text-secondary);">No more suggestions available.</p>';
            } else {
                suggestions.forEach(item => {
                    upsellShownItems.push(item.id);
                    let priceToUse = item.price;
                    let idToUse = item.id;
                    let nameToUse = item.name.replace(/'/g, "\\'");
                    
                    if (item.half !== undefined) {
                        priceToUse = item.half;
                        idToUse = item.id + '_half';
                        nameToUse = nameToUse + ' Half';
                    }
                    
                    // Is it a bestseller?
                    const isBestseller = initialBestsellers.some(b => b.id === item.id);
                    const badgeHtml = isBestseller ? '<div style="font-size:0.75rem; color:#f7a22e; font-weight:bold; margin-bottom:2px;">⭐ Bestseller</div>' : '<div style="font-size:0.75rem; color:#28a745; font-weight:bold; margin-bottom:2px;">🔥 Popular</div>';
                    
                    const html = `
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#1c1c1c; padding:10px 15px; border-radius:10px; border: 1px solid #333; margin-bottom:10px;">
                            <div style="flex:1;">
                                ${badgeHtml}
                                <h4 style="font-size:1rem; margin-bottom:2px; font-family:var(--font-heading); color:#ffffff;">${item.name}</h4>
                                <div style="color:var(--primary-color); font-weight:bold; font-size:1rem;">₹${priceToUse}</div>
                            </div>
                            <button class="btn" style="border: 1px solid var(--primary-color); background:transparent; color:var(--primary-color); padding: 6px 15px; font-size:0.9rem;" onclick="const added = addToCart('${idToUse}', '${nameToUse}', ${priceToUse}, '${item.image}'); if(added) { document.getElementById('upsell-modal').classList.remove('show'); proceedToPaymentModal(); }">+ Add</button>
                        </div>
                    `;
                    container.innerHTML += html;
                });
            }

            // Update bottom buttons based on count
            if (upsellRefreshCount < 2 && suggestions.length > 0) {
                btnsContainer.innerHTML = `
                    <button id="btn-upsell-refresh" class="btn btn-outline btn-block mb-2 py-3" style="font-size:1.1rem; border-color:var(--primary-color); color:var(--primary-color);">Show More <i class="fas fa-sync-alt" style="font-size:0.9em; margin-left:5px;"></i></button>
                    <button id="btn-continue-order" class="btn btn-primary btn-block mb-2 py-3" style="font-size:1.1rem;">Continue with current order</button>
                `;
                document.getElementById('btn-upsell-refresh').addEventListener('click', () => {
                    upsellRefreshCount++;
                    renderUpsellItems();
                });
            } else {
                btnsContainer.innerHTML = `
                    <button id="btn-upsell-menu" class="btn btn-outline btn-block mb-2 py-3" style="font-size:1.1rem; border-color:var(--primary-color); color:var(--primary-color);">View Full Menu</button>
                    <button id="btn-continue-order" class="btn btn-primary btn-block mb-2 py-3" style="font-size:1.1rem;">Continue with current order</button>
                `;
                document.getElementById('btn-upsell-menu').addEventListener('click', () => {
                    document.getElementById('upsell-modal').classList.remove('show');
                    document.getElementById('cart-drawer').classList.remove('open');
                    if (!isMenuExpanded) {
                        document.getElementById('toggle-full-menu-btn')?.click();
                    } else {
                        document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }
            
            document.getElementById('btn-continue-order').addEventListener('click', () => {
                document.getElementById('upsell-modal').classList.remove('show');
                proceedToPaymentModal();
            });
        }

        function showUpsellModal() {
            let upsellModal = document.getElementById('upsell-modal');
            
            if (!upsellModal) {
                const upsellHTML = `
                    <div id="upsell-modal" class="payment-modal">
                        <div class="payment-modal-content" style="max-height: 80vh; overflow-y: auto;">
                            <span id="close-upsell-modal" class="close-btn" style="position: absolute; right: 15px; top: 15px;">&times;</span>
                            <h3 class="text-center mb-2" style="font-family: var(--font-heading); font-size: 1.4rem;">You may also like this 😋</h3>
                            
                            <div id="upsell-items-container" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; margin-top:20px;">
                            </div>
                            
                            <div id="upsell-buttons-container"></div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', upsellHTML);
                upsellModal = document.getElementById('upsell-modal');
                
                document.getElementById('close-upsell-modal').addEventListener('click', () => {
                    upsellModal.classList.remove('show');
                });
            }

            upsellRefreshCount = 0;
            upsellShownItems = [];
            
            renderUpsellItems();
            upsellModal.classList.add('show');
        }

        if (closePaymentModal) {
            closePaymentModal.addEventListener('click', () => {
                paymentModal.classList.remove('show');
            });
        }

        document.getElementById('btn-cod')?.addEventListener('click', () => {
            isCOD = true;
            selectedPaymentMode = 'full';
            sendWhatsAppMessage();
        });

        document.getElementById('btn-pay-now')?.addEventListener('click', () => {
            isCOD = false;
            let itemsToPay = currentOrderSubtotal;
            if (appliedCoupon) {
                itemsToPay = Math.max(0, currentOrderSubtotal - discountAmount);
            }
            document.getElementById('pay-items-amount').textContent = itemsToPay;
            document.getElementById('pay-full-amount').textContent = currentOrderTotal;
            
            const warningEl = document.getElementById('payment-delivery-warning');
            const btnPayFull = document.getElementById('btn-pay-full');
            
            warningEl.style.display = 'none';
            btnPayFull.style.display = 'block';

            if (deliveryStatus === 'UNKNOWN') {
                warningEl.textContent = 'Delivery charges will be extra charged based on distance.';
                warningEl.style.display = 'block';
            }

            showStep(step2);
        });

        document.getElementById('btn-back-step-1')?.addEventListener('click', () => { showStep(step1); });
        document.getElementById('btn-back-step-2')?.addEventListener('click', () => { showStep(step2); });

        document.getElementById('btn-pay-items')?.addEventListener('click', () => {
            const orderTypeDelivery = document.getElementById('order-type-delivery');
            const isDelivery = orderTypeDelivery ? orderTypeDelivery.checked : true;
            
            if (isDelivery) {
                paymentModal.classList.remove('show');
                document.getElementById('delivery-info-modal').classList.add('show');
            } else {
                selectedPaymentMode = 'items';
                let itemsToPay = currentOrderSubtotal;
                if (appliedCoupon) {
                    itemsToPay = Math.max(0, currentOrderSubtotal - discountAmount);
                }
                document.getElementById('final-pay-amount').textContent = itemsToPay;
                showStep(step3);
            }
        });

        document.getElementById('btn-pay-full')?.addEventListener('click', () => {
            selectedPaymentMode = 'full';
            document.getElementById('final-pay-amount').textContent = currentOrderTotal;
            showStep(step3);
        });

        document.getElementById('btn-copy-upi')?.addEventListener('click', () => {
            navigator.clipboard.writeText('manjukarmakar3-2@okaxis').then(() => {
                const btn = document.getElementById('btn-copy-upi');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy UPI ID', 2000);
            });
        });

        document.getElementById('btn-i-have-paid')?.addEventListener('click', () => {
            sendWhatsAppMessage();
        });
    }

    // --- Dynamic Announcement Carousel ---
    function initAnnouncementCarousel() {
        const announcementSection = document.getElementById('announcement');
        const carousel = document.getElementById('announcement-carousel');
        const dotsContainer = document.getElementById('announcement-dots');
        
        if (!announcementSection || !carousel || !dotsContainer) return;

        fetch(`${ADMIN_API_BASE_URL}/announcements`)
            .then(res => res.json())
            .then(full => {
                const activeImages = (full && Array.isArray(full) ? full : [])
                    .filter(a => a.isActive !== false && a.image)
                    .map(a => a.image);
                if (activeImages.length > 0) {
                    setupCarousel(activeImages);
                } else {
                    loadLocalImages();
                }
            })
            .catch(() => loadLocalImages());

        function loadLocalImages() {
            let maxChecks = 5;
            let validImages = [];
            let checksCompleted = 0;
            
            const checkDone = () => {
                checksCompleted++;
                if (checksCompleted === maxChecks) {
                    validImages.sort((a, b) => a.index - b.index);
                    const imageUrls = validImages.map(v => v.url);
                    if (imageUrls.length > 0) setupCarousel(imageUrls);
                }
            };

            for (let i = 1; i <= maxChecks; i++) {
                const img = new Image();
                const url = `images/announcements/current-offer${i}.png`;
                img.onload = () => {
                    validImages.push({ index: i, url: url });
                    checkDone();
                };
                img.onerror = () => checkDone();
                img.src = url;
            }
        }

        function setupCarousel(imageUrls) {
            announcementSection.style.display = 'block';
            carousel.innerHTML = '';
            dotsContainer.innerHTML = '';
            
            imageUrls.forEach((url, index) => {
                const item = document.createElement('div');
                item.className = 'announcement-slide';
                item.style.width = '100%';
                item.style.flex = '0 0 100%';
                item.style.display = 'flex';
                item.style.justifyContent = 'center';
                
                const img = document.createElement('img');
                img.src = url;
                img.className = 'announcement-img';
                img.style.width = '100%';
                img.style.maxHeight = '450px';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '10px';
                img.style.transition = 'transform 0.3s ease';
                img.onmouseover = () => img.style.transform = 'scale(1.02)';
                img.onmouseout = () => img.style.transform = 'scale(1)';
                
                item.appendChild(img);
                carousel.appendChild(item);
            });

            if (imageUrls.length > 1) {
                let currentIndex = 0;
                let autoSlideInterval;

                imageUrls.forEach((_, index) => {
                    const dot = document.createElement('span');
                    dot.style.display = 'inline-block';
                    dot.style.width = '10px';
                    dot.style.height = '10px';
                    dot.style.borderRadius = '50%';
                    dot.style.background = index === 0 ? 'var(--primary-color)' : '#ccc';
                    dot.style.margin = '0 5px';
                    dot.style.cursor = 'pointer';
                    dot.style.transition = 'background 0.3s ease';
                    dot.addEventListener('click', () => goToSlide(index));
                    dotsContainer.appendChild(dot);
                });
                
                carousel.style.width = '100%';

                const updateCarousel = () => {
                    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                    
                    Array.from(dotsContainer.children).forEach((dot, idx) => {
                        dot.style.background = idx === currentIndex ? 'var(--primary-color)' : '#ccc';
                    });
                };
                
                const nextSlide = () => {
                    currentIndex = (currentIndex + 1) % imageUrls.length;
                    updateCarousel();
                };
                
                const prevSlide = () => {
                    currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
                    updateCarousel();
                };
                
                const startInterval = () => autoSlideInterval = setInterval(nextSlide, 3500);
                const resetInterval = () => { clearInterval(autoSlideInterval); startInterval(); };
                
                const goToSlide = (index) => {
                    currentIndex = index;
                    updateCarousel();
                    resetInterval();
                };
                
                const announcementContainer = announcementSection.querySelector('.announcement-container');
                if (announcementContainer && !document.getElementById('carousel-prev-btn')) {
                    const prevBtn = document.createElement('button');
                    prevBtn.id = 'carousel-prev-btn';
                    prevBtn.innerHTML = '&#10094;';
                    prevBtn.style.cssText = 'position: absolute; top: 50%; left: 20px; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; z-index: 10; display: flex; align-items: center; justify-content: center; transition: background 0.3s;';
                    prevBtn.onmouseover = () => prevBtn.style.background = 'rgba(0,0,0,0.8)';
                    prevBtn.onmouseout = () => prevBtn.style.background = 'rgba(0,0,0,0.5)';
                    
                    const nextBtn = document.createElement('button');
                    nextBtn.id = 'carousel-next-btn';
                    nextBtn.innerHTML = '&#10095;';
                    nextBtn.style.cssText = 'position: absolute; top: 50%; right: 20px; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; z-index: 10; display: flex; align-items: center; justify-content: center; transition: background 0.3s;';
                    nextBtn.onmouseover = () => nextBtn.style.background = 'rgba(0,0,0,0.8)';
                    nextBtn.onmouseout = () => nextBtn.style.background = 'rgba(0,0,0,0.5)';
                    
                    announcementContainer.appendChild(prevBtn);
                    announcementContainer.appendChild(nextBtn);
                    
                    prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
                    nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
                }

                startInterval();
                
                let touchStartX = 0;
                let touchEndX = 0;
                let isDragging = false;
                
                carousel.addEventListener('touchstart', e => {
                    if (window.innerWidth > 768) return;
                    touchStartX = e.changedTouches[0].screenX;
                    isDragging = true;
                    clearInterval(autoSlideInterval);
                }, {passive: true});
                
                carousel.addEventListener('touchmove', e => {
                    if (window.innerWidth > 768 || !isDragging) return;
                    touchEndX = e.changedTouches[0].screenX;
                }, {passive: true});
                
                carousel.addEventListener('touchend', e => {
                    if (window.innerWidth > 768 || !isDragging) return;
                    isDragging = false;
                    touchEndX = e.changedTouches[0].screenX;
                    const diff = touchStartX - touchEndX;
                    if (diff > 50) nextSlide();
                    else if (diff < -50) prevSlide();
                    startInterval();
                }, {passive: true});
            }
        }
    }



    // --- Dynamic Reviews Carousel ---
    function initReviewsCarousel() {
        const reviewsSection = document.getElementById('reviews-section');
        const carousel = document.getElementById('reviews-carousel');
        const dotsContainer = document.getElementById('reviews-dots');
        
        if (!reviewsSection || !carousel || !dotsContainer) return;

        const reviews = [
            { text: "Best litti chokha in Barbil! Taste bilkul ghar jaisa ❤️", author: "Rahul" },
            { text: "Barbil me fast food ke liye best place — pizza, burger sab mast 🔥", author: "Priya" },
            { text: "Quality aur quantity dono top level 👌 Best restaurant in Barbil", author: "Aman" },
            { text: "Affordable price aur mast taste. Barbil me must try spot!", author: "Neha" },
            { text: "Packaging clean tha aur food fresh tha 👍 Fast delivery in Barbil", author: "Arjun" },
            { text: "Bachelors and working employees ke liye daily meals ka best option hai in Barbil. Main roz bank me yahi se order karti hu 😋", author: "Sonali" },
            { text: "Barbil me ghar jaisa taste + timely delivery. Highly recommended!", author: "Saurabh" },
            { text: "Family ke liye perfect meal 👨👩👧 Best food in Barbil", author: "Pooja" },
            { text: "Portion size bhi accha hai aur price bhi reasonable 👍 Best combo meals in Barbil", author: "Vivek" },
            { text: "Quick service aur consistent taste — Barbil me best fast food restaurant 🔥", author: "Ankit" }
        ];

        carousel.innerHTML = '';
        dotsContainer.innerHTML = '';

        reviews.forEach((review, index) => {
            const item = document.createElement('div');
            item.className = 'review-slide';
            item.style.width = '100%';
            item.style.flex = '0 0 100%';
            item.style.boxSizing = 'border-box';
            item.style.padding = '15px';
            item.style.display = 'flex';
            item.style.justifyContent = 'center';

            const card = document.createElement('div');
            card.style.background = '#f8f9fa';
            card.style.borderRadius = '12px';
            card.style.padding = '20px';
            card.style.width = '100%';
            card.style.maxWidth = '500px';
            card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
            card.style.textAlign = 'center';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'center';

            card.innerHTML = `
                <div style="color: #ffc107; font-size: 1.2rem; margin-bottom: 10px;">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
                <p style="font-size: 1rem; color: #333; font-style: italic; margin-bottom: 15px;">"${review.text}"</p>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-color);">— ${review.author}</h4>
            `;

            item.appendChild(card);
            carousel.appendChild(item);
        });

        if (reviews.length > 1) {
            let currentIndex = 0;
            let autoSlideInterval;

            reviews.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.style.display = 'inline-block';
                dot.style.width = '10px';
                dot.style.height = '10px';
                dot.style.borderRadius = '50%';
                dot.style.background = index === 0 ? 'var(--primary-color)' : '#ccc';
                dot.style.margin = '0 5px';
                dot.style.cursor = 'pointer';
                dot.style.transition = 'background 0.3s ease';
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
            
            carousel.style.width = '100%';

            carousel.parentElement.style.position = 'relative';

            const updateCarousel = () => {
                carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                Array.from(dotsContainer.children).forEach((dot, idx) => {
                    dot.style.background = idx === currentIndex ? 'var(--primary-color)' : '#ccc';
                });
            };
            
            if (!document.getElementById('reviews-prev-btn')) {
                const prevBtn = document.createElement('button');
                prevBtn.id = 'reviews-prev-btn';
                prevBtn.innerHTML = '&#10094;';
                prevBtn.style.cssText = 'position: absolute; top: 50%; left: 10px; transform: translateY(-50%); background: rgba(0,0,0,0.3); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; z-index: 10; display: flex; align-items: center; justify-content: center; transition: background 0.3s;';
                prevBtn.onmouseover = () => prevBtn.style.background = 'rgba(0,0,0,0.8)';
                prevBtn.onmouseout = () => prevBtn.style.background = 'rgba(0,0,0,0.3)';
                
                const nextBtn = document.createElement('button');
                nextBtn.id = 'reviews-next-btn';
                nextBtn.innerHTML = '&#10095;';
                nextBtn.style.cssText = 'position: absolute; top: 50%; right: 10px; transform: translateY(-50%); background: rgba(0,0,0,0.3); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; z-index: 10; display: flex; align-items: center; justify-content: center; transition: background 0.3s;';
                nextBtn.onmouseover = () => nextBtn.style.background = 'rgba(0,0,0,0.8)';
                nextBtn.onmouseout = () => nextBtn.style.background = 'rgba(0,0,0,0.3)';
                
                carousel.parentElement.appendChild(prevBtn);
                carousel.parentElement.appendChild(nextBtn);
                
                prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
                nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
            }
            
            const nextSlide = () => {
                currentIndex = (currentIndex + 1) % reviews.length;
                updateCarousel();
            };
            
            const prevSlide = () => {
                currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
                updateCarousel();
            };
            
            const startInterval = () => autoSlideInterval = setInterval(nextSlide, 4000);
            const resetInterval = () => { clearInterval(autoSlideInterval); startInterval(); };
            
            const goToSlide = (index) => {
                currentIndex = index;
                updateCarousel();
                resetInterval();
            };
            
            startInterval();
            
            let touchStartX = 0;
            let touchEndX = 0;
            let isDragging = false;
            
            carousel.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
                isDragging = true;
                clearInterval(autoSlideInterval);
            }, {passive: true});
            
            carousel.addEventListener('touchmove', e => {
                if (!isDragging) return;
                touchEndX = e.changedTouches[0].screenX;
            }, {passive: true});
            
            carousel.addEventListener('touchend', e => {
                if (!isDragging) return;
                isDragging = false;
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (diff > 50) nextSlide();
                else if (diff < -50) prevSlide();
                startInterval();
            }, {passive: true});
        }
    }

    document.addEventListener('littiWaleLocationSelected', function(e) {
      currentLocationFilter = e.detail; // 'cloud' or 'outlet'
      
      // If already on menu page, re-render immediately
      if (window.location.pathname.includes('menu.html') || window.location.pathname.endsWith('/menu')) {
        renderMenu(menuData);
        setupFilters(menuData);
        
        // If outlet chosen, hide non-veg filter
        var dietaryContainer = document.querySelector('[data-diet]')?.closest('div');
        if (dietaryContainer) {
          var nonVegBtn = dietaryContainer.querySelector('[data-diet="non-veg"]');
          if (nonVegBtn) {
            nonVegBtn.style.display = currentLocationFilter === 'outlet' ? 'none' : '';
          }
        }
        // Force veg filter when outlet is selected
        if (currentLocationFilter === 'outlet') {
          currentDietaryFilter = 'veg';
        }
      }
    });

    try { initMenu(); } catch(e) { console.error("Menu failed", e); }
    // try { initAnnouncementCarousel(); } catch(e) { console.error("Slider failed", e); }
    try { initReviewsCarousel(); } catch(e) { console.error("Reviews failed", e); }
    try { initReels(); } catch(e) { console.error("Reels failed", e); }
    try { setupCartDrawer(); initCart(); } catch(e) { console.error("Cart init failed", e); }
    
    // Checkout specific initialization
    const checkoutTypeDel = document.getElementById('checkout-type-delivery');
    const checkoutTypeTake = document.getElementById('checkout-type-takeaway');
    const checkoutAddressBlock = document.getElementById('checkout-address-block') || document.getElementById('checkout-address')?.parentElement;
    const takeawayInfoBlock = document.getElementById('checkout-takeaway-info-block');
    const sameWhatsAppChk = document.getElementById('same-whatsapp-chk');
    const customWhatsAppWrap = document.getElementById('custom-whatsapp-wrap');

    if (sameWhatsAppChk && customWhatsAppWrap) {
        sameWhatsAppChk.addEventListener('change', () => {
            if (sameWhatsAppChk.checked) {
                customWhatsAppWrap.style.display = 'none';
            } else {
                customWhatsAppWrap.style.display = 'block';
                document.getElementById('checkout-whatsapp')?.focus();
            }
        });
    }
    
    if (checkoutTypeDel && checkoutTypeTake) {
        const savedOrderType = localStorage.getItem('littiWaleOrderType') || 'delivery';
        
        const updateAddressVisibility = () => {
            if (checkoutTypeTake.checked) {
                if (checkoutAddressBlock) checkoutAddressBlock.style.display = 'none';
                if (takeawayInfoBlock) takeawayInfoBlock.style.display = 'block';
                localStorage.setItem('littiWaleOrderType', 'takeaway');
            } else {
                if (checkoutAddressBlock) checkoutAddressBlock.style.display = 'block';
                if (takeawayInfoBlock) takeawayInfoBlock.style.display = 'none';
                localStorage.setItem('littiWaleOrderType', 'delivery');
            }
            if (typeof updateCartUI === 'function') updateCartUI();
        };

        if (savedOrderType === 'takeaway') {
            checkoutTypeTake.checked = true;
        } else {
            checkoutTypeDel.checked = true;
        }
        updateAddressVisibility();

        checkoutTypeDel.addEventListener('change', updateAddressVisibility);
        checkoutTypeTake.addEventListener('change', updateAddressVisibility);
    }
    
    // UI Drawer Handlers (Get Deals & Menu)
    const getDealsDrawer = document.getElementById('get-deals-drawer');
    const menuNavDrawer = document.getElementById('menu-nav-drawer');

    const openDrawer = (drawer) => {
        if (drawer) {
            drawer.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // Auto-close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    };

    const closeDrawers = () => {
        if (getDealsDrawer) getDealsDrawer.classList.remove('open');
        if (menuNavDrawer) menuNavDrawer.classList.remove('open');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('.nav-get-deals-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if we are not on index.html
            if (window.location.pathname.indexOf('index.html') === -1 && window.location.pathname.length > 2) {
                window.location.href='index.html#craziest-deals-section';
                return;
            }
            openDrawer(getDealsDrawer);
        });
    });

    document.querySelectorAll('.nav-menu-drawer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if we are not on index.html
            if (window.location.pathname.indexOf('index.html') === -1 && window.location.pathname.length > 2) {
                window.location.href='index.html#menu-section';
                return;
            }
            
            openDrawer(menuNavDrawer);
        });
    });

    document.querySelectorAll('.close-sheet-btn, .nav-bottom-sheet-overlay').forEach(btn => {
        btn.addEventListener('click', closeDrawers);
    });

    // --- Floating Category Filter Button (Menu Page Only) ---
    const filterFab = document.getElementById('filter-fab');
    if (filterFab) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 220) {
                filterFab.classList.add('visible');
            } else {
                filterFab.classList.remove('visible');
            }
        });

        filterFab.addEventListener('click', (e) => {
            e.preventDefault();
            const filters = document.getElementById('category-filters');
            if (filters) {
                const topPos = filters.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: topPos, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // =========================================================================
    // MENU SEARCH MODULE v2 — Live Autocomplete + Filter
    // Isolated: reads menuData & menuImageMap from enclosing DOMContentLoaded closure.
    // =========================================================================
    (function initMenuSearch() {
        // Only activate on the full menu page
        if (!window.location.pathname.includes('menu.html') && !window.location.pathname.endsWith('/menu') && !document.body.classList.contains('menu-page')) return;

        // ── Cache DOM nodes once — avoids repeated querying on scroll ────────
        var searchInput  = document.getElementById('menu-search-input');
        var dropdown     = document.getElementById('menu-search-dropdown');
        var clearBtn     = document.getElementById('menu-search-clear');
        var filterNotice = document.getElementById('lw-search-filter-notice');
        var clearLink    = document.getElementById('lw-clear-search-link');
        var stickyBar    = document.getElementById('lw-search-sticky-bar');
        var spacer       = document.getElementById('lw-search-spacer');
        var navbar       = document.querySelector('.navbar');

        if (!searchInput || !dropdown || !clearBtn) return; // safety guard

        var lwHighlightTimer = null;
        var lwDropdownActive = false;
        var lwActiveIndex    = -1;
        var lwCurrentQuery   = '';

        // ── Helper: strip (Half)/(Full) suffix ────────────────────────────────
        function lwStripVariant(name) {
            return name.replace(/\s*\((half|full)\)\s*/gi, '').trim();
        }

        // ── Helper: escape regex special chars ────────────────────────────────
        function lwEscapeRe(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // ── Helper: bold-highlight matching substring ─────────────────────────
        function lwHighlightMatch(text, query) {
            if (!query) return text;
            return text.replace(new RegExp('(' + lwEscapeRe(query) + ')', 'gi'), '<mark>$1</mark>');
        }

        // ── Helper: deduplicate by base name + category ───────────────────────
        function lwDeduplicateItems(items) {
            var seen = new Set();
            return items.filter(function(item) {
                var key = lwStripVariant(item.name).toLowerCase() + '||' + (item.category || '');
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        // ── Toggle clear button via CSS class (scroll-proof) ──────────────────
        // CSS rule: #menu-search-input.lw-has-text ~ #menu-search-clear { opacity:1; pointer-events:auto; }
        function lwSyncClearBtn(hasText) {
            if (hasText) {
                searchInput.classList.add('lw-has-text');
            } else {
                searchInput.classList.remove('lw-has-text');
            }
        }

        // ── Build dropdown suggestion list ────────────────────────────────────
        function lwRenderDropdown(query) {
            dropdown.innerHTML = '';
            lwActiveIndex = -1;

            var q = query.trim().toLowerCase();
            if (!q) { lwCloseDropdown(); return; }

            if (!menuData || !menuData.length) {
                dropdown.innerHTML = '<div class="lw-no-results">Loading menu\u2026</div>';
                dropdown.style.display = 'block';
                lwDropdownActive = true;
                return;
            }

            var matched = menuData.filter(function(item) {
                var hay = (item.name + ' ' + (item.category || '') + ' ' + (item.description || '')).toLowerCase();
                return hay.includes(q);
            });
            var unique = lwDeduplicateItems(matched);

            if (!unique.length) {
                dropdown.innerHTML = '<div class="lw-no-results">No items found for \u201c<strong style="color:#f4b400">' + lwEscapeHTML(query) + '</strong>\u201d</div>';
                dropdown.style.display = 'block';
                lwDropdownActive = true;
                return;
            }

            var frag = document.createDocumentFragment();
            unique.slice(0, 10).forEach(function(item, idx) {
                var displayName = lwStripVariant(item.name);
                var imgSrc = getItemImage(item.name);

                var el = document.createElement('div');
                el.className = 'lw-suggestion-item';
                el.setAttribute('role', 'option');
                el.setAttribute('data-idx', idx);
                el.setAttribute('data-name', displayName);
                el.setAttribute('data-cat', item.category || '');
                el.innerHTML =
                    '<img src="' + imgSrc + '" class="lw-suggestion-icon" loading="lazy" onerror="this.src=\'images/logo.png\'" alt="">' +
                    '<div class="lw-suggestion-text">' +
                        '<span class="lw-suggestion-name">' + lwHighlightMatch(displayName, query.trim()) + '</span>' +
                        '<span class="lw-suggestion-cat">' + lwEscapeHTML(item.category || '') + '</span>' +
                    '</div>' +
                    '<i class="fas fa-chevron-right" style="font-size:0.7rem;color:#555;flex-shrink:0;"></i>';

                // mousedown fires before blur, so selection registers before input loses focus
                el.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    lwSelectSuggestion(displayName);
                });
                frag.appendChild(el);
            });

            dropdown.appendChild(frag);
            dropdown.style.display = 'block';
            lwDropdownActive = true;
        }

        // ── XSS-safe HTML escape ──────────────────────────────────────────────
        function lwEscapeHTML(str) {
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // ── Keyboard: move focus within dropdown ──────────────────────────────
        function lwMoveFocus(dir) {
            var items = dropdown.querySelectorAll('.lw-suggestion-item');
            if (!items.length) return;
            if (items[lwActiveIndex]) items[lwActiveIndex].classList.remove('lw-active');
            lwActiveIndex = (lwActiveIndex + dir + items.length) % items.length;
            if (items[lwActiveIndex]) {
                items[lwActiveIndex].classList.add('lw-active');
                items[lwActiveIndex].scrollIntoView({ block: 'nearest' });
            }
        }

        // ── Close dropdown ────────────────────────────────────────────────────
        function lwCloseDropdown() {
            dropdown.style.display = 'none';
            lwDropdownActive = false;
            lwActiveIndex = -1;
        }

        // ── Select a suggestion ───────────────────────────────────────────────
        function lwSelectSuggestion(displayName) {
            searchInput.value = displayName;
            lwSyncClearBtn(true);
            lwCloseDropdown();
            lwApplySearchFilter(displayName);
            requestAnimationFrame(function() {
                setTimeout(function() { lwScrollToAndHighlight(displayName); }, 120);
            });
        }

        // ── Apply search filter ───────────────────────────────────────────────
        // Filters menuData by text query, passes result to existing renderMenu().
        // renderMenu() internally re-applies currentDietaryFilter, so
        // combination "Veg filter + search keyword" works automatically.
        function lwApplySearchFilter(query) {
            lwCurrentQuery = query;
            var q = query.trim().toLowerCase();
            if (!q) { lwResetSearch(); return; }

            var matched = menuData.filter(function(item) {
                var hay = (item.name + ' ' + (item.category || '') + ' ' + (item.description || '')).toLowerCase();
                return hay.includes(q);
            });

            if (filterNotice) filterNotice.style.display = 'block';
            renderMenu(matched); // renderMenu applies currentDietaryFilter internally
        }

        // ── Full reset: restore original menu state ───────────────────────────
        function lwResetSearch() {
            lwCurrentQuery = '';
            searchInput.value = '';
            lwSyncClearBtn(false);
            if (filterNotice) filterNotice.style.display = 'none';
            lwCloseDropdown();
            // currentFilteredData = menuData (set by initMenuDisplay on menu.html)
            renderMenu(currentFilteredData);
        }

        // ── Scroll to + pulse-highlight the first matching card ───────────────
        function lwScrollToAndHighlight(displayName) {
            var allCards = document.querySelectorAll('.menu-card');
            var targetCard = null;
            var qLower = displayName.toLowerCase();

            // Exact title match first
            for (var i = 0; i < allCards.length; i++) {
                var titleEl = allCards[i].querySelector('.menu-card-title');
                if (titleEl && titleEl.textContent.trim().toLowerCase() === qLower) {
                    targetCard = allCards[i]; break;
                }
            }
            // Partial match fallback
            if (!targetCard) {
                for (var j = 0; j < allCards.length; j++) {
                    var tEl = allCards[j].querySelector('.menu-card-title');
                    if (tEl && tEl.textContent.trim().toLowerCase().includes(qLower)) {
                        targetCard = allCards[j]; break;
                    }
                }
            }

            if (targetCard) {
                var navH    = navbar ? navbar.offsetHeight : 70;
                var stickyH = stickyBar ? stickyBar.offsetHeight : 0;
                var offset  = navH + stickyH + 12;
                var topPos  = targetCard.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: topPos, behavior: 'smooth' });

                clearTimeout(lwHighlightTimer);
                targetCard.classList.remove('lw-search-highlight');
                void targetCard.offsetWidth; // force reflow to restart CSS animation
                targetCard.classList.add('lw-search-highlight');
                lwHighlightTimer = setTimeout(function() {
                    targetCard.classList.remove('lw-search-highlight');
                }, 1600);
            }
        }

        // ================================================================
        // STICKY BAR SETUP
        // 1. Set --lw-nav-h to real navbar height.
        // 2. Match spacer height to sticky bar so layout doesn't jump.
        // 3. Add .lw-scrolled shadow when bar is sticking.
        // ================================================================
        (function lwSetupSticky() {
            if (!stickyBar || !spacer) return;

            function lwSyncDimensions() {
                var navH = navbar ? navbar.offsetHeight : 70;
                var outletBar = document.getElementById('lw-outlet-bar');
                var outletH = outletBar ? outletBar.offsetHeight : 0;
                document.documentElement.style.setProperty('--lw-nav-h', navH + 'px');
                document.documentElement.style.setProperty('--lw-outlet-bar-h', outletH + 'px');
                spacer.style.height = stickyBar.offsetHeight + 'px';
            }

            lwSyncDimensions();
            window.addEventListener('resize', lwSyncDimensions, { passive: true });

            window.addEventListener('scroll', function() {
                if (spacer.getBoundingClientRect().top <= 0) {
                    stickyBar.classList.add('lw-scrolled');
                } else {
                    stickyBar.classList.remove('lw-scrolled');
                }
            }, { passive: true });
        })();

        // ================================================================
        // EVENT LISTENERS — all on cached nodes, registered once
        // ================================================================

        // Typing
        searchInput.addEventListener('input', function() {
            var val = searchInput.value;
            lwSyncClearBtn(val.length > 0);
            lwRenderDropdown(val);
            if (val.trim().length >= 2) {
                lwApplySearchFilter(val.trim());
            } else if (val.trim().length === 0) {
                lwResetSearch();
            }
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (!lwDropdownActive) lwRenderDropdown(searchInput.value);
                    lwMoveFocus(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    lwMoveFocus(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    var activeItem = dropdown.querySelector('.lw-suggestion-item.lw-active');
                    if (activeItem) {
                        lwSelectSuggestion(activeItem.dataset.name);
                    } else {
                        lwCloseDropdown();
                        lwApplySearchFilter(searchInput.value.trim());
                    }
                    break;
                case 'Escape':
                    if (lwDropdownActive) {
                        lwCloseDropdown();
                    } else {
                        lwResetSearch();
                    }
                    break;
            }
        });

        // Clear button — single DOM node, always works even when page is scrolled
        clearBtn.addEventListener('click', lwResetSearch);

        // Inline "clear search" link in filter notice banner
        if (clearLink) {
            clearLink.addEventListener('click', function(e) {
                e.preventDefault();
                lwResetSearch();
                searchInput.focus();
            });
        }

        // Close dropdown on outside click
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#menu-search-wrapper')) {
                lwCloseDropdown();
            }
        }, { passive: true });

        // Reopen dropdown on re-focus if already has a query
        searchInput.addEventListener('focus', function() {
            if (searchInput.value.trim().length >= 1) {
                lwRenderDropdown(searchInput.value);
            }
        });

    })(); // end initMenuSearch IIFE
    // =========================================================================

});

// --- Multi-Partner Modal Logic ---
window.openPartnerModal = function() {
    const modal = document.getElementById('partner-popup');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }
};

window.closePartnerModal = function() {
    const modal = document.getElementById('partner-popup');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const partnerModal = document.getElementById('partner-popup');
    const closeBtn = document.getElementById('close-partner-popup');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', window.closePartnerModal);
    }
    
    if (partnerModal) {
        partnerModal.addEventListener('click', (e) => {
            // Close if clicking outside the modal content
            if (e.target === partnerModal) {
                window.closePartnerModal();
            }
        });
    }
});

// Live Sync Hero & About Us from Admin Panel API
async function initLiveSiteSettings() {
    try {
        const res = await fetch(`${ADMIN_API_BASE_URL}/settings`);
        const settingsList = await res.json();
        if (settingsList && settingsList.length > 0) {
            const s = settingsList[0];
            
            // Hero Section Updates
            if (s.heroTagline) {
                const tagEl = document.querySelector('.hero-subtitle') || document.querySelector('.badge-text');
                if (tagEl) tagEl.textContent = s.heroTagline;
            }
            if (s.heroTitle) {
                const titleEl = document.querySelector('.hero-title');
                if (titleEl) titleEl.textContent = s.heroTitle;
            }
            if (s.heroDesc) {
                const descEl = document.querySelector('.hero-description');
                if (descEl) descEl.textContent = s.heroDesc;
            }

            // About Us Section Updates
            if (s.aboutHeading) {
                const headingEl = document.querySelector('#about .section-title') || document.querySelector('#about h2');
                if (headingEl) headingEl.textContent = s.aboutHeading;
            }
            if (s.aboutStoryTitle) {
                const storyTitleEl = document.querySelector('.about-card-story h3') || document.querySelector('.about-card h3');
                if (storyTitleEl) storyTitleEl.textContent = s.aboutStoryTitle;
            }
            if (s.statNum) {
                const statNumEl = document.querySelector('.stat-number') || document.querySelector('#about .badge-text strong');
                if (statNumEl) statNumEl.textContent = s.statNum;
            }
            if (s.statText) {
                const statTextEl = document.querySelector('.stat-label') || document.querySelector('#about .badge-text span');
                if (statTextEl) statTextEl.textContent = s.statText;
            }
            if (s.aboutImage) {
                const aboutImgEl = document.querySelector('.about-card-image img') || document.querySelector('#about img');
                if (aboutImgEl) aboutImgEl.src = s.aboutImage;
            }
        }
    } catch(e) {
        console.warn('Could not sync live site settings:', e);
    }
}

// ==========================================================================
// LIVE CUSTOMER ORDER STATUS TRACKER & POLLING
// Clean up any legacy floating widgets if present
document.getElementById('live-order-pill')?.remove();
document.getElementById('order-animation-modal')?.remove();
document.getElementById('live-order-tracker')?.remove();

// ==========================================================================
// CUSTOMER MY ORDERS & SAVED PROFILE MODULE (ZERO-FRICTION FLOW)
// ==========================================================================
// ZERO-FRICTION CUSTOMER ACCOUNT & ORDERS DRAWER
// ==========================================================================
window.cachedCustomerOrders = [];

const CUSTOMER_API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api'
    : 'https://littiwale-admin.vercel.app/api';

function ensureCustomerDrawerInDOM() {
    if (document.getElementById('customer-orders-drawer')) return;

    const drawerHtml = `
        <div id="customer-orders-drawer" class="customer-orders-drawer">
            <div class="customer-orders-overlay" onclick="window.closeCustomerOrdersDrawer()"></div>
            <div class="customer-orders-panel">
                <div class="cust-drawer-header">
                    <div class="cust-drawer-title">
                        <span>My Account & Orders</span>
                    </div>
                    <button type="button" class="cust-drawer-close" onclick="window.closeCustomerOrdersDrawer()" title="Close Drawer">✕</button>
                </div>
                <div id="customer-drawer-content" class="cust-drawer-body">
                    <!-- Dynamic views injected here -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
}

window.openCustomerOrdersDrawer = function() {
    // If not on orders.html, navigate directly to dedicated orders page
    if (!window.location.pathname.includes('orders.html')) {
        window.location.href = 'orders.html';
        return;
    }
    window.renderCustomerOrdersUI();
};

window.closeCustomerOrdersDrawer = function() {
    const drawer = document.getElementById('customer-orders-drawer');
    if (drawer) {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.renderCustomerOrdersUI = function() {
    const savedPhone = localStorage.getItem('littiwale_customer_phone');
    if (savedPhone) {
        window.fetchCustomerOrders(savedPhone);
    } else {
        window.renderCustomerPhoneLookupView();
    }
};

function getCustomerOrdersTargetContainer() {
    return document.getElementById('customer-orders-container') || document.getElementById('customer-drawer-content');
}

window.renderCustomerPhoneLookupView = function() {
    const container = getCustomerOrdersTargetContainer();
    if (!container) return;

    container.innerHTML = `
        <div class="cust-lookup-box">
            <h3 style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 6px;">Find Your Orders</h3>
            <p style="font-size: 13px; color: var(--text-dim, #94a3b8); max-width: 320px; margin: 0 auto 18px; line-height: 1.5;">
                Enter your 10-digit mobile number to view your past orders, saved delivery address, live status & 1-click reorder.
            </p>
            <form onsubmit="window.handleCustomerPhoneSubmit(event)">
                <div class="cust-lookup-input-group">
                    <span class="cust-lookup-input-prefix">+91</span>
                    <input type="tel" id="cust-lookup-phone-input" class="cust-lookup-input" placeholder="Enter Mobile Number" maxlength="10" pattern="[0-9]{10}" required autofocus>
                </div>
                <button type="submit" class="cust-lookup-btn">View My Orders</button>
            </form>
            <p style="font-size: 11.5px; color: #64748b; margin-top: 16px;">
                🔒 Zero password or OTP required. Instant lookup.
            </p>
        </div>
    `;
    setTimeout(() => {
        document.getElementById('cust-lookup-phone-input')?.focus();
    }, 150);
};

window.handleCustomerPhoneSubmit = function(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('cust-lookup-phone-input');
    if (!input) return;
    const phone = input.value.replace(/\D/g, '');
    if (phone.length !== 10) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please enter a valid 10-digit mobile number', { type: 'warning', title: 'Invalid Mobile' });
        } else {
            alert('Please enter a valid 10-digit mobile number');
        }
        return;
    }
    localStorage.setItem('littiwale_customer_phone', phone);
    window.fetchCustomerOrders(phone);
};

window.fetchCustomerOrders = async function(phone) {
    const container = getCustomerOrdersTargetContainer();
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; padding: 50px 20px; color: #94a3b8;">
            <div class="spinner" style="margin: 0 auto 16px; width: 36px; height: 36px; border:3px solid rgba(255,255,255,0.1); border-top-color: #f97316; border-radius:50%; animation:spin 0.8s linear infinite;"></div>
            <div style="font-size: 14px; font-weight: 700; color: #fff;">Looking up your orders...</div>
            <div style="font-size: 12px; margin-top: 4px; color: #64748b;">+91 ${phone}</div>
        </div>
    `;

    try {
        const res = await fetch(`${CUSTOMER_API_BASE_URL}/orders/customer/${phone}`);
        const data = await res.json();

        if (!data || !data.success) {
            throw new Error(data.error || 'Failed to fetch orders');
        }

        window.cachedCustomerOrders = data.orders || [];

        if (data.customer) {
            localStorage.setItem('littiwale_customer_profile', JSON.stringify(data.customer));
            autoFillCheckoutFromSavedProfile(data.customer);
        }

        if (!data.hasOrders || data.orders.length === 0) {
            // New Customer View
            container.innerHTML = `
                <div class="cust-profile-header-card">
                    <div>
                        <div class="cust-profile-greeting">Welcome to Littiwale</div>
                        <div class="cust-profile-phone">+91 ${phone}</div>
                    </div>
                    <button type="button" class="cust-switch-account-btn" onclick="window.switchCustomerAccount()" title="Use another number">Switch</button>
                </div>
                <div class="cust-lookup-box" style="margin-top: 10px;">
                    <h4 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 6px;">No Past Orders Yet</h4>
                    <p style="font-size: 12.5px; color: #94a3b8; margin-bottom: 20px;">
                        Ready for authentic Taste of Desi Swag? Explore our chef-special Littis, Combos, and Thalis.
                    </p>
                    <a href="menu/index.html" class="cust-lookup-btn" style="text-decoration:none; display:inline-block;">Explore Menu & Order Now</a>
                </div>
            `;
            return;
        }

        // Returning Customer View
        const custName = data.customer?.name || 'Customer';
        const address = data.customer?.address || '';
        const landmark = data.customer?.landmark || '';

        // Check for active order in progress
        const activeOrder = data.orders.find(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'confirmed' || o.status === 'dispatched');

        let liveOrderHtml = '';
        if (activeOrder) {
            const shortId = activeOrder._id ? String(activeOrder._id).slice(-6).toUpperCase() : 'LW';
            const statusLabel = activeOrder.status === 'dispatched' ? 'Out for Delivery' : (activeOrder.status === 'accepted' || activeOrder.status === 'confirmed' ? 'Preparing in Kitchen' : 'Order Placed (Pending)');
            liveOrderHtml = `
                <div class="cust-live-order-banner">
                    <div class="cust-live-order-left">
                        <div class="cust-live-order-icon">🛵</div>
                        <div>
                            <div class="cust-live-order-title">Active Order: #${shortId}</div>
                            <div class="cust-live-order-sub">${statusLabel} • ${(activeOrder.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                        </div>
                    </div>
                    <a href="track.html?id=${activeOrder._id}" class="cust-live-order-btn">Track Live Status →</a>
                </div>
            `;
        }

        let addressCardHtml = '';
        if (address) {
            addressCardHtml = `
                <div class="cust-saved-address-card" style="background:var(--bg-surface, #18181f); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px 18px; margin-bottom:18px;">
                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#fbbf24; letter-spacing:0.8px; margin-bottom:4px;">
                        <span>Saved Delivery Address</span>
                    </div>
                    <div style="font-size:13.5px; color:#e2e8f0; line-height:1.4;">
                        <strong>${custName}</strong><br>
                        ${address}${landmark ? `<br><span style="color:#94a3b8; font-size:12px;">Landmark: ${landmark}</span>` : ''}
                    </div>
                </div>
            `;
        }

        const ordersListHtml = data.orders.map(ord => {
            const shortId = ord._id ? String(ord._id).slice(-6).toUpperCase() : 'LW-ORD';
            const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
            const total = ord.finalTotal || ord.subtotal || 0;
            const itemsStr = (ord.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');
            const rawStatus = (ord.status || 'pending').toLowerCase();
            const isLive = rawStatus === 'pending' || rawStatus === 'accepted' || rawStatus === 'confirmed' || rawStatus === 'dispatched';
            const statusColor = rawStatus === 'delivered' ? '#22c55e' : (rawStatus === 'cancelled' ? '#ef4444' : '#f59e0b');
            const statusText = rawStatus.toUpperCase();

            // If order is not delivered/cancelled yet (live/pending in kitchen/on the way), show "Track Order" button!
            // If order is delivered or cancelled (completed), show "View Details" & "Reorder"!
            let actionButtons = '';
            if (isLive) {
                actionButtons = `
                    <a href="track.html?id=${ord._id}" class="cust-live-order-btn" style="padding:7px 14px; font-size:12px; font-weight:800; border-radius:8px; text-decoration:none;">
                        <span>📍 Track Order →</span>
                    </a>
                `;
            } else {
                actionButtons = `
                    <button type="button" class="cust-view-order-btn" onclick="window.viewPastOrderDetails('${ord._id}')" title="View Order Details & Bill">
                        <span>👁️ View Details</span>
                    </button>
                    <button type="button" class="cust-reorder-btn" onclick="window.reorderPastOrder('${ord._id}')" title="Add all items to cart">
                        <span>Reorder</span>
                    </button>
                `;
            }

            return `
                <div class="cust-past-order-card">
                    <div class="cust-order-top-row">
                        <span class="cust-order-id">#${shortId}</span>
                        <span style="font-size:10.5px; font-weight:800; color:${statusColor}; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:12px;">${statusText}</span>
                    </div>
                    <div class="cust-order-date">${dateStr}</div>
                    <div class="cust-order-items">${itemsStr}</div>
                    <div class="cust-order-footer-row">
                        <span class="cust-order-total">₹${total}</span>
                        <div style="display:flex; gap:8px; align-items:center;">
                            ${actionButtons}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="cust-profile-header-card">
                <div>
                    <div class="cust-profile-greeting">Welcome back, ${custName}! 👋</div>
                    <div class="cust-profile-phone">📱 +91 ${phone} • ${data.orders.length} Orders</div>
                </div>
                <button type="button" class="cust-switch-account-btn" onclick="window.switchCustomerAccount()" title="Use another number">Switch</button>
            </div>

            ${liveOrderHtml}
            ${addressCardHtml}

            <div style="font-size: 13.5px; font-weight: 800; color: #fff; margin: 18px 0 12px; display:flex; justify-content:space-between; align-items:center;">
                <span>Past Orders (${data.orders.length})</span>
            </div>

            ${ordersListHtml}
        `;

    } catch(err) {
        console.error(err);
        container.innerHTML = `
            <div class="cust-lookup-box">
                <div style="font-size:32px; color:#ef4444; margin-bottom:8px;">⚠️</div>
                <h4 style="font-size:1.1rem; color:#fff; margin-bottom:6px;">Could Not Load Orders</h4>
                <p style="font-size:12px; color:#94a3b8; margin-bottom:16px;">Please check your connection and try again.</p>
                <button type="button" class="cust-lookup-btn" onclick="window.fetchCustomerOrders('${phone}')">Retry</button>
            </div>
        `;
    }
};

window.viewPastOrderDetails = function(orderId) {
    if (!orderId) return;
    try {
        localStorage.setItem('littiWaleActiveOrder', JSON.stringify({ id: orderId }));
    } catch(e) {}
    window.location.href = `track.html?id=${encodeURIComponent(orderId)}`;
};

window.switchCustomerAccount = function() {
    localStorage.removeItem('littiwale_customer_phone');
    localStorage.removeItem('littiwale_customer_profile');
    window.renderCustomerPhoneLookupView();
};

window.reorderPastOrder = function(orderId) {
    const ord = (window.cachedCustomerOrders || []).find(o => o._id === orderId);
    if (!ord || !ord.items || ord.items.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Could not retrieve items from this order.', { type: 'error', title: 'Reorder Failed' });
        } else {
            alert('Could not retrieve items from this order.');
        }
        return;
    }

    // Save and pre-fill customer profile details
    let profile = null;
    try {
        const raw = localStorage.getItem('littiwale_customer_profile');
        if (raw) profile = JSON.parse(raw);
    } catch(e) {}

    if (!profile && (ord.customerName || ord.customerPhone || ord.deliveryAddress)) {
        profile = {
            name: ord.customerName || '',
            phone: ord.customerPhone || ord.whatsappPhone || '',
            address: ord.deliveryAddress || '',
            landmark: ord.landmark || ''
        };
        localStorage.setItem('littiwale_customer_profile', JSON.stringify(profile));
    }

    if (profile) {
        autoFillCheckoutFromSavedProfile(profile);
    }

    // Close customer orders drawer
    window.closeCustomerOrdersDrawer();

    let itemsAdded = 0;
    if (typeof window.reorderItemsIntoCart === 'function') {
        itemsAdded = window.reorderItemsIntoCart(ord.items);
    } else {
        // Fallback: save to littiWaleCart
        let currentCart = [];
        try {
            const stored = localStorage.getItem('littiWaleCart');
            if (stored) currentCart = JSON.parse(stored);
            if (!Array.isArray(currentCart)) currentCart = [];
        } catch(e) {
            currentCart = [];
        }

        ord.items.forEach(item => {
            const itemName = item.name || 'Dish Item';
            const itemPrice = Number(item.price) || 100;
            const itemQty = Number(item.quantity) || 1;
            const itemId = item._id || item.id || `dish_${itemName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

            const existingIdx = currentCart.findIndex(c => c.name === itemName || c.id === itemId);
            if (existingIdx > -1) {
                currentCart[existingIdx].quantity += itemQty;
            } else {
                currentCart.push({
                    id: itemId,
                    name: itemName,
                    price: itemPrice,
                    quantity: itemQty,
                    image: item.image || 'images/logo.png',
                    diet: item.diet || 'veg'
                });
            }
            itemsAdded += itemQty;
        });

        localStorage.setItem('littiWaleCart', JSON.stringify(currentCart));
        if (typeof updateCartUI === 'function') updateCartUI();
        if (typeof syncMenuWithCart === 'function') syncMenuWithCart();

        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
            cartDrawer.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    if (typeof toast !== 'undefined' && typeof toast.success === 'function') {
        toast.success(`Added ${itemsAdded} items to cart!`);
    } else if (typeof showToast === 'function') {
        showToast(`Added ${itemsAdded} items to cart!`, 'success');
    }
};

function autoFillCheckoutFromSavedProfile(profile) {
    if (!profile) {
        try {
            const raw = localStorage.getItem('littiwale_customer_profile');
            if (raw) profile = JSON.parse(raw);
        } catch(e) {}
    }
    if (!profile) return;

    const nameInputs = [document.getElementById('checkout-name'), document.getElementById('cust-name'), document.getElementById('name')];
    const phoneInputs = [document.getElementById('checkout-phone'), document.getElementById('cust-phone'), document.getElementById('phone')];
    const whatsappInputs = [document.getElementById('checkout-whatsapp'), document.getElementById('cust-whatsapp')];
    const addressInputs = [document.getElementById('checkout-address'), document.getElementById('cust-address'), document.getElementById('address')];
    const landmarkInputs = [document.getElementById('checkout-landmark'), document.getElementById('cust-landmark'), document.getElementById('landmark')];

    nameInputs.forEach(input => {
        if (input && profile.name) input.value = profile.name;
    });
    phoneInputs.forEach(input => {
        if (input && profile.phone) input.value = profile.phone;
    });
    whatsappInputs.forEach(input => {
        if (input && (profile.whatsapp || profile.phone)) input.value = profile.whatsapp || profile.phone;
    });
    addressInputs.forEach(input => {
        if (input && profile.address) input.value = profile.address;
    });
    landmarkInputs.forEach(input => {
        if (input && profile.landmark) input.value = profile.landmark;
    });
}

// Auto-fill checkout on initial DOM load if profile exists
document.addEventListener('DOMContentLoaded', () => {
    autoFillCheckoutFromSavedProfile();
});

// ==========================================================================
// FRONTEND PROGRESSIVE WEB APP (PWA) REGISTRATION & INSTALL CONTROLLER
// ==========================================================================
let deferredClientPwaPrompt = null;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Littiwale Web App Service Worker Registered:', reg.scope))
            .catch(err => console.warn('Frontend PWA SW Register notice:', err));
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredClientPwaPrompt = e;
    const heroBtn = document.getElementById('pwa-hero-install-btn');
    if (heroBtn) {
        heroBtn.onclick = async () => {
            if (deferredClientPwaPrompt) {
                deferredClientPwaPrompt.prompt();
                const { outcome } = await deferredClientPwaPrompt.userChoice;
                if (outcome === 'accepted') {
                    if (typeof showToast === 'function') showToast('App Installed on Device! 📲', 'success');
                }
                deferredClientPwaPrompt = null;
            }
        };
    }
});

// Setup click handler even before prompt fires (gives nice user feedback)
document.addEventListener('DOMContentLoaded', () => {
    const heroBtn = document.getElementById('pwa-hero-install-btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', async () => {
            if (deferredClientPwaPrompt) {
                deferredClientPwaPrompt.prompt();
                const { outcome } = await deferredClientPwaPrompt.userChoice;
                if (outcome === 'accepted') {
                    if (typeof showToast === 'function') showToast('App Installed on Device! 📲', 'success');
                }
                deferredClientPwaPrompt = null;
            } else {
                if (typeof showToast === 'function') {
                    showToast('Tap Menu (⋮) in Chrome and select "Install App" or "Add to Home Screen"', 'info');
                } else {
                    alert('Tap Menu (⋮) in Chrome and select "Install App" or "Add to Home Screen"');
                }
            }
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('✅ Littiwale Web App Installed Successfully');
});
