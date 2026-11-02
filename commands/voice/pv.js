const { PermissionFlagsBits } = require('discord.js');
const { voiceEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'pv',
  description: 'Verrouille ou déverrouille votre salon vocal actuel (rendre privé)',
  aliases: ['lock', 'private', 'unpv'],
  async execute(message, args, client) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply({
        embeds: [errorEmbed('Non Connecté', 'Vous devez être connecté dans un salon vocal pour utiliser cette commande.')]
      });
    }

    // Vérifier les permissions du bot
    const botMember = message.guild.members.me;
    if (!voiceChannel.permissionsFor(botMember).has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Le bot a besoin de la permission `Gérer les salons` pour modifier les accès vocaux.')]
      });
    }

    try {
      const everyoneRole = message.guild.roles.everyone;
      const currentOverwrite = voiceChannel.permissionOverwrites.cache.get(everyoneRole.id);
      const isCurrentlyLocked = currentOverwrite && currentOverwrite.deny.has(PermissionFlagsBits.Connect);

      if (isCurrentlyLocked) {
        // Déverrouiller le salon
        await voiceChannel.permissionOverwrites.edit(everyoneRole, {
          Connect: null
        });

        return message.reply({
          embeds: [
            voiceEmbed(
              'Salon Vocal Déverrouillé 🔓',
              `Le salon **${voiceChannel.name}** est de nouveau **public et accessible** à tous les membres.`,
              [
                { name: '🎙️ Salon', value: `${voiceChannel}`, inline: true },
                { name: '👑 Modifié par', value: `${message.author}`, inline: true }
              ]
            )
          ]
        });
      } else {
        // Verrouiller le salon (rendre privé)
        await voiceChannel.permissionOverwrites.edit(everyoneRole, {
          Connect: false
        });

        // Garantir que l'auteur conserve la permission de se connecter
        await voiceChannel.permissionOverwrites.edit(message.member, {
          Connect: true
        });

        return message.reply({
          embeds: [
            voiceEmbed(
              'Salon Vocal Privé 🔒',
              `Le salon **${voiceChannel.name}** est désormais **privé et verrouillé** !\nLes autres membres ne peuvent plus le rejoindre sans invitation.`,
              [
                { name: '🎙️ Salon', value: `${voiceChannel}`, inline: true },
                { name: '👑 Propriétaire', value: `${message.author}`, inline: true },
                { name: '💡 Astuce', value: `Retapez \`=pv\` à tout moment pour le réouvrir.`, inline: false }
              ]
            )
          ]
        });
      }
    } catch (err) {
      console.error('Erreur commande =pv:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de modifier les permissions du salon vocal.')]
      });
    }
  }
};
