import $ from 'jquery';
import asIconPicker from './asIconPicker';
import info from './info';

const NAMESPACE = 'asIconPicker';
const OtherAsIconPicker = $.fn.asIconPicker;

const jQueryAsIconPicker = function(options, ...args) {
  if (typeof options === 'string') {
    const method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new asIconPicker(this, options));
    }
  });
};

$.fn.asIconPicker = jQueryAsIconPicker;

$.asIconPicker = $.extend({
  setDefaults: asIconPicker.setDefaults,
  noConflict: function() {
    $.fn.asIconPicker = OtherAsIconPicker;
    return jQueryAsIconPicker;
  }
}, info);
