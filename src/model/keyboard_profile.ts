import { z } from "zod";

import {
  KeyBinding,
  KeyBindingSchema,
  KeyboardDeviceType,
  KeyboardDeviceTypeSchema,
} from "./keyboard";
import { VendorId, VendorIdSchema } from "./usb";

export type KeyLayout = {
  rows: number;
  columns: number;
};

export const KeyLayoutSchema = z.object({
  rows: z.uint32(),
  columns: z.uint32(),
}) satisfies z.ZodType<KeyLayout>;

export function isKeyLayout(value: unknown): value is KeyLayout {
  return KeyLayoutSchema.safeParse(value).success;
}

export type KeyboardProfile = {
  name: string;
  vendorId: VendorId;
  productId: number;
  keyboardDeviceType: KeyboardDeviceType;
  userKeyboardDeviceType?: KeyboardDeviceType | null | undefined;
  layout: KeyLayout;
  bindingsByLayer: KeyBinding[][];
};

export const KeyboardProfileSchema = z.object({
  name: z.string(),
  vendorId: VendorIdSchema,
  productId: z.number(),
  keyboardDeviceType: KeyboardDeviceTypeSchema,
  userKeyboardDeviceType: KeyboardDeviceTypeSchema.optional(),
  layout: KeyLayoutSchema,
  bindingsByLayer: z.array(z.array(KeyBindingSchema)),
}) satisfies z.ZodType<KeyboardProfile>;

function parseKeyboardProfile(input: string): KeyboardProfile {
  return KeyboardProfileSchema.parse(JSON.parse(input));
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
  const sanitized = KeyboardProfileSchema.safeParse(profile);
  if (sanitized.success) {
    // update all bindings to have 'profile' origin
    forceOriginsToProfile(sanitized.data.bindingsByLayer);
    localStorage.setItem(key, JSON.stringify(sanitized.data));
  }
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
      const profile = parseKeyboardProfile(raw);
      forceOriginsToProfile(profile.bindingsByLayer);
      return profile;
    } catch (error) {
      console.error("Error parsing profile:", key, error);
    }
  }
  return;
}

export function forceOriginsToProfile(bindingsByLayer: KeyBinding[][]) {
  for (const layer of bindingsByLayer) {
    for (const keyBinding of layer) {
      keyBinding.origin = "profile";
    }
  }
}
