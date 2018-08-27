import React, { Fragment } from 'react';
import { Checkbox, Icon, Popover } from 'antd';

// Exports components that are only required for development

/**
 * To switch between web3 or market api for loading stuffs
 * Only shows in development environment and should be used to
 * make development easier.
 *
 */
export function UseWeb3Switch({ onChange }) {
  return process.env.NODE_ENV === 'development' ? (
    <Checkbox onChange={e => onChange(e.target.checked)}>
      Load contracts from Web3{' '}
      <Popover content="Use for direct on-chain testing. Will load contracts from Web3 and not Market API">
        <Icon type="info-circle" />
      </Popover>
    </Checkbox>
  ) : (
    <Fragment />
  );
}
