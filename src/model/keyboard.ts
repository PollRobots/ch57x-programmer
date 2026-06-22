import { z } from "zod";

import {
  WellKnownCode,
  WellKnownCodeSchema,
  wellKnownCodeValue,
} from "./key_codes";

export type Keyboard = {
  readonly name: string;
  bindKey: (layer: number, key: Key, expansion: Macro) => number[][];
  setLed: (args: string[]) => number[][];
  getDeviceType: () => number[];
  readConfig: (layer: number) => number[];
  checkPacketType: (data: Uint8Array) => KeyboardPacketType | undefined;
  parseDeviceTypePacket: (data: Uint8Array) => KeyboardDeviceType | undefined;
  parseConfigPacket: (data: Uint8Array) => KeyBinding | undefined;
};

export const NoopKeyboard: Keyboard = {
  name: "NoopKeyboard",
  bindKey: () => [],
  setLed: () => [],
  getDeviceType: () => [],
  readConfig: () => [],
  checkPacketType: () => {},
  parseDeviceTypePacket: () => {},
  parseConfigPacket: () => {},
};

export type KeyboardPacketType = "device" | "config";

export type KeyboardFamily = "884x" | "%other";

export const KeyboardFamilySchema = z.union([
  z.literal("884x"),
  z.literal("%other"),
]) satisfies z.ZodType<KeyboardFamily>;

export type KeyboardDeviceType = {
  family: KeyboardFamily;
  buttons: number;
  encoders: number;
  layers: number;
};

export const KeyboardDeviceTypeSchema = z.object({
  family: KeyboardFamilySchema,
  buttons: z.uint32(),
  encoders: z.uint32(),
  layers: z.uint32(),
}) satisfies z.ZodType<KeyboardDeviceType>;

export function isKeyboardDeviceType(
  value: unknown
): value is KeyboardDeviceType {
  return (
    typeof value === "object" &&
    value !== null &&
    "family" in value &&
    isKeyboardFamily(value.family) &&
    "buttons" in value &&
    Number.isInteger(value.buttons) &&
    "encoders" in value &&
    Number.isInteger(value.encoders) &&
    "layers" in value &&
    Number.isInteger(value.layers)
  );
}

function isKeyboardFamily(value: unknown): value is KeyboardFamily {
  return value === "884x" || value === "%other";
}

export const UNKNOWN_KEYBOARD_DEVICE: KeyboardDeviceType = {
  family: "%other",
  buttons: 0,
  encoders: 0,
  layers: 0,
};

const KEY_BINDING_ORIGINS = [
  "device",
  "editor",
  "profile",
  "placeholder",
] as const;

export type KeyBindingOrigin = (typeof KEY_BINDING_ORIGINS)[number];
export const KeyBindingOriginSchema = z.union(
  KEY_BINDING_ORIGINS.map(k => z.literal(k))
) satisfies z.ZodType<KeyBindingOrigin>;

export function isKeyBindingOrigin(value: unknown): value is KeyBindingOrigin {
  return KeyBindingOriginSchema.safeParse(value).success;
}

const ENCODER_ACTION = ["ccw", "press", "cw"] as const;
export type EncoderAction = (typeof ENCODER_ACTION)[number];

export const EncoderActionSchema = z.union(
  ENCODER_ACTION.map(a => z.literal(a))
) satisfies z.ZodType<EncoderAction>;

export function isEncoderAction(value: unknown): value is EncoderAction {
  return EncoderActionSchema.safeParse(value).success;
}

export function encoderActionValue(encoderAction: EncoderAction): number {
  switch (encoderAction) {
    case "ccw":
      return 0;
    case "press":
      return 1;
    case "cw":
      return 2;
  }
}
export function encoderActionFromValue(
  value: number
): EncoderAction | undefined {
  switch (value) {
    case 0:
      return "ccw";
    case 1:
      return "press";
    case 2:
      return "cw";
    default:
      return;
  }
}

export type Encoder = [number, EncoderAction];

export const EncoderSchema = z.tuple([
  z.uint32(),
  EncoderActionSchema,
]) satisfies z.ZodType<Encoder>;

export function isEncoder(value: unknown): value is Encoder {
  return EncoderSchema.safeParse(value).success;
}

export type Button = number;

export const ButtonSchema = z.uint32() satisfies z.ZodType<Button>;

export function isButton(value: unknown): value is Button {
  return ButtonSchema.safeParse(value).success;
}

export type Key = Button | Encoder;

export const KeySchema = z.union([
  ButtonSchema,
  EncoderSchema,
]) satisfies z.ZodType<Key>;

export function isKey(value: unknown): value is Key {
  return KeySchema.safeParse(value).success;
}

export function keysAreEqual(a: Key, b: Key) {
  if (typeof a === "number") {
    return a === b;
  }
  return typeof b !== "number" && a[0] === b[0] && a[1] === b[1];
}

export function keysCompare(a: Key, b: Key) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (typeof a === "number") {
    return -1;
  }
  if (typeof b === "number") {
    return 1;
  }
  return (
    a[0] * 3 + encoderActionValue(a[1]) - (b[0] * 3 + encoderActionValue(b[1]))
  );
}

const MODIFIERS = [
  "Ctrl",
  "Shift",
  "Alt",
  "Meta",
  "RightCtrl",
  "RightShift",
  "RightAlt",
  "RightMeta",
] as const;

export type Modifier = (typeof MODIFIERS)[number];

export const ModifierSchema = z.union(
  MODIFIERS.map(m => z.literal(m))
) satisfies z.ZodType<Modifier>;

export function isModifier(value: unknown): value is Modifier {
  return ModifierSchema.safeParse(value).success;
}

const PLATFORM_MODIFIERS = [
  "Opt",
  "Win",
  "Cmd",
  "RightOpt",
  "RightWin",
  "RightCmd",
] as const;

export const ModifierEquivalents: Record<
  (typeof PLATFORM_MODIFIERS)[number],
  Modifier
> = {
  Opt: "Alt",
  Win: "Meta",
  Cmd: "Meta",
  RightOpt: "RightAlt",
  RightWin: "RightMeta",
  RightCmd: "RightMeta",
};

export function modifierValue(modifier: Modifier): number {
  return 1 << MODIFIERS.indexOf(modifier);
}

export function modifiersValue(modifiers: Modifier[]): number {
  return modifiers.reduce(
    (accumulator, modifier) => accumulator | modifierValue(modifier),
    0
  );
}

export function modifiersToString(modifiers: Modifier[]): string {
  return MODIFIERS.reduce((accum, current) => {
    if (!modifiers.includes(current)) {
      return accum;
    }
    return accum ? `${accum}+${current}` : current;
  }, "");
}

export function modifiersToCanonical(modifiers: Modifier[]): Modifier[] {
  return MODIFIERS.reduce<Modifier[]>((accum, current) => {
    if (modifiers.includes(current)) {
      return [...accum, current];
    }
    return accum;
  }, []);
}

export function modifiersFromValue(value: number): Modifier[] {
  const modifiers: Modifier[] = [];

  for (let i = 0; i < MODIFIERS.length; i++) {
    const mask = 1 << i;
    if ((value & mask) === mask) {
      modifiers.push(MODIFIERS[i]!);
    }
  }

  return modifiers;
}

export const MEDIA_CODE = [
  "BrightnessUp",
  "BrightnessDown",
  "KbBrightnessUp",
  "KbBrightnessDown",
  "Next",
  "Previous",
  "Stop",
  "Play",
  "Mute",
  "VolumeUp",
  "VolumeDown",
  "Favorites",
  "Finder",
  "Calculator",
  "Browser",
  "Screenlock",
] as const;
export type MediaCode = (typeof MEDIA_CODE)[number];
export const MediaCodeSchema = z.union(
  MEDIA_CODE.map(m => z.literal(m))
) satisfies z.ZodType<MediaCode>;

export function isMediaCode(value: unknown): value is MediaCode {
  return MediaCodeSchema.safeParse(value).success;
}

export const MediaCodeValues: Record<MediaCode, number> = {
  BrightnessUp: 0x6f,
  BrightnessDown: 0x70,
  KbBrightnessUp: 0x79,
  KbBrightnessDown: 0x7a,
  Next: 0xb5,
  Previous: 0xb6,
  Stop: 0xb7,
  Play: 0xcd,
  Mute: 0xe2,
  VolumeUp: 0xe9,
  VolumeDown: 0xea,
  Favorites: 0x182,
  Finder: 0x184,
  Calculator: 0x192,
  Browser: 0x196,
  Screenlock: 0x19e,
};

export type Custom = number;

export const CustomSchema = z.uint32() satisfies z.ZodType<Custom>;

export type Code = WellKnownCode | Custom;

const CodeSchema = z.union([
  WellKnownCodeSchema,
  CustomSchema,
]) satisfies z.ZodType<Code>;

export function isCode(value: unknown): value is Code {
  return CodeSchema.safeParse(value).success;
}

export function codeValue(code: Code | undefined): number {
  if (code === undefined) {
    return 0;
  }
  if (typeof code === "number") {
    return code;
  }

  return wellKnownCodeValue(code);
}

export type KeyChord = {
  modifiers: Modifier[];
  code?: Code;
};

export const KeyChordSchema = z.object({
  modifiers: z.array(ModifierSchema),
  code: CodeSchema,
}) satisfies z.ZodType<KeyChord>;

export function isKeyChord(value: unknown): value is KeyChord {
  return KeyChordSchema.safeParse(value).success;
}

function keyChordsAreEqual(a: KeyChord, b: KeyChord | undefined) {
  if (!b) {
    return false;
  }
  return (
    a.code === b.code &&
    modifiersValue(a.modifiers) === modifiersValue(b.modifiers)
  );
}

const MOUSE_MODIFIER = ["Ctrl", "Shift", "Alt"] as const;
export type MouseModifier = (typeof MOUSE_MODIFIER)[number];

export const MouseModifierSchema = z.union(
  MOUSE_MODIFIER.map(m => z.literal(m))
) satisfies z.ZodType<MouseModifier>;

export function isMouseModifier(value: unknown): value is MouseModifier {
  return MouseModifierSchema.safeParse(value).success;
}

export function mouseModifierValue(
  modifier: MouseModifier | undefined
): number {
  if (modifier === undefined) {
    return 0;
  }
  switch (modifier) {
    case "Ctrl":
      return 1;
    case "Shift":
      return 2;
    case "Alt":
      return 3;
  }
}

const MOUSE_BUTTON = ["Left", "Right", "Middle"] as const;
export type MouseButton = (typeof MOUSE_BUTTON)[number];

export const MouseButtonSchema = z.union(
  MOUSE_BUTTON.map(b => z.literal(b))
) satisfies z.ZodType<MouseButton>;

export function isMouseButton(value: unknown): value is MouseButton {
  return MouseButtonSchema.safeParse(value).success;
}

export function mouseButtonValue(button: MouseButton | undefined): number {
  if (button === undefined) {
    return 0;
  }

  switch (button) {
    case "Left":
      return 1;
    case "Right":
      return 2;
    case "Middle":
      return 4;
  }
}

export function mouseButtonsValue(buttons: MouseButton[]): number {
  return buttons.reduce(
    (accumulator, button) => accumulator | mouseButtonValue(button),
    0
  );
}

function mouseButtonsAreEqual(a: MouseButton[], b: MouseButton[]): boolean {
  return mouseButtonsValue(a) === mouseButtonsValue(b);
}

export type MouseAction =
  | {
      type: "Move";
      x: number;
      y: number;
    }
  | {
      type: "Drag";
      buttons: MouseButton[];
      x: number;
      y: number;
    }
  | {
      type: "Click";
      buttons: MouseButton[];
    }
  | {
      type: "Wheel";
      delta: number;
    };

export const MouseActionSchema = z.union([
  z.object({
    type: z.literal("Move"),
    x: z.int32(),
    y: z.int32(),
  }),
  z.object({
    type: z.literal("Drag"),
    buttons: z.array(MouseButtonSchema),
    x: z.int32(),
    y: z.int32(),
  }),
  z.object({
    type: z.literal("Click"),
    buttons: z.array(MouseButtonSchema),
  }),
  z.object({
    type: z.literal("Wheel"),
    delta: z.int32(),
  }),
]) satisfies z.ZodType<MouseAction>;

export function isMouseAction(value: unknown): value is MouseAction {
  return MouseActionSchema.safeParse(value).success;
}

function mouseActionsAreEqual(a: MouseAction, b: MouseAction): boolean {
  switch (a.type) {
    case "Move":
      return b.type === "Move" && a.x === b.x && a.y === b.y;
    case "Drag":
      return (
        b.type === "Drag" &&
        a.x === b.y &&
        a.y === b.y &&
        mouseButtonsAreEqual(a.buttons, b.buttons)
      );
    case "Click":
      return b.type === "Click" && mouseButtonsAreEqual(a.buttons, b.buttons);
    case "Wheel":
      return b.type === "Wheel" && a.delta === b.delta;
  }
}

export type MouseEvent = {
  type: "Mouse";
  action: MouseAction;
  modifier?: MouseModifier | undefined;
};

export const MouseEventSchema = z.object({
  type: z.literal("Mouse"),
  action: MouseActionSchema,
  modifier: MouseModifierSchema.optional(),
}) satisfies z.ZodType<MouseEvent>;

export function isMouseEvent(value: unknown): value is MouseEvent {
  return MouseEventSchema.safeParse(value).success;
}

function mouseEventsAreEqual(a: MouseEvent, b: MouseEvent): boolean {
  return mouseActionsAreEqual(a.action, b.action) && a.modifier === b.modifier;
}

export type MacroOptions = {
  delay: number;
};

const MacroOptionsSchema = z.object({
  delay: z.uint32(),
}) satisfies z.ZodType<MacroOptions>;

export function isMacroOptions(value: unknown): value is MacroOptions {
  return MacroOptionsSchema.safeParse(value).success;
}

export type KeyboardEvent = {
  type: "Keyboard";
  options: MacroOptions;
  keyChords: KeyChord[];
};

const KeyboardEventSchema = z.object({
  type: z.literal("Keyboard"),
  options: MacroOptionsSchema,
  keyChords: z.array(KeyChordSchema),
}) satisfies z.ZodType<KeyboardEvent>;

export function isKeyboardEvent(value: unknown): value is KeyboardEvent {
  return KeyboardEventSchema.safeParse(value).success;
}

function keyboardEventsAreEqual(a: KeyboardEvent, b: KeyboardEvent): boolean {
  return (
    a.options.delay === b.options.delay &&
    a.keyChords.length === b.keyChords.length &&
    a.keyChords.every((keyChord, i) =>
      keyChordsAreEqual(keyChord, b.keyChords[i])
    )
  );
}

export type MediaEvent = {
  type: "Media";
  mediaCode: MediaCode;
};

export const MediaEventSchema = z.object({
  type: z.literal("Media"),
  mediaCode: MediaCodeSchema,
}) satisfies z.ZodType<MediaEvent>;

export function isMediaEvent(value: unknown): value is MediaEvent {
  return MediaEventSchema.safeParse(value).success;
}

function mediaEventsAreEqual(a: MediaEvent, b: MediaEvent): boolean {
  return a.mediaCode === b.mediaCode;
}

export type Macro = KeyboardEvent | MouseEvent | MediaEvent;

export const MacroSchema = z.union([
  KeyboardEventSchema,
  MouseEventSchema,
  MediaEventSchema,
]) satisfies z.ZodType<Macro>;

export function isMacro(value: unknown): value is Macro {
  return isKeyboardEvent(value) || isMouseEvent(value) || isMediaEvent(value);
}

export function macrosAreEqual(a: Macro, b: Macro): boolean {
  if (a.type !== b.type) {
    return false;
  }
  switch (a.type) {
    case "Keyboard":
      return keyboardEventsAreEqual(a, b as KeyboardEvent);
    case "Mouse":
      return mouseEventsAreEqual(a, b as MouseEvent);
    case "Media":
      return mediaEventsAreEqual(a, b as MediaEvent);
  }
}

export function macroKind(macro: Macro): number {
  switch (macro.type) {
    case "Keyboard":
      return 1;
    case "Media":
      return 2;
    case "Mouse":
      return 3;
  }
}

export function macroKindFromValue(
  value: number
): "Keyboard" | "Media" | "Mouse" | undefined {
  switch (value) {
    case 1:
      return "Keyboard";
    case 2:
      return "Media";
    case 3:
      return "Mouse";
    default:
      return;
  }
}

export type KeyBinding = {
  layer: number;
  key: Key;
  expansion: Macro;
  origin: KeyBindingOrigin;
};

export const KeyBindingSchema = z.object({
  layer: z.uint32(),
  key: KeySchema,
  expansion: MacroSchema,
  origin: KeyBindingOriginSchema,
}) satisfies z.ZodType<KeyBinding>;

export function isKeyBinding(value: unknown): value is KeyBinding {
  return KeyBindingSchema.safeParse(value).success;
}
