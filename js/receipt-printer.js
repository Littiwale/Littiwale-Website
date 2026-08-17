/**
 * LITTIWALE 3D THERMAL RECEIPT PRINTER & INVOICE CONTROLLER
 * Features: 3D Paper Rollout Animation, Web Audio Thermal Printer Sound FX & Instant Printing
 */

(function() {
  let audioCtx = null;
  let isPrinting = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize realistic thermal printer rolling sound
  function playThermalPrinterSound(durationMs = 2400) {
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const duration = durationMs / 1000;

      // 1. Motor hum noise
      const bufferSize = Math.floor(audioCtx.sampleRate * duration);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.Q.setValueAtTime(4.0, now);

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.08);
      gainNode.gain.setValueAtTime(0.06, now + duration - 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + duration);

      // 2. High-pitch thermal head stepper pulses
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.025, now + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch(e) {
      console.warn('Audio FX not supported:', e);
    }
  }

  // Synthesize paper cutter slice sound
  function playCutterSound() {
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch(e) {}
  }

  // Ensure Receipt Modal is created in DOM
  function ensureReceiptModal() {
    if (document.getElementById('receipt-printer-modal')) return;

    const modalHtml = `
      <div id="receipt-printer-modal" class="receipt-printer-modal" onclick="if(event.target===this) window.closeReceiptPrinterModal()">
        <div class="receipt-printer-modal-content">
          <button type="button" class="receipt-modal-close-btn" onclick="window.closeReceiptPrinterModal()" title="Close">✕</button>

          <!-- 3D Dispenser Stage -->
          <div class="receipt-printer-stage">
            <div class="receipt-machine-unit">
              <!-- Top Hood -->
              <div class="receipt-machine-hood-top">
                <div class="receipt-hood-highlight"></div>
              </div>

              <!-- Slit mouth -->
              <div class="receipt-machine-slit"></div>

              <!-- Cutter Blade Flash -->
              <div id="receipt-cutter-flash" class="receipt-cutter-flash"></div>

              <!-- Bottom Lip -->
              <div class="receipt-machine-hood-bottom"></div>

              <!-- Paper Viewport (Emerges from Slit) -->
              <div class="receipt-paper-viewport">
                <div id="receipt-paper-box" class="receipt-paper-box retracted">
                  <div class="receipt-inner-content" id="receipt-dynamic-content">
                    <!-- Populated dynamically -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="receipt-actions-strip" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; width:100%;">
            <button type="button" class="receipt-btn-primary" onclick="window.openA4InvoiceModal(window.currentPrintedOrderData || window.currentTrackedOrder)" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border-color:#059669;" title="Download clean A4 Tax Invoice PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="12" y2="18"></line>
                <line x1="15" y1="15" x2="12" y2="18"></line>
              </svg>
              <span>Download A4 PDF</span>
            </button>

            <button type="button" class="receipt-btn-primary" onclick="window.printReceiptDirectly()" title="Print thermal receipt roll">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Print Slip</span>
            </button>

            <button type="button" class="receipt-btn-secondary" id="receipt-tear-btn" onclick="window.tearReceiptAction()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
              </svg>
              <span>Tear Slip</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Open & Animate Receipt Printer Modal with Order Data
  window.openReceiptPrinterModal = function(orderData) {
    ensureReceiptModal();

    if (!orderData) {
      try {
        const stored = localStorage.getItem('littiWaleActiveOrder');
        if (stored) orderData = JSON.parse(stored);
      } catch(e) {}
    }

    if (typeof orderData === 'string') {
      const found = (window.cachedCustomerOrders || []).find(o => o._id === orderData);
      if (found) orderData = found;
      else if (window.currentTrackedOrder && window.currentTrackedOrder._id === orderData) orderData = window.currentTrackedOrder;
    }

    window.currentPrintedOrderData = orderData;

    if (!orderData) {
      if (typeof window.showAlert === 'function') {
        window.showAlert('Order details not found.', { type: 'error', title: 'Invoice Error' });
      } else {
        alert('Order details not found.');
      }
      return;
    }

    if (orderData.status === 'pending') {
      if (typeof window.showAlert === 'function') {
        window.showAlert('Official Invoice will be generated once the restaurant accepts and confirms your order.', { type: 'info', title: 'Invoice Pending' });
      } else {
        alert('Official Invoice will be generated once the restaurant confirms your order.');
      }
      return;
    }

    if (orderData.status === 'cancelled') {
      if (typeof window.showAlert === 'function') {
        window.showAlert('This order was cancelled. Official invoice is not available.', { type: 'error', title: 'Order Cancelled' });
      } else {
        alert('This order was cancelled. Invoice is not available.');
      }
      return;
    }

    const modal = document.getElementById('receipt-printer-modal');
    const paper = document.getElementById('receipt-paper-box');
    const content = document.getElementById('receipt-dynamic-content');
    const tearBtn = document.getElementById('receipt-tear-btn');

    if (!modal || !paper || !content) return;

    // Reset animations
    paper.className = 'receipt-paper-box retracted';
    if (tearBtn) tearBtn.style.display = 'inline-flex';
    
    // Format Data
    const shortId = orderData._id ? String(orderData._id).slice(-6).toUpperCase() : (orderData.shortId || 'LW');
    const isTakeaway = (orderData.orderType === 'takeaway');
    const dateStr = orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const custName = orderData.customerName || 'Valued Customer';
    const custPhone = orderData.customerPhone || orderData.whatsappPhone || 'N/A';
    const custAddress = isTakeaway ? '🛍️ Pickup Location: Littiwale Cloud Kitchen, Ward No. 7, Punjabi Para, Barbil' : (orderData.deliveryAddress || orderData.address || 'Barbil');
    const landmark = orderData.landmark ? `<div style="font-size:10px; color:#6b7280;">Landmark: ${orderData.landmark}</div>` : '';
    const paymentMode = orderData.paymentMethod ? String(orderData.paymentMethod).toUpperCase() : (orderData.isCOD ? 'CASH ON DELIVERY (COD)' : 'PAID ONLINE (UPI)');

    const items = orderData.items || [];
    const itemsRows = items.length > 0 ? items.map(item => `
      <tr>
        <td>${item.quantity || 1}x ${item.name || 'Dish Item'}</td>
        <td>₹${Number(item.price || 0) * (item.quantity || 1)}</td>
      </tr>
    `).join('') : `
      <tr>
        <td>1x Authentic Bihari Meal</td>
        <td>₹${orderData.subtotal || orderData.finalTotal || 0}</td>
      </tr>
    `;

    const subtotal = orderData.subtotal || orderData.finalTotal || 0;
    const delivery = isTakeaway ? 0 : Number(orderData.deliveryCharge || orderData.deliveryFee || 0);
    const discount = Number(orderData.discount || orderData.couponDiscount || 0);
    const grandTotal = orderData.finalTotal || (subtotal + delivery - discount);

    // Build Receipt HTML
    content.innerHTML = `
      <!-- Shop Header -->
      <div class="receipt-shop-header">
        <img src="images/logo.png" onerror="this.src='/images/logo.png'" alt="Littiwale" class="receipt-shop-logo-img">
        <div class="receipt-shop-name">LITTIWALE</div>
        <div class="receipt-shop-tagline">Taste of Desi Swag • Cloud Kitchen & Restaurant</div>
        <div class="receipt-shop-address">
          Ward No. 7, Punjabi Para, Barbil, Odisha 758035<br>
          Phone: +91 63706 80744 | support@littiwale.com
        </div>
      </div>

      <!-- Order Meta Grid -->
      <div class="receipt-meta-grid">
        <div class="receipt-meta-label">ORDER ID:</div>
        <div class="receipt-meta-val">#${shortId}</div>

        <div class="receipt-meta-label">DATE & TIME:</div>
        <div class="receipt-meta-val">${dateStr}</div>

        <div class="receipt-meta-label">PAYMENT:</div>
        <div class="receipt-meta-val">${paymentMode}</div>

        <div class="receipt-meta-label">ORDER TYPE:</div>
        <div class="receipt-meta-val">${isTakeaway ? 'TAKEAWAY (SELF PICKUP)' : 'HOME DELIVERY'}</div>
      </div>

      <!-- Customer Details Box -->
      <div class="receipt-cust-box">
        <div style="font-weight:800; color:#000; margin-bottom:2px;">CUSTOMER: ${custName} (${custPhone})</div>
        <div style="color:#4b5563; font-size:10.5px;">${custAddress}</div>
        ${landmark}
      </div>

      <!-- Ordered Items Table -->
      <table class="receipt-items-table">
        <thead>
          <tr>
            <th>ITEM & QTY</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals Summary -->
      <div class="receipt-totals-box">
        <div class="receipt-total-row">
          <span>Subtotal</span>
          <span>₹${subtotal}</span>
        </div>
        <div class="receipt-total-row">
          <span>Delivery Charges</span>
          <span>${isTakeaway ? '<strong style="color:#16a34a;">₹0 (Self Pickup)</strong>' : (delivery > 0 ? `₹${delivery}` : '<strong style="color:#16a34a;">FREE</strong>')}</span>
        </div>
        ${discount > 0 ? `
          <div class="receipt-total-row" style="color:#16a34a;">
            <span>Coupon Discount</span>
            <span>-₹${discount}</span>
          </div>
        ` : ''}
        <div class="receipt-grand-total-row">
          <span>TOTAL AMOUNT</span>
          <span>₹${grandTotal}</span>
        </div>
      </div>

      <!-- Footer / Barcode -->
      <div class="receipt-footer-box">
        <div class="receipt-barcode-wrap">
          <div class="receipt-barcode-bars"></div>
          <div class="receipt-barcode-num">LW-${shortId}-${Date.now().toString().slice(-4)}</div>
        </div>
        <div class="receipt-thankyou">Thank You for Ordering! ❤️</div>
        <div class="receipt-powered">Official Receipt • Littiwale Barbil</div>
      </div>
    `;

    // Trigger Print Animation Sequence
    modal.classList.add('active');
    setTimeout(() => {
      playThermalPrinterSound(2400);
      paper.className = 'receipt-paper-box printing';
      setTimeout(() => {
        paper.className = 'receipt-paper-box printed';
      }, 1200);
    }, 150);
  };

  /**
   * Tear off and Save / Print Thermal Slip
   */
  window.tearOffReceipt = function() {
    const paper = document.getElementById('receipt-paper-box');
    const tearBtn = document.getElementById('receipt-tear-btn');
    if (!paper) return;

    playCutterSound();
    paper.classList.add('torn');
    if (tearBtn) tearBtn.style.display = 'none';

    setTimeout(() => {
      window.print();
    }, 300);
  };

  /**
   * Close Thermal Printer Modal
   */
  window.closeReceiptPrinterModal = function() {
    const modal = document.getElementById('receipt-printer-modal');
    const paper = document.getElementById('receipt-paper-box');
    if (modal) modal.classList.remove('active');
    if (paper) paper.className = 'receipt-paper-box retracted';
  };

  // 1-Click Print Thermal Receipt
  window.printReceiptDirectly = function() {
    window.print();
  };

  /**
   * Full Page High-Res A4 Printable Invoice Modal
   */
  window.openA4InvoiceModal = function(orderData) {
    if (!orderData) {
      if (typeof window.showAlert === 'function') {
        window.showAlert('Order details not found to generate invoice.', { type: 'warning' });
      }
      return;
    }

    const shortId = orderData._id ? String(orderData._id).slice(-6).toUpperCase() : (orderData.shortId || 'LW');
    const isTakeaway = (orderData.orderType === 'takeaway');
    const dateStr = orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const custName = orderData.customerName || 'Valued Customer';
    const custPhone = orderData.customerPhone || orderData.whatsappPhone || 'N/A';
    const custAddress = isTakeaway ? '🛍️ Pickup Location: Littiwale Cloud Kitchen, Ward No. 7, Punjabi Para, Barbil' : (orderData.deliveryAddress || orderData.address || 'Barbil');
    const landmark = orderData.landmark ? ` (Landmark: ${orderData.landmark})` : '';
    const paymentMode = orderData.paymentMethod ? String(orderData.paymentMethod).toUpperCase() : (orderData.isCOD ? 'CASH ON DELIVERY (COD)' : 'PAID ONLINE (UPI)');

    const items = orderData.items || [];
    const subtotal = Number(orderData.subtotal || orderData.finalTotal || 0);
    const delivery = isTakeaway ? 0 : Number(orderData.deliveryCharge || orderData.deliveryFee || 0);
    const discount = Number(orderData.discount || orderData.couponDiscount || 0);
    const grandTotal = Number(orderData.finalTotal || (subtotal + delivery - discount));

    const rowsHtml = items.length > 0 ? items.map((it, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding:12px; text-align:center; color:#64748b; font-size:12px;">${idx + 1}</td>
        <td style="padding:12px; font-weight:700; color:#0f172a;">${it.name || 'Dish Item'}</td>
        <td style="padding:12px; text-align:center; font-weight:600;">${it.quantity || 1}</td>
        <td style="padding:12px; text-align:right; color:#475569;">₹${it.price || 0}</td>
        <td style="padding:12px; text-align:right; font-weight:800; color:#0f172a;">₹${(Number(it.price || 0) * (it.quantity || 1))}</td>
      </tr>
    `).join('') : `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding:12px; text-align:center; color:#64748b;">1</td>
        <td style="padding:12px; font-weight:700; color:#0f172a;">Authentic Bihari Meal Package</td>
        <td style="padding:12px; text-align:center;">1</td>
        <td style="padding:12px; text-align:right;">₹${subtotal}</td>
        <td style="padding:12px; text-align:right; font-weight:800;">₹${subtotal}</td>
      </tr>
    `;

    const printWin = window.open('', '_blank', 'width=850,height=900');
    if (!printWin) {
      alert('Please allow popups to view & print invoice.');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${shortId} | Littiwale Barbil</title>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            padding: 40px;
          }
          .invoice-card { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #f1f5f9; padding-bottom:24px; margin-bottom:24px;">
            <div>
              <h1 style="font-size:24px; font-weight:800;">LITTIWALE</h1>
              <div style="font-size:12px; color:#64748b;">Ward No. 7, Punjabi Para, Barbil</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:18px; font-weight:800;">#${shortId}</div>
              <div style="font-size:12px;">${dateStr}</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; background:#f8fafc; padding:20px; border-radius:12px; margin-bottom:24px;">
            <div>
              <div style="font-size:11px; color:#94a3b8; font-weight:800;">BILLED TO</div>
              <div style="font-weight:700;">${custName}</div>
              <div style="font-size:12.5px; color:#475569; margin-top:2px;">${custAddress}${landmark}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px; color:#94a3b8; font-weight:800;">PAYMENT & ORDER STATUS</div>
              <div style="font-size:13px; font-weight:700;">Mode: <span style="color:#059669;">${paymentMode}</span></div>
              <div style="font-size:12.5px; color:#475569; margin-top:2px;">Type: <strong>${isTakeaway ? 'Takeaway (Self Pickup)' : 'Home Delivery'}</strong></div>
              <div style="font-size:12.5px; color:#059669; font-weight:700; margin-top:4px;">● Order Confirmed by Kitchen</div>
            </div>
          </div>

          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <tr style="background:#0f172a; color:#fff; font-size:11px;">
              <th style="padding:12px;">#</th><th style="padding:12px; text-align:left;">ITEM</th><th style="padding:12px;">QTY</th><th style="padding:12px;">RATE</th><th style="padding:12px;">TOTAL</th>
            </tr>
            ${rowsHtml}
          </table>

              <div style="display:flex; justify-content:space-between; padding:12px 0 8px; border-top:2px solid #0f172a; margin-top:8px; font-size:16px; font-weight:800; color:#0f172a;">
                <span>GRAND TOTAL:</span>
                <span style="color:#d97706;">₹${grandTotal}</span>
              </div>
            </div>
          </div>

          <!-- Official Stamp & Terms -->
          <div style="border-top:1px dashed #cbd5e1; padding-top:20px; display:flex; justify-content:space-between; align-items:flex-end;">
            <div style="font-size:11.5px; color:#64748b; max-width:440px;">
              <strong>Terms & Food Assurance:</strong><br>
              1. Made fresh with authentic spices, cold-pressed mustard oil, and wood-fired heat in Barbil.<br>
              2. 100% Quality & Hygiene Assured. Official restaurant receipt.
            </div>
            <div style="text-align:center; min-width:180px;">
              <div style="font-weight:800; font-size:12px; color:#0f172a; margin-bottom:4px;">For LITTIWALE RESTAURANT</div>
              <div style="display:flex; justify-content:center; align-items:center; height:44px; margin-bottom:2px;">
                <svg width="130" height="42" viewBox="0 0 160 52" fill="none">
                  <path d="M12 28 C 22 10, 36 6, 52 8 C 40 18, 32 36, 30 46 M 22 24 C 34 20, 56 16, 75 22 M 72 32 C 78 24, 86 20, 92 30 C 95 35, 98 42, 102 34 C 106 26, 114 22, 120 30 C 122 36, 126 44, 134 32 C 142 20, 150 14, 158 10 M 80 44 C 104 42, 136 38, 154 36" stroke="#0f172a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div style="font-size:11px; color:#64748b; font-weight:700; border-top:1.5px solid #cbd5e1; padding-top:4px;">Authorized Signatory</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Tear Receipt Physical Animation
  window.tearReceiptAction = function() {
    const paper = document.getElementById('receipt-paper-box');
    const flash = document.getElementById('receipt-cutter-flash');
    const tearBtn = document.getElementById('receipt-tear-btn');

    if (!paper) return;

    playCutterSound();

    if (flash) {
      flash.classList.remove('active');
      void flash.offsetWidth; // trigger reflow
      flash.classList.add('active');
    }

    paper.classList.remove('printed');
    paper.classList.add('torn-anim');

    if (tearBtn) tearBtn.style.display = 'none';

    setTimeout(() => {
      window.closeReceiptPrinterModal();
    }, 900);
  };

})();
