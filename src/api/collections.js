import api from './client.js';

export const getCollections = () =>
  api.get('/collections').then((res) => res.data);

export const getCollectionById = (id) =>
  api.get(`/collections/${id}`).then((res) => res.data);

export const createCollection = (name) =>
  api.post('/collections', { name }).then((res) => res.data);

export const updateCollection = (id, name) =>
  api.put(`/collections/${id}`, { name }).then((res) => res.data);

export const deleteCollection = (id) =>
  api.delete(`/collections/${id}`).then((res) => res.data);

export const addArticleToCollection = (collectionId, article) =>
  api.post(`/collections/${collectionId}/articles`, article).then((res) => res.data);

export const removeArticleFromCollection = (collectionId, articleId) =>
  api
    .delete(`/collections/${collectionId}/articles/${articleId}`)
    .then((res) => res.data);
