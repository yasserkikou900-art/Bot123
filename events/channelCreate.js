const db = require('../utils/database');
const { createEmbed } = require('../utils/embeds');
const config = require('../config.json');

module.exports = {
  name: 'channelCreate',
  async execute(channel, client) {
    if (!channel.guild) return;

    const logChannelId = db.getLogsChannel(channel.guild.id);
    if (!logChannelId || channel.id === logChannelId) return;

    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = createEmbed({
      title: '📁 Salon Créé',
      description: [
        `**Nom :** ${channel.name} (${channel})`,
        `**Type :** ${channel.type}`,
        `**ID :** \`${channel.id}\``
      ].join('\n'),
      color: config.colors.info
    });

    logChannel.send({ embeds: [embed] }).catch(() => {});
  }
};
