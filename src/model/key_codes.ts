import { z } from "zod";

import { Modifier } from "./keyboard";

// These are in the USB HID order starting a 0x04
// prettier-ignore
export const WELL_KNOWN_CODES = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
  "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4",
  "5", "6", "7", "8", "9", "0", "Enter", "Escape", "Backspace", "Tab", "Space",
  "Minus", "Equal", "LeftBracket", "RightBracket", "Backslash", "NonUSHash",
  "Semicolon", "Quote", "Grave", "Comma", "Dot", "Slash", "CapsLock", "F1",
  "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
  "PrintScreen", "ScrollLock", "Pause", "Insert", "Home", "PageUp", "Delete",
  "End", "PageDown", "Right", "Left", "Down", "Up", "NumLock", "NumPadSlash",
  "NumPadAsterisk", "NumPadMinus", "NumPadPlus", "NumPadEnter", "NumPad1",
  "NumPad2", "NumPad3", "NumPad4", "NumPad5", "NumPad6", "NumPad7", "NumPad8",
  "NumPad9", "NumPad0", "NumPadDot", "NonUSBackslash", "Application", "Power",
  "NumPadEqual", "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F20", "F21",
  "F22", "F23", "F24",
] as const;

// prettier-ignore
export const FUNCTION_KEYS = [
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
  "F9", "F10", "F11", "F12", "F13", "F14", "F15", "F16",
  "F17", "F18", "F19", "F20", "F21", "F22", "F23", "F24",
] as const;
export type FunctionKey = (typeof FUNCTION_KEYS)[number];
export function isFunctionKey(value: unknown): value is FunctionKey {
  return (
    typeof value === "string" && FUNCTION_KEYS.includes(value as FunctionKey)
  );
}

// prettier-ignore
export const NUMPAD_KEYS = [
  "NumPadSlash", "NumPadAsterisk",
  "NumPadMinus", "NumPadPlus",
  "NumPad1", "NumPad2", "NumPad3", "NumPad4", "NumPad5",
  "NumPad6", "NumPad7", "NumPad8", "NumPad9", "NumPad0",
  "NumPadDot", "NumPadEqual",
] as const;
export type NumPadKey = (typeof NUMPAD_KEYS)[number];
export function isNumPadKey(value: unknown): value is NumPadKey {
  return typeof value === "string" && NUMPAD_KEYS.includes(value as NumPadKey);
}

export const PUNCTUATION_KEYS = [
  "Minus",
  "Equal",
  "LeftBracket",
  "RightBracket",
  "Backslash",
  "NonUSHash",
  "Semicolon",
  "Quote",
  "Grave",
  "Comma",
  "Dot",
  "Slash",
] as const;
export type PunctuationKey = (typeof PUNCTUATION_KEYS)[number];
export function isPunctuationKey(value: unknown): value is PunctuationKey {
  return (
    typeof value === "string" &&
    PUNCTUATION_KEYS.includes(value as PunctuationKey)
  );
}

export const SPECIAL_KEYS = [
  "Enter",
  "NumPadEnter",
  "Escape",
  "Backspace",
  "Tab",
  "Space",
  "NumLock",
  "CapsLock",
  "PrintScreen",
  "ScrollLock",
  "Pause",
  "Insert",
  "Home",
  "PageUp",
  "Delete",
  "End",
  "PageDown",
  "Right",
  "Left",
  "Down",
  "Up",
  "NonUSBackslash",
  "Application",
  "Power",
] as const;
export type SpecialKey = (typeof SPECIAL_KEYS)[number];
export function isSpecialKey(value: unknown): value is SpecialKey {
  return (
    typeof value === "string" && SPECIAL_KEYS.includes(value as SpecialKey)
  );
}

export type WellKnownCode = (typeof WELL_KNOWN_CODES)[number];

export const WellKnownCodeSchema = z.union(
  WELL_KNOWN_CODES.map(c => z.literal(c))
) satisfies z.ZodType<WellKnownCode>;

export function isWellKnownCode(value: unknown): value is WellKnownCode {
  return WellKnownCodeSchema.safeParse(value).success;
}

export function wellKnownCodeValue(code: WellKnownCode): number {
  return WELL_KNOWN_CODES.indexOf(code) + 0x04;
}

export function wellKnownCodeFromValue(
  value: number
): WellKnownCode | undefined {
  return WELL_KNOWN_CODES[value - 4];
}

// Chromes keyboard event keys
// prettier-ignore
export const KEYBOARD_EVENT_CODES = [
  "AltLeft", "AltRight", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp",
  "AudioVolumeDown", "AudioVolumeMute", "AudioVolumeUp", "Backquote",
  "Backslash", "Backspace", "BracketLeft", "BracketRight", "BrowserBack",
  "BrowserFavorites", "BrowserForward", "BrowserHome", "BrowserRefresh",
  "BrowserSearch", "BrowserStop", "CapsLock", "Comma", "ContextMenu",
  "ControlLeft", "ControlRight", "Convert", "Copy", "Cut", "Delete", "Digit0",
  "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7",
  "Digit8", "Digit9", "Eject", "End", "Enter", "Equal", "Escape", "F1", "F10",
  "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F2", "F20",
  "F21", "F22", "F23", "F24", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "Help",
  "Home", "Insert", "IntlBackslash", "IntlRo", "IntlYen", "KanaMode", "KeyA",
  "KeyB", "KeyC", "KeyD", "KeyE", "KeyF", "KeyG", "KeyH", "KeyI", "KeyJ",
  "KeyK", "KeyL", "KeyM", "KeyN", "KeyO", "KeyP", "KeyQ", "KeyR", "KeyS",
  "KeyT", "KeyU", "KeyV", "KeyW", "KeyX", "KeyY", "KeyZ", "Lang1", "Lang2",
  "Lang3", "Lang4", "LaunchApp1", "LaunchApp2", "LaunchMail", "MediaPlayPause",
  "MediaSelect", "MediaStop", "MediaTrackNext", "MediaTrackPrevious",
  "MetaLeft", "MetaRight", "Minus", "NonConvert", "NumLock", "Numpad0",
  "Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5", "Numpad6", "Numpad7",
  "Numpad8", "Numpad9", "NumpadAdd", "NumpadComma", "NumpadDecimal",
  "NumpadDivide", "NumpadEnter", "NumpadEqual", "NumpadMultiply",
  "NumpadSubtract", "PageDown", "PageUp", "Paste", "Pause", "Pause", "Period",
  "Power", "PrintScreen", "Quote", "ScrollLock", "Semicolon", "ShiftLeft",
  "ShiftRight", "Slash", "Sleep", "Space", "Tab", "Undo", "WakeUp",
] as const;

export type KeyboardEventCode = (typeof KEYBOARD_EVENT_CODES)[number];

export function isKeyboardEventCode(value: string): value is KeyboardEventCode {
  return KEYBOARD_EVENT_CODES.some(code => code === value);
}

const WELL_KNOWN_TO_KEYBOARD_EVENT: Record<WellKnownCode, KeyboardEventCode> = {
  A: "KeyA",
  B: "KeyB",
  C: "KeyC",
  D: "KeyD",
  E: "KeyE",
  F: "KeyF",
  G: "KeyG",
  H: "KeyH",
  I: "KeyI",
  J: "KeyJ",
  K: "KeyK",
  L: "KeyL",
  M: "KeyM",
  N: "KeyN",
  O: "KeyO",
  P: "KeyP",
  Q: "KeyQ",
  R: "KeyR",
  S: "KeyS",
  T: "KeyT",
  U: "KeyU",
  V: "KeyV",
  W: "KeyW",
  X: "KeyX",
  Y: "KeyY",
  Z: "KeyZ",
  1: "Digit1",
  2: "Digit2",
  3: "Digit3",
  4: "Digit4",
  5: "Digit5",
  6: "Digit6",
  7: "Digit7",
  8: "Digit8",
  9: "Digit9",
  0: "Digit0",
  Enter: "Enter",
  Escape: "Escape",
  Backspace: "Backspace",
  Tab: "Tab",
  Space: "Space",
  Minus: "Minus",
  Equal: "Equal",
  LeftBracket: "BracketLeft",
  RightBracket: "BracketRight",
  Backslash: "Backslash",
  NonUSHash: "Backslash",
  Semicolon: "Semicolon",
  Quote: "Quote",
  Grave: "Backquote",
  Comma: "Comma",
  Dot: "Period",
  Slash: "Slash",
  CapsLock: "CapsLock",
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  PrintScreen: "PrintScreen",
  ScrollLock: "ScrollLock",
  Pause: "Pause",
  Insert: "Insert",
  Home: "Home",
  PageUp: "PageUp",
  Delete: "Delete",
  End: "End",
  PageDown: "PageDown",
  Right: "ArrowRight",
  Left: "ArrowLeft",
  Down: "ArrowDown",
  Up: "ArrowUp",
  NumLock: "NumLock",
  NumPadSlash: "NumpadDivide",
  NumPadAsterisk: "NumpadMultiply",
  NumPadMinus: "NumpadSubtract",
  NumPadPlus: "NumpadAdd",
  NumPadEnter: "NumpadEnter",
  NumPad1: "Numpad1",
  NumPad2: "Numpad2",
  NumPad3: "Numpad3",
  NumPad4: "Numpad4",
  NumPad5: "Numpad5",
  NumPad6: "Numpad6",
  NumPad7: "Numpad7",
  NumPad8: "Numpad8",
  NumPad9: "Numpad9",
  NumPad0: "Numpad0",
  NumPadDot: "NumpadDecimal",
  NonUSBackslash: "IntlBackslash",
  Application: "ContextMenu",
  Power: "Power",
  NumPadEqual: "NumpadEqual",
  F13: "F13",
  F14: "F14",
  F15: "F15",
  F16: "F16",
  F17: "F17",
  F18: "F18",
  F19: "F19",
  F20: "F20",
  F21: "F21",
  F22: "F22",
  F23: "F23",
  F24: "F24",
};

export function keyboardEventCodeFromWellKnownCode(
  code: WellKnownCode
): KeyboardEventCode {
  return WELL_KNOWN_TO_KEYBOARD_EVENT[code];
}

const KEYBOARD_EVENT_TO_WELL_KNOWN: Record<
  KeyboardEventCode,
  WellKnownCode | Modifier | "unknown"
> = {
  PageDown: "PageDown",
  Enter: "Enter",
  Escape: "Escape",
  Backspace: "Backspace",
  Tab: "Tab",
  Space: "Space",
  Minus: "Minus",
  Equal: "Equal",
  Backslash: "Backslash",
  Semicolon: "Semicolon",
  Quote: "Quote",
  Comma: "Comma",
  Slash: "Slash",
  CapsLock: "CapsLock",
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  PrintScreen: "PrintScreen",
  ScrollLock: "ScrollLock",
  Pause: "Pause",
  Insert: "Insert",
  Home: "Home",
  PageUp: "PageUp",
  Delete: "Delete",
  End: "End",
  NumLock: "NumLock",
  Power: "Power",
  F13: "F13",
  F14: "F14",
  F15: "F15",
  F16: "F16",
  F17: "F17",
  F18: "F18",
  F19: "F19",
  F20: "F20",
  F21: "F21",
  F22: "F22",
  F23: "F23",
  F24: "F24",
  AltLeft: "Alt",
  AltRight: "RightAlt",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  AudioVolumeDown: "unknown",
  AudioVolumeMute: "unknown",
  AudioVolumeUp: "unknown",
  Backquote: "Grave",
  BracketLeft: "LeftBracket",
  BracketRight: "RightBracket",
  BrowserBack: "unknown",
  BrowserFavorites: "unknown",
  BrowserForward: "unknown",
  BrowserHome: "unknown",
  BrowserRefresh: "unknown",
  BrowserSearch: "unknown",
  BrowserStop: "unknown",
  ContextMenu: "Application",
  ControlLeft: "Ctrl",
  ControlRight: "RightCtrl",
  Convert: "unknown",
  Copy: "unknown",
  Cut: "unknown",
  Digit0: "0",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Eject: "unknown",
  Help: "unknown",
  IntlBackslash: "NonUSBackslash",
  IntlRo: "unknown",
  IntlYen: "unknown",
  KanaMode: "unknown",
  KeyA: "A",
  KeyB: "B",
  KeyC: "C",
  KeyD: "D",
  KeyE: "E",
  KeyF: "F",
  KeyG: "G",
  KeyH: "H",
  KeyI: "I",
  KeyJ: "J",
  KeyK: "K",
  KeyL: "L",
  KeyM: "M",
  KeyN: "N",
  KeyO: "O",
  KeyP: "P",
  KeyQ: "Q",
  KeyR: "R",
  KeyS: "S",
  KeyT: "T",
  KeyU: "U",
  KeyV: "V",
  KeyW: "W",
  KeyX: "X",
  KeyY: "Y",
  KeyZ: "Z",
  Lang1: "unknown",
  Lang2: "unknown",
  Lang3: "unknown",
  Lang4: "unknown",
  LaunchApp1: "unknown",
  LaunchApp2: "unknown",
  LaunchMail: "unknown",
  MediaPlayPause: "unknown",
  MediaSelect: "unknown",
  MediaStop: "unknown",
  MediaTrackNext: "unknown",
  MediaTrackPrevious: "unknown",
  MetaLeft: "Meta",
  MetaRight: "RightMeta",
  NonConvert: "unknown",
  Numpad0: "NumPad0",
  Numpad1: "NumPad1",
  Numpad2: "NumPad2",
  Numpad3: "NumPad3",
  Numpad4: "NumPad4",
  Numpad5: "NumPad5",
  Numpad6: "NumPad6",
  Numpad7: "NumPad7",
  Numpad8: "NumPad8",
  Numpad9: "NumPad9",
  NumpadAdd: "NumPadPlus",
  NumpadComma: "unknown",
  NumpadDecimal: "NumPadDot",
  NumpadDivide: "NumPadSlash",
  NumpadEnter: "NumPadEnter",
  NumpadEqual: "NumPadEqual",
  NumpadMultiply: "NumPadAsterisk",
  NumpadSubtract: "NumPadMinus",
  Paste: "unknown",
  Period: "Dot",
  ShiftLeft: "Shift",
  ShiftRight: "RightShift",
  Sleep: "unknown",
  Undo: "unknown",
  WakeUp: "unknown",
};

export function lookupKeyboardEventCode(
  code: KeyboardEventCode
): WellKnownCode | Modifier | "unknown" {
  return KEYBOARD_EVENT_TO_WELL_KNOWN[code];
}
