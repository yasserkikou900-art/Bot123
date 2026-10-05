const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'unmute',
  description: 'Rend la parole à un membre rendu muet (retire le timeout)',
  aliases: ['untimeout'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous devez avoir la permission d\'exclure temporairement des membres (`ModerateMembers`).')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=unmute <@membre ou ID>`')]
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

    if (!member.communicationDisabledUntilTimestamp || member.communicationDisabledUntilTimestamp <= Date.now()) {
      return message.reply({
        embeds: [errorEmbed('Non Muet', 'Ce membre n\'est actuellement pas en timeout.')]
      });
    }

    try {
      await member.timeout(null, `Unmute par ${message.author.tag}`);
      return message.reply({
        embeds: [
          successEmbed(
            'Parole Rendue 🔊',
            `**${member.user.tag}** (\`${member.id}\`) n'est plus muet et peut de nouveau s'exprimer.`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur unmute:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de retirer le mute de ce membre.')]
      });
    }
  }
};
