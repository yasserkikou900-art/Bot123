require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Initialisation du client Discord avec les Intents requis
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,       // Indispensable pour lire le préfixe '='
    GatewayIntentBits.GuildMembers,          // Indispensable pour la modération et les membres
    GatewayIntentBits.GuildVoiceStates,      // Indispensable pour =pv, =mv et =dog
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]
});

client.commands = new Collection();

// --- CHARGEMENT DES COMMANDES (Récursif) ---
function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      loadCommands(filePath);
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      if (command.name) {
        client.commands.set(command.name, command);
      }
    }
  }
}

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  loadCommands(commandsPath);
  console.log(`✅ [COMMANDES] ${client.commands.size} commandes enregistrées avec succès.`);
}

// --- CHARGEMENT DES ÉVÉNEMENTS ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
  console.log(`✅ [ÉVÉNEMENTS] ${eventFiles.length} écouteurs d'événements chargés.`);
}

// --- SERVEUR WEB HEALTHCHECK POUR RAILWAY (Optionnel mais recommandé) ---
// Certains plans Railway nécessitent d'écouter sur le port attribué (PORT)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ONLINE',
    bot: client.user ? client.user.tag : 'Connecting...',
    uptime: process.uptime()
  }));
});

server.listen(PORT, () => {
  console.log(`🌐 [PORT] Serveur HTTP de maintien d'activité actif sur le port ${PORT}`);
});

// --- GESTIONNAIRE ANTI-CRASH (Railway 24/7) ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [ANTI-CRASH] Promesse non gérée rejetée :', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('❌ [ANTI-CRASH] Exception non interceptée :', err, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.error('❌ [ANTI-CRASH] Surveillance exception :', err, origin);
});

// Connexion du bot à Discord
const token = process.env.TOKEN;
if (!token) {
  console.error('❌ [ERREUR] Aucun TOKEN spécifié ! Veuillez définir la variable d\'environnement TOKEN dans votre fichier .env ou sur Railway.');
  process.exit(1);
}

client.login(token);
