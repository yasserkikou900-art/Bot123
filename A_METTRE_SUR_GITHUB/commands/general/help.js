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
        `> Ce bot intègre des outils avancés de modération, de gestion de salons vocaux innovants, de sécurité anti-lien et de concours interactifs.`,
        ``,
        `**${config.emojis.arrow} Préfixe configuré :** \`${prefix}\``,
        `**${config.emojis.arrow} Nombre de commandes :** \`${client.commands.size}\``,
        `**${config.emojis.arrow} Salons surveillés :** \`${client.channels.cache.size}\``,
        ``,
        `💡 *Sélectionnez une catégorie ci-dessous dans le menu déroulant pour découvrir les fonctionnalités détaillées :*`
      ].join('\n'),
      color: config.colors.primary,
      fields: [
        {
          name: `🛡️ Modération`,
          value: `\`${prefix}ban\`, \`${prefix}kick\`, \`${prefix}mute\`, \`${prefix}unmute\`, \`${prefix}bl\`, \`${prefix}clear\``,
          inline: false
        },
        {
          name: `🎙️ Salons Vocaux VIP`,
          value: `\`${prefix}pv\` (salon privé), \`${prefix}mv\` (téléportation), \`${prefix}dog\` (auto-follow)`,
          inline: false
        },
        {
          name: `🎁 Giveaways & Concours`,
          value: `\`${prefix}gcreate\` (bouton interactif), \`${prefix}greroll\`, \`${prefix}gend\``,
          inline: false
        },
        {
          name: `🔗 Sécurité & Anti-Lien`,
          value: `\`${prefix}antilink <on/off/status>\``,
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
          .setDescription('Ban, kick, tempmute, blacklist, clear...')
          .setEmoji('🛡️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Salons Vocaux VIP')
          .setValue('voice')
          .setDescription('=pv, =mv, =dog (suivi automatique)...')
          .setEmoji('🎙️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Giveaways & Concours')
          .setValue('giveaway')
          .setDescription('Créer des concours avec boutons et minuteur...')
          .setEmoji('🎉'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Anti-Link & Sécurité')
          .setValue('security')
          .setDescription('Protection contre les invitations et liens indésirables...')
          .setEmoji('🔗'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Accueil / Informations')
          .setValue('general')
          .setDescription('Retour au sommaire principal...')
          .setEmoji('✨')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    return message.reply({
      embeds: [mainEmbed],
      components: [row]
    });
  }
};
