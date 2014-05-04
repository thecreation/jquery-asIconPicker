/*! asIconPicker - v0.1.0 - 2014-05-04
* https://github.com/amazingsurge/jquery-asIconPicker
* Copyright (c) 2014 amazingSurge; Licensed MIT */
(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    var pluginName = 'asIconPicker',
        defaults = {
            namespace: 'asIconPicker',
            source:         false,      // Icons source
            tooltip:        true,

            iconPicker: function() {
                return  '<div class="namespace-selector">' +
                            '<span class="namespace-selected-icon">' +
                                '<i class="fa fa-ban"></i>None selected' +
                            '</span>' +
                            '<span class="namespace-selector-button">' +
                                '<i class="fa fa-caret-down"></i>' +
                            '</span>' +
                        '</div>' +
                        '<div class="namespace-selector-popup">' +
                            '<div class="namespace-selector-search">' +
                                '<input type="text" name="" value="" placeholder="Search" class="icons-search-input"/>' +
                                '<i class="fa fa-search"></i>' +
                            '</div>' +
                            '<div class="namespace-icons-container"></div>' +
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
            mask: this.namespace + '-mask'
        };

        this.$element.addClass(this.namespace);
        this.$element.wrap('<div class="' + this.classes.wrapper + '"></div>');

        var iconPicker = this.options.iconPicker().replace(/namespace/g, this.namespace);
        this.$iconPicker = $(iconPicker);
        this.$searchIcon = this.$iconPicker.find('.' + this.namespace + '-selector-search i');
        this.$iconContainer = this.$iconPicker.find('.' + this.namespace + '-icons-container');
        this.iconsSearched = [];
        this.isSearch = false;
        this.currentIcon = false;
        this.open = false;

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
                    if (el.tagName.toLowerCase() === 'optgroup') {
                        var group = $.extend({}, $(el).data(), {
                            'group': true,
                            'label': el.label,
                            'options': []
                        });
                        $(el).children().each(function() {
                            group.options.push($(this).val());
                        });
                        self.options.source.push(group);
                    }else if ($(el).val()) {
                        this.options.source.push($(el).val());
                    }
                }, this));
            }

            // Load icons
            this.loadIcon();

            this.$iconContainer.parent().hide();

            /**
             * On down arrow click
             */
            this.$iconPicker.parent().find('.' + this.namespace + '-selector').click($.proxy(function () {

                // Open/Close the icon picker
                this.toggleIconSelector();

            }, this));

            /**
             * Realtime Icon Search
             */
            this.$iconPicker.find('.icons-search-input').keyup($.proxy(function (e) {

                // Get the search string
                var searchString = $(e.currentTarget).val();

                // If the string is not empty
                if (searchString === '') {
                    this.resetSearch();
                    return;
                }

                // Set icon search to X to reset search
                this.$searchIcon.removeClass('fa-search');
                this.$searchIcon.addClass('fa-times');

                // Set this as a search
                this.isSearch = true;
                this.iconsSearched = [];

                // Actual search
                for (var i = 0, item; item = this.options.source[i]; i++) {
                    if (item.group) {
                        var iconsSearched = [];
                        iconsSearched.group = true;
                        iconsSearched.label = item.label;
                        iconsSearched.options = $.grep(item.options, function(n){
                            return n.search(searchString.toLowerCase()) >= 0;
                        });
                        if (iconsSearched.options.length > 0) {
                            this.iconsSearched.push(iconsSearched);
                        }
                    }else {
                        item.search(searchString.toLowerCase()) >= 0 ? this.iconsSearched.push(item) : 0;
                    }
                }

                // Render icon list
                this.fillIconContainer();
            }, this));

            this.$iconContainer.on('click', '.fa-box', $.proxy(function (e) {
                this.setSelectedIcon($(e.currentTarget).find('i').attr('class'));
                this.toggleIconSelector();
            }, this));

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
        loadIcon: function() {
            this.$iconContainer.html('<i class="fa fa-spinner animate-spin loading"></i>');

            // If source is set
            if (this.options.source instanceof Array) {

                // Render icons
                this.fillIconContainer();
            }
        },

        /**
         * Fill icons inside the popup
         */
        fillIconContainer: function() {
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
                this.$iconContainer.html('<span class="icons-picker-error"><i class="fa fa-ban"></i></span>');
                return;

            // else empty the container
            } else {
                this.$iconContainer.html('');
            }

            // List icons
            for (var i = 0, item; item = iconsContainer[i]; i++) {
                if (item.group) {
                    if (item.options.length) {
                        var $group = $('<div class="' + this.namespace + '-group"><p>' + item.label + ':</p></div>').appendTo(this.$iconContainer);
                    }
                    for (var j = 0, option; option = item.options[j]; j++) {
                        $('<span/>', {
                            html:      '<i class="fa ' + option + '"></i>',
                            'class':   'fa-box',
                            'title':   (this.options.tooltip) ? option : ''
                        }).appendTo($group);
                        iconsAll.push(option);
                    }
                } else {
                    $('<span/>', {
                        html:      '<i class="fa ' + item + '"></i>',
                        'class':   'fa-box',
                        'title':   (this.options.tooltip) ? item : ''
                    }).appendTo(this.$iconContainer);
                    iconsAll.push(item);
                }
            }
            if (this.options.tooltip) {
                $.asTooltip.closeAll();
                this.$iconContainer.find('.fa-box').asTooltip({
                    namespace: 'asTooltip',
                    skin: 'skin-dream',
                    onlyOne: true
                });
            }

            if ($.inArray(this.$element.val(), iconsAll) === -1) {

                // Set empty
                this.setSelectedIcon();

            } else {

                // Set the default selected icon even if not set
                this.setSelectedIcon('fa ' + this.$element.val());
            }

            // Add the scrollbar in the iconContainer
            this.$iconContainer.scrollable();


            this._trigger('afterFill');
        },
        setHighlightedIcon: function () {
            this.$iconContainer.find('.current-icon').removeClass('current-icon');
            if (this.currentIcon) {
                this.$iconContainer.find('.' + this.currentIcon).parent('span').addClass('current-icon');
            }
        },

        setSelectedIcon: function(icon) {
            var iconName = '';
            if (icon) {
                iconName = icon.match(/fa-+\S*/g);
            }
            this.$iconPicker.find('.' + this.namespace + '-selected-icon').html('<i class="' + (icon || 'fa fa-ban ' + this.namespace + '-none-selected') + '"></i>' + (iconName || 'None selected'));
            // Set the value of the element and trigger change event
            this.$element.val(icon).triggerHandler('change');
            this.currentIcon = iconName;
            this.setHighlightedIcon();
        },

        toggleIconSelector: function () {
            var self = this;
            this.open = (!this.open) ? 1 : 0;
            this.$iconPicker.parent().find('.' + this.namespace + '-selector-popup').slideToggle(300);
            this.$iconPicker.find('.' + this.namespace + '-selector-button i').toggleClass('fa-caret-up');
            this.$iconPicker.find('.' + this.namespace + '-selector-button i').toggleClass('fa-caret-down');
            this._clearMask();
            if (this.open) {
                this.$iconPicker.find('.icons-search-input').focus().select();
                this.$mask = $('<div></div>').addClass(this.classes.mask).appendTo(this.$element.parent());
                this.$mask.on('click', function() {
                    self.toggleIconSelector();
                    return false;
                });
            }
        },
        resetSearch: function() {
            // Empty input
            this.$iconPicker.find('.icons-search-input').val('');

            // Reset search icon class
            this.$searchIcon.removeClass('fa-times');
            this.$searchIcon.addClass('fa-search');
            this.isSearch = false;

            // Fill icons
            this.fillIconContainer();

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
            this.$element.removeClass(this.classes.disabled);

            // here maybe have some events detached
        },
        disable: function() {
            this.disabled = true;
            // which element is up to your requirement
            // .disabled { pointer-events: none; } NO SUPPORT IE11 BELOW
            this.$element.addClass(this.classes.disabled);

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