const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'lock',
  description: 'Verrouille le salon',
  aliases: ['verrouiller'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission de gérer les salons.')]
      });
    }

    try {
      const everyoneRole = message.guild.roles.everyone;

      await message.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false
      });

      return message.reply({
        embeds: [
          successEmbed(
            'Salon Verrouillé 🔒',
            `Le salon **#${message.channel.name}** a été verrouillé.`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur lock:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de verrouiller ce salon.')]
      });
    }
  }
};