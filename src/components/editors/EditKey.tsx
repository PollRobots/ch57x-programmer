import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cva } from "class-variance-authority";
import { Trash2 } from "lucide-react";
import React from "react";
import { twJoin } from "tailwind-merge";

import { KeyBinding, Macro } from "@model/keyboard";
import { Button } from "@ux/Button";
import { H3, Text } from "@ux/Typography";

import { DisplayKeyBinding } from "../DisplayKeyBinding";
import { KeyboardEditor } from "./KeyboardEditor";
import { MediaEditor } from "./MediaEditor";
import { MouseEditor } from "./MouseEditor";

export type EditKeyProps = {
  initialBinding: KeyBinding | undefined;
  updatedMacro: Macro | undefined;
  onChange: (updatedMacro: Macro | undefined) => void;
  onCommit: () => void;
  maxKeySequence: number;
};

export function EditKey({
  initialBinding,
  updatedMacro,
  onChange,
  onCommit,
  maxKeySequence,
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
        {updatedMacro && (
          <Button
            size="sm"
            className="flex flex-row items-center gap-2"
            onClick={() => onChange(undefined)}
          >
            <Trash2 className="size-3" />
            <Text size="sm">Clear</Text>
          </Button>
        )}
        <Text strong className="ml-auto">
          Current binding:
        </Text>
        {initialBinding ? (
          <DisplayKeyBinding macro={initialBinding.expansion} />
        ) : (
          "None"
        )}
      </div>
      <MacroEditor
        macro={workingMacro}
        onChange={onChange}
        edited={
          updatedMacro !== undefined || initialBinding?.origin === "editor"
        }
        onCommit={onCommit}
        maxKeySequence={maxKeySequence}
      />
    </div>
  );
}

type MacroEditorProps = {
  macro: Macro;
  onChange: (update: Macro) => void;
  edited: boolean;
  onCommit: () => void;
  maxKeySequence: number;
};

const MACRO_TYPES = ["Keyboard", "Media", "Mouse"];

const macrotab = cva("px-2 py-1 border", {
  variants: {
    selected: {
      true: [
        "border-b-transparent bg-neutral-50 dark:bg-neutral-800",
        "border-t-neutral-300 border-x-neutral-300",
        "dark:border-t-neutral-600 dark:border-x-neutral-600",
      ],
      false: [
        "border-t-transparent border-x-transparent",
        "border-b-neutral-300 dark:border-b-neutral-600",
      ],
    },
  },
});

function MacroEditor({
  macro,
  onChange,
  edited,
  onCommit,
  maxKeySequence,
}: MacroEditorProps & { maxKeySequence: number }) {
  return (
    <TabGroup defaultIndex={MACRO_TYPES.indexOf(macro.type)}>
      <TabList className="flex flex-row">
        {({ selectedIndex }) => (
          <>
            {MACRO_TYPES.map((label, i) => (
              <Tab
                key={i}
                className={macrotab({ selected: selectedIndex === i })}
              >
                <Text size="lg"> {label} </Text>
              </Tab>
            ))}
            <div className="flex-1 border-b border-b-neutral-300 dark:border-b-neutral-600" />
          </>
        )}
      </TabList>
      <TabPanels
        className={twJoin(
          "border-x border-b shadow-md",
          "border-neutral-300 bg-neutral-50",
          "dark:border-neutral-600 dark:bg-neutral-800"
        )}
      >
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
            edited={edited}
            commit={onCommit}
            maxKeySequence={maxKeySequence}
          />
        </TabPanel>
        <TabPanel>
          <MediaEditor
            mediaCode={macro.type === "Media" ? macro.mediaCode : undefined}
            onUpdatedMediaCode={update =>
              onChange({
                type: "Media",
                mediaCode: update,
              })
            }
            edited={edited}
            commit={onCommit}
          />
        </TabPanel>
        <TabPanel>
          <MouseEditor
            mouseAction={macro.type === "Mouse" ? macro.action : undefined}
            mouseModifier={macro.type === "Mouse" ? macro.modifier : undefined}
            onUpdatedMouse={({ action, modifier }) =>
              onChange({
                type: "Mouse",
                action,
                modifier,
              })
            }
            edited={edited}
            commit={onCommit}
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
