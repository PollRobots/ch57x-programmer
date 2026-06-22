import { Radio, RadioGroup } from "@headlessui/react";
import { cva } from "class-variance-authority";
import { CircleSmall, Dot } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

import { Text } from "./Typography";

const simpleradiogroup = cva("flex gap-1", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
});

const simpleradio = cva(
  "px-2 py-1 border flex flex-row gap-2 items-center rounded",
  {
    variants: {
      selected: {
        true: [
          "border-neutral-400 hover:border-neutral-600 text-default bg-neutral-50",
          "dark:border-neutral-500 dark:hover:border-neutral-300 dark:text-white dark:bg-neutral-800",
        ],
        false: [
          "border-neutral-200 hover:border-neutral-400 text-secondary bg-neutral-100",
          "dark:border-neutral-700 dark:hover:border-neutral-500 dark:text-white dark:bg-neutral-700",
        ],
      },
    },
  }
);

export type SimpleRadioProps<T = string> = {
  value: RadioOption<T>;
  options: RadioOption<T>[];
  renderOption?: (value: RadioOption<T>, selected: boolean) => React.ReactNode;
  onChange: (update: RadioOption<T>) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  radioClassName?: string;
};

export type RadioOption<T = string> = {
  value: T;
  label: string;
};

export function SimpleRadio<T = string>({
  value,
  options,
  renderOption,
  onChange,
  className,
  orientation = "horizontal",
  radioClassName,
}: SimpleRadioProps<T>) {
  return (
    <RadioGroup
      value={value.value}
      onChange={update => {
        const selected = options.find(({ value }) => value === update);
        if (selected) {
          onChange(selected);
        }
      }}
      className={twMerge(simpleradiogroup({ orientation }), className)}
    >
      {options.map((option, i) => {
        const selected = value.value === option.value;
        return (
          <Radio key={i} value={option.value}>
            {renderOption ? (
              renderOption(option, selected)
            ) : (
              <div
                className={twMerge(
                  simpleradio({
                    selected,
                  }),
                  radioClassName
                )}
              >
                {selected ? <CircleSmall /> : <Dot />}
                <Text>{option.label} </Text>
              </div>
            )}
          </Radio>
        );
      })}
    </RadioGroup>
  );
}
