pragma solidity ^0.4.23;
//import "./Token.sol";

contract Registrar{
    event UserAdded(address _user);

    mapping(address => User) public users;
    mapping(address => AssetRegistrar) public assetregistrar;
    struct User {
        uint256 balance;
        bool isAdded;
        bool isActive;
        uint256 totalAsset;
        mapping(bytes32=>bool) purchasedAssets;
        mapping(bytes32=>UserAsset) userAssets;
    }

    struct UserAsset {
        bytes32 currentAgreementId;
        bytes32[] agreementIds;
        mapping(bytes32=>bool) isAgreement;
    }


    struct AssetRegistrar {
        bytes32 id;
        uint256 timestamp;
        bool isActive;
    }

    function addUser(address _address,uint balance) public returns(bool) {
        require(!users[_address].isAdded,"User with this address already exists!");
        users[_address].balance = balance;
        users[_address].isAdded = true;
        users[_address].isActive = true;
        emit UserAdded(_address);
        return true;
    }
    
    function addUsers(address[] _listOfUsers) public returns(bool){
        for(uint i=0; i<10; i++){
            address _address = _listOfUsers[i];
            users[_address].balance = 100;
            users[_address].isAdded = true;
            users[_address].isActive = true;
        }
    }

}