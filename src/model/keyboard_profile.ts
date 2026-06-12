import {
  isKeyBinding,
  isKeyboardDeviceType,
  KeyBinding,
  KeyboardDeviceType,
} from "./keyboard";
import { VendorId } from "./usb";

export type KeyboardProfile = {
  name: string;
  vendorId: VendorId;
  productId: number;
  keyboardDeviceType: KeyboardDeviceType;
  layout: KeyLayout;
  bindingsByLayer: KeyBinding[][];
};

function isKeyboardProfile(value: unknown): value is KeyboardProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return (
    "name" in value &&
    typeof value.name === "string" &&
    "vendorId" in value &&
    Number.isInteger(value.vendorId) &&
    "productId" in value &&
    Number.isInteger(value.productId) &&
    "keyboardDeviceType" in value &&
    isKeyboardDeviceType(value.keyboardDeviceType) &&
    "layout" in value &&
    isKeyLayout(value.layout) &&
    "bindingsByLayer" in value &&
    Array.isArray(value.bindingsByLayer) &&
    value.bindingsByLayer.every(
      layer =>
        Array.isArray(layer) && layer.every(binding => isKeyBinding(binding))
    )
  );
}

export type KeyLayout = {
  rows: number;
  columns: number;
};

function isKeyLayout(value: unknown): value is KeyLayout {
  return (
    typeof value === "object" &&
    value !== null &&
    "rows" in value &&
    Number.isInteger(value.rows) &&
    "columns" in value &&
    Number.isInteger(value.columns)
  );
}

const PROFILE_PREFIX = "932F5789-5834-46CD-8F29-C987D8493C91-profile";

function profileKey(profile: KeyboardProfile) {
  return [
    PROFILE_PREFIX,
    profile.vendorId.toString(16),
    profile.productId.toString(16),
    profile.name,
  ].join("-");
}

export function saveProfile(profile: KeyboardProfile): string {
  const key = profileKey(profile);
  localStorage.setItem(key, JSON.stringify(profile));
  return key;
}

export function saveProfiles(profiles: KeyboardProfile[]) {
  const savedKeys = new Set<string>();
  for (const profile of profiles) {
    const key = saveProfile(profile);
    savedKeys.add(key);
  }

  const toDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PROFILE_PREFIX)) {
      if (savedKeys.has(key)) {
        continue;
      }
      toDelete.push(key);
    }
  }

  for (const key of toDelete) {
    localStorage.removeItem(key);
  }
}

export function loadProfiles(): KeyboardProfile[] {
  const profiles: KeyboardProfile[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PROFILE_PREFIX)) {
      const profile = loadProfile(key);
      if (profile) {
        profiles.push(profile);
      } else {
      }
    }
  }
  return profiles;
}

export function loadProfile(key: string): KeyboardProfile | undefined {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const profile = JSON.parse(raw);
      if (isKeyboardProfile(profile)) {
        return profile;
      }
    } catch (error) {
      console.error("Error parsing profile:", key, error);
    }
  }
  return;
}
