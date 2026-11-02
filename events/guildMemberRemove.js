const db = require('../utils/database');
const { createEmbed } = require('../utils/embeds');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const logChannelId = db.getLogsChannel(member.guild.id);
    if (!logChannelId) return;

    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = createEmbed({
      title: '📤 Départ d\'un Membre',
      description: [
        `**Membre :** \`${member.user.tag}\` (${member.user.id})`,
        `**Total restant :** ${member.guild.memberCount}`
      ].join('\n'),
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      color: config.colors.danger
    });

    logChannel.send({ embeds: [embed] }).catch(() => {});
  }
};
