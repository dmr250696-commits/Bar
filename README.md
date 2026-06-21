# Bar ESME — Application de gestion bar

Application web autonome pour gérer un bar associatif : comptes clients à code PIN, décompte de solde, gestion du stock, et extractions PDF. Conçue pour fonctionner **100% hors-ligne** sur tablette une fois installée.

## 📲 Installer l'application sur la tablette Android

### Étape 1 — Publier le site sur GitHub Pages
1. Crée un repo GitHub (public) et mets-y tous les fichiers de ce dossier (`index.html`, `manifest.json`, `service-worker.js`, le dossier `icons/`).
2. Dans le repo : **Settings → Pages → Source : Deploy from a branch → branch `main` / dossier `/ (root)`**.
3. Attends 1-2 minutes. GitHub te donne une URL du type :
   `https://TON-PSEUDO.github.io/NOM-DU-REPO/`

### Étape 2 — Installer sur la tablette (une seule fois, avec Wi-Fi)
1. Ouvre cette URL dans **Chrome** sur la tablette Android.
2. Laisse la page se charger complètement (elle télécharge tout ce qu'il faut pour fonctionner ensuite hors-ligne : polices, génération PDF, etc.)
3. Un bandeau "Installer Bar ESME sur cette tablette" apparaît en bas → appuie sur **Installer**.
   - Si le bandeau n'apparaît pas : menu ⋮ de Chrome → **Installer l'application** (ou "Ajouter à l'écran d'accueil").
4. Une icône "Bar ESME" apparaît sur l'écran d'accueil, comme une vraie app.

### Étape 3 — Utilisation hors-ligne
À partir de maintenant, tu peux couper le Wi-Fi : l'icône sur l'écran d'accueil lance l'application en plein écran, sans barre d'adresse, et tout fonctionne normalement (identification client, achats, gestion stock, génération PDF).

> ⚠️ Important : la mise en cache hors-ligne se fait au **premier chargement avec connexion**. Si tu modifies le code plus tard sur GitHub, il faudra rouvrir l'app une fois avec Wi-Fi pour récupérer la mise à jour.

## 💾 Données et sauvegardes

Toutes les données (clients, codes, soldes, stock, historique) sont stockées **localement sur la tablette** (`localStorage` du navigateur). Rien n'est envoyé sur internet.

- Cela signifie aussi que les données sont propres à **cette tablette uniquement**. Si tu changes de tablette, il faut transférer une sauvegarde.
- Dans l'onglet **Gestionnaire**, utilise **"Télécharger la sauvegarde (.json)"** régulièrement (par exemple après chaque soirée), et conserve ce fichier ailleurs (clé USB, email, Drive...).
- En cas de souci (tablette cassée, app réinstallée, cache vidé), utilise **"Charger une sauvegarde"** pour tout restaurer.

## 🔑 Mots de passe par défaut

À changer avant la mise en service réelle — ouvre `index.html`, cherche cette ligne tout en haut du `<script>` :

```js
passwords: { admin: "admin123", manager: "gestion123" },
```

Remplace `admin123` et `gestion123` par tes propres mots de passe, puis republie sur GitHub.

## 🗂️ Structure du projet

```
.
├── index.html          → l'application complète (interface + logique)
├── manifest.json        → métadonnées PWA (nom, icône, couleur, mode plein écran)
├── service-worker.js     → gère la mise en cache pour le fonctionnement hors-ligne
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-192.png
    └── icon-maskable-512.png
```

## 🔄 Mettre à jour l'application plus tard

1. Modifie le code, repousse sur GitHub (la Page se met à jour automatiquement).
2. Sur la tablette, ouvre l'app **avec Wi-Fi activé** une fois : le service worker détecte la nouvelle version et la met en cache.
3. Ferme et rouvre l'app pour que la mise à jour s'applique.

## ⚙️ Fonctionnalités

- **Onglet Client** : identification par code à 6 chiffres (créé par le client lui-même au premier passage), achat de boissons/confiseries avec décompte de solde en temps réel, blocage automatique si solde ou stock insuffisant.
- **Onglet Administrateur** : création de comptes clients, ajout de solde.
- **Onglet Gestionnaire** : gestion du catalogue (ajout/modification/suppression de produits, prix, stock), alerte visuelle sous 5 unités, extractions PDF (stock, soldes clients, extraction mensuelle complète), sauvegarde/restauration des données.
