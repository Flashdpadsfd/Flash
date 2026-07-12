/* FlashShp — Menu compte de la boutique.
   =========================================================================
   Au chargement, interroge /api/me. Si le visiteur est connecté (Discord ou
   e-mail), remplace le bouton « Sign In » de la barre de nav par son nom +
   un menu déroulant (Overview, My Orders, Sign Out). Sinon, ne touche à rien.

   Autonome : injecte son propre CSS, aucune dépendance. À inclure sur les
   pages boutique : <script src="assets/account-menu.js" defer></script> */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function injectStyles() {
    if (document.getElementById('fs-account-styles')) return;
    var css =
      '.fs-acc{position:relative;display:inline-block;font-family:Inter,sans-serif;}' +
      '.fs-acc__btn{display:flex;align-items:center;gap:8px;height:36px;padding:0 10px 0 8px;border-radius:10px;cursor:pointer;' +
        'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:14px;font-weight:600;}' +
      '.fs-acc__btn:hover{background:rgba(255,255,255,.09);}' +
      '.fs-acc__av{width:24px;height:24px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;' +
        'background:linear-gradient(135deg,#5b616e,#f6f7f9);color:#16171b;font-size:11px;font-weight:800;}' +
      '.fs-acc__name{max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.fs-acc__caret{opacity:.6;}' +
      '.fs-acc__menu{position:absolute;right:0;top:calc(100% + 8px);min-width:230px;background:#15161b;border:1px solid rgba(255,255,255,.1);' +
        'border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.5);padding:8px;z-index:2000;display:none;}' +
      '.fs-acc.open .fs-acc__menu{display:block;}' +
      '.fs-acc__head{padding:10px 12px 12px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:6px;}' +
      '.fs-acc__head-name{font-size:14px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.fs-acc__head-mail{font-size:12px;color:rgba(255,255,255,.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;}' +
      '.fs-acc__item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 12px;border-radius:9px;cursor:pointer;' +
        'background:none;border:none;color:rgba(255,255,255,.85);font-size:14px;font-family:Inter,sans-serif;text-decoration:none;}' +
      '.fs-acc__item:hover{background:rgba(255,255,255,.06);color:#fff;}' +
      '.fs-acc__item svg{opacity:.7;flex:0 0 auto;}' +
      '.fs-acc__item--danger{color:#f87171;}' +
      '.fs-acc__item--danger:hover{background:rgba(248,113,113,.1);color:#fca5a5;}' +
      '.fs-acc__sep{height:1px;background:rgba(255,255,255,.08);margin:6px 4px;}';
    var st = document.createElement('style');
    st.id = 'fs-account-styles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function avatarHtml(user) {
    if (user.avatar) return '<img class="fs-acc__av" src="' + esc(user.avatar) + '" alt="" onerror="this.replaceWith(document.createTextNode(\'\'))">';
    var initials = String(user.username || user.email || '?').slice(0, 2).toUpperCase();
    return '<span class="fs-acc__av">' + esc(initials) + '</span>';
  }

  function icon(paths) {
    return '<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  function buildWidget(user) {
    var wrap = document.createElement('div');
    wrap.className = 'fs-acc';
    wrap.innerHTML =
      '<button class="fs-acc__btn" type="button" aria-haspopup="true">' +
        avatarHtml(user) +
        '<span class="fs-acc__name">' + esc(user.username || 'Compte') + '</span>' +
        '<svg class="fs-acc__caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>' +
      '</button>' +
      '<div class="fs-acc__menu" role="menu">' +
        '<div class="fs-acc__head">' +
          '<div class="fs-acc__head-name">' + esc(user.username || 'Client') + '</div>' +
          '<div class="fs-acc__head-mail">' + esc(user.email || '') + '</div>' +
        '</div>' +
        '<a class="fs-acc__item" href="/account" role="menuitem">' +
          icon('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
          'Dashboard</a>' +
        '<a class="fs-acc__item" href="/account" role="menuitem">' +
          icon('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>') +
          'My Orders</a>' +
        '<div class="fs-acc__sep"></div>' +
        '<a class="fs-acc__item fs-acc__item--danger" href="/api/logout" role="menuitem">' +
          icon('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>') +
          'Sign Out</a>' +
      '</div>';

    var btn = wrap.querySelector('.fs-acc__btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') wrap.classList.remove('open');
    });
    return wrap;
  }

  function applyLoggedIn(user) {
    injectStyles();

    /* Desktop : remplace le bouton "Sign In" par le widget compte. */
    var loginBtn = document.querySelector('.nav__login');
    if (loginBtn && loginBtn.parentNode) {
      loginBtn.parentNode.replaceChild(buildWidget(user), loginBtn);
    }

    /* Mobile : remplace les boutons Sign In / Create Account du drawer. */
    var drawer = document.getElementById('drawer');
    if (drawer) {
      var box = drawer.querySelector('div[style*="margin-top:auto"]') || drawer.querySelector('div:last-child');
      if (box) {
        box.innerHTML =
          '<div style="padding:10px 4px 14px;">' +
            '<div style="font-weight:700;color:#fff;">' + esc(user.username || 'Client') + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,.45);">' + esc(user.email || '') + '</div>' +
          '</div>' +
          '<button class="btn-primary btn-primary--lg" style="width:100%;border-radius:6px;" onclick="location.href=\'/account\'">Mon compte</button>' +
          '<button class="btn-ghost" style="width:100%;" onclick="location.href=\'/api/logout\'">Se déconnecter</button>';
      }
    }
  }

  function start() {
    fetch('/api/me', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.user && d.user.email) applyLoggedIn(d.user); })
      .catch(function () { /* pas connecté / hors ligne : on garde "Sign In" */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
