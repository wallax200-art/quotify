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

  const id = await createUser({
    openId,
    name: data.name,
    email: data.email.toLowerCase().trim(),
    password: passwordHash,
    loginMethod: "email",
    role: "seller",
    status: "pending",
    phone: data.phone,
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

// ─── Recuperação de senha (placeholder) ───────

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
