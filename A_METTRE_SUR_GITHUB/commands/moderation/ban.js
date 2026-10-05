const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'ban',
  description: 'Bannit un membre du serveur',
  aliases: ['bannir'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous n\'avez pas la permission de bannir des membres.')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=ban <@membre ou ID> [raison]`')]
      });
    }

    const cleanId = args[0].replace(/[<@!>]/g, '');
    const member = message.guild.members.cache.get(cleanId) ||
                   await message.guild.members.fetch(cleanId).catch(() => null);

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    if (member) {
      if (!member.bannable) {
        return message.reply({
          embeds: [errorEmbed('Action Impossible', 'Je ne peux pas bannir ce membre (rôle supérieur ou égal au mien).')]
        });
      }

      if (message.member.roles.highest.position <= member.roles.highest.position && message.guild.ownerId !== message.author.id) {
        return message.reply({
          embeds: [errorEmbed('Hiérarchie', 'Vous ne pouvez pas sanctionner un membre ayant un rôle supérieur ou égal au vôtre.')]
        });
      }

      try {
        await member.send(`⚠️ Vous avez été banni du serveur **${message.guild.name}** pour la raison suivante : *${reason}*`).catch(() => {});
        await member.ban({ reason: `[Par ${message.author.tag}] ${reason}` });

        return message.reply({
          embeds: [
            successEmbed(
              'Membre Banni 🔨',
              `**${member.user.tag}** (\`${member.id}\`) a été banni avec succès.\n**Raison :** ${reason}`
            )
          ]
        });
      } catch (err) {
        console.error('Erreur ban:', err);
        return message.reply({
          embeds: [errorEmbed('Erreur', 'Impossible de bannir ce membre.')]
        });
      }
    } else {
      // Ban par ID même si le membre n'est plus sur le serveur (Hackban)
      try {
        await message.guild.bans.create(cleanId, { reason: `[Hackban par ${message.author.tag}] ${reason}` });
        return message.reply({
          embeds: [
            successEmbed(
              'Utilisateur Banni (Hackban) 🔨',
              `L'identifiant \`${cleanId}\` a été banni préventivement.\n**Raison :** ${reason}`
            )
          ]
        });
      } catch (err) {
        return message.reply({
          embeds: [errorEmbed('Erreur', 'Impossible de bannir cet identifiant.')]
        });
      }
    }
  }
};
