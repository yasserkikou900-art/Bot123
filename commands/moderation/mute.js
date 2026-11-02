const { PermissionFlagsBits } = require('discord.js');
const { parseDuration, formatDuration } = require('../../utils/time');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'mute',
  description: 'Rend muet temporairement un membre (Timeout textuel et vocal)',
  aliases: ['tempmute', 'timeout'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous devez avoir la permission d\'exclure temporairement des membres (`ModerateMembers`).')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [
          errorEmbed(
            'Usage Incorrect',
            'Syntaxe : `=mute <@membre ou ID> [durée: 10m, 1h, 1d...] [raison]`\n*Exemple :* `=mute @user 30m Spam intensif`'
          )
        ]
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

    if (!member.moderatable) {
      return message.reply({
        embeds: [errorEmbed('Action Impossible', 'Je ne peux pas rendre ce membre muet (rôle supérieur ou permissions administrateur).')]
      });
    }

    if (message.member.roles.highest.position <= member.roles.highest.position && message.guild.ownerId !== message.author.id) {
      return message.reply({
        embeds: [errorEmbed('Hiérarchie', 'Vous ne pouvez pas sanctionner un membre ayant un rôle supérieur ou égal au vôtre.')]
      });
    }

    // Analyse de la durée si fournie en 2ème argument
    let durationMs = parseDuration(args[1]);
    let reasonIndex = 2;

    if (!durationMs) {
      // Si le 2ème argument n'est pas une durée valide, on applique 1 heure par défaut
      durationMs = 60 * 60 * 1000;
      reasonIndex = 1;
    }

    // Discord limite le timeout à 28 jours maximum
    const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;
    if (durationMs > MAX_TIMEOUT) {
      durationMs = MAX_TIMEOUT;
    }

    const reason = args.slice(reasonIndex).join(' ') || 'Aucune raison spécifiée';
    const durationText = formatDuration(durationMs);

    try {
      await member.timeout(durationMs, `[Par ${message.author.tag}] ${reason}`);
      await member.send(`🔇 Vous avez été rendu muet sur le serveur **${message.guild.name}** pendant **${durationText}**.\n**Raison :** *${reason}*`).catch(() => {});

      return message.reply({
        embeds: [
          successEmbed(
            'Membre Rendu Muet 🔇',
            `**${member.user.tag}** (\`${member.id}\`) a été mute avec succès !\n` +
            `**⏱️ Durée :** \`${durationText}\`\n` +
            `**📄 Raison :** ${reason}`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur mute:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de réduire ce membre au silence.')]
      });
    }
  }
};
