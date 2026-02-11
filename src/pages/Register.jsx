import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [favoriteTopics, setFavoriteTopics] = useState([]);
  const [emailFrequency, setEmailFrequency] = useState('weekly');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleTopic = (topic) => {
    setFavoriteTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        email,
        password,
        favoriteTopics: favoriteTopics.length ? favoriteTopics : undefined,
        emailFrequency,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 bg-muted/30">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Cadastro</CardTitle>
            <CardDescription>Crie sua conta e escolha seus tópicos favoritos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reg-email">E-mail</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Senha</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Tópicos favoritos</Label>
                <div className="flex flex-wrap gap-3">
                  {FAVORITE_TOPICS.map((topic) => (
                    <label key={topic} className="inline-flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={favoriteTopics.includes(topic)}
                        onCheckedChange={() => toggleTopic(topic)}
                      />
                      <span className="text-sm">{getFavoriteTopicLabel(topic)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-frequency">Frequência de e-mail</Label>
                <Select value={emailFrequency} onValueChange={setEmailFrequency}>
                  <SelectTrigger id="reg-frequency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
        <p className="text-center text-muted-foreground text-sm mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
