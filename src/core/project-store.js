const KEY = 'mab.modular.project.v1';
const starter = () => ({
  id: crypto.randomUUID(),
  name: 'پروژه من',
  updatedAt: new Date().toISOString(),
  nodes: [],
  edges: []
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
