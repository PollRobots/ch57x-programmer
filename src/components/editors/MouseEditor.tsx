import { cva } from "class-variance-authority";
import {
  ArrowBigUp,
  ChevronUp,
  Dot,
  Hand,
  Mouse,
  MouseLeft,
  MousePointerClick,
  MouseRight,
  Option,
  Save,
} from "lucide-react";
import React, { useCallback, useMemo, useRef } from "react";

import { MouseAction, MouseButton, MouseModifier } from "@model/keyboard";
import { Button } from "@ux/Button";
import { Input } from "@ux/Input";
import { RadioOption, SimpleRadio } from "@ux/SimpleRadio";
import { Text } from "@ux/Typography";

import { editkey } from "./KeyboardEditor";

export type MouseEditorProps = {
  mouseAction: MouseAction | undefined;
  mouseModifier: MouseModifier | undefined;
  onUpdatedMouse: (update: {
    action: MouseAction;
    modifier: MouseModifier | undefined;
  }) => void;
  edited: boolean;
  commit: () => void;
};

export function MouseEditor({
  mouseAction,
  mouseModifier,
  onUpdatedMouse,
  edited,
  commit,
}: MouseEditorProps) {
  return (
    <div className="flex min-w-[46rem] flex-col gap-2 p-2">
      <Text strong>Mouse action</Text>
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
        <MouseActionEditor
          action={mouseAction}
          onClick={action =>
            onUpdatedMouse({ action, modifier: mouseModifier })
          }
        />
        <MouseModifierWidget
          modifier={mouseModifier}
          onClick={modifier =>
            onUpdatedMouse({
              action: mouseAction ?? { type: "Click", buttons: ["Left"] },
              modifier,
            })
          }
        />
        <div className="mr-auto flex flex-col gap-2">
          <Text size="sm">Data</Text>
          <div className="grid grid-cols-[auto_auto] gap-1">
            <Text>x</Text>
            <Input
              type="number"
              className="w-20"
              min={-127}
              max={127}
              placeholder="x"
              {...(mouseAction && "x" in mouseAction
                ? {
                    value: mouseAction.x,
                    onChange: event => {
                      const value = Number(event.target.value);
                      if (
                        Number.isInteger(value) &&
                        value >= -127 &&
                        value <= 127
                      ) {
                        onUpdatedMouse({
                          action: { ...mouseAction, x: value },
                          modifier: mouseModifier,
                        });
                      }
                    },
                  }
                : { value: "-", disabled: true })}
            />
            <Text>y</Text>
            <Input
              type="number"
              className="w-20"
              min={-127}
              max={127}
              placeholder="y"
              {...(mouseAction && "y" in mouseAction
                ? {
                    value: mouseAction.y,
                    onChange: event => {
                      const value = Number(event.target.value);
                      if (
                        Number.isInteger(value) &&
                        value >= -127 &&
                        value <= 127
                      ) {
                        onUpdatedMouse({
                          action: { ...mouseAction, y: value },
                          modifier: mouseModifier,
                        });
                      }
                    },
                  }
                : { value: "-", disabled: true })}
            />
            <Text>delta</Text>
            <Input
              type="number"
              className="w-20"
              min={-127}
              max={127}
              placeholder="delta"
              {...(mouseAction && "delta" in mouseAction
                ? {
                    value: mouseAction.delta,
                    onChange: event => {
                      const value = Number(event.target.value);
                      if (
                        Number.isInteger(value) &&
                        value >= -127 &&
                        value <= 127
                      ) {
                        onUpdatedMouse({
                          action: { ...mouseAction, delta: value },
                          modifier: mouseModifier,
                        });
                      }
                    },
                  }
                : { value: "-", disabled: true })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type MouseActionProps = {
  action: MouseAction | undefined;
  onClick: (action: MouseAction) => void;
};

type MouseActionVariant = MouseAction["type"];

const MOUSE_ACTION_TYPES: RadioOption<MouseActionVariant | "None">[] = [
  {
    value: "Click",
    label: "Click",
    icon: () => <MousePointerClick className="size-4" />,
  },
  { value: "Drag", label: "Move", icon: () => <Hand className="size-4" /> },
  { value: "Wheel", label: "Wheel", icon: () => <Mouse className="size-4" /> },
];

function MouseActionEditor({ action, onClick }: MouseActionProps) {
  const actionType = useMemo(() => {
    const actionType = action
      ? action.type === "Move"
        ? "Drag"
        : action.type === "Click" && action.buttons.length === 0
          ? "None"
          : action.type
      : "None";
    return (
      MOUSE_ACTION_TYPES.find(
        ({ value }) => value === (actionType ?? "None")
      ) ?? { value: "None", label: "" }
    );
  }, [action]);

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2">
        <Text size="sm">Action</Text>
        <SimpleRadio
          value={actionType}
          onChange={({ value }) => {
            const position =
              action?.type === "Move" || action?.type === "Drag"
                ? { x: action.x, y: action.y }
                : undefined;
            const delta =
              action && "delta" in action ? { delta: action.delta } : undefined;
            const buttons =
              action && "buttons" in action
                ? { buttons: action.buttons }
                : undefined;
            switch (value) {
              case "Move":
              case "Drag":
                onClick({
                  type: value,
                  x: 0,
                  y: 0,
                  buttons: [],
                  ...position,
                  ...buttons,
                });
                break;
              case "Click":
                onClick({ type: value, buttons: [], ...buttons });
                break;
              case "Wheel":
                onClick({ type: value, delta: 0, ...delta });
                break;
            }
          }}
          options={MOUSE_ACTION_TYPES}
          orientation="vertical"
        />
      </div>
      {action === undefined || action.type === "Click" ? (
        <MouseVector onClick={onClick} />
      ) : (
        <MouseVector action={action} onClick={onClick} />
      )}
      <div className="flex flex-col gap-2">
        <Text size="sm">Buttons</Text>
        <MouseButtons
          disabled={action?.type === "Wheel"}
          buttons={action && "buttons" in action ? action.buttons : []}
          onChange={update => {
            if (!action || action.type === "Click") {
              onClick({ type: "Click", buttons: update });
            } else if (action.type !== "Wheel") {
              onClick({ ...action, type: "Drag", buttons: update });
            }
          }}
        />
      </div>
    </div>
  );
}

type MouseButtonsProps = {
  buttons: MouseButton[];
  onChange: (update: MouseButton[]) => void;
  disabled?: boolean;
};

const mousebuttons = cva(
  "px-2 py-1 border flex flex-row gap-2 items-center rounded",
  {
    variants: {
      selected: {
        true: [
          "border-neutral-400 hover:border-neutral-600 text-default",
          "dark:border-neutral-500 dark:hover:border-neutral-300 dark:text-white",
          "bg-violet-500/30",
        ],
        false: [
          "border-neutral-200 hover:border-neutral-400 text-secondary bg-neutral-100",
          "dark:border-neutral-700 dark:hover:border-neutral-500 dark:text-white dark:bg-neutral-700",
        ],
      },
      disabled: {
        true: "opacity-50 pointer-events-none",
        false: null,
      },
    },
  }
);

function MouseButtons({ buttons, disabled, onChange }: MouseButtonsProps) {
  const toggle = useCallback(
    (button: MouseButton) => {
      if (buttons.includes(button)) {
        onChange(buttons.filter(b => b !== button));
      } else {
        onChange([...buttons, button]);
      }
    },
    [buttons, onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="invisible"
        className={mousebuttons({
          selected: buttons.includes("Left"),
          disabled,
        })}
        onClick={() => toggle("Left")}
      >
        <MouseLeft className="size-4" />
        <Text>Left</Text>
      </Button>
      <Button
        variant="invisible"
        className={mousebuttons({
          selected: buttons.includes("Middle"),
          disabled,
        })}
        onClick={() => toggle("Middle")}
      >
        <Mouse className="size-4" />
        <Text>Middle</Text>
      </Button>
      <Button
        variant="invisible"
        className={mousebuttons({
          selected: buttons.includes("Right"),
          disabled,
        })}
        onClick={() => toggle("Right")}
      >
        <MouseRight className="size-4" />
        <Text>Right</Text>
      </Button>
    </div>
  );
}

type MouseModifierProps = {
  modifier: MouseModifier | undefined;
  onClick: (modifier: MouseModifier | undefined) => void;
};

type MouseModifierEx = MouseModifier | "None";
const MODIFIER_OPTIONS: RadioOption<MouseModifierEx>[] = [
  {
    value: "Ctrl",
    label: "Ctrl",
    icon: () => <ChevronUp className="size-4" />,
  },
  {
    value: "Shift",
    label: "Shift",
    icon: () => <ArrowBigUp className="size-4" />,
  },
  { value: "Alt", label: "Alt", icon: () => <Option className="size-4" /> },
  { value: "None", label: "<none>", icon: () => <Dot className="size-4" /> },
];

function MouseModifierWidget({ modifier, onClick }: MouseModifierProps) {
  const value = useMemo<RadioOption<MouseModifierEx>>(
    () =>
      MODIFIER_OPTIONS.find(({ value }) => value === (modifier ?? "None")) ?? {
        value: "None",
        label: "",
      },
    [modifier]
  );

  return (
    <div className="flex flex-col gap-2">
      <Text size="sm">Modifier</Text>
      <SimpleRadio
        value={value}
        options={MODIFIER_OPTIONS}
        onChange={update => {
          if (update.value === "None") {
            onClick(undefined);
          } else {
            onClick(update.value);
          }
        }}
        orientation="vertical"
      />
    </div>
  );
}

type MouseVectorProps = {
  action?: Exclude<MouseAction, { type: "Click" }>;
  onClick: (update: MouseAction) => void;
};

function MouseVector({
  action = { type: "Move", x: 0, y: 0 },
  onClick,
}: MouseVectorProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const onVectorClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) {
        return;
      }
      const svgBounds = svgRef.current.getBoundingClientRect();

      const x =
        Math.round((257 * (event.clientX - svgBounds.x)) / svgBounds.width) -
        129;
      const y =
        Math.round((257 * (event.clientY - svgBounds.y)) / svgBounds.height) -
        129;
      if (x >= -127 && x <= 127 && y >= -127 && y <= 127) {
        if (action.type === "Wheel") {
          onClick({ ...action, delta: -y });
        } else {
          onClick({ ...action, x, y });
        }
      }
    },
    [action, onClick]
  );
  return (
    <div className="flex flex-col gap-2">
      <Text size="sm">{action.type === "Wheel" ? "Wheel" : "Move"} vector</Text>
      <div className="grid size-36 bg-white dark:bg-neutral-900">
        <Text size="xs" className="col-start-1 row-start-1 select-none">
          {action.type === "Wheel"
            ? `(${action.delta})`
            : `(${action.x}, ${action.y})`}
        </Text>

        <svg
          viewBox="-128 -128 257 257"
          onClick={onVectorClick}
          onMouseMove={e => {
            if (e.buttons != 0) {
              onVectorClick(e);
            }
          }}
          ref={svgRef}
          className="col-start-1 row-start-1 cursor-pointer"
        >
          <rect
            x={-127}
            y={-127}
            width={255}
            height={255}
            stroke="currentColor"
            fill="none"
          />
          {action.type === "Wheel" ? (
            <>
              <line x1={-127} x2={255} y1={0} y2={0} stroke="currentColor" />
              {action.delta !== 0 && (
                <>
                  <path
                    d={`M 0 0 L ${0} ${-action.delta} l ${-17 * Math.sin(Math.atan2(-action.delta, 0) + Math.PI / 4)} ${17 * Math.cos(Math.atan2(-action.delta, 0) + Math.PI / 4)} M ${0} ${-action.delta} l ${-17 * Math.sin(Math.atan2(-action.delta, 0) + (3 * Math.PI) / 4)} ${17 * Math.cos(Math.atan2(-action.delta, 0) + (3 * Math.PI) / 4)} `}
                    stroke="currentColor"
                    fill="none"
                  />
                  <line
                    x1={-127}
                    x2={255}
                    y1={-action.delta}
                    y2={-action.delta}
                    stroke="currentColor"
                    strokeWidth={2}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <line x1={0} x2={0} y1={-8} y2={9} stroke="currentColor" />
              <line y1={0} y2={0} x1={-8} x2={9} stroke="currentColor" />
              {(action.x !== 0 || action.y !== 0) && (
                <path
                  d={`M 0 0 L ${action.x} ${action.y} l ${-17 * Math.sin(Math.atan2(action.y, action.x) + Math.PI / 4)} ${17 * Math.cos(Math.atan2(action.y, action.x) + Math.PI / 4)} M ${action.x} ${action.y} l ${-17 * Math.sin(Math.atan2(action.y, action.x) + (3 * Math.PI) / 4)} ${17 * Math.cos(Math.atan2(action.y, action.x) + (3 * Math.PI) / 4)} `}
                  stroke="currentColor"
                  fill="none"
                />
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
