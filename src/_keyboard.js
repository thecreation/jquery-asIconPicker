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

export default _keyboard;
