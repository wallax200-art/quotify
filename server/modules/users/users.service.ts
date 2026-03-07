import bcrypt from "bcryptjs";
import {
  findAllUsers,
  findUserByEmail,
  findUserById,
  findUserByOpenId,
  createUser,
  updateUser,
  deleteUserById,
} from "./users.repository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../errors/AppError";
import type { User } from "../../../drizzle/schema";
import { getSetting } from "../stores/support-settings.repository";

// ─── Constantes ───────────────────────────────
/** Número padrão de dias de teste grátis para novos usuários */
const DEFAULT_TRIAL_DAYS = 7;

// ─── Consultas ────────────────────────────────

export async function getUserById(id: number): Promise<User> {
  const user = await findUserById(id);
  if (!user) throw new NotFoundError("Usuário não encontrado.");
  return user;
}

export async function getAllUsers(): Promise<Omit<User, "password">[]> {
  const all = await findAllUsers();
  return all.map(({ password, ...u }) => u);
}

// ─── Registro ─────────────────────────────────

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ id: number; openId: string }> {
  const existing = await findUserByEmail(data.email.toLowerCase().trim());
  if (existing) throw new ConflictError("Este e-mail já está cadastrado.");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const openId = `email:${data.email.toLowerCase().trim()}`;

  // Verificar se o trial grátis está habilitado nas configurações
  let trialDays = DEFAULT_TRIAL_DAYS;
  try {
    const trialSetting = await getSetting("free_trial_days");
    if (trialSetting) {
      const parsed = parseInt(trialSetting, 10);
      if (!isNaN(parsed) && parsed >= 0) trialDays = parsed;
    }
  } catch { /* usar padrão */ }

  // Calcular datas de acesso do trial
  const now = new Date();
  const trialExpiresAt = trialDays > 0
    ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
    : null;

  const id = await createUser({
    openId,
    name: data.name,
    email: data.email.toLowerCase().trim(),
    password: passwordHash,
    loginMethod: "email",
    role: "seller",
    // Se trial > 0: ativar automaticamente com acesso temporário
    // Se trial = 0: manter pendente aguardando aprovação manual
    status: trialDays > 0 ? "active" : "pending",
    phone: data.phone,
    ...(trialDays > 0 && {
      accessGrantedAt: now,
      accessDays: trialDays,
      accessExpiresAt: trialExpiresAt,
    }),
  });

  return { id, openId };
}

// ─── Login ────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const user = await findUserByEmail(email.toLowerCase().trim());
  if (!user || !user.password) throw new ValidationError("E-mail ou senha inválidos.");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ValidationError("E-mail ou senha inválidos.");

  if (user.status === "pending") {
    throw new ForbiddenError("Sua conta está aguardando aprovação do administrador.");
  }
  if (user.status === "blocked") {
    throw new ForbiddenError("Sua conta foi bloqueada. Entre em contato com o suporte.");
  }

  await updateUser(user.id, { lastSignedIn: new Date() });
  return user;
}

// ─── Perfil ───────────────────────────────────

export async function updateUserProfile(
  userId: number,
  data: { name?: string; phone?: string },
): Promise<void> {
  await getUserById(userId);
  await updateUser(userId, data);
}

// ─── Administração ────────────────────────────

export async function setUserStatus(
  userId: number,
  status: "pending" | "active" | "blocked",
): Promise<void> {
  await getUserById(userId);
  await updateUser(userId, { status });
}

export async function setUserRole(
  userId: number,
  role: "master_admin" | "store_owner" | "seller",
): Promise<void> {
  await getUserById(userId);
  await updateUser(userId, { role });
}

export async function removeUser(userId: number): Promise<void> {
  const user = await getUserById(userId);
  if (user.role === "master_admin") {
    throw new ForbiddenError("Não é possível excluir um administrador master.");
  }
  await deleteUserById(userId);
}

// ─── Recuperação de senha ─────────────────────

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await findUserByEmail(email.toLowerCase().trim());
  // Não revelamos se o e-mail existe ou não por segurança
  if (!user) return;
  // TODO: Enviar e-mail com token de recuperação
}

export async function resetPassword(
  openId: string,
  newPassword: string,
): Promise<void> {
  const user = await findUserByOpenId(openId);
  if (!user) throw new NotFoundError("Usuário não encontrado.");
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await updateUser(user.id, { password: passwordHash });
}
