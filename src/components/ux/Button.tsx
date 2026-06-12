import React from "react";
import { twMerge } from "tailwind-merge";





/**
 * Properties for a button.
 *
 * Note this explicitly doesn't use the {@link React.ButtonHTMLAttributes<T>} because too many of them are problematic
 */
export type ButtonProps = {
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "invisible";
} & React.HTMLAttributes<HTMLButtonElement>;

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "default" | "primary" | "invisible";

const COMMON_STYLES =
  "box-border border focus:ring-1 rounded-lg focus:outline-none select-none";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  default:
    "text-secondary bg-neutral-100 border-neutral-400 hover:bg-neutral-200 hover:text-default focus:ring-1 focus:ring-neutral-400 shadow-xs",
  primary:
    "text-white bg-indigo-500 hover:bg-indigo-600 border-transparent focus:ring-1 focus:ring-indigo-500 shadow-xs",
  invisible:
    "text-secondary border-transparent hover:text-default focus:ring-1 focus:ring-neutral-400",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-2 py-1",
  md: "px-3 py-1.5",
  lg: "px-4 py-2.5",
};

export function Button({
  size = "md",
  variant = "default",
  disabled,
  className,
  children,
  ...other
}: React.PropsWithChildren<ButtonProps>) {
  const concreteClassName = twMerge(
    COMMON_STYLES,
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    disabled ? "opacity-50 pointer-events-none" : "cursor-pointer",
    className
  );

  return (
    <button
      className={concreteClassName}
      type="button"
      disabled={disabled}
      {...other}
    >
      {children}
    </button>
  );
}