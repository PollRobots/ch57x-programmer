import { cva, VariantProps } from "class-variance-authority";
import React from "react";

import { NumPadKey, WellKnownCode } from "@model/key_codes";
import { Button } from "@ux/Button";
import { H4 } from "@ux/Typography";

import { KeyCode } from "../../KeyCode";
import {
  displayKey,
  keyboardSection,
  KeyboardSectionProps,
} from "./KeyboardSection";
import { Typewriter } from "./Typewriter";

export function StandardLayout({
  selectedChord,
  onClick,
}: KeyboardSectionProps) {
  return (
    <div className="flex flex-wrap justify-start gap-4">
      <Typewriter selectedChord={selectedChord} onClick={onClick} />
      <ArrowKeysEtc selectedChord={selectedChord} onClick={onClick} />
      <NumPadKeys selectedChord={selectedChord} onClick={onClick} />
    </div>
  );
}

const numpadkeys = cva("", {
  variants: {
    wide: {
      true: "col-span-2",
      false: null,
    },
    tall: {
      true: "row-span-2",
      false: null,
    },
  },
});
const numpadkeysinner = cva("", {
  variants: {
    wide: {
      true: "w-full",
      false: null,
    },
    tall: {
      true: "h-full",
      false: null,
    },
  },
});

type NumPadKeyDef = {
  code: NumPadKey | "NumLock" | "NumPadEnter";
} & VariantProps<typeof numpadkeys>;

// prettier-ignore
const NUMPAD_KEYS: NumPadKeyDef[] = [
  {code: "NumLock"}, {code: "NumPadSlash"}, {code: "NumPadAsterisk"}, {code: "NumPadMinus"},
  {code: "NumPad7"}, {code: "NumPad8"}, {code: "NumPad9"}, {code: "NumPadPlus", tall: true},
  {code: "NumPad4"}, {code: "NumPad5"}, {code: "NumPad6"},
  {code: "NumPad1"}, {code: "NumPad2"}, {code: "NumPad3"}, {code: "NumPadEnter", tall: true},
  {code: "NumPad0", wide: true}, {code: "NumPadDot"},
];

function NumPadKeys({ selectedChord, onClick }: KeyboardSectionProps) {
  return (
    <div className={keyboardSection()}>
      <H4 size="md" className="h-7">
        Number pad
      </H4>
      <div className="grid grid-cols-4 gap-x-1 gap-y-2">
        <div className="col-span-4 h-7" />
        {NUMPAD_KEYS.map(({ code, wide, tall }) => {
          const keyCode = (
            <KeyCode
              code={code}
              simple
              className={displayKey({
                selectedCode: selectedChord?.code === code,
                className: numpadkeysinner({ wide, tall }),
              })}
            />
          );
          return (
            <Button
              key={code}
              description={code === "NumLock" ? "Numlock" : undefined}
              onClick={() => onClick(code)}
              className={numpadkeys({ wide, tall, className: "p-0" })}
              variant="none"
            >
              {keyCode}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// prettier-ignore
const ARROW_KEYS_ETC : (WellKnownCode|"blank-line"|"empty")[] = [
  "blank-line",
  "Insert", "Home", "PageUp",
  "Delete", "End",  "PageDown",
  "blank-line",
  "empty",  "Up",   "empty",
  "Left",   "Down", "Right",
]

function ArrowKeysEtc({ selectedChord, onClick }: KeyboardSectionProps) {
  return (
    <div className={keyboardSection()}>
      <H4 size="md" className="h-7">
        Navigation
      </H4>
      <div className="grid grid-cols-3 grid-rows-5 gap-x-1 gap-y-2">
        {ARROW_KEYS_ETC.map((code, i) => {
          if (code === "blank-line") {
            return <div key={i} className="col-span-3" />;
          }
          if (code === "empty") {
            return <div key={i} />;
          }
          return (
            <Button
              key={code}
              description={
                code.startsWith("Page") ? `Page ${code.slice(4)}` : code
              }
              onClick={() => onClick(code)}
              variant="none"
              className="p-0"
            >
              <KeyCode
                code={code}
                simple
                className={displayKey({
                  selectedCode: selectedChord?.code === code,
                })}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
