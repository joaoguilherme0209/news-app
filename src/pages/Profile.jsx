import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/contexts/ToastContext.jsx';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FAVORITE_TOPICS, getFavoriteTopicLabel } from '@/constants/topics.js';
const FREQUENCIES = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'never', label: 'Nunca' },
];

export function Profile() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [favoriteTopics, setFavoriteTopics] = useState([]);
  const [emailFrequency, setEmailFrequency] = useState('weekly');
  const [initialFavoriteTopics, setInitialFavoriteTopics] = useState([]);
  const [initialEmailFrequency, setInitialEmailFrequency] = useState('weekly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const favs = user.favoriteTopics || [];
      const safeFrequency =
        FREQUENCIES.find((f) => f.value === user.emailFrequency)?.value || 'weekly';
      setFavoriteTopics(favs);
      setEmailFrequency(safeFrequency);
      setInitialFavoriteTopics(favs);
      setInitialEmailFrequency(safeFrequency);
    }
  }, [user]);

  const toggleTopic = (topic) => {
    setFavoriteTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ favoriteTopics, emailFrequency });
      addToast('Perfil atualizado.');
      setInitialFavoriteTopics(favoriteTopics);
      setInitialEmailFrequency(emailFrequency);
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro ao atualizar perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const selectedFrequency =
    FREQUENCIES.find((f) => f.value === emailFrequency)?.label || 'Semanal';
  const topicsChanged =
    initialFavoriteTopics.length !== favoriteTopics.length ||
    initialFavoriteTopics.some((t) => !favoriteTopics.includes(t));
  const frequencyChanged = initialEmailFrequency !== emailFrequency;
  const hasChanges = topicsChanged || frequencyChanged;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          {user.email?.charAt(0)?.toUpperCase() ?? 'U'}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus tópicos favoritos e como quer receber o resumo das notícias.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Configurações da conta</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Preferências salvas no servidor
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Tópicos favoritos</Label>
                <p className="text-muted-foreground text-xs">
                  Usados na busca inicial de notícias e para montar o seu feed personalizado.
                </p>
                <div className="flex flex-wrap gap-2">
                  {FAVORITE_TOPICS.map((topic) => {
                    const checked = favoriteTopics.includes(topic);
                    return (
                      <label
                        key={topic}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                          checked
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          className="h-3 w-3"
                          onCheckedChange={() => toggleTopic(topic)}
                        />
                        <span className="capitalize">{getFavoriteTopicLabel(topic)}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Selecionados: <span className="font-medium">{favoriteTopics.length}</span>
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="profile-frequency">Resumo por e-mail</Label>
                <p className="text-muted-foreground text-xs">
                  Escolha com que frequência você quer receber um resumo das principais notícias
                  dos seus tópicos favoritos.
                </p>
                <Select
                  value={emailFrequency}
                  onValueChange={(val) => {
                    const safeVal =
                      FREQUENCIES.find((f) => f.value === val)?.value || 'weekly';
                    setEmailFrequency(safeVal);
                  }}
                >
                  <SelectTrigger id="profile-frequency" className="w-full">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Frequência atual:{' '}
                  <span className="font-medium">
                    {selectedFrequency}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t pt-4 mt-2">
              <Button type="submit" disabled={loading || !hasChanges}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
