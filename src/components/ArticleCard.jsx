import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/formatDate.js';
import { SaveToCollectionModal } from './SaveToCollectionModal.jsx';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ArticleCard({ article, onSave, showSave = true, onRemove, removing }) {
  const [modalOpen, setModalOpen] = useState(false);
  const source = typeof article.source === 'string' ? article.source : article.source?.name;
  const isInCollection = typeof onRemove === 'function';

  return (
    <>
      <Card className="overflow-hidden flex flex-col h-full relative">
        {isInCollection && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRemove(article.id);
            }}
            disabled={removing}
            className="absolute top-2 right-2 z-10 flex items-center justify-center size-8 rounded-full border border-destructive/40 bg-background/90 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            aria-label="Remover da coleção"
          >
            <Trash2 className="size-4" />
          </button>
        )}
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="w-full h-48 bg-muted/40 overflow-hidden">
            {article.urlToImage ? (
              <img
                src={article.urlToImage}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  // fallback para skeleton se a imagem falhar
                  e.currentTarget.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-full bg-muted animate-pulse';
                  e.currentTarget.parentElement?.appendChild(placeholder);
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted animate-pulse" aria-hidden="true" />
            )}
          </div>
        </a>
        <CardContent className="p-4 flex-1 flex flex-col h-[170px]">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-foreground hover:text-primary line-clamp-2 block leading-tight"
          >
            {article.title}
          </a>
          {(source || article.publishedAt) && (
            <p className="text-muted-foreground text-sm mt-1">
              {source && <span>{source}</span>}
              {source && article.publishedAt && ' · '}
              {article.publishedAt && formatDate(article.publishedAt)}
            </p>
          )}
          {article.description && (
            <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
              {article.description}
            </p>
          )}
        </CardContent>
        {showSave && !isInCollection && (
          <CardFooter className="p-4 pt-0 h-[52px] flex items-center">
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setModalOpen(true)}>
              Salvar em coleção
            </Button>
          </CardFooter>
        )}
      </Card>
      <SaveToCollectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        article={article}
        onSaved={onSave}
      />
    </>
  );
}
