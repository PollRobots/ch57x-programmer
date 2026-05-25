import { MousePointerClick, RotateCcw, RotateCw } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  KeyBinding,
  keysAreEqual,
  keysCompare,
  NoopKeyboard,
} from "@model/keyboard";
import { makeKeyboard884 } from "@model/keyboard_884x";
import { scanForKeyboard } from "@model/usb";
import { KeyboardDevice, useKeyboardDevice } from "@model/useKeyboardDevice";
import { KeyboardLayoutProvider } from "@model/useKeyboardLayout";
import { Button } from "@ux/Button";
import { H1, H2, H3, Text } from "@ux/Typography";

import { KeyboardKey } from "./KeyboardKey";

export function App() {
  const [devices, setDevices] = useState<HIDDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(-1);
  const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice>({
    keyboard: NoopKeyboard,
  });
  const [selectedLayout, setSelectedLayout] = useState<{
    rows: number;
    columns: number;
  }>({ rows: 0, columns: 0 });

  const currentDevice = useMemo(
    () => (selectedDevice >= 0 ? devices[selectedDevice] : undefined),
    [devices, selectedDevice]
  );
  const {
    name,
    readDeviceType,
    keyBindings,
    readConfiguration,
    keyboardDeviceType,
    busy,
  } = useKeyboardDevice(keyboardDevice);

  useEffect(() => {
    if (currentDevice === undefined) {
      setKeyboardDevice(prev => {
        if (prev.keyboard.name === NoopKeyboard.name) {
          return prev;
        }
        return { keyboard: NoopKeyboard };
      });
      return;
    }

    const workingDevice = currentDevice;
    if (!workingDevice.opened) {
      workingDevice
        .open()
        .then(() => {
          if ((workingDevice.productId & 0x884f) === workingDevice.productId) {
            setKeyboardDevice({
              keyboard: makeKeyboard884(0, 0),
              device: workingDevice,
            });
          }
        })
        .catch(error =>
          console.error("Error opening device:", workingDevice, error)
        );
    }
    return () => {
      void workingDevice.close();
    };
  }, [currentDevice]);

  const bindingsByLayer = React.useMemo(() => {
    const layers: KeyBinding[][] = [];

    for (const binding of keyBindings) {
      while (binding.layer >= layers.length) {
        layers.push([]);
      }
      layers[binding.layer]!.push(binding);
    }
    for (const layer of layers) {
      layer.sort((a, b) => keysCompare(a.key, b.key));
    }
    return layers;
  }, [keyBindings]);

  const scan = useCallback(
    (force: boolean) => {
      scanForKeyboard(force)
        .then(devices => {
          setDevices(devices);
          if (
            (devices.length > 0 && selectedDevice === -1) ||
            selectedDevice >= devices.length
          ) {
            setSelectedDevice(0);
          }
        })
        .catch(error => console.error(error));
    },
    [selectedDevice]
  );

  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      scan(false);
    }
  }, [started, scan]);

  const layouts = useMemo<{ rows: number; columns: number }[]>(() => {
    const buttons = keyboardDeviceType.buttons;
    if (buttons === 0) {
      return [{ rows: 0, columns: 0 }];
    }
    if (buttons === 1) {
      return [{ rows: 1, columns: 1 }];
    }
    const layouts = [{ rows: 1, columns: buttons }];
    for (const factor of [2, 3, 4, 5, 6, 7]) {
      if (factor >= buttons) {
        break;
      }
      const compliment = buttons / factor;
      if (Number.isInteger(compliment)) {
        layouts.push({ rows: factor, columns: compliment });
      }
    }
    layouts.push({ rows: buttons, columns: 1 });
    return layouts;
  }, [keyboardDeviceType.buttons]);

  const selectedLayoutIndex = useMemo(
    () =>
      layouts.findIndex(
        layout =>
          layout.rows === selectedLayout.rows &&
          layout.columns === selectedLayout.columns
      ),
    [layouts, selectedLayout]
  );

  const [selectedBinding, setSelectedBinding] = useState<
    Omit<KeyBinding, "expansion">
  >({
    key: -1,
    layer: -1,
  });

  const selectBinding = useCallback(
    ({ key, layer }: Omit<KeyBinding, "expansion">) => {
      setSelectedBinding(prev => {
        if (keysAreEqual(prev.key, key) && prev.layer === layer) {
          return prev;
        }
        return { key, layer };
      });
    },
    []
  );

  return (
    <KeyboardLayoutProvider>
      <div className="flex flex-col gap-2">
        <H1 className="m-4">ch57x Keyboard</H1>
        <div className="flex w-fit flex-col gap-2 rounded-xl border border-neutral-500 p-4">
          <div className="flex flex-row justify-start gap-2">
            <Button
              variant={devices.length === 0 ? "primary" : "default"}
              onClick={() => scan(false)}
            >
              <Text size="lg" strong>
                Connect
              </Text>
            </Button>
            <Button onClick={() => scan(true)}>
              <Text size="lg" strong>
                Find
              </Text>
            </Button>
            <Button
              variant={
                currentDevice &&
                keyboardDeviceType.buttons === 0 &&
                keyboardDeviceType.encoders === 0
                  ? "primary"
                  : "default"
              }
              disabled={currentDevice === undefined || busy}
              onClick={readDeviceType}
            >
              <Text size="lg" strong>
                Get device type
              </Text>
            </Button>
            <Button
              {...(currentDevice === undefined ||
              busy ||
              (keyboardDeviceType.buttons === 0 &&
                keyboardDeviceType.encoders === 0)
                ? {
                    disabled: true,
                    variant: "default",
                  }
                : {
                    disabled: false,
                    variant: "primary",
                  })}
              onClick={readConfiguration}
            >
              <Text size="lg" strong>
                Read configuration
              </Text>
            </Button>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Text size="lg" strong>
              Keyboards
            </Text>
            <select
              className="w-64 rounded-lg border border-neutral-200 px-2 py-1.5 text-neutral-600 shadow-xs hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 focus:outline-none"
              value={selectedDevice}
              onChange={event => {
                setSelectedDevice(Number(event.target.value));
              }}
            >
              <option value={-1}>None</option>
              {devices.map((device, i) => (
                <option value={i} key={i}>
                  0x{device.productId.toString(16)}—{device.productName}
                </option>
              ))}
            </select>
          </div>
          <Text size="lg" strong>
            {name}
          </Text>
          <Text size="lg">Buttons: {keyboardDeviceType.buttons}</Text>
          <Text size="lg">Encoders: {keyboardDeviceType.encoders}</Text>
          <div className="flex flex-row items-center gap-2">
            <Text size="lg" strong>
              Layout:
            </Text>
            <select
              className="w-20 rounded-lg border border-neutral-200 px-2 py-1.5 text-neutral-600 shadow-xs hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 focus:outline-none"
              value={selectedLayoutIndex}
              onChange={event => {
                const layout = layouts[Number(event.target.value)];
                if (layout === undefined) {
                  return;
                }
                setSelectedLayout(prev => {
                  if (
                    prev.rows === layout.rows &&
                    prev.columns === layout.columns
                  ) {
                    return prev;
                  }
                  return { ...layout };
                });
              }}
            >
              {layouts.map(({ rows, columns }, i) => (
                <option value={i} key={i}>
                  {columns}×{rows}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex w-fit flex-col gap-2 rounded-xl border border-neutral-500 p-4">
          <H2>Layers</H2>
          {bindingsByLayer.map((bindings, layer) => (
            <div key={layer}>
              <>
                {layer !== 0 && <hr className="border-neutral-300" />}
                <H3>Layer {layer + 1}</H3>
                <Text>{bindings.length} bindings</Text>
                <div className="flex flex-row gap-8">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${selectedLayout.columns}, 8rem)`,
                    }}
                  >
                    {Array(keyboardDeviceType.buttons)
                      .fill(null)
                      .map((_, i) => {
                        const binding = bindings.find(
                          binding => binding.key === i
                        );
                        return (
                          <KeyboardKey
                            as="button"
                            key={i}
                            className="size-32"
                            macro={binding?.expansion}
                            onClick={() =>
                              selectBinding({ key: i, layer: layer })
                            }
                            selected={
                              selectedBinding.layer === layer &&
                              keysAreEqual(selectedBinding.key, i)
                            }
                          />
                        );
                      })}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {}
                    <RotateCcw className="justify-self-center text-neutral-400" />
                    <MousePointerClick className="justify-self-center text-neutral-400" />
                    <RotateCw className="justify-self-center text-neutral-400" />
                    {Array(keyboardDeviceType.encoders)
                      .fill(null)
                      .flatMap((_, i) => {
                        const ccw = bindings.find(
                          ({ key }) =>
                            Array.isArray(key) &&
                            key[0] === i &&
                            key[1] === "ccw"
                        );
                        const press = bindings.find(
                          ({ key }) =>
                            Array.isArray(key) &&
                            key[0] === i &&
                            key[1] === "press"
                        );
                        const cw = bindings.find(
                          ({ key }) =>
                            Array.isArray(key) &&
                            key[0] === i &&
                            key[1] === "cw"
                        );
                        return [
                          <KeyboardKey
                            as="button"
                            key={`${i}.ccw`}
                            className="size-32"
                            variant="encoder-ccw"
                            macro={ccw?.expansion}
                            onClick={() =>
                              selectBinding({ key: [i, "ccw"], layer: layer })
                            }
                            selected={
                              selectedBinding.layer === layer &&
                              keysAreEqual(selectedBinding.key, [i, "ccw"])
                            }
                          />,
                          <KeyboardKey
                            as="button"
                            key={`${i}.press`}
                            className="size-32"
                            variant="encoder"
                            macro={press?.expansion}
                            onClick={() =>
                              selectBinding({ key: [i, "press"], layer: layer })
                            }
                            selected={
                              selectedBinding.layer === layer &&
                              keysAreEqual(selectedBinding.key, [i, "press"])
                            }
                          />,
                          <KeyboardKey
                            as="button"
                            key={`${i}.cw`}
                            className="size-32"
                            variant="encoder-cw"
                            macro={cw?.expansion}
                            onClick={() =>
                              selectBinding({ key: [i, "cw"], layer: layer })
                            }
                            selected={
                              selectedBinding.layer === layer &&
                              keysAreEqual(selectedBinding.key, [i, "cw"])
                            }
                          />,
                        ];
                      })}
                  </div>
                </div>
              </>
            </div>
          ))}
        </div>
      </div>
    </KeyboardLayoutProvider>
  );
}
