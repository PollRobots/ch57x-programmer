import { useCallback, useEffect, useState } from "react";

export type HidChange = "None" | "NotSupported" | "Connected" | "Disconnected";

export function useHidChange(onChange: (change: HidChange) => void): HidChange {
  const [hidChange, setHidChange] = useState<HidChange>("None");

  const change = useCallback(
    (change: HidChange) => {
      onChange(change);
      setHidChange(change);
    },
    [onChange]
  );

  useEffect(() => {
    const onConnect = () => change("Connected");
    const onDisconnect = () => change("Disconnected");

    if (navigator.hid === undefined) {
      change("NotSupported");
      return;
    }

    navigator.hid.addEventListener("connect", onConnect);
    navigator.hid.addEventListener("disconnect", onDisconnect);

    return () => {
      navigator.hid.removeEventListener("connect", onConnect);
      navigator.hid.removeEventListener("disconnect", onDisconnect);
    };
  }, [change]);

  return hidChange;
}
