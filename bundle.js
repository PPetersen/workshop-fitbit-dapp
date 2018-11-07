(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var trailingNewlineRegex = /\n[\s]+$/
var leadingNewlineRegex = /^\n[\s]+/
var trailingSpaceRegex = /[\s]+$/
var leadingSpaceRegex = /^[\s]+/
var multiSpaceRegex = /[\n\s]+/g

var TEXT_TAGS = [
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'amp', 'small', 'span',
  'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
]

var VERBATIM_TAGS = [
  'code', 'pre', 'textarea'
]

module.exports = function appendChild (el, childs) {
  if (!Array.isArray(childs)) return

  var nodeName = el.nodeName.toLowerCase()

  var hadText = false
  var value, leader

  for (var i = 0, len = childs.length; i < len; i++) {
    var node = childs[i]
    if (Array.isArray(node)) {
      appendChild(el, node)
      continue
    }

    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'function' ||
      node instanceof Date ||
      node instanceof RegExp) {
      node = node.toString()
    }

    var lastChild = el.childNodes[el.childNodes.length - 1]

    // Iterate over text nodes
    if (typeof node === 'string') {
      hadText = true

      // If we already had text, append to the existing text
      if (lastChild && lastChild.nodeName === '#text') {
        lastChild.nodeValue += node

      // We didn't have a text node yet, create one
      } else {
        node = document.createTextNode(node)
        el.appendChild(node)
        lastChild = node
      }

      // If this is the last of the child nodes, make sure we close it out
      // right
      if (i === len - 1) {
        hadText = false
        // Trim the child text nodes if the current node isn't a
        // node where whitespace matters.
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          // The very first node in the list should not have leading
          // whitespace. Sibling text nodes should have whitespace if there
          // was any.
          leader = i === 0 ? '' : ' '
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, leader)
            .replace(leadingSpaceRegex, ' ')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

    // Iterate over DOM nodes
    } else if (node && node.nodeType) {
      // If the last node was a text node, make sure it is properly closed out
      if (hadText) {
        hadText = false

        // Trim the child text nodes if the current node isn't a
        // text node or a code node
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')

          // Remove empty text nodes, append otherwise
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        // Trim the child nodes if the current node is not a node
        // where all whitespace must be preserved
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingSpaceRegex, ' ')
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

      // Store the last nodename
      var _nodeName = node.nodeName
      if (_nodeName) nodeName = _nodeName.toLowerCase()

      // Append the node to the DOM
      el.appendChild(node)
    }
  }
}

},{}],2:[function(require,module,exports){
var hyperx = require('hyperx')
var appendChild = require('./appendChild')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = [
  'autofocus', 'checked', 'defaultchecked', 'disabled', 'formnovalidate',
  'indeterminate', 'readonly', 'required', 'selected', 'willvalidate'
]

var COMMENT_TAG = '!--'

var SVG_TAGS = [
  'svg', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix',
  'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood',
  'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage',
  'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight',
  'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter',
  'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src',
  'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image',
  'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph',
  'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS.indexOf(key) !== -1) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  appendChild(el, children)
  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"./appendChild":1,"hyperx":23}],3:[function(require,module,exports){
(function (global){
'use strict';

var csjs = require('csjs');
var insertCss = require('insert-css');

function csjsInserter() {
  var args = Array.prototype.slice.call(arguments);
  var result = csjs.apply(null, args);
  if (global.document) {
    insertCss(csjs.getCss(result));
  }
  return result;
}

module.exports = csjsInserter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"csjs":8,"insert-css":24}],4:[function(require,module,exports){
'use strict';

module.exports = require('csjs/get-css');

},{"csjs/get-css":7}],5:[function(require,module,exports){
'use strict';

var csjs = require('./csjs');

module.exports = csjs;
module.exports.csjs = csjs;
module.exports.getCss = require('./get-css');

},{"./csjs":3,"./get-css":4}],6:[function(require,module,exports){
'use strict';

module.exports = require('./lib/csjs');

},{"./lib/csjs":12}],7:[function(require,module,exports){
'use strict';

module.exports = require('./lib/get-css');

},{"./lib/get-css":16}],8:[function(require,module,exports){
'use strict';

var csjs = require('./csjs');

module.exports = csjs();
module.exports.csjs = csjs;
module.exports.noScope = csjs({ noscope: true });
module.exports.getCss = require('./get-css');

},{"./csjs":6,"./get-css":7}],9:[function(require,module,exports){
'use strict';

/**
 * base62 encode implementation based on base62 module:
 * https://github.com/andrew/base62.js
 */

var CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = function encode(integer) {
  if (integer === 0) {
    return '0';
  }
  var str = '';
  while (integer > 0) {
    str = CHARS[integer % 62] + str;
    integer = Math.floor(integer / 62);
  }
  return str;
};

},{}],10:[function(require,module,exports){
'use strict';

var makeComposition = require('./composition').makeComposition;

module.exports = function createExports(classes, keyframes, compositions) {
  var keyframesObj = Object.keys(keyframes).reduce(function(acc, key) {
    var val = keyframes[key];
    acc[val] = makeComposition([key], [val], true);
    return acc;
  }, {});

  var exports = Object.keys(classes).reduce(function(acc, key) {
    var val = classes[key];
    var composition = compositions[key];
    var extended = composition ? getClassChain(composition) : [];
    var allClasses = [key].concat(extended);
    var unscoped = allClasses.map(function(name) {
      return classes[name] ? classes[name] : name;
    });
    acc[val] = makeComposition(allClasses, unscoped);
    return acc;
  }, keyframesObj);

  return exports;
}

function getClassChain(obj) {
  var visited = {}, acc = [];

  function traverse(obj) {
    return Object.keys(obj).forEach(function(key) {
      if (!visited[key]) {
        visited[key] = true;
        acc.push(key);
        traverse(obj[key]);
      }
    });
  }

  traverse(obj);
  return acc;
}

},{"./composition":11}],11:[function(require,module,exports){
'use strict';

module.exports = {
  makeComposition: makeComposition,
  isComposition: isComposition,
  ignoreComposition: ignoreComposition
};

/**
 * Returns an immutable composition object containing the given class names
 * @param  {array} classNames - The input array of class names
 * @return {Composition}      - An immutable object that holds multiple
 *                              representations of the class composition
 */
function makeComposition(classNames, unscoped, isAnimation) {
  var classString = classNames.join(' ');
  return Object.create(Composition.prototype, {
    classNames: { // the original array of class names
      value: Object.freeze(classNames),
      configurable: false,
      writable: false,
      enumerable: true
    },
    unscoped: { // the original array of class names
      value: Object.freeze(unscoped),
      configurable: false,
      writable: false,
      enumerable: true
    },
    className: { // space-separated class string for use in HTML
      value: classString,
      configurable: false,
      writable: false,
      enumerable: true
    },
    selector: { // comma-separated, period-prefixed string for use in CSS
      value: classNames.map(function(name) {
        return isAnimation ? name : '.' + name;
      }).join(', '),
      configurable: false,
      writable: false,
      enumerable: true
    },
    toString: { // toString() method, returns class string for use in HTML
      value: function() {
        return classString;
      },
      configurable: false,
      writeable: false,
      enumerable: false
    }
  });
}

/**
 * Returns whether the input value is a Composition
 * @param value      - value to check
 * @return {boolean} - whether value is a Composition or not
 */
function isComposition(value) {
  return value instanceof Composition;
}

function ignoreComposition(values) {
  return values.reduce(function(acc, val) {
    if (isComposition(val)) {
      val.classNames.forEach(function(name, i) {
        acc[name] = val.unscoped[i];
      });
    }
    return acc;
  }, {});
}

/**
 * Private constructor for use in `instanceof` checks
 */
function Composition() {}

},{}],12:[function(require,module,exports){
'use strict';

var extractExtends = require('./css-extract-extends');
var composition = require('./composition');
var isComposition = composition.isComposition;
var ignoreComposition = composition.ignoreComposition;
var buildExports = require('./build-exports');
var scopify = require('./scopeify');
var cssKey = require('./css-key');
var extractExports = require('./extract-exports');

module.exports = function csjsTemplate(opts) {
  opts = (typeof opts === 'undefined') ? {} : opts;
  var noscope = (typeof opts.noscope === 'undefined') ? false : opts.noscope;

  return function csjsHandler(strings, values) {
    // Fast path to prevent arguments deopt
    var values = Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      values[i - 1] = arguments[i];
    }
    var css = joiner(strings, values.map(selectorize));
    var ignores = ignoreComposition(values);

    var scope = noscope ? extractExports(css) : scopify(css, ignores);
    var extracted = extractExtends(scope.css);
    var localClasses = without(scope.classes, ignores);
    var localKeyframes = without(scope.keyframes, ignores);
    var compositions = extracted.compositions;

    var exports = buildExports(localClasses, localKeyframes, compositions);

    return Object.defineProperty(exports, cssKey, {
      enumerable: false,
      configurable: false,
      writeable: false,
      value: extracted.css
    });
  }
}

/**
 * Replaces class compositions with comma seperated class selectors
 * @param  value - the potential class composition
 * @return       - the original value or the selectorized class composition
 */
function selectorize(value) {
  return isComposition(value) ? value.selector : value;
}

/**
 * Joins template string literals and values
 * @param  {array} strings - array of strings
 * @param  {array} values  - array of values
 * @return {string}        - strings and values joined
 */
function joiner(strings, values) {
  return strings.map(function(str, i) {
    return (i !== values.length) ? str + values[i] : str;
  }).join('');
}

/**
 * Returns first object without keys of second
 * @param  {object} obj      - source object
 * @param  {object} unwanted - object with unwanted keys
 * @return {object}          - first object without unwanted keys
 */
function without(obj, unwanted) {
  return Object.keys(obj).reduce(function(acc, key) {
    if (!unwanted[key]) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

},{"./build-exports":10,"./composition":11,"./css-extract-extends":13,"./css-key":14,"./extract-exports":15,"./scopeify":21}],13:[function(require,module,exports){
'use strict';

var makeComposition = require('./composition').makeComposition;

var regex = /\.([^\s]+)(\s+)(extends\s+)(\.[^{]+)/g;

module.exports = function extractExtends(css) {
  var found, matches = [];
  while (found = regex.exec(css)) {
    matches.unshift(found);
  }

  function extractCompositions(acc, match) {
    var extendee = getClassName(match[1]);
    var keyword = match[3];
    var extended = match[4];

    // remove from output css
    var index = match.index + match[1].length + match[2].length;
    var len = keyword.length + extended.length;
    acc.css = acc.css.slice(0, index) + " " + acc.css.slice(index + len + 1);

    var extendedClasses = splitter(extended);

    extendedClasses.forEach(function(className) {
      if (!acc.compositions[extendee]) {
        acc.compositions[extendee] = {};
      }
      if (!acc.compositions[className]) {
        acc.compositions[className] = {};
      }
      acc.compositions[extendee][className] = acc.compositions[className];
    });
    return acc;
  }

  return matches.reduce(extractCompositions, {
    css: css,
    compositions: {}
  });

};

function splitter(match) {
  return match.split(',').map(getClassName);
}

function getClassName(str) {
  var trimmed = str.trim();
  return trimmed[0] === '.' ? trimmed.substr(1) : trimmed;
}

},{"./composition":11}],14:[function(require,module,exports){
'use strict';

/**
 * CSS identifiers with whitespace are invalid
 * Hence this key will not cause a collision
 */

module.exports = ' css ';

},{}],15:[function(require,module,exports){
'use strict';

var regex = require('./regex');
var classRegex = regex.classRegex;
var keyframesRegex = regex.keyframesRegex;

module.exports = extractExports;

function extractExports(css) {
  return {
    css: css,
    keyframes: getExport(css, keyframesRegex),
    classes: getExport(css, classRegex)
  };
}

function getExport(css, regex) {
  var prop = {};
  var match;
  while((match = regex.exec(css)) !== null) {
    var name = match[2];
    prop[name] = name;
  }
  return prop;
}

},{"./regex":18}],16:[function(require,module,exports){
'use strict';

var cssKey = require('./css-key');

module.exports = function getCss(csjs) {
  return csjs[cssKey];
};

},{"./css-key":14}],17:[function(require,module,exports){
'use strict';

/**
 * djb2 string hash implementation based on string-hash module:
 * https://github.com/darkskyapp/string-hash
 */

module.exports = function hashStr(str) {
  var hash = 5381;
  var i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }
  return hash >>> 0;
};

},{}],18:[function(require,module,exports){
'use strict';

var findClasses = /(\.)(?!\d)([^\s\.,{\[>+~#:)]*)(?![^{]*})/.source;
var findKeyframes = /(@\S*keyframes\s*)([^{\s]*)/.source;
var ignoreComments = /(?!(?:[^*/]|\*[^/]|\/[^*])*\*+\/)/.source;

var classRegex = new RegExp(findClasses + ignoreComments, 'g');
var keyframesRegex = new RegExp(findKeyframes + ignoreComments, 'g');

module.exports = {
  classRegex: classRegex,
  keyframesRegex: keyframesRegex,
  ignoreComments: ignoreComments,
};

},{}],19:[function(require,module,exports){
var ignoreComments = require('./regex').ignoreComments;

module.exports = replaceAnimations;

function replaceAnimations(result) {
  var animations = Object.keys(result.keyframes).reduce(function(acc, key) {
    acc[result.keyframes[key]] = key;
    return acc;
  }, {});
  var unscoped = Object.keys(animations);

  if (unscoped.length) {
    var regexStr = '((?:animation|animation-name)\\s*:[^};]*)('
      + unscoped.join('|') + ')([;\\s])' + ignoreComments;
    var regex = new RegExp(regexStr, 'g');

    var replaced = result.css.replace(regex, function(match, preamble, name, ending) {
      return preamble + animations[name] + ending;
    });

    return {
      css: replaced,
      keyframes: result.keyframes,
      classes: result.classes
    }
  }

  return result;
}

},{"./regex":18}],20:[function(require,module,exports){
'use strict';

var encode = require('./base62-encode');
var hash = require('./hash-string');

module.exports = function fileScoper(fileSrc) {
  var suffix = encode(hash(fileSrc));

  return function scopedName(name) {
    return name + '_' + suffix;
  }
};

},{"./base62-encode":9,"./hash-string":17}],21:[function(require,module,exports){
'use strict';

var fileScoper = require('./scoped-name');
var replaceAnimations = require('./replace-animations');
var regex = require('./regex');
var classRegex = regex.classRegex;
var keyframesRegex = regex.keyframesRegex;

module.exports = scopify;

function scopify(css, ignores) {
  var makeScopedName = fileScoper(css);
  var replacers = {
    classes: classRegex,
    keyframes: keyframesRegex
  };

  function scopeCss(result, key) {
    var replacer = replacers[key];
    function replaceFn(fullMatch, prefix, name) {
      var scopedName = ignores[name] ? name : makeScopedName(name);
      result[key][scopedName] = name;
      return prefix + scopedName;
    }
    return {
      css: result.css.replace(replacer, replaceFn),
      keyframes: result.keyframes,
      classes: result.classes
    };
  }

  var result = Object.keys(replacers).reduce(scopeCss, {
    css: css,
    keyframes: {},
    classes: {}
  });

  return replaceAnimations(result);
}

},{"./regex":18,"./replace-animations":19,"./scoped-name":20}],22:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],23:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        if (xstate === OPEN) {
          if (reg === '/') {
            p.push([ OPEN, '/', arg ])
            reg = ''
          } else {
            p.push([ OPEN, arg ])
          }
        } else {
          p.push([ VAR, xstate, arg ])
        }
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else parts[i][1]==="" || (cur[1][key] = concat(cur[1][key], parts[i][1]));
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else parts[i][2]==="" || (cur[1][key] = concat(cur[1][key], parts[i][2]));
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            if (parts[i][0] === CLOSE) {
              i--
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN && reg.length) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && c === '/' && reg.length) {
          // no-op, self closing tag without a space <br/>
        } else if (state === OPEN && /\s/.test(c)) {
          if (reg.length) {
            res.push([OPEN, reg])
          }
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":22}],24:[function(require,module,exports){
var inserted = {};

module.exports = function (css, options) {
    if (inserted[css]) return;
    inserted[css] = true;
    
    var elem = document.createElement('style');
    elem.setAttribute('type', 'text/css');

    if ('textContent' in elem) {
      elem.textContent = css;
    } else {
      elem.styleSheet.cssText = css;
    }
    
    var head = document.getElementsByTagName('head')[0];
    if (options && options.prepend) {
        head.insertBefore(elem, head.childNodes[0]);
    } else {
        head.appendChild(elem);
    }
};

},{}],25:[function(require,module,exports){
module.exports=[{
    "constant": false,
    "inputs": [{
        "name": "_encryptHeader",
        "type": "string"
      },
      {
        "name": "_userId",
        "type": "string"
      },
      {
        "name": "userAddr",
        "type": "address"
      }
    ],
    "name": "request",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isOnTime",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getFundersOfAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getContestPayload1",
    "outputs": [{
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getBalance",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getState",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getNumFunders",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "myid",
        "type": "bytes32"
      },
      {
        "name": "result",
        "type": "string"
      }
    ],
    "name": "__callback",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "isOwner",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "_queryId",
        "type": "bytes32"
      },
      {
        "name": "_result",
        "type": "string"
      },
      {
        "name": "_proof",
        "type": "bytes"
      }
    ],
    "name": "__callback",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "award",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getBeginStep",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "_encryptHeader",
        "type": "string"
      },
      {
        "name": "_userId",
        "type": "string"
      }
    ],
    "name": "signup",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getNumPlayers",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getTotalAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getAllFunders",
    "outputs": [{
      "name": "",
      "type": "address[]"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isAvailableRefund",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
      "name": "_name",
      "type": "string"
    }],
    "name": "fund",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "contestDone",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "isSigned",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getContestPayload3",
    "outputs": [{
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "bool"
      },
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPlayersOfAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getContestPayload2",
    "outputs": [{
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getWinnerWithdrawalAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getFunder",
    "outputs": [{
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "playerIndexs",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getInitStep",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getEndStep",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getContestStep",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getFunders",
    "outputs": [{
        "name": "",
        "type": "string[]"
      },
      {
        "name": "",
        "type": "uint256[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "playerRefund",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "updateAllUserStep",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{
        "name": "_duration",
        "type": "uint256"
      },
      {
        "name": "_goalStep",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "addr",
      "type": "address"
    }],
    "name": "NoticeContestDone",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "addr",
      "type": "address"
    }],
    "name": "NoticeAward",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "fundersOfAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "numFunders",
        "type": "uint256"
      }
    ],
    "name": "NewFundLog",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "addr",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "queryId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "step",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "OraclizeCallbackStep",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "addr",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "playersOfAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "numPlayers",
        "type": "uint256"
      }
    ],
    "name": "NewPlayerLog",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "tag",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "condition",
        "type": "bool"
      }
    ],
    "name": "LOG",
    "type": "event"
  }
]
},{}],26:[function(require,module,exports){
// 0. temp email: https://www.mailinator.com/
// 1. make test account: https://www.fitbit.com/signup
// 2. signup as dev: https://dev.fitbit.com/login
// 3. register app: https://dev.fitbit.com/apps/new
const CLIENT_ID = '22D5BQ';
// @NOTE only works if `https://dev.fitbit.com/apps/details/${CLIENT_ID}` has set Callback URL to `location.href` too
const REDIRECT_URL = location.href.split('#')[0].split('?')[0]
const DEFAULT_ADDRESS = "0x5cc9d29c4821c70ba47d03d50f7ba04e0a41597a";
const contractAddress = localStorage.contract || DEFAULT_ADDRESS;
const CONTRACT_GAS = 800000;
const CONTRACT_PRICE = 40000000000;
const MINIMIZE_SIGNUP_AMOUNT = "0.1";
const GOAL_STEPS = 300000
const NETWORK = 'ropsten';

var hasCustomPort = location.href.split('//')[1].indexOf(':') !== -1
var isLocalhost = location.href.indexOf('localhost') !== -1
if (hasCustomPort && !isLocalhost) { // update url to use localhost
  location.href = new URL(location.pathname, 'https://localhost:9966').href
  throw new Error('reload page with using "localhost"')
}
if (window.location.hash) {
  var fragmentQueryParameters = {};
  window.location.hash.slice(1).replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function ($0, $1, $2, $3) {
      fragmentQueryParameters[$1] = $3;
    }
  );
  log('fragmentQueryParameters: ', fragmentQueryParameters);
  if (fragmentQueryParameters.access_token) {
    localStorage.userId = fragmentQueryParameters.user_id;
    localStorage.fitbitAccessToken = fragmentQueryParameters.access_token;
    localStorage.token_scope = fragmentQueryParameters.scope;
    localStorage.token_type = fragmentQueryParameters.token_type;
    localStorage.token_expires_in = fragmentQueryParameters.expires_in;
    localStorage.betOnce = true
    location = REDIRECT_URL
  }
} else if (localStorage.betOnce) {
  localStorage.removeItem('betOnce')
  bet()
}

const bel = require('bel')
const csjs = require('csjs-inject')

var ABI = require('./abi.json');

//var ABI = require('./abi.json');



async function web3Init() {
  if (ethereum) {
    web3 = new Web3(ethereum);
    try {
      // https://bit.ly/2QQHXvF
      console.log('ethereum.enable()');
      const accounts = await ethereum.enable();
      web3.eth.defaultAccount = accounts[0];
    } catch (error) {}
  } else if (web3) {
    console.log('load web3.currentProvider');
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
}

web3Init();

const myContract = new web3.eth.Contract(ABI, contractAddress);
/******************************************************************************
  SETUP
******************************************************************************/
const css = csjs `
  .box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 100px;
  }
  .box1 {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 3;
  }
  .box2 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 1;
    grid-row-end: 3;
    text-align: center;
  }
  .box3 {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 3;
    grid-row-end: 5;
  }
  .box4 {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 5;
    grid-row-end: 7;
  }
  .box5 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 3;
    grid-row-end: 4;
    color: #00529B;
    background-color: #BDE5F8;
    padding: 20px;
  }
  .box6 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 4;
    grid-row-end: 6;
    color: #4F8A10;
    background-color: #DFF2BF;
    padding: 20px;
  }
  .box7 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 6;
    grid-row-end: 7;
    background-color: #FFBABA;
    padding: 20px;
  }
  .box8 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 8;
    grid-row-end: 9;
    text-align: center;
    margin-top: 20px;
  }
  .input {
    margin: 10px;
    width: 50px;
    font-size: 20px;
  }
  .longInput {
    margin: 10px;
    width:  500px;
    font-size: 20px;
  }
  .button {
    margin-top: 10px;
    font-size: 20px;
    width: 200px;
    background-color: #4CAF50;
    color: white;
  }
  .shortButton {
    margin-top: 10px;
    font-size: 20px;
    width: 120px;
    background-color: #4CAF50;
    color: white;
  }
  .highlight {
    color: red;
  }
  img {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
    width: 150px;
  }

  .info, .success, .warning, .error, .validation {
    border: 1px solid;
    margin: 10px 0px;
    padding: 15px 10px 15px 50px;
    background-repeat: no-repeat;
    background-position: 10px center;
  }
  .info {
    color: #00529B;
    background-color: #BDE5F8;
    background-image: url('https://i.imgur.com/ilgqWuX.png');
  }
  .success {
    color: #4F8A10;
    background-color: #DFF2BF;
    background-image: url('https://i.imgur.com/Q9BGTuy.png');
  }
  .warning {
    color: #9F6000;
    background-color: #FEEFB3;
    background-image: url('https://i.imgur.com/Z8q7ww7.png');
  }
  .error {
    color: #D8000C;
    background-color: #FFBABA;
    background-image: url('https://i.imgur.com/GnyDvKN.png');
  }
  .validation {
    color: #D63301;
    background-color: #FFCCBA;
    background-image: url('https://i.imgur.com/GnyDvKN.png');
  }
`

/******************************************************************************
  Create Element
******************************************************************************/

function funderAreaElement(result) {
  if (result.funders[0].length == 0) return;
  return bel `<div class="${css.box4}">Sponsorship Board : <ul>
    ${result.funders[0].map(function (item, index) {
    return bel`<li>${item} : ${web3.utils.fromWei(result.funders[1][index], "ether")} ETH
    </li>`
    })}
  </ul></div>`
}

// player

function playerRefundButton(result) {
  if (!result.isAvailableRefund) return;
  return bel `
    <button class=${css.shortButton} onclick=${playerRefund}"> Refund </button>
  `;
}

function playSubTitle(result) {
  if (result.goalStep == GOAL_STEPS) {
    return bel `<div>I bet that I can reach 10.000 steps each day! (GOAL: 300.000 steps a month)</div>`
  } else {
    return bel `<div>I bet that I can reach ${result.goalStep} steps! </div>`
  }
}

function betSubTitle(result) {
  if (result.initStep) return bel `<div>Your current amount of steps ${result.step}.</div`;
}

function betAreaElement(result) {
  if (result.isSigned) {
    return bel `
    <div class="${css.box5}">
      You successfully <span class="${css.highlight}">joined</span> the contest.<br>
      ${betSubTitle(result)}
      ${playerRefundButton(result)}
    </div>`;
  } else {
    return bel `
    <div class="${css.box5}">
      ${playSubTitle(result)}
      <button class=${css.shortButton} onclick=${bet}> Bet</button> (joining fee ${MINIMIZE_SIGNUP_AMOUNT} ETH)
    </div>
    `
  }
}

// funder

const fundAmountElement = bel `<input class=${css.input} type="text"/>`;
const fundNameElement = bel `<input class=${css.input} type="text"/>`;

const fundAreaElement = bel `
  <div class="${css.box6}">
    I want to sponsor this contest with ${fundAmountElement} ETH!<br>
    Name you want to be added to our sponsorship board. ${fundNameElement}<br>
    <button class=${css.shortButton} onclick=${fund}> Sponsor </button> (min 0.5 ETH)
  </div>
`

const contractElement = bel `
  <input class="${css.longInput}" type="text" name="address" placeholder="Please enter AwardToken contract addres"/>
`

function debugAreaElement(result) {
  if (window.location.hash.indexOf("#clear") != -1) {
    restoreContract();
  }
  if (window.location.hash.indexOf("#dev") != -1) {
    return bel `
    <div class="${css.box8}">
      ${contractElement}
      <button class=${css.button} onclick=${updateContract}"> Update Address </button><br>
      <button class=${css.button} onclick=${getFitbitToken}"> Get Token </button>
      <button class=${css.button} onclick=${getProfile}"> Get Profile </button>
      <button class=${css.button} onclick=${getTotalStep}"> Get Step </button> <br>
      <button class=${css.button} onclick=${restoreContract}"> Restore Contract </button>
      <button class=${css.button} onclick=${hideDebug}"> Hide Debug </button>
      <button class=${css.button} onclick=${clearCache}"> Clear </button><br>
      <a href="https://${NETWORK}.etherscan.io/address/${contractAddress}">etherscan</a>
    </div>`;
  } else {
    return;
  }
}

function errorRender(errorMessage) {
  console.error(errorMessage);
  document.body.appendChild(bel `
  <div class=${css.error} id="app">
    ${errorMessage}
  </div>
 `)
}

function timeRemindMessage(result) {
  const diffAt = (result.endAt - result.now);
  return niceTimeFormat(diffAt);
}

function niceTimeFormat(s) {
  if (s < 60) {
    return "a few seconds";
  } else if (s < 3600 && s >= 60) {
    return Math.floor(s / 60) + " minutes";
  } else if (s >= 3600 && s <= 86400) {
    return Math.floor(s / 3600) + " hours";
  } else {
    return Math.floor(s / 86400) + " days";
  }
}

function contestDoneButton(result) {
  if (result.status == 0) {
    if (result.endAt > result.now) {
      return bel `<div>
                    waiting for ${timeRemindMessage(result)}. <br>
                    <button class=${css.button}> Step1: contest end </button>
                </div>`;
    } else {
      return bel `<button class=${css.button} onclick=${contestDone}"> Step1: contest end </button>`;
    }
  }
  return;
}

function withdrawalButton(result) {
  if (result.status == 1) return bel `<button class=${css.button} onclick=${award}"> Step2: Award</button>`;
}

function adminAreaElement(result) {
  if (!result.isOwner) return;
  return bel `
  <div class="${css.box7}">
    ${contestDoneButton(result)}
    ${withdrawalButton(result)}
  </div>`;
}

function welcomeSubTitle(result) {
  if (result.goalStep != GOAL_STEPS) {
    return bel `<div>who manage to walk ${result.goalStep} steps in the next ${niceTimeFormat(result.duration)}</div>`
  } else {
    return bel `<div>who manage to walk 300.000 steps in the next 30 days (10.000 steps per day)</div>`
  }
}

function welcomeSubTitle2(result) {
  if (result.now < result.endAt) return bel `<div>The Fitbit Contest ends in ${timeRemindMessage(result)}.</div>`;
}

function render(result) {
  document.body.appendChild(bel `
  <div class=${css.box} id="app">
    <div class="${css.box1}">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/ETHEREUM-YOUTUBE-PROFILE-PIC.png"/><br/>
    </div>
    <div class=${css.box2}>
      Please choose the <span class="${css.highlight}">${NETWORK} test chain.</span> You can get test coins from metamasks deposit button on ropsten when clicking faucet.
      <br><br>
      <div>
        <h2><b>Welcome</b> to the Fitbit wellness contest.</h2>
        The prize money will be equally shared between all participants<br>
        ${welcomeSubTitle(result)}
        ${welcomeSubTitle2(result)}
      </div>
    </div>
    <div class="${css.box3}">
      Total players: ${result.numPlayers} <br>
      Total fees: ${web3.utils.fromWei(result.playersOfAmount, "ether")} ETH. <br><br>
      Total sponsors: ${result.numFunders} <br>
      Total prize amount: ${web3.utils.fromWei(result.fundersOfAmount, "ether")} ETH. <br><br>
    </div>
    ${funderAreaElement(result)}
    ${betAreaElement(result)}
    ${fundAreaElement}
    ${adminAreaElement(result)}
    ${debugAreaElement(result)}
  </div>
 `)
}

if (typeof web3 == 'undefined') {
  const eventHandler = myContract.events.allEvents((error, data) => {
    if (error) console.error(error);
    let {
      event,
      returnValues
    } = data;
    console.log('event:', data);
    let userId = returnValues.userId;
    if (event === 'LOG_OraclizeCallbackStep') console.log('callback data:', returnValues);
  })
}

/******************************************************************************
  Fitbit
******************************************************************************/
function processResponse (res) {
  if (!res.ok) {
    localStorage.clear();
    throw new Error('Fitbit API request failed: ' + res);
  }

  var contentType = res.headers.get('content-type')
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  } else {
    throw new Error('JSON expected but received ' + contentType);
  }
}

function isExistToken() {
  return localStorage.fitbitAccessToken && localStorage.fitbitAccessToken.length > 0
}

function showProfile(data) {
  localStorage.userId = data.user.encodedId;
  console.dir(data);
}

function getProfile(event) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
  fetch(
      'https://api.fitbit.com/1/user/-/profile.json', {
        headers: new Headers({
          'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
        }),
        mode: 'cors',
        method: 'GET'
      }
    ).then(processResponse)
    .then(showProfile)
    .catch(function (error) {
      console.error(error);
    });
}

function getActivities(result, cb) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
  fetch(
      'https://api.fitbit.com/1/user/-/activities.json', {
        headers: new Headers({
          'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
        }),
        mode: 'cors',
        method: 'GET'
      }
    ).then(processResponse)
    .then(function (data) {
      result.currentStep = data.lifetime.total.steps;
      cb(result);
    })
    .catch(function (error) {
      console.error(error);
      cb(result);
    });
}

function showTotalStep(data) {
  console.log('step:', data.lifetime.total.steps);
}

function getTotalStep(event) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
  fetch(
      'https://api.fitbit.com/1/user/-/activities.json', {
        headers: new Headers({
          'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
        }),
        mode: 'cors',
        method: 'GET'
      }
    ).then(processResponse)
    .then(showTotalStep)
    .catch(function (error) {
      console.error(error);
    });
}

function getFitbitToken(event) {
  const EXPIRES_IN = (event == 1) ? (60 * 60 * 24 * 40) : (60 * 60 * 24 * 60);
  const uri = REDIRECT_URL
  const redirectUri = encodeURIComponent(uri);
  window.location.target = "_blank";
  const url = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=activity%20profile&expires_in=${EXPIRES_IN}`;
  window.location.href = url
  return;
}

/******************************************************************************
  Smart Contract Event
******************************************************************************/

// Generate filter options
const options = {
  // filter: {
  //   _from: process.env.WALLET_FROM,
  //   _to: process.env.WALLET_TO,
  //   _value: process.env.AMOUNT
  // },
  fromBlock: 'latest'
}

myContract.events.NewFundLog(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NewFundLog: ', event.returnValues);
  redirectHome();
  return
});

myContract.events.NewPlayerLog(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NewPlayerLog: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

myContract.events.OraclizeCallbackStep(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('OraclizeCallbackStep: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

myContract.events.NoticeContestDone(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NoticeContestDone: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

myContract.events.NoticeAward(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NoticeAward: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

/******************************************************************************
  DOM Event
******************************************************************************/

// === player ===
function playerRefund(event) {
  myContract.methods.playerRefund().send({
    from: localStorage.wallet
  }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> player refund done.');
  })
}

function bet(event) {
  if (parseFloat(localStorage.balance) < parseFloat(MINIMIZE_SIGNUP_AMOUNT)) {
    alert("you don't have enough ether.");
    return;
  }
  const token = localStorage.fitbitAccessToken;
  if (!token) {
    return getFitbitToken(1)
  }

  encryptHeader(token, function (error, header) {
    console.log(header);
    signup(header, MINIMIZE_SIGNUP_AMOUNT);
  });
}

function signup(header, betAmount) {
  const options = {
    from: localStorage.wallet,
    gas: CONTRACT_GAS,
    gasPrice: CONTRACT_PRICE,
    value: web3.utils.toWei(betAmount, "ether")
  };
  myContract.methods.signup(header, localStorage.userId).send(options, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> signup ok.');
  })
}

// === funder ===
function fund(event) {
  let fundAmount = fundAmountElement.value;
  let name = fundNameElement.value;
  if (parseFloat(fundAmount) < MINIMIZE_SIGNUP_AMOUNT) alert("The amount can't low than ", MINIMIZE_SIGNUP_AMOUNT);
  if (parseFloat(localStorage.balance) < parseFloat(fundAmount)) {
    alert("you don't have enough ether.");
    return;
  }
  myContract.methods.fund(name).send({
    from: localStorage.wallet,
    gas: CONTRACT_GAS,
    gasPrice: CONTRACT_PRICE,
    value: web3.utils.toWei(fundAmount, "ether")
  }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> fund ok.');
  })
}

// === owner ===
function contestDone(event) {
  myContract.methods.contestDone().send({
    from: localStorage.wallet
  }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> contestDone done');
  })
}

function award(event) {
  myContract.methods.award().send({
    from: localStorage.wallet
  }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> award done.');
    redirectHome();
  })
}

// === debug ===
function restoreContract(event) {
  delete localStorage.contract;
  redirectHome();
}

function hideDebug(event) {
  redirectHome();
}

function clearCache(event) {
  localStorage.clear();
  redirectHome();
}

function updateContract(event) {
  localStorage.contract = contractElement.value;
  location.reload();
}

/******************************************************************************
  Oraclize
******************************************************************************/
function encrypt(data, next) {
  const init = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  fetch('https://api.oraclize.it/v1/utils/encryption/encrypt', init)
    .then(processResponse)
    .then(next)
    .catch(console.error);
}

function encryptHeader(token, next) {
  const header = `{'headers': {'content-type': 'json', 'Authorization': 'Bearer ${token}'}}`;
  encrypt({
    "message": header
  }, function (data) {
    // console.log(data);
    if (data.success) {
      next(null, data.result);
    } else {
      next(new Error("encrypt header fail"));
    }
  });
}

// encryptHeader("123", console.log);

/******************************************************************************
  DONE
******************************************************************************/

function redirectHome() {
  location.target = "_blank";
  if (location.href.indexOf("github") != -1) {
    location.href = REDIRECT_URL
  } else {
    location.href = 'http://192.168.0.173:9966/';
  }
}

function done(err, result) {
  if (err) return log(new Error(err))
  const {
    username
  } = result
  if (username) {
    log(null, 'success')
    // var el = dapp(result)
    // document.body.appendChild(el)
  } else log(new Error('fail'))
}

function log () { console.log.apply(console, arguments) }

/******************************************************************************
  START
******************************************************************************/

function start() {
  getMyAddress({});
}

function getMyAddress(result) {
  log('loading (1/9) - getMyAddress')
  web3.eth.getAccounts((err, localAddresses) => {
    if (!localAddresses) return errorRender('You must be have MetaMask or local RPC endpoint.');
    if (!localAddresses[0]) return errorRender('You need to login MetaMask.');
    if (err) return done(err);
    localStorage.wallet = localAddresses[0];
    result.wallet = localAddresses[0];
    getBalance(result);
  })
}

function getBalance(result) {
  log('loading (2/9) - getBalance')
  web3.eth.getBalance(result.wallet, (err, wei) => {
    if (err) return done(err);
    const balance = web3.utils.fromWei(wei, 'ether');
    localStorage.balance = balance
    result.balance = balance;
    getFunders(result);
  })
}

function getFunders(result) {
  log('loading (3/9) - getFunders')
  myContract.methods.getFunders().call((err, data) => {
    if (err) return errorRender(`Please switch to ${NETWORK} test chain!`);
    result.funders = data;
    getContestPayload1(result);
  })
}

function getContestPayload1(result) {
  log('loading (4/9) - getContestPayload1')
  myContract.methods.getContestPayload1(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.numPlayers = parseInt(data[0], 10);
    result.playersOfAmount = data[1];
    result.numFunders = parseInt(data[2], 10);
    result.fundersOfAmount = data[3];
    result.status = parseInt(data[4], 10);

    if (!localStorage.fitbitAccessToken) result.isSigned = false
    else result.isSigned = data[5];

    getContestPayload2(result);
  })
}

function getContestPayload2(result) {
  log('loading (5/9) - getContestPayload2')
  myContract.methods.getContestPayload2().call((err, data) => {
    if (err) return errorRender(`Please switch to ${NETWORK} test chain!`);
    result.goalStep = parseInt(data[0], 10);
    result.duration = parseInt(data[1], 10);
    result.startAt = parseInt(data[2], 10);
    result.endAt = parseInt(data[3], 10);
    result.now = parseInt(data[4], 10);
    result.isSigned ? getContestPayload3(result) : isOwner(result);
  })
}

function getContestPayload3(result) {
  log('loading (6/9) - getContestPayload3')
  myContract.methods.getContestPayload3(result.wallet).call((err, data) => {
    if (err) return errorRender(`Please switch to ${NETWORK} test chain!`);
    result.beginStep = parseInt(data[0]);
    result.endStep = parseInt(data[1]);
    result.isAvailableRefund = data[2];
    result.initStep = data[3];
    getCurrentStep(result);
  })
}

function getCurrentStep(result) {
  log('loading (7/9) - getEndStep')
  getActivities(result, getContestStep);
}

function getContestStep(result) {
  log('loading (8/9) - getContestStep');
  result.step = (result.now > result.endAt) ? result.endStep - result.beginStep : result.currentStep - result.beginStep;
  isOwner(result);
}

function isOwner(result) {
  log('loading (9/9) - isOwner');
  myContract.methods.isOwner(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isOwner = data;
    console.log('result: ', result);
    render(result);
  })
}

start();

},{"./abi.json":25,"bel":2,"csjs-inject":5}]},{},[26]);
