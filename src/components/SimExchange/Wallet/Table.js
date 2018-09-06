import React, { Component, Fragment } from 'react';

import { Table, Row } from 'antd';

import columns from './Columns';

import { MarketJS } from '../../../util/marketjs/marketMiddleware';

class BuyTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: 1,
      transactions: []
    };
  }

  componentDidMount() {
    const { simExchange } = this.props;

    if (simExchange.contract) {
      MarketJS.getCollateralEventsAsync(
        simExchange.contract.key,
        0,
        'latest',
        this.props.web3.web3Instance.eth.coinbase
      ).then(transactions => {
        this.setState({
          transactions: transactions
        });
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { simExchange } = this.props;

    if (
      simExchange.contract &&
      simExchange.contract !== prevProps.simExchange.contract
    ) {
      MarketJS.getCollateralEventsAsync(
        simExchange.contract.key,
        0,
        'latest',
        this.props.web3.web3Instance.eth.coinbase
      ).then(transactions => {
        this.setState({
          transactions: transactions
        });
      });
    }
  }

  render() {
    return (
      <Fragment>
        <Row>
          <Table
            dataSource={this.state.transactions}
            columns={columns}
            pagination={false}
            scroll={{ y: 250 }}
          />
        </Row>
      </Fragment>
    );
  }
}

export default BuyTable;
