interface Navigator {
  readonly keyboard?: Keyboard;
}

interface Keyboard {
  getLayoutMap: () => Promise<KeyboardLayoutMap>;
  lock: (keyCodes?: string[]) => Promise<void>;
  unlock: () => void;
}

interface KeyboardLayoutMap extends Map<string, string> {}
