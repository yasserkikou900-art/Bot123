const fs = require('fs');
const path = require('path');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

const OWNER_ID = '754703887738470482';
const configPath = path.join(__dirname, '../../config.json');

module.exports = {
  name: 'unwhitelist',
  description: 'Supprime un ID de la whitelist du bot',
  aliases: ['unwl', 'removewl'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        embeds: [errorEmbed('Accès Refusé', 'Seul le propriétaire du bot peut utiliser cette commande.')]
      });
    }

    const userId = args[0];

    if (!userId) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=unwhitelist <id>`')]
      });
    }

    if (!/^\d{17,20}$/.test(userId)) {
      return message.reply({
        embeds: [errorEmbed('ID Invalide', 'L\'ID doit être un identifiant Discord valide.')]
      });
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const whitelist = Array.isArray(config.whitelist) ? config.whitelist : [];

      if (!whitelist.includes(userId)) {
        return message.reply({
          embeds: [errorEmbed('Non Trouvé', `L\'ID \`${userId}\` n\'est pas dans la whitelist.`)]
        });
      }

      const index = whitelist.indexOf(userId);
      whitelist.splice(index, 1);
      config.whitelist = whitelist;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return message.reply({
        embeds: [
          successEmbed(
            'Whitelist Mise à Jour ✅',
            `L\'ID \`${userId}\` a été supprimé de la whitelist.`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur unwhitelist:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de modifier la whitelist.')]
      });
    }
  }
};