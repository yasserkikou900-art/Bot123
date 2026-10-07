const config = require('../config.json');
const db = require('../utils/database');
const { warningEmbed } = require('../utils/embeds');
const { PermissionFlagsBits } = require('discord.js');

// Regex de détection des invitations Discord et liens internet
const INVITE_REGEX = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9_.-]+/i;
const GENERAL_LINK_REGEX = /https?:\/\/[^\s]+/i;

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    // --- 1. FILTRE SÉCURITÉ ANTI-LINK ---
    const isAntiLinkOn = db.isAntiLinkEnabled(message.guild.id);
    const hasModBypass = message.member.permissions.has(PermissionFlagsBits.ManageGuild) ||
                         message.member.permissions.has(PermissionFlagsBits.Administrator);

    if (isAntiLinkOn && !hasModBypass) {
      if (INVITE_REGEX.test(message.content) || GENERAL_LINK_REGEX.test(message.content)) {
        try {
          await message.delete();
          const warnMsg = await message.channel.send({
            content: `${message.author}`,
            embeds: [
              warningEmbed(
                'Lien Interdit Détecté',
                `${message.author}, les invitations et liens externes sont strictement interdits dans ce salon !`
              )
            ]
          });
          setTimeout(() => {
            warnMsg.delete().catch(() => {});
          }, 5000);
          return;
        } catch (err) {
          console.error('Erreur suppression message anti-link:', err);
        }
      }
    }

    // --- 2. VÉRIFICATION DU PRÉFIXE ---
    const prefix = process.env.PREFIX || config.prefix || '=';
    if (!message.content.startsWith(prefix)) return;

    // --- 3. WHITELIST ---
    const whitelist = Array.isArray(config.whitelist) ? config.whitelist : [];
    if (!whitelist.includes(message.author.id)) {
      return message.reply({
        content: '❌ Vous n\'avez pas la permission d\'utiliser ce bot.'
      }).catch(() => {});
    }

    // --- 4. VÉRIFICATION BLACKLIST ---
    if (db.isBlacklisted(message.author.id)) {
      return message.reply({
        content: `❌ Vous êtes placé sur la liste noire (**Blacklist**) et ne pouvez plus exécuter de commandes.`
      }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    // Découpage de la commande et des arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) ||
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Exécution sécurisée
    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
      message.reply({
        content: '⚠️ Une erreur inattendue est survenue lors de l\'exécution de cette commande.'
      }).catch(() => {});
    }
  }
};