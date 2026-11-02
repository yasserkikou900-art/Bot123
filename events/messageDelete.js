const db = require('../utils/database');
const { createEmbed } = require('../utils/embeds');
const config = require('../config.json');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild || message.author?.bot) return;

    const logChannelId = db.getLogsChannel(message.guild.id);
    if (!logChannelId) return;

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = createEmbed({
      title: '🗑️ Message Supprimé',
      description: [
        `**Auteur :** ${message.author} (\`${message.author.id}\`)`,
        `**Salon :** ${message.channel}`,
        `**Contenu :**`,
        `>>> ${message.content || '*[Aucun texte / Média supprimé]*'}`
      ].join('\n'),
      color: config.colors.danger,
      footer: { text: `ID du message : ${message.id}` }
    });

    logChannel.send({ embeds: [embed] }).catch(() => {});
  }
};
