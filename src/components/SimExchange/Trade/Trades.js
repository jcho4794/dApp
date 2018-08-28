import React, { Component } from 'react';
import { Tabs } from 'antd';

import TradeContainer from './TradeContainer';
import { MarketJS } from '../../../util/marketjs/marketMiddleware';

import '../../../less/SimExchange/Trades.less';

const TabPane = Tabs.TabPane;

class Trades extends Component {
  constructor(props) {
    super(props);

    this.getUnallocatedCollateral = this.getUnallocatedCollateral.bind(this);

    this.state = {
      unallocatedCollateral: 0
    };
  }

  componentDidMount() {
    const { simExchange } = this.props;

    if (
      simExchange.contract !== null &&
      simExchange.contract.MARKET_COLLATERAL_POOL_ADDRESS
    ) {
      this.getUnallocatedCollateral(this.props);
    }
    this.setState({
      activeTab: 1
    });
  }

  componentDidUpdate(prevProps) {
    const oldContract = prevProps.simExchange.contract;
    const newContract = this.props.simExchange.contract;

    if (newContract !== oldContract && newContract !== null) {
      this.getUnallocatedCollateral(this.props);
    }
  }

  getUnallocatedCollateral(props) {
    const { simExchange } = props;

    if (simExchange) {
      MarketJS.getUserUnallocatedCollateralBalanceAsync(
        simExchange.contract,
        true
      ).then(balance => {
        this.setState({
          unallocatedCollateral: balance
        });
      });
    }
  }

  render() {
    const { buys, sells, contract } = this.state;

    return (
      <div
        id="trading"
        className={
          'sim-ex-container m-top-10' + (this.state.activeTab === 2 && ' sell')
        }
      >
        <Tabs
          defaultActiveKey="1"
          onChange={activeTab => this.setState({ activeTab })}
        >
          <TabPane tab="Buy" key="1">
            <div className="sim-ex-inner-container">
              <TradeContainer
                {...this.props}
                type="bids"
                market=""
                data={buys}
                contract={contract}
              />
            </div>
          </TabPane>
          <TabPane tab="Sell" key="2">
            <div className="sim-ex-inner-container">
              <TradeContainer
                {...this.props}
                type="asks"
                market=""
                data={sells}
                contract={contract}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Trades;
