const db = require('../utils/database');
const { createEmbed } = require('../utils/embeds');
const config = require('../config.json');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const logChannelId = db.getLogsChannel(newMessage.guild.id);
    if (!logChannelId) return;

    const logChannel = newMessage.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = createEmbed({
      title: '✏️ Message Modifié',
      description: [
        `**Auteur :** ${newMessage.author} (\`${newMessage.author.id}\`)`,
        `**Salon :** ${newMessage.channel}`,
        `**[Aller au message](${newMessage.url})**`,
        '',
        `**Ancien message :**`,
        `>>> ${oldMessage.content || '*[Inconnu / Non mis en cache]*'}`,
        '',
        `**Nouveau message :**`,
        `>>> ${newMessage.content || '*[Vide]*'}`
      ].join('\n'),
      color: config.colors.warning,
      footer: { text: `ID du message : ${newMessage.id}` }
    });

    logChannel.send({ embeds: [embed] }).catch(() => {});
  }
};
