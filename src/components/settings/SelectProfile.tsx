import { Check, FileUp, Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { twJoin } from "tailwind-merge";

import { KeyboardProfile } from "@model/keyboard_profile";
import { Button } from "@ux/Button";
import { Select } from "@ux/Select";
import { Text } from "@ux/Typography";

import { LayoutIcon } from "../LayoutIcon";
import { AddProfileDialog } from "./AddProfileDialog";

export type SelectProfileProps = {
  profiles: KeyboardProfile[];
  selectedProfile: KeyboardProfile | undefined;
  onChangeProfiles: (updated: KeyboardProfile[]) => void;
  onSelectProfile: (profile: KeyboardProfile | undefined) => void;
  onAddProfile: (name: string) => void;

  selectedDevice: HIDDevice | undefined;
};

type ProfileOption = {
  value: string;
  profile: KeyboardProfile | undefined | "add";
  label: string;
};

export function SelectProfile({
  profiles,
  selectedProfile,
  onSelectProfile,
  onAddProfile,
  selectedDevice,
}: SelectProfileProps) {
  const [currentProfile, setCurrentProfile] = useState(selectedProfile);
  const [showAddProfile, setShowAddProfile] = useState(false);

  const profileOptions = useMemo(() => {
    const profileOptions = profiles.map<ProfileOption>((profile, i) => ({
      value: `${i}.${profile.name}`,
      profile,
      label: profile.name,
    }));
    profileOptions.push({ value: "None", profile: undefined, label: "None" });
    profileOptions.push({ value: "add", profile: "add", label: "add" });
    return profileOptions;
  }, [profiles]);
  const selectedProfileOption = useMemo(() => {
    return (
      profileOptions.find(option => option.profile === currentProfile) ?? {
        value: "None",
        profile: undefined,
        label: "None",
      }
    );
  }, [profileOptions, currentProfile]);

  return (
    <>
      <Text strong>Profiles:</Text>
      <Select
        value={selectedProfileOption}
        options={profileOptions}
        className="w-64 max-w-64 text-left"
        onChange={update => {
          const profile = profileOptions.find(
            option => option.value === update.value
          )?.profile;
          if (profile === "add") {
            setShowAddProfile(true);
          } else {
            setCurrentProfile(profile);
          }
        }}
        renderOption={(option, selected) => {
          const profile = profileOptions.find(
            o => o.value === option.value
          )?.profile;

          if (profile === "add") {
            return (
              <div
                className={twJoin(
                  "flex min-w-64 items-center gap-2 rounded-lg border",
                  "border-neutral-500 bg-neutral-50 p-2 hover:bg-neutral-300",
                  "dark:border-neutral-400 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-600"
                )}
              >
                <Plus />
                <Text>Add profile</Text>
              </div>
            );
          }
          if (!profile) {
            return (
              <div
                className={twJoin(
                  "flex min-w-64 items-center gap-2 rounded-lg border p-2",
                  "text-secondary border-neutral-300 bg-neutral-50 hover:bg-neutral-100",
                  "dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                )}
              >
                <Text className="italic">None</Text>
              </div>
            );
          }
          // Ensure that we can only select profiles that match the current device.
          const disabled =
            selectedDevice === undefined ||
            selectedDevice.productId !== profile.productId ||
            selectedDevice.vendorId !== profile.vendorId;
          return (
            <div
              className={twJoin(
                "flex min-w-64 items-center gap-2 rounded-lg border p-2",
                "border-neutral-300 bg-neutral-50 hover:bg-neutral-100",
                "dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800",
                disabled && "pointer-events-none"
              )}
            >
              <Check className={selected ? undefined : "invisible"} />
              <DisplayProfile {...profile} />
            </div>
          );
        }}
      />
      <AddProfileDialog
        show={showAddProfile}
        names={profiles.map(p => p.name)}
        onClose={() => setShowAddProfile(false)}
        onAddProfile={onAddProfile}
      />
      <Button
        variant="default"
        disabled={currentProfile === selectedProfile}
        onClick={() => {
          onSelectProfile(currentProfile);
        }}
        description="Applies the settings from this profile. This changes the key-bindings in this app, it doesn't write to the device"
      >
        Use this profile
      </Button>
      <Button
        variant="default"
        disabled={currentProfile === undefined}
        onClick={() => {
          if (currentProfile) {
            onAddProfile(currentProfile.name);
          }
        }}
        className="flex items-center gap-2"
        description="Write the current key-bindings to the selected profile."
      >
        <FileUp />
        Write profile
      </Button>
    </>
  );
}

function DisplayProfile(profile: KeyboardProfile) {
  return (
    <>
      <LayoutIcon
        {...profile.layout}
        encoders={profile.keyboardDeviceType.encoders}
        className="size-5"
      />
      <Text>{profile.name}</Text>
      <Text size="sm" className="tabular-nums">
        (0x{profile.vendorId.toString(16)}:0x
        {profile.productId.toString(16)})
      </Text>
    </>
  );
}
