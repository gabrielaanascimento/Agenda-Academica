export const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const ACTIVITY_TYPES = {
  PROVA: { label: 'Prova', badge: 'bg-red-100 text-red-700 border-red-200' },
  TRABALHO: { label: 'Trabalho', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  LISTA: { label: 'Lista', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  SEMINARIO: { label: 'Seminário', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  OUTRO: { label: 'Outro', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export function getCalendarDays(year, month) {
  // month: 1-12
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0 (Dom) - 6 (Sáb)
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function extractUTCDateParts(isoString) {
  const d = new Date(isoString);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

export function formatDateBR(isoString) {
  if (!isoString) return '';
  const { year, month, day } = extractUTCDateParts(isoString);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function toInputDateValue(isoString) {
  if (!isoString) return '';
  const { year, month, day } = extractUTCDateParts(isoString);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
