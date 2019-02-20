(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("axios"));
	else if(typeof define === 'function' && define.amd)
		define(["axios"], factory);
	else if(typeof exports === 'object')
		exports["BigWaffleReader"] = factory(require("axios"));
	else
		root["BigWaffleReader"] = factory(root["axios"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_axios__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/urlon/src/urlon.js":
/*!*****************************************!*\
  !*** ./node_modules/urlon/src/urlon.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var URLON = {
	stringify: function (input) {
		function encodeString (str) {
			return encodeURI(str.replace(/([=:&@_;\/])/g, '/$1'));
		}

		function stringify (input) {
			// Number or Boolean or Null
			if (typeof input === 'number' || input === true || input === false || input === null) {
				return ':' + input;
			}
			// Array
			if (input instanceof Array) {
				var res = [];
				for (var i = 0; i < input.length; ++i) {
					res.push(stringify(input[i]));
				}
				return '@' + res.join('&') + ';';
			}
			// Object
			if (typeof input === 'object') {
				var res = [];
				for (var key in input) {
					res.push(encodeString(key) + stringify(input[key]));
				}
				return '_' + res.join('&') + ';';
			}
			// String or undefined
			return '=' + encodeString((input !== null ? (input !== undefined ? input : "undefined") : "null").toString());
		}

		return stringify(input).replace(/;+$/g, '');
	},

	parse: function (str) {
		var pos = 0;
		str = decodeURI(str);

		function read() {
			var token = '';
			for (; pos !== str.length; ++pos) {
				if (str.charAt(pos) === '/') {
					pos += 1;
					if (pos === str.length) {
						token += ';';
						break;
					}
				} else if (str.charAt(pos).match(/[=:&@_;]/)) {
					break;
				}
				token += str.charAt(pos);
			}
			return token;
		}

		function parse() {
			var type = str.charAt(pos++);

			// String
			if (type === '=') {
				return read();
			}
			// Number or Boolean
			if (type === ':') {
				var value = read();
				if (value === 'true') {
					return true;
				}
				if (value === 'false') {
					return false;
				}
				value = parseFloat(value);
				return isNaN(value) ? null : value;
			}
			// Array
			if (type === '@') {
				var res = [];
				loop: {
					if (pos >= str.length || str.charAt(pos) === ';') {
						break loop;
					}
					while (1) {
						res.push(parse());
						if (pos >= str.length || str.charAt(pos) === ';') {
							break loop;
						}
						pos += 1;
					}
				}
				pos += 1;
				return res;
			}
			// Object
			if (type === '_') {
				var res = {};
				loop: {
					if (pos >= str.length || str.charAt(pos) === ';') {
						break loop;
					}
					while (1) {
						var name = read();
						res[name] = parse();
						if (pos >= str.length || str.charAt(pos) === ';') {
							break loop;
						}
						pos += 1;
					}
				}
				pos += 1;
				return res;
			}
			// Error
			throw 'Unexpected char ' + type;
		}

		return parse();
	}
};

if (true) {
	exports.stringify = URLON.stringify;
	exports.parse = URLON.parse;
}


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: getReader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getReader", function() { return getReader; });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "axios");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var urlon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! urlon */ "./node_modules/urlon/src/urlon.js");
/* harmony import */ var urlon__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(urlon__WEBPACK_IMPORTED_MODULE_1__);



class BigWaffleReader {
  init (options) {
    const defaults = {
      dataset: 'systema_globalis',
      service: 'http://bigwaffle.gapminder.org'
    }
    this.dataset = options.dataset || defaults.dataset
    this.service = options.service || defaults.service
  }

  getAsset (filePath, repositoryPath = '') {

  }
  
  read (query, parsers) {
    // For now parsers are ignored
    const url = `${this.service}/${this.dataset}?${this._queryAsParams(query)}`
    return axios.get(url)
      .then(response => {
        if (response.status === 200) {
          /*
           * Return an array of objects
          */
          const data = response.data
          const header = data.header
          return (data.rows || []).map(row => row.reduce((obj, value, headerIdx) => {
            const field = header[headerIdx]
            const parser = parsers[field]
            obj[field] = parser ? parser(value) : value
            return obj
          }, {}))
        } else {
          const err = new Error(response.statusTxt || `DDF Service responded with ${response.status}`)
          err.code = `HTTP_${response.status}`
          return err
        }
      })
      .catch(error => {
        if (error.response) {
          const err = new Error(response.statusTxt || `DDF Service responded with ${response.status}`)
          err.code = `HTTP_${response.status}`
          return err
        } else {
          console.error(error)
          return error
        }
      })
  }

  _queryAsParams (query) {
    //TODO: Add some basic validation ??
    return urlon__WEBPACK_IMPORTED_MODULE_1__["stringify"](query) // encodeURIComponent(JSON.stringify(query))
  }
}

function getReader() {
  /*
   * Return an object that exposes the Reader interface.
   *
   * The Vizabi "class extension" code requires that we return 
   * an object with the public methods of the BigWaffleReader class
   * as ownProperties
   *
   */
  const reader = {}
  Object.getOwnPropertyNames(BigWaffleReader.prototype).forEach(method => {
    if (method !== 'constructor') {
      reader[method] = BigWaffleReader.prototype[method].bind(reader)
    }
  })
  return reader
}


/***/ }),

/***/ "axios":
/*!**************************************************************************************!*\
  !*** external {"commonjs":"axios","commonjs2":"axios","amd":"axios","root":"axios"} ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_axios__;

/***/ })

/******/ });
});
//# sourceMappingURL=vizabi-ddfbw-reader.js.map