import React, { useCallback, useMemo, useState } from "react";

import { isWellKnownCode, wellKnownCodeFromValue } from "@model/key_codes";
import { codeValue } from "@model/keyboard";
import { useKeyboardLayout } from "@model/useKeyboardLayout";
import { Expando } from "@ux/Expando";
import { Input } from "@ux/Input";
import { H4, Text } from "@ux/Typography";

import { KeyCode } from "../../KeyCode";
import { displayKey, KeyboardSectionProps } from "./KeyboardSection";

export function KeyboardCode({ selectedChord, onClick }: KeyboardSectionProps) {
  const { getCodeName } = useKeyboardLayout();
  const chordValue = useMemo(
    () =>
      selectedChord && selectedChord.code !== undefined
        ? `0x${codeValue(selectedChord.code).toString(16).padStart(2, "0")}`
        : "-",
    [selectedChord]
  );
  const [editedValue, setEditedValue] = useState<string | undefined>();

  const updateValue = useCallback((value: string) => {
    const number = Number(value);
    if (Number.isInteger(number) && number >= 0 && number <= 255) {
      const wellKnownCode = wellKnownCodeFromValue(number);
      if (wellKnownCode) {
        onClick(wellKnownCode);
      } else {
        onClick(number);
      }
      setEditedValue(value);
      return;
    }
    setEditedValue(value);
  }, []);

  return (
    <Expando
      defaultOpen
      collapseDirection="up"
      title={<H4>Key details</H4>}
      openContent={
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Text className="w-32">HID code:</Text>
            <Input
              className="w-32 bg-neutral-200 tabular-nums dark:bg-neutral-700"
              size="md"
              value={editedValue ?? chordValue}
              onChange={e => updateValue(e.target.value)}
              onBlur={() => setEditedValue(undefined)}
            />
            {selectedChord && selectedChord.code && (
              <KeyCode code={selectedChord.code} className={displayKey()} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Text className="w-32">Browser name:</Text>
            <Text className="min-w-32 rounded-lg bg-neutral-200 px-2 py-1 tabular-nums dark:bg-neutral-700">
              {selectedChord
                ? isWellKnownCode(selectedChord.code)
                  ? getCodeName(selectedChord.code)
                  : "<unknown>"
                : "-"}
            </Text>
          </div>
        </div>
      }
    />
  );
}
