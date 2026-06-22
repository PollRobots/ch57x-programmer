import { Check, Plus } from "lucide-react";
import React, { useMemo } from "react";
import { twJoin } from "tailwind-merge";

import { Select } from "@ux/Select";
import { Text } from "@ux/Typography";

export type SelectDeviceProps = {
  devices: HIDDevice[];
  selectedDevice: HIDDevice | undefined;
  onSelectDevice: (device: HIDDevice | undefined) => void;
  onAddDevice: () => void;
};

type DeviceOption = {
  value: string;
  device: HIDDevice | undefined | "add";
  label: string;
};

export function SelectDevice({
  devices,
  selectedDevice,
  onSelectDevice,
  onAddDevice,
}: SelectDeviceProps) {
  const deviceOptions = useMemo<DeviceOption[]>(() => {
    const deviceOptions = [undefined, ...devices].map<DeviceOption>(
      (device, i) => ({
        value: `${i}.${device ? device.productId.toString(16) : "none"}`,
        device: device,
        label: device
          ? `0x${device.productId.toString(16)} ${device.productName}`
          : "None",
      })
    );
    deviceOptions.push({ value: "add", device: "add", label: "add" });
    return deviceOptions;
  }, [devices]);
  const selectedDeviceOption = useMemo(
    () =>
      deviceOptions.find(option => option.device === selectedDevice) ?? {
        value: "0.none",
        device: undefined,
        label: "None",
      },
    [deviceOptions, selectedDevice]
  );

  return (
    <>
      <Text strong>Keyboard:</Text>
      <Select
        value={selectedDeviceOption}
        options={deviceOptions}
        onChange={update => {
          const device = deviceOptions.find(
            option => option.value === update.value
          )?.device;
          if (device === "add") {
            onAddDevice();
          } else {
            onSelectDevice(device);
          }
        }}
        className="w-64 max-w-64 text-left"
        renderOption={(value, selected) => {
          const device = deviceOptions.find(
            option => option.value === value.value
          )?.device;
          if (device !== "add") {
            return (
              <div
                className={twJoin(
                  "flex min-w-64 items-center gap-2 rounded-lg border",
                  "border-neutral-300 bg-neutral-50 p-2 hover:bg-neutral-100",
                  "dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                )}
              >
                <Check className={selected ? undefined : "invisible"} />
                <DisplayDevice device={device} />
              </div>
            );
          }
          return (
            <div
              className={twJoin(
                "flex min-w-64 items-center gap-2 rounded-lg border",
                "border-neutral-500 bg-neutral-50 p-2 hover:bg-neutral-300",
                "dark:border-neutral-400 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-600"
              )}
            >
              <Plus />
              <Text>Add keyboard</Text>
            </div>
          );
        }}
      />
    </>
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
