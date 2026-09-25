import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface SystemSettings {
  escrowEnabled: boolean;
  platformName: string;
  supportPhone: string;
  supportEmail: string;
  commissionRate: string;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  escrowEnabled: true,
  platformName: "Servora.gh Marketplace",
  supportPhone: "+233501234567",
  supportEmail: "support@servora.gh",
  commissionRate: "5",
  updatedAt: new Date().toISOString(),
};

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "system_settings.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname, { recursive: true });
}

let inMemorySettings: SystemSettings = { ...DEFAULT_SETTINGS };

function readLocalSettingsFile(): SystemSettings {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        inMemorySettings = { ...DEFAULT_SETTINGS, ...parsed };
        return inMemorySettings;
      }
    }
  } catch (e) {
    console.error("Error reading local system settings file:", e);
  }
  return inMemorySettings;
}

function writeLocalSettingsFile(settings: SystemSettings): boolean {
  try {
    ensureDirectoryExistence(JSON_FILE_PATH);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(settings, null, 2), "utf8");
    inMemorySettings = { ...settings };
    return true;
  } catch (e) {
    console.error("Error writing local system settings file:", e);
    return false;
  }
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    // Attempt to sync from Prisma if systemSetting table exists
    if ((prisma as any).systemSetting) {
      const dbSettings = await (prisma as any).systemSetting.findMany().catch(() => []);
      if (dbSettings && dbSettings.length > 0) {
        const local = readLocalSettingsFile();
        for (const s of dbSettings) {
          if (s.key === "ESCROW_ENABLED") local.escrowEnabled = s.value === "true";
          if (s.key === "PLATFORM_NAME") local.platformName = s.value;
          if (s.key === "SUPPORT_PHONE") local.supportPhone = s.value;
          if (s.key === "SUPPORT_EMAIL") local.supportEmail = s.value;
          if (s.key === "COMMISSION_RATE") local.commissionRate = s.value;
        }
        return local;
      }
    }
  } catch (err) {
    // Fallback to local file or in-memory
  }

  return readLocalSettingsFile();
}

export async function isEscrowEnabled(): Promise<boolean> {
  const settings = await getSystemSettings();
  return settings.escrowEnabled;
}

export async function updateSystemSettings(
  updates: Partial<SystemSettings>,
  updatedBy?: string
): Promise<SystemSettings> {
  const current = await getSystemSettings();
  const nextSettings: SystemSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || current.updatedBy || "admin",
  };

  writeLocalSettingsFile(nextSettings);

  // Sync to database if possible
  try {
    if ((prisma as any).systemSetting) {
      if (typeof updates.escrowEnabled === "boolean") {
        await (prisma as any).systemSetting.upsert({
          where: { key: "ESCROW_ENABLED" },
          update: { value: updates.escrowEnabled ? "true" : "false", updatedBy },
          create: { key: "ESCROW_ENABLED", value: updates.escrowEnabled ? "true" : "false", updatedBy },
        }).catch(() => null);
      }
      if (updates.platformName) {
        await (prisma as any).systemSetting.upsert({
          where: { key: "PLATFORM_NAME" },
          update: { value: updates.platformName, updatedBy },
          create: { key: "PLATFORM_NAME", value: updates.platformName, updatedBy },
        }).catch(() => null);
      }
    }
  } catch {
    // Non-blocking
  }

  return nextSettings;
}

export async function setEscrowEnabled(
  enabled: boolean,
  updatedBy?: string
): Promise<SystemSettings> {
  return updateSystemSettings({ escrowEnabled: enabled }, updatedBy);
}
