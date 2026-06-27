import { Radio, RadioGroup } from "@headlessui/react";
import { cva } from "class-variance-authority";
import { Minus, Plus, Save } from "lucide-react";
import React, { useCallback, useState } from "react";

import { Code, isModifier, KeyChord, Modifier } from "@model/keyboard";
import { Button } from "@ux/Button";
import { Text } from "@ux/Typography";

import { DisplayKeyChord } from "../DisplayKeyBinding";
import { AllKeys } from "./keyboard/AllKeys";
import { KeyboardCode } from "./keyboard/KeyboardCode";
import { StandardLayout } from "./keyboard/StandardLayout";

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
    (code: Code | Modifier) => {
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
      <StandardLayout selectedChord={selectedChord} onClick={onKeyClick} />
      <AllKeys selectedChord={selectedChord} onClick={onKeyClick} />
      <KeyboardCode selectedChord={selectedChord} onClick={onKeyClick} />
    </div>
  );
}
