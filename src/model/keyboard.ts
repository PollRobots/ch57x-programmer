import { isWellKnownCode, WellKnownCode, wellKnownCodeValue } from "./key_codes";


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

export type KeyboardDeviceType = {
  family: KeyboardFamily;
  buttons: number;
  encoders: number;
  layers: number;
};

export type KeyboardFamily = "884x" | "%other";

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

export type KeyBinding = {
  layer: number;
  key: Key;
  expansion: Macro;
  origin: KeyBindingOrigin;
};

export function isKeyBinding(value: unknown): value is KeyBinding {
  return (
    typeof value === "object" &&
    value !== null &&
    "layer" in value &&
    Number.isInteger(value.layer) &&
    "key" in value &&
    isKey(value.key) &&
    "expansion" in value &&
    isMacro(value.expansion) &&
    "origin" in value &&
    isKeyBindingOrigin(value.origin)
  );
}

const KEY_BINDING_ORIGINS = ["device", "editor", "placeholder"] as const;

export type KeyBindingOrigin = (typeof KEY_BINDING_ORIGINS)[number];

function isKeyBindingOrigin(value: unknown): value is KeyBindingOrigin {
  return (
    typeof value === "string" &&
    KEY_BINDING_ORIGINS.includes(value as KeyBindingOrigin)
  );
}

const ENCODER_ACTION = ["ccw", "press", "cw"] as const;
export type EncoderAction = (typeof ENCODER_ACTION)[number];

function isEncoderAction(value: unknown): value is EncoderAction {
  return (
    typeof value === "string" && ENCODER_ACTION.includes(value as EncoderAction)
  );
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

export function isEncoder(value: unknown): value is Encoder {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray(value) &&
    value.length == 2 &&
    Number.isInteger(value[0]) &&
    isEncoderAction(value[1])
  );
}

export type Button = number;

export function isButton(value: unknown): value is Button {
  return Number.isInteger(value);
}

export type Key = Button | Encoder;

function isKey(value: unknown): value is Key {
  return isButton(value) || isEncoder(value);
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

export function isModifier(value: unknown): value is Modifier {
  return typeof value === "string" && MODIFIERS.includes(value as Modifier);
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

const MEDIA_CODE = [
  "Next",
  "Previous",
  "Stop",
  "Play",
  "Mute",
  "VolumeUp",
  "VolumeDown",
  "Favorites",
  "Calculator",
  "Screenlock",
] as const;
export type MediaCode = (typeof MEDIA_CODE)[number];

function isMediaCode(value: unknown): value is MediaCode {
  return typeof value === "string" && MEDIA_CODE.includes(value as MediaCode);
}

export const MediaCodeValues: Record<MediaCode, number> = {
  Next: 0xb5,
  Previous: 0xb6,
  Stop: 0xb7,
  Play: 0xcd,
  Mute: 0xe2,
  VolumeUp: 0xe9,
  VolumeDown: 0xea,
  Favorites: 0x182,
  Calculator: 0x192,
  Screenlock: 0x19e,
};

export type Code = WellKnownCode | Custom;

function isCode(value: unknown): value is Code {
  return isWellKnownCode(value) || Number.isInteger(value);
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

export type Custom = number;

export type KeyChord = {
  modifiers: Modifier[];
  code?: Code;
};

function isKeyChord(value: unknown): value is KeyChord {
  return (
    typeof value === "object" &&
    value !== null &&
    "modifiers" in value &&
    Array.isArray(value.modifiers) &&
    value.modifiers.every(m => isModifier(m)) &&
    (("code" in value && isCode(value.code)) || !("code" in value))
  );
}

const MOUSE_MODIFIER = ["Ctrl", "Shift", "Alt"] as const;
export type MouseModifier = (typeof MOUSE_MODIFIER)[number];

function isMouseModifier(value: unknown): value is MouseModifier {
  return (
    typeof value === "string" && MOUSE_MODIFIER.includes(value as MouseModifier)
  );
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

function isMouseButton(value: unknown): value is MouseButton {
  return (
    typeof value === "string" && MOUSE_BUTTON.includes(value as MouseButton)
  );
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

function isMouseAction(value: unknown): value is MouseAction {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  const buttons =
    "buttons" in value &&
    Array.isArray(value.buttons) &&
    value.buttons.every(b => isMouseButton(b));

  if (value.type === "Move" || value.type === "Drag") {
    return (
      "x" in value &&
      Number.isInteger(value.x) &&
      "y" in value &&
      Number.isInteger(value.y) &&
      (value.type === "Drag" ? buttons : true)
    );
  }
  if (value.type === "Click") {
    return buttons;
  }
  if (value.type === "Wheel") {
    return "delta" in value && Number.isInteger(value.delta);
  }
  return false;
}

export type MouseEvent = {
  type: "Mouse";
  action: MouseAction;
  modifier?: MouseModifier;
};

export function isMouseEvent(value: unknown): value is MouseEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "Mouse" &&
    "action" in value &&
    isMouseAction(value.action) &&
    ("modifier" in value ? isMouseModifier(value.modifier) : true)
  );
}

export type MacroOptions = {
  delay: number;
};

function isMacroOptions(value: unknown): value is MacroOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    "delay" in value &&
    Number.isInteger(value.delay)
  );
}

export type KeyboardEvent = {
  type: "Keyboard";
  options: MacroOptions;
  keyChords: KeyChord[];
};

export function isKeyboardEvent(value: unknown): value is KeyboardEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "Keyboard" &&
    "options" in value &&
    isMacroOptions(value.options) &&
    "keyChords" in value &&
    Array.isArray(value.keyChords) &&
    value.keyChords.every(v => isKeyChord(v))
  );
}

export type MediaEvent = {
  type: "Media";
  mediaCode: MediaCode;
};

export function isMediaEvent(value: unknown): value is MediaEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "Media" &&
    "mediaCode" in value &&
    isMediaCode(value.mediaCode)
  );
}

export type Macro = KeyboardEvent | MouseEvent | MediaEvent;

function isMacro(value: unknown): value is Macro {
  return isKeyboardEvent(value) || isMouseEvent(value) || isMediaEvent(value);
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