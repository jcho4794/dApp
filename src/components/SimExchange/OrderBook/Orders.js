import React, { Component } from 'react';
import { Table } from 'antd';

import columns from './Columns';
import SectionHeader from '../SectionHeader';

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
    fetch(`https://dev.api.marketprotocol.io/orders/${contractAddress}/`)
      .then(function(response) {
        return response.json();
      })
      .then(
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
        <div className="sim-ex-inner-container" style={{ paddingTop: '0' }}>
          <Table
            rowKey={this.state.contract.key}
            dataSource={this.state.bids}
            columns={columns}
            scroll={{ y: 600 }}
            pagination={{ pageSize: 25 }}
          />
        </div>
      </div>
    );
  }
}

export default Orders;
