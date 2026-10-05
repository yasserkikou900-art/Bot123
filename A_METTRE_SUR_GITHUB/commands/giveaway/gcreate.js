const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { parseDuration, formatDuration } = require('../../utils/time');
const { giveawayEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  name: 'gcreate',
  description: 'Lance un concours interactif stylé avec bouton de participation',
  aliases: ['giveaway', 'startgiveaway'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous devez avoir la permission de gérer les messages pour créer un giveaway.')]
      });
    }

    if (args.length < 3) {
      return message.reply({
        embeds: [
          errorEmbed(
            'Syntaxe Incorrecte',
            'Usage : `=gcreate <durée: 10m, 1h, 1d...> <nb_gagnants> <lot...>`\n' +
            '*Exemple :* `=gcreate 2h 1 Discord Nitro Boost`'
          )
        ]
      });
    }

    const durationStr = args[0];
    const durationMs = parseDuration(durationStr);
    if (!durationMs || durationMs < 5000) {
      return message.reply({
        embeds: [errorEmbed('Durée Invalide', 'Veuillez indiquer une durée valide d\'au moins 10 secondes (ex: `10m`, `2h`, `1d`).')]
      });
    }

    const winnersCount = parseInt(args[1], 10);
    if (isNaN(winnersCount) || winnersCount < 1 || winnersCount > 20) {
      return message.reply({
        embeds: [errorEmbed('Nombre Invalide', 'Le nombre de gagnants doit être compris entre 1 et 20.')]
      });
    }

    const prize = args.slice(2).join(' ');
    const endsAt = Date.now() + durationMs;

    // Supprimer la commande initiale de l'auteur pour un affichage propre
    await message.delete().catch(() => {});

    const embed = giveawayEmbed({
      prize,
      winnersCount,
      endsAt,
      host: message.author,
      participantsCount: 0
    });

    // Bouton de participation interactif
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_join_TEMP`)
        .setLabel('Participer')
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Success)
    );

    const sentMessage = await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    // Mettre à jour l'ID du bouton avec le véritable messageId
    const updatedRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_join_${sentMessage.id}`)
        .setLabel('Participer')
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Success)
    );

    await sentMessage.edit({
      components: [updatedRow]
    });

    // Sauvegarde en base de données
    db.saveGiveaway(sentMessage.id, {
      prize,
      winnersCount,
      endsAt,
      channelId: message.channel.id,
      guildId: message.guild.id,
      hostId: message.author.id,
      participants: [],
      ended: false
    });
  }
};
