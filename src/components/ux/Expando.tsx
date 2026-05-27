import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import React from "react";
import { twJoin, twMerge } from "tailwind-merge";

export type ExpandoProps = {
  defaultOpen?: boolean;
  title: React.ReactNode;
  openContent: React.ReactNode;
  collapseDirection: ExpandoCollapseDirection;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title">;

export type ExpandoCollapseDirection = "left" | "right";

export function Expando({
  className,
  title,
  openContent,
  defaultOpen = false,
  collapseDirection,
  ...other
}: ExpandoProps) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <nav
          className={twMerge(
            "grid grid-cols-[auto_auto] grid-rows-[auto_1fr] flex-row p-2",
            className
          )}
          {...other}
        >
          {open && (
            <div
              className={twJoin(
                "row-start-1 self-center",
                collapseDirection === "left" ? "col-start-1" : "col-start-2"
              )}
            >
              {title}
            </div>
          )}
          <DisclosurePanel className="col-span-2 col-start-1 row-start-2">
            {openContent}
          </DisclosurePanel>
          <DisclosureButton
            className={twJoin(
              "row-start-1 self-center",
              collapseDirection === "left" ? "col-start-2" : "col-start-1"
            )}
          >
            {collapseDirection === "left" &&
              (open ? <PanelLeftClose /> : <PanelLeftOpen />)}
            {collapseDirection === "right" &&
              (open ? <PanelRightClose /> : <PanelRightOpen />)}
          </DisclosureButton>
        </nav>
      )}
    </Disclosure>
  );
}
