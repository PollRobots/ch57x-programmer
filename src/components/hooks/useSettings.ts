import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

export type Settings = {
  mode: ColorMode;
  scale: PageScale;
};

const DEFAULT_SETTINGS: Settings = {
  mode: "device",
  scale: "md",
};

const COLOR_MODE = ["dark", "light", "device"] as const;
export type ColorMode = (typeof COLOR_MODE)[number];
export type ActiveColorMode = Exclude<ColorMode, "device">;

const PAGE_SCALE = ["xs", "sm", "md", "lg", "xl"] as const;
export type PageScale = (typeof PAGE_SCALE)[number];

const ColorModeSchema = z.union(
  COLOR_MODE.map(m => z.literal(m))
) satisfies z.ZodType<ColorMode>;
const PageScaleSchema = z.union(
  PAGE_SCALE.map(m => z.literal(m))
) satisfies z.ZodType<PageScale>;

const SETTINGS_KEY = "932F5789-5834-46CD-8F29-C987D8493C91-settings";

const SettingsSchema = z.object({
  mode: ColorModeSchema,
  scale: PageScaleSchema,
}) satisfies z.ZodType<Settings>;

export function loadSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      return SettingsSchema.parse(JSON.parse(raw));
    } catch (error) {
      console.warn(`Error loading settings: ${error}`);
    }
  }
  return DEFAULT_SETTINGS;
}

export function storeSettings(settings: Settings) {
  try {
    const sanitized = SettingsSchema.parse(settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized));
  } catch (error) {
    console.warn(`Error saving settings: ${error}`);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
}

export type SettingsHook = {
  settings: Settings;
  changeSettings: (update: Settings) => void;
};

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const PAGE_SCALES: Record<PageScale, string> = {
  xs: "0.66rem",
  sm: "0.8rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
};

export function useSettings(): SettingsHook {
  const [settings, setSettings] = useState(() => loadSettings());
  const [deviceIsDark, setDeviceIsDark] = useState(
    () => window.matchMedia(DARK_SCHEME_QUERY).matches
  );

  useEffect(() => {
    const darkModeQuery = window.matchMedia(DARK_SCHEME_QUERY);
    const handler = (event: MediaQueryListEvent) => {
      setDeviceIsDark(event.matches);
    };

    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const shouldBeDark =
      settings.mode === "dark" || (settings.mode === "device" && deviceIsDark);
    const currentlyDark = document.documentElement.classList.contains("dark");
    if (currentlyDark != shouldBeDark) {
      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [deviceIsDark, settings.mode]);

  useEffect(() => {
    document.documentElement.style.fontSize = PAGE_SCALES[settings.scale];
  }, [settings.scale]);

  const changeSettings = useCallback((update: Settings) => {
    storeSettings(update);
    setSettings(update);
  }, []);

  return { settings, changeSettings };
}
