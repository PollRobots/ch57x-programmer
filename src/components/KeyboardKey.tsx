import { Asterisk } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";



import { KeyBindingOrigin, Macro } from "@model/keyboard";
import { Text } from "@ux/Typography";



import { DisplayKeyBinding } from "./DisplayKeyBinding";


export type KeyboardKeyProps = {
  as?: "div" | "button";
  variant?: "button" | "encoder-ccw" | "encoder-cw" | "encoder";
  macro: Macro | undefined;
  origin: KeyBindingOrigin;
  selected?: boolean;
} & Omit<React.HTMLAttributes<HTMLElement>, "children">;

export type KeyboardKeyVariant =
  | "button"
  | "encoder-ccw"
  | "encoder-cw"
  | "encoder";

const COMMON_CLASS_NAME =
  "grid text-secondary hover:text-default text-center border";

const VARIANT_CLASS_NAME: Record<KeyboardKeyVariant, string> = {
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
};

const SELECTED_CLASS_NAME: Record<KeyboardKeyVariant, string> = {
  button: "border-neutral-600 to-indigo-200",
  "encoder-ccw": "border-b-neutral-600",
  "encoder-cw": "border-b-neutral-600",
  encoder: "border-neutral-600 to-indigo-200",
};

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
      className={twMerge(
        COMMON_CLASS_NAME,
        VARIANT_CLASS_NAME[variant],
        selected && SELECTED_CLASS_NAME[variant],
        className
      )}
      {...other}
    >
      {macro && (
        <div className="col-start-1 row-start-1">
          <DisplayKeyBinding macro={macro} />
        </div>
      )}
      {origin === "editor" && (
        <div className="col-start-1 row-start-1 self-start justify-self-start p-1">
          <Asterisk className="size-3 text-red-500" />
        </div>
      )}
      {origin === "placeholder" && (
        <div className="col-start-1 row-start-1 self-start justify-self-start p-1">
          <Text size="xs">P</Text>
        </div>
      )}
    </Component>
  );
}