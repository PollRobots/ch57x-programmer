import { wellKnownCodeFromValue } from "./key_codes";
import {
  codeValue,
  encoderActionFromValue,
  encoderActionValue,
  Key,
  KeyBinding,
  Keyboard,
  KeyChord,
  macroKind,
  macroKindFromValue,
  MediaCodeValues,
  modifiersFromValue,
  modifiersValue,
  mouseButtonsValue,
  mouseModifierValue,
} from "./keyboard";

const collator = new Intl.Collator("en-US", {
  sensitivity: "base",
  usage: "search",
});

const LED_COLORS = [
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Cyan",
  "Blue",
  "Purple",
] as const;

export type LedColor = (typeof LED_COLORS)[number];

function ledColorValue(ledColor: LedColor) {
  return LED_COLORS.indexOf(ledColor) + 1;
}

function parseLedColorValue(value: string): LedColor | undefined {
  return LED_COLORS.find(color => collator.compare(color, value) === 0);
}

export type LedBacklightColor = LedColor | "White";

function ledBacklightColorValue(ledBacklightColor: LedBacklightColor): number {
  if (ledBacklightColor === "White") {
    return 0;
  }
  return ledColorValue(ledBacklightColor);
}

function parseLedBacklightColorValue(
  value: string
): LedBacklightColor | undefined {
  if (collator.compare("White", value) === 0) {
    return "White";
  }
  return parseLedColorValue(value);
}

type LedMode =
  | {
      type: "Off";
    }
  | {
      type: "Backlight";
      color: LedBacklightColor;
    }
  | {
      type: "Shock" | "Shock2" | "Press";
      color: LedColor;
    };

function ledModeCode(ledMode: LedMode): number {
  switch (ledMode.type) {
    case "Off":
      return 0;
    case "Backlight":
      if (ledMode.color === "White") {
        return 5;
      }
      return (ledBacklightColorValue(ledMode.color) << 4) | 1;
    case "Shock":
      return (ledColorValue(ledMode.color) << 4) | 2;
    case "Shock2":
      return (ledColorValue(ledMode.color) << 4) | 3;
    case "Press":
      return (ledColorValue(ledMode.color) << 4) | 4;
  }
}

function parseLedMode(value: string): LedMode | undefined {
  const [mode, color] = value.split(" ");
  if (mode && !color && collator.compare("Off", mode) === 0) {
    return { type: "Off" };
  } else if (mode && color) {
    if (collator.compare("Backlight", mode) === 0) {
      const parsedColor = parseLedBacklightColorValue(color);
      if (parsedColor) {
        return { type: "Backlight", color: parsedColor };
      }
    } else {
      const parsedColor = parseLedColorValue(color);
      if (parsedColor) {
        if (collator.compare("Shock", mode)) {
          return { type: "Shock", color: parsedColor };
        }
        if (collator.compare("Shock2", mode)) {
          return { type: "Shock2", color: parsedColor };
        }
        if (collator.compare("Press", mode)) {
          return { type: "Press", color: parsedColor };
        }
      }
    }
  }
  return;
}

type LedArgs = {
  layer: number;
  mode: LedMode;
};

function parseLedArgs(value: string): LedArgs | undefined {
  const [rawLayer, rawLedMode] = value.split(" ", 2);
  if (rawLayer === undefined || rawLedMode === undefined) {
    return;
  }
  const layer = Number(rawLayer);
  if (!Number.isInteger(layer) || layer < 0) {
    return undefined;
  }
  const mode = parseLedMode(rawLedMode);
  if (mode === undefined) {
    return;
  }
  return { layer, mode };
}

const MAX_NUMBER_OF_BUTTONS = 15;

// prettier-ignore
const READ_DEVICE_TYPE_BUFFER = [
  0xfb, 0xfb, 0xfb, 0x02, 0x06, 0x2c, 0xd0, 0x80,
  0x00, 0xdc, 0xcf, 0x80, 0x00, 0xcc, 0xd2, 0x21,
  0x01, 0xe0, 0xcf, 0x80, 0x00, 0x2c, 0xd0, 0x80,
  0x00, 0x00, 0x00, 0x00, 0x00, 0xd0, 0x0d, 0x48,
  0x00, 0xfc, 0xcf, 0x80, 0x00, 0xc0, 0x61, 0xbc,
  0x06, 0x38, 0xd0, 0x80, 0x00, 0x70, 0xf5, 0x1e,
  0x62, 0x98, 0xda, 0x11, 0x62, 0x0c, 0x80, 0x00,
  0x00, 0x48, 0x09, 0x00, 0x06, 0xff, 0xff, 0xff,
];

// prettier-ignore
const READ_CONFIG_BUFFER = [
  0xfa, 0x00, 0x00, 0x00, 0x06, 0x00, 0xcc, 0x80,
  0x00, 0xc0, 0xcc, 0x80, 0x00, 0x7c, 0xf2, 0x02,
  0x69, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x00, 0x14,
  0x06, 0xc0, 0xcc, 0x80, 0x00, 0x49, 0x01, 0x00,
  0x00, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0xb0, 0xcc, 0x80, 0x00, 0x40, 0xcd, 0x80,
  0x00, 0x88, 0x05, 0x00, 0x06, 0xc0, 0x0a, 0x10,
  0x06, 0xe0, 0xcc, 0x80, 0x00, 0xc7, 0xb6, 0x48,
];

const READ_CONFIG_BUFFER_OFFSETS = {
  buttons: 1,
  encoders: 2,
  layers: 3,
};

export function makeKeyboard884(buttons: number, knobs: number): Keyboard {
  const deviceConfig: {
    buttons: number;
    encoders: number;
  } = { buttons, encoders: knobs };

  const keyId = (key: Key): number => {
    if (typeof key === "number") {
      if (
        key >= MAX_NUMBER_OF_BUTTONS ||
        (key >= 12 && deviceConfig.encoders === 4)
      ) {
        throw new Error("Invalid key index");
      }
      return key + 1;
    }
    const [encoder, action] = key;

    if (encoder >= 3) {
      throw new Error("Invalid knob index");
    }
    if (encoder === 3 && deviceConfig.buttons <= 12) {
      return 13 + encoderActionValue(action);
    }
    return MAX_NUMBER_OF_BUTTONS + 1 + 3 * encoder + encoderActionValue(action);
  };

  const keyFromId = (id: number): Key | undefined => {
    if (id === 0) {
      return;
    }
    if (id <= MAX_NUMBER_OF_BUTTONS) {
      if (deviceConfig.encoders === 4 && id >= 13) {
        // special case for 4th encoder, for some reason it is encoded as if it was buttons 13-15
        const encoderAction = encoderActionFromValue(id - 13);
        if (encoderAction) {
          return [3, encoderAction];
        }
        return;
      }
      return id - 1;
    }
    const encoderId = id - MAX_NUMBER_OF_BUTTONS - 1;
    const encoder = Math.floor(encoderId / 3);
    const encoderAction = encoderActionFromValue(encoderId % 3);
    if (encoder >= 4 || encoderAction === undefined) {
      return;
    }
    return [encoder, encoderAction];
  };

  return {
    name: "884x",
    bindKey: (layer, key, expansion) => {
      if (layer >= 16) {
        return [];
      }

      const messages: number[][] = [];

      const message = [
        0x03,
        0xfe,
        keyId(key),
        layer + 1,
        macroKind(expansion),
        0,
        0,
        0,
        0,
        0,
      ];

      switch (expansion.type) {
        case "Keyboard": {
          const presses = expansion.keyChords;
          if (presses.length > 18) {
            throw new Error("Macro sequence is too long");
          }

          if (presses.length === 1 && presses[0]?.code === undefined) {
            message.push(0);
          } else {
            message.push(presses.length);
          }

          for (const { modifiers, code } of presses) {
            message.push(modifiersValue(modifiers), codeValue(code));
          }
          break;
        }

        case "Media": {
          const code = expansion.mediaCode;
          const value = MediaCodeValues[code];
          const low = value & 0xff;
          const high = (value >> 8) & 0xff;
          message.push(0, low, high, 0, 0, 0, 0);
          break;
        }

        case "Mouse": {
          const mouseAction = expansion.action;
          const modifierValue = mouseModifierValue(expansion.modifier);

          switch (mouseAction.type) {
            case "Move":
              message.push(
                0x05,
                modifierValue,
                0,
                mouseAction.x,
                mouseAction.y
              );
              break;

            case "Drag":
              message.push(
                0x05,
                modifierValue,
                mouseButtonsValue(mouseAction.buttons),
                mouseAction.x,
                mouseAction.y
              );
              break;

            case "Click":
              message.push(
                0x01,
                modifierValue,
                mouseButtonsValue(mouseAction.buttons)
              );
              break;

            case "Wheel":
              message.push(0x03, modifierValue, 0, 0, 0, mouseAction.delta);
              break;
          }
          break;
        }
      }

      if (expansion.type === "Keyboard" && expansion.options.delay > 0) {
        const delay = expansion.options.delay;
        if (delay > 6000) {
          throw new Error("Maximum supported delay is 6000ms");
        }

        const low = delay & 0xff;
        const high = (delay >> 8) & 0xff;

        messages.push([0x03, 0xfe, keyId(key), layer + 1, 5, low, high]);
      }

      messages.push([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);
      messages.push([0x03, 0xfd, 0xfe, 0xff]);
      messages.push([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);

      return messages;
    },
    setLed: args => {
      const ledArgs = parseLedArgs(args.join(" "));
      if (ledArgs === undefined) {
        throw new Error("Unable to parse led arguments");
      }
      if (ledArgs.layer > 2) {
        throw new Error("Invalid layer, must be 0-2");
      }

      const code = ledModeCode(ledArgs.mode);

      return [
        [
          0x03,
          0xfe,
          0xb0,
          ledArgs.layer + 1,
          0x08,
          0,
          0,
          0,
          0,
          0,
          0x01,
          0x00,
          code,
        ],
        [0x03, 0xfd, 0xf0, 0xff],
      ];
    },
    getDeviceType: () => READ_DEVICE_TYPE_BUFFER,
    readConfig: layer => {
      const packet = [...READ_CONFIG_BUFFER];

      packet[READ_CONFIG_BUFFER_OFFSETS.buttons] = deviceConfig.buttons;
      packet[READ_CONFIG_BUFFER_OFFSETS.encoders] = deviceConfig.encoders;
      packet[READ_CONFIG_BUFFER_OFFSETS.layers] = layer + 1;

      return packet;
    },
    checkPacketType: (data: Uint8Array) => {
      if (READ_DEVICE_TYPE_BUFFER[0] == data[0]) {
        return "device";
      }
      if (READ_CONFIG_BUFFER[0] == data[0]) {
        return "config";
      }
      return;
    },
    parseDeviceTypePacket: (data: Uint8Array) => {
      if (READ_DEVICE_TYPE_BUFFER[0] !== data[0]) {
        return;
      }

      deviceConfig.buttons = data[1] ?? deviceConfig.buttons;
      deviceConfig.encoders = data[2] ?? deviceConfig.encoders;
      return deviceConfig;
    },
    parseConfigPacket: (data: Uint8Array): KeyBinding | undefined => {
      if (READ_CONFIG_BUFFER[0] !== data[0]) {
        return;
      }
      const key = keyFromId(data[1]!);
      const layer = data[2]! - 1;
      const macroKind = macroKindFromValue(data[3]!);

      if (key === undefined || layer < 0 || macroKind === undefined) {
        return;
      }

      switch (macroKind) {
        case "Keyboard": {
          const length = data[9]!;
          if (length > 18) {
            return undefined;
          }
          if (length === 0) {
            // TODO: special case
          }
          const keyChords: KeyChord[] = [];
          for (let i = 0, offset = 10; i < length; i++, offset += 2) {
            const modifierValue = data[offset]!;
            const modifiers = modifiersFromValue(modifierValue);
            const codeValue = data[offset + 1]!;
            if (codeValue === 0) {
              keyChords.push({ modifiers });
              continue;
            }

            const wellKnownCode = wellKnownCodeFromValue(codeValue);
            if (wellKnownCode !== undefined) {
              keyChords.push({ modifiers, code: wellKnownCode });
            } else {
              keyChords.push({ modifiers, code: codeValue });
            }
          }
          return {
            layer,
            key,
            expansion: {
              type: "Keyboard",
              options: { delay: 0 },
              keyChords,
            },
            origin: "device",
          };
        }
        case "Media":
        case "Mouse":
          break;
      }

      return;
    },
  };
}
