/* FlashShp — Stockage persistant sur MySQL (base Hostinger).
   =========================================================================
   Fichier préfixé « _ » → n'est jamais exposé comme route par server.js ; il
   est juste require() par les autres fonctions.

   Remplace l'ancien Upstash/Redis. Utilise un pool de connexions MySQL
   (parfait pour un serveur Node long-running comme Hostinger). Les tables sont
   créées automatiquement à la première utilisation (CREATE TABLE IF NOT EXISTS).

   Variables d'environnement (depuis le panneau MySQL de Hostinger) :
   - DB_HOST      : hôte MySQL (souvent « localhost » sur Hostinger).
   - DB_USER      : utilisateur.
   - DB_PASSWORD  : mot de passe.
   - DB_NAME      : nom de la base.
   - DB_PORT      : port (optionnel, défaut 3306).
   Si DB_HOST/DB_USER/DB_NAME manquent, available() renvoie false et tout se
   dégrade proprement (aucune erreur bloquante). */

var mysql = require('mysql2/promise');

var pool = null;
var ensured = false;

function cfg() {
  var host = process.env.DB_HOST;
  var user = process.env.DB_USER;
  var name = process.env.DB_NAME;
  if (!host || !user || !name) return null;
  return {
    host: host,
    user: user,
    password: process.env.DB_PASSWORD || '',
    database: name,
    port: Number(process.env.DB_PORT || 3306)
  };
}

function available() { return !!cfg(); }

function getPool() {
  if (pool) return pool;
  var c = cfg();
  if (!c) return null;
  pool = mysql.createPool({
    host: c.host, user: c.user, password: c.password, database: c.database, port: c.port,
    waitForConnections: true, connectionLimit: 5, charset: 'utf8mb4'
  });
  return pool;
}

/* Crée les tables si besoin (idempotent). */
async function ensure() {
  if (ensured) return;
  var p = getPool();
  if (!p) return;
  await p.query(
    'CREATE TABLE IF NOT EXISTS clients (' +
    ' id VARCHAR(190) NOT NULL PRIMARY KEY,' +
    ' username VARCHAR(255),' +
    ' avatar TEXT,' +
    ' email VARCHAR(255),' +
    ' provider VARCHAR(32),' +
    ' first_seen DATETIME,' +
    ' last_seen DATETIME,' +
    ' login_count INT DEFAULT 0,' +
    ' password_hash VARCHAR(255) NULL,' +      /* scrypt$<sel>$<hash> — voir _password.js. NULL = pas de mdp (compte email-only) */
    ' login_attempts INT DEFAULT 0,' +         /* essais de connexion par mot de passe échoués d'affilée */
    ' login_locked_until BIGINT NULL,' +       /* epoch ms — verrouillage temporaire anti-bruteforce */
    ' INDEX idx_email (email)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );
  await p.query(
    'CREATE TABLE IF NOT EXISTS otp_codes (' +
    ' email VARCHAR(255) NOT NULL PRIMARY KEY,' +
    ' code VARCHAR(12),' +
    ' attempts INT DEFAULT 0,' +
    ' expires_at BIGINT NULL,' +          /* epoch ms (pas DATETIME : évite les bugs de fuseau) */
    ' cooldown_until BIGINT NULL,' +      /* epoch ms */
    ' pending_password_hash VARCHAR(255) NULL' +  /* inscription par mot de passe : le hash n'est activé qu'une fois le code vérifié (preuve de propriété de l'email) */
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );

  /* Migration : bases existantes créées avant l'ajout du mot de passe — ajoute
     les colonnes manquantes sans jamais toucher aux données déjà là. */
  try {
    var colC = await p.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS" +
      " WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clients' AND COLUMN_NAME = 'password_hash'"
    );
    if (!colC[0].length) {
      await p.query('ALTER TABLE clients ADD COLUMN password_hash VARCHAR(255) NULL, ADD COLUMN login_attempts INT DEFAULT 0, ADD COLUMN login_locked_until BIGINT NULL');
    }
  } catch (e) { console.error('[FlashShp] clients password migration skipped:', e && e.message); }
  try {
    var colO = await p.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS" +
      " WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'otp_codes' AND COLUMN_NAME = 'pending_password_hash'"
    );
    if (!colO[0].length) {
      await p.query('ALTER TABLE otp_codes ADD COLUMN pending_password_hash VARCHAR(255) NULL');
    }
  } catch (e) { console.error('[FlashShp] otp_codes pending_password migration skipped:', e && e.message); }

  /* Migration des anciennes bases : expires_at/cooldown_until étaient en
     DATETIME. Le round-trip mysql2↔MySQL relisait la valeur comme « passée »,
     donc les bons codes étaient rejetés « expirés ». On passe en BIGINT (epoch
     ms). On ne migre qu'une fois (si la colonne est encore de type datetime),
     puis on vide la table (codes éphémères, sans valeur après conversion). */
  try {
    var col = await p.query(
      "SELECT DATA_TYPE FROM information_schema.COLUMNS" +
      " WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'otp_codes' AND COLUMN_NAME = 'expires_at'"
    );
    var dt = col[0] && col[0][0] && col[0][0].DATA_TYPE;
    if (dt && String(dt).toLowerCase() !== 'bigint') {
      await p.query('ALTER TABLE otp_codes MODIFY COLUMN expires_at BIGINT NULL, MODIFY COLUMN cooldown_until BIGINT NULL');
      await p.query('DELETE FROM otp_codes');
    }
  } catch (e) { console.error('[FlashShp] otp_codes migration skipped:', e && e.message); }

  /* Contenu de la boutique (produits, catégories, textes…) — voir plus bas.
     Un simple clé → JSON : c'est exactement la forme qu'avait localStorage,
     donc l'admin et la boutique gardent leur code de lecture/écriture. */
  await p.query(
    'CREATE TABLE IF NOT EXISTS site_content (' +
    ' k VARCHAR(64) NOT NULL PRIMARY KEY,' +
    ' v LONGTEXT,' +                          /* JSON sérialisé */
    ' updated_at DATETIME' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );

  ensured = true;
}

/* ── Contenu de la boutique ──
   Jusqu'ici, produits/catégories/textes ne vivaient QUE dans le localStorage du
   navigateur de l'admin : les visiteurs voyaient les valeurs codées en dur dans
   assets/main.js, jamais les modifications. Ces trois fonctions déplacent ce
   contenu côté serveur, pour qu'il soit enfin commun à tout le monde. */

/* Lit plusieurs clés d'un coup → { clé: <valeur JSON décodée> }.
   `keys` vide/absent = tout le contenu. */
async function getContent(keys) {
  if (!available()) return {};
  await ensure();
  var rows;
  if (Array.isArray(keys) && keys.length) {
    var marks = keys.map(function () { return '?'; }).join(',');
    rows = await getPool().query('SELECT k, v FROM site_content WHERE k IN (' + marks + ')', keys);
  } else {
    rows = await getPool().query('SELECT k, v FROM site_content');
  }
  var out = {};
  (rows[0] || []).forEach(function (r) {
    /* Une ligne illisible ne doit pas faire échouer toute la page. */
    try { out[r.k] = JSON.parse(r.v); } catch (e) { /* ignorée */ }
  });
  return out;
}

/* Écrit une clé (valeur sérialisée en JSON). */
async function setContent(key, value) {
  if (!available()) return false;
  await ensure();
  await getPool().query(
    'INSERT INTO site_content (k, v, updated_at) VALUES (?, ?, ?)' +
    ' ON DUPLICATE KEY UPDATE v = VALUES(v), updated_at = VALUES(updated_at)',
    [String(key), JSON.stringify(value === undefined ? null : value), new Date()]
  );
  return true;
}

/* Date de dernière modification, tous contenus confondus (pour les caches). */
async function contentUpdatedAt() {
  if (!available()) return null;
  await ensure();
  var rows = await getPool().query('SELECT MAX(updated_at) AS m FROM site_content');
  return (rows[0] && rows[0][0] && rows[0][0].m) || null;
}

/* ── Clients (connexions) ── */

/* Enregistre/actualise un client connecté (Discord OU email).
   u = { id, username, avatar, email, provider }. Best-effort. */
async function recordClient(u) {
  if (!available() || !u || !u.id) return;
  await ensure();
  var now = new Date();
  await getPool().query(
    'INSERT INTO clients (id, username, avatar, email, provider, first_seen, last_seen, login_count)' +
    ' VALUES (?, ?, ?, ?, ?, ?, ?, 1)' +
    ' ON DUPLICATE KEY UPDATE username=VALUES(username), avatar=VALUES(avatar), email=VALUES(email),' +
    ' provider=VALUES(provider), last_seen=VALUES(last_seen), login_count=login_count+1',
    [String(u.id), u.username || 'Client', u.avatar || null,
     String(u.email || '').toLowerCase(), u.provider || 'discord', now, now]
  );
}

var CLIENT_COLS =
  'id, username, avatar, email, provider,' +
  ' first_seen AS firstSeen, last_seen AS lastSeen, login_count AS loginCount';

/* Liste tous les clients, du plus récemment connecté au plus ancien. */
async function listClients() {
  if (!available()) return [];
  await ensure();
  var res = await getPool().query('SELECT ' + CLIENT_COLS + ' FROM clients ORDER BY last_seen DESC');
  return res[0] || [];
}

/* Détail d'un client par id. */
async function getClient(id) {
  if (!available()) return null;
  await ensure();
  var res = await getPool().query('SELECT ' + CLIENT_COLS + ' FROM clients WHERE id = ? LIMIT 1', [String(id)]);
  return (res[0] && res[0][0]) || null;
}

/* ── Authentification par mot de passe ── */

/* Client par email, avec les champs propres à l'auth par mot de passe (jamais
   exposés via listClients/getClient — ceux-ci alimentent le panneau admin). */
async function getClientByEmail(email) {
  if (!available()) return null;
  await ensure();
  var res = await getPool().query(
    'SELECT id, username, avatar, email, provider, password_hash AS passwordHash,' +
    ' login_attempts AS loginAttempts, login_locked_until AS loginLockedUntil' +
    ' FROM clients WHERE email = ? LIMIT 1',
    [String(email).toLowerCase()]
  );
  return (res[0] && res[0][0]) || null;
}

/* Active/replace le mot de passe d'un compte (email prouvé par code au
   préalable — voir auth-email-verify.js). Crée la ligne client si besoin. */
async function setClientPassword(email, passwordHash) {
  if (!available()) return;
  await ensure();
  var lower = String(email).toLowerCase();
  var id = 'email:' + lower;
  var now = new Date();
  await getPool().query(
    'INSERT INTO clients (id, username, avatar, email, provider, first_seen, last_seen, login_count, password_hash)' +
    ' VALUES (?, ?, NULL, ?, ?, ?, ?, 0, ?)' +
    ' ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
    [id, lower.split('@')[0] || 'Client', lower, 'email', now, now, passwordHash]
  );
}

/* Comptabilise une tentative de connexion par mot de passe : succès → remet
   le compteur à zéro et met à jour last_seen/login_count (comme recordClient) ;
   échec → incrémente, et verrouille 15 min au 5e essai raté d'affilée. */
async function recordPasswordLoginResult(email, success) {
  if (!available()) return;
  await ensure();
  var p = getPool();
  var lower = String(email).toLowerCase();
  if (success) {
    await p.query(
      'UPDATE clients SET login_attempts = 0, login_locked_until = NULL, last_seen = ?, login_count = login_count + 1 WHERE email = ?',
      [new Date(), lower]
    );
  } else {
    var res = await p.query('SELECT login_attempts FROM clients WHERE email = ? LIMIT 1', [lower]);
    var attempts = ((res[0] && res[0][0] && res[0][0].login_attempts) || 0) + 1;
    var lockUntil = attempts >= 5 ? (Date.now() + 15 * 60 * 1000) : null;
    await p.query('UPDATE clients SET login_attempts = ?, login_locked_until = ? WHERE email = ?', [attempts, lockUntil, lower]);
  }
}

/* ── Codes de connexion par email (OTP) ── */

/* Enregistre un code (expire dans 600 s), en réinitialisant les essais.
   pendingPasswordHash (optionnel) : inscription par mot de passe — n'est
   activé sur le compte qu'une fois ce code vérifié (voir auth-email-verify.js). */
async function saveOtp(email, code, pendingPasswordHash) {
  await ensure();
  var exp = Date.now() + 600 * 1000;   /* epoch ms */
  await getPool().query(
    'INSERT INTO otp_codes (email, code, attempts, expires_at, pending_password_hash) VALUES (?, ?, 0, ?, ?)' +
    ' ON DUPLICATE KEY UPDATE code=VALUES(code), attempts=0, expires_at=VALUES(expires_at), pending_password_hash=VALUES(pending_password_hash)',
    [email, String(code), exp, pendingPasswordHash || null]
  );
}

/* Renvoie { code, attempts, pendingPasswordHash } si un code valide (non
   expiré) existe, sinon null. */
async function getOtp(email) {
  await ensure();
  var res = await getPool().query('SELECT code, attempts, expires_at, pending_password_hash FROM otp_codes WHERE email = ? LIMIT 1', [email]);
  var r = res[0] && res[0][0];
  if (!r || !r.code || !r.expires_at) return null;
  if (Number(r.expires_at) < Date.now()) { await deleteOtp(email); return null; }
  return { code: r.code, attempts: r.attempts || 0, pendingPasswordHash: r.pending_password_hash || null };
}

async function bumpOtpAttempts(email, attempts) {
  await ensure();
  await getPool().query('UPDATE otp_codes SET attempts = ? WHERE email = ?', [attempts, email]);
}

async function deleteOtp(email) {
  await ensure();
  await getPool().query('DELETE FROM otp_codes WHERE email = ?', [email]);
}

/* Anti-spam : renvoie true si un envoi est permis (et pose le verrou ttlSec s),
   false si un envoi récent est encore en cooldown. */
async function checkCooldown(email, ttlSec) {
  await ensure();
  var p = getPool();
  var now = Date.now();
  var res = await p.query('SELECT cooldown_until FROM otp_codes WHERE email = ? LIMIT 1', [email]);
  var r = res[0] && res[0][0];
  if (r && r.cooldown_until && Number(r.cooldown_until) > now) return false;
  var until = now + ttlSec * 1000;   /* epoch ms */
  await p.query(
    'INSERT INTO otp_codes (email, cooldown_until) VALUES (?, ?)' +
    ' ON DUPLICATE KEY UPDATE cooldown_until = VALUES(cooldown_until)',
    [email, until]
  );
  return true;
}

module.exports = {
  available: available,
  recordClient: recordClient,
  listClients: listClients,
  getClient: getClient,
  getClientByEmail: getClientByEmail,
  setClientPassword: setClientPassword,
  recordPasswordLoginResult: recordPasswordLoginResult,
  saveOtp: saveOtp,
  getOtp: getOtp,
  bumpOtpAttempts: bumpOtpAttempts,
  deleteOtp: deleteOtp,
  checkCooldown: checkCooldown,
  getContent: getContent,
  setContent: setContent,
  contentUpdatedAt: contentUpdatedAt
};
