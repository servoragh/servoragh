import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { TickerItem, INITIAL_DEFAULT_TICKERS } from "@/lib/tickersTypes";

export { type TickerItem, INITIAL_DEFAULT_TICKERS };


const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "tickers.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function readLocalTickersFile(): TickerItem[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf8");
      const items = JSON.parse(data);
      if (Array.isArray(items) && items.length > 0) return items;
    }
  } catch (e) {
    console.error("Error reading local tickers file:", e);
  }
  return INITIAL_DEFAULT_TICKERS;
}

function writeLocalTickersFile(items: TickerItem[]): boolean {
  try {
    ensureDirectoryExistence(JSON_FILE_PATH);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(items, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error writing local tickers file:", e);
    return false;
  }
}

export async function getAllTickers(): Promise<TickerItem[]> {
  try {
    // Try database first if model exists
    if ((prisma as any).tickerAnnouncement) {
      const dbItems = await (prisma as any).tickerAnnouncement.findMany({
        orderBy: { displayOrder: "asc" },
      });
      if (dbItems && dbItems.length > 0) {
        return dbItems;
      }
    }
  } catch (e) {
    // DB query failed or model not migrated yet, fallback to local storage
  }
  return readLocalTickersFile();
}

export async function getActiveTickers(): Promise<TickerItem[]> {
  const all = await getAllTickers();
  const active = all.filter((t) => t.isActive);
  return active.length > 0 ? active : INITIAL_DEFAULT_TICKERS.filter((t) => t.isActive);
}

export async function saveTickerItem(item: Partial<TickerItem>): Promise<TickerItem> {
  const all = await getAllTickers();
  let updatedItem: TickerItem;

  if (item.id) {
    const idx = all.findIndex((t) => t.id === item.id);
    if (idx >= 0) {
      updatedItem = {
        ...all[idx],
        ...item,
        updatedAt: new Date().toISOString(),
      } as TickerItem;
      all[idx] = updatedItem;
    } else {
      updatedItem = {
        id: item.id,
        text: item.text || "",
        tag: item.tag || "ANNOUNCEMENT",
        badgeText: item.badgeText || "PROMO",
        badgeColor: item.badgeColor || "emerald",
        ctaLabel: item.ctaLabel || "",
        ctaUrl: item.ctaUrl || "",
        isActive: item.isActive ?? true,
        displayOrder: item.displayOrder ?? all.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      all.push(updatedItem);
    }
  } else {
    updatedItem = {
      id: `ticker-${Date.now()}`,
      text: item.text || "",
      tag: item.tag || "ANNOUNCEMENT",
      badgeText: item.badgeText || "PROMO",
      badgeColor: item.badgeColor || "emerald",
      ctaLabel: item.ctaLabel || "",
      ctaUrl: item.ctaUrl || "",
      isActive: item.isActive ?? true,
      displayOrder: all.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(updatedItem);
  }

  writeLocalTickersFile(all);

  try {
    if ((prisma as any).tickerAnnouncement) {
      await (prisma as any).tickerAnnouncement.upsert({
        where: { id: updatedItem.id },
        create: {
          id: updatedItem.id,
          text: updatedItem.text,
          tag: updatedItem.tag,
          badgeText: updatedItem.badgeText,
          badgeColor: updatedItem.badgeColor,
          ctaLabel: updatedItem.ctaLabel,
          ctaUrl: updatedItem.ctaUrl,
          isActive: updatedItem.isActive,
          displayOrder: updatedItem.displayOrder,
        },
        update: {
          text: updatedItem.text,
          tag: updatedItem.tag,
          badgeText: updatedItem.badgeText,
          badgeColor: updatedItem.badgeColor,
          ctaLabel: updatedItem.ctaLabel,
          ctaUrl: updatedItem.ctaUrl,
          isActive: updatedItem.isActive,
          displayOrder: updatedItem.displayOrder,
        },
      });
    }
  } catch (e) {
    // Database write fallback ignored
  }

  return updatedItem;
}

export async function deleteTickerItem(id: string): Promise<boolean> {
  const all = await getAllTickers();
  const filtered = all.filter((t) => t.id !== id);
  writeLocalTickersFile(filtered);

  try {
    if ((prisma as any).tickerAnnouncement) {
      await (prisma as any).tickerAnnouncement.delete({ where: { id } });
    }
  } catch (e) {}

  return true;
}

export async function toggleTickerItem(id: string): Promise<TickerItem | null> {
  const all = await getAllTickers();
  const target = all.find((t) => t.id === id);
  if (!target) return null;
  target.isActive = !target.isActive;
  writeLocalTickersFile(all);

  try {
    if ((prisma as any).tickerAnnouncement) {
      await (prisma as any).tickerAnnouncement.update({
        where: { id },
        data: { isActive: target.isActive },
      });
    }
  } catch (e) {}

  return target;
}

export async function resetTickersToDefault(): Promise<TickerItem[]> {
  writeLocalTickersFile(INITIAL_DEFAULT_TICKERS);
  return INITIAL_DEFAULT_TICKERS;
}
