import { expect } from 'chai';

import {
  getMetamaskError,
  calculateCollateral,
  getCollateralTokenAddress,
  getLocationOrigin,
  toBaseUnit,
  fromBaseUnit,
  getEtherscanUrl,
  copyTextToClipboard,
  shortenAddress
} from '../../src/util/utils';

describe('getMetamaskError', () => {
  it('should return "User denied transaction" for declined MetaMask transactions', async () => {
    const expectedErrorMessage = 'User denied transaction';

    const actualErrorMessage = getMetamaskError(
      'Error: MetaMask Tx Signature: User denied transaction signature.'
    );

    expect(actualErrorMessage).to.equals(expectedErrorMessage);
  });

  it('should return original error message as a fallback', async () => {
    const expectedErrorMessage =
      'Error: MetaMask Tx Signature: User denied signature.';

    const actualErrorMessage = getMetamaskError(
      'Error: MetaMask Tx Signature: User denied signature.'
    );

    expect(actualErrorMessage).to.equals(expectedErrorMessage);
  });
});

describe('calculateCollateral', () => {
  [
    /* [priceFloor, priceCap, qtyMultiplier, qty,   price,    expectedCollateral] */
    [20, 50, 2, 3, 10, 0],
    [20, 50, 2, 3, 25, 30],
    [20, 50, 2, -3, 60, 0],
    [20, 50, 2, -3, 25, 150]
  ].forEach(testCase => {
    it(`expects calculateCollateral(${testCase.slice(0, 5)}) to equal ${
      testCase[5]
    }`, () => {
      const actualCollateral = calculateCollateral(...testCase);
      const expectedCollateral = testCase[5];

      expect(expectedCollateral).to.equal(actualCollateral);
    });
  });
});

describe('getEtherscanUrl', () => {
  it('should return the correct etherscan url for the supplied eth network', () => {
    expect(getEtherscanUrl('mainnet')).to.equal('https://etherscan.io');

    expect(getEtherscanUrl('morden')).to.equal('https://morden.etherscan.io');

    expect(getEtherscanUrl('ropsten')).to.equal('https://ropsten.etherscan.io');

    expect(getEtherscanUrl('rinkeby')).to.equal('https://rinkeby.etherscan.io');

    expect(getEtherscanUrl('kovan')).to.equal('https://kovan.etherscan.io');

    expect(getEtherscanUrl('invalidnetwork')).to.equal('');
  });
});

describe('getCollateralTokenAddress', () => {
  it('should return correct collateral address ', () => {
    expect(getCollateralTokenAddress('rinkeby', 'ETH')).to.equal(
      '0x2021c394e8fce5e56c166601a0428e4611147802'
    );
    expect(getCollateralTokenAddress('rinkeby', 'WETH')).to.equal(
      '0xc778417e063141139fce010982780140aa0cd5ab'
    );
    expect(getCollateralTokenAddress('rinkeby', 'USDT')).to.equal(
      '0xee78ae82ab0bbbae6d99b36a999e7b6de2e8664b'
    );
    expect(getCollateralTokenAddress('rinkeby', 'INVALIDQUOTE')).to.equal('');
    expect(getCollateralTokenAddress('invalidnetwork', 'ETH')).to.equal('');
  });
});

describe('copyTextToClipboard', () => {
  it('should copy text to clipboard and show message ', () => {
    // This part is untestable as copy function does not work outside a browser
    // But the library we imported copy tests the function
    // We cannont reach 100% coverage due to this.
    // But this always fails on test-runners
    expect(copyTextToClipboard('')).to.equal(false);
  });
});

describe('toBaseUnit', () => {
  it('should return a big number', () => {
    expect(toBaseUnit('5.5', 18)).to.equal(5500000000000000000);
  });
});

describe('fromBaseUnit', () => {
  it('should return a small number', () => {
    expect(fromBaseUnit('5500000000000000000', 18)).to.equal(5.5);
  });
});

describe('getLocationOrigin', () => {
  it('should return location origin', () => {
    expect(getLocationOrigin()).to.equal(window.location.origin);
  });
});

describe('shortenAddress', () => {
  it('should return location origin', () => {
    expect(
      shortenAddress('0x2021c394e8fce5e56c166601a0428e4611147802')
    ).to.equal('0x2021...7802');
  });
});
