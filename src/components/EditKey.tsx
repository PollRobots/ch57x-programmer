import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React from "react";
import { twJoin } from "tailwind-merge";

import { KeyBinding, KeyChord, Macro } from "@model/keyboard";
import { H3, Text } from "@ux/Typography";

import { DisplayKeyBinding, DisplayKeyChord } from "./DisplayKeyBinding";

export type EditKeyProps = {
  initialBinding: KeyBinding | undefined;
  updatedMacro: Macro | undefined;
  onChange: (updatedMacro: Macro | undefined) => void;
};

export function EditKey({
  initialBinding,
  updatedMacro,
  onChange,
}: EditKeyProps) {
  const workingMacro = React.useMemo<Macro>(() => {
    if (updatedMacro) {
      return updatedMacro;
    }
    if (initialBinding) {
      return initialBinding.expansion;
    }
    return {
      type: "Keyboard",
      options: {
        delay: 0,
      },
      keyChords: [],
    };
  }, [updatedMacro, initialBinding]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-baseline gap-2">
        <H3>Edit binding</H3>
        <div className="flex-1" />
        <Text strong>Current binding:</Text>
        {initialBinding ? (
          <DisplayKeyBinding macro={initialBinding.expansion} />
        ) : (
          "None"
        )}
      </div>
      <MacroEditor macro={workingMacro} onChange={onChange} />
    </div>
  );
}

type MacroEditorProps = {
  macro: Macro;
  onChange: (update: Macro) => void;
};

const MACRO_TYPES = ["Keyboard", "Media", "Mouse"];

function MacroEditor({ macro, onChange }: MacroEditorProps) {
  return (
    <TabGroup defaultIndex={MACRO_TYPES.indexOf(macro.type)}>
      <TabList className="flex flex-row">
        {({ selectedIndex }) => (
          <>
            {MACRO_TYPES.map((label, i) => (
              <Tab
                key={i}
                className={twJoin(
                  "px-2 py-1",
                  "border",
                  selectedIndex === i
                    ? "border-t-neutral-300 border-r-neutral-300 border-b-transparent border-l-neutral-300 bg-neutral-50"
                    : "border-t-transparent border-r-transparent border-b-neutral-300 border-l-transparent"
                )}
              >
                <Text size="lg"> {label} </Text>
              </Tab>
            ))}
            <div className="flex-1 border-b border-b-neutral-300" />
          </>
        )}
      </TabList>
      <TabPanels className="border-r border-b border-l border-neutral-300 bg-neutral-50 shadow-md">
        <TabPanel>
          <KeyboardEditor
            keyChords={macro.type === "Keyboard" ? macro.keyChords : []}
            onUpdatedKeyChords={update =>
              onChange({
                type: "Keyboard",
                options: { delay: 0 },
                keyChords: update,
              })
            }
          />
        </TabPanel>
        <TabPanel>Media</TabPanel>
        <TabPanel>Mouse</TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

type KeyboardEditorProps = {
  keyChords: KeyChord[];
  onUpdatedKeyChords: (update: KeyChord[]) => void;
};

function KeyboardEditor({ keyChords }: KeyboardEditorProps) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-18">
        {keyChords.map((keyChord, i) => (
          <DisplayKeyChord key={i} {...keyChord} />
        ))}
        {keyChords.length < 18 && (
          <>
            {Array(18 - keyChords.length)
              .fill(null)
              .map((_, i) => (
                <div key={i + keyChords.length} />
              ))}
          </>
        )}
      </div>
    </div>
  );
}
