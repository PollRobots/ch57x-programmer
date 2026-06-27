import React, { useMemo } from "react";

import {
  isFunctionKey,
  WELL_KNOWN_CODES,
  WellKnownCode,
  wellKnownCodeValue,
} from "@model/key_codes";
import { useKeyboardLayout } from "@model/useKeyboardLayout";
import { Expando } from "@ux/Expando";
import { H4 } from "@ux/Typography";

import { KeyCode } from "../../KeyCode";
import { displayKey, KeyboardSectionProps } from "./KeyboardSection";

export function AllKeys({ selectedChord, onClick }: KeyboardSectionProps) {
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
