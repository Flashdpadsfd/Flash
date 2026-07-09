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
    ' INDEX idx_email (email)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );
  await p.query(
    'CREATE TABLE IF NOT EXISTS otp_codes (' +
    ' email VARCHAR(255) NOT NULL PRIMARY KEY,' +
    ' code VARCHAR(12),' +
    ' attempts INT DEFAULT 0,' +
    ' expires_at DATETIME NULL,' +
    ' cooldown_until DATETIME NULL' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );
  ensured = true;
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

/* ── Codes de connexion par email (OTP) ── */

/* Enregistre un code (expire dans 600 s), en réinitialisant les essais. */
async function saveOtp(email, code) {
  await ensure();
  var exp = new Date(Date.now() + 600 * 1000);
  await getPool().query(
    'INSERT INTO otp_codes (email, code, attempts, expires_at) VALUES (?, ?, 0, ?)' +
    ' ON DUPLICATE KEY UPDATE code=VALUES(code), attempts=0, expires_at=VALUES(expires_at)',
    [email, String(code), exp]
  );
}

/* Renvoie { code, attempts } si un code valide (non expiré) existe, sinon null. */
async function getOtp(email) {
  await ensure();
  var res = await getPool().query('SELECT code, attempts, expires_at FROM otp_codes WHERE email = ? LIMIT 1', [email]);
  var r = res[0] && res[0][0];
  if (!r || !r.code || !r.expires_at) return null;
  if (new Date(r.expires_at).getTime() < Date.now()) { await deleteOtp(email); return null; }
  return { code: r.code, attempts: r.attempts || 0 };
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
  if (r && r.cooldown_until && new Date(r.cooldown_until).getTime() > now) return false;
  var until = new Date(now + ttlSec * 1000);
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
  saveOtp: saveOtp,
  getOtp: getOtp,
  bumpOtpAttempts: bumpOtpAttempts,
  deleteOtp: deleteOtp,
  checkCooldown: checkCooldown
};
