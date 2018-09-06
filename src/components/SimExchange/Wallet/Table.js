import React, { Component, Fragment } from 'react';
import InputDataDecoder from 'ethereum-input-data-decoder';
import { abi } from '@marketprotocol/marketprotocol/build/contracts/MarketCollateralPool';

import { Table, Row } from 'antd';

import columns from './Columns';
import _ from 'lodash';

// Example Wallet History
/* const datasource = [
  {
    amount: '5000 USD',
    block: '2134123',
    network: 'rinkeby',
    details: {
      hash: '0xf5b80c91de0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de160a8'
    },
    addresses: {
      from:
        '0xf5b80c91de0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de160a8',
      to: '0xf5b80c91de0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de160a8'
    },
    inout: 'in',
    key: '0xf5b80c91de0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de160a8',
    type: 'deposit'
  },
  {
    amount: '2500 USD',
    block: '4134123',
    details: {
      hash:
        '0x12b80c91de0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de162438'
    },
    addresses: {
      from:
        '0xf5b80c91de0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de160a8',
      to: '0xf5b80c91de0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de160a8'
    },
    inout: 'out',
    key: '0xf5b80c9ase0a637d881d2e8b2158456fe4b030aeee0c4b062b575e375de160a8',
    type: 'withdraw'
  }
]; */

class BuyTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: 1,
      transactions: []
    };

    this.decoder = new InputDataDecoder(abi);
    this.fetchWalletHistory = this.fetchWalletHistory.bind(this);
  }

  componentDidMount() {
    const { simExchange } = this.props;

    if (simExchange.contract) {
      this.fetchWalletHistory();
    }
  }

  componentDidUpdate(prevProps) {
    const { simExchange } = this.props;

    if (
      simExchange.contract &&
      simExchange.contract !== prevProps.simExchange.contract
    ) {
      this.fetchWalletHistory();
    }
  }

  async fetchWalletHistory() {
    const { simExchange, web3 } = this.props;

    let filter = await web3.web3Instance.eth.filter({
      fromBlock: 0,
      toBlock: 'latest',
      address: simExchange.contract.key
    });

    await filter.get((error, transactions) => {
      let fetchedTransactions = [];

      transactions.forEach(transaction => {
        web3.web3Instance.eth.getTransaction(
          transaction.transactionHash,
          (error, response) => {
            const transactionInput = this.decoder.decodeData(response.input);

            if (
              response.from === web3.web3Instance.eth.coinbase ||
              response.to === web3.web3Instance.eth.coinbase
            ) {
              let payload = {
                key: response.blockHash,
                block: response.blockNumber,
                inout:
                  transactionInput.name === 'depositTokensForTrading'
                    ? 'in'
                    : 'out',
                type:
                  transactionInput.name === 'depositTokensForTrading'
                    ? 'deposit'
                    : 'withdraw',
                addresses: {
                  from:
                    transactionInput.name === 'depositTokensForTrading'
                      ? response.from
                      : response.to,
                  to:
                    transactionInput.name === 'depositTokensForTrading'
                      ? response.to
                      : response.from
                },
                amount: `${web3.web3Instance
                  .fromWei(transactionInput.inputs[0], 'ether')
                  .toString()} ${simExchange.contract.COLLATERAL_TOKEN_SYMBOL}`,
                details: {
                  hash: response.blockHash
                },
                network: web3.web3Instance.version.network
              };

              fetchedTransactions.push(payload);

              this.setState({
                transactions: _.uniq(fetchedTransactions)
              });
            }
          }
        );
      });
    });
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
