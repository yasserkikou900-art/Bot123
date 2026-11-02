/**
 * Convertit une chaîne de durée (ex: "10s", "15m", "2h", "1d") en millisecondes.
 */
function parseDuration(str) {
  if (!str) return null;
  const match = str.toLowerCase().match(/^(\d+)\s*(s|m|h|d|j|w|sem)$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
    case 'j':
      return value * 24 * 60 * 60 * 1000;
    case 'w':
    case 'sem':
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

/**
 * Formate un nombre de millisecondes en texte lisible en français
 */
function formatDuration(ms) {
  if (ms < 1000) return 'moins d\'une seconde';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`);

  return parts.join(', ') || '0 seconde';
}

module.exports = {
  parseDuration,
  formatDuration
};
