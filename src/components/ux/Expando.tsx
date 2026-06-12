import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { cva } from "class-variance-authority";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import React from "react";

export type ExpandoProps = {
  defaultOpen?: boolean;
  title: React.ReactNode;
  openContent: React.ReactNode;
  collapseDirection: ExpandoCollapseDirection;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title">;

export type ExpandoCollapseDirection = "left" | "right";

const disclosureButton = cva("flex-none");

const disclosurePanel = cva("flex-1", {
  variants: {
    open: { true: null, false: "hidden" },
  },
});

const expando = cva("flex flex-col p-2 gap-2 justify-items-start");
const topPanel = cva(
  "flex gap-2 self-stretch items-center justify-between flex-none",
  {
    variants: {
      open: { true: null, false: null },
      collapseDirection: {
        left: "flex-row",
        right: "flex-row-reverse",
      },
    },
  }
);
const titleDiv = cva("", {
  variants: {
    open: {
      true: null,
      false: "hidden",
    },
  },
});

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
        <nav className={expando({ className })} {...other}>
          <div className={topPanel({ open, collapseDirection })}>
            <div className={titleDiv({ open })}>{title}</div>
            <DisclosureButton className={disclosureButton()}>
              {collapseDirection === "left" &&
                (open ? <PanelLeftClose /> : <PanelLeftOpen />)}
              {collapseDirection === "right" &&
                (open ? <PanelRightClose /> : <PanelRightOpen />)}
            </DisclosureButton>
          </div>
          <DisclosurePanel className={disclosurePanel({ open })}>
            {openContent}
          </DisclosurePanel>
        </nav>
      )}
    </Disclosure>
  );
}