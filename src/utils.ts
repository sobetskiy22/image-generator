/** P% для лонга: ((Ціна закриття − Ціна входу) / Ціна входу) × Плече × 100 */
export function percentLong(entry: number, close: number, leverage = 1): number {
  if (entry <= 0) throw new Error('entry must be > 0');
  return ((close - entry) / entry) * leverage * 100;
}

/** P% для шорта: ((Ціна входу − Ціна закриття) / Ціна входу) × Плече × 100 */
export function percentShort(entry: number, close: number, leverage = 1): number {
  if (entry <= 0) throw new Error('entry must be > 0');
  return ((entry - close) / entry) * leverage * 100;
}

/** Узагальнена функція для обох напрямків */
export function percentPnL(
  entry: number,
  close: number,
  side: number,
  leverage = 1
): number {
  if (entry <= 0) throw new Error('entry must be > 0');
  const base = (close - entry) / entry;             // базова зміна без плеча
  const signed = side === 0 ? base : -base;    // інвертуємо для шорта
  return signed * leverage * 100;
}

// приклади
// percentLong(100, 110, 5)  => 50
// percentShort(100, 90, 3)  => 30
// percentPnL(100, 95, 'long', 2)  => -10
