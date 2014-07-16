/*
 * jquery-asIconPicker
 * https://github.com/amazingSurge/jquery-asIconPicker
 *
 * Copyright (c) 2014 amazingSurge
 * Licensed under the MIT license.
 */

(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    var pluginName = 'asIconPicker',
        defaults = {
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

            iconPicker: function() {
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
            iconSearch: function() {
                return '<div class="namespace-selector-search">' +
                    '<input type="text" name="" value="" placeholder="searchText" class="namespace-search-input"/>' +
                    '<i class="namespace-search-icon"></i>' +
                    '</div>';
            },
            formatNoMatches: function() {
                return "No matches found";
            },
            errorHanding: function() {},
            process: function(value) {
                if (value.match(this.iconPrefix)) {
                    return value.replace(this.iconPrefix, '');
                } else {
                    return value;
                }
            },
            parse: function(value) {
                if (value.match(this.iconPrefix)) {
                    return value;
                } else {
                    return this.iconPrefix + value;
                }
            },
            // callback
            onInit: null,
            onReady: null,
            onAfterFill: null
        };

    var Plugin = $[pluginName] = function(element, options) {
        this.element = element;
        this.$element = $(element);

        this.options = $.extend({}, defaults, options, this.$element.data());

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
        this.$iconPicker = $(iconPicker);
        this.$iconContainer = this.$iconPicker.find('.' + this.namespace + '-icons-container');
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
    };

    Plugin.prototype = {
        constructor: Plugin,

        init: function() {
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
                this.$wrapper.find('.' + this.namespace + '-selector').on('click', function() {
                    // Open/Close the icon picker
                    self._open();
                });
            } else {
                self._open();
            }

            if (!this.options.keyboard) {
                this.$iconPicker.find('.' + this.namespace + '-search-input').keyup($.proxy(function(e) {
                    self.searching($(e.currentTarget).val());
                }, this));
            } else {
                this.$wrapper.on('focus', function() {
                    self._keyboard.init(self);
                });
            }

            this.$iconPicker.on('click', '.' + this.namespace + '-isSearching .' + this.namespace + '-search-icon', $.proxy(function() {
                this.$iconPicker.find('.' + this.namespace + '-search-input').focus().select();
                this.reset();
            }, this));

            this.$iconContainer.on('click', '.' + this.namespace + '-list li', $.proxy(function(e) {
                if (this.options.cancelSelected && $(e.currentTarget).hasClass(this.namespace + '-current')) {
                    $(e.currentTarget).removeClass(this.namespace + '-current');
                    this.set();
                    return;
                }
                this.set($(e.currentTarget).children().data('value'));
                this._hide();
            }, this)).on('mouseenter', '.' + this.namespace + '-list li', $.proxy(function(e) {
                this.highlight($(e.currentTarget).children().data('value'));
            }, this)).on('mouseleave', '.' + this.namespace + '-list li', $.proxy(function(e) {
                this.highlight();
            }, this));

            this.$iconContainer.on('change.asScrollbar', function(e, val) {
                self.value = val;
            });

            /**
             * Stop click propagation on iconpicker
             */
            this.$iconPicker.click(function(event) {
                event.stopPropagation();
                self.$iconPicker.find('.' + self.namespace + '-search-input').focus().select();
                return false;
            });

            this.initialized = true;
            // after init end trigger 'ready'
            this._trigger('ready');
        },

        _getSourceFromSelect: function() {
            var self = this;
            var source = [];
            this.$element.children().each(function(i, el) {
                var item = {},
                    $el = $(el);
                if ($el.is('optgroup')) {
                    var group = $.extend({}, $el.data(), {
                        'label': el.label,
                        'items': []
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
            });

            return source;
        },

        _processSource: function(source) {
            var processItem = function(key, item) {
                if (typeof key === 'string') {
                    return {
                        value: key,
                        text: item
                    };
                } else {
                    if (typeof item === 'string') {
                        return {
                            value: item,
                            text: item
                        };
                    } else {
                        return item;
                    }
                }
            };
            var processSource = [];

            if (!$.isArray(source)) {
                for (var key in source) {
                    processSource.push(processItem(key, source[key]));
                }
            } else {
                for (var i = 0; i < source.length; i++) {
                    if (source[i].items) {
                        if ($.isArray(source[i].items)) {
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
                                processSource[i].items.push(processItem(k, source[i].items[k]));
                            }
                        }
                    } else {
                        processSource[i] = processItem(i, source[i]);
                    }
                }
            }

            return processSource;
        },

        showLoading: function() {
            this.$iconContainer.html('<span class="' + this.namespace + '-loading"><i></i></span>');

            // If source is set
            if (this.source.length > 0) {

                // Render icons
                this.fillIcon();
            }
        },
        searching: function(value) {
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

            var isMatchedItem = function(item) {
                return (self.replaceDiacritics(item.text).toLowerCase()).search(value.toLowerCase()) >= 0;
            };
            var groupSearched = {};
            // Actual search
            for (var i = 0, item; item = this.source[i]; i++) {
                if (typeof item.items !== 'undefined') {
                    groupSearched = {
                        label: item.label,
                        items: $.grep(item.items, function(n) {
                            return isMatchedItem(n);
                        })
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
        },
        /**
         * Fill icons inside the popup
         */
        fillIcon: function() {
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
            } else {
                this.$iconContainer.html('');
            }

            // List icons
            var itemHTML = function(item) {
                self.iconsAll.push(item.value);
                return $('<li/>', {
                    html: '<i class="' + self.options.extraClass + ' ' + item.value + '" data-value="' + item.value + '"></i>',
                    'title': (self.options.tooltip) ? item.text : ''
                });
            }

            for (var i = 0, item; i < tempIcons.length; i++) {
                item = tempIcons[i];

                if (typeof item.label !== 'undefined') {
                    if (item.items.length) {
                        var $group = $('<div class="' + this.namespace + '-group"><div class="' + this.namespace + '-group-label">' + item.label + ':</div><ul class="' + this.namespace + '-list"></ul></div>').appendTo(this.$iconContainer);
                    }
                    for (var j = 0, option; option = item.items[j]; j++) {
                        itemHTML(option).appendTo($group.find('ul'));
                    }
                } else {
                    var listClass = this.$iconContainer.children().last().attr('class');
                    if (listClass !== this.namespace + '-list') {
                        $('<ul class="' + this.namespace + '-list"></ul>').appendTo(this.$iconContainer);
                    }
                    itemHTML(item).appendTo(this.$iconContainer.children().last());
                }
            }
            if (this.options.tooltip) {
                $.asTooltip.closeAll();
                this.$iconContainer.find('.' + this.namespace + '-list li').asTooltip({
                    namespace: 'asTooltip',
                    skin: 'skin-dream',
                    onlyOne: true
                });
            }

            this.index = $.inArray(this.current, this.iconsAll);

            if (this.index >= 0) {
                this.set(this.current);
            } else {
                this.set();
            }

            // Add the scrollbar in the iconContainer
            var self = this;
            this.$iconContainer.asScrollbar({
                contentClass: self.namespace + '-icons-content',
                wrapperClass: self.namespace + '-icons-wrapper'
            });

            this._trigger('afterFill');
        },
        replaceDiacritics: function(s) {
            // /[\340-\346]/g, // a
            // /[\350-\353]/g, // e
            // /[\354-\357]/g, // i
            // /[\362-\370]/g, // o
            // /[\371-\374]/g, // u
            // /[\361]/g, // n
            // /[\347]/g, // c
            // /[\377]/g // y
            var k, d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' ');
            for (k in d)
                s = s.toLowerCase().replace(RegExp('[' + d[k] + ']', 'g'), 'aeiouncy'.charAt(k));
            return s;
        },
        highlight: function(icon) {
            if (icon) {
                this.$iconPicker.find('.' + icon).parent().addClass(this.classes.hover);
            } else {
                this.$iconPicker.find('.' + this.classes.hover).removeClass(this.classes.hover);
            }
        },
        scrollToSelectedIcon: function() {
            if (this.current) {
                var containerHeight = this.$iconContainer.height(),
                    ulTop = this.$iconContainer.find('.' + this.namespace + '-list').offset().top,
                    ulWidth = this.$iconContainer.find('.' + this.namespace + '-list').width(),
                    liWidth = this.$iconContainer.find('.' + this.namespace + '-list li').width(),
                    liHeight = this.$iconContainer.find('.' + this.namespace + '-list li').height(),
                    liTop = this.$iconContainer.find('.' + this.current).parent().offset().top,
                    lineNumber = Math.floor(ulWidth / liWidth);

                if (this.index < lineNumber) {
                    this.value = 0;
                } else {
                    this.value = (liTop + liHeight - ulTop) / containerHeight;
                }
            }
            this.$iconContainer.asScrollbar('move', this.value, true);
        },
        reset: function() {
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
        },
        _open: function() {
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
                    this.$mask = $('<div></div>').addClass(this.classes.mask).appendTo(this.$element.parent());
                    this.$mask.on('click', function() {
                        self._hide();
                    });
                }
            }
        },
        _hide: function() {
            if (this.options.flat) {
                return;
            }
            if (this.options.keyboard) {
                this._keyboard.destroy(this);
            }

            this._clearMask();
            this.$wrapper.find('.' + this.namespace + '-selector').removeClass(this.classes.active);
            this.$wrapper.find('.' + this.namespace + '-selector-popup').addClass(this.classes.hide).removeClass(this.classes.active);
            this.$wrapper.focus();
        },
        _clearMask: function() {
            if (this.$mask) {
                this.$mask.off('.asIconPicker');
                this.$mask.remove();
                this.$mask = null;
            }
        },
        _trigger: function(eventType) {
            // event
            this.$element.trigger('asIconPicker::' + eventType, this);
            this.$element.trigger(eventType + '.asIconPicker', this);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;
            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },
        _keyboard: {
            init: function(self) {
                this.attach(self, this.gather(self));
            },
            destroy: function(self) {
                self.$wrapper.off('keydown');
                self.bound = false;
            },
            keys: function() {
                return {
                    'LEFT': 37,
                    'UP': 38,
                    'RIGHT': 39,
                    'DOWN': 40,
                    'ENTER': 13,
                    'ESC': 27
                };
            },
            horizontalChange: function(step) {
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
            verticalChange: function(step) {
                if (!this.$mask && !this.options.flat) {
                    this._open();
                    return;
                }
                var ulHeight = this.$iconContainer.find('.' + this.namespace + '-list').width(),
                    liHeight = this.$iconContainer.find('.' + this.namespace + '-list li').width(),
                    lineNumber = Math.floor(ulHeight / liHeight);
                step = parseInt(step, 10);

                if (this.index >= 0 && this.$iconContainer.find('.' + this.namespace + '-group').text()) {
                    var siblingNumber = this.$iconContainer.find('.' + this.current).parent().siblings().length + 1,
                        nextNumber = this.$iconContainer.find('.' + this.current).parents('.' + this.namespace + '-group').next().find('li').length,
                        prevNumber = this.$iconContainer.find('.' + this.current).parents('.' + this.namespace + '-group').prev().find('li').length,
                        index = this.$iconContainer.find('.' + this.current).parent().index();
                    if (step === 1) {
                        var remain = siblingNumber % lineNumber;

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
                        var remain = prevNumber % lineNumber;

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
            enter: function() {
                if (this.$mask) {
                    if (this.current) {
                        this.set(this.current);
                        this._hide();
                    }
                } else {
                    this._open();
                }
            },
            esc: function() {
                this.set(this.previous);
                this._hide();
            },
            tab: function() {
                this._hide();
            },
            gather: function(self) {
                return {
                    left: $.proxy(this.horizontalChange, self, '-1'),
                    up: $.proxy(this.verticalChange, self, '-1'),
                    right: $.proxy(this.horizontalChange, self, '1'),
                    down: $.proxy(this.verticalChange, self, '1'),
                    enter: $.proxy(this.enter, self),
                    esc: $.proxy(this.esc, self)
                };
            },
            press: function(e) {
                var key = e.keyCode || e.which;

                if (key === 9) {
                    this._keyboard.tab.call(this);
                }

                if (key in this.map && typeof this.map[key] === 'function') {
                    e.preventDefault();
                    return this.map[key].call(this);
                } else {
                    var self = this;
                    this.$iconPicker.find('.' + this.namespace + '-search-input').one('keyup', function() {
                        self.searching($(this).val());
                    });
                }
            },
            attach: function(self, map) {
                var key, _self = this;
                for (key in map) {
                    if (map.hasOwnProperty(key)) {
                        var uppercase = [],
                            parts = _self._stringSeparate(key, '_'),
                            len = parts.length;

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
                    self.$wrapper.on('keydown', function(e) {
                        _self.press.call(self, e);
                    });
                }
            },
            _stringSeparate: function(str, separator) {
                var re = new RegExp("[.\\" + separator + "\\s].*?"),
                    separator = str.match(re),
                    parts = str.split(separator);
                return parts;
            },
        },
        load: function(source) {
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
        },
        get: function() {
            var current;
            if (this.current) {
                current = this.current;
            } else {
                current = "";
            }
            return current;
        },
        set: function(icon) {
            this.$iconContainer.find('.' + this.namespace + '-current').removeClass(this.namespace + '-current');
            if (icon) {
                this.$iconContainer.find('[data-value="' + icon + '"]').parent().addClass(this.namespace + '-current');
                this.$iconPicker.find('.' + this.namespace + '-selected-icon').removeClass(this.namespace + '-none-selected').html('<i class="' + this.options.extraClass + ' ' + icon + '"></i>' + this.options.process(icon));
            } else {
                this.$iconPicker.find('.' + this.namespace + '-selected-icon').addClass(this.namespace + '-none-selected').html('<i class="' + this.options.extraClass + ' ' + this.options.iconPrefix + 'ban' + '"></i>' + this.options.emptyText);
            }

            // Set the value of the element and trigger change event
            this.$element.val(icon).triggerHandler('change');
            this.current = icon;
            this.index = $.inArray(this.current, this.iconsAll);
            this.scrollToSelectedIcon();

        },
        clear: function() {
            this.set(null);
        },
        val: function(value) {
            if (typeof value === 'undefined') {
                return this.options.process(this.value);
            }

            var value_obj = this.options.parse(value);

            if (value_obj) {
                this.set(value_obj);
            } else {
                this.clear();
            }
        },
        enable: function() {
            this.disabled = false;

            // which element is up to your requirement
            this.$wrapper.removeClass(this.classes.disabled);

            // here maybe have some events detached
        },
        disable: function() {
            this.disabled = true;
            // which element is up to your requirement
            // .disabled { pointer-events: none; } NO SUPPORT IE11 BELOW
            this.$wrapper.addClass(this.classes.disabled);
        },
        destory: function() {
            // detached events first
            // then remove all js generated html
            this.$element.data(pluginName, null);
            this._trigger('destory');
        }
    };

    Plugin.defaults = defaults;

    $.fn[pluginName] = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            if (/^\_/.test(method)) {
                return false;
            } else if ((/^(get)$/.test(method)) || (method === 'val' && method_arguments === undefined)) {
                var api = this.first().data(pluginName);
                if (api && typeof api[method] === 'function') {
                    return api[method].apply(api, method_arguments);
                }
            } else {
                return this.each(function() {
                    var api = $.data(this, pluginName);
                    if (api && typeof api[method] === 'function') {
                        api[method].apply(api, method_arguments);
                    }
                });
            }
        } else {
            return this.each(function() {
                if (!$.data(this, pluginName)) {
                    $.data(this, pluginName, new Plugin(this, options));
                }
            });
        }
    };
})(jQuery, document, window);
