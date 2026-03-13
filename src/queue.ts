export class ArrayQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;

  enqueue(task: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      // 큐에 작업과 resolve/reject 콜백을 함께 저장합니다.
      this.queue.push(async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error);
        }
      });

      // 작업을 넣은 후 큐 처리를 시도합니다.
      this.process();
    });
  }

  async process() {
    // 이미 처리 중이거나 큐가 비어있다면 진행하지 않습니다.
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const nextTask = this.queue.shift(); // 큐에서 가장 먼저 들어온 작업 꺼내기

    try {
      await nextTask?.();
    } finally {
      this.isProcessing = false;
      this.process(); // 다음 작업이 있는지 확인하고 이어서 실행
    }
  }
}
