import { expect } from 'chai';
import sinon from 'sinon';

import { MarketContractRegistry, CollateralToken } from '../mocks/contracts';
import { loadContracts } from '../../src/actions/explorer';
import { marketAPI, Path } from '../../src/util/marketAPI';
import { processAPIContractsList } from '../../src/util/contracts';

describe('ExplorerAction', () => {
  let contractParams;
  let deployParams;
  let dispatchSpy;

  function runLoadContractsAction() {
    const loadContractsAction = loadContracts(deployParams, contractParams);
    return loadContractsAction(dispatchSpy);
  }

  beforeEach(() => {
    contractParams = {
      MarketContractRegistry: MarketContractRegistry(),
      CollateralToken: CollateralToken()
    };
    deployParams = { processContracts: () => Promise.resolve({}) };
    dispatchSpy = sinon.spy();
  });

  describe('with Web3', () => {
    beforeEach(() => {
      deployParams.web3 = {};
    });

    it('should dispatch processed contracts', () => {
      const expectedPayload = [
        {
          CONTRACT_NAME: 'UNIT/TEST',
          COLLATERAL_TOKEN: '0x12300'
        }
      ];
      deployParams.processContracts = () => Promise.resolve(expectedPayload);

      return runLoadContractsAction().then(() => {
        expect(dispatchSpy).to.have.property('callCount', 2);
        expect(dispatchSpy.args[0][0].type).to.equals('GET_CONTRACTS_PENDING');
        expect(dispatchSpy.args[1][0].type).to.equals(
          'GET_CONTRACTS_FULFILLED'
        );
        expect(dispatchSpy.args[1][0].payload).to.deep.equals(expectedPayload);
      });
    });

    it('should dispatch loading and then error if web3 is undefined', () => {
      deployParams.web3 = null;

      return runLoadContractsAction().catch(() => {
        expect(dispatchSpy).to.have.property('callCount', 2);
        expect(dispatchSpy.args[0][0].type).to.equals('GET_CONTRACTS_PENDING');
        expect(dispatchSpy.args[1][0].type).to.equals('GET_CONTRACTS_REJECTED');
      });
    });
  });

  describe('with marketAPI', () => {
    let mockMarketAPI;
    beforeEach(() => {
      mockMarketAPI = sinon.mock(marketAPI);
      deployParams.marketAPI = marketAPI;
    });

    it('should dispatch successfully dispatched contracts', () => {
      const apiResponsePayload = [
        {
          id: '586',
          name: 'BIN_SNTETH_ETH_1533822446495',
          address: '0x1ea482c3c5bea5d34330785e16bc7c07ba1faad9',
          collateralTokenName: 'Not Available',
          collateralTokenSymbol: 'SNTETH',
          collateralTokenAddress: '0x2021c394e8fce5e56c166601a0428e4611147802',
          oracleQuery:
            'json(https://api.binance.com/api/v3/ticker/price?symbol=SNTETH).price',
          isSettled: false,
          collateralPoolBalance: '0',
          expirationTimestamp: '1536414449',
          priceCap: '19075',
          priceFloor: '6358',
          priceDecimalPlaces: 8,
          lastTradePrice: '0',
          lastQueriedPrice: '0',
          qtyMultiplier: '10000000000',
          referenceAsset: 'BIN',
          isWhitelisted: true
        }
      ];
      mockMarketAPI
        .expects('get')
        .once()
        .withArgs(Path.WhitelistedContracts)
        .resolves(apiResponsePayload);
      deployParams.processContracts = processAPIContractsList;

      return runLoadContractsAction().then(() => {
        mockMarketAPI.verify();
        expect(dispatchSpy).to.have.property('callCount', 2);
        expect(dispatchSpy.args[0][0].type).to.equals('GET_CONTRACTS_PENDING');
        expect(dispatchSpy.args[1][0].type).to.equals(
          'GET_CONTRACTS_FULFILLED'
        );
      });
    });

    it('should dispatch loading and error if loading fails', () => {
      mockMarketAPI
        .expects('get')
        .once()
        .withArgs(Path.WhitelistedContracts)
        .rejects('Fatal network error');

      return runLoadContractsAction().catch(() => {
        mockMarketAPI.verify();
        expect(dispatchSpy).to.have.property('callCount', 2);
        expect(dispatchSpy.args[0][0].type).to.equals('GET_CONTRACTS_PENDING');
        expect(dispatchSpy.args[1][0].type).to.equals('GET_CONTRACTS_REJECTED');
      });
    });
  });
});
