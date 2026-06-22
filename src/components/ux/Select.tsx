import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

import { Text } from "./Typography";

const listboxoption = cva([
  "group flex min-w-64 items-center gap-2 rounded-lg border p-2",
  "border-neutral-300 bg-neutral-50 p-2 hover:bg-neutral-100 text-default",
  "dark:border-neutral-600 dark:bg-neutral-800 p-2 dark:hover:bg-neutral-700 dark:text-white",
]);

export type SelectProps<T extends string = string> = {
  value: SelectOption<T>;
  options: SelectOption<T>[];
  renderOption?: (value: SelectOption<T>, selected: boolean) => React.ReactNode;
  onChange: (update: SelectOption<T>) => void;
  className?: string;
  optionClassName?: string;
};

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export function Select<T extends string>({
  value,
  options,
  renderOption,
  onChange,
  className,
  optionClassName,
}: SelectProps<T>) {
  return (
    <Listbox
      value={value.value}
      onChange={update => {
        const selected = options.find(({ value }) => value === update);
        if (selected) {
          onChange(selected);
        }
      }}
    >
      <ListboxButton
        className={twMerge(
          "rounded-lg border border-neutral-300 bg-neutral-100 p-2 hover:border-neutral-500",
          "p-2 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-neutral-400",
          className
        )}
      >
        {value.label}
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        className="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-lg dark:bg-neutral-900"
      >
        {options.map((option, i) => {
          const selected = value.value === option.value;
          return (
            <ListboxOption key={i} value={option.value}>
              {renderOption ? (
                renderOption(option, selected)
              ) : (
                <div className={twMerge(listboxoption(), optionClassName)}>
                  <Check className={selected ? undefined : "invisible"} />
                  <Text>{option.label} </Text>
                </div>
              )}
            </ListboxOption>
          );
        })}
      </ListboxOptions>
    </Listbox>
  );
}
