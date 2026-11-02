const db = require('../utils/database');
const { createEmbed } = require('../utils/embeds');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const logChannelId = db.getLogsChannel(member.guild.id);
    if (!logChannelId) return;

    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const accountAge = Math.floor(member.user.createdTimestamp / 1000);

    const embed = createEmbed({
      title: '📥 Nouveau Membre',
      description: [
        `**Membre :** ${member.user} (\`${member.user.tag}\`)`,
        `**ID :** \`${member.user.id}\``,
        `**Compte créé :** <t:${accountAge}:R>`,
        `**Total de membres :** ${member.guild.memberCount}`
      ].join('\n'),
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      color: config.colors.success
    });

    logChannel.send({ embeds: [embed] }).catch(() => {});
  }
};
