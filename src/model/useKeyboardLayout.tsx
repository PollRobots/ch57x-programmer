import React, { createContext, Suspense, useCallback, useContext } from "react";



import { keyboardEventCodeFromWellKnowCode, WellKnownCode } from "./key_codes";


export type KeyboardLayout = {
  isFallback: boolean;
  getKeyName: (code: string) => string | undefined;
  getCodeName: (wellKnownCode: WellKnownCode) => string | undefined;
};

export function useKeyboardLayoutRoot(): KeyboardLayout {
  const layoutPromise = React.useMemo(
    () =>
      navigator.keyboard?.getLayoutMap() ??
      Promise.resolve(getDefaultLayoutMap()),

    ["once"]
  );
  const keyboardLayout = React.use(layoutPromise);
  const getKeyName = useCallback(
    (code: string) => keyboardLayout.get(code) ?? code,
    [keyboardLayout]
  );
  const getCodeName = useCallback(
    (code: WellKnownCode) => {
      const eventCode = keyboardEventCodeFromWellKnowCode(code);
      return getKeyName(eventCode);
    },
    [getKeyName]
  );

  return {
    isFallback: false,
    getKeyName,
    getCodeName,
  };
}

const KeyboardLayoutContext = createContext<KeyboardLayout>({
  isFallback: true,
  getKeyName: (code: string) => code,
  getCodeName: (wellKnownCode: WellKnownCode) =>
    keyboardEventCodeFromWellKnowCode(wellKnownCode),
});

export function KeyboardLayoutProvider({ children }: React.PropsWithChildren) {
  return (
    <Suspense fallback={children}>
      <KeyboardLayoutProviderInner>{children}</KeyboardLayoutProviderInner>
    </Suspense>
  );
}

function KeyboardLayoutProviderInner({ children }: React.PropsWithChildren) {
  const keyboardLayout = useKeyboardLayoutRoot();

  return (
    <KeyboardLayoutContext.Provider value={keyboardLayout}>
      {children}
    </KeyboardLayoutContext.Provider>
  );
}

export function useKeyboardLayout(): KeyboardLayout {
  return useContext(KeyboardLayoutContext);
}

function getDefaultLayoutMap(): KeyboardLayoutMap {
  return {
    clear: (): void => {
      throw new Error("Function not implemented.");
    },
    delete: (): boolean => {
      throw new Error("Function not implemented.");
    },
    forEach: (): void => {
      throw new Error("Function not implemented.");
    },
    get: (key: string): string | undefined => key,
    has: (): boolean => true,
    set: (): KeyboardLayoutMap => {
      throw new Error("Function not implemented.");
    },
    size: 0,
    entries: (): MapIterator<[string, string]> => {
      throw new Error("Function not implemented.");
    },
    keys: (): MapIterator<string> => {
      throw new Error("Function not implemented.");
    },
    values: (): MapIterator<string> => {
      throw new Error("Function not implemented.");
    },
    [Symbol.iterator]: (): MapIterator<[string, string]> => {
      throw new Error("Function not implemented.");
    },
    [Symbol.toStringTag]: "DefaultKeyboardLayoutMap",
  };
}