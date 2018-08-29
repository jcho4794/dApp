import React, { Component } from 'react';
import { Table } from 'antd';

import positionsColumns from './PositionColumns';
import { MarketJS } from '../../../util/marketjs/marketMiddleware';

class Positions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userPositions: []
    };
  }

  async componentDidUpdate(prevProps) {
    const { simExchange } = this.props;
    const web3 = this.props.web3.web3Instance;

    if (
      simExchange.contract &&
      (prevProps.simExchange.contract === null ||
        prevProps.simExchange.contract.key !== simExchange.contract.key)
    ) {
      await MarketJS.getUserPositionsAsync(
        simExchange.contract.key,
        web3.eth.coinbase,
        true,
        true
      ).then(userPositions => {
        console.log('getUserPositionsAsync', userPositions);

        this.setState({
          userPositions: userPositions
        });
      });
    }
  }

  async componentDidMount() {
    const { simExchange } = this.props;
    const web3 = this.props.web3.web3Instance;

    if (simExchange.contract) {
      await MarketJS.getUserPositionsAsync(
        simExchange.contract.key,
        web3.eth.coinbase,
        true,
        true
      )
        .then(userPositions => {
          console.log('getUserPositionsAsync', userPositions);

          this.setState({
            userPositions: userPositions
          });
        })
        .catch(err => {
          console.log('error', err);
        });
    }
  }

  render() {
    return (
      <Table
        dataSource={[]}
        columns={positionsColumns}
        pagination={false}
        scroll={{ y: 350 }}
      />
    );
  }
}

export default Positions;
