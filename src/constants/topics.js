/** Categorias da News API (parâmetro category). Usadas como opções de favoriteTopics. */
export const FAVORITE_TOPICS = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
];

/** Retorna true se o usuário tem pelo menos um tópico favorito válido (da lista permitida). */
export function hasFavoriteTopics(topics) {
  if (!Array.isArray(topics)) return false;
  return topics.some((t) => typeof t === 'string' && FAVORITE_TOPICS.includes(t.trim()));
}
