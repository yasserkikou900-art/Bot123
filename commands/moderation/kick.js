const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'kick',
  description: 'Expulse un membre du serveur',
  aliases: ['expulser'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission d\'expulser des membres.')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=kick <@membre ou ID> [raison]`')]
      });
    }

    const cleanId = args[0].replace(/[<@!>]/g, '');
    const member = message.guild.members.cache.get(cleanId) ||
                   await message.guild.members.fetch(cleanId).catch(() => null);

    if (!member) {
      return message.reply({
        embeds: [errorEmbed('Introuvable', 'Ce membre n\'a pas été trouvé sur le serveur.')]
      });
    }

    if (!member.kickable) {
      return message.reply({
        embeds: [errorEmbed('Action Impossible', 'Je ne peux pas expulser ce membre (rôle supérieur ou égal au mien).')]
      });
    }

    if (message.member.roles.highest.position <= member.roles.highest.position && message.guild.ownerId !== message.author.id) {
      return message.reply({
        embeds: [errorEmbed('Hiérarchie', 'Vous ne pouvez pas sanctionner un membre ayant un rôle supérieur ou égal au vôtre.')]
      });
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    try {
      await member.send(`⚠️ Vous avez été expulsé du serveur **${message.guild.name}** pour la raison suivante : *${reason}*`).catch(() => {});
      await member.kick(`[Par ${message.author.tag}] ${reason}`);

      return message.reply({
        embeds: [
          successEmbed(
            'Membre Expulsé 👢',
            `**${member.user.tag}** (\`${member.id}\`) a été expulsé avec succès.\n**Raison :** ${reason}`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur kick:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible d\'expulser ce membre.')]
      });
    }
  }
};
