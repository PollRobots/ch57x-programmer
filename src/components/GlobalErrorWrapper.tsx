import React, { useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";

export function GlobalErrorWrapper({ children }: React.PropsWithChildren) {
  const { showBoundary } = useErrorBoundary();
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      showBoundary(event.error);
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      showBoundary(event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [showBoundary]);

  return children;
}
