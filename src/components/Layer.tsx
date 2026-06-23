import {
  Keyboard,
  MousePointerClick,
  RotateCcw,
  RotateCw,
  Trash2,
  Triangle,
} from "lucide-react";
import React, { useMemo } from "react";

import {
  KeyBinding,
  KeyBindingOrigin,
  KeyboardDeviceType,
  keysAreEqual,
} from "@model/keyboard";
import { Button } from "@ux/Button";
import { RadioOption, SimpleRadio } from "@ux/SimpleRadio";
import { H3, Text } from "@ux/Typography";

import { KeyboardKey } from "./KeyboardKey";
import { KeyLayout } from "./settings/SelectLayout";

export type LayerProps = {
  layer: number;
  keyLayout: KeyLayout;
  keyBindings: KeyBinding[];
  keyboardDeviceType: KeyboardDeviceType;
  selectedBinding: Pick<KeyBinding, "key" | "layer">;
  onSelectBinding: (binding: Pick<KeyBinding, "key" | "layer">) => void;
  originPreference: OriginPreference;
  onChangeOriginPreference: (update: OriginPreference) => void;
  onClearLayerEdits: (layer: number) => void;
  haveProfile: boolean;
  profileName: string;
};

export type OriginPreference =
  | Extract<KeyBindingOrigin, "device" | "profile">
  | "none";

export function Layer({
  layer,
  keyBindings,
  keyLayout,
  keyboardDeviceType,
  onSelectBinding,
  selectedBinding,
  originPreference,
  onChangeOriginPreference,
  onClearLayerEdits,
  haveProfile,
  profileName,
}: LayerProps) {
  const edits = useMemo(
    () => keyBindings.reduce((a, b) => a + (b.origin === "editor" ? 1 : 0), 0),
    [keyBindings]
  );
  const originOptions = useMemo<RadioOption<OriginPreference>[]>(
    () => [
      {
        value: "device",
        label: "Keyboard",
        description: "Show device bindings",
        icon: () => <Keyboard className="size-4" />,
      },
      {
        value: "profile",
        label: "Profile",
        description: `Show '${profileName}' profile bindings`,
        icon: () => <Triangle className="size-4" />,
      },
    ],
    [profileName]
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <H3>Layer {layer + 1}</H3>
        {edits > 0 && (
          <>
            <Text size="sm" className="text-red-700 dark:text-red-500">
              {edits === 1 ? "1 key edited" : `${edits} keys edited`}
            </Text>
            <Button
              size="sm"
              className="flex flex-row items-center gap-2"
              onClick={() => onClearLayerEdits(layer)}
            >
              <Trash2 className="size-3" />
              <Text size="sm">Clear</Text>
            </Button>
          </>
        )}
        {haveProfile && (
          <SimpleRadio
            value={
              originOptions.find(({ value }) => value === originPreference) ?? {
                value: originPreference,
                label: originPreference,
              }
            }
            options={originOptions}
            onChange={update => onChangeOriginPreference(update.value)}
            className="ml-auto"
          />
        )}
      </div>
      <div className="mt-2 flex flex-row gap-8">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${keyLayout.columns}, 5rem)`,
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
                  className="size-20"
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
          <RotateCcw className="text-tertiary justify-self-center" />
          <MousePointerClick className="text-tertiary justify-self-center" />
          <RotateCw className="text-tertiary justify-self-center" />
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
                  className="size-20"
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
                  className="size-20"
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
                  className="size-20"
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
