import {
  codeValue,
  encoderActionValue,
  Key,
  Keyboard,
  KeyboardCapabilities,
  Macro,
  macroKind,
  MediaCodeValues,
  modifiersValue,
  mouseButtonsValue,
  mouseModifierValue,
  signedByteToUnsigned,
} from "@model/keyboard";

const K8890_CAPABILITIES: KeyboardCapabilities = {
  maxLayers: 16,
  maxKeySequence: 6,
  maxButtons: 12,
  maxEncoders: 3,
  supportsKeyDelay: false,
  readConfiguration: false,
};

export function makeKeyboard8890(): Keyboard {
  return {
    name: "8890",
    capabilities: K8890_CAPABILITIES,
    bindKey: (layer: number, key: Key, macro: Macro): number[][] => {
      if (layer >= K8890_CAPABILITIES.maxLayers) {
        throw new Error(`Invalid layer index: ${layer}`);
      }

      const messages: number[][] = [];

      messages.push([0xfe, layer + 1, 0x1, 0x1]);
      switch (macro.type) {
        case "Keyboard": {
          if (macro.options.delay !== 0) {
            throw new Error(
              "Delay feature is not supported by this keyboard model"
            );
          }
          if (macro.keyChords.length > K8890_CAPABILITIES.maxKeySequence) {
            throw new Error(
              `Macro sequence is too long: ${macro.keyChords.length}`
            );
          }

          const items: [number, number][] = [
            [0, 0],
            ...macro.keyChords.map<[number, number]>(({ modifiers, code }) => [
              modifiersValue(modifiers),
              codeValue(code),
            ]),
          ];

          messages.push(
            ...items.map(([modifiers, code], i) => [
              keyId(key),
              ((layer + 1) << 4) | macroKind(macro),
              macro.keyChords.length,
              i,
              modifiers,
              code,
            ])
          );

          break;
        }
        case "Mouse":
          {
            const action = macro.action;
            messages.push([
              keyId(key),
              ((layer + 1) << 4) | macroKind(macro),
              "buttons" in action ? mouseButtonsValue(action.buttons) : 0,
              "x" in action ? signedByteToUnsigned(action.x) : 0,
              "y" in action ? signedByteToUnsigned(action.y) : 0,
              "delta" in action ? signedByteToUnsigned(action.delta) : 0,
              mouseModifierValue(macro.modifier),
            ]);
          }
          break;
        case "Media": {
          const code = macro.mediaCode;
          const value = MediaCodeValues[code];
          const low = value & 0xff;
          const high = (value >> 8) & 0xff;
          messages.push([
            keyId(key),
            ((layer + 1) << 4) | macroKind(macro),
            low,
            high,
          ]);
          break;
        }
      }

      messages.push([0xaa, 0xaa]);

      return messages;
    },
    setLed: () => {
      throw new Error("Function not implemented.");
    },
    getDeviceType: () => {
      throw new Error("Reading configuration is not supported");
    },
    readConfig: () => {
      throw new Error("Reading configuration is not supported");
    },
    checkPacketType: () => {},
    parseDeviceTypePacket: () => {},
    parseConfigPacket: () => {},
  };
}

function keyId(key: Key): number {
  if (typeof key === "number") {
    if (key >= K8890_CAPABILITIES.maxButtons) {
      throw new Error(`Invalid key index: ${key}`);
    }
    return key + 1;
  }
  const [encoder, action] = key;
  if (encoder >= K8890_CAPABILITIES.maxEncoders) {
    throw new Error(`Invalid encoder index: ${key}`);
  }
  return (
    K8890_CAPABILITIES.maxButtons + 1 + 3 * encoder + encoderActionValue(action)
  );
}
