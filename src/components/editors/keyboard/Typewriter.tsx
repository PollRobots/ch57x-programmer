import React from "react";

import { WellKnownCode } from "@model/key_codes";
import { isModifier, Modifier } from "@model/keyboard";
import { H4 } from "@ux/Typography";

import { KeyCode } from "../../KeyCode";
import {
  displayKey,
  keyboardSection,
  KeyboardSectionProps,
} from "./KeyboardSection";

// prettier-ignore
const TYPEWRITER_ROWS: (WellKnownCode|Modifier|"gap")[][] = [
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

export function Typewriter({ selectedChord, onClick }: KeyboardSectionProps) {
  return (
    <div className={keyboardSection()}>
      <H4>Keyboard</H4>
      {TYPEWRITER_ROWS.map((row, i) => {
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
