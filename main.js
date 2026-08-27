// =========================================================
// DAZEL — MAIN SCRIPT
// Loaded after products.js. Handles page interactions,
// wallet/spin-wheel, auth modal, mobile nav, cart, wishlist,
// search, and category navigation.
// =========================================================
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

  // auth modal
  const overlay = document.getElementById('authOverlay');
  const panel = document.getElementById('authPanel');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const submitBtn = document.getElementById('authSubmitBtn');

  function openModal(mode){
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setMode(mode || 'login');
  }
  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function setMode(mode){
    if(mode === 'signup'){
      panel.classList.add('mode-signup');
      tabSignup.classList.add('active'); tabLogin.classList.remove('active');
      submitBtn.textContent = 'Create Account';
    } else {
      panel.classList.remove('mode-signup');
      tabLogin.classList.add('active'); tabSignup.classList.remove('active');
      submitBtn.textContent = 'Log In';
    }
  }

  document.getElementById('accountBtn').addEventListener('click', () => openModal('login'));
  document.getElementById('authClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });
  tabLogin.addEventListener('click', () => setMode('login'));
  tabSignup.addEventListener('click', () => setMode('signup'));
  document.getElementById('switchToSignup').addEventListener('click', (e) => { e.preventDefault(); setMode('signup'); });
  document.getElementById('switchToLogin').addEventListener('click', (e) => { e.preventDefault(); setMode('login'); });

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

  function productCardHTML(p, isExtra){
    return `
    <div class="card${isExtra ? ' hidden-extra' : ''}" data-id="${p.id}">
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

  function renderCategorySection(gridId, category, visibleCount){
    const grid = document.getElementById(gridId);
    if(!grid) return;
    const items = DAZEL_PRODUCTS.filter(p => p.cat === category);
    grid.innerHTML = items.map((p,i) => productCardHTML(p, i >= visibleCount)).join('');
  }

  renderCategorySection('grid-giftboxes', 'giftboxes', 8);
  renderCategorySection('grid-jaipuri', 'jaipuri', 8);
  renderCategorySection('grid-earrings', 'earrings', 8);
  renderCategorySection('grid-bracelets', 'bracelets', 8);

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

  // ---------- checkout ----------
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  cartCheckoutBtn.addEventListener('click', () => {
    if(cart.length === 0) return;
    const orderId = 'DZL' + Math.floor(100000 + Math.random()*899999);
    document.getElementById('checkoutOrderId').textContent = orderId;
    const subtotal = cart.reduce((s,item) => {
      const p = findProduct(item.id);
      return s + (p ? p.price * item.qty : 0);
    }, 0);
    document.getElementById('checkoutTotal').textContent = money(subtotal);
    cart = [];
    saveCart(cart);
    renderCartBadge();
    renderCartDrawer();
    closeCart();
    checkoutOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  document.getElementById('checkoutClose').addEventListener('click', closeCheckoutModal);
  checkoutOverlay.addEventListener('click', (e) => { if(e.target === checkoutOverlay) closeCheckoutModal(); });
  function closeCheckoutModal(){
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

  // re-attach ripple to newly added interactive elements
  document.querySelectorAll('.btn-cart, .btn-buy, .checkout-btn').forEach(attachRipple);

  // init badges
  renderCartBadge();
