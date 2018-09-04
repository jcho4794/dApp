import React from 'react';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';
import { Col } from 'antd';
import { expect } from 'chai';
import sinon from 'sinon';

import SimExchange from '../../../src/components/SimExchange/SimExchange';
import Trades from '../../../src/components/SimExchange/Trade/Trades';
import Wallet from '../../../src/components/SimExchange/Wallet';

describe('SimExchange', () => {
  let simExchangeTrades;
  let simExchangeWallet;
  let simExchangeBadRoute;
  let getContractsSpy;

  const tradesPath = '/exchange/trades/';
  const walletPath = '/exchange/wallet/';

  const props = {
    asks: [],
    bids: [],
    simExchange: {
      contract: {}
    },
    tradeOrder: {},
    contract: {},
    web3: {
      web3Instance: {
        version: {
          network: 'truffle'
        }
      }
    }
  };

  beforeEach(() => {
    getContractsSpy = sinon.spy();

    simExchangeBadRoute = mount(
      <MemoryRouter initialEntries={[{ pathname: '/test', key: 'start' }]}>
        <SimExchange
          {...props}
          getContracts={getContractsSpy}
          shouldRender={true}
        />
      </MemoryRouter>
    );

    simExchangeTrades = mount(
      <MemoryRouter initialEntries={[{ pathname: tradesPath, key: 'start' }]}>
        <SimExchange
          {...props}
          getContracts={getContractsSpy}
          shouldRender={true}
        />
      </MemoryRouter>
    );

    simExchangeWallet = mount(
      <MemoryRouter initialEntries={[{ pathname: walletPath, key: 'start' }]}>
        <SimExchange
          {...props}
          getContracts={getContractsSpy}
          shouldRender={true}
        />
      </MemoryRouter>
    );
  });

  it('contains 4 columns', () => {
    const component = simExchangeTrades.find(SimExchange);
    expect(component.find('.column-container')).to.have.length(4);
  });

  it('renders trades', () => {
    const component = simExchangeTrades.find(SimExchange);
    const showsTrades = component.containsMatchingElement(
      <Trades {...props} tradeOrder={props.tradeOrder} />
    );

    expect(showsTrades, 'Should render trades').to.be.true;
  });

  it('renders wallet', () => {
    const component = simExchangeWallet.find(SimExchange);
    const showsWallet = component.containsMatchingElement(<Wallet />);

    expect(showsWallet, 'Should render wallet').to.be.true;
  });

  it('renders dummy text when disabled', () => {
    const component = mount(
      <MemoryRouter initialEntries={[{ tradesPath, key: 'start' }]}>
        <SimExchange
          {...props}
          getContracts={getContractsSpy}
          shouldRender={false}
        />
      </MemoryRouter>
    ).find(SimExchange);
    const showsDummy = component.containsMatchingElement(
      <strong>Coming soon...</strong>
    );

    simExchangeWallet.setProps({
      contracts: ['test'],
      contract: null
    });
    expect(showsDummy, 'Should render dummy text').to.be.true;
  });
});
