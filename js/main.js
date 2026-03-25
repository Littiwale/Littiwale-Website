document.addEventListener('DOMContentLoaded', () => {
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
    const menuGrid = document.getElementById('menu-grid');
    const categoryFilters = document.getElementById('category-filters');

    // Fetch Menu Data
    fetch('data/menu.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            menuData = data;
            
            initMenuDisplay();
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            if(menuGrid) {
                menuGrid.innerHTML = '<div class="error" style="grid-column: 1/-1; text-align: center; color: red;">Failed to load menu items.</div>';
            }
        });

    let isMenuExpanded = false;
    let initialBestsellers = [];
    let currentFilteredData = [];
    let currentDietaryFilter = 'all';

    const CATEGORY_ORDER = [
        "Star Special", "Soup", "Mega Combos", "Mini Combos", "Sandwiches", 
        "Noodles & Rice", "Starters", "Parathas & Naan", "Pizza", "Pasta", 
        "Tandoori/Kebabs", "Main Course", "Thali", "Pre Order Specials"
    ];

    function initMenuDisplay() {
        const numItems = Math.floor(Math.random() * 3) + 4; // 4 to 6 items
        const shuffled = [...menuData].sort(() => 0.5 - Math.random());
        initialBestsellers = shuffled.slice(0, numItems);
        currentFilteredData = menuData;
        
        if (categoryFilters) categoryFilters.style.display = 'none';
        
        setupFilters(menuData);
        setupExpandButton();
        renderMenu(initialBestsellers);
    }
    
    function setupExpandButton() {
        let toggleContainer = document.getElementById('menu-toggle-container');
        if (!toggleContainer && menuGrid) {
            toggleContainer = document.createElement('div');
            toggleContainer.id = 'menu-toggle-container';
            toggleContainer.style.textAlign = 'center';
            toggleContainer.style.marginTop = '30px';
            menuGrid.parentNode.insertBefore(toggleContainer, menuGrid.nextSibling);
        }
        
        if (toggleContainer) {
            toggleContainer.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.id = 'toggle-full-menu-btn';
            btn.textContent = 'View Full Menu';
            
            btn.addEventListener('click', () => {
                isMenuExpanded = !isMenuExpanded;
                if (isMenuExpanded) {
                    btn.textContent = 'Show Less';
                    if (categoryFilters) categoryFilters.style.display = 'flex';
                    renderMenu(currentFilteredData);
                } else {
                    btn.textContent = 'View Full Menu';
                    if (categoryFilters) categoryFilters.style.display = 'none';
                    renderMenu(initialBestsellers);
                    // Smoothly scroll back to top of menu when collapsing to prevent being left in the middle of nowhere!
                    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
            toggleContainer.appendChild(btn);
        }
    }

    function renderMenu(items) {
        if (!menuGrid) return;
        menuGrid.innerHTML = '';
        
        let displayItems = items;
        if (currentDietaryFilter !== 'all') {
            displayItems = items.filter(item => {
                const combinedText = (item.name + " " + (item.description || "")).toLowerCase();
                const isEggless = combinedText.includes("eggless");
                const hasNonVegWords = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
                const isNonVeg = !isEggless && hasNonVegWords;
                return currentDietaryFilter === 'veg' ? !isNonVeg : isNonVeg;
            });
        }
        
        if (displayItems.length === 0) {
            menuGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No items found.</div>';
            return;
        }

        const grouped = {};
        displayItems.forEach(item => {
            const cat = item.category || 'Other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });

        const orderedCategories = [...new Set([...CATEGORY_ORDER, ...Object.keys(grouped)])];

        orderedCategories.forEach(category => {
            if (!grouped[category] || grouped[category].length === 0) return;
            
            const catHeader = document.createElement('div');
            catHeader.style.gridColumn = '1/-1';
            catHeader.style.marginTop = '20px';
            catHeader.style.marginBottom = '10px';
            catHeader.innerHTML = `<h2 style="font-family: var(--font-heading); color: var(--primary-color); border-bottom: 2px solid var(--primary-color); display: inline-block; padding-bottom: 5px;">${category}</h2>`;
            menuGrid.appendChild(catHeader);

            grouped[category].forEach(item => {
                const card = document.createElement('div');
                card.className = 'menu-card';
                
                let priceHtml = '';
                let btnHtml = '';
                
                if (item.half !== undefined && item.full !== undefined) {
                    priceHtml = `<span class="menu-price">₹${item.half} | ₹${item.full}</span>`;
                    btnHtml = `
                        <div style="display: flex; gap: 10px;">
                            <button class="add-to-cart-btn" onclick="addToCart('${item.id}_half', '${item.name.replace(/'/g, "\\'")} Half', ${item.half}, '${item.image}')">Add Half</button>
                            <button class="add-to-cart-btn" onclick="addToCart('${item.id}_full', '${item.name.replace(/'/g, "\\'")} Full', ${item.full}, '${item.image}')">Add Full</button>
                        </div>
                    `;
                } else {
                    priceHtml = `<span class="menu-price">₹${item.price}</span>`;
                    btnHtml = `
                        <button class="add-to-cart-btn" onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.image}')">Add to Cart</button>
                    `;
                }

                const combinedText = (item.name + " " + (item.description || "")).toLowerCase();
                const isEggless = combinedText.includes("eggless");
                const hasNonVegWords = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
                const isNonVeg = !isEggless && hasNonVegWords;
                const foodTypeBadge = isNonVeg ? '<span class="food-tag non-veg">NON-VEG</span>' : '<span class="food-tag veg">VEG</span>';

                card.innerHTML = `
                    <div class="menu-details">
                        <div>${foodTypeBadge}</div>
                        <div class="menu-title-row">
                            <h3 class="menu-title">${item.name}</h3>
                            ${priceHtml}
                        </div>
                        <p class="menu-desc">${item.description || ''}</p>
                        ${btnHtml}
                    </div>
                `;
                menuGrid.appendChild(card);
            });
        });
    }

    function setupFilters(items) {
        if (!categoryFilters) return;
        
        categoryFilters.innerHTML = ''; // Fresh render
        
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

        const categories = ['all', ...new Set(items.map(item => item.category))];
        catContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All Categories</button>';
        categories.slice(1).forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', category);
            btn.textContent = category;
            catContainer.appendChild(btn);
        });

        // Event for Category
        catContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                catContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const filter = e.target.getAttribute('data-filter');
                if (filter === 'all') {
                    currentFilteredData = menuData;
                } else {
                    currentFilteredData = menuData.filter(item => item.category === filter);
                }
                
                if (isMenuExpanded) {
                    renderMenu(currentFilteredData);
                }
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


    // --- Cart System ---
    let cart = [];
    let availableCoupons = [];
    let appliedCoupon = null;
    let discountAmount = 0;
    
    // --- Delivery Logic ---
    let deliveryCharge = 0;
    let deliveryStatus = 'UNKNOWN'; // 'AVAILABLE', 'UNAVAILABLE', 'UNKNOWN'
    const RESTAURANT_LAT = 22.1152751;
    const RESTAURANT_LNG = 85.3871145;

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
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    const distanceKm = calculateDistance(userLat, userLng, RESTAURANT_LAT, RESTAURANT_LNG);
                    const roundedKm = Math.max(1, Math.round(distanceKm)); // At least 1 km to prevent zero
                    
                    deliveryCharge = roundedKm * 30;
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

    // Initialize Cart
    function initCart() {
        const storedCart = localStorage.getItem('littiWaleCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            updateCartUI();
        }
        
        // Fetch location details exclusively for Delivery Calculation
        getUserLocation();
    }

    // Global add to cart function accessible from inline HTML onclick
    window.addToCart = function(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }
        
        saveCart();
        updateCartUI();
        
        // Auto-open the cart drawer smoothly
        const cartDrawer = document.getElementById('cart-drawer');
        if (cartDrawer) {
            cartDrawer.classList.add('open');
        }
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
            container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            summary.style.display = 'none';
            const couponSection = document.getElementById('coupon-section');
            if (couponSection) couponSection.style.display = 'none';
        } else {
            container.innerHTML = '';
            let subtotalAmount = 0;

            cart.forEach(item => {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity) || 0;
                const itemTotal = priceNum * qtyNum;
                subtotalAmount += itemTotal;

                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/60?text=img'">
                        <div>
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">₹${item.price} x ${item.quantity} = ₹${itemTotal}</div>
                        </div>
                    </div>
                    <div class="cart-controls">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove item"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                container.appendChild(cartItem);
            });

            // Update UI Details dynamically considering location logic
            let deliveryText = '';
            let noteHtml = '';
            let finalTotal = subtotalAmount;
            
            const orderTypeDelivery = document.getElementById('order-type-delivery');
            const isDelivery = orderTypeDelivery ? orderTypeDelivery.checked : true;

            if (!isDelivery) {
                deliveryText = 'Pickup Order (Takeaway)';
                finalTotal = subtotalAmount; // no delivery charge for takeaway
            } else if (deliveryStatus === 'AVAILABLE') {
                const distanceVal = Math.round(deliveryCharge / 30);
                deliveryText = `₹${deliveryCharge} (${distanceVal} km)`;
                finalTotal += deliveryCharge;
            } else if (deliveryStatus === 'UNAVAILABLE') {
                deliveryText = `Not available`;
            } else {
                deliveryText = `Not calculated`;
                noteHtml = `<div style="font-size: 0.8rem; color: #dc3545; margin-top: 4px; text-align: right;">*Delivery charges will be extra charged based on distance</div>`;
            }

            // Apply Coupon Logic
            const couponSection = document.getElementById('coupon-section');
            const couponContainer = document.getElementById('coupon-container');
            const appliedDisplay = document.getElementById('applied-coupon-display');
            const discountRow = document.getElementById('discount-row');
            
            if (couponSection) couponSection.style.display = 'block';
            
            let baseTotalAmount = finalTotal;

            const couponInfoContainer = document.getElementById('coupon-applied-info-container');
            const baseTotalRow = document.getElementById('cart-base-total-row');
            const finalTotalLabel = document.getElementById('cart-final-total-label');
            const cartBaseTotalAmount = document.getElementById('cart-base-total-amount');

            if (appliedCoupon) {
                discountAmount = Math.min((baseTotalAmount * appliedCoupon.discountPercent) / 100, appliedCoupon.maxDiscount);
                discountAmount = Math.round(discountAmount);
                finalTotal -= discountAmount;
                if (finalTotal < 0) finalTotal = 0;
                
                if (couponContainer) couponContainer.style.display = 'none';
                if (appliedDisplay) {
                    appliedDisplay.style.display = 'flex';
                    document.getElementById('applied-code-text').textContent = appliedCoupon.code;
                    document.getElementById('applied-discount-text').textContent = `${appliedCoupon.discountPercent}% OFF (Upto ₹${appliedCoupon.maxDiscount})`;
                }
                
                if (couponInfoContainer) {
                    couponInfoContainer.style.display = 'block';
                    document.getElementById('cart-coupon-code-text').textContent = appliedCoupon.code;
                    document.getElementById('cart-discount-amount').textContent = `-₹${discountAmount}`;
                }
                
                if (baseTotalRow) baseTotalRow.style.display = 'flex';
                if (cartBaseTotalAmount) cartBaseTotalAmount.textContent = `₹${baseTotalAmount}`;
                if (finalTotalLabel) finalTotalLabel.textContent = 'Final Total:';
                
            } else {
                discountAmount = 0;
                if (couponContainer) couponContainer.style.display = 'block';
                if (appliedDisplay) appliedDisplay.style.display = 'none';
                
                if (couponInfoContainer) couponInfoContainer.style.display = 'none';
                if (baseTotalRow) baseTotalRow.style.display = 'none';
                if (finalTotalLabel) finalTotalLabel.textContent = 'Total:';
            }

            if (subtotalEl && deliveryEl) {
                subtotalEl.textContent = `₹${subtotalAmount}`;
                deliveryEl.innerHTML = `<span>${deliveryText}</span>${noteHtml}`;
            }
            
            totalEl.textContent = `₹${finalTotal}`;
            
            summary.style.display = 'block';
        }
    }

    function setupCartDrawer() {
        if (document.getElementById('cart-drawer')) return;
        
        const drawerHTML = `
            <div id="cart-drawer" class="cart-drawer">
                <div id="cart-overlay" class="cart-overlay"></div>
                <div class="cart-panel">
                    <div class="cart-header">
                        <h2><i class="fas fa-shopping-bag"></i> Your Cart</h2>
                        <button id="close-cart-btn" class="close-btn">&times;</button>
                    </div>
                    <div class="cart-body" id="cart-drawer-body">
                        <div id="cart-items-container" class="cart-items">
                            <div class="empty-cart">Your cart is empty</div>
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
                            <div id="applied-coupon-display" style="display: none; justify-content: space-between; margin-bottom: 5px; color: #28a745; background: #e8f5e9; padding: 10px; border-radius: 8px; align-items: center;">
                                 <div>
                                     <div style="font-weight: bold;"><i class="fas fa-tag"></i> <span id="applied-code-text"></span> Applied</div>
                                     <div style="font-size: 0.85rem;" id="applied-discount-text"></div>
                                 </div>
                                 <button id="remove-coupon-btn" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem;"><i class="fas fa-times"></i></button>
                            </div>
                        </div>

                        <div class="cart-summary" id="cart-summary" style="display: none;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary);">
                                <span>Subtotal:</span>
                                <span id="cart-subtotal-amount">₹0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: var(--text-secondary); border-bottom: 1px dashed #ddd; padding-bottom: 15px;" id="cart-delivery-row">
                                <span>Delivery:</span>
                                <div id="cart-delivery-amount" style="display: flex; flex-direction: column; align-items: flex-end;">Not calculated</div>
                            </div>
                            <div id="cart-base-total-row" style="display: none; justify-content: space-between; margin-bottom: 15px; font-weight: bold; border-bottom: 1px dashed #ddd; padding-bottom: 15px;">
                                <span>Total:</span>
                                <span id="cart-base-total-amount">₹0</span>
                            </div>
                            <div id="coupon-applied-info-container" style="display: none; margin-bottom: 15px; color: #28a745; font-weight: bold; border-bottom: 1px dashed #ddd; padding-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                     <span>Coupon Applied:</span>
                                     <span id="cart-coupon-code-text"></span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                     <span>Discount:</span>
                                     <span id="cart-discount-amount">-₹0</span>
                                </div>
                            </div>
                            <div class="cart-total-row">
                                <span id="cart-final-total-label">Total:</span>
                                <span id="cart-total-amount">₹0</span>
                            </div>
                            
                            <div class="order-type-selection mt-3" style="margin-bottom: 20px;">
                                <label style="display:block; font-weight:bold; margin-bottom:10px;">Select Order Type:</label>
                                <div style="display:flex; gap:10px;">
                                    <label style="flex:1; background:#f8f9fa; padding:10px; border-radius:8px; border:1px solid #ddd; text-align:center; cursor:pointer;" class="order-type-label">
                                        <input type="radio" name="orderType" id="order-type-delivery" value="delivery" checked style="margin-right:5px;"> Delivery
                                    </label>
                                    <label style="flex:1; background:#f8f9fa; padding:10px; border-radius:8px; border:1px solid #ddd; text-align:center; cursor:pointer;" class="order-type-label">
                                        <input type="radio" name="orderType" id="order-type-takeaway" value="takeaway" style="margin-right:5px;"> Takeaway
                                    </label>
                                </div>
                            </div>

                            <div class="customer-details form-group mt-3">
                                <input type="text" id="cust-name" placeholder="Your Name" required class="form-control mb-2">
                                <input type="tel" id="cust-phone" placeholder="Phone Number" required class="form-control mb-2">
                                <textarea id="cust-address" placeholder="Delivery Address" required class="form-control mb-2" rows="2"></textarea>
                            </div>
                            
                            <button id="checkout-btn" class="btn btn-primary btn-block mt-3">
                                <i class="fas fa-check-circle"></i> Place Order
                            </button>
                            <button id="clear-cart-btn" class="btn btn-outline btn-block mt-2">Clear Cart</button>
                        </div>
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
        
        // Coupon Handlers
        document.getElementById('apply-coupon-btn')?.addEventListener('click', () => {
            const codeInput = document.getElementById('coupon-input');
            const code = codeInput.value.trim().toUpperCase();
            if (!code) return;
            
            const msgEl = document.getElementById('coupon-message');
            msgEl.textContent = 'Applying...';
            msgEl.style.color = 'var(--text-secondary)';
            
            fetch('/data/coupons.json')
                .then(res => {
                    if (!res.ok) throw new Error("Network error");
                    return res.json();
                })
                .then(data => {
                    availableCoupons = data; // store globally for reference
                    const coupon = data.find(c => c.code === code && c.active === true);
                    
                    if (!coupon) {
                        msgEl.textContent = 'Invalid Coupon Code';
                        msgEl.style.color = '#dc3545';
                        return;
                    }
                    
                    appliedCoupon = coupon;
                    codeInput.value = '';
                    msgEl.textContent = '';
                    updateCartUI();
                })
                .catch(err => {
                    console.error('Error applying coupon:', err);
                    msgEl.textContent = 'Invalid Coupon Code';
                    msgEl.style.color = '#dc3545';
                });
        });
        
        document.getElementById('remove-coupon-btn')?.addEventListener('click', () => {
            appliedCoupon = null;
            discountAmount = 0;
            const msgEl = document.getElementById('coupon-message');
            if (msgEl) msgEl.textContent = '';
            updateCartUI();
        });
        
        // View All Coupons Modal Logic
        const couponsModal = document.getElementById('coupons-modal');
        document.getElementById('view-all-coupons-btn')?.addEventListener('click', () => {
            if (!couponsModal) return;
            const container = document.getElementById('all-coupons-container');
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">Loading coupons...</p>';
            couponsModal.classList.add('show');
            
            fetch('data/coupons.json')
                .then(res => res.json())
                .then(data => {
                    availableCoupons = data;
                    container.innerHTML = '';
                    
                    const activeCoupons = data.filter(c => c.active === true);
                    
                    if (activeCoupons.length === 0) {
                        container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">No coupons available</p>';
                    } else {
                        activeCoupons.forEach(coupon => {
                            const btnHtml = `<button class="btn btn-primary apply-modal-coupon-btn" data-code="${coupon.code}" style="padding: 5px 15px; font-size:0.85rem;">Apply</button>`;
                                
                            const html = `
                                <div style="border: 1px dashed #c8e6c9; background: #e8f5e9; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">${coupon.code}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem;">${coupon.discountPercent}% OFF (Upto ₹${coupon.maxDiscount})</div>
                                    </div>
                                    <div>
                                        ${btnHtml}
                                    </div>
                                </div>
                            `;
                            container.insertAdjacentHTML('beforeend', html);
                        });
                        
                        document.querySelectorAll('.apply-modal-coupon-btn').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const code = e.target.getAttribute('data-code');
                                const coupon = activeCoupons.find(c => c.code === code);
                                if (!coupon) return;
                                
                                // Apply
                                appliedCoupon = coupon;
                                const msgEl = document.getElementById('coupon-message');
                                if (msgEl) msgEl.textContent = '';
                                document.getElementById('coupon-input').value = '';
                                updateCartUI();
                                couponsModal.classList.remove('show');
                            });
                        });
                    }
                })
                .catch(err => {
                    console.error('Error fetching coupons:', err);
                    container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">No coupons available</p>';
                });
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
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if(confirm('Are you sure you want to clear your cart?')) {
                    cart = [];
                    saveCart();
                    updateCartUI();
                }
            });
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
                
                // Clear cart on success to give fresh UX
                cart = [];
                saveCart();
                updateCartUI();
                
                alert('Order received. Please call to confirm.');
            });
            
            document.getElementById('btn-scr-no')?.addEventListener('click', () => {
                document.getElementById('screenshot-modal').classList.remove('show');
                
                localStorage.setItem('paymentSharedPending', 'true');
                const message = 'Hi, I will share the payment screenshot for order confirmation.';
                const phoneTarget = '916370680744';
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${phoneTarget}?text=${encodedMessage}`;
                window.open(whatsappUrl, '_blank');
            });
            
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    if (localStorage.getItem('paymentSharedPending') === 'true') {
                        localStorage.removeItem('paymentSharedPending');
                        document.getElementById('screenshot-modal').classList.add('show');
                    }
                }
            });
            
            window.addEventListener('focus', () => {
                if (localStorage.getItem('paymentSharedPending') === 'true') {
                    localStorage.removeItem('paymentSharedPending');
                    document.getElementById('screenshot-modal').classList.add('show');
                }
            });
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
                            <div id="payment-delivery-warning" style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffc107; font-size:0.85rem; font-weight:bold; display:none;"></div>
                            <button id="btn-pay-items" class="btn btn-outline btn-block mb-3 py-3" style="font-size:1.1rem;">Pay for Items Only (₹<span id="pay-items-amount">0</span>)</button>
                            <button id="btn-pay-full" class="btn btn-primary btn-block mb-2 py-3" style="font-size:1.1rem;">Pay Full (Items + Delivery) (₹<span id="pay-full-amount">0</span>)</button>
                            <button id="btn-back-step-1" class="btn btn-outline btn-block mt-4" style="border:none; text-decoration:underline;">Back</button>
                        </div>
                        
                        <div id="payment-step-3" class="payment-step" style="display: none; text-align: center;">
                            <h3 style="font-family: var(--font-heading); margin-bottom:10px;">Scan to Pay: ₹<span id="final-pay-amount">0</span></h3>
                            <div style="background:#f8f9fa; padding:15px; border-radius:12px; margin-bottom:15px;">
                                <img src="images/upi-qr.jpeg" alt="UPI QR Code" style="width: 200px; height: 200px; margin: 0 auto; border-radius:10px; box-shadow:var(--shadow-sm);">
                            </div>
                            <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; color:var(--text-primary);">UPI: manjukarmakar3-2@okaxis</p>
                            <button id="btn-copy-upi" class="btn btn-outline mb-4" style="font-size: 0.9rem; padding: 6px 20px; border-radius: 20px; display:inline-block; width:auto; border-width:2px; font-weight:600;">Copy UPI ID</button>
                            
                            <div style="background-color: #fff3cd; padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107; text-align:left;">
                                <p style="color: #856404; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">⚠️ Payment Screenshot Required</p>
                                <p style="color: #856404; font-size: 0.85rem; line-height:1.4;">Please attach your payment screenshot in WhatsApp before sending the order to confirm it.</p>
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
                address 
            } = orderData;
            
            let itemsList = '';
            cart.forEach(item => {
                const itemTotal = Number(item.price) * (Number(item.quantity) || 1);
                itemsList += `• ${item.name} ×${item.quantity || 1} — ₹${itemTotal}\n`;
            });
            itemsList = itemsList.trimEnd();

            let deliveryText = '';
            let finalTotal = subtotalAmount;

            if (!isDelivery) {
                deliveryText = 'Pickup (Takeaway)';
            } else if (deliveryStatus === 'AVAILABLE') {
                const distanceVal = Math.round(deliveryCharge / 30);
                deliveryText = `₹${deliveryCharge} (${distanceVal} km)`;
                if (isCOD || selectedPaymentMode === 'full') {
                    finalTotal += deliveryCharge;
                }
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

            msg += `👋 Hello Littiwale!\n\n`;
            msg += `🛒 Order Details:\n`;
            msg += `${itemsList}\n\n`;
            msg += `-----------------------\n\n`;
            msg += `💰 Bill Summary:\n`;
            msg += `Subtotal: ₹${subtotalAmount}\n`;
            if (appliedCoupon) {
                msg += `Discount: -₹${discountAmount}\n`;
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
            msg += `Address: ${address}\n\n`;
            msg += `-----------------------`;

            if (!isCOD) {
                msg += `\n\n📸 Please attach payment screenshot for confirmation.`;
            }

            return msg;
        };

        function sendWhatsAppMessage() {
            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const address = document.getElementById('cust-address').value.trim();
            
            let subtotalAmount = 0;
            cart.forEach(item => {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity) || 0;
                subtotalAmount += (priceNum * qtyNum);
            });

            const orderTypeDelivery = document.getElementById('order-type-delivery');
            const isDelivery = orderTypeDelivery ? orderTypeDelivery.checked : true;

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
                address
            });
            
            const phoneTarget = '916370680744';
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = 'https://wa.me/' + phoneTarget + '?text=' + encodedMessage;
            
            if (!isCOD) {
                localStorage.setItem('paymentSharedPending', 'true');
            }
            
            window.open(whatsappUrl, '_blank');
            paymentModal.classList.remove('show');
            cartDrawer.classList.remove('open');
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.length === 0) return;
                const name = document.getElementById('cust-name').value.trim();
                const phoneInput = document.getElementById('cust-phone');
                const phone = phoneInput.value.trim();
                const address = document.getElementById('cust-address').value.trim();
                
                if (!name || !phone || !address) {
                    alert('Please fill in your Name, Phone, and Address for delivery.');
                    return;
                }
                
                const phoneRegex = /^(\+91\d{10}|0\d{10}|\d{10})$/;
                if (!phoneRegex.test(phone)) {
                    alert('Please enter a valid phone number');
                    phoneInput.style.borderColor = 'red';
                    phoneInput.focus();
                    return;
                } else {
                    phoneInput.style.borderColor = '';
                }
                
                const orderTypeDelivery = document.getElementById('order-type-delivery');
                const isDelivery = orderTypeDelivery ? orderTypeDelivery.checked : true;

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

                showUpsellModal();
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
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8f9fa; padding:10px 15px; border-radius:10px; border: 1px solid #ebebeb;">
                            <div style="flex:1;">
                                ${badgeHtml}
                                <h4 style="font-size:1rem; margin-bottom:2px; font-family:var(--font-heading);">${item.name}</h4>
                                <div style="color:var(--text-secondary); font-size:0.9rem;">₹${priceToUse}</div>
                            </div>
                            <button class="btn" style="border: 1px solid var(--primary-color); color:var(--primary-color); padding: 6px 15px; font-size:0.9rem;" onclick="addToCart('${idToUse}', '${nameToUse}', ${priceToUse}, '${item.image}'); document.getElementById('upsell-modal').classList.remove('show'); proceedToPaymentModal();">+ Add</button>
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
                
                // Desktop styling vs Mobile per user instruction
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    carousel.style.width = `${imageUrls.length * 100}%`;
                } else {
                    carousel.style.width = '100%';
                }

                const updateCarousel = () => {
                    const isMobileNow = window.innerWidth <= 768;
                    if (isMobileNow) {
                        // When track is N*100%, 1 slide is 100% / N. 
                        carousel.style.transform = `translateX(-${currentIndex * (100 / imageUrls.length)}%)`;
                    } else {
                        // Desktop uses width 100% 
                        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                    }
                    
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
                carousel.addEventListener('touchstart', e => {
                    touchStartX = e.changedTouches[0].screenX;
                    clearInterval(autoSlideInterval);
                }, {passive: true});
                
                carousel.addEventListener('touchend', e => {
                    touchEndX = e.changedTouches[0].screenX;
                    if (touchEndX < touchStartX - 50) nextSlide();
                    if (touchEndX > touchStartX + 50) prevSlide();
                    startInterval();
                }, {passive: true});
            }
        }
    }

    initAnnouncementCarousel();

    // Initialize the cart globally
    setupCartDrawer();
    initCart();
});
