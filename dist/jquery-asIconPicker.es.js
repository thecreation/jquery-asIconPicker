/**
* jQuery asIconPicker
* a jquery plugin
* Compiled: Tue Aug 16 2016 11:42:02 GMT+0800 (CST)
* @version v0.1.0
* @link https://github.com/amazingSurge/jquery-asIconPicker
* @copyright LGPL-3.0
*/
import $$1 from 'jQuery';

var defaults = {
  namespace: 'asIconPicker',
  source: false, // Icons source
  tooltip: true,
  hasSearch: true,
  extraClass: 'fa',
  iconPrefix: 'fa-',
  emptyText: 'None Selected',
  searchText: 'Search',
  cancelSelected: true,
  keyboard: true,
  flat: false,
  heightToScroll: '290',

  iconPicker() {
    'use strict';
    return '<div class="namespace-selector">' +
      '<span class="namespace-selected-icon">' +
      'None selected' +
      '</span>' +
      '<span class="namespace-selector-arrow">' +
      '<i></i>' +
      '</span>' +
      '</div>' +
      '<div class="namespace-selector-popup">' +
      '<div class="namespace-icons-container"></div>' +
      '</div>';
  },
  iconSearch() {
    'use strict';
    return '<div class="namespace-selector-search">' +
      '<input type="text" name="" value="" placeholder="searchText" class="namespace-search-input"/>' +
      '<i class="namespace-search-icon"></i>' +
      '</div>';
  },
  formatNoMatches() {
    'use strict';
    return 'No matches found';
  },
  errorHanding() {},
  process(value) {
    'use strict';
    if (value && value.match(this.iconPrefix)) {
      return value.replace(this.iconPrefix, '');
    }
    return value;
  },
  parse(value) {
    'use strict';
    if (value.match(this.iconPrefix)) {
      return value;
    }
    return this.iconPrefix + value;
  },
  // callback
  onInit: null,
  onReady: null,
  onAfterFill: null
};

let _keyboard = {
  init(self) {
    'use strict';
    this.attach(self, this.gather(self));
  },
  destroy(self) {
    'use strict';
    self.$wrapper.off('keydown');
    self.bound = false;
  },
  keys() {
    'use strict';
    return {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      ENTER: 13,
      ESC: 27
    };
  },
  horizontalChange(step) {
    'use strict';
    if (!this.$mask && !this.options.flat) {
      this._open();
      return;
    }
    this.index += parseInt(step, 10);
    if (this.index >= this.iconsAll.length) {
      this.index = this.iconsAll.length - 1;
    } else if (this.index < 0) {
      this.index = 0;
    }
    this.current = this.iconsAll[this.index];
    this.set(this.current);
  },
  verticalChange(step) {
    'use strict';
    if (!this.$mask && !this.options.flat) {
      this._open();
      return;
    }
    const ulHeight = this.$iconContainer.find(`.${this.namespace}-list`).width();
    const liHeight = this.$iconContainer.find(`.${this.namespace}-list li`).width(),
      lineNumber = Math.floor(ulHeight / liHeight);

    step = parseInt(step, 10);

    if (this.index >= 0 && this.$iconContainer.find(`.${this.namespace}-group`).text()) {
      const siblingNumber = this.$iconContainer.find(`.${this.current}`).parent().siblings().length + 1;
      const nextNumber = this.$iconContainer.find(`.${this.current}`).parents(`.${this.namespace}-group`).next().find('li').length;
      const prevNumber = this.$iconContainer.find(`.${this.current}`).parents(`.${this.namespace}-group`).prev().find('li').length;
      const index = this.$iconContainer.find(`.${this.current}`).parent().index();
      let remain;
      if (step === 1) {
        remain = siblingNumber % lineNumber;

        if (index + lineNumber >= siblingNumber && nextNumber) {
          if (index + remain >= siblingNumber && remain > 0) {
            if (index + remain >= siblingNumber + nextNumber) {
              this.index += nextNumber;
            } else {
              this.index += remain;
            }
          } else {
            if (index + remain + lineNumber >= siblingNumber + nextNumber) {
              this.index += remain + nextNumber;
            } else {
              this.index += remain + lineNumber;
            }
          }
        } else {
          this.index += lineNumber;
        }
      } else if (step === -1) {
        remain = prevNumber % lineNumber;

        if (index > remain - 1 && index < lineNumber) {
          if (prevNumber >= lineNumber) {
            this.index -= lineNumber + remain;
          } else {
            this.index -= index + 1;
          }
        } else if (index <= remain - 1) {
          this.index -= remain;
        } else {
          this.index -= lineNumber;
        }
      }
    } else {
      this.index += lineNumber * step;
    }

    if (this.index >= this.iconsAll.length) {
      this.index = this.iconsAll.length - 1;
    } else if (this.index < 0) {
      this.index = 0;
    }
    this.current = this.iconsAll[this.index];
    this.set(this.current);
  },
  enter() {
    'use strict';
    if (this.$mask) {
      if (this.current) {
        this.set(this.current);
        this._hide();
      }
    } else {
      this._open();
    }
  },
  esc() {
    'use strict';
    this.set(this.previous);
    this._hide();
  },
  tab() {
    'use strict';
    this._hide();
  },
  gather(self) {
    'use strict';
    return {
      left: $.proxy(this.horizontalChange, self, '-1'),
      up: $.proxy(this.verticalChange, self, '-1'),
      right: $.proxy(this.horizontalChange, self, '1'),
      down: $.proxy(this.verticalChange, self, '1'),
      enter: $.proxy(this.enter, self),
      esc: $.proxy(this.esc, self)
    };
  },
  press(e) {
    'use strict';
    const key = e.keyCode || e.which;

    if (key === 9) {
      this._keyboard.tab.call(this);
    }

    if (key in this.map && typeof this.map[key] === 'function') {
      e.preventDefault();
      return this.map[key].call(this);
    }
    const self = this;
    this.$iconPicker.find(`.${this.namespace}-search-input`).one('keyup', function() {
      self.searching($(this).val());
    });
  },
  attach(self, map) {
    'use strict';
    let key;
    const _self = this;
    for (key in map) {
      if (map.hasOwnProperty(key)) {
        const parts = _self._stringSeparate(key, '_'),
          uppercase = [];
        const len = parts.length;

        if (len === 1) {
          uppercase[0] = parts[0].toUpperCase();
          self.map[this.keys()[uppercase[0]]] = map[key];
        } else {
          for (let i = 0; i < parts.length; i++) {
            uppercase[i] = parts[i].toUpperCase();
            if (i === 0) {
              if (self.map[this.keys()[uppercase[0]]] === undefined) {
                self.map[this.keys()[uppercase[0]]] = {};
              }
            } else {
              self.map[this.keys()[uppercase[0]]][this.keys()[uppercase[i]]] = map[key];
            }
          }
        }
      }
    }
    if (!self.bound) {
      self.bound = true;
      self.$wrapper.on('keydown', e => {
        _self.press.call(self, e);
      });
    }
  },
  _stringSeparate(str, separator) {
    'use strict';
    const re = new RegExp(`[.\\${separator}\\s].*?`);
    separator = str.match(re);
    const parts = str.split(separator);
    return parts;
  }
}

const pluginName = 'asIconPicker';

class asIconPicker {
  constructor(element, options) {
    this.element = element;
    this.$element = $$1(element);

    this.options = $$1.extend({}, defaults, options, this.$element.data());

    this._plugin = pluginName;
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
    this.$iconPicker = $$1(iconPicker);
    this.$iconContainer = this.$iconPicker.find(`.${this.namespace}-icons-container`);
    this.$iconSearch = $$1(iconSearch);

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
    const self = this;
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
    if (!self.options.flat) {
      this.$wrapper.find(`.${this.namespace}-selector`).on('click', () => {
        // Open/Close the icon picker
        self._open();
      });
    } else {
      self._open();
    }

    if (!this.options.keyboard) {
      this.$iconPicker.find(`.${this.namespace}-search-input`).keyup($$1.proxy(e => {
        self.searching($$1(e.currentTarget).val());
      }, this));
    } else {
      this.$wrapper.on('focus', () => {
        _keyboard.init(self);
      });
    }

    this.$iconPicker.on('click', `.${this.namespace}-isSearching .${this.namespace}-search-icon`, $$1.proxy(function() {
      this.$iconPicker.find(`.${this.namespace}-search-input`).focus().select();
      this.reset();
    }, this));

    this.$iconContainer.on('click', `.${this.namespace}-list li`, $$1.proxy(function(e) {
      if (this.options.cancelSelected && $$1(e.currentTarget).hasClass(`${this.namespace}-current`)) {
        $$1(e.currentTarget).removeClass(`${this.namespace}-current`);
        this.set();
        return;
      }
      this.set($$1(e.currentTarget).children().data('value'));
      this._hide();
    }, this)).on('mouseenter', `.${this.namespace}-list li`, $$1.proxy(function(e) {
      this.highlight($$1(e.currentTarget).children().data('value'));
    }, this)).on('mouseleave', `.${this.namespace}-list li`, $$1.proxy(function() {
      this.highlight();
    }, this));

    /**
     * Stop click propagation on iconpicker
     */
    this.$iconPicker.click(event => {
      event.stopPropagation();
      self.$iconPicker.find(`.${self.namespace}-search-input`).focus().select();
      return false;
    });

    this.initialized = true;
    // after init end trigger 'ready'
    this._trigger('ready');
  }

  _getSourceFromSelect() {
    const source = [];
    this.$element.children().each((i, el) => {
      const $el = $$1(el);
      if ($el.is('optgroup')) {
        const group = $$1.extend({}, $el.data(), {
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

    if (!$$1.isArray(source)) {
      for (const key in source) {
        if ({}.hasOwnProperty.call(source, key)) {
          processSource.push(processItem(key, source[key]));
        }
      }
    } else {
      for (let i = 0; i < source.length; i++) {
        if (source[i].items) {
          if ($$1.isArray(source[i].items)) {
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
      const self = this;
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

      const isMatchedItem = item => (self.replaceDiacritics(item.text).toLowerCase()).search(value.toLowerCase()) >= 0;
      let groupSearched = {};
      // Actual search
      for (let i = 0, item;
        (item = this.source[i]); i++) {
        if (typeof item.items !== 'undefined') {
          groupSearched = {
            label: item.label,
            items: $$1.grep(item.items, n => isMatchedItem(n))
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
    const self = this;
    if (typeof this.$iconContainer.data('asScrollbar') !== 'undefined') {
      this.$iconContainer.asScrollbar('destory');
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
      self.iconsAll.push(item.value);
      return $$1('<li/>', {
        html: `<i class="${self.options.extraClass} ${item.value}" data-value="${item.value}"></i>`,
        title: (self.options.tooltip) ? item.text : ''
      });
    };
    let $group;
    for (let i = 0, item; i < tempIcons.length; i++) {
      item = tempIcons[i];

      if (typeof item.label !== 'undefined') {
        if (item.items.length) {
          $group = $$1(`<div class="${this.namespace}-group"><div class="${this.namespace}-group-label">${item.label}:</div><ul class="${this.namespace}-list"></ul></div>`).appendTo(this.$iconContainer);
        }
        for (let j = 0, option;
          (option = item.items[j]); j++) {
          itemHTML(option).appendTo($group.find('ul'));
        }
      } else {
        const listClass = this.$iconContainer.children().last().attr('class');
        if (listClass !== `${this.namespace}-list`) {
          $$1(`<ul class="${this.namespace}-list"></ul>`).appendTo(this.$iconContainer);
        }
        itemHTML(item).appendTo(this.$iconContainer.children().last());
      }
    }
    if (this.options.tooltip) {
      $$1.asTooltip.closeAll();
      this.$iconContainer.find(`.${this.namespace}-list li`).asTooltip({
        namespace: 'asTooltip',
        skin: 'skin-dream',
        onlyOne: true
      });
    }

    this.index = $$1.inArray(this.current, this.iconsAll);

    if (this.index >= 0) {
      this.set(this.current, false);
    } else {
      this.set(null, false);
    }

    // Add the scrollbar in the iconContainer
    this.$iconContainer.asScrollbar({
      namespace: `${self.namespace}-icons`
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
    this.$iconContainer.asScrollbar('move', this.value, true);
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
      self = this;

    if (self.options.flat) {
      $selector.addClass(this.classes.flat);
      $selector.siblings(`.${this.namespace}-selector-popup`).addClass(this.classes.flat).removeClass(this.classes.hide);
    } else {
      $selector.addClass(this.classes.active);
      $selector.siblings(`.${this.namespace}-selector-popup`).addClass(this.classes.active).removeClass(this.classes.hide);
      this.previous = this.current;
      if ($selector.hasClass(this.classes.active) && !self.options.flat) {
        this.$iconPicker.find(`.${this.namespace}-search-input`).focus().select();
        this.$mask = $$1('<div></div>').addClass(this.classes.mask).appendTo(this.$element.parent());
        this.$mask.on('click', () => {
          self._hide();
        });
      }
    }
  }
  _hide() {
    if (this.options.flat) {
      return;
    }
    if (this.options.keyboard) {
      _keyboard.destroy(this);
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
    // event
    this.$element.trigger(`asIconPicker::${eventType}`, params);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, word => word.substring(0, 1).toUpperCase() + word.substring(1));
    const onFunction = `on${eventType}`;
    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, params);
    }
  }

  _update() {
    this.$element.val(this.val());
    this._trigger('change', this.current, this.options.name, pluginName);
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
    this.index = $$1.inArray(this.current, this.iconsAll);
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

    // here maybe have some events detached
  }
  disable() {
    this.disabled = true;
    // which element is up to your requirement
    // .disabled { pointer-events: none; } NO SUPPORT IE11 BELOW
    this.$wrapper.addClass(this.classes.disabled);
  }
  destory() {
    // detached events first
    // then remove all js generated html
    this.$element.data(pluginName, null);
    this._trigger('destory');
  }


  static _jQueryInterface(options, ...params) {
    'use strict';
    if (typeof options === 'string') {
      // let method = options;

      if (/^\_/.test(options)) {
        return false;
      } else if ((/^(get)$/.test(options)) || (options === 'val' && params.length === 0)) {
        let api = this.first().data(pluginName);
        if (api && typeof api[options] === 'function') {
          return api[options](...params);
        }
      } else {
        return this.each(function() {
          let api = $$1.data(this, pluginName);
          if (api && typeof api[options] === 'function') {
            api[options](...params);
          }
        });
      }
    }
    return this.each(function() {
      if (!$$1.data(this, pluginName)) {
        $$1.data(this, pluginName, new asIconPicker(this, options));
      }
    });

  }

}

// Plugin.defaults = defaults;

$$1.fn[pluginName] = asIconPicker._jQueryInterface;
$$1.fn[pluginName].constructor = asIconPicker;
$$1.fn[pluginName].noConflict = function() {
  'use strict';
  $$1.fn[pluginName] = JQUERY_NO_CONFLICT;
  return asIconPicker._jQueryInterface;
};

export default asIconPicker;