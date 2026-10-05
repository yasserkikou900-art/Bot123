const { PermissionFlagsBits } = require('discord.js');
const { voiceEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'mv',
  description: 'Déplace un membre vers votre salon vocal actuel',
  aliases: ['move', 'deplacer'],
  async execute(message, args, client) {
    const callerVoiceChannel = message.member.voice.channel;

    if (!callerVoiceChannel) {
      return message.reply({
        embeds: [errorEmbed('Non Connecté', 'Vous devez être dans un salon vocal pour attirer quelqu\'un vers vous.')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [errorEmbed('Argument Manquant', 'Usage : `=mv <@membre ou ID>` ou `=mv + <ID>`')]
      });
    }

    // Gère le cas où l'utilisateur a écrit "+ ID" ou directement "ID/@mention"
    let targetArg = args[0];
    if (targetArg === '+' && args[1]) {
      targetArg = args[1];
    } else if (targetArg.startsWith('+')) {
      targetArg = targetArg.substring(1);
    }

    const cleanTargetId = targetArg.replace(/[<@!>]/g, '');
    const targetMember = message.guild.members.cache.get(cleanTargetId) ||
                         await message.guild.members.fetch(cleanTargetId).catch(() => null);

    if (!targetMember) {
      return message.reply({
        embeds: [errorEmbed('Membre Introuvable', `Impossible de trouver le membre avec l'identifiant \`${cleanTargetId}\`.`)]
      });
    }

    if (!targetMember.voice.channel) {
      return message.reply({
        embeds: [errorEmbed('Cible Déconnectée', `${targetMember} n'est actuellement connecté dans aucun salon vocal.`)]
      });
    }

    if (targetMember.voice.channelId === callerVoiceChannel.id) {
      return message.reply({
        embeds: [errorEmbed('Déjà Présent', `${targetMember} est déjà connecté dans votre salon vocal.`)]
      });
    }

    const botMember = message.guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.MoveMembers)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Le bot a besoin de la permission `Déplacer les membres`.')]
      });
    }

    try {
      const previousChannel = targetMember.voice.channel;
      await targetMember.voice.setChannel(callerVoiceChannel);

      return message.reply({
        embeds: [
          voiceEmbed(
            'Téléportation Vocale Réussie 🔀',
            `Le membre ${targetMember} a été déplacé avec succès !`,
            [
              { name: '👤 Cible', value: `${targetMember}`, inline: true },
              { name: '📍 Destination', value: `${callerVoiceChannel.name}`, inline: true },
              { name: '🚀 Déplacé depuis', value: `${previousChannel.name}`, inline: true }
            ]
          )
        ]
      });
    } catch (err) {
      console.error('Erreur commande =mv:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Une erreur est survenue lors du déplacement du membre (vérifiez la hiérarchie des rôles).')]
      });
    }
  }
};
