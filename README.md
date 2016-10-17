# [jQuery asIconPicker](https://github.com/amazingSurge/jquery-asIconPicker) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![prs-welcome]](#contributing)

> A jquery plugin that for pick a icon.

## Table of contents
- [Main files](#main-files)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Development](#development)
- [Changelog](#changelog)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asIconPicker.js
├── jquery-asIconPicker.es.js
├── jquery-asIconPicker.min.js
└── css/
    ├── asIconPicker.css
    └── asIconPicker.min.css
```

## Quick start
Several quick start options are available:
#### Download the latest build

 * [Development](https://raw.githubusercontent.com/amazingSurge/jquery-asIconPicker/master/dist/jquery-asIconPicker.js) - unminified
 * [Production](https://raw.githubusercontent.com/amazingSurge/jquery-asIconPicker/master/dist/jquery-asIconPicker.min.js) - minified

#### Install From Bower
```sh
bower install jquery-asIconPicker --save
```

#### Install From Npm
```sh
npm install jquery-asIconPicker --save
```

#### Install From Yarn
```sh
yarn add jquery-asIconPicker
```

#### Build From Source
If you want build from source:

```sh
git clone git@github.com:amazingSurge/jquery-asIconPicker.git
cd jquery-asIconPicker
npm install
npm install -g gulp-cli babel-cli
gulp build
```

Done!

## Requirements
`jquery-asIconPicker` requires the latest version of [`jQuery`](https://jquery.com/download/), [`asScrollbar`](https://github.com/amazingSurge/jquery-asScrollbar) and [`asTooltip`](https://github.com/amazingSurge/jquery-asTooltip).

## Usage
#### Including files:

```html
<link rel="stylesheet" href="/path/to/asIconPicker.css">
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-asIconPicker.js"></script>
```

#### Required HTML structure

```html
<select name="icon" class="example">
    <option>fa-user</option>
    <option>fa-search</option>
    <option>fa-caret-right</option>
    <option>fa-star</option>
    <option>fa-times</option>
    <option>fa-refresh</option>
    <option>fa-rocket</option>
    <option>fa-eye</option>
    <option>fa-tag</option>
    <option>fa-bookmark</option>
    <option>fa-heart</option>
    <option>fa-adn</option>
    <option>fa-cloud-upload</option>
    <option>fa-phone-square</option>
    <option>fa-cog</option>
    <option>fa-wrench</option>
    <option>fa-volume-down</option>
    <option>fa-caret-down</option>
    <option>fa-caret-up</option>
    <option>fa-caret-left</option>
    <option>fa-thumbs-up</option>
</select>
```

#### Initialization
All you need to do is call the plugin on the element:

```javascript
jQuery(function($) {
  $('.example').asIconPicker(); 
});
```

## Examples
There are some example usages that you can look at to get started. They can be found in the
[examples folder](https://github.com/amazingSurge/jquery-asIconPicker/tree/master/examples).

## Options
`jquery-asIconPicker` can accept an options object to alter the way it behaves. You can see the default options by call `$.asIconPicker.setDefaults()`. The structure of an options object is as follows:

```
{
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
    return '<div class="namespace-selector-search">' +
      '<input type="text" name="" value="" placeholder="searchText" class="namespace-search-input"/>' +
      '<i class="namespace-search-icon"></i>' +
      '</div>';
  },
  formatNoMatches() {
    return 'No matches found';
  },
  errorHanding() {},
  process(value) {
    if (value && value.match(this.iconPrefix)) {
      return value.replace(this.iconPrefix, '');
    }
    return value;
  },
  parse(value) {
    if (value.match(this.iconPrefix)) {
      return value;
    }
    return this.iconPrefix + value;
  },
  // callback
  onInit: null,
  onReady: null,
  onAfterFill: null
}
```

## Methods
Methods are called on asIconPicker instances through the asIconPicker method itself.
You can also save the instances to variable for further use.

```javascript
// call directly
$().asIconPicker('destroy');

// or
var api = $().data('asIconPicker');
api.destroy();
```

#### get()
Get the icon selected.
```javascript
var icon = $().asIconPicker('get');
```

#### set()
Set the icon.
```javascript
$().asIconPicker('set', 'search');
```

#### val()
Get or set the icon.
```javascript
// get the icon
var icon = $().asIconPicker('val'); 

// set the icon
$().asIconPicker('set', 'search');
```

#### clear()
Clear the value.
```javascript
$().asIconPicker('clear');
```

#### enable()
Enable the icon picker functions.
```javascript
$().asIconPicker('enable');
```

#### disable()
Disable the icon picker functions.
```javascript
$().asIconPicker('disable');
```

#### destroy()
Destroy the icon picker instance.
```javascript
$().asIconPicker('destroy');
```

## Events
`jquery-asIconPicker` provides custom events for the plugin’s unique actions. 

```javascript
$('.the-element').on('asIconPicker::ready', function (e) {
  // on instance ready
});

```

Event   | Description
------- | -----------
init    | Fires when the instance is setup for the first time.
ready   | Fires when the instance is ready for API use.
enable  | Fired when the `enable` instance method has been called.
disable | Fired when the `disable` instance method has been called.
destroy | Fires when an instance is destroyed. 

## No conflict
If you have to use other plugin with the same namespace, just call the `$.asIconPicker.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asIconPicker.js"></script>
<script>
  $.asIconPicker.noConflict();
  // Code that uses other plugin's "$().asIconPicker" can follow here.
</script>
```

## Browser support

Tested on all major browsers.

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_32x32.png" alt="Safari"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_32x32.png" alt="Chrome"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_32x32.png" alt="Firefox"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_32x32.png" alt="Edge"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_32x32.png" alt="IE"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_32x32.png" alt="Opera"> |
|:--:|:--:|:--:|:--:|:--:|:--:|
| Latest ✓ | Latest ✓ | Latest ✓ | Latest ✓ | 9-11 ✓ | Latest ✓ |

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of `jquery-asIconPicker` before submitting an issue. There are several ways to help out:

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)
* Write test cases for open bug issues
* Contribute to the documentation

## Development
`jquery-asIconPicker` is built modularly and uses Gulp as a build system to build its distributable files. To install the necessary dependencies for the build system, please run:

```sh
npm install -g gulp
npm install -g babel-cli
npm install
```

Then you can generate new distributable files from the sources, using:
```
gulp build
```

More gulp tasks can be found [here](CONTRIBUTING.md#available-tasks).

## Changelog
To see the list of recent changes, see [Releases section](https://github.com/amazingSurge/jquery-asIconPicker/releases).

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asIconPicker.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asIconPicker/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asIconPicker.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asIconPicker
[license]: https://img.shields.io/npm/l/jquery-asIconPicker.svg?style=flat
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asIconPicker.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asIconPicker