import { cva, type VariantProps } from "class-variance-authority";
import { Asterisk, Keyboard, Triangle } from "lucide-react";
import React from "react";

import { KeyBindingOrigin, Macro } from "@model/keyboard";
import { Text } from "@ux/Typography";

import { DisplayKeyBinding } from "./DisplayKeyBinding";

const keyboardKey = cva(
  [
    "grid text-center border",
    "text-secondary hover:text-default",
    "dark:text-white dark:hover:text-white",
  ],
  {
    variants: {
      variant: {
        button: [
          "rounded-md place-items-center bg-linear-to-b",
          "from-neutral-50 via-neutral-100 hover:via-indigo-100",
          "dark:from-neutral-900 dark:via-neutral-800 dark:hover:via-indigo-800",
        ],
        "encoder-ccw": [
          "justify-items-center items-end border-transparent",
          "hover:border-neutral-200 dark:hover:border-neutral-700",
        ],
        "encoder-cw": [
          "justify-items-center items-end border-transparent",
          "hover:border-neutral-200 dark:hover:border-neutral-700",
        ],
        encoder: [
          "rounded-full place-items-center bg-radial-[at_15%_15%] to-85%",
          "from-neutral-50 via-neutral-100 hover:via-indigo-100",
          "dark:from-neutral-900 dark:via-neutral-800 dark:hover:via-indigo-800",
        ],
      },
      selected: { true: null, false: null },
    },
    compoundVariants: [
      {
        variant: "button",
        selected: true,
        class:
          "border-neutral-600 to-indigo-200 dark:border-neutral-300 dark:to-indigo-700",
      },
      {
        variant: "button",
        selected: false,
        class: [
          "to-neutral-200 dark:to-neutral-700 ",
          "border-neutral-200 hover:border-neutral-400",
          "dark:border-neutral-700 dark:hover:border-neutral-500",
        ],
      },
      {
        variant: "encoder-ccw",
        selected: true,
        class: "border-b-neutral-600 dark:border-b-neutral-300",
      },
      {
        variant: "encoder-cw",
        selected: true,
        class: "border-b-neutral-600 dark:border-b-neutral-300",
      },
      {
        variant: "encoder",
        selected: true,
        class:
          "border-neutral-600 to-indigo-200 dark:border-neutral-600 dark:to-indigo-700",
      },
      {
        variant: "encoder",
        selected: false,
        class: [
          "to-neutral-200  dark:to-neutral-700",
          "border-neutral-200 hover:border-neutral-400",
          "dark:border-neutral-700 dark:hover:border-neutral-500",
        ],
      },
    ],
  }
);
const marker = cva(
  "col-start-1 row-start-1 self-start justify-self-start p-1",
  {
    variants: {
      origin: {
        device: "text-tertiary",
        editor: "text-red-500",
        placeholder: null,
        profile: "text-blue-500",
      },
    },
  }
);

export type KeyboardKeyProps = {
  as?: "div" | "button";
  macro: Macro | undefined;
  origin: KeyBindingOrigin;
} & VariantProps<typeof keyboardKey> &
  Omit<React.HTMLAttributes<HTMLElement>, "children">;

export type KeyboardKeyVariant = Exclude<
  KeyboardKeyProps["variant"],
  null | undefined
>;

export function KeyboardKey({
  className,
  macro,
  as = "div",
  variant = "button",
  selected = false,
  origin,
  ...other
}: KeyboardKeyProps) {
  const Component = as;

  return (
    <Component
      className={keyboardKey({ variant, selected, className })}
      {...other}
    >
      {macro && (
        <div className="col-start-1 row-start-1">
          <DisplayKeyBinding macro={macro} />
        </div>
      )}
      <div className={marker({ origin })}>
        {origin === "editor" && <Asterisk className="size-3" />}
        {origin === "placeholder" && <Text size="xs">P</Text>}
        {origin === "profile" && <Triangle className="size-3" />}
        {origin === "device" && <Keyboard className="size-3" />}
      </div>
    </Component>
  );
}
