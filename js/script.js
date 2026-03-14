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
        
        const grouped = {};
        
        menuData.forEach(item => {
            let passesFilter = false;
            if (currentFilter === 'All') passesFilter = true;
            else if (item.category.includes('Combo') && currentFilter === 'Combos') passesFilter = true;
            else if (item.badges && item.badges.includes(currentFilter)) passesFilter = true;
            else if (currentFilter === 'Non-Veg' && item.badges && item.badges.includes('Non-Veg')) passesFilter = true;
            
            if (passesFilter) {
                if (!grouped[item.category]) grouped[item.category] = [];
                grouped[item.category].push(item);
            }
        });

        categoryOrder.forEach(category => {
            if (!grouped[category] || grouped[category].length === 0) return;

            const categoryId = 'cat-' + category.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

            const li = document.createElement('li');
            li.innerHTML = `<a href="#${categoryId}">${category}</a>`;
            categoryNav.appendChild(li);

            const section = document.createElement('div');
            section.className = 'menu-category-section';
            section.id = categoryId;
            section.innerHTML = `<h2 class="category-heading">${category}</h2>`;
            
            const grid = document.createElement('div');
            grid.className = 'food-grid';
            
            grouped[category].forEach(item => {
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
        card.className = 'food-card';
        
        let badgesHtml = '';
        if (item.badges && item.badges.length > 0) {
            badgesHtml = item.badges.map(badge => {
                let badgeClass = 'badge-default';
                let prepend = '';
                if (badge === 'Veg') { badgeClass = 'badge-veg'; prepend = '🥬 '; }
                if (badge === 'Non-Veg') { badgeClass = 'badge-nonveg'; prepend = '🍗 '; }
                if (badge === 'Bestseller') { badgeClass = 'badge-bestseller'; prepend = '🔥 '; }
                if (badge === 'Most Ordered') { badgeClass = 'badge-mostordered'; prepend = '⭐ '; }
                if (badge === 'Spicy') { badgeClass = 'badge-spicy'; prepend = '🌶 '; }
                if (badge === 'New') { badgeClass = 'badge-new'; prepend = '🆕 '; }
                
                return `<span class="cart-badge ${badgeClass}">${prepend}${badge}</span>`;
            }).join('');
        }

        const exactImagePath = generateImagePath(item.name);

        card.innerHTML = `
            <div class="food-img-wrapper">
                <img src="${exactImagePath}" onerror="this.onerror=null; this.src='images/menu/placeholder.jpg';" alt="${item.name}" class="food-img" loading="lazy">
                <div class="food-badges">${badgesHtml}</div>
            </div>
            <div class="food-info">
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
        showToast('Item added to cart!');
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

        let message = `Hello Litti Wale 👋\n\nI want to order:\n\n`;
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            message += `${item.name} x${item.quantity} – ₹${itemTotal}\n`;
            total += itemTotal;
        });

        message += `\nTotal: ₹${total}\n\n`;
        message += `Customer Name: ${name}\n`;
        message += `Phone: ${phone}\n`;
        message += `Address: ${address}\n\n`;
        message += `Please confirm my order.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/916370680744?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    }

    // ==== UTILITIES ====
    function showToast(message) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
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
