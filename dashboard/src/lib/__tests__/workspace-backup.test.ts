import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWorkspaceBackup,
  parseWorkspaceBackup,
  restoreWorkspaceBackup,
  type StorageAdapter,
} from "../workspace-backup.ts";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();

  constructor(seed: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(seed)) this.values.set(key, value);
  }

  get length() {
    return this.values.size;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test("buildWorkspaceBackup exports only Ecommerce Ops keys in stable order", () => {
  const storage = new MemoryStorage({
    "foreign:key": "do-not-export",
    "ecom-ops:your-store:v1": JSON.stringify({ aov: 85 }),
    "ecom-ops:playbooks:ac-roi:v1": JSON.stringify({ monthlyOrders: 1000 }),
  });

  const backup = buildWorkspaceBackup(storage, new Date("2026-07-14T12:00:00.000Z"));

  assert.equal(backup.schema, "ecommerce-ops-workspace");
  assert.equal(backup.version, 1);
  assert.equal(backup.exportedAt, "2026-07-14T12:00:00.000Z");
  assert.deepEqual(Object.keys(backup.data), [
    "ecom-ops:playbooks:ac-roi:v1",
    "ecom-ops:your-store:v1",
  ]);
  assert.equal("foreign:key" in backup.data, false);
});

test("parseWorkspaceBackup rejects foreign and malformed keys", () => {
  assert.throws(
    () => parseWorkspaceBackup(JSON.stringify({ schema: "other", version: 1, data: {} })),
    /not an Ecommerce Ops workspace backup/,
  );
  assert.throws(
    () =>
      parseWorkspaceBackup(
        JSON.stringify({
          schema: "ecommerce-ops-workspace",
          version: 1,
          exportedAt: "2026-07-14T12:00:00.000Z",
          data: { "foreign:key": "unsafe" },
        }),
      ),
    /unsupported storage key/,
  );
});

test("restoreWorkspaceBackup restores every exported value", () => {
  const target = new MemoryStorage({ "ecom-ops:existing:v1": "keep" });
  const backup = parseWorkspaceBackup(
    JSON.stringify({
      schema: "ecommerce-ops-workspace",
      version: 1,
      exportedAt: "2026-07-14T12:00:00.000Z",
      data: {
        "ecom-ops:your-store:v1": JSON.stringify({ aov: 120 }),
        "ecom-ops:shipped-playbooks:v1": JSON.stringify({ one: { shippedAt: "now" } }),
      },
    }),
  );

  const restored = restoreWorkspaceBackup(target, backup);

  assert.equal(restored, 2);
  assert.equal(target.getItem("ecom-ops:your-store:v1"), JSON.stringify({ aov: 120 }));
  assert.equal(
    target.getItem("ecom-ops:shipped-playbooks:v1"),
    JSON.stringify({ one: { shippedAt: "now" } }),
  );
  assert.equal(target.getItem("ecom-ops:existing:v1"), "keep");
});
