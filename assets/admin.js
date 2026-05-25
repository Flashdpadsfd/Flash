/* Nexus Admin Panel */
(function () {
  'use strict';

  var DEFAULT_PASS = 'nexus2026';
  var DEFAULT_PRODUCTS = [
    { id: 1, name: 'Netflix Premium', category: 'streaming', price: 4.99, origPrice: null, icon: '🎬', desc: '1 Month · 4K UHD · Shared', badge: '', stock: 50, deliverables: [], gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
    { id: 2, name: 'Spotify Premium', category: 'streaming', price: 8.99, origPrice: null, icon: '🎵', desc: '3 Months · Family Plan', badge: 'HOT', stock: 32, deliverables: [], gradient: 'linear-gradient(135deg,#1e3a5f,#0a1628)' },
    { id: 3, name: 'Xbox Game Pass', category: 'gaming', price: 6.99, origPrice: null, icon: '🎮', desc: '1 Month · Ultimate', badge: 'NEW', stock: 18, deliverables: [], gradient: 'linear-gradient(135deg,#2d1b69,#11053b)' },
    { id: 4, name: 'NordVPN', category: 'vpn', price: 12.99, origPrice: 24.99, icon: '🔒', desc: '6 Months · Premium', badge: '', stock: 7, deliverables: [], gradient: 'linear-gradient(135deg,#1a3a1a,#0d1f0d)' },
    { id: 5, name: 'Disney+', category: 'streaming', price: 3.99, origPrice: null, icon: '📺', desc: '1 Month · 4K · Shared', badge: 'SALE', stock: 45, deliverables: [], gradient: 'linear-gradient(135deg,#3a1a1a,#1f0d0d)' },
    { id: 6, name: 'Adobe Creative Cloud', category: 'software', price: 19.99, origPrice: null, icon: '🎨', desc: '1 Month · All Apps', badge: '', stock: 0, deliverables: [], gradient: 'linear-gradient(135deg,#1a2a3a,#0d1520)' }
  ];
  var DEFAULT_STATS = { rating: '4.96', sold: '4,350', customers: '439' };
  var DEFAULT_REVIEWS = [
    { id: 1,  name: 'Alex L.',    initials: 'AL', color: '#e50914', date: 'May 2025',      product: 'Netflix',      productIcon: '📺', text: 'Got my Netflix credentials within seconds. Works perfectly on all my devices. Crazy value for the price, will definitely order again.' },
    { id: 2,  name: 'Sarah K.',   initials: 'SK', color: '#1db954', date: 'May 2025',      product: 'Spotify',      productIcon: '🎵', text: 'Been using Spotify Premium from Nexus for 3 months straight. Not a single issue. Support is also super responsive. 10/10.' },
    { id: 3,  name: 'Lucas R.',   initials: 'LR', color: '#6495ed', date: 'April 2025',    product: 'Gaming',       productIcon: '🎮', text: 'Legit service. Fast delivery, great price. I recommended it to my whole friend group and they all ordered too.' },
    { id: 4,  name: 'Marie T.',   initials: 'MT', color: '#ffa01e', date: 'April 2025',    product: 'Disney+',      productIcon: '🎬', text: 'Best purchase I\'ve made online in a while. Received access instantly and everything works without any issues. Very satisfied.' },
    { id: 5,  name: 'Jordan B.',  initials: 'JB', color: '#9b59b6', date: 'April 2025',    product: 'Netflix',      productIcon: '📺', text: 'I was skeptical at first but everything went smooth. Got access in under 2 minutes. Will 100% be coming back for more.' },
    { id: 6,  name: 'Emma W.',    initials: 'EW', color: '#1abc9c', date: 'March 2025',    product: 'Prime Video',  productIcon: '🎬', text: 'Super fast and incredibly affordable. Way better than paying full price every month. The service speaks for itself.' },
    { id: 7,  name: 'Thomas D.',  initials: 'TD', color: '#e74c3c', date: 'March 2025',    product: 'Gaming',       productIcon: '🎮', text: 'Bought a gaming account and it worked immediately. Great deal. Customer support helped me set it up in minutes. Zero issues.' },
    { id: 8,  name: 'Lena M.',    initials: 'LM', color: '#3498db', date: 'February 2025', product: 'VPN',          productIcon: '🔒', text: 'The VPN works perfectly on all my devices. Was worried it might be sketchy but nope, totally legit. Happy customer here.' },
    { id: 9,  name: 'Ryan S.',    initials: 'RS', color: '#f39c12', date: 'February 2025', product: 'Spotify',      productIcon: '🎵', text: 'Incredible value for money. I\'ve been a customer for 4 months now. Everything always works. No complaints whatsoever.' },
    { id: 10, name: 'Chris J.',   initials: 'CJ', color: '#e50914', date: 'January 2025',  product: 'Netflix',      productIcon: '📺', text: 'Ordered Netflix Premium, received it instantly. No setup headaches, just works. This is honestly the best way to do it.' },
    { id: 11, name: 'Amira P.',   initials: 'AP', color: '#00b4d8', date: 'January 2025',  product: 'Disney+',      productIcon: '🎬', text: 'Honestly impressed. The checkout was seamless and I had my account details in seconds. Great shop, will recommend to friends.' },
    { id: 12, name: 'Marco V.',   initials: 'MV', color: '#64c864', date: 'December 2024', product: 'Software',     productIcon: '💻', text: 'Top notch. Bought two different products and both worked perfectly. The prices are unbeatable. Keep it up!' }
  ];
  var DEFAULT_CATEGORIES = [
    { id: 'streaming', name: 'Streaming', icon: '▶', color: '#e50914' },
    { id: 'gaming',    name: 'Gaming',    icon: '🎮', color: '#64c864' },
    { id: 'software',  name: 'Software',  icon: '💻', color: '#6495ed' },
    { id: 'vpn',       name: 'VPN',       icon: '🔒', color: '#ffa01e' }
  ];
  var DEFAULT_CONTENT = {
    siteName:       'Nexus',
    homeEyebrow:    'Digital Products Store',
    homeTitle:      'Premium. Curated.<br>Digital.',
    homeSub:        'Paying full price for a streaming service you use three times a week is a bad deal. We sell the same thing for less, no catch.',
    homeCta1:       'Explore Products',
    homeCta2:       'Join Discord →',
    productsTitle:  'All Products',
    reviewsEyebrow: 'Verified Customers',
    reviewsTitle:   'What Our Customers Say',
    reviewsSub:     'Real reviews from real customers. Every review below is verified and 5-star rated.',
    reviewsRating:  '4.96',
    footerDesc:     'Premium streaming accounts,<br>delivered instantly.',
    footerCopy:     '© 2026 Nexus. All rights reserved.'
  };
  var CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£' };

  /* ── Storage helpers ── */
  function getProducts() {
    try { return JSON.parse(localStorage.getItem('nexus_products')) || DEFAULT_PRODUCTS; } catch(e) { return DEFAULT_PRODUCTS; }
  }
  function setProducts(p) { localStorage.setItem('nexus_products', JSON.stringify(p)); }
  function getStats() {
    try { return JSON.parse(localStorage.getItem('nexus_stats')) || DEFAULT_STATS; } catch(e) { return DEFAULT_STATS; }
  }
  function setStats(s) { localStorage.setItem('nexus_stats', JSON.stringify(s)); }
  function getPass() { return localStorage.getItem('nexus_admin_pass') || DEFAULT_PASS; }
  function setPass(p) { localStorage.setItem('nexus_admin_pass', p); }
  function getLinks() {
    try { return JSON.parse(localStorage.getItem('nexus_links')) || {}; } catch(e) { return {}; }
  }
  function setLinks(l) { localStorage.setItem('nexus_links', JSON.stringify(l)); }
  function getReviews() {
    try { return JSON.parse(localStorage.getItem('nexus_reviews')) || DEFAULT_REVIEWS; } catch(e) { return DEFAULT_REVIEWS; }
  }
  function setReviews(r) { localStorage.setItem('nexus_reviews', JSON.stringify(r)); }

  function getCategories() {
    try { return JSON.parse(localStorage.getItem('nexus_categories')) || DEFAULT_CATEGORIES; } catch(e) { return DEFAULT_CATEGORIES; }
  }
  function setCategories(c) { localStorage.setItem('nexus_categories', JSON.stringify(c)); }

  function getOrders() {
    try { return JSON.parse(localStorage.getItem('nexus_orders')) || []; } catch(e) { return []; }
  }
  function setOrders(o) { localStorage.setItem('nexus_orders', JSON.stringify(o)); }

  function getContent() {
    try { return Object.assign({}, DEFAULT_CONTENT, JSON.parse(localStorage.getItem('nexus_content') || '{}')); } catch(e) { return DEFAULT_CONTENT; }
  }
  function setContent(c) { localStorage.setItem('nexus_content', JSON.stringify(c)); }

  function getWebhooks() {
    try { return JSON.parse(localStorage.getItem('nexus_webhooks')) || {}; } catch(e) { return {}; }
  }
  function setWebhooks(w) { localStorage.setItem('nexus_webhooks', JSON.stringify(w)); }

  function sendDiscordWebhook(url, embed, content) {
    if (!url) return;
    var body = { embeds: [embed] };
    if (content) body.content = content;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).catch(function() {});
  }

  function getWebhookFor(type) {
    var all = getWebhooks();
    return all[type] || { url: '', msg: '' };
  }

  function discordLog(type, data) {
    var cfg = getWebhookFor(type);
    if (!cfg.url) return;
    var d = data || {};
    var sym = CURRENCY_SYMBOLS[d.currency] || '€';
    var stock = d.deliverables ? d.deliverables.length : (d.stock || 0);
    var pLabel = (d.icon || '📦') + ' ' + (d.name || '—');
    var embed;
    if      (type === 'PRODUCT_ADD')    embed = { title:'📦 Produit ajouté',    color:0x22c55e, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Prix',value:sym+Number(d.price||0).toFixed(2),inline:true},{name:'Catégorie',value:d.category||'—',inline:true}] };
    else if (type === 'PRODUCT_UPDATE') embed = { title:'✏️ Produit modifié',  color:0x3b82f6, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Prix',value:sym+Number(d.price||0).toFixed(2),inline:true},{name:'Stock',value:String(stock)+' unités',inline:true}] };
    else if (type === 'PRODUCT_DELETE') embed = { title:'🗑️ Produit supprimé', color:0xef4444, fields:[{name:'Produit',value:pLabel,inline:true},{name:'ID',value:String(d.id||'—'),inline:true}] };
    else if (type === 'STOCK_UPDATE')   embed = { title:'📊 Stock mis à jour',  color:0x0ea5e9, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Nouveau stock',value:String(stock)+' unités',inline:true},{name:'Mode',value:d.mode==='add'?'Ajout':'Remplacement',inline:true}] };
    else if (type === 'LOW_STOCK')      embed = { title:'⚠️ Stock faible',      color:0xf97316, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Stock restant',value:String(stock)+' unités',inline:true}] };
    else if (type === 'ADMIN_LOGIN')    embed = { title:'🔐 Connexion admin',   color:0x6366f1, description:'Une session admin a été ouverte.', fields:[{name:'Heure',value:new Date().toLocaleString('fr-FR'),inline:true}] };
    else return;
    embed.footer = { text:'Nexus Store' };
    embed.timestamp = new Date().toISOString();
    sendDiscordWebhook(cfg.url, embed, cfg.msg);
  }

  /* ── Toast ── */
  function toast(msg) {
    var t = document.getElementById('adminToast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  /* ── Auth ── */
  var loginScreen = document.getElementById('loginScreen');
  var app = document.getElementById('app');
  var loginError = document.getElementById('loginError');

  function checkSession() {
    if (sessionStorage.getItem('nexus_admin_ok') === '1') {
      loginScreen.style.display = 'none';
      app.style.display = 'flex';
      init();
    }
  }

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var pass = document.getElementById('loginPass').value;
    if (pass === getPass()) {
      sessionStorage.setItem('nexus_admin_ok', '1');
      loginError.classList.remove('show');
      loginScreen.style.display = 'none';
      app.style.display = 'flex';
      discordLog('ADMIN_LOGIN', {});
      init();
    } else {
      loginError.classList.add('show');
      document.getElementById('loginPass').value = '';
    }
  });

  window.logout = function () {
    sessionStorage.removeItem('nexus_admin_ok');
    app.style.display = 'none';
    loginScreen.style.display = 'flex';
    document.getElementById('loginPass').value = '';
  };

  /* ── Pages ── */
  window.showPage = function (name) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.sidebar__link').forEach(function (l) { l.classList.remove('active'); });
    document.getElementById('page-' + name).classList.add('active');
    document.querySelector('[data-page="' + name + '"]').classList.add('active');
    if (name === 'dashboard') renderDashboard();
    if (name === 'products') renderProducts();
    if (name === 'categories') renderCategories();
    if (name === 'reviews') renderReviews();
    if (name === 'orders') renderOrders();
    if (name === 'content') loadContentForm();
    if (name === 'stats') loadStatsForm();
    if (name === 'links') loadLinksForm();
    if (name === 'settings') loadWebhooksForm();
  };

  /* ── Stock helper (supports legacy numeric stock + new deliverables) ── */
  function getProductStock(p) {
    if (p.deliverables && Array.isArray(p.deliverables)) return p.deliverables.length;
    return p.stock || 0;
  }

  /* ── Dashboard ── */
  function renderDashboard() {
    var products = getProducts();
    var stats = getStats();
    var totalStock = products.reduce(function (a, p) { return a + getProductStock(p); }, 0);
    var outOfStock = products.filter(function (p) { return getProductStock(p) === 0; }).length;

    var orders = getOrders();
    var revenue = orders.reduce(function(a, o) { return a + (o.status !== 'refunded' ? Number(o.price || 0) : 0); }, 0);
    document.getElementById('dashKpis').innerHTML =
      kpiCard('Produits', products.length, 'Total actif') +
      kpiCard('Commandes', orders.length, 'Total reçues') +
      kpiCard('Revenus', '€' + revenue.toFixed(2), 'Hors remboursements') +
      kpiCard('Note moyenne', stats.rating + ' ★', 'Satisfaction client');

    var tbody = document.getElementById('dashTbody');
    tbody.innerHTML = products.slice(0, 5).map(function (p) {
      return '<tr>' +
        '<td><span class="prod-icon">' + (p.icon || '📦') + '</span><span class="prod-name">' + esc(p.name) + '</span></td>' +
        '<td>' + capitalize(p.category) + '</td>' +
        '<td>' + (CURRENCY_SYMBOLS[p.currency] || '$') + Number(p.price).toFixed(2) + '</td>' +
        '<td>' + stockPill(getProductStock(p)) + '</td>' +
        '<td>' + badgeHtml(p.badge) + '</td>' +
        '</tr>';
    }).join('');
  }

  function kpiCard(label, value, sub) {
    return '<div class="kpi-card"><div class="kpi-card__label">' + label + '</div>' +
      '<div class="kpi-card__value">' + value + '</div>' +
      '<div class="kpi-card__sub">' + sub + '</div></div>';
  }

  /* ── Products ── */
  function renderProducts() {
    var products = getProducts();
    var tbody = document.getElementById('productsTbody');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,.3);padding:32px;">Aucun produit. Cliquez sur « Nouveau produit ».</td></tr>';
      return;
    }
    tbody.innerHTML = products.map(function (p) {
      var sym = CURRENCY_SYMBOLS[p.currency] || '$';
      return '<tr>' +
        '<td><span class="prod-icon">' + (p.icon || '📦') + '</span><span class="prod-name">' + esc(p.name) + '</span></td>' +
        '<td>' + capitalize(p.category) + '</td>' +
        '<td>' + sym + Number(p.price).toFixed(2) + '</td>' +
        '<td>' + (p.origPrice ? '<span style="color:rgba(255,255,255,.35);text-decoration:line-through;">' + sym + Number(p.origPrice).toFixed(2) + '</span>' : '<span style="color:rgba(255,255,255,.2);">—</span>') + '</td>' +
        '<td>' + stockPill(getProductStock(p)) + '</td>' +
        '<td>' + badgeHtml(p.badge) + '</td>' +
        '<td><div class="action-group">' +
          '<button class="a-btn a-btn--icon" onclick="openStockModal(' + p.id + ')" title="Livrables">📦</button>' +
          '<button class="a-btn a-btn--icon" onclick="openModal(' + p.id + ')" title="Modifier">✏️</button>' +
          '<button class="a-btn a-btn--icon" onclick="deleteProduct(' + p.id + ')" title="Supprimer" style="color:#ff5555;">🗑</button>' +
        '</div></td>' +
        '</tr>';
    }).join('');
  }

  /* ── Modal produit ── */
  window.openModal = function (id) {
    var modal = document.getElementById('modal');
    var overlay = document.getElementById('modalOverlay');
    document.getElementById('editId').value = id || '';

    var p = id ? getProducts().find(function (x) { return x.id === id; }) : null;
    document.getElementById('modalTitle').textContent = p ? 'Modifier le produit' : 'Nouveau produit';

    populateCatSelect(p ? p.category : null);
    document.getElementById('fName').value        = p ? p.name : '';
    document.getElementById('fPrice').value       = p ? p.price : '';
    document.getElementById('fOrigPrice').value   = p && p.origPrice ? p.origPrice : '';
    document.getElementById('fIcon').value        = p ? (p.icon || '') : '';
    document.getElementById('fDesc').value        = p ? (p.desc || '') : '';
    document.getElementById('fGradient').value    = p ? (p.gradient || 'linear-gradient(135deg,#1a1a2e,#16213e)') : 'linear-gradient(135deg,#1a1a2e,#16213e)';
    document.getElementById('fCurrency').value    = p ? (p.currency || 'EUR') : 'EUR';
    document.getElementById('fStatusLabel').value = p ? (p.statusLabel || '') : '';

    /* Image */
    setImagePreview(p ? (p.image || '') : '');

    /* Deliverables */
    var deliverables = p ? (p.deliverables || []) : [];
    document.getElementById('fExistingDeliverables').value = JSON.stringify(deliverables);
    document.getElementById('fDeliverables').value = '';
    document.getElementById('fDeliverableMode').value = 'add';
    document.querySelectorAll('#deliverableTabs .deliverable-tab').forEach(function(t) {
      t.classList.toggle('active', t.dataset.mode === 'add');
    });
    document.getElementById('fDeliverableLabel').textContent = 'Nouveaux livrables';
    updateDeliverableIndicator(deliverables.length,
      document.getElementById('modalStockTitle'),
      document.getElementById('modalStockSub'),
      document.getElementById('modalStockPill'));

    /* Badge picker */
    var activeBadge = p ? (p.badge || '') : '';
    document.getElementById('fBadge').value = activeBadge;
    document.querySelectorAll('#badgePicker .badge-opt').forEach(function (opt) {
      opt.classList.toggle('active', opt.dataset.val === activeBadge);
    });

    /* Status color */
    var activeColor = p ? (p.statusColor || 'green') : 'green';
    document.getElementById('fStatusColor').value = activeColor;
    document.querySelectorAll('#statusColorPicker .status-dot').forEach(function (dot) {
      dot.classList.toggle('active', dot.dataset.color === activeColor);
    });

    updateCurrencyPrefixes();
    modal.classList.add('open');
    overlay.classList.add('open');
  };

  window.closeModal = function () {
    document.getElementById('modal').classList.remove('open');
    document.getElementById('modalOverlay').classList.remove('open');
  };

  /* ── Image helpers ── */
  function setImagePreview(src) {
    var preview   = document.getElementById('imagePreview');
    var empty     = document.getElementById('imageUploadEmpty');
    var removeBtn = document.getElementById('imageRemoveBtn');
    document.getElementById('fImage').value = src || '';
    if (src) {
      preview.src = src;
      preview.style.display = 'block';
      empty.style.display = 'none';
      removeBtn.style.display = 'flex';
    } else {
      preview.src = '';
      preview.style.display = 'none';
      empty.style.display = 'flex';
      removeBtn.style.display = 'none';
    }
  }

  window.handleImageUpload = function (input) {
    if (!input.files || !input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var MAX = 640;
        var scale = Math.min(1, MAX / Math.max(img.width, img.height));
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  };

  window.removeProductImage = function (e) {
    e.stopPropagation();
    document.getElementById('fImageInput').value = '';
    setImagePreview('');
  };

  /* ── Currency prefix ── */
  window.updateCurrencyPrefixes = function () {
    var sym = CURRENCY_SYMBOLS[document.getElementById('fCurrency').value] || '€';
    document.getElementById('pricePrefix').textContent = sym;
    document.getElementById('origPricePrefix').textContent = sym;
  };

  /* ── Deliverable indicator ── */
  function updateDeliverableIndicator(count, titleEl, subEl, pillEl) {
    if (count === 0) {
      titleEl.textContent = 'Aucun livrable';
      subEl.textContent   = 'Stock actuel : 0';
      pillEl.className    = 'stock-pill stock-pill--out';
    } else if (count < 10) {
      titleEl.textContent = 'Stock faible';
      subEl.textContent   = count + ' livrable' + (count > 1 ? 's' : '') + ' disponible' + (count > 1 ? 's' : '');
      pillEl.className    = 'stock-pill stock-pill--low';
    } else {
      titleEl.textContent = 'En stock';
      subEl.textContent   = count + ' livrables disponibles';
      pillEl.className    = 'stock-pill stock-pill--ok';
    }
    pillEl.textContent = count;
  }

  window.saveProduct = function () {
    var name  = document.getElementById('fName').value.trim();
    var price = parseFloat(document.getElementById('fPrice').value);
    if (!name || isNaN(price)) { toast('Nom et prix requis.'); return; }

    var products = getProducts();
    var editId = document.getElementById('editId').value;
    var existingProduct = editId ? products.find(function(p) { return p.id === parseInt(editId); }) : null;

    /* Deliverables */
    var mode = document.getElementById('fDeliverableMode').value;
    var newLines = document.getElementById('fDeliverables').value
      .split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
    var existingDeliverables = existingProduct ? (existingProduct.deliverables || []) : [];
    var deliverables = mode === 'add' ? existingDeliverables.concat(newLines) : newLines;

    var product = {
      name: name,
      category: document.getElementById('fCat').value,
      price: price,
      origPrice: parseFloat(document.getElementById('fOrigPrice').value) || null,
      icon: document.getElementById('fIcon').value.trim() || '📦',
      deliverables: deliverables,
      stock: deliverables.length,
      desc: document.getElementById('fDesc').value.trim(),
      badge: document.getElementById('fBadge').value,
      gradient: document.getElementById('fGradient').value,
      image: document.getElementById('fImage').value || null,
      currency: document.getElementById('fCurrency').value || 'EUR',
      statusColor: document.getElementById('fStatusColor').value || 'green',
      statusLabel: document.getElementById('fStatusLabel').value.trim()
    };

    if (editId) {
      var idx = products.findIndex(function (p) { return p.id === parseInt(editId); });
      if (idx !== -1) { product.id = parseInt(editId); products[idx] = product; }
    } else {
      var maxId = products.reduce(function (m, p) { return Math.max(m, p.id || 0); }, 0);
      product.id = maxId + 1;
      products.push(product);
    }

    setProducts(products);
    closeModal();
    renderProducts();
    toast(editId ? 'Produit modifié ✓' : 'Produit ajouté ✓');
    discordLog(editId ? 'PRODUCT_UPDATE' : 'PRODUCT_ADD', product);
  };

  window.deleteProduct = function (id) {
    if (!confirm('Supprimer ce produit ?')) return;
    var all = getProducts();
    var deleted = all.find(function(p) { return p.id === id; });
    setProducts(all.filter(function (p) { return p.id !== id; }));
    renderProducts();
    toast('Produit supprimé.');
    if (deleted) discordLog('PRODUCT_DELETE', deleted);
  };

  /* ── Modal stock / Livrables ── */
  window.openStockModal = function (id) {
    var p = getProducts().find(function (x) { return x.id === id; });
    if (!p) return;
    var deliverables = p.deliverables || [];
    document.getElementById('stockEditId').value = id;
    document.getElementById('stockProductName').textContent = p.name;
    document.getElementById('stockExistingDeliverables').value = JSON.stringify(deliverables);
    document.getElementById('stockDeliverables').value = '';
    document.getElementById('fStockDeliverableMode').value = 'add';
    document.querySelectorAll('#stockDeliverableTabs .deliverable-tab').forEach(function(t) {
      t.classList.toggle('active', t.dataset.mode === 'add');
    });
    document.getElementById('stockDeliverableLabel').textContent = 'Nouveaux livrables';
    updateDeliverableIndicator(deliverables.length,
      document.getElementById('stockModalTitle'),
      document.getElementById('stockModalSub'),
      document.getElementById('stockModalPill'));
    document.getElementById('stockModal').classList.add('open');
    document.getElementById('stockOverlay').classList.add('open');
  };

  window.closeStockModal = function () {
    document.getElementById('stockModal').classList.remove('open');
    document.getElementById('stockOverlay').classList.remove('open');
  };

  window.saveStock = function () {
    var id = parseInt(document.getElementById('stockEditId').value);
    var mode = document.getElementById('fStockDeliverableMode').value;
    var newLines = document.getElementById('stockDeliverables').value
      .split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
    var products = getProducts();
    var idx = products.findIndex(function (p) { return p.id === id; });
    if (idx !== -1) {
      var existing = products[idx].deliverables || [];
      products[idx].deliverables = mode === 'add' ? existing.concat(newLines) : newLines;
      products[idx].stock = products[idx].deliverables.length;
      setProducts(products);
      var updated = products[idx];
      discordLog('STOCK_UPDATE', Object.assign({ mode: mode }, updated));
      if (updated.stock > 0 && updated.stock < 5) discordLog('LOW_STOCK', updated);
    }
    closeStockModal();
    renderProducts();
    toast('Stock mis à jour ✓');
  };

  /* ── Stats ── */
  function loadStatsForm() {
    var s = getStats();
    document.getElementById('statRating').value = s.rating || '';
    document.getElementById('statSold').value = s.sold || '';
    document.getElementById('statCustomers').value = s.customers || '';
    document.getElementById('statsSaveMsg').textContent = '';
  }

  window.saveStats = function () {
    setStats({
      rating: document.getElementById('statRating').value.trim(),
      sold: document.getElementById('statSold').value.trim(),
      customers: document.getElementById('statCustomers').value.trim()
    });
    document.getElementById('statsSaveMsg').textContent = 'Statistiques enregistrées ✓';
    toast('Stats mises à jour ✓');
  };

  /* ── Categories ── */
  function slugify(name) {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function populateCatSelect(currentVal) {
    var cats = getCategories();
    var select = document.getElementById('fCat');
    if (!select) return;
    select.innerHTML = cats.map(function(c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>';
    }).join('');
    if (currentVal) select.value = currentVal;
  }

  function renderCategories() {
    var cats = getCategories();
    var tbody = document.getElementById('categoriesTbody');
    if (!tbody) return;
    if (!cats.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,.3);padding:24px;">Aucune catégorie.</td></tr>';
    } else {
      tbody.innerHTML = cats.map(function(c) {
        return '<tr>' +
          '<td style="font-size:18px;">' + (c.icon || '📦') + '</td>' +
          '<td>' + esc(c.name) + '</td>' +
          '<td><span style="font-size:12px;color:rgba(255,255,255,.4);font-family:monospace;">' + esc(c.id) + '</span></td>' +
          '<td><span style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + esc(c.color) + ';flex-shrink:0;"></span>' + esc(c.color) + '</span></td>' +
          '<td><div class="action-group">' +
            '<button class="a-btn a-btn--icon" onclick="editCategory(\'' + esc(c.id) + '\')" title="Modifier">✏️</button>' +
            '<button class="a-btn a-btn--icon" onclick="deleteCategory(\'' + esc(c.id) + '\')" style="color:#ff5555;" title="Supprimer">🗑</button>' +
          '</div></td>' +
          '</tr>';
      }).join('');
    }
    cancelEditCategory();
    populateCatSelect();
  }

  window.editCategory = function(id) {
    var c = getCategories().find(function(x) { return x.id === id; });
    if (!c) return;
    document.getElementById('catEditId').value   = id;
    document.getElementById('catName').value     = c.name;
    document.getElementById('catIcon').value     = c.icon || '';
    document.getElementById('catColor').value    = c.color || '#6495ed';
    var btn = document.getElementById('catSubmitBtn');
    btn.innerHTML = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Modifier';
    document.getElementById('catCancelBtn').style.display = '';
    document.getElementById('catSaveMsg').textContent = '';
    document.getElementById('catName').focus();
  };

  window.cancelEditCategory = function() {
    document.getElementById('catEditId').value = '';
    document.getElementById('catName').value   = '';
    document.getElementById('catIcon').value   = '';
    document.getElementById('catColor').value  = '#6495ed';
    var btn = document.getElementById('catSubmitBtn');
    if (btn) btn.innerHTML = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter';
    var cancel = document.getElementById('catCancelBtn');
    if (cancel) cancel.style.display = 'none';
    var msg = document.getElementById('catSaveMsg');
    if (msg) msg.textContent = '';
  };

  window.saveCategory = function() {
    var name    = document.getElementById('catName').value.trim();
    var msg     = document.getElementById('catSaveMsg');
    var editId  = document.getElementById('catEditId').value;
    if (!name) { toast('Nom requis.'); return; }
    var cats = getCategories();
    var updated = { icon: document.getElementById('catIcon').value.trim() || '📦', color: document.getElementById('catColor').value, name: name };
    if (editId) {
      var idx = cats.findIndex(function(c) { return c.id === editId; });
      if (idx !== -1) { cats[idx] = Object.assign({}, cats[idx], updated); }
      setCategories(cats);
      renderCategories();
      msg.textContent = 'Catégorie modifiée ✓'; msg.style.color = '#3cc864';
      toast('Catégorie modifiée ✓');
    } else {
      var slug = slugify(name);
      if (!slug) { msg.textContent = 'Nom invalide.'; msg.style.color = '#ff5555'; return; }
      if (cats.find(function(c) { return c.id === slug; })) {
        msg.textContent = 'Cette catégorie existe déjà.'; msg.style.color = '#ff5555'; return;
      }
      cats.push(Object.assign({ id: slug }, updated));
      setCategories(cats);
      renderCategories();
      msg.textContent = 'Catégorie ajoutée ✓'; msg.style.color = '#3cc864';
      toast('Catégorie ajoutée ✓');
    }
  };

  window.deleteCategory = function(id) {
    if (!confirm('Supprimer cette catégorie ? Les produits associés garderont leur slug.')) return;
    setCategories(getCategories().filter(function(c) { return c.id !== id; }));
    renderCategories();
    toast('Catégorie supprimée.');
  };

  /* ── Reviews ── */
  var STAR_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  function renderReviews() {
    var reviews = getReviews();
    var tbody = document.getElementById('reviewsTbody');
    if (!tbody) return;
    if (!reviews.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,.3);padding:24px;">Aucun avis.</td></tr>';
    } else {
      tbody.innerHTML = reviews.map(function(r) {
        var stars = STAR_SVG + STAR_SVG + STAR_SVG + STAR_SVG + STAR_SVG;
        var shortText = esc(r.text).length > 80 ? esc(r.text).slice(0, 80) + '…' : esc(r.text);
        return '<tr>' +
          '<td><div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="width:32px;height:32px;border-radius:50%;background:' + esc(r.color) + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;">' + esc(r.initials) + '</div>' +
            '<span>' + esc(r.name) + '</span>' +
          '</div></td>' +
          '<td><span style="display:flex;align-items:center;gap:5px;">' + esc(r.productIcon || '') + ' ' + esc(r.product || '') + '</span></td>' +
          '<td style="color:rgba(255,255,255,.45);font-size:13px;">' + esc(r.date) + '</td>' +
          '<td style="max-width:260px;"><div style="display:flex;gap:2px;margin-bottom:4px;">' + stars + '</div><span style="font-size:13px;color:rgba(255,255,255,.6);">' + shortText + '</span></td>' +
          '<td><div class="action-group">' +
            '<button class="a-btn a-btn--icon" onclick="editReview(' + r.id + ')" title="Modifier">✏️</button>' +
            '<button class="a-btn a-btn--icon" onclick="deleteReview(' + r.id + ')" style="color:#ff5555;" title="Supprimer">🗑</button>' +
          '</div></td>' +
          '</tr>';
      }).join('');
    }
    cancelEditReview();
  }

  window.autoInitials = function() {
    var name = document.getElementById('rvName').value.trim();
    var parts = name.split(/\s+/).filter(Boolean);
    var initials = parts.map(function(p) { return p[0].toUpperCase(); }).join('').slice(0, 2);
    document.getElementById('rvInitials').value = initials;
  };

  window.editReview = function(id) {
    var r = getReviews().find(function(x) { return x.id === id; });
    if (!r) return;
    document.getElementById('rvEditId').value      = id;
    document.getElementById('rvName').value        = r.name;
    document.getElementById('rvInitials').value    = r.initials;
    document.getElementById('rvColor').value       = r.color;
    document.getElementById('rvDate').value        = r.date;
    document.getElementById('rvProduct').value     = r.product;
    document.getElementById('rvProductIcon').value = r.productIcon;
    document.getElementById('rvText').value        = r.text;
    var btn = document.getElementById('rvSubmitBtn');
    btn.innerHTML = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Modifier';
    document.getElementById('rvCancelBtn').style.display = '';
    document.getElementById('rvSaveMsg').textContent = '';
    document.getElementById('rvName').focus();
    document.getElementById('rvName').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.cancelEditReview = function() {
    document.getElementById('rvEditId').value      = '';
    document.getElementById('rvName').value        = '';
    document.getElementById('rvInitials').value    = '';
    document.getElementById('rvColor').value       = '#e50914';
    document.getElementById('rvDate').value        = '';
    document.getElementById('rvProduct').value     = '';
    document.getElementById('rvProductIcon').value = '';
    document.getElementById('rvText').value        = '';
    var btn = document.getElementById('rvSubmitBtn');
    if (btn) btn.innerHTML = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter';
    var cancel = document.getElementById('rvCancelBtn');
    if (cancel) cancel.style.display = 'none';
    var msg = document.getElementById('rvSaveMsg');
    if (msg) msg.textContent = '';
  };

  window.saveReview = function() {
    var name    = document.getElementById('rvName').value.trim();
    var text    = document.getElementById('rvText').value.trim();
    var msg     = document.getElementById('rvSaveMsg');
    var editId  = parseInt(document.getElementById('rvEditId').value, 10);
    if (!name) { toast('Nom requis.'); return; }
    if (!text)  { toast('Texte requis.'); return; }
    var reviews = getReviews();
    var updated = {
      name:        name,
      initials:    document.getElementById('rvInitials').value.trim() || name.split(/\s+/).map(function(p){return p[0];}).join('').slice(0,2).toUpperCase(),
      color:       document.getElementById('rvColor').value,
      date:        document.getElementById('rvDate').value.trim() || 'May 2025',
      product:     document.getElementById('rvProduct').value.trim(),
      productIcon: document.getElementById('rvProductIcon').value.trim() || '⭐',
      text:        text
    };
    if (editId) {
      var idx = reviews.findIndex(function(r) { return r.id === editId; });
      if (idx !== -1) reviews[idx] = Object.assign({}, reviews[idx], updated);
      setReviews(reviews);
      renderReviews();
      msg.textContent = 'Avis modifié ✓'; msg.style.color = '#3cc864';
      toast('Avis modifié ✓');
    } else {
      var newId = reviews.reduce(function(max, r) { return Math.max(max, r.id); }, 0) + 1;
      reviews.push(Object.assign({ id: newId }, updated));
      setReviews(reviews);
      renderReviews();
      msg.textContent = 'Avis ajouté ✓'; msg.style.color = '#3cc864';
      toast('Avis ajouté ✓');
    }
  };

  window.deleteReview = function(id) {
    if (!confirm('Supprimer cet avis ?')) return;
    setReviews(getReviews().filter(function(r) { return r.id !== id; }));
    renderReviews();
    toast('Avis supprimé.');
  };

  /* ── Content editor ── */
  var _contentLiveTimer = null;
  var _contentListenersAttached = false;
  var CONTENT_FIELDS = ['cSiteName','cFooterDesc','cFooterCopy','cHomeEyebrow','cHomeTitle','cHomeSub','cHomeCta1','cHomeCta2','cProductsTitle','cReviewsEyebrow','cReviewsTitle','cReviewsSub','cReviewsRating'];

  function readContentForm() {
    var c = {};
    c.siteName       = document.getElementById('cSiteName').value.trim();
    c.footerDesc     = document.getElementById('cFooterDesc').value.trim();
    c.footerCopy     = document.getElementById('cFooterCopy').value.trim();
    c.homeEyebrow    = document.getElementById('cHomeEyebrow').value.trim();
    c.homeTitle      = document.getElementById('cHomeTitle').value.trim();
    c.homeSub        = document.getElementById('cHomeSub').value.trim();
    c.homeCta1       = document.getElementById('cHomeCta1').value.trim();
    c.homeCta2       = document.getElementById('cHomeCta2').value.trim();
    c.productsTitle  = document.getElementById('cProductsTitle').value.trim();
    c.reviewsEyebrow = document.getElementById('cReviewsEyebrow').value.trim();
    c.reviewsTitle   = document.getElementById('cReviewsTitle').value.trim();
    c.reviewsSub     = document.getElementById('cReviewsSub').value.trim();
    c.reviewsRating  = document.getElementById('cReviewsRating').value.trim();
    Object.keys(c).forEach(function(k) { if (!c[k]) delete c[k]; });
    return c;
  }

  function loadContentForm() {
    var c = getContent();
    document.getElementById('cSiteName').value       = c.siteName       || '';
    document.getElementById('cFooterDesc').value     = c.footerDesc     || '';
    document.getElementById('cFooterCopy').value     = c.footerCopy     || '';
    document.getElementById('cHomeEyebrow').value    = c.homeEyebrow    || '';
    document.getElementById('cHomeTitle').value      = c.homeTitle      || '';
    document.getElementById('cHomeSub').value        = c.homeSub        || '';
    document.getElementById('cHomeCta1').value       = c.homeCta1       || '';
    document.getElementById('cHomeCta2').value       = c.homeCta2       || '';
    document.getElementById('cProductsTitle').value  = c.productsTitle  || '';
    document.getElementById('cReviewsEyebrow').value = c.reviewsEyebrow || '';
    document.getElementById('cReviewsTitle').value   = c.reviewsTitle   || '';
    document.getElementById('cReviewsSub').value     = c.reviewsSub     || '';
    document.getElementById('cReviewsRating').value  = c.reviewsRating  || '';
    document.getElementById('contentSaveMsg').textContent = '';

    if (!_contentListenersAttached) {
      _contentListenersAttached = true;
      CONTENT_FIELDS.forEach(function(id) {
        document.getElementById(id).addEventListener('input', function() {
          clearTimeout(_contentLiveTimer);
          _contentLiveTimer = setTimeout(function() {
            setContent(readContentForm());
            var msg = document.getElementById('contentSaveMsg');
            msg.textContent = 'Sauvegardé ✓'; msg.style.color = 'rgba(255,255,255,.4)';
          }, 300);
        });
      });
    }
  }

  window.saveContent = function() {
    setContent(readContentForm());
    var msg = document.getElementById('contentSaveMsg');
    msg.textContent = 'Contenu enregistré ✓'; msg.style.color = '#3cc864';
    toast('Contenu mis à jour ✓');
  };

  /* ── Webhooks ── */
  var WHK_EVENTS = ['ORDER_CREATE','REFUND','PRODUCT_ADD','PRODUCT_UPDATE','PRODUCT_DELETE','STOCK_UPDATE','LOW_STOCK','ADMIN_LOGIN','BUG','CHANGELOG'];

  function loadWebhooksForm() {
    var all = getWebhooks();
    WHK_EVENTS.forEach(function(type) {
      var cfg = all[type] || {};
      var enEl  = document.getElementById('en-'  + type);
      var urlEl = document.getElementById('url-' + type);
      var msgEl = document.getElementById('msg-' + type);
      var expEl = document.getElementById('expand-' + type);
      if (!enEl) return;
      var enabled = !!(cfg.url);
      enEl.checked = enabled;
      if (urlEl) urlEl.value = cfg.url || '';
      if (msgEl) msgEl.value = cfg.msg || '';
      if (expEl) expEl.classList[enabled ? 'add' : 'remove']('open');
    });
    document.getElementById('whkSaveMsg').textContent = '';
    document.getElementById('changelogMsg').textContent = '';
  }

  window.toggleWebhookCard = function(type) {
    var checked = document.getElementById('en-' + type).checked;
    var expEl = document.getElementById('expand-' + type);
    if (expEl) expEl.classList[checked ? 'add' : 'remove']('open');
  };

  window.saveWebhooks = function() {
    var all = {};
    WHK_EVENTS.forEach(function(type) {
      var urlEl = document.getElementById('url-' + type);
      var msgEl = document.getElementById('msg-' + type);
      var url = urlEl ? urlEl.value.trim() : '';
      var msg = msgEl ? msgEl.value.trim() : '';
      if (url) all[type] = { url: url, msg: msg };
    });
    setWebhooks(all);
    var el = document.getElementById('whkSaveMsg');
    el.textContent = 'Enregistré ✓'; el.style.color = '#3cc864';
    toast('Webhooks Discord enregistrés ✓');
  };

  window.testWebhookCard = function(type) {
    var urlEl = document.getElementById('url-' + type);
    var url = urlEl ? urlEl.value.trim() : '';
    var statusEl = document.getElementById('test-' + type);
    if (!url) { if (statusEl) { statusEl.textContent = 'URL manquante.'; statusEl.style.color = '#ff5555'; } return; }
    if (statusEl) { statusEl.textContent = 'Envoi…'; statusEl.style.color = 'rgba(255,255,255,.4)'; }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{ title:'🔔 Test — ' + type, description:'Webhook configuré et fonctionnel.', color:0x5865f2, fields:[{name:'Store',value:'Nexus',inline:true},{name:'Statut',value:'✅ Actif',inline:true}], footer:{text:'Nexus Store'}, timestamp:new Date().toISOString() }] })
    }).then(function(r) {
      if (statusEl) { statusEl.textContent = (r.ok||r.status===204) ? '✓ OK' : 'Erreur '+r.status; statusEl.style.color = (r.ok||r.status===204) ? '#3cc864' : '#ff5555'; }
    }).catch(function() { if (statusEl) { statusEl.textContent = 'Erreur réseau.'; statusEl.style.color = '#ff5555'; } });
  };

  window.sendChangelog = function() {
    var cfg = getWebhookFor('CHANGELOG');
    var text = document.getElementById('whkChangelog').value.trim();
    var msgEl = document.getElementById('changelogMsg');
    if (!cfg.url) { msgEl.textContent = 'Configurez le webhook Changelog ci-dessus.'; msgEl.style.color = '#ff5555'; return; }
    if (!text)    { msgEl.textContent = 'Message vide.'; msgEl.style.color = '#ff5555'; return; }
    msgEl.textContent = 'Envoi…'; msgEl.style.color = 'rgba(255,255,255,.4)';
    var body = { embeds: [{ title:'📋 Changelog — Nexus Store', color:0xa78bfa, description:text, footer:{text:'Nexus Store'}, timestamp:new Date().toISOString() }] };
    if (cfg.msg) body.content = cfg.msg;
    fetch(cfg.url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      .then(function(r) {
        if (r.ok || r.status === 204) { msgEl.textContent = 'Publié ✓'; msgEl.style.color = '#3cc864'; document.getElementById('whkChangelog').value = ''; }
        else { msgEl.textContent = 'Erreur ' + r.status; msgEl.style.color = '#ff5555'; }
      }).catch(function() { msgEl.textContent = 'Erreur réseau.'; msgEl.style.color = '#ff5555'; });
  };

  /* ── Orders ── */
  function renderOrders(query) {
    var orders = getOrders();
    var q = (query || '').toLowerCase();
    if (q) orders = orders.filter(function(o) {
      return (o.id || '').toLowerCase().indexOf(q) !== -1 ||
             (o.email || '').toLowerCase().indexOf(q) !== -1 ||
             (o.productName || '').toLowerCase().indexOf(q) !== -1;
    });
    var tbody = document.getElementById('ordersTbody');
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,.3);padding:36px;">' +
        (q ? 'Aucune commande correspondante.' : 'Aucune commande pour le moment.') + '</td></tr>';
      return;
    }
    tbody.innerHTML = orders.map(function(o) {
      var sym = CURRENCY_SYMBOLS[o.currency] || '€';
      var d = o.date ? new Date(o.date).toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'}) : '—';
      var statusPill = o.status === 'refunded'
        ? '<span class="stock-pill stock-pill--out">Remboursé</span>'
        : o.status === 'pending'
          ? '<span class="stock-pill stock-pill--low">En attente</span>'
          : '<span class="stock-pill stock-pill--ok">Complété</span>';
      return '<tr>' +
        '<td style="font-family:\'Courier New\',monospace;font-size:13px;letter-spacing:.03em;white-space:nowrap;">' + esc(o.id) + '</td>' +
        '<td><span class="prod-icon">' + (o.productIcon || '📦') + '</span><span class="prod-name">' + esc(o.productName || '') + '</span></td>' +
        '<td style="font-size:13px;color:rgba(255,255,255,.5);">' + esc(o.email || '') + '</td>' +
        '<td style="font-weight:600;">' + sym + Number(o.price).toFixed(2) + '</td>' +
        '<td style="font-size:13px;color:rgba(255,255,255,.5);white-space:nowrap;">' + d + '</td>' +
        '<td>' + statusPill + '</td>' +
        '<td><div class="action-group">' +
          '<a class="a-btn a-btn--icon" href="invoice.html?id=' + esc(o.id) + '" target="_blank" title="Voir la facture">🧾</a>' +
          (o.status !== 'refunded' ? '<button class="a-btn a-btn--icon" onclick="refundOrder(\'' + esc(o.id) + '\')" title="Rembourser" style="color:#ffa01e;">↩</button>' : '') +
          '<button class="a-btn a-btn--icon" onclick="deleteOrder(\'' + esc(o.id) + '\')" title="Supprimer" style="color:#ff5555;">🗑</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  window.filterOrders = function(q) { renderOrders(q); };

  window.refundOrder = function(id) {
    var orders = getOrders();
    var o = orders.find(function(x) { return x.id === id; });
    if (!o || !confirm('Marquer ' + id + ' comme remboursée ?')) return;
    o.status = 'refunded';
    setOrders(orders);
    renderOrders(document.getElementById('ordersSearch').value);
    var cfg = getWebhookFor('REFUND');
    if (cfg.url) {
      var sym = CURRENCY_SYMBOLS[o.currency] || '€';
      sendDiscordWebhook(cfg.url, {
        title: '↩️ Remboursement effectué',
        color: 15158332,
        fields: [
          { name: 'Invoice ID', value: o.id || '—', inline: true },
          { name: 'Produit',    value: (o.productIcon || '') + ' ' + (o.productName || '—'), inline: true },
          { name: 'Email',      value: o.email || '—', inline: true },
          { name: 'Montant',    value: sym + Number(o.price || 0).toFixed(2), inline: true }
        ],
        footer: { text: 'Nexus Store' },
        timestamp: new Date().toISOString()
      }, cfg.msg);
    }
    toast('Commande marquée remboursée.');
  };

  window.deleteOrder = function(id) {
    if (!confirm('Supprimer définitivement la commande ' + id + ' ?')) return;
    setOrders(getOrders().filter(function(o) { return o.id !== id; }));
    renderOrders(document.getElementById('ordersSearch').value);
    toast('Commande supprimée.');
  };

  /* ── Links ── */
  function loadLinksForm() {
    var l = getLinks();
    document.getElementById('linkDiscord').value  = l.discord  || '';
    document.getElementById('linkTelegram').value = l.telegram || '';
    document.getElementById('linkTos').value      = l.tos      || '';
    document.getElementById('linkPrivacy').value  = l.privacy  || '';
    document.getElementById('linkFeedback').value = l.feedback || '';
    document.getElementById('linksSaveMsg').textContent = '';
  }

  window.saveLinks = function () {
    setLinks({
      discord:  document.getElementById('linkDiscord').value.trim(),
      telegram: document.getElementById('linkTelegram').value.trim(),
      tos:      document.getElementById('linkTos').value.trim(),
      privacy:  document.getElementById('linkPrivacy').value.trim(),
      feedback: document.getElementById('linkFeedback').value.trim()
    });
    document.getElementById('linksSaveMsg').textContent = 'Liens enregistrés ✓';
    toast('Liens mis à jour ✓');
  };

  /* ── Settings ── */
  window.changePassword = function () {
    var np  = document.getElementById('newPass').value;
    var cp  = document.getElementById('confirmPass').value;
    var msg = document.getElementById('settingsSaveMsg');
    if (!np) { msg.textContent = 'Mot de passe vide.'; msg.style.color = '#ff5555'; return; }
    if (np !== cp) { msg.textContent = 'Les mots de passe ne correspondent pas.'; msg.style.color = '#ff5555'; return; }
    setPass(np);
    msg.textContent = 'Mot de passe changé ✓'; msg.style.color = '#3cc864';
    document.getElementById('newPass').value = '';
    document.getElementById('confirmPass').value = '';
    toast('Mot de passe changé ✓');
  };

  window.resetAll = function () {
    if (!confirm('Supprimer tous les produits et réinitialiser les stats ?')) return;
    localStorage.removeItem('nexus_products');
    localStorage.removeItem('nexus_stats');
    localStorage.removeItem('nexus_links');
    localStorage.removeItem('nexus_categories');
    localStorage.removeItem('nexus_reviews');
    localStorage.removeItem('nexus_content');
    localStorage.removeItem('nexus_orders');
    toast('Données réinitialisées.');
    renderProducts();
    loadStatsForm();
  };

  /* ── Helpers ── */
  function esc(s) { return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function stockPill(stock) {
    stock = stock || 0;
    if (stock === 0) return '<span class="stock-pill stock-pill--out">Épuisé</span>';
    if (stock < 10)  return '<span class="stock-pill stock-pill--low">' + stock + '</span>';
    return '<span class="stock-pill stock-pill--ok">' + stock + '</span>';
  }

  function badgeHtml(badge) {
    if (!badge) return '<span class="tbadge tbadge--none">—</span>';
    var cls = badge === 'HOT' ? 'hot' : badge === 'NEW' ? 'new' : 'sale';
    return '<span class="tbadge tbadge--' + cls + '">' + badge + '</span>';
  }

  /* ── Init ── */
  function init() {
    renderDashboard();
    populateCatSelect();
    initModalPickers();
  }

  function initDeliverableTabs(tabsId, textareaId, modeId, existingId, labelId) {
    var tabs = document.getElementById(tabsId);
    if (!tabs) return;
    tabs.querySelectorAll('.deliverable-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.querySelectorAll('.deliverable-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var mode = tab.dataset.mode;
        document.getElementById(modeId).value = mode;
        if (labelId) document.getElementById(labelId).textContent = mode === 'update' ? 'Livrables actuels' : 'Nouveaux livrables';
        var textarea = document.getElementById(textareaId);
        if (mode === 'update') {
          try {
            var existing = JSON.parse(document.getElementById(existingId).value || '[]');
            textarea.value = existing.join('\n');
          } catch(e) { textarea.value = ''; }
        } else {
          textarea.value = '';
        }
      });
    });
  }

  function initModalPickers() {
    document.querySelectorAll('#badgePicker .badge-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        document.querySelectorAll('#badgePicker .badge-opt').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        document.getElementById('fBadge').value = opt.dataset.val;
      });
    });
    document.querySelectorAll('#statusColorPicker .status-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        document.querySelectorAll('#statusColorPicker .status-dot').forEach(function (d) { d.classList.remove('active'); });
        dot.classList.add('active');
        document.getElementById('fStatusColor').value = dot.dataset.color;
      });
    });
    initDeliverableTabs('deliverableTabs', 'fDeliverables', 'fDeliverableMode', 'fExistingDeliverables', 'fDeliverableLabel');
    initDeliverableTabs('stockDeliverableTabs', 'stockDeliverables', 'fStockDeliverableMode', 'stockExistingDeliverables', 'stockDeliverableLabel');
  }

  checkSession();
})();
