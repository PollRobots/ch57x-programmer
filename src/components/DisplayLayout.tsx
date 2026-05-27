import React from "react";

import { Text } from "@ux/Typography";

export type DisplayLayoutProps = {
  rows: number;
  columns: number;
  encoders: number;
};

export function DisplayLayout({ rows, columns, encoders }: DisplayLayoutProps) {
  if (rows === 0 && columns === 0) {
    return <Text>Unknown</Text>;
  }
  return (
    <Text>
      {columns}×{rows}
      {encoders > 0 && ` + ${encoders}`}
    </Text>
  );
}
