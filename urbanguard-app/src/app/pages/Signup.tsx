import { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, User, Phone, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { db } from '../../services/supabaseClient';

export function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMsg('Você precisa aceitar os Termos de Uso.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await db.signUp(formData.email, formData.password, formData.name);
      if (error) {
        setErrorMsg((error as any).message || 'Erro ao realizar cadastro.');
      } else {
        setSuccessMsg('Cadastro efetuado! Você será redirecionado para o login.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg('Erro inesperado de cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
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
            Faça parte da<br />transformação urbana
          </h1>
          <p className="text-lg text-white/90 leading-relaxed mb-8">
            Ajude a construir uma cidade melhor reportando problemas e acompanhando melhorias em tempo real.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Reporte problemas</h3>
                <p className="text-white/80 text-sm">Identifique e compartilhe problemas urbanos com fotos e localização</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Acompanhe soluções</h3>
                <p className="text-white/80 text-sm">Receba atualizações em tempo real sobre o status dos incidentes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Colabore com a comunidade</h3>
                <p className="text-white/80 text-sm">Apoie reportes de outros cidadãos e priorize ações</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-white/70">
          © 2026 UrbanGuard. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">UrbanGuard</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">Criar conta</h2>
            <p className="text-sm text-muted-foreground">Preencha os dados abaixo para começar</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="João Silva"
                  className="w-full h-12 pl-12 pr-4 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full h-12 pl-12 pr-4 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(11) 98765-4321"
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
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

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring mt-0.5 flex-shrink-0"
                  required
                />
                <span className="text-sm text-foreground">
                  Eu aceito os{' '}
                  <a href="#" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a href="#" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 active:opacity-60 transition-all flex items-center justify-center"
            >
              {loading ? 'Criando Conta...' : 'Criar conta'}
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
