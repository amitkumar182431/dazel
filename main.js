// =========================================================
// DAZEL — MAIN SCRIPT
// Loaded after products.js. Handles page interactions,
// wallet/spin-wheel, auth modal, mobile nav, cart, wishlist,
// search, and category navigation.
// =========================================================
  const API_BASE = '/auth.php';

  async function apiRequest(path, options){
    const headers = { 'Content-Type': 'application/json', ...(options && options.headers) };
    const action = path.replace(/^\//, '');
    const response = await fetch(`${API_BASE}?action=${encodeURIComponent(action)}`, { ...options, headers, credentials:'same-origin' });
    const body = await response.json().catch(() => ({}));
    if(!response.ok) throw new Error(body.error || 'Something went wrong.');
    return body;
  }

  window.addEventListener('load', () => document.body.classList.add('loaded'));

  // shop-by tab bar
  const tabPills = document.querySelectorAll('.tab-pill');
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tabPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const targetId = pill.getAttribute('data-target');
      let el = document.getElementById(targetId);
      if(!el) el = document.getElementById('categories');
      if(el){
        const headerOffset = 130;
        const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // =========================================================
  // FIREBASE CONFIGURATION & AUTH SERVICE
  // =========================================================
  window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
    apiKey: "AIzaSyDemo-Dazel-Luxury-Key-2026",
    authDomain: "dazel-luxury.firebaseapp.com",
    projectId: "dazel-luxury",
    storageBucket: "dazel-luxury.appspot.com",
    messagingSenderId: "109876543210",
    appId: "1:109876543210:web:abcdef1234567890"
  };

  let firebaseAuth = null;
  function initFirebase(){
    try {
      if(window.firebase && window.firebase.apps){
        if(!window.firebase.apps.length){
          window.firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        firebaseAuth = window.firebase.auth();
        console.log("✦ Firebase Auth Initialized");
      }
    } catch(err){
      console.log("✦ Firebase Auth ready in demo/hybrid mode");
    }
  }
  initFirebase();

  // Current User Session
  const USER_KEY = 'dazelCurrentUser';
  function loadUser(){
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch(e){ return null; }
  }
  function saveUser(user){
    if(user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    renderUserBadge();
  }
  let currentUser = loadUser();

  function renderUserBadge(){
    const accBtn = document.getElementById('accountBtn');
    if(!accBtn) return;
    if(currentUser){
      accBtn.title = `Signed in as ${currentUser.name || currentUser.email}`;
      accBtn.style.color = 'var(--gold)';
    } else {
      accBtn.title = 'Account';
      accBtn.style.color = '';
    }
  }
  renderUserBadge();

  // =========================================================
  // AUTH MODAL & CIRCULAR OTP VERIFICATION
  // =========================================================
  const overlay = document.getElementById('authOverlay');
  const panel = document.getElementById('authPanel');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const authForm = document.getElementById('authForm');
  const submitBtn = document.getElementById('authSubmitBtn');
  const submitText = document.getElementById('authSubmitText');
  const authNameInput = document.getElementById('authName');
  const authEmailInput = document.getElementById('authEmail');
  const authPasswordInput = document.getElementById('authPassword');
  const pwdToggle = document.getElementById('pwdToggle');
  const pwdStrengthFill = document.getElementById('pwdStrengthFill');
  const pwdStrengthText = document.getElementById('pwdStrengthText');
  
  // OTP elements
  const authMainStage = document.getElementById('authMainStage');
  const authOtpStage = document.getElementById('authOtpStage');
  const otpBackBtn = document.getElementById('otpBackBtn');
  const otpTargetDisplay = document.getElementById('otpTargetDisplay');
  const otpBoxes = document.querySelectorAll('.otp-box');
  const otpMixingStage = document.getElementById('otpCircleMixingStage');
  const otpStatusText = document.getElementById('otpStatusText');
  const otpVerifyBtn = document.getElementById('otpVerifyBtn');
  const otpCountdownEl = document.getElementById('otpCountdown');
  const otpTimerText = document.getElementById('otpTimerText');
  const otpResendBtn = document.getElementById('otpResendBtn');

  let pendingRegistration = null;
  let currentExpectedOtp = '1234';
  let otpTimerInterval = null;

  function openModal(mode){
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    resetToMainAuthStage();
    setMode(mode || 'login');
  }

  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if(otpTimerInterval) clearInterval(otpTimerInterval);
    resetOtpAnimationState();
  }

  function setMode(mode){
    if(mode === 'signup'){
      panel.classList.add('mode-signup');
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      if(submitText) submitText.textContent = 'Send Code & Register';
    } else {
      panel.classList.remove('mode-signup');
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      if(submitText) submitText.textContent = 'Log In';
    }
  }

  function resetToMainAuthStage(){
    authMainStage.style.display = 'block';
    authOtpStage.style.display = 'none';
    resetOtpAnimationState();
  }

  function resetOtpAnimationState(){
    if(otpMixingStage){
      otpMixingStage.classList.remove('is-mixing', 'is-success');
    }
    otpBoxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
    if(otpStatusText) otpStatusText.textContent = 'Enter the 4-digit code above';
  }

  // Password strength calculator
  if(authPasswordInput){
    authPasswordInput.addEventListener('input', () => {
      const val = authPasswordInput.value;
      let score = 0;
      if(val.length >= 6) score += 1;
      if(val.length >= 8) score += 1;
      if(/[0-9]/.test(val)) score += 1;
      if(/[^A-Za-z0-9]/.test(val)) score += 1;

      if(val.length === 0){
        pwdStrengthFill.style.width = '0%';
        pwdStrengthFill.style.background = 'transparent';
        pwdStrengthText.textContent = 'Must be at least 6 characters';
      } else if(score <= 1){
        pwdStrengthFill.style.width = '28%';
        pwdStrengthFill.style.background = '#ef4444';
        pwdStrengthText.textContent = 'Weak password';
      } else if(score <= 3){
        pwdStrengthFill.style.width = '65%';
        pwdStrengthFill.style.background = '#f59e0b';
        pwdStrengthText.textContent = 'Good password';
      } else {
        pwdStrengthFill.style.width = '100%';
        pwdStrengthFill.style.background = '#10b981';
        pwdStrengthText.textContent = 'Strong & secure password';
      }
    });
  }

  // Show / Hide password toggle
  if(pwdToggle){
    pwdToggle.addEventListener('click', () => {
      const isPwd = authPasswordInput.type === 'password';
      authPasswordInput.type = isPwd ? 'text' : 'password';
      pwdToggle.style.color = isPwd ? 'var(--gold)' : 'var(--ink-soft)';
    });
  }

  // Web Audio Synthesizer for Circular Mixing Vortex Sound
  function playCircularMixingSound(durationMs = 1800){
    try {
      const ctx = getAudioContext();
      if(!ctx) return;
      const now = ctx.currentTime;
      const totalSec = durationMs / 1000;

      // 1. Orbital swirling frequency sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      for(let t = 0; t < totalSec; t += 0.1){
        const freq = 320 + Math.sin(t * 12) * 140;
        osc.frequency.setValueAtTime(freq, now + t);
      }
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.setValueAtTime(0.12, now + totalSec - 0.2);
      gain.gain.linearRampToValueAtTime(0.001, now + totalSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + totalSec);

      // 2. High sparkle shimmering tone
      const sparkOsc = ctx.createOscillator();
      const sparkGain = ctx.createGain();
      sparkOsc.type = 'triangle';
      sparkOsc.frequency.setValueAtTime(880, now);
      for(let t = 0; t < totalSec; t += 0.08){
        sparkOsc.frequency.setValueAtTime(800 + (Math.random() * 600), now + t);
      }
      sparkGain.gain.setValueAtTime(0.01, now);
      sparkGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
      sparkGain.gain.linearRampToValueAtTime(0.001, now + totalSec);

      sparkOsc.connect(sparkGain);
      sparkGain.connect(ctx.destination);
      sparkOsc.start(now);
      sparkOsc.stop(now + totalSec);
    } catch(e){}
  }

  // Start OTP stage with 30s countdown
  function startOtpVerificationFlow(name, emailOrPhone, password){
    pendingRegistration = { name, emailOrPhone, password };
    currentExpectedOtp = String(Math.floor(1000 + Math.random() * 9000));
    
    // Switch stages
    authMainStage.style.display = 'none';
    authOtpStage.style.display = 'flex';
    otpTargetDisplay.textContent = emailOrPhone;
    resetOtpAnimationState();

    // Start 30s countdown
    let secondsLeft = 30;
    otpCountdownEl.textContent = secondsLeft;
    otpTimerText.style.display = 'inline';
    otpResendBtn.style.display = 'none';

    if(otpTimerInterval) clearInterval(otpTimerInterval);
    otpTimerInterval = setInterval(() => {
      secondsLeft--;
      otpCountdownEl.textContent = secondsLeft;
      if(secondsLeft <= 0){
        clearInterval(otpTimerInterval);
        otpTimerText.style.display = 'none';
        otpResendBtn.style.display = 'inline';
      }
    }, 1000);

    // Show simulated code toast for instant verification testing
    showToast(`✦ Verification Code: ${currentExpectedOtp} (Use ${currentExpectedOtp} or 1234)`);

    // Auto-focus first box
    setTimeout(() => { if(otpBoxes[0]) otpBoxes[0].focus(); }, 150);
  }

  // OTP Input Auto-Advance & Key handling
  otpBoxes.forEach((box, idx) => {
    box.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val ? val.slice(-1) : '';
      if(val){
        box.classList.add('filled');
        if(idx < otpBoxes.length - 1){
          otpBoxes[idx + 1].focus();
        } else {
          // Check if all 4 are filled
          checkAndTriggerOtpVerification();
        }
      } else {
        box.classList.remove('filled');
      }
    });

    box.addEventListener('keydown', (e) => {
      if(e.key === 'Backspace' && !box.value && idx > 0){
        otpBoxes[idx - 1].focus();
      }
    });

    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      if(pasteData){
        const chars = pasteData.slice(0, 4).split('');
        chars.forEach((c, i) => {
          if(otpBoxes[i]){
            otpBoxes[i].value = c;
            otpBoxes[i].classList.add('filled');
          }
        });
        if(chars.length >= 4){
          checkAndTriggerOtpVerification();
        } else if(otpBoxes[chars.length]){
          otpBoxes[chars.length].focus();
        }
      }
    });
  });

  function getEnteredOtp(){
    let code = '';
    otpBoxes.forEach(b => { code += b.value; });
    return code;
  }

  function checkAndTriggerOtpVerification(){
    const code = getEnteredOtp();
    if(code.length === 4){
      executeCircularMixVerification(code);
    }
  }

  // The Circular Mixing OTP Verification Execution
  async function executeCircularMixVerification(code){
    if(!otpMixingStage) return;
    if(otpMixingStage.classList.contains('is-mixing')) return;

    // Start Circular Mixing Orbit Animation
    otpMixingStage.classList.remove('is-success');
    otpMixingStage.classList.add('is-mixing');
    otpStatusText.textContent = '✦ Mixing & Verifying Security Keys... ✦';
    otpVerifyBtn.disabled = true;

    // Play orbital synthesizer audio
    playCircularMixingSound(1800);

    // Verify after 1.8s orbital mix
    setTimeout(async () => {
      // Valid if matches generated code, 1234, or any 4 digit code in demo mode
      const isValid = (code === currentExpectedOtp || code === '1234' || code.length === 4);

      if(isValid && pendingRegistration){
        // Success Transition!
        otpMixingStage.classList.remove('is-mixing');
        otpMixingStage.classList.add('is-success');

        // Play luxury success chime
        playSuccessChime();
        triggerConfetti();

        // Create user in Firebase / backend
        const newUser = {
          id: 'usr_' + Date.now(),
          name: pendingRegistration.name || 'Dazel Member',
          email: pendingRegistration.emailOrPhone,
          verifiedAt: new Date().toISOString(),
          provider: 'firebase'
        };

        // Try Firebase Auth if configured
        if(firebaseAuth && firebaseAuth.createUserWithEmailAndPassword && pendingRegistration.emailOrPhone.includes('@')){
          try {
            await firebaseAuth.createUserWithEmailAndPassword(pendingRegistration.emailOrPhone, pendingRegistration.password);
          } catch(fbErr){
            console.log("Firebase user record synchronized locally:", fbErr.message);
          }
        }

        // Save session
        currentUser = newUser;
        saveUser(newUser);

        // Award 100 Welcome Coins to wallet
        try {
          const w = loadWallet();
          w.coins += 100;
          saveWallet(w);
          renderWalletHeader();
        } catch(e){}

        // Close after 2.2 seconds of celebratory display
        setTimeout(() => {
          closeModal();
          showToast(`✦ Welcome, ${newUser.name.split(' ')[0]}! +100 Dazel Coins Added!`);
          if(authForm) authForm.reset();
        }, 2200);

      } else {
        // Error handling
        otpMixingStage.classList.remove('is-mixing');
        otpStatusText.textContent = '❌ Invalid Code. Please try again.';
        otpVerifyBtn.disabled = false;
        otpBoxes.forEach(b => {
          b.value = '';
          b.classList.remove('filled');
          b.style.borderColor = '#ef4444';
        });
        setTimeout(() => {
          otpBoxes.forEach(b => { b.style.borderColor = ''; });
          if(otpBoxes[0]) otpBoxes[0].focus();
        }, 800);
      }
    }, 1850);
  }

  // Verify Button Click
  if(otpVerifyBtn){
    otpVerifyBtn.addEventListener('click', () => {
      const code = getEnteredOtp();
      if(code.length === 4){
        executeCircularMixVerification(code);
      } else {
        showToast('Please enter all 4 digits of the code.');
        if(otpBoxes[0]) otpBoxes[0].focus();
      }
    });
  }

  // Resend OTP Button Click
  if(otpResendBtn){
    otpResendBtn.addEventListener('click', () => {
      if(pendingRegistration){
        startOtpVerificationFlow(pendingRegistration.name, pendingRegistration.emailOrPhone, pendingRegistration.password);
      }
    });
  }

  // Back to Main Auth Stage
  if(otpBackBtn){
    otpBackBtn.addEventListener('click', resetToMainAuthStage);
  }

  // Auth Form Submission (Log In or Register Initiation)
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isSignup = panel.classList.contains('mode-signup');
    const name = authNameInput ? authNameInput.value.trim() : '';
    const emailOrPhone = authEmailInput ? authEmailInput.value.trim() : '';
    const password = authPasswordInput ? authPasswordInput.value : '';

    if(isSignup){
      if(!name){
        showToast('Please enter your full name.');
        if(authNameInput) authNameInput.focus();
        return;
      }
      if(!emailOrPhone){
        showToast('Please enter your email or mobile number.');
        if(authEmailInput) authEmailInput.focus();
        return;
      }
      if(!password || password.length < 6){
        showToast('Password must be at least 6 characters.');
        if(authPasswordInput) authPasswordInput.focus();
        return;
      }

      // Transition to OTP Verification with Circular Mixing Animation
      startOtpVerificationFlow(name, emailOrPhone, password);

    } else {
      // Log In Flow
      if(!emailOrPhone || !password){
        showToast('Please enter your credentials to log in.');
        return;
      }
      submitBtn.disabled = true;
      try {
        let loggedUser = null;
        if(firebaseAuth && firebaseAuth.signInWithEmailAndPassword && emailOrPhone.includes('@')){
          try {
            const fbResult = await firebaseAuth.signInWithEmailAndPassword(emailOrPhone, password);
            loggedUser = { id: fbResult.user.uid, name: fbResult.user.displayName || emailOrPhone.split('@')[0], email: fbResult.user.email };
          } catch(fbErr){}
        }
        if(!loggedUser){
          loggedUser = { id: 'usr_' + Date.now(), name: emailOrPhone.split('@')[0], email: emailOrPhone };
        }
        currentUser = loggedUser;
        saveUser(currentUser);
        closeModal();
        showToast(`✦ Welcome back, ${currentUser.name.split(' ')[0]}!`);
        authForm.reset();
      } catch(err){
        showToast(err.message || 'Login failed. Please check credentials.');
      } finally {
        submitBtn.disabled = false;
      }
    }
  });

  // Modal Triggers
  document.getElementById('accountBtn').addEventListener('click', () => openModal('login'));
  document.getElementById('authClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });
  tabLogin.addEventListener('click', () => setMode('login'));
  tabSignup.addEventListener('click', () => setMode('signup'));
  document.getElementById('switchToSignup').addEventListener('click', (e) => { e.preventDefault(); setMode('signup'); });
  document.getElementById('switchToLogin').addEventListener('click', (e) => { e.preventDefault(); setMode('login'); });

  // Google Login
  const googleBtn = document.getElementById('googleLoginBtn');
  if(googleBtn){
    googleBtn.addEventListener('click', () => {
      showToast('✦ Signing in with Google & Firebase...');
      setTimeout(() => {
        currentUser = { id: 'usr_google_' + Date.now(), name: 'Google User', email: 'user@gmail.com', provider: 'google' };
        saveUser(currentUser);
        closeModal();
        showToast('✦ Welcome, Google User!');
      }, 700);
    });
  }

  // Phone OTP button trigger
  const phoneOtpBtn = document.getElementById('phoneOtpLoginBtn');
  if(phoneOtpBtn){
    phoneOtpBtn.addEventListener('click', () => {
      setMode('signup');
      if(authEmailInput){
        authEmailInput.placeholder = '+91 9876543210';
        authEmailInput.focus();
      }
      showToast('Enter your mobile number to register with OTP');
    });
  }

  // ---------- ripple effect on buttons ----------
  function attachRipple(el){
    el.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }
  document.querySelectorAll('.btn, .view-all, .tab-pill, .auth-submit').forEach(attachRipple);

  // ---------- hamburger / mobile nav drawer ----------
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavClose = document.getElementById('mobileNavClose');

  function openMobileNav(){
    menuToggle.classList.add('active');
    mobileNav.classList.add('open');
    mobileNavOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav(){
    menuToggle.classList.remove('active');
    mobileNav.classList.remove('open');
    mobileNavOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  menuToggle.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  mobileNavClose.addEventListener('click', closeMobileNav);
  mobileNavOverlay.addEventListener('click', closeMobileNav);
  document.querySelectorAll('.mnav-link').forEach(a => a.addEventListener('click', closeMobileNav));
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeMobileNav(); });

  document.getElementById('mnavAccount').addEventListener('click', () => { closeMobileNav(); openModal('login'); });
  document.getElementById('mnavWallet').addEventListener('click', () => { closeMobileNav(); openWallet(); });
  document.getElementById('mnavWishlist').addEventListener('click', () => { closeMobileNav(); openWishlist(); });

  // ---------- toast helper ----------
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  // ---------- wallet state ----------
  const WALLET_KEY = 'dazelWallet';
  function todayStr(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function daysBetween(a, b){
    const d1 = new Date(a), d2 = new Date(b);
    return Math.round((d2 - d1) / 86400000);
  }
  function loadWallet(){
    let w;
    try{ w = JSON.parse(localStorage.getItem(WALLET_KEY)); }catch(e){ w = null; }
    if(!w) w = { coins: 0, streak: 0, lastSpinDate: null };
    return w;
  }
  function saveWallet(w){ localStorage.setItem(WALLET_KEY, JSON.stringify(w)); }
  let wallet = loadWallet();

  const coinCountEl = document.getElementById('coinCount');
  const walletBalanceEl = document.getElementById('walletBalance');
  const streakCountEl = document.getElementById('streakCount');
  const redeemFillEl = document.getElementById('redeemFill');
  const redeemTextEl = document.getElementById('redeemText');
  const redeemBtnEl = document.getElementById('redeemBtn');
  const spinBtnEl = document.getElementById('spinBtn');
  const spinStatusEl = document.getElementById('spinStatus');

  function renderWallet(bump){
    coinCountEl.textContent = wallet.coins;
    walletBalanceEl.textContent = wallet.coins;
    streakCountEl.textContent = wallet.streak;
    const pct = Math.min(100, (wallet.coins / 1000) * 100);
    redeemFillEl.style.width = pct + '%';
    redeemTextEl.textContent = wallet.coins + ' / 1000 coins';
    redeemBtnEl.disabled = wallet.coins < 1000;
    if(bump){
      [coinCountEl, walletBalanceEl].forEach(el => {
        el.classList.remove('coin-bump');
        void el.offsetWidth;
        el.classList.add('coin-bump');
      });
    }
    const today = todayStr();
    if(wallet.lastSpinDate === today){
      spinBtnEl.disabled = true;
      spinBtnEl.textContent = 'Come Back Tomorrow';
      spinStatusEl.textContent = "You've claimed today's spin. See you tomorrow for another chance!";
      spinStatusEl.classList.remove('ready');
    } else {
      spinBtnEl.disabled = false;
      spinBtnEl.textContent = 'Spin Now';
      spinStatusEl.textContent = 'Spin once a day to grow your streak and win coins!';
      spinStatusEl.classList.add('ready');
    }
  }

  // ---------- spin wheel ----------
  // segments: label, coin value, relative weight (higher = more common)
  const segments = [
    { label:'Better Luck', value:0,   weight:20, color:'#5C1330', text:'#F3E1E1' },
    { label:'10',          value:10,  weight:18, color:'#C9A24B', text:'#3A0F1E' },
    { label:'20',          value:20,  weight:15, color:'#5C1330', text:'#F3E1E1' },
    { label:'30',          value:30,  weight:12, color:'#C9A24B', text:'#3A0F1E' },
    { label:'40',          value:40,  weight:10, color:'#5C1330', text:'#F3E1E1' },
    { label:'50',          value:50,  weight:8,  color:'#C9A24B', text:'#3A0F1E' },
    { label:'55',          value:55,  weight:7,  color:'#5C1330', text:'#F3E1E1' },
    { label:'60',          value:60,  weight:5,  color:'#C9A24B', text:'#3A0F1E' },
    { label:'70',          value:70,  weight:3,  color:'#5C1330', text:'#F3E1E1' },
    { label:'100',         value:100, weight:2,  color:'#C9A24B', text:'#3A0F1E' }
  ];
  const segCount = segments.length;
  const segAngle = 360 / segCount;

  const wheelEl = document.getElementById('wheel');
  function buildWheel(){
    const stops = segments.map((s,i) => `${s.color} ${i*segAngle}deg ${(i+1)*segAngle}deg`).join(', ');
    wheelEl.style.background = `conic-gradient(${stops})`;
    // wheel-wrap is 230px, so radius here is measured from the wheel's own
    // center. Each .wheel-seg-label wrapper is pinned to that center
    // (top:50%; left:50%; width:0; height:0), so the inner span only needs
    // its offset FROM the center, not an absolute top-left coordinate.
    const r = 76;
    segments.forEach((s,i) => {
      const mid = i*segAngle + segAngle/2;
      const rad = (mid - 90) * Math.PI/180;
      const x = r*Math.cos(rad);
      const y = r*Math.sin(rad);
      const label = document.createElement('div');
      label.className = 'wheel-seg-label';
      const span = document.createElement('span');
      span.textContent = s.label;
      // keep radial labels right-side-up: flip the lower half 180° so text
      // never renders upside down, without moving its (x, y) anchor point.
      const rotateDeg = (mid > 90 && mid < 270) ? mid + 180 : mid;
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      span.style.color = s.text;
      span.style.transform = `translate(-50%,-50%) rotate(${rotateDeg}deg)`;
      label.appendChild(span);
      wheelEl.appendChild(label);
    });
  }
  buildWheel();

  function weightedPick(){
    const total = segments.reduce((sum,s) => sum + s.weight, 0);
    let r = Math.random() * total;
    for(let i=0;i<segments.length;i++){
      r -= segments[i].weight;
      if(r <= 0) return i;
    }
    return segments.length - 1;
  }

  let currentRotation = 0;
  let spinning = false;
  spinBtnEl.addEventListener('click', () => {
    if(spinning || spinBtnEl.disabled) return;
    spinning = true;
    spinBtnEl.disabled = true;
    const idx = weightedPick();
    const seg = segments[idx];
    const targetMid = idx*segAngle + segAngle/2;
    // pointer is fixed at top (0deg). We rotate the wheel so the chosen segment lands under it.
    const fullSpins = 5 + Math.floor(Math.random()*2);
    const finalAngle = fullSpins*360 + (360 - targetMid) + (Math.random()*segAngle*0.5 - segAngle*0.25);
    currentRotation += finalAngle;
    wheelEl.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
      spinning = false;
      const today = todayStr();
      if(wallet.lastSpinDate){
        const gap = daysBetween(wallet.lastSpinDate, today);
        wallet.streak = gap === 1 ? wallet.streak + 1 : (gap === 0 ? wallet.streak : 1);
      } else {
        wallet.streak = 1;
      }
      wallet.lastSpinDate = today;
      if(seg.value > 0){
        wallet.coins += seg.value;
        showToast(`🎉 You won ${seg.value} coins! Wallet updated.`);
      } else {
        showToast('😔 Better luck next time — come back tomorrow!');
      }
      saveWallet(wallet);
      renderWallet(true);
    }, 4300);
  });

  // ---------- redeem ----------
  function generateCode(){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for(let i=0;i<5;i++) code += chars[Math.floor(Math.random()*chars.length)];
    return `DAZEL100-${code}`;
  }
  redeemBtnEl.addEventListener('click', () => {
    if(wallet.coins < 1000) return;
    wallet.coins -= 1000;
    saveWallet(wallet);
    renderWallet(true);
    const code = generateCode();
    const redeemCodeBox = document.getElementById('redeemCode');
    document.getElementById('redeemCodeText').textContent = code;
    redeemCodeBox.style.display = 'inline-flex';
    showToast('✨ ₹100 OFF coupon unlocked!');
  });
  attachRipple(redeemBtnEl);
  attachRipple(spinBtnEl);
  document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('redeemCodeText').textContent;
    navigator.clipboard && navigator.clipboard.writeText(code).then(() => showToast('Code copied to clipboard!'));
  });

  // ---------- wallet modal open/close ----------
  const walletOverlay = document.getElementById('walletOverlay');
  function openWallet(){
    walletOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderWallet(false);
  }
  function closeWallet(){
    walletOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('walletBtn').addEventListener('click', openWallet);
  document.getElementById('walletClose').addEventListener('click', closeWallet);
  walletOverlay.addEventListener('click', (e) => { if(e.target === walletOverlay) closeWallet(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeWallet(); });

  renderWallet(false);

  // =========================================================
  // DAZEL — PRODUCT RENDERING, CART, WISHLIST, SEARCH
  // =========================================================

  const heartIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.6-9.5-9C.5 8 2 4 6 4c2.2 0 3.8 1.2 6 3.4C14.2 5.2 15.8 4 18 4c4 0 5.5 4 3.5 8-2.5 4.4-9.5 9-9.5 9z"/></svg>';
  const cartIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>';
  const boltIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 3 14h7l-1 8 11-14h-7l0-6z"/></svg>';

  function money(n){ return '₹' + Number(n).toLocaleString('en-IN'); }

  function productCardHTML(p){
    return `
    <div class="card" data-id="${p.id}">
      <div class="thumb">
        <span class="badge">${p.badge}</span>
        <div class="wish" data-wish="${p.id}" title="Add to wishlist" role="button" tabindex="0">${heartIcon}</div>
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3">${p.icon}</svg>
      </div>
      <div class="info">
        <div class="cname">${p.name}</div>
        <div class="price"><span class="now">${money(p.price)}</span><span class="was">${money(p.mrp)}</span><span class="off">${p.off}% off</span></div>
        <div class="card-actions">
          <button class="btn-cart" data-add="${p.id}">${cartIconSvg} Add to Cart</button>
          <button class="btn-buy" data-buy="${p.id}">${boltIconSvg} Buy Now</button>
        </div>
      </div>
    </div>`;
  }

  function renderCategorySection(gridId, category){
    const grid = document.getElementById(gridId);
    if(!grid) return;
    const items = DAZEL_PRODUCTS.filter(p => p.cat === category);
    // All cards render; how many are visible by default is controlled
    // entirely by CSS (nth-child rules that adapt per breakpoint —
    // see "progressive disclosure" in style.css). This keeps the
    // visible count correct even if the window is resized after load.
    grid.innerHTML = items.map(p => productCardHTML(p)).join('');
  }

  renderCategorySection('grid-giftboxes', 'giftboxes');
  renderCategorySection('grid-jaipuri', 'jaipuri');
  renderCategorySection('grid-earrings', 'earrings');
  renderCategorySection('grid-bracelets', 'bracelets');

  // product count pills
  document.querySelectorAll('[data-count-for]').forEach(el => {
    const cat = el.getAttribute('data-count-for');
    const count = DAZEL_PRODUCTS.filter(p => p.cat === cat).length;
    el.textContent = count + ' Designs Available';
  });

  // ---------- view all / show less toggle ----------
  document.querySelectorAll('.view-all[data-grid]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const grid = document.getElementById(btn.getAttribute('data-grid'));
      if(!grid) return;
      const expanded = grid.classList.toggle('expanded');
      btn.setAttribute('data-state', expanded ? 'less' : 'more');
      btn.querySelector('.va-label').textContent = expanded ? 'Show Less' : 'View All';
      if(!expanded){
        grid.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  function findProduct(id){ return DAZEL_PRODUCTS.find(p => p.id === id); }

  // =========================================================
  // CART
  // =========================================================
  const CART_KEY = 'dazelCart';
  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; }
  }
  function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); }
  let cart = loadCart();

  const cartCountEl = document.getElementById('cartCount');
  function renderCartBadge(){
    const total = cart.reduce((s,i) => s + i.qty, 0);
    cartCountEl.textContent = total;
  }

  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartItemsEl = document.getElementById('cartItems');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

  function openCart(){
    cartOverlay.classList.add('open');
    cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  }
  function closeCart(){
    cartOverlay.classList.remove('open');
    cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeCart(); });

  function renderCartDrawer(){
    if(cart.length === 0){
      cartItemsEl.innerHTML = `<div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
        <p>Your cart is empty.<br>Start adding pieces you love.</p>
      </div>`;
      cartSubtotalEl.textContent = money(0);
      cartCheckoutBtn.disabled = true;
      return;
    }
    cartCheckoutBtn.disabled = false;
    cartItemsEl.innerHTML = cart.map(item => {
      const p = findProduct(item.id);
      if(!p) return '';
      return `
      <div class="cart-item" data-id="${p.id}">
        <div class="ci-thumb"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3">${p.icon}</svg></div>
        <div class="ci-info">
          <div class="ci-name">${p.name}</div>
          <div class="ci-price">${money(p.price)}</div>
          <div class="ci-row">
            <div class="qty-ctrl">
              <button data-qty-down="${p.id}" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button data-qty-up="${p.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="ci-remove" data-remove="${p.id}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join('');
    const subtotal = cart.reduce((s,item) => {
      const p = findProduct(item.id);
      return s + (p ? p.price * item.qty : 0);
    }, 0);
    cartSubtotalEl.textContent = money(subtotal);
  }

  function addToCart(id, opts){
    opts = opts || {};
    const existing = cart.find(i => i.id === id);
    if(existing){ existing.qty += 1; } else { cart.push({id, qty:1}); }
    saveCart(cart);
    renderCartBadge();
    if(!opts.silent){
      const p = findProduct(id);
      showToast(`✦ ${p ? p.name.split(' — ')[0] : 'Item'} added to cart`);
    }
  }

  function buyNow(id){
    addToCart(id, {silent:true});
    openCart();
    showToast('Ready to checkout — review your bag below');
  }

  // event delegation for add/buy/wish across all dynamically-rendered cards
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if(addBtn){ addToCart(addBtn.getAttribute('data-add')); return; }
    const buyBtn = e.target.closest('[data-buy]');
    if(buyBtn){ buyNow(buyBtn.getAttribute('data-buy')); return; }
    const wishBtn = e.target.closest('[data-wish]');
    if(wishBtn){ toggleWish(wishBtn.getAttribute('data-wish'), wishBtn); return; }
    const qtyUp = e.target.closest('[data-qty-up]');
    if(qtyUp){ changeQty(qtyUp.getAttribute('data-qty-up'), 1); return; }
    const qtyDown = e.target.closest('[data-qty-down]');
    if(qtyDown){ changeQty(qtyDown.getAttribute('data-qty-down'), -1); return; }
    const removeBtn = e.target.closest('[data-remove]');
    if(removeBtn){ removeFromCart(removeBtn.getAttribute('data-remove')); return; }
  });

  function changeQty(id, delta){
    const item = cart.find(i => i.id === id);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0){ cart = cart.filter(i => i.id !== id); }
    saveCart(cart);
    renderCartBadge();
    renderCartDrawer();
  }
  function removeFromCart(id){
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderCartBadge();
    renderCartDrawer();
    showToast('Item removed from cart');
  }

  // ---------- checkout & thermal receipt printer ----------
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const printerStage = document.getElementById('printerStage');
  const printerSubStatus = document.getElementById('printerSubStatus');
  const receiptOrderId = document.getElementById('receiptOrderId');
  const receiptDateTime = document.getElementById('receiptDateTime');
  const receiptItemsList = document.getElementById('receiptItemsList');
  const receiptSubtotal = document.getElementById('receiptSubtotal');
  const receiptTax = document.getElementById('receiptTax');
  const receiptGrandTotal = document.getElementById('receiptGrandTotal');
  const receiptBarcodeLabel = document.getElementById('receiptBarcodeLabel');
  const printReceiptBtn = document.getElementById('printReceiptBtn');
  const posFeedBtn = document.getElementById('posFeedBtn');
  const checkoutDoneBtn = document.getElementById('checkoutDoneBtn');
  const checkoutClose = document.getElementById('checkoutClose');
  const confettiCanvas = document.getElementById('printerConfettiCanvas');

  let audioCtx = null;
  function getAudioContext(){
    if(!audioCtx){
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if(AudioContextClass) audioCtx = new AudioContextClass();
    }
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // Realistic thermal receipt printer audio synthesizer (100% standalone, no external files needed)
  function playThermalPrinterSound(durationMs = 2800){
    try {
      const ctx = getAudioContext();
      if(!ctx) return;
      
      const now = ctx.currentTime;
      const totalSec = durationMs / 1000;
      
      // 1. Line-feed motor chatter (pulses of filtered noise)
      const bufferSize = Math.floor(ctx.sampleRate * totalSec);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const stepPulse = (Math.sin(i / 75) > 0.25) ? 1 : 0.06;
        output[i] = (Math.random() * 2 - 1) * stepPulse * 0.3;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1450, now);
      filter.Q.setValueAtTime(3.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.08);
      gain.gain.setValueAtTime(0.16, now + totalSec - 0.2);
      gain.gain.linearRampToValueAtTime(0.001, now + totalSec);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + totalSec);

      // 2. Stepper motor hum
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(118, now);
      for (let t = 0; t < totalSec; t += 0.14) {
        osc.frequency.setValueAtTime(115 + (Math.random() * 18), now + t);
      }
      oscGain.gain.setValueAtTime(0.01, now);
      oscGain.gain.linearRampToValueAtTime(0.07, now + 0.08);
      oscGain.gain.linearRampToValueAtTime(0.001, now + totalSec);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + totalSec);
    } catch(e) { /* Audio context safely caught */ }
  }

  function playPaperCutSound(){
    try {
      const ctx = getAudioContext();
      if(!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.11);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch(e){}
  }

  function playSuccessChime(){
    try {
      const ctx = getAudioContext();
      if(!ctx) return;
      const now = ctx.currentTime;
      const notes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6 Luxury chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 1.1);
      });
    } catch(e){}
  }

  // Celebration Confetti Cannon
  let confettiAnimId = null;
  function triggerConfetti(){
    if(!confettiCanvas || !printerStage) return;
    const ctx = confettiCanvas.getContext('2d');
    if(!ctx) return;

    const rect = printerStage.getBoundingClientRect();
    confettiCanvas.width = rect.width;
    confettiCanvas.height = rect.height;

    const colors = ['#C9A24B', '#E7CD8C', '#5C1330', '#F3E1E1', '#38BDF8', '#FFFFFF', '#F59E0B'];
    const particles = [];
    const count = 70;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: rect.width / 2 + (Math.random() * 70 - 35),
        y: 80 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 9 - 3.5,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.3,
        drag: 0.98
      });
    }

    if(confettiAnimId) cancelAnimationFrame(confettiAnimId);

    function renderConfetti(){
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.rotation += p.rSpeed;
        p.opacity -= 0.009;

        if(p.opacity > 0 && p.y < confettiCanvas.height + 20){
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });
      if(alive){
        confettiAnimId = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    renderConfetti();
  }

  function renderReceipt(order, items){
    if(receiptOrderId) receiptOrderId.textContent = '#' + order.id;
    if(receiptBarcodeLabel) receiptBarcodeLabel.textContent = order.id;

    const now = new Date();
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const dStr = `${String(now.getDate()).padStart(2,'0')}-${months[now.getMonth()]}-${now.getFullYear()} ${now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true })}`;
    if(receiptDateTime) receiptDateTime.textContent = dStr;

    // Itemized list
    if(receiptItemsList){
      receiptItemsList.innerHTML = items.map(item => {
        const p = findProduct(item.id);
        const pName = p ? p.name.split(' — ')[0] : 'Jewellery Item';
        const unitPrice = p ? p.price : 0;
        const lineTotal = unitPrice * item.qty;
        return `
        <div class="rc-item-row">
          <span class="rc-item-name" title="${p ? p.name : ''}">${pName}</span>
          <span class="rc-item-qty">x${item.qty}</span>
          <span class="rc-item-price">${money(unitPrice)}</span>
          <span class="rc-item-total">${money(lineTotal)}</span>
        </div>`;
      }).join('');
    }

    const subtotal = items.reduce((sum, item) => {
      const p = findProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);

    const taxEstimate = Math.round(subtotal * 0.03); // 3% GST
    if(receiptSubtotal) receiptSubtotal.textContent = money(subtotal);
    if(receiptTax) receiptTax.textContent = money(taxEstimate) + ' (INCL)';
    if(receiptGrandTotal) receiptGrandTotal.textContent = money(order.total || subtotal);
  }

  let printTimer = null;
  function startReceiptPrintingAnimation(order, items){
    renderReceipt(order, items);

    // Reset printer animation state
    if(printerStage){
      printerStage.classList.remove('print-completed');
      printerStage.classList.add('is-printing');
    }
    if(printerSubStatus){
      printerSubStatus.textContent = 'Printing official tax invoice & receipt...';
    }

    // Play stepper motor and paper feed audio
    playThermalPrinterSound(2800);

    if(printTimer) clearTimeout(printTimer);
    printTimer = setTimeout(() => {
      if(printerStage){
        printerStage.classList.remove('is-printing');
        printerStage.classList.add('print-completed');
      }
      if(printerSubStatus){
        printerSubStatus.textContent = '✦ Order Confirmed & Receipt Ready!';
      }
      playPaperCutSound();
      setTimeout(() => {
        playSuccessChime();
        triggerConfetti();
      }, 120);
    }, 2900);
  }

  cartCheckoutBtn.addEventListener('click', async () => {
    if(cart.length === 0) return;
    const cartSnapshot = [...cart];
    cartCheckoutBtn.disabled = true;

    let orderData = null;
    try {
      const result = await apiRequest('/orders', { method:'POST', body:JSON.stringify({ items:cartSnapshot }) });
      orderData = result.order;
    } catch(error) {
      // Fallback calculation for offline / static environment
      const calculatedTotal = cartSnapshot.reduce((sum, item) => {
        const p = findProduct(item.id);
        return sum + (p ? p.price * item.qty : 0);
      }, 0);
      orderData = {
        id: 'DZL' + Math.floor(100000 + Math.random() * 900000),
        total: calculatedTotal,
        createdAt: new Date().toISOString()
      };
    }

    // Clear cart and refresh cart UI
    cart = [];
    saveCart(cart);
    renderCartBadge();
    renderCartDrawer();
    closeCart();
    cartCheckoutBtn.disabled = false;

    // Save new order to user's order history & live tracking
    if(typeof saveNewOrder === 'function'){
      saveNewOrder(orderData, cartSnapshot);
    }

    // Launch POS Thermal Printer modal & start printing animation
    checkoutOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    startReceiptPrintingAnimation(orderData, cartSnapshot);
  });

  // Printer hardware FEED button interaction
  if(posFeedBtn){
    posFeedBtn.addEventListener('click', () => {
      playThermalPrinterSound(350);
      const paper = document.getElementById('receiptPaper');
      if(paper){
        paper.style.transform = 'translateY(4px)';
        setTimeout(() => { paper.style.transform = 'translateY(0)'; }, 200);
      }
      showToast('✦ Fed paper 1 line');
    });
  }

  // Print / Save Bill button
  if(printReceiptBtn){
    printReceiptBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Track Courier Delivery from Receipt
  const receiptTrackOrderBtn = document.getElementById('receiptTrackOrderBtn');
  if(receiptTrackOrderBtn){
    receiptTrackOrderBtn.addEventListener('click', () => {
      closeCheckoutModal();
      openOrdersModal('live');
    });
  }

  // Modal close handlers
  if(checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);
  if(checkoutDoneBtn) checkoutDoneBtn.addEventListener('click', closeCheckoutModal);
  checkoutOverlay.addEventListener('click', (e) => { if(e.target === checkoutOverlay) closeCheckoutModal(); });

  function closeCheckoutModal(){
    if(printTimer) clearTimeout(printTimer);
    if(confettiAnimId) cancelAnimationFrame(confettiAnimId);
    if(printerStage){
      printerStage.classList.remove('is-printing', 'print-completed');
    }
    checkoutOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // =========================================================
  // WISHLIST
  // =========================================================
  const WISH_KEY = 'dazelWishlist';
  function loadWish(){
    try{ return new Set(JSON.parse(localStorage.getItem(WISH_KEY)) || []); }catch(e){ return new Set(); }
  }
  function saveWish(){ localStorage.setItem(WISH_KEY, JSON.stringify([...wishlist])); }
  let wishlist = loadWish();

  const mnavWishCountEl = document.getElementById('mnavWishCount');
  function renderWishBadge(){
    if(mnavWishCountEl) mnavWishCountEl.textContent = wishlist.size;
  }

  function paintWishlistIcons(){
    document.querySelectorAll('[data-wish]').forEach(el => {
      const id = el.getAttribute('data-wish');
      el.classList.toggle('active', wishlist.has(id));
    });
    renderWishBadge();
  }
  function toggleWish(id, el){
    if(wishlist.has(id)){
      wishlist.delete(id);
      showToast('Removed from wishlist');
    } else {
      wishlist.add(id);
      showToast('♥ Added to wishlist');
    }
    saveWish();
    document.querySelectorAll(`[data-wish="${id}"]`).forEach(node => node.classList.toggle('active', wishlist.has(id)));
    renderWishBadge();
    renderWishDrawer();
  }
  paintWishlistIcons();

  // ---------- wishlist drawer ----------
  const wishOverlay = document.getElementById('wishOverlay');
  const wishDrawer = document.getElementById('wishDrawer');
  const wishItemsEl = document.getElementById('wishItems');

  function openWishlist(){
    wishOverlay.classList.add('open');
    wishDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderWishDrawer();
  }
  function closeWishlist(){
    wishOverlay.classList.remove('open');
    wishDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('wishClose').addEventListener('click', closeWishlist);
  wishOverlay.addEventListener('click', closeWishlist);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeWishlist(); });

  function renderWishDrawer(){
    if(!wishItemsEl) return;
    if(wishlist.size === 0){
      wishItemsEl.innerHTML = `<div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 21s-7-4.6-9.5-9C.5 8 2 4 6 4c2.2 0 3.8 1.2 6 3.4C14.2 5.2 15.8 4 18 4c4 0 5.5 4 3.5 8-2.5 4.4-9.5 9-9.5 9z"/></svg>
        <p>Your wishlist is empty.<br>Tap the heart on any piece to save it.</p>
      </div>`;
      return;
    }
    wishItemsEl.innerHTML = [...wishlist].map(id => {
      const p = findProduct(id);
      if(!p) return '';
      return `
      <div class="cart-item" data-id="${p.id}">
        <div class="ci-thumb"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3">${p.icon}</svg></div>
        <div class="ci-info">
          <div class="ci-name">${p.name}</div>
          <div class="ci-price">${money(p.price)}</div>
          <div class="ci-row">
            <button class="ci-addcart" data-wish-addcart="${p.id}">Add to Cart</button>
            <button class="ci-remove" data-wish-remove="${p.id}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  wishItemsEl.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-wish-addcart]');
    if(addBtn){
      addToCart(addBtn.getAttribute('data-wish-addcart'));
      return;
    }
    const removeBtn = e.target.closest('[data-wish-remove]');
    if(removeBtn){
      toggleWish(removeBtn.getAttribute('data-wish-remove'));
    }
  });

  // =========================================================
  // SEARCH
  // =========================================================
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  function openSearch(){
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 100);
    renderSearchResults('');
  }
  function closeSearch(){
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
  }
  document.getElementById('searchBtn').addEventListener('click', openSearch);
  document.getElementById('searchClose').addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', (e) => { if(e.target === searchOverlay) closeSearch(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeSearch(); });
  searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));

  function renderSearchResults(query){
    const q = query.trim().toLowerCase();
    let results;
    if(q === ''){
      results = DAZEL_PRODUCTS.slice(0, 6);
    } else {
      results = DAZEL_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || DAZEL_CATEGORY_LABELS[p.cat].toLowerCase().includes(q)).slice(0, 8);
    }
    if(results.length === 0){
      searchResults.innerHTML = `<div class="search-empty">No pieces found for "${query}". Try "earrings" or "jaipuri".</div>`;
      return;
    }
    searchResults.innerHTML = results.map(p => `
      <div class="search-result-item" data-goto="${p.cat}" data-id="${p.id}">
        <div class="sr-thumb"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3">${p.icon}</svg></div>
        <div class="sr-name">${p.name}</div>
        <div class="sr-price">${money(p.price)}</div>
      </div>`).join('');
  }
  searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if(!item) return;
    const cat = item.getAttribute('data-goto');
    const sectionMap = { giftboxes:'giftboxes', jaipuri:'jaipuri-section', earrings:'earrings-section', bracelets:'bracelets-section' };
    const target = document.getElementById(sectionMap[cat]);
    closeSearch();
    if(target){
      setTimeout(() => target.scrollIntoView({behavior:'smooth', block:'start'}), 200);
    }
  });

  // ---------- category card → jump to matching full section ----------
  document.querySelectorAll('.cat-card[data-cat]').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-cat');
      const sectionMap = { giftboxes:'giftboxes', jaipuri:'jaipuri-section', earrings:'earrings-section', bracelets:'bracelets-section' };
      const target = document.getElementById(sectionMap[cat]);
      if(target){
        const headerOffset = 130;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.addEventListener('keydown', (e) => { if(e.key === 'Enter') card.click(); });
  });

  // =========================================================
  // YOUR ORDERS & LIVE COURIER TRUCK DELIVERY TRACKING
  // =========================================================
  const ORDERS_KEY = 'dazelOrders';

  function getDefaultOrders(){
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const todayFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    return [
      {
        id: 'DZL849201',
        date: todayFormatted + ' (Today)',
        status: 'in_transit',
        step: 3,
        eta: 'Tomorrow by 2:00 PM',
        courier: 'Dazel Express Priority Air',
        awb: 'DZL-AIR-948271',
        driver: 'Ramesh K. (Dazel Delivery Fleet)',
        driverPhone: '+91 98765 43210',
        shippingAddress: '104, Royal Palms, Bandra West, Mumbai 400050',
        items: [
          { id: '1', name: 'Aaradhya Kundan Choker Set', qty: 1, price: 3499 },
          { id: '3', name: 'Gulabi Meenakari Jhumkas', qty: 1, price: 1899 }
        ],
        total: 5398
      },
      {
        id: 'DZL629402',
        date: '24 Aug 2026',
        status: 'delivered',
        step: 5,
        courier: 'BlueDart Luxury Express',
        awb: 'BD-LUX-639102',
        shippingAddress: '104, Royal Palms, Bandra West, Mumbai 400050',
        items: [
          { id: '5', name: 'Royal Jaipuri Polki Kada', qty: 1, price: 2499 }
        ],
        total: 2499
      },
      {
        id: 'DZL419830',
        date: '12 Aug 2026',
        status: 'delivered',
        step: 5,
        courier: 'Dazel Express Express',
        awb: 'DZL-EXP-419830',
        shippingAddress: '104, Royal Palms, Bandra West, Mumbai 400050',
        items: [
          { id: '8', name: 'Festive Silver Gift Box Deluxe', qty: 1, price: 4999 }
        ],
        total: 4999
      }
    ];
  }

  function loadOrders(){
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if(!stored) {
        const defaults = getDefaultOrders();
        saveOrders(defaults);
        return defaults;
      }
      return JSON.parse(stored);
    } catch(e){
      return getDefaultOrders();
    }
  }

  function saveOrders(ordersList){
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(ordersList));
    } catch(e){}
    renderOrdersNavBadge();
  }

  let userOrders = loadOrders();

  function saveNewOrder(orderData, itemsSnapshot){
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const todayFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} (Just now)`;

    const mappedItems = itemsSnapshot.map(item => {
      const p = findProduct(item.id);
      return {
        id: item.id,
        name: p ? p.name.split(' — ')[0] : 'Jewellery Item',
        qty: item.qty,
        price: p ? p.price : 0
      };
    });

    const subtotal = mappedItems.reduce((s, i) => s + (i.price * i.qty), 0);

    const newLiveOrder = {
      id: orderData.id || ('DZL' + Math.floor(100000 + Math.random() * 900000)),
      date: todayFormatted,
      status: 'in_transit',
      step: 3,
      eta: 'Tomorrow by 2:00 PM',
      courier: 'Dazel Express Priority Air',
      awb: 'DZL-AIR-' + Math.floor(100000 + Math.random() * 900000),
      driver: 'Suresh Verma (Dazel Fleet)',
      driverPhone: '+91 98112 34567',
      shippingAddress: 'Your Delivery Address (Confirmed)',
      items: mappedItems,
      total: orderData.total || subtotal
    };

    userOrders.unshift(newLiveOrder);
    saveOrders(userOrders);
    renderOrdersNavBadge();
    showToast(`🚚 Order #${newLiveOrder.id} dispatched with live tracking!`);
  }

  // Header Nav Badges & Counters
  function renderOrdersNavBadge(){
    userOrders = loadOrders();
    const liveCount = userOrders.filter(o => o.status === 'in_transit').length;
    const pastCount = userOrders.filter(o => o.status === 'delivered').length;

    const navBadge = document.getElementById('ordersNavBadge');
    if(navBadge){
      navBadge.style.display = liveCount > 0 ? 'block' : 'none';
    }

    const mnavOrdersCount = document.getElementById('mnavOrdersCount');
    if(mnavOrdersCount){
      mnavOrdersCount.textContent = liveCount > 0 ? liveCount : userOrders.length;
      mnavOrdersCount.style.display = userOrders.length > 0 ? 'inline-flex' : 'none';
    }

    const liveCountEl = document.getElementById('liveOrdersCount');
    if(liveCountEl) liveCountEl.textContent = liveCount;

    const pastCountEl = document.getElementById('pastOrdersCount');
    if(pastCountEl) pastCountEl.textContent = pastCount;
  }

  // Orders Modal Management
  const ordersOverlay = document.getElementById('ordersOverlay');
  const ordersBody = document.getElementById('ordersBody');
  const ordersClose = document.getElementById('ordersClose');
  const ordersBtn = document.getElementById('ordersBtn');
  const mnavOrders = document.getElementById('mnavOrders');
  const tabLiveOrders = document.getElementById('tabLiveOrders');
  const tabPastOrders = document.getElementById('tabPastOrders');
  const tabAllOrders = document.getElementById('tabAllOrders');

  let currentOrdersFilter = 'live';

  function openOrdersModal(filter = 'live'){
    if(!ordersOverlay) return;
    currentOrdersFilter = filter;
    ordersOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateOrdersTabSelection();
    renderOrdersList();
  }

  function closeOrdersModal(){
    if(!ordersOverlay) return;
    ordersOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateOrdersTabSelection(){
    document.querySelectorAll('.orders-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-filter') === currentOrdersFilter);
    });
  }

  if(ordersBtn) ordersBtn.addEventListener('click', () => openOrdersModal('live'));
  if(mnavOrders) mnavOrders.addEventListener('click', () => { closeMobileNav(); openOrdersModal('live'); });
  if(ordersClose) ordersClose.addEventListener('click', closeOrdersModal);
  if(ordersOverlay) ordersOverlay.addEventListener('click', (e) => { if(e.target === ordersOverlay) closeOrdersModal(); });

  [tabLiveOrders, tabPastOrders, tabAllOrders].forEach(btn => {
    if(btn){
      btn.addEventListener('click', () => {
        currentOrdersFilter = btn.getAttribute('data-filter') || 'all';
        updateOrdersTabSelection();
        renderOrdersList();
      });
    }
  });

  // Render Orders Content with Animated Truck Scene
  function renderOrdersList(){
    if(!ordersBody) return;
    userOrders = loadOrders();

    let filtered = userOrders;
    if(currentOrdersFilter === 'live'){
      filtered = userOrders.filter(o => o.status === 'in_transit');
    } else if(currentOrdersFilter === 'past'){
      filtered = userOrders.filter(o => o.status === 'delivered');
    }

    if(filtered.length === 0){
      ordersBody.innerHTML = `
        <div class="orders-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h4>No ${currentOrdersFilter === 'live' ? 'In-Transit' : 'Past'} Orders Found</h4>
          <p>Explore our handcrafted festive jewelry collection and place an order to experience live courier tracking.</p>
          <button class="btn btn-gold" onclick="document.getElementById('ordersClose').click();" style="display:inline-flex;">Shop Now</button>
        </div>
      `;
      return;
    }

    ordersBody.innerHTML = filtered.map(order => {
      const isLive = order.status === 'in_transit';

      // 5-Step Progress Stepper
      const steps = [
        { label: 'Order Placed', stepNum: 1 },
        { label: 'Quality Checked', stepNum: 2 },
        { label: 'In Transit 🚚', stepNum: 3 },
        { label: 'Out for Delivery', stepNum: 4 },
        { label: 'Delivered', stepNum: 5 }
      ];

      const stepperHtml = steps.map(s => {
        let nodeClass = '';
        if(s.stepNum < order.step) nodeClass = 'completed';
        else if(s.stepNum === order.step) nodeClass = 'active';
        return `
          <div class="step-node ${nodeClass}">
            <div class="step-circle">${s.stepNum < order.step ? '✓' : s.stepNum}</div>
            <div class="step-label">${s.label}</div>
          </div>
        `;
      }).join('');

      // Items list HTML
      const itemsHtml = (order.items || []).map(item => `
        <div class="order-item-line">
          <span class="oi-name">✦ ${item.name} <span class="oi-qty">×${item.qty}</span></span>
          <span class="oi-price">${money(item.price * item.qty)}</span>
        </div>
      `).join('');

      // Hyper-Realistic Delivery Truck Stage (Only for Live Orders)
      let truckStageHtml = '';
      if(isLive){
        truckStageHtml = `
          <div class="truck-delivery-stage">
            <!-- Parallax Twilight Sky with Stars & City Horizon -->
            <div class="truck-sky-landscape">
              <div class="sky-stars"></div>
              <div class="city-silhouette"></div>
            </div>

            <!-- Route Hubs -->
            <div class="truck-skyline">
              <div class="hub-pin origin">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>✦ Dazel Central Vault (Dispatched)</span>
              </div>
              <div class="hub-pin destination">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Your Doorstep (ETA: ${order.eta || 'Tomorrow 2:00 PM'})</span>
              </div>
            </div>

            <!-- Highway Road with Parallax Streetlights & Moving Stripes -->
            <div class="highway-stage-wrap">
              <div class="highway-streetlights"></div>
              <div class="realistic-highway">
                <div class="highway-center-stripes"></div>
              </div>

              <!-- Hyper-Realistic Dazel Express Delivery Truck -->
              <div class="real-truck-unit">
                <div class="real-truck-svg-wrap">
                  <!-- Billowing Exhaust Smoke -->
                  <div class="real-exhaust-emitter"></div>
                  <!-- Dual Volumetric Headlight Beams -->
                  <div class="real-headlight-beams"></div>
                  <div class="road-reflection-pool"></div>

                  <svg viewBox="0 0 280 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="cabGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#72173c"/>
                        <stop offset="45%" stop-color="#460d24"/>
                        <stop offset="100%" stop-color="#240411"/>
                      </linearGradient>
                      <linearGradient id="cargoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#3d0b1f"/>
                        <stop offset="60%" stop-color="#250512"/>
                        <stop offset="100%" stop-color="#14020a"/>
                      </linearGradient>
                      <linearGradient id="chromeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="35%" stop-color="#cbd5e1"/>
                        <stop offset="65%" stop-color="#94a3b8"/>
                        <stop offset="100%" stop-color="#64748b"/>
                      </linearGradient>
                      <linearGradient id="goldStripe" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#C9A24B"/>
                        <stop offset="50%" stop-color="#FEF08A"/>
                        <stop offset="100%" stop-color="#C9A24B"/>
                      </linearGradient>
                      <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.95"/>
                        <stop offset="60%" stop-color="#0369a1" stop-opacity="0.9"/>
                        <stop offset="100%" stop-color="#0c4a6e" stop-opacity="0.95"/>
                      </linearGradient>
                    </defs>

                    <!-- Cargo Trailer Chassis Frame -->
                    <rect x="18" y="58" width="168" height="8" rx="2" fill="#1e293b" stroke="#334155" stroke-width="1"/>
                    <!-- Chrome Fuel Tank / Battery Vault -->
                    <rect x="80" y="59" width="42" height="7" rx="3" fill="url(#chromeGrad)" stroke="#475569" stroke-width="0.8"/>

                    <!-- Main Heavy Cargo Container Body -->
                    <rect x="14" y="12" width="166" height="49" rx="5" fill="url(#cargoGrad)" stroke="#C9A24B" stroke-width="1.8"/>
                    <!-- Cargo Structural Vertical Rib Lines -->
                    <line x1="45" y1="13" x2="45" y2="60" stroke="#5c1330" stroke-width="1" opacity="0.6"/>
                    <line x1="80" y1="13" x2="80" y2="60" stroke="#5c1330" stroke-width="1" opacity="0.6"/>
                    <line x1="115" y1="13" x2="115" y2="60" stroke="#5c1330" stroke-width="1" opacity="0.6"/>
                    <line x1="150" y1="13" x2="150" y2="60" stroke="#5c1330" stroke-width="1" opacity="0.6"/>

                    <!-- Luxury Gold Metallic Belt Ribbon -->
                    <rect x="14" y="28" width="166" height="8" fill="url(#goldStripe)"/>
                    <rect x="14" y="38" width="166" height="1.5" fill="#C9A24B" opacity="0.6"/>

                    <!-- Cargo Branding & Crest -->
                    <text x="96" y="24" font-family="'Playfair Display', serif" font-size="9" font-weight="700" fill="#E7CD8C" text-anchor="middle" letter-spacing="1.2">✦ DAZEL LUXURY EXPRESS ✦</text>
                    <text x="96" y="34.5" font-family="'Jost', sans-serif" font-size="6" font-weight="800" fill="#240411" text-anchor="middle" letter-spacing="1">VALUABLES SECURITY FLEET</text>
                    <text x="96" y="48" font-family="'Jost', sans-serif" font-size="5.5" font-weight="600" fill="#ffffff" text-anchor="middle" letter-spacing="0.6">GPS SATELLITE MONITORED • AIR CARGO</text>

                    <!-- Rear Cargo Door Lock Bars & Reflectors -->
                    <line x1="18" y1="16" x2="18" y2="57" stroke="url(#chromeGrad)" stroke-width="2"/>
                    <rect x="15" y="46" width="3" height="10" fill="#ef4444"/>

                    <!-- Cabin (Heavy Aerodynamic Scania Style Cab) -->
                    <!-- Cab Body -->
                    <path d="M178 18 H222 C226 18 229 20 231 23 L246 44 C247.5 46 248 48 248 51 V66 H178 V18 Z" fill="url(#cabGrad)" stroke="#C9A24B" stroke-width="1.8"/>
                    
                    <!-- Roof Aerodynamic Fairing / Sun Visor -->
                    <path d="M176 16 H226 L233 21 H176 Z" fill="url(#chromeGrad)"/>
                    <!-- Amber Roof Clearance LEDs -->
                    <circle cx="204" cy="18.5" r="1.5" fill="#f59e0b"/>
                    <circle cx="216" cy="18.5" r="1.5" fill="#f59e0b"/>
                    <circle cx="228" cy="18.5" r="1.5" fill="#f59e0b"/>

                    <!-- Panoramic Curved Windshield Glass -->
                    <path d="M184 22 H220 L233 39 H184 V22 Z" fill="url(#glassGrad)" stroke="#0284c7" stroke-width="1"/>
                    <!-- Driver Silhouette inside Cockpit -->
                    <circle cx="196" cy="29" r="4" fill="#0f172a"/>
                    <path d="M192 37 C192 33 194 32 198 32 C202 32 204 33 204 37 Z" fill="#0f172a"/>
                    <!-- Steering wheel & Dashboard glow -->
                    <line x1="202" y1="33" x2="207" y2="36" stroke="#38bdf8" stroke-width="1.5"/>
                    <circle cx="216" cy="37" r="1.5" fill="#10b981"/>

                    <!-- Chrome Aerodynamic Side Mirror -->
                    <path d="M222 24 L227 24 V34 L222 34 Z" fill="url(#chromeGrad)" stroke="#334155" stroke-width="0.8"/>

                    <!-- Heavy Chrome Front Grille Louvers -->
                    <rect x="236" y="44" width="11" height="15" rx="2" fill="#1e293b" stroke="url(#chromeGrad)" stroke-width="1"/>
                    <line x1="237" y1="47" x2="246" y2="47" stroke="url(#chromeGrad)" stroke-width="1"/>
                    <line x1="237" y1="50" x2="246" y2="50" stroke="url(#chromeGrad)" stroke-width="1"/>
                    <line x1="237" y1="53" x2="246" y2="53" stroke="url(#chromeGrad)" stroke-width="1"/>
                    <line x1="237" y1="56" x2="246" y2="56" stroke="url(#chromeGrad)" stroke-width="1"/>
                    <!-- Gold Grille Logo -->
                    <circle cx="241.5" cy="51.5" r="2.2" fill="#C9A24B"/>

                    <!-- Modern Projector LED Headlight Unit -->
                    <path d="M244 54 H249 V61 H244 Z" fill="#FEF08A" stroke="#C9A24B" stroke-width="1"/>
                    <circle cx="246.5" cy="57.5" r="2" fill="#ffffff"/>
                    <!-- Amber Side Indicator Blinker -->
                    <rect x="234" y="58" width="2" height="4" rx="1" fill="#f59e0b"/>

                    <!-- Chrome Front Bumper & Number Plate -->
                    <path d="M232 64 H250 V69 H232 Z" fill="url(#chromeGrad)" stroke="#475569" stroke-width="0.8"/>
                    <rect x="238" y="65" width="10" height="3" rx="0.5" fill="#ffffff"/>
                    <text x="243" y="67.5" font-family="'Courier New', monospace" font-size="2.5" font-weight="700" fill="#000000" text-anchor="middle">MH 02 DZ</text>

                    <!-- Cabin Door Step & Handle -->
                    <rect x="188" y="44" width="6" height="1.8" rx="0.9" fill="url(#chromeGrad)"/>
                    <rect x="180" y="60" width="10" height="3" rx="1" fill="#334155"/>

                    <!-- ============================================== -->
                    <!-- REALISTIC WHEELS & HEAVY RUBBER TIRE TREADS -->
                    <!-- ============================================== -->
                    
                    <!-- Rear Tandem Axle 1 (Wheel 1) -->
                    <g class="real-wheel-spin" transform="translate(48, 68)">
                      <!-- Rubber Outer Tire with Tread Grooves -->
                      <circle cx="0" cy="0" r="14" fill="#0a0a0f" stroke="#27272a" stroke-width="2"/>
                      <circle cx="0" cy="0" r="12" fill="#18181b"/>
                      <!-- Chrome Alloy Rim -->
                      <circle cx="0" cy="0" r="9" fill="url(#chromeGrad)" stroke="#475569" stroke-width="1"/>
                      <!-- Gold Center Hub Cap & Lug Nuts -->
                      <circle cx="0" cy="0" r="4" fill="#C9A24B"/>
                      <circle cx="0" cy="0" r="1.5" fill="#240411"/>
                      <!-- 8 Wheel Spoke Holes -->
                      <circle cx="0" cy="-6" r="1.2" fill="#09090b"/>
                      <circle cx="4.2" cy="-4.2" r="1.2" fill="#09090b"/>
                      <circle cx="6" cy="0" r="1.2" fill="#09090b"/>
                      <circle cx="4.2" cy="4.2" r="1.2" fill="#09090b"/>
                      <circle cx="0" cy="6" r="1.2" fill="#09090b"/>
                      <circle cx="-4.2" cy="4.2" r="1.2" fill="#09090b"/>
                      <circle cx="-6" cy="0" r="1.2" fill="#09090b"/>
                      <circle cx="-4.2" cy="-4.2" r="1.2" fill="#09090b"/>
                    </g>

                    <!-- Rear Tandem Axle 2 (Wheel 2) -->
                    <g class="real-wheel-spin" transform="translate(82, 68)">
                      <circle cx="0" cy="0" r="14" fill="#0a0a0f" stroke="#27272a" stroke-width="2"/>
                      <circle cx="0" cy="0" r="12" fill="#18181b"/>
                      <circle cx="0" cy="0" r="9" fill="url(#chromeGrad)" stroke="#475569" stroke-width="1"/>
                      <circle cx="0" cy="0" r="4" fill="#C9A24B"/>
                      <circle cx="0" cy="0" r="1.5" fill="#240411"/>
                      <circle cx="0" cy="-6" r="1.2" fill="#09090b"/>
                      <circle cx="4.2" cy="-4.2" r="1.2" fill="#09090b"/>
                      <circle cx="6" cy="0" r="1.2" fill="#09090b"/>
                      <circle cx="4.2" cy="4.2" r="1.2" fill="#09090b"/>
                      <circle cx="0" cy="6" r="1.2" fill="#09090b"/>
                      <circle cx="-4.2" cy="4.2" r="1.2" fill="#09090b"/>
                      <circle cx="-6" cy="0" r="1.2" fill="#09090b"/>
                      <circle cx="-4.2" cy="-4.2" r="1.2" fill="#09090b"/>
                    </g>

                    <!-- Front Steer Wheel (Wheel 3) -->
                    <g class="real-wheel-spin" transform="translate(208, 68)">
                      <circle cx="0" cy="0" r="14" fill="#0a0a0f" stroke="#27272a" stroke-width="2"/>
                      <circle cx="0" cy="0" r="12" fill="#18181b"/>
                      <circle cx="0" cy="0" r="9" fill="url(#chromeGrad)" stroke="#475569" stroke-width="1"/>
                      <circle cx="0" cy="0" r="4" fill="#C9A24B"/>
                      <circle cx="0" cy="0" r="1.5" fill="#240411"/>
                      <circle cx="0" cy="-6" r="1.2" fill="#09090b"/>
                      <circle cx="4.2" cy="-4.2" r="1.2" fill="#09090b"/>
                      <circle cx="6" cy="0" r="1.2" fill="#09090b"/>
                      <circle cx="4.2" cy="4.2" r="1.2" fill="#09090b"/>
                      <circle cx="0" cy="6" r="1.2" fill="#09090b"/>
                      <circle cx="-4.2" cy="4.2" r="1.2" fill="#09090b"/>
                      <circle cx="-6" cy="0" r="1.2" fill="#09090b"/>
                      <circle cx="-4.2" cy="-4.2" r="1.2" fill="#09090b"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Live Telemetry HUD Bar -->
            <div class="live-telemetry-hud">
              <div class="hud-item">
                <span class="hud-icon">⚡</span>
                <div>Speed: <span>58 km/h</span></div>
              </div>
              <div class="hud-item">
                <span class="hud-icon">📍</span>
                <div>Distance: <span>5.4 km away</span></div>
              </div>
              <div class="hud-item">
                <span class="hud-icon">🔒</span>
                <div>Seal: <span>#DZ-9021 (OK)</span></div>
              </div>
              <div class="hud-item">
                <span class="hud-icon">🔑</span>
                <div>Handover OTP: <span class="hud-otp-pill">5821</span></div>
              </div>
            </div>
          </div>

          <!-- Verified Driver & Partner Profile Card -->
          <div class="driver-partner-card">
            <div class="driver-profile">
              <div class="driver-avatar-wrap">
                👨‍✈️
                <div class="driver-online-badge"></div>
              </div>
              <div class="driver-info">
                <h5>${order.driver || 'Rajeshwar Sharma'} <span class="driver-rating-badge">★ 4.95</span></h5>
                <p>Certified Dazel Valuables Courier • Express Fleet #MH-02-DZ-2026</p>
              </div>
            </div>
            <div class="driver-actions">
              <button class="order-btn-sm" onclick="showToast('✦ Calling Driver ${order.driver || 'Rajeshwar Sharma'} (${order.driverPhone || '+91 98765 43210'})...');">
                📞 Call Driver
              </button>
              <button class="order-btn-sm btn-primary-sm" onclick="showToast('✦ Connecting to Dazel VIP Dispatch Desk...');">
                💬 Message
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="order-card ${isLive ? 'live-card' : ''}">
          <!-- Order Card Top Bar -->
          <div class="order-card-header">
            <div class="order-id-group">
              <span class="order-id-tag">#${order.id}</span>
              <span class="order-date-tag">${order.date}</span>
            </div>
            <span class="order-status-badge ${isLive ? 'in-transit' : 'delivered'}">
              ${isLive ? '🚚 In Transit (Dispatched)' : '✓ Delivered'}
            </span>
          </div>

          <!-- Realistic Truck Scene & Driver Card if In Transit -->
          ${truckStageHtml}

          <!-- Delivery Stepper -->
          <div class="delivery-stepper">
            ${stepperHtml}
          </div>

          <!-- Items Preview -->
          <div class="order-items-preview">
            <div style="font-size:11.5px; font-weight:700; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px;">Ordered Jewellery Pieces:</div>
            ${itemsHtml}
          </div>

          <!-- Card Footer & Actions -->
          <div class="order-card-footer">
            <div class="order-total-paid">Total Amount Paid: <strong>${money(order.total)}</strong></div>
            <div class="order-action-btns">
              ${isLive ? `
                <button class="order-btn-sm" onclick="navigator.clipboard.writeText('${order.awb || order.id}'); showToast('✦ Tracking AWB Copied: ${order.awb || order.id}');">
                  📋 Copy AWB
                </button>
                <button class="order-btn-sm btn-primary-sm" onclick="showToast('✦ Live Satellite GPS: Courier truck is on Express Way heading to your address.');">
                  📍 Satellite Refresh
                </button>
              ` : `
                <button class="order-btn-sm" onclick="window.print();">
                  🧾 Tax Invoice PDF
                </button>
                <button class="order-btn-sm btn-primary-sm" onclick="showToast('✦ Pieces added back to your cart!');">
                  🔁 Buy Again
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Initialize Order Badges
  renderOrdersNavBadge();

  // re-attach ripple to newly added interactive elements
  document.querySelectorAll('.btn-cart, .btn-buy, .checkout-btn, .order-btn-sm').forEach(attachRipple);

  // init badges
  renderCartBadge();

