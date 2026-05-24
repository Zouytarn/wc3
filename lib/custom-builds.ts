import type { BuildOrder } from "@/data/build-orders";

const STORAGE_KEY = "wc3_custom_builds";

// ── localStorage helpers ───────────────────────────────────────────────────

export function loadCustomBuilds(): BuildOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomBuild(build: BuildOrder): void {
  const all = loadCustomBuilds();
  const idx = all.findIndex((b) => b.id === build.id);
  if (idx >= 0) {
    all[idx] = build;
  } else {
    all.push(build);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteCustomBuild(id: string): void {
  const remaining = loadCustomBuilds().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

// ── JSON export / import ───────────────────────────────────────────────────

export function exportAsJSON(build: BuildOrder): void {
  const json = JSON.stringify(build, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wc3-build-${build.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<BuildOrder> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BuildOrder;
        if (!data.id || !data.myRace || !data.steps) {
          reject(new Error("Invalid build order file — missing required fields."));
          return;
        }
        // Mark as custom and assign a fresh id to avoid collisions
        const imported: BuildOrder = {
          ...data,
          id: `custom_${Date.now()}`,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        resolve(imported);
      } catch {
        reject(new Error("Could not parse JSON file."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsText(file);
  });
}

// ── ID generation ──────────────────────────────────────────────────────────

export function generateBuildId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
