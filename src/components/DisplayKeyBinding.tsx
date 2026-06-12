import React, { useMemo } from "react";

import {
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
      {isMediaEvent(macro) && <DisplayMediaMacro />}
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
  const { getCodeName } = useKeyboardLayout();
  const modifierString = useMemo(
    () => modifiersToString(modifiers),
    [modifiers]
  );
  const modifierList = useMemo(
    () => modifiersToCanonical(modifiers),
    [modifiers]
  );
  const codeDisplay = useMemo(() => {
    if (code === undefined) {
      return null;
    }
    if (typeof code === "number") {
      return <Text className="tabular-nums">0x{code.toString(16)}</Text>;
    }
    const codeName = getCodeName(code);
    if (codeName === undefined) {
      return null;
    }
    if (codeName.length === 1) {
      return (
        <span className="inline-block size-6 rounded-sm border border-neutral-500 text-center">
          {codeName.toLocaleUpperCase()}
        </span>
      );
    }
    return codeName;
  }, [code, getCodeName]);

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
      <Text>{codeDisplay}</Text>
    </div>
  );
}

function DisplayMediaMacro() {
  return "media";
}

function DisplayMouseMacro() {
  return "mouse";
}
