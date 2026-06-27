import { cva, VariantProps } from "class-variance-authority";
import React from "react";
import { twMerge } from "tailwind-merge";

import { Tooltip } from "./Tooltip";

const input = cva(
  [
    "block w-full rounded-lg border-none px-3 py-1.5",
    "bg-neutral-50 text-primary dark:bg-neutral-950 dark:text-white",
    "outline-none focus:outline-solid focus:outline-1 focus:outline-offset-2",
    "focus:outline-neutral-400 dark:focus:outline-neutral-500",
  ],
  {
    variants: {
      size: {
        sm: "px-2 py-1 text-sm",
        md: "px-3 py-1.5 text-base",
        lg: "px-4 py-2.5 text-lg",
      },
    },
  }
);

export type InputProps = {
  description?: string;
} & VariantProps<typeof input> &
  Omit<React.ComponentProps<"input">, "size">;

export function Input({
  className,
  size = "sm",
  description,
  ...other
}: InputProps) {
  const control = (
    <input className={twMerge(input({ size }), className)} {...other} />
  );

  if (description) {
    return <Tooltip content={description}>{control}</Tooltip>;
  }

  return control;
}
