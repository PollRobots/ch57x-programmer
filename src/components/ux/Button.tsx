import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { twMerge } from "tailwind-merge";

const button = cva(
  "box-border border focus:ring-1 rounded-lg focus:outline-none select-none",
  {
    variants: {
      size: {
        sm: "px-2 py-1",
        md: "px-3 py-1.5",
        lg: "px-4 py-2.5",
      },
      variant: {
        default:
          "text-secondary bg-neutral-100 border-neutral-400 hover:bg-neutral-200 hover:text-default focus:ring-1 focus:ring-neutral-400 shadow-xs",
        primary:
          "text-white bg-indigo-500 hover:bg-indigo-600 border-transparent focus:ring-1 focus:ring-indigo-500 shadow-xs",
        invisible:
          "text-secondary border-transparent hover:text-default focus:ring-1 focus:ring-neutral-400",
      },
      disabled: {
        false: "cursor-pointer",
        true: "opacity-50 pointer-events-none",
      },
    },
  }
);

/**
 * Properties for a button.
 *
 * Note this explicitly doesn't use the {@link React.ButtonHTMLAttributes<T>} because too many of them are problematic
 */
export type ButtonProps = VariantProps<typeof button> &
  React.HTMLAttributes<HTMLButtonElement>;

export function Button({
  size = "md",
  variant = "default",
  disabled = false,
  className,
  children,
  ...other
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={twMerge(button({ size, variant, disabled, className }))}
      disabled={disabled ?? undefined}
      type="button"
      {...other}
    >
      {children}
    </button>
  );
}