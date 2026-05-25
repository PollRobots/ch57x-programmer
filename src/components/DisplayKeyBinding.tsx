import React, { Suspense } from "react";

import { KeyChord, Macro, modifiersToString } from "@model/keyboard";
import { useKeyboardLayout } from "@model/useKeyboardLayout";
import { Text } from "@ux/Typography";

export type DisplayKeyBindingProps = {
  macro: Macro;
};

export function DisplayKeyBinding({ macro }: DisplayKeyBindingProps) {
  return (
    <Suspense fallback="...">
      {macro.type == "Keyboard" && (
        <DisplayKeyboardMacro keyChords={macro.keyChords} />
      )}
      {macro.type == "Mouse" && <DisplayMouseMacro />}
      {macro.type == "Media" && <DisplayMediaMacro />}
    </Suspense>
  );
}

type DisplayKeyboardMacroProps = {
  keyChords: KeyChord[];
};

function DisplayKeyboardMacro({ keyChords }: DisplayKeyboardMacroProps) {
  return (
    <Text>
      {keyChords.flatMap((keyChord, i) =>
        i > 0
          ? [
              <span key={`comma${i}`}>, </span>,
              <DisplayKeyChord key={i} {...keyChord} />,
            ]
          : [<DisplayKeyChord key={i} {...keyChord} />]
      )}
    </Text>
  );
}

function DisplayKeyChord({ modifiers, code }: KeyChord) {
  const { getCodeName } = useKeyboardLayout();
  const modifierString = React.useMemo(
    () => modifiersToString(modifiers),
    [modifiers]
  );
  const codeDisplay = React.useMemo(() => {
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
        <span className="inline-block size-6 rounded-sm border border-neutral-500">
          {codeName.toLocaleUpperCase()}
        </span>
      );
    }
    return codeName;
  }, [code, getCodeName]);

  return code === undefined ? (
    modifierString
  ) : (
    <>
      {modifierString && `${modifierString} + `}
      {codeDisplay}
    </>
  );
}

function DisplayMediaMacro() {
  return "media";
}

function DisplayMouseMacro() {
  return "mouse";
}
