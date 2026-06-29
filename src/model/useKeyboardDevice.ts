import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { useValueChange } from "@hooks/useValueChange";

import { WELL_KNOWN_CODES } from "./key_codes";
import {
  EncoderAction,
  isKeyboardFamily,
  KeyBinding,
  Keyboard,
  KeyboardCapabilities,
  KeyboardDeviceType,
  keysAreEqual,
  macrosAreEqual,
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
  writeKeyBindings: (bindings: KeyBinding[]) => Promise<boolean>;
  capabilities: KeyboardCapabilities;
};

const DEBOUNCE_PARAMS = { leading: false, trailing: true };

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
  const pauseUpdate = useRef<boolean>(false);

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
            keyChords: [{ modifiers: [], code: WELL_KNOWN_CODES[button]! }],
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
                  modifiers: [],
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

  const actuallyUpdateKeyBindings = useCallback(() => {
    if (pauseUpdate.current || pendingBindings.current.length === 0) {
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
  }, []);

  const updateKeyBindings = useDebounceCallback(
    actuallyUpdateKeyBindings,
    100,
    DEBOUNCE_PARAMS
  );
  const [_inTransition, startTransition] = useTransition();

  const readDeviceType = useCallback(() => {
    if (!device || pending) {
      return;
    }
    if (!keyboard.capabilities.readConfiguration) {
      // If possible infer basic info from the capabilities.
      const family = keyboard.name;
      if (isKeyboardFamily(family)) {
        setDeviceType({
          family,
          buttons: keyboard.capabilities.maxButtons,
          encoders: keyboard.capabilities.maxEncoders,
          layers: keyboard.capabilities.maxLayers,
        });
      }
      return;
    }
    setPending(true);
    const packet = makeBuffer(keyboard.getDeviceType());
    device
      .sendReport(3, packet)
      .catch(error => setErrors(prev => [...prev, error]))
      .finally(() => setPending(false));
  }, [keyboard, device, pending]);

  const onDeviceChange = useCallback(
    (device: HIDDevice | undefined) => {
      if (!device) {
        startTransition(() => {
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
        });
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
          case "device": {
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
          }
          case "config": {
            const keyBinding = keyboard.parseConfigPacket(array);
            if (keyBinding) {
              pendingBindings.current.push(keyBinding);
              if (!pauseUpdate.current) {
                updateKeyBindings();
              }
            } else {
              console.warn("Unable to parse config packet", array.slice(0, 16));
            }
            break;
          }
          default:
            console.warn("Unknown packet", array);
        }
      };

      device.addEventListener("inputreport", listener);
      startTransition(() => {
        readDeviceType();
      });
      return () => device.removeEventListener("inputreport", listener);
    },
    [keyboard, readDeviceType, updateKeyBindings]
  );
  useValueChange(device, onDeviceChange);

  const readConfiguration = useCallback(() => {
    if (!device || pending || !keyboard.capabilities.readConfiguration) {
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

  const writeKeyBindings = useCallback(
    async (bindings: KeyBinding[]): Promise<boolean> => {
      if (!device || pending || pauseUpdate.current) {
        return false;
      }
      pauseUpdate.current = true;
      readConfiguration();

      const started = performance.now();
      const deviceBindings = await new Promise<KeyBinding[]>(
        (resolve, reject) => {
          const write = () => {
            if (keyBindings.length == pendingBindings.current.length) {
              const bindings = pendingBindings.current;
              pauseUpdate.current = false;
              pendingBindings.current = [];
              resolve(bindings);
            } else if (performance.now() - started > 500) {
              pauseUpdate.current = false;
              updateKeyBindings();
              reject(new Error("Timed out waiting for key bindings"));
            } else {
              requestAnimationFrame(write);
            }
          };
          requestAnimationFrame(write);
        }
      );

      setPending(true);
      try {
        // find the bindings that are different on the device
        const updates = bindings.filter(binding => {
          const matching = deviceBindings.find(
            ({ key, layer }) =>
              binding.layer === layer && keysAreEqual(key, binding.key)
          );

          if (matching === undefined) {
            return true;
          }
          return !macrosAreEqual(binding.expansion, matching.expansion);
        });

        const packets = updates.flatMap(({ layer, key, expansion }) =>
          keyboard.bindKey(layer, key, expansion)
        );

        for (const packet of packets) {
          await device.sendReport(3, makeBuffer(packet));
        }
        return true;
      } finally {
        setPending(false);
      }
    },
    [
      device,
      readConfiguration,
      keyBindings.length,
      updateKeyBindings,
      keyboard,
      pending,
    ]
  );

  return {
    name: keyboard.name,
    capabilities: keyboard.capabilities,
    keyboardDeviceType: deviceType,
    keyBindings: keyBindings.length === 0 ? defaultBindings : keyBindings,
    errors,
    busy: pending,
    readDeviceType,
    readConfiguration,
    writeKeyBindings,
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
