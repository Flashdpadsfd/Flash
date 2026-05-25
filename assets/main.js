/* Nexus Theme — SellAuth Edition */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }

  /* ─── Drawer ─── */
  function openDrawer() {
    var d = $('drawer'), ov = $('drawerOverlay');
    if (d)  d.classList.add('open');
    if (ov) ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    var d = $('drawer'), ov = $('drawerOverlay');
    if (d)  d.classList.remove('open');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  }
  var hb = $('hamburger'), dc = $('drawerClose'), dov = $('drawerOverlay');
  if (hb)  hb.addEventListener('click', openDrawer);
  if (dc)  dc.addEventListener('click', closeDrawer);
  if (dov) dov.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var h = link.getAttribute('href') || '';
      if (!h.startsWith('#') || h.length <= 1) { closeDrawer(); return; }
      e.preventDefault();
      try { var sec = document.querySelector(h); if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' }); } catch (er) {}
      closeDrawer();
    });
  });

  /* ─── Nav scroll ─── */
  var navbar = document.querySelector('.nav');
  if (navbar) window.addEventListener('scroll', function () {
    navbar.classList[window.scrollY > 20 ? 'add' : 'remove']('scrolled');
  }, { passive: true });

  /* ─── Product card click → product detail page ─── */
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.product-card');
    if (!card) return;
    var productId = card.dataset.productId;
    if (productId) window.location.href = 'preview-product.html?id=' + productId;
  });

  /* ─── Escape ─── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      var inp = $('searchInput');
      if (inp) { e.preventDefault(); inp.focus(); }
    }
  });

  /* ─── Search / Filter / Sort ─── */
  var productGrid  = $('productGrid');
  var searchInput  = $('searchInput');
  var sortSelect   = $('sortSelect');
  var resultsCount = $('resultsCount');
  var activeCat    = 'all';
  var searchQuery  = '';

  function filterAndSort() {
    if (!productGrid) return;
    var cards = Array.from(productGrid.querySelectorAll('.product-card'));
    var visible = [];
    cards.forEach(function (card) {
      var name = (card.dataset.name || '').toLowerCase();
      var cat  = (card.dataset.cat  || '').toLowerCase();
      var ok   = (activeCat === 'all' || cat === activeCat) && (!searchQuery || name.indexOf(searchQuery) !== -1);
      card.classList[ok ? 'remove' : 'add']('hidden');
      if (ok) visible.push(card);
    });
    var val = sortSelect ? sortSelect.value : 'default';
    visible.sort(function (a, b) {
      if (val === 'price-asc')  return parseFloat(a.dataset.price || 0) - parseFloat(b.dataset.price || 0);
      if (val === 'price-desc') return parseFloat(b.dataset.price || 0) - parseFloat(a.dataset.price || 0);
      if (val === 'name')       return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      return 0;
    });
    visible.forEach(function (c) { productGrid.appendChild(c); });
    if (resultsCount) resultsCount.textContent = visible.length + ' product' + (visible.length !== 1 ? 's' : '');
    var empty = productGrid.querySelector('.empty-state');
    if (!visible.length) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = '<div class="empty-state__icon">🔍</div>'
          + '<div class="empty-state__title">No products found</div>'
          + '<div class="empty-state__sub">Try a different search or category</div>';
        productGrid.appendChild(empty);
      }
    } else { if (empty) empty.parentNode.removeChild(empty); }
  }

  if (searchInput) {
    var dbt;
    searchInput.addEventListener('input', function () {
      clearTimeout(dbt);
      dbt = setTimeout(function () { searchQuery = searchInput.value.trim().toLowerCase(); filterAndSort(); }, 200);
    });
  }
  if (sortSelect) sortSelect.addEventListener('change', filterAndSort);

  document.querySelectorAll('.sidebar__item[data-cat]').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.sidebar__item').forEach(function (i) { i.classList.remove('active'); });
      item.classList.add('active');
      activeCat = item.dataset.cat;
      var ttl = $('pageTitle');
      if (ttl) ttl.textContent = item.dataset.label || 'All Products';
      filterAndSort();
    });
  });

  /* ─── Sidebar section toggle ─── */
  window.toggleSection = function (id) {
    var el = document.getElementById(id);
    if (el) { var s = el.closest('.sidebar__section'); if (s) s.classList.toggle('collapsed'); }
  };

  /* ─── i18n ─── */
  var TRANSLATIONS = {
    EN: {
      'nav.shop':'Shop','nav.home':'Home','nav.reviews':'Reviews',
      'nav.login':'Sign In','nav.register':'Create Account',
      'hero.eyebrow':'Digital Products Store',
      'hero.title':'Premium. Curated.<br>Digital.',
      'hero.sub':'Paying full price for a streaming service you use three times a week is a bad deal. We sell the same thing for less, no catch.',
      'hero.cta1':'Explore Products','hero.cta2':'Join Discord →',
      'stats.rating':'Avg. Rating','stats.sold':'Products Sold','stats.customers':'Total Customers',
      'footer.desc':'Premium streaming accounts,<br>delivered instantly.',
      'footer.nav':'Navigation','footer.home':'Home','footer.products':'Products','footer.feedback':'Feedback',
      'footer.legal':'Legal','footer.tos':'Terms of Service',
      'footer.socials':'Socials',
      'footer.copy':'© 2026 Nexus. All rights reserved.',
      'footer.terms':'Terms','footer.privacy':'Privacy'
    },
    FR: {
      'nav.shop':'Boutique','nav.home':'Accueil','nav.reviews':'Avis',
      'nav.login':'Connexion','nav.register':'Créer un compte',
      'hero.eyebrow':'Boutique de Produits Numériques',
      'hero.title':'Premium. Soigné.<br>Digital.',
      'hero.sub':'Payer plein tarif pour un service de streaming que vous utilisez trois fois par semaine est une mauvaise affaire. Nous vendons la même chose moins cher, sans prise de tête.',
      'hero.cta1':'Explorer les produits','hero.cta2':'Rejoindre Discord →',
      'stats.rating':'Note Moyenne','stats.sold':'Produits Vendus','stats.customers':'Clients Totaux',
      'footer.desc':'Comptes streaming premium,<br>livrés instantanément.',
      'footer.nav':'Navigation','footer.home':'Accueil','footer.products':'Produits','footer.feedback':'Avis',
      'footer.legal':'Légal','footer.tos':'Conditions d\'utilisation',
      'footer.socials':'Réseaux sociaux',
      'footer.copy':'© 2026 Nexus. Tous droits réservés.',
      'footer.terms':'CGU','footer.privacy':'Confidentialité'
    },
    ES: {
      'nav.shop':'Tienda','nav.home':'Inicio','nav.reviews':'Reseñas',
      'nav.login':'Iniciar sesión','nav.register':'Crear cuenta',
      'hero.eyebrow':'Tienda de Productos Digitales',
      'hero.title':'Premium. Curado.<br>Digital.',
      'hero.sub':'Pagar el precio completo por un servicio de streaming que usas tres veces por semana es un mal trato. Vendemos lo mismo por menos, sin trampa.',
      'hero.cta1':'Explorar productos','hero.cta2':'Unirse a Discord →',
      'stats.rating':'Valoración Media','stats.sold':'Productos Vendidos','stats.customers':'Clientes Totales',
      'footer.desc':'Cuentas de streaming premium,<br>entregadas al instante.',
      'footer.nav':'Navegación','footer.home':'Inicio','footer.products':'Productos','footer.feedback':'Reseñas',
      'footer.legal':'Legal','footer.tos':'Términos de servicio',
      'footer.socials':'Redes sociales',
      'footer.copy':'© 2026 Nexus. Todos los derechos reservados.',
      'footer.terms':'Términos','footer.privacy':'Privacidad'
    },
    DE: {
      'nav.shop':'Shop','nav.home':'Startseite','nav.reviews':'Bewertungen',
      'nav.login':'Anmelden','nav.register':'Konto erstellen',
      'hero.eyebrow':'Digitale Produkte Shop',
      'hero.title':'Premium. Kuratiert.<br>Digital.',
      'hero.sub':'Den vollen Preis für einen Streaming-Dienst zu zahlen, den du dreimal pro Woche nutzt, ist kein guter Deal. Wir verkaufen dasselbe für weniger – ohne Haken.',
      'hero.cta1':'Produkte erkunden','hero.cta2':'Discord beitreten →',
      'stats.rating':'Ø Bewertung','stats.sold':'Verkaufte Produkte','stats.customers':'Kunden gesamt',
      'footer.desc':'Premium-Streaming-Konten,<br>sofort geliefert.',
      'footer.nav':'Navigation','footer.home':'Startseite','footer.products':'Produkte','footer.feedback':'Bewertungen',
      'footer.legal':'Rechtliches','footer.tos':'Nutzungsbedingungen',
      'footer.socials':'Soziale Netzwerke',
      'footer.copy':'© 2026 Nexus. Alle Rechte vorbehalten.',
      'footer.terms':'AGB','footer.privacy':'Datenschutz'
    },
    IT: {
      'nav.shop':'Negozio','nav.home':'Home','nav.reviews':'Recensioni',
      'nav.login':'Accedi','nav.register':'Crea account',
      'hero.eyebrow':'Negozio di Prodotti Digitali',
      'hero.title':'Premium. Curato.<br>Digitale.',
      'hero.sub':'Pagare il prezzo pieno per un servizio di streaming che usi tre volte a settimana è un cattivo affare. Vendiamo la stessa cosa a meno, senza trucchi.',
      'hero.cta1':'Esplora prodotti','hero.cta2':'Unisciti a Discord →',
      'stats.rating':'Voto Medio','stats.sold':'Prodotti Venduti','stats.customers':'Clienti Totali',
      'footer.desc':'Account streaming premium,<br>consegnati istantaneamente.',
      'footer.nav':'Navigazione','footer.home':'Home','footer.products':'Prodotti','footer.feedback':'Recensioni',
      'footer.legal':'Legale','footer.tos':'Termini di servizio',
      'footer.socials':'Social',
      'footer.copy':'© 2026 Nexus. Tutti i diritti riservati.',
      'footer.terms':'Termini','footer.privacy':'Privacy'
    },
    PT: {
      'nav.shop':'Loja','nav.home':'Início','nav.reviews':'Avaliações',
      'nav.login':'Entrar','nav.register':'Criar conta',
      'hero.eyebrow':'Loja de Produtos Digitais',
      'hero.title':'Premium. Curado.<br>Digital.',
      'hero.sub':'Pagar o preço cheio por um serviço de streaming que você usa três vezes por semana é um mau negócio. Vendemos a mesma coisa por menos, sem pegadinhas.',
      'hero.cta1':'Explorar produtos','hero.cta2':'Entrar no Discord →',
      'stats.rating':'Avaliação Média','stats.sold':'Produtos Vendidos','stats.customers':'Clientes Totais',
      'footer.desc':'Contas de streaming premium,<br>entregues instantaneamente.',
      'footer.nav':'Navegação','footer.home':'Início','footer.products':'Produtos','footer.feedback':'Avaliações',
      'footer.legal':'Legal','footer.tos':'Termos de serviço',
      'footer.socials':'Redes sociais',
      'footer.copy':'© 2026 Nexus. Todos os direitos reservados.',
      'footer.terms':'Termos','footer.privacy':'Privacidade'
    },
    AR: {
      'nav.shop':'المتجر','nav.home':'الرئيسية','nav.reviews':'التقييمات',
      'nav.login':'تسجيل الدخول','nav.register':'إنشاء حساب',
      'hero.eyebrow':'متجر المنتجات الرقمية',
      'hero.title':'متميز. منتقى.<br>رقمي.',
      'hero.sub':'دفع السعر الكامل لخدمة بث تستخدمها ثلاث مرات في الأسبوع أمر غير مجدٍ. نحن نبيع نفس الشيء بأقل، بدون أي مقابل خفي.',
      'hero.cta1':'استكشف المنتجات','hero.cta2':'انضم إلى Discord →',
      'stats.rating':'متوسط التقييم','stats.sold':'المنتجات المباعة','stats.customers':'إجمالي العملاء',
      'footer.desc':'حسابات بث متميزة،<br>تُسلَّم فوراً.',
      'footer.nav':'التنقل','footer.home':'الرئيسية','footer.products':'المنتجات','footer.feedback':'التقييمات',
      'footer.legal':'القانوني','footer.tos':'شروط الخدمة',
      'footer.socials':'التواصل الاجتماعي',
      'footer.copy':'© 2026 Nexus. جميع الحقوق محفوظة.',
      'footer.terms':'الشروط','footer.privacy':'الخصوصية'
    }
  };

  function applyLang(lang) {
    var t = TRANSLATIONS[lang] || TRANSLATIONS.EN;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { if (t[el.dataset.i18n] !== undefined) el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { if (t[el.dataset.i18nHtml] !== undefined) el.innerHTML = t[el.dataset.i18nHtml]; });
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
  }

  var lt = $('langToggle'), ld = $('langDropdown'), ll = $('langLabel');
  if (lt && ld) {
    lt.addEventListener('click', function (e) { e.stopPropagation(); ld.classList.toggle('open'); });
    ld.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        var lang = opt.dataset.lang;
        if (ll) ll.textContent = lang;
        ld.querySelectorAll('.lang-option').forEach(function (o) { o.classList[o === opt ? 'add' : 'remove']('selected'); });
        ld.classList.remove('open');
        try { localStorage.setItem('nexus_lang', lang); } catch(e2) {}
        applyLang(lang);
      });
    });
    document.addEventListener('click', function () { ld.classList.remove('open'); });
  }

  /* ─── Animations ─── */
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.add('loaded'); }); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ─── Pagination ─── */
  document.querySelectorAll('.page-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.page-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* Restore saved language on every page load */
  (function () {
    var saved = 'EN';
    try { saved = localStorage.getItem('nexus_lang') || 'EN'; } catch(e) {}
    if (!TRANSLATIONS[saved]) saved = 'EN';
    if (ll) ll.textContent = saved;
    if (ld) ld.querySelectorAll('.lang-option').forEach(function (o) {
      o.classList[o.dataset.lang === saved ? 'add' : 'remove']('selected');
    });
    applyLang(saved);
  })();
  filterAndSort();
  window._nexusFilterAndSort = filterAndSort;

  /* ─── Cart ─── */
  var CART_SYM = { EUR:'€', USD:'$', GBP:'£' };
  function getCart() { try { return JSON.parse(localStorage.getItem('nexus_cart')) || []; } catch(e) { return []; } }
  function saveCart(c) { localStorage.setItem('nexus_cart', JSON.stringify(c)); }

  function updateCartCount() {
    var n = getCart().reduce(function(s,i){ return s+i.qty; }, 0);
    var el = document.getElementById('cartCount');
    if (el) el.textContent = n;
  }
  window._nexusUpdateCartCount = updateCartCount;

  window._renderCartPanel = function() {
    var cart  = getCart();
    var body  = document.getElementById('cartBody');
    var foot  = document.getElementById('cartFooter');
    var cntEl = document.getElementById('cartPanelCount');
    if (!body) return;
    var total = cart.reduce(function(s,i){ return s+i.price*i.qty; }, 0);
    var sym   = cart.length ? (CART_SYM[cart[0].currency] || '$') : '$';
    if (cntEl) cntEl.textContent = cart.length ? '('+cart.reduce(function(s,i){ return s+i.qty; }, 0)+')' : '';
    if (!cart.length) {
      body.innerHTML = '<div style="text-align:center;padding:60px 24px;color:rgba(255,255,255,.3);font-size:14px;">Your cart is empty</div>';
      if (foot) foot.innerHTML = '';
      return;
    }
    body.innerHTML = cart.map(function(item, idx) {
      var s = CART_SYM[item.currency] || '$';
      return '<div class="cart-panel__item">'+
        '<span class="cart-panel__item-icon">'+item.icon+'</span>'+
        '<div class="cart-panel__item-info">'+
          '<div class="cart-panel__item-name">'+item.name+'</div>'+
          '<div class="cart-panel__item-meta">Qty: '+item.qty+' &nbsp;·&nbsp; '+s+Number(item.price).toFixed(2)+' each</div>'+
        '</div>'+
        '<div style="text-align:right;flex-shrink:0">'+
          '<div class="cart-panel__item-price">'+s+Number(item.price*item.qty).toFixed(2)+'</div>'+
          '<button class="cart-panel__item-remove" data-cidx="'+idx+'">Remove</button>'+
        '</div>'+
      '</div>';
    }).join('');
    body.querySelectorAll('.cart-panel__item-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var c2 = getCart(); c2.splice(parseInt(btn.dataset.cidx, 10), 1); saveCart(c2);
        updateCartCount(); window._renderCartPanel();
      });
    });
    if (foot) {
      foot.innerHTML =
        '<button class="cart-panel__checkout" id="cartCheckoutBtn">Checkout — '+sym+total.toFixed(2)+'</button>'+
        '<button class="cart-panel__clear" id="cartClearBtn">Clear cart</button>';
      var cb = document.getElementById('cartCheckoutBtn');
      if (cb) cb.addEventListener('click', function() {
        var c = getCart();
        if (c[0] && window._nexusOpenCheckout) { if (window._closeCart) window._closeCart(); window._nexusOpenCheckout(c[0].id); }
      });
      var clr = document.getElementById('cartClearBtn');
      if (clr) clr.addEventListener('click', function() { saveCart([]); updateCartCount(); window._renderCartPanel(); });
    }
  };

  window._nexusToast = function(msg, icon) {
    var tc = document.getElementById('toastContainer');
    if (!tc) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="toast__icon">'+(icon||'✅')+'</span><span>'+String(msg).replace(/</g,'&lt;')+'</span>';
    tc.appendChild(t);
    setTimeout(function() { t.classList.add('hide'); setTimeout(function() { t.parentNode && t.parentNode.removeChild(t); }, 250); }, 3000);
  };

  updateCartCount();
  window.addEventListener('storage', function(e) { if (e.key === 'nexus_cart') updateCartCount(); });

  /* ─── Invoice / Checkout system ─── */
  (function () {
    var SYM = { EUR: '€', USD: '$', GBP: '£' };
    function escH(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function generateId() {
      var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', id = 'NX-';
      for (var i = 0; i < 8; i++) id += c[Math.floor(Math.random() * c.length)];
      return id;
    }
    function getProds() {
      var D = [
        {id:1,name:'Netflix Premium',price:4.99,icon:'🎬',desc:'1 Month · 4K UHD · Shared',deliverables:[],stock:50,currency:'EUR'},
        {id:2,name:'Spotify Premium',price:8.99,icon:'🎵',desc:'3 Months · Family Plan',deliverables:[],stock:32,currency:'EUR'},
        {id:3,name:'Xbox Game Pass',price:6.99,icon:'🎮',desc:'1 Month · Ultimate',deliverables:[],stock:18,currency:'EUR'},
        {id:4,name:'NordVPN',price:12.99,icon:'🔒',desc:'6 Months · Premium',deliverables:[],stock:7,currency:'EUR'},
        {id:5,name:'Disney+',price:3.99,icon:'📺',desc:'1 Month · 4K · Shared',deliverables:[],stock:45,currency:'EUR'},
        {id:6,name:'Adobe Creative Cloud',price:19.99,icon:'🎨',desc:'1 Month · All Apps',deliverables:[],stock:0,currency:'EUR'}
      ];
      try { return JSON.parse(localStorage.getItem('nexus_products')) || D; } catch(e) { return D; }
    }
    function saveProds(p) { localStorage.setItem('nexus_products', JSON.stringify(p)); }
    function getOrders() { try { return JSON.parse(localStorage.getItem('nexus_orders')) || []; } catch(e) { return []; } }
    function addOrder(o) { var a = getOrders(); a.unshift(o); localStorage.setItem('nexus_orders', JSON.stringify(a)); }

    /* inject modal HTML */
    var _html = '<div class="co-overlay" id="coOverlay"></div>' +
      '<div class="co-modal" id="coModal">' +
        '<div id="coFormState">' +
          '<div class="co-modal__hdr"><span class="co-modal__title">Complete Order</span><button class="co-x" id="coXBtn">✕</button></div>' +
          '<div class="co-product-row" id="coProductRow"></div>' +
          '<div class="co-field"><label>Email address</label><input type="email" id="coEmail" placeholder="you@example.com" autocomplete="email" /></div>' +
          '<button class="co-submit" id="coSubmitBtn">Complete Purchase</button>' +
          '<div class="co-secure">🔒 Instant delivery · Secure checkout</div>' +
          '<div class="co-err" id="coErr"></div>' +
        '</div>' +
        '<div id="coSuccessState" style="display:none;">' +
          '<div class="co-success">' +
            '<div class="co-success__check">✓</div>' +
            '<div class="co-success__title">Order Complete!</div>' +
            '<div class="co-success__sub" id="coSuccessSub">Your product is ready below.</div>' +
            '<div class="co-id-box"><div class="co-id-box__meta"><div class="co-id-box__lbl">Invoice ID</div><div class="co-id-box__val" id="coInvId"></div></div><button class="co-copy" id="coCopyBtn">Copy</button></div>' +
            '<div class="co-deliv-box"><div class="co-deliv-box__lbl">Your Product</div><div class="co-deliv-box__val" id="coDelivVal"></div><button class="co-reveal" id="coRevealBtn">👁 Click to reveal</button></div>' +
            '<div class="co-actions"><a class="co-view-inv" id="coViewInv" href="#">🧾 View Full Invoice</a><button class="co-back" id="coBackBtn">← Back to Shop</button></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', _html);

    var _pid = null;

    function closeModal() {
      document.getElementById('coOverlay').classList.remove('open');
      document.getElementById('coModal').classList.remove('open');
      document.body.style.overflow = '';
    }
    document.getElementById('coXBtn').addEventListener('click', closeModal);
    document.getElementById('coOverlay').addEventListener('click', closeModal);
    document.getElementById('coBackBtn').addEventListener('click', function () { window.location.href = 'preview-products.html'; });

    document.getElementById('coCopyBtn').addEventListener('click', function () {
      var id = document.getElementById('coInvId').textContent;
      var btn = document.getElementById('coCopyBtn');
      try {
        navigator.clipboard.writeText(id).then(function () {
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
        });
      } catch(e) {
        var r = document.createRange(); r.selectNode(document.getElementById('coInvId'));
        window.getSelection().removeAllRanges(); window.getSelection().addRange(r);
      }
    });

    document.getElementById('coRevealBtn').addEventListener('click', function () {
      var v = document.getElementById('coDelivVal');
      var shown = v.classList.toggle('shown');
      document.getElementById('coRevealBtn').textContent = shown ? '🔒 Hide' : '👁 Click to reveal';
    });

    document.getElementById('coSubmitBtn').addEventListener('click', function () {
      var email = document.getElementById('coEmail').value.trim();
      var inp = document.getElementById('coEmail');
      var errEl = document.getElementById('coErr');
      inp.classList.remove('co-input-err');
      errEl.textContent = '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        inp.classList.add('co-input-err');
        errEl.textContent = 'Please enter a valid email address.';
        return;
      }
      var prods = getProds();
      var p = prods.find(function (x) { return x.id === _pid; });
      if (!p) { errEl.textContent = 'Product not found.'; return; }
      var delivs = p.deliverables || [];
      var hasStock = delivs.length > 0 || (p.stock || 0) > 0;
      if (!hasStock) { errEl.textContent = 'This product is currently out of stock.'; return; }

      var btn = document.getElementById('coSubmitBtn');
      btn.disabled = true; btn.textContent = 'Processing…';

      setTimeout(function () {
        var invoiceId = generateId();
        var deliverable = '';
        if (delivs.length > 0) {
          deliverable = delivs[0];
          p.deliverables = delivs.slice(1);
        } else {
          deliverable = '(Contact support with your invoice ID to receive your product)';
          if (p.stock > 0) p.stock--;
        }
        var idx = prods.findIndex(function (x) { return x.id === p.id; });
        if (idx !== -1) prods[idx] = p;
        saveProds(prods);

        var sym = SYM[p.currency] || '€';
        addOrder({ id: invoiceId, date: new Date().toISOString(), email: email, productId: p.id, productName: p.name, productIcon: p.icon || '📦', productDesc: p.desc || '', price: p.price, currency: p.currency || 'EUR', deliverable: deliverable, status: 'completed' });

        /* Discord webhook */
        (function() {
          try {
            var w = JSON.parse(localStorage.getItem('nexus_webhooks') || '{}');
            if (w.url) {
              fetch(w.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [{
                  title: '🛍️ Nouvelle commande',
                  color: 3066993,
                  fields: [
                    { name: 'Invoice ID', value: invoiceId, inline: true },
                    { name: 'Produit',    value: (p.icon || '📦') + ' ' + p.name, inline: true },
                    { name: 'Email',      value: email, inline: true },
                    { name: 'Montant',    value: sym + Number(p.price).toFixed(2), inline: true }
                  ],
                  footer: { text: 'Nexus Store' },
                  timestamp: new Date().toISOString()
                }] })
              }).catch(function() {});
            }
          } catch(e) {}
        })();

        document.getElementById('coFormState').style.display = 'none';
        document.getElementById('coSuccessState').style.display = '';
        document.getElementById('coSuccessSub').textContent = 'Check your email (' + email + ') for confirmation.';
        document.getElementById('coInvId').textContent = invoiceId;
        document.getElementById('coDelivVal').textContent = deliverable;
        document.getElementById('coDelivVal').classList.remove('shown');
        document.getElementById('coRevealBtn').textContent = '👁 Click to reveal';
        document.getElementById('coViewInv').href = 'invoice.html?id=' + invoiceId;
      }, 900);
    });

    window._nexusOpenCheckout = function (productId) {
      _pid = productId;
      var prods = getProds();
      var p = prods.find(function (x) { return x.id === productId; });
      if (!p) return;
      var sym = SYM[p.currency] || '€';
      document.getElementById('coProductRow').innerHTML =
        '<span class="co-product-row__icon">' + (p.icon || '📦') + '</span>' +
        '<div class="co-product-row__info"><div class="co-product-row__name">' + escH(p.name) + '</div><div class="co-product-row__desc">' + escH(p.desc || '') + '</div></div>' +
        '<span class="co-product-row__price">' + sym + Number(p.price).toFixed(2) + '</span>';
      document.getElementById('coEmail').value = '';
      document.getElementById('coEmail').classList.remove('co-input-err');
      document.getElementById('coErr').textContent = '';
      document.getElementById('coFormState').style.display = '';
      document.getElementById('coSuccessState').style.display = 'none';
      var sb = document.getElementById('coSubmitBtn'); sb.disabled = false; sb.textContent = 'Complete Purchase';
      document.getElementById('coOverlay').classList.add('open');
      document.getElementById('coModal').classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { document.getElementById('coEmail').focus(); }, 150);
    };
  }());

  /* ─── Bug Reporter → Discord ─── */
  (function() {
    var _lastBug = 0;
    function reportBug(msg, src, line) {
      var now = Date.now();
      if (now - _lastBug < 30000) return; // max 1 report per 30s
      _lastBug = now;
      try {
        var w = JSON.parse(localStorage.getItem('nexus_webhooks') || '{}');
        if (!w.url) return;
        fetch(w.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [{
            title: '🐛 Erreur JavaScript — Nexus Store',
            color: 0xef4444,
            fields: [
              { name: 'Message', value: String(msg || '—').substring(0, 256), inline: false },
              { name: 'Source',  value: String(src  || '—').substring(0, 100).replace(window.location.origin, ''), inline: true },
              { name: 'Ligne',   value: String(line || '—'), inline: true },
              { name: 'Page',    value: window.location.pathname, inline: true }
            ],
            footer: { text: 'Nexus Store' },
            timestamp: new Date().toISOString()
          }] })
        }).catch(function() {});
      } catch(e) {}
    }
    window.addEventListener('error', function(e) {
      reportBug(e.message, e.filename, e.lineno);
    });
    window.addEventListener('unhandledrejection', function(e) {
      reportBug(String(e.reason), window.location.href, null);
    });
  }());
}());
