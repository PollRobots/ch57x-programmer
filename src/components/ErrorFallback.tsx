import { RotateCcw } from "lucide-react";
import React from "react";
import { FallbackProps } from "react-error-boundary";

import { Button } from "@ux/Button";
import { Page } from "@ux/Page";
import { H2, Text } from "@ux/Typography";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const actualError = error instanceof Error ? error : undefined;
  return (
    <Page className="space-around flex">
      <div className="m-auto flex size-fit flex-col gap-4 bg-white p-4 shadow-xl dark:bg-neutral-900">
        <H2>Something went wrong</H2>
        <Text>{actualError ? actualError.message : `${error}`}</Text>
        <Button
          onClick={resetErrorBoundary}
          className="flex items-center gap-2"
        >
          <RotateCcw className="size-4" />
          <Text>Try again</Text>
        </Button>
      </div>
    </Page>
  );
}
