/* FlashShp — Crypto Payment System
   Blockchain polling for BTC, ETH, LTC, SOL
   No API keys required for basic use
*/
(function () {
  'use strict';

  /* ── Constants ── */
  var POLL_INTERVAL = 30000; // 30 seconds
  var PAYMENT_TIMEOUT = 1800000; // 30 minutes
  var MIN_CONFIRMATIONS = { btc: 1, eth: 1, ltc: 1, sol: 1 };

  var CRYPTO_INFO = {
    btc: { name: 'Bitcoin',  symbol: 'BTC', color: '#f7931a', icon: '₿', decimals: 8 },
    eth: { name: 'Ethereum', symbol: 'ETH', color: '#627eea', icon: 'Ξ', decimals: 18 },
    ltc: { name: 'Litecoin', symbol: 'LTC', color: '#bfbbbb', icon: 'Ł', decimals: 8 },
    sol: { name: 'Solana',   symbol: 'SOL', color: '#9945ff', icon: '◎', decimals: 9 }
  };

  /* ── Price conversion via CoinGecko (free, no key) ── */
  var _priceCache = {};
  var _priceCacheTime = 0;

  function getPrices(callback) {
    var now = Date.now();
    if (now - _priceCacheTime < 120000 && Object.keys(_priceCache).length) {
      callback(null, _priceCache);
      return;
    }
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,solana&vs_currencies=eur,usd,gbp')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        _priceCache = {
          btc: { eur: data.bitcoin.eur, usd: data.bitcoin.usd, gbp: data.bitcoin.gbp },
          eth: { eur: data.ethereum.eur, usd: data.ethereum.usd, gbp: data.ethereum.gbp },
          ltc: { eur: data.litecoin.eur, usd: data.litecoin.usd, gbp: data.litecoin.gbp },
          sol: { eur: data.solana.eur, usd: data.solana.usd, gbp: data.solana.gbp }
        };
        _priceCacheTime = Date.now();
        callback(null, _priceCache);
      })
      .catch(function (e) { callback(e, null); });
  }

  function convertToCrypto(fiatAmount, currency, cryptoKey, callback) {
    getPrices(function (err, prices) {
      if (err || !prices || !prices[cryptoKey]) {
        callback(err || new Error('Price unavailable'), null);
        return;
      }
      var cur = (currency || 'EUR').toLowerCase();
      var rate = prices[cryptoKey][cur] || prices[cryptoKey].eur;
      if (!rate) { callback(new Error('No rate'), null); return; }
      var amount = fiatAmount / rate;
      /* Add tiny unique offset to identify this order (last 4 digits vary) */
      var offset = (Math.floor(Math.random() * 9000) + 1000) * Math.pow(10, -CRYPTO_INFO[cryptoKey].decimals + 4);
      var finalAmount = Math.round((amount + offset) * Math.pow(10, CRYPTO_INFO[cryptoKey].decimals)) / Math.pow(10, CRYPTO_INFO[cryptoKey].decimals);
      callback(null, { amount: finalAmount, rate: rate });
    });
  }

  /* ── Blockchain polling ── */

  function checkBTC(address, expectedAmount, afterMs, callback) {
    /* BlockCypher free tier — no key needed for ~100 req/hr */
    fetch('https://api.blockcypher.com/v1/btc/main/addrs/' + encodeURIComponent(address) + '/full?limit=10&token=')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var txs = data.txs || [];
        for (var i = 0; i < txs.length; i++) {
          var tx = txs[i];
          var receivedMs = tx.received ? new Date(tx.received).getTime() : 0;
          if (receivedMs < afterMs - 300000) continue; // allow 5min before order
          var confs = tx.confirmations || 0;
          var outputs = tx.outputs || [];
          for (var j = 0; j < outputs.length; j++) {
            var out = outputs[j];
            var addrs = out.addresses || [];
            if (addrs.indexOf(address) !== -1) {
              var amountBTC = (out.value || 0) / 1e8;
              var diff = Math.abs(amountBTC - expectedAmount);
              if (diff < 0.0002) { // 0.02% tolerance
                callback(null, { confirmed: confs >= MIN_CONFIRMATIONS.btc, txHash: tx.hash, amount: amountBTC, confirmations: confs });
                return;
              }
            }
          }
        }
        callback(null, { confirmed: false });
      })
      .catch(function (e) { callback(e, null); });
  }

  function checkETH(address, expectedAmount, afterMs, callback) {
    /* Blockscout — free, no API key needed */
    var url = 'https://eth.blockscout.com/api?module=account&action=txlist&address=' + encodeURIComponent(address) + '&sort=desc&page=1&offset=20';
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var txs = (data.result && Array.isArray(data.result)) ? data.result : [];
        for (var i = 0; i < txs.length; i++) {
          var tx = txs[i];
          var txMs = parseInt(tx.timeStamp || '0', 10) * 1000;
          if (txMs < afterMs - 300000) continue;
          if (tx.isError === '1') continue;
          if ((tx.to || '').toLowerCase() !== address.toLowerCase()) continue;
          var amountETH = parseInt(tx.value || '0', 10) / 1e18;
          var diff = Math.abs(amountETH - expectedAmount);
          if (diff < expectedAmount * 0.005) { // 0.5% tolerance
            var confs = parseInt(tx.confirmations || '0', 10);
            callback(null, { confirmed: confs >= MIN_CONFIRMATIONS.eth, txHash: tx.hash, amount: amountETH, confirmations: confs });
            return;
          }
        }
        callback(null, { confirmed: false });
      })
      .catch(function (e) { callback(e, null); });
  }

  function checkLTC(address, expectedAmount, afterMs, callback) {
    fetch('https://api.blockcypher.com/v1/ltc/main/addrs/' + encodeURIComponent(address) + '/full?limit=10')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var txs = data.txs || [];
        for (var i = 0; i < txs.length; i++) {
          var tx = txs[i];
          var receivedMs = tx.received ? new Date(tx.received).getTime() : 0;
          if (receivedMs < afterMs - 300000) continue;
          var confs = tx.confirmations || 0;
          var outputs = tx.outputs || [];
          for (var j = 0; j < outputs.length; j++) {
            var out = outputs[j];
            var addrs = out.addresses || [];
            if (addrs.indexOf(address) !== -1) {
              var amountLTC = (out.value || 0) / 1e8;
              var diff = Math.abs(amountLTC - expectedAmount);
              if (diff < 0.0002) {
                callback(null, { confirmed: confs >= MIN_CONFIRMATIONS.ltc, txHash: tx.hash, amount: amountLTC, confirmations: confs });
                return;
              }
            }
          }
        }
        callback(null, { confirmed: false });
      })
      .catch(function (e) { callback(e, null); });
  }

  function checkSOL(address, expectedAmount, afterMs, callback) {
    /* Solana public RPC — free */
    var body = JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'getSignaturesForAddress',
      params: [address, { limit: 10 }]
    });
    fetch('https://api.mainnet-beta.solana.com', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
      .then(function (r) { return r.json(); })
      .then(function (sigData) {
        var sigs = (sigData.result || []);
        if (!sigs.length) { callback(null, { confirmed: false }); return; }
        /* Check each recent signature */
        var checks = sigs.filter(function (s) {
          return s.blockTime && (s.blockTime * 1000) >= (afterMs - 300000);
        }).slice(0, 5);
        if (!checks.length) { callback(null, { confirmed: false }); return; }
        var pending = checks.length;
        var found = false;
        checks.forEach(function (sig) {
          if (found) return;
          var txBody = JSON.stringify({
            jsonrpc: '2.0', id: 1,
            method: 'getTransaction',
            params: [sig.signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }]
          });
          fetch('https://api.mainnet-beta.solana.com', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: txBody })
            .then(function (r) { return r.json(); })
            .then(function (txData) {
              if (found) return;
              var tx = txData.result;
              if (!tx) { pending--; if (!pending) callback(null, { confirmed: false }); return; }
              var meta = tx.meta || {};
              if (meta.err) { pending--; if (!pending) callback(null, { confirmed: false }); return; }
              /* Parse SOL transfer to our address */
              var accs = (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys) || [];
              var addrIdx = accs.indexOf(address);
              if (addrIdx !== -1) {
                var preBal  = (meta.preBalances  || [])[addrIdx] || 0;
                var postBal = (meta.postBalances || [])[addrIdx] || 0;
                var receivedLamports = postBal - preBal;
                if (receivedLamports > 0) {
                  var amountSOL = receivedLamports / 1e9;
                  var diff = Math.abs(amountSOL - expectedAmount);
                  if (diff < expectedAmount * 0.01) { // 1% tolerance
                    found = true;
                    callback(null, { confirmed: true, txHash: sig.signature, amount: amountSOL, confirmations: 1 });
                    return;
                  }
                }
              }
              pending--;
              if (!pending && !found) callback(null, { confirmed: false });
            })
            .catch(function () { pending--; if (!pending && !found) callback(null, { confirmed: false }); });
        });
      })
      .catch(function (e) { callback(e, null); });
  }

  function pollBlockchain(cryptoKey, address, expectedAmount, afterMs, callback) {
    if (cryptoKey === 'btc') checkBTC(address, expectedAmount, afterMs, callback);
    else if (cryptoKey === 'eth') checkETH(address, expectedAmount, afterMs, callback);
    else if (cryptoKey === 'ltc') checkLTC(address, expectedAmount, afterMs, callback);
    else if (cryptoKey === 'sol') checkSOL(address, expectedAmount, afterMs, callback);
    else callback(new Error('Unknown crypto'), null);
  }

  /* ── QR Code generation (inline, no dependency) ── */
  /* Minimal QR via API — uses goqr.me free service */
  function generateQRDataURL(text, size, callback) {
    var url = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(text) + '&bgcolor=1a1a1a&color=ffffff&format=png';
    /* We use an img tag, return the URL directly */
    callback(url);
  }

  /* ── Crypto Checkout Modal ── */

  var _cryptoState = null; // { cryptoKey, address, expectedAmount, orderMs, pollTimer, timeoutTimer }

  function stopPolling() {
    if (_cryptoState) {
      if (_cryptoState.pollTimer)    clearInterval(_cryptoState.pollTimer);
      if (_cryptoState.timeoutTimer) clearTimeout(_cryptoState.timeoutTimer);
    }
    _cryptoState = null;
  }

  /* Inject crypto modal HTML */
  var _cryptoModalHTML = [
    '<div class="cry-overlay" id="cryOverlay"></div>',
    '<div class="cry-modal" id="cryModal">',
      '<div class="cry-hdr">',
        '<div class="cry-hdr__left">',
          '<span class="cry-hdr__shield"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>',
          '<span>Crypto Payment</span>',
        '</div>',
        '<button class="cry-close" id="cryClose">&#x2715;</button>',
      '</div>',

      /* Step 1: Select crypto */
      '<div id="cryStep1">',
        '<div class="cry-step-hdr">Select your cryptocurrency</div>',
        '<div class="cry-coins" id="cryCoins">',
          '<button class="cry-coin" data-coin="btc">',
            '<div class="cry-coin__icon" style="color:#f7931a;">₿</div>',
            '<div class="cry-coin__name">Bitcoin</div>',
            '<div class="cry-coin__sym">BTC</div>',
          '</button>',
          '<button class="cry-coin" data-coin="eth">',
            '<div class="cry-coin__icon" style="color:#627eea;">Ξ</div>',
            '<div class="cry-coin__name">Ethereum</div>',
            '<div class="cry-coin__sym">ETH</div>',
          '</button>',
          '<button class="cry-coin" data-coin="ltc">',
            '<div class="cry-coin__icon" style="color:#bfbbbb;">Ł</div>',
            '<div class="cry-coin__name">Litecoin</div>',
            '<div class="cry-coin__sym">LTC</div>',
          '</button>',
          '<button class="cry-coin" data-coin="sol">',
            '<div class="cry-coin__icon" style="color:#9945ff;">◎</div>',
            '<div class="cry-coin__name">Solana</div>',
            '<div class="cry-coin__sym">SOL</div>',
          '</button>',
        '</div>',
        '<div class="cry-unavail" id="cryUnavail" style="display:none;">',
          'This coin is not configured. Please contact support or choose another.',
        '</div>',
        '<div class="cry-loading" id="cryStep1Loading" style="display:none;">',
          '<div class="cry-spinner"></div>',
          '<span>Fetching live rate…</span>',
        '</div>',
      '</div>',

      /* Step 2: Payment screen */
      '<div id="cryStep2" style="display:none;">',
        '<div class="cry-pay-top">',
          '<div class="cry-pay-coin" id="cryPayCoin"></div>',
          '<div class="cry-pay-timer-wrap">',
            '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            '<span id="cryTimer">30:00</span>',
          '</div>',
        '</div>',

        '<div class="cry-pay-body">',
          '<div class="cry-qr-wrap">',
            '<img class="cry-qr" id="cryQR" src="" alt="QR" />',
            '<div class="cry-qr-scan">Scan to pay</div>',
          '</div>',

          '<div class="cry-pay-details">',
            '<div class="cry-detail-row">',
              '<span class="cry-detail-lbl">Send exactly</span>',
              '<div class="cry-amount-box">',
                '<span class="cry-amount-val" id="cryAmountVal"></span>',
                '<button class="cry-copy-btn" id="cryAmtCopy" title="Copy amount">',
                  '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
                '</button>',
              '</div>',
            '</div>',
            '<div class="cry-detail-row">',
              '<span class="cry-detail-lbl">To address</span>',
              '<div class="cry-addr-box">',
                '<span class="cry-addr-val" id="cryAddrVal"></span>',
                '<button class="cry-copy-btn" id="cryAddrCopy" title="Copy address">',
                  '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
                '</button>',
              '</div>',
            '</div>',
            '<div class="cry-warn">',
              '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
              'Send the <strong>exact amount</strong>. We verify transactions automatically.',
            '</div>',
          '</div>',
        '</div>',

        '<div class="cry-status" id="cryStatus">',
          '<div class="cry-status__pulse"></div>',
          '<span id="cryStatusTxt">Waiting for payment…</span>',
        '</div>',

        '<div class="cry-progress-bar"><div class="cry-progress-fill" id="cryProgressFill"></div></div>',

        '<button class="cry-back-btn" id="cryBackBtn">&#x2190; Choose different coin</button>',
      '</div>',

      /* Step 3: Success */
      '<div id="cryStep3" style="display:none;">',
        '<div class="cry-success">',
          '<div class="cry-success__icon">✓</div>',
          '<div class="cry-success__title">Payment Confirmed!</div>',
          '<div class="cry-success__sub">Your product is ready below.</div>',
          '<div class="cry-tx-row">',
            '<span class="cry-tx-lbl">Transaction</span>',
            '<span class="cry-tx-val" id="cryTxHash"></span>',
          '</div>',
          '<div class="cry-inv-box">',
            '<div class="cry-inv-meta">',
              '<div class="cry-inv-lbl">Invoice ID</div>',
              '<div class="cry-inv-val" id="cryInvId"></div>',
            '</div>',
            '<button class="cry-copy-btn" id="cryInvCopy">Copy</button>',
          '</div>',
          '<div class="cry-deliv-box">',
            '<div class="cry-deliv-lbl">Your Product</div>',
            '<div class="cry-deliv-val" id="cryDelivVal"></div>',
            '<button class="cry-reveal-btn" id="cryRevealBtn">&#128065; Click to reveal</button>',
          '</div>',
          '<button class="cry-shop-btn" id="cryShopBtn">&#x2190; Back to Shop</button>',
        '</div>',
      '</div>',

    '</div>'
  ].join('');

  document.body.insertAdjacentHTML('beforeend', _cryptoModalHTML);

  /* ── Event handlers ── */
  document.getElementById('cryClose').addEventListener('click', closeCryptoModal);
  document.getElementById('cryOverlay').addEventListener('click', closeCryptoModal);
  document.getElementById('cryBackBtn').addEventListener('click', function () { showStep(1); stopPolling(); });
  document.getElementById('cryShopBtn').addEventListener('click', function () { window.location.href = 'preview-products.html'; });

  document.getElementById('cryInvCopy').addEventListener('click', function () {
    var v = document.getElementById('cryInvId').textContent;
    copyText(v, this);
  });
  document.getElementById('cryRevealBtn').addEventListener('click', function () {
    var el = document.getElementById('cryDelivVal');
    var shown = el.classList.toggle('shown');
    this.textContent = shown ? '🔒 Hide' : '👁 Click to reveal';
  });

  /* Coin selection */
  document.querySelectorAll('.cry-coin').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var coin = btn.dataset.coin;
      selectCoin(coin);
    });
  });

  function copyText(text, btn) {
    try {
      navigator.clipboard.writeText(text).then(function () {
        var orig = btn.innerHTML;
        btn.innerHTML = '✓';
        setTimeout(function () { btn.innerHTML = orig; }, 2000);
      });
    } catch (e) {}
  }

  document.getElementById('cryAmtCopy').addEventListener('click', function () {
    var v = document.getElementById('cryAmountVal').textContent;
    copyText(v, this);
  });
  document.getElementById('cryAddrCopy').addEventListener('click', function () {
    var v = document.getElementById('cryAddrVal').textContent;
    copyText(v, this);
  });

  /* ── Modal open / close ── */
  function openCryptoModal() {
    showStep(1);
    document.getElementById('cryUnavail').style.display = 'none';
    document.getElementById('cryStep1Loading').style.display = 'none';
    document.querySelectorAll('.cry-coin').forEach(function (b) { b.classList.remove('cry-coin--active', 'cry-coin--disabled'); });
    document.getElementById('cryOverlay').classList.add('open');
    document.getElementById('cryModal').classList.add('open');
    document.body.style.overflow = 'hidden';

    /* Disable coins that have no configured address */
    var payments = getConfiguredPayments();
    ['btc', 'eth', 'ltc', 'sol'].forEach(function (coin) {
      var hasAddr = payments[coin] && payments[coin].enabled && payments[coin].address;
      var btn = document.querySelector('.cry-coin[data-coin="' + coin + '"]');
      if (btn && !hasAddr) btn.classList.add('cry-coin--disabled');
    });
  }

  function closeCryptoModal() {
    stopPolling();
    document.getElementById('cryOverlay').classList.remove('open');
    document.getElementById('cryModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function showStep(n) {
    [1, 2, 3].forEach(function (i) {
      document.getElementById('cryStep' + i).style.display = i === n ? '' : 'none';
    });
  }

  function getConfiguredPayments() {
    try { return JSON.parse(localStorage.getItem('nexus_payments')) || {}; } catch (e) { return {}; }
  }

  /* ── Timer display ── */
  function startTimer(durationMs, onEnd) {
    var end = Date.now() + durationMs;
    var el = document.getElementById('cryTimer');
    var fill = document.getElementById('cryProgressFill');
    var timerInt = setInterval(function () {
      var left = end - Date.now();
      if (left <= 0) { clearInterval(timerInt); if (el) el.textContent = '0:00'; if (onEnd) onEnd(); return; }
      var m = Math.floor(left / 60000);
      var s = Math.floor((left % 60000) / 1000);
      if (el) el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
      var pct = (left / durationMs) * 100;
      if (fill) fill.style.width = pct + '%';
    }, 1000);
    return timerInt;
  }

  /* ── Select coin and start polling ── */
  function selectCoin(coin) {
    var payments = getConfiguredPayments();
    var cfg = payments[coin];

    document.getElementById('cryUnavail').style.display = 'none';

    if (!cfg || !cfg.enabled || !cfg.address) {
      document.getElementById('cryUnavail').style.display = '';
      return;
    }

    /* Get current product info from the checkout state */
    var product = window._nexusCryptoProduct;
    if (!product) return;

    document.getElementById('cryStep1Loading').style.display = '';
    document.querySelectorAll('.cry-coin').forEach(function (b) { b.classList.remove('cry-coin--active'); });
    document.querySelector('.cry-coin[data-coin="' + coin + '"]').classList.add('cry-coin--active');

    var currency = 'EUR'; /* paiements en euros */

    convertToCrypto(product.price, currency, coin, function (err, result) {
      document.getElementById('cryStep1Loading').style.display = 'none';
      if (err || !result) {
        document.getElementById('cryUnavail').textContent = 'Could not fetch live rate. Please try again.';
        document.getElementById('cryUnavail').style.display = '';
        return;
      }

      var info = CRYPTO_INFO[coin];
      var address = cfg.address;
      var amount = result.amount;
      var orderMs = Date.now();

      /* Build URI for QR code */
      var uri = '';
      if (coin === 'btc') uri = 'bitcoin:' + address + '?amount=' + amount;
      else if (coin === 'eth') uri = 'ethereum:' + address + '?value=' + Math.round(amount * 1e18);
      else if (coin === 'ltc') uri = 'litecoin:' + address + '?amount=' + amount;
      else if (coin === 'sol') uri = 'solana:' + address + '?amount=' + amount;
      else uri = address;

      showStep(2);

      /* Fill step 2 UI */
      document.getElementById('cryPayCoin').innerHTML =
        '<span style="color:' + info.color + ';font-size:20px;">' + info.icon + '</span>' +
        '<span style="font-weight:700;">' + info.name + '</span>' +
        '<span class="cry-pay-sym">' + info.symbol + '</span>';

      document.getElementById('cryAmountVal').textContent = amount.toFixed(info.decimals > 6 ? 8 : info.decimals) + ' ' + info.symbol;
      document.getElementById('cryAddrVal').textContent = address;

      /* QR */
      generateQRDataURL(uri, 200, function (qrUrl) {
        var img = document.getElementById('cryQR');
        if (img) img.src = qrUrl;
      });

      /* Status */
      document.getElementById('cryStatusTxt').textContent = 'Waiting for payment…';
      document.getElementById('cryStatus').className = 'cry-status';

      /* Save pending order for possible resume */
      var pendingOrder = {
        coin: coin,
        address: address,
        amount: amount,
        orderMs: orderMs,
        productId: product.id,
        invoiceId: product.invoiceId,
        email: product.email
      };
      try { localStorage.setItem('nexus_pending_crypto', JSON.stringify(pendingOrder)); } catch (e) {}

      /* Start polling */
      stopPolling();
      var orderRef = { pollTimer: null, timeoutTimer: null };
      _cryptoState = orderRef;

      function doPoll() {
        pollBlockchain(coin, address, amount, orderMs, function (err2, result2) {
          if (!_cryptoState || _cryptoState !== orderRef) return; // cancelled
          if (err2) {
            document.getElementById('cryStatusTxt').textContent = 'Network error — retrying…';
            return;
          }
          if (!result2 || !result2.confirmed) {
            if (result2 && result2.txHash) {
              /* Transaction found but not confirmed yet */
              document.getElementById('cryStatusTxt').textContent = 'Transaction detected — waiting for confirmation (' + (result2.confirmations || 0) + ' conf)…';
              document.getElementById('cryStatus').className = 'cry-status cry-status--pending';
            }
            return;
          }
          /* Payment confirmed! */
          stopPolling();
          try { localStorage.removeItem('nexus_pending_crypto'); } catch (e) {}
          onPaymentConfirmed(result2, product);
        });
      }

      doPoll();
      orderRef.pollTimer = setInterval(doPoll, POLL_INTERVAL);

      /* Timeout */
      orderRef.timeoutTimer = setTimeout(function () {
        if (_cryptoState !== orderRef) return;
        stopPolling();
        document.getElementById('cryStatusTxt').textContent = 'Payment window expired. Please restart.';
        document.getElementById('cryStatus').className = 'cry-status cry-status--error';
        document.getElementById('cryProgressFill').style.width = '0%';
      }, PAYMENT_TIMEOUT);

      /* Start countdown timer */
      orderRef.timerInterval = startTimer(PAYMENT_TIMEOUT, function () {
        if (_cryptoState === orderRef) {
          stopPolling();
          document.getElementById('cryStatusTxt').textContent = 'Time expired. Please restart.';
        }
      });
      if (!_cryptoState) _cryptoState = orderRef;
      else Object.assign(_cryptoState, orderRef);
    });
  }

  /* ── Payment confirmed handler ── */
  function onPaymentConfirmed(txResult, product) {
    /* Deliver product */
    var invoiceId = product.invoiceId;
    var deliverable = product.deliverable || '(Contact support — invoice: ' + invoiceId + ')';

    /* Deduct stock now that payment is confirmed */
    if (typeof product._deductStock === 'function') {
      try { product._deductStock(); } catch (e) {}
    }

    /* Save order to localStorage */
    try {
      var orders = JSON.parse(localStorage.getItem('nexus_orders') || '[]');
      orders.unshift({
        id: invoiceId,
        date: new Date().toISOString(),
        email: product.email || '',
        productId: product.id,
        productName: product.name,
        productIcon: product.icon || '📦',
        price: product.price,
        currency: 'EUR',
        deliverable: deliverable,
        status: 'completed',
        paymentMethod: 'crypto',
        txHash: txResult.txHash
      });
      localStorage.setItem('nexus_orders', JSON.stringify(orders));
    } catch (e) {}

    /* Email « Your Order is Ready! » avec les identifiants (paiement confirmé). */
    if (window._nexusSendOrderEmail && product.email) {
      window._nexusSendOrderEmail(product.email, invoiceId, product.name, deliverable, 'ready');
    }

    /* Fire Discord webhook */
    try {
      var wa = JSON.parse(localStorage.getItem('nexus_webhooks') || '{}');
      var wc = wa['ORDER_CREATE'] || {};
      if (wc.url) {
        fetch(wc.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '💎 Crypto Payment Confirmed',
              color: 0x57F287,
              fields: [
                { name: 'Invoice', value: invoiceId, inline: true },
                { name: 'Product', value: (product.icon || '📦') + ' ' + product.name, inline: true },
                { name: 'TX Hash', value: txResult.txHash || '—', inline: false }
              ],
              footer: { text: 'FlashShp Store' },
              timestamp: new Date().toISOString()
            }]
          })
        }).catch(function () {});
      }
    } catch (e) {}

    /* Show success state */
    showStep(3);
    document.getElementById('cryTxHash').textContent = (txResult.txHash || '').substring(0, 20) + '…';
    document.getElementById('cryInvId').textContent = invoiceId;
    document.getElementById('cryDelivVal').textContent = deliverable;
    document.getElementById('cryDelivVal').classList.remove('shown');
    document.getElementById('cryRevealBtn').textContent = '👁 Click to reveal';
  }

  /* ── Public API ── */
  window._nexusOpenCryptoCheckout = function (product) {
    /* product: { id, name, icon, price, currency, invoiceId, email, deliverable } */
    window._nexusCryptoProduct = product;
    /* Email « commande reçue / en attente de paiement » dès l'ouverture du
       paiement crypto (l'ordre est créé, on attend la confirmation blockchain). */
    if (window._nexusSendOrderEmail && product && product.email) {
      window._nexusSendOrderEmail(product.email, product.invoiceId, product.name, '', 'created');
    }
    openCryptoModal();
  };

  window._nexusCloseCryptoCheckout = closeCryptoModal;
}());
