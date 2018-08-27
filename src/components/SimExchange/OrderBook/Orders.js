import React, { Component } from 'react';
import { Table } from 'antd';

import columns from './Columns';
import SectionHeader from '../SectionHeader';
import { marketAPI, Path } from '../../../util/marketAPI';

class Orders extends Component {
  constructor(props) {
    super(props);

    this.getOrders = this.getOrders.bind(this);

    this.state = {
      bids: [],
      asks: [],
      contract: {}
    };
  }

  componentDidMount() {
    const { simExchange } = this.props;
    if (simExchange.contract !== null && simExchange.contract.key) {
      this.getOrders(simExchange.contract.key);
    }
  }

  componentDidUpdate(prevProps) {
    const oldContract = prevProps.simExchange.contract;
    const newContract = this.props.simExchange.contract;

    if (newContract !== oldContract && newContract !== null) {
      this.getOrders(newContract.key);
    }
  }

  getOrders(contractAddress) {
    marketAPI.get(Path.Orders(contractAddress)).then(
      function(response) {
        this.setState({
          bids: response.bids,
          asks: response.asks,
          contract: response.contract
        });
      }.bind(this)
    );
  }

  render() {
    return (
      <div className="sim-ex-container">
        <SectionHeader name="Order Book" tooltip="This is your Order Book" />
        <Table
          rowKey={this.state.contract.key}
          dataSource={this.state.bids}
          columns={columns}
          scroll={{ y: 700 }}
          pagination={false}
        />
      </div>
    );
  }
}

export default Orders;
