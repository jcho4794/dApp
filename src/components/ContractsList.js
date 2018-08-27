import { Col, Checkbox, Input, Row, Table, Select, Popover, Icon } from 'antd';
import { formatedTimeFrom } from '../util/utils';
import React, { Component } from 'react';

import '../less/ContractsList.less';
import Loader from './Loader';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import moment from 'moment';
const Search = Input.Search;
// Example Contract
/* {
  "COLLATERAL_TOKEN": "0xa4392264a2d8c998901d10c154c91725b1bf0158",
  "CONTRACT_NAME": "ETHXBT",
  "ORACLE_QUERY": "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0",
  "PRICE_CAP": "60465",
  "PRICE_DECIMAL_PLACES": "2",
  "PRICE_FLOOR": "20155",
  "QTY_MULTIPLIER": "10",
  "collateralPoolBalance": "0",
  "isSettled": true,
  "lastPrice": "105700"
} */
const Option = Select.Option;
class ContractsList extends Component {
  state = {
    filters: null,
    sort: { columnKey: 'CONTRACT_NAME', order: 'descend' },
    contracts: this.props.contracts,
    page: 1,
    pageSize: 25,
    selectedContractFilter: 'All Contracts',
    allContractsFilters: {
      'All Contracts': contract => contract,
      'High Balance': contract => contract.collateralPoolBalance > 0.5,
      'Expiring Soon': contract =>
        moment.unix(contract.EXPIRATION).isBefore(moment().add(7, 'd'))
    }
  };

  componentDidMount() {
    if (!this.props.contracts) {
      this.props.onLoad(false);
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.contracts !== prevProps.contracts) {
      this.setState({ contracts: this.props.contracts });
    }
  }

  resetSearchFilter() {
    this.setState({
      contractFiltered: false,
      tokenFiltered: false,
      oracleFiltered: false
    });
  }

  handleChange = (pagination, filters, sorter) => {
    console.log(pagination);
    this.setState({
      filters: filters,
      sort: sorter,
      page: pagination.current
    });
  };

  onInputChange = (e, searchKey) => {
    this.setState({ [searchKey]: e.target.value });
  };

  onSearch = (dataKey, searchKey, searchVisibleKey, filteredKey) => {
    const searchText = this.state[searchKey];
    const reg = new RegExp(searchText, 'gi');
    this.resetSearchFilter();
    let newContracts = this.props.contracts
      .map(record => {
        const match = record[dataKey].match(reg);
        if (!match) {
          console.log(reg, record[dataKey]);
          return null;
        }
        return record;
      })
      .filter(record => !!record)
      .filter(
        this.state.allContractsFilters[this.state.selectedContractFilter]
      );
    this.setState({
      [searchVisibleKey]: false,
      [filteredKey]: !!searchText,
      contracts: newContracts
    });
  };

  render() {
    let { sort, filters, contracts } = this.state;
    sort = sort || {};
    filters = filters || {};
    contracts = contracts || [];
    let pageInfo =
      this.state.page +
      '-' +
      Math.min(this.state.page * this.state.pageSize, contracts.length) +
      ' of ' +
      contracts.length.toLocaleString();

    let customSort = (text, columnKey) => {
      let icon = '';
      let newOrder = 'descend';
      if (sort.columnKey === columnKey) {
        icon = (
          <Icon
            className={'custom-sort-arrow custom-sort-arrow-' + sort.order}
            type={'caret-' + (sort.order === 'ascend' ? 'up' : 'down')}
          />
        );
        newOrder = sort.order === 'ascend' ? 'descend' : 'ascend';
      }
      return (
        <span
          role="button"
          tabIndex="0"
          style={{ outline: 'none', userSelect: 'none', width: '100%' }}
          onKeyPress={e => {}}
          onClick={() => {
            var newsort = { columnKey: columnKey, order: newOrder };
            this.setState({ sort: newsort });
          }}
        >
          {text} {icon}
        </span>
      );
    };
    let collateralTokenSymbols = [
      ...new Set(contracts.map(item => item.COLLATERAL_TOKEN_SYMBOL))
    ].map(item => {
      return { value: item, text: item };
    });
    const columns = [
      {
        title: customSort('Name', 'CONTRACT_NAME'),
        dataIndex: 'CONTRACT_NAME',
        width: 200,
        sorter: (a, b) => {
          return a.CONTRACT_NAME.localeCompare(b.CONTRACT_NAME);
        },
        sortOrder: sort.columnKey === 'CONTRACT_NAME' && sort.order
      },
      {
        title: 'Base Token',
        dataIndex: 'COLLATERAL_TOKEN',
        width: 150,

        tokenSearchVisible: this.state.tokenSearchVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState(
            {
              tokenSearchVisible: visible
            },
            () =>
              this.collateralTokenSearchInput &&
              this.collateralTokenSearchInput.focus()
          );
        }
      },
      {
        title: 'Symbol',
        dataIndex: 'COLLATERAL_TOKEN_SYMBOL',
        width: 150,

        render: (text, row, index) => {
          return text;
        },

        filteredValue: filters.COLLATERAL_TOKEN_SYMBOL || null,
        onFilter: (value, record) => record.COLLATERAL_TOKEN_SYMBOL === value
      },
      {
        title: 'Oracle Query',
        dataIndex: 'ORACLE_QUERY',
        width: 300,
        oracleSearchVisible: this.state.oracleSearchVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState(
            {
              oracleSearchVisible: visible
            },
            () =>
              this.oracleQuerySearchInput && this.oracleQuerySearchInput.focus()
          );
        }
      },

      {
        title: customSort('Balance', 'collateralPoolBalance'),
        dataIndex: 'collateralPoolBalance',
        width: 150,

        sorter: (a, b) => a.collateralPoolBalance - b.collateralPoolBalance,
        sortOrder: sort.columnKey === 'collateralPoolBalance' && sort.order
      },
      {
        title: customSort('Expiration', 'EXPIRATION'),
        dataIndex: 'EXPIRATION',
        width: 200,
        render: (text, row, index) => {
          let formatedTime = formatedTimeFrom(text);
          return formatedTime.includes('s') ? (
            <span style={{ color: '#E41640' }}>{formatedTime}</span>
          ) : (
            formatedTime
          );
        },
        sorter: (a, b) => a.EXPIRATION - b.EXPIRATION,
        sortOrder: sort.columnKey === 'EXPIRATION' && sort.order
      },
      {
        title: '',
        render: (text, record, index) => {
          let rowrender = (
            <div>
              <Row style={{ padding: '14px' }}>
                <Col>
                  <strong>Address </strong> {record.key}
                </Col>
                <Col>
                  <strong>Token </strong> {record.COLLATERAL_TOKEN_ADDRESS}
                </Col>
                <Col>
                  <strong>Price Cap </strong> {record.PRICE_CAP}
                </Col>
                <Col>
                  <strong>Price Decimal Places </strong>{' '}
                  {record.PRICE_DECIMAL_PLACES}
                </Col>
                <Col>
                  <strong>Qty Multiplier </strong> {record.QTY_MULTIPLIER}
                </Col>
                <Col>
                  <strong>Price Floor </strong> {record.PRICE_FLOOR}
                </Col>
                <Col>
                  <strong>Last Price </strong> {record.lastPrice}
                </Col>
              </Row>
              <CopyToClipboard text={record.ORACLE_QUERY}>
                <button className="copyOrcaleQuery">Copy Orcale Query</button>
              </CopyToClipboard>
            </div>
          );
          return (
            <Popover
              overlayClassName={'contractPopOver'}
              content={rowrender}
              placement={'bottomLeft'}
              trigger="click"
            >
              <div role="button" className="dotdotdot" tabIndex="0">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </Popover>
          );
        }
      }
    ];

    if (!this.state.contracts) {
      return <Loader />;
    }
    let table = (
      <Table
        columns={columns}
        dataSource={this.state.contracts}
        onChange={this.handleChange}
        pagination={{ pageSize: this.state.pageSize }}
        ref="table"
        // scroll={{ y: '60vh' }}
      />
    );
    this.table = table;
    if (this.state.contracts.length === 0) {
      table = <div>No contracts found</div>;
    }

    return (
      <div className="page contractPage" style={{ margin: '0 13%' }}>
        {process.env.NODE_ENV === 'development' && (
          <Row type="flex" justify="start" style={{ padding: '0px 20px' }}>
            <Checkbox onChange={e => this.props.onLoad(e.target.checked)}>
              Load contracts from Web3 (Use for direct on-chain testing)
            </Checkbox>
          </Row>
        )}
        <Row
          type="flex"
          justify="start"
          style={{ padding: '30px 20px' }}
          gutter={16}
        >
          <Col span={10}>
            <div>
              <Search
                ref={ele => (this.contractNameSearchInput = ele)}
                placeholder="Search Contract Name"
                value={this.state['CONTRACT_NAME_SEARCH_TEXT']}
                onChange={e =>
                  this.onInputChange(e, 'CONTRACT_NAME_SEARCH_TEXT')
                }
                onPressEnter={() =>
                  this.onSearch(
                    'CONTRACT_NAME',
                    'CONTRACT_NAME_SEARCH_TEXT',
                    'contractSearchVisible',
                    'contractFiltered'
                  )
                }
              />
            </div>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="All Contracts"
              showArrow={true}
              optionFilterProp="children"
              onChange={value => {
                this.setState({ selectedContractFilter: value }, () => {
                  this.onSearch(
                    'CONTRACT_NAME',
                    'CONTRACT_NAME_SEARCH_TEXT',
                    'contractSearchVisible',
                    'contractFiltered'
                  );
                });
              }}
            >
              {Object.keys(this.state.allContractsFilters).map(e => (
                <Option key={'filterOption' + e} value={e}>
                  {e}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="All Tokens"
              showArrow={true}
              optionFilterProp="children"
              onChange={values =>
                this.setState({ filters: { COLLATERAL_TOKEN_SYMBOL: values } })
              }
            >
              {collateralTokenSymbols.map(e => (
                <Option key={e.value} value={e.value}>
                  {e.text}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <style
          dangerouslySetInnerHTML={{
            __html:
              `
          .ant-pagination-prev:after {
            content:"` +
              pageInfo +
              `"
          }
        `
          }}
        />

        <Row style={{ padding: '0px 20px' }}>{table}</Row>
      </div>
    );
  }
}

export default ContractsList;
