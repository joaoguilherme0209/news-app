import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Bookmark, Plus } from 'lucide-react';
import { searchNews, getAllNews, getFavoriteTopicsNews } from '@/api/news.js';
import { ArticleCard } from '@/components/ArticleCard.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setPageStatus } from '@/store/uiSlice.js';
import { hasFavoriteTopics, FAVORITE_TOPICS } from '@/constants/topics.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/contexts/ToastContext.jsx';

const TAB_ALL = 'all';
const TAB_FAVORITES = 'favorites';

export function Search() {
  const [activeTab, setActiveTab] = useState(TAB_ALL);
  const [topic, setTopic] = useState('');
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [feedLabel, setFeedLabel] = useState(null);
  const [isSearchResult, setIsSearchResult] = useState(false);
  const FEED_PAGE_SIZE = 9;
  const SEARCH_PAGE_SIZE = 12;
  const inputRef = useRef(null);
  const topRef = useRef(null);
  const isInitialMount = useRef(true);
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.ui.search);
  const loading = status === 'pending';
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const hasFavorites = hasFavoriteTopics(user?.favoriteTopics);
  const [addTopicsModalOpen, setAddTopicsModalOpen] = useState(false);
  const [modalSelectedTopics, setModalSelectedTopics] = useState([]);
  const [savingTopics, setSavingTopics] = useState(false);

  const clearAndPending = () => {
    setArticles([]);
    setTotalResults(0);
    setFeedLabel(null);
    dispatch(setPageStatus({ page: 'search', status: 'pending' }));
  };

  /** Tab "Todas": top-headlines, sem filtro de favoritos */
  const loadAllNews = async (p = 1) => {
    let cancelled = false;
    clearAndPending();
    setIsSearchResult(false);
    try {
      const res = await getAllNews(p, FEED_PAGE_SIZE);
      if (cancelled) return;
      const data = res?.data ?? res;
      const list = Array.isArray(data?.articles) ? data.articles : [];
      setArticles(list);
      setTotalResults(data?.totalResults ?? list.length);
      setPage(data?.page ?? p);
      setFeedLabel('Todas as notícias');
      dispatch(setPageStatus({ page: 'search', status: 'succeeded' }));
    } catch (err) {
      if (cancelled) return;
      dispatch(
        setPageStatus({
          page: 'search',
          status: 'failed',
          error: err.response?.data?.message || 'Erro ao carregar notícias.',
        }),
      );
      setArticles([]);
      setFeedLabel(null);
    }
    return () => { cancelled = true; };
  };

  /** Tab "Meus tópicos": apenas favoriteTopics */
  const loadFeed = async (p = 1) => {
    let cancelled = false;
    clearAndPending();
    setIsSearchResult(false);
    try {
      const res = await getFavoriteTopicsNews(p, FEED_PAGE_SIZE);
      if (cancelled) return;
      const data = res?.data ?? res;
      const list = Array.isArray(data?.articles) ? data.articles : [];
      setArticles(list);
      setTotalResults(data?.totalResults ?? list.length);
      setPage(data?.page ?? p);
      setFeedLabel(data?.fromFavorites ? 'Meus tópicos' : 'Top notícias');
      dispatch(setPageStatus({ page: 'search', status: 'succeeded' }));
    } catch (err) {
      if (cancelled) return;
      dispatch(
        setPageStatus({
          page: 'search',
          status: 'failed',
          error: err.response?.data?.message || 'Erro ao carregar notícias.',
        }),
      );
      setArticles([]);
      setFeedLabel(null);
    }
    return () => { cancelled = true; };
  };

  /** Busca por termo (só na tab "Todas") */
  const search = async (p = 1) => {
    const q = topic.trim();
    if (!q) return;
    clearAndPending();
    setIsSearchResult(true);
    try {
      const { data } = await searchNews(q, p, SEARCH_PAGE_SIZE);
      setArticles(data?.articles || []);
      setTotalResults(data?.totalResults ?? 0);
      setPage(p);
      setFeedLabel(null);
      dispatch(setPageStatus({ page: 'search', status: 'succeeded' }));
    } catch (err) {
      dispatch(
        setPageStatus({
          page: 'search',
          status: 'failed',
          error: err.response?.data?.message || 'Erro ao buscar notícias.',
        }),
      );
      setArticles([]);
    }
  };

  // Ao trocar de aba: carrega o feed correspondente
  useEffect(() => {
    if (activeTab === TAB_ALL) {
      const q = topic.trim();
      if (q.length >= 3) {
        const id = setTimeout(() => search(1), 400);
        return () => clearTimeout(id);
      }
      loadAllNews(1);
      return undefined;
    }
    if (activeTab === TAB_FAVORITES && hasFavorites) {
      loadFeed(1);
    } else if (activeTab === TAB_FAVORITES) {
      setArticles([]);
      setTotalResults(0);
      setFeedLabel(null);
      dispatch(setPageStatus({ page: 'search', status: 'succeeded' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, hasFavorites]);

  // Na aba "Todas": busca automática ao digitar (3+ letras) ou recarrega todas ao apagar
  useEffect(() => {
    if (activeTab !== TAB_ALL) return;

    const q = topic.trim();

    if (!q) {
      const id = setTimeout(() => loadAllNews(1), 600);
      return () => clearTimeout(id);
    }

    if (q.length < 3) return;

    const id = setTimeout(() => search(1), 800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, activeTab]);


  useEffect(() => {
    const handler = () => {
      if (inputRef.current) inputRef.current.focus();
    };
    window.addEventListener('focus-search', handler);
    return () => window.removeEventListener('focus-search', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === TAB_ALL && topic.trim().length >= 3) search(1);
  };

  const effectivePageSize = isSearchResult ? SEARCH_PAGE_SIZE : FEED_PAGE_SIZE;
  const totalPages = Math.ceil(totalResults / effectivePageSize) || 0;

  const scrollToTop = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const id = requestAnimationFrame(() => scrollToTop());
    return () => cancelAnimationFrame(id);
  }, [page]);

  const handlePrevPage = () => {
    if (page <= 1 || loading) return;
    if (isSearchResult) search(page - 1);
    else if (activeTab === TAB_ALL) loadAllNews(page - 1);
    else loadFeed(page - 1);
  };

  const handleNextPage = () => {
    if (page >= totalPages || loading) return;
    if (isSearchResult) search(page + 1);
    else if (activeTab === TAB_ALL) loadAllNews(page + 1);
    else loadFeed(page + 1);
  };

  const openAddTopicsModal = () => {
    setModalSelectedTopics(Array.isArray(user?.favoriteTopics) ? [...user.favoriteTopics] : []);
    setAddTopicsModalOpen(true);
  };

  const toggleModalTopic = (topic) => {
    setModalSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSaveTopics = async () => {
    setSavingTopics(true);
    try {
      await updateProfile({ favoriteTopics: modalSelectedTopics });
      addToast('Tópicos atualizados.');
      setAddTopicsModalOpen(false);
      if (activeTab === TAB_FAVORITES && modalSelectedTopics.length > 0) {
        loadFeed(1);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao salvar tópicos.', 'error');
    } finally {
      setSavingTopics(false);
    }
  };

  const showEmptyStateFavorites = activeTab === TAB_FAVORITES && !hasFavorites && !loading;
  const showFeedOrGrid = !showEmptyStateFavorites;

  return (
    <div ref={topRef} className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Buscar notícias</h1>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => !loading && setActiveTab(TAB_ALL)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === TAB_ALL
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            } ${loading ? 'pointer-events-none opacity-60' : ''}`}
          >
            Todas as notícias
          </button>
          <button
            type="button"
            onClick={() => !loading && setActiveTab(TAB_FAVORITES)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === TAB_FAVORITES
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            } ${loading ? 'pointer-events-none opacity-60' : ''}`}
          >
            Meus tópicos
          </button>
        </div>
      </div>

      {/* Busca só na aba "Todas" */}
      {activeTab === TAB_ALL && (
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: crypto, AI, tech..."
            className="flex-1 min-w-[200px]"
            aria-label="Tópico de busca"
            ref={inputRef}
          />
          <Button type="submit" disabled={loading || topic.trim().length < 3}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      )}

      {showEmptyStateFavorites && (
        <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Bookmark className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h2 className="text-lg font-semibold">Nenhum tópico favorito</h2>
            <p className="text-sm text-muted-foreground">
              Escolha os tópicos que você quer acompanhar para ver notícias personalizadas aqui.
            </p>
          </div>
          <Button onClick={openAddTopicsModal}>
            <Plus className="size-4 mr-2" />
            Adicionar tópicos
          </Button>
        </div>
      )}

      {error && showFeedOrGrid && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      {loading && showFeedOrGrid && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && showFeedOrGrid && feedLabel && articles.length > 0 && (
        <p className="text-muted-foreground font-medium">{feedLabel}</p>
      )}

  

      {!loading && showFeedOrGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            <ArticleCard key={article.url + i} article={article} />
          ))}
        </div>
      )}

      {!loading && showFeedOrGrid && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={page <= 1 || loading}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={page >= totalPages || loading}
          >
            Próxima
          </Button>
        </div>
      )}

      <Dialog open={addTopicsModalOpen} onOpenChange={setAddTopicsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar tópicos favoritos</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Selecione as categorias de notícias que você quer ver no feed &quot;Meus tópicos&quot;.
          </p>
          <div className="flex flex-wrap gap-2 py-2">
            {FAVORITE_TOPICS.map((topic) => (
              <label
                key={topic}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                  modalSelectedTopics.includes(topic)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Checkbox
                  checked={modalSelectedTopics.includes(topic)}
                  className="h-3.5 w-3.5"
                  onCheckedChange={() => toggleModalTopic(topic)}
                />
                <span className="capitalize">{topic}</span>
              </label>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button type="button" variant="outline" onClick={() => setAddTopicsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveTopics} disabled={savingTopics}>
              {savingTopics ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
