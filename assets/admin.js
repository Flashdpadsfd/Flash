/* Nexus Admin Panel */
(function () {
  'use strict';

  var DEFAULT_PASS = 'nexus2026';
  var DEFAULT_PRODUCTS = [
    { id: 1, name: 'Netflix Premium', category: 'streaming', price: 4.99, origPrice: null, icon: '🎬', desc: '1 Month · 4K UHD · Shared', badge: '', stock: 50, gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
    { id: 2, name: 'Spotify Premium', category: 'streaming', price: 8.99, origPrice: null, icon: '🎵', desc: '3 Months · Family Plan', badge: 'HOT', stock: 32, gradient: 'linear-gradient(135deg,#1e3a5f,#0a1628)' },
    { id: 3, name: 'Xbox Game Pass', category: 'gaming', price: 6.99, origPrice: null, icon: '🎮', desc: '1 Month · Ultimate', badge: 'NEW', stock: 18, gradient: 'linear-gradient(135deg,#2d1b69,#11053b)' },
    { id: 4, name: 'NordVPN', category: 'vpn', price: 12.99, origPrice: 24.99, icon: '🔒', desc: '6 Months · Premium', badge: '', stock: 7, gradient: 'linear-gradient(135deg,#1a3a1a,#0d1f0d)' },
    { id: 5, name: 'Disney+', category: 'streaming', price: 3.99, origPrice: null, icon: '📺', desc: '1 Month · 4K · Shared', badge: 'SALE', stock: 45, gradient: 'linear-gradient(135deg,#3a1a1a,#1f0d0d)' },
    { id: 6, name: 'Adobe Creative Cloud', category: 'software', price: 19.99, origPrice: null, icon: '🎨', desc: '1 Month · All Apps', badge: '', stock: 0, gradient: 'linear-gradient(135deg,#1a2a3a,#0d1520)' }
  ];
  var DEFAULT_STATS = { rating: '4.96', sold: '4,350', customers: '439' };

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

  /* ── Dashboard ── */
  function renderDashboard() {
    var products = getProducts();
    var stats = getStats();
    var totalStock = products.reduce(function (a, p) { return a + (p.stock || 0); }, 0);
    var outOfStock = products.filter(function (p) { return p.stock === 0; }).length;

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
        '<td>$' + Number(p.price).toFixed(2) + '</td>' +
        '<td>' + stockPill(p.stock) + '</td>' +
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
      return '<tr>' +
        '<td><span class="prod-icon">' + (p.icon || '📦') + '</span><span class="prod-name">' + esc(p.name) + '</span></td>' +
        '<td>' + capitalize(p.category) + '</td>' +
        '<td>$' + Number(p.price).toFixed(2) + '</td>' +
        '<td>' + (p.origPrice ? '<span style="color:rgba(255,255,255,.35);text-decoration:line-through;">$' + Number(p.origPrice).toFixed(2) + '</span>' : '<span style="color:rgba(255,255,255,.2);">—</span>') + '</td>' +
        '<td>' + stockPill(p.stock) + '</td>' +
        '<td>' + badgeHtml(p.badge) + '</td>' +
        '<td><div class="action-group">' +
          '<button class="a-btn a-btn--icon" onclick="openStockModal(' + p.id + ')" title="Stock">📦</button>' +
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
    if (id) {
      var p = getProducts().find(function (x) { return x.id === id; });
      if (!p) return;
      document.getElementById('modalTitle').textContent = 'Modifier le produit';
      document.getElementById('fName').value = p.name;
      document.getElementById('fCat').value = p.category;
      document.getElementById('fPrice').value = p.price;
      document.getElementById('fOrigPrice').value = p.origPrice || '';
      document.getElementById('fIcon').value = p.icon || '';
      document.getElementById('fStock').value = p.stock !== undefined ? p.stock : '';
      document.getElementById('fDesc').value = p.desc || '';
      document.getElementById('fBadge').value = p.badge || '';
      document.getElementById('fGradient').value = p.gradient || 'linear-gradient(135deg,#1a1a2e,#16213e)';
    } else {
      document.getElementById('modalTitle').textContent = 'Nouveau produit';
      document.getElementById('fName').value = '';
      document.getElementById('fCat').value = 'streaming';
      document.getElementById('fPrice').value = '';
      document.getElementById('fOrigPrice').value = '';
      document.getElementById('fIcon').value = '';
      document.getElementById('fStock').value = '';
      document.getElementById('fDesc').value = '';
      document.getElementById('fBadge').value = '';
      document.getElementById('fGradient').value = 'linear-gradient(135deg,#1a1a2e,#16213e)';
    }
    modal.classList.add('open');
    overlay.classList.add('open');
  };

  window.closeModal = function () {
    document.getElementById('modal').classList.remove('open');
    document.getElementById('modalOverlay').classList.remove('open');
  };

  window.saveProduct = function () {
    var name = document.getElementById('fName').value.trim();
    var price = parseFloat(document.getElementById('fPrice').value);
    if (!name || isNaN(price)) { toast('Nom et prix requis.'); return; }

    var products = getProducts();
    var editId = document.getElementById('editId').value;
    var product = {
      name: name,
      category: document.getElementById('fCat').value,
      price: price,
      origPrice: parseFloat(document.getElementById('fOrigPrice').value) || null,
      icon: document.getElementById('fIcon').value.trim() || '📦',
      stock: parseInt(document.getElementById('fStock').value) || 0,
      desc: document.getElementById('fDesc').value.trim(),
      badge: document.getElementById('fBadge').value,
      gradient: document.getElementById('fGradient').value
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

  /* ── Modal stock ── */
  window.openStockModal = function (id) {
    var p = getProducts().find(function (x) { return x.id === id; });
    if (!p) return;
    document.getElementById('stockEditId').value = id;
    document.getElementById('stockProductName').textContent = p.name;
    document.getElementById('stockValue').value = p.stock || 0;
    document.getElementById('stockModal').classList.add('open');
    document.getElementById('stockOverlay').classList.add('open');
  };

  window.closeStockModal = function () {
    document.getElementById('stockModal').classList.remove('open');
    document.getElementById('stockOverlay').classList.remove('open');
  };

  window.adjustStock = function (delta) {
    var input = document.getElementById('stockValue');
    var val = parseInt(input.value) || 0;
    input.value = Math.max(0, val + delta);
  };

  window.saveStock = function () {
    var id = parseInt(document.getElementById('stockEditId').value);
    var val = parseInt(document.getElementById('stockValue').value) || 0;
    var products = getProducts();
    var idx = products.findIndex(function (p) { return p.id === id; });
    if (idx !== -1) { products[idx].stock = val; setProducts(products); }
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
    var np = document.getElementById('newPass').value;
    var cp = document.getElementById('confirmPass').value;
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
    if (stock < 10) return '<span class="stock-pill stock-pill--low">' + stock + '</span>';
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
  }

  checkSession();
})();
