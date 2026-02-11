import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Archive, ArrowLeft } from 'lucide-react';
import * as collectionsApi from '@/api/collections.js';
import { ArticleCard } from '@/components/ArticleCard.jsx';
import { useToast } from '@/contexts/ToastContext.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setPageStatus } from '@/store/uiSlice.js';

export function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [articleToRemove, setArticleToRemove] = useState(null);
  const [deleteCollectionModalOpen, setDeleteCollectionModalOpen] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(false);
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.ui.collectionDetail);
  const loading = status === 'pending';

  const load = async () => {
    dispatch(setPageStatus({ page: 'collectionDetail', status: 'pending' }));
    try {
      const res = await collectionsApi.getCollectionById(id);
      const c = res.data?.collection;
      setCollection(c || null);
      setEditName(c?.name ?? '');
      dispatch(setPageStatus({ page: 'collectionDetail', status: 'succeeded' }));
    } catch (err) {
      setCollection(null);
      dispatch(
        setPageStatus({
          page: 'collectionDetail',
          status: 'failed',
          error: err.response?.data?.message || 'Erro ao carregar coleção.',
        }),
      );
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await collectionsApi.updateCollection(id, editName.trim());
      addToast('Nome atualizado.');
      setEditModalOpen(false);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao atualizar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async () => {
    setDeletingCollection(true);
    try {
      await collectionsApi.deleteCollection(id);
      addToast('Coleção excluída.');
      setDeleteCollectionModalOpen(false);
      navigate('/collections');
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao excluir.', 'error');
    } finally {
      setDeletingCollection(false);
    }
  };

  const handleRemoveArticle = async (articleId) => {
    setArticleToRemove(null);
    setRemoving(articleId);
    try {
      await collectionsApi.removeArticleFromCollection(id, articleId);
      addToast('Artigo removido da coleção.');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao remover.', 'error');
    } finally {
      setRemoving(null);
    }
  };

  const handleRequestRemoveArticle = (articleId) => {
    const art = (collection?.articles || []).find((a) => a.id === articleId);
    if (art) setArticleToRemove(art);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-muted-foreground py-8">
        Coleção não encontrada.{' '}
        <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/collections')}>
          Voltar às coleções
        </Button>
      </div>
    );
  }

  const articles = collection.articles || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/collections')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight flex-1">{collection.name}</h1>
        <Button variant="outline" onClick={() => setEditModalOpen(true)}>
          Editar nome
        </Button>
        <Button variant="destructive" onClick={() => setDeleteCollectionModalOpen(true)}>
          Excluir coleção
        </Button>
      </div>
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Archive className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Nenhum artigo nesta coleção</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Os artigos que você salvar nesta coleção aparecerão aqui. Use a busca para encontrar
              notícias e adicioná-las a esta coleção.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <ArticleCard
              key={art.id}
              article={art}
              showSave={false}
              onRemove={handleRequestRemoveArticle}
              removing={removing === art.id}
            />
          ))}
        </div>
      )}
      <Dialog open={!!articleToRemove} onOpenChange={(open) => !open && setArticleToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover artigo da coleção</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover este artigo da coleção?
            {articleToRemove?.title && (
              <span className="mt-2 block font-medium text-foreground line-clamp-2">
                "{articleToRemove.title}"
              </span>
            )}
          </p>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setArticleToRemove(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => articleToRemove && handleRemoveArticle(articleToRemove.id)}
              disabled={removing !== null}
            >
              {removing !== null ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteCollectionModalOpen} onOpenChange={setDeleteCollectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir coleção</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a coleção &quot;{collection?.name}&quot;? Todos os artigos
            salvos nela não serão mais exibidos nesta coleção.
          </p>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteCollectionModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCollection}
              disabled={deletingCollection}
            >
              {deletingCollection ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateName}>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da coleção</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || !editName.trim()}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
