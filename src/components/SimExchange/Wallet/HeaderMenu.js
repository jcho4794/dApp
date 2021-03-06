import React, { Component } from 'react';
import { Row, Modal, Col, Tooltip, Icon } from 'antd';
import { MarketJS } from '../../../util/marketjs/marketMiddleware';

import Form from './Form';

class HeaderMenu extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleOk = this.handleOk.bind(this);

    this.state = {
      amount: {},
      transaction: {},
      unallocatedCollateral: this.props.unallocatedCollateral,
      availableCollateral: this.props.availableCollateral
    };
  }

  componentDidCatch(error, info) {
    console.log(error);
    console.log(info);
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.unallocatedCollateral !== prevProps.unallocatedCollateral ||
      this.state.availableCollateral !== prevProps.availableCollateral
    ) {
      this.setState({
        unallocatedCollateral: prevProps.unallocatedCollateral,
        availableCollateral: prevProps.availableCollateral
      });
    }
  }

  onSubmit(amount) {
    this.setState({ amount });
  }

  showModal() {
    this.setState({ modal: true });
  }

  handleCancel() {
    this.setState({ modal: false });
  }

  handleOk() {
    this.setState({ modal: false });
    const { amount } = this.state;
    switch (amount.type) {
      case 'deposit':
        MarketJS.depositCollateralAsync(amount);
        break;
      case 'withdraw':
        MarketJS.withdrawCollateralAsync(amount);
        break;
      default:
        break;
    }
  }

  getTruncatedAvailableCollateral(num) {
    return num.indexOf('.') > -1 ? num.slice(0, num.indexOf('.') + 3) : num;
  }

  render() {
    const { amount } = this.state;
    const { simExchange } = this.props;
    const contract = simExchange.contract;

    return (
      <Row className="header-menu">
        <Col span={24}>
          <div className="available-collateral">
            <div style={{ opacity: '0.7' }}>
              Available to Deposit
              <Tooltip title="This is the amount in your wallet that is currently available to deposit into the selected MARKET Protocol Smart Contract.">
                <Icon type="info-circle-o" className="info-icon" />
              </Tooltip>
            </div>
            {contract && (
              <div
                style={{ fontWeight: '500', opacity: '0.7', cursor: 'pointer' }}
              >
                <Tooltip
                  title={
                    this.state.availableCollateral +
                    ' ' +
                    contract.COLLATERAL_TOKEN_SYMBOL
                  }
                >
                  {this.getTruncatedAvailableCollateral(
                    this.state.availableCollateral.toString()
                  )}{' '}
                  {contract.COLLATERAL_TOKEN_SYMBOL}
                </Tooltip>
              </div>
            )}
          </div>
          <div className="unallocated-collateral">
            <h2 style={{ fontWeight: '300', opacity: '0.7', fontSize: '18px' }}>
              Available to Trade
              <Tooltip title="This is the amount of collateral you have available with to trade with in the selected MARKET Protocol Smart Contract.">
                <Icon type="info-circle-o" className="info-icon" />
              </Tooltip>
            </h2>
            {contract && (
              <h1>
                {this.state.unallocatedCollateral}{' '}
                <span style={{ fontSize: '14px', opacity: '0.7' }}>
                  {contract.COLLATERAL_TOKEN_SYMBOL}
                </span>
              </h1>
            )}
            <Form
              collateralToken={contract && contract.COLLATERAL_TOKEN_SYMBOL}
              onSubmit={this.onSubmit}
              showModal={this.showModal}
              amount={amount}
              className="deposit-withdraw-form"
            />
          </div>
        </Col>
        <Modal
          title="Confirmation required"
          visible={this.state.modal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="collateral-modal"
        >
          <h3>
            Are you sure you want to {amount && amount.type}{' '}
            {amount && amount.number}{' '}
            {contract && contract.COLLATERAL_TOKEN_SYMBOL}?
          </h3>
        </Modal>
      </Row>
    );
  }
}

export default HeaderMenu;
