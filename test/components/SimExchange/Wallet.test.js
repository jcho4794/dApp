import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import Web3 from 'web3';
import FakeProvider from 'web3-fake-provider';
import { Input } from 'antd';
import { Table as T } from 'antd';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import Wallet from '../../../src/components/SimExchange/Wallet';
import Table from '../../../src/components/SimExchange/Wallet/Table';
import HeaderMenu from '../../../src/components/SimExchange/Wallet/HeaderMenu';
import Form from '../../../src/components/SimExchange/Wallet/Form';

import { MarketJS } from '../../../src/util/marketjs/marketMiddleware';

const mockContract = {
  key: '0x6467854f25ff1f1ff8c11a717faf03e409b53635',
  CONTRACT_NAME: 'ETHXBT',
  COLLATERAL_TOKEN: 'FakeDollars',
  COLLATERAL_TOKEN_ADDRESS: '0x6467854f25ff1f1ff8c11a717faf03e409b53635',
  COLLATERAL_TOKEN_SYMBOL: 'FUSD',
  MARKET_COLLATERAL_POOL_ADDRESS: '0x3e69935694cdb936bf0b281e62b4087cfcb063bb',
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

function mockedCoinbaseWeb3(
  callbackError = null,
  coinbaseAddress = '0x6467854f25ff1f1ff8c11a717faf03e409b53635'
) {
  const fakeProvider = new FakeProvider();
  const web3 = new Web3(fakeProvider);
  fakeProvider.injectResult(['0x98765']);
  web3.eth.getCoinbase = callback => {
    callback(callbackError, coinbaseAddress);
  };
  web3.fromWei = () => {
    return new BigNumber(5);
  };

  return web3;
}

describe('Wallet', () => {
  let props;
  beforeEach(() => {
    props = {
      simExchange: {
        contract: ''
      }
    };
  });

  it('renders wallet', () => {
    const wallet = shallow(<Wallet {...props}/>);

    expect(wallet.containsMatchingElement(<HeaderMenu />)).to.equal(true);
    expect(wallet.containsMatchingElement(<Table />)).to.equal(true);
  });
  it('should toggle', () => {
    const wallet = shallow(<Wallet {...props}/>);
    wallet.setState({  walletCollapsed: false });
    let spy = sinon.spy(wallet.instance(), 'onToggle');
    wallet.update();

    wallet.instance().onToggle();
    expect(wallet.state('walletCollapsed')).to.equal(true);
    wallet.update();

    expect(wallet.containsMatchingElement(<HeaderMenu />)).to.equal(false);
    expect(spy.called).to.equal(true);
  });
  it('should getBalances when a contract is selected', () => {
    const wallet = mount(<Wallet {...props}/>);
    sinon
      .stub(MarketJS, 'getUserUnallocatedCollateralBalanceAsync')
      .resolves('1000000000000000');
    let spy = sinon.spy(wallet.instance(), 'getBalances');
    wallet.update();

    wallet.setProps({
      simExchange: {
        contract: mockContract
      }
    });

    expect(spy.called).to.equal(true);
  });
});

describe('HeaderMenu', () => {
  let headerMenu;
  let form;
  let onSubmit;
  let showModal;
  let validateFields;
  let props;
  let getFieldDecorator;
  let getFieldError;
  let isFieldTouched;
  let getFieldsError;
  let showMessage;

  beforeEach(() => {
    const web3 = mockedCoinbaseWeb3();
    onSubmit = sinon.spy();
    showModal = sinon.spy();
    validateFields = sinon.spy();
    getFieldDecorator = sinon.spy();
    getFieldError = sinon.spy();
    isFieldTouched = sinon.spy();
    getFieldsError = sinon.spy();
    showMessage = sinon.spy();

    // TODO: Update `networkId` prop once marketjs middleware is setup to stub responses
    props = {
      amount: {
        type: 'deposit',
        value: '1'
      },
      unallocatedCollateral: 5000,
      availableCollateral: 7000,
      simExchange: {
        contract: ''
      },
      web3: {
        network: 'rinkeby',
        networkId: 4,
        web3Instance: web3
      },
      form: {
        validateFields: validateFields,
        isFieldTouched: isFieldTouched,
        getFieldDecorator: getFieldDecorator,
        getFieldError: getFieldError,
        getFieldsError: getFieldsError
      },
      showModal: showModal,
      onSubmit: onSubmit,
      type: 'deposit',
      showMessage: showMessage
    };

    headerMenu = mount(<HeaderMenu {...props} />);
  });

  it('contains a form', () => {
    expect(headerMenu.containsMatchingElement(<Form />)).to.equal(true);
  });

  it('should have a input field to accept deposits/withdraw', () => {
    form = headerMenu.find('.deposit-withdraw-form');
    expect(form.find(Input).length).to.equal(1);
  });

  it('should update amount and submit request', () => {
    const amount = {
      type: 'deposit',
      value: '1'
    };

    let input = headerMenu.find('.deposit-withdraw-input').first();
    input.value = '1';
    input.simulate('change');

    let form = headerMenu.find('.deposit-withdraw-form').first();
    let spy = sinon.spy(headerMenu.instance(), 'onSubmit');
    headerMenu.update();

    form.simulate('submit');
    headerMenu.instance().onSubmit(amount);
    expect(spy.called).to.equal(true);
  });

  it('should open collateral modal', () => {
    let spy = sinon.spy(headerMenu.instance(), 'showModal');
    headerMenu.update();

    headerMenu.instance().showModal();

    expect(headerMenu.state('modal')).to.equal(true);
    expect(spy.called).to.equal(true);
  });

  it('should close collateral modal', () => {
    let spy = sinon.spy(headerMenu.instance(), 'handleCancel');
    headerMenu.update();

    headerMenu.instance().handleCancel();

    expect(headerMenu.state('modal')).to.equal(false);
    expect(spy.called).to.equal(true);
  });

  it('should handleOk default', () => {
    let spy = sinon.spy(headerMenu.instance(), 'handleOk');

    headerMenu.update();
    headerMenu.instance().onSubmit({ type: 'test', value: '1' });

    headerMenu.instance().handleOk();

    expect(headerMenu.state('modal')).to.equal(false);
    expect(spy.called).to.equal(true);
  });

  it('should handleOk deposit', () => {
    headerMenu.setProps({
      simExchange: {
        contract: mockContract
      }
    });
    const depositCollateral = sinon.spy();

    headerMenu.instance().depositCollateral = depositCollateral;
    headerMenu.update();
    sinon.stub(MarketJS, 'depositCollateralAsync').resolves(true);

    headerMenu.instance().onSubmit({ type: 'deposit', value: '1' });
    headerMenu.instance().handleOk();
    headerMenu.instance().depositCollateral();

    expect(depositCollateral.called).to.equal(true);
  });

  it('should handleOk withdraw', () => {
    headerMenu.setProps({
      simExchange: {
        contract: mockContract
      }
    });

    headerMenu.update();
    sinon.stub(MarketJS, 'withdrawCollateralAsync').resolves(true);
    headerMenu.instance().onSubmit({ type: 'withdraw', value: '1' });
    headerMenu.instance().handleOk();
    headerMenu.props().showMessage('success', 'test');

    expect(headerMenu.state('modal')).to.equal(false);
  });

  describe('Table', () => {
    it('renders with transaction data', () => {
      const table = mount(<Table {...props} />);

      const containsDataTable = table.containsMatchingElement(<T />);

      table.setProps({
        simExchange: {
          contract: mockContract
        }
      });
    });
  });
});
