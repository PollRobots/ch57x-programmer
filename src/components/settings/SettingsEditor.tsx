import React, { useCallback } from "react";
import { twMerge } from "tailwind-merge";

import { ColorMode, PageScale, Settings } from "@hooks/useSettings";
import { Select } from "@ux/Select";
import { H4, Text } from "@ux/Typography";

type SettingsEditorProps = {
  onChange: (update: Settings) => void;
} & Settings &
  Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange">;

const COLOR_MODE_OPTIONS: { value: ColorMode; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "device", label: "Device" },
];

const PAGE_SCALE_OPTIONS: { value: PageScale; label: string }[] = [
  { value: "xs", label: "Very small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Regular" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Very large" },
];

export function SettingsEditor({
  mode,
  scale,
  onChange,
  className,
  ...other
}: SettingsEditorProps) {
  const updateSettings = useCallback(
    (change: Partial<Settings>) => {
      const update = {
        mode,
        scale,
        ...change,
      };
      onChange(update);
    },
    [mode, scale]
  );

  return (
    <div className={twMerge("flex flex-col gap-2", className)} {...other}>
      <H4>Settings</H4>
      <Text>Color theme:</Text>
      <Select
        value={COLOR_MODE_OPTIONS.find(({ value }) => value === mode)!}
        options={COLOR_MODE_OPTIONS}
        onChange={update => updateSettings({ mode: update.value })}
        className="w-64 max-w-64 text-start"
      />
      <Text>Scale:</Text>
      <Select
        value={PAGE_SCALE_OPTIONS.find(({ value }) => value === scale)!}
        options={PAGE_SCALE_OPTIONS}
        onChange={update => updateSettings({ scale: update.value })}
        className="w-64 max-w-64 text-start"
      />
    </div>
  );
}
