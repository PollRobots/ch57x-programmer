import { useCallback, useRef } from "react";

export function useDebounceThunk(callback: () => void, delay: number) {
  const debounceTimer = useRef<number | undefined>(undefined);
  const debounced = useCallback(() => {
    const handle = debounceTimer.current;
    if (handle !== undefined) {
      clearTimeout(handle);
    }
    debounceTimer.current = setTimeout(callback, delay);
  }, [callback, delay]);

  return debounced;
}
