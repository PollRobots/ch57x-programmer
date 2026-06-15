import { Radio, RadioGroup, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { twJoin } from "tailwind-merge";



import { isFunctionKey, isNumPadKey, NumPadKey, WELL_KNOWN_CODES, WellKnownCode } from "@model/key_codes";
import { isModifier, KeyBinding, KeyChord, Macro, Modifier } from "@model/keyboard";
import { useKeyboardLayout } from "@model/useKeyboardLayout";
import { Button } from "@ux/Button";
import { Expando } from "@ux/Expando";
import { H3, H4, Text } from "@ux/Typography";



import { DisplayKeyBinding, DisplayKeyChord } from "./DisplayKeyBinding";
import { DisplayNumPadKey, KeyCode } from "./KeyCode";


export type EditKeyProps = {
  initialBinding: KeyBinding | undefined;
  updatedMacro: Macro | undefined;
  onChange: (updatedMacro: Macro | undefined) => void;
};

export function EditKey({
  initialBinding,
  updatedMacro,
  onChange,
}: EditKeyProps) {
  const workingMacro = React.useMemo<Macro>(() => {
    if (updatedMacro) {
      return updatedMacro;
    }
    if (initialBinding) {
      return initialBinding.expansion;
    }
    return {
      type: "Keyboard",
      options: {
        delay: 0,
      },
      keyChords: [],
    };
  }, [updatedMacro, initialBinding]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-baseline gap-2">
        <H3>Edit binding</H3>
        <div className="flex-1" />
        <Text strong>Current binding:</Text>
        {initialBinding ? (
          <DisplayKeyBinding macro={initialBinding.expansion} />
        ) : (
          "None"
        )}
      </div>
      <MacroEditor macro={workingMacro} onChange={onChange} />
    </div>
  );
}

type MacroEditorProps = {
  macro: Macro;
  onChange: (update: Macro) => void;
};

const MACRO_TYPES = ["Keyboard", "Media", "Mouse"];

function MacroEditor({ macro, onChange }: MacroEditorProps) {
  return (
    <TabGroup defaultIndex={MACRO_TYPES.indexOf(macro.type)}>
      <TabList className="flex flex-row">
        {({ selectedIndex }) => (
          <>
            {MACRO_TYPES.map((label, i) => (
              <Tab
                key={i}
                className={twJoin(
                  "px-2 py-1",
                  "border",
                  selectedIndex === i
                    ? "border-t-neutral-300 border-r-neutral-300 border-b-transparent border-l-neutral-300 bg-neutral-50"
                    : "border-t-transparent border-r-transparent border-b-neutral-300 border-l-transparent"
                )}
              >
                <Text size="lg"> {label} </Text>
              </Tab>
            ))}
            <div className="flex-1 border-b border-b-neutral-300" />
          </>
        )}
      </TabList>
      <TabPanels className="border-r border-b border-l border-neutral-300 bg-neutral-50 shadow-md">
        <TabPanel>
          <KeyboardEditor
            keyChords={macro.type === "Keyboard" ? macro.keyChords : []}
            onUpdatedKeyChords={update =>
              onChange({
                type: "Keyboard",
                options: { delay: 0 },
                keyChords: update,
              })
            }
          />
        </TabPanel>
        <TabPanel>Media</TabPanel>
        <TabPanel>Mouse</TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

type KeyboardEditorProps = {
  keyChords: KeyChord[];
  onUpdatedKeyChords: (update: KeyChord[]) => void;
};

function KeyboardEditor({ keyChords }: KeyboardEditorProps) {
  const [selectedKey, setSelectedKey] = useState(0);
  const selectedChord = keyChords[selectedKey];

  return (
    <div className="flex flex-col gap-2 p-2">
      <Text strong>Key sequence</Text>
      <Text size="sm" className="text-secondary">
        This is the current sequence bound to this key
      </Text>
      <RadioGroup
        value={selectedKey}
        onChange={setSelectedKey}
        className="flex flex-row flex-wrap gap-1"
      >
        {keyChords.map((keyChord, i) => (
          <Radio
            value={i}
            className={twJoin(
              "flex min-h-16 min-w-16 place-items-center",
              "text-secondary hover:text-default grid border p-1",
              "place-items-center rounded-md border-neutral-200 hover:border-neutral-400",
              "bg-linear-to-b from-neutral-50 via-neutral-100 to-neutral-200 hover:via-indigo-100"
            )}
          >
            <DisplayKeyChord key={i} {...keyChord} />
          </Radio>
        ))}
        {keyChords.length < 18 && (
          <Button
            variant="invisible"
            className="border-tertiary inline-flex min-h-16 min-w-16 flex-col items-center justify-center border border-dotted"
          >
            <Plus />
            <Text size="sm">Add</Text>
          </Button>
        )}
      </RadioGroup>
      <div className="flex flex-wrap justify-start gap-4">
        <AlNumKeys selectedChord={selectedChord} />
        <ArrowKeysEtc selectedChord={selectedChord} />
        <NumPadKeys selectedChord={selectedChord} />
      </div>
      <AllKeys selectedChord={selectedChord} />
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
};

const displayKey = cva("", {
  variants: {
    selectedCode: {
      true: "bg-amber-200",
      false: null,
    },
    selectedModifier: {
      true: "bg-violet-200",
      false: null,
    },
  },
});

function AlNumKeys({ selectedChord }: KeyboardSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <H4>Keyboard</H4>
      {ALNUM_ROWS.map((row, i) => {
        return (
          <div key={i} className="flex flex-row justify-between gap-1">
            {row.map((code, j) => {
              if (code === "gap") {
                return <div />;
              }
              return (
                <KeyCode
                  key={code}
                  code={code}
                  className={displayKey({
                    selectedCode: selectedChord?.code === code,
                    selectedModifier:
                      isModifier(code) &&
                      (selectedChord?.modifiers ?? []).includes(code),
                    className: CUSTOM_WIDTHS.get(`${j},${i}`),
                  })}
                />
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
      true: "col-span-2 w-auto",
      false: null,
    },
    tall: {
      true: "row-span-2 h-auto",
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
function NumPadKeys({ selectedChord }: KeyboardSectionProps) {
  return (
    <div className="grid grid-cols-4 gap-1">
      <H4 size="md" className="col-span-4">
        Number pad
      </H4>
      <div className="col-span-4 min-h-7" />
      {NUMPAD_KEYS.map(({ code, wide, tall }) =>
        isNumPadKey(code) ? (
          <DisplayNumPadKey
            key={code}
            numPadKey={code}
            simple
            className={displayKey({
              selectedCode: selectedChord?.code === code,
              className: numpadkeys({ wide, tall }),
            })}
          />
        ) : (
          <KeyCode
            key={code}
            code={code}
            simple
            className={displayKey({
              selectedCode: selectedChord?.code === code,
              className: numpadkeys({ wide, tall }),
            })}
          />
        )
      )}
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

function ArrowKeysEtc({ selectedChord }: KeyboardSectionProps) {
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
          <KeyCode
            key={code}
            code={code}
            className={displayKey({
              selectedCode: selectedChord?.code === code,
            })}
          />
        );
      })}
    </div>
  );
}

function AllKeys({ selectedChord }: KeyboardSectionProps) {
  const { getKeyName, isFallback } = useKeyboardLayout();
  const sortedCodes = useMemo(() => {
    if (isFallback) {
      const codes = [...WELL_KNOWN_CODES];
      codes.sort((a, b) => {
        const lengthDelta = a.length - b.length;
        if (lengthDelta !== 0 && (a.length === 1 || b.length === 1)) {
          return lengthDelta;
        }
        if (isFunctionKey(a) && isFunctionKey(b)) {
          return Number(a.slice(1)) - Number(b.slice(1));
        }
        return a.localeCompare(b);
      });
      return codes;
    }
    const codes = WELL_KNOWN_CODES.map<[WellKnownCode, string]>(code => [
      code,
      getKeyName(code) ?? code,
    ]);
    codes.sort(([_a, a], [_b, b]) => {
      const lengthDelta = a.length - b.length;
      if (lengthDelta !== 0 && (a.length === 1 || b.length === 1)) {
        return lengthDelta;
      }
      if (isFunctionKey(a) && isFunctionKey(b)) {
        return Number(a.slice(1)) - Number(b.slice(1));
      }
      return a.localeCompare(b);
    });
    return codes.map(([code, _]) => code);
  }, [getKeyName, isFallback]);

  return (
    <Expando collapseDirection="up" title={<H4>Common keys</H4>} openContent={
    <div className="flex max-w-120 flex-wrap gap-2">
      {sortedCodes.map(code => (
        <KeyCode
          key={code}
          code={code}
          className={displayKey({
            selectedCode: selectedChord?.code === code,
          })}
        />
      ))}
    </div>
    } />
  );
}