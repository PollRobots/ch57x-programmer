import { cva, VariantProps } from "class-variance-authority";
import { Tooltip as HeadlessTooltip } from "headless-tooltip";
import React from "react";
import { twMerge } from "tailwind-merge";

import { useRem } from "@hooks/useRem";

const tooltip = cva("font-xs max-w-sm rounded-lg px-4 py-2 shadow-xl", {
  variants: {
    inverted: {
      true: "dark:text-default dark:bg-white bg-neutral-800 text-white",
      false: "text-default bg-white dark:bg-neutral-950 dark:text-white",
    },
  },
});

const tooltipArrow = cva("shadow-xl", {
  variants: {
    inverted: {
      false: "bg-white dark:bg-neutral-950",
      true: "dark:bg-white bg-neutral-800",
    },
  },
});

export type TooltipProps = {
  content: React.ReactNode;
  arrow?: boolean;
  className?: string;
  arrowClassName?: string;
  portalContainer?: HTMLElement;
} & VariantProps<typeof tooltip>;

export function Tooltip({
  content,
  arrow = true,
  inverted = false,
  className,
  arrowClassName,
  portalContainer,
  children,
}: React.PropsWithChildren<TooltipProps>) {
  const rem = useRem();
  const arrowSize = (rem * 3) / 4;

  return (
    <HeadlessTooltip
      content={content}
      className={twMerge(tooltip({ inverted }), className)}
      arrow={arrow}
      arrowSize={arrowSize}
      arrowClassName={twMerge(tooltipArrow({ inverted }), arrowClassName)}
      portalContainer={portalContainer!}
    >
      {children}
    </HeadlessTooltip>
  );
}
