import { expect } from 'chai';
import sinon from 'sinon';
import Web3 from 'web3';
import FakeProvider from 'web3-fake-provider';
import store from '../../src/store';
import { deployContract } from '../../src/actions/deploy';

function validContractSpecs() {
  return {
    contractName: 'UNIT/TEST',
    priceFloor: 200,
    priceCap: 300,
    priceDecimalPlaces: 5,
    qtyMultiplier: 2,
    expirationTimeStamp: 600000,
    collateralTokenAddress: '0x000000001',
    oracleDataSource: 'Wolfram',
    oracleQuery: '2+2'
  };
}

function mockedCoinbaseWeb3(
  callbackError = null,
  coinbaseAddress = '0x123456'
) {
  const fakeProvider = new FakeProvider();
  const web3 = new Web3(fakeProvider);
  fakeProvider.injectResult(['0x0000001']); // inject web.eth.accounts result
  web3.eth.getCoinbase = callback => {
    callback(callbackError, coinbaseAddress);
  };
  return web3;
}

describe('DeployAction', () => {
  let deployParams;
  let dispatchSpy;



  function runDeployAction() {
    const deployAction = deployContract(deployParams.web3, deployParams.contractSpecs);
    return deployAction(dispatchSpy);
  }

  beforeEach(() => {
    deployParams = {
      web3: mockedCoinbaseWeb3(),
      contractSpecs: validContractSpecs()
    };

    dispatchSpy = sinon.spy();
  });

  it('should call deployMarketContractOraclizeAsync and dispatch deploy contract fulfilled', async () => {
    let stub = sinon.stub();
    stub.returns(Promise.resolve('0x0'));
    let storeStub = sinon.stub(store, "getState");
    storeStub.returns({
      marketjs: {
        deployMarketContractOraclizeAsync: stub,
        getDeployedMarketContractAddressFromTxHash: stub,
        deployMarketCollateralPoolAsync: stub
      }
    });
    return runDeployAction().then(() => {
      expect(stub.called).to.equal(true);
      expect(dispatchSpy).to.have.property('callCount', 5);
      expect(dispatchSpy.args[4][0].type).to.equals(
        'DEPLOY_CONTRACT_FULFILLED'
      );
    });
  });

  it('should dispatch contract rejected if getCoinbase return error', () => {
    deployParams.web3 = mockedCoinbaseWeb3(Error('Could not fetch coinbase'));

    return runDeployAction().catch(() => {
      expect(dispatchSpy).to.have.property('callCount', 2);
      expect(dispatchSpy.args[1][0].type).to.equals('DEPLOY_CONTRACT_REJECTED');
    });
  });

  it('should dispatch loading and then error if web3 is undefined', () => {
    deployParams.web3 = null;

    return runDeployAction().catch(() => {
      expect(dispatchSpy).to.have.property('callCount', 2);
      expect(dispatchSpy.args[0][0].type).to.equals('DEPLOY_CONTRACT_PENDING');
      expect(dispatchSpy.args[1][0].type).to.equals('DEPLOY_CONTRACT_REJECTED');
    });
  });
});
