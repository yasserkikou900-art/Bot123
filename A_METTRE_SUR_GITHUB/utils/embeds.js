const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

/**
 * Crée un Embed Discord au design cyberpunk / épuré et moderne
 */
function createEmbed({
  title = null,
  description = null,
  color = config.colors.primary,
  fields = [],
  footer = null,
  author = null,
  thumbnail = null,
  image = null,
  timestamp = true
}) {
  const embed = new EmbedBuilder();

  if (color) {
    embed.setColor(color);
  }

  if (title) {
    embed.setTitle(title);
  }

  if (description) {
    embed.setDescription(description);
  }

  if (fields && fields.length > 0) {
    embed.addFields(fields);
  }

  if (thumbnail) {
    embed.setThumbnail(thumbnail);
  }

  if (image) {
    embed.setImage(image);
  }

  if (author) {
    embed.setAuthor(author);
  }

  const footerText = footer ? footer.text || footer : 'Système de Sécurité & Vocal VIP';
  const footerIcon = footer && footer.iconURL ? footer.iconURL : null;
  embed.setFooter({
    text: `⚡ ${footerText}`,
    iconURL: footerIcon
  });

  if (timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

function successEmbed(title, description) {
  return createEmbed({
    title: `${config.emojis.success} ${title}`,
    description: `> ${description}`,
    color: config.colors.success
  });
}

function errorEmbed(title, description) {
  return createEmbed({
    title: `${config.emojis.error} ${title}`,
    description: `> ${description}`,
    color: config.colors.danger
  });
}

function warningEmbed(title, description) {
  return createEmbed({
    title: `${config.emojis.warn} ${title}`,
    description: `> ${description}`,
    color: config.colors.warning
  });
}

function voiceEmbed(title, description, fields = []) {
  return createEmbed({
    title: `${config.emojis.voice} ${title}`,
    description: `${description}`,
    color: config.colors.voice,
    fields
  });
}

function giveawayEmbed({ prize, winnersCount, endsAt, host, participantsCount = 0 }) {
  const timestamp = Math.floor(endsAt / 1000);
  return createEmbed({
    title: `${config.emojis.giveaway} CONCOURS : **${prize.toUpperCase()}** ${config.emojis.giveaway}`,
    description: [
      `### 🎁 Un nouveau Giveaway a commencé !`,
      ``,
      `> Cliquez sur le bouton ci-dessous pour participer et tenter votre chance !`,
      ``,
      `**${config.emojis.trophy} Récompense :** \`${prize}\``,
      `**👑 Lancé par :** ${host}`,
      `**👥 Nombre de gagnants :** \`${winnersCount}\``,
      `**${config.emojis.timer} Fin du tirage :** <t:${timestamp}:R> (<t:${timestamp}:F>)`,
      `**✨ Participants :** \`${participantsCount}\``,
      ``,
      `\`-----------------------------------------\``
    ].join('\n'),
    color: config.colors.giveaway
  });
}

module.exports = {
  createEmbed,
  successEmbed,
  errorEmbed,
  warningEmbed,
  voiceEmbed,
  giveawayEmbed
};
