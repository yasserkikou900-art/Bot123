const fs = require('fs');
const path = require('path');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

const OWNER_ID = '754703887738470482';

module.exports = {
  name: 'addwhitelist',
  description: 'Ajoute un ID à la whitelist',
  aliases: ['addwl'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        embeds: [errorEmbed('Accès Refusé', 'Seul le propriétaire peut utiliser cette commande.')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=addwhitelist <id>`')]
      });
    }

    const userId = args[0];

    try {
      const configPath = path.join(__dirname, '../../config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (!config.whitelist) {
        config.whitelist = [];
      }

      if (config.whitelist.includes(userId)) {
        return message.reply({
          embeds: [errorEmbed('Déjà Autorisé', `L'ID \`${userId}\` est déjà whitelisté.`)]
        });
      }

      config.whitelist.push(userId);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return message.reply({
        embeds: [
          successEmbed(
            'ID Ajouté ✅',
            `L'ID \`${userId}\` a été ajouté à la whitelist.`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur addwhitelist:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible d\'ajouter à la whitelist.')]
      });
    }
  }
};