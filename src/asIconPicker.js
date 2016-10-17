import $ from 'jquery';
import DEFAULTS from './defaults';
import keyboard from './keyboard';

const NAMESPACE = 'asIconPicker';

class asIconPicker {
  constructor(element, options) {
    this.element = element;
    this.$element = $(element);

    this.options = $.extend({}, DEFAULTS, options, this.$element.data());

    this.namespace = this.options.namespace;

    this.classes = {
      disabled: `${this.namespace}_disabled`,
      wrapper: `${this.namespace}-wrapper`,
      search: `${this.namespace}_with_search`,
      active: `${this.namespace}_active`,
      flat: `${this.namespace}_isFlat`,
      hide: `${this.namespace}_hide`,
      hover: `${this.namespace}_hover`,
      mask: `${this.namespace}-mask`
    };

    this.$element.addClass(this.namespace);
    this.$element.wrap(`<div class="${this.classes.wrapper}"></div>`);
    this.$wrapper = this.$element.parent();

    //make $wrapper can be focused
    this.$wrapper.attr('tabindex', '0');

    const iconPicker = this.options.iconPicker().replace(/namespace/g, this.namespace),
      iconSearch = this.options.iconSearch().replace(/namespace/g, this.namespace).replace(/searchText/g, this.options.searchText);
    this.$iconPicker = $(iconPicker);
    this.$iconContainer = this.$iconPicker.find(`.${this.namespace}-icons-container`);
    this.$iconSearch = $(iconSearch);

    if (this.options.hasSearch) {
      this.$iconContainer.before(this.$iconSearch);
      this.$iconContainer.parent().addClass(this.classes.search);
      this.iconsSearched = [];
    }
    this.map = {};
    this.bound = false;
    this.isSearch = false;
    this.current = this.$element.val();
    this.source = [];

    // flag
    this.disabled = false;
    this.initialized = false;

    this._trigger('init');
    this.init();
  }

  init() {
    const that = this;
    // Hide source element
    this.$element.hide();

    // Add the icon picker after the select
    this.$element.before(this.$iconPicker);

    if (!this.options.source && this.$element.is('select')) {
      this.source = this._getSourceFromSelect();
    } else {
      this.source = this._processSource(this.options.source);
    }

    // Load icons
    this.showLoading();

    this.$wrapper.find(`.${this.namespace}-selector-popup`).addClass(this.classes.hide);
    /**
     * On down arrow click
     */
    if (!that.options.flat) {
      this.$wrapper.find(`.${this.namespace}-selector`).on('click', () => {
        // Open/Close the icon picker
        that._open();
      });
    } else {
      that._open();
    }

    if (!this.options.keyboard) {
      this.$iconPicker.find(`.${this.namespace}-search-input`).keyup($.proxy(e => {
        that.searching($(e.currentTarget).val());
      }, this));
    } else {
      this.$wrapper.on('focus', () => {
        keyboard.init(that);
      });
    }

    this.$iconPicker.on('click', `.${this.namespace}-isSearching .${this.namespace}-search-icon`, $.proxy(function() {
      this.$iconPicker.find(`.${this.namespace}-search-input`).focus().select();
      this.reset();
    }, this));

    this.$iconContainer.on('click', `.${this.namespace}-list li`, $.proxy(function(e) {
      if (this.options.cancelSelected && $(e.currentTarget).hasClass(`${this.namespace}-current`)) {
        $(e.currentTarget).removeClass(`${this.namespace}-current`);
        this.set();
        return;
      }
      this.set($(e.currentTarget).children().data('value'));
      this._hide();
    }, this)).on('mouseenter', `.${this.namespace}-list li`, $.proxy(function(e) {
      this.highlight($(e.currentTarget).children().data('value'));
    }, this)).on('mouseleave', `.${this.namespace}-list li`, $.proxy(function() {
      this.highlight();
    }, this));

    /**
     * Stop click propagation on iconpicker
     */
    this.$iconPicker.click(event => {
      event.stopPropagation();
      that.$iconPicker.find(`.${that.namespace}-search-input`).focus().select();
      return false;
    });

    this.initialized = true;
    // after init end trigger 'ready'
    this._trigger('ready');
  }

  _getSourceFromSelect() {
    const source = [];
    this.$element.children().each((i, el) => {
      const $el = $(el);
      if ($el.is('optgroup')) {
        const group = $.extend({}, $el.data(), {
          label: el.label,
          items: []
        });
        const $children = $el.children();
        const length = $children.length;
        for (let j = 0; j < length; j++) {
          group.items.push({
            value: $children.eq(j).val(),
            text: $children.eq(j).text()
          });
        }
        source.push(group);
      } else if ($el.is('option')) {
        source.push({
          value: $el.val(),
          text: $el.text()
        });
      }
    });

    return source;
  }

  _processSource(source) {
    const processItem = (key, item) => {
      if (typeof key === 'string') {
        return {
          value: key,
          text: item
        };
      }
      if (typeof item === 'string') {
        return {
          value: item,
          text: item
        };
      }
      return item;
    };
    const processSource = [];

    if (!$.isArray(source)) {
      for (const key in source) {
        if ({}.hasOwnProperty.call(source, key)) {
          processSource.push(processItem(key, source[key]));
        }
      }
    } else {
      for (let i = 0; i < source.length; i++) {
        if (source[i].items) {
          if ($.isArray(source[i].items)) {
            for (let j = 0; j < source[i].items.length; j++) {
              source[i].items[j] = processItem(j, source[i].items[j]);
            }
            processSource[i] = source[i];
          } else {
            processSource[i] = {
              label: source[i].label,
              items: []
            };
            for (const k in source[i].items) {
              if ({}.hasOwnProperty.call(source[i].item, k)) {
                processSource[i].items.push(processItem(k, source[i].items[k]));
              }
            }
          }
        } else {
          processSource[i] = processItem(i, source[i]);
        }
      }
    }

    return processSource;
  }

  showLoading() {
    this.$iconContainer.html(`<span class="${this.namespace}-loading"><i></i></span>`);

    // If source is set
    if (this.source.length > 0) {

      // Render icons
      this.fillIcon();
    }
  }

  searching(value) {
    // If the string is not empty
    if (value === '') {
      this.reset();
      return;
    }

    // Set icon search to X to reset search
    this.$iconSearch.addClass(`${this.namespace}-isSearching`);

    // Set this as a search
    this.isSearch = true;
    this.iconsSearched = [];

    const isMatchedItem = item => (this.replaceDiacritics(item.text).toLowerCase()).search(value.toLowerCase()) >= 0;
    let groupSearched = {};
    // Actual search
    for (let i = 0, item;
      (item = this.source[i]); i++) {
      if (typeof item.items !== 'undefined') {
        groupSearched = {
          label: item.label,
          items: $.grep(item.items, n => isMatchedItem(n))
        };

        if (groupSearched.items.length > 0) {
          this.iconsSearched.push(groupSearched);
        }
      } else {
        if (isMatchedItem(item)) {
          this.iconsSearched.push(item);
        }
      }
    }

    if (this.iconsSearched.length > 0) {
      const first = this.iconsSearched[0];

      if (typeof first.items !== 'undefined') {
        this.current = first.items[0].value;
      } else {
        this.current = first.value;
      }
    } else {
      this.current = '';
    }

    // Render icon list
    this.fillIcon();
  }

  /**
   * Fill icons inside the popup
   */
  fillIcon() {
    const that = this;
    if (typeof this.$iconContainer.data('asIconPicker') !== 'undefined') {
      this.$iconContainer.asIconPicker('destroy');
    }
    let tempIcons = [];
    this.iconsAll = [];

    // Set a temporary array for icons
    if (this.isSearch) {
      tempIcons = this.iconsSearched;
    } else {
      tempIcons = this.source;
    }

    // If not show an error when no icons are found
    if (tempIcons.length < 1) {
      this.$iconContainer.html(`<div class="${this.namespace}-noMatch">${this.options.formatNoMatches()}</div>`);
      return;

      // else empty the container
    }
    this.$iconContainer.html('');

    // List icons
    const itemHTML = item => {
      that.iconsAll.push(item.value);
      return $('<li/>', {
        html: `<i class="${that.options.extraClass} ${item.value}" data-value="${item.value}"></i>`,
        title: (that.options.tooltip) ? item.text : ''
      });
    };
    let $group;
    for (let i = 0, item; i < tempIcons.length; i++) {
      item = tempIcons[i];

      if (typeof item.label !== 'undefined') {
        if (item.items.length) {
          $group = $(`<div class="${this.namespace}-group"><div class="${this.namespace}-group-label">${item.label}:</div><ul class="${this.namespace}-list"></ul></div>`).appendTo(this.$iconContainer);
        }
        for (let j = 0, option;
          (option = item.items[j]); j++) {
          itemHTML(option).appendTo($group.find('ul'));
        }
      } else {
        const listClass = this.$iconContainer.children().last().attr('class');
        if (listClass !== `${this.namespace}-list`) {
          $(`<ul class="${this.namespace}-list"></ul>`).appendTo(this.$iconContainer);
        }
        itemHTML(item).appendTo(this.$iconContainer.children().last());
      }
    }
    if (this.options.tooltip) {
      $.asTooltip.closeAll();
      this.$iconContainer.find(`.${this.namespace}-list li`).asTooltip({
        namespace: 'asTooltip',
        skin: 'skin-dream',
        onlyOne: true
      });
    }

    this.index = $.inArray(this.current, this.iconsAll);

    if (this.index >= 0) {
      this.set(this.current, false);
    } else {
      this.set(null, false);
    }

    // Add the scrollbar in the iconContainer
    this.$iconContainer.asScrollbar({
      namespace: `${that.namespace}-icons`
    });

    this._trigger('afterFill');
  }

  replaceDiacritics(s) {
    let k;
    const d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' ');
    for (k in d) {
      if ({}.hasOwnProperty.call(d, k)) {
        s = s.toLowerCase().replace(new RegExp(`[${d[k]}]`, 'g'), 'aeiouncy'.charAt(k));
      }
    }
    return s;
  }

  highlight(icon) {
    if (icon) {
      this.$iconPicker.find(`.${icon}`).parent().addClass(this.classes.hover);
    } else {
      this.$iconPicker.find(`.${this.classes.hover}`).removeClass(this.classes.hover);
    }
  }

  scrollToSelectedIcon() {
    if (this.current) {
      const ulWidth = this.$iconContainer.find(`.${this.namespace}-list`).width();
      const containerHeight = this.$iconContainer.height(),
        liHeight = this.$iconContainer.find(`.${this.namespace}-list li`).height(),
        liTop = this.$iconContainer.find(`.${this.current}`).parent().offset().top,
        liWidth = this.$iconContainer.find(`.${this.namespace}-list li`).width(),
        lineNumber = Math.floor(ulWidth / liWidth),
        ulTop = this.$iconContainer.find(`.${this.namespace}-list`).offset().top;

      if (this.index < lineNumber) {
        this.value = 0;
      } else {
        this.value = (liTop + liHeight - ulTop) / containerHeight;
      }
    }
    this.$iconContainer.asIconPicker('move', this.value, true);
  }

  reset() {
    // Empty input
    this.$iconPicker.find(`.${this.namespace}-search-input`).val('');

    // Reset search icon class
    this.$iconSearch.removeClass(`${this.namespace}-isSearching`);
    this.isSearch = false;

    // Fill icons
    this.fillIcon();

    // Add the scrollbar in the iconContainer
    if (this.$iconContainer.outerHeight() >= this.options.heightToScroll) {
      this.$iconContainer.asScrollbar();
    }
  }

  _open() {
    const $selector = this.$wrapper.find(`.${this.namespace}-selector`),
      that = this;

    if (that.options.flat) {
      $selector.addClass(this.classes.flat);
      $selector.siblings(`.${this.namespace}-selector-popup`).addClass(this.classes.flat).removeClass(this.classes.hide);
    } else {
      $selector.addClass(this.classes.active);
      $selector.siblings(`.${this.namespace}-selector-popup`).addClass(this.classes.active).removeClass(this.classes.hide);
      this.previous = this.current;
      if ($selector.hasClass(this.classes.active) && !that.options.flat) {
        this.$iconPicker.find(`.${this.namespace}-search-input`).focus().select();
        this.$mask = $('<div></div>').addClass(this.classes.mask).appendTo(this.$element.parent());
        this.$mask.on('click', () => {
          that._hide();
        });
      }
    }
  }

  _hide() {
    if (this.options.flat) {
      return;
    }
    if (this.options.keyboard) {
      keyboard.destroy(this);
    }

    this._clearMask();
    this.$wrapper.find(`.${this.namespace}-selector`).removeClass(this.classes.active);
    this.$wrapper.find(`.${this.namespace}-selector-popup`).addClass(this.classes.hide).removeClass(this.classes.active);
    this.$wrapper.focus();
  }

  _clearMask() {
    if (this.$mask) {
      this.$mask.off('.asIconPicker');
      this.$mask.remove();
      this.$mask = null;
    }
  }

  _trigger(eventType, ...params) {
    let data = [this].concat(params);

    // event
    this.$element.trigger(`${NAMESPACE}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    let onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, params);
    }
  }

  _update() {
    this.$element.val(this.val());
    this._trigger('change', this.current);
  }

  load(source) {
    if (typeof source !== 'undefined') {
      this.source = this._processSource(source);
    }

    if (this.options.flat) {
      this.showLoading();
    } else {
      this.$wrapper.find(`.${this.namespace}-selector-popup`).removeClass(this.classes.hide);
      this.showLoading();
      this.$wrapper.find(`.${this.namespace}-selector-popup`).addClass(this.classes.hide);
    }
  }

  get() {
    return this.current;
  }

  set(icon, update) {
    this.$iconContainer.find(`.${this.namespace}-current`).removeClass(`${this.namespace}-current`);
    if (icon) {
      this.$iconContainer.find(`[data-value="${icon}"]`).parent().addClass(`${this.namespace}-current`);
      this.$iconPicker.find(`.${this.namespace}-selected-icon`).removeClass(`${this.namespace}-none-selected`).html(`<i class="${this.options.extraClass} ${icon}"></i>${this.options.process(icon)}`);
    } else {
      this.$iconPicker.find(`.${this.namespace}-selected-icon`).addClass(`${this.namespace}-none-selected`).html(`<i class="${this.options.extraClass} ${this.options.iconPrefix}ban"></i>${this.options.emptyText}`);
    }


    this.current = icon;
    this.index = $.inArray(this.current, this.iconsAll);
    this.scrollToSelectedIcon();

    if (update !== false) {
      this._update();
    }
  }

  clear() {
    this.set(null);
  }

  val(value) {
    if (typeof value === 'undefined') {
      return this.options.process(this.current);
    }

    const valueObj = this.options.parse(value);

    if (valueObj) {
      this.set(valueObj);
    } else {
      this.clear();
    }
  }

  enable() {
    this.disabled = false;

    // which element is up to your requirement
    this.$wrapper.removeClass(this.classes.disabled);
    this._trigger('enable');
    // here maybe have some events detached
  }

  disable() {
    this.disabled = true;
    // which element is up to your requirement
    // .disabled { pointer-events: none; } NO SUPPORT IE11 BELOW
    this.$wrapper.addClass(this.classes.disabled);
    this._trigger('disable');
  }

  destroy() {
    // detached events first
    // then remove all js generated html
    this.$element.data(NAMESPACE, null);
    this._trigger('destroy');
  }

  static setDefaults(options) {
    $.extend(DEFAULTS, $.isPlainObject(options) && options);
  }
}

export default asIconPicker;
