import { Input } from "@headlessui/react";
import React, { useCallback } from "react";

import { KeyboardDeviceType } from "@model/keyboard";
import { Text } from "@ux/Typography";

export type SetDeviceTypeProps = {
  keyboardDeviceType: KeyboardDeviceType;
  userKeyboardDeviceType: KeyboardDeviceType | undefined;
  onChange: (update: KeyboardDeviceType) => void;
};

export function SetDeviceType({
  keyboardDeviceType,
  userKeyboardDeviceType,
  onChange,
}: SetDeviceTypeProps) {
  const buttons = userKeyboardDeviceType?.buttons ?? keyboardDeviceType.buttons;
  const encoders =
    userKeyboardDeviceType?.encoders ?? keyboardDeviceType.encoders;
  const layers = userKeyboardDeviceType?.layers ?? keyboardDeviceType.layers;

  const onChangeButtons = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const buttons = event.target.valueAsNumber;
      if (
        Number.isInteger(buttons) &&
        buttons > 0 &&
        buttons <= keyboardDeviceType.buttons
      ) {
        onChange({
          family: keyboardDeviceType.family,
          buttons,
          encoders,
          layers,
        });
      }
    },
    [
      encoders,
      layers,
      onChange,
      keyboardDeviceType.buttons,
      keyboardDeviceType.family,
    ]
  );
  const onChangeEncoders = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const encoders = event.target.valueAsNumber;
      if (
        Number.isInteger(encoders) &&
        encoders > 0 &&
        encoders <= keyboardDeviceType.encoders
      ) {
        onChange({
          family: keyboardDeviceType.family,
          buttons,
          encoders,
          layers,
        });
      }
    },
    [
      buttons,
      layers,
      onChange,
      keyboardDeviceType.encoders,
      keyboardDeviceType.family,
    ]
  );
  const onChangeLayers = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const layers = event.target.valueAsNumber;
      if (
        Number.isInteger(layers) &&
        layers > 0 &&
        layers <= keyboardDeviceType.layers
      ) {
        onChange({
          family: keyboardDeviceType.family,
          buttons,
          encoders,
          layers,
        });
      }
    },
    [
      buttons,
      encoders,
      onChange,
      keyboardDeviceType.layers,
      keyboardDeviceType.family,
    ]
  );

  return (
    <>
      <Text strong>Buttons:</Text>
      <Input
        value={buttons}
        type="number"
        min="0"
        max={keyboardDeviceType.buttons}
        onChange={onChangeButtons}
      />
      <Text strong>Encoders:</Text>
      <Input
        value={encoders}
        type="number"
        min="0"
        max={keyboardDeviceType.encoders}
        onChange={onChangeEncoders}
      />
      <Text strong>Layers:</Text>
      <Input
        value={layers}
        type="number"
        min="0"
        max={keyboardDeviceType.layers}
        onChange={onChangeLayers}
      />
    </>
  );
}
