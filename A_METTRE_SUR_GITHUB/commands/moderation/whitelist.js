const fs = require('fs');
const path = require('path');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

const OWNER_ID = '754703887738470482';
const configPath = path.join(__dirname, '../../config.json');

module.exports = {
  name: 'whitelist',
  description: 'Ajoute un ID à la whitelist du bot',
  aliases: ['wl'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        embeds: [errorEmbed('Accès Refusé', 'Seul le propriétaire du bot peut utiliser cette commande.')]
      });
    }

    const userId = args[0];

    if (!userId) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=whitelist <id>`')]
      });
    }

    if (!/^\d{17,20}$/.test(userId)) {
      return message.reply({
        embeds: [errorEmbed('ID Invalide', 'L’ID doit être un identifiant Discord valide.')]
      });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const whitelist = Array.isArray(config.whitelist) ? config.whitelist : [];

    if (whitelist.includes(userId)) {
      return message.reply({
        embeds: [errorEmbed('Déjà Autorisé', `L’ID \`${userId}\` est déjà dans la whitelist.`)]
      });
    }

    whitelist.push(userId);
    config.whitelist = whitelist;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return message.reply({
      embeds: [
        successEmbed(
          'Whitelist Mise à Jour ✅',
          `L’ID \`${userId}\` a été ajouté à la whitelist.`
        )
      ]
    });
  }
};