pragma solidity ^0.4.23;

contract AssetUser {
    
    enum TypeOfSubscription {Premium, Silver, Gold}
    mapping(address=>User) users;
    
    struct User{
        uint balance;
        bool isActiveUser;
        mapping(bytes32=>Asset) assets;
    }
    
    struct Asset {
        uint numberOfTimesAccessed;
        bool isAccessing;  //is currently accessing
        mapping(bytes32=>Access) accessHistory;
    }
    
    struct Access {
        uint dateOfJoining;
        uint dateOfEnding;
        uint dateOfTerminating;
        TypeOfSubscription typeOfSubscription;
    }
    
    function subscribeAsset(
        address _userId,
        bytes32 _assetId,
        bytes32 _accessId,
        uint _price,
        TypeOfSubscription _type
    )external {
        require(users[_userId].isActiveUser == true,"User is inactive");
        require(users[_userId].balance >= _price,"User doesn't have sufficient balance");
        require(users[_userId].assets[_assetId].isAccessing == false,"User is already accessing Asset");
        
        uint endDate = getDateOfEnding(now,_type);
        require(endDate!=0,"Error in getting End Date");
        
        users[_userId].assets[_assetId].numberOfTimesAccessed += 1;
        Access memory access = Access(now,endDate,0,_type);
        users[_userId].assets[_assetId].accessHistory[_accessId] = access;
        users[_userId].assets[_assetId].isAccessing = true;
    }
    
    function terminateSubscription(
        address _userId,
        bytes32 _assetId,
        bytes32 _accessId
    )external {
        require(users[_userId].isActiveUser == true,"User is inactive");
        require(users[_userId].assets[_assetId].isAccessing == true,"User is not accessing Asset");
        require(users[_userId].assets[_assetId].accessHistory[_accessId].dateOfEnding > now,"Access duration has already ended"); 
        users[_userId].assets[_assetId].accessHistory[_accessId].dateOfTerminating = now;
        users[_userId].assets[_assetId].isAccessing = false;
    }
    
    function getDateOfEnding(
        uint _startDate,
        TypeOfSubscription _type) internal pure returns(uint){
    
        if(_type==TypeOfSubscription.Premium){
            return(_startDate += _startDate * 1 days + 12 weeks);
        } else if(_type==TypeOfSubscription.Silver){
            return(_startDate += _startDate * 1 days + 24 weeks);
        } else if(_type==TypeOfSubscription.Gold){
            return(_startDate += _startDate * 1 days + 48 weeks);
        } else{
            return(0);
        }
    }
    
    function accessAsset(){
    }
}
    
