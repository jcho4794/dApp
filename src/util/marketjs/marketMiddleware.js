import BigNumber from 'bignumber.js';
import abi from 'human-standard-token-abi';
import moment from 'moment';

import store from '../../store';

import { toBaseUnit } from '../utils';
import showMessage from '../../components/message';

import { NULL_ADDRESS } from '../../constants';
import { Utils } from '@marketprotocol/marketjs';

// PUBLIC

/**
 * This file is a middleware wrapper for the MARKET.js library. It abstracts away
 * the cruft of building up the needed objects to complete these transactions.
 **/

/**
 * @param orderData user inputed order data object {qty, price, expirationTimestamp}
 * @returns Promise<SignedOrder>
 **/
const createSignedOrderAsync = (orderData, str = store) => {
  const { marketjs, simExchange, web3 } = str.getState();

  let order = {
    contractAddress: simExchange.contract.key,
    expirationTimestamp: new BigNumber(
      moment(orderData.expirationTimestamp).unix()
    ),
    feeRecipient: NULL_ADDRESS,
    maker: web3.web3Instance.eth.coinbase,
    makerFee: new BigNumber(0),
    taker: NULL_ADDRESS,
    takerFee: new BigNumber(0),
    orderQty: new BigNumber(orderData.qty),
    price: new BigNumber(orderData.price),
    salt: new BigNumber(Utils.generatePseudoRandomSalt())
  };

  return marketjs.createSignedOrderAsync(
    ...Object.values(order),
    web3.web3Instance.currentProvider.isMetaMask ? true : false
  );
};

/**
 * @param amount the amount of collateral tokens you want to deposit
 * @returns Promise<Boolean>
 **/
const depositCollateralAsync = (amount, str = store) => {
  const { simExchange, marketjs } = str.getState();
  const web3 = str.getState().web3.web3Instance;
  web3.eth.getTransactionReceiptMined = require('../web3/getTransactionReceiptMined');

  const txParams = {
    from: web3.eth.coinbase
  };

  let collateralTokenContractInstance = web3.eth
    .contract(abi)
    .at(simExchange.contract.COLLATERAL_TOKEN_ADDRESS);

  collateralTokenContractInstance.decimals.call((err, decimals) => {
    // NOTE: we are calling approve on the abi used above, this it outside of MARKET.js and therefore
    // needs to use the market collateral pool address.  We will add functionality in MARKET.js to simplify this
    // and no longer need to use the Collateral Pool Address.
    marketjs
      .approveCollateralDepositAsync(
        simExchange.contract.key,
        new BigNumber(toBaseUnit(amount.number, decimals)),
        txParams
      )
      .then(res => {
        console.log('res', res);

        return web3.eth.getTransactionReceiptMined(res).then(function() {
          marketjs
            .depositCollateralAsync(
              simExchange.contract.key,
              new BigNumber(toBaseUnit(amount.number, decimals)),
              txParams
            )
            .then(res => {
              showMessage(
                'success',
                'Deposit successful, your transaction will process shortly.',
                5
              );
              return res;
            });
        });
      });
  });
};

/**
 * @param tokenAddress ERC20 token address
 * @param toString boolean - converts return value to string instead of BigNumber
 * @returns Promise<String or BigNumber>
 **/
const getBalanceAsync = (tokenAddress, toString, str = store) => {
  const marketjs = str.getState().marketjs;
  const web3 = str.getState().web3.web3Instance;

  return marketjs.getBalanceAsync(tokenAddress, web3.eth.coinbase).then(res => {
    switch (toString) {
      case true:
        const tokenBalance = web3.fromWei(res.toFixed(), 'ether').toString();

        return tokenBalance;
      default:
        return res;
    }
  });
};

/**
 * @param marketContractAddress the address for the MARKET contract
 * @param fromBlock starting block number(default: 0)
 * @param toBlock ending block number(defualt: latest)
 * @param userAddress users wallet address filter(default: null)
 * @param side maker, taker, or any(default: any)
 * @returns Promise<OrderFilledEvent[]>
 **/
const getContractFillsAsync = (
  marketContractAddress,
  fromBlock = 0,
  toBlock = 'latest',
  userAddress = null,
  side = 'any',
  str = store
) => {
  const { marketjs } = str.getState();

  return marketjs
    .getContractFillsAsync(
      marketContractAddress,
      fromBlock,
      toBlock,
      userAddress,
      side
    )
    .then(fills => {
      console.log('fills', fills);
      return fills;
    });
};

/**
 * @param contract MARKET contract object
 * @param toString boolean that returns the value as a string
 * @returns Promise<BigNumber|null>
 **/
const getUserUnallocatedCollateralBalanceAsync = (
  contract,
  toString,
  str = store
) => {
  const marketjs = str.getState().marketjs;
  const web3 = str.getState().web3.web3Instance;

  return marketjs
    .getUserUnallocatedCollateralBalanceAsync(contract.key, web3.eth.coinbase)
    .then(res => {
      switch (toString) {
        case true:
          const unallocatedCollateral = web3
            .fromWei(res.toFixed(), 'ether')
            .toString();

          return unallocatedCollateral;
        default:
          return res;
      }
    });
};

/**
 * @param signedOrderJSON A signed order JSON object string
 * @returns Promise<OrderTransactionInfo>
 **/
const tradeOrderAsync = (signedOrderJSON, str = store) => {
  const { marketjs } = str.getState();
  const web3 = str.getState().web3.web3Instance;
  const signedOrder = JSON.parse(signedOrderJSON);

  const txParams = {
    from: web3.eth.coinbase,
    gas: 40000
  };
  signedOrder.expirationTimestamp = new BigNumber(
    signedOrder.expirationTimestamp
  );

  signedOrder.makerFee = new BigNumber(signedOrder.makerFee);
  signedOrder.orderQty = new BigNumber(signedOrder.orderQty);
  signedOrder.price = new BigNumber(signedOrder.price);
  signedOrder.remainingQty = new BigNumber(signedOrder.remainingQty);
  signedOrder.takerFee = new BigNumber(signedOrder.takerFee);
  signedOrder.salt = new BigNumber(signedOrder.salt);

  console.log('signedOrderJSON', signedOrder);

  return marketjs
    .tradeOrderAsync(signedOrder, signedOrder.orderQty, txParams)
    .then(res => {
      return res;
    });
};

/**
 * @param amount the amount of collateral tokens you want to deposit
 * @returns Promise<Boolean>
 **/
const withdrawCollateralAsync = (amount, str = store) => {
  const { simExchange, marketjs } = str.getState();
  const web3 = str.getState().web3.web3Instance;

  const txParams = {
    from: web3.eth.coinbase
  };

  let collateralTokenContractInstance = web3.eth
    .contract(abi)
    .at(simExchange.contract.COLLATERAL_TOKEN_ADDRESS);

  collateralTokenContractInstance.decimals.call((err, decimals) => {
    marketjs
      .withdrawCollateralAsync(
        simExchange.contract.key,
        toBaseUnit(amount.number, decimals),
        txParams
      )
      .then(res => {
        showMessage(
          'success',
          'Withdraw successful, your transaction will process shortly.',
          5
        );

        return res;
      });
  });
};

export const MarketJS = {
  createSignedOrderAsync,
  depositCollateralAsync,
  getBalanceAsync,
  getContractFillsAsync,
  getUserUnallocatedCollateralBalanceAsync,
  tradeOrderAsync,
  withdrawCollateralAsync
};
