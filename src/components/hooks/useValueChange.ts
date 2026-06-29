import { useCallback, useEffect, useRef, useState } from "react";

export type ValueChangeOptions<T> = {
  /**
   * Comparison function used to detect if two values are equal.
   *
   * The default for this is strict equality
   */
  compare?: (a: T, b: T) => boolean;
  /** Indicates whether the callback should be triggered with the initial value. */
  callOnMount?: boolean;
  /**
   * Indicates whether values that are `null` or `undefined` should be ignored.
   *
   * If this is `true`, then the cached value will not be updated when the value is `null` or `undefined`
   */
  excludeNullishValues?: boolean;
};

type ValueOption<T> =
  | {
      type: "set";
      value: T;
    }
  | {
      type: "empty";
    };

function defaultCompare<T>(a: T, b: T) {
  return a === b;
}

export type ValueChange = {
  /**
   * This is incremented every time the value changes.
   *
   * This can be used by the callsite to cause a render operation or otherwise
   * detect change, particularly if a `changeHandler` is not provided.
   */
  revision: number;
  /**
   * Calling this will trigger the `changeHandler` if any, and increment {@link revision}
   */
  trigger: () => void;
};

/**
 * Hook that calls a change handler when a value changes.
 *
 * This aims to replace uses of {@link useEffect} and guarantees that
 * {@link changeHandler} will only be called when a change to {@link value} occurs.
 * `useEffect` can be problematic because it will be called when any dependency
 * changes, not just the specific value.
 *
 * @param value The value being monitored, if this value changes the {@link
 * changeHandler} will be called
 * @param changeHandler The optional callback that will be called if {@link
 * value} changes
 * @param options Controls some of the behavior of the hook, in particular use
 * {@link ValueChangeOptions.compare} to provide a custom comparison function if
 * strict equality is not appropriate for your usecase.
 */
export function useValueChange<T>(
  value: T,
  changeHandler?: (update: T) => void,
  options?: ValueChangeOptions<T>
): ValueChange {
  const valueRef = useRef<ValueOption<T>>({ type: "empty" });
  const [revision, setRevision] = useState(0);

  const { compare, callOnMount, excludeNullishValues } = {
    compare: defaultCompare,
    callOnMount: false,
    excludeNullishValues: false,
    ...options,
  };

  const trigger = useCallback(() => {
    if (valueRef.current.type === "set") {
      changeHandler?.(valueRef.current.value);
      setRevision(prev => prev + 1);
    }
  }, [changeHandler]);

  useEffect(() => {
    if (excludeNullishValues && (value === null || value === undefined)) {
      return;
    }
    if (valueRef.current.type === "empty") {
      // This is the first time this has been called
      valueRef.current = {
        type: "set",
        value,
      };
      if (callOnMount) {
        trigger();
      }
    } else if (!compare(valueRef.current.value, value)) {
      valueRef.current.value = value;
      trigger();
    }
  }, [value, compare, trigger, callOnMount, excludeNullishValues]);

  return {
    revision,
    trigger,
  };
}
