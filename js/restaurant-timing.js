document.addEventListener('DOMContentLoaded', () => {
    // Inject CSS for the popup and sticky banner
    const timingStyles = `
        #restaurant-closed-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.35s ease, visibility 0.35s ease;
            padding: 16px;
            box-sizing: border-box;
        }
        #restaurant-closed-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        #restaurant-closed-popup {
            background: #18181b;
            border: 1.5px solid rgba(239, 68, 68, 0.4);
            border-radius: 24px;
            padding: 28px 24px;
            width: 100%; max-width: 440px;
            text-align: center;
            box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(239,68,68,0.15);
            transform: scale(0.92);
            transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            box-sizing: border-box;
        }
        #restaurant-closed-overlay.show #restaurant-closed-popup {
            transform: scale(1);
        }
        .closed-popup-icon-badge {
            width: 64px; height: 64px;
            border-radius: 50%;
            background: rgba(239,68,68,0.15);
            border: 2px solid #ef4444;
            display: flex; align-items: center; justify-content: center;
            font-size: 28px;
            margin: 0 auto 16px;
            box-shadow: 0 0 20px rgba(239,68,68,0.3);
        }
        .closed-popup-title {
            font-family: var(--font-heading, 'Outfit', sans-serif);
            font-size: 1.45rem; font-weight: 800;
            color: #ffffff; margin-bottom: 8px;
        }
        .closed-info-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            padding: 14px;
            margin: 16px 0;
            text-align: left;
        }
        .closed-reason-label {
            font-size: 0.8rem; color: #94a3b8;
            margin-bottom: 4px;
            text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;
        }
        .closed-reason-val {
            font-size: 1.05rem; font-weight: 700;
            color: #f87171;
            display: flex; align-items: center; gap: 8px;
        }
        .closed-reopen-row {
            margin-top: 10px; padding-top: 10px;
            border-top: 1px dashed rgba(255,255,255,0.1);
            font-size: 0.85rem; color: #cbd5e1;
            display: flex; justify-content: space-between; align-items: center;
        }
        .closed-reopen-val {
            font-weight: 800; color: #facc15;
        }

        /* ---- Live countdown ---- */
        #closed-countdown-wrapper {
            margin-top: 12px; padding-top: 12px;
            border-top: 1px dashed rgba(255,255,255,0.1);
            display: none;
            text-align: center;
        }
        #closed-countdown-wrapper.visible { display: block; }
        .countdown-label {
            font-size: 0.75rem; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;
            margin-bottom: 8px;
        }
        .countdown-digits {
            display: flex; gap: 8px; justify-content: center;
        }
        .countdown-unit {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 8px 12px; min-width: 52px;
        }
        .countdown-num {
            font-size: 1.5rem; font-weight: 900;
            color: #facc15; line-height: 1;
            font-variant-numeric: tabular-nums;
        }
        .countdown-unit-label {
            font-size: 0.65rem; color: #64748b;
            text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px;
        }

        /* ---- Manual control badge ---- */
        #closed-manual-badge {
            margin-top: 10px; text-align: center; display: none;
        }
        .manual-control-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(148,163,184,0.08);
            border: 1px solid rgba(148,163,184,0.2);
            border-radius: 20px;
            padding: 5px 14px;
            font-size: 0.78rem; color: #94a3b8; font-weight: 600;
        }

        .closed-popup-message {
            color: #94a3b8; font-size: 0.85rem;
            margin-bottom: 20px; line-height: 1.45;
        }
        .closed-popup-buttons {
            display: flex; flex-direction: column; gap: 10px;
        }
        .closed-btn-browse {
            background: rgba(255,255,255,0.08);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 12px; padding: 12px;
            font-weight: 700; font-size: 0.95rem;
            cursor: pointer; transition: all 0.2s;
        }
        .closed-btn-browse:hover {
            background: rgba(255,255,255,0.14);
            border-color: rgba(255,255,255,0.3);
        }
        .closed-btn-whatsapp {
            background: #25d366; color: #000000;
            border: none; border-radius: 12px; padding: 12px;
            font-weight: 800; font-size: 0.95rem;
            text-decoration: none;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(37,211,102,0.3);
        }
        .closed-sticky-banner {
            position: fixed; top: 0; left: 0; width: 100%;
            background: #dc2626; color: #ffffff;
            text-align: center;
            padding: 8px 16px; font-size: 0.85rem; font-weight: 700;
            z-index: 9999;
            display: none; align-items: center; justify-content: center; gap: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        /* View Only locked menu when restaurant is closed */
        body.restaurant-closed-mode .add-to-cart,
        body.restaurant-closed-mode .add-to-cart-btn,
        body.restaurant-closed-mode .btn-add-cart,
        body.restaurant-closed-mode .hf-btn {
            opacity: 0.65 !important;
            cursor: not-allowed !important;
        }
        body.restaurant-closed-mode .add-to-cart-btn,
        body.restaurant-closed-mode .btn-add-cart {
            background: rgba(255,255,255,0.06) !important;
            color: #94a3b8 !important;
            border-color: rgba(255,255,255,0.12) !important;
            box-shadow: none !important;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'restaurant-timing-styles';
    styleEl.textContent = timingStyles;
    document.head.appendChild(styleEl);

    // Inject HTML
    const popupHTML = `
        <div id="closed-sticky-banner" class="closed-sticky-banner">
            <span>🔴</span>
            <span id="closed-banner-text">Restaurant is currently Closed. Online ordering is temporarily paused.</span>
        </div>

        <div id="restaurant-closed-overlay">
            <div id="restaurant-closed-popup">
                <div class="closed-popup-icon-badge"><span>🔴</span></div>
                <h2 class="closed-popup-title">We are Currently Closed</h2>

                <div class="closed-info-card">
                    <div class="closed-reason-label">Reason for Closure</div>
                    <div class="closed-reason-val">
                        <span>⚠️</span>
                        <span id="closed-reason-text">Kitchen is full</span>
                    </div>

                    <!-- Static reopen row (shown for schedule-based closed) -->
                    <div class="closed-reopen-row" id="closed-reopen-row">
                        <span>Expected Reopening:</span>
                        <span class="closed-reopen-val" id="closed-reopen-text">Soon</span>
                    </div>

                    <!-- Live countdown (shown when offlineUntil is a future timestamp) -->
                    <div id="closed-countdown-wrapper">
                        <div class="countdown-label">⏱️ Opens in</div>
                        <div class="countdown-digits">
                            <div class="countdown-unit">
                                <div class="countdown-num" id="cd-hours">00</div>
                                <div class="countdown-unit-label">Hours</div>
                            </div>
                            <div class="countdown-unit">
                                <div class="countdown-num" id="cd-mins">00</div>
                                <div class="countdown-unit-label">Mins</div>
                            </div>
                            <div class="countdown-unit">
                                <div class="countdown-num" id="cd-secs">00</div>
                                <div class="countdown-unit-label">Secs</div>
                            </div>
                        </div>
                    </div>

        <!-- Manual control badge ("Until I turn myself on") -->
                    <div id="closed-manual-badge">
                        <span class="manual-control-badge">We'll open when we're ready</span>
                    </div>
                </div>

                <p class="closed-popup-message">
                    We are temporarily not taking new orders online. You can still browse our menu, and we will be back serving hot food shortly!
                </p>

                <div class="closed-popup-buttons">
                    <button type="button" class="closed-btn-browse" id="btn-browse">
                        🍽️ Browse Menu (View Only)
                    </button>
                    <a href="https://wa.me/916370680744?text=Hi%20Littiwale,%20I%20saw%20the%20kitchen%20is%20temporarily%20closed.%20Can%20I%20pre-order?"
                       target="_blank" class="closed-btn-whatsapp">
                        💬 Contact Us on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // ------- Element references -------
    const overlay          = document.getElementById('restaurant-closed-overlay');
    const btnBrowse        = document.getElementById('btn-browse');
    const closedReasonText = document.getElementById('closed-reason-text');
    const closedReopenRow  = document.getElementById('closed-reopen-row');
    const closedReopenText = document.getElementById('closed-reopen-text');
    const closedBanner     = document.getElementById('closed-sticky-banner');
    const closedBannerText = document.getElementById('closed-banner-text');
    const countdownWrapper = document.getElementById('closed-countdown-wrapper');
    const manualBadge      = document.getElementById('closed-manual-badge');
    const cdHours          = document.getElementById('cd-hours');
    const cdMins           = document.getElementById('cd-mins');
    const cdSecs           = document.getElementById('cd-secs');

    let countdownInterval = null;

    function pad2(n) { return String(n).padStart(2, '0'); }

    // Start a live ticking countdown to targetDate
    function startCountdown(targetDate) {
        if (countdownInterval) clearInterval(countdownInterval);
        countdownWrapper.classList.add('visible');

        function tick() {
            const diff = targetDate - Date.now();

            if (diff <= 0) {
                // Timer expired — restaurant should now be open
                clearInterval(countdownInterval);
                countdownInterval = null;
                countdownWrapper.classList.remove('visible');

                window.isRestaurantCurrentlyOpen = true;
                if (overlay)      overlay.classList.remove('show');
                if (closedBanner) closedBanner.style.display = 'none';

                if (typeof window.showAlert === 'function') {
                    window.showAlert('Littiwale is now open! You can place your order.', {
                        title: "We're Open! 🎉",
                        icon: '🟢',
                        type: 'success'
                    });
                }
                // Reload after 3s so new settings are fetched
                setTimeout(() => location.reload(), 3000);
                return;
            }

            const totalSecs = Math.floor(diff / 1000);
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;

            if (cdHours) cdHours.textContent = pad2(h);
            if (cdMins)  cdMins.textContent  = pad2(m);
            if (cdSecs)  cdSecs.textContent  = pad2(s);

            // Keep banner in sync
            if (closedBannerText && closedBannerText._hasCountdown) {
                const bannerTime = h > 0
                    ? `${pad2(h)}h ${pad2(m)}m ${pad2(s)}s`
                    : `${pad2(m)}m ${pad2(s)}s`;
                closedBannerText.textContent = `🔴 Restaurant Closed — Opens in ${bannerTime}`;
            }
        }

        tick(); // run immediately
        countdownInterval = setInterval(tick, 1000);
    }

    // ------- Utility helpers -------
    function getISTTime() {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    }

    function getDayKey(idx) {
        return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][idx];
    }

    function parseTimeStr(timeStr, dh = 9, dm = 0) {
        if (!timeStr || typeof timeStr !== 'string') return { hour: dh, min: dm };
        const [h, m] = timeStr.split(':').map(Number);
        return { hour: isNaN(h) ? dh : h, min: isNaN(m) ? dm : m };
    }

    // ------- Core status logic -------
    function getStoreStatusInfo(loc) {
        const istNow = getISTTime();
        const dayKey = getDayKey(istNow.getDay());
        const nowMins = istNow.getHours() * 60 + istNow.getMinutes();

        const settings = window.littiWaleSettings || [];
        const storeDoc = settings.find(s => s.storeId === loc) || settings[0] || null;

        // --- Admin-set offline check ---
        if (storeDoc && storeDoc.isOnline === false) {
            const reason   = storeDoc.offlineReason   || 'Kitchen is temporarily offline';
            const duration = storeDoc.offlineDuration || '';
            const isManual = !storeDoc.offlineUntil || duration === 'Until I turn myself on';

            let untilDate = null;
            let reopen    = 'Soon';

            if (!isManual && storeDoc.offlineUntil) {
                try {
                    const d = new Date(storeDoc.offlineUntil);
                    if (d > new Date()) {
                        untilDate = d;
                        const diffMins = Math.ceil((d - Date.now()) / 60000);
                        reopen = diffMins <= 60
                            ? `In ~${diffMins} min${diffMins !== 1 ? 's' : ''}`
                            : `At ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    } else {
                        // offlineUntil already passed → treat as open
                        return { isOpen: true };
                    }
                } catch(e) { /* ignore */ }
            }

            return { isOpen: false, reason, reopen, isManual, untilDate };
        }

        // --- Schedule-based check ---
        const defaultOpen  = loc === 'outlet' ? '07:00' : '11:00';
        const defaultClose = '22:00';
        let openTimeStr    = defaultOpen;
        let closeTimeStr   = defaultClose;
        let scheduleIsOpen = loc === 'outlet' ? istNow.getDay() !== 0 : true;
        let reason         = loc === 'outlet' && istNow.getDay() === 0
                                ? 'Closed on Sundays' : 'Closed for the day';

        if (storeDoc?.schedule?.[dayKey]) {
            const d = storeDoc.schedule[dayKey];
            scheduleIsOpen = d.isOpen !== false;
            openTimeStr    = d.openTime  || defaultOpen;
            closeTimeStr   = d.closeTime || defaultClose;
            reason         = d.closedReason || reason;
        }

        const op = parseTimeStr(openTimeStr,  loc === 'outlet' ? 7 : 11, 0);
        const cl = parseTimeStr(closeTimeStr, 22, 0);
        const openMins  = op.hour * 60 + op.min;
        const closeMins = cl.hour * 60 + cl.min;

        const isOpenNow = scheduleIsOpen && nowMins >= openMins && nowMins < closeMins;

        const fmt = (h, m) => {
            const p = h >= 12 ? 'PM' : 'AM';
            return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${p}`;
        };

        return {
            isOpen: isOpenNow,
            reason: !scheduleIsOpen ? reason : 'Outside Operating Hours',
            reopen: `Opens at ${fmt(op.hour, op.min)}`,
            isManual: false,
            untilDate: null
        };
    }

    // ------- Main check + UI update -------
    function checkRestaurantStatus() {
        const settings = window.littiWaleSettings || [];
        const isMaintenance = settings.some(s => s.isMaintenanceMode === true);
        
        // When Maintenance Mode is active, it overrides all store timing/closed popups!
        if (isMaintenance) {
            if (overlay)          overlay.classList.remove('show');
            if (closedBanner)     closedBanner.style.display = 'none';
            if (countdownInterval){ clearInterval(countdownInterval); countdownInterval = null; }
            if (countdownWrapper) countdownWrapper.classList.remove('visible');
            document.body.classList.remove('restaurant-closed-mode');
            return;
        }

        const loc    = sessionStorage.getItem('littiWaleLocation') || 'cloud';
        const status = getStoreStatusInfo(loc);

        window.isRestaurantCurrentlyOpen = status.isOpen;
        window.restaurantClosedReason    = status.reason;

        if (status.isOpen) {
            document.body.classList.remove('restaurant-closed-mode');
            if (overlay)          overlay.classList.remove('show');
            if (closedBanner)     closedBanner.style.display = 'none';
            if (countdownInterval){ clearInterval(countdownInterval); countdownInterval = null; }
            if (countdownWrapper) countdownWrapper.classList.remove('visible');
            return;
        }

        document.body.classList.add('restaurant-closed-mode');

        // Populate reason
        if (closedReasonText) closedReasonText.textContent = status.reason;

        if (status.isManual) {
            // "Until I turn myself on" — no countdown, show manual badge
            if (closedReopenRow)  closedReopenRow.style.display  = 'none';
            if (manualBadge)      manualBadge.style.display       = 'block';
            if (countdownWrapper) countdownWrapper.classList.remove('visible');
            if (countdownInterval){ clearInterval(countdownInterval); countdownInterval = null; }
            if (closedBannerText) {
                closedBannerText._hasCountdown = false;
                closedBannerText.textContent = `🔴 Restaurant Closed (${status.reason}) — We'll open when ready. Online checkout paused.`;
            }
        } else {
            // Timed offline — show reopen row + live countdown
            if (closedReopenRow)  closedReopenRow.style.display = 'flex';
            if (manualBadge)      manualBadge.style.display = 'none';
            if (closedReopenText) closedReopenText.textContent = status.reopen;

            if (status.untilDate) {
                if (closedBannerText) closedBannerText._hasCountdown = true;
                startCountdown(status.untilDate);
            } else {
                if (countdownWrapper) countdownWrapper.classList.remove('visible');
                if (closedBannerText) {
                    closedBannerText._hasCountdown = false;
                    closedBannerText.textContent = `🔴 Restaurant Closed (${status.reason} • ${status.reopen}). Online checkout paused.`;
                }
            }
        }

        if (overlay) overlay.classList.add('show');
    }

    // Browse menu while closed
    if (btnBrowse) {
        btnBrowse.addEventListener('click', () => {
            if (overlay)      overlay.classList.remove('show');
            if (closedBanner) closedBanner.style.display = 'flex';
        });
    }

    document.addEventListener('littiWaleSettingsLoaded',  checkRestaurantStatus);
    document.addEventListener('littiWaleLocationSelected', checkRestaurantStatus);

    checkRestaurantStatus();
    setInterval(checkRestaurantStatus, 30000); // background re-sync every 30s
});
