// Aucune lib de date installée (bundle < 30 Mo, CLAUDE_LYXO_V3.md §15.1) —
// calculs manuels suffisants pour une grille calendrier/streak.

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export type GreetingPeriod = 'morning' | 'afternoon' | 'evening';

export function getGreetingPeriod(date: Date = new Date()): GreetingPeriod {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// Grille mensuelle, semaines commençant le lundi (référence design) — `null`
// comble les cases avant le 1er / après le dernier jour du mois.
export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Lundi = 0

  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// Les N derniers jours (le plus ancien en premier) — module streak "Last 2 Weeks".
export function getLastNDays(n: number, from: Date = new Date()): Date[] {
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}
