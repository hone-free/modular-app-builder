import './style.css';
import { EventBus } from './core/event-bus.js';
import { ModuleRegistry } from './core/module-registry.js';
import { ProjectStore } from './core/project-store.js';
import { AssetStore } from './core/asset-store.js';
import { createVisualCanvas } from './modules/visual-canvas.js';
import { createInspector } from './modules/inspector.js';

const app = document.querySelector('#app');
const bus = new EventBus(); const registry = new ModuleRegistry(); const store = new ProjectStore();
let project = store.load(); let connectFrom = null;
app.innerHTML = `<header class="topbar"><div class="brand"><div class="logo">M</div><div><strong>اپلیکیشن‌ساز ماژولار</strong><small>نسخه آزمایشی ۰.۱</small></div></div><div class="top-actions"><span class="save-state" id="saveState">ذخیره خودکار فعال</span><button class="ghost" id="resetProject">پروژه جدید</button></div></header><main><section class="workspace"><div class="left-tools"><div class="section-title"><b>ماژول‌ها</b><small>برای افزودن به بوم انتخاب کن</small></div><button class="tool" data-add="text"><span>▤</span><div><b>متن</b><small>نمایش نوشته</small></div><i>+</i></button><button class="tool" data-add="button"><span>▰</span><div><b>دکمه</b><small>عنصر تعاملی</small></div><i>+</i></button><button class="tool" data-add="image"><span>▧</span><div><b>تصویر</b><small>جایگاه تصویر</small></div><i>+</i></button><button class="tool" data-add="input"><span>⌨</span><div><b>فیلد ورودی</b><small>دریافت اطلاعات</small></div><i>+</i></button><button class="tool" data-add="card"><span>▢</span><div><b>کادر</b><small>گروه‌بندی محتوا</small></div><i>+</i></button><button class="tool" data-add="icon"><span>✧</span><div><b>آیکون</b><small>نمایش نماد گرافیکی</small></div><i>+</i></button><div class="module-note"><b>سیستم ماژولار</b><p>هر بلوک یک شناسه و تنظیمات مستقل دارد. ارتباط بلوک‌ها در نسخه‌های بعدی گسترش می‌یابد.</p></div></div><div id="canvasMount"></div><div id="inspectorMount"></div></section><footer><span>هسته مرکزی</span><span id="moduleCount">۰ ماژول</span><span>ذخیره محلی روی همین دستگاه</span></footer></main>`;

const assetStore = new AssetStore();
const canvas = createVisualCanvas({ project, bus, assetStore });
const inspector = createInspector({ project, bus, canvas, assetStore });
document.querySelector('#canvasMount').append(canvas.element);
document.querySelector('#inspectorMount').append(inspector);
function updateCount() { document.querySelector('#moduleCount').textContent = `${project.nodes.length} بلوک`; }
function save() { store.save(project); document.querySelector('#saveState').textContent = 'ذخیره شد'; updateCount(); }
bus.on('project:changed', save);
function addNode(type) {
  const defaults = {
    text: {
      prefix: 'Label',
      width: 160,
      height: 40,
      config: { text: 'متن خود را وارد کنید' }
    },
    button: {
      prefix: 'Button',
      width: 120,
      height: 48,
      config: {
        label: 'دکمه',
        iconEnabled: false,
        iconName: 'home',
        iconPosition: 'right',
        iconSize: 22,
        iconColor: '#263b5b'
      }
    },
    image: {
      prefix: 'PictureBox',
      width: 120,
      height: 100,
      config: { alt: 'تصویر' }
    },
    input: {
      prefix: 'TextBox',
      width: 180,
      height: 48,
      config: { placeholder: 'متن ورودی' }
    },
    card: {
      prefix: 'Panel',
      width: 180,
      height: 100,
      config: { text: 'محتوای کادر' }
    },
    icon: {
      prefix: 'Icon',
      width: 64,
      height: 64,
      config: {
        name: 'home',
        iconSize: 36,
        strokeColor: '#263b5b',
        fillColor: '#ffffff'
      }
    }
  };

  const d = defaults[type];
  if (!d) return;

  project.nodeCounters ||= {};
  const existingCount = project.nodes.filter(n => n.type === type).length;
  project.nodeCounters[type] = Math.max(
    project.nodeCounters[type] || 0,
    existingCount
  ) + 1;

  const number = project.nodeCounters[type];
  const title = `${d.prefix} ${number}`;

  const node = {
    id: crypto.randomUUID(),
    type,
    title,
    ...canvas.getVisibleCenter(d.width, d.height),
    width: d.width,
    height: d.height,
    initialWidth: d.width,
    initialHeight: d.height,
    config: { ...d.config }
  };

  if (type === 'input') {
    const pairId = crypto.randomUUID();
    node.pairId = pairId;
    node.config.label = node.config.label || 'عنوان فیلد';

    const labelNode = {
      id: crypto.randomUUID(),
      pairId,
      type: 'text',
      title: `${title} Label`,
      x: node.x,
      y: Math.max(0, node.y - 29),
      width: node.width,
      height: 24,
      initialWidth: node.width,
      initialHeight: 24,
      config: {
        text: node.config.label,
        textAlign: 'right',
        fontSize: 14
      }
    };

    project.nodes.push(labelNode, node);
  } else {
    project.nodes.push(node);
  }

  canvas.redraw();
  canvas.select(node.id);
  bus.emit('node:selected', node);
  save();
}

const leftTools = document.querySelector('.left-tools');
const fab = document.createElement('button');
fab.className = 'fab-add';
fab.id = 'toggleModules';
fab.type = 'button';
fab.setAttribute('aria-label', 'افزودن ماژول');
fab.textContent = '+';

const drawer = document.createElement('div');
drawer.className = 'module-drawer';
drawer.id = 'moduleDrawer';

const drawerTitle = document.createElement('div');
drawerTitle.className = 'drawer-title';
drawerTitle.textContent = 'افزودن ماژول';
drawer.append(drawerTitle);

leftTools.querySelectorAll('[data-add]').forEach(original => {
  const item = original.cloneNode(true);
  item.addEventListener('click', () => {
    addNode(item.dataset.add);
    drawer.classList.remove('open');
  });
  drawer.append(item);
});

document.querySelector('.workspace').append(fab, drawer);

fab.addEventListener('click', event => {
  event.stopPropagation();
  drawer.classList.toggle('open');
});
drawer.addEventListener('click', event => event.stopPropagation());
document.addEventListener('click', () => drawer.classList.remove('open'));

leftTools.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addNode(button.dataset.add)));
bus.on('node:connect', node => {
  if (!connectFrom) { connectFrom = node.id; document.querySelector('#saveState').textContent = 'حالا خروجی بلوک مقصد را انتخاب کن'; return; }
  if (connectFrom !== node.id && !project.edges.some(e => e.from === connectFrom && e.to === node.id)) project.edges.push({ from: connectFrom, to: node.id });
  connectFrom = null; canvas.redraw(); save();
});
document.querySelector('#resetProject').addEventListener('click', () => {
  if (!confirm('پروژه فعلی با یک پروژه کاملاً خالی جایگزین شود؟')) return;
  project = store.reset(); location.reload();
});
updateCount();
