import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cva } from "class-variance-authority";
import { Asterisk, HardDriveDownload, HardDriveUpload } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEventListener } from "usehooks-ts";

import { HidChange, useHidChange } from "@hooks/useHidChange";
import {
  KeyBinding,
  keysAreEqual,
  keysCompare,
  Macro,
  NoopKeyboard,
} from "@model/keyboard";
import { makeKeyboard884 } from "@model/keyboard_884x";
import {
  forceOriginsToProfile,
  KeyboardProfile,
  KeyLayout,
  loadProfiles,
  saveProfiles,
} from "@model/keyboard_profile";
import { scanForKeyboard } from "@model/usb";
import { KeyboardDevice, useKeyboardDevice } from "@model/useKeyboardDevice";
import { KeyboardLayoutProvider } from "@model/useKeyboardLayout";
import { Button } from "@ux/Button";
import { H1, H2, Text } from "@ux/Typography";

import { EditKey } from "./editors/EditKey";
import { useSettings } from "./hooks/useSettings";
import { Layer, OriginPreference } from "./Layer";
import { LayoutIcon } from "./LayoutIcon";
import { Configuration } from "./settings/Configuration";
import { Unsupported } from "./Unsupported";

const layertab = cva(
  [
    "flex flex-row items-start rounded-md border px-3 py-1",
    "border-neutral-300 hover:border-neutral-500",
    "dark:border-neutral-600 dark:hover:border-neutral-400",
  ],
  {
    variants: {
      selected: {
        true: "bg-indigo-500/30",
        false: "bg-white dark:bg-neutral-900",
      },
    },
  }
);

export function App() {
  const { settings, changeSettings } = useSettings();
  const [originPreference, setOriginPreference] =
    useState<OriginPreference>("profile");
  const [devices, setDevices] = useState<HIDDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(-1);
  const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice>({
    keyboard: NoopKeyboard,
  });
  const [profiles, setProfiles] = useState<KeyboardProfile[]>(() =>
    loadProfiles()
  );
  const [selectedLayout, setSelectedLayout] = useState<KeyLayout>(() => {
    const defaultProfile = profiles.find(
      p => p.name.toLowerCase() === "default"
    );
    return defaultProfile ? defaultProfile.layout : { rows: 0, columns: 0 };
  });
  const [selectedProfile, setSelectedProfile] = useState<
    KeyboardProfile | undefined
  >(() => profiles.find(p => p.name.toLowerCase() === "default"));
  const profileBindings = selectedProfile?.bindingsByLayer ?? [];

  const currentDevice = useMemo(
    () => (selectedDevice >= 0 ? devices[selectedDevice] : undefined),
    [devices, selectedDevice]
  );
  const {
    keyBindings,
    readConfiguration,
    keyboardDeviceType,
    busy,
    errors,
    writeKeyBindings,
  } = useKeyboardDevice(keyboardDevice);

  const [editedBindings, setEditedBindings] = useState<KeyBinding[]>([]);

  const bindingsByLayer = React.useMemo(() => {
    const layers: KeyBinding[][] = Array(keyboardDeviceType.layers)
      .fill(null)
      .map(() => []);

    const bindingByPriority =
      originPreference === "profile"
        ? [profileBindings.flat(), keyBindings]
        : [keyBindings, profileBindings.flat()];
    for (const bindingSet of bindingByPriority) {
      for (const binding of bindingSet) {
        while (binding.layer >= layers.length) {
          layers.push([]);
        }
        const layer = layers[binding.layer]!;
        if (!layer.some(({ key }) => keysAreEqual(key, binding.key))) {
          layers[binding.layer]!.push(binding);
        }
      }
    }
    for (const edited of editedBindings) {
      const layer = layers[edited.layer];
      if (!layer) {
        continue;
      }
      const index = layer.findIndex(({ key }) => keysAreEqual(key, edited.key));
      if (index < 0) {
        layer.push(edited);
      } else {
        layer[index] = edited;
      }
    }
    for (const layer of layers) {
      layer.sort((a, b) => keysCompare(a.key, b.key));
    }
    return layers;
  }, [
    keyBindings,
    keyboardDeviceType.layers,
    editedBindings,
    profileBindings,
    originPreference,
  ]);

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

      forceOriginsToProfile(profile.bindingsByLayer);

      setProfiles(prev => {
        const updated = [...prev];
        const index = updated.findIndex(p => p.name === name);
        if (index < 0) {
          updated.push(profile);
        } else {
          updated[index] = profile;
        }
        return updated;
      });
      setSelectedProfile(profile);
      setOriginPreference("profile");
      setEditedBindings([]);
    },
    [currentDevice, selectedLayout, keyboardDeviceType, bindingsByLayer]
  );

  const onVisibilityChange = useCallback(() => {
    if (document.hidden) {
      saveProfiles(profiles);
    } else {
      scan(false);
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
          if (devices.length == 0) {
            setSelectedDevice(-1);
          } else if (
            selectedDevice === -1 ||
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

  const onHidCHange = useCallback(
    (change: HidChange) => {
      if (change === "Connected" || change === "Disconnected") {
        scan(false);
      }
    },
    [scan]
  );

  const hidChange = useHidChange(onHidCHange);

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

  const currentBinding = useMemo(() => {
    if (selectedBinding.key === -1 || selectedBinding.layer === -1) {
      return;
    }

    const layer = bindingsByLayer[selectedBinding.layer] ?? [];

    return layer.find(binding =>
      keysAreEqual(binding.key, selectedBinding.key)
    );
  }, [bindingsByLayer, selectedBinding]);
  const [workingMacro, setWorkingMacro] = useState<Macro | undefined>();
  const commitWorkingMacro = useCallback(() => {
    if (!workingMacro || !currentBinding) {
      return;
    }
    const updated = [...editedBindings];
    const index = updated.findIndex(
      ({ key, layer }) =>
        currentBinding.layer === layer && keysAreEqual(currentBinding.key, key)
    );
    if (index < 0) {
      updated.push({
        ...currentBinding,
        expansion: workingMacro,
        origin: "editor",
      });
    } else {
      updated[index] = {
        ...currentBinding,
        expansion: workingMacro,
        origin: "editor",
      };
    }
    setEditedBindings(updated);
    setWorkingMacro(undefined);
  }, [workingMacro, currentBinding, bindingsByLayer, editedBindings]);

  const selectProfile = useCallback((profile: KeyboardProfile | undefined) => {
    if (profile) {
      setOriginPreference("profile");
      setSelectedLayout({ ...profile.layout });
    }
    setSelectedProfile(profile);
  }, []);

  const onClearLayerEdits = useCallback((layer: number) => {
    setEditedBindings(prev => prev.filter(binding => binding.layer !== layer));
  }, []);

  if (hidChange === "NotSupported") {
    return <Unsupported />;
  }

  const onReadConfiguration = useCallback(() => {
    setOriginPreference("device");
    readConfiguration();
  }, [readConfiguration]);
  const [writing, setWriting] = useState(false);
  const onWriteConfiguration = useCallback(() => {
    if (writing) {
      return;
    }
    setWriting(true);
    writeKeyBindings(bindingsByLayer.flat())
      .then(succeeded => {
        if (succeeded) {
          setEditedBindings([]);
          readConfiguration();
        }
      })
      .catch(error => console.error(error))
      .finally(() => setWriting(false));
  }, [writing, writeKeyBindings]);

  return (
    <KeyboardLayoutProvider>
      <div className="text-default flex max-h-screen min-h-screen flex-row gap-2 overflow-hidden bg-neutral-100 dark:bg-neutral-800 dark:text-white">
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
          canReadWriteConfiguration={currentDevice !== undefined && !busy}
          onReadConfiguration={onReadConfiguration}
          onWriteConfiguration={onWriteConfiguration}
          profiles={profiles}
          selectedProfile={selectedProfile}
          onSelectProfile={selectProfile}
          onChangeProfiles={setProfiles}
          onAddProfile={addProfile}
          settings={settings}
          onChangeSettings={changeSettings}
        />
        <div className="flex flex-1 flex-col items-center gap-4 overflow-y-scroll">
          <div className="flex flex-col gap-2">
            <H1 className="m-4 inline-flex items-center gap-2">
              <LayoutIcon rows={3} columns={4} encoders={2} />
              ch57x keyboard tool
            </H1>
            <TabGroup className="flex flex-row gap-2" defaultIndex={0} vertical>
              <div className="flex flex-col gap-4">
                <TabList className="flex flex-col gap-1">
                  {({ selectedIndex }) => {
                    return (
                      <>
                        {bindingsByLayer.map((_, layer) => {
                          const isDirty = editedBindings.some(
                            b => b.layer === layer
                          );
                          return (
                            <Tab
                              key={layer}
                              className={layertab({
                                selected: selectedIndex === layer,
                              })}
                            >
                              <Text>Layer {layer + 1}</Text>
                              {isDirty ? (
                                <Asterisk className="size-3 text-red-500" />
                              ) : (
                                <div className="size-3" />
                              )}
                            </Tab>
                          );
                        })}
                      </>
                    );
                  }}
                </TabList>
                <Button
                  className="flex w-24 items-center justify-around gap-2"
                  description="Read the current key-bindings from the selected device"
                  onClick={onReadConfiguration}
                >
                  <HardDriveUpload className="size-6" />
                  <Text size="sm">Read</Text>
                </Button>
                <Button
                  disabled={writing}
                  onClick={onWriteConfiguration}
                  className="flex size-24 flex-col items-center justify-around gap-2"
                  description="Write the current key-bindings to the selected device"
                >
                  <HardDriveDownload className="size-8" />
                  <Text size="sm">Write</Text>
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                <TabPanels>
                  {bindingsByLayer.map((bindings, layer) => (
                    <TabPanel
                      key={layer}
                      className="rounded-lg border border-transparent bg-white p-4 shadow-xl dark:bg-neutral-900"
                    >
                      <Layer
                        layer={layer}
                        keyBindings={bindings}
                        keyboardDeviceType={keyboardDeviceType}
                        selectedBinding={selectedBinding}
                        onSelectBinding={selectBinding}
                        keyLayout={selectedLayout}
                        originPreference={originPreference}
                        onChangeOriginPreference={setOriginPreference}
                        onClearLayerEdits={onClearLayerEdits}
                        haveProfile={selectedProfile !== undefined}
                        profileName={selectedProfile?.name ?? ""}
                      />
                    </TabPanel>
                  ))}
                </TabPanels>
                {bindingsByLayer.length > 0 && (
                  <div className="rounded-lg border border-transparent bg-white p-4 shadow-xl dark:bg-neutral-900">
                    <EditKey
                      initialBinding={currentBinding}
                      updatedMacro={workingMacro}
                      onChange={setWorkingMacro}
                      onCommit={commitWorkingMacro}
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
