import React, { Component } from 'react';
import { Button, Col, Dropdown, Icon, Menu, Row } from 'antd';
import _ from 'lodash';

import Loader from '../Loader';
import { formatedTimeFrom } from '../../util/utils';

import volume from '../../img/icons/24hr_volume.svg';
import contractIcon from '../../img/icons/contract.svg';

class TopBar extends Component {
  render() {
    const { contract, contracts } = this.props;
    let validContracts = _.filter(contracts, contract => {
      return contract.isSettled === false;
    });

    console.log('validContracts', validContracts);

    const menu = (
      <Menu onClick={e => this.props.onSelectContract(e.item.props.contract)}>
        {validContracts &&
          validContracts.map(c => (
            <Menu.Item key={c.key} contract={c}>
              {c.CONTRACT_NAME}
            </Menu.Item>
          ))}
      </Menu>
    );

    return (
      <div style={{ width: '100%' }}>
        {contracts && (
          <Row type="flex" justify="space-between">
            <Col lg={6} xl={5}>
              <img alt="contract" src={contractIcon} />
              <Dropdown overlay={menu}>
                <Button>
                  {contract ? contract.CONTRACT_NAME : 'Contracts'}{' '}
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </Col>
            <Col span={12} className="contract-meta-data">
              <p style={{ fontWeight: '500' }}>
                <img
                  alt="24hrVolume"
                  src={volume}
                  className="contract-data-icons"
                />
                <span
                  style={{
                    opacity: '0.7',
                    marginRight: '10px',
                    fontWeight: '300'
                  }}
                >
                  Expiration:
                </span>
                {contract ? formatedTimeFrom(contract.EXPIRATION) : 0}
              </p>
            </Col>
          </Row>
        )}
        {!contracts && (
          <Row type="flex" justify="center" align="middle">
            <Loader message="Loading Contracts, Please Wait..." />
          </Row>
        )}
      </div>
    );
  }
}

export default TopBar;
