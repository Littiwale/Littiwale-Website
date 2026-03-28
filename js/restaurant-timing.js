document.addEventListener('DOMContentLoaded', () => {
    // Inject CSS for the popup
    const timingStyles = `
        #restaurant-closed-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        #restaurant-closed-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        #restaurant-closed-popup {
            background: var(--bg-light, #1c1c1c); /* fallback if var not available */
            border: 1px solid var(--primary-color, #f4b400);
            border-radius: 16px;
            padding: 30px 20px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            transform: scale(0.9);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
        }

        #restaurant-closed-overlay.show #restaurant-closed-popup {
            transform: scale(1);
        }

        .closed-popup-icon {
            font-size: 3.5rem;
            margin-bottom: 15px;
            line-height: 1;
        }

        .closed-popup-title {
            font-family: var(--font-heading, "Poppins", sans-serif);
            font-size: 1.5rem;
            color: #ffffff;
            margin-bottom: 10px;
        }

        .closed-popup-message {
            color: var(--text-secondary, #b3b3b3);
            font-size: 1rem;
            margin-bottom: 25px;
            line-height: 1.5;
        }

        .closed-popup-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .closed-countdown-container {
            display: none;
            background: rgba(244, 180, 0, 0.1);
            border: 1px dashed var(--primary-color, #f4b400);
            border-radius: 12px;
            padding: 15px;
            margin-top: 20px;
            color: var(--primary-color, #f4b400);
            font-family: monospace;
            font-size: 1.8rem;
            font-weight: bold;
            letter-spacing: 2px;
        }

        .closed-countdown-label {
            font-family: "Poppins", sans-serif;
            font-size: 0.85rem;
            color: #ffffff;
            opacity: 0.9;
            margin-bottom: 5px;
            letter-spacing: 0;
            font-weight: normal;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = timingStyles;
    document.head.appendChild(styleEl);

    // Inject HTML for the popup
    const popupHTML = `
        <div id="restaurant-closed-overlay">
            <div id="restaurant-closed-popup">
                <div class="closed-popup-icon" id="closed-icon">😔</div>
                <h2 class="closed-popup-title" id="closed-title">Sorry, we're currently closed</h2>
                <p class="closed-popup-message" id="closed-message">We operate from 10:00 AM to 11:00 PM</p>
                
                <div class="closed-popup-buttons" id="closed-buttons">
                    <button class="btn btn-primary btn-block py-3" id="btn-wait" style="font-size: 1.1rem;">I'll Wait ⏳</button>
                    <button class="btn btn-outline btn-block py-3" id="btn-browse" style="font-size: 1.1rem; border-color: #555; color: #ccc;">Browse Menu 🍽️</button>
                </div>

                <div class="closed-countdown-container" id="closed-countdown-box">
                    <div class="closed-countdown-label" id="closed-countdown-msg">Thanks for waiting ❤️ We'll open at 10:00 AM</div>
                    <div id="closed-countdown-timer">00:00:00</div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Timing Logic
    const overlay = document.getElementById('restaurant-closed-overlay');
    const btnWait = document.getElementById('btn-wait');
    const btnBrowse = document.getElementById('btn-browse');
    const buttonsContainer = document.getElementById('closed-buttons');
    const countdownBox = document.getElementById('closed-countdown-box');
    const timerDisplay = document.getElementById('closed-countdown-timer');
    const closedIcon = document.getElementById('closed-icon');
    const closedTitle = document.getElementById('closed-title');
    const closedMessage = document.getElementById('closed-message');

    let countdownInterval = null;

    function getISTTime() {
        // Create a date object in IST timezone
        const now = new Date();
        const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        return new Date(istString);
    }

    function checkRestaurantStatus() {
        const istNow = getISTTime();
        const hours = istNow.getHours();
        
        // Open between 10 AM (10) and 11 PM (23)
        const isOpen = hours >= 10 && hours < 23;
        
        if (isOpen) {
            // Auto-hide popup if it's currently open
            if (overlay.classList.contains('show')) {
                hidePopup();
                if (countdownInterval) clearInterval(countdownInterval);
            }
            return;
        }
        
        // It is closed
        const sessionKey = 'littiWaleClosedSession_' + istNow.toDateString();
        
        if (!localStorage.getItem(sessionKey)) {
            showPopup();
            // Mark as shown for this day/session
            localStorage.setItem(sessionKey, 'true');
        }
    }

    function showPopup() {
        overlay.classList.add('show');
    }

    function hidePopup() {
        overlay.classList.remove('show');
        document.body.style.overflow = ''; // Ensure scroll is restored if we blocked it
    }

    function startCountdown() {
        buttonsContainer.style.display = 'none';
        closedIcon.style.display = 'none';
        closedTitle.style.display = 'none';
        closedMessage.style.display = 'none';
        countdownBox.style.display = 'block';
        
        updateCountdown();
        countdownInterval = setInterval(() => {
            updateCountdown();
            // Also passively check if we should auto-open
            const istNow = getISTTime();
            const h = istNow.getHours();
            if (h >= 10 && h < 23) {
                hidePopup();
                clearInterval(countdownInterval);
                location.reload(); // Refresh the page to restore full open UX smoothly
            }
        }, 1000);
    }

    function updateCountdown() {
        const istNow = getISTTime();
        
        // Calculate next 10 AM IST
        let target = new Date(istNow);
        target.setHours(10, 0, 0, 0);
        
        if (istNow.getHours() >= 23) {
            // It's after 11 PM, target is 10 AM tomorrow
            target.setDate(target.getDate() + 1);
        } else if (istNow.getHours() < 10) {
            // It's before 10 AM, target is 10 AM today (already set)
        }
        
        const diff = target.getTime() - istNow.getTime();
        
        if (diff <= 0) {
            timerDisplay.textContent = "00:00:00";
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        timerDisplay.textContent = 
            String(hours).padStart(2, '0') + ":" + 
            String(mins).padStart(2, '0') + ":" + 
            String(secs).padStart(2, '0');
    }

    // Event Listeners
    if (btnBrowse) {
        btnBrowse.addEventListener('click', () => {
            hidePopup();
        });
    }

    if (btnWait) {
        btnWait.addEventListener('click', () => {
            startCountdown();
        });
    }

    // Initial Check
    checkRestaurantStatus();
    
    // Periodically check every minute in background in case they leave tab open
    setInterval(checkRestaurantStatus, 60000);
});
