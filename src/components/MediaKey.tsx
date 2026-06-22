import { cva, type VariantProps } from "class-variance-authority";
import {
  Calculator,
  FolderSearch,
  Globe,
  MonitorX,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Star,
  Sun,
  SunDim,
  Sunrise,
  Sunset,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

import { MediaCode } from "@model/keyboard";
import { Button } from "@ux/Button";

const mediakey = cva(
  [
    "inline-block rounded-sm border align-middle text-center",
    "border-neutral-500 dark:border-neutral-400",
  ],
  {
    variants: {
      size: {
        sm: "size-6",
        md: "size-9 p-1",
      },
    },
  }
);

const mediakeyicon = cva("inline-block", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
    },
  },
});

export type MediaKeyProps = {
  code: MediaCode;
} & VariantProps<typeof mediakey> &
  React.ComponentProps<"span">;

export function MediaKey({
  code,
  size = "md",
  onClick,
  className,
  ...other
}: MediaKeyProps) {
  const { Icon, description } = useMemo(() => {
    switch (code) {
      case "BrightnessUp":
        return { Icon: Sun, description: "Display brightness up" };
      case "BrightnessDown":
        return { Icon: SunDim, description: "Display brightness down" };
      case "KbBrightnessUp":
        return { Icon: Sunrise, description: "Keyboard backlight up" };
      case "KbBrightnessDown":
        return { Icon: Sunset, description: "Keyboard backlight down" };
      case "Next":
        return { Icon: SkipForward, description: "Next" };
      case "Previous":
        return { Icon: SkipBack, description: "Previous" };
      case "Stop":
        return { Icon: Square, description: "Stop" };
      case "Play":
        return { Icon: Play, description: "Play" };
      case "Mute":
        return { Icon: VolumeX, description: "Mute" };
      case "VolumeUp":
        return { Icon: Volume2, description: "Volume up" };
      case "VolumeDown":
        return { Icon: Volume1, description: "Volume down" };
      case "Favorites":
        return { Icon: Star, description: "Favorites" };
      case "Finder":
        return { Icon: FolderSearch, description: "File browser" };
      case "Calculator":
        return { Icon: Calculator, description: "Calculator" };
      case "Browser":
        return { Icon: Globe, description: "Web browser" };
      case "Screenlock":
        return { Icon: MonitorX, description: "Lock screen" };
    }
  }, [code]);

  const contents = (
    <span className={twMerge(mediakey({ size }), className)} {...other}>
      <Icon className={mediakeyicon({ size })} />
    </span>
  );

  return onClick ? (
    <Button
      onClick={onClick}
      description={description}
      variant="invisible"
      className="p-0"
    >
      {contents}
    </Button>
  ) : (
    contents
  );
}
