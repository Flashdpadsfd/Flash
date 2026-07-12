#!/usr/bin/env bash
# Auto-deploy vers Vercel prod à la fin d'un tour Claude Code.
# Ne déploie QUE si le contenu du working tree a changé depuis le dernier
# déploiement (sinon les tours en lecture seule redéclencheraient un deploy,
# car l'arbre reste "dirty" tant que rien n'est commit).
#
# Marqueur + logs dans .git/ (jamais commités).

PROJ="C:/Users/FlashSh/Downloads/nexus-theme"
cd "$PROJ" 2>/dev/null || exit 0

# Signature du contenu courant : fichiers modifiés/non suivis + diff staged & unstaged.
sig="$(git status --porcelain=v1 2>/dev/null; git diff 2>/dev/null; git diff --cached 2>/dev/null)"
[ -z "$sig" ] && exit 0   # arbre propre → rien à déployer

hashfile=".git/.claude-deploy-hash"
logfile=".git/claude-deploy.log"
newhash="$(printf '%s' "$sig" | md5sum | cut -d' ' -f1)"
oldhash="$(cat "$hashfile" 2>/dev/null || echo '')"
[ "$newhash" = "$oldhash" ] && exit 0   # inchangé depuis le dernier deploy → skip

# Mode test : CLAUDE_DEPLOY_DRYRUN=1 → n'appelle pas vercel, met juste à jour le marqueur.
if [ "${CLAUDE_DEPLOY_DRYRUN:-0}" = "1" ]; then
  echo "[$(date)] DRYRUN would deploy (sig $newhash)" >> "$logfile"
  printf '%s' "$newhash" > "$hashfile"
  echo "DRYRUN: would deploy (sig $newhash)"
  exit 0
fi

echo "[$(date)] deploying (sig $newhash)…" >> "$logfile"
if vercel --prod --yes >> "$logfile" 2>&1; then
  printf '%s' "$newhash" > "$hashfile"   # marque comme déployé seulement si succès
  echo "[$(date)] deploy OK" >> "$logfile"
else
  echo "[$(date)] deploy FAILED (will retry next turn)" >> "$logfile"
fi
exit 0
