pragma solidity ^0.4.23;

import "./AssetAgreement.sol";
import "./Registrar.sol";

contract AssetCustomer is AssetAgreement,Registrar {
    
    event AgreementCreated(
        address _creator,
        address _customer,
        bytes32 _assetId,
        bytes32 _agreementId,
        uint _price,
        uint _duration,
        uint _startDate
    );

    event AgreementTerminated(
        address _customer,
        bytes32 _assetId,
        bytes32 _agreementId,
        uint _currentDate
    );

    event AssetAccessed(
        address _customer,
        bytes32 _assetId,
        bytes32 _agreementId,
        uint _currentDate
    );

    function getCurrentAgreement(
        address _user,
        bytes32 _assetId
    )external view returns(bytes32){
        require(users[_user].isActive == true,"User is inactive");
        bytes32 _agreementId = users[_user].userAssets[_assetId].currentAgreementId;
        require(users[_user].userAssets[_assetId].isAgreement[_agreementId] == true,"Agreement for Asset does not exist");
        return _agreementId;
    }

    function getTotalAgreements(
        address _customer,
        bytes32 _assetId
    ) external returns(uint) {
        require(users[_customer].isActive == true,"User is inactive");
        return users[_customer].userAssets[_assetId].agreementIds.length;
    }
    

    function purchaseAsset(
        address _customer,
        bytes32 _assetId
    ) external returns(bool) {
        require(users[_customer].isActive == true,"User is inactive");
        users[_customer].purchasedAssets[_assetId] = true;
        return true;
    }

    function isPurchased(
        address _customer,
        bytes32 _assetId
    ) external view returns(bool){
        require(users[_customer].isActive == true,"User is inactive");
        return users[_customer].purchasedAssets[_assetId];
    }

    
    function createAgreement(
        address _creator,
        address _customer,
        bytes32 _assetId,
        bytes32 _agreementId,
        uint _price,
        uint _duration,
        uint _startDate
    )public{
        require(users[_customer].isActive == true,"User is inactive");
        require(users[_customer].balance >= _price,"User doesn't have sufficient balance");
        
        bool result = addAgreement(_agreementId,_creator,_customer,_assetId,_duration,_startDate);
        if(result == true){
        users[_customer].userAssets[_assetId].agreementIds.push(_agreementId);
        users[_customer].userAssets[_assetId].isAgreement[_agreementId] = true;
        users[_customer].userAssets[_assetId].currentAgreementId = _agreementId;
        emit AgreementCreated(
            _creator,
            _customer,
            _assetId,
            _agreementId,
            _price,
            _duration,
            _startDate);
        }  
        //return result;
    }
            
    function terminateAgreement(
        address _customer,
        bytes32 _assetId,
        bytes32 _agreementId,
        uint _currentDate
    )external returns(bool){
        require(users[_customer].isActive == true,"User is inactive");
        require(users[_customer].userAssets[_assetId].isAgreement[_agreementId] == true,"Agreement for Asset does not exist");
        require(
            agreements[_agreementId].endDate < _currentDate ||
            agreements[_agreementId].isTerminated == false,"Access duration has already ended"
        ); 
        
        agreements[_agreementId].isTerminated == true;
        emit AgreementTerminated(_customer,_assetId,_agreementId,_currentDate);
        return true;
    }
    
    function accessAsset(
        address _customer,
        bytes32 _assetId,
        bytes32 _agreementId,
        uint _currentDate
    )external returns(bool){
        require(users[_customer].isActive == true,"User is inactive");
        require(users[_customer].userAssets[_assetId].isAgreement[_agreementId] == true,"Agreement for Asset does not exist");
        require( agreements[_agreementId].endDate > _currentDate || agreements[_agreementId].isTerminated == false,"Access duration has already ended"); 
        agreements[_agreementId].numberOfTimesAccessed += 1;
        emit AssetAccessed(_customer,_assetId,_agreementId,_currentDate);
        return true;
    }

    
    // function checkIfAgreementExists(address _customer,bytes32 _assetId) public {
    //     bytes32[] memory agreementIds = users[_customer].userAssets[_assetId].agreementIds;
    //     for(uint i=0; i<agreementIds.length;i++){
    //         bytes32 agreementId = users[_customer].userAssets[_assetId].agreementIds[i];
    //         uint endDate = agreements[agreementId].endDate;
    //         if(agreements[agreementId].isTerminated == true){
    //             continue;
    //         }
    //         require(now > endDate, "User is already engaged in agreement");
    //     }
    // }

   
    
}
