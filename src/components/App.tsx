import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twJoin } from "tailwind-merge";
import { useEventListener } from "usehooks-ts";

import {
  KeyBinding,
  keysAreEqual,
  keysCompare,
  NoopKeyboard,
} from "@model/keyboard";
import { makeKeyboard884 } from "@model/keyboard_884x";
import {
  KeyboardProfile,
  KeyLayout,
  loadProfiles,
  saveProfiles,
} from "@model/keyboard_profile";
import { scanForKeyboard } from "@model/usb";
import { KeyboardDevice, useKeyboardDevice } from "@model/useKeyboardDevice";
import { KeyboardLayoutProvider } from "@model/useKeyboardLayout";
import { H1, H2, Text } from "@ux/Typography";

import { Configuration } from "./Configuration";
import { EditKey } from "./EditKey";
import { Layer } from "./Layer";

export function App() {
  const [devices, setDevices] = useState<HIDDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(-1);
  const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice>({
    keyboard: NoopKeyboard,
  });
  const [selectedLayout, setSelectedLayout] = useState<KeyLayout>({
    rows: 0,
    columns: 0,
  });
  const [profiles, setProfiles] = useState<KeyboardProfile[]>(loadProfiles());
  const [selectedProfile, setSelectedProfile] = useState<
    KeyboardProfile | undefined
  >();

  const currentDevice = useMemo(
    () => (selectedDevice >= 0 ? devices[selectedDevice] : undefined),
    [devices, selectedDevice]
  );
  const { keyBindings, readConfiguration, keyboardDeviceType, busy, errors } =
    useKeyboardDevice(keyboardDevice);

  const bindingsByLayer = React.useMemo(() => {
    const layers: KeyBinding[][] = Array(keyboardDeviceType.layers)
      .fill(null)
      .map(() => []);

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
  }, [keyBindings, keyboardDeviceType.layers]);

  const addProfile = useCallback(
    (name: string) => {
      if (!currentDevice) {
        return;
      }

      const profile: KeyboardProfile = {
        name,
        vendorId: 4489,
        productId: currentDevice?.productId,
        keyboardDeviceType: {
          ...keyboardDeviceType,
        },
        layout: { ...selectedLayout },
        bindingsByLayer: JSON.parse(JSON.stringify(bindingsByLayer)),
      };

      setProfiles(prev => [...prev, profile]);
      setSelectedProfile(profile);
    },
    [currentDevice, selectedLayout, keyboardDeviceType, bindingsByLayer]
  );

  const onVisibilityChange = useCallback(() => {
    if (document.hidden) {
      saveProfiles(profiles);
    }
  }, [profiles]);

  const documentRef = useRef(document);
  useEventListener("visibilitychange", onVisibilityChange, documentRef);

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
              keyboard: makeKeyboard884(),
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

  const [selectedBinding, setSelectedBinding] = useState<
    Omit<KeyBinding, "expansion" | "origin">
  >({
    key: -1,
    layer: -1,
  });

  const selectBinding = useCallback(
    ({ key, layer }: Omit<KeyBinding, "expansion" | "origin">) => {
      setSelectedBinding(prev => {
        if (keysAreEqual(prev.key, key) && prev.layer === layer) {
          return prev;
        }
        return { key, layer };
      });
    },
    []
  );

  const currentBinding = React.useMemo(() => {
    if (selectedBinding.key === -1 || selectedBinding.layer === -1) {
      return;
    }

    const layer = bindingsByLayer[selectedBinding.layer] ?? [];

    return layer.find(binding =>
      keysAreEqual(binding.key, selectedBinding.key)
    );
  }, [bindingsByLayer, selectedBinding]);

  const selectProfile = useCallback((profile: KeyboardProfile) => {
    setSelectedLayout({ ...profile.layout });
    setSelectedProfile(profile);
  }, []);

  return (
    <KeyboardLayoutProvider>
      <div className="flex min-h-screen flex-row gap-2 bg-neutral-100">
        <Configuration
          devices={devices}
          selectedDevice={devices[selectedDevice]}
          onSelectDevice={device =>
            setSelectedDevice(device ? devices.indexOf(device) : -1)
          }
          onAddDevice={() => scan(true)}
          layouts={layouts}
          selectedLayout={selectedLayout}
          onSelectLayout={update => setSelectedLayout(update)}
          keyboardDeviceType={keyboardDeviceType}
          canReadConfiguration={currentDevice !== undefined && !busy}
          onReadConfiguration={readConfiguration}
          profiles={profiles}
          selectedProfile={selectedProfile}
          onSelectProfile={selectProfile}
          onChangeProfiles={setProfiles}
          onAddProfile={addProfile}
        />
        <div className="flex flex-1 flex-col items-center gap-4">
          <div className="flex flex-col gap-2">
            <H1 className="m-4">ch57x Keyboard Programmer</H1>
            <TabGroup className="flex flex-row gap-2" defaultIndex={0} vertical>
              <TabList className="flex flex-col gap-1">
                {({ selectedIndex }) => {
                  return (
                    <>
                      {bindingsByLayer.map((_, layer) => (
                        <Tab
                          key={layer}
                          className={twJoin(
                            "rounded-md border border-neutral-300 px-3 py-1 hover:border-neutral-500",
                            selectedIndex === layer
                              ? "bg-indigo-100"
                              : "bg-white"
                          )}
                        >
                          Layer {layer + 1}
                        </Tab>
                      ))}
                    </>
                  );
                }}
              </TabList>
              <div className="flex flex-col gap-4">
                <TabPanels>
                  {bindingsByLayer.map((bindings, layer) => (
                    <TabPanel
                      key={layer}
                      className="rounded-lg border border-transparent bg-white p-4 shadow-xl"
                    >
                      <Layer
                        layer={layer}
                        keyBindings={bindings}
                        keyboardDeviceType={keyboardDeviceType}
                        selectedBinding={selectedBinding}
                        onSelectBinding={selectBinding}
                        keyLayout={selectedLayout}
                      />
                    </TabPanel>
                  ))}
                </TabPanels>
                {bindingsByLayer.length > 0 && (
                  <div className="rounded-lg border border-transparent bg-white p-4 shadow-xl">
                    <EditKey
                      initialBinding={currentBinding}
                      updatedMacro={undefined}
                      onChange={() => {}}
                    />
                  </div>
                )}
              </div>
            </TabGroup>
          </div>
          {errors.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-red-100 p-4 shadow-xl">
              <H2 className="text-red-700">Errors</H2>
              {errors.map((err, i) => (
                <Text key={i}>{err.toString()}</Text>
              ))}
            </div>
          )}
        </div>
      </div>
    </KeyboardLayoutProvider>
  );
}