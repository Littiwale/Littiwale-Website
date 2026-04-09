document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("error", (e) => console.error("Global Error:", e.message));
    
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
    let menuImageMap = {};
    const menuGrid = document.getElementById('menu-grid');
    const categoryFilters = document.getElementById('category-filters');

    function initMenu() {
        // Fetch Menu Data and Image Map
        Promise.all([
            fetch('./data/menu.json').then(res => res.json()),
            fetch('./data/imagemap.json').then(res => res.json())
        ])
        .then(([menu, map]) => {
            menuData = menu;
            menuImageMap = map;
            console.log("Menu & Map loaded:", menuData, menuImageMap);
            initMenuDisplay();
        })
        .catch(error => {
            console.error('Error loading menu/map:', error);
            if(menuGrid) {
                menuGrid.innerHTML = '<div class="error" style="grid-column: 1/-1; text-align: center; color: red;">Failed to load menu items.</div>';
            }
        });
    }

    // Helper: Normalize item name for image lookup
    function getNormalizedName(name) {
        if (!name) return "";
        return name.replace(/\(.*?\)/g, "").toLowerCase().trim();
    }

    // Helper: Get item image with fallback
    function getItemImage(name) {
        const normalized = getNormalizedName(name);
        return menuImageMap[normalized] || 'images/logo.png';
    }

    // Helper: Get Craziest Deal image (Folder based)
    function getDealImage(title) {
        if (!title) return 'images/logo.png';
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `images/menu/Craziest Deal Menu/${slug}.png`;
    }

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
        const isFullMenuPage = window.location.pathname.includes('menu.html');
        
        if (isFullMenuPage) {
            isMenuExpanded = true;
            currentFilteredData = menuData;
            if (categoryFilters) categoryFilters.style.display = 'flex';
            setupFilters(menuData);
            renderMenu(menuData);
            
            // Hide the "View Full Menu" button on the dedicated menu page
            const toggleContainer = document.getElementById('menu-toggle-container');
            if (toggleContainer) toggleContainer.style.display = 'none';
        } else {
            // Pick 6 random items for the Best Seller section
            const shuffled = [...menuData].sort(() => 0.5 - Math.random());
            
            // Filter unique by base name to avoid showing Half/Full as separate items in the 6 picks
            const uniqueBases = [];
            const pickedItems = [];
            for (const item of shuffled) {
                const base = getNormalizedName(item.name);
                if (!uniqueBases.includes(base)) {
                    uniqueBases.push(base);
                    pickedItems.push(item);
                }
                if (pickedItems.length >= 6) break;
            }
            
            renderBestSellers(pickedItems);
        }
        
        generateSmartDeals();
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
                return true;
            });
            
            if (pool.length < 10) return;

            const numDeals = Math.floor(Math.random() * 3) + 3; // 3 to 5
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
                
                const fakeMargin = Math.floor(Math.random() * 21) + 20;
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

        // Case 1: Dual Variants (Half & Full)
        if (group.variants.half && group.variants.full) {
            const half = group.variants.half;
            const full = group.variants.full;
            
            // Variants for descriptions
            const hDesc = (half.description && half.description !== 'nan' && half.description !== 'undefined') ? half.description : "";
            const fDesc = (full.description && full.description !== 'nan' && full.description !== 'undefined') ? full.description : "";
            
            // Base ID for the description container
            const baseId = group.variants.half.id.replace(/-half|_half/g, '');

            btnHtml = `
                <div class="half-full-wrapper">
                    <div class="half-full-box">
                        <div class="hf-label">Half</div>
                        <div class="hf-price">₹${half.price}</div>
                        <div class="hf-controls">
                            <button class="hf-btn minus" onclick="event.stopPropagation(); updateQuantity('${half.id}', -1)">-</button>
                            <span class="hf-value" id="hf-val-${half.id}">0</span>
                            <button class="hf-btn plus" onclick="event.stopPropagation(); addToCart('${half.id}', '${half.name.replace(/'/g, "\\'")}', ${half.price}, '${itemImg}'); if(document.getElementById('desc-${baseId}')) document.getElementById('desc-${baseId}').innerText = '${hDesc.replace(/'/g, "\\'")}';">+</button>
                        </div>
                    </div>
                    <div class="half-full-box">
                        <div class="hf-label">Full</div>
                        <div class="hf-price">₹${full.price}</div>
                        <div class="hf-controls">
                            <button class="hf-btn minus" onclick="event.stopPropagation(); updateQuantity('${full.id}', -1)">-</button>
                            <span class="hf-value" id="hf-val-${full.id}">0</span>
                            <button class="hf-btn plus" onclick="event.stopPropagation(); addToCart('${full.id}', '${full.name.replace(/'/g, "\\'")}', ${full.price}, '${itemImg}'); if(document.getElementById('desc-${baseId}')) document.getElementById('desc-${baseId}').innerText = '${fDesc.replace(/'/g, "\\'")}';">+</button>
                        </div>
                    </div>
                </div>
            `;
        } 
        // Case 2: Standard Single Item
        else {
            const item = group.variants.standard || group.variants.half || group.variants.full;
            btnHtml = `
                <div id="menu-btn-container-${item.id}" style="width:100%;">
                    <button id="menu-add-btn-${item.id}" class="add-to-cart-btn add-to-cart" onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${itemImg}')">Add to Cart — ₹${item.price}</button>
                    <div id="menu-qty-ctrl-${item.id}" style="display:none; align-items:center; justify-content:space-between; background:transparent; border: 1px solid #facc15; border-radius:999px; padding:4px; height: 48px;">
                        <button style="background:transparent; border:none; width:40px; height:100%; font-weight:bold; color:#facc15; cursor:pointer;" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span id="menu-qty-val-${item.id}" style="font-weight:bold; color:var(--text-primary); font-size:1.1rem;">0</span>
                        <button style="background:#facc15; border:none; border-radius:999px; width:40px; height:36px; font-weight:bold; color:#0d0d0d; cursor:pointer;" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            `;
        }

        // Determine Veg/Non-Veg (heuristic based on name)
        const combinedText = (group.displayName + " " + (group.description || "")).toLowerCase();
        const isEggless = combinedText.includes("eggless");
        const hasNonVegWords = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
        const isNonVeg = !isEggless && hasNonVegWords;
        const foodTypeBadge = isNonVeg ? '<span class="food-tag non-veg">NON-VEG</span>' : '<span class="food-tag veg">VEG</span>';

        // Determine description and baseId for dynamic updates
        const hItem = group.variants.half;
        const fItem = group.variants.full;
        const halfDesc = (hItem && hItem.description && hItem.description !== 'nan' && hItem.description !== 'undefined') ? hItem.description : "";
        const fullDesc = (fItem && fItem.description && fItem.description !== 'nan' && fItem.description !== 'undefined') ? fItem.description : "";
        
        let currentDesc = halfDesc || fullDesc || group.description || "";
        if (currentDesc === 'nan' || currentDesc === 'undefined') currentDesc = "";
        
        const baseId = (group.variants.half || group.variants.full || group.variants.standard).id.replace(/-half|_half|-full|_full/g, '');

        card.innerHTML = `
            <div class="menu-img-container image-wrapper">
                <img src="${itemImg}" class="menu-img" loading="lazy" onerror="this.src='images/logo.png'">
            </div>
            <div class="menu-details menu-card-content">
                <div>${foodTypeBadge}</div>
                <div class="menu-title-row">
                    <h3 class="menu-title menu-card-title">${group.displayName}</h3>
                </div>
                <p class="menu-desc" id="desc-${baseId}">${currentDesc}</p>
                <div class="button-wrapper">
                    ${btnHtml}
                </div>
            </div>
        `;
        return card;
    }

    function renderBestSellers(items) {
        const grid = document.getElementById('best-seller-items');
        if (!grid) return;
        grid.innerHTML = '';

        // Process items into Half/Full groups
        const baseGroups = {};
        items.forEach(item => {
            const baseName = getNormalizedName(item.name);
            const category = item.category || 'Other';
            const groupKey = `${category}_${baseName}`;

            if (!baseGroups[groupKey]) {
                let displayName = item.name.replace(/\((Half|Full|half|full)\)/g, "").trim();
                baseGroups[groupKey] = {
                    name: baseName,
                    displayName: displayName,
                    category: category,
                    description: item.description,
                    image: getItemImage(item.name),
                    variants: {}
                };
            }

            const lowerName = item.name.toLowerCase();
            if (lowerName.includes('(half)')) {
                baseGroups[groupKey].variants.half = item;
                // Capture Half description specifically if it exists
                if (item.description && item.description !== 'nan' && item.description !== 'undefined') {
                    baseGroups[groupKey].halfDesc = item.description;
                }
            } else if (lowerName.includes('(full)')) {
                baseGroups[groupKey].variants.full = item;
                // Capture Full description specifically if it exists
                if (item.description && item.description !== 'nan' && item.description !== 'undefined') {
                    baseGroups[groupKey].fullDesc = item.description;
                }
            } else {
                baseGroups[groupKey].variants.standard = item;
            }
        });

        // Render first 6 groups
        Object.values(baseGroups).slice(0, 6).forEach(group => {
            grid.appendChild(createMenuCard(group));
        });

        if (typeof syncMenuWithCart === 'function') syncMenuWithCart();
    }

    function renderMenu(items) {
        if (!menuGrid) return;
        menuGrid.innerHTML = '';
        
        let displayItems = items;

        if (currentDietaryFilter !== 'all') {
            displayItems = displayItems.filter(item => {
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

        // --- NEW: Grouping Logic (Half/Full) ---
        const baseGroups = {};
        displayItems.forEach(item => {
            const baseName = getNormalizedName(item.name);
            const category = item.category || 'Other';
            const groupKey = `${category}_${baseName}`;

            if (!baseGroups[groupKey]) {
                // Determine original display name (strip (Half)/(Full) but keep case)
                let displayName = item.name.replace(/\((Half|Full|half|full)\)/g, "").trim();

                baseGroups[groupKey] = {
                    name: baseName, // for lookup
                    displayName: displayName, // for UI display
                    category: category,
                    description: item.description,
                    image: getItemImage(item.name),
                    variants: {} // { half: item, full: item, standard: item }
                };
            }

            const lowerName = item.name.toLowerCase();
            if (lowerName.includes('(half)')) {
                baseGroups[groupKey].variants.half = item;
                if (item.description && item.description !== 'nan' && item.description !== 'undefined') {
                    baseGroups[groupKey].halfDesc = item.description;
                }
            } else if (lowerName.includes('(full)')) {
                baseGroups[groupKey].variants.full = item;
                if (item.description && item.description !== 'nan' && item.description !== 'undefined') {
                    baseGroups[groupKey].fullDesc = item.description;
                }
            } else {
                baseGroups[groupKey].variants.standard = item;
            }
        });

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
                        if (filterVal !== 'all' && 'cat-' + filterVal.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() === id) {
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
    const RESTAURANT_LAT = 22.1152751;
    const RESTAURANT_LNG = 85.3871145;

    // --- IPL Dynamic Coupon Logic ---
    function generateIPLCoupons() {
        if (typeof matches === 'undefined') return [];
        const today = new Date().toISOString().split('T')[0];
        const todayMatch = matches.find(m => m.date === today);
        if (!todayMatch || !todayMatch.games) return [];

        let iplCoupons = [];
        let teamCounter = 0;
        todayMatch.games.forEach(game => {
            [game.team1, game.team2].forEach(team => {
                const code = team.toUpperCase() + "20";
                // Alternating logic: even index gets 20% OFF, odd gets Free Pepsi
                if (teamCounter % 2 === 0) {
                    iplCoupons.push({
                        code: code,
                        type: "DISCOUNT",
                        discount: 20,
                        maxDiscount: 30,
                        minOrder: 500,
                        active: true
                    });
                } else {
                    iplCoupons.push({
                        code: code,
                        type: "PEPSI",
                        discount: 0,
                        maxDiscount: 0,
                        minOrder: 300,
                        active: true
                    });
                }
                teamCounter++;
            });
        });
        return iplCoupons;
    }

    function getMergedCoupons(staticCoupons) {
        const iplCoupons = generateIPLCoupons();
        const merged = [...staticCoupons];
        iplCoupons.forEach(ipl => {
            // Static coupons (coupon.json) take priority; don't overwrite if code exists
            if (!merged.find(c => c.code === ipl.code)) {
                merged.push(ipl);
            }
        });
        return merged;
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
                // If ID is provided, ONLY dismiss if it matches activeId
                if (id && this.activeId !== id) return;

                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                    this.timeoutId = null;
                }
                const toastEl = document.getElementById('cart-toast');
                if (toastEl) {
                    toastEl.classList.remove('show');
                    toastEl.classList.remove('hide-toast'); // Ensure it's visible for next time
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
                    this.dismiss(); // Force clear before show
                }

                const toastEl = document.getElementById('cart-toast');
                if (!toastEl) {
                    this.log("show", "failed", "Toast element not found");
                    return;
                }

                this.log("trigger", "success", message);
                this.activeId = toastId;

                toastEl.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
                toastEl.classList.add('show');
                if (config.className) {
                    toastEl.classList.add(config.className);
                }
                toastEl.classList.add('custom-toast');

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

    // Backward compatibility wrapper
    function showToast(message) {
        toast.success(message);
    }

    // Initialize Cart
    function initCart() {
        const storedCart = localStorage.getItem('littiWaleCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        
        // Fetch coupons to validate stored coupon state
        fetch('data/coupon.json')
            .then(res => res.json())
            .then(data => {
                availableCoupons = getMergedCoupons(data);
                if (appliedCoupon) {
                    const stillValid = availableCoupons.find(c => c.code === appliedCoupon.code && c.active === true);
                    // Edge case: Clear if invalid or cart is empty
                    if (!stillValid || cart.length === 0) {
                        appliedCoupon = null;
                        discountAmount = 0;
                        localStorage.removeItem('littiWaleAppliedCoupon');
                        localStorage.removeItem('littiWaleDiscountAmount');
                    }
                }
                updateCartUI();
            })
            .catch(err => {
                console.error("Error validating coupons:", err);
                updateCartUI();
            });
            
        // Fetch location details exclusively for Delivery Calculation
        getUserLocation();
    }

    // Global add to cart function accessible from inline HTML onclick
    window.addToCart = function(id, name, price, image, selectedOption = null) {
        if (!selectedOption) {
            const baseId = id.replace('_half', '').replace('_full', '');
            const menuItem = menuData.find(i => i.id === baseId);
            
            if (menuItem && menuItem.options && menuItem.options.length > 0) {
                const optionsModal = document.getElementById('options-modal');
                const optionsNameEl = document.getElementById('options-item-name');
                const container = document.getElementById('options-container');
                
                if (optionsModal && container && optionsNameEl) {
                    optionsNameEl.textContent = name;
                    container.innerHTML = '';
                    
                    menuItem.options.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.className = 'btn btn-outline btn-block py-3';
                        btn.textContent = opt;
                        btn.style.fontSize = '1.1rem';
                        btn.onclick = () => {
                            optionsModal.classList.remove('show');
                            const added = window.addToCart(id, name, price, image, opt);
                            // If this was triggered from upsell modal logic, cartDrawer is open but we might need to proceed
                            // However, upsell flow uses inline onclick, which already returned false
                            // So we just add it to cart.
                        };
                        container.appendChild(btn);
                    });
                    
                    optionsModal.classList.add('show');
                    return; // Wait for user selection
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
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.remove()">
                        <div>
                            <div class="cart-item-title">${item.name}</div>
                            ${item.isCombo && item.note ? `<div style="font-size: 0.8rem; color: #f4b400; margin-bottom: 5px;">${item.note}</div>` : ''}
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

            if (appliedCoupon && appliedCoupon.type === 'PEPSI') {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div style="width: 50px; height: 50px; background: rgba(74, 222, 128, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px dashed #4ade80;">🥤</div>
                        <div>
                            <div class="cart-item-title">Pepsi ×1 — FREE 🎁</div>
                            <div class="cart-item-price" style="color: #4ade80; font-weight: bold;">₹0 (Free)</div>
                        </div>
                    </div>
                    <div class="cart-controls"></div>
                `;
                container.appendChild(cartItem);
            }


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
            } else if (deliveryStatus === 'CALCULATING') {
                deliveryText = `Calculating...`;
                noteHtml = `<div style="font-size: 0.8rem; color: var(--primary-color); margin-top: 4px; text-align: right;">Fetching location...</div>`;
            } else {
                deliveryText = `Not calculated`;
                noteHtml = `<div style="font-size: 0.8rem; color: #dc3545; margin-top: 4px; text-align: right;">*Delivery charges will be extra charged based on distance</div>`;
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
                    // Standard discount coupons
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
                    couponInfoContainer.style.display = 'block';
                    document.getElementById('cart-coupon-code-text').textContent = appliedCoupon.code;
                    if (appliedCoupon.type === 'PEPSI') {
                        document.getElementById('cart-discount-amount').textContent = `-₹${discountAmount} (Free Pepsi)`;
                    } else {
                        document.getElementById('cart-discount-amount').textContent = `-₹${discountAmount}`;
                    }
                }
                
                if (baseTotalRow) baseTotalRow.style.display = 'flex';
                if (cartBaseTotalAmount) cartBaseTotalAmount.textContent = `₹${baseTotalAmount}`;
                if (finalTotalLabel) finalTotalLabel.textContent = 'Final Total:';
                
            } else {
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
        // --- 1. Sync Standard Items (Add/Qty controls) ---
        const addBtns = document.querySelectorAll('[id^="menu-add-btn-"]');
        addBtns.forEach(btn => {
            const fullId = btn.id.replace('menu-add-btn-', '');
            const ctrl = document.getElementById(`menu-qty-ctrl-${fullId}`);
            const valSpan = document.getElementById(`menu-qty-val-${fullId}`);
            const cartItem = cart.find(item => item.id === fullId);
            
            if (cartItem) {
                btn.style.display = 'none';
                if (ctrl) ctrl.style.display = 'flex';
                if (valSpan) valSpan.textContent = cartItem.quantity;
            } else {
                btn.style.display = 'block';
                if (ctrl) ctrl.style.display = 'none';
            }
        });

        // --- 2. Sync Half/Full Variants (STRICTLY Independent quantities) ---
        document.querySelectorAll('.half-full-wrapper').forEach(wrapper => {
            const boxes = wrapper.querySelectorAll('.half-full-box');
            if (boxes.length === 2) {
                const hValSpan = boxes[0].querySelector('.hf-value');
                const fValSpan = boxes[1].querySelector('.hf-value');
                
                if (hValSpan && fValSpan) {
                    const hId = hValSpan.id.replace('hf-val-', '');
                    const fId = fValSpan.id.replace('hf-val-', '');
                    
                    // Directly fetch quantities from cart by exact ID match
                    const hQty = cart.find(i => i.id === hId)?.quantity || 0;
                    const fQty = cart.find(i => i.id === fId)?.quantity || 0;
                    
                    // Explicitly set each variant to its own quantity ONLY
                    hValSpan.textContent = hQty; 
                    fValSpan.textContent = fQty;
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
                        <h2><i class="fas fa-shopping-bag"></i> Your Cart</h2>
                        <button id="close-cart-btn" class="close-btn">&times;</button>
                    </div>
                    <div class="cart-body" id="cart-drawer-body">
                        <div id="cart-items-container" class="cart-items">
                            <div class="empty-cart">Your cart is empty</div>
                        </div>
                        
                        <div id="restaurant-note-section" style="display: none; margin-bottom: 15px;">
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

                        <div class="cart-summary" id="cart-summary" style="display: none;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary);">
                                <span>Subtotal:</span>
                                <span id="cart-subtotal-amount">₹0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: var(--text-secondary); border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 15px;" id="cart-delivery-row">
                                <span>Delivery:</span>
                                <div id="cart-delivery-amount" style="display: flex; flex-direction: column; align-items: flex-end;">Not calculated</div>
                            </div>
                            <div id="cart-base-total-row" style="display: none; justify-content: space-between; margin-bottom: 15px; font-weight: bold; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 15px;">
                                <span>Total:</span>
                                <span id="cart-base-total-amount">₹0</span>
                            </div>
                            <div id="coupon-applied-info-container" style="display: none; margin-bottom: 15px; color: #4ade80; font-weight: bold; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 15px;">
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
                                    <label style="flex:1; background:#1c1c1c; color:#ffffff; padding:10px; border-radius:8px; border:1px solid #444; text-align:center; cursor:pointer;" class="order-type-label">
                                        <input type="radio" name="orderType" id="order-type-delivery" value="delivery" checked style="margin-right:5px; accent-color: var(--primary-color);"> Delivery
                                    </label>
                                    <label style="flex:1; background:#1c1c1c; color:#ffffff; padding:10px; border-radius:8px; border:1px solid #444; text-align:center; cursor:pointer;" class="order-type-label">
                                        <input type="radio" name="orderType" id="order-type-takeaway" value="takeaway" style="margin-right:5px; accent-color: var(--primary-color);"> Takeaway
                                    </label>
                                </div>
                            </div>

                            <button id="checkout-btn" class="btn btn-primary btn-block mt-3" style="font-size: 1.1rem; padding: 12px; border-radius: 8px;">
                                Proceed to Checkout <i class="fas fa-arrow-right" style="margin-left: 5px;"></i>
                            </button>
                            <button id="clear-cart-btn" class="btn btn-outline btn-block mt-2">Clear Cart</button>
                        </div>
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
        document.getElementById('apply-coupon-btn')?.addEventListener('click', () => {
            const codeInput = document.getElementById('coupon-input');
            const code = codeInput.value.trim().toUpperCase();
            if (!code) return;
            
            const msgEl = document.getElementById('coupon-message');
            msgEl.textContent = 'Applying...';
            msgEl.style.color = 'var(--text-secondary)';
            
            console.log("Applying coupon code:", code);
            
            fetch('data/coupon.json')
                .then(res => {
                    if (!res.ok) throw new Error("Could not load coupon data");
                    return res.json();
                })
                .then(data => {
                    console.log("Coupons loaded for validation:", data);
                    availableCoupons = getMergedCoupons(data);
                    const coupon = availableCoupons.find(c => c.code === code && c.active === true);
                    
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
                    console.log("Coupon applied successfully:", coupon);
                    
                    // Persist coupon state
                    localStorage.setItem('littiWaleAppliedCoupon', JSON.stringify(coupon));
                    // We'll update the discountAmount in localStorage after updateCartUI recalculates it
                    
                    codeInput.value = '';
                    msgEl.textContent = 'Applied!';
                    msgEl.style.color = '#4ade80';
                    updateCartUI();
                    localStorage.setItem('littiWaleDiscountAmount', discountAmount);
                })
                .catch(err => {
                    console.error('Error applying coupon:', err);
                    msgEl.textContent = 'System Error: Try again';
                    msgEl.style.color = '#dc3545';
                });
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
        
        // View All Coupons Modal Logic
        const couponsModal = document.getElementById('coupons-modal');
        document.getElementById('view-all-coupons-btn')?.addEventListener('click', () => {
            if (!couponsModal) return;
            const container = document.getElementById('all-coupons-container');
            container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">Loading coupons...</p>';
            couponsModal.classList.add('show');
            
            console.log("Fetching all coupons for modal...");
            fetch('data/coupon.json')
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch coupons");
                    return res.json();
                })
                .then(data => {
                    console.log("Coupons fetched successfully for modal:", data);
                    availableCoupons = getMergedCoupons(data);
                    container.innerHTML = '';
                    
                    const activeCoupons = availableCoupons.filter(c => c.active === true);
                    
                    if (activeCoupons.length === 0) {
                        console.warn("No active coupons found in JSON");
                        container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">No coupons available currently</p>';
                    } else {
                        activeCoupons.forEach(coupon => {
                            const btnHtml = `<button class="btn btn-primary select-modal-coupon-btn" data-code="${coupon.code}" style="padding: 5px 15px; font-size:0.85rem;">Select</button>`;
                                
                            const html = `
                                <div style="border: 1px dashed var(--primary-color); background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px; color: var(--primary-color);">${coupon.code}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem;">
                                            ${coupon.type === 'PEPSI' ? 'Free Pepsi on this order' : `${coupon.discount}% OFF (Upto ₹${coupon.maxDiscount})`}
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
                })
                .catch(err => {
                    console.error('Error fetching modal coupons:', err);
                    container.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">Error loading coupons. Please try manual entry.</p>';
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
        const clearBtnGlobal = document.getElementById('clear-cart-global');
        
        const handleClearCart = () => {
            if(confirm('Are you sure you want to clear your cart?')) {
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
                
                // Execute original confirmation logic
                cart = [];
                restaurantNote = '';
                if (typeof updateNoteUI === 'function') updateNoteUI();
                saveCart();
                updateCartUI();
                
                alert('Order received!\n\nPlease confirm your payment status.\n\n* If your payment is still pending, contact the restaurant.\n* If the restaurant has confirmed your payment in WhatsApp, your order is successfully placed.');
                
                // Sync checkout page if applicable
                if (window.location.pathname.includes('checkout.html')) {
                    location.reload();
                }
            });
            
            document.getElementById('btn-verify-no')?.addEventListener('click', () => {
                alert('Please confirm your payment first');
                document.getElementById('restaurant-verify-modal').classList.remove('show');
                
                // Loop back to screenshot modal
                if (typeof window.openScreenshotModal === 'function') {
                    window.openScreenshotModal();
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
                const distanceVal = Math.round(deliveryCharge / 30);
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

            msg += `👋 Hello Littiwale!\n\n`;
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

        function sendWhatsAppMessage() {
            const getVal = (id1, id2) => {
                const el1 = document.getElementById(id1);
                const el2 = document.getElementById(id2);
                if (el1 && el1.value.trim()) return el1.value.trim();
                if (el2 && el2.value.trim()) return el2.value.trim();
                return '';
            };
            
            const name = getVal('checkout-name', 'cust-name');
            const phone = getVal('checkout-phone', 'cust-phone');
            const address = getVal('checkout-address', 'cust-address');
            
            let subtotalAmount = 0;
            cart.forEach(item => {
                const priceNum = Number(item.price) || 0;
                const qtyNum = Number(item.quantity) || 0;
                subtotalAmount += (priceNum * qtyNum);
            });

            const orderTypeDel1 = document.getElementById('checkout-type-delivery');
            const orderTypeDel2 = document.getElementById('order-type-delivery');
            let isDelivery = true;
            if (orderTypeDel1 && orderTypeDel1.checked !== undefined) {
                isDelivery = orderTypeDel1.checked;
            } else if (orderTypeDel2 && orderTypeDel2.checked !== undefined) {
                isDelivery = orderTypeDel2.checked;
            }

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
            
            window.open(whatsappUrl, '_blank');
            paymentModal.classList.remove('show');
            cartDrawer.classList.remove('open');
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
                alert('Please fill in your Name and Phone.');
                return;
            }
            if (isDelivery && !address) {
                alert('Please provide a delivery address.');
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
                const deliveryRadio = document.getElementById('order-type-delivery');
                if (deliveryRadio) {
                    localStorage.setItem('littiWaleOrderType', deliveryRadio.checked ? 'delivery' : 'takeaway');
                }
                window.location.href = 'checkout.html';
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
                    alert('Please fill in your Name and Phone.');
                    return;
                }
                if (isDelivery && !address) {
                    alert('Please provide a delivery address.');
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
                        deliveryCharge = roundedKm * 30;
                        deliveryStatus = 'AVAILABLE';
                        updateCartUI();
                    }, error => {
                        alert("Could not get location. Ensure GPS is enabled.");
                        btnGps.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use Current Location (Optional)';
                        deliveryStatus = 'UNKNOWN';
                        deliveryCharge = 0;
                        updateCartUI();
                    });
                } else {
                    alert('Geolocation is not supported by your browser.');
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

    try { initMenu(); } catch(e) { console.error("Menu failed", e); }
    try { initAnnouncementCarousel(); } catch(e) { console.error("Slider failed", e); }
    try { initReviewsCarousel(); } catch(e) { console.error("Reviews failed", e); }
    try { setupCartDrawer(); initCart(); } catch(e) { console.error("Cart init failed", e); }
    
    // Checkout specific initialization
    const checkoutTypeDel = document.getElementById('checkout-type-delivery');
    const checkoutTypeTake = document.getElementById('checkout-type-takeaway');
    const checkoutAddressBlock = document.getElementById('checkout-address')?.parentElement;
    
    if (checkoutTypeDel && checkoutTypeTake && checkoutAddressBlock) {
        const savedOrderType = localStorage.getItem('littiWaleOrderType') || 'delivery';
        
        const updateAddressVisibility = () => {
            if (checkoutTypeTake.checked) {
                checkoutAddressBlock.style.display = 'none';
            } else {
                checkoutAddressBlock.style.display = 'block';
            }
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
                window.location.href = 'index.html#craziest-deals-section';
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
                window.location.href = 'index.html#menu-section';
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
    if (filterFab && (window.location.pathname.includes('menu.html') || document.body.classList.contains('menu-page'))) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                if (filterFab.style.display === 'none') {
                    filterFab.style.display = 'flex';
                }
                setTimeout(() => filterFab.classList.add('visible'), 10);
            } else {
                filterFab.classList.remove('visible');
                // Optional: hide display after transition
                setTimeout(() => {
                    if (!filterFab.classList.contains('visible')) {
                        filterFab.style.display = 'none';
                    }
                }, 300);
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
        if (!window.location.pathname.includes('menu.html') && !document.body.classList.contains('menu-page')) return;

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
                var imgSrc = (menuImageMap && menuImageMap[getNormalizedName(item.name)]) ? menuImageMap[getNormalizedName(item.name)] : 'images/logo.png';

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
                document.documentElement.style.setProperty('--lw-nav-h', navH + 'px');
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
