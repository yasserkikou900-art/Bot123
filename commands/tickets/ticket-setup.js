const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const config = require('../../config.json');

module.exports = {
  name: 'ticket-setup',
  description: 'Installe le panneau interactif pour ouvrir des tickets',
  aliases: ['tickets-setup', 'panel-ticket'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ content: '❌ Vous devez être Administrateur pour utiliser cette commande.' });
    }

    const panelEmbed = createEmbed({
      title: '🎫 Centre d\'Assistance & Support',
      description: [
        '### Besoin d\'aide ou d\'un renseignement ?',
        'Cliquez sur le bouton ci-dessous pour ouvrir un salon de discussion privé avec l\'équipe du staff.',
        '',
        '📌 **Règles :**',
        '• Expliquez clairement votre demande dès l\'ouverture.',
        '• Ne créez pas de ticket sans motif valable.',
        '• Soyez patient et courtois avec l\'équipe.'
      ].join('\n'),
      color: config.colors.primary,
      footer: { text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }
    });

    const openButton = new ButtonBuilder()
      .setCustomId('ticket_create')
      .setLabel('Ouvrir un Ticket')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫');

    const row = new ActionRowBuilder().addComponents(openButton);

    await message.channel.send({
      embeds: [panelEmbed],
      components: [row]
    });

    if (message.deletable) {
      await message.delete().catch(() => {});
    }
  }
};
