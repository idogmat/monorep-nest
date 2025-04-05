export function parseTimeToSeconds(timeStr: string): number {
  // Регулярное выражение для парсинга
  const match = timeStr.match(/^(\d+)(s|m|h)?$/);

  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] || 's'; // По умолчанию считаем секундами

  // Множители для разных единиц измерения
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
  };

  if (!(unit in multipliers)) {
    throw new Error(`Unknown time unit: ${unit}`);
  }

  return value * multipliers[unit as keyof typeof multipliers];
}