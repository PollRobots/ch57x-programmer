import React, { useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";

export function GlobalErrorWrapper({ children }: React.PropsWithChildren) {
  const { showBoundary } = useErrorBoundary();
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error(event.error);
      showBoundary(event.error);
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error(event.reason);
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
