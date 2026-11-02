const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const config = require('../../config.json');

module.exports = {
  name: 'help',
  description: 'Affiche le panneau d\'aide complet avec menu déroulant interactif',
  aliases: ['aide', 'commands', 'h'],
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || config.prefix || '=';

    const mainEmbed = createEmbed({
      title: `⚡ Panneau de Contrôle & Commandes du Bot`,
      description: [
        `### 👋 Bienvenue sur votre Bot VIP !`,
        `> Bot tout-en-un complet avec Modération, Système de Tickets, Logs en direct, Salons Vocaux et Giveaways.`,
        ``,
        `**${config.emojis.arrow} Préfixe configuré :** \`${prefix}\``,
        `**${config.emojis.arrow} Nombre de commandes :** \`${client.commands.size}\``,
        ``,
        `💡 *Sélectionnez une catégorie ci-dessous pour afficher les détails :*`
      ].join('\n'),
      color: config.colors.primary,
      fields: [
        {
          name: `🛡️ Modération`,
          value: `\`${prefix}ban\`, \`${prefix}unban\`, \`${prefix}kick\`, \`${prefix}mute\`, \`${prefix}warn\`, \`${prefix}warns\`, \`${prefix}lock\`, \`${prefix}unlock\``,
          inline: false
        },
        {
          name: `🎫 Système de Tickets`,
          value: `\`${prefix}ticket-setup\`, \`${prefix}ticket close\`, \`${prefix}ticket add\`, \`${prefix}ticket remove\``,
          inline: false
        },
        {
          name: `📜 Système de Logs`,
          value: `\`${prefix}setlogs <#salon / off>\` (surveillance complète en direct)`,
          inline: false
        },
        {
          name: `🎙️ Salons Vocaux VIP`,
          value: `\`${prefix}pv\`, \`${prefix}mv\`, \`${prefix}dog\``,
          inline: false
        },
        {
          name: `🎁 Giveaways & Concours`,
          value: `\`${prefix}gcreate\`, \`${prefix}gend\`, \`${prefix}greroll\``,
          inline: false
        }
      ]
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('📂 Choisissez une catégorie à explorer...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Modération & Sanctions')
          .setValue('mod')
          .setDescription('Ban, unban, kick, mute, warn, lock, unlock...')
          .setEmoji('🛡️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Système de Tickets')
          .setValue('tickets')
          .setDescription('Panneau interactif, ouverture et gestion des tickets...')
          .setEmoji('🎫'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Système de Logs')
          .setValue('logs')
          .setDescription('Traçabilité des messages, membres, salons...')
          .setEmoji('📜'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Salons Vocaux VIP')
          .setValue('voice')
          .setDescription('=pv, =mv, =dog...')
          .setEmoji('🎙️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Giveaways & Concours')
          .setValue('giveaway')
          .setDescription('Créer des concours avec compte à rebours et boutons...')
          .setEmoji('🎉')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    return message.reply({
      embeds: [mainEmbed],
      components: [row]
    });
  }
};
