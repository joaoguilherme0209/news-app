import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as collectionsApi from '@/api/collections.js';
import { useToast } from '@/contexts/ToastContext.jsx';

export function SaveToCollectionModal({ open, onClose, article, onSaved }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (open) {
      setNewName('');
      collectionsApi
        .getCollections()
        .then((res) => setCollections(res.data?.collections || []))
        .catch(() => setCollections([]));
    }
  }, [open]);

  const articlePayload = article
    ? {
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
        description: article.description,
        urlToImage: article.urlToImage,
        source: article.source?.name ?? article.source,
        author: article.author,
      }
    : null;

  const handleSaveTo = async (collectionId) => {
    if (!articlePayload) return;
    setLoading(true);
    try {
      await collectionsApi.addArticleToCollection(collectionId, articlePayload);
      addToast('Artigo salvo na coleção.');
      onSaved?.();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndSave = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !articlePayload) return;
    setCreating(true);
    try {
      const { data } = await collectionsApi.createCollection(name);
      const id = data?.collection?.id;
      if (id) {
        await collectionsApi.addArticleToCollection(id, articlePayload);
        addToast('Coleção criada e artigo salvo.');
        onSaved?.();
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao criar coleção.', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar em coleção</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {collections.length === 0 && !newName && (
            <p className="text-muted-foreground text-sm">Crie uma coleção abaixo para salvar o artigo.</p>
          )}
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label>Escolher coleção</Label>
              <div className="flex flex-col gap-2">
                {collections.map((c) => (
                  <Button
                    key={c.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSaveTo(c.id)}
                    disabled={loading}
                  >
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleCreateAndSave} className="space-y-2">
            <Label htmlFor="new-collection-name">Nova coleção</Label>
            <div className="flex gap-2">
              <Input
                id="new-collection-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da coleção"
                className="flex-1"
              />
              <Button type="submit" disabled={creating || !newName.trim()}>
                Criar e salvar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
