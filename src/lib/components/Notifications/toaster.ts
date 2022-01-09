
import Queue from 'mnemonist/queue';

export class Toaster<T> {
  readonly timeout: number;
  private toasts: Queue<T> = new Queue();
  private subscribers: Map<number, Function> = new Map();
  private subCount: number = 0;
  private arrayCache: T[] | null = null;

  constructor(timeout: number = 1000) {
    this.timeout = timeout;
  }

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
    this.toasts.enqueue(item);
    this.updateSubscribers();

    // this is safe as long as the timeout never changes
    // which means we don't have to bother with IDs or anything
    setTimeout(() => {
      this.toasts.dequeue();
      this.updateSubscribers();
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
