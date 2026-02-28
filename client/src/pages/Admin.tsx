/**
 * Admin — Painel de administração do Quotify
 * Gerenciar usuários (aprovar/bloquear/desativar) e configurações do app
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
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type FilterStatus = "all" | "pending" | "active" | "blocked";

export default function Admin() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappEdited, setWhatsappEdited] = useState(false);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Ativo
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            Pendente
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
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
                {filteredUsers.map((u: any) => (
                  <div
                    key={u.id}
                    className="bg-card rounded-xl border border-border p-4 sm:p-5 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
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
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
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
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            Bloquear
                          </Button>
                        )}
                        {u.status === "active" && u.status !== "pending" && u.openId !== user?.openId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus.mutate({ userId: u.id, status: "pending" })}
                            disabled={updateStatus.isPending}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs"
                          >
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Suspender
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
                  </div>
                ))}
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
    </div>
  );
}
