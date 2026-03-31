document.addEventListener("DOMContentLoaded", () => {
    // 1. Session check - only skip if the user explicitly clicked the 'Skip' button previously
    if (sessionStorage.getItem('iplIntroSkipped')) return;

    const teamColors = {
        RCB: "#E3222B", CSK: "#F9CD05", MI: "#004BA0", KKR: "#3A225D",
        SRH: "#F26522", RR: "#EA1A85", DC: "#00008B", PBKS: "#ED1B24",
        GT: "#0B4973", LSG: "#0057E2"
    };

    const now = new Date();
    const today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
    
    // Calculate Match parameters dynamically from matchData.js only
    let match = null;
    let matchNumber = 0;
    let foundMatchNumber = 0;
    let currentMatchFound = false;

    // Strict iteration
    for (const m of matches) {
        if (!m.games) continue;
        for (const g of m.games) {
            matchNumber++;
            if (m.date === today && !currentMatchFound) {
                match = m;
                foundMatchNumber = matchNumber;
                currentMatchFound = true;
            }
        }
    }

    if (!match && matches.length > 0) {
        match = matches[0];
        foundMatchNumber = 1; // Fallback
    }

    if (!match || !match.games || match.games.length === 0) return;
    
    const game = match.games[0];
    const team1 = game.team1;
    const team2 = game.team2;
    const color1 = teamColors[team1] || "#ff0000";
    const color2 = teamColors[team2] || "#0000ff";

    const overlay = document.createElement("div");
    overlay.id = "ipl-intro-overlay";
    
    // 2. Audio Rules
    const audio = new Audio('IPL/sounds/ipltheme.mp3');
    audio.volume = 0.5;

    overlay.innerHTML = `
        <div class="ipl-audio-unlock" id="ipl-audio-unlock">
            <div class="ipl-ripple-effect" id="ipl-ripple-effect"></div>
            <div class="ipl-unlock-content">
                <div class="ipl-unlock-text">
                    <span class="ipl-gradient-text" style="background: linear-gradient(to right, ${color1}, ${color2}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Tap to experience</span><br>
                    the ultimate IPL season with Littiwale ⚡<br>
                    <span class="ipl-ready-text">Are you ready?</span>
                </div>
                <div class="ipl-tap-cue">
                    <span class="ipl-pulse-dot"></span> 👆 Tap anywhere to continue
                </div>
            </div>
        </div>

        <div class="ipl-intro-bg" id="ipl-intro-bg">
            <div class="ipl-intro-glow left" style="--team1-color: ${color1};"></div>
            <div class="ipl-intro-glow right" style="--team2-color: ${color2};"></div>
        </div>
        
        <div class="ipl-match-header" id="ipl-match-header">
            <h3>IPL Season 2026</h3>
            <h1>Match: <span style="color: ${color1}">${team1}</span> vs <span style="color: ${color2}">${team2}</span></h1>
            <p>Match ${foundMatchNumber}</p>
        </div>

        <div class="ipl-players-anim players-wrapper" id="ipl-players-anim">
            <div class="player-container left-player">
                <img src="IPL/PlayersImage/${team1.toLowerCase()}.png" class="player-cutout" alt="${team1}">
            </div>
            <div class="player-container right-player">
                <img src="IPL/PlayersImage/${team2.toLowerCase()}.png" class="player-cutout" alt="${team2}">
            </div>
        </div>

        <div class="ipl-vs-screen" id="ipl-vs-screen">
            <div class="ipl-vs-center">VS</div>
        </div>

        <div class="ipl-promo-screen" id="ipl-promo-screen">
            <div class="ipl-promo-txt">
                Support your favorite team this IPL
                <span class="ipl-promo-sub">and enjoy exclusive offers from Littiwale</span>
            </div>
        </div>

        <div class="ipl-thunder-flash" id="ipl-thunder-flash"></div>

        <button class="ipl-skip-btn" id="ipl-skip-btn">Skip</button>
    `;

    document.body.appendChild(overlay);

    const unlockScreen = document.getElementById("ipl-audio-unlock");
    const ripple = document.getElementById("ipl-ripple-effect");
    const bg = document.getElementById("ipl-intro-bg");
    const matchHeader = document.getElementById("ipl-match-header");
    const playersAnim = document.getElementById("ipl-players-anim");
    const vsScreen = document.getElementById("ipl-vs-screen");
    const promoScreen = document.getElementById("ipl-promo-screen");
    const thunderFlash = document.getElementById("ipl-thunder-flash");
    const skipBtn = document.getElementById("ipl-skip-btn");
    
    let isHidden = false;

    // 8. Exit trigger (Punch)
    const executeExit = () => {
        if (isHidden) return;
        isHidden = true;
        
        if (audio) {
            // Smooth audio fade
            let vol = audio.volume;
            let fadeOut = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    audio.volume = vol;
                } else {
                    clearInterval(fadeOut);
                    audio.pause();
                    audio.currentTime = 0;
                }
            }, 50);
        }
        
        // Triggers the Scale Burst (1 -> 1.1 -> 0.9 fade)
        overlay.classList.add('ipl-boxing-punch');
        
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 600);
    };

    skipBtn.addEventListener("click", () => {
        sessionStorage.setItem('iplIntroSkipped', 'true');
        executeExit();
    });

    // Ensure balancing runs as images load
    const checkImages = overlay.querySelectorAll('img');
    let loadedCount = 0;
    checkImages.forEach(img => {
        if (img.complete) {
            loadedCount++;
        } else {
            img.addEventListener('load', () => {
                loadedCount++;
                if (loadedCount === checkImages.length) balancePlayers();
            });
        }
    });
    if (loadedCount === checkImages.length) setTimeout(balancePlayers, 100);

    const startIntroFlow = () => {
        // Sequence Execution starts

        // 0s: Bg and Match Header appear strictly first
        setTimeout(() => {
            if (!isHidden) bg.classList.add("active");
            if (!isHidden) matchHeader.classList.add("active");
            if (!isHidden) skipBtn.classList.add("active");
        }, 100);

        // 2s: Player Entry triggers
        setTimeout(() => {
            if (!isHidden) {
                playersAnim.classList.add("active");
                // Re-balance once they are shown and layout is active
                balancePlayers();
            }
        }, 2000);

        // 2.8s: Thunder Moment + Collision
        setTimeout(() => {
            if (isHidden) return;
            
            // Display White Flash + Shake purely visual
            thunderFlash.classList.add("flash");
            overlay.classList.add("ipl-shake");
            
            // Show Big Clean VS Text
            vsScreen.classList.add("active");
            
            // Slightly dim the players
            playersAnim.classList.add("dimmed");
            
            // Fade out top match header
            matchHeader.style.opacity = '0';
        }, 2800);

        // 5.5s: Hold VS for 2.7s then trigger Promo Layer
        setTimeout(() => {
            if (isHidden) return;
            
            // Remove VS text
            vsScreen.classList.remove("active");
            vsScreen.classList.add("fade-out");
            
            // Shortly after, fade in completely separate Promo screen
            setTimeout(() => {
                if (!isHidden) promoScreen.classList.add("active");
            }, 400);
        }, 5500);

        // 9s: Auto exit flow completes cinematic intro
        setTimeout(() => {
            executeExit();
        }, 9000);
    };

    // Audio Unlock System Overlay Binding with Fast Interaction Visuals
    let clicked = false;
    unlockScreen.addEventListener("click", (e) => {
        if (clicked) return;
        clicked = true;

        // Visual Ripple Feedback
        if (ripple) {
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            ripple.classList.add('active');
        }

        // Slight deliberate delay so the user feels the ripple effect hit their click
        setTimeout(() => {
            // Play Audio securely within user-gesture context
            audio.play().then(() => {
                // Fade out the transparent overlay smoothly upon successful audio start
                unlockScreen.style.opacity = '0';
                setTimeout(() => {
                    if (unlockScreen.parentNode) unlockScreen.remove();
                }, 500);
                
                startIntroFlow();
            }).catch(e => {
                console.log('Audio playback prevented by restrictions:', e);
                unlockScreen.style.opacity = '0';
                setTimeout(() => {
                    if (unlockScreen.parentNode) unlockScreen.remove();
                }, 500);
                startIntroFlow();
            });
    });
});

// ✅ SMART SCALE ENGINE (SAFE RENDERING)
function balancePlayers() {
    const players = document.querySelectorAll(".player-container img");
    if (!players.length) return;

    let referenceHeight = 0;

    // Reset scale first to measure natural size
    players.forEach(img => {
        img.style.setProperty("--player-scale", 1);
    });

    // Find tallest natural image
    players.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.height > referenceHeight) {
            referenceHeight = rect.height;
        }
    });

    // Scale ONLY smaller images (never shrink larger ones to preserve quality)
    players.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (!rect.height) return;

        const scale = referenceHeight / rect.height;

        // Apply scale up if threshold exceeded (1.02)
        if (scale > 1.02) {
            img.style.setProperty("--player-scale", scale.toFixed(2));
        } else {
            img.style.setProperty("--player-scale", 1);
        }
    });
}

// 1. RUN AFTER EVERYTHING LOADS
window.addEventListener("load", () => {
    setTimeout(balancePlayers, 300);
});

// 2. RUN AFTER RESIZE
window.addEventListener("resize", () => {
    setTimeout(balancePlayers, 200);
});

// 3. RUN AFTER INITIAL ANIMATIONS
setTimeout(balancePlayers, 500);

// 4. AUTO-DETECT IMAGE CHANGES (MutationObserver)
const playerObserver = new MutationObserver(() => {
    setTimeout(balancePlayers, 200);
});

playerObserver.observe(document.body, {
    subtree: true,
    childList: true
});
});
