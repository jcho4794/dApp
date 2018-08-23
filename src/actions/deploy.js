import { getMetamaskError } from '../util/utils';
import store from '../store';

export function deployContract(
  web3,
  contractSpecs
) {
  const type = 'DEPLOY_CONTRACT';
  const { marketjs } = store.getState();
  return async function(dispatch) {
    dispatch({ type: `${type}_PENDING` });
    
    if (!web3 || typeof web3 === 'undefined') { 
      dispatch({
        type: `${type}_REJECTED`,
        payload: { error: 'Web3 not initialised' }
      });
      throw(new Error('Web3 not initialised'));
    }
    const coinbase = await new Promise((resolve, reject) => {
      web3.eth.getCoinbase((error, coinbase) => {
        if (error) {
          console.error(error);
          dispatch({
            type: `${type}_REJECTED`,
            payload: getMetamaskError(error.message.split('\n')[0])
          });
          reject(getMetamaskError(error.message.split('\n')[0]));
        } else {
          resolve(coinbase);
        }
      });
    });

    console.log('Attempting to deploy contract from ' + coinbase);
    dispatch({
      type: `${type}_CONTRACT_DEPLOYMENT_STARTED`
    });
    const contractConstructorArray = [
      contractSpecs.priceFloor,
      contractSpecs.priceCap,
      contractSpecs.priceDecimalPlaces,
      contractSpecs.qtyMultiplier,
      contractSpecs.expirationTimeStamp
    ];
    const txParams = {
      gas: contractSpecs.gas,
      gasPrice: web3.toWei(contractSpecs.gasPrice, 'gwei'),
      from: coinbase
    };
    const txHash = await marketjs.deployMarketContractOraclizeAsync(
      contractSpecs.contractName,
      contractSpecs.collateralTokenAddress,
      contractConstructorArray,
      contractSpecs.oracleDataSource,
      contractSpecs.oracleQuery,
      txParams
    );
    const marketContractAddress = await marketjs.getDeployedMarketContractAddressFromTxHash(
      coinbase,
      txHash,
      0
    ).catch(err => {
      dispatch({
        type: `${type}_REJECTED`,
        payload: getMetamaskError(err.message.split('\n')[0])
      });
      throw(getMetamaskError(err.message.split('\n')[0]));
    });
    console.log(
      'Market Contract deployed to ' + marketContractAddress  
    );
    dispatch({
      type: `${type}_CONTRACT_DEPLOYED`,
      payload: {
        deploymentResults: { tx: txHash }
      }
    });

    const collateralTxHash = await marketjs.deployMarketCollateralPoolAsync(
      marketContractAddress,
      txParams
    ).catch(err => {
      dispatch({
        type: `${type}_REJECTED`,
        payload: getMetamaskError(err.message.split('\n')[0])
      });
      throw(getMetamaskError(err.message.split('\n')[0]));
    });  
    dispatch({
      type: `${type}_COLLATERAL_POOL_DEPLOYED`,
      payload: {
        deploymentResults: { tx: collateralTxHash }
      }
    });

    dispatch({
      type: `${type}_FULFILLED`,
      payload: { address: marketContractAddress }
    });
  };
}

export function resetDeploymentState(preservations) {
  return function(dispatch) {
    dispatch({
      type: 'DEPLOY_CONTRACT_RESET_STATE',
      payload: preservations ? preservations : {}
    });
  };
}

// TODO: Add getGasEstimate for creating new MarketContract
// Ref: https://github.com/trufflesuite/truffle-contract/tree/web3-one-readme
