import React from "react";
import { twMerge } from "tailwind-merge";

const PAGE_CLASS =
  "text-default max-h-screen min-h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-800 dark:text-white";

export function Page({
  className,
  children,
  ...other
}: React.ComponentProps<"div">) {
  return (
    <div className={twMerge(PAGE_CLASS, className)} {...other}>
      {children}
    </div>
  );
}
