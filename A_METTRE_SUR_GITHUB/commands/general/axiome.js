const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'axiome',
  description: 'Récupère les infos de prix sur axiome.trade',
  aliases: ['ax'],
  async execute(message, args, client) {
    try {
      const response = await fetch(config.axiome.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const price = data.price ?? data.currentPrice ?? data.lastPrice ?? '?';
      const change = data.change ?? data.percentChange ?? 0;
      const volume = data.volume ?? data.tradeVolume ?? '?';

      const embed = new EmbedBuilder()
        .setColor(change >= 0 ? '#00FFA3' : '#FF3366')
        .setTitle('📈 Axiome.trade')
        .setDescription('Informations du marché')
        .addFields(
          { name: 'Prix', value: `${price}`, inline: true },
          { name: 'Variation', value: `${change}%`, inline: true },
          { name: 'Volume', value: `${volume}`, inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Erreur axiome:', err);
      return message.reply({
        content: '❌ Impossible de récupérer les infos d\'axiome.trade. Vérifie l’URL API.'
      });
    }
  }
};