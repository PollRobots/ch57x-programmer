import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyBinding,
  Keyboard,
  KeyboardDeviceType,
  keysAreEqual,
} from "./keyboard";
import { useDebounceCallback } from "usehooks-ts";

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
  const [deviceType, setDeviceType] = useState<KeyboardDeviceType>({
    buttons: 0,
    encoders: 0,
  });
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Error[]>([]);
  const pendingBindings = useRef<KeyBinding[]>([]);
  const [keyBindings, setKeyBindings] = useState<KeyBinding[]>([]);

  const updateKeyBindings = useDebounceCallback(
    () => {
      if (pendingBindings.current.length === 0) {
        return;
      }
      const newBindings = pendingBindings.current;
      pendingBindings.current = [];
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
    },
    100,
    { leading: false, trailing: true }
  );

  useEffect(() => {
    if (!device) {
      setDeviceType(prev =>
        prev.buttons === 0 && prev.encoders === 0
          ? prev
          : { buttons: 0, encoders: 0 }
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
      .catch(error => setErrors(prev => [...prev, error]))
      .finally(() => setPending(false));
  }, [keyboard, device, pending]);

  return {
    name: keyboard.name,
    keyboardDeviceType: deviceType,
    keyBindings,
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
