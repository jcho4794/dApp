import { connect } from 'react-redux';

import withGAPageView from './GoogleAnalyticsTracker';
import DeployContractForm from '../components/DeployContract/DeployContractForm';

import { deployContract, resetDeploymentState } from '../actions/deploy';
import store from '../store';

const mapStateToProps = state => {
  const {
    contract,
    error,
    gas,
    loading,
    currentStep,
    contractDeploymentTxHash,
    collateralPoolDeploymentTxHash
  } = state.deploy;

  const { network } = state.web3;

  return {
    contract,
    error,
    gas,
    loading,
    network,
    currentStep,
    contractDeploymentTxHash,
    collateralPoolDeploymentTxHash
  };
};

const mapDispatchToProps = dispatch => {
  const { web3Instance } = store.getState().web3;

  return {
    onDeployContract: contractSpecs => {
      dispatch(
        deployContract(
        web3Instance,
        contractSpecs
        )
      );
    },
    onResetDeploymentState: preservations => {
      dispatch(resetDeploymentState(preservations));
    }
  };
};

const Deploy = withGAPageView(
  connect(mapStateToProps, mapDispatchToProps)(DeployContractForm)
);

export default Deploy;
