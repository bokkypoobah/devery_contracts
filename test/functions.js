// Nov 1 2017
var ethPriceUSD = 307.7210;
var defaultGasPrice = web3.toWei(1, "gwei");

// -----------------------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------------------
var accounts = [];
var accountNames = {};

addAccount(eth.accounts[0], "Account #0 - Miner");
addAccount(eth.accounts[1], "Account #1 - Contract Owner");
addAccount(eth.accounts[2], "Account #2 - Wallet");
addAccount(eth.accounts[3], "Account #3");
addAccount(eth.accounts[4], "Account #4");
addAccount(eth.accounts[5], "Bevery App Account");
addAccount(eth.accounts[6], "Mevery App Account");
addAccount(eth.accounts[7], "Zevery App Account");
addAccount(eth.accounts[8], "Bevery Fee Account");
addAccount(eth.accounts[9], "Mevery Fee Account");
addAccount(eth.accounts[10], "Zevery Fee Account");
addAccount(eth.accounts[11], "Bevery Brand 1 Account");
addAccount(eth.accounts[12], "Bevery Brand 2 Account");
addAccount(eth.accounts[13], "Bevery Brand 1 Product A Account");
addAccount(eth.accounts[14], "Bevery Brand 1 Product B Account");
addAccount(eth.accounts[15], "Bevery Marker 1");
addAccount(eth.accounts[16], "Bevery Marker 2");
addAccount(eth.accounts[17], "Bevery Brand 1 Product A Item 1");
addAccount(eth.accounts[18], "Bevery Brand 1 Product B Item 2");


var minerAccount = eth.accounts[0];
var contractOwnerAccount = eth.accounts[1];
var wallet = eth.accounts[2];
var account3 = eth.accounts[3];
var account4 = eth.accounts[4];
var beveryAppAccount = eth.accounts[5];
var meveryAppAccount = eth.accounts[6];
var zeveryAppAccount = eth.accounts[7];
var beveryFeeAccount = eth.accounts[8];
var meveryFeeAccount = eth.accounts[9];
var zeveryFeeAccount = eth.accounts[10];
var beveryBrand1Account = eth.accounts[11];
var beveryBrand2Account = eth.accounts[12];
var beveryBrand1ProductAAccount = eth.accounts[13];
var beveryBrand1ProductBAccount = eth.accounts[14];
var beveryMarker1Account = eth.accounts[15];
var beveryMarker2Account = eth.accounts[16];
var beveryBrand1ProductAItem1Account = eth.accounts[17];
var beveryBrand1ProductBItem2Account = eth.accounts[18];

var baseBlock = eth.blockNumber;

function unlockAccounts(password) {
  for (var i = 0; i < eth.accounts.length && i < accounts.length; i++) {
    personal.unlockAccount(eth.accounts[i], password, 100000);
  }
}

function addAccount(account, accountName) {
  accounts.push(account);
  accountNames[account] = accountName;
}


// -----------------------------------------------------------------------------
// Token Contract
// -----------------------------------------------------------------------------
var tokenContractAddress = null;
var tokenContractAbi = null;

function addTokenContractAddressAndAbi(address, tokenAbi) {
  tokenContractAddress = address;
  tokenContractAbi = tokenAbi;
}


// -----------------------------------------------------------------------------
// Account ETH and token balances
// -----------------------------------------------------------------------------
function printBalances() {
  var token = tokenContractAddress == null || tokenContractAbi == null ? null : web3.eth.contract(tokenContractAbi).at(tokenContractAddress);
  var decimals = token == null ? 18 : token.decimals();
  var i = 0;
  var totalTokenBalance = new BigNumber(0);
  console.log("RESULT:  # Account                                             EtherBalanceChange                          Token Name");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  accounts.forEach(function(e) {
    var etherBalanceBaseBlock = eth.getBalance(e, baseBlock);
    var etherBalance = web3.fromWei(eth.getBalance(e).minus(etherBalanceBaseBlock), "ether");
    var tokenBalance = token == null ? new BigNumber(0) : token.balanceOf(e).shift(-decimals);
    totalTokenBalance = totalTokenBalance.add(tokenBalance);
    console.log("RESULT: " + pad2(i) + " " + e  + " " + pad(etherBalance) + " " + padToken(tokenBalance, decimals) + " " + accountNames[e]);
    i++;
  });
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT:                                                                           " + padToken(totalTokenBalance, decimals) + " Total Token Balances");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT: ");
}

function pad2(s) {
  var o = s.toFixed(0);
  while (o.length < 2) {
    o = " " + o;
  }
  return o;
}

function pad(s) {
  var o = s.toFixed(18);
  while (o.length < 27) {
    o = " " + o;
  }
  return o;
}

function padToken(s, decimals) {
  var o = s.toFixed(decimals);
  var l = parseInt(decimals)+12;
  while (o.length < l) {
    o = " " + o;
  }
  return o;
}


// -----------------------------------------------------------------------------
// Transaction status
// -----------------------------------------------------------------------------
function printTxData(name, txId) {
  var tx = eth.getTransaction(txId);
  var txReceipt = eth.getTransactionReceipt(txId);
  var gasPrice = tx.gasPrice;
  var gasCostETH = tx.gasPrice.mul(txReceipt.gasUsed).div(1e18);
  var gasCostUSD = gasCostETH.mul(ethPriceUSD);
  var block = eth.getBlock(txReceipt.blockNumber);
  console.log("RESULT: " + name + " status=" + txReceipt.status + (txReceipt.status == 0 ? " Failure" : " Success") + " gas=" + tx.gas +
    " gasUsed=" + txReceipt.gasUsed + " costETH=" + gasCostETH + " costUSD=" + gasCostUSD +
    " @ ETH/USD=" + ethPriceUSD + " gasPrice=" + web3.fromWei(gasPrice, "gwei") + " gwei block=" + 
    txReceipt.blockNumber + " txIx=" + tx.transactionIndex + " txId=" + txId +
    " @ " + block.timestamp + " " + new Date(block.timestamp * 1000).toUTCString());
}

function assertEtherBalance(account, expectedBalance) {
  var etherBalance = web3.fromWei(eth.getBalance(account), "ether");
  if (etherBalance == expectedBalance) {
    console.log("RESULT: OK " + account + " has expected balance " + expectedBalance);
  } else {
    console.log("RESULT: FAILURE " + account + " has balance " + etherBalance + " <> expected " + expectedBalance);
  }
}

function failIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 0) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 1) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function gasEqualsGasUsed(tx) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  return (gas == gasUsed);
}

function failIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: PASS " + msg);
    return 1;
  } else {
    console.log("RESULT: FAIL " + msg);
    return 0;
  }
}

function failIfGasEqualsGasUsedOrContractAddressNull(contractAddress, tx, msg) {
  if (contractAddress == null) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    var gas = eth.getTransaction(tx).gas;
    var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
    if (gas == gasUsed) {
      console.log("RESULT: FAIL " + msg);
      return 0;
    } else {
      console.log("RESULT: PASS " + msg);
      return 1;
    }
  }
}


//-----------------------------------------------------------------------------
// Wait until some unixTime + additional seconds
//-----------------------------------------------------------------------------
function waitUntil(message, unixTime, addSeconds) {
  var t = parseInt(unixTime) + parseInt(addSeconds) + parseInt(1);
  var time = new Date(t * 1000);
  console.log("RESULT: Waiting until '" + message + "' at " + unixTime + "+" + addSeconds + "s =" + time + " now=" + new Date());
  while ((new Date()).getTime() <= time.getTime()) {
  }
  console.log("RESULT: Waited until '" + message + "' at at " + unixTime + "+" + addSeconds + "s =" + time + " now=" + new Date());
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
// Wait until some block
//-----------------------------------------------------------------------------
function waitUntilBlock(message, block, addBlocks) {
  var b = parseInt(block) + parseInt(addBlocks);
  console.log("RESULT: Waiting until '" + message + "' #" + block + "+" + addBlocks + " = #" + b + " currentBlock=" + eth.blockNumber);
  while (eth.blockNumber <= b) {
  }
  console.log("RESULT: Waited until '" + message + "' #" + block + "+" + addBlocks + " = #" + b + " currentBlock=" + eth.blockNumber);
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
// App Registry Contract
//-----------------------------------------------------------------------------
var registryContractAddress = null;
var registryContractAbi = null;

function addRegistryContractAddressAndAbi(address, tokenAbi) {
  registryContractAddress = address;
  registryContractAbi = tokenAbi;
}

var registryFromBlock = 0;

function printRegistryContractDetails() {
  console.log("RESULT: registryContractAddress=" + registryContractAddress);
  if (registryContractAddress != null && registryContractAbi != null) {
    var contract = eth.contract(registryContractAbi).at(registryContractAddress);
    console.log("RESULT: registry.owner=" + contract.owner());
    console.log("RESULT: registry.newOwner=" + contract.newOwner());

    var latestBlock = eth.blockNumber;
    var i;

    var appAccountsLength = contract.appAccountsLength();
    console.log("RESULT: registry.appAccountsLength=" + appAccountsLength);
    for (i = 0; i < appAccountsLength; i++) {
        console.log("RESULT: registry.appAccounts(" + i + ")=" + contract.appAccounts(i) + " " + JSON.stringify(contract.apps(contract.appAccounts(i))));
    }

    var brandAccountsLength = contract.brandAccountsLength();
    console.log("RESULT: registry.brandAccountsLength=" + brandAccountsLength);
    for (i = 0; i < brandAccountsLength; i++) {
        console.log("RESULT: registry.brandAccounts(" + i + ")=" + contract.brandAccounts(i) + " " + JSON.stringify(contract.brands(contract.brandAccounts(i))));
    }

    var productAccountsLength = contract.productAccountsLength();
    console.log("RESULT: registry.productAccountsLength=" + productAccountsLength);
    for (i = 0; i < productAccountsLength; i++) {
        console.log("RESULT: registry.productAccounts(" + i + ")=" + contract.productAccounts(i) + " " + JSON.stringify(contract.products(contract.productAccounts(i))));
    }

    var appAddedEvents = contract.AppAdded({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    appAddedEvents.watch(function (error, result) {
      console.log("RESULT: AppAdded " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    appAddedEvents.stopWatching();

    var appUpdatedEvents = contract.AppUpdated({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    appUpdatedEvents.watch(function (error, result) {
      console.log("RESULT: AppUpdated " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    appUpdatedEvents.stopWatching();

    var brandAddedEvents = contract.BrandAdded({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    brandAddedEvents.watch(function (error, result) {
      console.log("RESULT: BrandAdded " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    brandAddedEvents.stopWatching();

    var brandUpdatedEvents = contract.BrandUpdated({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    brandUpdatedEvents.watch(function (error, result) {
      console.log("RESULT: BrandUpdated " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    brandUpdatedEvents.stopWatching();

    var productAddedEvents = contract.ProductAdded({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    productAddedEvents.watch(function (error, result) {
      console.log("RESULT: ProductAdded " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    productAddedEvents.stopWatching();

    var productUpdatedEvents = contract.ProductUpdated({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    productUpdatedEvents.watch(function (error, result) {
      console.log("RESULT: ProductUpdated " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    productUpdatedEvents.stopWatching();

    var permissionedEvents = contract.Permissioned({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    permissionedEvents.watch(function (error, result) {
      console.log("RESULT: Permissioned " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    permissionedEvents.stopWatching();

    var markedEvents = contract.Marked({}, { fromBlock: registryFromBlock, toBlock: latestBlock });
    i = 0;
    markedEvents.watch(function (error, result) {
      console.log("RESULT: Marked " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    markedEvents.stopWatching();

    registryFromBlock = latestBlock + 1;
  }
}


//-----------------------------------------------------------------------------
// Token Contract
//-----------------------------------------------------------------------------
var tokenFromBlock = 0;
function printTokenContractDetails() {
  console.log("RESULT: tokenContractAddress=" + tokenContractAddress);
  if (tokenContractAddress != null && tokenContractAbi != null) {
    var contract = eth.contract(tokenContractAbi).at(tokenContractAddress);
    var decimals = contract.decimals();
    console.log("RESULT: token.owner=" + contract.owner());
    console.log("RESULT: token.newOwner=" + contract.newOwner());
    console.log("RESULT: token.symbol=" + contract.symbol());
    console.log("RESULT: token.name=" + contract.name());
    console.log("RESULT: token.decimals=" + decimals);
    console.log("RESULT: token.decimalsFactor=" + contract.decimalsFactor());
    console.log("RESULT: token.totalSupply=" + contract.totalSupply().shift(-decimals));
    console.log("RESULT: token.transferable=" + contract.transferable());
    console.log("RESULT: token.mintable=" + contract.mintable());
    console.log("RESULT: token.minter=" + contract.minter());

    var latestBlock = eth.blockNumber;
    var i;

    var minterUpdatedEvents = contract.MinterUpdated({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    minterUpdatedEvents.watch(function (error, result) {
      console.log("RESULT: MinterUpdated " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    minterUpdatedEvents.stopWatching();

    var mintingDisabledEvents = contract.MintingDisabled({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    mintingDisabledEvents.watch(function (error, result) {
      console.log("RESULT: MintingDisabled " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    mintingDisabledEvents.stopWatching();

    var minterUpdatedEvents = contract.MinterUpdated({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    minterUpdatedEvents.watch(function (error, result) {
      console.log("RESULT: MinterUpdated " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    minterUpdatedEvents.stopWatching();

    var approvalEvents = contract.Approval({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    approvalEvents.watch(function (error, result) {
      console.log("RESULT: Approval " + i++ + " #" + result.blockNumber + " owner=" + result.args.owner +
        " spender=" + result.args.spender + " tokens=" + result.args.tokens.shift(-decimals));
    });
    approvalEvents.stopWatching();

    var transferEvents = contract.Transfer({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    transferEvents.watch(function (error, result) {
      console.log("RESULT: Transfer " + i++ + " #" + result.blockNumber + ": from=" + result.args.from + " to=" + result.args.to +
        " tokens=" + result.args.tokens.shift(-decimals));
    });
    transferEvents.stopWatching();

    tokenFromBlock = latestBlock + 1;
  }
}
