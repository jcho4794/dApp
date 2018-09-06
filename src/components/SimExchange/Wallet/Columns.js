import React from 'react';
import { Button, Col, Icon, Popover, Row } from 'antd';
import {
  copyTextToClipboard,
  getEtherscanUrl,
  shortenAddress
} from '../../../util/utils';

export default [
  {
    title: 'Amount',
    key: 'amount',
    render: text => (
      <span className={`action-${text.type}`}>
        <Icon
          type={text.type === 'deposit' ? 'arrow-down' : 'arrow-up'}
          theme="outlined"
        />
        {text.amount}
      </span>
    )
  },
  {
    title: 'Tx Hash',
    key: 'txHash',
    render: text => <span>{shortenAddress(text.txHash)}</span>
  },
  {
    title: '',
    key: 'details',
    render: text => (
      <Popover
        content={
          <div>
            <Row
              style={{ padding: '14px' }}
              type="flex"
              justify="space-between"
            >
              <Col style={{ marginRight: '20px' }}>
                <div>Block # </div>
                <div>From </div>
                <div>To </div>
                <div>Tx Hash </div>
              </Col>
              <Col>
                <div>{text.blockNumber}</div>
                <div>
                  {shortenAddress(text.from)}
                  <Icon
                    className="copy-icon"
                    type="copy"
                    theme="filled"
                    onClick={() => copyTextToClipboard(text.from)}
                  />
                </div>
                <div>
                  {shortenAddress(text.to)}
                  <Icon
                    className="copy-icon"
                    type="copy"
                    theme="filled"
                    onClick={() => copyTextToClipboard(text.to)}
                  />
                </div>
                <div>
                  {shortenAddress(text.txHash)}
                  <Icon
                    className="copy-icon"
                    type="copy"
                    theme="filled"
                    onClick={() => copyTextToClipboard(text.txHash)}
                  />
                </div>
              </Col>
            </Row>
            <Button
              type="primary"
              className="popover-action"
              href={`${getEtherscanUrl(text.network)}/address/${text.txHash}`}
              target={'_blank'}
            >
              View in etherscan
            </Button>
          </div>
        }
        placement={'bottomLeft'}
        trigger="click"
      >
        <div className="dotdotdot">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </Popover>
    )
  }
];
