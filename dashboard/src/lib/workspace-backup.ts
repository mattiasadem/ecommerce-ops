export const WORKSPACE_BACKUP_SCHEMA = "ecommerce-ops-workspace" as const;
export const WORKSPACE_BACKUP_VERSION = 1 as const;
export const WORKSPACE_STORAGE_PREFIX = "ecom-ops:";

export interface StorageAdapter {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface WorkspaceBackup {
  schema: typeof WORKSPACE_BACKUP_SCHEMA;
  version: typeof WORKSPACE_BACKUP_VERSION;
  exportedAt: string;
  data: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function buildWorkspaceBackup(
  storage: StorageAdapter,
  now = new Date(),
): WorkspaceBackup {
  const data: Record<string, string> = {};
  const keys: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(WORKSPACE_STORAGE_PREFIX)) keys.push(key);
  }

  for (const key of keys.sort()) {
    const value = storage.getItem(key);
    if (value !== null) data[key] = value;
  }

  return {
    schema: WORKSPACE_BACKUP_SCHEMA,
    version: WORKSPACE_BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
}

export function parseWorkspaceBackup(raw: string): WorkspaceBackup {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  if (
    !isRecord(value) ||
    value.schema !== WORKSPACE_BACKUP_SCHEMA ||
    value.version !== WORKSPACE_BACKUP_VERSION
  ) {
    throw new Error("This is not an Ecommerce Ops workspace backup.");
  }
  if (typeof value.exportedAt !== "string" || Number.isNaN(Date.parse(value.exportedAt))) {
    throw new Error("The workspace backup has an invalid export timestamp.");
  }
  if (!isRecord(value.data)) {
    throw new Error("The workspace backup data is missing or malformed.");
  }

  const data: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value.data)) {
    if (!key.startsWith(WORKSPACE_STORAGE_PREFIX)) {
      throw new Error(`The backup contains an unsupported storage key: ${key}`);
    }
    if (typeof entry !== "string") {
      throw new Error(`The backup value for ${key} is malformed.`);
    }
    data[key] = entry;
  }

  return {
    schema: WORKSPACE_BACKUP_SCHEMA,
    version: WORKSPACE_BACKUP_VERSION,
    exportedAt: value.exportedAt,
    data,
  };
}

export function restoreWorkspaceBackup(
  storage: StorageAdapter,
  backup: WorkspaceBackup,
): number {
  const entries = Object.entries(backup.data);
  for (const [key, value] of entries) storage.setItem(key, value);
  return entries.length;
}
