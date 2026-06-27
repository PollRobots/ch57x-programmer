import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
} from "@headlessui/react";
import React, { useState } from "react";

import { Button } from "@ux/Button";
import { Input } from "@ux/Input";
import { H3, Text } from "@ux/Typography";

export type AddProfileDialogProps = {
  show: boolean;
  names: string[];
  onClose: () => void;
  onAddProfile: (name: string) => void;
};

export function AddProfileDialog({
  show,
  names,
  onClose,
  onAddProfile,
}: AddProfileDialogProps) {
  const [name, setName] = useState("");

  return (
    <Dialog open={show} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen place-items-start p-12">
        <DialogPanel className="mt-88 flex max-w-lg flex-col gap-2 rounded-xl border border-neutral-500 bg-white p-6 shadow-xl dark:border-neutral-400 dark:bg-neutral-900 dark:text-white">
          <DialogTitle as={H3} strong>
            Add profile
          </DialogTitle>
          <Description>This will add a new keyboard profile</Description>
          <Field className="flex flex-col gap-1">
            <Label as={Text} size="sm" strong>
              Profile name
            </Label>
            <Description
              as={Text}
              size="sm"
              className="text-secondary dark:text-white"
            >
              The name for the new profile. This can be edited later
            </Description>
            <Input
              name="profile_name"
              type="text"
              placeholder="Profile name…"
              value={name}
              onChange={event => setName(event.target.value)}
              size="md"
              className="mt-2"
            />
            {names.includes(name) && (
              <Text size="sm" className="text-red-500">
                Each profile must have a unique name.
              </Text>
            )}
          </Field>
          <div className="flex gap-4">
            <Button className="ml-auto" onClick={onClose} variant="default">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onClose();
                onAddProfile(name);
              }}
              variant="primary"
              disabled={name.length === 0 || names.includes(name)}
            >
              Add
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
