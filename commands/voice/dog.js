const db = require('../../utils/database');
const { voiceEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'dog',
  description: 'Force un membre à vous suivre automatiquement partout où vous vous déplacez en vocal',
  aliases: ['follow', 'suivre', 'undog'],
  async execute(message, args, client) {
    if (!args[0]) {
      return message.reply({
        embeds: [
          errorEmbed(
            'Argument Manquant',
            'Usage : `=dog <@membre ou ID>` (ou `=dog stop` pour désactiver).'
          )
        ]
      });
    }

    // Arrêter tous les suivis pour cet utilisateur
    if (args[0].toLowerCase() === 'stop' || args[0].toLowerCase() === 'off') {
      const removed = db.removeDog(message.author.id);
      if (removed) {
        return message.reply({
          embeds: [
            successEmbed(
              'Mode Dog Désactivé 🐕',
              'Personne ne vous suit plus désormais dans vos déplacements vocaux.'
            )
          ]
        });
      } else {
        return message.reply({
          embeds: [errorEmbed('Info', 'Vous n\'aviez aucun membre configuré pour vous suivre.')]
        });
      }
    }

    const cleanTargetId = args[0].replace(/[<@!>]/g, '');
    const targetMember = message.guild.members.cache.get(cleanTargetId) ||
                         await message.guild.members.fetch(cleanTargetId).catch(() => null);

    if (!targetMember) {
      return message.reply({
        embeds: [errorEmbed('Membre Introuvable', `Impossible de trouver le membre avec l'identifiant \`${cleanTargetId}\`.`)]
      });
    }

    if (targetMember.id === message.author.id) {
      return message.reply({
        embeds: [errorEmbed('Action Impossible', 'Vous ne pouvez pas vous cibler vous-même !')]
      });
    }

    const currentDog = db.getDog(message.author.id);

    // Si la cible était déjà ce membre -> on désactive
    if (currentDog === targetMember.id) {
      db.removeDog(message.author.id);
      return message.reply({
        embeds: [
          successEmbed(
            'Mode Dog Désactivé 🛑',
            `${targetMember} ne vous suivra plus en vocal.`
          )
        ]
      });
    }

    // Activation du mode Dog
    db.setDog(message.author.id, targetMember.id);

    // Si les deux sont déjà en vocal et dans des salons différents, on téléporte directement la cible
    if (message.member.voice.channel && targetMember.voice.channel &&
        message.member.voice.channelId !== targetMember.voice.channelId) {
      await targetMember.voice.setChannel(message.member.voice.channel).catch(() => {});
    }

    return message.reply({
      embeds: [
        voiceEmbed(
          '🐕 Mode Dog Activé !',
          `**${targetMember.user.username}** est désormais attaché à vous ! Dès que vous changez de salon vocal, il sera automatiquement téléporté avec vous.`,
          [
            { name: '👑 Maître', value: `${message.author}`, inline: true },
            { name: '🐾 Follower', value: `${targetMember}`, inline: true },
            { name: '🛑 Comment arrêter ?', value: `Tapez simplement \`=dog stop\` ou \`=dog ${targetMember.id}\`.`, inline: false }
          ]
        )
      ]
    });
  }
};
