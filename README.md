# ⚡ Bot Discord VIP - Modération, Vocaux Innovants & Giveaways

Bot Discord tout-en-un ultra-complet, stylé et moderne, conçu pour être déployé en 1 clic sur **Railway**.

---

## 🌟 Fonctionnalités Incluses

### 🎙️ 1. Salons Vocaux Innovants
* **`=pv`** : Rend votre salon vocal actuel **privé et verrouillé** (`@everyone` ne peut plus entrer). Si vous retapez `=pv`, le salon se déverrouille automatiquement.
* **`=mv <@membre ou ID>`** ou **`=mv + <ID>`** : Téléporte instantanément un membre connecté en vocal directement dans votre salon.
* **`=dog <@membre ou ID>`** : Active le **mode Dog** ! Dès que vous changez de salon vocal, la cible est immédiatement téléportée avec vous pour vous suivre partout. Retapez `=dog <cible>` ou `=dog stop` pour arrêter.

---

### 🛡️ 2. Modération & Sécurité
* **`=bl add <@user/ID> [raison]`** : Ajoute un utilisateur sur la **Blacklist** (banni du serveur et bloqué de toutes les commandes du bot).
* **`=bl remove <@user/ID>`** : Retire un membre de la Blacklist.
* **`=bl list`** : Affiche la liste des membres blacklistés avec motifs et auteurs.
* **`=ban <@user/ID> [raison]`** : Bannit un membre (supporte aussi le Hackban d'IDs absents du serveur).
* **`=kick <@user/ID> [raison]`** : Expulse un membre du serveur.
* **`=mute <@user/ID> <durée (ex: 10m, 2h, 1d)> [raison]`** : Rend muet temporairement un membre (Timeout Discord officiel textuel + vocal).
* **`=unmute <@user/ID>`** : Rend la parole à un membre mute.
* **`=clear <1-100>`** : Nettoie rapidement les messages récents d'un salon.

---

### 🔗 3. Système Anti-Link Automatique
* Détecte automatiquement les invitations Discord (`discord.gg/...`) et liens externes non sollicités.
* Supprime immédiatement le message interdit et avertit l'auteur avec un message temporaire auto-supprimé.
* Les Administrateurs et Modérateurs bénéficient d'un passe-droit automatique.
* **`=antilink on`** / **`=antilink off`** / **`=antilink status`** : Activer ou désactiver le filtre à tout moment.

---

### 🎁 4. Giveaways & Concours Stylés
* **`=gcreate <durée> <nombre_gagnants> <lot>`** : Lance un concours interactif !
  * *Exemple :* `=gcreate 1h 1 Discord Nitro Boost`
  * Embed stylé avec compte à rebours dynamique Discord `<t:timestamp:R>`.
  * **Bouton cliquable `🎉 Participer`** qui met à jour le nombre de participants en direct sans spammer le chat.
* **`=greroll <ID_message>`** : Tire un nouveau vainqueur parmi les inscrits.
* **`=gend <ID_message>`** : Met fin immédiatement au concours.

---

### ✨ 5. Interface Graphique & Animation
* Embeds au design sombre & soigné avec badges, séparateurs et horodatages.
* **`=help`** : Dashboard avec **menu déroulant interactif (Select Menu)** permettant de naviguer entre Modération, Vocaux, Giveaways et Sécurité.
* Statuts tournants animés (Watching, Listening, Playing) changeant toutes les 12 secondes.
* Système anti-crash 24/7 intégré pour garantir une disponibilité maximale sur Railway.

---

## 🚀 Guide de Déploiement sur Railway (Étape par Étape)

### Étape 1 : Créer le Bot sur Discord Developer Portal
1. Rendez-vous sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Cliquez sur **New Application**, donnez un nom à votre bot et validez.
3. Allez dans l'onglet **Bot** à gauche :
   - Cliquez sur **Reset Token** et copiez votre **TOKEN** (gardez-le secret !).
   - Descendez à la section **Privileged Gateway Intents** et activez obligatoirement ces 3 options :
     - ✅ **Presence Intent**
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent** (Indispensable pour lire le préfixe `=`)
   - Cliquez sur **Save Changes**.
4. Allez dans l'onglet **OAuth2** > **URL Generator** :
   - Cochez `bot` et `applications.commands`.
   - Dans les permissions, cochez `Administrator` (ou toutes les permissions de gestion des salons, messages, membres, voix).
   - Copiez le lien généré en bas et collez-le dans votre navigateur pour inviter le bot sur votre serveur Discord.

---

### Étape 2 : Héberger sur Railway (Gratuit / Simple)

1. Créez un compte sur [Railway.app](https://railway.app/).
2. Déposez ce dossier sur votre compte **GitHub** (dans un dépôt privé ou public).
3. Sur Railway, cliquez sur **New Project** > **Deploy from GitHub repo** et sélectionnez votre dépôt.
4. Une fois le projet importé, cliquez sur votre service puis allez dans l'onglet **Variables** :
   - Ajoutez la variable suivante :
     - `TOKEN` : *(Collez le token de votre bot Discord copié à l'étape 1)*
   - *(Optionnel)* :
     - `PREFIX` : `=` (par défaut si non spécifié)
     - `OWNER_ID` : Votre identifiant Discord
5. Railway détecte automatiquement le fichier `package.json` et lance la commande `npm start`.
6. Votre bot passe instantanément **En Ligne 24h/24** avec les statuts animés ! 🎉

---

## 📁 Architecture des Fichiers

```text
discord-bot/
├── commands/
│   ├── general/
│   │   ├── antilink.js     # Activation/Désactivation anti-link
│   │   ├── help.js         # Menu d'aide interactif
│   │   └── ping.js         # Latence et état
│   ├── giveaway/
│   │   ├── gcreate.js      # Création concours avec bouton
│   │   ├── gend.js         # Clôture concours
│   │   └── greroll.js      # Tirage nouveau gagnant
│   ├── moderation/
│   │   ├── ban.js          # Ban & Hackban
│   │   ├── blacklist.js    # =bl add/remove/list
│   │   ├── clear.js        # Purge de messages
│   │   ├── kick.js         # Expulsion
│   │   ├── mute.js         # Tempmute (timeout)
│   │   └── unmute.js       # Rétablir la parole
│   └── voice/
│       ├── dog.js          # Mode suivi automatique (=dog)
│       ├── mv.js           # Téléportation vocale (=mv)
│       └── pv.js           # Rendre salon privé (=pv)
├── events/
│   ├── interactionCreate.js # Gestion des boutons & menus
│   ├── messageCreate.js     # Routage commandes & Anti-link
│   ├── ready.js             # Démarrage & statuts animés
│   └── voiceStateUpdate.js  # Moteur temps réel du mode =dog
├── utils/
│   ├── database.js          # Base de données JSON
│   ├── embeds.js            # Générateur d'embeds stylés
│   └── time.js              # Parseur de durées (10m, 1h, 1d)
├── config.json              # Couleurs, emojis et statuts
├── index.js                 # Entrée principale & Anti-crash
├── package.json             # Dépendances Discord.js v14
├── Procfile                 # Déploiement Railway
├── railway.json             # Configuration Nixpacks Railway
└── README.md                # Documentation complète
```
