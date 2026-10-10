const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'banall',
  description: 'Bannit tous les membres du serveur',
  aliases: ['massban'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({
        content: '❌ Tu n\'as pas la permission.'
      });
    }

    try {
      const statusMsg = await message.reply({
        content: '⏳ Ban de tous les membres en cours...'
      });

      await message.guild.members.fetch();

      let count = 0;
      let errors = 0;

      for (const [, member] of message.guild.members.cache) {
        if (member.user.id === client.user.id) continue;
        if (member.user.bot) continue;

        try {
          await member.ban({ reason: 'Ban all effectuée' });
          count++;
        } catch (err) {
          errors++;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const embed = new EmbedBuilder()
        .setColor(config.colors.danger)
        .setTitle('✅ Ban all terminé')
        .setDescription(`Tous les membres non-bots ont été bannis.`)
        .addFields(
          { name: 'Bannis', value: `${count}`, inline: true },
          { name: 'Erreurs', value: `${errors}`, inline: true }
        )
        .setTimestamp();

      return statusMsg.edit({
        content: null,
        embeds: [embed]
      });
    } catch (err) {
      console.error('Erreur banall:', err);
      return message.reply({
        content: '❌ Erreur lors du ban all.'
      });
    }
  }
};