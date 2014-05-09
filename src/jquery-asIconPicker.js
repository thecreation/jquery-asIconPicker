/*
 * jquery-asIconPicker
 * https://github.com/amazingSurge/jquery-asIconPicker
 *
 * Copyright (c) 2013 joeylin
 * Licensed under the MIT license.
 */

(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    var pluginName = 'asIconPicker',
        defaults = {
            namespace: 'asIconPicker',
            source:           false,      // Icons source
            tooltip:          true,
            hasSearch:        true,
            extraClass:       'fa',
            iconPrefix:       'fa-',
            emptyText:        'None Selected',
            cancelSelected:   true,

            iconPicker: function() {
                return  '<div class="namespace-selector">' +
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
                return  '<div class="namespace-selector-search">' +
                            '<input type="text" name="" value="" placeholder="Search" class="namespace-search-input"/>' +
                            '<i class="asIcon-search"></i>' +
                        '</div>';
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
            hide: this.namespace + '_hide',
            hover: this.namespace + '_hover',
            mask: this.namespace + '-mask'
        };

        this.$element.addClass(this.namespace);
        this.$element.wrap('<div class="' + this.classes.wrapper + '"></div>');
        this.$wrapper = this.$element.parent();

        var iconPicker = this.options.iconPicker().replace(/namespace/g, this.namespace),
            iconSearch = this.options.iconSearch().replace(/namespace/g, this.namespace);
        this.$iconPicker = $(iconPicker);
        this.$iconContainer = this.$iconPicker.find('.' + this.namespace + '-icons-container');

        if (this.options.hasSearch) {
            this.$iconContainer.before($(iconSearch));
            this.$iconContainer.parent().addClass(this.classes.search);
            this.$searchIcon = this.$iconPicker.find('.' + this.namespace + '-selector-search i');
            this.iconsSearched = [];
            this.isSearch = false;
        }

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

            // If current element is SELECT populate options.source
            if (!this.options.source && this.$element.is('select')) {
                this.options.source = [];
                this.$element.children().each($.proxy(function (i, el) {
                    var item = [];
                    if (el.tagName.toLowerCase() === 'optgroup') {
                        var group = $.extend({}, $(el).data(), {
                            'label': el.label,
                            'options': []
                        });
                        for (var j = 0; j < $(el).children().length; j++) {
                            item = [];
                            item.value = $(el).children().eq(j).val();
                            item.text = $(el).children().eq(j).text();
                            group.options.push(item);
                        }
                        self.options.source.push(group);
                    }else if ($(el).val()) {
                        item.value = $(el).val();
                        item.text = $(el).text();
                        this.options.source.push(item);
                    }
                }, this));
            }

            // Load icons
            this.showLoading();

            this.$wrapper.find('.' + this.namespace + '-selector-popup').addClass(this.namespace + '_hide');
            /**
             * On down arrow click
             */
            this.$wrapper.find('.' + this.namespace + '-selector').on('click', function () {
                // Open/Close the icon picker
                $(this).addClass(self.classes.active);
                $(this).siblings('.' + self.namespace + '-selector-popup').addClass(self.classes.active).removeClass(self.classes.hide);
                self.reset();

                if ($(this).hasClass(self.classes.active)) {
                    self.$iconPicker.find('.' + self.namespace + '-search-input').focus().select();
                    self.$mask = $('<div></div>').addClass(self.classes.mask).appendTo(self.$element.parent());
                    self.$mask.on('click', function() {
                        self._clearMask();
                        self.$wrapper.find('.' + self.namespace + '-selector').removeClass(self.classes.active);
                        self.$wrapper.find('.' + self.namespace + '-selector-popup').addClass(self.classes.hide).removeClass(self.classes.active);
                    });
                }
            });

            /**
             * Realtime Icon Search
             */
            this.$iconPicker.find('.' + this.namespace + '-search-input').keyup($.proxy(function (e) {

                // Get the search string
                var searchString = $(e.currentTarget).val(),
                    current = '';

                // If the string is not empty
                if (searchString === '') {
                    this.reset();
                    return;
                }

                // Set icon search to X to reset search
                this.$searchIcon.removeClass('asIcon-search');
                this.$searchIcon.addClass('asIcon-times');

                // Set this as a search
                this.isSearch = true;
                this.iconsSearched = [];

                // Actual search
                for (var i = 0, item; item = this.options.source[i]; i++) {
                    if (typeof item.label !== 'undefined') {
                        var iconsSearched = [];
                        iconsSearched.label = item.label;
                        iconsSearched.options = $.grep(item.options, function(n){
                            return (n.value || n).search(searchString.toLowerCase()) >= 0;
                        });
                        if (iconsSearched.options.length > 0) {
                            this.iconsSearched.push(iconsSearched);
                            current = this.iconsSearched[0].options[0].value || this.iconsSearched[0].options[0];
                        }
                    }else {
                        item.value.search(searchString.toLowerCase()) >= 0 ? this.iconsSearched.push(item) : 0;
                        if (this.iconsSearched.length > 0) {
                            current = this.iconsSearched[0].value;
                        }
                    }
                }

                // Render icon list
                this.fillIcon();

                if (this.iconsSearched.length > 0) {
                    this.current = current;
                    this.select();
                }
            }, this));

            this.$iconPicker.find('.' + this.namespace + '-selector-search').on('click', '.asIcon-times', $.proxy(function () {
                this.$iconPicker.find('.' + this.namespace + '-search-input').focus().select();
                this.reset();
            }, this));

            this.$iconContainer.on('click', '.' + this.namespace + '-list li', $.proxy(function(e) {
                if (this.options.cancelSelected && $(e.currentTarget).hasClass(this.namespace + '-current')) {
                    $(e.currentTarget).removeClass(this.namespace + '-current');
                    this.set();
                    return;
                }
                this.set($(e.currentTarget).data('class'));
                this._clearMask();
                this.$wrapper.find('.' + this.namespace + '-selector').removeClass(this.classes.active);
                this.$wrapper.find('.' + this.namespace + '-selector-popup').addClass(this.classes.hide).removeClass(this.classes.active);
            },this)).on('mouseenter', '.' + this.namespace + '-list li', $.proxy(function(e) {
                this.highlight($(e.currentTarget).data('class'));
            },this)).on('mouseleave', '.' + this.namespace + '-list li', $.proxy(function(e) {
                this.highlight();
            },this));

            /**
             * Stop click propagation on iconpicker
             */
            this.$iconPicker.click(function (event) {
                event.stopPropagation();
                return false;
            });

            this.initialized = true;
            // after init end trigger 'ready'
            this._trigger('ready');
        },
        showLoading: function() {
            this.$iconContainer.html('<i class="' + this.namespace + 'loading"></i>');

            // If source is set
            if (this.options.source instanceof Array) {

                // Render icons
                this.fillIcon();
            }
        },

        /**
         * Fill icons inside the popup
         */
        fillIcon: function() {
            if(typeof this.$iconContainer.data('scroll') !=='undefined'){
                this.$iconContainer.scrollable('destory');
            } 
            var iconsContainer = [],
                iconsAll = [];

            // Set a temporary array for icons
            if (this.isSearch) {
                iconsContainer = this.iconsSearched;
            } else {
                iconsContainer = this.options.source;
            }

            // If not show an error when no icons are found
            if (iconsContainer.length < 1) {
                this.$iconContainer.html('<span class="' + this.namespace + '-error"><i class="' + this.options.extraClass + ' ' + this.options.iconPrefix + 'ban"></i></span>');
                return;

            // else empty the container
            } else {
                this.$iconContainer.html('');
            }

            // List icons
            for (var i = 0, item; item = iconsContainer[i]; i++) {
                if (typeof item.label !== 'undefined') {
                    if (item.options.length) {
                        var $group = $('<div class="' + this.namespace + '-group"><div class="' + this.namespace + '-group-label">' + item.label + ':</div><ul class="' + this.namespace + '-list"></ul></div>').appendTo(this.$iconContainer);
                    }
                    for (var j = 0, option; option = item.options[j]; j++) {
                        $('<li/>', {
                            html:      '<i class="' + this.options.extraClass + ' ' + (option.value || option)+ '"></i>',
                            'title':   (this.options.tooltip) ? (option.text || option) : ''
                        }).data('class', (option.value || option)).appendTo($group.find('ul'));
                        iconsAll.push(option);
                    }
                } else {
                    var listClass = this.$iconContainer.children().last().attr('class');
                    if (listClass !== this.namespace + '-list') {
                        $('<ul class="' + this.namespace + '-list"></ul>').appendTo(this.$iconContainer);
                    }
                    $('<li/>', {
                        html:      '<i class="' + this.options.extraClass + ' '  + (item.value || item) + '"></i>',
                        'title':   (this.options.tooltip) ? (item.text || item) : ''
                    }).data('class', (item.value || item)).appendTo(this.$iconContainer.children().last());
                    iconsAll.push(item);
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

            if ($.inArray(this.$element.val(), iconsAll) === -1) {

                // Set empty
                this.set();

            } else {

                // Set the default selected icon even if not set
                this.set(this.$element.val());
            }

            // Add the scrollbar in the iconContainer
            this.$iconContainer.scrollable();


            this._trigger('afterFill');
        },
        highlight: function(icon) {
            if (icon) {
                this.$iconPicker.find('.' + icon).parent().addClass(this.classes.hover);
            }else {
                this.$iconPicker.find('.' + this.classes.hover).removeClass(this.classes.hover);
            }
        },
        select: function () {
            this.$iconContainer.find('.' + this.namespace + '-current').removeClass(this.namespace + '-current');
            if (this.current) {
                this.$iconContainer.find('.' + this.current).parent('li').addClass(this.namespace + '-current');
            }
        },

        set: function(icon) {
            if (icon) {
                this.$iconPicker.find('.' + this.namespace + '-selected-icon').removeClass(this.namespace + '-none-selected').html('<i class="' + this.options.extraClass + ' ' + icon + '"></i>' + icon);
            }else {
                this.$iconPicker.find('.' + this.namespace + '-selected-icon').addClass(this.namespace + '-none-selected').html('<i class="' + this.options.extraClass + ' ' + this.options.iconPrefix + 'ban' + '"></i>' + this.options.emptyText);
            }

            // Set the value of the element and trigger change event
            this.$element.val(icon).triggerHandler('change');
            this.current = icon;
            this.select();
        },

        reset: function() {
            // Empty input
            this.$iconPicker.find('.' + this.namespace + '-search-input').val('');

            // Reset search icon class
            this.$searchIcon.removeClass('asIcon-times');
            this.$searchIcon.addClass('asIcon-search');
            this.isSearch = false;

            // Fill icons
            this.fillIcon();

            // Add the scrollbar in the iconContainer
            if (this.$iconContainer.outerHeight() >= 290) {
                this.$iconContainer.scrollable();
            }
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
            this.$element.trigger(pluginName + '::' + eventType, this);

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

            // here maybe have some events attached
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
            } else if ((/^(getTabs)$/.test(method)) || (method === 'val' && method_arguments === undefined)) {
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