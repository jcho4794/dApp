/**
 * Appends correct host to path
 *
 * @param {string} path
 */
function url(path) {
  const host = 'https://dev.api.marketprotocol.io';
  return `${host}${path}`;
}

export const marketAPI = {
  /**
   * Makes a GET request to the marketAPI resource at `path`.
   *
   * @param {string} path Path to request API
   * @param {function} fetch API fetch function defaults to fetch()
   * @param {bool} toJson Flag to convert result to
   * @return {Promise<*>} result of request
   */
  get(path, { fetch = window.fetch, toJson = true } = {}) {
    return fetch(url(path)).then(
      response => (toJson ? response.json() : response)
    );
  }
};

// paths to API resources
export const Path = {
  Contracts: '/contracts',
  WhitelistedContracts: '/contracts/whitelist',
  Orders: contractAddress => `/orders/${contractAddress}/`
};
