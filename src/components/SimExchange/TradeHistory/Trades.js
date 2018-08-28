import React, { Component } from 'react';
import { Table } from 'antd';

import columns from './Columns';
import SectionHeader from '../SectionHeader';

import { MarketJS } from '../../../util/marketjs/marketMiddleware';

class Trades extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tradeHistory: []
    };
  }

  async componentDidUpdate(prevProps) {
    const { simExchange } = this.props;

    if (
      simExchange.contract &&
      (prevProps.simExchange.contract === null ||
        prevProps.simExchange.contract.key !== simExchange.contract.key)
    ) {
      await MarketJS.getContractFillsAsync(simExchange.contract.key).then(
        res => {
          console.log('getContractFillsAsync', res);
        }
      );
    }
  }

  render() {
    return (
      <div className="sim-ex-container">
        <SectionHeader
          name="Trade History"
          tooltip="All transactions for the selected MARKET Protocol Smart Contract are shown here."
        />
        <Table
          dataSource={this.state.tradeHistory}
          columns={columns}
          pagination={false}
          scroll={{ y: 700 }}
        />
      </div>
    );
  }
}

export default Trades;
