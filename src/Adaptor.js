/** @module Adaptor */
import {
  execute as commonExecute,
  composeNextState,
  expandReferences,
  http,
} from '@openfn/language-common';

const { axios } = http;
exports.axios = axios;

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  return state => {
    return commonExecute(...operations)({
      ...initialState,
      ...state,
    });
  };
}

/**
 * Creates some resource in a connected system
 * @public
 * @example
 * create("/endpoint", {"foo": "bar"})
 * @constructor
 * @param {string} path - Path to resource
 * @param {object} params - data to create the new resource
 * @param {function} callback - (Optional) callback function
 * @returns {Operation}
 */
export function create(path, params, callback) {
  return state => {
    path = expandReferences(path)(state);
    params = expandReferences(params)(state);

    const { baseUrl, username, password } = state.configuration;

    const url = `${baseUrl}/${path}`;
    const auth = { username, password };

    const config = {
      url,
      body: params,
    };

    return http
      .post(config)(state)
      .then(response => {
        const nextState = {
          ...composeNextState(state, response.data),
          response,
        };
        if (callback) return callback(nextState);
        return nextState;
      });
  };
}

/**
 * Creates some resource in a connected system to a known endpoint
 * @public
 * @example
 * createPatient({"foo": "bar"})
 * @constructor
 * @param {object} params - data to create the new resource
 * @param {function} callback - (Optional) callback function
 * @returns {Operation}
 */
export function createPatient(params, callback) {
  return state => {
    params = expandReferences(params)(state);

    const { baseUrl, username, password } = state.configuration;

    const url = `${baseUrl}/patient`;
    const auth = { username, password };

    const config = {
      url,
      body: params,
      auth,
    };

    return http
      .post(config)(state)
      .then(response => {
        const nextState = {
          ...composeNextState(state, response.data),
          response,
        };
        if (callback) return callback(nextState);
        return nextState;
      });
  };
}

// What functions do you want from the common adaptor?
export {
  alterState,
  dataPath,
  dataValue,
  each,
  field,
  fields,
  http,
  lastReferenceValue,
  merge,
  sourceValue,
} from '@openfn/language-common';
