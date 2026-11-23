const KEY = 'mab.modular.project.v1';
const starter = () => ({
  id: crypto.randomUUID(), name: 'پروژه من', updatedAt: new Date().toISOString(),
  nodes: [
    { id: crypto.randomUUID(), type: 'text', title: 'متن خوش‌آمدگویی', x: 100, y: 95, config: { text: 'به اپلیکیشن من خوش آمدید' } },
    { id: crypto.randomUUID(), type: 'button', title: 'دکمه شروع', x: 390, y: 225, config: { label: 'شروع' } }
  ], edges: []
});
export class ProjectStore {
  load() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : starter(); }
    catch { return starter(); }
  }
  save(project) {
    project.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(project));
    return project;
  }
  reset() { const project = starter(); this.save(project); return project; }
}
