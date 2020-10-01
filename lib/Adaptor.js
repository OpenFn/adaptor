"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.post = post;
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});

var _languageCommon = require("language-common");

var _request = _interopRequireDefault(require("request"));

var _url = require("url");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = new Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };
  return function (state) {
    return _languageCommon.execute.apply(void 0, operations)(_objectSpread(_objectSpread({}, initialState), state));
  };
}
/**
 * Make a POST request
 * @example
 * execute(
 *   post(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */


function post(params) {
  return function (state) {
    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;
      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error("Server responded with ".concat(response.statusCode));
    }

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        url = _expandReferences.url,
        body = _expandReferences.body,
        headers = _expandReferences.headers;

    return new Promise(function (resolve, reject) {
      console.log('Request body:');
      console.log('\n' + JSON.stringify(body, null, 4) + '\n');

      _request["default"].post({
        url: url,
        json: body,
        headers: headers
      }, function (error, response, body) {
        error = assembleError({
          error: error,
          response: response
        });

        if (error) {
          reject(error);
          console.log(response);
        } else {
          console.log('Printing response...\n');
          console.log(JSON.stringify(response, null, 4) + '\n');
          console.log('POST succeeded.');
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _objectSpread(_objectSpread({}, state), {}, {
        response: {
          body: data
        }
      });

      return nextState;
    });
  };
} // Note that we expose the entire npm request package to the user here.


exports.request = _request["default"]; // What functions do you want from the common adaptor?
