import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Form } from 'antd';
import moment from 'moment';

import QuickDeployment from '../../../src/components/DeployContract/QuickDeployment';

function validContractFields() {
  return {
    contractName: { value: 'ABA' },
    collateralTokenAddress: { value: '0x33333' },
    priceFloor: { value: 0 },
    priceCap: { value: 50 },
    priceDecimalPlaces: { value: 2 },
    qtyMultiplier: { value: 2 },
    expirationTimeStamp: { value: moment().add(1, 'days') }, // always in the future
    oracleDataSource: { value: 'URL' },
    oracleQuery: {
      value: 'json(https://api.gdax.com/products/BTC-USD/ticker).price'
    },
    oracleQueryRepeatSeconds: { value: 86400 }
  };
}

describe('QuickDeployment', () => {
  let quickDeployment;
  let wrappedFormRef;
  let switchModeSpy;
  let onDeploySpy;
  let successMessageSpy;
  let errorMessageSpy;

  beforeEach(() => {
    switchModeSpy = sinon.spy();
    onDeploySpy = sinon.spy();
    successMessageSpy = sinon.spy();
    errorMessageSpy = sinon.spy();
    quickDeployment = mount(
      <QuickDeployment
        initialValues={{}}
        switchMode={switchModeSpy}
        showErrorMessage={errorMessageSpy}
        showSuccessMessage={successMessageSpy}
        onDeployContract={onDeploySpy}
        wrappedComponentRef={inst => (wrappedFormRef = inst)}
      />
    );
  });

  it('should render', () => {
    mount(<QuickDeployment initialValues={{}} />);
  });

  it('should switch mode to guided when switch-mode-link is clicked', () => {
    quickDeployment.find('.switch-mode-link').simulate('click');
    expect(switchModeSpy.calledWith('guided')).to.equal(true);
  });

  it('should showSuccessMessage when contract is created', () => {
    quickDeployment.setProps({ error: null, loading: true, contract: null });
    expect(successMessageSpy).to.have.property('callCount', 0);
    quickDeployment.setProps({
      error: null,
      loading: false,
      contract: {
        address: '0x00000'
      }
    });
    expect(successMessageSpy).to.have.property('callCount', 1);
  });

  it('should showErrorMessage when error occurs', () => {
    quickDeployment.setProps({ error: null, loading: true });
    expect(errorMessageSpy).to.have.property('callCount', 0);
    quickDeployment.setProps({ error: 'Error occured', loading: false });
    expect(errorMessageSpy).to.have.property('callCount', 1);
  });

  it('should disable submit if component is loading', () => {
    quickDeployment.setProps({
      loading: true
    });
    const submitButton = quickDeployment.find('.submit-button').first();
    expect(submitButton.prop('disabled')).to.equal(true);
  });

  it('should disable submit if fields have errors', () => {
    wrappedFormRef.props.form.setFields({
      contractName: {
        value: '',
        errors: [new Error('No name')]
      }
    });
    quickDeployment.setProps({
      loading: false
    });
    const submitButton = quickDeployment.find('.submit-button').first();
    expect(submitButton.prop('disabled')).to.equal(true);
  });

  it('should enable submit button if component is not loading and no errors', () => {
    // no errors are set by default on the form
    quickDeployment.setProps({
      loading: false
    });

    const submitButton = quickDeployment.find('.submit-button').first();
    expect(submitButton.prop('disabled')).to.equal(false);
  });

  it('should hide the overlay when is not loading', () => {
    quickDeployment.setProps({
      loading: false
    });

    const overlay = quickDeployment.find('.ant-spin');
    expect(overlay).to.have.length(0);
  });

  it('should disable past dates in expiration date picker, but allow current date', () => {
    const pastDate = moment()
      .subtract(1, 'days')
      .format('MMMM D, YYYY');
    const futureDate = moment()
      .add(1, 'days')
      .format('MMMM D, YYYY');
    const currentDate = moment().format('MMMM D, YYYY');

    quickDeployment.find('span#expirationTimeStamp input').simulate('click');

    expect(
      quickDeployment
        .find('span#expirationTimeStamp')
        .find(`td[title="${pastDate}"]`)
        .find('.ant-calendar-date')
        .prop('aria-disabled')
    ).to.equal(true);

    expect(
      quickDeployment
        .find('span#expirationTimeStamp')
        .find(`td[title="${currentDate}"]`)
        .find('.ant-calendar-date')
        .prop('aria-disabled')
    ).to.equal(false);

    expect(
      quickDeployment
        .find('span#expirationTimeStamp')
        .find(`td[title="${futureDate}"]`)
        .find('.ant-calendar-date')
        .prop('aria-disabled')
    ).to.equal(false);
  });

  it('should add 60 minutes to the time when the current date is selected', () => {
    const dateSelected = moment().format('MMMM D, YYYY');
    const currentDateFormated = moment().add(60, 'm').format('YYYY-MM-DD HH:mm:ss');

    quickDeployment.find('span#expirationTimeStamp input').simulate('click');

    quickDeployment
      .find('span#expirationTimeStamp')
      .find(`td[title="${dateSelected}"]`)
      .simulate('click');

    // Do to there being a little bit of lag from the moment the simulated click happens and the dateSelected
    // variable receives it's value, we will expect the time to be valid up to the minute instead of second
    expect(
      moment(quickDeployment.find('.ant-calendar-picker-input').prop('value')).format("HH:mm")
    ).to.equal(moment(currentDateFormated).format('HH:mm'));
  });

  /*it('should disable dates more than 60 from today in expiration date picker', () => {
    const invalidExpiryDate = moment()
      .add(61, 'days')
      .format('MMMM D, YYYY');
    const validExpiryDate = moment()
      .add(60, 'days')
      .format('MMMM D, YYYY');

    quickDeployment.find('span#expirationTimeStamp input').simulate('click');

    quickDeployment
      .find('span#expirationTimeStamp')
      .find('.ant-calendar-next-month-btn')
      .simulate('click');
    quickDeployment
      .find('span#expirationTimeStamp')
      .find('.ant-calendar-next-month-btn')
      .simulate('click');

    expect(
      quickDeployment
        .find('span#expirationTimeStamp')
        .find(`td[title="${invalidExpiryDate}"]`)
        .find('.ant-calendar-date')
        .prop('aria-disabled')
    ).to.equal(true);

    expect(
      quickDeployment
        .find('span#expirationTimeStamp')
        .find(`td[title="${validExpiryDate}"]`)
        .find('.ant-calendar-date')
        .prop('aria-disabled')
    ).to.equal(false);
  });*/

  it('should format the local date with utc', () => {
    const dateSelected = moment().add(2, 'days').format('MMMM D, YYYY');
    const dateFormated = moment().add(2, 'days').format('YYYY-MM-DD HH:mm:ss');

    quickDeployment.find('span#expirationTimeStamp input').simulate('click');

    quickDeployment
      .find('span#expirationTimeStamp')
      .find(`td[title="${dateSelected}"]`)
      .simulate('click');

    // Do to there being a little bit of lag from the moment the simulated click happens and the dateSelected
    // variable receives it's value, we will expect the time to be valid up to the minute instead of second
    expect(
      moment(quickDeployment.find('.ant-calendar-picker-input').prop('value')).format("YYYY-MM-DD HH:mm")
    ).to.equal(moment(dateFormated).format("YYYY-MM-DD HH:mm"));
  });

  it('should call onDeployContract with form values when submitted', () => {
    wrappedFormRef.props.form.setFields(validContractFields());

    quickDeployment
      .find(Form)
      .first()
      .simulate('submit', { preventDefault() {} });
    expect(onDeploySpy).to.have.property('callCount', 1);
    // TODO: Test the values passed to onDeployContract
  });

  it('should not call onDeployContract when form is invalid.', () => {
    wrappedFormRef.props.form.setFields({
      contractName: {
        value: '',
        errors: [new Error('No name set')]
      }
    });

    quickDeployment
      .find(Form)
      .first()
      .simulate('submit', { preventDefault() {} });
    expect(onDeploySpy).to.have.property('callCount', 0);
  });
});
