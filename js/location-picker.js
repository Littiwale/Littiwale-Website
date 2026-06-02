/**
 * Littiwale — Location Picker Modal
 * Shows on every page load: user picks Cloud Kitchen or Physical Outlet
 * Stores choice in sessionStorage as 'littiWaleLocation' ('cloud' | 'outlet')
 * Fires custom event 'littiWaleLocationSelected' on document
 *
 * HOW TO USE:
 * 1. Add this file to your project: js/location-picker.js
 * 2. In index.html AND menu.html, add BEFORE closing </body>:
 *    <script src="js/location-picker.js"></script>
 */

(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  var STORAGE_KEY = 'littiWaleLocation';
  var OUTLET_OPEN_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat (0=Sun)
  var OUTLET_OPEN_HOUR = 8;
  var OUTLET_CLOSE_HOUR = 22; // 10 PM
  var CLOUD_OPEN_HOUR = 9;
  var CLOUD_CLOSE_HOUR = 23; // 11 PM

  // ─── Status helpers ───────────────────────────────────────────────────────
  function getISTDate() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  }

  function isOutletOpen() {
    var d = getISTDate();
    var day = d.getDay();
    var h = d.getHours();
    return OUTLET_OPEN_DAYS.includes(day) && h >= OUTLET_OPEN_HOUR && h < OUTLET_CLOSE_HOUR;
  }

  function isCloudOpen() {
    var d = getISTDate();
    var h = d.getHours();
    return h >= CLOUD_OPEN_HOUR && h < CLOUD_CLOSE_HOUR;
  }

  function isSunday() {
    return getISTDate().getDay() === 0;
  }

  // ─── Inject CSS ───────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#lw-loc-overlay{',
      'position:fixed;inset:0;z-index:99999;',
      'background:rgba(0,0,0,0.82);',
      'display:flex;align-items:center;justify-content:center;',
      'padding:16px;',
      'opacity:0;transition:opacity 0.25s ease;',
    '}',
    '#lw-loc-overlay.lw-show{opacity:1;}',
    '#lw-loc-box{',
      'background:#111;border-radius:18px;',
      'padding:28px 24px 24px;',
      'width:100%;max-width:400px;',
      'box-shadow:0 20px 60px rgba(0,0,0,0.6);',
      'transform:translateY(20px);transition:transform 0.25s ease;',
    '}',
    '#lw-loc-overlay.lw-show #lw-loc-box{transform:translateY(0);}',
    '#lw-loc-header{text-align:center;margin-bottom:22px;}',
    '#lw-loc-logo{font-size:1.5rem;font-weight:700;',
      'color:#f4b400;letter-spacing:0.5px;margin-bottom:4px;}',
    '#lw-loc-sub{font-size:13px;color:#aaa;}',
    '.lw-loc-cards{display:flex;gap:12px;}',
    '.lw-loc-card{',
      'flex:1;border:1.5px solid #2a2a2a;border-radius:12px;',
      'padding:16px 12px;text-align:center;cursor:pointer;',
      'transition:border-color 0.2s,background 0.2s;',
      'position:relative;',
    '}',
    '.lw-loc-card:hover{border-color:#f4b400;background:#1a1a1a;}',
    '.lw-loc-card.lw-active{border-color:#f4b400;background:#1c1700;}',
    '.lw-loc-icon{font-size:28px;margin-bottom:8px;}',
    '.lw-loc-name{font-size:14px;font-weight:600;color:#fff;margin-bottom:4px;}',
    '.lw-loc-info{font-size:11px;color:#888;line-height:1.5;}',
    '.lw-loc-badge{',
      'display:inline-block;margin-top:8px;',
      'font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;',
    '}',
    '.lw-badge-open{background:#1a3a1a;color:#4ade80;}',
    '.lw-badge-closed{background:#3a1a1a;color:#f87171;}',
    '.lw-badge-new{background:#1a2a3a;color:#60a5fa;}',
    '#lw-loc-btn{',
      'margin-top:20px;width:100%;',
      'background:#f4b400;color:#0d0d0d;',
      'border:none;border-radius:10px;',
      'padding:14px;font-size:15px;font-weight:700;',
      'cursor:pointer;transition:opacity 0.2s;',
    '}',
    '#lw-loc-btn:disabled{opacity:0.4;cursor:not-allowed;}',
    '#lw-loc-btn:not(:disabled):hover{opacity:0.9;}',
    '#lw-loc-notice{',
      'font-size:11px;color:#666;text-align:center;margin-top:12px;',
    '}',
    '#lw-loc-sunday{',
      'background:#2a1010;border:1px solid #5a2020;border-radius:10px;',
      'padding:14px;text-align:center;color:#f87171;font-size:13px;',
      'margin-bottom:16px;',
    '}',
    /* Outlet indicator badge on menu page */
    '#lw-outlet-bar{',
      'position:sticky;top:0;z-index:950;',
      'background:#0d0d0d;',
      'border-bottom:1px solid #2a2a2a;',
    '}',
    '#lw-outlet-bar a{color:#0d0d0d;font-size:12px;text-decoration:underline;cursor:pointer;}',
    /* Menu item availability tags */
    '.lw-avail-tag{',
      'display:inline-block;font-size:10px;padding:2px 7px;',
      'border-radius:20px;margin-bottom:6px;font-weight:600;',
    '}',
    '.lw-avail-outlet{background:#1a2a3a;color:#60a5fa;}',
    '.lw-avail-cloud{background:#1a1a3a;color:#a78bfa;}',
    '.lw-avail-both{background:#1a3a1a;color:#4ade80;}',
  ].join('');
  document.head.appendChild(style);

  // ─── Build modal HTML ──────────────────────────────────────────────────────
  function buildModal() {
    var sunday = isSunday();
    var outletOpen = isOutletOpen();
    var cloudOpen = isCloudOpen();

    var sundayHTML = sunday
      ? '<div id="lw-loc-sunday">🚫 Today is Sunday — Barbil Outlet is closed.<br>Cloud Kitchen is Open for Delivery!</div>'
      : '';

    var outletStatus = outletOpen
      ? '<span class="lw-loc-badge lw-badge-open">✓ Open Now</span>'
      : '<span class="lw-loc-badge lw-badge-closed">Closed Now</span>';

    var cloudStatus = cloudOpen
      ? '<span class="lw-loc-badge lw-badge-open">✓ Open Now</span>'
      : '<span class="lw-loc-badge lw-badge-closed">Closed Now</span>';

    var div = document.createElement('div');
    div.id = 'lw-loc-overlay';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-modal', 'true');
    div.setAttribute('aria-labelledby', 'lw-loc-logo');
    div.innerHTML = [
      '<div id="lw-loc-box">',
        '<div id="lw-loc-header">',
          '<div id="lw-loc-logo">🍛 Littiwale</div>',
          '<div id="lw-loc-sub">Kahan se order karna hai?</div>',
        '</div>',
        sundayHTML,
        '<div class="lw-loc-cards">',
          '<div class="lw-loc-card" id="lw-card-cloud" data-loc="cloud" tabindex="0" role="button" aria-pressed="false">',
            '<div class="lw-loc-icon">☁️</div>',
            '<div class="lw-loc-name">Cloud Kitchen</div>',
            '<div class="lw-loc-info">Home Delivery<br>Daily, 9am – 11pm</div>',
            cloudStatus,
          '</div>',
          '<div class="lw-loc-card" id="lw-card-outlet" data-loc="outlet" tabindex="0" role="button" aria-pressed="false">',
            '<div class="lw-loc-icon">🏪</div>',
            '<div class="lw-loc-name">Barbil Outlet</div>',
            '<div class="lw-loc-info">Near Barbil Court<br>Mon–Sat, 8am – 10pm</div>',
            '<span class="lw-loc-badge lw-badge-new">NEW</span><br>',
            outletStatus,
          '</div>',
        '</div>',
        '<button id="lw-loc-btn" disabled>Pehle ek choose karo ☝️</button>',
        '<div id="lw-loc-notice">Pure Veg items at Outlet &nbsp;|&nbsp; Full menu on Cloud Kitchen</div>',
      '</div>',
    ].join('');

    return div;
  }

  // ─── Show modal ────────────────────────────────────────────────────────────
  function showPicker(onChoose) {
    var overlay = buildModal();
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('lw-show');
      });
    });

    var selected = null;
    var btn = overlay.querySelector('#lw-loc-btn');
    var cards = overlay.querySelectorAll('.lw-loc-card');

    function selectCard(loc) {
      selected = loc;
      cards.forEach(function (c) {
        var active = c.dataset.loc === loc;
        c.classList.toggle('lw-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      btn.disabled = false;
      btn.textContent = loc === 'outlet'
        ? '🏪 Outlet ka menu dekho →'
        : '☁️ Cloud Kitchen menu dekho →';
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () { selectCard(card.dataset.loc); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(card.dataset.loc); }
      });
    });

    btn.addEventListener('click', function () {
      if (!selected) return;
      // Save to sessionStorage
      sessionStorage.setItem(STORAGE_KEY, selected);
      window.littiWaleSelectedLocation = selected;
      // Animate out
      overlay.classList.remove('lw-show');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        onChoose(selected);
      }, 250);
    });
  }

  // ─── Apply outlet top bar on menu page ────────────────────────────────────
  function applyOutletBar(loc) {
    if (!window.location.pathname.includes('menu.html') && !window.location.pathname.endsWith('/menu')) {
      return; // Only show sticky bar on menu page
    }

    var existing = document.getElementById('lw-outlet-bar');
    if (existing) existing.parentNode.removeChild(existing);

    var bar = document.createElement('div');
    bar.id = 'lw-outlet-bar';
    bar.style.cssText = [
      'position:sticky;top:var(--lw-nav-h, 70px);z-index:950;',
      'background:#0d0d0d;',
      'border-bottom:1px solid #2a2a2a;',
      'padding:10px 20px;',
      'display:flex;align-items:center;justify-content:space-between;gap:12px;',
      'flex-wrap:wrap;',
    ].join('');

    // Left side — location info
    var info = document.createElement('div');
    info.style.cssText = 'display:flex;align-items:center;gap:10px;';

    var dot = document.createElement('span');
    dot.id = 'lw-status-dot';
    dot.style.cssText = [
      'width:8px;height:8px;border-radius:50%;flex-shrink:0;',
      'background:' + (loc === 'outlet' ? '#4ade80' : '#a78bfa') + ';',
      'box-shadow:0 0 6px ' + (loc === 'outlet' ? '#4ade80' : '#a78bfa') + ';',
    ].join('');

    var label = document.createElement('span');
    label.id = 'lw-bar-label';
    label.style.cssText = 'font-size:13px;font-weight:600;color:#fff;';
    label.textContent = loc === 'outlet'
      ? '🏪 Barbil Outlet — Pure Veg · Dine In / Takeaway'
      : '☁️ Cloud Kitchen — Home Delivery · Veg + Non-Veg';

    info.appendChild(dot);
    info.appendChild(label);

    // Right side — toggle pill
    var toggle = document.createElement('div');
    toggle.style.cssText = [
      'display:flex;align-items:center;',
      'background:#1a1a1a;',
      'border:1px solid #333;',
      'border-radius:999px;',
      'padding:3px;',
      'gap:3px;',
      'flex-shrink:0;',
    ].join('');

    function makeToggleBtn(btnLoc, icon, label) {
      var btn = document.createElement('button');
      btn.dataset.loc = btnLoc;
      btn.style.cssText = [
        'display:flex;align-items:center;gap:6px;',
        'padding:6px 14px;border-radius:999px;border:none;cursor:pointer;',
        'font-size:12px;font-weight:600;',
        'transition:background 0.2s,color 0.2s;',
        btnLoc === loc
          ? (btnLoc === 'outlet'
              ? 'background:#f4b400;color:#0d0d0d;'
              : 'background:#7c3aed;color:#fff;')
          : 'background:transparent;color:#888;',
      ].join('');
      btn.innerHTML = icon + ' <span>' + label + '</span>';

      btn.addEventListener('click', function () {
        if (btn.dataset.loc === (sessionStorage.getItem('littiWaleLocation') || 'cloud')) return;

        // Save new choice
        sessionStorage.setItem('littiWaleLocation', btn.dataset.loc);
        window.littiWaleSelectedLocation = btn.dataset.loc;

        // Re-render bar
        applyOutletBar(btn.dataset.loc);

        // Fire event so main.js filter updates
        document.dispatchEvent(
          new CustomEvent('littiWaleLocationSelected', { detail: btn.dataset.loc })
        );

        // Re-run menu filter (timing-safe)
        if (typeof currentLocationFilter !== 'undefined') {
          currentLocationFilter = btn.dataset.loc;
          if (btn.dataset.loc === 'outlet') {
            currentDietaryFilter = 'veg';
          } else {
            currentDietaryFilter = 'all';
          }
        }
        if (typeof renderMenu === 'function' && typeof menuData !== 'undefined') {
          renderMenu(menuData);
          if (typeof setupFilters === 'function') setupFilters(menuData);

          // Outlet pe non-veg button hide
          setTimeout(function () {
            var nonVegBtn = document.querySelector('[data-diet="non-veg"]');
            if (nonVegBtn) {
               nonVegBtn.style.display = btn.dataset.loc === 'outlet' ? 'none' : '';
            }
            // Active state reset on dietary buttons
            if (btn.dataset.loc === 'outlet') {
              document.querySelectorAll('[data-diet]').forEach(function(b) {
                b.classList.toggle('active', b.dataset.diet === 'veg');
              });
            } else {
              document.querySelectorAll('[data-diet]').forEach(function(b) {
                b.classList.toggle('active', b.dataset.diet === 'all');
              });
            }
          }, 50);
        }
      });

      return btn;
    }

    toggle.appendChild(makeToggleBtn('cloud', '☁️', 'Cloud Kitchen'));
    toggle.appendChild(makeToggleBtn('outlet', '🏪', 'Outlet'));

    bar.appendChild(info);
    bar.appendChild(toggle);

    // Insert below navbar
    var navbar = document.querySelector('.navbar');
    if (navbar && navbar.nextSibling) {
      navbar.parentNode.insertBefore(bar, navbar.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }

    if (typeof document.documentElement.style.setProperty === 'function') {
      var navH = navbar ? navbar.offsetHeight : 70;
      document.documentElement.style.setProperty('--lw-nav-h', navH + 'px');
      document.documentElement.style.setProperty('--lw-outlet-bar-h', bar.offsetHeight + 'px');
    }
  }

  // ─── Main init ────────────────────────────────────────────────────────────
  function init() {
    var stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      // Already chosen this session — just apply silently
      window.littiWaleSelectedLocation = stored;
      document.dispatchEvent(new CustomEvent('littiWaleLocationSelected', { detail: stored }));
      applyOutletBar(stored);
    } else {
      // Show picker only on menu page
      if (window.location.pathname.includes('menu.html') || window.location.pathname.endsWith('/menu')) {
        showPicker(function (loc) {
          window.littiWaleSelectedLocation = loc;
          document.dispatchEvent(new CustomEvent('littiWaleLocationSelected', { detail: loc }));
          applyOutletBar(loc);
        });
      } else {
        // Default to 'all' or 'cloud' on index.html so best sellers show up normally
        window.littiWaleSelectedLocation = 'all';
        document.dispatchEvent(new CustomEvent('littiWaleLocationSelected', { detail: 'all' }));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
