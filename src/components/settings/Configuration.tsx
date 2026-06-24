import { HardDriveDownload, HardDriveUpload } from "lucide-react";
import React from "react";

import { KeyboardDeviceType } from "@model/keyboard";
import { Button } from "@ux/Button";
import { Expando } from "@ux/Expando";
import { H3, Text } from "@ux/Typography";

import { Settings } from "../hooks/useSettings";
import { SelectDevice, SelectDeviceProps } from "./SelectDevice";
import { SelectLayout, SelectLayoutProps } from "./SelectLayout";
import { SelectProfile, SelectProfileProps } from "./SelectProfile";
import { SetDeviceType } from "./SetDeviceType";
import { SettingsEditor } from "./SettingsEditor";

export type ConfigurationProps = {
  canReadWriteConfiguration: boolean;
  onReadConfiguration: (() => void) | undefined;
  onWriteConfiguration: () => void;
  userKeyboardDeviceType: KeyboardDeviceType | undefined;
  onChangeKeyboardDeviceType: (update: KeyboardDeviceType) => void;

  settings: Settings;
  onChangeSettings: (update: Settings) => void;
} & SelectDeviceProps &
  SelectLayoutProps &
  SelectProfileProps;

export function Configuration(props: ConfigurationProps) {
  return (
    <Expando
      defaultOpen
      title={<H3 size="lg">Keyboard configuration</H3>}
      className="max-h-screen overflow-y-auto border-r border-neutral-400 bg-neutral-200 dark:border-neutral-500 dark:bg-neutral-700"
      openContent={<OpenConfiguration {...props} />}
      collapseDirection="left"
      aria-label="Keyboard configuration"
    />
  );
}

function OpenConfiguration({
  devices,
  selectedDevice,
  onAddDevice,
  onSelectDevice,
  layouts,
  selectedLayout,
  onSelectLayout,
  keyboardDeviceType,
  userKeyboardDeviceType,
  onChangeKeyboardDeviceType,
  canReadWriteConfiguration,
  onReadConfiguration,
  onWriteConfiguration,
  selectedProfile,
  onChangeProfiles,
  onSelectProfile,
  profiles,
  onAddProfile,
  settings,
  onChangeSettings,
}: ConfigurationProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex flex-col gap-2" role="form">
        <SelectDevice
          devices={devices}
          selectedDevice={selectedDevice}
          onSelectDevice={onSelectDevice}
          onAddDevice={onAddDevice}
        />
        {canReadWriteConfiguration && !onReadConfiguration && (
          <SetDeviceType
            keyboardDeviceType={keyboardDeviceType}
            userKeyboardDeviceType={userKeyboardDeviceType}
            onChange={onChangeKeyboardDeviceType}
          />
        )}
        <SelectLayout
          keyboardDeviceType={userKeyboardDeviceType ?? keyboardDeviceType}
          layouts={layouts}
          selectedLayout={selectedLayout}
          onSelectLayout={onSelectLayout}
        />
        <Button
          className="flex items-center gap-2"
          onClick={onReadConfiguration}
          disabled={!canReadWriteConfiguration || !onReadConfiguration}
          size="lg"
          description="Read the current key-bindings from the selected device"
        >
          <HardDriveUpload />
          <Text>Read key-bindings</Text>
        </Button>
        <Button
          className="flex items-center gap-2"
          onClick={onWriteConfiguration}
          disabled={!canReadWriteConfiguration}
          size="lg"
          description="Write the current key-bindings to the selected device"
        >
          <HardDriveDownload />
          <Text>Write key-bindings</Text>
        </Button>
        <SelectProfile
          profiles={profiles}
          selectedProfile={selectedProfile}
          onChangeProfiles={onChangeProfiles}
          onSelectProfile={onSelectProfile}
          onAddProfile={onAddProfile}
          selectedDevice={selectedDevice}
        />
      </div>
      <SettingsEditor
        className="mt-auto"
        onChange={onChangeSettings}
        {...settings}
      />
    </div>
  );
}
