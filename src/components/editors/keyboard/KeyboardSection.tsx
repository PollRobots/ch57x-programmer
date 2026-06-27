import { cva } from "class-variance-authority";

import { Code, KeyChord, Modifier } from "@model/keyboard";

export type KeyboardSectionProps = {
  selectedChord: KeyChord | undefined;
  onClick: (code: Code | Modifier) => void;
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

export const keyboardSection = cva("flex flex-col gap-2");
