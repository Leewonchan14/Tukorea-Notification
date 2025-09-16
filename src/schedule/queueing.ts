import PQueue from "p-queue";

const queue = new PQueue({ concurrency: 1 });

export const queueing = <T extends (...args: any[]) => any>(func: T) => {
  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return queue.add(async () => {
      try {
        return await func(...args);
      } catch (error) {
        console.error(error);
      }
    });
  };
};
