import './style.css';
import { EventBus } from './core/event-bus.js';
import { ModuleRegistry } from './core/module-registry.js';
import { ProjectStore } from './core/project-store.js';
import { createVisualCanvas } from './modules/visual-canvas.js';
import { createInspector } from './modules/inspector.js';

const app = document.querySelector('#app');
const bus = new EventBus(); const registry = new ModuleRegistry(); const store = new ProjectStore();
let project = store.load(); let connectFrom = null;
app.innerHTML = `<header class="topbar"><div class="brand"><div class="logo">M</div><div><strong>اپلیکیشن‌ساز ماژولار</strong><small>نسخه آزمایشی ۰.۱</small></div></div><div class="top-actions"><span class="save-state" id="saveState">ذخیره خودکار فعال</span><button class="ghost" id="resetProject">پروژه جدید</button></div></header><main><section class="workspace"><div class="left-tools"><div class="section-title"><b>ماژول‌ها</b><small>برای افزودن به بوم انتخاب کن</small></div><button class="tool" data-add="text"><span>▤</span><div><b>متن</b><small>نمایش نوشته</small></div><i>+</i></button><button class="tool" data-add="button"><span>▰</span><div><b>دکمه</b><small>عنصر تعاملی</small></div><i>+</i></button><button class="tool" data-add="image"><span>▧</span><div><b>تصویر</b><small>جایگاه تصویر</small></div><i>+</i></button><button class="tool" data-add="input"><span>⌨</span><div><b>فیلد ورودی</b><small>دریافت اطلاعات</small></div><i>+</i></button><button class="tool" data-add="card"><span>▢</span><div><b>کادر</b><small>گروه‌بندی محتوا</small></div><i>+</i></button><div class="module-note"><b>سیستم ماژولار</b><p>هر بلوک یک شناسه و تنظیمات مستقل دارد. ارتباط بلوک‌ها در نسخه‌های بعدی گسترش می‌یابد.</p></div></div><div id="canvasMount"></div><div id="inspectorMount"></div></section><footer><span>هسته مرکزی</span><span id="moduleCount">۰ ماژول</span><span>ذخیره محلی روی همین دستگاه</span></footer></main>`;

const canvas = createVisualCanvas({ project, bus });
const inspector = createInspector({ project, bus, canvas });
document.querySelector('#canvasMount').append(canvas.element);
document.querySelector('#inspectorMount').append(inspector);
function updateCount() { document.querySelector('#moduleCount').textContent = `${project.nodes.length} بلوک`; }
function save() { store.save(project); document.querySelector('#saveState').textContent = 'ذخیره شد'; updateCount(); }
bus.on('project:changed', save);
function addNode(type) {
  const defaults = { text: { title: 'متن جدید', config: { text: 'متن خود را وارد کنید' } }, button: { title: 'دکمه جدید', config: { label: 'دکمه' } }, image: { title: 'تصویر جدید', config: { alt: 'تصویر' } }, input: { title: 'فیلد ورودی', config: { placeholder: 'متن ورودی' } }, card: { title: 'کادر جدید', config: { text: 'محتوای کادر' } } };
  const d = defaults[type]; if (!d) return;
  const node = { id: crypto.randomUUID(), type, title: d.title, x: 90 + (project.nodes.length % 3) * 285, y: 80 + Math.floor(project.nodes.length / 3) * 185, config: { ...d.config } };
  project.nodes.push(node); canvas.redraw(); canvas.select(node.id); bus.emit('node:selected', node); save();
}
document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addNode(button.dataset.add)));
bus.on('node:connect', node => {
  if (!connectFrom) { connectFrom = node.id; document.querySelector('#saveState').textContent = 'حالا خروجی بلوک مقصد را انتخاب کن'; return; }
  if (connectFrom !== node.id && !project.edges.some(e => e.from === connectFrom && e.to === node.id)) project.edges.push({ from: connectFrom, to: node.id });
  connectFrom = null; canvas.redraw(); save();
});
document.querySelector('#resetProject').addEventListener('click', () => {
  if (!confirm('پروژه فعلی با یک پروژه نمونه جایگزین شود؟')) return;
  project = store.reset(); location.reload();
});
updateCount();
