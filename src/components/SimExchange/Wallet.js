import React, { Component } from 'react';
import { Tabs, Button, Tooltip, Icon } from 'antd';
import { MarketJS } from '../../util/marketjs/marketMiddleware';

import HeaderMenu from './Wallet/HeaderMenu';
import Table from './Wallet/Table';

import '../../less/SimExchange/Wallet.less';

const TabPane = Tabs.TabPane;

class Wallet extends Component {
  constructor(props) {
    super(props);

    this.onToggle = this.onToggle.bind(this);
    this.state = {
      walletCollapsed: false,
      toggleTitle: 'Hide Wallet',
      unallocatedCollateral: 0,
      availableCollateral: 0
    };
  }

  onToggle() {
    const toggleTitle = this.state.walletCollapsed
      ? 'Hide Wallet'
      : 'Show Wallet';
    this.setState({
      walletCollapsed: !this.state.walletCollapsed,
      toggleTitle
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.simExchange.contract !== prevProps.simExchange.contract &&
      this.props.simExchange.contract !== null
    ) {
      this.getBalances(this.props);
    }
  }

  componentDidMount() {
    this.props.simExchange.contract && this.getBalances(this.props);
  }

  async getBalances(props) {
    const { simExchange } = props;

    await MarketJS.getUserUnallocatedCollateralBalanceAsync(
      simExchange.contract,
      true
    ).then(balance => {
      this.setState({
        unallocatedCollateral: balance
      });
    });
    await MarketJS.getBalanceAsync(
      simExchange.contract.COLLATERAL_TOKEN_ADDRESS,
      true
    ).then(availableCollateral => {
      this.setState({ availableCollateral });
    });
  }

  render() {
    const contract = this.props.contract;
    return (
      <div className="sim-ex-container" id="wallet">
        {this.state.walletCollapsed ? (
          <div className="unallocated-collateral">
            <h2 style={{ fontWeight: '300', opacity: '0.7', fontSize: '18px' }}>
              Available for Trading
              <Tooltip title="This is your collateral balance">
                <Icon type="info-circle-o" className="info-icon" />
              </Tooltip>
            </h2>
            {contract && (
              <h1 className="zero-margin">
                {this.state.unallocatedCollateral}{' '}
                <span style={{ fontSize: '14px', opacity: '0.7' }}>
                  {contract.COLLATERAL_TOKEN_SYMBOL}
                </span>
              </h1>
            )}
          </div>
        ) : (
          <div>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Wallet" key="1">
                <HeaderMenu
                  unallocatedCollateral={this.state.unallocatedCollateral}
                  availableCollateral={this.state.availableCollateral}
                  {...this.props}
                />
              </TabPane>
              <TabPane tab="History" key="2">
                <Table {...this.props} />
              </TabPane>
            </Tabs>
          </div>
        )}
        <Button
          onClick={this.onToggle}
          htmlType="submit"
          style={{ width: '100%' }}
          className="sim-ex-toggle-btn "
        >
          {this.state.toggleTitle}
        </Button>
      </div>
    );
  }
}

export default Wallet;
