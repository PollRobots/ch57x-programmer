import React from "react";
import { twMerge } from "tailwind-merge";





export type TypographyProps = {
  size?: FontSize;
  strong?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>;

type TypographyElement = "h1" | "h2" | "h3" | "h4" | "text";
export type FontSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl";

const HEADING_CLASS_NAME = "text-default";

const ELEMENT_DEFINITION: Record<
  TypographyElement,
  {
    baseClassName?: string;
    fontSize: FontSize;
    displayName: string;
    Component: Exclude<TypographyElement, "text"> | "span";
  }
> = {
  h1: {
    displayName: "H1",
    baseClassName: HEADING_CLASS_NAME,
    fontSize: "4xl",
    Component: "h1",
  },
  h2: {
    displayName: "H2",
    baseClassName: HEADING_CLASS_NAME,
    fontSize: "3xl",
    Component: "h2",
  },
  h3: {
    displayName: "H3",
    baseClassName: HEADING_CLASS_NAME,
    fontSize: "2xl",
    Component: "h3",
  },
  h4: {
    displayName: "H4",
    baseClassName: HEADING_CLASS_NAME,
    fontSize: "xl",
    Component: "h4",
  },
  text: { displayName: "Text", fontSize: "md", Component: "span" },
};

const FONT_SIZE: Record<FontSize, string> = {
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
};

function makeTypographyComponent(
  as: TypographyElement
): React.FC<React.PropsWithChildren<TypographyProps>> {
  const { Component, baseClassName, fontSize, displayName } =
    ELEMENT_DEFINITION[as];

  const typographyComponent = ({
    size = fontSize,
    strong = as.startsWith("h"),
    className,
    children,
    ...other
  }: React.PropsWithChildren<TypographyProps>) => {
    const concreteClassName = twMerge(
      baseClassName,
      FONT_SIZE[size],
      strong && "font-semibold",
      className
    );
    return (
      <Component className={concreteClassName} {...other}>
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