// ============================================================
// LITTIWALE ANIMATED PANDA AUTH CONTROLLER
// ============================================================

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

                    const passMsg = data.tempPassword ? `\n\n🔑 Your Login Temporary Password is: ${data.tempPassword}\n(Saved to your device so you stay logged in!)` : '';
                    alert(`🎉 Welcome to Littiwale, ${name}!${passMsg}`);
                    
                    const nextUrl = new URLSearchParams(window.location.search).get('redirect') || '/menu';
                    window.location.href = nextUrl;
                } else {
                    if (signupError) signupError.textContent = data.error || 'Registration failed. Try logging in.';
                }
            } catch (err) {
                hideLoader();
                if (signupError) signupError.textContent = 'Connection error. Please try again.';
            }
        });
    }

    // 3. FORGOT PASSWORD HANDLER
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('forgot-identifier')?.value?.trim();

            if (!identifier) {
                if (forgotError) forgotError.textContent = 'Please enter your Mobile number or Email';
                return;
            }

            if (forgotError) forgotError.textContent = '';
            showLoader('Generating Temporary Password...');

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
                    const tempMsg = data.tempPassword ? `\n\n🔑 Your New Temporary Password is: ${data.tempPassword}` : '';
                    alert(`✅ Password Reset!${tempMsg}\n\nYou can now login with your mobile/email and this password.`);
                    switchToLogin();
                    const loginId = document.getElementById('login-identifier');
                    const loginPass = document.getElementById('login-password');
                    if (loginId) loginId.value = identifier;
                    if (loginPass && data.tempPassword) loginPass.value = data.tempPassword;
                } else {
                    if (forgotError) forgotError.textContent = data.error || 'Could not reset password. Please check your details.';
                }
            } catch (err) {
                hideLoader();
                if (forgotError) forgotError.textContent = 'Connection error. Please try again.';
            }
        });
    }

    // 4. GUEST BUTTON HANDLER
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

    if (guestBtn) {
        guestBtn.addEventListener('click', window.continueAsGuest);
    }
    const guestSignupBtn = document.getElementById('guest-signup-btn');
    if (guestSignupBtn) {
        guestSignupBtn.addEventListener('click', window.continueAsGuest);
    }
});
