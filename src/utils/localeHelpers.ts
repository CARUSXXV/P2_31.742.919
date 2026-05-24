// Helpers para formatear fechas y montos según el idioma/región

export function formatDate(date: Date, locale: string) {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-VE' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale !== 'es',
  }).format(date);
}

export function formatCurrency(amount: number, locale: string) {
  if (locale === 'es') {
    return `USD $${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
  } else {
    return `USD $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}
