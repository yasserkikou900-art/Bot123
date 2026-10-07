const fs = require('fs');
const path = require('path');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

const OWNER_ID = '754703887738470482';

module.exports = {
  name: 'removewhitelist',
  description: 'Supprime un ID de la whitelist',
  aliases: ['removewl', 'rmwl'],
  async execute(message, args, client) {
    if (message.author.id !== OWNER_ID) {
      return message.reply({
        embeds: [errorEmbed('Accès Refusé', 'Seul le propriétaire peut utiliser cette commande.')]
      });
    }

    if (!args[0]) {
      return message.reply({
        embeds: [errorEmbed('Usage Incorrect', 'Syntaxe : `=removewhitelist <id>`')]
      });
    }

    const userId = args[0];

    try {
      const configPath = path.join(__dirname, '../../config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!config.whitelist || !config.whitelist.includes(userId)) {
        return message.reply({
          embeds: [errorEmbed('Non Trouvé', `L'ID \`${userId}\` n'est pas dans la whitelist.`)]
        });
      }

      config.whitelist = config.whitelist.filter(id => id !== userId);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return message.reply({
        embeds: [
          successEmbed(
            'ID Retiré ✅',
            `L'ID \`${userId}\` a été retiré de la whitelist.`
          )
        ]
      });
    } catch (err) {
      console.error('Erreur removewhitelist:', err);
      return message.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de retirer de la whitelist.')]
      });
    }
  }
};