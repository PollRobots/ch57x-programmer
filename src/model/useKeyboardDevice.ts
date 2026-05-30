import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { WELL_KNOWN_CODES } from "./key_codes";
import {
  EncoderAction,
  KeyBinding,
  Keyboard,
  KeyboardDeviceType,
  keysAreEqual,
  UNKNOWN_KEYBOARD_DEVICE,
} from "./keyboard";

export type KeyboardDevice = {
  keyboard: Keyboard;
  device?: HIDDevice;
};

export type ActiveKeyboardDevice = {
  name: string;
  keyboardDeviceType: KeyboardDeviceType;
  keyBindings: KeyBinding[];
  errors: Error[];
  busy: boolean;
  readDeviceType: () => void;
  readConfiguration: () => void;
};

export function useKeyboardDevice({
  keyboard,
  device,
}: KeyboardDevice): ActiveKeyboardDevice {
  const [deviceType, setDeviceType] = useState<KeyboardDeviceType>(
    UNKNOWN_KEYBOARD_DEVICE
  );
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Error[]>([]);
  const pendingBindings = useRef<KeyBinding[]>([]);
  const [keyBindings, setKeyBindings] = useState<KeyBinding[]>([]);

  const defaultBindings = useMemo(() => {
    const defaultBindings: KeyBinding[] = [];
    for (let layer = 0; layer != 3; layer++) {
      for (let button = 0; button < deviceType.buttons; button++) {
        defaultBindings.push({
          layer,
          key: button,
          expansion: {
            type: "Keyboard",
            options: {
              delay: 0,
            },
            keyChords: [
              { modifiers: new Set(), code: WELL_KNOWN_CODES[button]! },
            ],
          },
          origin: "placeholder",
        });
      }
      for (let encoder = 0; encoder < deviceType.encoders; encoder++) {
        defaultBindings.push(
          ...["ccw", "press", "cw"].map<KeyBinding>((action, i) => ({
            layer,
            key: [encoder, action as EncoderAction],
            expansion: {
              type: "Keyboard",
              options: { delay: 0 },
              keyChords: [
                {
                  modifiers: new Set(),
                  code: WELL_KNOWN_CODES[deviceType.buttons + encoder * 3 + i]!,
                },
              ],
            },
            origin: "placeholder",
          }))
        );
      }
    }

    return defaultBindings;
  }, [deviceType.buttons, deviceType.encoders]);

  const updateKeyBindings = useDebounceCallback(
    () => {
      if (pendingBindings.current.length === 0) {
        return;
      }
      const newBindings = pendingBindings.current;
      pendingBindings.current = [];
      const maxLayer =
        newBindings.reduce(
          (accumulator, { layer }) => Math.max(accumulator, layer),
          0
        ) + 1;

      setKeyBindings(bindings => {
        const update = [...bindings];

        for (const binding of newBindings) {
          const existingIndex = update.findIndex(
            b => b.layer === binding.layer && keysAreEqual(b.key, binding.key)
          );
          if (existingIndex >= 0) {
            update[existingIndex] = binding;
          } else {
            update.push(binding);
          }
        }

        return update;
      });
      setDeviceType(deviceType =>
        deviceType.layers >= maxLayer
          ? deviceType
          : { ...deviceType, layers: maxLayer }
      );
    },
    100,
    { leading: false, trailing: true }
  );

  useEffect(() => {
    if (!device) {
      setDeviceType(prev =>
        prev.buttons === 0 && prev.encoders === 0
          ? prev
          : UNKNOWN_KEYBOARD_DEVICE
      );
      setPending(false);
      setErrors(prev => (prev.length === 0 ? prev : []));
      if (pendingBindings.current.length !== 0) {
        pendingBindings.current = [];
      }
      setKeyBindings(prev => (prev.length === 0 ? prev : []));
      return;
    }
    const listener = (event: HIDInputReportEvent) => {
      const data = event.data;
      const array = new Uint8Array(
        data.buffer,
        data.byteOffset,
        data.byteLength
      );

      switch (keyboard.checkPacketType(array)) {
        case "device":
          const deviceType = keyboard.parseDeviceTypePacket(array);
          if (deviceType !== undefined) {
            setDeviceType(prev => {
              if (
                prev.family === deviceType.family &&
                prev.buttons === deviceType.buttons &&
                prev.encoders === deviceType.encoders
              ) {
                return prev;
              }
              return deviceType;
            });
          }
          break;
        case "config":
          const keyBinding = keyboard.parseConfigPacket(array);
          if (keyBinding) {
            pendingBindings.current.push(keyBinding);
            updateKeyBindings();
          } else {
            console.warn("Unable to parse config packet", array.slice(0, 16));
          }
          break;
        default:
          console.warn("Unknown packet", array);
      }
    };

    device.addEventListener("inputreport", listener);
    readDeviceType();
    return () => device.removeEventListener("inputreport", listener);
  }, [keyboard, device]);

  const readDeviceType = useCallback(() => {
    if (!device || pending) {
      return;
    }
    setPending(true);
    const packet = makeBuffer(keyboard.getDeviceType());
    device
      .sendReport(3, packet)
      .catch(error => setErrors(prev => [...prev, error]))
      .finally(() => setPending(false));
  }, [keyboard, device, pending]);

  const readConfiguration = useCallback(() => {
    if (!device || pending) {
      return;
    }
    setPending(true);
    device
      .sendReport(3, makeBuffer(keyboard.readConfig(0)))
      .then(() => device.sendReport(3, makeBuffer(keyboard.readConfig(1))))
      .then(() => device.sendReport(3, makeBuffer(keyboard.readConfig(2))))
      .then(() => device.sendReport(3, makeBuffer(keyboard.readConfig(3))))
      .catch(error => setErrors(prev => [...prev, error]))
      .finally(() => setPending(false));
  }, [keyboard, device, pending]);

  return {
    name: keyboard.name,
    keyboardDeviceType: deviceType,
    keyBindings: keyBindings.length === 0 ? defaultBindings : keyBindings,
    errors,
    busy: pending,
    readDeviceType,
    readConfiguration,
  };
}

function makeBuffer(data: number[]): Uint8Array<ArrayBuffer> {
  const buffer = new Uint8Array(64);

  for (let i = 0; i < 64 && i < data.length; i++) {
    const value = data[i];
    if (value === undefined || !Number.isInteger(value)) {
      continue;
    }
    if (value >= 0 && value < 0x100) {
      buffer[i] = value;
    }
    if (value < 0 && value > -127) {
      buffer[i] = 0x100 + value;
    }
  }
  return buffer;
}
