import api from './client.js';

export const searchNews = (topic, page = 1, pageSize = 20) =>
  api
    .get('/news/search', { params: { topic, page, pageSize } })
    .then((res) => res.data);

/** Todas as notícias (top-headlines), sem filtro de favoritos */
export const getAllNews = (page = 1, pageSize = 9) =>
  api
    .get('/news/all', { params: { page, pageSize } })
    .then((res) => res.data);

/** Notícias apenas dos tópicos favoritos do usuário */
export const getFavoriteTopicsNews = (page = 1, pageSize = 9) =>
  api
    .get('/news/favorites', { params: { page, pageSize } })
    .then((res) => res.data);
