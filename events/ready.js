const { ActivityType } = require('discord.js');
const config = require('../config.json');
const db = require('../utils/database');
const { endGiveawayTask } = require('../commands/giveaway/gend');
const { EmbedBuilder } = require('discord.js');

let lastPrice = null;

async function checkAxiomeAlert(client) {
  if (!config.axiome || !config.axiome.apiUrl) return;

  try {
    const res = await fetch(config.axiome.apiUrl);
    if (!res.ok) return;

    const data = await res.json();
    const currentPrice = Number(data.price ?? data.currentPrice ?? data.lastPrice ?? 0);
    if (!currentPrice || !Number.isFinite(currentPrice)) return;

    if (lastPrice !== null) {
      const percentChange = ((currentPrice - lastPrice) / lastPrice) * 100;

      if (percentChange >= (config.axiome.thresholdPercent || 5)) {
        const channel = client.channels.cache.get(config.axiome.channelId);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor('#00FFA3')
            .setTitle('📈 Bonne action Axiome.trade')
            .setDescription(`Prix monté de **${percentChange.toFixed(2)}%**`)
            .addFields(
              { name: 'Prix actuel', value: `${currentPrice}`, inline: true },
              { name: 'Prix précédent', value: `${lastPrice}`, inline: true }
            )
            .setTimestamp();

          await channel.send({ embeds: [embed] });
        }
      }
    }

    lastPrice = currentPrice;
  } catch (err) {
    console.error('Erreur alert Axiome:', err);
  }
}

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

    // Alerte Axiome.trade
    if (config.axiome && config.axiome.apiUrl) {
      setInterval(() => {
        checkAxiomeAlert(client);
      }, config.axiome.pollIntervalMs || 30000);
    }
  }
};