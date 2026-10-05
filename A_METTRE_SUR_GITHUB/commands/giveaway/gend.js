const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { createEmbed, errorEmbed } = require('../../utils/embeds');
const config = require('../../config.json');

/**
 * Fonction centrale pour finaliser un giveaway et tirer les gagnants
 */
async function endGiveawayTask(client, messageId) {
  const gw = db.getGiveaway(messageId);
  if (!gw || gw.ended) return null;

  db.endGiveaway(messageId);

  try {
    const channel = await client.channels.fetch(gw.channelId).catch(() => null);
    if (!channel) return null;

    const gwMessage = await channel.messages.fetch(messageId).catch(() => null);
    if (!gwMessage) return null;

    const participants = gw.participants || [];
    let winners = [];

    if (participants.length > 0) {
      // Mélange aléatoire
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const winnersCount = Math.min(gw.winnersCount, shuffled.length);
      winners = shuffled.slice(0, winnersCount);
    }

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_ended_${messageId}`)
        .setLabel(`Terminé (${participants.length} participants)`)
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    const winnersText = winners.length > 0
      ? winners.map(id => `<@${id}>`).join(', ')
      : 'Aucun participant éligible';

    const endedEmbed = createEmbed({
      title: `${config.emojis.trophy} CONCOURS TERMINÉ : **${gw.prize.toUpperCase()}**`,
      description: [
        `### 🎊 Félicitations aux gagnants !`,
        ``,
        `**🏆 Gagnant(s) :** ${winnersText}`,
        `**🎁 Récompense :** \`${gw.prize}\``,
        `**👑 Lancé par :** <@${gw.hostId}>`,
        `**👥 Total des inscrits :** \`${participants.length}\``,
        ``,
        `*Merci à tous pour votre participation !*`
      ].join('\n'),
      color: winners.length > 0 ? config.colors.success : config.colors.warning
    });

    await gwMessage.edit({
      embeds: [endedEmbed],
      components: [disabledRow]
    });

    if (winners.length > 0) {
      await channel.send({
        content: `🎉 Félicitations ${winnersText} ! Vous remportez : **${gw.prize}** ! 🎁`
      });
    } else {
      await channel.send({
        content: `😢 Aucun vainqueur n'a pu être tiré au sort pour le giveaway **${gw.prize}** (manque de participants).`
      });
    }

    return { winners, prize: gw.prize };
  } catch (err) {
    console.error(`Erreur fin de tâche giveaway ${messageId}:`, err);
    return null;
  }
}

module.exports = {
  name: 'gend',
  description: 'Termine immédiatement un concours et tire les gagnants',
  aliases: ['giveawayend', 'endgiveaway'],
  endGiveawayTask,
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({
        embeds: [errorEmbed('Permission Manquante', 'Vous devez avoir la permission de gérer les messages.')]
      });
    }

    const messageId = args[0];
    if (!messageId) {
      return message.reply({
        embeds: [errorEmbed('Argument Manquant', 'Usage : `=gend <ID_du_message_du_giveaway>`')]
      });
    }

    const gw = db.getGiveaway(messageId);
    if (!gw) {
      return message.reply({
        embeds: [errorEmbed('Introuvable', 'Aucun giveaway trouvé avec cet identifiant de message.')]
      });
    }

    if (gw.ended) {
      return message.reply({
        embeds: [errorEmbed('Déjà Terminé', 'Ce concours est déjà finalisé.')]
      });
    }

    await endGiveawayTask(client, messageId);
    return message.reply({
      content: `✅ Le concours **${gw.prize}** a été clôturé immédiatement avec succès.`
    });
  }
};
