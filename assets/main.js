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

  /* Surcharges de texte définies dans l'admin (Visual Editor) — prioritaires sur toutes les langues */
  function getTextOverrides() {
    try { return JSON.parse(localStorage.getItem('nexus_text_overrides')) || {}; } catch(e) { return {}; }
  }
  function applyTextOverrides() {
    var o = getTextOverrides();
    document.querySelectorAll('[data-i18n]').forEach(function (el) { if (o[el.dataset.i18n]) el.textContent = o[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { if (o[el.dataset.i18nHtml]) el.innerHTML = o[el.dataset.i18nHtml]; });
  }
  window.addEventListener('storage', function (e) {
    if (e.key === 'nexus_text_overrides') applyTextOverrides();
  });

  function applyLang(lang) {
    var t = TRANSLATIONS[lang] || TRANSLATIONS.EN;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { if (t[el.dataset.i18n] !== undefined) el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { if (t[el.dataset.i18nHtml] !== undefined) el.innerHTML = t[el.dataset.i18nHtml]; });
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
    t.innerHTML = '<span class="toast__icon">'+(icon||ICON('check'))+'</span><span>'+String(msg).replace(/</g,'&lt;')+'</span>';
    tc.appendChild(t);
    setTimeout(function() { t.classList.add('hide'); setTimeout(function() { t.parentNode && t.parentNode.removeChild(t); }, 250); }, 3000);
  };

  updateCartCount();
  window.addEventListener('storage', function(e) { if (e.key === 'nexus_cart') updateCartCount(); });

  /* ─── Order Email ─── */
  /* Config effective = defaults du site (email-config.js) surchargés par le
     localStorage admin. Les valeurs vides du localStorage n'écrasent pas les defaults. */
  function _emailConfig() {
    var cfg = {};
    var defs = window.NEXUS_EMAIL_DEFAULTS || {};
    Object.keys(defs).forEach(function(k) { cfg[k] = defs[k]; });
    var stored = {};
    try { stored = JSON.parse(localStorage.getItem('nexus_email_config') || '{}'); } catch(e) {}
    Object.keys(stored).forEach(function(k) {
      if (stored[k] !== '' && stored[k] !== null && stored[k] !== undefined) cfg[k] = stored[k];
    });
    if (!cfg.template) cfg.template = window.NEXUS_EMAIL_TEMPLATE_DEFAULT || '';
    return cfg;
  }
  /* type: 'created' = email « commande reçue / en attente de paiement » (sans
     identifiants) ; 'ready' (défaut) = email « Your Order is Ready! » avec les
     identifiants une fois le paiement confirmé. */
  function _sendOrderEmail(toEmail, invoiceId, productName, deliverable, type) {
    try {
      type = (type === 'created') ? 'created' : 'ready';
      if (type === 'created') deliverable = '';
      var cfg = _emailConfig();
      if (!cfg.enabled) { console.warn('[FlashShp] Order email disabled.'); return; }
      var c = JSON.parse(localStorage.getItem('nexus_content') || '{}');
      var storeName = c.siteName || 'FlashShp Store';
      var storeUrl  = window.location.origin + (window.location.pathname !== '/' ? window.location.pathname.replace(/\/[^/]*$/, '/') : '/');
      var rawSubject = type === 'created'
        ? (cfg.createdSubject || window.NEXUS_EMAIL_CREATED_SUBJECT_DEFAULT || 'Order Received — Awaiting Payment')
        : (cfg.subject || 'Your Order is Ready!');
      var subject = rawSubject
        .replace(/\{\{invoice_id\}\}/g,   invoiceId)
        .replace(/\{\{product_name\}\}/g, productName)
        .replace(/\{\{store_name\}\}/g,   storeName);

      function sendViaEmailJs() {
        if (!cfg.publicKey || !cfg.serviceId || !cfg.templateId || !cfg.template) {
          console.warn('[FlashShp] Order email skipped — incomplete email config.');
          return;
        }
        var html = cfg.template
          .replace(/\{\{invoice_id\}\}/g,     invoiceId)
          .replace(/\{\{product_name\}\}/g,   productName)
          .replace(/\{\{deliverable\}\}/g,    deliverable)
          .replace(/\{\{customer_email\}\}/g, toEmail)
          .replace(/\{\{store_name\}\}/g,     storeName)
          .replace(/\{\{store_url\}\}/g,      storeUrl);
        function doSend() {
          window.emailjs.send(cfg.serviceId, cfg.templateId, {
            to_email: toEmail, subject: subject, message_html: html
          }, cfg.publicKey).then(function() {
            console.info('[FlashShp] Order email sent via EmailJS to ' + toEmail);
          }).catch(function(err) {
            console.error('[FlashShp] Order email failed:', err && (err.text || err.message) || err);
          });
        }
        if (window.emailjs) {
          doSend();
        } else {
          var s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
          s.onload = function() { doSend(); };
          s.onerror = function() { console.error('[FlashShp] Could not load EmailJS SDK.'); };
          document.head.appendChild(s);
        }
      }

      /* 1) API du site (Gmail SMTP — sans branding EmailJS).
         2) Si indisponible (env non configurée, site statique local…) → EmailJS. */
      /* L'email « created » n'a pas de template EmailJS dédié → API uniquement
         (si l'API est indisponible, on l'ignore). L'email « ready » garde son
         repli EmailJS pour livrer les identifiants même sur site statique. */
      var fallback = (type === 'ready') ? sendViaEmailJs : function() { console.warn('[FlashShp] "created" email skipped — site API unavailable.'); };
      fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toEmail, invoiceId: invoiceId, productName: productName, deliverable: deliverable, storeName: storeName, storeUrl: storeUrl, subject: subject, type: type })
      }).then(function(r) {
        if (r.ok) { console.info('[FlashShp] Order email (' + type + ') sent via site API to ' + toEmail); }
        else { console.warn('[FlashShp] Site email API unavailable (' + r.status + ').'); fallback(); }
      }).catch(function() { fallback(); });
    } catch(e) { console.error('[FlashShp] Order email error:', e); }
  }
  window._nexusSendOrderEmail = _sendOrderEmail;

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
      var D = [];
      try { return JSON.parse(localStorage.getItem('nexus_products')) || D; } catch(e) { return D; }
    }
    function saveProds(p) { localStorage.setItem('nexus_products', JSON.stringify(p)); }
    function getOrders() { try { return JSON.parse(localStorage.getItem('nexus_orders')) || []; } catch(e) { return []; } }
    function addOrder(o) { var a = getOrders(); a.unshift(o); localStorage.setItem('nexus_orders', JSON.stringify(a)); }

    function parseUA(ua) {
      var browser = 'Unknown', os = 'Unknown', mt;
      if (/Windows NT 10\.0/.test(ua)) os = 'Windows 10/11';
      else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1';
      else if (/Windows NT 6\.1/.test(ua)) os = 'Windows 7';
      else if (/Windows/.test(ua)) os = 'Windows';
      else if ((mt = ua.match(/Mac OS X ([\d_]+)/))) os = 'macOS ' + mt[1].replace(/_/g, '.');
      else if ((mt = ua.match(/Android ([\d.]+)/))) os = 'Android ' + mt[1];
      else if (/iPhone|iPad/.test(ua) && (mt = ua.match(/OS ([\d_]+)/))) os = 'iOS ' + mt[1].replace(/_/g, '.');
      else if (/Linux/.test(ua)) os = 'Linux';
      if ((mt = ua.match(/Edg\/([\d]+)/))) browser = 'Edge ' + mt[1];
      else if ((mt = ua.match(/OPR\/([\d]+)/))) browser = 'Opera ' + mt[1];
      else if ((mt = ua.match(/Firefox\/([\d]+)/))) browser = 'Firefox ' + mt[1];
      else if ((mt = ua.match(/Chrome\/([\d]+)/))) browser = 'Chrome ' + mt[1];
      else if ((mt = ua.match(/Version\/([\d]+).*Safari/))) browser = 'Safari ' + mt[1];
      return { browser: browser, os: os };
    }

    /* inject modal HTML */
    var _html = '<div class="co-overlay" id="coOverlay"></div>' +
      '<div class="co-modal" id="coModal">' +
        '<div id="coFormState">' +
          '<div class="co-hdr">' +
            '<div class="co-hdr__brand"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>&nbsp;Secure Checkout</div>' +
            '<div class="co-hdr__steps"><span class="co-step co-step--active">Information</span><span class="co-step-sep">&nbsp;›&nbsp;</span><span class="co-step">Delivery</span></div>' +
            '<button class="co-x" id="coXBtn" aria-label="Close">'+ICON('x')+'</button>' +
          '</div>' +
          '<div class="co-layout">' +
            '<div class="co-left">' +
              '<div class="co-section-hdr">Contact Information</div>' +
              '<div class="co-product-row" id="coProductRow"></div>' +
              '<div class="co-field"><label>Email address <span style="color:#ff5555;font-weight:700;">*</span></label><input type="email" id="coEmail" placeholder="you@example.com" autocomplete="email" /></div>' +
              '<div class="co-section-hdr" style="margin-top:12px;">Payment Method</div>' +
              '<div class="co-pm-selector">' +
                '<button class="co-pm-btn co-pm-btn--active" id="coPmDirect" data-pm="direct">' +
                  '<span class="co-pm-btn__icon">'+ICON('zap')+'</span> Quick Pay' +
                '</button>' +
                '<button class="co-pm-btn" id="coPmCrypto" data-pm="crypto">' +
                  '<span class="co-pm-btn__icon">₿</span> Cryptocurrency' +
                '</button>' +
              '</div>' +
              '<div class="co-promo-wrap"><input type="text" class="co-promo-input" id="coPromoInput" placeholder="Promo code (optional)" /><button class="co-promo-btn" id="coPromoBtn">Apply</button></div>' +
              '<div class="co-promo-msg" id="coPromoMsg"></div>' +
              '<button class="co-submit" id="coSubmitBtn">' +
                '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>' +
                'Complete Purchase' +
              '</button>' +
              '<div class="co-trust-row">' +
                '<span class="co-trust-item"><svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>&nbsp;256-bit SSL</span>' +
                '<span class="co-trust-item">'+ICON('zap')+'&nbsp;Instant Delivery</span>' +
                '<span class="co-trust-item">↩&nbsp;Free Replacement</span>' +
              '</div>' +
              '<div class="co-err" id="coErr"></div>' +
            '</div>' +
            '<div class="co-right">' +
              '<div class="co-right__hdr">Order Summary</div>' +
              '<div class="co-right__product" id="coSummaryProduct"></div>' +
              '<div class="co-right__divider"></div>' +
              '<div class="co-right__rows" id="coSumRows"></div>' +
              '<div class="co-right__divider"></div>' +
              '<div class="co-perks">' +
                '<div class="co-perk"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>Instant digital delivery</span></div>' +
                '<div class="co-perk"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg><span>Encrypted checkout</span></div>' +
                '<div class="co-perk"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg><span>Free replacement guarantee</span></div>' +
                '<div class="co-perk"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><span>24/7 Discord support</span></div>' +
              '</div>' +
              '<div class="co-right__divider"></div>' +
              '<div>' +
                '<div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:8px;">Accepted Payments</div>' +
                '<div class="co-pay-row"><span class="co-pay-badge">VISA</span><span class="co-pay-badge">MC</span><span class="co-pay-badge">PAYPAL</span><span class="co-pay-badge" style="color:rgba(247,147,26,.7);border-color:rgba(247,147,26,.2);">BTC</span><span class="co-pay-badge" style="color:rgba(98,126,234,.7);border-color:rgba(98,126,234,.2);">ETH</span><span class="co-pay-badge" style="color:rgba(191,187,187,.7);">LTC</span><span class="co-pay-badge" style="color:rgba(153,69,255,.7);border-color:rgba(153,69,255,.2);">SOL</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="coSuccessState" style="display:none;">' +
          '<div style="padding:28px 24px;">' +
            '<div class="co-success">' +
              '<div class="co-success__check">✓</div>' +
              '<div class="co-success__title">Order Complete!</div>' +
              '<div class="co-success__sub" id="coSuccessSub">Your product is ready below.</div>' +
              '<div class="co-id-box"><div class="co-id-box__meta"><div class="co-id-box__lbl">Invoice ID</div><div class="co-id-box__val" id="coInvId"></div></div><button class="co-copy" id="coCopyBtn">Copy</button></div>' +
              '<div class="co-deliv-box"><div class="co-deliv-box__lbl">Your Product</div><div class="co-deliv-box__val" id="coDelivVal"></div><button class="co-reveal" id="coRevealBtn">'+ICON('eye')+' Click to reveal</button></div>' +
              '<div class="co-actions"><button class="co-back" id="coBackBtn">← Back to Shop</button></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', _html);

    var _pid = null;
    var _appliedPromo = null;
    var _selectedPM = 'direct'; // 'direct' or 'crypto'

    /* Payment method selector */
    document.getElementById('coPmDirect').addEventListener('click', function() {
      _selectedPM = 'direct';
      document.getElementById('coPmDirect').classList.add('co-pm-btn--active');
      document.getElementById('coPmCrypto').classList.remove('co-pm-btn--active');
      document.getElementById('coSubmitBtn').innerHTML = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg> Complete Purchase';
    });
    document.getElementById('coPmCrypto').addEventListener('click', function() {
      _selectedPM = 'crypto';
      document.getElementById('coPmCrypto').classList.add('co-pm-btn--active');
      document.getElementById('coPmDirect').classList.remove('co-pm-btn--active');
      document.getElementById('coSubmitBtn').innerHTML = '₿ Pay with Crypto';
    });

    function _whkPost(type, embed, content) {
      try {
        var _wa = JSON.parse(localStorage.getItem('nexus_webhooks') || '{}');
        var _wc = _wa[type] || {};
        if (!_wc.url) return;
        var body = { embeds: [embed] };
        if (_wc.msg) body.content = _wc.msg;
        if (content) body.content = (body.content ? body.content + ' ' : '') + content;
        fetch(_wc.url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }).catch(function(){});
      } catch(e) {}
    }

    function _fireCartAbandon() {
      var prods = getProds();
      var p = prods.find(function(x) { return x.id === _pid; });
      if (!p) return;
      var email = document.getElementById('coEmail') ? document.getElementById('coEmail').value.trim() : '';
      var sym = '€'; /* tout le site en € */
      _whkPost('CART_ABANDON', {
        title: '🛒 Panier abandonné', color: 0xFEE75C,
        fields: [
          { name: 'Produit', value: (p.icon||'📦')+' '+p.name, inline: true },
          { name: 'Email', value: email || 'Non fourni', inline: true },
          { name: 'Valeur potentielle', value: sym+Number(p.price).toFixed(2), inline: true }
        ],
        footer: { text: 'FlashShp Store' }, timestamp: new Date().toISOString()
      });
    }

    function closeModal() {
      var formState = document.getElementById('coFormState');
      if (formState && formState.style.display !== 'none' && _pid) _fireCartAbandon();
      document.getElementById('coOverlay').classList.remove('open');
      document.getElementById('coModal').classList.remove('open');
      document.body.style.overflow = '';
      _appliedPromo = null;
    }
    document.getElementById('coXBtn').addEventListener('click', closeModal);
    document.getElementById('coOverlay').addEventListener('click', closeModal);
    document.getElementById('coBackBtn').addEventListener('click', function () { window.location.href = '/products'; });

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
      document.getElementById('coRevealBtn').innerHTML = shown ? ICON('eye-off')+' Hide' : ICON('eye')+' Click to reveal';
    });

    document.getElementById('coPromoBtn').addEventListener('click', function () {
      var code = (document.getElementById('coPromoInput').value || '').trim().toUpperCase();
      var msgEl = document.getElementById('coPromoMsg');
      var prods = getProds();
      var p = prods.find(function(x) { return x.id === _pid; });
      if (!code) { msgEl.textContent = 'Entrez un code promo.'; msgEl.style.color = '#ff5555'; return; }
      try {
        var promos = JSON.parse(localStorage.getItem('nexus_promos') || '[]');
        var promo = promos.find(function(pr) { return pr.code === code; });
        if (!promo) { msgEl.textContent = 'Code invalide.'; msgEl.style.color = '#ff5555'; _appliedPromo = null; return; }
        if (promo.maxUses > 0 && promo.uses >= promo.maxUses) { msgEl.textContent = 'Code expiré.'; msgEl.style.color = '#ff5555'; _appliedPromo = null; return; }
        _appliedPromo = promo;
        msgEl.textContent = '✓ Code appliqué — -' + promo.discount + '%'; msgEl.style.color = '#3cd43c';
        _whkPost('PROMO_USE', {
          title: '🏷️ Code promo utilisé', color: 0x5865F2,
          fields: [
            { name: 'Code', value: promo.code, inline: true },
            { name: 'Réduction', value: '-'+promo.discount+'%', inline: true },
            { name: 'Produit', value: p ? (p.icon||'📦')+' '+p.name : '—', inline: true }
          ],
          footer: { text: 'FlashShp Store' }, timestamp: new Date().toISOString()
        });
      } catch(e) { msgEl.textContent = 'Erreur.'; msgEl.style.color = '#ff5555'; }
    });

    document.getElementById('coSubmitBtn').addEventListener('click', function () {
      var email = document.getElementById('coEmail').value.trim();
      var inp = document.getElementById('coEmail');
      var errEl = document.getElementById('coErr');
      inp.classList.remove('co-input-err');
      errEl.textContent = '';
      var prods = getProds();
      var p = prods.find(function (x) { return x.id === _pid; });
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        inp.classList.add('co-input-err');
        errEl.textContent = 'Please enter a valid email address.';
        _whkPost('PAYMENT_FAIL', {
          title: '❌ Payment failed', color: 0xED4245,
          fields: [
            { name: 'Product', value: p ? (p.icon||'📦')+' '+p.name : '—', inline: true },
            { name: 'Reason', value: 'Invalid or missing email', inline: true },
            { name: 'Time', value: new Date().toLocaleString(), inline: true }
          ],
          footer: { text: 'FlashShp Store' }, timestamp: new Date().toISOString()
        });
        return;
      }
      if (!p) { errEl.textContent = 'Product not found.'; return; }
      var delivs = p.deliverables || [];
      var hasStock = delivs.length > 0 || (p.stock || 0) > 0;
      if (!hasStock) {
        errEl.textContent = 'This product is currently out of stock.';
        _whkPost('PAYMENT_FAIL', {
          title: '❌ Payment failed', color: 0xED4245,
          fields: [
            { name: 'Product', value: (p.icon||'📦')+' '+p.name, inline: true },
            { name: 'Reason', value: 'Out of stock', inline: true },
            { name: 'Email', value: email, inline: true }
          ],
          footer: { text: 'FlashShp Store' }, timestamp: new Date().toISOString()
        });
        return;
      }

      /* ── Crypto payment flow ── */
      if (_selectedPM === 'crypto') {
        var invoiceId = generateId();
        var finalPriceForCrypto = Number(p.price);
        if (_appliedPromo) finalPriceForCrypto = finalPriceForCrypto * (1 - _appliedPromo.discount / 100);
        /* Prepare deliverable but don't deduct stock yet — wait for blockchain confirmation */
        var delivForCrypto = delivs.length > 0 ? delivs[0] : '(Contact support — invoice: ' + invoiceId + ')';
        closeModal();
        if (window._nexusOpenCryptoCheckout) {
          window._nexusOpenCryptoCheckout({
            id: p.id,
            name: p.name,
            icon: p.icon || '📦',
            price: finalPriceForCrypto,
            currency: 'EUR',
            invoiceId: invoiceId,
            email: email,
            deliverable: delivForCrypto,
            /* pass product ref so crypto system can deduct stock after confirmation */
            _deductStock: function() {
              var prods2 = getProds();
              var p2 = prods2.find(function(x) { return x.id === p.id; });
              if (!p2) return;
              if ((p2.deliverables || []).length > 0) {
                p2.deliverables = p2.deliverables.slice(1);
              } else if (p2.stock > 0) {
                p2.stock--;
              }
              var idx2 = prods2.findIndex(function(x) { return x.id === p.id; });
              if (idx2 !== -1) { prods2[idx2] = p2; saveProds(prods2); }
            }
          });
        }
        return;
      }

      var btn = document.getElementById('coSubmitBtn');
      btn.disabled = true; btn.innerHTML = 'Processing…';

      var _uaParsed = parseUA(navigator.userAgent);
      var _geoP = fetch('https://ipapi.co/json/').then(function(r) { return r.json(); }).catch(function() { return null; });
      var _delayP = new Promise(function(resolve) { setTimeout(resolve, 900); });

      Promise.all([_delayP, _geoP]).then(function(res) {
        var geoD = res[1] || {};
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

        var sym = '€'; /* tout le site en € */
        var finalPrice = Number(p.price);
        if (_appliedPromo) {
          finalPrice = finalPrice * (1 - _appliedPromo.discount / 100);
          try {
            var promos = JSON.parse(localStorage.getItem('nexus_promos') || '[]');
            var pi = promos.findIndex(function(pr) { return pr.code === _appliedPromo.code; });
            if (pi !== -1) { promos[pi].uses = (promos[pi].uses || 0) + 1; localStorage.setItem('nexus_promos', JSON.stringify(promos)); }
          } catch(e) {}
        }
        addOrder({ id: invoiceId, date: new Date().toISOString(), email: email, productId: p.id, productName: p.name, productIcon: p.icon || '📦', productDesc: p.desc || '', price: finalPrice, currency: 'EUR', deliverable: deliverable, status: 'completed', promoCode: _appliedPromo ? _appliedPromo.code : null, ip: geoD.ip || null, country: geoD.country_name || null, asn: geoD.org || null, browser: _uaParsed.browser, os: _uaParsed.os, userAgent: navigator.userAgent });

        /* Emails : « commande reçue » (création) puis « commande prête » (paiement).
           En Quick Pay le paiement est instantané, donc les deux partent à la suite. */
        _sendOrderEmail(email, invoiceId, p.name, '', 'created');
        _sendOrderEmail(email, invoiceId, p.name, deliverable, 'ready');

        /* Discord ORDER_CREATE webhook */
        _whkPost('ORDER_CREATE', {
          title: '🛍️ Nouvelle commande', color: 0x57F287,
          fields: [
            { name: 'Invoice ID', value: invoiceId, inline: true },
            { name: 'Produit', value: (p.icon||'📦')+' '+p.name, inline: true },
            { name: 'Email', value: email, inline: true },
            { name: 'Montant', value: sym+finalPrice.toFixed(2) + (_appliedPromo ? ' (promo -'+_appliedPromo.discount+'%)' : ''), inline: true },
            { name: 'IP', value: geoD.ip || '—', inline: true },
            { name: 'Pays', value: geoD.country_name || '—', inline: true }
          ],
          footer: { text: 'FlashShp Store' }, timestamp: new Date().toISOString()
        });

        document.getElementById('coFormState').style.display = 'none';
        document.getElementById('coSuccessState').style.display = '';
        document.getElementById('coSuccessSub').textContent = 'Check your email (' + email + ') for confirmation.';
        document.getElementById('coInvId').textContent = invoiceId;
        document.getElementById('coDelivVal').textContent = deliverable;
        document.getElementById('coDelivVal').classList.remove('shown');
        document.getElementById('coRevealBtn').innerHTML = ICON('eye')+' Click to reveal';
      });
    });

    window._nexusOpenCheckout = function (productId, variantIdx) {
      _pid = productId;
      var prods = getProds();
      var p = prods.find(function (x) { return x.id === productId; });
      if (!p) return;
      /* Variante choisie : surcharge nom + prix pour l'affichage du checkout */
      var vlist = Array.isArray(p.variants) ? p.variants : [];
      if (variantIdx != null && variantIdx !== '' && vlist[parseInt(variantIdx, 10)]) {
        var v = vlist[parseInt(variantIdx, 10)];
        p = Object.assign({}, p, { name: p.name + ' — ' + v.name, price: Number(v.price) });
      }
      var sym = '€'; /* tout le site en € */
      var price = Number(p.price).toFixed(2);

      /* Left: product row */
      document.getElementById('coProductRow').innerHTML =
        '<span class="co-product-row__icon">' + (p.icon || '📦') + '</span>' +
        '<div class="co-product-row__info"><div class="co-product-row__name">' + escH(p.name) + '</div><div class="co-product-row__desc">' + escH(p.desc || '') + '</div></div>' +
        '<span class="co-product-row__price">' + sym + price + '</span>';

      /* Right: summary panel */
      document.getElementById('coSummaryProduct').innerHTML =
        '<div class="co-right__product-icon">' + (p.icon || '📦') + '</div>' +
        '<div><div class="co-right__product-name">' + escH(p.name) + '</div><div class="co-right__product-qty">Qty: 1</div></div>';
      document.getElementById('coSumRows').innerHTML =
        '<div class="co-right__row"><span>Subtotal</span><span>' + sym + price + '</span></div>' +
        '<div class="co-right__row"><span>Tax</span><span>€0.00</span></div>' +
        '<div class="co-right__row co-right__row--total"><span>Total</span><span>' + sym + price + '</span></div>';

      document.getElementById('coEmail').value = '';
      document.getElementById('coEmail').classList.remove('co-input-err');
      document.getElementById('coErr').textContent = '';
      document.getElementById('coFormState').style.display = '';
      document.getElementById('coSuccessState').style.display = 'none';
      var sb = document.getElementById('coSubmitBtn');
      sb.disabled = false;
      sb.innerHTML = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg> Complete Purchase';
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
