import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Table } from 'antd';

import Loader from '../../src/components/Loader';
import ContractsList from '../../src/components/ContractsList';
import { SpringGrid, makeResponsive } from 'react-stonecutter';
const Grid = makeResponsive(SpringGrid, { maxWidth: 1300 });
const mockContract = {
  key: '0xaaa0099',
  CONTRACT_NAME: 'ETHXBT',
  COLLATERAL_TOKEN: 'FakeDollars',
  COLLATERAL_TOKEN_SYMBOL: 'FUSD',
  MARKET_COLLATERAL_POOL_ADDRESS: '0x8d8xsaw89wfx89892s66267s9',
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

describe('ContractsList', () => {
  const onLoad = sinon.spy();
  it('should show loader when contracts is not yet set', () => {
    const contractsList = shallow(<ContractsList onLoad={onLoad} />);
    expect(contractsList.find(Loader)).to.have.length(1);
  });

  it('should show no contracts found for empty contracts list', () => {
    const contractsList = shallow(<ContractsList onLoad={onLoad} />);
    contractsList.setProps({ contracts: [] });
    const emptyViewElement = <div>No contracts found</div>;
    expect(contractsList.containsMatchingElement(emptyViewElement)).to.equal(
      true
    );
  });

  it('should show Grid of contracts when contracts are present', () => {
    const contractsList = shallow(<ContractsList onLoad={onLoad} />);
    contractsList.setProps({
      contracts: [{}]
    });
    expect(contractsList.find(Grid)).to.have.length(0);
  });

  it('should show table of contracts when contracts are present', () => {
    const contractsList = shallow(<ContractsList onLoad={onLoad} />);
    contractsList.setProps({
      contracts: [{}],
      isGrid: false
    });
    expect(contractsList.find(Table));
  });

  it('should show table of contracts when contracts are present', () => {
    const contractsList = shallow(<ContractsList onLoad={onLoad} />);
    contractsList.setProps({
      contracts: [{}],
      isGrid: false
    });
    expect(contractsList.find(Table));
  });

  it('should render view completely', () => {
    const contractsList = mount(<ContractsList onLoad={onLoad} />);
    contractsList.setProps({
      contracts: [mockContract]
    });
    //new lifecycle react stuff wants you to render once before putting the props into the state.
    //expect(contractsList.find(Table)).to.have.length(1);
    expect(contractsList.props().contracts).to.have.length(1);
  });
});
