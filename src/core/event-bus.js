export class EventBus {
  #events = new Map();
  on(name, handler) {
    if (!this.#events.has(name)) this.#events.set(name, new Set());
    this.#events.get(name).add(handler);
    return () => this.#events.get(name)?.delete(handler);
  }
  emit(name, payload) {
    for (const handler of this.#events.get(name) || []) handler(payload);
  }
}
