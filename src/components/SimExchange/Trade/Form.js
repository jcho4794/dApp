import React, { Component } from 'react';
import { Form, Input, Button, DatePicker } from 'antd';
import moment from 'moment';

const FormItem = Form.Item;

const types = {
  asks: 'Sell',
  bids: 'Buy'
};

class BuyForm extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.hasErrors = this.hasErrors.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.props.form.validateFields();
    }, 100);
  }

  handleSubmit(e) {
    const { form, market } = this.props;
    e.preventDefault();

    form.validateFields((err, values) => {
      if (!err) {
        this.props.showModal();
        this.props.onSubmit({
          ...values,
          market,
          ...types[this.props.type]
        });
      }
    });
  }

  hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

  render() {
    const { form, simExchange } = this.props;

    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched,
      getFieldsError
    } = form;

    const qtyError = isFieldTouched('qty') && getFieldError('qty');
    const priceError = isFieldTouched('price') && getFieldError('price');
    const expirationError =
      isFieldTouched('expirationTimestamp') &&
      getFieldError('expirationTimestamp');

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <h4 className="header">Quantity</h4>
          <FormItem
            validateStatus={qtyError ? 'error' : ''}
            help={qtyError || ''}
            className="m-bottom-15"
          >
            {getFieldDecorator('qty', {
              rules: [{ required: true, message: 'Please enter a quantity' }]
            })(
              <Input
                disabled={this.props.simExchange.contract === null}
                addonAfter=""
                min="0"
                step="0.01"
                type="number"
                placeholder="0"
                size="small"
              />
            )}
          </FormItem>

          <h4 className="header">Price</h4>
          <FormItem
            validateStatus={priceError ? 'error' : ''}
            help={priceError || ''}
            className="m-bottom-15"
          >
            {getFieldDecorator('price', {
              rules: [{ required: true, message: 'Please enter a price' }]
            })(
              <Input
                addonAfter={
                  simExchange.contract &&
                  simExchange.contract.COLLATERAL_TOKEN_SYMBOL
                }
                disabled={this.props.simExchange.contract === null}
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                size="small"
              />
            )}
          </FormItem>

          <h4 className="header">Expiration</h4>
          <FormItem
            validateStatus={expirationError ? 'error' : ''}
            help={expirationError || ''}
          >
            {getFieldDecorator('expirationTimestamp', {
              rules: [
                {
                  required: true,
                  message: 'Please select an expiration date and time.'
                }
              ]
            })(
              <DatePicker
                showTime
                disabledDate={current => {
                  const now = moment().startOf('day');
                  return (current && (current.valueOf() < now || current.diff(now, 'days') > 60));
                }}
                onChange={selectedDate => {
                  const now = moment();
                  return (selectedDate && selectedDate.isSameOrBefore(now) ? selectedDate.set(now.toObject()).add(60, 'm') : selectedDate);
                }}
                disabled={this.props.simExchange.contract === null}
                showToday={false}
                format="YYYY-MM-DD HH:mm:ss ([UTC/GMT]Z)"
                style={{ width: '100%' }}
                size="small"
              />
            )}
          </FormItem>

          <FormItem>
            <Button
              disabled={this.hasErrors(getFieldsError())}
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
              className="sim-ex-action-btn"
            >
              Place {types[this.props.type]} Order
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedForm = Form.create({
  mapPropsToFields({ order }) {
    return {
      qty: Form.createFormField({
        value: order.orderQty ? Math.abs(order.orderQty) : ''
      }),
      price: Form.createFormField({
        value: order.price
      }),
      expirationTimestamp: Form.createFormField({
        value: order.expirationTimestamp
          ? moment(
              order.expirationTimestamp,
              'YYYY-MM-DD HH:mm:ss ([UTC/GMT]Z)'
            )
          : moment().add(30, 'days')
      })
    };
  }
})(BuyForm);

export default WrappedForm;
