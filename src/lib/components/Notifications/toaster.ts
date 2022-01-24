
import Queue from 'mnemonist/queue';

export class Toaster<T> {
  private toasts: Queue<{dequeuing: boolean, item: T}> = new Queue();
  private subscribers: Map<number, Function> = new Map();
  private subCount: number = 0;
  private arrayCache: {dequeuing: boolean, item: T}[] | null = null;

  constructor(
    public readonly timeout: number = 1500,
    public readonly postTimeout: number = 200
  ) {}

  subscribe(fn: Function) {
    fn(this.items());
    const id = this.subCount++;
    this.subscribers.set(id, fn);
    return () => { this.subscribers.delete(id); }
  }

  private updateSubscribers() {
    this.invalidateCache();
    for (let subscriber of this.subscribers.values()) {
      subscriber(this.items());
    }
  }

  private invalidateCache() {
    this.arrayCache = null;
  }

  push(item: T) {
    this.toasts.enqueue({dequeuing: false, item});
    this.updateSubscribers();

    // this is safe as long as the timeout never changes
    // which means we don't have to bother with IDs or anything
    setTimeout(() => {
      const top = this.toasts.peek() as {dequeuing: boolean, item: T};  // can't be undefined
      top.dequeuing = true;
      this.updateSubscribers();

      setTimeout(() => {
        this.toasts.dequeue();
        this.updateSubscribers();
      }, this.postTimeout);
    }, this.timeout);
  }

  items() {
    // Svelte neeeds something indexable for {#each} so we can't use Queue's iterator :(
    if (this.arrayCache === null) {
      this.arrayCache = this.toasts.toArray();
    }
    return this.arrayCache;
  }
}
