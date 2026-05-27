import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { Check, HardDriveUpload, Keyboard, Plus } from "lucide-react";
import React from "react";

import { KeyboardDeviceType } from "@model/keyboard";
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
};

export type KeyLayout = {
  rows: number;
  columns: number;
};

export function Configuration(props: ConfigurationProps) {
  return (
    <Expando
      defaultOpen
      title={
        <H3 size="lg" strong>
          Keyboard configuration
        </H3>
      }
      className="grid border-r-1 border-r-neutral-400 bg-neutral-200"
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
}: ConfigurationProps) {
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
    </div>
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
