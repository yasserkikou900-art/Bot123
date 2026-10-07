const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'wipe',
  description: 'Supprime tous les messages du salon',
  aliases: ['clearall'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission de gérer les messages.')]
      });
    }

    try {
      const channel = message.channel;
      let totalDeleted = 0;

      while (true) {
        const messages = await channel.messages.fetch({ limit: 100 });
        if (messages.size === 0) break;

        const deleted = await channel.bulkDelete(messages, true);
        totalDeleted += deleted.size;
      }

      const msg = await channel.send({
        embeds: [
          successEmbed(
            'Salon Wipe ✅',
            `Le salon **#${channel.name}** a été vidé. **${totalDeleted}** messages supprimés.`
          )
        ]
      });

      setTimeout(() => msg.delete().catch(() => {}), 8000);
    } catch (err) {
      console.error('Erreur wipe:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de vider ce salon.')]
      });
    }
  }
};