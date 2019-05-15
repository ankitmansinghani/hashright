pragma solidity ^0.4.23;

contract AssetCreator {
    enum AssetType {Image, Pdf, Audio, Other}
    enum RightType {Buy, Publisher}
    enum TypeOfSubscription {Premium, Silver, Gold}
    mapping(uint256 => bytes32) total;
    mapping(bytes32 => Asset) assets;
    mapping(bytes32 => AssetRegistrar) assetregistrar;
    
    struct Asset {
        address owner;
        string assetName;
        string ownerName;
        bytes32 ipfsHash;
        bytes32 registrarId;
        bytes32 ipfsWatermarkHash;
        uint256 price;
        AssetType assetType;
        bool dispute;
        bool isActive;
        bool isRegistered;
        uint256 like;
        uint256 dislike;
        mapping(address => AssetCustomer) assetcustomers;
        mapping(bytes32 => AssetContract) assetcontracts;
    } 

    struct AssetCustomer {
        uint256 balance;
        uint256 numberOfTimesAccessed;
        bool isAccessing;
        address customer;
        RightType rightType;
        bytes32 contractID;
        bool isActive;
        bool dispute;
        //mapping(bytes32=>Access) accessHistory;
        mapping(bytes32 => AssetContract) assetcontracts;
    }

    struct AssetContract {
        uint256 amount;
        bool isRecurring;
        uint256 duration;
        uint256 dateOfJoining;
        uint256 dateOfEnding;
        uint256 dateOfTerminating;
        TypeOfSubscription typeOfSubscription;
    }

    struct AssetRegistrar {
        address owner;
        uint256 timestamp;
        bool isActive;
    }

    struct HashRight {
        uint256 numberOfAsset;
        uint256 buyers;
        uint256 pusblishers;
    }


    function addAsset(
        bytes32 _id,
        address _owner,
        uint256 _price,
        AssetType _assetType,
        bytes32 _ipfsHash,
        bytes32 _ipfsWatermarkHash
    ) external returns (bool success) {
        require(assets[_id].isRegistered, "Asset is not registered!");
        assets[_id].owner = _owner;
        assets[_id].price = _price;
        assets[_id].assetType = _assetType;
        assets[_id].isActive = true;
        assets[_id].ipfsHash = _ipfsHash;
        assets[_id].ipfsWatermarkHash = _ipfsWatermarkHash;
        return true;
    }

    function viewAsset(
        bytes32 _id
    ) public view returns (
        address owner,
        uint256 price,
        AssetType assetType,
        bytes32 ipfsHash,
        bytes32 ipfsWatermarkHash,
        bool isRegistered,
        bool isActive,
        bool dispute,
        uint256 like,
        uint256 dislike
        ) {
        require(assets[_id].isActive,"No such asset in system!");
        Asset memory asset = assets[_id];
        return (
            asset.owner,
            asset.price,
            asset.assetType,
            asset.ipfsHash,
            asset.ipfsWatermarkHash,
            asset.isRegistered,
            asset.isActive,
            asset.dispute,
            asset.like,
            asset.dislike
        );
    }

    function registerAsset(
        bytes32 _id,
        address _owner,
        uint256 _time
    ) external returns(bool success) {
        require(assetregistrar[_id].owner == 0x0,"Asset is already registered!");
        assetregistrar[_id].owner = _owner;
        assetregistrar[_id].timestamp = _time;
        return true;
    }

    function rateAsset(
        bytes32 _id,
        uint256 _like,
        uint256 _dislike
    ) external returns(bool status) {
        require(assets[_id].owner != 0x0,"No such asset in blockchain!");
        assets[_id].like += _like;
        assets[_id].dislike += _dislike;
        return true;
    }

    function assetDetails(bytes32 _id) internal view returns(bool) {
        require(assets[_id].owner == 0x0,"New Asset");
        return true;
    }

    function assetDispute(
        bytes32 _id,
        bool _status
    ) external returns(bool) {
        require(assetDetails(_id),"No such asset in blockchain");
        assets[_id].dispute = _status;
        return true;
    }
 

}