const { ActivityType } = require('discord.js');
const config = require('../config.json');
const db = require('../utils/database');
const { endGiveawayTask } = require('../commands/giveaway/gend');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log('====================================================');
    console.log(`🚀 [BOT EN LIGNE] Connecté en tant que: ${client.user.tag}`);
    console.log(`🌐 [SERVEURS] Présent sur ${client.guilds.cache.size} serveur(s)`);
    console.log(`👥 [UTILISATEURS] ${client.users.cache.size} membres surveillés`);
    console.log(`⚡ [PREFIX] Préfixe configuré : ${process.env.PREFIX || config.prefix}`);
    console.log('====================================================');

    // Définition immédiate du statut "Regarde les batiments des tarteret"
    client.user.setPresence({
      activities: [{
        name: 'les batiments des tarteret',
        type: ActivityType.Watching
      }],
      status: 'online'
    });

    setInterval(() => {
      client.user.setPresence({
        activities: [{
          name: 'les batiments des tarteret',
          type: ActivityType.Watching
        }],
        status: 'online'
      });
    }, 60000);

    // Vérification automatique des Giveaways actifs au démarrage
    setInterval(async () => {
      const activeGiveaways = db.getActiveGiveaways();
      const now = Date.now();

      for (const gw of activeGiveaways) {
        if (now >= gw.endsAt) {
          try {
            await endGiveawayTask(client, gw.messageId);
          } catch (err) {
            console.error(`Erreur fin automatique giveaway ${gw.messageId}:`, err);
          }
        }
      }
    }, 5000);
  }
};
