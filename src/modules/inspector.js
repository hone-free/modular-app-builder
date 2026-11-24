export function createInspector({ project, bus, canvas, assetStore }) {
  const root = document.createElement('aside');
  root.className = 'inspector';
  root.hidden = true;

  let activeNode = null;
  let mode = 'edit';
  let originalNode = null;
  let imageDraft = null;

  const escapeHTML = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  function save() {
    canvas.redraw();
    bus.emit('project:changed');
  }

  function input(label, key, value, type = 'text') {
    return `
      <label class="builder-field">
        ${label}
        <input data-key="${key}" type="${type}"
          value="${escapeHTML(value)}">
      </label>`;
  }

  function select(label, key, value, options) {
    return `
      <label class="builder-field">
        ${label}
        <select data-key="${key}">
          ${options.map(option => `
            <option value="${option.value}"
              ${value === option.value ? 'selected' : ''}>
              ${option.label}
            </option>
          `).join('')}
        </select>
      </label>`;
  }

  async function discardImageDraft() {
    const nodeId = activeNode?.id;
    const tempAssetId = imageDraft?.tempAssetId;

    imageDraft = null;

    if (nodeId && canvas.clearImagePreview) {
      canvas.clearImagePreview(nodeId);
    }

    if (tempAssetId && assetStore) {
      try {
        await assetStore.deleteImage(tempAssetId);
      } catch (error) {
        console.error('خطا در پاک‌کردن تصویر موقت:', error);
      }
    }
  }

  function closePanel() {
    discardImageDraft();
    activeNode = null;
    root.hidden = true;
    root.classList.remove('is-open');
  }

  document.addEventListener("pointerdown", event => {
    if (
      !root.hidden &&
      !root.contains(event.target) &&
      (event.target.closest('.control') ||
       !event.target.closest('#inspectorMount'))
    ) {
      closePanel();
    }
  }, true);

  function render() {
    if (!activeNode) {
      root.hidden = true;
    root.classList.remove('is-open');
      root.innerHTML = '';
      return;
    }

    const node = activeNode;
    const config = node.config || (node.config = {});
    let content = '';


    if (mode === 'edit') {
        if (node.type === 'icon') {
          content += select('انتخاب نوع آیکون', 'config.name',
            config.name || 'home', [
              { value: 'home', label: 'خانه' },
              { value: 'user', label: 'کاربر' },
              { value: 'settings', label: 'تنظیمات' },
              { value: 'search', label: 'جستجو' },
              { value: 'cart', label: 'سبد خرید' },
              { value: 'heart', label: 'قلب' },
              { value: 'star', label: 'ستاره' },
              { value: 'menu', label: 'منو' },
              { value: 'plus', label: 'افزودن' },
              { value: 'phone', label: 'تلفن' },
              { value: 'mail', label: 'ایمیل' },
              { value: 'bell', label: 'اعلان' },
              { value: 'arrow-left', label: 'فلش چپ' },
              { value: 'arrow-right', label: 'فلش راست' },
              { value: 'check', label: 'تأیید' },
              { value: 'calendar', label: 'تقویم' },
              { value: 'camera', label: 'دوربین' }
            ]);
        }

        if (node.type === 'text') {
          content += `
            <label class="builder-field">
              محتوای متن
              <textarea data-key="config.text" rows="5">${escapeHTML(config.text || '')}</textarea>
            </label>`;
        }

      if (node.type === 'button') {
        content += input('متن دکمه', 'config.label', config.label || 'دکمه');

        content += `
          <fieldset class="button-icon-settings">
            <legend>تنظیمات آیکون</legend>
            <label class="builder-field inline-check">
              <input type="checkbox" data-key="config.iconEnabled"
                ${config.iconEnabled === true ? 'checked' : ''}>
              <span>نمایش آیکون</span>
            </label>
          `;

        content += select('انتخاب آیکون', 'config.iconName',
          config.iconName || 'home', [
            { value: 'home', label: 'خانه' },
            { value: 'user', label: 'کاربر' },
            { value: 'settings', label: 'تنظیمات' },
            { value: 'search', label: 'جستجو' },
            { value: 'cart', label: 'سبد خرید' },
            { value: 'heart', label: 'قلب' },
            { value: 'star', label: 'ستاره' },
            { value: 'menu', label: 'منو' },
            { value: 'plus', label: 'افزودن' },
            { value: 'phone', label: 'تلفن' },
            { value: 'mail', label: 'ایمیل' },
            { value: 'bell', label: 'اعلان' },
            { value: 'arrow-left', label: 'فلش چپ' },
            { value: 'arrow-right', label: 'فلش راست' },
            { value: 'check', label: 'تأیید' },
            { value: 'calendar', label: 'تقویم' },
            { value: 'camera', label: 'دوربین' }
          ]);

        content += select('جایگاه آیکون', 'config.iconPosition',
          config.iconPosition || 'right', [
            { value: 'right', label: 'سمت راست متن' },
            { value: 'left', label: 'سمت چپ متن' },
            { value: 'only', label: 'فقط آیکون' }
          ]);

        content += input('اندازه آیکون (پیکسل)',
          'config.iconSize', config.iconSize ?? 22, 'number');

        content += `
          <div class="appearance-colors">
            <label class="appearance-color-field">
              رنگ خطوط
              <button type="button" class="color-trigger"
                data-color-key="config.iconColor"
                data-color-value="${escapeHTML(config.iconColor || '#263b5b')}">
                <span class="color-trigger-swatch"
                  style="background:${escapeHTML(config.iconColor || '#263b5b')}"></span>
              </button>
            </label>
            <label class="appearance-color-field">
              رنگ داخلی
              <button type="button" class="color-trigger"
                data-color-key="config.iconFillColor"
                data-color-value="${escapeHTML(config.iconFillColor && config.iconFillColor !== 'transparent' ? config.iconFillColor : config.iconFillLastColor || '#ffffff')}">
                <span class="color-trigger-swatch"
                  style="background:${escapeHTML(config.iconFillColor && config.iconFillColor !== 'transparent' ? config.iconFillColor : config.iconFillLastColor || '#ffffff')}"></span>
              </button>
            </label>
          </div>
        </fieldset>`;

        content += select('نوع عملکرد دکمه', 'config.actionType',
          config.actionType || 'none', [
            { value: 'none', label: 'بدون عملکرد' },
            { value: 'url', label: 'بازکردن آدرس اینترنتی' },
            { value: 'page', label: 'رفتن به صفحه دیگر' },
            { value: 'message', label: 'نمایش پیام' }
          ]);

        content += input('مقصد یا مقدار عملکرد',
          'config.actionValue', config.actionValue || '');

        content += `<p class="builder-hint">
          عملکرد در این مرحله ذخیره می‌شود؛ اجرای واقعی آن در موتور برنامه پیاده‌سازی خواهد شد.
        </p>`;
      }

      if (node.type === 'image') {
        const currentSourceName =
          imageDraft?.sourceName ||
          config.sourceName ||
          (imageDraft?.sourceType === 'url' || config.sourceType === 'url' ||
           config.src?.startsWith('http')
            ? 'تصویر از طریق آدرس اینترنتی'
            : config.assetId ? 'تصویر ذخیره‌شده در مخزن' : '');

        const currentUrl = imageDraft
          ? (imageDraft.sourceType === 'url' ? imageDraft.src : '')
          : (config.src?.startsWith('http') ? config.src : '');

        content += `
        <section class="image-library-section">
          <strong>انتخاب از مخزن مرکزی</strong>
          <div data-image-library class="image-library-grid">
            در حال بارگذاری تصاویر...
          </div>
        </section>
          <label class="builder-field">
            انتخاب تصویر از گوشی
            <input type="file" accept="image/*" data-image-file>
          </label>
          <p class="builder-hint" data-image-source-name>
            ${escapeHTML(currentSourceName)}
          </p>`;

        content += input('آدرس اینترنتی تصویر (اختیاری)',
          'config.src', currentUrl, 'url');

        content += `<p class="builder-hint">
          تصویر انتخابی یا لینک واردشده تا زمان ذخیره، فقط پیش‌نمایش موقت است.
          </p>`;

        content += input('متن جایگزین تصویر',
          'config.alt', config.alt || 'تصویر');
      }

      if (node.type === 'input') {
        content += input('عنوان لیبل', 'config.label', config.label || '');

        content += `
          <label class="builder-field inline-check">
            <input data-key="independentMove" type="checkbox"
              ${node.independentMove ? 'checked' : ''}>
            جابه‌جایی مستقل از لیبل
          </label>`;

        content += input('متن راهنما',
          'config.placeholder', config.placeholder || '');

        content += input('مقدار اولیه',
          'config.value', config.value || '');

        content += select('نوع ورودی', 'config.inputType',
          config.inputType || 'text', [
            { value: 'text', label: 'متن' },
            { value: 'number', label: 'عدد' },
            { value: 'email', label: 'ایمیل' },
            { value: 'password', label: 'رمز عبور' },
            { value: 'tel', label: 'شماره تلفن' }
          ]);

        content += input('نام فیلد', 'config.name', config.name || '');

        content += `
          <label class="builder-field inline-check">
            <input data-key="config.required" type="checkbox"
              ${config.required ? 'checked' : ''}>
            اجباری بودن فیلد
          </label>`;
      }

      if (node.type === 'card') {
        content += `
          <label class="builder-field">
            محتوای کادر
            <textarea data-key="config.text" rows="4">${escapeHTML(config.text || '')}</textarea>
          </label>`;
      }

      if (node.type === 'input') {
        content += input(
          'نام فنی فیلد (اختیاری)',
          'config.fieldName',
          config.fieldName ?? config.name ?? ''
        );
      } else if (!(node.type === 'text' && node.pairId)) {
        content += input(
          'نام فنی فیلد (اختیاری)',
          'config.fieldName',
          config.fieldName || ''
        );
      }
    }

    if (mode === 'appearance' && node.type === 'icon') {
      content = `
        <h3>تنظیمات ظاهری آیکون</h3>
        <div class="appearance-colors">
          <label class="appearance-color-field">
            رنگ خطوط
            <button type="button" class="color-trigger" data-color-key="config.strokeColor" data-color-value="${escapeHTML(config.strokeColor || config.color || '#263b5b')}"><span class="color-trigger-swatch" style="background:${escapeHTML(config.strokeColor || config.color || '#263b5b')}"></span></button>
          </label>
          <label class="appearance-color-field">
            رنگ داخلی
            <button type="button" class="color-trigger" data-color-key="config.fillColor" data-color-value="${escapeHTML(config.fillColor && config.fillColor !== 'transparent' ? config.fillColor : config.fillLastColor || '#ffffff')}"><span class="color-trigger-swatch" style="background:${escapeHTML(config.fillColor && config.fillColor !== 'transparent' ? config.fillColor : config.fillLastColor || '#ffffff')}"></span></button>

          </label>
          <label class="appearance-color-field">
            رنگ زمینه
            <button type="button" class="color-trigger" data-color-key="config.outerColor" data-color-value="${escapeHTML(config.outerColor && config.outerColor !== 'transparent' ? config.outerColor : config.outerLastColor || '#ffffff')}"><span class="color-trigger-swatch" style="background:${escapeHTML(config.outerColor && config.outerColor !== 'transparent' ? config.outerColor : config.outerLastColor || '#ffffff')}"></span></button>

          </label>
        </div>`;
    }

    if (mode === 'appearance' && node.type !== 'icon') {
    content = `
      <h3>تنظیمات ظاهری</h3>
      <div class="appearance-colors">
        <label class="appearance-color-field">
          رنگ متن
          <button type="button" class="color-trigger" data-color-key="config.color" data-color-value="${escapeHTML(config.color || '#202938')}"><span class="color-trigger-swatch" style="background:${escapeHTML(config.color || '#202938')}"></span></button>
        </label>
        <label class="appearance-color-field">
          پس‌زمینه
          <button type="button" class="color-trigger" data-color-key="config.background" data-color-value="${escapeHTML(config.background && config.background !== 'transparent' ? config.background : '#ffffff')}"><span class="color-trigger-swatch" style="background:${escapeHTML(config.background && config.background !== 'transparent' ? config.background : '#ffffff')}"></span></button>

        </label>
        <label class="appearance-color-field">
          رنگ حاشیه
          <button type="button" class="color-trigger" data-color-key="config.borderColor" data-color-value="${escapeHTML(config.borderColor || '#dce1e8')}"><span class="color-trigger-swatch" style="background:${escapeHTML(config.borderColor || '#dce1e8')}"></span></button>
        </label>
      </div>
      ${input('اندازه فونت', 'config.fontSize', config.fontSize ?? 15, 'number')}
      ${input('ضخامت حاشیه (پیکسل)', 'config.borderWidth', config.borderWidth ?? 0, 'number')}
      ${select('نوع حاشیه', 'config.borderStyle', config.borderStyle || 'solid', [
        { value: 'solid', label: 'خط پیوسته' },
        { value: 'dashed', label: 'خط‌چین' },
        { value: 'dotted', label: 'نقطه‌چین' },
        { value: 'double', label: 'دوتایی' }
      ])}
      ${input('گردی گوشه‌ها', 'config.radius', config.radius ?? 8, 'number')}
      ${select('چینش متن', 'config.textAlign', config.textAlign || 'center', [
        { value: 'right', label: 'راست‌چین' },
        { value: 'center', label: 'وسط‌چین' },
        { value: 'left', label: 'چپ‌چین' }
      ])}
    `;
  }

  if (mode === 'appearance') {
    content += `
      <h4>تنظیمات مشترک</h4>
      <label class="builder-field">
        شفافیت: <span data-opacity-value>${config.opacity ?? 100}%</span>
        <input data-key="config.opacity" type="range" min="0" max="100" value="${config.opacity ?? 100}">
      </label>
      <label class="builder-field inline-check">
        <input data-key="config.shadowEnabled" type="checkbox" ${config.shadowEnabled ? 'checked' : ''}>
        <span>فعال‌سازی سایه</span>
      </label>
      <label class="builder-field">
        شدت سایه: <span data-shadow-value>${config.shadowBlur ?? 8}</span>
        <input data-key="config.shadowBlur" type="range" min="0" max="40" value="${config.shadowBlur ?? 8}">
      </label>
      ${input('شفافیت سایه (درصد)', 'config.shadowOpacity', config.shadowOpacity ?? 25, 'number')}
      ${input('فاصله داخلی (پیکسل)', 'config.padding', config.padding ?? 0, 'number')}
    `;
  }

  if (mode === 'appearance') {
    content += `
      <div class="size-fields">
        <h4>اندازه کنترلر</h4>
        ${input("عرض (پیکسل)", "width", node.width || 120, "number")}
        ${input("طول (پیکسل)", "height", node.height || 45, "number")}
      </div>
    `;
  }

    root.hidden = false;
    root.classList.add('is-open');

    root.innerHTML = `
      <div class="inspector-heading">
        <strong>${escapeHTML(node.title || 'تنظیمات کنترلر')}</strong>
        <button type="button" data-close aria-label="بستن">×</button>
      </div>

      <nav class="inspector-tabs">
        <button type="button" data-tab="edit">ویرایش</button>
        <button type="button" data-tab="appearance">ظاهر</button>
      </nav>

      <div class="inspector-content">
        ${content}
      </div>

      <div class="inspector-actions">
        <button type="button" class="builder-confirm" data-confirm>
          ذخیره تغییرات
        </button>
        <button type="button" data-cancel>
          لغو تغییرات
        </button>
      </div>
    `;



  const imageLibrary = root.querySelector('[data-image-library]');

  if (imageLibrary && assetStore) {
    (async () => {
      try {
        const images = await assetStore.listImages();

        if (!images.length) {
          imageLibrary.textContent = 'هنوز تصویری در مخزن ذخیره نشده است.';
          return;
        }

        const cards = await Promise.all(images.map(async item => {
          const record = await assetStore.getImage(item.id);
          if (!record?.blob) return '';

          const url = URL.createObjectURL(record.blob);

          return `<div class="image-library-item">
                    <button type="button" class="image-library-select"
                      data-library-image="${item.id}">
                      <img src="${url}" alt="">
                      <span>${escapeHTML(item.name || 'تصویر')}</span>
                    </button>
                    <button type="button" class="image-library-delete"
                      data-delete-library-image="${item.id}" title="حذف تصویر">×</button>
                  </div>`;
        }));

        imageLibrary.innerHTML = cards.join('') ||
          'تصویری برای نمایش پیدا نشد.';

      } catch (error) {
        console.error('خطا در بارگذاری مخزن تصاویر:', error);
        imageLibrary.textContent = 'بارگذاری تصاویر ناموفق بود.';
      }
    })();

    imageLibrary.addEventListener('click', async event => {
      const deleteButton = event.target.closest('[data-delete-library-image]');

      if (deleteButton) {
        const id = deleteButton.dataset.deleteLibraryImage;

        const usedBy = project.nodes.filter(node =>
          node.type === 'image' && node.config?.assetId === id
        );

        if (usedBy.length) {
          alert(`این تصویر در ${usedBy.length} کنترلر استفاده شده و فعلاً قابل حذف نیست.`);
          return;
        }

        if (!confirm('آیا از حذف دائمی این تصویر از مخزن مطمئن هستید؟')) {
          return;
        }

        try {
          await assetStore.deleteImage(id);
          deleteButton.closest('.image-library-item')?.remove();

          if (!imageLibrary.querySelector('.image-library-item')) {
            imageLibrary.textContent = 'هنوز تصویری در مخزن ذخیره نشده است.';
          }
        } catch (error) {
          console.error('خطا در حذف تصویر:', error);
          alert('حذف تصویر انجام نشد.');
        }

        return;
      }

      const button = event.target.closest('[data-library-image]');
      if (!button) return;

      const id = button.dataset.libraryImage;
      const record = await assetStore.getImage(id);
      if (!record) return;

      const previousTemp = imageDraft?.tempAssetId;

      imageDraft = {
        src: '',
        assetId: id,
        sourceName: record.name,
        sourceType: 'library',
        sourceUrl: '',
        tempAssetId: null
      };

      const imageUrl = root.querySelector('[data-key="config.src"]');
      if (imageUrl) imageUrl.value = '';

      const sourceName = root.querySelector('[data-image-source-name]');
      if (sourceName) sourceName.textContent = record.name;

      canvas.setImagePreview?.(activeNode.id, imageDraft);

      if (previousTemp) {
        await assetStore.deleteImage(previousTemp).catch(console.error);
      }
    });
  }

  root.querySelectorAll('.color-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        root.querySelector('.color-picker-overlay')?.remove();

        const key = trigger.dataset.colorKey;
        const property = key.slice(7);
        const lastKeys = {
          iconFillColor: 'iconFillLastColor',
          fillColor: 'fillLastColor',
          outerColor: 'outerLastColor',
          background: 'backgroundLastColor'
        };
        const lastKey = lastKeys[property];
        const current = config[property];
        const initial = current && current !== 'transparent'
          ? current
          : (lastKey && config[lastKey]) || trigger.dataset.colorValue || '#ffffff';

        const palette = [
          '#000000','#ffffff','#808080','#c0c0c0',
          '#ff0000','#ff6600','#ffcc00','#ffff00',
          '#00aa00','#00cc99','#00aaff','#0000ff',
          '#6633cc','#9900cc','#ff00aa','#795548',
          '#263b5b','#202938','#dce1e8','#f4f6f8',
          '#e53935','#43a047','#1e88e5','#8e24aa'
        ];

        const overlay = document.createElement('div');
        overlay.className = 'color-picker-overlay';
        overlay.innerHTML = `
          <div class="color-picker-panel">
            <div class="color-picker-heading">
              <strong>انتخاب رنگ</strong>
              <button type="button" data-picker-close>×</button>
            </div>
            <div class="color-picker-palette">
              ${palette.map(color => `
                <button type="button" data-palette-color="${color}"
                  style="background:${color}" aria-label="${color}"></button>
              `).join('')}
            </div>
            <label class="color-picker-hex">
              کد رنگ
              <input type="text" data-picker-hex value="${initial}"
                maxlength="7" dir="ltr" placeholder="#FFFFFF">
            </label>
            <label class="color-picker-transparent">
              <input type="checkbox" data-picker-transparent
                ${current === 'transparent' ? 'checked' : ''}>
              بی‌رنگ
            </label>
            <button type="button" class="color-picker-apply" data-picker-apply>
              تأیید رنگ
            </button>
          </div>
        `;

        root.append(overlay);

        const hex = overlay.querySelector('[data-picker-hex]');
        const transparent = overlay.querySelector('[data-picker-transparent]');

        overlay.querySelectorAll('[data-palette-color]').forEach(button => {
          button.addEventListener('click', () => {
            hex.value = button.dataset.paletteColor;
            transparent.checked = false;
          });
        });

        overlay.querySelector('[data-picker-close]').addEventListener('click', () => {
          overlay.remove();
        });

        overlay.addEventListener('click', event => {
          if (event.target === overlay) overlay.remove();
        });

        overlay.querySelector('[data-picker-apply]').addEventListener('click', () => {
          const selected = transparent.checked
            ? 'transparent'
            : hex.value.trim();

          if (selected !== 'transparent' &&
              !/^#[0-9a-fA-F]{6}$/.test(selected)) {
            hex.focus();
            hex.setCustomValidity('کد رنگ باید مانند #336699 باشد.');
            hex.reportValidity();
            return;
          }

          hex.setCustomValidity('');

          if (selected !== 'transparent' && lastKey) {
            config[lastKey] = selected;
          }

          config[property] = selected;
          trigger.dataset.colorValue = selected;

          const swatch = trigger.querySelector('.color-trigger-swatch');
          swatch.style.background = selected === 'transparent'
            ? 'repeating-conic-gradient(#bbb 0% 25%, white 0% 50%) 50% / 12px 12px'
            : selected;

          save();
          overlay.remove();
        });
      });
    });

    root.querySelectorAll('[data-tab]').forEach(tab => {
      tab.classList.toggle('active',
        tab.dataset.tab === mode
      );
      tab.addEventListener('click', () => {
        mode = tab.dataset.tab;
        render();
      });
    });

    root.querySelectorAll('[data-key]').forEach(element => {
      const update = () => {
        const key = element.dataset.key;

        if (key === 'config.src') return;

        const value = element.type === 'checkbox'
          ? element.checked
          : element.type === 'number'
            ? Number(element.value)
            : element.value;

        if (key.startsWith('config.')) {
          config[key.slice(7)] = value;
        } else {
          node[key] = value;
        }

        save();

        if (key === 'config.opacity') {
          const display = root.querySelector('[data-opacity-value]');
          if (display) display.textContent = `${value}%`;
        }

        if (key === 'config.shadowBlur') {
          const display = root.querySelector('[data-shadow-value]');
          if (display) display.textContent = value;
        }
      };

      element.addEventListener('change', update);

      if (element.type === 'range') {
        element.addEventListener('input', update);
      }

      if (element.tagName === 'TEXTAREA') {
        element.addEventListener('input', update);
      }
    });

    const buttonIconFillInput = root.querySelector('[data-key="config.iconFillColor"]');
    const clearButtonIconFill = root.querySelector('[data-clear-button-icon-fill]');

    if (buttonIconFillInput && clearButtonIconFill) {
      buttonIconFillInput.addEventListener('change', () => {
        config.iconFillLastColor = buttonIconFillInput.value;
        config.iconFillColor = buttonIconFillInput.value;
        clearButtonIconFill.checked = false;
        save();
      });

      clearButtonIconFill.addEventListener('change', () => {
        if (clearButtonIconFill.checked) {
          if (config.iconFillColor && config.iconFillColor !== 'transparent') {
            config.iconFillLastColor = config.iconFillColor;
          }
          config.iconFillColor = 'transparent';
        } else {
          config.iconFillColor = config.iconFillLastColor || '#ffffff';
        }
        save();
        render();
      });
    }

    const backgroundInput = root.querySelector('[data-key="config.background"]');
    const clearBackground = root.querySelector('[data-clear-background]');

    const iconFillInput = root.querySelector('[data-key="config.fillColor"]');
    const clearIconFill = root.querySelector('[data-clear-icon-fill]');
    if (iconFillInput && clearIconFill) {
      iconFillInput.addEventListener('change', () => {
        config.fillLastColor = iconFillInput.value;
        config.fillColor = iconFillInput.value;
        clearIconFill.checked = false;
        save();
      });
      clearIconFill.addEventListener('change', () => {
        if (clearIconFill.checked) {
          if (config.fillColor && config.fillColor !== 'transparent') {
            config.fillLastColor = config.fillColor;
          }
          config.fillColor = 'transparent';
        } else {
          config.fillColor = config.fillLastColor || '#ffffff';
        }
        save();
        render();
      });
    }

    const iconOuterInput = root.querySelector('[data-key="config.outerColor"]');
    const clearIconOuter = root.querySelector('[data-clear-icon-outer]');
    if (iconOuterInput && clearIconOuter) {
      iconOuterInput.addEventListener('change', () => {
        config.outerLastColor = iconOuterInput.value;
        config.outerColor = iconOuterInput.value;
        clearIconOuter.checked = false;
        save();
      });
      clearIconOuter.addEventListener('change', () => {
        if (clearIconOuter.checked) {
          if (config.outerColor && config.outerColor !== 'transparent') {
            config.outerLastColor = config.outerColor;
          }
          config.outerColor = 'transparent';
        } else {
          config.outerColor = config.outerLastColor || '#ffffff';
        }
        save();
        render();
      });
    }

    if (backgroundInput && clearBackground) {
      backgroundInput.addEventListener('change', () => {
        config.backgroundLastColor = backgroundInput.value;
        clearBackground.checked = false;
        save();
      });

      clearBackground.addEventListener('change', () => {
        if (clearBackground.checked) {
          if (config.background && config.background !== 'transparent') {
            config.backgroundLastColor = config.background;
          }
          config.background = 'transparent';
        } else {
          config.background = config.backgroundLastColor || '#ffffff';
        }
        save();
        render();
      });
    }

    const imageUrl = root.querySelector('[data-key="config.src"]');

    if (imageUrl) {
      imageUrl.addEventListener('input', async () => {
        const url = imageUrl.value.trim();
        const previousTemp = imageDraft?.tempAssetId;

        imageDraft = {
          src: url,
          assetId: null,
          sourceName: url ? 'تصویر از طریق آدرس اینترنتی' : '',
          sourceType: url ? 'url' : '',
          sourceUrl: url,
          tempAssetId: null
        };

        const imageFile = root.querySelector('[data-image-file]');
        if (imageFile) imageFile.value = '';

        const sourceName = root.querySelector('[data-image-source-name]');
        if (sourceName) {
          sourceName.textContent = imageDraft.sourceName;
        }

        if (canvas.setImagePreview) {
          canvas.setImagePreview(activeNode.id, imageDraft);
        }

        if (previousTemp && assetStore) {
          await assetStore.deleteImage(previousTemp).catch(console.error);
        }
      });
    }

    const imageFile = root.querySelector('[data-image-file]');

    if (imageFile) {
      imageFile.addEventListener('change', async () => {
        const file = imageFile.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          alert('لطفاً یک فایل تصویری انتخاب کن.');
          imageFile.value = '';
          return;
        }

        const sourceName = root.querySelector('[data-image-source-name]');
        if (sourceName) sourceName.textContent = 'در حال ذخیره تصویر...';

        try {
          const metadata = await assetStore.saveImage(file);
          const previousTemp = imageDraft?.tempAssetId;

          imageDraft = {
            src: '',
            assetId: metadata.id,
            sourceName: metadata.name,
            sourceType: 'local',
            sourceUrl: '',
            tempAssetId: metadata.id
          };

          const imageUrl = root.querySelector('[data-key="config.src"]');
          if (imageUrl) imageUrl.value = '';

          if (sourceName) sourceName.textContent = metadata.name;

          if (canvas.setImagePreview) {
            canvas.setImagePreview(activeNode.id, imageDraft);
          }

          if (previousTemp && assetStore) {
            await assetStore.deleteImage(previousTemp).catch(console.error);
          }
        } catch (error) {
          console.error('خطا در ذخیره تصویر:', error);
          if (sourceName) sourceName.textContent = 'ذخیره تصویر ناموفق بود.';
        }
      });
    }

    root.querySelector('[data-close]').addEventListener('click', closePanel);

    root.querySelector('[data-confirm]').addEventListener('click', async () => {
      let oldAssetId = null;

      if (activeNode?.type === 'image' && imageDraft) {
        const config = activeNode.config || (activeNode.config = {});
        oldAssetId = config.assetId || null;

        config.src = imageDraft.src || '';
        config.assetId = imageDraft.assetId || null;
        config.sourceType = imageDraft.sourceType || '';
        config.sourceUrl = imageDraft.sourceUrl || '';
        config.sourceName = imageDraft.sourceName || '';

        imageDraft = null;
        save();


      } else {
        save();
      }

      closePanel();
    });

    root.querySelector('[data-cancel]').addEventListener('click', () => {
      if (activeNode && originalNode) {
        Object.keys(activeNode).forEach(key => delete activeNode[key]);
        Object.assign(activeNode, JSON.parse(JSON.stringify(originalNode)));
        save();
      }
      originalNode = null;
      closePanel();
    });


  }

  function open(node, nextMode) {
    activeNode = node;
    originalNode = JSON.parse(JSON.stringify(node));
    mode = nextMode;
    render();
  }

  bus.on('node:edit', node => open(node, 'edit'));
  bus.on('node:appearance', node => open(node, 'appearance'));
  bus.on('node:resize', node => open(node, 'appearance'));
  bus.on('node:deselect', closePanel);

  return root;
}
