const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

const OWNER_ID = '754703887738470482';

module.exports = {
  name: 'embed',
  description: 'Crée un embed personnalisé',
  aliases: ['e'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        content: '❌ Seul le propriétaire peut utiliser cette commande.'
      });
    }

    if (args.length === 0) {
      return message.reply({
        content: `❌ Usage: \`=embed <titre> | <description> | [couleur] | [footer]\`
Exemple: \`=embed Salut | Ceci est un test | #5865F2 | Made by Bot\``
      });
    }

    try {
      const fullText = args.join(' ');
      const parts = fullText.split('|').map(p => p.trim());

      if (parts.length < 2) {
        return message.reply({
          content: '❌ Format incorrect. Utilise: `=embed <titre> | <description> | [couleur] | [footer]`'
        });
      }

      const titre = parts[0];
      const description = parts[1];
      const couleur = parts[2] || config.colors.primary;
      const footer = parts[3] || null;

      const embed = new EmbedBuilder()
        .setTitle(titre)
        .setDescription(description)
        .setColor(couleur);

      if (footer) {
        embed.setFooter({ text: footer });
      }

      embed.setTimestamp();

      await message.channel.send({ embeds: [embed] });
      return message.react('✅');
    } catch (err) {
      console.error('Erreur embed:', err);
      return message.reply({
        content: '❌ Erreur lors de la création de l\'embed.'
      });
    }
  }
};