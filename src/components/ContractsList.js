import {
  Button,
  Col,
  Icon,
  Input,
  Popover,
  Row,
  Select,
  Table,
  Tooltip
} from 'antd';
import React, { Component } from 'react';
import moment from 'moment';

import Loader from './Loader';
import { copyTextToClipboard, formatedTimeFrom } from '../util/utils';
import { UseWeb3Switch } from './DevComponents';

// Styles
import '../less/ContractsList.less';

const Option = Select.Option;

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
    window.scrollTo(0, 0);
    this.setState({
      filters: filters,
      sort: sorter,
      page: pagination.current
    });
  };

  onInputChange = (e, searchKey) => {
    this.setState({ [searchKey]: e.target.value }, () => {
      this.onSearch(
        'CONTRACT_NAME',
        'CONTRACT_NAME_SEARCH_TEXT',
        'contractSearchVisible',
        'contractFiltered'
      );
    });
  };

  onSearch = (dataKey, searchKey, searchVisibleKey, filteredKey) => {
    const searchText = this.state[searchKey];
    const reg = new RegExp(searchText, 'gi');

    this.resetSearchFilter();

    let newContracts = this.props.contracts
      .map(record => {
        const match = record[dataKey].match(reg);
        return match ? record : null;
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
        sortOrder: sort.columnKey === 'CONTRACT_NAME' && sort.order,
        render: text => {
          return (
            <Tooltip
              placement="topLeft"
              overlayStyle={{ maxWidth: '350px' }}
              title={text}
            >
              {text}
            </Tooltip>
          );
        }
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
        },
        render: text => {
          return (
            <Tooltip placement="topLeft" title={text}>
              {text}
            </Tooltip>
          );
        }
      },
      {
        title: 'Symbol',
        dataIndex: 'COLLATERAL_TOKEN_SYMBOL',
        width: 150,
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
              <Button
                className="copyOrcaleQuery"
                onClick={() => copyTextToClipboard(record.ORACLE_QUERY)}
              >
                Copy Oracle Query
              </Button>
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
      />
    );

    this.table = table;

    if (this.state.contracts.length === 0) {
      table = <div>No contracts found</div>;
    }

    return (
      <div className="page contractPage" style={{ margin: '0 13%' }}>
        {process.env.NODE_ENV === 'development' && (
          <UseWeb3Switch onChange={this.props.onLoad} />
        )}
        <Row
          type="flex"
          justify="start"
          style={{ padding: '30px 20px' }}
          gutter={16}
        >
          <Col span={10}>
            <Input
              suffix={<Icon type="search" />}
              placeholder="Search Contract Name"
              value={this.state['CONTRACT_NAME_SEARCH_TEXT']}
              onChange={e => this.onInputChange(e, 'CONTRACT_NAME_SEARCH_TEXT')}
            />
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
