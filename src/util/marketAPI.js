import qs from 'query-string';

/**
 * Appends correct host to path
 *
 * @param {string} path
 */
function url(path, query) {
  const host = 'https://dev.api.marketprotocol.io';

  const queryString = qs.stringify(query);
  if (queryString === '') {
    return `${host}${path}`;
  } else {
    return `${host}${path}${'?' + queryString}`;
  }
}

export const marketAPI = {
  /**
   * Makes a GET request to the marketAPI resource at `path`.
   *
   * @param {string} path Path to request API
   * @param {function} fetch API fetch function defaults to fetch()
   * @param {object} query Object containing query parameters for request
   * @param {bool} toJson Flag to convert result to
   * @return {Promise<*>} result of request
   */
  get(path, { fetch = window.fetch, query = {}, toJson = true } = {}) {
    return fetch(url(path, query)).then(
      response => (toJson ? response.json() : response)
    );
  }
};

// paths to API resources
export const Path = {
  Contracts: '/contracts',
  Orders: contractAddress => `/orders/${contractAddress}/`
};
