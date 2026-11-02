const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  name: 'clearwarns',
  description: 'Supprime tous les avertissements d\'un membre',
  aliases: ['resetwarns'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ embeds: [errorEmbed('Permission Refusée', 'Seuls les administrateurs peuvent effacer les avertissements.')] });
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply({ embeds: [errorEmbed('Membre introuvable', 'Veuillez mentionner un utilisateur valide.')] });
    }

    db.clearWarns(message.guild.id, target.id);

    return message.reply({
      embeds: [successEmbed('Avertissements Réinitialisés', `Tous les avertissements de **${target.user.tag}** ont été effacés avec succès.`)]
    });
  }
};
