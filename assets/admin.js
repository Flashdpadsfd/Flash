/* Nexus Admin Panel */
(function () {
  'use strict';

  var DEFAULT_PASS = 'nexus2026';
  var DEFAULT_PRODUCTS = [
    { id: 1, name: 'Netflix Premium', category: 'streaming', price: 4.99, origPrice: null, desc: '1 Month · 4K UHD · Shared', badge: '', stock: 50, deliverables: [], gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
    { id: 2, name: 'Spotify Premium', category: 'streaming', price: 8.99, origPrice: null, desc: '3 Months · Family Plan', badge: 'HOT', stock: 32, deliverables: [], gradient: 'linear-gradient(135deg,#1e3a5f,#0a1628)' },
    { id: 3, name: 'Xbox Game Pass', category: 'gaming', price: 6.99, origPrice: null, desc: '1 Month · Ultimate', badge: 'NEW', stock: 18, deliverables: [], gradient: 'linear-gradient(135deg,#2d1b69,#11053b)' },
    { id: 4, name: 'NordVPN', category: 'vpn', price: 12.99, origPrice: 24.99, desc: '6 Months · Premium', badge: '', stock: 7, deliverables: [], gradient: 'linear-gradient(135deg,#1a3a1a,#0d1f0d)' },
    { id: 5, name: 'Disney+', category: 'streaming', price: 3.99, origPrice: null, desc: '1 Month · 4K · Shared', badge: 'SALE', stock: 45, deliverables: [], gradient: 'linear-gradient(135deg,#3a1a1a,#1f0d0d)' },
    { id: 6, name: 'Adobe Creative Cloud', category: 'software', price: 19.99, origPrice: null, desc: '1 Month · All Apps', badge: '', stock: 0, deliverables: [], gradient: 'linear-gradient(135deg,#1a2a3a,#0d1520)' }
  ];
  var DEFAULT_STATS = { rating: '4.96', sold: '4,350', customers: '439' };
  var DEFAULT_REVIEWS = [
    { id: 1,  name: 'Alex L.',    initials: 'AL', color: '#e50914', date: 'May 2025',      product: 'Netflix',      stars: 5, published: true, reply: '',  publishedAt: 'May 2025',      text: 'Got my Netflix credentials within seconds. Works perfectly on all my devices. Crazy value for the price, will definitely order again.' },
    { id: 2,  name: 'Sarah K.',   initials: 'SK', color: '#1db954', date: 'May 2025',      product: 'Spotify',      stars: 5, published: true, reply: '',  publishedAt: 'May 2025',      text: 'Been using Spotify Premium from Nexus for 3 months straight. Not a single issue. Support is also super responsive. 10/10.' },
    { id: 3,  name: 'Lucas R.',   initials: 'LR', color: '#6495ed', date: 'April 2025',    product: 'Gaming',       stars: 5, published: true, reply: '',  publishedAt: 'April 2025',    text: 'Legit service. Fast delivery, great price. I recommended it to my whole friend group and they all ordered too.' },
    { id: 4,  name: 'Marie T.',   initials: 'MT', color: '#ffa01e', date: 'April 2025',    product: 'Disney+',      stars: 5, published: true, reply: '',  publishedAt: 'April 2025',    text: 'Best purchase I\'ve made online in a while. Received access instantly and everything works without any issues. Very satisfied.' },
    { id: 5,  name: 'Jordan B.',  initials: 'JB', color: '#9b59b6', date: 'April 2025',    product: 'Netflix',      stars: 5, published: true, reply: '',  publishedAt: 'April 2025',    text: 'I was skeptical at first but everything went smooth. Got access in under 2 minutes. Will 100% be coming back for more.' },
    { id: 6,  name: 'Emma W.',    initials: 'EW', color: '#1abc9c', date: 'March 2025',    product: 'Prime Video',  stars: 5, published: true, reply: '',  publishedAt: 'March 2025',    text: 'Super fast and incredibly affordable. Way better than paying full price every month. The service speaks for itself.' },
    { id: 7,  name: 'Thomas D.',  initials: 'TD', color: '#e74c3c', date: 'March 2025',    product: 'Gaming',       stars: 5, published: true, reply: '',  publishedAt: 'March 2025',    text: 'Bought a gaming account and it worked immediately. Great deal. Customer support helped me set it up in minutes. Zero issues.' },
    { id: 8,  name: 'Lena M.',    initials: 'LM', color: '#3498db', date: 'February 2025', product: 'VPN',          stars: 5, published: true, reply: '',  publishedAt: 'February 2025', text: 'The VPN works perfectly on all my devices. Was worried it might be sketchy but nope, totally legit. Happy customer here.' },
    { id: 9,  name: 'Ryan S.',    initials: 'RS', color: '#f39c12', date: 'February 2025', product: 'Spotify',      stars: 5, published: true, reply: '',  publishedAt: 'February 2025', text: 'Incredible value for money. I\'ve been a customer for 4 months now. Everything always works. No complaints whatsoever.' },
    { id: 10, name: 'Chris J.',   initials: 'CJ', color: '#e50914', date: 'January 2025',  product: 'Netflix',      stars: 5, published: true, reply: '',  publishedAt: 'January 2025',  text: 'Ordered Netflix Premium, received it instantly. No setup headaches, just works. This is honestly the best way to do it.' },
    { id: 11, name: 'Amira P.',   initials: 'AP', color: '#00b4d8', date: 'January 2025',  product: 'Disney+',      stars: 5, published: true, reply: '',  publishedAt: 'January 2025',  text: 'Honestly impressed. The checkout was seamless and I had my account details in seconds. Great shop, will recommend to friends.' },
    { id: 12, name: 'Marco V.',   initials: 'MV', color: '#64c864', date: 'December 2024', product: 'Software',     stars: 5, published: true, reply: '',  publishedAt: 'December 2024', text: 'Top notch. Bought two different products and both worked perfectly. The prices are unbeatable. Keep it up!' }
  ];
  var DEFAULT_CATEGORIES = [
    { id: 'streaming', name: 'Streaming', color: '#e50914' },
    { id: 'gaming',    name: 'Gaming',    color: '#64c864' },
    { id: 'software',  name: 'Software',  color: '#6495ed' },
    { id: 'vpn',       name: 'VPN',       color: '#ffa01e' }
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
  var _customFields = [];

  /* ── Letter avatar (replaces emoji icons) ── */
  var _thumbColors = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#7c3aed','#db2777'];
  function letterThumb(name, size) {
    size = size || 28;
    var letter = (name || '?').replace(/\s+/g,'').charAt(0).toUpperCase();
    var idx = letter.charCodeAt(0) % _thumbColors.length;
    var bg = _thumbColors[idx];
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;border-radius:6px;background:' + bg + ';color:#fff;font-weight:700;font-size:' + Math.round(size * 0.46) + 'px;flex-shrink:0;font-family:inherit;letter-spacing:0;">' + letter + '</span>';
  }

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
  function getPayments() {
    try { return JSON.parse(localStorage.getItem('nexus_payments')) || {}; } catch(e) { return {}; }
  }
  function setPayments(p) { localStorage.setItem('nexus_payments', JSON.stringify(p)); }

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
    var pLabel = d.name || '—';
    var embed;
    if      (type === 'PRODUCT_ADD')    embed = { title:'📦 Produit ajouté',       color:0x57F287, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Prix',value:sym+Number(d.price||0).toFixed(2),inline:true},{name:'Catégorie',value:d.category||'—',inline:true}] };
    else if (type === 'PRODUCT_UPDATE') embed = { title:'✏️ Produit modifié',      color:0x3b82f6, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Prix',value:sym+Number(d.price||0).toFixed(2),inline:true},{name:'Stock',value:String(stock)+' unités',inline:true}] };
    else if (type === 'PRODUCT_DELETE') embed = { title:'🗑️ Produit supprimé',    color:0xED4245, fields:[{name:'Produit',value:pLabel,inline:true},{name:'ID',value:String(d.id||'—'),inline:true}] };
    else if (type === 'STOCK_UPDATE')   embed = { title:'📊 Stock mis à jour',     color:0x0ea5e9, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Nouveau stock',value:String(stock)+' unités',inline:true},{name:'Mode',value:d.mode==='add'?'Ajout':'Remplacement',inline:true}] };
    else if (type === 'LOW_STOCK')      embed = { title:'⚠️ Stock faible',         color:0xFEE75C, fields:[{name:'Produit',value:pLabel,inline:true},{name:'Stock restant',value:String(stock)+' unités',inline:true}] };
    else if (type === 'ADMIN_LOGIN')    embed = { title:'🔐 Connexion admin',      color:0x57F287, description:'Une session admin a été ouverte.', fields:[{name:'Heure',value:new Date().toLocaleString('fr-FR'),inline:true}] };
    else if (type === 'LOGIN_FAIL')     embed = { title:'🚨 Tentative Brute Force',color:0xED4245, description:'Plusieurs mots de passe incorrects détectés.', fields:[{name:'Tentatives',value:String(d.attempts||'3+')+' erreurs consécutives',inline:true},{name:'Heure',value:new Date().toLocaleString('fr-FR'),inline:true}] };
    else if (type === 'CART_ABANDON')   embed = { title:'🛒 Panier abandonné',     color:0xFEE75C, fields:[{name:'Produit',value:d.product||'—',inline:true},{name:'Email',value:d.email||'Non fourni',inline:true},{name:'Valeur potentielle',value:String(d.amount||'—'),inline:true}] };
    else if (type === 'PAYMENT_FAIL')   embed = { title:'❌ Échec de paiement',    color:0xED4245, fields:[{name:'Produit',value:d.product||'—',inline:true},{name:'Raison',value:d.reason||'Informations invalides',inline:true},{name:'Heure',value:new Date().toLocaleString('fr-FR'),inline:true}] };
    else if (type === 'PROMO_USE')      embed = { title:'🏷️ Code promo utilisé',  color:0x5865F2, fields:[{name:'Code',value:d.code||'—',inline:true},{name:'Réduction',value:String(d.discount||0)+'%',inline:true},{name:'Produit',value:d.product||'—',inline:true}] };
    else if (type === 'NEW_REVIEW')     embed = { title:'⭐ Nouvel avis client',   color:0x57F287, fields:[{name:'Client',value:d.name||'Anonyme',inline:true},{name:'Note',value:'★'.repeat(d.stars||5)+' ('+String(d.stars||5)+'/5)',inline:true},{name:'Produit',value:d.product||'—',inline:true},{name:'Avis',value:d.text||'—',inline:false}] };
    else if (type === 'SUPPORT_TICKET') embed = { title:'🎫 Nouveau ticket support',color:0x9B59B6, fields:[{name:'Client',value:d.name||'Anonyme',inline:true},{name:'Email',value:d.email||'—',inline:true},{name:'Sujet',value:d.subject||'—',inline:false},{name:'Message',value:d.message||'—',inline:false}] };
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
      var loginLog = JSON.parse(localStorage.getItem('nexus_login_log') || '[]');
      loginLog.unshift({ time: new Date().toISOString(), success: true, attempts: 0 });
      if (loginLog.length > 50) loginLog = loginLog.slice(0, 50);
      localStorage.setItem('nexus_login_log', JSON.stringify(loginLog));
      localStorage.setItem('nexus_login_fails', '0');
      init();
    } else {
      loginError.classList.add('show');
      document.getElementById('loginPass').value = '';
      var fails = parseInt(localStorage.getItem('nexus_login_fails') || '0') + 1;
      localStorage.setItem('nexus_login_fails', String(fails));
      var loginLog = JSON.parse(localStorage.getItem('nexus_login_log') || '[]');
      loginLog.unshift({ time: new Date().toISOString(), success: false, attempts: fails });
      if (loginLog.length > 50) loginLog = loginLog.slice(0, 50);
      localStorage.setItem('nexus_login_log', JSON.stringify(loginLog));
      if (fails >= 3) {
        discordLog('LOGIN_FAIL', { attempts: fails });
        localStorage.setItem('nexus_login_fails', '0');
      }
    }
  });

  window.logout = function () {
    sessionStorage.removeItem('nexus_admin_ok');
    app.style.display = 'none';
    loginScreen.style.display = 'flex';
    document.getElementById('loginPass').value = '';
  };

  var PAGE_TITLES = {
    dashboard: 'Vue d\'ensemble', orders: 'Commandes', customers: 'Clients',
    products: 'Produits', categories: 'Catégories', promos: 'Codes promo',
    reviews: 'Feedbacks', payments: 'Payment Methods', content: 'Contenu', stats: 'Statistiques',
    links: 'Liens', webhooks: 'Discord Webhooks', security: 'Sécurité', settings: 'Paramètres',
    email: 'Email Notifications',
    'order-detail': 'Invoice Details'
  };

  /* ── Pages ── */
  window.showPage = function (name) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.sidebar__link').forEach(function (l) { l.classList.remove('active'); });
    var pageEl = document.getElementById('page-' + name);
    var sidebarTarget = name === 'order-detail' ? 'orders' : name;
    var linkEl = document.querySelector('[data-page="' + sidebarTarget + '"]');
    if (pageEl) pageEl.classList.add('active');
    if (linkEl) linkEl.classList.add('active');
    var titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.textContent = PAGE_TITLES[name] || name;
    if (name === 'dashboard') renderDashboard();
    if (name === 'products') renderProducts();
    if (name === 'categories') renderCategories();
    if (name === 'reviews') renderReviews();
    if (name === 'promos') renderPromos();
    if (name === 'orders') renderOrders();
    if (name === 'customers') renderCustomers();
    if (name === 'payments') renderPayments();
    if (name === 'content') loadContentForm();
    if (name === 'stats') loadStatsForm();
    if (name === 'links') loadLinksForm();
    if (name === 'webhooks') loadWebhooksForm();
    if (name === 'security') renderSecurity();
    if (name === 'settings') loadSettingsInfo();
    if (name === 'email') loadEmailPage();
  };

  /* ── Stock helper (supports legacy numeric stock + new deliverables) ── */
  function getProductStock(p) {
    if (p.deliverables && Array.isArray(p.deliverables)) return p.deliverables.length;
    return p.stock || 0;
  }

  /* ── Dashboard ── */
  var _dashPeriod = 'today';
  var _dashEnvTab = 'browser';

  function getPeriodRange(p) {
    var n = new Date();
    var today = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
    var DAY = 86400000;
    switch (p) {
      case 'today':     return [today, today + DAY - 1];
      case 'yesterday': return [today - DAY, today - 1];
      case 'week':      { var dow = new Date(today).getDay(); var m = today - (dow === 0 ? 6 : dow - 1) * DAY; return [m, m + 7 * DAY - 1]; }
      case 'lastweek':  { var dow2 = new Date(today).getDay(); var m2 = today - (dow2 === 0 ? 6 : dow2 - 1) * DAY; return [m2 - 7 * DAY, m2 - 1]; }
      case 'month':     { var y = n.getFullYear(), mo = n.getMonth(); return [new Date(y, mo, 1).getTime(), new Date(y, mo + 1, 0).getTime() + DAY - 1]; }
      case 'lastmonth': { var y2 = n.getFullYear(), mo2 = n.getMonth(); return [new Date(y2, mo2 - 1, 1).getTime(), new Date(y2, mo2, 0).getTime() + DAY - 1]; }
      case 'year':      { var yr = n.getFullYear(); return [new Date(yr, 0, 1).getTime(), new Date(yr, 11, 31).getTime() + DAY - 1]; }
      case 'lastyear':  { var yr2 = n.getFullYear() - 1; return [new Date(yr2, 0, 1).getTime(), new Date(yr2, 11, 31).getTime() + DAY - 1]; }
      default: return [0, Date.now() + DAY];
    }
  }

  function filterByRange(orders, range) {
    return orders.filter(function(o) { var t = new Date(o.date).getTime(); return t >= range[0] && t <= range[1]; });
  }

  function timeAgo(dateStr) {
    var secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) { var m = Math.floor(secs / 60); return m + ' min ago'; }
    if (secs < 86400) { var h = Math.floor(secs / 3600); return h + ' hour' + (h > 1 ? 's' : '') + ' ago'; }
    var d = Math.floor(secs / 86400); return d + ' day' + (d > 1 ? 's' : '') + ' ago';
  }

  function pctChange(curr, prev) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round((curr - prev) / prev * 100);
  }

  window.switchDashTab = function(tab, el) {
    document.querySelectorAll('.db-tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    document.getElementById('dbRevSection').style.display = tab === 'revenue' ? '' : 'none';
    document.getElementById('dbTrafficSection').style.display = tab === 'traffic' ? '' : 'none';
    if (tab === 'traffic') renderTrafficSection();
  };

  window.switchEnvTab = function(type, el) {
    _dashEnvTab = type;
    el.closest('.db-pill-tabs').querySelectorAll('.db-pill').forEach(function(b) { b.classList.remove('active'); });
    el.classList.add('active');
    renderEnvSection();
  };

  function renderDashboard() {
    var orders = getOrders();
    var range = getPeriodRange(_dashPeriod);
    var span = range[1] - range[0];
    var prevRange = [range[0] - span - 1, range[0] - 1];
    var curr = filterByRange(orders, range).filter(function(o) { return o.status !== 'refunded'; });
    var prev = filterByRange(orders, prevRange).filter(function(o) { return o.status !== 'refunded'; });
    var currRev = curr.reduce(function(a, o) { return a + Number(o.price || 0); }, 0);
    var prevRev = prev.reduce(function(a, o) { return a + Number(o.price || 0); }, 0);
    var currEmails = {}, prevEmails = {};
    curr.forEach(function(o) { if (o.email) currEmails[o.email.toLowerCase()] = 1; });
    prev.forEach(function(o) { if (o.email) prevEmails[o.email.toLowerCase()] = 1; });
    var currCust = Object.keys(currEmails).length, prevCust = Object.keys(prevEmails).length;
    var currAov = curr.length ? currRev / curr.length : 0;
    var prevAov = prev.length ? prevRev / prev.length : 0;

    var kpisEl = document.getElementById('dbKpis');
    if (kpisEl) kpisEl.innerHTML =
      dbKpiCard('REVENUE', '€' + currRev.toFixed(2), pctChange(currRev, prevRev),
        '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>') +
      dbKpiCard('ORDERS', curr.length, pctChange(curr.length, prev.length),
        '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>') +
      dbKpiCard('CUSTOMERS', currCust, pctChange(currCust, prevCust),
        '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
      dbKpiCard('AVG. ORDER VALUE', '€' + currAov.toFixed(2), pctChange(currAov, prevAov),
        '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>');

    renderAreaChart('revenueChart', orders, 7, 'currency');
    renderAreaChart('ordersChart', orders, 7, 'count');

    var latestEl = document.getElementById('dbLatestOrders');
    if (latestEl) {
      var recent = orders.filter(function(o) { return o.status !== 'refunded'; })
        .sort(function(a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 15);
      latestEl.innerHTML = recent.length ? recent.map(function(o) {
        var s = CURRENCY_SYMBOLS[o.currency] || '€';
        return '<div class="db-latest-item" onclick="viewOrderDetail(\'' + esc(o.id) + '\')">' +
          '<div class="db-latest-thumb">' + letterThumb(o.productName || '', 32) + '</div>' +
          '<div class="db-latest-info"><div class="db-latest-name">' + esc(o.productName || '—') + '</div>' +
          '<div class="db-latest-method">' + esc(o.paymentMethod || 'Direct') + '</div></div>' +
          '<div class="db-latest-right"><div class="db-latest-price">' + s + Number(o.price).toFixed(2) + '</div>' +
          '<div class="db-latest-time">' + timeAgo(o.date) + '</div></div></div>';
      }).join('') : '<div style="padding:32px 20px;text-align:center;color:rgba(255,255,255,.3);font-size:13px;">No orders yet.</div>';
    }

    var prodMap = {};
    orders.forEach(function(o) {
      if (o.status === 'refunded') return;
      var k = o.productName || '—';
      if (!prodMap[k]) prodMap[k] = { count: 0, rev: 0 };
      prodMap[k].count++; prodMap[k].rev += Number(o.price || 0);
    });
    var bestEl = document.getElementById('dbBestProducts');
    if (bestEl) {
      var pk = Object.keys(prodMap).sort(function(a,b){ return prodMap[b].count - prodMap[a].count; }).slice(0, 5);
      bestEl.innerHTML = pk.length ? pk.map(function(name) {
        var d = prodMap[name];
        return '<div class="db-mini-row"><div class="db-mini-thumb">' + letterThumb(name, 28) + '</div>' +
          '<div class="db-mini-info"><div class="db-mini-name">' + esc(name) + '</div><div class="db-mini-sub">' + d.count + ' sale' + (d.count>1?'s':'') + '</div></div>' +
          '<div class="db-mini-amount">€' + d.rev.toFixed(2) + '</div></div>';
      }).join('') : '<div style="padding:20px;color:rgba(255,255,255,.3);font-size:13px;text-align:center;">No data yet.</div>';
    }

    var spendMap = {};
    orders.forEach(function(o) {
      if (o.status === 'refunded' || !o.email) return;
      var k = o.email.toLowerCase();
      if (!spendMap[k]) spendMap[k] = { count: 0, total: 0 };
      spendMap[k].count++; spendMap[k].total += Number(o.price || 0);
    });
    var spendEl = document.getElementById('dbTopSpenders');
    if (spendEl) {
      var sk = Object.keys(spendMap).sort(function(a,b){ return spendMap[b].total - spendMap[a].total; }).slice(0, 5);
      spendEl.innerHTML = sk.length ? sk.map(function(email, i) {
        var d = spendMap[email];
        return '<div class="db-mini-row"><div class="db-mini-avatar">' + (i+1) + '</div>' +
          '<div class="db-mini-info"><div class="db-mini-name">' + esc(email) + '</div><div class="db-mini-sub">' + d.count + ' order' + (d.count>1?'s':'') + '</div></div>' +
          '<div class="db-mini-amount">€' + d.total.toFixed(2) + '</div></div>';
      }).join('') : '<div style="padding:20px;color:rgba(255,255,255,.3);font-size:13px;text-align:center;">No data yet.</div>';
    }

    var methodMap = {};
    orders.forEach(function(o) {
      if (o.status === 'refunded') return;
      var k = o.paymentMethod || 'Direct';
      if (!methodMap[k]) methodMap[k] = { count: 0, total: 0 };
      methodMap[k].count++; methodMap[k].total += Number(o.price || 0);
    });
    var methodEl = document.getElementById('dbMostMethods');
    if (methodEl) {
      var mk = Object.keys(methodMap).sort(function(a,b){ return methodMap[b].total - methodMap[a].total; }).slice(0, 5);
      methodEl.innerHTML = mk.length ? mk.map(function(m) {
        var d = methodMap[m];
        return '<div class="db-mini-row"><div class="db-mini-avatar" style="background:rgba(124,58,237,.2);color:#a78bfa;">' + m[0].toUpperCase() + '</div>' +
          '<div class="db-mini-info"><div class="db-mini-name">' + esc(m) + '</div><div class="db-mini-sub">' + d.count + ' order' + (d.count>1?'s':'') + '</div></div>' +
          '<div class="db-mini-amount">€' + d.total.toFixed(2) + '</div></div>';
      }).join('') : '<div style="padding:20px;color:rgba(255,255,255,.3);font-size:13px;text-align:center;">No data yet.</div>';
    }
  }

  function dbKpiCard(label, value, change, iconSvg) {
    var cls = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    var arrow = change > 0 ? '↗' : change < 0 ? '↘' : '→';
    return '<div class="db-kpi-card">' +
      '<div class="db-kpi-card__label">' + iconSvg + ' ' + label + '</div>' +
      '<div class="db-kpi-card__value">' + value + '</div>' +
      '<div class="db-kpi-card__change db-kpi-card__change--' + cls + '">' + arrow + ' ' + Math.abs(change) + '% change</div>' +
    '</div>';
  }

  function renderAreaChart(canvasId, orders, days, mode) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.offsetWidth || 600, H = 200;
    canvas.width = W * window.devicePixelRatio; canvas.height = H * window.devicePixelRatio;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, W, H);

    var now = new Date(); now.setHours(23,59,59,999);
    var DAY = 86400000;
    var buckets = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      buckets.push({ date: d, val: 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    orders.forEach(function(o) {
      if (o.status === 'refunded') return;
      var od = new Date(o.date); od.setHours(12,0,0,0);
      for (var j = 0; j < buckets.length; j++) {
        var bd = new Date(buckets[j].date); bd.setHours(0,0,0,0);
        var be = new Date(bd); be.setHours(23,59,59,999);
        if (od >= bd && od <= be) { buckets[j].val += mode === 'currency' ? Number(o.price || 0) : 1; break; }
      }
    });

    var maxVal = Math.max.apply(null, buckets.map(function(b) { return b.val; })) || 1;
    var padL = 52, padR = 12, padT = 8, padB = 26, cW = W - padL - padR, cH = H - padT - padB;

    ctx.font = '10px Inter,sans-serif';
    for (var g = 0; g <= 4; g++) {
      var gy = padT + cH - (g / 4) * cH;
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + cW, gy); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.textAlign = 'right';
      var tick = maxVal * g / 4;
      ctx.fillText(mode === 'currency' ? ('$' + tick.toFixed(2)) : Math.round(tick), padL - 6, gy + 3);
    }

    if (buckets.length < 2) return;

    var pts = buckets.map(function(b, idx) {
      return { x: padL + (idx / (buckets.length - 1)) * cW, y: padT + cH - (b.val / maxVal) * cH };
    });

    var xStep = Math.max(1, Math.ceil(buckets.length / 6));
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.textAlign = 'center';
    buckets.forEach(function(b, idx) {
      if (idx % xStep === 0 || idx === buckets.length - 1) ctx.fillText(b.label, pts[idx].x, padT + cH + 18);
    });

    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (var k = 0; k < pts.length - 1; k++) {
      var x0 = k > 0 ? pts[k-1].x : pts[0].x, y0 = k > 0 ? pts[k-1].y : pts[0].y;
      var x1 = pts[k].x, y1 = pts[k].y, x2 = pts[k+1].x, y2 = pts[k+1].y;
      var x3 = k < pts.length - 2 ? pts[k+2].x : x2, y3 = k < pts.length - 2 ? pts[k+2].y : y2;
      ctx.bezierCurveTo(x1 + (x2-x0)/6, y1 + (y2-y0)/6, x2 - (x3-x1)/6, y2 - (y3-y1)/6, x2, y2);
    }
    var strokeCol = mode === 'currency' ? '#8b6cf0' : '#22d3ee';
    ctx.strokeStyle = strokeCol; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineTo(pts[pts.length-1].x, padT + cH); ctx.lineTo(pts[0].x, padT + cH); ctx.closePath();
    var grad = ctx.createLinearGradient(0, padT, 0, padT + cH);
    grad.addColorStop(0, mode === 'currency' ? 'rgba(139,108,240,.35)' : 'rgba(34,211,238,.25)');
    grad.addColorStop(1, mode === 'currency' ? 'rgba(139,108,240,.02)' : 'rgba(34,211,238,.02)');
    ctx.fillStyle = grad; ctx.fill();
  }

  function renderTrafficSection() {
    var orders = getOrders();
    var naCard = function(label, iconSvg) {
      return '<div class="db-kpi-card"><div class="db-kpi-card__label">' + iconSvg + ' ' + label + '</div>' +
        '<div class="db-kpi-card__value" style="font-size:20px;color:rgba(255,255,255,.3);">N/A</div>' +
        '<div class="db-kpi-card__change db-kpi-card__change--flat">analytics not tracked</div></div>';
    };
    var kpisEl = document.getElementById('dbTrafficKpis');
    if (kpisEl) kpisEl.innerHTML =
      naCard('PAGEVIEWS',         '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>') +
      naCard('VISITORS',          '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
      naCard('VISITS',            '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>') +
      naCard('BOUNCE RATE',       '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>') +
      naCard('AVG. SESSION TIME', '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>') +
      naCard('CONVERSION RATE',   '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>');

    renderEmptyAreaChart('pageviewsChart', '#7c6cf0');
    renderEmptyAreaChart('sessionsChart', '#a855f7');

    var pagesEl = document.getElementById('dbPages');
    if (pagesEl) pagesEl.innerHTML = '<div style="padding:20px 18px;color:rgba(255,255,255,.25);font-size:13px;">Page analytics not tracked yet.</div>';
    var sourcesEl = document.getElementById('dbSources');
    if (sourcesEl) sourcesEl.innerHTML = '<div style="padding:20px 18px;color:rgba(255,255,255,.25);font-size:13px;">Traffic sources not tracked yet.</div>';

    renderEnvSection();
    renderAnalyticsBar('dbLocation', orders, 'country', function(v) { return v || null; });
  }

  function renderEnvSection() {
    var orders = getOrders();
    renderAnalyticsBar('dbEnvironment', orders, _dashEnvTab === 'browser' ? 'browser' : 'os', function(v) { return v && v !== 'Unknown' ? v : null; });
  }

  function renderAnalyticsBar(elId, orders, key, labelFn) {
    var el = document.getElementById(elId);
    if (!el) return;
    var map = {};
    orders.forEach(function(o) {
      var v = o[key];
      var label = labelFn ? labelFn(v) : v;
      if (!label) return;
      map[label] = (map[label] || 0) + 1;
    });
    var keys = Object.keys(map).sort(function(a,b) { return map[b] - map[a]; }).slice(0, 8);
    var total = keys.reduce(function(a, k) { return a + map[k]; }, 0) || 1;
    var maxC = map[keys[0]] || 1;
    if (!keys.length) { el.innerHTML = '<div style="padding:14px 18px;color:rgba(255,255,255,.25);font-size:13px;">No order data yet.</div>'; return; }
    el.innerHTML = keys.map(function(k) {
      var count = map[k], pct = Math.round(count / total * 100), barPct = Math.round(count / maxC * 100);
      return '<div class="db-analytics-row">' +
        '<div class="db-analytics-bar-wrap"><div class="db-analytics-path">' + esc(k) + '</div>' +
        '<div class="db-analytics-bar" style="width:' + barPct + '%"></div></div>' +
        '<span class="db-analytics-num">' + count + '</span>' +
        '<span class="db-analytics-pct">' + pct + '%</span></div>';
    }).join('');
  }

  function renderEmptyAreaChart(canvasId, strokeColor) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.offsetWidth || 400, H = 200;
    canvas.width = W * window.devicePixelRatio; canvas.height = H * window.devicePixelRatio;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, W, H);
    var padL = 40, padR = 12, padT = 8, padB = 26, cW = W - padL - padR, cH = H - padT - padB;
    for (var g = 0; g <= 4; g++) {
      var gy = padT + cH - (g / 4) * cH;
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + cW, gy); ctx.stroke();
    }
  }

  /* ── Products ── */
  window.filterProducts = function(q) { renderProducts(q); };

  function renderProducts(query) {
    var products = getProducts();
    if (query) {
      var q = query.toLowerCase();
      products = products.filter(function(p) {
        return (p.name || '').toLowerCase().indexOf(q) !== -1 ||
               (p.category || '').toLowerCase().indexOf(q) !== -1 ||
               (p.desc || '').toLowerCase().indexOf(q) !== -1;
      });
    }
    var tbody = document.getElementById('productsTbody');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,.3);padding:32px;">' +
        (query ? 'Aucun produit correspondant.' : 'Aucun produit. Cliquez sur « Nouveau produit ».') + '</td></tr>';
      return;
    }
    tbody.innerHTML = products.map(function (p) {
      var sym = CURRENCY_SYMBOLS[p.currency] || '$';
      return '<tr>' +
        '<td style="display:flex;align-items:center;gap:10px;">' + letterThumb(p.name) + '<span class="prod-name">' + esc(p.name) + '</span></td>' +
        '<td>' + capitalize(p.category) + '</td>' +
        '<td>' + sym + Number(p.price).toFixed(2) + '</td>' +
        '<td>' + (p.origPrice ? '<span style="color:rgba(255,255,255,.35);text-decoration:line-through;">' + sym + Number(p.origPrice).toFixed(2) + '</span>' : '<span style="color:rgba(255,255,255,.2);">—</span>') + '</td>' +
        '<td>' + stockPill(getProductStock(p)) + '</td>' +
        '<td>' + badgeHtml(p.badge) + '</td>' +
        '<td><div class="action-group">' +
          '<button class="a-btn a-btn--icon" onclick="openStockModal(' + p.id + ')" title="Stock"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></button>' +
          '<button class="a-btn a-btn--icon" onclick="openModal(' + p.id + ')" title="Edit"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
          '<button class="a-btn a-btn--icon" onclick="deleteProduct(' + p.id + ')" title="Delete" style="color:var(--red);"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>' +
        '</div></td>' +
        '</tr>';
    }).join('');
  }

  /* ── Modal tab switching ── */
  window.switchModalTab = function (tab, el) {
    document.querySelectorAll('.modal-tabs-bar .modal-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.mtab').forEach(function(p) { p.classList.remove('active'); });
    if (el) el.classList.add('active');
    var pane = document.getElementById('mtab-' + tab);
    if (pane) pane.classList.add('active');
  };

  /* ── Auto-slug from name ── */
  window.autoSlug = function () {
    var name = (document.getElementById('fName').value || '').toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    document.getElementById('fSlug').value = name;
  };

  /* ── Custom Fields ── */
  window.addCustomField = function () {
    _customFields.push({ label: '', type: 'text', required: false });
    renderCustomFields();
  };

  window.removeCustomField = function (idx) {
    _customFields.splice(idx, 1);
    renderCustomFields();
  };

  function renderCustomFields() {
    var el = document.getElementById('customFieldsList');
    if (!el) return;
    if (!_customFields.length) {
      el.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">No custom fields added yet.</p>';
      return;
    }
    el.innerHTML = _customFields.map(function(f, i) {
      return '<div class="cf-item">' +
        '<input type="text" placeholder="Field label (e.g. Discord username)" value="' + esc(f.label) + '" ' +
          'oninput="_customFields[' + i + '].label=this.value" style="font-size:13px;" />' +
        '<select onchange="_customFields[' + i + '].type=this.value" style="font-size:13px;">' +
          '<option value="text"' + (f.type==='text'?' selected':'') + '>Text</option>' +
          '<option value="email"' + (f.type==='email'?' selected':'') + '>Email</option>' +
          '<option value="number"' + (f.type==='number'?' selected':'') + '>Number</option>' +
        '</select>' +
        '<label class="cf-req-toggle"><input type="checkbox"' + (f.required?' checked':'') + ' onchange="_customFields[' + i + '].required=this.checked" /> Required</label>' +
        '<button type="button" class="a-btn a-btn--icon" onclick="removeCustomField(' + i + ')" style="color:var(--red);font-size:14px;" title="Remove">×</button>' +
      '</div>';
    }).join('');
  }

  /* ── Modal produit ── */
  window.openModal = function (id) {
    var modal = document.getElementById('modal');
    var overlay = document.getElementById('modalOverlay');
    document.getElementById('editId').value = id || '';

    var p = id ? getProducts().find(function (x) { return x.id === id; }) : null;
    document.getElementById('modalTitle').textContent = p ? 'Edit Product' : 'New Product';

    /* Reset to General tab */
    switchModalTab('general', document.querySelector('.modal-tabs-bar .modal-tab[data-tab="general"]'));

    populateCatSelect(p ? p.category : null);
    document.getElementById('fName').value        = p ? p.name : '';
    document.getElementById('fPrice').value       = p ? p.price : '';
    document.getElementById('fOrigPrice').value   = p && p.origPrice ? p.origPrice : '';
    document.getElementById('fDesc').value        = p ? (p.desc || '') : '';
    document.getElementById('fGradient').value    = p ? (p.gradient || 'linear-gradient(135deg,#1a1a2e,#16213e)') : 'linear-gradient(135deg,#1a1a2e,#16213e)';
    document.getElementById('fCurrency').value    = p ? (p.currency || 'EUR') : 'EUR';
    document.getElementById('fStatusLabel').value = p ? (p.statusLabel || '') : '';

    /* New fields */
    var vis = p ? (p.visibility || 'public') : 'public';
    document.getElementById('fVisibility').value = vis;
    document.querySelectorAll('#visibilityPicker .vis-opt').forEach(function(opt) {
      opt.classList.toggle('active', opt.dataset.val === vis);
    });

    document.getElementById('fSlug').value   = p ? (p.slug || '') : '';
    document.getElementById('fMinQty').value = p ? (p.minQty || '') : '';
    document.getElementById('fMaxQty').value = p ? (p.maxQty || '') : '';

    var delType = p ? (p.deliveryType || 'keys') : 'keys';
    document.getElementById('fDeliveryType').value = delType;
    document.querySelectorAll('#deliveryTypePicker .deltype-opt').forEach(function(opt) {
      opt.classList.toggle('active', opt.dataset.val === delType);
    });

    document.getElementById('fOutOfStock').value   = p ? (p.outOfStock || 'show') : 'show';
    document.getElementById('fDeliveryNote').value = p ? (p.deliveryNote || '') : '';

    /* Custom fields */
    _customFields = (p && Array.isArray(p.customFields)) ? JSON.parse(JSON.stringify(p.customFields)) : [];
    renderCustomFields();

    /* Live stats */
    document.getElementById('fShowViews').checked    = p ? (p.showViews !== false) : true;
    document.getElementById('fShowSales').checked    = p ? (p.showSales !== false) : true;
    document.getElementById('fShowNotifs').checked   = p ? (p.showNotifs !== false) : true;
    document.getElementById('fSalesTimespan').value  = p ? (p.salesTimespan || 'all') : 'all';

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
    document.getElementById('fDeliverableLabel').textContent = 'New Deliverables';
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
      deliverables: deliverables,
      stock: deliverables.length,
      desc: document.getElementById('fDesc').value.trim(),
      badge: document.getElementById('fBadge').value,
      gradient: document.getElementById('fGradient').value,
      image: document.getElementById('fImage').value || null,
      currency: document.getElementById('fCurrency').value || 'EUR',
      statusColor: document.getElementById('fStatusColor').value || 'green',
      statusLabel: document.getElementById('fStatusLabel').value.trim(),
      /* new fields */
      visibility:   document.getElementById('fVisibility').value || 'public',
      slug:         document.getElementById('fSlug').value.trim(),
      minQty:       parseInt(document.getElementById('fMinQty').value) || 1,
      maxQty:       parseInt(document.getElementById('fMaxQty').value) || 0,
      deliveryType: document.getElementById('fDeliveryType').value || 'keys',
      outOfStock:   document.getElementById('fOutOfStock').value || 'show',
      deliveryNote: document.getElementById('fDeliveryNote').value.trim(),
      customFields: JSON.parse(JSON.stringify(_customFields)),
      /* live stats */
      showViews:     document.getElementById('fShowViews').checked,
      showSales:     document.getElementById('fShowSales').checked,
      showNotifs:    document.getElementById('fShowNotifs').checked,
      salesTimespan: document.getElementById('fSalesTimespan').value
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
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,.3);padding:24px;">No categories yet.</td></tr>';
    } else {
      tbody.innerHTML = cats.map(function(c) {
        return '<tr>' +
          '<td>' + letterThumb(c.name, 26) + '</td>' +
          '<td>' + esc(c.name) + '</td>' +
          '<td><span style="font-size:12px;color:rgba(255,255,255,.4);font-family:monospace;">' + esc(c.id) + '</span></td>' +
          '<td><span style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + esc(c.color) + ';flex-shrink:0;"></span>' + esc(c.color) + '</span></td>' +
          '<td><div class="action-group">' +
            '<button class="a-btn a-btn--icon" onclick="editCategory(\'' + esc(c.id) + '\')" title="Edit"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
            '<button class="a-btn a-btn--icon" onclick="deleteCategory(\'' + esc(c.id) + '\')" style="color:var(--red);" title="Delete"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>' +
          '</div></td>' +
          '</tr>';
      }).join('');
    }
    populateCatSelect();
    populateCatParentSelect();
  }

  function populateCatParentSelect() {
    var sel = document.getElementById('catParent');
    if (!sel) return;
    var editId = document.getElementById('catEditId').value;
    var cats = getCategories();
    sel.innerHTML = '<option value="">Select...</option>' +
      cats.filter(function(c) { return c.id !== editId; })
          .map(function(c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('');
  }

  function setCatImagePreview(src) {
    var preview   = document.getElementById('catImagePreview');
    var empty     = document.getElementById('catImageEmpty');
    var removeBtn = document.getElementById('catImageRemoveBtn');
    document.getElementById('catImage').value = src || '';
    if (src) {
      preview.src = src; preview.style.display = 'block';
      empty.style.display = 'none'; removeBtn.style.display = 'flex';
    } else {
      preview.src = ''; preview.style.display = 'none';
      empty.style.display = 'flex'; removeBtn.style.display = 'none';
    }
  }

  window.handleCatImageUpload = function(input) {
    if (!input.files || !input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var MAX = 640; var scale = Math.min(1, MAX / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setCatImagePreview(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  };

  window.removeCatImage = function(e) {
    e.stopPropagation();
    document.getElementById('catImageInput').value = '';
    setCatImagePreview('');
  };

  window.autoCatSlug = function() {
    var name = (document.getElementById('catName').value || '').toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    document.getElementById('catSlug').value = name;
  };

  window.openCatModal = function(id) {
    var c = id ? getCategories().find(function(x) { return x.id === id; }) : null;
    document.getElementById('catEditId').value    = id || '';
    document.getElementById('catModalTitle').textContent = c ? 'Edit Category' : 'Create Category';
    document.getElementById('catSubmitLabel').textContent = c ? 'Save Changes' : 'Create';
    document.getElementById('catName').value      = c ? c.name : '';
    document.getElementById('catSlug').value      = c ? (c.slug || c.id || '') : '';
    document.getElementById('catColor').value     = c ? (c.color || '#6495ed') : '#6495ed';
    document.getElementById('catDesc').value      = c ? (c.desc || '') : '';
    document.getElementById('catMetaTitle').value = c ? (c.metaTitle || '') : '';
    document.getElementById('catMetaDesc').value  = c ? (c.metaDesc || '') : '';
    setCatImagePreview(c ? (c.image || '') : '');
    populateCatParentSelect();
    document.getElementById('catParent').value = c ? (c.parent || '') : '';
    document.getElementById('catModal').classList.add('open');
    document.getElementById('catModalOverlay').classList.add('open');
    setTimeout(function() { document.getElementById('catName').focus(); }, 80);
  };

  window.closeCatModal = function() {
    document.getElementById('catModal').classList.remove('open');
    document.getElementById('catModalOverlay').classList.remove('open');
  };

  window.editCategory = function(id) { openCatModal(id); };

  window.cancelEditCategory = function() { closeCatModal(); };

  window.saveCategory = function() {
    var name   = (document.getElementById('catName').value || '').trim();
    var editId = document.getElementById('catEditId').value;
    if (!name) { toast('Name required.'); return; }
    var cats = getCategories();
    var slugVal = (document.getElementById('catSlug').value || '').trim() || slugify(name);
    var updated = {
      name:      name,
      color:     document.getElementById('catColor').value,
      slug:      slugVal,
      parent:    document.getElementById('catParent').value,
      desc:      document.getElementById('catDesc').value.trim(),
      image:     document.getElementById('catImage').value || null,
      metaTitle: document.getElementById('catMetaTitle').value.trim(),
      metaDesc:  document.getElementById('catMetaDesc').value.trim()
    };
    if (editId) {
      var idx = cats.findIndex(function(c) { return c.id === editId; });
      if (idx !== -1) { cats[idx] = Object.assign({}, cats[idx], updated); }
      setCategories(cats);
      renderCategories();
      closeCatModal();
      toast('Category updated ✓');
    } else {
      if (!slugVal) { toast('Invalid name.'); return; }
      if (cats.find(function(c) { return c.id === slugVal; })) { toast('Category already exists.'); return; }
      cats.push(Object.assign({ id: slugVal }, updated));
      setCategories(cats);
      renderCategories();
      closeCatModal();
      toast('Category created ✓');
    }
  };

  window.deleteCategory = function(id) {
    if (!confirm('Delete this category? Products will keep their slug.')) return;
    setCategories(getCategories().filter(function(c) { return c.id !== id; }));
    renderCategories();
    toast('Category deleted.');
  };

  /* ── Reviews / Feedbacks ── */
  var _rvStars = 5; // current star selection in modal

  function starsHtml(n, size) {
    size = size || 12;
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= n) {
        html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f5a623" stroke="#f5a623" stroke-width="1"/></svg>';
      } else {
        html += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/></svg>';
      }
    }
    return html;
  }

  function renderFeedbackStats() {
    var reviews = getReviews();
    var total     = reviews.length;
    var published = reviews.filter(function(r) { return r.published !== false; }).length;
    var pending   = reviews.filter(function(r) { return !r.reply; }).length;
    var sumStars  = reviews.reduce(function(s, r) { return s + (r.stars || 5); }, 0);
    var avg       = total > 0 ? sumStars / total : 0;
    var avgStr    = total > 0 ? avg.toFixed(2) : '—';

    var kTotal    = document.getElementById('fbKpiTotal');
    var kRating   = document.getElementById('fbKpiRating');
    var kPublished= document.getElementById('fbKpiPublished');
    var kPending  = document.getElementById('fbKpiPending');
    if (kTotal)     kTotal.textContent     = total;
    if (kRating)    kRating.textContent    = avgStr;
    if (kPublished) kPublished.textContent = published;
    if (kPending)   kPending.textContent   = pending;

    var bigRating = document.getElementById('fbBigRating');
    if (bigRating) bigRating.textContent = avgStr;
    var bigStars = document.getElementById('fbBigStars');
    if (bigStars) bigStars.innerHTML = starsHtml(Math.round(avg), 16);
    var bigCount = document.getElementById('fbBigCount');
    if (bigCount) bigCount.textContent = total + ' review' + (total !== 1 ? 's' : '');

    var barsContainer = document.getElementById('fbBarsContainer');
    if (barsContainer) {
      var starCounts = [0, 0, 0, 0, 0]; // index 0 = 1★, index 4 = 5★
      reviews.forEach(function(r) {
        var s = r.stars || 5;
        if (s >= 1 && s <= 5) starCounts[s - 1]++;
      });
      var barsHtml = '';
      for (var i = 5; i >= 1; i--) {
        var count = starCounts[i - 1];
        var pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        barsHtml +=
          '<div class="fb-bar-row">' +
            '<div class="fb-bar-row__label">' + i + '</div>' +
            '<div class="fb-bar-row__track"><div class="fb-bar-row__fill" style="width:' + pct + '%;"></div></div>' +
            '<div class="fb-bar-row__count">' + count + '</div>' +
          '</div>';
      }
      barsContainer.innerHTML = barsHtml;
    }
  }

  function renderStarPicker(val) {
    _rvStars = val || 5;
    var container = document.getElementById('rvStarPicker');
    if (!container) return;
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" class="fb-star-picker__star' + (i <= _rvStars ? ' active' : '') + '" onclick="setReviewStar(' + i + ')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
      '</button>';
    }
    container.innerHTML = html;
  }

  window.setReviewStar = function(n) { _rvStars = n; renderStarPicker(n); };

  function renderReviews() {
    renderFeedbackStats();
    var reviews = getReviews();
    var tbody = document.getElementById('reviewsTbody');
    if (!tbody) return;
    if (!reviews.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,.3);padding:28px;">No feedbacks yet.</td></tr>';
      return;
    }
    tbody.innerHTML = reviews.map(function(r) {
      var stars    = r.stars || 5;
      var pub      = r.published !== false;
      var shortTxt = (r.text || '').length > 70 ? esc(r.text).slice(0, 70) + '…' : esc(r.text || '');
      return '<tr>' +
        '<td>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="width:32px;height:32px;border-radius:50%;background:' + esc(r.color || '#7c3aed') + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;">' + esc(r.initials || '?') + '</div>' +
            '<span style="font-size:13px;font-weight:500;">' + esc(r.name || '') + '</span>' +
          '</div>' +
        '</td>' +
        '<td><div style="display:flex;gap:2px;align-items:center;">' + starsHtml(stars, 11) + '</div></td>' +
        '<td style="max-width:240px;"><span style="font-size:13px;color:rgba(255,255,255,.65);">' + shortTxt + '</span></td>' +
        '<td style="font-size:13px;color:rgba(255,255,255,.5);">' + esc(r.product || '—') + '</td>' +
        '<td style="font-size:13px;color:rgba(255,255,255,.4);white-space:nowrap;">' + esc(r.date || '') + '</td>' +
        '<td>' +
          '<span class="fb-badge ' + (pub ? 'fb-badge--published' : 'fb-badge--hidden') + '">' +
            '<span style="width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;"></span>' +
            (pub ? 'Published' : 'Hidden') +
          '</span>' +
        '</td>' +
        '<td>' +
          '<div class="action-group">' +
            '<button class="a-btn a-btn--icon" onclick="openReviewModal(' + r.id + ')" title="Edit"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
            '<button class="a-btn a-btn--icon" onclick="deleteReview(' + r.id + ')" style="color:var(--red);" title="Delete"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  window.openReviewModal = function(id) {
    var isNew = !id;
    document.getElementById('reviewModalTitle').textContent = isNew ? 'Add Feedback' : 'Edit Feedback';
    document.getElementById('rvEditId').value = id || '';
    if (isNew) {
      document.getElementById('rvName').value        = '';
      document.getElementById('rvInitials').value    = '';
      document.getElementById('rvColor').value       = '#7c3aed';
      document.getElementById('rvDate').value        = '';
      document.getElementById('rvProduct').value     = '';
      document.getElementById('rvText').value        = '';
      document.getElementById('rvReply').value       = '';
      document.getElementById('rvPublished').checked = true;
      renderStarPicker(5);
    } else {
      var r = getReviews().find(function(x) { return x.id === id; });
      if (!r) return;
      document.getElementById('rvName').value        = r.name || '';
      document.getElementById('rvInitials').value    = r.initials || '';
      document.getElementById('rvColor').value       = r.color || '#7c3aed';
      document.getElementById('rvDate').value        = r.date || '';
      document.getElementById('rvProduct').value     = r.product || '';
      document.getElementById('rvText').value        = r.text || '';
      document.getElementById('rvReply').value       = r.reply || '';
      document.getElementById('rvPublished').checked = r.published !== false;
      renderStarPicker(r.stars || 5);
    }
    document.getElementById('reviewModal').classList.add('open');
    document.getElementById('reviewModalOverlay').classList.add('open');
  };

  window.closeReviewModal = function() {
    document.getElementById('reviewModal').classList.remove('open');
    document.getElementById('reviewModalOverlay').classList.remove('open');
  };

  window.autoInitials = function() {
    var name   = (document.getElementById('rvName') || {}).value || '';
    var parts  = name.trim().split(/\s+/).filter(Boolean);
    var initials = parts.map(function(p) { return p[0].toUpperCase(); }).join('').slice(0, 2);
    var el = document.getElementById('rvInitials');
    if (el) el.value = initials;
  };

  window.saveReview = function() {
    var name   = (document.getElementById('rvName').value || '').trim();
    var text   = (document.getElementById('rvText').value || '').trim();
    if (!name) { toast('Name required.'); return; }
    if (!text) { toast('Feedback text required.'); return; }
    var editId  = parseInt(document.getElementById('rvEditId').value, 10);
    var reviews = getReviews();
    var now     = new Date();
    var months  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var dateStr = months[now.getMonth()] + ' ' + now.getFullYear();
    var updated = {
      name:        name,
      initials:    (document.getElementById('rvInitials').value || '').trim() || name.split(/\s+/).map(function(p){ return p[0]; }).join('').slice(0, 2).toUpperCase(),
      color:       document.getElementById('rvColor').value,
      date:        (document.getElementById('rvDate').value || '').trim() || dateStr,
      product:     (document.getElementById('rvProduct').value || '').trim(),
      text:        text,
      reply:       (document.getElementById('rvReply').value || '').trim(),
      stars:       _rvStars,
      published:   document.getElementById('rvPublished').checked,
      publishedAt: dateStr
    };
    if (editId) {
      var idx = reviews.findIndex(function(r) { return r.id === editId; });
      if (idx !== -1) reviews[idx] = Object.assign({}, reviews[idx], updated);
      setReviews(reviews);
      renderReviews();
      toast('Feedback updated.');
    } else {
      var newId = reviews.reduce(function(max, r) { return Math.max(max, r.id); }, 0) + 1;
      reviews.push(Object.assign({ id: newId }, updated));
      setReviews(reviews);
      renderReviews();
      toast('Feedback added.');
    }
    closeReviewModal();
  };

  window.deleteReview = function(id) {
    if (!confirm('Delete this feedback?')) return;
    setReviews(getReviews().filter(function(r) { return r.id !== id; }));
    renderReviews();
    toast('Feedback deleted.');
  };

  /* ── Payment Methods ── */
  var PM_METHODS = [
    {
      key: 'paypal', name: 'PayPal',
      desc: 'Accept PayPal, Pay Later & Debit/Credit card payments.',
      bg: '#003087',
      icon: '<svg viewBox="0 0 24 24" fill="#fff" width="22" height="22"><path d="M7.076 21.337H4.958a.641.641 0 01-.633-.74L6.29 3.617a.75.75 0 01.74-.633h6.264c2.089 0 3.572.493 4.383 1.466.78.932.997 2.304.644 4.075-.855 4.326-3.628 5.98-7.22 5.98H9.3a.75.75 0 00-.74.633l-.763 4.843a.641.641 0 01-.633.54H5.877zM19.79 9.24c-.847 4.297-3.95 6.655-8.34 6.655H9.4l-.846 5.374a.535.535 0 00.528.618h2.484c.347 0 .643-.252.698-.596l.715-4.532a.75.75 0 01.74-.633h1.056c3.592 0 6.365-1.654 7.22-5.98a5.38 5.38 0 00-.204-2.906z"/></svg>',
      fields: [
        { key: 'clientId',  label: 'Client ID',     type: 'text',     ph: 'AaBbCcDdEeFf...',  hint: 'From your PayPal Developer Dashboard.' },
        { key: 'secret',    label: 'Client Secret', type: 'password', ph: 'EGTt...',           hint: '' },
        { key: 'sandbox',   label: 'Sandbox Mode',  type: 'toggle',   hint: 'Enable for testing without real transactions.' }
      ]
    },
    {
      key: 'stripe', name: 'Stripe',
      desc: 'Accept all major cards, Apple Pay & Google Pay.',
      bg: '#635bff',
      icon: '<svg viewBox="0 0 24 24" fill="#fff" width="21" height="21"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>',
      fields: [
        { key: 'publishableKey', label: 'Publishable Key', type: 'text',     ph: 'pk_live_...',  hint: '' },
        { key: 'secretKey',      label: 'Secret Key',      type: 'password', ph: 'sk_live_...',  hint: 'Never share your secret key publicly.' },
        { key: 'testMode',       label: 'Test Mode',       type: 'toggle',   hint: 'Use Stripe test keys for development.' }
      ]
    },
    {
      key: 'cashapp', name: 'Cash App',
      desc: 'Accept payments via Cash App using your $Cashtag.',
      bg: '#00d64f',
      icon: '<svg viewBox="0 0 24 24" fill="#fff" width="20" height="20"><path d="M12.293 2.707a1 1 0 011.414 0l8 8a1 1 0 010 1.414 1 1 0 00.293.707V13a2 2 0 01-.586 1.414l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 014 13v-.172a1 1 0 00.293-.707 1 1 0 010-1.414l8-8zM13 8a1 1 0 10-2 0v1H9a1 1 0 000 2h1v2H9a1 1 0 000 2h1v1a1 1 0 102 0v-1h1a1 1 0 000-2h-1v-2h1a1 1 0 000-2h-1V8z"/></svg>',
      fields: [
        { key: 'cashtag', label: '$Cashtag', type: 'text', ph: '$YourName', hint: 'Your Cash App $Cashtag. Customers will send payments directly to it.' }
      ]
    },
    {
      key: 'btc', name: 'Bitcoin (BTC)',
      desc: 'Accept Bitcoin payments directly to your wallet.',
      bg: '#f7931a',
      icon: '<svg viewBox="0 0 24 24" fill="#fff" width="20" height="20"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.974.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.928l.001-.002z"/></svg>',
      fields: [
        { key: 'address', label: 'Bitcoin Wallet Address', type: 'text', ph: 'bc1q... or 1... or 3...', hint: 'Customers will send BTC directly to this address.' }
      ]
    },
    {
      key: 'eth', name: 'Ethereum (ETH)',
      desc: 'Accept ETH and ERC-20 token payments to your wallet.',
      bg: '#627eea',
      icon: '<svg viewBox="0 0 24 24" fill="#fff" width="18" height="18"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35h.001zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>',
      fields: [
        { key: 'address', label: 'Ethereum Address', type: 'text', ph: '0x...', hint: 'Your public Ethereum wallet address.' }
      ]
    },
    {
      key: 'usdt', name: 'USDT',
      desc: 'Accept Tether stablecoin on TRC-20 or ERC-20 network.',
      bg: '#26a17b',
      icon: '<svg viewBox="0 0 24 24" fill="#fff" width="20" height="20"><path d="M12 0C5.374 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.75 17.1v1.388h-1.5V17.1c-1.618-.144-2.897-.77-3.75-1.507l.9-1.556c.803.68 1.912 1.186 3.103 1.186 1.255 0 2.044-.522 2.044-1.343 0-.782-.596-1.185-2.115-1.556-2.03-.497-3.703-1.185-3.703-3.028 0-1.45 1.003-2.556 2.771-2.876V6.013h1.5V5.47h.25v.543c1.34.168 2.438.684 3.188 1.33l-.87 1.527c-.748-.594-1.708-.978-2.7-.978-1.133 0-1.894.497-1.894 1.25 0 .738.625 1.07 2.187 1.458 2.052.521 3.646 1.28 3.646 3.138 0 1.52-1.055 2.667-3.057 2.962z"/></svg>',
      fields: [
        { key: 'address', label: 'Wallet Address', type: 'text', ph: 'T... or 0x...', hint: '' },
        { key: 'network', label: 'Network',         type: 'select', options: ['TRC-20','ERC-20'], hint: 'Choose the network that matches your wallet address.' }
      ]
    },
    {
      key: 'ltc', name: 'Litecoin (LTC)',
      desc: 'Fast, low-fee crypto payments via Litecoin.',
      bg: '#a6a9aa',
      icon: '<svg viewBox="0 0 24 24" fill="#fff" width="20" height="20"><path d="M12 0C5.374 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.793 15.875l-.504 1.844H15.4l-.467 1.75H8.118l1.313-4.913-1.511.41.418-1.594 1.519-.41L11.4 7.53h2.154l-1.294 4.862 1.51-.413-.41 1.594-2.152.302z"/></svg>',
      fields: [
        { key: 'address', label: 'Litecoin Wallet Address', type: 'text', ph: 'ltc1q... or L...', hint: 'Your Litecoin wallet address.' }
      ]
    }
  ];

  function renderPayments() {
    var pmGrid = document.getElementById('pmGrid');
    if (!pmGrid) return;
    var saved = getPayments();

    pmGrid.innerHTML = PM_METHODS.map(function(m) {
      var cfg     = saved[m.key] || {};
      var enabled = !!cfg.enabled;

      var fieldsHtml = m.fields.map(function(f) {
        if (f.type === 'toggle') {
          var chk = !!cfg[f.key];
          return '<div class="pm-field-row">' +
            '<div>' +
              '<div class="pm-field-label">' + esc(f.label) + '</div>' +
              (f.hint ? '<div class="pm-field-hint">' + esc(f.hint) + '</div>' : '') +
            '</div>' +
            '<label class="pm-toggle">' +
              '<input type="checkbox" id="pm_' + m.key + '_' + f.key + '"' + (chk ? ' checked' : '') + ' />' +
              '<span class="pm-toggle__track"></span>' +
              '<span class="pm-toggle__thumb"></span>' +
            '</label>' +
          '</div>';
        } else if (f.type === 'select') {
          var opts = (f.options || []).map(function(o) {
            return '<option value="' + esc(o) + '"' + (cfg[f.key] === o ? ' selected' : '') + '>' + esc(o) + '</option>';
          }).join('');
          return '<div class="field" style="margin-bottom:12px;">' +
            '<label class="pm-field-label">' + esc(f.label) + '</label>' +
            (f.hint ? '<p class="pm-field-hint" style="margin:3px 0 8px;">' + esc(f.hint) + '</p>' : '') +
            '<select id="pm_' + m.key + '_' + f.key + '">' + opts + '</select>' +
          '</div>';
        } else {
          var val = esc(cfg[f.key] || '');
          return '<div class="field" style="margin-bottom:12px;">' +
            '<label class="pm-field-label">' + esc(f.label) + '</label>' +
            (f.hint ? '<p class="pm-field-hint" style="margin:3px 0 8px;">' + esc(f.hint) + '</p>' : '') +
            '<input type="' + f.type + '" id="pm_' + m.key + '_' + f.key + '" value="' + val + '" placeholder="' + esc(f.ph || '') + '" />' +
          '</div>';
        }
      }).join('');

      return '<div class="pm-card' + (enabled ? ' pm-card--enabled' : '') + '" id="pm-card-' + m.key + '">' +
        '<div class="pm-card__head">' +
          '<div class="pm-card__logo" style="background:' + m.bg + ';">' + m.icon + '</div>' +
          '<div class="pm-card__info">' +
            '<div class="pm-card__name">' + esc(m.name) + '</div>' +
            '<div class="pm-card__desc">' + esc(m.desc) + '</div>' +
          '</div>' +
          '<div class="pm-card__right">' +
            '<span class="pm-badge ' + (enabled ? 'pm-badge--active' : 'pm-badge--inactive') + '" id="pm-badge-' + m.key + '">' +
              (enabled ? 'Active' : 'Inactive') +
            '</span>' +
            '<label class="pm-toggle">' +
              '<input type="checkbox" id="pm-enabled-' + m.key + '"' + (enabled ? ' checked' : '') + ' onchange="togglePayment(\'' + m.key + '\')" />' +
              '<span class="pm-toggle__track"></span>' +
              '<span class="pm-toggle__thumb"></span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="pm-card__body" id="pm-body-' + m.key + '">' +
          fieldsHtml +
          '<div class="pm-card__footer">' +
            '<button class="a-btn a-btn--primary" onclick="savePayment(\'' + m.key + '\')" style="font-size:13px;">' +
              '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>' +
              ' Save Changes' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window.togglePayment = function(key) {
    var enabled = document.getElementById('pm-enabled-' + key).checked;
    var saved = getPayments();
    if (!saved[key]) saved[key] = {};
    saved[key].enabled = enabled;
    setPayments(saved);
    var card  = document.getElementById('pm-card-' + key);
    var badge = document.getElementById('pm-badge-' + key);
    if (card)  { card.classList.toggle('pm-card--enabled', enabled); }
    if (badge) { badge.className = 'pm-badge ' + (enabled ? 'pm-badge--active' : 'pm-badge--inactive'); badge.textContent = enabled ? 'Active' : 'Inactive'; }
  };

  window.savePayment = function(key) {
    var method = PM_METHODS.find(function(m) { return m.key === key; });
    if (!method) return;
    var saved = getPayments();
    if (!saved[key]) saved[key] = {};
    method.fields.forEach(function(f) {
      var el = document.getElementById('pm_' + key + '_' + f.key);
      if (!el) return;
      saved[key][f.key] = (f.type === 'toggle') ? el.checked : el.value.trim();
    });
    setPayments(saved);
    toast(method.name + ' settings saved.');
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
  var WHK_EVENTS = ['ORDER_CREATE','REFUND','CART_ABANDON','PAYMENT_FAIL','LOGIN_FAIL','PROMO_USE','NEW_REVIEW','SUPPORT_TICKET','PRODUCT_ADD','PRODUCT_UPDATE','PRODUCT_DELETE','STOCK_UPDATE','LOW_STOCK','ADMIN_LOGIN','BUG','CHANGELOG'];

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
        '<td style="display:flex;align-items:center;gap:10px;">' + letterThumb(o.productName || '') + '<span class="prod-name">' + esc(o.productName || '') + '</span></td>' +
        '<td style="font-size:13px;color:rgba(255,255,255,.5);">' + esc(o.email || '') + '</td>' +
        '<td style="font-weight:600;">' + sym + Number(o.price).toFixed(2) + '</td>' +
        '<td style="font-size:13px;color:rgba(255,255,255,.5);white-space:nowrap;">' + d + '</td>' +
        '<td>' + statusPill + '</td>' +
        '<td><div class="action-group">' +
          '<button class="a-btn a-btn--icon" onclick="viewOrderDetail(\'' + esc(o.id) + '\')" title="Voir la facture">🧾</button>' +
          (o.status !== 'refunded' ? '<button class="a-btn a-btn--icon" onclick="refundOrder(\'' + esc(o.id) + '\')" title="Rembourser" style="color:#ffa01e;">↩</button>' : '') +
          '<button class="a-btn a-btn--icon" onclick="deleteOrder(\'' + esc(o.id) + '\')" title="Delete" style="color:var(--red);"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>' +
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
          { name: 'Produit',    value: o.productName || '—', inline: true },
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

  /* ── Order Detail ── */
  window.viewOrderDetail = function(id) {
    var orders = getOrders();
    var o = orders.find(function(x) { return x.id === id; });
    if (!o) { toast('Commande introuvable.'); return; }
    window._detailOrderId = id;

    var sym = CURRENCY_SYMBOLS[o.currency] || '€';
    var price = Number(o.price || 0);

    function pill(status) {
      return status === 'refunded'
        ? '<span class="stock-pill stock-pill--out">Refunded</span>'
        : status === 'pending'
          ? '<span class="stock-pill stock-pill--low">Pending</span>'
          : '<span class="stock-pill stock-pill--ok">Completed</span>';
    }
    function detRow(label, val) {
      return '<div class="inv-det-row"><span class="inv-det-row__lbl">' + label + '</span><span class="inv-det-row__val">' + val + '</span></div>';
    }

    var d = o.date ? new Date(o.date) : null;
    var dateStr = d ? d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR') : '—';

    /* ── Order Information ── */
    var orderInfoEl = document.getElementById('odOrderInfo');
    if (orderInfoEl) {
      var totalPaidBadge = o.status !== 'refunded'
        ? '<span style="display:inline-block;background:rgba(34,197,94,.15);color:#22c55e;border-radius:5px;padding:1px 8px;font-size:12px;font-weight:600;">+' + sym + price.toFixed(2) + '</span>'
        : '<span style="color:rgba(255,255,255,.4);">—</span>';
      orderInfoEl.innerHTML =
        detRow('ID', '<span style="font-family:\'Courier New\',monospace;font-size:11px;color:rgba(255,255,255,.55);">' + esc(o.id) + '</span>') +
        detRow('Status', pill(o.status)) +
        detRow('Payment Method', o.paymentMethod ? esc(o.paymentMethod) : '—') +
        detRow('Subtotal', sym + price.toFixed(2)) +
        detRow('Total Price', '<strong>' + sym + price.toFixed(2) + '</strong>') +
        detRow('Total Price (USD)', o.priceUSD ? '$' + Number(o.priceUSD).toFixed(2) : '—') +
        detRow('Total Paid', totalPaidBadge) +
        detRow('Created At', dateStr) +
        detRow('Completed At', o.status === 'completed' ? dateStr : '—');
    }

    /* ── Customer Information ── */
    var custInfoEl = document.getElementById('odCustomerInfo');
    if (custInfoEl) {
      custInfoEl.innerHTML =
        detRow('E-mail Address', '<span style="word-break:break-all;">' + esc(o.email || '—') + '</span>') +
        detRow('IP Address', o.ip ? esc(o.ip) : '—') +
        detRow('Country', o.country ? esc(o.country) : '—') +
        detRow('Browser', o.browser ? esc(o.browser) : '—') +
        detRow('Operating System', o.os ? esc(o.os) : '—') +
        detRow('User Agent', o.userAgent ? '<span style="font-size:11px;color:rgba(255,255,255,.45);">' + esc(o.userAgent) + '</span>' : '—') +
        detRow('ASN', o.asn ? esc(String(o.asn)) : '—');
    }
    var custActEl = document.getElementById('odCustActions');
    if (custActEl) {
      custActEl.innerHTML =
        '<button class="a-btn--blue-outline" onclick="viewCustomerFromDetail(\'' + esc(o.email || '') + '\')">' +
          '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
          'View Customer' +
        '</button>' +
        '<button class="a-btn--red-outline" onclick="blacklistEmail(\'' + esc(o.email || '') + '\')">' +
          '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
          'Blacklist E-mail' +
        '</button>' +
        (o.ip ? '<button class="a-btn--red-outline" onclick="blacklistIP(\'' + esc(o.ip) + '\')">' +
          '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
          'Blacklist IP' +
        '</button>' : '');
    }

    /* ── Refund button ── */
    var refundBtn = document.getElementById('odRefundBtn');
    if (refundBtn) refundBtn.style.display = o.status === 'refunded' ? 'none' : '';

    /* ── Items ── */
    var itemsTbody = document.getElementById('odItemsTbody');
    if (itemsTbody) {
      itemsTbody.innerHTML = '<tr>' +
        '<td>' + pill(o.status) + '</td>' +
        '<td><div style="display:flex;align-items:center;gap:10px;">' +
          letterThumb(o.productName || '', 30) +
          '<div><div style="font-weight:500;">' + esc(o.productName || '') + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,.4);">' + esc(o.productDesc || 'Default') + '</div></div>' +
        '</div></td>' +
        '<td>1</td>' +
        '<td style="font-weight:500;">' + sym + price.toFixed(2) + '</td>' +
        '<td style="color:rgba(255,255,255,.3);">—</td>' +
        '<td><span class="od-deliv od-deliv--hidden" id="odDelivText">' + esc(o.deliverable || '—') + '</span></td>' +
        '<td><button class="a-btn a-btn--icon" id="odRevealBtn" onclick="toggleDeliverable()" title="View">' +
          '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
          ' View' +
        '</button></td>' +
      '</tr>';
    }

    /* ── Payment History ── */
    var payTbody = document.getElementById('odPayTbody');
    if (payTbody) {
      payTbody.innerHTML = '<tr>' +
        '<td>' + pill(o.status) + '</td>' +
        '<td style="font-weight:500;">' + sym + price.toFixed(2) + '</td>' +
        '<td style="font-size:12px;color:rgba(255,255,255,.5);white-space:nowrap;">' + dateStr + '</td>' +
        '<td><span class="od-ext-id">' + (o.externalId ? esc(o.externalId) : '—') + '</span></td>' +
      '</tr>';
    }

    /* ── Customer Feedback ── */
    var feedbackEl = document.getElementById('odFeedback');
    if (feedbackEl) {
      var reviews = [];
      try { reviews = JSON.parse(localStorage.getItem('nexus_reviews') || '[]'); } catch(e) {}
      var related = reviews.filter(function(r) { return r.email === o.email || r.product === o.productName; });
      if (!related.length) {
        feedbackEl.innerHTML = '<p style="color:rgba(255,255,255,.3);font-size:13px;padding:12px 0;">No feedback submitted yet.</p>';
      } else {
        feedbackEl.innerHTML = related.map(function(r) {
          var stars = '';
          for (var i = 0; i < (r.rating || 5); i++) stars += '★';
          return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);">' +
            '<div style="color:#f59e0b;font-size:13px;">' + stars + '</div>' +
            '<div style="font-size:13px;margin-top:4px;">' + esc(r.text || '') + '</div>' +
          '</div>';
        }).join('');
      }
    }

    showPage('order-detail');
  };

  window.goBackToOrders = function() { showPage('orders'); };

  window.refundOrderFromDetail = function() {
    var id = window._detailOrderId;
    if (!id) return;
    var orders = getOrders();
    var o = orders.find(function(x) { return x.id === id; });
    if (!o || !confirm('Mark ' + id + ' as refunded?')) return;
    o.status = 'refunded';
    setOrders(orders);
    var cfg = getWebhookFor('REFUND');
    if (cfg && cfg.url) {
      var sym = CURRENCY_SYMBOLS[o.currency] || '€';
      sendDiscordWebhook(cfg.url, {
        title: '↩️ Remboursement effectué', color: 15158332,
        fields: [
          { name: 'Invoice ID', value: o.id || '—', inline: true },
          { name: 'Produit', value: (o.productIcon || '') + ' ' + (o.productName || '—'), inline: true },
          { name: 'Email', value: o.email || '—', inline: true },
          { name: 'Montant', value: sym + Number(o.price || 0).toFixed(2), inline: true }
        ],
        footer: { text: 'Nexus Store' }, timestamp: new Date().toISOString()
      }, cfg.msg);
    }
    toast('Commande remboursée ✓');
    viewOrderDetail(id);
  };

  window.toggleDeliverable = function() {
    var el = document.getElementById('odDelivText');
    var btn = document.getElementById('odRevealBtn');
    if (!el) return;
    var hidden = el.classList.toggle('od-deliv--hidden');
    if (btn) btn.innerHTML = hidden
      ? '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View'
      : '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Hide';
  };

  window.viewCustomerFromDetail = function(email) {
    if (!email) return;
    showPage('customers');
    var searchEl = document.getElementById('customersSearch');
    if (searchEl) { searchEl.value = email; filterCustomers(email); }
  };

  window.downloadOrderPDF = function() {
    var id = window._detailOrderId;
    if (!id) return;
    var orders = getOrders();
    var o = orders.find(function(x) { return x.id === id; });
    if (!o) return;
    var sym = CURRENCY_SYMBOLS[o.currency] || '€';
    var d = o.date ? new Date(o.date) : new Date();
    var dateStr = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR');
    var w = window.open('', '_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ' + o.id + '</title><style>' +
      'body{font-family:Inter,sans-serif;background:#fff;color:#111;padding:48px;max-width:680px;margin:0 auto;}' +
      'h1{font-size:24px;font-weight:700;margin-bottom:4px;}' +
      '.sub{color:#666;font-size:13px;margin-bottom:32px;}' +
      'table{width:100%;border-collapse:collapse;margin-top:24px;}' +
      'th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#999;padding:8px 0;border-bottom:1px solid #eee;}' +
      'td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;}' +
      '.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:#d1fae5;color:#065f46;}' +
      '.total{font-weight:700;font-size:16px;}' +
      '@media print{body{padding:24px;}}' +
    '</style></head><body>' +
      '<h1>Invoice</h1><div class="sub">' + esc(o.id) + ' &middot; ' + dateStr + '</div>' +
      '<table><thead><tr><th>Produit</th><th>Qté</th><th>Prix</th><th>Statut</th></tr></thead><tbody>' +
      '<tr><td>' + esc(o.productName || '') + '<br><small style="color:#999;">' + esc(o.productDesc || '') + '</small></td>' +
      '<td>1</td><td>' + sym + Number(o.price || 0).toFixed(2) + '</td><td><span class="badge">Completed</span></td></tr>' +
      '</tbody></table>' +
      '<div style="margin-top:24px;text-align:right;"><span class="total">Total : ' + sym + Number(o.price || 0).toFixed(2) + '</span></div>' +
      '<div style="margin-top:32px;font-size:12px;color:#999;">Client : ' + esc(o.email || '') + '</div>' +
      '<script>window.onload=function(){window.print();}<\/script>' +
    '</body></html>');
    w.document.close();
  };

  window.viewOrderInvoice = function() { window.downloadOrderPDF(); };

  window.blacklistEmail = function(email) {
    if (!email || !confirm('Blacklist email ' + email + '?')) return;
    var list = getBlacklist('email');
    if (list.find(function(i) { return i.value === email; })) { toast('Already blacklisted.'); return; }
    var now = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dateStr = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    list.unshift({ value: email, date: dateStr, source: 'order' });
    setBlacklist('email', list);
    toast('Email blacklisted ✓');
  };

  window.blacklistIP = function(ip) {
    if (!ip || !confirm('Blacklist IP ' + ip + '?')) return;
    var list = getBlacklist('ip');
    if (list.find(function(i) { return i.value === ip; })) { toast('Already blacklisted.'); return; }
    var now = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dateStr = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    list.unshift({ value: ip, date: dateStr, source: 'order' });
    setBlacklist('ip', list);
    toast('IP blacklisted ✓');
  };

  /* ── Customers ── */
  var _allCustomers = [];

  function buildCustomers(orders) {
    var map = {};
    orders.forEach(function(o) {
      if (!o.email) return;
      var k = o.email.toLowerCase();
      if (!map[k]) map[k] = { email: o.email, orders: 0, total: 0, lastDate: null, products: [] };
      map[k].orders++;
      if (o.status !== 'refunded') map[k].total += Number(o.price || 0);
      var d = o.date ? new Date(o.date) : null;
      if (d && (!map[k].lastDate || d > map[k].lastDate)) map[k].lastDate = d;
      if (o.productName && map[k].products.indexOf(o.productName) === -1) map[k].products.push(o.productName);
    });
    return Object.values(map).sort(function(a,b){return b.total - a.total;});
  }

  function renderCustomers(query) {
    _allCustomers = buildCustomers(getOrders());
    var q = (query || '').toLowerCase();
    var list = q ? _allCustomers.filter(function(c) {
      return c.email.toLowerCase().indexOf(q) !== -1 ||
             c.products.join(' ').toLowerCase().indexOf(q) !== -1;
    }) : _allCustomers;

    var el = document.getElementById('customersCount');
    if (el) el.textContent = _allCustomers.length + ' client' + (_allCustomers.length > 1 ? 's' : '') + ' uniques';

    var tbody = document.getElementById('customersTbody');
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:rgba(255,255,255,.3);padding:36px;">' +
        (q ? 'Aucun client correspondant.' : 'Aucune commande enregistrée.') + '</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(function(c) {
      var initials = c.email.slice(0,2).toUpperCase();
      var d = c.lastDate ? c.lastDate.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—';
      var prods = c.products.slice(0,3).join(', ') + (c.products.length > 3 ? ' +' + (c.products.length - 3) : '');
      return '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:10px;">' +
          '<div class="customer-avatar">' + esc(initials) + '</div>' +
          '<span style="font-weight:500;">' + esc(c.email.split('@')[0]) + '</span>' +
        '</div></td>' +
        '<td style="color:rgba(255,255,255,.5);font-size:13px;">' + esc(c.email) + '</td>' +
        '<td style="font-weight:600;">' + c.orders + '</td>' +
        '<td style="font-weight:600;color:#a78bfa;">€' + c.total.toFixed(2) + '</td>' +
        '<td style="color:rgba(255,255,255,.5);font-size:13px;">' + d + '</td>' +
        '<td style="color:rgba(255,255,255,.5);font-size:12px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(prods || '—') + '</td>' +
      '</tr>';
    }).join('');
  }

  window.filterCustomers = function(q) { renderCustomers(q); };

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
    if (!confirm('Supprimer toutes les données (produits, commandes, avis, webhooks, promos…) ? Cette action est irréversible.')) return;
    [
      'nexus_products','nexus_stats','nexus_links','nexus_categories',
      'nexus_reviews','nexus_content','nexus_orders','nexus_webhooks',
      'nexus_promos','nexus_login_log','nexus_login_fails',
      'nexus_blacklist_emails','nexus_blacklist_ips'
    ].forEach(function(k) { localStorage.removeItem(k); });
    toast('Données réinitialisées.');
    renderProducts();
    loadStatsForm();
  };

  function loadSettingsInfo() {
    var c = JSON.parse(localStorage.getItem('nexus_content') || '{}');
    var nameEl = document.getElementById('settingsStoreName');
    var emailEl = document.getElementById('settingsEmail');
    if (nameEl) nameEl.value = c.siteName || '';
    if (emailEl) emailEl.value = c.contactEmail || '';
  }

  window.saveSettingsInfo = function() {
    var c = JSON.parse(localStorage.getItem('nexus_content') || '{}');
    var name = document.getElementById('settingsStoreName').value.trim();
    var email = document.getElementById('settingsEmail').value.trim();
    if (name) c.siteName = name;
    if (email) c.contactEmail = email;
    localStorage.setItem('nexus_content', JSON.stringify(c));
    var msg = document.getElementById('settingsInfoMsg');
    if (msg) { msg.textContent = 'Enregistré ✓'; setTimeout(function() { msg.textContent = ''; }, 2000); }
    toast('Paramètres enregistrés ✓');
  };

  /* ── Security ── */
  function getBlacklist(type) {
    var key = type === 'ip' ? 'nexus_blacklist_ips' : 'nexus_blacklist_emails';
    try {
      var raw = JSON.parse(localStorage.getItem(key) || '[]');
      return raw.map(function(item) {
        if (typeof item === 'string') return { value: item, date: '—', source: 'imported' };
        return item;
      });
    } catch(e) { return []; }
  }

  function setBlacklist(type, list) {
    var key = type === 'ip' ? 'nexus_blacklist_ips' : 'nexus_blacklist_emails';
    localStorage.setItem(key, JSON.stringify(list));
  }

  function getSecuritySettings() {
    try { return JSON.parse(localStorage.getItem('nexus_security') || '{}'); } catch(e) { return {}; }
  }
  function setSecuritySettings(s) { localStorage.setItem('nexus_security', JSON.stringify(s)); }

  function updateSecBadge(id, active) {
    var el = document.getElementById(id);
    if (!el) return;
    el.className = 'sec-badge ' + (active ? 'sec-badge--active' : 'sec-badge--inactive');
    el.textContent = active ? 'Active' : 'Inactive';
  }

  function renderSecurity() {
    var fails  = parseInt(localStorage.getItem('nexus_login_fails') || '0');
    var log    = JSON.parse(localStorage.getItem('nexus_login_log') || '[]');
    var blocked = log.filter(function(e) { return !e.success; }).length;
    var lastOk  = log.find(function(e) { return e.success; });

    // KPI cards
    var kpisEl = document.getElementById('secKpis');
    if (kpisEl) {
      var blIPs    = getBlacklist('ip').length;
      var blEmails = getBlacklist('email').length;
      var sec      = getSecuritySettings();
      var activeRules = [sec.antiVpn, sec.blockTor, sec.blockDc].filter(Boolean).length;
      kpisEl.innerHTML =
        kpiCard('', 'Failed Login Attempts', String(blocked), blocked > 0 ? 'down' : 'flat') +
        kpiCard('', 'Active Rules', String(activeRules) + ' / 3', activeRules > 0 ? 'up' : 'flat') +
        kpiCard('', 'IPs Blacklisted', String(blIPs), blIPs > 0 ? 'flat' : 'flat') +
        kpiCard('', 'Emails Blacklisted', String(blEmails), blEmails > 0 ? 'flat' : 'flat');
    }

    // Populate security toggles
    var sec = getSecuritySettings();
    var elVpn = document.getElementById('secAntiVpn');
    var elTor = document.getElementById('secBlockTor');
    var elDc  = document.getElementById('secBlockDc');
    if (elVpn) elVpn.checked = !!sec.antiVpn;
    if (elTor) elTor.checked = !!sec.blockTor;
    if (elDc)  elDc.checked  = !!sec.blockDc;
    updateSecBadge('antiVpnBadge', !!sec.antiVpn);
    updateSecBadge('antiTorBadge', !!sec.blockTor);
    updateSecBadge('antiDcBadge',  !!sec.blockDc);

    // Login log
    var tbody = document.getElementById('loginLogTbody');
    if (tbody) {
      if (!log.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:rgba(255,255,255,.3);padding:24px;">No events recorded yet.</td></tr>';
      } else {
        tbody.innerHTML = log.map(function(e) {
          var d = new Date(e.time);
          var dateStr = d.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) + ' ' + d.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'});
          var status  = e.success
            ? '<span class="stock-pill stock-pill--ok">Success</span>'
            : '<span class="stock-pill stock-pill--out">Failed</span>';
          return '<tr><td>' + dateStr + '</td><td>' + status + '</td><td style="color:rgba(255,255,255,.5);">' + (e.success ? '—' : e.attempts + ' attempt(s)') + '</td></tr>';
        }).join('');
      }
    }

    // Brute force status
    var bfEl = document.getElementById('bruteForceStatus');
    if (bfEl) {
      bfEl.innerHTML = fails === 0
        ? '<span class="ip-check-clean">No active brute force attempts. System protected.</span>'
        : '<span class="ip-check-warn">Warning — ' + fails + ' failed attempt(s) in progress. Discord webhook fires at 3.</span>';
    }

    renderBlacklist('ip');
    renderBlacklist('email');
  }

  function renderBlacklist(type) {
    var elId = type === 'ip' ? 'blacklistIPsList' : 'blacklistEmailsList';
    var el   = document.getElementById(elId);
    if (!el) return;
    var list = getBlacklist(type);
    if (!list.length) {
      el.innerHTML = '<p style="color:rgba(255,255,255,.3);font-size:13px;padding:6px 0 2px;">No entries yet. Add ' + (type === 'ip' ? 'an IP' : 'an email') + ' above to block it.</p>';
      return;
    }
    el.innerHTML =
      '<table class="bl-table">' +
        '<thead><tr>' +
          '<th>' + (type === 'ip' ? 'IP Address' : 'Email Address') + '</th>' +
          '<th>Date Added</th><th>Source</th><th></th>' +
        '</tr></thead>' +
        '<tbody>' +
        list.map(function(item, i) {
          var val  = esc(typeof item === 'string' ? item : item.value);
          var date = typeof item === 'object' ? esc(item.date || '—') : '—';
          var src  = typeof item === 'object' ? (item.source || 'manual') : 'legacy';
          var isAuto = (src === 'order' || src === 'auto');
          return '<tr>' +
            '<td style="font-family:monospace;font-size:12px;font-weight:600;">' + val + '</td>' +
            '<td style="color:rgba(255,255,255,.4);font-size:12px;">' + date + '</td>' +
            '<td><span class="bl-entry-badge' + (isAuto ? ' bl-entry-badge--auto' : '') + '">' + esc(src) + '</span></td>' +
            '<td style="text-align:right;">' +
              '<button class="a-btn a-btn--icon" onclick="removeBlacklistItem(\'' + type + '\',' + i + ')" style="color:var(--red);" title="Remove">' +
                '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>' +
              '</button>' +
            '</td>' +
          '</tr>';
        }).join('') +
        '</tbody></table>';
  }

  window.addBlacklistItem = function(type) {
    var inputId = type === 'ip' ? 'newBlacklistIP' : 'newBlacklistEmail';
    var inp     = document.getElementById(inputId);
    var val     = (inp ? inp.value.trim() : '');
    if (!val) { toast('Enter a value first.'); return; }
    var list = getBlacklist(type);
    if (list.find(function(i) { return i.value === val; })) { toast('Already in blacklist.'); return; }
    var now = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dateStr = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    list.unshift({ value: val, date: dateStr, source: 'manual' });
    setBlacklist(type, list);
    if (inp) inp.value = '';
    renderBlacklist(type);
    var label = type === 'ip' ? 'IP' : 'Email';
    toast(label + ' blacklisted ✓');
    // Refresh KPI
    var sec = getSecuritySettings();
    var kpisEl = document.getElementById('secKpis');
    if (kpisEl) renderSecurity();
  };

  window.removeBlacklistItem = function(type, index) {
    var list = getBlacklist(type);
    list.splice(index, 1);
    setBlacklist(type, list);
    renderBlacklist(type);
  };

  window.clearBlacklist = function(type) {
    var label = type === 'email' ? 'email' : 'IP';
    if (!confirm('Remove all blacklisted ' + label + 's?')) return;
    setBlacklist(type, []);
    renderBlacklist(type);
    renderSecurity();
    toast(label + ' blacklist cleared ✓');
  };

  window.saveSecuritySettings = function() {
    var s = getSecuritySettings();
    var elVpn = document.getElementById('secAntiVpn');
    var elTor = document.getElementById('secBlockTor');
    var elDc  = document.getElementById('secBlockDc');
    s.antiVpn = elVpn ? elVpn.checked : false;
    s.blockTor = elTor ? elTor.checked : false;
    s.blockDc  = elDc  ? elDc.checked  : false;
    setSecuritySettings(s);
    updateSecBadge('antiVpnBadge', s.antiVpn);
    updateSecBadge('antiTorBadge', s.blockTor);
    updateSecBadge('antiDcBadge',  s.blockDc);
    // Update KPIs
    var activeRules = [s.antiVpn, s.blockTor, s.blockDc].filter(Boolean).length;
    var kpiEl = document.querySelector('#secKpis .db-kpi-card:nth-child(2) .db-kpi-val');
    if (kpiEl) kpiEl.textContent = activeRules + ' / 3';
    toast('Security settings saved.');
  };

  window.checkIpVpn = function() {
    var ip  = (document.getElementById('checkIpInput').value || '').trim();
    var res = document.getElementById('checkIpResult');
    if (!res) return;
    if (!ip) {
      res.innerHTML = '<span style="color:rgba(255,255,255,.4);font-size:12px;">Fetching your IP…</span>';
      fetch('https://api.ipify.org?format=json')
        .then(function(r) { return r.json(); })
        .then(function(d) {
          var inp = document.getElementById('checkIpInput');
          if (inp) inp.value = d.ip;
          doIpCheck(d.ip);
        })
        .catch(function() { res.innerHTML = '<span style="color:var(--red);font-size:12px;">Could not detect IP address.</span>'; });
      return;
    }
    doIpCheck(ip);
  };

  function doIpCheck(ip) {
    var res = document.getElementById('checkIpResult');
    if (!res) return;
    res.innerHTML = '<span style="color:rgba(255,255,255,.4);font-size:12px;">Checking ' + esc(ip) + '…</span>';
    fetch('https://ip-api.com/json/' + encodeURIComponent(ip) + '?fields=status,message,country,regionName,city,isp,org,proxy,hosting,query')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.status !== 'success') {
          res.innerHTML = '<span style="color:var(--red);font-size:12px;">API error: ' + esc(d.message || 'Unknown') + '</span>';
          return;
        }
        var flags = [];
        if (d.proxy)   flags.push('<span class="ip-check-flag">VPN / Proxy detected</span>');
        if (d.hosting) flags.push('<span class="ip-check-warn">Datacenter / Hosting IP</span>');
        res.innerHTML =
          '<div class="ip-check-result">' +
            '<div style="margin-bottom:6px;"><span style="color:rgba(255,255,255,.4);">IP: </span><strong style="font-family:monospace;">' + esc(d.query) + '</strong></div>' +
            '<div><span style="color:rgba(255,255,255,.4);">Location: </span>' + esc(d.city + ', ' + d.regionName + ', ' + d.country) + '</div>' +
            '<div><span style="color:rgba(255,255,255,.4);">ISP: </span>' + esc(d.isp) + '</div>' +
            '<div style="margin-bottom:8px;"><span style="color:rgba(255,255,255,.4);">Org: </span>' + esc(d.org) + '</div>' +
            (flags.length
              ? '<div style="padding-top:8px;border-top:1px solid rgba(255,255,255,.08);">' + flags.join(' &nbsp;·&nbsp; ') + '</div>'
              : '<div style="padding-top:8px;border-top:1px solid rgba(255,255,255,.08);"><span class="ip-check-clean">Clean — no VPN or proxy detected</span></div>') +
          '</div>';
      })
      .catch(function() {
        res.innerHTML = '<span style="color:var(--red);font-size:12px;">Request failed. Check your internet connection.</span>';
      });
  }

  window.clearLoginLog = function() {
    if (!confirm('Clear all login history?')) return;
    localStorage.removeItem('nexus_login_log');
    renderSecurity();
    toast('Login log cleared ✓');
  };

  window.resetBruteForce = function() {
    localStorage.setItem('nexus_login_fails', '0');
    renderSecurity();
    toast('Brute force counter reset ✓');
  };

  /* ── Email Notifications ── */
  var DEFAULT_EMAIL_TEMPLATE = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Order is Ready!</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#111;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;color:#fff;padding:24px 16px}.wrapper{max-width:480px;margin:0 auto}.card{background:#1a1a1a;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.07)}.header{padding:32px 28px 26px;text-align:center;border-bottom:1px solid rgba(255,255,255,.07)}.header h1{font-size:20px;font-weight:700;color:#fff}.header p{font-size:13px;color:rgba(255,255,255,.45);margin-top:6px}.body{padding:24px 28px}.lbl{font-size:10px;font-weight:600;letter-spacing:.9px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:8px}.id-box{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px 16px;margin-bottom:20px}.id-box span{font-family:monospace;font-size:13px;color:#fff;word-break:break-all}.product-name{font-size:17px;font-weight:700;color:#fff;margin-bottom:18px}.creds-box{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px 16px;margin-bottom:14px}.creds-box pre{font-family:monospace;font-size:12px;color:#a78bfa;white-space:pre-wrap;word-break:break-all;line-height:1.6}.notice{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);border-radius:8px;padding:11px 14px;margin-bottom:22px;font-size:12px;color:rgba(255,255,255,.4)}.review-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:22px;text-align:center;margin-bottom:16px}.review-card h3{font-size:15px;font-weight:700;color:#fff;margin-bottom:6px}.review-card p{font-size:12px;color:rgba(255,255,255,.35);margin-bottom:16px}.btn{display:inline-block;background:#e6a817;color:#000;font-weight:800;font-size:12px;letter-spacing:.7px;text-transform:uppercase;padding:12px 28px;border-radius:8px;text-decoration:none}.support-card{background:#1e1500;border:1px solid rgba(230,168,23,.18);border-radius:10px;padding:18px;text-align:center;margin-bottom:16px}.support-card p{font-size:12px;color:#e6a817;margin-bottom:4px}.support-card a{color:#e6a817;text-decoration:underline}.footer{padding:18px 28px;text-align:center;border-top:1px solid rgba(255,255,255,.06)}.footer p{font-size:11px;color:rgba(255,255,255,.18)}</style></head><body><div class="wrapper"><div class="card"><div class="header"><h1>&#x1F4E6; Your Order is Ready!</h1><p>Here is your order!</p></div><div class="body"><div class="lbl">Order ID</div><div class="id-box"><span>{{invoice_id}}</span></div><div class="product-name">{{product_name}}</div><div class="lbl">Credentials / Keys</div><div class="creds-box"><pre>{{deliverable}}</pre></div><div class="notice">&#x1F512; Please save these items securely.</div><div class="review-card"><h3>&#x2B50; Happy with your purchase?</h3><p>Let us know by leaving a review on your received products!</p><a class="btn" href="{{store_url}}">LEAVE A REVIEW</a></div><div class="support-card"><p>&#x26A0;&#xFE0F; Having an issue?</p><p>Before opening a ticket, please check our support page. You might find a quick solution there instead of waiting for our administration team!</p><p style="margin-top:8px;">Still need help? <a href="{{store_url}}">Contact Support</a></p></div></div><div class="footer"><p>&copy; {{store_name}}. All rights reserved.</p></div></div></div></body></html>';

  function getEmailConfig() {
    try { return JSON.parse(localStorage.getItem('nexus_email_config') || '{}'); } catch(e) { return {}; }
  }
  function setEmailConfig(cfg) { localStorage.setItem('nexus_email_config', JSON.stringify(cfg)); }

  function loadEmailPage() {
    var cfg = getEmailConfig();
    var elEnabled    = document.getElementById('emailEnabled');
    var elPublicKey  = document.getElementById('emailPublicKey');
    var elServiceId  = document.getElementById('emailServiceId');
    var elTemplateId = document.getElementById('emailTemplateId');
    var elSubject    = document.getElementById('emailSubject');
    var elEditor     = document.getElementById('emailTemplateEditor');
    if (elEnabled)    elEnabled.checked    = !!cfg.enabled;
    if (elPublicKey)  elPublicKey.value    = cfg.publicKey  || '';
    if (elServiceId)  elServiceId.value    = cfg.serviceId  || '';
    if (elTemplateId) elTemplateId.value   = cfg.templateId || '';
    if (elSubject)    elSubject.value      = cfg.subject    || 'Your Order is Ready! 📦';
    if (elEditor)     elEditor.value       = cfg.template   || DEFAULT_EMAIL_TEMPLATE;
    updateSecBadge('emailEnabledBadge', !!cfg.enabled);
  }

  window.toggleEmailEnabled = function(cb) {
    var cfg = getEmailConfig();
    cfg.enabled = cb.checked;
    setEmailConfig(cfg);
    updateSecBadge('emailEnabledBadge', !!cfg.enabled);
    toast(cfg.enabled ? 'Email notifications enabled.' : 'Email notifications disabled.');
  };

  window.saveEmailConfig = function() {
    var cfg = getEmailConfig();
    cfg.publicKey  = (document.getElementById('emailPublicKey')  || {}).value || '';
    cfg.serviceId  = (document.getElementById('emailServiceId')  || {}).value || '';
    cfg.templateId = (document.getElementById('emailTemplateId') || {}).value || '';
    cfg.subject    = (document.getElementById('emailSubject')    || {}).value || 'Your Order is Ready!';
    setEmailConfig(cfg);
    var msg = document.getElementById('emailConfigMsg');
    if (msg) { msg.textContent = 'Saved ✓'; setTimeout(function() { msg.textContent = ''; }, 2000); }
    toast('Email configuration saved ✓');
  };

  window.saveEmailTemplate = function() {
    var cfg = getEmailConfig();
    var el = document.getElementById('emailTemplateEditor');
    cfg.template = el ? el.value : '';
    setEmailConfig(cfg);
    var msg = document.getElementById('emailTemplateMsg');
    if (msg) { msg.textContent = 'Saved ✓'; setTimeout(function() { msg.textContent = ''; }, 2000); }
    toast('Email template saved ✓');
  };

  window.resetEmailTemplate = function() {
    if (!confirm('Reset template to default? Your edits will be lost.')) return;
    var el = document.getElementById('emailTemplateEditor');
    if (el) el.value = DEFAULT_EMAIL_TEMPLATE;
    var cfg = getEmailConfig();
    cfg.template = DEFAULT_EMAIL_TEMPLATE;
    setEmailConfig(cfg);
    toast('Template reset to default ✓');
  };

  window.previewEmailTemplate = function() {
    var el = document.getElementById('emailTemplateEditor');
    var html = el ? el.value : DEFAULT_EMAIL_TEMPLATE;
    var c = JSON.parse(localStorage.getItem('nexus_content') || '{}');
    var storeName = c.siteName || 'Nexus Store';
    var storeUrl  = window.location.origin || 'https://example.com';
    var rendered  = html
      .replace(/\{\{invoice_id\}\}/g,       'cmpr76393008604k4nkd5acde')
      .replace(/\{\{product_name\}\}/g,     'Crunchyroll [MEGA FAN] Lifetime')
      .replace(/\{\{deliverable\}\}/g,      'juvelezp@gmail.com:Clei/12345+ | EmailVerified = true | Plan = 【6 months】')
      .replace(/\{\{customer_email\}\}/g,   'customer@example.com')
      .replace(/\{\{store_name\}\}/g,       storeName)
      .replace(/\{\{store_url\}\}/g,        storeUrl);
    var w = window.open('', '_blank', 'width=560,height=720,scrollbars=yes');
    if (w) { w.document.write(rendered); w.document.close(); }
    else   toast('Please allow pop-ups to preview the email.');
  };

  window.testEmailSend = function() {
    var cfg = getEmailConfig();
    if (!cfg.publicKey || !cfg.serviceId || !cfg.templateId) {
      toast('Please save your EmailJS configuration first.'); return;
    }
    var c = JSON.parse(localStorage.getItem('nexus_content') || '{}');
    var storeName = c.siteName || 'Nexus Store';
    var adminEmail = c.contactEmail || '';
    if (!adminEmail) {
      toast('Set a contact email in Settings first.'); return;
    }
    var html = (cfg.template || DEFAULT_EMAIL_TEMPLATE)
      .replace(/\{\{invoice_id\}\}/g,       'TEST-' + Date.now())
      .replace(/\{\{product_name\}\}/g,     'Test Product')
      .replace(/\{\{deliverable\}\}/g,      'test@example.com:password123')
      .replace(/\{\{customer_email\}\}/g,   adminEmail)
      .replace(/\{\{store_name\}\}/g,       storeName)
      .replace(/\{\{store_url\}\}/g,        window.location.origin || '');
    var subject = (cfg.subject || 'Your Order is Ready!')
      .replace(/\{\{invoice_id\}\}/g, 'TEST')
      .replace(/\{\{product_name\}\}/g, 'Test Product');
    var btn = document.getElementById('emailTestBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    function finishBtn(label) { if (btn) { btn.disabled = false; btn.textContent = label; setTimeout(function() { btn.textContent = 'Send Test Email'; }, 2500); } }
    function doSend() {
      window.emailjs.send(cfg.serviceId, cfg.templateId, {
        to_email: adminEmail, subject: subject, message_html: html
      }, cfg.publicKey)
      .then(function()  { finishBtn('Sent ✓'); toast('Test email sent to ' + adminEmail + ' ✓'); })
      .catch(function() { finishBtn('Error ✗'); toast('Failed to send. Check your EmailJS credentials.'); });
    }
    if (window.emailjs) {
      doSend();
    } else {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      s.onload = function() { doSend(); };
      s.onerror = function() { finishBtn('Error ✗'); toast('Could not load EmailJS SDK.'); };
      document.head.appendChild(s);
    }
  };

  /* ── Helpers ── */
  function esc(s) { return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function kpiCard(icon, label, value, trend) {
    var cls = trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'flat';
    var note = trend === 'up' ? '✓ Secure' : trend === 'down' ? '⚠ Alert' : '— Normal';
    return '<div class="db-kpi-card">' +
      '<div class="db-kpi-card__label">' + icon + ' ' + label + '</div>' +
      '<div class="db-kpi-card__value" style="font-size:22px;">' + value + '</div>' +
      '<div class="db-kpi-card__change db-kpi-card__change--' + cls + '">' + note + '</div>' +
    '</div>';
  }

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
    var c = getContent();
    var siteName = c.siteName || 'Nexus';
    var brandName = document.getElementById('sidebarBrandName');
    var brandIcon = document.getElementById('sidebarBrandIcon');
    var topbarAvatar = document.getElementById('topbarAvatar');
    if (brandName) brandName.textContent = siteName;
    if (brandIcon) brandIcon.textContent = siteName.charAt(0).toUpperCase();
    if (topbarAvatar) topbarAvatar.textContent = 'A';
    renderDashboard();
    populateCatSelect();
    initModalPickers();
    initPeriodDropdown();
  }

  function initPeriodDropdown() {
    var btn  = document.getElementById('dbPeriodBtn');
    var drop = document.getElementById('dbPeriodDrop');
    if (!btn || !drop) return;

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      drop.classList.toggle('open');
    });

    document.addEventListener('click', function() {
      drop.classList.remove('open');
    });

    drop.querySelectorAll('.db-preset').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        _dashPeriod = el.dataset.period;
        drop.querySelectorAll('.db-preset').forEach(function(p) { p.classList.remove('active'); });
        el.classList.add('active');
        var labelEl = document.getElementById('dbPeriodLabel');
        if (labelEl) labelEl.textContent = el.textContent.trim();
        drop.classList.remove('open');
        renderDashboard();
      });
    });
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
    document.querySelectorAll('#visibilityPicker .vis-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        document.querySelectorAll('#visibilityPicker .vis-opt').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        document.getElementById('fVisibility').value = opt.dataset.val;
      });
    });
    document.querySelectorAll('#deliveryTypePicker .deltype-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        document.querySelectorAll('#deliveryTypePicker .deltype-opt').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        document.getElementById('fDeliveryType').value = opt.dataset.val;
        var keysSection = document.getElementById('deliveryKeysSection');
        if (keysSection) keysSection.style.display = opt.dataset.val === 'keys' ? '' : 'none';
      });
    });
    initDeliverableTabs('deliverableTabs', 'fDeliverables', 'fDeliverableMode', 'fExistingDeliverables', 'fDeliverableLabel');
    initDeliverableTabs('stockDeliverableTabs', 'stockDeliverables', 'fStockDeliverableMode', 'stockExistingDeliverables', 'stockDeliverableLabel');
  }

  /* ── Codes Promo ── */
  function getPromos() { try { return JSON.parse(localStorage.getItem('nexus_promos')) || []; } catch(e) { return []; } }
  function setPromos(p) { localStorage.setItem('nexus_promos', JSON.stringify(p)); }

  function renderPromos() {
    var el = document.getElementById('promosList');
    if (!el) return;
    var promos = getPromos();
    if (!promos.length) {
      el.innerHTML = '<div style="padding:48px 0;text-align:center;color:var(--text-muted);font-size:13px;">No coupons yet. Click <strong>Create Coupon</strong> to add one.</div>';
      return;
    }
    el.innerHTML = '<table class="a-table"><thead><tr>' +
      '<th>Code</th><th>Type</th><th>Discount</th><th>Uses</th><th>Max Uses</th><th>Expires</th><th>Actions</th>' +
      '</tr></thead><tbody>' +
      promos.map(function(p, i) {
        var discLabel = p.type === 'fixed' ? ('$' + Number(p.discount||0).toFixed(2)) : ('-' + (p.discount||0) + '%');
        var exp = p.expirationDate ? p.expirationDate.replace('T',' ').slice(0,16) : '—';
        return '<tr>' +
          '<td><span style="font-weight:700;font-family:monospace;color:#fff;letter-spacing:.04em;">' + esc(p.code) + '</span></td>' +
          '<td><span style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);">' + (p.type||'percentage') + '</span></td>' +
          '<td style="color:var(--accent);font-weight:600;">' + discLabel + '</td>' +
          '<td style="color:var(--text-muted);">' + (p.uses||0) + '</td>' +
          '<td style="color:var(--text-muted);">' + (p.maxUses > 0 ? p.maxUses : '∞') + '</td>' +
          '<td style="color:var(--text-muted);font-size:12px;">' + esc(exp) + '</td>' +
          '<td><div class="action-group">' +
            '<button class="a-btn a-btn--icon" onclick="openPromoForm(' + i + ')" title="Edit"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
            '<button class="a-btn a-btn--icon" onclick="deletePromo(' + i + ')" title="Delete" style="color:var(--red);"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>' +
          '</div></td>' +
        '</tr>';
      }).join('') +
      '</tbody></table>';
  }

  window.openPromoForm = function(idx) {
    var p = (idx !== undefined) ? getPromos()[idx] : null;
    document.getElementById('promoEditIndex').value = (idx !== undefined) ? idx : '';
    document.getElementById('promoFormTitle').textContent = p ? 'Edit Coupon' : 'Create Coupon';

    /* Reset form */
    document.getElementById('promoCode').value              = p ? p.code : '';
    document.getElementById('promoDiscount').value          = p ? (p.discount || 0) : 0;
    document.getElementById('promoMaxUses').value           = p ? (p.maxUses || '') : '';
    document.getElementById('promoMaxUsesPerCustomer').value= p ? (p.maxUsesPerCustomer || '') : '';
    document.getElementById('promoMinCart').value           = p ? (p.minCart || '') : '';
    document.getElementById('promoAllowedEmails').value     = p ? (p.allowedEmails || '') : '';
    document.getElementById('promoStartDate').value         = p ? (p.startDate || '') : '';
    document.getElementById('promoExpDate').value           = p ? (p.expirationDate || '') : '';
    document.getElementById('promoApplyAll').checked        = p ? (p.applyToAll !== false) : true;
    document.getElementById('promoDisableVolume').checked   = p ? !!p.disableVolume : false;
    document.getElementById('promoDisableBundle').checked   = p ? !!p.disableBundle : false;
    document.getElementById('promoDisableQty').checked      = p ? !!p.disableQty : false;

    var type = p ? (p.type || 'percentage') : 'percentage';
    selectCouponType(type, document.querySelector('.coupon-type-opt[data-val="' + type + '"]'));

    /* Update button labels for edit mode */
    var actions = document.querySelector('.coupon-form-actions');
    if (actions) {
      var btns = actions.querySelectorAll('.a-btn--primary, .a-btn--ghost:not(:first-child)');
      if (p) {
        btns[0] && (btns[0].querySelector('span') || btns[0]).lastChild && null;
        document.querySelectorAll('.coupon-form-actions .a-btn')[1].innerHTML =
          '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save &amp; Exit';
        document.querySelectorAll('.coupon-form-actions .a-btn')[2].innerHTML =
          '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save';
      } else {
        document.querySelectorAll('.coupon-form-actions .a-btn')[1].innerHTML =
          '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Create &amp; Exit';
        document.querySelectorAll('.coupon-form-actions .a-btn')[2].innerHTML =
          '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Create';
      }
    }

    document.getElementById('promos-list-view').style.display = 'none';
    document.getElementById('promos-form-view').style.display = '';
    document.getElementById('promoCode').focus();
  };

  window.closePromoForm = function() {
    document.getElementById('promos-form-view').style.display = 'none';
    document.getElementById('promos-list-view').style.display = '';
  };

  window.generatePromoCode = function() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = '';
    for (var i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    document.getElementById('promoCode').value = code;
  };

  window.selectCouponType = function(val, el) {
    document.getElementById('promoType').value = val;
    document.querySelectorAll('.coupon-type-opt').forEach(function(o) { o.classList.remove('active'); });
    if (el) el.classList.add('active');
    var unitEl = document.getElementById('promoDiscountUnit');
    var hintEl = document.getElementById('promoDiscountHint');
    var presetsEl = document.getElementById('couponPresets');
    if (val === 'fixed') {
      if (unitEl) unitEl.textContent = '$';
      if (hintEl) hintEl.textContent = 'Enter a fixed amount discount.';
      if (presetsEl) presetsEl.style.display = 'none';
    } else {
      if (unitEl) unitEl.textContent = '%';
      if (hintEl) hintEl.textContent = 'Enter a percentage discount.';
      if (presetsEl) presetsEl.style.display = '';
    }
  };

  window.stepDiscount = function(dir) {
    var el = document.getElementById('promoDiscount');
    el.value = Math.max(0, (parseFloat(el.value) || 0) + dir);
  };

  window.setPromoDiscount = function(val) {
    document.getElementById('promoDiscount').value = val;
  };

  window.savePromo = function(andExit) {
    var code = (document.getElementById('promoCode').value || '').trim().toUpperCase();
    if (!code) { toast('Coupon code required.'); return; }
    var discount = parseFloat(document.getElementById('promoDiscount').value) || 0;
    if (discount <= 0) { toast('Discount must be greater than 0.'); return; }

    var editIdx = document.getElementById('promoEditIndex').value;
    var promos  = getPromos();

    var existing = editIdx !== '' ? parseInt(editIdx) : -1;
    var duplicate = promos.findIndex(function(p, i) { return p.code === code && i !== existing; });
    if (duplicate !== -1) { toast('Code already exists.'); return; }

    var promo = {
      code:               code,
      type:               document.getElementById('promoType').value || 'percentage',
      discount:           discount,
      maxUses:            parseInt(document.getElementById('promoMaxUses').value) || 0,
      maxUsesPerCustomer: parseInt(document.getElementById('promoMaxUsesPerCustomer').value) || 0,
      minCart:            parseFloat(document.getElementById('promoMinCart').value) || 0,
      allowedEmails:      document.getElementById('promoAllowedEmails').value.trim(),
      startDate:          document.getElementById('promoStartDate').value,
      expirationDate:     document.getElementById('promoExpDate').value,
      applyToAll:         document.getElementById('promoApplyAll').checked,
      disableVolume:      document.getElementById('promoDisableVolume').checked,
      disableBundle:      document.getElementById('promoDisableBundle').checked,
      disableQty:         document.getElementById('promoDisableQty').checked,
      uses:               existing >= 0 ? (promos[existing].uses || 0) : 0
    };

    if (existing >= 0) {
      promos[existing] = promo;
      toast('Coupon updated ✓');
    } else {
      promos.push(promo);
      toast('Coupon created ✓');
    }
    setPromos(promos);
    renderPromos();
    if (andExit !== false) closePromoForm();
  };

  window.deletePromo = function(index) {
    if (!confirm('Delete this coupon?')) return;
    var promos = getPromos();
    promos.splice(index, 1);
    setPromos(promos);
    renderPromos();
    toast('Coupon deleted.');
  };

  checkSession();
})();
