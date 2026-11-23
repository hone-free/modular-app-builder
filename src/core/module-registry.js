export class ModuleRegistry {
  #modules = new Map();
  register(definition) {
    if (!definition?.id || typeof definition.mount !== 'function') throw new Error('تعریف ماژول معتبر نیست');
    if (this.#modules.has(definition.id)) throw new Error(`ماژول ${definition.id} قبلاً ثبت شده است`);
    this.#modules.set(definition.id, { ...definition, enabled: definition.enabled !== false, cleanup: null });
  }
  list() { return [...this.#modules.values()].map(({ cleanup, ...item }) => ({ ...item })); }
  get(id) { return this.#modules.get(id); }
  async activate(id, context, target) {
    const item = this.#modules.get(id);
    if (!item) throw new Error(`ماژول ${id} پیدا نشد`);
    if (!item.enabled) throw new Error(`ماژول ${item.name} غیرفعال است`);
    if (item.cleanup) return;
    item.cleanup = await item.mount(context, target);
  }
  async deactivate(id) {
    const item = this.#modules.get(id);
    if (!item) return;
    if (typeof item.cleanup === 'function') await item.cleanup();
    item.cleanup = null;
  }
  async setEnabled(id, enabled) {
    const item = this.#modules.get(id);
    if (!item) throw new Error(`ماژول ${id} پیدا نشد`);
    item.enabled = Boolean(enabled);
    if (!item.enabled) await this.deactivate(id);
  }
}
