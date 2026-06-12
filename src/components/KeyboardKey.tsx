import { cva, type VariantProps } from "class-variance-authority";
import { Asterisk } from "lucide-react";
import React from "react";

import { KeyBindingOrigin, Macro } from "@model/keyboard";
import { Text } from "@ux/Typography";

import { DisplayKeyBinding } from "./DisplayKeyBinding";

const keyboardKey = cva(
  "grid text-secondary hover:text-default text-center border",
  {
    variants: {
      variant: {
        button:
          "border-neutral-200 hover:border-neutral-400 rounded-md place-items-center" +
          " bg-gradient-to-b from-neutral-50 to-neutral-200 via-neutral-100 hover:via-indigo-100",
        "encoder-ccw":
          "justify-items-center items-end border-transparent hover:border-neutral-200",
        "encoder-cw":
          "justify-items-center items-end border-transparent hover:border-neutral-200",
        encoder:
          "border-neutral-200 hover:border-neutral-400 rounded-full place-items-center" +
          " bg-radial-[at_15%_15%] from-neutral-50 to-neutral-200 to-[85%] via-neutral-100 hover:via-indigo-100",
      },
      selected: { true: null, false: null },
    },
    compoundVariants: [
      {
        variant: "button",
        selected: true,
        class: "border-neutral-600 to-indigo-200",
      },
      { variant: "encoder-ccw", selected: true, class: "border-b-neutral-600" },
      {
        variant: "encoder-cw",
        selected: true,
        class: "border-b-neutral-600",
      },
      {
        variant: "encoder",
        selected: true,
        class: "border-neutral-600 to-indigo-200",
      },
    ],
  }
);
const marker = cva(
  "col-start-1 row-start-1 self-start justify-self-start p-1",
  {
    variants: {
      origin: {
        device: "hidden",
        editor: "text-red-500",
        placeholder: null,
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
      </div>
    </Component>
  );
}
