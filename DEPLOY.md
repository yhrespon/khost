# Déploiement sur VPS (Ubuntu/Debian)

## 1. Prérequis sur le VPS

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
node -v   # doit afficher v18+ (idéalement v20)
sudo npm install -g pm2
```

## 2. Envoyer le projet sur le VPS

Depuis ta machine :
```bash
scp khost.tar.gz user@ton-ip-vps:/home/user/
```
Sur le VPS :
```bash
cd /home/user
tar -xzf khost.tar.gz
cd khost   # (ou le nom du dossier extrait)
```

## 3. Configuration

```bash
cp .env.example .env
nano .env
```
Remplis au minimum :
- `SESSION_SECRET` — génère une valeur aléatoire, ex : `openssl rand -hex 32`
- `APP_URL` — ton domaine ou `http://IP_DU_VPS:PORT` si pas encore de nom de domaine
- `EMAIL_USER` / `EMAIL_PASS` — pour l'envoi d'emails (mot de passe d'application Gmail)
- `FUSION_MERCHANT_ID`, `FUSION_PAY_SLUG`, `FUSION_ALLOWED_IP`, `FUSION_WEBHOOK_SECRET` — pour les paiements Money Fusion
- `PTERO_URL`, `PTERO_API_KEY` — si tu utilises Pterodactyl pour héberger les bots
- `ADMIN_ACCOUNTS` — recommandé pour ne pas garder les identifiants admin par défaut

**Important** : le fichier `.env` ne doit jamais être commité ni partagé.

## 4. Installer les dépendances

```bash
npm install --omit=dev
```

## 5. Démarrer avec PM2 (recommandé — redémarre automatiquement si crash ou reboot)

```bash
npm run pm2:start
pm2 save
pm2 startup   # suit les instructions affichées pour démarrer au boot du VPS
```

Commandes utiles :
```bash
pm2 logs khost      # voir les logs en direct
pm2 restart khost   # redémarrer après une modification
pm2 stop khost      # arrêter
pm2 status          # état du process
```

## 6. Reverse proxy Nginx + HTTPS (recommandé)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

`/etc/nginx/sites-available/khost` :
```nginx
server {
    listen 80;
    server_name ton-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:20395;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/khost /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ton-domaine.com
```

Une fois le HTTPS actif via Nginx/Certbot, mets à jour dans `.env` :
```
APP_URL=https://ton-domaine.com
```

## 7. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```
(Le port applicatif, ex. 20395, n'a pas besoin d'être ouvert publiquement si Nginx fait le proxy en local.)

## 8. Vérification

```bash
curl http://127.0.0.1:20395/health
# → {"status":"ok","uptime":...}
```

## Points de sécurité à ne pas oublier

- Change les mots de passe admin par défaut (`ADMIN_ACCOUNTS` dans `.env`) dès le premier démarrage.
- Configure `FUSION_ALLOWED_IP` avec la vraie IP de Money Fusion, sinon le webhook de paiement refusera toutes les requêtes.
- Vérifie le slug de paiement Money Fusion (`FUSION_PAY_SLUG`) sur ton dashboard — une valeur incorrecte empêchera les paiements d'aboutir.
- Sauvegarde régulièrement `users.json`, `panels.json`, `tickets.json`, `services.json` (données de l'app, pas versionnées dans git).
