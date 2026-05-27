import { MousePointerClick, RotateCcw, RotateCw } from "lucide-react";
import React from "react";

import { KeyBinding, KeyboardDeviceType, keysAreEqual } from "@model/keyboard";
import { H3 } from "@ux/Typography";

import { KeyLayout } from "./Configuration";
import { KeyboardKey } from "./KeyboardKey";

export type LayerProps = {
  layer: number;
  keyLayout: KeyLayout;
  keyBindings: KeyBinding[];
  keyboardDeviceType: KeyboardDeviceType;
  selectedBinding: Pick<KeyBinding, "key" | "layer">;
  onSelectBinding: (binding: Pick<KeyBinding, "key" | "layer">) => void;
};

export function Layer({
  layer,
  keyBindings,
  keyLayout,
  keyboardDeviceType,
  onSelectBinding,
  selectedBinding,
}: LayerProps) {
  return (
    <div className="flex flex-col gap-4">
      <H3>Layer {layer + 1}</H3>
      <div className="mt-2 flex flex-row gap-8">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${keyLayout.columns}, 8rem)`,
          }}
        >
          {Array(keyboardDeviceType.buttons)
            .fill(null)
            .map((_, i) => {
              const binding = keyBindings.find(binding => binding.key === i);
              return (
                <KeyboardKey
                  as="button"
                  key={i}
                  className="size-32"
                  macro={binding?.expansion}
                  origin={binding?.origin ?? "placeholder"}
                  onClick={() => onSelectBinding({ key: i, layer: layer })}
                  selected={
                    selectedBinding.layer === layer &&
                    keysAreEqual(selectedBinding.key, i)
                  }
                />
              );
            })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {}
          <RotateCcw className="justify-self-center text-neutral-400" />
          <MousePointerClick className="justify-self-center text-neutral-400" />
          <RotateCw className="justify-self-center text-neutral-400" />
          {Array(keyboardDeviceType.encoders)
            .fill(null)
            .flatMap((_, i) => {
              const ccw = keyBindings.find(
                ({ key }) =>
                  Array.isArray(key) && key[0] === i && key[1] === "ccw"
              );
              const press = keyBindings.find(
                ({ key }) =>
                  Array.isArray(key) && key[0] === i && key[1] === "press"
              );
              const cw = keyBindings.find(
                ({ key }) =>
                  Array.isArray(key) && key[0] === i && key[1] === "cw"
              );
              return [
                <KeyboardKey
                  as="button"
                  key={`${i}.ccw`}
                  className="size-32"
                  variant="encoder-ccw"
                  macro={ccw?.expansion}
                  origin={ccw?.origin ?? "placeholder"}
                  onClick={() =>
                    onSelectBinding({
                      key: [i, "ccw"],
                      layer: layer,
                    })
                  }
                  selected={
                    selectedBinding.layer === layer &&
                    keysAreEqual(selectedBinding.key, [i, "ccw"])
                  }
                />,
                <KeyboardKey
                  as="button"
                  key={`${i}.press`}
                  className="size-32"
                  variant="encoder"
                  macro={press?.expansion}
                  origin={press?.origin ?? "placeholder"}
                  onClick={() =>
                    onSelectBinding({
                      key: [i, "press"],
                      layer: layer,
                    })
                  }
                  selected={
                    selectedBinding.layer === layer &&
                    keysAreEqual(selectedBinding.key, [i, "press"])
                  }
                />,
                <KeyboardKey
                  as="button"
                  key={`${i}.cw`}
                  className="size-32"
                  variant="encoder-cw"
                  macro={cw?.expansion}
                  origin={cw?.origin ?? "placeholder"}
                  onClick={() =>
                    onSelectBinding({
                      key: [i, "cw"],
                      layer: layer,
                    })
                  }
                  selected={
                    selectedBinding.layer === layer &&
                    keysAreEqual(selectedBinding.key, [i, "cw"])
                  }
                />,
              ];
            })}
        </div>
      </div>
    </div>
  );
}
