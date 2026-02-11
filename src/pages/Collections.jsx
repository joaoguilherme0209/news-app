import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FolderPlus, Trash2 } from 'lucide-react';
import * as collectionsApi from '@/api/collections.js';
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
import { Card, CardContent } from '@/components/ui/card';
import { setPageStatus } from '@/store/uiSlice.js';

export function Collections() {
  const [collections, setCollections] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.ui.collections);
  const loading = status === 'pending';

  const load = async () => {
    dispatch(setPageStatus({ page: 'collections', status: 'pending' }));
    try {
      const res = await collectionsApi.getCollections();
      setCollections(res.data?.collections || []);
      dispatch(setPageStatus({ page: 'collections', status: 'succeeded' }));
    } catch (err) {
      setCollections([]);
      dispatch(
        setPageStatus({
          page: 'collections',
          status: 'failed',
          error: err.response?.data?.message || 'Erro ao carregar coleções.',
        }),
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;
    const collectionId = collectionToDelete.id;
    setDeleting(true);
    try {
      await collectionsApi.deleteCollection(collectionId);
      addToast('Coleção excluída.');
      setCollectionToDelete(null);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao excluir coleção.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await collectionsApi.createCollection(name);
      addToast('Coleção criada.');
      setNewName('');
      setModalOpen(false);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao criar coleção.', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Minhas coleções</h1>
        {!loading && collections.length > 0 && (
          <Button onClick={() => setModalOpen(true)}>Nova coleção</Button>
        )}
      </div>
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Ainda não há coleções</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Você ainda não criou nenhuma coleção. Comece criando sua primeira coleção
              para organizar e salvar as notícias que mais interessam.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => setModalOpen(true)}>Criar coleção</Button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => {
            const count = c.articles?.length ?? 0;
            const label =
              count === 1 ? '1 artigo salvo' : `${count} artigos salvos`;

            return (
              <li key={c.id}>
                <Link to={`/collections/${c.id}`}>
                  <Card className="bg-card/90 border-border/60 shadow-sm transition-colors hover:bg-accent/60">
                    <CardContent className="p-4 h-full flex flex-col justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">
                          {c.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {label}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4"
                        >
                          Ver detalhes
                        </Button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCollectionToDelete(c);
                          }}
                          className="flex items-center justify-center size-9 rounded-full border border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Excluir coleção ${c.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Dialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir coleção</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a coleção &quot;{collectionToDelete?.name}&quot;? Os artigos
            salvos nela não serão mais exibidos nesta coleção.
          </p>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button type="button" variant="outline" onClick={() => setCollectionToDelete(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova coleção</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="collection-name">Nome</Label>
              <Input
                id="collection-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Leitura da semana"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating || !newName.trim()}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
