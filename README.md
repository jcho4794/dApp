<img src="https://github.com/MARKETProtocol/dApp/blob/master/src/img/MARKETProtocol-Light.png?raw=true" align="middle">

[![Build Status](https://api.travis-ci.org/MARKETProtocol/dApp.svg?branch=master)](https://travis-ci.org/MARKETProtocol/dApp) [![Coverage Status](https://coveralls.io/repos/github/MARKETProtocol/dApp/badge.svg?branch=master)](https://coveralls.io/github/MARKETProtocol/dApp?branch=master)

MARKET Protocol has been created to provide a secure, flexible, open source foundation for decentralized trading on the Ethereum blockchain. We provide the pieces necessary to create a decentralized exchange, including the requisite clearing and collateral pool infrastructure, enabling third parties to build applications for trading.

# dApp
[MARKET Protocol's](https://marketprotocol.io/) main decentralized application.

Take a look at our [docs](https://docs.marketprotocol.io) for a little more explanation.

Join our [Discord Community](https://marketprotocol.io/discord) to interact with members of our dev staff and other contributors.

## Getting Started
A Makefile is provided for easy setup of the local development environment.

Some pre-requisites are required in order to utilize the Makefile.

NodeJS 8.11.2 LTS is recommended for compatibility.

```
$ git clone https://github.com/MARKETProtocol/dApp.git  # clone this repository
$ git clone https://github.com/MARKETProtocol/ethereum-bridge.git # and the needed oraclize.it bridge (for local test rpc)
```

From here you will be able to use make commands assuming npm is already installed.

Assuming you have npm already, Install truffle
```
$ make install_truffle # may require sudo
```

Install needed dependencies.  If this fails on your ubuntu install it may require you to run `sudo apt-get install build-essential -y` prior to install.
```
$ make install_deps
```

You now have the option of running the dApp connected to rinkeby, or bringing up a fully localized test environment

### Option 1 - rinkeby test net deployment

This is easiest way to get things running, but will require test ether ([available here for free](https://faucet.rinkeby.io/)) to fuel any transactions.
```
$ make start_dapp_rinkeby
```

### Option 2A - local test rpc without docker

This option requires a few extra steps, but is fully localized and can be a much easier dev environment if working on transactions to the ethereum block chain.

You can start the truffle development environment and console
```
$ make start_console
```

From here, in a separate console we now need to bring up the ethereum bridge for the Oraclize.it service.
```
$ make start_bridge
```

Once the bridge has fully initialized, you should be able to run the example migrations for the MARKET Protocol smart contracts.
```
truffle(develop)> migrate
```
If this fails due to a `revert`, please be sure the bridge is listening prior to attempting the migration.

At this point we should be able to run the dApp locally

```
$ make start_dapp
```

### Option 2B - local test rpc using Docker-Compose 

Docker allows you to setup everything in their own isolated docker containers, preventing any changes to your working enviornment. 

Simply run after installing the neccesary deps:
```
docker-compose up
```

If you run into the following error:
```
./src/Contracts.js
Module not found: Can't resolve '../build/contracts/InitialAllocationCollateralToken' in '/app/src'
```

Run the following command in a new terminal tab
```bash
$ make docker_migrate
```
(This needs to be done only once for a set of containers)

## dApp Features

### Main Net
* Contract Explorer : will allow users ability to view, filter, and sort deployed and white listed MARKET Protocol contracts available for trading
* Contract Deploy : Intuitive user interface to help users select appropriate variables for deployment of their custom MARKET Protocol contracts.
* Query Tester : Simple ability to create a query and retrieve the results from the block chain in order to test query structure and expected results prior to deploying a contract.
* Address lookup : Reverse contract lookup for MARKET contract already deployed.  Will allow users to enter an address and retrieve pertinent variables as well as the contract's current status.


### Test Net only
* Simulated Exchange : Users will register using their email address that will be used for tracking of simulated earnings for contest rewards, future airdrops, and project updates.  This game or sim, will allow users to trade against an automated bot that trades a few different MARKET contracts while making or losing tokens that keep score in the competition.

## Contributing

Want to hack on MARKET Protocol? Awesome!

MARKET Protocol is an Open Source project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

Ready to jump in? Check [docs.marketprotocol.io/#contributing](https://docs.marketprotocol.io/#contributing) to see our general guidelines. Then you can find additional information about this specific repository on [CONTRIBUTING](https://github.com/MARKETProtocol/dApp/blob/develop/.github/CONTRIBUTING.md).

## Questions?

Join our [Discord Community](https://marketprotocol.io/discord) to get in touch with our dev staff and other contributors.
