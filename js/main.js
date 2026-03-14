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
            
            // Homepage has "bestsellers" instead of full menu
            const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
            
            if (isHomePage) {
                // Show ONLY 6 bestseller items
                const bestsellers = data.filter(item => item.bestseller === true).slice(0, 6);
                renderMenu(bestsellers);
            } else {
                renderMenu(data);
                setupFilters(data);
            }
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            if(menuGrid) {
                menuGrid.innerHTML = '<div class="error" style="grid-column: 1/-1; text-align: center; color: red;">Failed to load menu items.</div>';
            }
        });

    function renderMenu(items) {
        if (!menuGrid) return;
        
        menuGrid.innerHTML = ''; // Clear loading
        
        if (items.length === 0) {
            menuGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No items found in this category.</div>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            
            // Build the price and button logic
            let priceHtml = '';
            let btnHtml = '';
            
            if (item.half !== undefined && item.full !== undefined) {
                // Determine display price (usually ranges, but let's just show full or half)
                priceHtml = `<span class="menu-price">₹${item.half} | ₹${item.full}</span>`;
                btnHtml = `
                    <div style="display: flex; gap: 10px;">
                        <button class="add-to-cart-btn" onclick="addToCart('${item.id}_half', '${item.name} Half', ${item.half}, '${item.image}')">
                            Add Half
                        </button>
                        <button class="add-to-cart-btn" onclick="addToCart('${item.id}_full', '${item.name} Full', ${item.full}, '${item.image}')">
                            Add Full
                        </button>
                    </div>
                `;
            } else {
                priceHtml = `<span class="menu-price">₹${item.price}</span>`;
                btnHtml = `
                    <button class="add-to-cart-btn" onclick="addToCart('${item.id}', '${item.name}', ${item.price}, '${item.image}')">
                        Add to Cart
                    </button>
                `;
            }

            card.innerHTML = `
                <div class="menu-img-container">
                    <span class="menu-category">${item.category}</span>
                    <img src="${item.image}" alt="${item.name}" class="menu-img" onerror="this.src='images/menu/placeholder.jpg'; this.onerror=null;">
                </div>
                <div class="menu-details">
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
    }

    function setupFilters(items) {
        if (!categoryFilters) return;

        // Extract unique categories
        const categories = ['all', ...new Set(items.map(item => item.category))];
        
        // Keep only 'all' button initially
        categoryFilters.innerHTML = '<button class="filter-btn active" data-filter="all">All</button>';

        categories.slice(1).forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', category);
            btn.textContent = category;
            categoryFilters.appendChild(btn);
        });

        // Add filter logic
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Filter items
                const filter = e.target.getAttribute('data-filter');
                if (filter === 'all') {
                    renderMenu(menuData);
                } else {
                    const filtered = menuData.filter(item => item.category === filter);
                    renderMenu(filtered);
                }
            });
        });
    }


    // --- Cart System ---
    let cart = [];
    
    // Initialize Cart
    function initCart() {
        const storedCart = localStorage.getItem('littiWaleCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            updateCartUI();
        }
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
        
        // Show visual feedback
        alert(`${name} added to cart!`);
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
        const totalEl = document.getElementById('cart-total-amount');
        
        if (!container || !summary || !totalEl) return;

        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            summary.style.display = 'none';
        } else {
            container.innerHTML = '';
            let totalAmount = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalAmount += itemTotal;

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

            totalEl.textContent = `₹${totalAmount}`;
            summary.style.display = 'block';
        }
    }

    // Clear cart button
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

    // Checkout / WhatsApp Order Button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const address = document.getElementById('cust-address').value.trim();

            if (!name || !phone || !address) {
                alert('Please fill in your Name, Phone, and Address for delivery.');
                return;
            }

            let message = `Hello Litti Wale 👋\n\nI want to order:\n\n`;
            let total = 0;

            cart.forEach(item => {
                message += `${item.name} x${item.quantity} – ₹${item.price * item.quantity}\n`;
                total += (item.price * item.quantity);
            });

            message += `\nTotal: ₹${total}\n\n`;
            message += `*Customer Details:*\n`;
            message += `Name: ${name}\n`;
            message += `Phone: ${phone}\n`;
            message += `Address: ${address}`;

            const phoneTarget = '916370680744';
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${phoneTarget}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }

    // Initialize the cart UI on load
    initCart();
});
