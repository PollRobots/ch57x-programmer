import { Save } from "lucide-react";
import React from "react";

import { MEDIA_CODE, MediaCode } from "@model/keyboard";
import { Button } from "@ux/Button";
import { Text } from "@ux/Typography";

import { MediaKey } from "../MediaKey";
import { displayKey } from "./keyboard/KeyboardSection";
import { editkey } from "./KeyboardEditor";

export type MediaEditorProps = {
  mediaCode: MediaCode | undefined;
  onUpdatedMediaCode: (update: MediaCode) => void;
  edited: boolean;
  commit: () => void;
};

export function MediaEditor({
  mediaCode,
  onUpdatedMediaCode,
  edited,
  commit,
}: MediaEditorProps) {
  return (
    <div className="flex min-w-[46rem] flex-col gap-2 p-2">
      <Text strong>Media key</Text>
      <Text size="sm" danger={edited}>
        {edited
          ? "This is the edited code, not yet bound to this key"
          : "This is the current code bound to this key"}
      </Text>
      <div className="flex flex-row gap-2">
        <Button
          variant="invisible"
          className={editkey({ dashed: false })}
          onClick={commit}
          disabled={!edited}
        >
          <Save />
        </Button>
        <MediaKeys selectedCode={mediaCode} onClick={onUpdatedMediaCode} />
      </div>
    </div>
  );
}

type MediaKeysProps = {
  selectedCode: MediaCode | undefined;
  onClick: (code: MediaCode) => void;
};
function MediaKeys({ selectedCode, onClick }: MediaKeysProps) {
  return (
    <div className="grid grid-cols-4 gap-2 self-start justify-self-start">
      {MEDIA_CODE.map(code => (
        <MediaKey
          code={code}
          key={code}
          size="md"
          className={displayKey({ selectedCode: selectedCode === code })}
          onClick={() => onClick(code)}
        />
      ))}
    </div>
  );
}
