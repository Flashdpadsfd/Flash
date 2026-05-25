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

  /* ─── SellAuth Checkout ─── */
  document.querySelectorAll('.btn-buy').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var card = btn.closest('.product-card');
      if (!card) return;
      var productId = parseInt(card.dataset.productId || '0', 10);
      var variantId = parseInt(card.dataset.variantId || '0', 10);
      if (!window.sellAuthEmbed) {
        console.warn('[Nexus] sellauth-embed-2.js not loaded — check your SHOP_ID and script tag');
        return;
      }
      window.sellAuthEmbed.checkout(btn, {
        cart: [{ productId: productId, variantId: variantId, quantity: 1 }],
        shopId: window.NEXUS_SHOP_ID || 0,
        modal: true
      });
    });
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
      'footer.desc':'Comptes streaming premium,<br>livrés instantanément.',
      'footer.nav':'Navigation','footer.home':'Accueil','footer.products':'Produits','footer.feedback':'Retours',
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
      'footer.desc':'Cuentas de streaming premium,<br>entregadas al instante.',
      'footer.nav':'Navegación','footer.home':'Inicio','footer.products':'Productos','footer.feedback':'Opiniones',
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
      'footer.desc':'Premium-Streaming-Konten,<br>sofort geliefert.',
      'footer.nav':'Navigation','footer.home':'Startseite','footer.products':'Produkte','footer.feedback':'Feedback',
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
      'footer.desc':'Account streaming premium,<br>consegnati istantaneamente.',
      'footer.nav':'Navigazione','footer.home':'Home','footer.products':'Prodotti','footer.feedback':'Feedback',
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
      'footer.desc':'Contas de streaming premium,<br>entregues instantaneamente.',
      'footer.nav':'Navegação','footer.home':'Início','footer.products':'Produtos','footer.feedback':'Feedback',
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
      'footer.desc':'حسابات بث متميزة،<br>تُسلَّم فوراً.',
      'footer.nav':'التنقل','footer.home':'الرئيسية','footer.products':'المنتجات','footer.feedback':'التعليقات',
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

  applyLang('EN');
  filterAndSort();
  window._nexusFilterAndSort = filterAndSort;
}());
