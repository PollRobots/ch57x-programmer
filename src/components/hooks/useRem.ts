import { useCallback, useEffect, useMemo, useState } from "react";

export function useRem(): number {
  const [rem, setRem] = useState(16);
  const onResize = useCallback(() => {
    const fontSize = getComputedStyle(document.documentElement).fontSize;
    const pixels = Number(fontSize.slice(0, -2));
    if (fontSize.endsWith("px") && Number.isFinite(pixels)) {
      setRem(pixels);
    }
  }, []);
  const observer = useMemo(() => new ResizeObserver(onResize), [onResize]);

  useEffect(() => {
    onResize();
    observer.observe(document.documentElement);
    return () => observer.unobserve(document.documentElement);
  }, [observer, onResize]);

  return rem;
}
