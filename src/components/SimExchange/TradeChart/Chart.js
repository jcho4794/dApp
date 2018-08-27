import React, { Component } from 'react';

import SectionHeader from '../SectionHeader';

class Chart extends Component {
  render() {
    return (
      <div className="sim-ex-container">
        <SectionHeader
          name="Trade Charts"
          tooltip="These charts help to visualize the current state of the market and the depth of orders."
        />
        <div className="sim-ex-inner-container">
          <p>Charts and stuff goes here</p>
        </div>
      </div>
    );
  }
}

export default Chart;
