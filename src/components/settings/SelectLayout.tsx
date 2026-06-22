import { Check } from "lucide-react";
import React, { useMemo } from "react";
import { twJoin } from "tailwind-merge";

import { KeyboardDeviceType } from "@model/keyboard";
import { Select } from "@ux/Select";
import { Text } from "@ux/Typography";

import { DisplayLayout } from "../DisplayLayout";
import { LayoutIcon } from "../LayoutIcon";

export type KeyLayout = {
  rows: number;
  columns: number;
};

type LayoutOption = {
  value: string;
  layout: KeyLayout;
  label: string;
};

export type SelectLayoutProps = {
  keyboardDeviceType: KeyboardDeviceType;
  layouts: KeyLayout[];
  selectedLayout: KeyLayout;
  onSelectLayout: (layout: KeyLayout) => void;
};

export function SelectLayout({
  keyboardDeviceType: { buttons, encoders },
  layouts,
  selectedLayout,
  onSelectLayout,
}: SelectLayoutProps) {
  const layoutOptions = useMemo<LayoutOption[]>(
    () =>
      [{ rows: 0, columns: 0 }, ...layouts].map(layout => {
        if (layout.rows === 0 && layout.columns === 0) {
          return {
            value: "0.none",
            layout,
            label: "Unknown",
          };
        }

        return {
          value: `${layout.columns}x${layout.rows}`,
          layout,
          label: `${layout.columns}×${layout.rows} + ${encoders}`,
        };
      }),
    [layouts, encoders]
  );
  const selectedLayoutOption = useMemo(
    () =>
      layoutOptions.find(
        ({ layout }) =>
          layout.rows === selectedLayout.rows &&
          layout.columns === selectedLayout.columns
      ) ?? {
        value: "0.none",
        layout: { rows: 0, columns: 0 },
        label: "Unknown",
      },
    [layoutOptions, selectedLayout]
  );

  return (
    <>
      <Text strong>
        Layout ({buttons} buttons, {encoders} encoders):
      </Text>
      <Select
        value={selectedLayoutOption}
        options={layoutOptions}
        onChange={value => {
          const layout = layoutOptions.find(
            option => value.value === option.value
          )?.layout;
          if (layout) {
            onSelectLayout(layout);
          }
        }}
        className="w-64 max-w-64 text-left"
        renderOption={(current, selected) => {
          const layout = layoutOptions.find(
            option => current.value === option.value
          )?.layout;
          if (!layout) {
            return null;
          }
          return (
            <div
              className={twJoin(
                "flex min-w-64 items-center gap-2 rounded-lg border p-2",
                "border-neutral-300 bg-neutral-50 hover:bg-neutral-100",
                "dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
              )}
            >
              <Check className={selected ? undefined : "invisible"} />
              <LayoutIcon {...layout} encoders={encoders} className="size-5" />
              <DisplayLayout {...layout} encoders={encoders} />
            </div>
          );
        }}
      />
    </>
  );
}
