import {
  findAllStores,
  findStoreById,
  findStoreBySlug,
  createStore,
  updateStore,
  findStoreUsers,
  addUserToStore,
  findStoreSettings,
  upsertStoreSettings,
  findMachineFees,
  upsertMachineFee,
  deleteMachineFee,
  findDeviceConditions,
  upsertDeviceCondition,
  deleteDeviceCondition,
  findTradeInRules,
  findStoreProducts,
  upsertStoreProduct,
} from "./stores.repository";
import { ConflictError, NotFoundError } from "../../errors/AppError";
import type {
  Store,
  InsertMachineFee,
  InsertDeviceCondition,
  InsertStoreProduct,
} from "../../../drizzle/schema";

// ─── Lojas ────────────────────────────────────

export async function getAllStores(): Promise<Store[]> {
  return findAllStores();
}

export async function getStoreById(id: number): Promise<Store> {
  const store = await findStoreById(id);
  if (!store) throw new NotFoundError("Loja não encontrada.");
  return store;
}

export async function createNewStore(data: {
  name: string;
  slug: string;
  whatsapp?: string;
  ownerId: number;
}): Promise<number> {
  const existing = await findStoreBySlug(data.slug);
  if (existing) throw new ConflictError("Já existe uma loja com este slug.");

  const storeId = await createStore({
    name: data.name,
    slug: data.slug,
    whatsapp: data.whatsapp,
    status: "active",
  });

  // Vincular o criador como dono
  await addUserToStore({
    storeId,
    userId: data.ownerId,
    roleInStore: "owner",
    isActive: true,
  });

  // Criar configurações padrão
  await upsertStoreSettings(storeId, {
    quoteClosingText: "O que achou dessa proposta?",
    themePreference: "system",
    defaultWarrantyDays: 0,
  });

  return storeId;
}

export async function updateStoreInfo(
  storeId: number,
  data: { name?: string; whatsapp?: string; logoUrl?: string },
): Promise<void> {
  await getStoreById(storeId);
  await updateStore(storeId, data);
}

// ─── Usuários da Loja ─────────────────────────

export async function getStoreUsers(storeId: number) {
  await getStoreById(storeId);
  return findStoreUsers(storeId);
}

export async function addSellerToStore(storeId: number, userId: number): Promise<void> {
  await getStoreById(storeId);
  await addUserToStore({ storeId, userId, roleInStore: "seller", isActive: true });
}

// ─── Configurações da Loja ────────────────────

export async function getStoreSettings(storeId: number) {
  await getStoreById(storeId);
  return findStoreSettings(storeId);
}

export async function updateStoreSettings(
  storeId: number,
  data: {
    quoteClosingText?: string;
    themePreference?: "light" | "dark" | "system";
    logoUrl?: string | null;
    warrantyText?: string;
    defaultWarrantyDays?: number;
  },
): Promise<void> {
  await getStoreById(storeId);
  await upsertStoreSettings(storeId, data);
}

// ─── Taxas da Maquininha ──────────────────────

export async function getStoreMachineFees(storeId: number) {
  await getStoreById(storeId);
  return findMachineFees(storeId);
}

export async function saveStoreMachineFee(storeId: number, data: Omit<InsertMachineFee, "storeId">): Promise<void> {
  await getStoreById(storeId);
  await upsertMachineFee({ ...data, storeId });
}

export async function removeStoreMachineFee(storeId: number, feeId: number): Promise<void> {
  await getStoreById(storeId);
  await deleteMachineFee(feeId);
}

// ─── Condições de Aparelhos ───────────────────

export async function getStoreDeviceConditions(storeId: number) {
  await getStoreById(storeId);
  return findDeviceConditions(storeId);
}

export async function saveStoreDeviceCondition(
  storeId: number,
  data: Omit<InsertDeviceCondition, "storeId">,
): Promise<void> {
  await getStoreById(storeId);
  await upsertDeviceCondition({ ...data, storeId });
}

export async function removeStoreDeviceCondition(storeId: number, conditionId: number): Promise<void> {
  await getStoreById(storeId);
  await deleteDeviceCondition(conditionId);
}

// ─── Regras de Abatimento ─────────────────────

export async function getStoreTradeInRules(storeId: number) {
  await getStoreById(storeId);
  return findTradeInRules(storeId);
}

// ─── Produtos da Loja ─────────────────────────

export async function getStoreProducts(storeId: number) {
  await getStoreById(storeId);
  return findStoreProducts(storeId);
}

export async function saveStoreProduct(
  storeId: number,
  data: Omit<InsertStoreProduct, "storeId">,
): Promise<void> {
  await getStoreById(storeId);
  await upsertStoreProduct({ ...data, storeId });
}
