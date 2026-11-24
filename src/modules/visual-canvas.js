
const ICON_PATHS = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9v12h14V9', 'M9 21v-7h6v7'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10'],
  settings: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 2.6-.2-.1a1.7 1.7 0 0 0-1.8.3l-.1.1h-3l-.1-.2a1.7 1.7 0 0 0-1.4-1l-.2-.1-1.5-2.6.1-.2a1.7 1.7 0 0 0-.3-1.8l-.1-.2v-3l.2-.1a1.7 1.7 0 0 0 1-1.4l.1-.2 2.6-1.5.2.1a1.7 1.7 0 0 0 1.8-.3l.2-.1h3l.1.2a1.7 1.7 0 0 0 1.4 1l.2.1 1.5 2.6-.1.2a1.7 1.7 0 0 0 .3 1.8l.1.2v3z'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16', 'm21 21-4.3-4.3'],
  cart: ['M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H6', 'M10 21h.01', 'M18 21h.01'],
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z'],
  star: ['m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  plus: ['M12 5v14', 'M5 12h14'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.7 9.7a16 16 0 0 0 6.6 6.6l1.3-1.3a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.7 2z'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm22 6-10 7L2 6'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  check: ['m5 12 4 4L19 6'],
  calendar: ['M8 2v4', 'M16 2v4', 'M3 9h18', 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z'],
  camera: ['M14 5l1.5 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5L10 5z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8']
};

const ICON_FILL_PATHS = {
  home: [1],
  user: [0, 1],
  settings: [0, 1],
  search: [0],
  heart: [0],
  star: [0],
  cart: [0],
  phone: [0],
  mail: [0],
  calendar: [3],
  camera: [0, 1]
};

function createIconElement(name, fillColor, strokeColor, size) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");

  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size || 36));
  svg.setAttribute("height", String(size || 36));
  svg.setAttribute("aria-hidden", "true");
  svg.style.display = "block";
  svg.style.overflow = "visible";

  const paths = ICON_PATHS[name] || ICON_PATHS.home;
  const fillIndexes = ICON_FILL_PATHS[name] || [];

  paths.forEach((d, index) => {
    const canFill = fillIndexes.includes(index);
    const path = document.createElementNS(ns, "path");

    path.setAttribute("d", canFill && !/[zZ]\s*$/.test(d) ? d + " Z" : d);
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");

    path.style.setProperty(
      "fill",
      canFill ? (fillColor || "none") : "none",
      "important"
    );

    path.style.setProperty(
      "stroke",
      strokeColor || "#263b5b",
      "important"
    );

    path.style.setProperty("stroke-width", "2", "important");
    path.style.setProperty("stroke-linecap", "round", "important");
    path.style.setProperty("stroke-linejoin", "round", "important");

    svg.appendChild(path);
  });

  return svg;
}

export function createVisualCanvas({ project, bus, assetStore }) {
  const imagePreviewDrafts = new Map();
  const assetUrlCache = new Map();

  function clearImagePreview(nodeId) {
    imagePreviewDrafts.delete(nodeId);
    draw();
  }

  function setImagePreview(nodeId, draft) {
    imagePreviewDrafts.set(nodeId, draft);
    draw();
  }
  let selectedId = null;
  let selectedIds = new Set();
  let multiSelectMode = false;
  let lastTap = { id: null, time: 0 };
  let gesture = null;
  let longPressTimer = null;
  let longPressed = false;
  let lastHandleTap = { id: null, time: 0 };

  const root = document.createElement('section');
  root.className = 'canvas-panel';

  root.innerHTML = `
    <div class="canvas-toolbar">
      <b class="canvas-title">طراحی صفحه اپلیکیشن</b>
      <div class="canvas-toolbar-actions">
        <div class="sort-menu-wrap">
          <button class="ghost" type="button" data-sort-toggle>مرتب‌سازی ▾</button>
          <div class="sort-menu" data-sort-menu hidden>
            <button type="button" data-sort="left">چپ‌چین همه</button>
            <button type="button" data-sort="center">وسط‌چین همه</button>
            <button type="button" data-sort="right">راست‌چین همه</button>
            <hr>
            <button type="button" data-sort="top">بالاچین همه</button>
            <button type="button" data-sort="middle">وسط‌چین عمودی همه</button>
            <button type="button" data-sort="bottom">پایین‌چین همه</button>
            <button type="button" data-multi-toggle>انتخاب چندگانه</button>
            <div class="sort-selection" data-selection-tools hidden>
              <small data-selection-count>۰ کنترلر انتخاب شده</small>
            </div>
          </div>
        </div>
        <button class="ghost" type="button" data-layers>لایه‌ها</button>
      </div>
    </div>
    <div class="canvas-viewport">
      <div class="canvas">
        <div class="nodes"></div>
      </div>
    </div>
  `;


  const floatingMenu = document.createElement('div');
  floatingMenu.className = 'control-floating-menu';
  floatingMenu.hidden = true;
  floatingMenu.innerHTML = `
    <button type="button" data-menu-action="settings">تنظیمات</button>
    <button type="button" data-menu-action="duplicate">تکثیر</button>
    <button type="button" data-menu-action="delete">حذف</button>
  `;
  document.body.append(floatingMenu);

  const canvas = root.querySelector(".canvas");
  const viewport = root.querySelector(".canvas-viewport");
  const nodes = root.querySelector(".nodes");

  canvas.addEventListener("pointerdown", event => {
    if (event.target !== canvas && event.target !== nodes) return;

    selectedId = null;
    selectedIds.clear();
    updateSelectionCount();

    draw();
    bus.emit("node:deselect");
  });

  const sortMenu = root.querySelector("[data-sort-menu]");
  const selectionTools = root.querySelector("[data-selection-tools]");
  const selectionCount = root.querySelector("[data-selection-count]");
  const layerButton = root.querySelector("[data-layers]");

  root.querySelector("[data-sort-toggle]").addEventListener("click", event => {
    event.stopPropagation();
    sortMenu.hidden = !sortMenu.hidden;
  });

  root.querySelector("[data-multi-toggle]").addEventListener("click", () => {
    multiSelectMode = !multiSelectMode;
    selectedIds.clear();
    selectedId = null;
    root.querySelector("[data-multi-toggle]").classList.toggle("active", multiSelectMode);
    selectionTools.hidden = !multiSelectMode;
    sortMenu.hidden = true;
    updateSelectionCount();
    draw();
  });

  root.querySelectorAll("[data-sort]").forEach(button => {
    button.addEventListener("click", () => {
      if (multiSelectMode) {
        alignSelected(button.dataset.sort);
      } else {
        alignAll(button.dataset.sort);
      }
      sortMenu.hidden = true;
    });
  });

  function alignAll(mode) {
    if (!project.nodes.length) return;
    const left = 15;
    const right = Math.max(15, canvas.clientWidth - 15);
    const center = canvas.clientWidth / 2;
    const top = 15;
    const bottom = Math.max(15, canvas.clientHeight - 15);
    const middle = canvas.clientHeight / 2;

    project.nodes.forEach(node => {
      const width = node.width || 120;
      const height = node.height || 45;

      if (mode === "top") node.y = top;
      else if (mode === "bottom") node.y = Math.max(0, bottom - height);
      else if (mode === "middle") node.y = Math.max(0, middle - height / 2);
      else {
        node.x = mode === "left" ? left :
          mode === "right" ? Math.max(0, right - width) :
          Math.max(0, center - width / 2);
      }
    });
    draw();
    bus.emit("project:changed");
  }

  function updateSelectionCount() {
    selectionCount.textContent = selectedIds.size + " کنترلر انتخاب شده";

    const labels = {
      left: "چپ‌چین",
      center: "وسط‌چین",
      right: "راست‌چین",
      top: "بالاچین",
      middle: "وسط‌چین عمودی",
      bottom: "پایین‌چین"
    };

    root.querySelectorAll("[data-sort]").forEach(button => {
      const label = labels[button.dataset.sort];
      button.textContent = multiSelectMode
        ? label + " انتخاب‌شده‌ها"
        : label + " همه";
      button.disabled = multiSelectMode && selectedIds.size < 2;
    });
  }

  function alignSelected(mode) {
    const items = project.nodes.filter(node => selectedIds.has(node.id));
    if (items.length < 2) return;
    if (["top", "middle", "bottom"].includes(mode)) {
      const top = Math.min(...items.map(node => node.y || 0));
      const bottom = Math.max(...items.map(node => (node.y || 0) + (node.height || 45)));
      const middle = (top + bottom) / 2;

      items.forEach(node => {
        const height = node.height || 45;
        node.y = mode === "top" ? top :
          mode === "bottom" ? bottom - height :
          middle - height / 2;
      });
    } else {
      const left = Math.min(...items.map(node => node.x || 0));
      const right = Math.max(...items.map(node => (node.x || 0) + (node.width || 120)));
      const center = (left + right) / 2;

      items.forEach(node => {
        const width = node.width || 120;
        node.x = mode === "left" ? left :
          mode === "right" ? right - width :
          center - width / 2;
      });
    }
    draw();
    bus.emit("project:changed");
  }

  const layersPanel = document.createElement("div");
  layersPanel.className = "layers-panel";
  layersPanel.hidden = true;
  root.append(layersPanel);

  function startLayerTouchDrag(event, draggedId, draggedRow) {
    const pointerId = event.pointerId;
    let changed = false;
    let lastOrder = "";

    draggedRow.classList.add("dragging");

    function clearTargets() {
      layersPanel.querySelectorAll(".layer-row").forEach(row => {
        row.classList.remove("drop-target");
      });
    }

    function onMove(e) {
      if (e.pointerId !== pointerId) return;
      e.preventDefault();

      const element = document.elementFromPoint(e.clientX, e.clientY);
      const target = element && element.closest(".layer-row");

      if (!target || !layersPanel.contains(target) ||
          target.dataset.layerId === draggedId) {
        clearTargets();
        return;
      }

      const targetId = target.dataset.layerId;
      const rect = target.getBoundingClientRect();
      const insertAfter = e.clientY > rect.top + rect.height / 2;

      const visibleIds = [...layersPanel.querySelectorAll(".layer-row")]
        .map(row => row.dataset.layerId);

      const from = visibleIds.indexOf(draggedId);
      if (from < 0) return;

      visibleIds.splice(from, 1);

      let destination = visibleIds.indexOf(targetId);
      if (destination < 0) return;
      if (insertAfter) destination++;

      visibleIds.splice(destination, 0, draggedId);

      const orderKey = visibleIds.join("|");
      if (orderKey === lastOrder ||
          orderKey === [...layersPanel.querySelectorAll(".layer-row")]
            .map(row => row.dataset.layerId).join("|")) {
        return;
      }

      lastOrder = orderKey;

      const byId = new Map(project.nodes.map(node => [node.id, node]));
      project.nodes = visibleIds.reverse()
        .map(id => byId.get(id))
        .filter(Boolean);

      changed = true;
      draw();
      drawLayers();

      const newDraggedRow = layersPanel.querySelector(
        '.layer-row[data-layer-id="' + draggedId + '"]'
      );
      if (newDraggedRow) newDraggedRow.classList.add("dragging");

      const newTargetRow = layersPanel.querySelector(
        '.layer-row[data-layer-id="' + targetId + '"]'
      );
      if (newTargetRow) newTargetRow.classList.add("drop-target");
    }

    function cleanup() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);

      const currentRow = layersPanel.querySelector(
        '.layer-row[data-layer-id="' + draggedId + '"]'
      );
      if (currentRow) currentRow.classList.remove("dragging");

      clearTargets();
      if (changed) bus.emit("project:changed");
    }

    function onUp(e) {
      if (e.pointerId === pointerId) cleanup();
    }

    function onCancel(e) {
      if (e.pointerId === pointerId) cleanup();
    }

    document.addEventListener("pointermove", onMove, { passive: false });
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onCancel);
  }

  function drawLayers() {
    layersPanel.innerHTML = "";
    const heading = document.createElement("b");
    heading.textContent = "مدیریت لایه‌ها";
    layersPanel.append(heading);

    [...project.nodes].reverse().forEach(node => {
      const row = document.createElement("div");
      row.className = "layer-row" + (node.id === selectedId ? " active" : "");
      row.draggable = true;
      row.dataset.layerId = node.id;
      row.addEventListener("dragstart", event => {
        event.dataTransfer.setData("text/plain", node.id);
        event.dataTransfer.effectAllowed = "move";
      });
      row.addEventListener("dragover", event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      });
      row.addEventListener("drop", event => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData("text/plain");
        const targetId = node.id;
        if (!draggedId || draggedId === targetId) return;
        const visibleIds = [...layersPanel.querySelectorAll(".layer-row")].map(item => item.dataset.layerId);
        const from = visibleIds.indexOf(draggedId);
        const to = visibleIds.indexOf(targetId);
        if (from < 0 || to < 0) return;
        visibleIds.splice(to, 0, visibleIds.splice(from, 1)[0]);
        const byId = new Map(project.nodes.map(item => [item.id, item]));
        project.nodes = visibleIds.reverse().map(id => byId.get(id)).filter(Boolean);
        draw();
        bus.emit("project:changed");
      });

      const name = document.createElement("button");
      name.type = "button";
      name.className = "layer-name";
      name.textContent = node.title || node.type;
      name.addEventListener("click", () => {
        selectedId = node.id;
        draw();
        bus.emit("node:select", node);
      });
      const dragHandle = document.createElement("button");
      dragHandle.type = "button";
      dragHandle.className = "layer-drag-handle";
      dragHandle.textContent = "⠿";
      dragHandle.title = "برای جابه‌جایی لمس کنید و بکشید";
      dragHandle.addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
        startLayerTouchDrag(event, node.id, row);
      });
      row.append(dragHandle, name);

      [["up", "↑"], ["down", "↓"], ["front", "⇈"], ["back", "⇊"]].forEach(([action, symbol]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "layer-action";
        button.textContent = symbol;
        button.title = {up:"یک لایه جلوتر", down:"یک لایه عقب‌تر", front:"بالاترین لایه", back:"پایین‌ترین لایه"}[action];
        button.addEventListener("click", () => moveLayer(node.id, action));
        row.append(button);
      });
      layersPanel.append(row);
    });
  }

  function moveLayer(id, action) {
    const index = project.nodes.findIndex(node => node.id === id);
    if (index < 0) return;
    const node = project.nodes.splice(index, 1)[0];
    if (action === "front") project.nodes.push(node);
    else if (action === "back") project.nodes.unshift(node);
    else if (action === "up") project.nodes.splice(Math.min(index + 1, project.nodes.length), 0, node);
    else project.nodes.splice(Math.max(index - 1, 0), 0, node);
    selectedId = id;
    draw();
    bus.emit("project:changed");
  }

  layerButton.addEventListener("click", event => {
    event.stopPropagation();
    layersPanel.hidden = !layersPanel.hidden;
    if (!layersPanel.hidden) drawLayers();
  });


  /* Close menus when tapping outside */
  document.addEventListener("pointerdown", event => {
    if (!root.contains(event.target)) return;

    const sortWrap = root.querySelector(".sort-menu-wrap");

    if (sortMenu && !sortMenu.hidden &&
        sortWrap && !sortWrap.contains(event.target)) {
      sortMenu.hidden = true;
    }

    if (layersPanel && !layersPanel.hidden &&
        !layersPanel.contains(event.target) &&
        event.target !== layerButton) {
      layersPanel.hidden = true;
    }
  });



  function startInlineEdit(node, el) {
    const keys = {
      text: 'text',
      button: 'label',
      input: 'placeholder',
      card: 'text'
    };

    const key = keys[node.type];
    if (!key) return;

    const config = node.config || (node.config = {});
    const defaults = {
      text: 'متن',
      button: 'دکمه',
      input: 'متن ورودی',
      card: 'کادر'
    };

    const editor = document.createElement('input');
    editor.type = 'text';
    editor.value = config[key] ?? defaults[node.type];
    editor.setAttribute('aria-label', 'ویرایش محتوای کنترلر');

    Object.assign(editor.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      zIndex: '30',
      border: '2px solid #2878e8',
      borderRadius: '5px',
      background: '#ffffff',
      color: '#202938',
      font: 'inherit',
      textAlign: 'center',
      padding: '4px',
      outline: 'none'
    });

    let finished = false;

    const finish = save => {
      if (finished) return;
      finished = true;

      if (save) {
        config[key] = editor.value;
        bus.emit('project:changed');
      }

      draw();
    };

    ['pointerdown', 'pointerup', 'click', 'dblclick'].forEach(type => {
      editor.addEventListener(type, event => event.stopPropagation());
    });

    editor.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        finish(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        finish(false);
      }
    });

    editor.addEventListener('blur', () => finish(true));

    el.append(editor);
    editor.focus();
    editor.select();
  }

  function showFloatingMenu(node, clientX, clientY) {
    selectedId = node.id;

    if (!selectedIds.has(node.id)) {
      selectedIds.clear();
      selectedIds.add(node.id);
    }

    updateSelectionCount();
    node && document.querySelectorAll('.control.selected').forEach(el => {
      el.classList.toggle('selected', selectedIds.has(el.dataset.id));
    });

    floatingMenu.style.position = 'fixed';
    floatingMenu.hidden = false;

    const width = floatingMenu.offsetWidth;
    const height = floatingMenu.offsetHeight;
    const left = Math.max(8, Math.min(
      clientX - width / 2, window.innerWidth - width - 8
    ));
    const top = clientY - height - 58 >= 8
      ? clientY - height - 58
      : Math.min(clientY + 12, window.innerHeight - height - 8);

    floatingMenu.style.left = left + 'px';
    floatingMenu.style.top = Math.max(8, top) + 'px';
  }

  document.addEventListener('pointerdown', event => {
    if (!floatingMenu.hidden &&
        !floatingMenu.contains(event.target) &&
        !event.target.closest('.control')) {
      floatingMenu.hidden = true;
    }
  });

  floatingMenu.addEventListener('click', event => {
    const action = event.target.closest('[data-menu-action]')?.dataset.menuAction;
    if (!action) return;

    const target = project.nodes.find(item => item.id === selectedId);
    if (!target) return;

    floatingMenu.hidden = true;


    if (action === 'settings') {
      bus.emit('node:edit', target);
      return;
    }

    const ids = selectedIds.has(target.id) && selectedIds.size > 1
      ? [...selectedIds]
      : [target.id];

    const selectedNodes = project.nodes.filter(item => ids.includes(item.id));

    if (action === 'duplicate') {
      const duplicateIds = new Set(ids);

      for (const item of selectedNodes) {
        if (!item.pairId) continue;

        project.nodes
          .filter(other => other.pairId === item.pairId)
          .forEach(other => duplicateIds.add(other.id));
      }

      const nodesToCopy = project.nodes.filter(item =>
        duplicateIds.has(item.id)
      );

      const pairIdMap = new Map();

      const copies = nodesToCopy.map(item => {
        const copy = JSON.parse(JSON.stringify(item));
        copy.id = crypto.randomUUID();
        copy.title = (item.title || item.type) + ' - کپی';
        copy.x = (item.x || 0) + 24;
        copy.y = (item.y || 0) + 24;

        if (item.pairId) {
          if (!pairIdMap.has(item.pairId)) {
            pairIdMap.set(item.pairId, crypto.randomUUID());
          }
          copy.pairId = pairIdMap.get(item.pairId);
        }

        return copy;
      });

      project.nodes.push(...copies);
      selectedIds = new Set(copies.map(item => item.id));
      selectedId = copies.find(item => item.type === 'input')?.id
        || copies[copies.length - 1]?.id || null;

      draw();
      bus.emit('project:changed');
      return;
    }

    if (action === 'delete') {
      if (!window.confirm('آیا از حذف کنترلرهای انتخاب‌شده مطمئن هستید؟')) return;

      const deleteIds = new Set(ids);
      const selectedNodes = project.nodes.filter(item => ids.includes(item.id));

      for (const item of selectedNodes) {
        if (!item.pairId) continue;

        if (item.type === 'input') {
          project.nodes
            .filter(other => other.pairId === item.pairId)
            .forEach(other => deleteIds.add(other.id));
        } else if (item.type === 'text') {
          const linkedInput = project.nodes.find(
            other => other.pairId === item.pairId && other.type === 'input'
          );

          if (linkedInput && !ids.includes(linkedInput.id)) {
            delete linkedInput.pairId;
            if (linkedInput.config) delete linkedInput.config.label;
          }
        }
      }

      project.nodes = project.nodes.filter(item => !deleteIds.has(item.id));
      selectedIds.clear();
      selectedId = null;
      draw();
      bus.emit('project:changed');
      bus.emit('node:deselect');
    }
  });

  function draw() {
    nodes.innerHTML = '';

    for (const node of project.nodes) {
      const el = document.createElement('div');
      el.className = `control control-${node.type}`;
      el.dataset.id = node.id;

      if (node.id === selectedId || selectedIds.has(node.id)) {
        el.classList.add('selected');
      }

      el.style.left = `${node.x || 0}px`;
      el.style.top = `${node.y || 0}px`;
      el.style.width = `${node.width || 120}px`;
      el.style.height = `${node.height || 45}px`;
      el.style.zIndex = String(project.nodes.indexOf(node) + 1);

      const config = node.config || (node.config = {});
      const value =
        node.type === 'button' ? (config.label ?? '') :
        node.type === 'input' ? (config.placeholder ?? '') :
        node.type === 'image' ? (config.alt ?? '') :
        (config.text ?? '');

      if (node.type === 'icon') {
        const icon = document.createElement('div');
        icon.className = 'real-icon';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.width = '100%';
        icon.style.height = '100%';
        icon.style.backgroundColor = config.outerColor || 'transparent';
        icon.style.borderRadius = (config.outerRadius ?? 0) + 'px';
        icon.append(createIconElement(
          config.name || 'home',
          config.fillColor || '#ffffff',
          config.strokeColor || config.color || '#263b5b',
          config.iconSize || 36
        ));
        el.append(icon);
      } else if (node.type === 'button') {
        const button = document.createElement('button');
        button.className = 'real-button';
        button.disabled = true;

        const position = config.iconPosition || 'right';
        const showIcon = config.iconEnabled === true;

        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.gap = '8px';
        button.style.direction = 'rtl';

        const label = document.createElement('span');
        label.textContent = value || 'دکمه';

        if (showIcon) {
          const iconWrap = document.createElement('span');
          iconWrap.className = 'button-icon-wrap';
          iconWrap.style.display = 'inline-flex';
          iconWrap.style.alignItems = 'center';
          iconWrap.style.justifyContent = 'center';
          iconWrap.style.flex = '0 0 auto';
          iconWrap.style.padding = '0';
          iconWrap.style.backgroundColor = 'transparent';

          const icon = createIconElement(
            config.iconName || 'home',
            config.iconFillColor || '#ffffff',
            config.iconColor || '#263b5b',
            config.iconSize || 22
          );

          iconWrap.append(icon);

          if (position === 'only') {
            button.append(iconWrap);
          } else if (position === 'left') {
            button.append(label, iconWrap);
          } else {
            button.append(iconWrap, label);
          }
        } else {
          button.append(label);
        }

        el.append(button);
      } else if (node.type === 'input') {
        const input = document.createElement('input');
        input.placeholder = value || 'متن ورودی';
        input.disabled = true;
        el.append(input);
      } else if (node.type === 'image') {
        const image = document.createElement('div');
        image.className = 'real-image';

        const draft = imagePreviewDrafts.get(node.id);
        const source = draft || config;
        const assetId = source.assetId;
        const imageSrc = source.src;

        if (imageSrc || assetId) {
          const picture = document.createElement('img');
          picture.alt = config.alt || '';
          picture.style.width = '100%';
          picture.style.height = '100%';
          picture.style.objectFit = 'contain';
          image.append(picture);

          if (imageSrc) {
            picture.src = imageSrc;
          } else if (assetId && assetStore) {
            const cachedUrl = assetUrlCache.get(assetId);

            if (cachedUrl) {
              picture.src = cachedUrl;
            } else {
              assetStore.getImage(assetId).then(record => {
                if (!record || !picture.isConnected) return;

                let objectUrl = assetUrlCache.get(assetId);
                if (!objectUrl) {
                  objectUrl = URL.createObjectURL(record.blob);
                  assetUrlCache.set(assetId, objectUrl);
                }

                picture.src = objectUrl;
              }).catch(error => {
                console.error('خطا در بارگذاری تصویر:', error);
              });
            }
          }
        } else {
          image.textContent = '▧';
        }

        el.append(image);
      } else if (node.type === 'card') {
        const card = document.createElement('div');
        card.className = 'real-card';
        card.textContent = value;
        el.append(card);
      } else {
        const text = document.createElement('div');
        text.className = 'real-text';
        text.textContent = value || 'متن';
        el.append(text);
      }

      // اعمال تنظیمات ظاهری ذخیره‌شده روی کنترلر
      const target = el.firstElementChild;

      if (target) {
        if (config.fontSize != null) {
          target.style.fontSize = `${config.fontSize}px`;
        }
        if (config.color) target.style.color = config.color;
        if (config.background) target.style.backgroundColor = config.background;
        if (config.radius != null) {
          target.style.borderRadius = `${config.radius}px`;
        }
        if (config.textAlign) {
          target.style.textAlign = config.textAlign;
          if (node.type === 'card') {
            target.style.justifyContent =
              config.textAlign === 'right' ? 'flex-start' :
              config.textAlign === 'left' ? 'flex-end' : 'center';
          }
        }

        if (config.borderWidth != null) {
          const width = Math.max(0, Number(config.borderWidth) || 0);
          target.style.border = width === 0
            ? 'none'
            : `${width}px ${config.borderStyle || 'solid'} ${config.borderColor || '#dce1e8'}`;
        }

        // شفافیت کل کنترلر
        const opacity = Math.min(100, Math.max(0, Number(config.opacity ?? 100)));
        el.style.opacity = String(opacity / 100);

        // سایه کنترلر
        if (config.shadowEnabled) {
          const blur = Math.max(0, Number(config.shadowBlur ?? 8));
          const alpha = Math.min(100, Math.max(0, Number(config.shadowOpacity ?? 25))) / 100;
          el.style.boxShadow = `0 3px ${blur}px rgba(0, 0, 0, ${alpha})`;
        } else {
          el.style.boxShadow = 'none';
        }

        // فاصله داخلی محتوا
        target.style.padding = `${Math.max(0, Number(config.padding ?? (node.type === 'input' ? 8 : 0)))}px`;
        if (node.type === 'input') {
          target.style.boxSizing = 'border-box';
          target.style.minWidth = '0';
          target.style.maxWidth = '100%';
          target.style.direction = 'rtl';
          target.style.textAlign = config.textAlign || 'right';
        }

        if (node.type === 'image' && config.src) {
          const picture = target.querySelector('img');
          if (picture) {
            picture.style.width = '100%';
            picture.style.height = '100%';
            picture.style.objectFit = 'contain';
          }
        }
      }

      if (node.id === selectedId) {
        const handle = document.createElement('span');
        handle.className = 'resize-handle';
        handle.dataset.resize = 'true';
        el.append(handle);
      }

      el.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;

        if (!floatingMenu.contains(event.target)) {
          floatingMenu.hidden = true;
        }

        if (multiSelectMode) {
          event.preventDefault();
          event.stopPropagation();
          if (selectedIds.has(node.id)) {
            selectedIds.delete(node.id);
            selectedId = null;
          } else {
            selectedIds.add(node.id);
            selectedId = node.id;
          }
          updateSelectionCount();
          draw();
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        clearTimeout(longPressTimer);
        longPressed = false;

        selectedId = node.id;
        selectedIds.clear();

        if (node.pairId) {
          project.nodes
            .filter(item => item.pairId === node.pairId)
            .forEach(item => selectedIds.add(item.id));
        } else {
          selectedIds.add(node.id);
        }

        document.querySelectorAll('.control.selected').forEach(item => {
          item.classList.remove('selected');
        });
        el.classList.add('selected');
        updateSelectionCount();

        const isResize = event.target.closest('[data-resize]');

        gesture = {
          node,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originalX: node.x || 0,
          originalY: node.y || 0,
          originalWidth: node.width || 120,
          originalHeight: node.height || 45,
          pairNodes: node.pairId
            ? project.nodes
                .filter(item => item.pairId === node.pairId)
                .map(item => ({
                  node: item,
                  x: item.x || 0,
                  y: item.y || 0
                }))
            : [],
          mode: isResize ? 'resize' : 'pending',
          handleTap: Boolean(isResize),
          moved: false,
          element: el
        };

        el.setPointerCapture(event.pointerId);

        longPressTimer = setTimeout(() => {
          if (!gesture || gesture.moved || gesture.mode !== 'pending') return;

          longPressed = true;
          selectedId = node.id;
          el.classList.add('selected');
          showFloatingMenu(node, event.clientX, event.clientY);
        }, 600);
      });

      el.addEventListener('pointermove', event => {
        if (!gesture || gesture.pointerId !== event.pointerId) return;

        const dx = event.clientX - gesture.startX;
        const dy = event.clientY - gesture.startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          gesture.moved = true;
          clearTimeout(longPressTimer);

          if (gesture.mode === 'pending') {
            gesture.mode = 'drag';
          }
        }

        if (gesture.mode === 'drag') {
          node.x = Math.max(0, gesture.originalX + dx);
          node.y = Math.max(0, gesture.originalY + dy);

          el.style.left = `${node.x}px`;
          el.style.top = `${node.y}px`;

          const pairedInput = node.type === 'input'
            ? node
            : gesture.pairNodes.find(item => item.node.type === 'input')?.node;

          if (!pairedInput?.independentMove) {
            for (const item of gesture.pairNodes) {
              if (item.node.id === node.id) continue;

              item.node.x = Math.max(0, item.x + dx);
              item.node.y = Math.max(0, item.y + dy);

              const relatedElement = nodes.querySelector(
                `[data-id="${item.node.id}"]`
              );

              if (relatedElement) {
                relatedElement.style.left = `${item.node.x}px`;
                relatedElement.style.top = `${item.node.y}px`;
              }
            }
          }
        }

        if (gesture.mode === 'resize') {
          node.width = Math.max(45, gesture.originalWidth + dx);
          node.height = Math.max(30, gesture.originalHeight + dy);

          el.style.width = `${node.width}px`;
          el.style.height = `${node.height}px`;
        }
      });

      el.addEventListener('pointerup', event => {
        if (!gesture || gesture.pointerId !== event.pointerId) return;

        clearTimeout(longPressTimer);

        const current = gesture;
        gesture = null;

        if (current.mode === 'drag') {
          lastHandleTap = { id: null, time: 0 };
          selectedId = node.id;
          bus.emit('project:changed');
          draw();
          return;
        }

        if (current.mode === 'resize') {
          if (!current.moved && current.handleTap) {
            const now = Date.now();

            if (
              lastHandleTap.id === node.id &&
              now - lastHandleTap.time < 350
            ) {
              node.width = node.initialWidth || 120;
              node.height = node.initialHeight || 45;
              lastHandleTap = { id: null, time: 0 };
            } else {
              lastHandleTap = { id: node.id, time: now };
            }
          } else if (current.moved) {
            lastHandleTap = { id: null, time: 0 };
          }

          selectedId = node.id;
          bus.emit('project:changed');
          draw();
          return;
        }

        if (longPressed) {
          longPressed = false;
          return;
        }

        const now = Date.now();
        const isDoubleTap =
          lastTap.id === node.id &&
          now - lastTap.time < 350;

        selectedId = node.id;
        draw();

        if (isDoubleTap) {
          lastTap = { id: null, time: 0 };
          setTimeout(() => {
            const freshElement = [...nodes.querySelectorAll('.control')]
              .find(item => item.dataset.id === node.id);
            if (node.type === 'image') {
          bus.emit('node:edit', node);
        } else if (freshElement) {
          startInlineEdit(node, freshElement);
        }
          }, 0);
        } else {
          lastTap = { id: node.id, time: now };
          bus.emit('node:select', node);
        }
      });

      el.addEventListener('pointercancel', () => {
        clearTimeout(longPressTimer);
        gesture = null;
        longPressed = false;
      });

      el.addEventListener('contextmenu', event => {
        event.preventDefault();
        showFloatingMenu(node, event.clientX, event.clientY);
      });

      nodes.append(el);
    }
    drawLayers();
  }


  draw();

  return {
    element: root,
    redraw: draw,
    setImagePreview,
    clearImagePreview,
    getSelected: () => project.nodes.find(node => node.id === selectedId),
    getVisibleCenter: (width, height) => ({
      x: Math.max(0, Math.round((canvas.clientWidth - width) / 2)),
      y: Math.max(0, Math.round(viewport.scrollTop + (viewport.clientHeight - height) / 2))
    }),
    select: id => {
      selectedId = id;
      draw();
    }
  };
}
