import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { Check, HardDriveUpload, Keyboard, Plus } from "lucide-react";
import React, { useState } from "react";
import { twJoin } from "tailwind-merge";

import { KeyboardDeviceType } from "@model/keyboard";
import { KeyboardProfile } from "@model/keyboard_profile";
import { Button } from "@ux/Button";
import { Expando } from "@ux/Expando";
import { H3, Text } from "@ux/Typography";

import { DisplayLayout } from "./DisplayLayout";
import { LayoutIcon } from "./LayoutIcon";

export type ConfigurationProps = {
  devices: HIDDevice[];
  selectedDevice: HIDDevice | undefined;
  onSelectDevice: (device: HIDDevice | undefined) => void;
  onAddDevice: () => void;

  keyboardDeviceType: KeyboardDeviceType;
  layouts: KeyLayout[];
  selectedLayout: KeyLayout;
  onSelectLayout: (layout: KeyLayout) => void;

  canReadConfiguration: boolean;
  onReadConfiguration: () => void;

  profiles: KeyboardProfile[];
  selectedProfile: KeyboardProfile | undefined;
  onChangeProfiles: (updated: KeyboardProfile[]) => void;
  onSelectProfile: (profile: KeyboardProfile) => void;
  onAddProfile: (name: string) => void;
};

export type KeyLayout = {
  rows: number;
  columns: number;
};

export function Configuration(props: ConfigurationProps) {
  return (
    <Expando
      defaultOpen
      title={<H3 size="lg">Keyboard configuration</H3>}
      className="border-r border-neutral-400 bg-neutral-200"
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
  keyboardDeviceType: { encoders, buttons },
  canReadConfiguration,
  onReadConfiguration,
  selectedProfile,
  onSelectProfile,
  profiles,
  onAddProfile,
}: ConfigurationProps) {
  const [currentProfile, setCurrentProfile] = useState(selectedProfile);
  const [showAddProfile, setShowAddProfile] = useState(false);

  return (
    <div className="flex h-full flex-col gap-2 p-4" role="form">
      <Text>Keyboard:</Text>
      <Listbox
        value={selectedDevice}
        onChange={value => onSelectDevice(value ?? undefined)}
      >
        <ListboxButton className="flex w-64 max-w-64 items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100 p-2 hover:border-neutral-500">
          <Keyboard className="size-5" />
          <DisplayDevice device={selectedDevice} />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-lg"
        >
          {[undefined, ...devices].map((device, i) => (
            <ListboxOption
              key={i}
              value={device}
              className="group flex min-w-64 items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-2 hover:bg-neutral-100"
            >
              <Check className="invisible size-5 group-data-selected:visible" />
              <DisplayDevice device={device} />
            </ListboxOption>
          ))}
          <Button
            className="flex items-center gap-2 bg-neutral-50"
            onClick={onAddDevice}
          >
            <Plus />
            <Text>Add keyboard</Text>
          </Button>
        </ListboxOptions>
      </Listbox>
      <Text>
        Layout ({buttons} buttons, {encoders} encoders):
      </Text>
      <Listbox
        value={selectedLayout}
        onChange={value => onSelectLayout(value ?? { rows: 0, columns: 0 })}
      >
        <ListboxButton className="flex w-64 max-w-64 items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100 p-2 hover:border-neutral-500">
          <LayoutIcon
            {...selectedLayout}
            encoders={encoders}
            className="size-5"
          />
          <DisplayLayout {...selectedLayout} encoders={encoders} />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-lg"
          aria-live="polite"
        >
          {[{ rows: 0, columns: 0 }, ...layouts].map((layout, i) => (
            <ListboxOption
              key={i}
              value={layout}
              className="group flex min-w-64 items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-2 hover:bg-neutral-100"
            >
              <Check className="invisible size-5 group-data-selected:visible" />
              <LayoutIcon {...layout} encoders={encoders} className="size-5" />
              <DisplayLayout {...layout} encoders={encoders} />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      <Button
        className="flex items-center gap-2"
        onClick={onReadConfiguration}
        disabled={!canReadConfiguration}
        size="lg"
      >
        <HardDriveUpload />
        <Text strong>Download key-bindings</Text>
      </Button>
      <Text strong>Profiles:</Text>
      <Listbox value={currentProfile} onChange={setCurrentProfile}>
        <ListboxButton className="flex w-64 max-w-64 items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100 p-2 hover:border-neutral-500">
          {currentProfile ? (
            <DisplayProfile {...currentProfile} />
          ) : (
            <Text className="text-secondary italic">None</Text>
          )}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-lg"
          aria-live="polite"
        >
          {profiles.map((profile, index) => {
            // Ensure that we can only select profiles that match the current device.
            const disabled =
              selectedDevice === undefined ||
              selectedDevice.productId !== profile.productId ||
              selectedDevice.vendorId !== profile.vendorId;
            return (
              <ListboxOption
                key={index}
                value={profile}
                disabled={disabled}
                className={twJoin(
                  "group flex min-w-64 items-center gap-2 rounded-lg border p-2",
                  "border-neutral-300 bg-neutral-50 p-2 hover:bg-neutral-100",
                  disabled && "pointer-events-none"
                )}
              >
                <Check className="invisible size-5 group-data-selected:visible" />
                <DisplayProfile {...profile} />
              </ListboxOption>
            );
          })}
          <ListboxOption
            value={undefined}
            className="group flex min-w-64 items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-2 hover:bg-neutral-100"
          >
            <Text className="text-secondary italic">None</Text>
          </ListboxOption>

          <Button
            className="flex min-w-64 items-center gap-2 bg-neutral-50"
            onClick={() => setShowAddProfile(true)}
            disabled={selectedDevice === undefined}
          >
            <Plus />
            <Text>Add profile</Text>
          </Button>
        </ListboxOptions>
        <AddProfileDialog
          show={showAddProfile}
          names={profiles.map(p => p.name)}
          onClose={() => setShowAddProfile(false)}
          onAddProfile={onAddProfile}
        />
      </Listbox>
      <Button
        variant="default"
        disabled={
          currentProfile === undefined || currentProfile === selectedProfile
        }
        onClick={() => {
          if (currentProfile) {
            onSelectProfile(currentProfile);
          }
        }}
      >
        Use this profile
      </Button>
    </div>
  );
}

type AddProfileDialogProps = {
  show: boolean;
  names: string[];
  onClose: () => void;
  onAddProfile: (name: string) => void;
};

function AddProfileDialog({
  show,
  names,
  onClose,
  onAddProfile,
}: AddProfileDialogProps) {
  const [name, setName] = useState("");

  return (
    <Dialog open={show} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen place-items-start p-12">
        <DialogPanel className="mt-88 flex max-w-lg flex-col gap-2 rounded-xl border border-neutral-500 bg-white p-6 shadow-xl">
          <DialogTitle as={H3} strong>
            Add profile
          </DialogTitle>
          <Description>This will add a new keyboard profile</Description>
          <Field className="flex flex-col">
            <Label as={Text} size="sm" strong>
              Profile name
            </Label>
            <Description as={Text} size="sm" className="text-secondary">
              The name for the new profile. This can be edited later
            </Description>
            <Input
              className={
                "mt-3 block w-full rounded-lg border-none bg-black/5 px-3 py-1.5 text-sm/6 text-black " +
                "focus:not-data-focus:outline-none data-focus:outline-1 data-focus:-outline-offset-2 data-focus:outline-black/25"
              }
              name="profile_name"
              type="text"
              placeholder="Profile name…"
              value={name}
              onChange={event => setName(event.target.value)}
            />
            {names.includes(name) && (
              <Text size="sm" className="text-red-500">
                Each profile must have a unique name.
              </Text>
            )}
          </Field>
          <div className="flex gap-4">
            <Button className="ml-auto" onClick={onClose} variant="default">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onClose();
                onAddProfile(name);
              }}
              variant="primary"
              disabled={name.length === 0 || names.includes(name)}
            >
              Add
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function DisplayDevice({ device }: { device: HIDDevice | undefined }) {
  return (
    <div className="flex flex-col items-start truncate">
      {device ? (
        <>
          <span className="tabular-nums">
            0x{device.productId.toString(16)}
          </span>
          <span>{device.productName}</span>
        </>
      ) : (
        <span>None</span>
      )}
    </div>
  );
}

function DisplayProfile(profile: KeyboardProfile) {
  return (
    <>
      <LayoutIcon
        {...profile.layout}
        encoders={profile.keyboardDeviceType.encoders}
        className="size-5"
      />
      <Text>{profile.name}</Text>
      <Text size="sm" className="tabular-nums">
        (0x{profile.vendorId.toString(16)}:0x
        {profile.productId.toString(16)})
      </Text>
    </>
  );
}
