import { TRPCError } from "@trpc/server";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: TRPCError["code"] = "INTERNAL_SERVER_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "BAD_REQUEST");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado. Faça login para continuar.") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Você não tem permissão para realizar esta ação.") {
    super(message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito: o recurso já existe.") {
    super(message, "CONFLICT");
    this.name = "ConflictError";
  }
}
