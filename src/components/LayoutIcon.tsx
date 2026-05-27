import { SquareDashed } from "lucide-react";
import React from "react";

export type LayoutIconProps = {
  rows: number;
  columns: number;
  encoders: number;
} & React.SVGAttributes<SVGElement>;

export function LayoutIcon({
  rows,
  columns,
  encoders,
  ...other
}: LayoutIconProps) {
  if (rows === 0 && columns === 0) {
    return <SquareDashed {...other} />;
  }

  const totalColumns = columns + (encoders > 0 ? 2 : 0);

  const width = totalColumns * 4 - 1 + 6;
  const height = rows * 4 - 1 + 6;

  const size = Math.max(width, height);

  const xOffset = (size - width) / 2;
  const yOffset = (size - height) / 2;

  return (
    <svg
      width="24"
      height="24"
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...other}
    >
      <rect
        width={width - 2}
        height={height - 2}
        x={xOffset + 1}
        y={yOffset + 1}
      />
      {Array(columns * rows)
        .fill(null)
        .map((_, i) => {
          const x = xOffset + 3 + 4 * (i % columns);
          const y = yOffset + 6 + 4 * Math.floor(i / columns);

          return <path key={`button.${i}`} d={`M ${x} ${y} v -2 h 2`} />;
        })}
      {encoders > 0 &&
        encoders <= rows &&
        Array(encoders)
          .fill(null)
          .map((_, i) => {
            const cx = xOffset + 6 + 4 * columns;
            const cy = 0.5 + yOffset + ((i + 1) * height) / (encoders + 1);

            return (
              <path
                key={`encoder.${i}`}
                d={`M ${cx - 2} ${cy} a 2 2 0 0 1 2 -2 m 2 2 a 2 2 0 0 1 -2 2`}
              />
            );
          })}
    </svg>
  );
}
