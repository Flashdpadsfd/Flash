/* FlashShp Theme — SellAuth Edition */

/* ─── Inline SVG icon set (Lucide) — replaces system/structural emojis.
   Product icons stay merchant-editable (emoji); only UI glyphs use these. ─── */
window.NX_ICONS = function (name) {
  var P = {
    star:    ['fill',   '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'],
    flame:   ['stroke', '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'],
    sparkles:['stroke', '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>'],
    tag:     ['stroke', '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.41l8.7 8.71a2.43 2.43 0 0 0 3.42 0l6.58-6.59a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".9" fill="currentColor" stroke="none"/>'],
    search:  ['stroke', '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'],
    check:   ['stroke', '<path d="M20 6 9 17l-5-5"/>'],
    x:       ['stroke', '<path d="M18 6 6 18M6 6l12 12"/>'],
    zap:     ['fill',   '<path d="M13 2 3 14h7l-1 8 10-12h-7z"/>'],
    eye:     ['stroke', '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'],
    'eye-off':['stroke','<path d="M10.73 5.08a10.74 10.74 0 0 1 11.2 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49"/><path d="M14.08 14.16a3 3 0 0 1-4.24-4.24"/><path d="M17.48 17.5A10.75 10.75 0 0 1 2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14"/><path d="m2 2 20 20"/>']
  };
  var d = P[name];
  if (!d) return '';
  var attrs = 'class="nx-ico" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
  return d[0] === 'fill'
    ? '<svg ' + attrs + ' fill="currentColor" stroke="none">' + d[1] + '</svg>'
    : '<svg ' + attrs + ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d[1] + '</svg>';
};

(function () {
  'use strict';
  var ICON = window.NX_ICONS;
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

  /* Boutons Sign In / Create Account du drawer mobile : seule preview.html
     avait l'onclick en dur, les autres pages en etaient depourvues. Delegue
     ici plutot que de dupliquer l'attribut sur chaque page. */
  document.querySelectorAll('[data-i18n="nav.login"], [data-i18n="nav.register"]').forEach(function (btn) {
    if (btn.tagName === 'BUTTON' && !btn.hasAttribute('onclick')) {
      btn.addEventListener('click', function () { location.href = '/login'; });
    }
  });

  /* ─── Nav scroll ─── */
  var navbar = document.querySelector('.nav');
  if (navbar) window.addEventListener('scroll', function () {
    navbar.classList[window.scrollY > 20 ? 'add' : 'remove']('scrolled');
  }, { passive: true });

  /* Slug d'URL à partir du nom du produit : "Netflix Premium" → "netflix-premium". */
  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  /* URL de la fiche produit : /products-<nom> (ex. /products-netflix).
     Si le nom est vide, on retombe sur l'ancien style ?id= pour ne rien casser. */
  function productUrl(id, name) {
    var slug = slugify(name);
    return slug ? '/products-' + slug : '/preview-product?id=' + encodeURIComponent(id);
  }

  /* ─── Product card click → product detail page ─── */
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.product-card');
    if (!card) return;
    var productId = card.dataset.productId;
    if (productId) window.location.href = productUrl(productId, card.dataset.name);
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
  var priceMinInput = $('priceMin');
  var priceMaxInput = $('priceMax');
  var resultsCount = $('resultsCount');
  var activeCat    = 'all';
  var activeSubcats = [];
  var activeProductId = null;
  var searchQuery  = '';

  function filterAndSort() {
    if (!productGrid) return;
    var cards = Array.from(productGrid.querySelectorAll('.product-card'));
    var priceMin = (priceMinInput && priceMinInput.value !== '') ? parseFloat(priceMinInput.value) : -Infinity;
    var priceMax = (priceMaxInput && priceMaxInput.value !== '') ? parseFloat(priceMaxInput.value) : Infinity;
    var visible = [];
    cards.forEach(function (card) {
      var name  = (card.dataset.name || '').toLowerCase();
      var cat   = (card.dataset.cat  || '').toLowerCase();
      var price = parseFloat(card.dataset.price || 0);
      var matchSel = activeProductId
        ? String(card.dataset.productId) === String(activeProductId)
        : (activeCat === 'all' || cat === activeCat || activeSubcats.indexOf(cat) !== -1);
      var matchPrice = price >= priceMin && price <= priceMax;
      var ok = matchSel && matchPrice && (!searchQuery || name.indexOf(searchQuery) !== -1);
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
    if (resultsCount) resultsCount.textContent = visible.length;
    var empty = productGrid.querySelector('.empty-state');
    if (!visible.length) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = '<div class="empty-state__icon">'+ICON('search')+'</div>'
          + '<div class="empty-state__title">No products found</div>'
          + '<div class="empty-state__sub">Try a different search or category</div>';
        productGrid.appendChild(empty);
      }
    } else { if (empty) empty.parentNode.removeChild(empty); }
    updateClearFiltersBtn();
  }

  /* ─── "Clear filters" : toujours affiché, actif seulement si un filtre (recherche,
     catégorie, prix) est en cours. Reste visible plutôt que disparaître, pour ne pas
     laisser un vide dans la barre quand aucun filtre n'est appliqué. ─── */
  var clearFiltersBtn = $('clearFiltersBtn');
  function updateClearFiltersBtn() {
    if (!clearFiltersBtn) return;
    var active = !!searchQuery || activeCat !== 'all' || !!activeProductId
      || (priceMinInput && priceMinInput.value !== '') || (priceMaxInput && priceMaxInput.value !== '');
    clearFiltersBtn.disabled = !active;
  }
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function () {
      if (searchInput) { searchInput.value = ''; searchQuery = ''; updateSearchClearUI(); }
      clearCatActive();
      activeCat = 'all'; activeSubcats = []; activeProductId = null;
      if (priceMinInput) priceMinInput.value = '';
      if (priceMaxInput) priceMaxInput.value = '';
      if (priceRangeMin && priceRangeMax) { priceRangeMin.value = priceRangeMin.min; priceRangeMax.value = priceRangeMax.max; updatePriceSliderRange(); }
      updatePriceFilterBtnState();
      filterAndSort();
    });
  }

  /* ─── Recherche : indice ⌘K quand le champ est vide, croix pour l'effacer sinon ─── */
  var searchClearBtn = $('searchClearBtn');
  var searchKbdHint   = $('searchKbdHint');
  function updateSearchClearUI() {
    var hasText = !!(searchInput && searchInput.value);
    if (searchClearBtn) searchClearBtn.style.display = hasText ? 'flex' : 'none';
    if (searchKbdHint)  searchKbdHint.style.display  = hasText ? 'none' : 'block';
  }
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', function () {
      if (!searchInput) return;
      searchInput.value = ''; searchQuery = '';
      updateSearchClearUI();
      searchInput.focus();
      filterAndSort();
    });
  }

  if (searchInput) {
    var dbt;
    searchInput.addEventListener('input', function () {
      updateSearchClearUI();
      clearTimeout(dbt);
      dbt = setTimeout(function () { searchQuery = searchInput.value.trim().toLowerCase(); filterAndSort(); }, 200);
    });
    updateSearchClearUI();
  }
  if (sortSelect) sortSelect.addEventListener('change', filterAndSort);

  /* ─── Tri : dropdown custom (bouton + panel), pilote le <input type="hidden"> #sortSelect ─── */
  var sortFilter      = $('sortFilter');
  var sortFilterBtn   = $('sortFilterBtn');
  var sortFilterLabel = $('sortFilterLabel');
  var sortPanel       = $('sortPanel');

  if (sortFilterBtn && sortFilter && sortPanel) {
    sortFilterBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      sortFilter.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (sortFilter.classList.contains('open') && !sortFilter.contains(e.target)) {
        sortFilter.classList.remove('open');
      }
    });
    sortPanel.querySelectorAll('.sort-filter__option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        sortPanel.querySelectorAll('.sort-filter__option').forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        if (sortFilterLabel) sortFilterLabel.textContent = opt.textContent;
        sortFilter.classList.remove('open');
        if (sortSelect) {
          sortSelect.value = opt.dataset.value;
          sortSelect.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  /* ─── Price filter popover : champs From/To + slider double-poignée ─── */
  var priceFilter     = $('priceFilter');
  var priceFilterBtn  = $('priceFilterBtn');
  var pricePanel      = $('pricePanel');
  var pricePanelClose = $('pricePanelClose');
  var priceRangeMin   = $('priceRangeMin');
  var priceRangeMax   = $('priceRangeMax');
  var priceSliderRange = $('priceSliderRange');
  var priceBoundMinEl = $('priceBoundMin');
  var priceBoundMaxEl = $('priceBoundMax');

  function computePriceBounds() {
    var prices = Array.from(productGrid ? productGrid.querySelectorAll('.product-card') : [])
      .map(function (c) { return parseFloat(c.dataset.price || 0); })
      .filter(function (n) { return !isNaN(n); });
    if (!prices.length) return { min: 0, max: 100 };
    var lo = Math.floor(Math.min.apply(null, prices));
    var hi = Math.ceil(Math.max.apply(null, prices));
    if (hi <= lo) hi = lo + 1;
    return { min: lo, max: hi };
  }

  function updatePriceSliderRange() {
    if (!priceRangeMin || !priceRangeMax || !priceSliderRange) return;
    var min = parseFloat(priceRangeMin.min), max = parseFloat(priceRangeMin.max);
    var v1 = parseFloat(priceRangeMin.value), v2 = parseFloat(priceRangeMax.value);
    var span = (max - min) || 1;
    priceSliderRange.style.left  = (((v1 - min) / span) * 100) + '%';
    priceSliderRange.style.right = (100 - ((v2 - min) / span) * 100) + '%';
  }

  function updatePriceFilterBtnState() {
    if (!priceFilterBtn) return;
    var active = (priceMinInput && priceMinInput.value !== '') || (priceMaxInput && priceMaxInput.value !== '');
    priceFilterBtn.classList.toggle('active', !!active);
  }

  /* Recalcule les bornes du slider à partir du catalogue actuel à CHAQUE ouverture
     du popover (un produit ajouté/modifié dans l'admin doit immédiatement se
     refléter sur "From"/"To"). Une valeur déjà saisie par le visiteur est
     conservée, simplement recalée dans les nouvelles bornes si besoin. */
  function initPriceBounds() {
    if (!priceRangeMin || !priceRangeMax) return;
    var b = computePriceBounds();
    priceRangeMin.min = priceRangeMax.min = b.min;
    priceRangeMin.max = priceRangeMax.max = b.max;
    if (priceBoundMinEl) priceBoundMinEl.textContent = '€' + b.min;
    if (priceBoundMaxEl) priceBoundMaxEl.textContent = '€' + b.max;
    if (priceMinInput) priceMinInput.placeholder = b.min;
    if (priceMaxInput) priceMaxInput.placeholder = b.max;

    var hasMin = priceMinInput && priceMinInput.value !== '';
    var hasMax = priceMaxInput && priceMaxInput.value !== '';
    var v1 = hasMin ? Math.max(b.min, Math.min(b.max, parseFloat(priceMinInput.value))) : b.min;
    var v2 = hasMax ? Math.max(b.min, Math.min(b.max, parseFloat(priceMaxInput.value))) : b.max;
    priceRangeMin.value = v1;
    priceRangeMax.value = v2;
    if (hasMin) priceMinInput.value = v1;
    if (hasMax) priceMaxInput.value = v2;
    updatePriceSliderRange();
  }

  var priceDbt;
  function schedulePriceFilter() {
    clearTimeout(priceDbt);
    priceDbt = setTimeout(filterAndSort, 80);
  }

  if (priceFilterBtn && priceFilter && pricePanel) {
    priceFilterBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var opening = !priceFilter.classList.contains('open');
      if (opening) initPriceBounds();
      priceFilter.classList.toggle('open', opening);
    });
    if (pricePanelClose) {
      pricePanelClose.addEventListener('click', function () { priceFilter.classList.remove('open'); });
    }
    document.addEventListener('click', function (e) {
      if (priceFilter.classList.contains('open') && !priceFilter.contains(e.target)) {
        priceFilter.classList.remove('open');
      }
    });
  }

  if (priceRangeMin && priceRangeMax) {
    [priceRangeMin, priceRangeMax].forEach(function (r) {
      r.addEventListener('input', function () {
        if (parseFloat(priceRangeMin.value) > parseFloat(priceRangeMax.value)) {
          if (r === priceRangeMin) priceRangeMin.value = priceRangeMax.value;
          else priceRangeMax.value = priceRangeMin.value;
        }
        if (priceMinInput) priceMinInput.value = priceRangeMin.value;
        if (priceMaxInput) priceMaxInput.value = priceRangeMax.value;
        updatePriceSliderRange();
        updatePriceFilterBtnState();
        schedulePriceFilter();
      });
    });
  }
  if (priceMinInput) {
    priceMinInput.addEventListener('input', function () {
      if (priceRangeMin && priceMinInput.value !== '') priceRangeMin.value = priceMinInput.value;
      updatePriceSliderRange(); updatePriceFilterBtnState(); schedulePriceFilter();
    });
  }
  if (priceMaxInput) {
    priceMaxInput.addEventListener('input', function () {
      if (priceRangeMax && priceMaxInput.value !== '') priceRangeMax.value = priceMaxInput.value;
      updatePriceSliderRange(); updatePriceFilterBtnState(); schedulePriceFilter();
    });
  }

  /* Items de catégorie filtrables : sélecteurs de sidebar, conservés pour compat
     avec les pages qui l'utilisent encore */
  var CAT_FILTER_SELECTOR = '.sidebar__item[data-cat], .sidebar__section-header--leaf[data-cat]';
  function clearCatActive() {
    document.querySelectorAll('.sidebar__item.active, .sidebar__section-header--leaf.active')
      .forEach(function (i) { i.classList.remove('active'); });
  }
  document.querySelectorAll(CAT_FILTER_SELECTOR).forEach(function (item) {
    item.addEventListener('click', function () {
      var wasActive = item.classList.contains('active');
      clearCatActive();
      activeProductId = null;
      if (wasActive) {
        /* re-clic sur la catégorie active → désélection, tous les produits */
        activeCat = 'all';
        activeSubcats = [];
      } else {
        item.classList.add('active');
        activeCat = item.dataset.cat;
        activeSubcats = (item.dataset.subcats || '').split(',').filter(Boolean);
      }
      filterAndSort();
    });
  });

  /* Items « produit » de la sidebar : clic = filtre la grille sur ce produit (reste sur
     la page, comme dans la vidéo de référence). Délégation sur le document pour rester
     valable après un re-render de la sidebar (renderCats sur événement storage). */
  document.addEventListener('click', function (e) {
    var item = e.target.closest('.sidebar__item[data-product-id]');
    if (!item) return;
    var wasActive = item.classList.contains('active');
    clearCatActive();
    activeCat = 'all';
    activeSubcats = [];
    if (wasActive) {
      activeProductId = null;
    } else {
      item.classList.add('active');
      activeProductId = item.dataset.productId;
    }
    filterAndSort();
  });

  /* ─── Pre-filter by ?cat= / ?product= when arriving from a product page link ─── */
  if (productGrid) {
    var _params  = new URLSearchParams(window.location.search);
    var _urlCat  = _params.get('cat');
    var _urlProd = _params.get('product');
    var _urlQ    = _params.get('q') || _params.get('search');
    if (_urlProd || (_urlCat && _urlCat.toLowerCase() !== 'all')) clearCatActive();
    /* Recherche arrivée depuis la sidebar d'une fiche produit (?q=) */
    if (_urlQ && searchInput) {
      searchInput.value = _urlQ;
      searchQuery = String(_urlQ).trim().toLowerCase();
    }
    if (_urlProd) {
      activeProductId = _urlProd;
      document.querySelectorAll('.sidebar__item[data-product-id]').forEach(function (i) {
        if (String(i.dataset.productId) === String(_urlProd)) i.classList.add('active');
      });
      filterAndSort();
    } else if (_urlCat) {
      activeCat = _urlCat.toLowerCase();
      /* Catégorie parente : inclure aussi les produits de ses sous-catégories. */
      try {
        var _allCats = JSON.parse(localStorage.getItem('nexus_categories') || '[]');
        var _stack = [activeCat], _seenC = {};
        while (_stack.length) {
          var _cur = _stack.pop();
          _allCats.forEach(function (c) {
            if (String(c.parent).toLowerCase() === String(_cur) && !_seenC[c.id]) {
              _seenC[c.id] = 1;
              activeSubcats.push(String(c.id).toLowerCase());
              _stack.push(String(c.id).toLowerCase());
            }
          });
        }
      } catch (e) {}
      document.querySelectorAll(CAT_FILTER_SELECTOR).forEach(function (i) {
        if ((i.dataset.cat || '').toLowerCase() === activeCat) i.classList.add('active');
      });
      filterAndSort();
    } else if (_urlQ) {
      filterAndSort();
    }
  }

  /* ─── Sidebar section toggle ─── */
  window.toggleSection = function (id) {
    var el = document.getElementById(id);
    if (el) { var s = el.closest('.sidebar__section'); if (s) s.classList.toggle('collapsed'); }
  };

  /* ─── i18n ─── */
  var TRANSLATIONS = {
    EN: {
      'nav.shop':'Shop','nav.home':'Home','nav.reviews':'Reviews','nav.tutorials':'Tutorials',
      'nav.login':'Sign In','nav.register':'Create Account',
      'hero.eyebrow':'Digital Products Store',
      'hero.title':'Welcome to the<br>flashshp',
      'hero.sub':'The same premium accounts, for a fraction of the price. Delivered in seconds, replaced free if anything breaks.',
      'hero.cta1':'Explore Products','hero.cta2':'Join Discord →',
      'stats.rating':'Avg. Rating','stats.sold':'Products Sold','stats.customers':'Total Customers',
      'footer.desc':'Premium streaming accounts,<br>delivered instantly.',
      'footer.nav':'Navigation','footer.home':'Home','footer.products':'Products',
      'footer.allProducts':'All Products','footer.feedback':'Feedback',
      'footer.legal':'Legal','footer.tos':'Terms of Service',
      'footer.copy':'© 2026 FlashShp. All rights reserved.',
      'footer.privacy':'Privacy Policy'
    },
    FR: {
      'nav.shop':'Boutique','nav.home':'Accueil','nav.reviews':'Avis','nav.tutorials':'Tutorials',
      'nav.login':'Connexion','nav.register':'Créer un compte',
      'hero.eyebrow':'Boutique de Produits Numériques',
      'hero.title':'Bienvenue sur<br>flashshp',
      'hero.sub':'Les mêmes comptes premium, à une fraction du prix. Livrés en quelques secondes, remplacés gratuitement en cas de souci.',
      'hero.cta1':'Explorer les produits','hero.cta2':'Rejoindre Discord →',
      'stats.rating':'Note Moyenne','stats.sold':'Produits Vendus','stats.customers':'Clients Totaux',
      'footer.desc':'Comptes streaming premium,<br>livrés instantanément.',
      'footer.nav':'Navigation','footer.home':'Accueil','footer.products':'Produits',
      'footer.allProducts':'Tous les produits','footer.feedback':'Avis',
      'footer.legal':'Légal','footer.tos':'Conditions d\'utilisation',
      'footer.copy':'© 2026 FlashShp. Tous droits réservés.',
      'footer.privacy':'Politique de confidentialité'
    },
    ES: {
      'nav.shop':'Tienda','nav.home':'Inicio','nav.reviews':'Reseñas','nav.tutorials':'Tutorials',
      'nav.login':'Iniciar sesión','nav.register':'Crear cuenta',
      'hero.eyebrow':'Tienda de Productos Digitales',
      'hero.title':'Bienvenido a<br>flashshp',
      'hero.sub':'Las mismas cuentas premium, por una fracción del precio. Entregadas en segundos y reemplazadas gratis si algo falla.',
      'hero.cta1':'Explorar productos','hero.cta2':'Unirse a Discord →',
      'stats.rating':'Valoración Media','stats.sold':'Productos Vendidos','stats.customers':'Clientes Totales',
      'footer.desc':'Cuentas de streaming premium,<br>entregadas al instante.',
      'footer.nav':'Navegación','footer.home':'Inicio','footer.products':'Productos',
      'footer.allProducts':'Todos los productos','footer.feedback':'Reseñas',
      'footer.legal':'Legal','footer.tos':'Términos de servicio',
      'footer.copy':'© 2026 FlashShp. Todos los derechos reservados.',
      'footer.privacy':'Política de privacidad'
    },
    DE: {
      'nav.shop':'Shop','nav.home':'Startseite','nav.reviews':'Bewertungen','nav.tutorials':'Tutorials',
      'nav.login':'Anmelden','nav.register':'Konto erstellen',
      'hero.eyebrow':'Digitale Produkte Shop',
      'hero.title':'Willkommen bei<br>flashshp',
      'hero.sub':'Dieselben Premium-Accounts, zum Bruchteil des Preises. In Sekunden geliefert, bei Problemen kostenlos ersetzt.',
      'hero.cta1':'Produkte erkunden','hero.cta2':'Discord beitreten →',
      'stats.rating':'Ø Bewertung','stats.sold':'Verkaufte Produkte','stats.customers':'Kunden gesamt',
      'footer.desc':'Premium-Streaming-Konten,<br>sofort geliefert.',
      'footer.nav':'Navigation','footer.home':'Startseite','footer.products':'Produkte',
      'footer.allProducts':'Alle Produkte','footer.feedback':'Bewertungen',
      'footer.legal':'Rechtliches','footer.tos':'Nutzungsbedingungen',
      'footer.copy':'© 2026 FlashShp. Alle Rechte vorbehalten.',
      'footer.privacy':'Datenschutzerklärung'
    },
    IT: {
      'nav.shop':'Negozio','nav.home':'Home','nav.reviews':'Recensioni','nav.tutorials':'Tutorials',
      'nav.login':'Accedi','nav.register':'Crea account',
      'hero.eyebrow':'Negozio di Prodotti Digitali',
      'hero.title':'Benvenuto su<br>flashshp',
      'hero.sub':'Gli stessi account premium, a una frazione del prezzo. Consegnati in pochi secondi e sostituiti gratis se qualcosa non va.',
      'hero.cta1':'Esplora prodotti','hero.cta2':'Unisciti a Discord →',
      'stats.rating':'Voto Medio','stats.sold':'Prodotti Venduti','stats.customers':'Clienti Totali',
      'footer.desc':'Account streaming premium,<br>consegnati istantaneamente.',
      'footer.nav':'Navigazione','footer.home':'Home','footer.products':'Prodotti',
      'footer.allProducts':'Tutti i prodotti','footer.feedback':'Recensioni',
      'footer.legal':'Legale','footer.tos':'Termini di servizio',
      'footer.copy':'© 2026 FlashShp. Tutti i diritti riservati.',
      'footer.privacy':'Informativa sulla privacy'
    },
    PT: {
      'nav.shop':'Loja','nav.home':'Início','nav.reviews':'Avaliações','nav.tutorials':'Tutorials',
      'nav.login':'Entrar','nav.register':'Criar conta',
      'hero.eyebrow':'Loja de Produtos Digitais',
      'hero.title':'Bem-vindo à<br>flashshp',
      'hero.sub':'As mesmas contas premium, por uma fração do preço. Entregues em segundos e substituídas de graça se algo falhar.',
      'hero.cta1':'Explorar produtos','hero.cta2':'Entrar no Discord →',
      'stats.rating':'Avaliação Média','stats.sold':'Produtos Vendidos','stats.customers':'Clientes Totais',
      'footer.desc':'Contas de streaming premium,<br>entregues instantaneamente.',
      'footer.nav':'Navegação','footer.home':'Início','footer.products':'Produtos',
      'footer.allProducts':'Todos os produtos','footer.feedback':'Avaliações',
      'footer.legal':'Legal','footer.tos':'Termos de serviço',
      'footer.copy':'© 2026 FlashShp. Todos os direitos reservados.',
      'footer.privacy':'Política de privacidade'
    },
    AR: {
      'nav.shop':'المتجر','nav.home':'الرئيسية','nav.reviews':'التقييمات','nav.tutorials':'Tutorials',
      'nav.login':'تسجيل الدخول','nav.register':'إنشاء حساب',
      'hero.eyebrow':'متجر المنتجات الرقمية',
      'hero.title':'مرحبًا بك في<br>flashshp',
      'hero.sub':'نفس الحسابات المميزة، بجزء بسيط من السعر. تصلك خلال ثوانٍ، ونستبدلها مجانًا إذا حدث أي خلل.',
      'hero.cta1':'استكشف المنتجات','hero.cta2':'انضم إلى Discord →',
      'stats.rating':'متوسط التقييم','stats.sold':'المنتجات المباعة','stats.customers':'إجمالي العملاء',
      'footer.desc':'حسابات بث متميزة،<br>تُسلَّم فوراً.',
      'footer.nav':'التنقل','footer.home':'الرئيسية','footer.products':'المنتجات',
      'footer.allProducts':'كل المنتجات','footer.feedback':'التقييمات',
      'footer.legal':'القانوني','footer.tos':'شروط الخدمة',
      'footer.copy':'© 2026 FlashShp. جميع الحقوق محفوظة.',
      'footer.privacy':'سياسة الخصوصية'
    }
  };

  /* Texte admin (Visual Editor, nexus_content) autorisé à contenir un minimum
     de mise en forme (ex. <br> dans une description). Construit directement en
     noeuds DOM (createElement/createTextNode) — jamais de innerHTML/outerHTML,
     donc aucune chaîne n'est jamais réinterprétée comme du HTML : un
     <script>, onerror=, javascript:… reste toujours du texte inerte. */
  var RICH_TEXT_TAGS = { br: 1, b: 1, strong: 1, i: 1, em: 1 };
  var RICH_TEXT_RE = /<\/?\s*(br|b|strong|i|em)\s*\/?>/gi;
  function buildRichTextFragment(html) {
    var raw = String(html == null ? '' : html);
    var frag = document.createDocumentFragment();
    var stack = [frag];
    var last = 0, m;
    RICH_TEXT_RE.lastIndex = 0;
    while ((m = RICH_TEXT_RE.exec(raw))) {
      if (m.index > last) stack[stack.length - 1].appendChild(document.createTextNode(raw.slice(last, m.index)));
      var tag = m[1].toLowerCase();
      if (/^<\//.test(m[0])) {
        if (stack.length > 1) stack.pop();
      } else if (tag === 'br') {
        stack[stack.length - 1].appendChild(document.createElement('br'));
      } else {
        var el = document.createElement(tag);
        stack[stack.length - 1].appendChild(el);
        stack.push(el);
      }
      last = RICH_TEXT_RE.lastIndex;
    }
    if (last < raw.length) stack[stack.length - 1].appendChild(document.createTextNode(raw.slice(last)));
    return frag;
  }
  function applyRichText(el, html) {
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(buildRichTextFragment(html));
  }
  window._nexusApplyRichText = applyRichText;

  /* Surcharges de texte définies dans l'admin (Visual Editor) — prioritaires sur toutes les langues */
  function getTextOverrides() {
    try { return JSON.parse(localStorage.getItem('nexus_text_overrides')) || {}; } catch(e) { return {}; }
  }
  function applyTextOverrides() {
    var o = getTextOverrides();
    document.querySelectorAll('[data-i18n]').forEach(function (el) { if (o[el.dataset.i18n]) el.textContent = o[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { if (o[el.dataset.i18nHtml]) applyRichText(el, o[el.dataset.i18nHtml]); });
  }
  window.addEventListener('storage', function (e) {
    if (e.key === 'nexus_text_overrides') applyTextOverrides();
  });

  function applyLang(lang) {
    var t = TRANSLATIONS[lang] || TRANSLATIONS.EN;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { if (t[el.dataset.i18n] !== undefined) el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { if (t[el.dataset.i18nHtml] !== undefined) applyRichText(el, t[el.dataset.i18nHtml]); });
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
    applyTextOverrides();
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
  /* Entrance animations play only ONCE per page per browser session. A reload
     of the same page (e.g. after switching language) therefore shows the final
     state instantly instead of replaying everything. A fresh visit still animates. */
  var animKey = 'nx_anim_' + location.pathname;
  var skipEntrance = false;
  try { skipEntrance = sessionStorage.getItem(animKey) === '1'; } catch (e) {}
  if (skipEntrance) {
    document.body.classList.add('nx-no-entrance', 'loaded');
  } else {
    try { sessionStorage.setItem(animKey, '1'); } catch (e) {}
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      document.body.classList.add('loaded');
    }); });
  }
  /* Count-up for stat numbers — parses whatever value is in the element so it
     works for "4.96", "4,350", "1000000", etc., preserving decimals/grouping. */
  var reduceMotion = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || skipEntrance;
  function countUp(el) {
    var target = (el.textContent || '').trim();
    var m = target.match(/^([^\d-]*)([\d.,]+)(.*)$/);
    if (!m) return;
    var prefix = m[1], numStr = m[2], suffix = m[3];
    var hasComma = numStr.indexOf(',') !== -1;
    var clean = numStr.replace(/,/g, '');
    var dot = clean.indexOf('.');
    var decimals = dot === -1 ? 0 : (clean.length - dot - 1);
    var finalVal = parseFloat(clean);
    if (isNaN(finalVal)) return;
    function fmt(v) {
      var s = v.toFixed(decimals);
      if (hasComma) {
        var parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        s = parts.join('.');
      }
      return prefix + s + suffix;
    }
    if (reduceMotion) { el.textContent = fmt(finalVal); return; }
    var dur = 1400, startTs = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min((ts - startTs) / dur, 1);
      el.textContent = fmt(finalVal * ease(p));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(finalVal);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      if (e.target.classList.contains('stats')) {
        e.target.querySelectorAll('.stats__value').forEach(countUp);
      }
      io.unobserve(e.target);
    });
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
    if (!el) return;
    el.textContent = n;
    /* Le badge est masqué par défaut en CSS et rien ne le révélait : il ne
       s'affichait jamais, quel que soit le contenu du panier. On l'affiche
       maintenant dès qu'il y a au moins un article. */
    el.classList.toggle('is-visible', n > 0);
  }
  window._nexusUpdateCartCount = updateCartCount;

  function cartItemIcon(item) {
    var v = item.icon || '📦';
    return /^https?:|^data:/.test(v)
      ? '<img src="' + String(v).replace(/"/g, '&quot;') + '" alt="">'
      : v;
  }
  window._renderCartPanel = function() {
    var cart  = getCart();
    var body  = document.getElementById('cartBody');
    var foot  = document.getElementById('cartFooter');
    var cntEl = document.getElementById('cartPanelCount');
    if (!body) return;
    var totalQty = cart.reduce(function(s,i){ return s+i.qty; }, 0);
    var total    = cart.reduce(function(s,i){ return s+i.price*i.qty; }, 0);
    var sym      = '€'; /* tout le site en € */
    if (cntEl) cntEl.textContent = cart.length ? totalQty + (totalQty > 1 ? ' items' : ' item') : '';
    if (!cart.length) {
      body.innerHTML =
        '<div class="cart-panel__empty">' +
          '<div class="cart-panel__empty-badge">' +
            '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>' +
              '<path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>' +
            '</svg>' +
            '<span class="cart-panel__empty-dot">' +
              '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M12 5v14M19 12l-7 7-7-7"/></svg>' +
            '</span>' +
          '</div>' +
          '<div class="cart-panel__empty-title">Nothing in here yet.</div>' +
          '<div class="cart-panel__empty-sub">Add something from the store and it\'ll show up right here.</div>' +
          '<a class="cart-panel__empty-cta" href="/products">Explore Products</a>' +
        '</div>';
      if (foot) foot.innerHTML = '';
      return;
    }
    body.innerHTML = cart.map(function(item, idx) {
      var s = '€'; /* tout le site en € */
      return '<div class="cart-panel__item">'+
        '<span class="cart-panel__item-icon">'+cartItemIcon(item)+'</span>'+
        '<div class="cart-panel__item-info">'+
          '<div class="cart-panel__item-name">'+item.name+'</div>'+
          '<div class="cart-panel__stepper">'+
            '<button class="cart-panel__step" data-cstep="dec" data-cidx="'+idx+'" aria-label="Decrease">−</button>'+
            '<span class="cart-panel__qty">'+item.qty+'</span>'+
            '<button class="cart-panel__step" data-cstep="inc" data-cidx="'+idx+'" aria-label="Increase">+</button>'+
          '</div>'+
        '</div>'+
        '<div class="cart-panel__item-price">'+s+Number(item.price*item.qty).toFixed(2)+'</div>'+
      '</div>';
    }).join('');
    body.querySelectorAll('.cart-panel__step').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var c2 = getCart(), i = parseInt(btn.dataset.cidx, 10);
        if (!c2[i]) return;
        if (btn.dataset.cstep === 'inc') { c2[i].qty += 1; }
        else { c2[i].qty -= 1; if (c2[i].qty <= 0) c2.splice(i, 1); }
        saveCart(c2); updateCartCount(); window._renderCartPanel();
      });
    });
    if (foot) {
      foot.innerHTML =
        '<div class="cart-panel__totalrow"><span>Total</span><span>'+sym+total.toFixed(2)+'</span></div>'+
        '<button class="cart-panel__checkout" id="cartCheckoutBtn">Proceed to Checkout <span style="margin-left:4px;">→</span></button>';
      var cb = document.getElementById('cartCheckoutBtn');
      if (cb) cb.addEventListener('click', function() {
        var c = getCart();
        if (!c[0]) return;
        var v = c[0].variant;
        var vp = (v != null && v !== '') ? '&variant=' + encodeURIComponent(v) : '';
        if (window._closeCart) window._closeCart();
        if (window._nexusOpenCheckout) window._nexusOpenCheckout(c[0].id, v);
        else window.location.href = 'checkout?id=' + encodeURIComponent(c[0].id) + vp;
      });
    }
  };

  window._nexusToast = function(msg, icon) {
    var tc = document.getElementById('toastContainer');
    if (!tc) return;
    var t = document.createElement('div');
    t.className = 'toast';
    var iconSpan = document.createElement('span');
    iconSpan.className = 'toast__icon';
    iconSpan.innerHTML = icon || ICON('check'); /* toujours un nom d'icône interne fixe, jamais une entrée utilisateur */
    var msgSpan = document.createElement('span');
    msgSpan.textContent = String(msg == null ? '' : msg);
    t.appendChild(iconSpan);
    t.appendChild(msgSpan);
    tc.appendChild(t);
    setTimeout(function() { t.classList.add('hide'); setTimeout(function() { t.parentNode && t.parentNode.removeChild(t); }, 250); }, 3000);
  };

  updateCartCount();
  window.addEventListener('storage', function(e) { if (e.key === 'nexus_cart') updateCartCount(); });

  /* ─── Invoice / Checkout system ──
     Le paiement est entièrement délégué à checkout.html (widget SellAuth) —
     l'ancienne modale in-page (email + choix "Quick Pay"/crypto, saisie ici
     puis livraison immédiate ou polling blockchain) a été retirée : "Quick
     Pay" livrait le produit sans jamais collecter de paiement, et la branche
     crypto refaisait le même flux non vérifié que checkout.html avant sa
     migration SellAuth. "Buy Now" et "Proceed to Checkout" redirigent donc
     simplement vers cette page. */
  window._nexusOpenCheckout = function (productId, variantIdx) {
    var vp = (variantIdx != null && variantIdx !== '') ? '&variant=' + encodeURIComponent(variantIdx) : '';
    window.location.href = 'checkout?id=' + encodeURIComponent(productId) + vp;
  };

  /* ─── Bug Reporter → Discord ─── */
  (function() {
    var _lastBug = 0;
    function reportBug(msg, src, line) {
      var now = Date.now();
      if (now - _lastBug < 30000) return; // max 1 report per 30s
      _lastBug = now;
      try {
        var _wa = JSON.parse(localStorage.getItem('nexus_webhooks') || '{}');
        var w = _wa['BUG'] || {};
        if (!w.url) return;
        fetch(w.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [{
            title: '🐛 Erreur JavaScript — FlashShp Store',
            color: 0xef4444,
            fields: [
              { name: 'Message', value: String(msg || '—').substring(0, 256), inline: false },
              { name: 'Source',  value: String(src  || '—').substring(0, 100).replace(window.location.origin, ''), inline: true },
              { name: 'Ligne',   value: String(line || '—'), inline: true },
              { name: 'Page',    value: window.location.pathname, inline: true }
            ],
            footer: { text: 'FlashShp Store' },
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
