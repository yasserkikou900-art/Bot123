const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'unban',
  description: 'Débannit un utilisateur du serveur via son identifiant Discord',
  aliases: ['debannir'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply({ embeds: [errorEmbed('Permission Refusée', 'Vous devez avoir la permission de bannir des membres.')] });
    }

    const userId = args[0];
    if (!userId || !/^\d{17,20}$/.test(userId)) {
      return message.reply({ embeds: [errorEmbed('Identifiant Invalide', 'Veuillez spécifier l\'identifiant Discord numérique (ID) de l\'utilisateur à débannir.')] });
    }

    try {
      const ban = await message.guild.bans.fetch(userId);
      if (!ban) {
        return message.reply({ embeds: [errorEmbed('Utilisateur Non Banni', 'Cet utilisateur ne figure pas dans la liste des bannis du serveur.')] });
      }

      await message.guild.bans.remove(userId, `Débanni par ${message.author.tag}`);
      return message.reply({
        embeds: [successEmbed('Membre Débanni', `L'utilisateur **${ban.user.tag}** (\`${userId}\`) a été débanni avec succès.`)]
      });
    } catch (err) {
      console.error('Erreur unban:', err);
      return message.reply({ embeds: [errorEmbed('Erreur', 'Impossible de débannir cet utilisateur. Vérifiez l\'ID fourni.')] });
    }
  }
};
