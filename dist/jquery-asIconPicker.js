/**
* jQuery asIconPicker
* a jquery plugin
* Compiled: Tue Aug 16 2016 11:42:02 GMT+0800 (CST)
* @version v0.1.0
* @link https://github.com/amazingSurge/jquery-asIconPicker
* @copyright LGPL-3.0
*/
(function(global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'jQuery'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('jQuery'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.jQuery);
    global.jqueryAsIconPicker = mod.exports;
  }
})(this,

  function(exports, _jQuery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _jQuery2 = _interopRequireDefault(_jQuery);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;

          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);

        if (staticProps)
          defineProperties(Constructor, staticProps);

        return Constructor;
      };
    }();

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

      iconPicker: function iconPicker() {
        'use strict';

        return '<div class="namespace-selector">' + '<span class="namespace-selected-icon">' + 'None selected' + '</span>' + '<span class="namespace-selector-arrow">' + '<i></i>' + '</span>' + '</div>' + '<div class="namespace-selector-popup">' + '<div class="namespace-icons-container"></div>' + '</div>';
      },
      iconSearch: function iconSearch() {
        'use strict';

        return '<div class="namespace-selector-search">' + '<input type="text" name="" value="" placeholder="searchText" class="namespace-search-input"/>' + '<i class="namespace-search-icon"></i>' + '</div>';
      },
      formatNoMatches: function formatNoMatches() {
        'use strict';

        return 'No matches found';
      },
      errorHanding: function errorHanding() {},
      process: function process(value) {
        'use strict';

        if (value && value.match(this.iconPrefix)) {

          return value.replace(this.iconPrefix, '');
        }

        return value;
      },
      parse: function parse(value) {
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

    var _keyboard = {
      init: function init(self) {
        'use strict';

        this.attach(self, this.gather(self));
      },
      destroy: function destroy(self) {
        'use strict';

        self.$wrapper.off('keydown');
        self.bound = false;
      },
      keys: function keys() {
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
      horizontalChange: function horizontalChange(step) {
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
      verticalChange: function verticalChange(step) {
        'use strict';

        if (!this.$mask && !this.options.flat) {
          this._open();

          return;
        }
        var ulHeight = this.$iconContainer.find('.' + this.namespace + '-list').width();
        var liHeight = this.$iconContainer.find('.' + this.namespace + '-list li').width(),
          lineNumber = Math.floor(ulHeight / liHeight);

        step = parseInt(step, 10);

        if (this.index >= 0 && this.$iconContainer.find('.' + this.namespace + '-group').text()) {
          var siblingNumber = this.$iconContainer.find('.' + this.current).parent().siblings().length + 1;
          var nextNumber = this.$iconContainer.find('.' + this.current).parents('.' + this.namespace + '-group').next().find('li').length;
          var prevNumber = this.$iconContainer.find('.' + this.current).parents('.' + this.namespace + '-group').prev().find('li').length;
          var index = this.$iconContainer.find('.' + this.current).parent().index();
          var remain = void 0;

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
      enter: function enter() {
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
      esc: function esc() {
        'use strict';

        this.set(this.previous);
        this._hide();
      },
      tab: function tab() {
        'use strict';

        this._hide();
      },
      gather: function gather(self) {
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
      press: function press(e) {
        'use strict';

        var key = e.keyCode || e.which;

        if (key === 9) {
          this._keyboard.tab.call(this);
        }

        if (key in this.map && typeof this.map[key] === 'function') {
          e.preventDefault();

          return this.map[key].call(this);
        }
        var self = this;
        this.$iconPicker.find('.' + this.namespace + '-search-input').one('keyup',

          function() {
            self.searching($(this).val());
          }
        );
      },
      attach: function attach(self, map) {
        'use strict';

        var key = void 0;
        var _self = this;

        for (key in map) {

          if (map.hasOwnProperty(key)) {
            var parts = _self._stringSeparate(key, '_'),
              uppercase = [];
            var len = parts.length;

            if (len === 1) {
              uppercase[0] = parts[0].toUpperCase();
              self.map[this.keys()[uppercase[0]]] = map[key];
            } else {

              for (var i = 0; i < parts.length; i++) {
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
          self.$wrapper.on('keydown',

            function(e) {
              _self.press.call(self, e);
            }
          );
        }
      },
      _stringSeparate: function _stringSeparate(str, separator) {
        'use strict';

        var re = new RegExp('[.\\' + separator + '\\s].*?');
        separator = str.match(re);
        var parts = str.split(separator);

        return parts;
      }
    };

    var pluginName = 'asIconPicker';

    var asIconPicker = function() {
      function asIconPicker(element, options) {
        _classCallCheck(this, asIconPicker);

        this.element = element;
        this.$element = (0, _jQuery2.default)(element);

        this.options = _jQuery2.default.extend({}, defaults, options, this.$element.data());

        this._plugin = pluginName;
        this.namespace = this.options.namespace;

        this.classes = {
          disabled: this.namespace + '_disabled',
          wrapper: this.namespace + '-wrapper',
          search: this.namespace + '_with_search',
          active: this.namespace + '_active',
          flat: this.namespace + '_isFlat',
          hide: this.namespace + '_hide',
          hover: this.namespace + '_hover',
          mask: this.namespace + '-mask'
        };

        this.$element.addClass(this.namespace);
        this.$element.wrap('<div class="' + this.classes.wrapper + '"></div>');
        this.$wrapper = this.$element.parent();

        //make $wrapper can be focused
        this.$wrapper.attr('tabindex', '0');

        var iconPicker = this.options.iconPicker().replace(/namespace/g, this.namespace),
          iconSearch = this.options.iconSearch().replace(/namespace/g, this.namespace).replace(/searchText/g, this.options.searchText);
        this.$iconPicker = (0, _jQuery2.default)(iconPicker);
        this.$iconContainer = this.$iconPicker.find('.' + this.namespace + '-icons-container');
        this.$iconSearch = (0, _jQuery2.default)(iconSearch);

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

      _createClass(asIconPicker, [{
        key: 'init',
        value: function init() {
          var self = this;
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

          this.$wrapper.find('.' + this.namespace + '-selector-popup').addClass(this.classes.hide);
          /**
           * On down arrow click
           */

          if (!self.options.flat) {
            this.$wrapper.find('.' + this.namespace + '-selector').on('click',

              function() {
                // Open/Close the icon picker
                self._open();
              }
            );
          } else {
            self._open();
          }

          if (!this.options.keyboard) {
            this.$iconPicker.find('.' + this.namespace + '-search-input').keyup(_jQuery2.default.proxy(

              function(e) {
                self.searching((0, _jQuery2.default)(e.currentTarget).val());
              }
              , this));
          } else {
            this.$wrapper.on('focus',

              function() {
                _keyboard.init(self);
              }
            );
          }

          this.$iconPicker.on('click', '.' + this.namespace + '-isSearching .' + this.namespace + '-search-icon', _jQuery2.default.proxy(

            function() {
              this.$iconPicker.find('.' + this.namespace + '-search-input').focus().select();
              this.reset();
            }
            , this));

          this.$iconContainer.on('click', '.' + this.namespace + '-list li', _jQuery2.default.proxy(

            function(e) {
              if (this.options.cancelSelected && (0, _jQuery2.default)(e.currentTarget).hasClass(this.namespace + '-current')) {
                (0, _jQuery2.default)(e.currentTarget).removeClass(this.namespace + '-current');
                this.set();

                return;
              }
              this.set((0, _jQuery2.default)(e.currentTarget).children().data('value'));
              this._hide();
            }
            , this)).on('mouseenter', '.' + this.namespace + '-list li', _jQuery2.default.proxy(

            function(e) {
              this.highlight((0, _jQuery2.default)(e.currentTarget).children().data('value'));
            }
            , this)).on('mouseleave', '.' + this.namespace + '-list li', _jQuery2.default.proxy(

            function() {
              this.highlight();
            }
            , this));

          /**
           * Stop click propagation on iconpicker
           */
          this.$iconPicker.click(

            function(event) {
              event.stopPropagation();
              self.$iconPicker.find('.' + self.namespace + '-search-input').focus().select();

              return false;
            }
          );

          this.initialized = true;
          // after init end trigger 'ready'
          this._trigger('ready');
        }
      }, {
        key: '_getSourceFromSelect',
        value: function _getSourceFromSelect() {
          var source = [];
          this.$element.children().each(

            function(i, el) {
              var $el = (0, _jQuery2.default)(el);

              if ($el.is('optgroup')) {
                var group = _jQuery2.default.extend({}, $el.data(), {
                  label: el.label,
                  items: []
                });
                var $children = $el.children();
                var length = $children.length;

                for (var j = 0; j < length; j++) {
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
            }
          );

          return source;
        }
      }, {
        key: '_processSource',
        value: function _processSource(source) {
          var processItem = function processItem(key, item) {
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
          var processSource = [];

          if (!_jQuery2.default.isArray(source)) {

            for (var key in source) {

              if ({}.hasOwnProperty.call(source, key)) {
                processSource.push(processItem(key, source[key]));
              }
            }
          } else {

            for (var i = 0; i < source.length; i++) {

              if (source[i].items) {

                if (_jQuery2.default.isArray(source[i].items)) {

                  for (var j = 0; j < source[i].items.length; j++) {
                    source[i].items[j] = processItem(j, source[i].items[j]);
                  }
                  processSource[i] = source[i];
                } else {
                  processSource[i] = {
                    label: source[i].label,
                    items: []
                  };

                  for (var k in source[i].items) {

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
      }, {
        key: 'showLoading',
        value: function showLoading() {
          this.$iconContainer.html('<span class="' + this.namespace + '-loading"><i></i></span>');

          // If source is set

          if (this.source.length > 0) {

            // Render icons
            this.fillIcon();
          }
        }
      }, {
        key: 'searching',
        value: function searching(value) {
          var self = this;
          // If the string is not empty

          if (value === '') {
            this.reset();

            return;
          }

          // Set icon search to X to reset search
          this.$iconSearch.addClass(this.namespace + '-isSearching');

          // Set this as a search
          this.isSearch = true;
          this.iconsSearched = [];

          var isMatchedItem = function isMatchedItem(item) {
            return self.replaceDiacritics(item.text).toLowerCase().search(value.toLowerCase()) >= 0;
          };
          var groupSearched = {};
          // Actual search

          for (var i = 0, item; item = this.source[i]; i++) {

            if (typeof item.items !== 'undefined') {
              groupSearched = {
                label: item.label,
                items: _jQuery2.default.grep(item.items,

                  function(n) {
                    return isMatchedItem(n);
                  }
                )
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
            var first = this.iconsSearched[0];

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
      }, {
        key: 'fillIcon',
        value: function fillIcon() {
          var self = this;

          if (typeof this.$iconContainer.data('asScrollbar') !== 'undefined') {
            this.$iconContainer.asScrollbar('destory');
          }
          var tempIcons = [];
          this.iconsAll = [];

          // Set a temporary array for icons

          if (this.isSearch) {
            tempIcons = this.iconsSearched;
          } else {
            tempIcons = this.source;
          }

          // If not show an error when no icons are found

          if (tempIcons.length < 1) {
            this.$iconContainer.html('<div class="' + this.namespace + '-noMatch">' + this.options.formatNoMatches() + '</div>');

            return;

          // else empty the container
          }
          this.$iconContainer.html('');

          // List icons
          var itemHTML = function itemHTML(item) {
            self.iconsAll.push(item.value);

            return (0, _jQuery2.default)('<li/>', {
              html: '<i class="' + self.options.extraClass + ' ' + item.value + '" data-value="' + item.value + '"></i>',
              title: self.options.tooltip ? item.text : ''
            });
          };
          var $group = void 0;

          for (var i = 0, item; i < tempIcons.length; i++) {
            item = tempIcons[i];

            if (typeof item.label !== 'undefined') {

              if (item.items.length) {
                $group = (0, _jQuery2.default)('<div class="' + this.namespace + '-group"><div class="' + this.namespace + '-group-label">' + item.label + ':</div><ul class="' + this.namespace + '-list"></ul></div>').appendTo(this.$iconContainer);
              }

              for (var j = 0, option; option = item.items[j]; j++) {
                itemHTML(option).appendTo($group.find('ul'));
              }
            } else {
              var listClass = this.$iconContainer.children().last().attr('class');

              if (listClass !== this.namespace + '-list') {
                (0, _jQuery2.default)('<ul class="' + this.namespace + '-list"></ul>').appendTo(this.$iconContainer);
              }
              itemHTML(item).appendTo(this.$iconContainer.children().last());
            }
          }

          if (this.options.tooltip) {
            _jQuery2.default.asTooltip.closeAll();
            this.$iconContainer.find('.' + this.namespace + '-list li').asTooltip({
              namespace: 'asTooltip',
              skin: 'skin-dream',
              onlyOne: true
            });
          }

          this.index = _jQuery2.default.inArray(this.current, this.iconsAll);

          if (this.index >= 0) {
            this.set(this.current, false);
          } else {
            this.set(null, false);
          }

          // Add the scrollbar in the iconContainer
          this.$iconContainer.asScrollbar({
            namespace: self.namespace + '-icons'
          });

          this._trigger('afterFill');
        }
      }, {
        key: 'replaceDiacritics',
        value: function replaceDiacritics(s) {
          var k = void 0;
          var d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' ');

          for (k in d) {

            if ({}.hasOwnProperty.call(d, k)) {
              s = s.toLowerCase().replace(new RegExp('[' + d[k] + ']', 'g'), 'aeiouncy'.charAt(k));
            }
          }

          return s;
        }
      }, {
        key: 'highlight',
        value: function highlight(icon) {
          if (icon) {
            this.$iconPicker.find('.' + icon).parent().addClass(this.classes.hover);
          } else {
            this.$iconPicker.find('.' + this.classes.hover).removeClass(this.classes.hover);
          }
        }
      }, {
        key: 'scrollToSelectedIcon',
        value: function scrollToSelectedIcon() {
          if (this.current) {
            var ulWidth = this.$iconContainer.find('.' + this.namespace + '-list').width();
            var containerHeight = this.$iconContainer.height(),
              liHeight = this.$iconContainer.find('.' + this.namespace + '-list li').height(),
              liTop = this.$iconContainer.find('.' + this.current).parent().offset().top,
              liWidth = this.$iconContainer.find('.' + this.namespace + '-list li').width(),
              lineNumber = Math.floor(ulWidth / liWidth),
              ulTop = this.$iconContainer.find('.' + this.namespace + '-list').offset().top;

            if (this.index < lineNumber) {
              this.value = 0;
            } else {
              this.value = (liTop + liHeight - ulTop) / containerHeight;
            }
          }
          this.$iconContainer.asScrollbar('move', this.value, true);
        }
      }, {
        key: 'reset',
        value: function reset() {
          // Empty input
          this.$iconPicker.find('.' + this.namespace + '-search-input').val('');

          // Reset search icon class
          this.$iconSearch.removeClass(this.namespace + '-isSearching');
          this.isSearch = false;

          // Fill icons
          this.fillIcon();

          // Add the scrollbar in the iconContainer

          if (this.$iconContainer.outerHeight() >= this.options.heightToScroll) {
            this.$iconContainer.asScrollbar();
          }
        }
      }, {
        key: '_open',
        value: function _open() {
          var $selector = this.$wrapper.find('.' + this.namespace + '-selector'),
            self = this;

          if (self.options.flat) {
            $selector.addClass(this.classes.flat);
            $selector.siblings('.' + this.namespace + '-selector-popup').addClass(this.classes.flat).removeClass(this.classes.hide);
          } else {
            $selector.addClass(this.classes.active);
            $selector.siblings('.' + this.namespace + '-selector-popup').addClass(this.classes.active).removeClass(this.classes.hide);
            this.previous = this.current;

            if ($selector.hasClass(this.classes.active) && !self.options.flat) {
              this.$iconPicker.find('.' + this.namespace + '-search-input').focus().select();
              this.$mask = (0, _jQuery2.default)('<div></div>').addClass(this.classes.mask).appendTo(this.$element.parent());
              this.$mask.on('click',

                function() {
                  self._hide();
                }
              );
            }
          }
        }
      }, {
        key: '_hide',
        value: function _hide() {
          if (this.options.flat) {

            return;
          }

          if (this.options.keyboard) {
            _keyboard.destroy(this);
          }

          this._clearMask();
          this.$wrapper.find('.' + this.namespace + '-selector').removeClass(this.classes.active);
          this.$wrapper.find('.' + this.namespace + '-selector-popup').addClass(this.classes.hide).removeClass(this.classes.active);
          this.$wrapper.focus();
        }
      }, {
        key: '_clearMask',
        value: function _clearMask() {
          if (this.$mask) {
            this.$mask.off('.asIconPicker');
            this.$mask.remove();
            this.$mask = null;
          }
        }
      }, {
        key: '_trigger',
        value: function _trigger(eventType) {
          for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
          }

          // event
          this.$element.trigger('asIconPicker::' + eventType, params);

          // callback
          eventType = eventType.replace(/\b\w+\b/g,

            function(word) {
              return word.substring(0, 1).toUpperCase() + word.substring(1);
            }
          );
          var onFunction = 'on' + eventType;

          if (typeof this.options[onFunction] === 'function') {
            this.options[onFunction].apply(this, params);
          }
        }
      }, {
        key: '_update',
        value: function _update() {
          this.$element.val(this.val());
          this._trigger('change', this.current, this.options.name, pluginName);
        }
      }, {
        key: 'load',
        value: function load(source) {
          if (typeof source !== 'undefined') {
            this.source = this._processSource(source);
          }

          if (this.options.flat) {
            this.showLoading();
          } else {
            this.$wrapper.find('.' + this.namespace + '-selector-popup').removeClass(this.classes.hide);
            this.showLoading();
            this.$wrapper.find('.' + this.namespace + '-selector-popup').addClass(this.classes.hide);
          }
        }
      }, {
        key: 'get',
        value: function get() {
          return this.current;
        }
      }, {
        key: 'set',
        value: function set(icon, update) {
          this.$iconContainer.find('.' + this.namespace + '-current').removeClass(this.namespace + '-current');

          if (icon) {
            this.$iconContainer.find('[data-value="' + icon + '"]').parent().addClass(this.namespace + '-current');
            this.$iconPicker.find('.' + this.namespace + '-selected-icon').removeClass(this.namespace + '-none-selected').html('<i class="' + this.options.extraClass + ' ' + icon + '"></i>' + this.options.process(icon));
          } else {
            this.$iconPicker.find('.' + this.namespace + '-selected-icon').addClass(this.namespace + '-none-selected').html('<i class="' + this.options.extraClass + ' ' + this.options.iconPrefix + 'ban"></i>' + this.options.emptyText);
          }

          this.current = icon;
          this.index = _jQuery2.default.inArray(this.current, this.iconsAll);
          this.scrollToSelectedIcon();

          if (update !== false) {
            this._update();
          }
        }
      }, {
        key: 'clear',
        value: function clear() {
          this.set(null);
        }
      }, {
        key: 'val',
        value: function val(value) {
          if (typeof value === 'undefined') {

            return this.options.process(this.current);
          }

          var valueObj = this.options.parse(value);

          if (valueObj) {
            this.set(valueObj);
          } else {
            this.clear();
          }
        }
      }, {
        key: 'enable',
        value: function enable() {
          this.disabled = false;

          // which element is up to your requirement
          this.$wrapper.removeClass(this.classes.disabled);

        // here maybe have some events detached
        }
      }, {
        key: 'disable',
        value: function disable() {
          this.disabled = true;
          // which element is up to your requirement
          // .disabled { pointer-events: none; } NO SUPPORT IE11 BELOW
          this.$wrapper.addClass(this.classes.disabled);
        }
      }, {
        key: 'destory',
        value: function destory() {
          // detached events first
          // then remove all js generated html
          this.$element.data(pluginName, null);
          this._trigger('destory');
        }
      }], [{
        key: '_jQueryInterface',
        value: function _jQueryInterface(options) {
          'use strict';

          for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            params[_key2 - 1] = arguments[_key2];
          }

          if (typeof options === 'string') {
            // let method = options;

            if (/^\_/.test(options)) {

              return false;
            } else if (/^(get)$/.test(options) || options === 'val' && params.length === 0) {
              var api = this.first().data(pluginName);

              if (api && typeof api[options] === 'function') {

                return api[options].apply(api, params);
              }
            } else {

              return this.each(

                function() {
                  var api = _jQuery2.default.data(this, pluginName);

                  if (api && typeof api[options] === 'function') {
                    api[options].apply(api, params);
                  }
                }
              );
            }
          }

          return this.each(

            function() {
              if (!_jQuery2.default.data(this, pluginName)) {
                _jQuery2.default.data(this, pluginName, new asIconPicker(this, options));
              }
            }
          );
        }
      }]);

      return asIconPicker;
    }();

    // Plugin.defaults = defaults;

    _jQuery2.default.fn[pluginName] = asIconPicker._jQueryInterface;
    _jQuery2.default.fn[pluginName].constructor = asIconPicker;
    _jQuery2.default.fn[pluginName].noConflict = function() {
      'use strict';

      _jQuery2.default.fn[pluginName] = JQUERY_NO_CONFLICT;

      return asIconPicker._jQueryInterface;
    }
    ;

    exports.default = asIconPicker;
  }
);