/**
 * Landing — Tela inicial do Quotify
 * Login com email/senha + Cadastro + Como funciona + WhatsApp
 * Design: Minimalista premium, SaaS moderno, mobile-first
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Smartphone,
  ArrowLeftRight,
  Calculator,
  MessageCircle,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  LogIn,
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const STEPS = [
  {
    icon: Smartphone,
    title: "Escolha o produto",
    description: "Selecione entre iPhones, iPads, MacBooks, Apple Watch e acessórios com todos os modelos e armazenamentos",
  },
  {
    icon: ArrowLeftRight,
    title: "Calcule a troca",
    description: "Informe o aparelho usado do cliente e aplique descontos por condição — tela, bateria, botões e mais",
  },
  {
    icon: Calculator,
    title: "Orçamento automático",
    description: "O sistema calcula o valor final com taxas de parcelamento da maquininha, bônus e abatimentos em tempo real",
  },
  {
    icon: MessageCircle,
    title: "Envie pelo WhatsApp",
    description: "Gere o orçamento formatado com todos os detalhes e envie direto ao cliente em um clique",
  },
];

const FEATURES = [
  { icon: Zap, title: "Orçamento instantâneo", description: "Gere orçamentos completos em segundos" },
  { icon: ArrowLeftRight, title: "Cálculo de troca", description: "Valor exato do usado com descontos por condição" },
  { icon: Shield, title: "Taxas da maquininha", description: "Parcelamento com as taxas reais aplicadas" },
];

type ViewMode = "landing" | "login" | "register";

export default function Landing() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: publicSettings } = trpc.settings.getPublic.useQuery();
  const { theme, toggleTheme } = useTheme();

  const [view, setView] = useState<ViewMode>("landing");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regStoreName, setRegStoreName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  // Redirect authenticated active users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if ((user as any).status === "active" || (user as any).role === "admin") {
        setLocation("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const utils = trpc.useUtils();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword,
      });

      if (!result.success) {
        setLoginError(result.error || "Erro ao fazer login");
        setLoginLoading(false);
        return;
      }

      // Store the session token in localStorage as fallback for browsers that block cookies
      if ((result as any).token) {
        localStorage.setItem("quotify_session_token", (result as any).token);
      }

      // Invalidate auth cache and redirect
      await utils.auth.me.invalidate();
      window.location.href = "/dashboard";
    } catch (err: any) {
      setLoginError(err?.message || "Erro ao fazer login");
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (regPassword !== regConfirmPassword) {
      setRegError("As senhas não coincidem");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setRegLoading(true);

    try {
      const result = await registerMutation.mutateAsync({
        name: regName,
        email: regEmail,
        password: regPassword,
        storeName: regStoreName || undefined,
        phone: regPhone || undefined,
      });

      if (!result.success) {
        setRegError(result.error || "Erro ao cadastrar");
        setRegLoading(false);
        return;
      }

      setRegSuccess(true);
      setRegLoading(false);
    } catch (err: any) {
      setRegError(err?.message || "Erro ao cadastrar");
      setRegLoading(false);
    }
  };

  const rawWhatsapp = publicSettings?.adminWhatsapp ?? "16562426925";
  const whatsappNumber = rawWhatsapp.replace(/[^\d]/g, "");
  const whatsappMessage = encodeURIComponent("Olá! Quero fazer o teste grátis do Quotify.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Show status messages for authenticated but not active users
  const userStatus = (user as any)?.status;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ===== LOGIN VIEW =====
  if (view === "login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Back button + Theme toggle */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setView("landing")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367201543/ji3XHgPR7e79CMEH66Wkcf/quotify-logo_86d4c6b7.png" alt="Quotify" className="w-12 h-12 rounded-2xl object-contain" />
            <div>
              <span className="text-2xl font-bold tracking-tight text-foreground">Quotify</span>
              <p className="text-xs text-muted-foreground">Faça login para continuar</p>
            </div>
          </div>

          {/* Status messages for authenticated users */}
          {isAuthenticated && userStatus === "pending" && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Conta em análise</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                Sua conta está em análise. Entre em contato para liberação.
              </p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com o administrador
                </Button>
              </a>
            </div>
          )}

          {isAuthenticated && userStatus === "blocked" && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-5 text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">Conta bloqueada</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Conta bloqueada. Fale com o suporte.
              </p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com o suporte
                </Button>
              </a>
            </div>
          )}

          {/* Login form */}
          {!isAuthenticated && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20"
                size="lg"
              >
                {loginLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {loginLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}

          {/* Links */}
          <div className="mt-6 space-y-3">
            {!isAuthenticated && (
              <button
                onClick={() => setView("register")}
                className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Não tem conta? Criar conta
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar acesso pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ===== REGISTER VIEW =====
  if (view === "register") {
    if (regSuccess) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Cadastro enviado!</h2>
            <p className="text-muted-foreground mb-6">
              Aguarde liberação do administrador. Você receberá acesso em breve.
            </p>
            <div className="space-y-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com o administrador
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={() => { setView("login"); setRegSuccess(false); }}
                className="w-full py-6"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Ir para o login
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back button + Theme toggle */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("landing")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367201543/ji3XHgPR7e79CMEH66Wkcf/quotify-logo_86d4c6b7.png" alt="Quotify" className="w-12 h-12 rounded-2xl object-contain" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Quotify</h1>
              <p className="text-xs text-muted-foreground">Criar nova conta</p>
            </div>
          </div>

          {/* Register form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome completo *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome da loja</label>
              <input
                type="text"
                value={regStoreName}
                onChange={(e) => setRegStoreName(e.target.value)}
                placeholder="Nome da sua loja"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">WhatsApp</label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">E-mail *</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar senha *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {regError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                {regError}
              </div>
            )}

            <Button
              type="submit"
              disabled={regLoading}
              className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20"
              size="lg"
            >
              {regLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              {regLoading ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setView("login")}
              className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Já tem conta? Fazer login
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar acesso pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ===== LANDING VIEW (DEFAULT) =====
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
          {/* Logo + Theme toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367201543/ji3XHgPR7e79CMEH66Wkcf/quotify-logo_86d4c6b7.png" alt="Quotify" className="w-12 h-12 rounded-2xl object-contain" />
              <span className="text-2xl font-bold tracking-tight text-foreground">Quotify</span>
              {toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-5 leading-[1.1]">
              Menos cálculo.{" "}
              <span className="text-primary">Mais vendas.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium">
              O sistema inteligente de orçamento para lojistas de iPhone.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Button
              onClick={() => setView("login")}
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar
            </Button>
            <Button
              onClick={() => setView("register")}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-2 transition-all"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Criar conta
            </Button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full px-8 py-6 text-base font-semibold border-2 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-16">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-card rounded-full border border-border shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Por que usar o Quotify? */}
      <div className="relative py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              Por que usar o Quotify?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Transforme seu balcão em uma máquina de fechar vendas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Orçamento em até 10 segundos</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Gere simulações completas sem abrir calculadora.</p>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Cálculo automático de taxas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Parcelamento com as taxas reais aplicadas, sem erro.</p>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <ArrowLeftRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Upgrade com avaliação inteligente</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Abatimento automático por bateria e condição do aparelho.</p>
            </div>

            {/* Card 4 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Padronização para equipe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Seus vendedores seguem o mesmo padrão de orçamento.</p>
            </div>

            {/* Card 5 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Proteção de margem</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Evite erro manual que reduz seu lucro.</p>
            </div>

            {/* Card 6 */}
            <div className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Texto pronto para WhatsApp</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Orçamento organizado, profissional e fácil de entender.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Como funciona o Quotify
            </h2>
            <p className="text-muted-foreground">
              4 passos para gerar o orçamento completo com troca e parcelamento
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative group">
                  <div className="bg-background rounded-xl border border-border p-5 h-full transition-all hover:shadow-md hover:border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">
                        Passo {index + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg sm:text-xl font-semibold text-foreground/80 italic">
              "Calcule a troca, aplique as taxas e feche a venda — tudo em um só lugar."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Orçamentos profissionais para sua loja de Apple.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => setView("login")}
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Entrar no Quotify
          </Button>
          <Button
            onClick={() => setView("register")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Criar conta
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367201543/ji3XHgPR7e79CMEH66Wkcf/quotify-logo_86d4c6b7.png" alt="Quotify" className="w-7 h-7 rounded-lg object-contain" />
            <span className="text-sm font-semibold text-foreground">Quotify</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Quotify
          </p>
        </div>
      </footer>
    </div>
  );
}
