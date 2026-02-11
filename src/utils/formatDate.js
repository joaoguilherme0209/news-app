/**
 * Formata data ISO para exibição (ex: "9 de fev. de 2025")
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
