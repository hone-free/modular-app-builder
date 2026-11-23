export function createInspector({ project, bus, canvas }) {
  const root = document.createElement('aside'); root.className = 'inspector';
  const render = node => {
    if (!node) { root.innerHTML = '<h3>مشخصات بلوک</h3><p class="muted">برای ویرایش، یک بلوک را انتخاب کن.</p>'; return; }
    const valueKey = node.type === 'button' ? 'label' : node.type === 'input' ? 'placeholder' : 'text';
    const value = node.config[valueKey] ?? '';
    root.innerHTML = `<h3>مشخصات بلوک</h3><label>نام بلوک<input data-title value=""></label><label>${node.type === 'button' ? 'متن دکمه' : node.type === 'input' ? 'متن راهنما' : 'محتوا'}<textarea data-value rows="3"></textarea></label><div class="two"><label>موقعیت افقی<input data-x type="number"></label><label>موقعیت عمودی<input data-y type="number"></label></div><button class="danger" data-delete>حذف بلوک</button>`;
    root.querySelector('[data-title]').value = node.title;
    root.querySelector('[data-value]').value = value;
    root.querySelector('[data-x]').value = node.x; root.querySelector('[data-y]').value = node.y;
    root.querySelector('[data-title]').addEventListener('input', e => { node.title = e.target.value; bus.emit('project:changed'); });
    root.querySelector('[data-value]').addEventListener('input', e => { node.config[valueKey] = e.target.value; canvas.redraw(); bus.emit('project:changed'); });
    for (const key of ['x','y']) root.querySelector(`[data-${key}]`).addEventListener('change', e => { node[key] = Number(e.target.value) || 0; canvas.redraw(); bus.emit('project:changed'); });
    root.querySelector('[data-delete]').addEventListener('click', () => {
      project.nodes = project.nodes.filter(n => n.id !== node.id);
      project.edges = project.edges.filter(e => e.from !== node.id && e.to !== node.id);
      canvas.select(null); render(null); bus.emit('project:changed');
    });
  };
  bus.on('node:selected', render); render(null);
  return root;
}
