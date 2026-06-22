import {
  AppWindow,
  ArrowLeftFromLine,
  ArrowUp01,
  ArrowUpAZ,
  ChevronsUpDown,
  Lock,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  Pause,
  Power,
} from "lucide-react";
import React, { useMemo } from "react";

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
import {
  Code,
  isKeyboardEvent,
  isMediaEvent,
  isMouseEvent,
  KeyChord,
  Macro,
  modifiersToCanonical,
  modifiersToString,
} from "@model/keyboard";
import { useKeyboardLayout } from "@model/useKeyboardLayout";
import { Text } from "@ux/Typography";

import { MediaKey } from "./MediaKey";

export type DisplayKeyBindingProps = {
  macro: Macro;
};

export function DisplayKeyBinding({ macro }: DisplayKeyBindingProps) {
  return (
    <>
      {isKeyboardEvent(macro) && (
        <DisplayKeyboardMacro keyChords={macro.keyChords} />
      )}
      {isMouseEvent(macro) && <DisplayMouseMacro />}
      {isMediaEvent(macro) && <MediaKey size="sm" code={macro.mediaCode} />}
    </>
  );
}

type DisplayKeyboardMacroProps = {
  keyChords: KeyChord[];
};

function DisplayKeyboardMacro({ keyChords }: DisplayKeyboardMacroProps) {
  const first = keyChords[0];

  return (
    <div className="flex flex-row place-items-start">
      {first && <DisplayKeyChord {...first} />}
      {keyChords.length > 1 && (
        <Text
          size="xs"
          className="bg-tertiary text-inverse -mt-1 -ml-1 rounded-full p-0.5"
        >
          {" "}
          +{keyChords.length - 1}
        </Text>
      )}
    </div>
  );
}

export function DisplayKeyChord({ modifiers, code }: KeyChord) {
  const modifierString = useMemo(
    () => modifiersToString(modifiers),
    [modifiers]
  );
  const modifierList = useMemo(
    () => modifiersToCanonical(modifiers),
    [modifiers]
  );

  return code === undefined ? (
    modifierString
  ) : (
    <div className="flex flex-row gap-1">
      {modifierList.length !== 0 && (
        <div className="flex flex-col gap-0.5">
          {modifierList.map((m, i) => (
            <Text key={i} size="xs" strong>
              {m}
            </Text>
          ))}
        </div>
      )}
      <KeyCode code={code} />
    </div>
  );
}

function DisplayMouseMacro() {
  return "mouse";
}

type KeyCodeProps = {
  code: Code;
};

function KeyCode({ code }: KeyCodeProps) {
  if (typeof code === "number") {
    return <Text className="tabular-nums">0x{code.toString(16)}</Text>;
  }
  if (isFunctionKey(code)) {
    return <Text>{code}</Text>;
  }
  if (isNumPadKey(code)) {
    return <NumPadKey numPadKey={code} />;
  }
  if (isPunctuationKey(code)) {
    return <PunctuationKey punctuationKey={code} />;
  }
  if (isSpecialKey(code)) {
    return <SpecialKey specialKey={code} />;
  }
  return <DefaultKeyCode wellKnownCode={code} />;
}

type DefaultKeyCodeProps = {
  wellKnownCode: WellKnownCode;
};

function DefaultKeyCode({ wellKnownCode }: DefaultKeyCodeProps) {
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
      <span className="inline-block size-6 rounded-sm border border-neutral-500 text-center">
        {name}
      </span>
    );
  }

  return <Text>{name}</Text>;
}

type NumPadKeyProps = {
  numPadKey: NumPadKey;
};

function NumPadKey({ numPadKey }: NumPadKeyProps) {
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

  return (
    <span className="inline-block size-6 rounded-sm border border-neutral-500 text-center">
      <span>{name}</span>
      <span className="text-secondary align-super text-xs dark:text-white">
        N
      </span>
    </span>
  );
}

type PunctuationKeyProps = {
  punctuationKey: PunctuationKey;
};

function PunctuationKey({ punctuationKey }: PunctuationKeyProps) {
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
    <span className="inline-block size-6 rounded-sm border border-neutral-500 text-center dark:border-neutral-400">
      {name}
    </span>
  );
}

type SpecialKeyProps = {
  specialKey: SpecialKey;
};

function SpecialKey({ specialKey }: SpecialKeyProps) {
  const name = useMemo<React.ReactNode>(() => {
    switch (specialKey) {
      case "Enter":
        return "enter";
      case "Escape":
        return "esc";
      case "Tab":
        return "tab";
      case "Space":
        return "space";
      case "PrintScreen":
        return "prscr";
      case "Insert":
        return "ins";
      case "Home":
        return "home";
      case "PageUp":
        return "pgup";
      case "Delete":
        return "del";
      case "End":
        return "end";
      case "PageDown":
        return "pgdn";
      case "NonUSBackslash":
        return "\\";

      case "NumPadEnter":
        return (
          <span>
            <span>enter</span>
            <span className="text-secondary align-super text-xs dark:text-white">
              N
            </span>
          </span>
        );
      case "Backspace":
        return <ArrowLeftFromLine />;
      case "NumLock":
        return <ArrowUp01 />;
      case "CapsLock":
        return <ArrowUpAZ />;
      case "ScrollLock":
        return (
          <span>
            <ChevronsUpDown />
            <Lock />
          </span>
        );
      case "Pause":
        return <Pause />;
      case "Right":
        return <MoveRight />;
      case "Left":
        return <MoveLeft />;
      case "Down":
        return <MoveDown />;
      case "Up":
        return <MoveUp />;
      case "Application":
        return <AppWindow />;
      case "Power":
        return <Power />;
    }
  }, [specialKey]);

  return (
    <span className="inline-block h-6 rounded-sm border border-neutral-500 text-center dark:border-neutral-400">
      {name}
    </span>
  );
}
