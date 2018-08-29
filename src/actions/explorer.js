import _ from 'lodash';
import { Path } from '../util/marketAPI';

/**
 * loads list of Market Contracts that have been whitelisted in MarketContractRegistry.
 * If the web3 parameter is set, the contracts are loaded from the blockchain,
 * else the marketAPI is used to load the contracts from the market-api service (which is faster).
 *
 * Typically, loading from web3 is used in the development environment.
 *
 * @param processContracts function to process the loaded contract to a format required.
 * @param marketAPI The marketAPI resource used to interact with the server.
 */
export function loadContracts(
  { web3, processContracts, marketAPI },
  { MarketContractRegistry, CollateralToken }
) {
  const type = 'GET_CONTRACTS';

  return function(dispatch) {
    return new Promise((resolve, reject) => {
      dispatch({ type: `${type}_PENDING` });

      // Double-check web3's status
      if (!_.isUndefined(web3) && !_.isNull(web3)) {
        loadContractsFromWeb3(
          MarketContractRegistry,
          CollateralToken,
          processContracts,
          dispatch,
          type,
          resolve
        );
      } else if (!_.isUndefined(marketAPI) && !_.isNull(marketAPI)) {
        loadContractsFromAPI(
          marketAPI,
          processContracts,
          dispatch,
          type,
          resolve,
          reject
        );
      } else {
        dispatch({
          type: `${type}_REJECTED`,
          payload: { error: 'Could not fetch contracts at the moment' }
        });
        reject({ error: 'Could not fetch contracts at the moment' });
      }
    });
  };
}

function loadContractsFromWeb3(
  MarketContractRegistry,
  CollateralToken,
  processContracts,
  dispatch,
  type,
  resolve
) {
  // Declaring this for later so we can chain functions.
  let marketContractRegistryInstance;
  MarketContractRegistry.deployed().then(function(instance) {
    marketContractRegistryInstance = instance;
    // Attempt to find deployed contracts and get metadata
    marketContractRegistryInstance.getAddressWhiteList
      .call()
      .then(async function(deployedContracts) {
        await CollateralToken.deployed();
        processContracts(deployedContracts).then(function(data) {
          let filteredData = _.compact(data);
          dispatch({ type: `${type}_FULFILLED`, payload: filteredData });
          resolve(filteredData);
        });
      });
  });
}

function loadContractsFromAPI(
  marketAPI,
  processContracts,
  dispatch,
  type,
  resolve,
  reject
) {
  marketAPI
    .get(Path.Contracts, { query: { whitelist: 1 } })
    .then(processContracts)
    .then(processedContracts => {
      dispatch({ type: `${type}_FULFILLED`, payload: processedContracts });
      resolve(processedContracts);
    })
    .catch(err => {
      dispatch({
        type: `${type}_REJECTED`,
        payload: { error: 'Could not fetch contracts at the moment' }
      });
      reject({ error: 'Could not fetch contracts at the moment' });
    });
}
