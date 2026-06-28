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
    [mode, onChange, scale]
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
      <a
        href="https://github.com/pollrobots/ch57x-programmer"
        className="mt-2 inline-flex gap-2"
      >
        <GitHub className="size-6" />
        <Text className="underline">Source</Text>
      </a>
    </div>
  );
}

function GitHub({ className, ...other }: React.ComponentProps<"div">) {
  return (
    <div
      className={twMerge(
        "flex items-stretch text-black dark:text-white",
        className
      )}
      {...other}
    >
      <svg viewBox="0 0 98 96" fill="none">
        <g>
          <path
            d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </div>
  );
}
