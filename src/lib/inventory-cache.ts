import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/*
 * Cache de estoque recebido do Store Manager via POST /api/store-connector/inventory.
 *
 * O Vercel só permite escrita em /tmp/ (storage efêmero). O cache persiste
 * enquanto a instância da função estiver warm e é reconstruído a cada push
 * do cron stock-sync do Manager (a cada 4 horas).
 *
 * Em caso de cold start sem cache, o fallback é o estoque estático do
 * products.ts — que é atualizado pelo GitHub publication flow.
 */

const INVENTORY_PATH = join("/tmp", "store-inventory-cache.json");
const TRACKING_PATH = join("/tmp", "store-tracking-cache.json");

// ---------------------------------------------------------------------------
// Inventory (estoque)
// ---------------------------------------------------------------------------

export type InventoryUpdate = {
  syncedAt: string;
  productId: string;
  sourceProductId: string;
  variants: Array<{
    sourceSkuId: string;
    stock: number;
    available: boolean;
  }>;
};

type InventoryStore = Record<string, InventoryUpdate>;

let inventoryMemory: InventoryStore | null = null;

function loadInventory(): InventoryStore {
  if (inventoryMemory) return inventoryMemory;

  try {
    if (existsSync(INVENTORY_PATH)) {
      const raw = readFileSync(INVENTORY_PATH, "utf8");
      inventoryMemory = JSON.parse(raw) as InventoryStore;
      return inventoryMemory;
    }
  } catch {
    // cache corrompido, começa do zero
  }

  inventoryMemory = {};
  return inventoryMemory;
}

function saveInventory(store: InventoryStore) {
  inventoryMemory = store;
  try {
    writeFileSync(INVENTORY_PATH, JSON.stringify(store), "utf8");
  } catch {
    // /tmp pode falhar em edge runtime, mas o in-memory funciona
  }
}

export function setInventory(update: InventoryUpdate) {
  const store = loadInventory();
  store[update.sourceProductId] = update;
  saveInventory(store);
}

export function getVariantStock(
  sourceProductId: string,
  sourceSkuId: string,
): { stock: number; available: boolean } | null {
  const store = loadInventory();
  const product = store[sourceProductId];
  if (!product) return null;

  const variant = product.variants.find((v) => v.sourceSkuId === sourceSkuId);
  return variant ? { stock: variant.stock, available: variant.available } : null;
}

export function getProductStock(
  sourceProductId: string,
): InventoryUpdate | null {
  const store = loadInventory();
  return store[sourceProductId] || null;
}

// ---------------------------------------------------------------------------
// Tracking (rastreamento)
// ---------------------------------------------------------------------------

export type TrackingUpdate = {
  syncedAt: string;
  externalOrderId: string;
  trackingCode: string;
  trackingUrl: string | null;
  carrier: string | null;
  status: "SHIPPED" | "DELIVERED";
  shippedAt: string | null;
};

type TrackingStore = Record<string, TrackingUpdate>;

let trackingMemory: TrackingStore | null = null;

function loadTracking(): TrackingStore {
  if (trackingMemory) return trackingMemory;

  try {
    if (existsSync(TRACKING_PATH)) {
      const raw = readFileSync(TRACKING_PATH, "utf8");
      trackingMemory = JSON.parse(raw) as TrackingStore;
      return trackingMemory;
    }
  } catch {
    // cache corrompido
  }

  trackingMemory = {};
  return trackingMemory;
}

function saveTracking(store: TrackingStore) {
  trackingMemory = store;
  try {
    writeFileSync(TRACKING_PATH, JSON.stringify(store), "utf8");
  } catch {
    // fallback in-memory
  }
}

export function setTracking(update: TrackingUpdate) {
  const store = loadTracking();
  store[update.externalOrderId] = update;
  saveTracking(store);
}

export function getTracking(
  externalOrderId: string,
): TrackingUpdate | null {
  const store = loadTracking();
  return store[externalOrderId] || null;
}

export function getAllTracking(): TrackingStore {
  return loadTracking();
}
