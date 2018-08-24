import { Form, Icon, Select, Popover } from 'antd';
import React from 'react';
import { getExchangeObj } from './ExchangeSources';

const FormItem = Form.Item;
const { Option } = Select;

export const Hint = props => (
  <Popover
    content={props.hint}
    title={'More about `' + props.hintTitle + '`'}
    trigger="click"
  >
    <Icon type="question-circle-o" style={{ cursor: 'pointer' }} />
  </Popover>
);

class SelectTokenField extends React.Component {
  constructor() {
    super();
    this.state = {
      pairs: [],
      quotes: ['ETH', 'USDT']
    };
    this.updateList = this.updateList.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.exchange !== prevProps.exchange) {
      this.setState({ pairs: [] });
      this.props.onSelect({
        contractName: '',
        oracleQuery: '',
        quoteAsset: '',
        priceDecimalPlaces: '',
        priceCap: '',
        priceFloor: '',
        price: '',
        qtyMultiplier: '',
        oracleDataSource: ''
      });
      getExchangeObj(this.props.exchange)
        .fetchList(this.state.quotes)
        .subscribe(this.updateList);
    }
  }

  updateList(symbols) {
    this.setState({ pairs: symbols });
  }

  handleSelect(e) {
    const exchange = getExchangeObj(this.props.exchange);
    const symbol = this.state.pairs[e];
    if (exchange.getPrice) {
      const onSelect = this.onSelect;
      exchange.getPrice(symbol.symbol).subscribe(price => {
        symbol.price = price;
        onSelect(symbol, exchange);
      });
    } else {
      this.onSelect(symbol, exchange);
    }
  }

  onSelect(symbol, exchange) {
    this.props.onSelect({
      contractName: '',
      symbolName: symbol.symbol,
      quoteAsset: symbol.quoteAsset,
      oracleQuery: exchange.genOracleQuery(symbol),
      price: symbol.price * 1.0, // force number
      priceDecimalPlaces: symbol.priceDecimalPlaces,
      priceCapSimplified: symbol.price * 1.5,
      priceFloorSimplified: symbol.price * 0.5,
      qtyMultiplier: 10 ** (18 - symbol.priceDecimalPlaces),
      oracleDataSource: 'URL'
    });
  }

  componentDidMount() {
    getExchangeObj(this.props.exchange)
      .fetchList(this.state.quotes)
      .subscribe(this.updateList);
  }

  render() {
    const { name, form, initialValue, showHint, hideLabel } = this.props;
    const { getFieldDecorator } = form;
    const fieldSettings = {
      label: 'Select ETH or USDT based pair',
      extra: 'Available ETH or USDT based pairs from exchange'
    };

    const rules = [
      {
        required: true,
        message: 'Please select a token pairs'
      }
    ];
    const label = (
      <span>
        {!hideLabel && fieldSettings.label}{' '}
        {showHint && (
          <Hint hint={fieldSettings.extra} hintTitle={fieldSettings.label} />
        )}
      </span>
    );
    return (
      <FormItem label={label}>
        {getFieldDecorator(name, {
          initialValue,
          rules
        })(
          <Select
            showSearch={true}
            defaultActiveFirstOption={false}
            allowClear={true}
            onSelect={this.handleSelect}
            optionFilterProp="children"
            filterOption={function(inputValue, option) {
              return (
                option.props.children.indexOf(inputValue.toUpperCase()) >= 0
              );
            }}
          >
            {this.state.pairs.map(
              (symbol, index) =>
                symbol.quoteAsset ===
                  form.getFieldValue('tokenPairOptions') && (
                  <Option key={index} value={index}>
                    {symbol.symbol}
                  </Option>
                )
            )}
          </Select>
        )}
      </FormItem>
    );
  }
}

export default SelectTokenField;
