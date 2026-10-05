const { createEmbed } = require('../../utils/embeds');
const config = require('../../config.json');

module.exports = {
  name: 'ping',
  description: 'Affiche la latence du bot et de l\'API Discord',
  aliases: ['latence', 'speed'],
  async execute(message, args, client) {
    const sent = await message.reply({ content: '🏓 Calcul de la latence...' });
    const roundtrip = sent.createdTimestamp - message.createdTimestamp;
    const wsPing = Math.round(client.ws.ping);

    const embed = createEmbed({
      title: '🏓 Pong ! Performances du Bot',
      fields: [
        { name: '⚡ Latence Aller-Retour', value: `\`${roundtrip}ms\``, inline: true },
        { name: '🌐 Latence API Discord', value: `\`${wsPing}ms\``, inline: true },
        { name: '🟢 Statut Hébergement', value: '`Opérationnel (Railway Ready)`', inline: false }
      ],
      color: config.colors.primary
    });

    return sent.edit({ content: null, embeds: [embed] });
  }
};
