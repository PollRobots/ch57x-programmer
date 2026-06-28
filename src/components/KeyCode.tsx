import { cva } from "class-variance-authority";
import {
  AppWindow,
  ArrowBigUp,
  ArrowDownToLine,
  ArrowLeftFromLine,
  ArrowRightToLine,
  ArrowUp01,
  ArrowUpAZ,
  ArrowUpToLine,
  ChevronsDown,
  ChevronsUp,
  ChevronsUpDown,
  ChevronUp,
  CircleArrowOutUpLeft,
  CornerDownLeft,
  Delete,
  LayoutGrid,
  Lock,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  Option,
  Pause,
  Power,
  Printer,
  SquareMenu,
  TextCursor,
} from "lucide-react";
import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

import {
  isFunctionKey,
  isNumPadKey,
  isPunctuationKey,
  isSpecialKey,
  NumPadKey,
  PunctuationKey,
  SpecialKey,
  WellKnownCode,
} from "@model/key_codes";
import { Code, isModifier, Modifier } from "@model/keyboard";
import { useKeyboardLayout } from "@model/useKeyboardLayout";
import { Text } from "@ux/Typography";

export type KeyCodeProps = {
  code: Code | Modifier;
  simple?: boolean;
} & React.ComponentProps<"span">;

const commonkeyclass = cva(
  [
    "inline-block rounded-sm border align-middle text-center px-1",
    "border-neutral-500 dark:border-neutral-400",
  ],
  {
    variants: {
      square: {
        true: "size-7",
        false: "min-h-7 min-w-7",
      },
    },
  }
);

export function KeyCode({ code, className, ...other }: KeyCodeProps) {
  if (typeof code === "number") {
    return (
      <Text className={twMerge("tabular-nums", className)} {...other}>
        0x{code.toString(16)}
      </Text>
    );
  }
  if (isFunctionKey(code)) {
    return (
      <Text
        className={twMerge(
          commonkeyclass({ square: true }),
          "text-xs",
          className
        )}
        {...other}
      >
        {code}
      </Text>
    );
  }
  if (isNumPadKey(code)) {
    return (
      <DisplayNumPadKey numPadKey={code} className={className} {...other} />
    );
  }
  if (isPunctuationKey(code)) {
    return (
      <DisplayPunctuationKey
        punctuationKey={code}
        className={className}
        {...other}
      />
    );
  }
  if (isSpecialKey(code)) {
    return (
      <DisplaySpecialKey specialKey={code} className={className} {...other} />
    );
  }
  if (isModifier(code)) {
    return (
      <DisplayModifierKey modifier={code} className={className} {...other} />
    );
  }
  return (
    <DefaultKeyCode wellKnownCode={code} className={className} {...other} />
  );
}

type DefaultKeyCodeProps = {
  wellKnownCode: WellKnownCode;
  simple?: boolean;
} & React.ComponentProps<"span">;

function DefaultKeyCode({
  wellKnownCode,
  className,
  ...other
}: DefaultKeyCodeProps) {
  const { isFallback, getCodeName } = useKeyboardLayout();
  const name = useMemo(() => {
    const name = isFallback ? wellKnownCode : getCodeName(wellKnownCode);
    if (name === undefined) {
      return wellKnownCode;
    }
    if (name.length === 1) {
      return name.toLocaleUpperCase();
    }
    return name;
  }, [wellKnownCode, getCodeName, isFallback]);

  if (name.length === 1) {
    return (
      <span
        className={twMerge(commonkeyclass({ square: true }), className)}
        {...other}
      >
        {name}
      </span>
    );
  }

  return (
    <Text className={className} {...other}>
      {name}
    </Text>
  );
}

export type NumPadKeyProps = {
  numPadKey: NumPadKey;
  simple?: boolean;
} & React.ComponentProps<"span">;

export function DisplayNumPadKey({
  numPadKey,
  simple = false,
  className,
  ...other
}: NumPadKeyProps) {
  const name = useMemo(() => {
    switch (numPadKey) {
      case "NumPadSlash":
        return "/";
      case "NumPadAsterisk":
        return "*";
      case "NumPadMinus":
        return "-";
      case "NumPadPlus":
        return "+";
      case "NumPad1":
        return "1";
      case "NumPad2":
        return "2";
      case "NumPad3":
        return "3";
      case "NumPad4":
        return "4";
      case "NumPad5":
        return "5";
      case "NumPad6":
        return "6";
      case "NumPad7":
        return "7";
      case "NumPad8":
        return "8";
      case "NumPad9":
        return "9";
      case "NumPad0":
        return "0";
      case "NumPadDot":
        return ".";
      case "NumPadEqual":
        return "=";
    }
  }, [numPadKey]);

  if (simple) {
    return (
      <span
        className={twMerge(commonkeyclass({ square: true }), className)}
        {...other}
      >
        {name}
      </span>
    );
  }

  return (
    <span
      className={twMerge(commonkeyclass({ square: true }), className)}
      {...other}
    >
      <span>{name}</span>
      <span className="text-secondary align-super text-xs dark:text-white">
        N
      </span>
    </span>
  );
}

type DisplayPunctuationKeyProps = {
  punctuationKey: PunctuationKey;
} & React.ComponentProps<"span">;

function DisplayPunctuationKey({
  punctuationKey,
  className,
  ...other
}: DisplayPunctuationKeyProps) {
  const name = useMemo(() => {
    switch (punctuationKey) {
      case "Minus":
        return "-";
      case "Equal":
        return "=";
      case "LeftBracket":
        return "[";
      case "RightBracket":
        return "]";
      case "Backslash":
        return "\\";
      case "NonUSHash":
        return "#";
      case "Semicolon":
        return ";";
      case "Quote":
        return "'";
      case "Grave":
        return "`";
      case "Comma":
        return ",";
      case "Dot":
        return ".";
      case "Slash":
        return "/";
    }
  }, [punctuationKey]);

  return (
    <span
      className={twMerge(commonkeyclass({ square: true }), className)}
      {...other}
    >
      {name}
    </span>
  );
}

type DisplaySpecialKeyProps = {
  specialKey: SpecialKey;
  simple?: boolean;
} & React.ComponentProps<"span">;

function DisplaySpecialKey({
  specialKey,
  className,
  simple = false,
  ...other
}: DisplaySpecialKeyProps) {
  const { name, square } = useMemo<{
    name: React.ReactNode;
    square?: boolean;
  }>(() => {
    switch (specialKey) {
      case "Enter":
        return {
          name: <CornerDownLeft className="inline-block size-4" />,
          square: true,
        };
      case "Escape":
        return {
          name: <CircleArrowOutUpLeft className="inline-block size-4" />,
          square: true,
        };
      case "Tab":
        return {
          name: <ArrowRightToLine className="inline-block size-4" />,
          square: true,
        };
      case "Space":
        return { name: "space" };
      case "PrintScreen":
        return {
          name: <Printer className="inline-block size-4" />,
          square: true,
        };
      case "Insert":
        return {
          name: <TextCursor className="inline-block size-4" />,
          square: true,
        };
      case "Home":
        return {
          name: <ArrowUpToLine className="inline-block size-4" />,
          square: true,
        };
      case "PageUp":
        return {
          name: <ChevronsUp className="inline-block size-4" />,
          square: true,
        };
      case "Delete":
        return {
          name: <Delete className="inline-block size-4" />,
          square: true,
        };
      case "End":
        return {
          name: <ArrowDownToLine className="inline-block size-4" />,
          square: true,
        };
      case "PageDown":
        return {
          name: <ChevronsDown className="inline-block size-4" />,
          square: true,
        };
      case "NonUSBackslash":
        return { name: "\\", square: true };

      case "NumPadEnter":
        return simple
          ? {
              name: <CornerDownLeft className="inline-block size-4" />,
              square: true,
            }
          : {
              name: (
                <span>
                  <CornerDownLeft className="inline-block size-4" />
                  <span className="text-secondary align-super text-xs dark:text-white">
                    N
                  </span>
                </span>
              ),
            };
      case "Backspace":
        return {
          name: <ArrowLeftFromLine className="inline-block size-4" />,
          square: true,
        };
      case "NumLock":
        return {
          name: <ArrowUp01 className="inline-block size-4" />,
          square: true,
        };
      case "CapsLock":
        return {
          name: <ArrowUpAZ className="inline-block size-4" />,
          square: true,
        };
      case "ScrollLock":
        return {
          name: (
            <span>
              <ChevronsUpDown className="inline-block size-4" />
              <Lock className="inline-block size-4" />
            </span>
          ),
        };
      case "Pause":
        return {
          name: <Pause className="inline-block size-4" />,
          square: true,
        };
      case "Right":
        return {
          name: <MoveRight className="inline-block size-4" />,
          square: true,
        };
      case "Left":
        return {
          name: <MoveLeft className="inline-block size-4" />,
          square: true,
        };
      case "Down":
        return {
          name: <MoveDown className="inline-block size-4" />,
          square: true,
        };
      case "Up":
        return {
          name: <MoveUp className="inline-block size-4" />,
          square: true,
        };
      case "Application":
        return {
          name: <AppWindow className="inline-block size-4" />,
          square: true,
        };
      case "Power":
        return {
          name: <Power className="inline-block size-4" />,
          square: true,
        };
    }
  }, [simple, specialKey]);

  return (
    <span className={twMerge(commonkeyclass({ square }), className)} {...other}>
      {name}
    </span>
  );
}

type DisplayModifierKeyProps = {
  modifier: Modifier;
  simple?: boolean;
} & React.ComponentProps<"span">;

export function DisplayModifierKey({
  modifier,
  className,
  ...other
}: DisplayModifierKeyProps) {
  const Icon = useMemo(() => {
    switch (modifier) {
      case "Ctrl":
      case "RightCtrl":
        return ChevronUp;
      case "Shift":
      case "RightShift":
        return ArrowBigUp;
      case "Alt":
      case "RightAlt":
        return Option;
      case "Meta":
        return LayoutGrid;
      case "RightMeta":
        return SquareMenu;
    }
  }, [modifier]);

  return (
    <span className={twMerge(commonkeyclass(), className)} {...other}>
      <Icon className="inline-block size-4" />
    </span>
  );
}
