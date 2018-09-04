import { connect } from 'react-redux';

import store from '../store';
import Contracts from '../Contracts.js';

import withGAPageView from './GoogleAnalyticsTracker';
import SimExchangeComponent from '../components/SimExchange/SimExchange';

import { loadContracts } from '../actions/explorer';
import CreateInitializer, {
  contractConstructor
} from '../util/web3/contractInitializer';
import {
  processContractsList,
  processAPIContractsList
} from '../util/contracts';
import { selectContract } from '../actions/simExchange';
import { marketAPI } from '../util/marketAPI';

const mapStateToProps = state => ({
  contracts: state.explorer.contracts,
  simExchange: state.simExchange,
  web3: state.web3,
  marketjs: state.marketjs,
  shouldRender: true,
  ...state.simExchange
});

const mapDispatchToProps = dispatch => ({
  getContracts: fromWeb3 => {
    const web3 = store.getState().web3.web3Instance;
    const contracts = CreateInitializer(contractConstructor.bind(null, web3))(
      Contracts
    );

    const loadContractParams = {
      processContracts: processAPIContractsList,
      marketAPI
    };

    if (fromWeb3) {
      loadContractParams.web3 = web3;
      loadContractParams.processContracts = processContractsList.bind(
        null,
        contracts.MarketContract,
        contracts.MarketCollateralPool,
        contracts.CollateralToken,
        contracts.ERC20
      );
    }

    dispatch(
      loadContracts(loadContractParams, {
        MarketContractRegistry: contracts.MarketContractRegistry,
        CollateralToken: contracts.CollateralToken
      })
    );
  },
  selectContract: contract => dispatch(selectContract({ contract }))
});

const SimExchange = withGAPageView(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SimExchangeComponent)
);

export default SimExchange;
