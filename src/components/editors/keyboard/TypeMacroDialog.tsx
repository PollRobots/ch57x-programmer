import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
} from "@headlessui/react";
import { ReplaceAll, SquarePlus, Trash2 } from "lucide-react";
import React, { useCallback, useState } from "react";

import { LayerDiv } from "@hooks/useLayer";
import { useValueChange } from "@hooks/useValueChange";
import {
  isKeyboardEventCode,
  isWellKnownCode,
  lookupKeyboardEventCode,
} from "@model/key_codes";
import { isModifier, KeyChord, Modifier } from "@model/keyboard";
import { Button } from "@ux/Button";
import { Input } from "@ux/Input";
import { RadioOption, SimpleRadio } from "@ux/SimpleRadio";
import { H3, Text } from "@ux/Typography";

export type TypeMacroDialogProps = {
  initialValue: KeyChord[];
  show: boolean;
  limit: number;
  onClose: () => void;
  onTyped: (macro: KeyChord[]) => void;
};

type CaptureMode = "append" | "replace";

const MODE_OPTIONS: RadioOption<CaptureMode>[] = [
  {
    label: "Append",
    value: "append",
    description:
      "Typed characters will be added to the end of the current sequence",
    icon: selected => <SquarePlus className={selected ? "size-6" : "size-4"} />,
  },
  {
    label: "Replace",
    value: "replace",
    description: "Typed characters will be replace the current sequence",
    icon: selected => <ReplaceAll className={selected ? "size-6" : "size-4"} />,
  },
];

export function TypeMacroDialog({
  initialValue,
  show,
  limit,
  onClose,
  onTyped,
}: TypeMacroDialogProps) {
  const [keyChords, setKeyChords] = useState<KeyChord[]>(initialValue);
  const [modifiers, setModifiers] = useState<Set<Modifier>>(new Set());
  const [mode, setMode] = useState<CaptureMode>("replace");

  useValueChange(initialValue, setKeyChords);

  const sequence = keyChords
    .map(chord => {
      if (chord.code === undefined) {
        return "";
      }
      if (isWellKnownCode(chord.code)) {
        return chord.code;
      }
      return `0x${chord.code.toString(16)}`;
    })
    .join(" ");

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const code = event.code;
      if (isKeyboardEventCode(code)) {
        const value = lookupKeyboardEventCode(code);
        if (isWellKnownCode(value)) {
          console.log("Code:", value);
        } else if (isModifier(value)) {
          setModifiers(prev => {
            if (prev.has(value)) {
              return prev;
            }
            return new Set([...prev, value]);
          });
        } else {
          console.warn("Unknown key:", code, value);
        }
      }
    },
    []
  );
  const onKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const code = event.code;
      if (isKeyboardEventCode(code)) {
        const value = lookupKeyboardEventCode(code);
        if (isWellKnownCode(value)) {
          setKeyChords(prev => {
            if (prev.length >= limit) {
              return prev;
            }
            const keyChord: KeyChord = {
              code: value,
              modifiers: [...modifiers],
            };
            return [...prev, keyChord];
          });
        } else if (isModifier(value)) {
          setModifiers(prev => {
            if (prev.has(value)) {
              const update = new Set([...prev]);
              update.delete(value);
              return update;
            }
            return prev;
          });
        } else {
          console.warn("Unknown key:", code, value);
        }
      }
    },
    [limit, modifiers]
  );

  return (
    <Dialog open={show} onClose={onClose} className="relative z-50">
      <LayerDiv className="fixed inset-0 flex w-screen items-center p-12">
        <DialogPanel className="mx-auto flex max-w-xl flex-col gap-2 rounded-xl border border-neutral-500 bg-white p-6 shadow-xl dark:border-neutral-400 dark:bg-neutral-900 dark:text-white">
          <DialogTitle as={H3} strong>
            Capture key sequence
          </DialogTitle>
          <Field className="flex flex-col gap-1">
            <Label as={Text} size="sm" strong>
              Type a key sequence
            </Label>
            <Description
              as={Text}
              size="sm"
              className="text-secondary dark:text-white"
            >
              The key sequence to be bound to the key
            </Description>
            <Input
              name="key_sequence_name"
              type="text"
              readOnly
              placeholder="Key sequence…"
              value={sequence}
              size="md"
              className="mt-2"
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
              onFocus={() => {
                if (mode === "replace") {
                  setKeyChords([]);
                }
              }}
              onBlur={() =>
                setModifiers(prev => (prev.size === 0 ? prev : new Set()))
              }
            />
          </Field>
          <div className="flex gap-4">
            <SimpleRadio
              value={MODE_OPTIONS.find(({ value }) => value === mode)!}
              options={MODE_OPTIONS}
              orientation="horizontal"
              onChange={update => setMode(update.value)}
            />
            <Button
              disabled={keyChords.length === 0}
              onClick={() => setKeyChords([])}
              className="ml-auto flex gap-2"
            >
              <Trash2 />
              Clear
            </Button>
            <Button onClick={onClose} variant="default">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onClose();
                setKeyChords([]);
                onTyped(keyChords);
              }}
              variant="primary"
              disabled={keyChords.length === 0}
            >
              Add
            </Button>
          </div>
        </DialogPanel>
      </LayerDiv>
    </Dialog>
  );
}
