import React from 'react';
import { cva, VariantProps } from "class-variance-authority";
import { Tooltip as HeadlessTooltip } from "headless-tooltip";
import { twMerge } from "tailwind-merge";

const tooltip = cva("font-xs max-w-sm rounded-lg px-4 py-2 shadow-xl", {
        variants: {
            inverted: {
                true: "dark:text-default dark:bg-white bg-neutral-800 text-white",
                false: "text-default bg-white dark:bg-neutral-950 dark:text-white",
            }
        }
    }
);

const tooltipArrow = cva("", {
    variants: {
        inverted: {
            false:"bg-white dark:bg-neutral-950",
            true:"dark:bg-white bg-neutral-800",
        }
    }
}
);


export type TooltipProps = {
    content: React.ReactNode;
    arrow?: boolean;
    className?: string;
    arrowClassName?: string;
} & VariantProps<typeof tooltip> 


export function Tooltip({content, arrow = true, inverted=false, className, arrowClassName, children}: React.PropsWithChildren<TooltipProps>) {
      return <HeadlessTooltip
        content={content}
        className={twMerge(tooltip({inverted}), className)}
        arrow={arrow}
        arrowClassName={twMerge(tooltipArrow({inverted}), arrowClassName)}
      >
        {children}
      </HeadlessTooltip>
}