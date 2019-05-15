pragma solidity ^0.4.23;

contract AssetAgreement {
    mapping(bytes32=>Agreement) agreements;   
    
    struct Agreement{
        address creator;
        address customer;
        bytes32 assetId;
        uint startDate;  //timestamp
        uint duration;   //duration in days

        uint earnedBalance;
        uint endDate;
        bool isTerminated;
        uint numberOfTimesAccessed;
    }
    
    function addAgreement(
        bytes32 _agreementId,
        address _creator,
        address _customer,
        bytes32 _assetId,
        uint _duration,
        uint _startDate
        ) internal returns(bool){
        require(agreements[_agreementId].startDate == 0,"Agreement already exists");    
        agreements[_agreementId].creator = _creator;
        agreements[_agreementId].customer = _customer;
        agreements[_agreementId].assetId = _assetId;
        agreements[_agreementId].startDate = _startDate;
        agreements[_agreementId].duration = _duration;
        agreements[_agreementId].endDate = getEndDate(_startDate,_duration);
        agreements[_agreementId].isTerminated = false;
        return true;
    }
    
    function getAgreement(bytes32 _agreementId) public returns(
        address,
        address,
        bytes32,
        uint,
        uint,
        uint,
        uint){
        require(agreements[_agreementId].startDate != 0, "Agreement does not exist");
        return(agreements[_agreementId].creator,
        agreements[_agreementId].customer,
        agreements[_agreementId].assetId,
        agreements[_agreementId].startDate,
        agreements[_agreementId].duration,
        agreements[_agreementId].earnedBalance,
        agreements[_agreementId].numberOfTimesAccessed);
    }
    
    function getEndDate(uint startDate,uint duration) internal pure returns(uint) {
        return(startDate + duration * 1 days);
    }
}
