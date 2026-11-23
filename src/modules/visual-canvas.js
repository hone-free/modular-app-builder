const nodeTitle = { text: 'متن', button: 'دکمه', image: 'تصویر', input: 'فیلد ورودی', card: 'کادر' };
export function createVisualCanvas({ project, bus }) {
  let selectedId = null;
  let drag = null;
  const root = document.createElement('section');
  root.className = 'canvas-panel';
  root.innerHTML = `<div class="canvas-toolbar"><div><b>بوم طراحی</b><small>بلوک‌ها را انتخاب و جابه‌جا کن؛ برای اتصال، از دسته کوچک پایین بلوک استفاده کن.</small></div><button class="ghost" data-fit>مرتب‌سازی</button></div><div class="canvas-viewport"><div class="canvas" role="application" aria-label="محیط بصری طراحی"><svg class="wires"></svg><div class="nodes"></div></div></div>`;
  const canvas = root.querySelector('.canvas');
  const nodes = root.querySelector('.nodes');
  const wires = root.querySelector('.wires');
  const draw = () => {
    nodes.innerHTML = '';
    for (const node of project.nodes) {
      const el = document.createElement('article');
      el.className = `node node-${node.type}${node.id === selectedId ? ' selected' : ''}`;
      el.style.left = `${node.x}px`; el.style.top = `${node.y}px`;
      el.dataset.id = node.id;
      const value = node.config.text || node.config.label || node.config.placeholder || node.config.alt || nodeTitle[node.type];
      el.innerHTML = `<div class="node-head"><span class="node-symbol">${node.type === 'button' ? '▰' : node.type === 'image' ? '▧' : node.type === 'input' ? '⌨' : '▤'}</span><b>${nodeTitle[node.type] || node.type}</b><span class="node-menu">⋮</span></div><div class="node-body"></div><div class="node-foot"><span>خروجی</span><button class="port" aria-label="اتصال بلوک"></button></div>`;
      const body = el.querySelector('.node-body');
      if (node.type === 'button') { const b = document.createElement('button'); b.textContent = value; b.disabled = true; body.append(b); }
      else if (node.type === 'input') { const i = document.createElement('input'); i.placeholder = value; i.disabled = true; body.append(i); }
      else if (node.type === 'image') { const p = document.createElement('div'); p.className = 'image-placeholder'; p.textContent = 'محل نمایش تصویر'; body.append(p); }
      else { const p = document.createElement('p'); p.textContent = value; body.append(p); }
      el.addEventListener('pointerdown', e => {
        if (e.target.closest('.port')) return;
        selectedId = node.id; drag = { id: node.id, sx: e.clientX, sy: e.clientY, ox: node.x, oy: node.y };
        el.setPointerCapture?.(e.pointerId); draw(); bus.emit('node:selected', node);
      });
      el.querySelector('.port').addEventListener('click', e => { e.stopPropagation(); bus.emit('node:connect', node); });
      nodes.append(el);
    }
    drawWires();
  };
  const drawWires = () => {
    wires.setAttribute('width', '1200'); wires.setAttribute('height', '900');
    wires.innerHTML = project.edges.map(edge => {
      const a = project.nodes.find(n => n.id === edge.from), b = project.nodes.find(n => n.id === edge.to);
      if (!a || !b) return '';
      const x1 = a.x + 125, y1 = a.y + 125, x2 = b.x + 125, y2 = b.y;
      const mid = (x1 + x2) / 2;
      return `<path d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2 - 25}, ${x2} ${y2}" />`;
    }).join('');
  };
  root.addEventListener('pointermove', e => {
    if (!drag) return;
    const node = project.nodes.find(n => n.id === drag.id); if (!node) return;
    node.x = Math.max(10, drag.ox + e.clientX - drag.sx); node.y = Math.max(10, drag.oy + e.clientY - drag.sy);
    const el = nodes.querySelector(`[data-id="${node.id}"]`); if (el) { el.style.left = `${node.x}px`; el.style.top = `${node.y}px`; }
    drawWires(); bus.emit('project:changed');
  });
  root.addEventListener('pointerup', () => { drag = null; });
  root.querySelector('[data-fit]').addEventListener('click', () => {
    project.nodes.forEach((n, i) => { n.x = 80 + (i % 3) * 290; n.y = 70 + Math.floor(i / 3) * 190; }); draw(); bus.emit('project:changed');
  });
  draw();
  return { element: root, redraw: draw, getSelected: () => project.nodes.find(n => n.id === selectedId), select: id => { selectedId = id; draw(); } };
}
