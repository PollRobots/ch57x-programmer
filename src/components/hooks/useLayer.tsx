import React, { createContext, use, useState } from "react";

type LayerValue = {
  depth: number;
  container: HTMLElement | null;
};

const LayerContext = createContext<LayerValue>({ depth: 0, container: null });

export function useLayer() {
  return use(LayerContext);
}

export function LayerDiv({ children, ...other }: React.ComponentProps<"div">) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const layer = useLayer();

  return (
    <div ref={setContainer} {...other}>
      <LayerContext.Provider
        value={{
          depth: layer.depth + 1,
          container,
        }}
      >
        {children}
      </LayerContext.Provider>
    </div>
  );
}
