/*
 * toolTip
 * https://github.com/amazingSurge/tooltip
 *
 * Copyright (c) 2013 amazingSurge
 * Licensed under the MIT license.
 */

(function($) {
    "use strict";

    var v, $win = $(window);
    var active = false;
    var dataPool = [];

    var POSITION = 'nswe';
    var resovolution = {
        n: {
            n: 's',
            w: 'ne',
            e: 'nw'
        },
        s: {
            s: 'n',
            w: 'se',
            e: 'sw'
        },
        w: {
            w: 'e',
            n: 'sw',
            s: 'nw'
        },
        e: {
            e: 'w',
            n: 'se',
            s: 'ne'
        },
        nw: {
            n: 'sw',
            w: 'ne'
        },
        ne: {
            n: 'se',
            e: 'nw'
        },
        sw: {
            s: 'nw',
            w: 'se'
        },
        se: {
            s: 'ne',
            e: 'sw'
        }
    };

    // we'll use this to detect for mobile devices
    function is_touch_device() {
        return !!('ontouchstart' in window);
    }

    // this is the core function to compute the position to show depended on the given placement argument 
    function computePlacementCoords(element, placement, popWidth, popHeight, popSpace, onCursor) {
        // grab measurements
        var objectOffset, objectWidth, objectHeight,
            x = 0,
            y = 0;

        if (onCursor) {
            objectOffset = element;
            objectWidth = 0;
            objectHeight = 0;
        } else {
            objectOffset = element.offset();
            objectWidth = element.outerWidth();
            objectHeight = element.outerHeight();
        }


        // calculate the appropriate x and y position in the document
        switch (placement) {
            case 'n':
                x = (objectOffset.left + (objectWidth / 2)) - (popWidth / 2);
                y = objectOffset.top - popHeight - popSpace;
                break;
            case 'e':
                x = objectOffset.left + objectWidth + popSpace;
                y = (objectOffset.top + (objectHeight / 2)) - (popHeight / 2);
                break;
            case 's':
                x = (objectOffset.left + (objectWidth / 2)) - (popWidth / 2);
                y = objectOffset.top + objectHeight + popSpace;
                break;
            case 'w':
                x = objectOffset.left - popWidth - popSpace;
                y = (objectOffset.top + (objectHeight / 2)) - (popHeight / 2);
                break;
            case 'nw':
            case 'wn':
                x = (objectOffset.left - popWidth) + 20;
                y = objectOffset.top - popHeight - popSpace;
                break;
            case 'ne':
            case 'en':
                x = (objectOffset.left + objectWidth) - 20;
                y = objectOffset.top - popHeight - popSpace;
                break;
            case 'sw':
            case 'ws':
                x = (objectOffset.left - popWidth) + 20;
                y = objectOffset.top + objectHeight + popSpace;
                break;
            case 'se':
            case 'es':
                x = (objectOffset.left + objectWidth) - 20;
                y = objectOffset.top + objectHeight + popSpace;
                break;
        }

        return {
            left: Math.round(x),
            top: Math.round(y)
        };
    }

    function getViewportCollisions(target, popElem) {
        var scrollLeft = $win.scrollLeft(),
            scrollTop = $win.scrollTop(),
            offset = target.offset(),
            elementWidth = target.outerWidth(true),
            elementHeight = target.outerHeight(true),
            windowWidth = $win.width(),
            windowHeight = $win.height(),
            collisions = [],
            popWidth, popHeight;

        if (popElem) {
            popWidth = popElem.outerWidth(true);
            popHeight = popElem.outerHeight(true);
        } else {
            // for loading animation icon placeholder
            popWidth = 100;
            popHeight = 50;
        }

        if (offset.top < scrollTop + popHeight) {
            collisions.push('n');
        }
        if (offset.top + elementHeight + popHeight > scrollTop + windowHeight) {
            collisions.push('s');
        }
        if (offset.left < scrollLeft + popWidth) {
            collisions.push('w');
        }
        if (offset.left + elementWidth + popWidth > scrollLeft + windowWidth) {
            collisions.push('e');
        }

        return collisions;
    }

    // detecting support for CSS transitions
    function supportsTransitions() {
        var b = document.body || document.documentElement;
        var s = b.style;
        var p = 'transition';
        if (typeof s[p] === 'string') {
            return true;
        }

        v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
        p = p.charAt(0).toUpperCase() + p.substr(1);
        for (var i = 0; i < v.length; i++) {
            if (typeof s[v[i] + p] === 'string') {
                return true;
            }
        }
        return false;
    }

    var transitionSupport = true;
    if (!supportsTransitions()) {
        transitionSupport = false;
    }

    // Static method.
    var AsTooltip = $.asTooltip = function(elem, options) {
        var metas = {};

        this.$elem = $(elem);

        $.each(this.$elem.data(), function(k, v) {
            if (/^asTooltip/i.test(k)) {
                metas[k.toLowerCase().replace(/^asTooltip/i, '')] = v;
            }
        });

        //options is a static properity
        this.options = $.extend({}, AsTooltip.defaults, options, metas);
        this.namespace = this.options.namespace;

        if (this.$elem.attr('title')) {
            this.options.title = this.$elem.attr('title');
            this.$elem.removeAttr('title');
        }

        this.content = null;
        this.target = this.options.target || this.$elem;

        this.isOpen = null;
        this.enabled = true;
        this.tolerance = null;

        this.onlyOne = this.options.onlyOne || false;

        this.init();
    };

    AsTooltip.prototype = {
        constructor: AsTooltip,
        init: function() {
            var opts = this.options,
                self = this;

            // add namespace
            opts.tpl = this.parseTpl(opts.tpl);

            this.$container = $(opts.tpl.container);
            this.$loading = $(opts.tpl.loading);
            this.$arrow = $(opts.tpl.arrow);
            this.$close = $(opts.tpl.close);
            this.$content = $(opts.tpl.content);

            if (opts.trigger === 'hover') {
                this.target.on('mouseenter.asTooltip', function() {
                    if (self.isOpen === true) {
                        clearTimeout(this.tolerance);
                        return;
                    } else {
                        $.proxy(self.show, self)();
                    }
                });

                if (opts.interactive === true) {
                    this.target.on('mouseleave.asTooltip', function() {
                        var keepShow = false;

                        self.$container.on('mouseenter.asTooltip', function() {
                            keepShow = true;
                        });
                        self.$container.on('mouseleave.asTooltip', function() {
                            keepShow = false;
                        });

                        clearTimeout(this.tolerance);

                        this.tolerance = setTimeout(function() {
                            if (keepShow === true) {
                                self.$container.on('mouseleave.asTooltip', $.proxy(self.hide, self));
                            } else {
                                $.proxy(self.hide, self)();
                            }
                        }, self.options.interactiveDelay);
                    });

                } else {
                    this.target.on('mouseleave.asTooltip', $.proxy(self.hide, self));
                }

                if (this.options.mouseTrace === true) {
                    this.target.on('mousemove.asTooltip', function(event) {
                        var pos, cursor = {},
                            x = event.pageX,
                            y = event.pageY;

                        cursor = {
                            top: y,
                            left: x
                        };

                        pos = computePlacementCoords(cursor, self.options.position, self.width, self.height, self.options.popSpace, true);

                        self.$container.css({
                            display: 'block',
                            top: pos.top,
                            left: pos.left
                        });
                    });
                }
            }
            if (opts.trigger === 'click') {
                this.target.on('click.asTooltip', function() {
                    if (self.isOpen === true) {
                        $.proxy(self.hide, self)();
                    } else {
                        $.proxy(self.show, self)();
                    }
                });
            }

            //store all instance in dataPool
            dataPool.push(this);
        },
        load: function() {
            var self = this,
                opts = this.options;

            // when ajax content add to container , recompulate the position again
            if (opts.ajax === true) {
                $.ajax($.extend({}, opts.ajaxSettings, {
                    url: opts.title,
                    error: function() {
                        throw new Error('ajax error');
                    },
                    success: function(data, status) {
                        if (status === 'success') {
                            self.content = data;
                            self.$container.css({
                                display: 'none'
                            });
                            self.$content.empty().append(self.content);
                            self.$container.removeClass(self.posCss);
                            self.setPosition();
                        }
                    }
                }));
            } else if (opts.inline === true) {
                if (opts.title.indexOf('+') !== -1) {
                    this.content = this.$elem.next().css({
                        display: 'block'
                    });
                } else {
                    this.content = $(opts.title).css({
                        display: 'block'
                    });
                }

            } else {
                this.content = opts.title;
            }

            // if (this.content === null) {
            //     throw new Error('no content');
            // }
        },
        parseTpl: function(obj) {
            var tpl = {},
                self = this;
            $.each(obj, function(key, value) {
                tpl[key] = value.replace('{{namespace}}', self.namespace);
            });

            return tpl;
        },
        showLoading: function() {
            this.$content.empty();
            this.$loading.css({
                display: 'block'
            });
        },
        hideLoading: function() {
            this.$loading.css({
                display: 'none'
            });
        },
        setPosition: function() {
            var opts = this.options,
                pos,
                posCss = this.namespace + '-' + opts.position;

            this.width = this.$container.outerWidth();
            this.height = this.$container.outerHeight();

            if (opts.mouseTrace !== true) {
                //compute position
                if (opts.autoPosition === true) {
                    var newPos,
                        collisions = [];

                    if (opts.ajax === true && this.content === null) {
                        // use default value to judge collisions
                        collisions = getViewportCollisions($(this.target));
                    } else {
                        // change opts.postion
                        collisions = getViewportCollisions($(this.target), this.$container);
                    }

                    if (collisions.length === 0) {
                        newPos = opts.position;
                    } else if (collisions.length === 1) {
                        var res = resovolution[opts.position][collisions[0]];
                        if (res === undefined) {
                            newPos = opts.position;
                        } else {
                            newPos = res;
                        }
                    } else {
                        var cachString = POSITION;
                        $.each(collisions, function(i, v) {
                            cachString.replace(v, '');
                        });
                        newPos = cachString;
                    }

                    posCss = this.namespace + '-' + newPos;
                    pos = computePlacementCoords(this.target, newPos, this.width, this.height, this.options.popSpace);
                } else {
                    pos = computePlacementCoords(this.target, opts.position, this.width, this.height, this.options.popSpace);
                }

                //show container
                this.$container.css({
                    display: 'block',
                    top: pos.top,
                    left: pos.left
                });
            } else {
                this.$container.addClass('pointer-events-none');
            }

            this.posCss = posCss;
            this.$container.addClass(posCss);
        },

        /*
            Public Method
         */

        show: function() {
            var opts = this.options,
                self = this;

            if (!this.enabled) {
                return;
            }
            if (this.onlyOne) {
                $.each(dataPool, function(i, v) {
                    if (v === self) {
                        return;
                    } else {
                        if (v.isOpen) {
                            v.hide();
                        }
                    }
                });
            }
            if (opts.closeBtn) {
                this.$container.append(this.$close);
            }
            this.$container.append(this.$arrow).append(this.$content);

            this.$elem.addClass(this.namespace + '_active');

            // here judge the position first and then insert into body
            // if content has loaded , never load again
            this.content === null && this.load();

            if (this.content === null) {
                this.$content.append(this.$loading);
            } else {
                this.$content.empty().append(this.content);
            }

            if (opts.skin) {
                this.$container.addClass(this.namespace + '_' + opts.skin);
            }

            this.$container.css({
                display: 'none',
                top: 0,
                left: 0,
                position: 'absolute',
                zIndex: 99990
            }).appendTo($('body'));

            this.setPosition();

            //callback
            if (opts.onShow === 'function') {
                opts.onShow(this.$elem);
            }

            //support event
            this.$container.trigger('show');
            this.isOpen = true;

            return this;
        },
        hide: function() {

            //unbinded all custom event
            this.$container.off('.asTooltip');
            //support event
            this.$container.trigger('hide');

            this.$elem.removeClass(this.namespace + '_active');

            this.$container.remove();
            this.$container.removeClass(this.posCss);

            //callback
            if (this.options.onHide === 'function') {
                this.options.onHide(this.$elem);
            }

            this.isOpen = false;
            active = false;
        },
        setContent: function(content) {
            this.content = content;
        },
        enable: function() {
            this.enabled = true;
            this.container.addClass(this.namespace + '-enabled');
            return this;
        },
        disable: function() {
            this.enabled = false;
            this.container.removeClass(this.namespace + '-enabled');
            return this;
        },
        destroy: function() {
            this.target.off('.asTooltip');
        }
    };

    AsTooltip.closeAll = function() {
        dataPool.map(function(instance) {
            if (instance.isOpen) {
                instance.hide();
            }
        });
    };

    // Static method default options.
    AsTooltip.defaults = {
        namespace: 'asTooltip',
        skin: null,

        target: null, // mouse element
        onlyOne: false,
        trigger: 'hover', // hover click
        interactive: false,
        interactiveDelay: 500,
        mouseTrace: false,
        closeBtn: false,

        popSpace: 10, //set the distance between tooltip and element

        position: 'n',
        autoPosition: true,

        delay: 0,
        effect: 'fade', // fade none zoom
        duration: 200,

        inline: false,
        content: null,

        ajax: false,
        ajaxSettings: {
            dataType: 'html',
            headers: {
                'asTooltip': true
            }
        },

        onShow: null,
        onHide: null,
        onUpdate: null,

        tpl: {
            container: '<div class="{{namespace}}-container"></div>',
            loading: '<span class="{{namespace}}-loading"></span>',
            content: '<div class="{{namespace}}-content"></div>',
            arrow: '<span class="{{namespace}}-arrow"></span>',
            close: '<a class="{{namespace}}-close"></a>'
        }
    };

    $.fn.asTooltip = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'asTooltip');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'asTooltip')) {
                    $.data(this, 'asTooltip', new AsTooltip(this, options));
                }
            });
        }
    };

}(jQuery));