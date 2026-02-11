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

// Mapa de rótulos em português para exibição no front
const FAVORITE_TOPIC_LABELS = {
  business: 'Negócios',
  entertainment: 'Entretenimento',
  general: 'Geral',
  health: 'Saúde',
  science: 'Ciência',
  sports: 'Esportes',
  technology: 'Tecnologia',
};

/** Retorna o rótulo em português para um tópico favorito. */
export function getFavoriteTopicLabel(topic) {
  return FAVORITE_TOPIC_LABELS[topic] ?? topic;
}

/** Retorna true se o usuário tem pelo menos um tópico favorito válido (da lista permitida). */
export function hasFavoriteTopics(topics) {
  if (!Array.isArray(topics)) return false;
  return topics.some((t) => typeof t === 'string' && FAVORITE_TOPICS.includes(t.trim()));
}
