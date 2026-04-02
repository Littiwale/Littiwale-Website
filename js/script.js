// Litti Wale - Final Strict JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // ==== UI Elements ====
    const offerContainer = document.getElementById('offerContainer');
    const announcementSection = document.getElementById('announcement');
    const featuredGrid = document.getElementById('featured-dishes-grid');
    
    // Menu Page Elements
    const menuContent = document.getElementById('menu-content');
    const categoryNav = document.getElementById('category-nav');
    const filterOptions = document.getElementById('filter-options');

    // Shared Cart Elements
    const cartBtns = document.querySelectorAll('.nav-cart-btn, .cart-fab');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const checkoutSection = document.getElementById('checkout-section');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const cartCounters = document.querySelectorAll('.cart-counter, .cart-counter-bubble');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutForm = document.getElementById('checkout-form');
    const toastContainer = document.getElementById('toast-container');

    // State Variables
    let menuData = [];
    let cart = [];
    let currentFilter = 'All'; 

    const categoryOrder = [
        "Star Specials", "Soup", "Mega Combos", "Mini Combos", "Sandwiches", 
        "Noodles & Rice", "Starters", "Parathas & Naan", "Pizza", "Pasta", 
        "Maggi & Snacks", "Tandoori & Kebabs", "Main Course", "Thali", "Pre Order Specials"
    ];

    // ==== INIT ====
    init();

    async function init() {
        loadCart();
        updateCartUI();
        setupCartEvents();
        setupCheckoutForm();
        await fetchMenu();
        
        if (featuredGrid) renderFeatured();
        if (menuContent) {
            renderFullMenu();
            setupFilters();
        }
    }




    // ==== DATA FETCHING ====
    async function fetchMenu() {
        try {
            const response = await fetch('data/menu.json');
            menuData = await response.json();
        } catch (error) {
            console.error('Failed to load menu data:', error);
            if(featuredGrid) featuredGrid.innerHTML = '<p>Failed to load menu.</p>';
        }
    }

    // ==== JS IMAGE PATH GENERATOR ====
    function generateImagePath(dishName) {
        const formattedName = dishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `images/menu/${formattedName}.jpg`;
    }

    // ==== INDEX.HTML LOGIC ====
    function renderFeatured() {
        if (!featuredGrid) return;
        featuredGrid.innerHTML = '';
        
        const requestedNames = [
            "Litti Chokha", "Paneer Pizza", "Chicken Noodles",
            "Veg Thali", "Paneer Butter Masala", "Chicken Fried Rice"
        ];
        
        let featured = menuData.filter(item => requestedNames.includes(item.name));
        if (featured.length < 6) {
           const others = menuData.filter(item => !requestedNames.includes(item.name)).slice(0, 6 - featured.length);
           featured = [...featured, ...others];
        }

        featured.forEach(item => {
            featuredGrid.appendChild(createMenuCard(item));
        });
    }

    // ==== MENU.HTML LOGIC ====
    function setupFilters() {
        if (!filterOptions) return;
        
        filterOptions.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                Array.from(filterOptions.children).forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.getAttribute('data-filter');
                renderFullMenu();
            }
        });
    }

    function renderFullMenu() {
        if (!menuContent || !categoryNav) return;
        
        menuContent.innerHTML = '';
        categoryNav.innerHTML = '';
        
        const vegItems = [];
        const nonVegItems = [];
        
        menuData.forEach(item => {
            const isNv = /chicken|egg|mutton|fish/i.test(item.name);
            
            let passesFilter = false;
            if (currentFilter === 'All') passesFilter = true;
            else if (item.category && item.category.includes('Combo') && currentFilter === 'Combos') passesFilter = true;
            else if (item.badges && item.badges.includes(currentFilter)) passesFilter = true;
            else if (currentFilter === 'Non-Veg' && isNv) passesFilter = true;
            else if (currentFilter === 'Veg' && !isNv) passesFilter = true;
            
            if (passesFilter) {
                if (isNv) nonVegItems.push(item);
                else vegItems.push(item);
            }
        });

        const sectionsToRender = [
            { id: "cat-veg", title: "🟢 Veg Items", items: vegItems },
            { id: "cat-nonveg", title: "🔴 Non-Veg Items", items: nonVegItems }
        ];

        sectionsToRender.forEach(sec => {
            if (sec.items.length === 0) return;

            const li = document.createElement('li');
            li.innerHTML = `<a href="#${sec.id}">${sec.title}</a>`;
            categoryNav.appendChild(li);

            const section = document.createElement('div');
            section.className = 'menu-category-section';
            section.id = sec.id;
            section.innerHTML = `<h2 class="category-heading">${sec.title}</h2>`;
            
            const grid = document.createElement('div');
            grid.className = 'food-grid';
            
            sec.items.forEach(item => {
                grid.appendChild(createMenuCard(item));
            });

            section.appendChild(grid);
            menuContent.appendChild(section);
        });

        setupScrollSpy();
    }

    // MENU CARD TEMPLATE
    function createMenuCard(item) {
        const card = document.createElement('div');
        card.className = 'food-card no-image';
        
        const isNv = /chicken|egg|mutton|fish/i.test(item.name);
        const labelHtml = isNv 
            ? '<span class="cart-badge badge-nonveg">🔴 Non-Veg</span>' 
            : '<span class="cart-badge badge-veg">🟢 Veg</span>';

        card.innerHTML = `
            <div class="food-info">
                <div class="food-label-wrap" style="margin-bottom: 0.75rem;">
                    ${labelHtml}
                </div>
                <h3>${item.name}</h3>
                <div class="food-price">₹${item.price}</div>
                <div class="add-btn-wrapper">
                    <button class="btn btn-add z-add-btn" data-id="${item.id}">Add to Cart</button>
                </div>
            </div>
        `;

        const addBtn = card.querySelector('.z-add-btn');
        addBtn.addEventListener('click', (e) => {
            addToCart(item.id);
            addBtn.innerHTML = 'Added ✓';
            addBtn.classList.add('added');
            setTimeout(() => {
                addBtn.innerHTML = 'Add to Cart';
                addBtn.classList.remove('added');
            }, 1000);
        });

        return card;
    }

    // ==== CART LOGIC ====
    function loadCart() {
        const saved = localStorage.getItem('littiWaleCart');
        if (saved) {
            try { cart = JSON.parse(saved); } catch(e) { cart = []; }
        }
    }

    function saveCart() {
        localStorage.setItem('littiWaleCart', JSON.stringify(cart));
        updateCartUI();
    }

    function addToCart(id) {
        let item = menuData.find(i => i.id === id);
        if(!item) return;

        let existing = cart.find(c => c.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        saveCart();
        if (!toast.isActive(TOAST_ID)) {
            toast.success('Item added to cart!', {
                toastId: TOAST_ID,
                autoClose: toast.isMobile ? 1200 : 1500,
                hideProgressBar: true,
                pauseOnHover: false,
                closeOnClick: true
            });
        }
    }

    function updateCartItem(id, change) {
        let item = cart.find(c => c.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(c => c.id !== id);
            }
            saveCart();
        }
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounters.forEach(counter => counter.textContent = totalItems);

        if (!cartItemsContainer || !checkoutSection || !emptyCartMsg) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            checkoutSection.style.display = 'none';
            emptyCartMsg.style.display = 'block';
            cartDrawer.classList.remove('has-items');
        } else {
            emptyCartMsg.style.display = 'none';
            checkoutSection.style.display = 'block';
            cartDrawer.classList.add('has-items');

            let subtotal = 0;
            cartItemsContainer.innerHTML = cart.map(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                return `
                    <div class="cart-item-row">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-controls z-controls">
                            <button class="z-qty-btn minus" data-id="${item.id}">-</button>
                            <span class="z-qty">${item.quantity}</span>
                            <button class="z-qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <div class="cart-item-price">₹${itemTotal}</div>
                    </div>
                `;
            }).join('');

            if(cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal}`;
            if(cartTotalEl) cartTotalEl.textContent = `₹${subtotal}`;
        }

        document.querySelectorAll('.z-qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => updateCartItem(e.target.dataset.id, -1));
        });
        document.querySelectorAll('.z-qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => updateCartItem(e.target.dataset.id, 1));
        });
    }

    function toggleCart() {
        if(cartDrawer) cartDrawer.classList.toggle('open');
    }

    function setupCartEvents() {
        cartBtns.forEach(btn => btn.addEventListener('click', toggleCart));
        if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
        if(cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    }

    // ==== STRICT WHATSAPP FORMAT LOGIC ====
    function setupCheckoutForm() {
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                processCheckout();
            });
        }
    }

    function processCheckout() {
        if (cart.length === 0) return;

        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const address = document.getElementById('customer-address').value.trim();

        if (!name || !phone || !address) {
            showToast('Please fill all details');
            return;
        }

        let subtotalAmount = 0;
        cart.forEach(item => {
            subtotalAmount += item.price * item.quantity;
        });

        const message = window.buildWhatsAppMessage({
            isCOD: true,
            cart,
            subtotalAmount,
            deliveryCharge: 0,
            deliveryStatus: 'UNAVAILABLE',
            isDelivery: true,
            appliedCoupon: null,
            discountAmount: 0,
            selectedPaymentMode: 'full',
            name,
            phone,
            address
        });

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/916370680744?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    }

    // ==== UTILITIES ====
    const TOAST_ID = "add-to-cart";
    const toast = {
        timeoutId: null,
        activeId: null,
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
                const toastEl = document.querySelector('.toast.show');
                if (toastEl) {
                    toastEl.classList.remove('show');
                    toastEl.classList.remove('hide-toast');
                    setTimeout(() => toastEl.remove(), 300);
                }
                this.activeId = null;
                this.log("dismiss", "success", id ? `ID: ${id}` : "");
            } catch (error) {
                this.log("dismiss", "failed", error.message);
            }
        },

        success(message, config = {}) {
            try {
                const toastId = config.toastId || null;
                const duration = this.isMobile ? (config.autoClose || 1300) : (config.autoClose || 1500);

                if (this.isMobile) {
                    this.dismiss();
                }

                if (!toastContainer) {
                    this.log("show", "failed", "Toast container not found");
                    return;
                }

                this.log("trigger", "success", message);
                this.activeId = toastId;

                const toastEl = document.createElement('div');
                if (config.className) {
                    toastEl.classList.add(config.className);
                }
                toastEl.className = 'toast show custom-toast';
                toastEl.textContent = message;
                toastContainer.appendChild(toastEl);

                // Force visual hide after 1s (both mobile and desktop)
                setTimeout(() => {
                    if (this.activeId === toastId) {
                        toastEl.classList.add('hide-toast');
                    }
                }, 1000);

                // Safe cleanup after 1.3s
                this.timeoutId = setTimeout(() => {
                    this.dismiss();
                }, 1300);

            } catch (error) {
                this.log("show", "failed", error.message);
            }
        }
    };

    function showToast(message) {
        toast.success(message);
    }

    function setupScrollSpy() {
        const sections = document.querySelectorAll('.menu-category-section');
        const navLinks = document.querySelectorAll('.category-list a');
        
        if(sections.length === 0) return;

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });
    }
});
