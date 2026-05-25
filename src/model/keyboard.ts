import { WellKnownCode, wellKnownCodeValue } from "./key_codes";

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
  buttons: number;
  encoders: number;
};

export type KeyBinding = {
  layer: number;
  key: Key;
  expansion: Macro;
};

export type EncoderAction = "ccw" | "press" | "cw";
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
export type Button = number;

export type Key = Button | Encoder;

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

export function modifiersValue(modifiers: Set<Modifier>): number {
  return Array.from(modifiers).reduce(
    (accumulator, modifier) => accumulator | modifierValue(modifier),
    0
  );
}

export function modifiersToString(modifiers: Set<Modifier>): string {
  return MODIFIERS.reduce((accum, current) => {
    if (!modifiers.has(current)) {
      return accum;
    }
    return accum ? `${accum}+${current}` : current;
  }, "");
}

export function modifiersFromValue(value: number): Set<Modifier> {
  const modifiers = new Set<Modifier>();

  for (let i = 0; i < MODIFIERS.length; i++) {
    const mask = 1 << i;
    if ((value & mask) === mask) {
      modifiers.add(MODIFIERS[i]!);
    }
  }

  return modifiers;
}

export type MediaCode =
  | "Next"
  | "Previous"
  | "Stop"
  | "Play"
  | "Mute"
  | "VolumeUp"
  | "VolumeDown"
  | "Favorites"
  | "Calculator"
  | "Screenlock";

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
  modifiers: Set<Modifier>;
  code?: Code;
};

export type MouseModifier = "Ctrl" | "Shift" | "Alt";

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

export type MouseButton = "Left" | "Right" | "Middle";

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

export function mouseButtonsValue(buttons: Set<MouseButton>): number {
  return Array.from(buttons).reduce(
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
      buttons: Set<MouseButton>;
      x: number;
      y: number;
    }
  | {
      type: "Click";
      buttons: Set<MouseButton>;
    }
  | {
      type: "Wheel";
      delta: number;
    };

export type MouseEvent = {
  type: "Mouse";
  action: MouseAction;
  modifier?: MouseModifier;
};

export type MacroOptions = {
  delay: number;
};

export type KeyboardEvent = {
  type: "Keyboard";
  options: MacroOptions;
  keyChords: KeyChord[];
};

export type Macro =
  | KeyboardEvent
  | MouseEvent
  | {
      type: "Media";
      mediaCode: MediaCode;
    };

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
