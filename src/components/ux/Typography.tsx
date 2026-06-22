import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { twMerge } from "tailwind-merge";

const typography = cva("", {
  variants: {
    as: {
      h1: "text-default dark:text-white",
      h2: "text-default dark:text-white",
      h3: "text-default dark:text-white",
      h4: "text-default dark:text-white",
      text: null,
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
      "8xl": "text-8xl",
      "9xl": "text-9xl",
    },
    strong: {
      true: "font-semibold",
      false: null,
    },
  },
});

export type TypographyProps = VariantProps<typeof typography> &
  React.HTMLAttributes<HTMLSpanElement>;

type TypographyElement = Exclude<TypographyProps["as"], null | undefined>;

const ELEMENT_DEFINITION: Record<
  TypographyElement,
  {
    fontSize: Exclude<TypographyProps["size"], null | undefined>;
    displayName: string;
    Component: Exclude<TypographyElement, "text"> | "span";
  }
> = {
  h1: {
    displayName: "H1",
    fontSize: "4xl",
    Component: "h1",
  },
  h2: {
    displayName: "H2",
    fontSize: "3xl",
    Component: "h2",
  },
  h3: {
    displayName: "H3",
    fontSize: "2xl",
    Component: "h3",
  },
  h4: {
    displayName: "H4",
    fontSize: "xl",
    Component: "h4",
  },
  text: { displayName: "Text", fontSize: "md", Component: "span" },
};

function makeTypographyComponent(
  as: TypographyElement
): React.FC<React.PropsWithChildren<TypographyProps>> {
  const { Component, fontSize, displayName } = ELEMENT_DEFINITION[as];

  const typographyComponent = ({
    size = fontSize,
    strong = as.startsWith("h"),
    className,
    children,
    ...other
  }: React.PropsWithChildren<TypographyProps>) => {
    return (
      <Component
        className={twMerge(typography({ as, size, strong, className }))}
        {...other}
      >
        {children}
      </Component>
    );
  };
  typographyComponent.displayName = displayName;

  return typographyComponent;
}

export const H1 = makeTypographyComponent("h1");
export const H2 = makeTypographyComponent("h2");
export const H3 = makeTypographyComponent("h3");
export const H4 = makeTypographyComponent("h4");
export const Text = makeTypographyComponent("text");
