/**
 * Admin — Painel de administração do Quotify
 * Gerenciar usuários (aprovar/bloquear/desativar), controlo de acesso mensal e configurações do app
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  ShieldCheck,
  Settings,
  ArrowLeft,
  Loader2,
  Phone,
  Store,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  MessageCircle,
  Sun,
  Moon,
  CalendarDays,
  Timer,
  CalendarClock,
  KeyRound,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type FilterStatus = "all" | "pending" | "active" | "blocked";

/** Compute days elapsed since a date */
function daysSince(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/** Compute days remaining until expiry */
function daysRemaining(expiresAt: string | Date | null): number | null {
  if (!expiresAt) return null;
  const d = new Date(expiresAt);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

/** Format a date to pt-BR locale */
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Admin() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappEdited, setWhatsappEdited] = useState(false);

  // Access grant modal state
  const [grantUserId, setGrantUserId] = useState<number | null>(null);
  const [grantDays, setGrantDays] = useState("30");

  const utils = trpc.useUtils();
  const { data: userList, isLoading } = trpc.admin.listUsers.useQuery();
  const { data: settings } = trpc.admin.getSettings.useQuery();

  useEffect(() => {
    if (settings?.admin_whatsapp && !whatsappEdited) {
      setWhatsappNumber(settings.admin_whatsapp);
    }
  }, [settings, whatsappEdited]);

  const updateStatus = trpc.admin.updateUserStatus.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success("Status do usuário atualizado");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success("Papel do usuário atualizado");
    },
    onError: () => toast.error("Erro ao atualizar papel"),
  });

  const grantAccess = trpc.admin.grantAccess.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success("Acesso liberado com sucesso");
      setGrantUserId(null);
      setGrantDays("30");
    },
    onError: () => toast.error("Erro ao liberar acesso"),
  });

  const updateAccessDays = trpc.admin.updateAccessDays.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success("Dias de acesso atualizados");
    },
    onError: () => toast.error("Erro ao atualizar dias"),
  });

  const updateSetting = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      utils.admin.getSettings.invalidate();
      toast.success("Configuração salva");
      setWhatsappEdited(false);
    },
    onError: () => toast.error("Erro ao salvar configuração"),
  });

  const filteredUsers = useMemo(() => {
    if (!userList) return [];
    let list = userList;
    if (filterStatus !== "all") {
      list = list.filter((u: any) => u.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u: any) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.storeName?.toLowerCase().includes(q) ||
          u.phone?.includes(q)
      );
    }
    return list;
  }, [userList, filterStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    if (!userList) return { all: 0, pending: 0, active: 0, blocked: 0 };
    return {
      all: userList.length,
      pending: userList.filter((u: any) => u.status === "pending").length,
      active: userList.filter((u: any) => u.status === "active").length,
      blocked: userList.filter((u: any) => u.status === "blocked").length,
    };
  }, [userList]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Ativo
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            Pendente
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Bloqueado
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3" />
          Admin
        </span>
      );
    }
    return null;
  };

  const getAccessInfo = (u: any) => {
    if (u.role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
          <ShieldCheck className="w-3 h-3" />
          Acesso ilimitado
        </span>
      );
    }

    if (!u.accessGrantedAt || u.accessDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <KeyRound className="w-3 h-3" />
          Sem acesso definido
        </span>
      );
    }

    const remaining = daysRemaining(u.accessExpiresAt);
    const isExpired = remaining !== null && remaining <= 0;

    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
          <XCircle className="w-3 h-3" />
          Expirado há {Math.abs(remaining!)} dia{Math.abs(remaining!) !== 1 ? "s" : ""}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <CalendarClock className="w-3 h-3" />
        {remaining} dia{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
      </span>
    );
  };

  // Check if current user is admin
  if (user && (user as any).role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso restrito</h2>
          <p className="text-muted-foreground mb-4">Apenas administradores podem acessar esta página.</p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-sm font-bold text-foreground">Painel Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Settings className="w-3.5 h-3.5 inline mr-1" />
              Config
            </button>
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "users" ? (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, loja ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-1 p-1 bg-secondary rounded-xl">
                {(["all", "pending", "active", "blocked"] as FilterStatus[]).map((status) => {
                  const labels: Record<FilterStatus, string> = {
                    all: "Todos",
                    pending: "Pendentes",
                    active: "Ativos",
                    blocked: "Bloqueados",
                  };
                  const counts = statusCounts[status];
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterStatus === status
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {labels[status]}
                      <span className="ml-1 text-[10px] opacity-60">{counts}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u: any) => {
                  const memberDays = daysSince(u.createdAt);
                  const remaining = daysRemaining(u.accessExpiresAt);
                  const isExpired = remaining !== null && remaining <= 0;
                  const isGrantOpen = grantUserId === u.id;

                  return (
                    <div
                      key={u.id}
                      className={`bg-card rounded-xl border p-4 sm:p-5 transition-all ${
                        isExpired && u.role !== "admin"
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-border hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Top row: user info + status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-semibold text-foreground truncate">{u.name || "Sem nome"}</h3>
                              {getRoleBadge(u.role)}
                              {getStatusBadge(u.status)}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {u.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {u.email}
                                </span>
                              )}
                              {u.storeName && (
                                <span className="flex items-center gap-1">
                                  <Store className="w-3 h-3" />
                                  {u.storeName}
                                </span>
                              )}
                              {u.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status actions */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {u.status !== "active" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus.mutate({ userId: u.id, status: "active" })}
                                disabled={updateStatus.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              >
                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                Ativar
                              </Button>
                            )}
                            {u.status !== "blocked" && u.openId !== user?.openId && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus.mutate({ userId: u.id, status: "blocked" })}
                                disabled={updateStatus.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs"
                              >
                                <UserX className="w-3.5 h-3.5 mr-1" />
                                Bloquear
                              </Button>
                            )}
                            {u.role !== "admin" && u.openId !== user?.openId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateRole.mutate({ userId: u.id, role: "admin" })}
                                disabled={updateRole.isPending}
                                className="text-xs text-muted-foreground"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                Tornar Admin
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Access control row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-border/50">
                          {/* Time info */}
                          <div className="flex flex-wrap gap-x-5 gap-y-2 flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Cadastro: <strong className="text-foreground">{formatDate(u.createdAt)}</strong></span>
                              <span className="text-muted-foreground/60">({memberDays} dia{memberDays !== 1 ? "s" : ""})</span>
                            </div>
                            {u.accessGrantedAt && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>Liberado: <strong className="text-foreground">{formatDate(u.accessGrantedAt)}</strong></span>
                                <span className="text-muted-foreground/60">({u.accessDays} dias)</span>
                              </div>
                            )}
                            <div>{getAccessInfo(u)}</div>
                          </div>

                          {/* Grant/Update access button */}
                          {u.role !== "admin" && (
                            <div className="shrink-0">
                              {!isGrantOpen ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setGrantUserId(u.id);
                                    setGrantDays(u.accessDays > 0 ? String(u.accessDays) : "30");
                                  }}
                                  className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <KeyRound className="w-3.5 h-3.5 mr-1" />
                                  {u.accessGrantedAt ? "Alterar Acesso" : "Liberar Acesso"}
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-2 py-1">
                                    <input
                                      type="number"
                                      min="1"
                                      max="365"
                                      value={grantDays}
                                      onChange={(e) => setGrantDays(e.target.value)}
                                      className="w-16 bg-transparent text-sm font-mono text-foreground focus:outline-none text-center"
                                    />
                                    <span className="text-xs text-muted-foreground">dias</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const days = parseInt(grantDays);
                                      if (isNaN(days) || days < 1 || days > 365) {
                                        toast.error("Informe entre 1 e 365 dias");
                                        return;
                                      }
                                      if (u.accessGrantedAt) {
                                        updateAccessDays.mutate({ userId: u.id, days });
                                      } else {
                                        grantAccess.mutate({ userId: u.id, days });
                                      }
                                    }}
                                    disabled={grantAccess.isPending || updateAccessDays.isPending}
                                    className="text-xs bg-primary hover:bg-primary/90"
                                  >
                                    {(grantAccess.isPending || updateAccessDays.isPending) ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                        Confirmar
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setGrantUserId(null)}
                                    className="text-xs text-muted-foreground"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Settings Tab */
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-foreground mb-6">Configurações do App</h2>

            {/* WhatsApp Admin Number */}
            <div className="bg-card rounded-xl border border-border p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-foreground">WhatsApp do Administrador</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Número que aparece no botão "Solicitar acesso pelo WhatsApp" na tela de login. 
                Use o formato internacional sem espaços (ex: 5511999999999).
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => {
                    setWhatsappNumber(e.target.value);
                    setWhatsappEdited(true);
                  }}
                  placeholder="5511999999999"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Button
                  onClick={() => updateSetting.mutate({ key: "admin_whatsapp", value: whatsappNumber })}
                  disabled={updateSetting.isPending || !whatsappEdited}
                  size="sm"
                >
                  {updateSetting.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grant access quick presets info */}
      {activeTab === "users" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-card/50 rounded-xl border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-semibold text-foreground">Controlo de Acesso</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clique em <strong>"Liberar Acesso"</strong> para definir quantos dias cada vendedor pode usar o sistema. 
              Quando o prazo expirar, o acesso será bloqueado automaticamente. 
              Use <strong>"Alterar Acesso"</strong> para renovar ou ajustar os dias a qualquer momento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
