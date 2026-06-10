import { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, Smartphone, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { db } from '../../services/supabaseClient';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await db.login(email, password);
      if (error) {
        setErrorMsg((error as any).message || 'Credenciais inválidas ou erro de conexão.');
      } else {
        if (data.user.role === 'operator') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setErrorMsg('Erro inesperado de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'operator' | 'citizen') => {
    setLoading(true);
    const demoEmail = role === 'operator' ? 'operador@prefeitura.gov.br' : 'cidadao@exemplo.com';
    const { data } = await db.login(demoEmail, 'demo123', true);
    if (role === 'operator') {
      navigate('/admin');
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-semibold text-white">UrbanGuard</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Sistema de Gestão<br />Urbana Colaborativo
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Conectando cidadãos e administradores públicos para construir cidades mais seguras e eficientes.
          </p>
        </div>
        <div className="text-sm text-white/70">
          © 2026 UrbanGuard. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">UrbanGuard</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais para acessar o sistema</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full h-12 pl-12 pr-4 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember and forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring" />
                <span className="text-sm text-foreground">Lembrar de mim</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 active:opacity-60 transition-all flex items-center justify-center"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Quick access buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('operator')}
                className="h-12 px-4 bg-card border border-border rounded-lg text-foreground font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Entrar como Admin (Demo)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('citizen')}
                className="h-12 px-4 bg-card border border-border rounded-lg text-foreground font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                App Cidadão (Demo)
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-primary font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
