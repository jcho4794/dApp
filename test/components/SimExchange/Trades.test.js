import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';

import Trades from '../../../src/components/SimExchange/Trade/Trades';
import TradeContainer from '../../../src/components/SimExchange/Trade/TradeContainer';
import { MarketJS } from '../../../src/util/marketjs/marketMiddleware';
import BigNumber from 'bignumber.js';

const mockContract = {
  contract: { key: '0x6467854f25ff1f1ff8c11a717faf03e409b53635' },
  CONTRACT_NAME: 'ETHXBT',
  COLLATERAL_TOKEN: 'FakeDollars',
  COLLATERAL_TOKEN_ADDRESS: '0x6467854f25ff1f1ff8c11a717faf03e409b53635',
  COLLATERAL_TOKEN_SYMBOL: 'FUSD',
  MARKET_COLLATERAL_POOL_ADDRESS: new BigNumber(),
  PRICE_FLOOR: '60465',
  PRICE_CAP: '20155',
  PRICE_DECIMAL_PLACES: '2',
  QTY_MULTIPLIER: '10',
  ORACLE_QUERY:
    'json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0',
  EXPIRATION: '',
  lastPrice: '105700',
  isSettled: true,
  collateralPoolBalance: ''
};

describe('Trades', () => {
  let props;
  let state;
  let tradesContainer;

  beforeEach(() => {
    props = {
      buys: [],
      sells: [],
      simExchange: {
        contract: {}
      }
    };

    state = {
      buys: [],
      sells: []
    };

    tradesContainer = shallow(<Trades {...props} />);
  });

  it('should getUnallocatedCollateral', async () => {
    let spy = sinon.spy(tradesContainer.instance(), 'getUnallocatedCollateral');
    sinon
      .stub(MarketJS, 'getUserUnallocatedCollateralBalanceAsync')
      .resolves(
        tradesContainer.setState({ unallocatedCollateral: 100000000000000000 })
      );

    tradesContainer.update();

    tradesContainer.instance().getUnallocatedCollateral(props);

    expect(spy.called).to.equal(true);
    expect(tradesContainer.state('unallocatedCollateral')).to.equal(
      100000000000000000
    );
  });
});

describe('TradesContainer', () => {
  let props;
  let tradeContainer;
  let trades;
  let mountTradeContainer;
  let state;

  beforeEach(() => {
    props = {
      asks: [],
      bids: [],
      simExchange: {
        contract: {
          MARKET_COLLATERAL_POOL_ADDRESS: new BigNumber()
        }
      }
    };

    tradeContainer = shallow(
      <TradeContainer {...props} type="bids" market="" data={props.bids} />,
      { context: { state: state } }
    );

    trades = shallow(<Trades {...props} />);
  });

  it('should open trade confirmation modal', () => {
    let spy = sinon.spy(tradeContainer.instance(), 'showModal');
    tradeContainer.update();

    tradeContainer.instance().showModal();

    expect(tradeContainer.state('modal')).to.equal(true);
    expect(spy.called).to.equal(true);
  });

  it('should close trade confirmation modal', () => {
    let spy = sinon.spy(tradeContainer.instance(), 'handleCancel');
    tradeContainer.update();

    tradeContainer.instance().handleCancel();

    expect(tradeContainer.state('modal')).to.equal(false);
    expect(spy.called).to.equal(true);
  });

  it('should handleOk', async () => {
    let spy = sinon.spy(tradeContainer.instance(), 'handleOk');
    sinon.stub(MarketJS, 'createSignedOrderAsync').resolves({
      v: 27,
      r: '0xaefb074ad9ca7bd1546ac53a8fe7f8bb3aefca14b573f4955a8b38b692e68f01',
      s: '0x3a1cb01e410407076e4d7dde6f17971a0901fdcaa50bfcc0e615de0fffa31f12'
    });

    tradeContainer.update();

    tradeContainer.instance().handleOk();

    expect(tradeContainer.state('modal')).to.equal(false);
    expect(spy.called).to.equal(true);
  });

  it('should submit form and open confirmation modal', () => {
    let spy = sinon.spy(tradeContainer.instance(), 'onSubmit');

    tradeContainer
      .instance()
      .onSubmit(
        { qty: 1, price: 1, expirationTimestamp: moment().unix() },
        '',
        'bids'
      );
    expect(spy.called).to.equal(true);
  });
});
