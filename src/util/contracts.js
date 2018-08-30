export async function processContractsList(
  marketContract,
  marketCollateralPool,
  collateralToken,
  ERC20,
  deployedContracts
) {
  let promises = deployedContracts.map(async contract => {
    return await marketContract
      .at(contract)
      .then(async function(instance) {
        return await instance.MARKET_COLLATERAL_POOL_ADDRESS.call().then(
          async address => {
            if (address !== '0x0000000000000000000000000000000000000000') {
              const contractJSON = {};
              contractJSON['key'] = instance.address;
              contractJSON[
                'CONTRACT_NAME'
              ] = await instance.CONTRACT_NAME.call();

              const collateralTokenContractAddress = await instance.COLLATERAL_TOKEN_ADDRESS.call();
              contractJSON[
                'COLLATERAL_TOKEN_ADDRESS'
              ] = collateralTokenContractAddress;

              await collateralToken
                .at(collateralTokenContractAddress)
                .then(async function(collateralTokenInstance) {
                  contractJSON[
                    'COLLATERAL_TOKEN'
                  ] = await collateralTokenInstance.name();
                  contractJSON[
                    'COLLATERAL_TOKEN_SYMBOL'
                  ] = await collateralTokenInstance.symbol();
                })
                .catch(function(err) {
                  try {
                    const token = contract(ERC20).at(
                      collateralTokenContractAddress
                    );
                    contractJSON['COLLATERAL_TOKEN'] = token.name();
                    contractJSON['COLLATERAL_TOKEN_SYMBOL'] = token.symbol();
                  } catch (e) {
                    console.error(e);
                    contractJSON['COLLATERAL_TOKEN'] = 'NA';
                    contractJSON['COLLATERAL_TOKEN_SYMBOL'] = 'NA';
                  }
                });

              contractJSON[
                'PRICE_FLOOR'
              ] = await instance.PRICE_FLOOR.call().then(data =>
                data.toNumber()
              );
              contractJSON['PRICE_CAP'] = await instance.PRICE_CAP.call().then(
                data => data.toNumber()
              );
              contractJSON[
                'PRICE_DECIMAL_PLACES'
              ] = await instance.PRICE_DECIMAL_PLACES.call().then(data =>
                data.toNumber()
              );

              contractJSON['MARKET_COLLATERAL_POOL_ADDRESS'] = address;

              contractJSON[
                'QTY_MULTIPLIER'
              ] = await instance.QTY_MULTIPLIER.call().then(data =>
                data.toNumber()
              );
              contractJSON['ORACLE_QUERY'] = await instance.ORACLE_QUERY.call();
              contractJSON[
                'EXPIRATION'
              ] = await instance.EXPIRATION.call().then(data =>
                data.toNumber()
              );
              contractJSON['lastPrice'] = await instance.lastPrice
                .call()
                .then(data => data.toNumber());
              contractJSON['isSettled'] = await instance.isSettled.call();

              // TODO: There is a possibility a contract ends up in our registry that wasn't linked to a collateral pool
              // correctly.  The code below will handle this, but a better solution would probably to not actually
              // display contracts that are not correctly linked to a collateral pool!
              await marketCollateralPool
                .at(await address)
                .then(async function(collateralPoolInstance) {
                  contractJSON[
                    'collateralPoolBalance'
                  ] = await collateralPoolInstance.collateralPoolBalance
                    .call()
                    .then(data => data.toNumber());
                })
                .catch(function(err) {
                  console.error(err);
                  contractJSON['collateralPoolBalance'] = 'NA';
                });
              return contractJSON;
            }
          }
        );
      })
      .catch(function(err) {
        console.error(err);
      });
  });

  return await Promise.all(promises);
}

/**
 * proesses contracts fetched from the marketAPI to a format usabled by the dApp.
 *
 * @param {object[]} contracts contracts fetched from marketAPI
 */
export async function processAPIContractsList(contracts) {
  return contracts.map(contract => {
    const contractJSON = {
      key: contract.address,
      CONTRACT_NAME: contract.name,
      COLLATERAL_TOKEN_ADDRESS: contract.collateralTokenAddress,
      COLLATERAL_TOKEN: contract.collateralTokenName,
      COLLATERAL_TOKEN_SYMBOL: contract.collateralTokenSymbol,
      PRICE_FLOOR: parseInt(contract.priceFloor, 10),
      PRICE_CAP: parseInt(contract.priceCap, 10),
      PRICE_DECIMAL_PLACES: parseInt(contract.priceDecimalPlaces, 10),
      // MARKET_COLLATERAL_POOL_ADDRESS: '', // not provided yet
      QTY_MULTIPLIER: parseInt(contract.qtyMultiplier, 10),
      ORACLE_QUERY: contract.oracleQuery,
      EXPIRATION: parseInt(contract.expirationTimestamp, 10),
      lastPrice: parseInt(contract.lastQueriedPrice, 10),
      isSettled: contract.isSettled,
      collateralPoolBalance: parseInt(contract.collateralPoolBalance, 10),
      isWhitelisted: contract.isWhitelisted,
      lastTradePrice: parseInt(contract.lastTradePrice, 10)
    };
    return contractJSON;
  });
}
