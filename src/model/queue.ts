export type TryDequeueOptions = {
  timeout?: number;
  cancel?: Promise<void>;
};
export type Queue<T> = {
  enqueue: (item: Promise<T> | T) => void;
  dequeue: () => Promise<T>;
  tryDequeue: (options?: TryDequeueOptions) => Promise<T | undefined>;
};

export type Producer<T> = Pick<Queue<T>, "enqueue">;

export type Consumer<T> = Omit<Queue<T>, "enqueue">;

export function createQueue<T>(): Queue<T> {
  const queue: PromiseLike<T>[] = [];
  const state: {
    pending: boolean;
    emptyResolver: () => void;
    emptyPromise: Promise<void>;
  } = {
    pending: false,
    emptyResolver: () => {},
    emptyPromise: Promise.reject(new Error("Invalid queue state.")),
  };

  const makeEmpty = () => {
    state.emptyPromise = new Promise<void>(resolve => {
      state.emptyResolver = resolve;
    });
  };
  makeEmpty();

  const dequeueInner = async () => {
    if (queue.length === 0) {
      await state.emptyPromise;
    }

    const head = queue.shift();
    if (head === undefined) {
      throw new Error("Unexpectedly empty queue");
    }
    if (queue.length === 0) {
      makeEmpty();
    }
    return head;
  };

  return {
    enqueue: item => {
      if (queue.length === 0) {
        state.emptyResolver();
      }
      if (isPromiseLike(item)) {
        queue.push(item);
      } else {
        queue.push(Promise.resolve(item));
      }
    },
    dequeue: () => {
      if (state.pending) {
        throw new Error("Cannot have multiple clients reading the queue");
      }
      state.pending = true;
      try {
        return dequeueInner();
      } finally {
        state.pending = false;
      }
    },
    tryDequeue: async (options = {}) => {
      if (state.pending) {
        throw new Error("Cannot have multiple clients reading the queue");
      }
      try {
        state.pending = true;

        if (
          options.timeout === undefined ||
          options.timeout <= 1 ||
          queue.length > 0
        ) {
          // If no timeout is specified, or if the timeout is 0 or less, or if there is for sure something in the queue,
          // then just return the head of the queue or nothing.
          if (queue.length === 0) {
            return;
          }
          const head = queue.shift();
          if (queue.length === 0) {
            makeEmpty();
          }
          return head;
        }

        return Promise.race([
          state.emptyPromise.then<T | undefined>(dequeueInner),
          new Promise<T | undefined>(resolve =>
            setTimeout(() => resolve(undefined), options.timeout)
          ),
          ...(options.cancel
            ? [options.cancel.then<T | undefined>(() => {})]
            : []),
        ]);
      } finally {
        state.pending = false;
      }
    },
  };
}

function isPromiseLike<T>(value: any): value is PromiseLike<T> {
  return (
    value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}
