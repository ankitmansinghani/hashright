//var EIP20Interface = artifacts.require("./EIP20Interface.sol");
//var Token = artifacts.require("./Token.sol");
//var Registrar = artifacts.require("./Registrar.sol");
//var AssetCreator = artifacts.require("./AssetCreator.sol");
//var AssetAgreement = artifacts.require("./AssetAgreement.sol");
var AssetCustomer = artifacts.require("./AssetCustomer.sol");


module.exports = function(deployer) {
  //deployer.deploy(EIP20Interface);
  //deployer.deploy(Token,100000,"HashRightCoin",10,"HRC");
  //deployer.deploy(AssetCreator);
  //deployer.deploy(Registrar);
  //deployer.deploy(AssetAgreement);
  //deployer.link(AssetCustomer,Registrar);
  //deployer.link(AssetCustomer,AssetAgreement);  
  deployer.deploy(AssetCustomer);
};
