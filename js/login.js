// ============================================================
// LITTIWALE ANIMATED PANDA AUTH CONTROLLER
// ============================================================

window.ADMIN_SERVER_ORIGIN = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:5001' 
    : 'https://admin.littiwale.co.in';

window.ADMIN_API_BASE_URL = `${window.ADMIN_SERVER_ORIGIN}/api`;

document.addEventListener('DOMContentLoaded', () => {
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const tabGuest = document.getElementById('tab-guest');
    const loginSide = document.getElementById('login-form-side');
    const signupSide = document.getElementById('signup-form-side');
    const guestSide = document.getElementById('guest-form-side');
    const forgotSide = document.getElementById('forgot-form-side');
    const toggleToSignup = document.getElementById('toggle-to-signup');
    const toggleToLogin = document.getElementById('toggle-to-login');
    const toggleFromGuestToLogin = document.getElementById('toggle-from-guest-to-login');
    const toggleToForgot = document.getElementById('toggle-to-forgot');
    const toggleBackToLogin = document.getElementById('toggle-back-to-login');
    const authLoader = document.getElementById('auth-loader');
    const loaderText = document.getElementById('litti-loader-status');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form');

    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const forgotError = document.getElementById('forgot-error');
    const guestError = document.getElementById('guest-error');

    function showLoader(text = 'Litti pak rahi hai...') {
        if (loaderText) loaderText.textContent = text;
        if (authLoader) authLoader.style.display = 'flex';
    }

    function hideLoader() {
        if (authLoader) authLoader.style.display = 'none';
    }

    // Switch between Login, Signup, Guest, and Forgot modes
    function switchToLogin() {
        document.body.classList.remove('signup-mode');
        if (tabLogin) tabLogin.className = 'tab active';
        if (tabSignup) tabSignup.className = 'tab';
        if (tabGuest) tabGuest.className = 'tab';
        if (loginSide) loginSide.className = 'form-container form-show';
        if (signupSide) signupSide.className = 'form-container form-hide';
        if (guestSide) guestSide.className = 'form-container form-hide';
        if (forgotSide) forgotSide.className = 'form-container form-hide';
        if (loginError) loginError.textContent = '';
    }

    function switchToSignup() {
        document.body.classList.add('signup-mode');
        if (tabLogin) tabLogin.className = 'tab';
        if (tabSignup) tabSignup.className = 'tab active';
        if (tabGuest) tabGuest.className = 'tab';
        if (loginSide) loginSide.className = 'form-container form-hide';
        if (signupSide) signupSide.className = 'form-container form-show';
        if (guestSide) guestSide.className = 'form-container form-hide';
        if (forgotSide) forgotSide.className = 'form-container form-hide';
        if (signupError) signupError.textContent = '';
    }

    window.switchToGuestTab = function() {
        document.body.classList.remove('signup-mode');
        if (tabLogin) tabLogin.className = 'tab';
        if (tabSignup) tabSignup.className = 'tab';
        if (tabGuest) tabGuest.className = 'tab active';
        if (loginSide) loginSide.className = 'form-container form-hide';
        if (signupSide) signupSide.className = 'form-container form-hide';
        if (guestSide) guestSide.className = 'form-container form-show';
        if (forgotSide) forgotSide.className = 'form-container form-hide';
        if (guestError) guestError.textContent = '';
        setTimeout(() => document.getElementById('guest-phone-input')?.focus(), 100);
    };

    function switchToForgot() {
        document.body.classList.remove('signup-mode');
        if (tabLogin) tabLogin.className = 'tab';
        if (tabSignup) tabSignup.className = 'tab';
        if (tabGuest) tabGuest.className = 'tab';
        if (loginSide) loginSide.className = 'form-container form-hide';
        if (signupSide) signupSide.className = 'form-container form-hide';
        if (guestSide) guestSide.className = 'form-container form-hide';
        if (forgotSide) forgotSide.className = 'form-container form-show';
        if (forgotError) forgotError.textContent = '';
    }

    if (tabLogin) tabLogin.addEventListener('click', switchToLogin);
    if (tabSignup) tabSignup.addEventListener('click', switchToSignup);
    if (tabGuest) tabGuest.addEventListener('click', window.switchToGuestTab);
    if (toggleToSignup) toggleToSignup.addEventListener('click', switchToSignup);
    if (toggleToLogin) toggleToLogin.addEventListener('click', switchToLogin);
    if (toggleFromGuestToLogin) toggleFromGuestToLogin.addEventListener('click', switchToLogin);
    if (toggleToForgot) toggleToForgot.addEventListener('click', switchToForgot);
    if (toggleBackToLogin) toggleBackToLogin.addEventListener('click', switchToLogin);

    // GUEST MOBILE FORM HANDLER (10-Digit Mobile -> Direct Access)
    window.handleGuestMobileSubmit = async function(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('guest-phone-input');
        if (!input) return;
        const phone = input.value.replace(/\D/g, '').slice(-10);

        if (phone.length !== 10) {
            if (guestError) guestError.textContent = 'Please enter a valid 10-digit mobile number';
            return;
        }

        showLoader('Loading your details & menu...');
        localStorage.setItem('littiwale_customer_phone', phone);
        localStorage.setItem('littiwale_is_guest', 'true');

        try {
            const apiBase = window.ADMIN_API_BASE_URL || '/api';
            const res = await fetch(`${apiBase}/customers/${phone}`);
            const data = await res.json();
            if (data && data.exists) {
                localStorage.setItem('littiwale_customer_profile', JSON.stringify({
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    addresses: data.addresses
                }));
            }
        } catch(err) {}

        hideLoader();

        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');
        if (redirectUrl && !redirectUrl.includes('login.html')) {
            window.location.href = redirectUrl;
        } else {
            window.location.href = '/menu/';
        }
    };

    // 1. LOGIN HANDLER
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idVal = document.getElementById('login-identifier')?.value?.trim();
            const passVal = document.getElementById('login-password')?.value?.trim();

            if (!idVal || !passVal) {
                if (loginError) loginError.textContent = 'Please enter both Email/Mobile and Password';
                return;
            }

            if (loginError) loginError.textContent = '';
            showLoader('Swag check ho raha hai...');

            try {
                const apiBase = window.ADMIN_API_BASE_URL || '/api';
                const res = await fetch(`${apiBase}/customer/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: idVal, password: passVal })
                });

                const data = await res.json();
                hideLoader();

                if (res.ok && data.success && data.customer) {
                    localStorage.setItem('littiwale_customer_profile', JSON.stringify(data.customer));
                    localStorage.setItem('littiwale_customer_phone', data.customer.phone);
                    
                    const nextUrl = new URLSearchParams(window.location.search).get('redirect') || '/menu';
                    window.location.href = nextUrl;
                } else {
                    if (loginError) loginError.textContent = data.error || 'Invalid credentials. Check temp password or reset.';
                }
            } catch (err) {
                hideLoader();
                if (loginError) loginError.textContent = 'Connection error. Please try again.';
            }
        });
    }

    // 2. SIGNUP HANDLER (4-Character CAPITAL Temp Password via Resend)
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name')?.value?.trim();
            const phone = document.getElementById('signup-phone')?.value?.trim();
            const email = document.getElementById('signup-email')?.value?.trim();

            if (!name || !phone || !email) {
                if (signupError) signupError.textContent = 'Please fill all required fields';
                return;
            }

            if (signupError) signupError.textContent = '';
            showLoader('Litti pak rahi hai • Creating Account...');

            try {
                const apiBase = window.ADMIN_API_BASE_URL || '/api';
                const res = await fetch(`${apiBase}/customer/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, email })
                });

                const data = await res.json();
                hideLoader();

                if (res.ok && data.success && data.customer) {
                    localStorage.setItem('littiwale_customer_profile', JSON.stringify(data.customer));
                    localStorage.setItem('littiwale_customer_phone', data.customer.phone);

                    showLuxuryAuthNotification(
                        '🎉 Account Created Successfully!',
                        `Welcome to Littiwale, <strong>${name}</strong>!<br><br>Your secure 4-character Login PIN has been dispatched to <strong>${data.emailMasked || email}</strong> from <span style="color:#f59e0b;">support@littiwale.co.in</span>.`,
                        '🎉',
                        () => {
                            const nextUrl = new URLSearchParams(window.location.search).get('redirect') || '/menu';
                            window.location.href = nextUrl;
                        }
                    );
                } else {
                    if (signupError) signupError.textContent = data.error || 'Registration failed. Try logging in.';
                }
            } catch (err) {
                hideLoader();
                if (signupError) signupError.textContent = 'Connection error. Please try again.';
            }
        });
    }

    // 3. FORGOT PASSWORD / PIN RESET HANDLER (Secure Email Dispatch)
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('forgot-identifier')?.value?.trim();

            if (!identifier) {
                if (forgotError) forgotError.textContent = 'Please enter your Mobile number or Email';
                return;
            }

            if (forgotError) forgotError.textContent = '';
            showLoader('Generating Secure PIN & Dispatching Email...');

            try {
                const apiBase = window.ADMIN_API_BASE_URL || '/api';
                const res = await fetch(`${apiBase}/customer/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier })
                });

                const data = await res.json();
                hideLoader();

                if (res.ok && data.success) {
                    showLuxuryAuthNotification(
                        '🔑 Login PIN Sent to Email!',
                        `A new 4-character Login PIN has been sent to your registered email <strong>${data.emailMasked || 'address'}</strong> from <span style="color:#f59e0b;">support@littiwale.co.in</span>.<br><br><span style="font-size:12px; color:#94a3b8;">Please check your Inbox or Spam folder and enter the PIN to sign in.</span>`,
                        '📧',
                        () => {
                            switchToLogin();
                            const loginId = document.getElementById('login-identifier');
                            const loginPass = document.getElementById('login-password');
                            if (loginId) loginId.value = identifier;
                            if (loginPass) {
                                loginPass.value = '';
                                loginPass.focus();
                            }
                        }
                    );
                } else {
                    if (forgotError) forgotError.textContent = data.error || 'Could not reset password. Please check your details.';
                }
            } catch (err) {
                hideLoader();
                if (forgotError) forgotError.textContent = 'Connection error. Please try again.';
            }
        });
    }

    function showLuxuryAuthNotification(title, message, icon, onClose) {
        const existing = document.getElementById('luxury-auth-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'luxury-auth-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 20px;
            font-family: 'Poppins', sans-serif; animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #181924, #0e1017); border: 1.5px solid rgba(245,158,11,0.35); border-radius: 20px; max-width: 440px; width: 100%; padding: 28px 24px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.8); position: relative;">
                <div style="font-size: 42px; margin-bottom: 12px;">${icon || '✨'}</div>
                <h3 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 10px; letter-spacing: -0.3px;">${title}</h3>
                <div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin-bottom: 22px;">${message}</div>
                <button type="button" id="btn-close-luxury-modal" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 14px; border: none; padding: 12px 28px; border-radius: 10px; cursor: pointer; width: 100%; box-shadow: 0 6px 20px rgba(245,158,11,0.4);">
                    Got It! Continue →
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('btn-close-luxury-modal').addEventListener('click', () => {
            modal.remove();
            if (typeof onClose === 'function') onClose();
        });
    }

    // 4. GOOGLE 1-CLICK OAUTH HANDLER
    window.handleGoogleLogin = function() {
        showLoader('Redirecting to Google Sign-In...');
        const params = new URLSearchParams(window.location.search);
        let redirectUrl = params.get('redirect');

        if (!redirectUrl) {
            let hasCart = false;
            try {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                if (Array.isArray(cart) && cart.length > 0) hasCart = true;
            } catch(e) {}
            redirectUrl = hasCart ? '/checkout.html' : '/';
        }
        
        // Supabase Google OAuth Endpoint
        const returnUrl = window.location.origin + '/login.html?redirect=' + encodeURIComponent(redirectUrl);
        const authUrl = `https://ragoftflejyetarhdogh.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(returnUrl)}`;
        window.location.href = authUrl;
    };

    // Auto-detect and sync Supabase Google OAuth callback from URL hash
    async function checkOAuthCallback() {
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) return;

        showLoader('Signing in with Google...');
        try {
            const hashParams = new URLSearchParams(hash.substring(1));
            const accessToken = hashParams.get('access_token');
            if (!accessToken) return;

            // Fetch User info from Supabase Auth
            const userRes = await fetch('https://ragoftflejyetarhdogh.supabase.co/auth/v1/user', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ29mdGZsZWp5ZXRhcmhkb2doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4MzAwNSwiZXhwIjoyMTAyNTU5MDA1fQ.12-SCyAGnSeBO9uCfyzyK-QLwB8DkgT_ptGIp-JIxfY'
                }
            });

            const userData = await userRes.json();
            if (userData && userData.email) {
                const apiBase = window.ADMIN_API_BASE_URL || '/api';
                const syncRes = await fetch(`${apiBase}/customer/google-auth`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        supabaseId: userData.id,
                        email: userData.email,
                        name: userData.user_metadata?.full_name || userData.user_metadata?.name || userData.email.split('@')[0],
                        avatarUrl: userData.user_metadata?.avatar_url || ''
                    })
                });

                const syncData = await syncRes.json();
                if (syncData.success && syncData.customer) {
                    localStorage.setItem('littiwale_customer_profile', JSON.stringify(syncData.customer));
                    localStorage.setItem('littiwale_customer_user', JSON.stringify(syncData.customer));
                    localStorage.setItem('littiwale_customer_token', syncData.token);
                    if (syncData.customer.phone) {
                        localStorage.setItem('littiwale_customer_phone', syncData.customer.phone);
                    }

                    const queryParams = new URLSearchParams(window.location.search);
                    let nextUrl = queryParams.get('redirect');

                    if (!nextUrl) {
                        let hasCart = false;
                        try {
                            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                            if (Array.isArray(cart) && cart.length > 0) hasCart = true;
                        } catch(e) {}
                        nextUrl = hasCart ? '/checkout.html' : '/';
                    }

                    hideLoader();

                    // If user is new or has no custom PIN yet, offer quick PIN setup
                    if (syncData.isNewUser || !syncData.hasCustomPin) {
                        promptInitialPinSetup(syncData.customer, nextUrl);
                    } else {
                        window.location.href = nextUrl;
                    }
                    return;
                }
            }
        } catch(e) {
            console.error('Google OAuth callback error:', e);
        }
        hideLoader();
    }

    function promptInitialPinSetup(customer, nextUrl) {
        const modal = document.createElement('div');
        modal.id = 'initial-pin-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 20px;
            font-family: 'Poppins', sans-serif; animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #181924, #0e1017); border: 1.5px solid rgba(245,158,11,0.35); border-radius: 20px; max-width: 440px; width: 100%; padding: 28px 24px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.8);">
                <div style="font-size: 42px; margin-bottom: 10px;">🔑</div>
                <h3 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 8px;">Set Your 4-Digit Quick PIN</h3>
                <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px;">
                    Hi <strong>${customer.name || 'Foodie'}</strong>! Set a quick 4-digit PIN (e.g. <code>1234</code>) so you can also log in anytime using just your mobile number!
                </p>
                <div style="margin-bottom: 16px; text-align: left;">
                    <label style="font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; display: block; margin-bottom: 6px;">Create 4-Digit PIN *</label>
                    <input type="password" id="init-pin-input" maxlength="6" placeholder="Enter 4-character PIN" style="width: 100%; padding: 12px 14px; background: #12131a; border: 1.5px solid rgba(245,158,11,0.3); border-radius: 10px; color: #fff; font-family: 'Poppins',sans-serif; font-size: 16px; text-align: center; letter-spacing: 4px; outline: none;">
                </div>
                <div id="init-pin-error" style="color: #ef4444; font-size: 12px; margin-bottom: 12px;"></div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" id="btn-save-init-pin" style="flex: 1; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 13.5px; border: none; padding: 12px; border-radius: 10px; cursor: pointer; box-shadow: 0 6px 20px rgba(245,158,11,0.4);">
                        💾 Save PIN & Continue
                    </button>
                    <button type="button" id="btn-skip-init-pin" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; font-family: 'Poppins', sans-serif; font-size: 12.5px; padding: 0 16px; border-radius: 10px; cursor: pointer;">
                        Skip
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const pinInput = document.getElementById('init-pin-input');
        if (pinInput) pinInput.focus();

        document.getElementById('btn-skip-init-pin').addEventListener('click', () => {
            modal.remove();
            window.location.href = nextUrl;
        });

        document.getElementById('btn-save-init-pin').addEventListener('click', async () => {
            const pin = pinInput?.value?.trim();
            const errBox = document.getElementById('init-pin-error');
            if (!pin || pin.length < 4) {
                if (errBox) errBox.textContent = 'Please enter at least a 4-character PIN';
                return;
            }

            try {
                const apiBase = window.ADMIN_API_BASE_URL || '/api';
                await fetch(`${apiBase}/customer/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: customer.email,
                        phone: customer.phone,
                        newPassword: pin
                    })
                });
            } catch(e) {}

            modal.remove();
            window.location.href = nextUrl;
        });
    }

    checkOAuthCallback();

    // 5. GUEST BUTTON HANDLER
    window.continueAsGuest = function() {
        localStorage.setItem('littiwale_is_guest', 'true');
        
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');
        if (redirectUrl && !redirectUrl.includes('login.html')) {
            window.location.href = redirectUrl;
            return;
        }

        if (document.referrer && !document.referrer.includes('login.html') && document.referrer.includes(window.location.host)) {
            window.location.href = document.referrer;
            return;
        }

        // Navigate to menu or home
        window.location.href = '/menu/';
    };

    const guestBtn = document.getElementById('guest-btn');
    if (guestBtn) {
        guestBtn.addEventListener('click', window.continueAsGuest);
    }
    const guestSignupBtn = document.getElementById('guest-signup-btn');
    if (guestSignupBtn) {
        guestSignupBtn.addEventListener('click', window.continueAsGuest);
    }
});
