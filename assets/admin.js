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
    if (name === 'stats') loadStatsForm();
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

    document.getElementById('dashKpis').innerHTML =
      kpiCard('Produits', products.length, 'Total actif') +
      kpiCard('Stock total', totalStock, 'Unités disponibles') +
      kpiCard('Rupture', outOfStock, 'Produits épuisés') +
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

    document.getElementById('fName').value        = p ? p.name : '';
    document.getElementById('fCat').value         = p ? p.category : 'streaming';
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
  };

  window.deleteProduct = function (id) {
    if (!confirm('Supprimer ce produit ?')) return;
    var products = getProducts().filter(function (p) { return p.id !== id; });
    setProducts(products);
    renderProducts();
    toast('Produit supprimé.');
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
