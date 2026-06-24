import { Radio, RadioGroup } from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Minus, Plus, Save } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import {
  isFunctionKey,
  NumPadKey,
  WELL_KNOWN_CODES,
  WellKnownCode,
  wellKnownCodeValue,
} from "@model/key_codes";
import { isModifier, KeyChord, Modifier } from "@model/keyboard";
import { useKeyboardLayout } from "@model/useKeyboardLayout";
import { Button } from "@ux/Button";
import { Expando } from "@ux/Expando";
import { Tooltip } from "@ux/Tooltip";
import { H4, Text } from "@ux/Typography";

import { DisplayKeyChord } from "../DisplayKeyBinding";
import { KeyCode } from "../KeyCode";

export type KeyboardEditorProps = {
  keyChords: KeyChord[];
  onUpdatedKeyChords: (update: KeyChord[]) => void;
  edited: boolean;
  commit: () => void;
  maxKeySequence: number;
};

const sequencekey = cva(
  [
    "min-h-16 min-w-16 place-items-center grid p-1",
    "text-secondary hover:text-default",
    "dark:text-white dark:hover:text-white",
    "place-items-center rounded-md bg-linear-to-b",
    "from-neutral-50 via-neutral-100 ",
    "dark:from-neutral-900 dark:via-neutral-800 dark:hover:via-indigo-800",
  ],
  {
    variants: {
      selected: {
        true: [
          "border-2",
          "to-indigo-200 dark:to-indigo-700",
          "border-neutral-600 hover:border-neutral-800",
          "dark:border-neutral-300 dark:hover:border-neutral-100",
        ],
        false: [
          "border",
          "to-neutral-200 dark:to-neutral-700",
          "border-neutral-200 hover:border-neutral-400",
          "dark:border-neutral-700 dark:hover:border-neutral-500",
        ],
      },
    },
  }
);

export const editkey = cva(
  [
    "text-secondary hover:text-default",
    "dark:text-white dark:hover:text-white",
    "border-neutral-200 hover:border-neutral-400",
    "dark:border-neutral-700 dark:hover:border-neutral-500",
    "inline-flex min-h-16 min-w-16 flex-col items-center justify-center",
  ],
  {
    variants: { dashed: { true: "border-2 border-dashed", false: "border" } },
  }
);

export function KeyboardEditor({
  keyChords,
  onUpdatedKeyChords,
  commit,
  edited,
  maxKeySequence,
}: KeyboardEditorProps) {
  const [selectedKey, setSelectedKey] = useState(0);
  const selectedChord = keyChords[selectedKey];

  const onKeyClick = useCallback(
    (code: WellKnownCode | Modifier) => {
      const updated = [...keyChords];

      while (updated.length <= selectedKey) {
        updated.push({ modifiers: [] });
      }

      const modified = { ...(updated[selectedKey] ?? { modifiers: [] }) };
      if (isModifier(code)) {
        const updatedModifiers = [...modified.modifiers];
        const index = updatedModifiers.indexOf(code);
        if (index < 0) {
          updatedModifiers.push(code);
        } else {
          updatedModifiers.splice(index, 1);
        }
        modified.modifiers = updatedModifiers;
      } else {
        modified.code = code;
      }
      updated[selectedKey] = modified;

      onUpdatedKeyChords(updated);
    },
    [keyChords, onUpdatedKeyChords, selectedKey]
  );

  const addKeyChord = useCallback(() => {
    const updated = [...keyChords];
    updated.push({ modifiers: [] });
    onUpdatedKeyChords(updated);
    setSelectedKey(updated.length - 1);
  }, [keyChords, onUpdatedKeyChords]);

  const removeKeyChord = useCallback(() => {
    const updated = [...keyChords];
    updated.splice(selectedKey, 1);
    onUpdatedKeyChords(updated);
    setSelectedKey(Math.min(selectedKey, updated.length - 1));
  }, [keyChords, selectedKey, onUpdatedKeyChords]);

  return (
    <div className="flex min-w-184 flex-col gap-2 p-2">
      <Text strong>Key sequence</Text>
      <Text
        size="sm"
        className={
          edited
            ? "text-red-700 dark:text-red-500"
            : "text-secondary dark:text-white"
        }
      >
        {edited
          ? "This is the edited sequence, not yet bound to this key"
          : "This is the current sequence bound to this key"}
      </Text>
      <RadioGroup
        value={selectedKey}
        onChange={setSelectedKey}
        className="flex flex-row flex-wrap gap-1"
      >
        {keyChords.map((keyChord, i) => (
          <Radio value={i} as={React.Fragment}>
            <div className={sequencekey({ selected: i === selectedKey })}>
              <DisplayKeyChord key={i} {...keyChord} />
            </div>
          </Radio>
        ))}
        {keyChords.length < maxKeySequence && (
          <Button
            variant="invisible"
            className={editkey({ dashed: true })}
            onClick={addKeyChord}
          >
            <Plus />
          </Button>
        )}
        {keyChords.length > 0 &&
          selectedKey >= 0 &&
          selectedKey < keyChords.length && (
            <Button
              variant="invisible"
              className={editkey({ dashed: true })}
              onClick={removeKeyChord}
            >
              <Minus />
            </Button>
          )}
        {edited && (
          <Button
            variant="invisible"
            className={editkey({ dashed: false })}
            onClick={commit}
          >
            <Save />
          </Button>
        )}
      </RadioGroup>
      <div className="flex flex-wrap justify-start gap-4">
        <AlNumKeys selectedChord={selectedChord} onClick={onKeyClick} />
        <ArrowKeysEtc selectedChord={selectedChord} onClick={onKeyClick} />
        <NumPadKeys selectedChord={selectedChord} onClick={onKeyClick} />
      </div>
      <AllKeys selectedChord={selectedChord} onClick={onKeyClick} />
    </div>
  );
}

// prettier-ignore
const ALNUM_ROWS: (WellKnownCode|Modifier|"gap")[][] = [
  ["Escape", "gap", "F1", "F2", "F3", "F4", "gap", "F5", "F6", "F7", "F8", "gap", "F9", "F10", "F11", "F12", "Power"],
  ["Grave", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Minus", "Equal", "Backspace"],
     ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "LeftBracket", "RightBracket", "Backslash"],
 ["CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Semicolon", "Quote", "Enter"],
     ["Shift", "Z", "X", "C", "V", "B", "N", "M", "Comma", "Dot", "Slash", "RightShift"],
     ["Ctrl", "Meta", "Alt", "Space", "RightAlt", "RightMeta", "RightCtrl"],
]

const CUSTOM_WIDTHS = new Map<string, string>([
  ["13,1", "min-w-9"],
  ["0,2", "flex-1"],
  ["0,3", "flex-1"],
  ["12,3", "flex-1"],
  ["0,4", "flex-1"],
  ["11,4", "flex-1"],
  ["0,5", "flex-1"],
  ["3,5", "flex-6"],
  ["6,5", "flex-1"],
]);

type KeyboardSectionProps = {
  selectedChord: KeyChord | undefined;
  onClick: (code: WellKnownCode | Modifier) => void;
};

export const displayKey = cva("", {
  variants: {
    selectedCode: {
      true: "bg-amber-500/30",
      false: null,
    },
    selectedModifier: {
      true: "bg-violet-500/30",
      false: null,
    },
  },
});

function AlNumKeys({ selectedChord, onClick }: KeyboardSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <H4>Keyboard</H4>
      {ALNUM_ROWS.map((row, i) => {
        return (
          <div key={i} className="flex flex-row justify-between gap-1">
            {row.map((code, j) => {
              if (code === "gap") {
                return <div key={`${i}.${j}`} />;
              }
              return (
                <button
                  key={code}
                  className={CUSTOM_WIDTHS.get(`${j},${i}`)}
                  onClick={() => onClick(code)}
                >
                  <KeyCode
                    code={code}
                    className={displayKey({
                      selectedCode: selectedChord?.code === code,
                      selectedModifier:
                        isModifier(code) &&
                        (selectedChord?.modifiers ?? []).includes(code),
                      className: CUSTOM_WIDTHS.has(`${j},${i}`) && "w-full",
                    })}
                  />
                </button>
              );
            })}
          </div>
        );
      })}
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
    <div className="grid grid-cols-4 gap-1">
      <H4 size="md" className="col-span-4">
        Number pad
      </H4>
      <div className="col-span-4 min-h-7" />
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
        if (code === "NumLock") {
          return (
            <Tooltip key={code} content="Numlock">
              <button
                onClick={() => onClick(code)}
                className={numpadkeys({ wide, tall })}
              >
                {keyCode}
              </button>
            </Tooltip>
          );
        }
        return (
          <button
            key={code}
            onClick={() => onClick(code)}
            className={numpadkeys({ wide, tall })}
          >
            {keyCode}
          </button>
        );
      })}
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
    <div className="grid grid-cols-3 gap-1">
      <H4 size="md" className="col-span-3">
        Navigation
      </H4>
      {ARROW_KEYS_ETC.map((code, i) => {
        if (code === "blank-line") {
          return <div key={i} className="col-span-3 h-7" />;
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
            variant="invisible"
            className="p-0"
          >
            <KeyCode
              code={code}
              className={displayKey({
                selectedCode: selectedChord?.code === code,
              })}
            />
          </Button>
        );
      })}
    </div>
  );
}

function AllKeys({ selectedChord, onClick }: KeyboardSectionProps) {
  const { getKeyName, isFallback } = useKeyboardLayout();
  const sortedCodes = useMemo(() => {
    if (isFallback) {
      const codes = [...WELL_KNOWN_CODES];
      codes.sort((a, b) => {
        const lengthDelta = a.length - b.length;
        if (a.length === 1 || b.length === 1) {
          if (lengthDelta !== 0) {
            return lengthDelta;
          }
          return a.localeCompare(b);
        }
        if (isFunctionKey(a) && isFunctionKey(b)) {
          return Number(a.slice(1)) - Number(b.slice(1));
        } else if (isFunctionKey(a)) {
          return -1;
        } else if (isFunctionKey(b)) {
          return 1;
        }
        return wellKnownCodeValue(a) - wellKnownCodeValue(b);
      });
      return codes;
    }
    const codes = WELL_KNOWN_CODES.map<[WellKnownCode, string]>(code => [
      code,
      getKeyName(code) ?? code,
    ]);
    codes.sort(([aCode, a], [bCode, b]) => {
      const lengthDelta = a.length - b.length;
      if (a.length === 1 || b.length === 1) {
        if (lengthDelta !== 0) {
          return lengthDelta;
        }
        return a.localeCompare(b);
      }
      if (isFunctionKey(a) && isFunctionKey(b)) {
        return Number(a.slice(1)) - Number(b.slice(1));
      } else if (isFunctionKey(a)) {
        return -1;
      } else if (isFunctionKey(b)) {
        return 1;
      }
      return wellKnownCodeValue(aCode) - wellKnownCodeValue(bCode);
    });
    return codes.map(([code, _]) => code);
  }, [getKeyName, isFallback]);

  return (
    <Expando
      collapseDirection="up"
      title={<H4>Common keys</H4>}
      openContent={
        <div className="flex max-w-120 flex-wrap gap-2">
          {sortedCodes.map(code => (
            <button onClick={() => onClick(code)}>
              <KeyCode
                key={code}
                code={code}
                className={displayKey({
                  selectedCode: selectedChord?.code === code,
                })}
              />
            </button>
          ))}
        </div>
      }
    />
  );
}
