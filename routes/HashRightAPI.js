const express = require('express')
      api = express.Router(),
      contract = require('truffle-contract'),
      truffle = require('../truffle'),
      //watermark = require('../modules/watermark.js');
      uuid = require('uuid/v4');
      var sc = require('../build/contracts/AssetCreator.json');

var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})
const fs = require('fs');
const status = require('http-status');
//let ipfsU = require('../modules/ipfs');
const pHash = require('phash-imagemagick');
const watermark = require('image-watermark-2');
const dest = './modules/watermark/';
const pHashData = {
    image1 : '004800510178014902650297029902900631063104020378058305860037000301480085020801620255019105250378034302340490038800300040015401590199022702270265048405550318035904440515',
    image2 : '004700510176014902630296029102890604063003980377057305840036000201460083020701600248018405030376034002270483036600290039015201570197022502210259046605320314035504350506'
}
const AssetType = {
  Image : 0,
  Pdf : 1,
  Audio : 2,
  Other : 3
}

var AssetAgreementABI = require('../build/contracts/AssetAgreement.json');
var AssetCreatorABI = require('../build/contracts/AssetCreator.json');
var AssetCustomerABI = require('../build/contracts/AssetCustomer.json');
var RegistrarABI = require("../build/contracts/Registrar.json");


var content = [
    {
      "type": 0,
      "name": "Laptop",
      "picture": "dist/img/1.jpg",
      "date": "Today"
    },
    {
      "type": 0,
      "name": "Laptop",
      "picture": "dist/img/2.jpg",
      "date": "Yesterday"
    },
    {
      "type": 1,
      "name": "Ipad",
      "picture": "dist/img/3.jpg",
      "date": "12 Jan"
    },
    {
      "type": 1,
      "name": "JBL",
      "picture": "dist/img/4.jpg",
      "date": "14 Jan"
    },
    {
      "type": 2,
      "name": "Audio Technica",
      "picture": "dist/img/5.jpg",
      "date": "15 Jan"
    },
    {
      "type": 2,
      "name": "Nadia",
      "picture": "dist/img/6.jpg",
      "date": "15 Jan"
    }
  ];
  

const maxGas = truffle.networks.development.gas;

let Web3 = require('web3'),
    web3 = new Web3(new Web3.providers.HttpProvider(
      "http://"+
      truffle.networks.development.host+
      ":"+
      truffle.networks.development.port
    )),
    HashRight = contract(sc),
    Instance;

//add provider to contract    
HashRight.setProvider(web3.currentProvider);

// RegistrarContract = contract(RegistrarABI);
// RegistrarContract.setProvider(web3.currentProvider);

// AssetAgreementContract = contract(AssetAgreementABI);
// AssetAgreementContract.setProvider(web3.currentProvider);

AssetCustomerContract = contract(AssetCustomerABI);
AssetCustomerContract.setProvider(web3.currentProvider);

//setting contract instance
async function setContractInstance() {
  //RegistrarInstance = await RegistrarContract.deployed();
  //AssetAgreementInstance = await AssetAgreementContract.deployed();
  AssetCustomerInstance = await AssetCustomerContract.deployed();
}
setContractInstance();

// Check web3 connetion status
console.log("Web3 status",web3.isConnected());


const response = {
  Success : 1,
  Fail : 0
}

api.get('/', async function (req, res, next) {
  res.render('index');
});

api.get('/marketPlace', async (req, res, next) => {
  res.render('marketPlace', { data: content });
});

api.get('/myAsset', async (req, res, next) => {
  res.render('myAsset', {data : content});
});

api.get('/createAsset', async (req, res, next) => {
  res.render('createAsset');
});


api.get('/createAsset', async (req, res, next) => {
    // let address = await Instance.address;
    // console.log(address);
    res.render('createAsset');
  });
  


/* GET home page. */
api.get('/', async function(req, res, next) {
  let address = await Instance.address;
  console.log(address);
  res.render('index', { title: 'Express' });
});

api.get('/myAsset', async (req, res, next) => {
    res.render('myAsset', {data : content});
  });

api.post('/createAsset',async function(req,res,next) {
  
    let owner = req.body.owner,
        filePath = req.body.filePath,
        fileName = req.body.fileName,
        price = req.body.price,
        uniqId,
        ipfsHash,
        assetType = req.body.assetType;
          


    try {

      uniqId = web3.sha3(pHashData.image1);
      watermarkFilePath = fs.readFileSync('/home/jaydeep/Pictures/william-bout-791322-unsplash.jpg')
      watermarkFilePath = fs.readFileSync(filePath)

      console.log("Uploading to ipfs!");
      file = fs.readFileSync(filePath);
      let fileBuffer = new Buffer(file);
      


      ipfsHash = await ipfs.files.add(fileBuffer)
      console.log("ipfsHash",ipfsHash);
      let watermarkFileBuffer = new Buffer(watermarkFilePath); 
      ipfsHashWatermarkHash = await ipfs.files.add(watermarkFileBuffer);
      console.log("ipfsHashWatermarkHash",ipfsHashWatermarkHash);

      console.log("ipfsHash",ipfsHashWatermarkHash[0].hash);
      console.log("Sender",owner);
      console.log("coinbase",web3.eth.coinbase)
      console.log("Calling sc!");

      let status = await Instance.registerAsset.sendTransaction(
        uniqId,
        owner,
        Date.now(), {
          from : owner,
          gas : maxGas
        }
      )
      console.log("status",status)
      data = { txHash : status };
      console.log("Data",data);
      assetId = uuid();
      console.log("AssetId",assetId,web3.sha3(uuid()));
      console.log("==>",JSON.stringify(ipfsHash[0].hash))
      let addAsssetTx = await Instance.addAsset.sendTransaction(
        web3.sha3(uuid()),
        owner,
        price,
        assetType,
        JSON.stringify(ipfsHash[0].hash),
        JSON.stringify(ipfsHashWatermarkHash[0].hash),
        {
            from : owner,
            gas : maxGas
        }
      )
      console.log("add",addAsssetTx)

      let info = "Agreement successfully created into blockchain!";
      res.status(status.OK)
        .send(successReponse(response.Success,info,data));
    } catch (error) {
      let info = "Asset already registered in blockchain!"
      res.status(status.INTERNAL_SERVER_ERROR)
        .send(failureResponse(response.Fail,info,error.message))
    }   
});



// api.get('/viewAsset',async function(req,res,next){
//     let id = req.params.id;

//     try {
//         let result = await Instance.viewAsset(
//             id, {
//                 from : web3.eth.coinbase,
//                 gas : maxGas
//             }
//         )

//         data = {
//             assetId : result[0],
//             registrarId : result[1],
//             name :result[2],
//             ipfs :result[3],
//             ipfsWatermark :result[4],
//             price :result[5],
//             assetType :result[6],
//             dispute :result[7],
//             isActive :result[8],
//             like :result[9],
//             dislike :result[10],
//         }

//         let info = "Asset successfully registered into blockchain!"
//         res.status(status.OK)
//           .send(successReponse(response.Success,info,data));


//     } catch(error){
//         console.log("error!");
//         let info = "Asset already registered in blockchain!"
//         res.status(status.INTERNAL_SERVER_ERROR)
//           .send(failureResponse(response.Fail,info,error.message))
//     }

// })

api.post('/assetAgreement', async function(req,res,next){
    let owner = req.body.owner,
        customer = req.body.customer,
        assetId = req.body.assetId,
        price = req.body.price,
        duration = req.body.duration;
    
    try {
        let res = await Instance.createAgreementForAsset(
            owner,
            customer,
            assetId,
            web3.sha3(uuidv4()),
            price,
            duration
        )
        data = {
            txHash : res
        }
        let info = "Asset Agreement successfully created!";
        res.status(status.OK)
            .send(successReponse(response.Success,info,data));
    
    } catch(error) {
        let info = "Asset Agreement failed!";
        res.status(status.INTERNAL_SERVER_ERROR)
            .send(successReponse(response.Success,info,error.message));
    }

})

api.get('/viewAsset',async function(req,res,next){
    let id = req.params.id;

    try {
        let result = await Instance.viewAsset(
            id, {
                from : web3.eth.coinbase,
                gas : maxGas
            }
        )

        data = {
            assetId : result[0],
            registrarId : result[1],
            name :result[2],
            ipfs :result[3],
            ipfsWatermark :result[4],
            price :result[5],
            assetType :result[6],
            dispute :result[7],
            isActive :result[8],
            like :result[9],
            dislike :result[10],
        }

        let info = "Asset successfully registered into blockchain!"
        res.status(status.OK)
          .send(successReponse(response.Success,info,data));


    } catch(error){
        console.log("error!");
        let info = "Asset already registered in blockchain!"
        res.status(status.INTERNAL_SERVER_ERROR)
          .send(failureResponse(response.Fail,info,error.message))
    }

})

api.post('/addUsers',async function(req,res,next){
  
  // let _user = web3.eth.accounts[1];
  //     _balance = web3.eth.getBalance(_user);
  try {     
    
    //let RegistrarInstance = RegistrarInstance.deployed();
    var wallets = [];

    for(var i=0;i<10;i++){
      wallets.push(web3.eth.accounts[i]);
    }

    let gasCost = await AssetCustomerInstance.addUsers.estimateGas(
      wallets, {
        from : owner,
        gas : maxGas
      }
    )
    
    let AddUserTx = await AssetCustomerInstance.addUsers.sendTransaction(
      wallets, {
        from : owner,
        gas : maxGas
      }
    )
    data = { txHash : AddUserTx };    

    let info = "Users successfully added!";
    res.status(status.OK)
      .send(successReponse(response.Success,info,data));

  } catch (error) {
    console.log("error!");
    let info = "Error in adding User!";
    res.status(status.INTERNAL_SERVER_ERROR)
      .send(failureResponse(response.Fail,info,error.message))
  }   
});

api.post('/createAgreement',async function(req,res,next){
 
  let _creator = web3.eth.accounts[0];//req.body._creator;
      _customer = web3.eth.accounts[1]; //req.body._customer;
    
      _assetId = web3.sha3("asset1");    //req.params._assetId;
      _agreementId = web3.sha3("agreement1");  //req.body.agreementId;
      

      _price = req.body.price;   //req.params.price;
      _duration = req.body.duration;   //req.params.duration;
      console.log(Date.now());

  try {

    let totalAgreements = await AssetCustomerInstance.getTotalAgreements.call(
      _customer,
      _assetId,{
        from : owner,
        gas : maxGas
      }
    )

    if(totalAgreements == 0) {
      let purchaseAsset = await AssetCustomerInstance.purchaseAsset.sendTransaction(
        _customer,
        _assetId,{
          from : owner,
          gas : maxGas
        }
      )
    }
     
    let gasCost = await AssetCustomerInstance.createAgreement.estimateGas(
      _creator,
      _customer,
      _assetId,
      _agreementId,
      _price,
      _duration,
      Date.now(), {
        from : owner,
        gas : maxGas
      }
    )

    let createAgreementTx = await AssetCustomerInstance.createAgreement.sendTransaction(
      _creator,
      _customer,
      _assetId,
      _agreementId,
      _price,
      _duration,
      Date.now(), {
        from : owner,
        gas : maxGas
      }
    )
    console.log(createAgreementTx);
    data = { txHash : createAgreementTx };    

    let info = "Agreement successfully created into blockchain!";
    res.status(status.OK)
      .send(successReponse(response.Success,info,data));

  } catch (error) {
    console.log("error!");
    let info = "Error in creating agreement!";
    res.status(status.INTERNAL_SERVER_ERROR)
      .send(failureResponse(response.Fail,info,error.message))
  }   
});

api.post('/terminateAgreement',async function(req,res,next){
 
  let _customer = web3.eth.accounts[1];
      _assetId = req.body._assetId;
      _agreementId = req.body.agreementId;
      
  try {
     
    let gasCost = await AssetCustomerInstance.terminateAgreement.estimateGas(
      _customer,
      _assetId,
      _agreementId,
      Date.now(), {
        from : owner,
        gas : maxGas
      }
    )

    let terminateAgreementTx = await AssetCustomerInstance.terminateAgreement.sendTransaction(
      _customer,
      _assetId,
      _agreementId,
      Date.now(), {
        from : owner,
        gas : maxGas
      }
    )
    data = { txHash : terminateAgreementTx };    

    let info = "Agreement successfully terminated!";
    res.status(status.OK)
      .send(successReponse(response.Success,info,data));

  } catch (error) {
    console.log("error!");
    let info = "Error in terminating agreement!";
    res.status(status.INTERNAL_SERVER_ERROR)
      .send(failureResponse(response.Fail,info,error.message))
  }   
});

api.post('/accessAsset',async function(req,res,next){
 
  let _customer = web3.eth.accounts[1];
      _assetId = web3.sha3("asset1");
      _agreementId = web3.sha3("agreement1");
      
  try {
     
    let gasCost = await AssetCustomerInstance.accessAsset.estimateGas(
      _customer,
      _assetId,
      _agreementId,
      Date.now(), {
        from : owner,
        gas : maxGas
      }
    )

    let accessAssetTx = await AssetCustomerInstance.accessAsset.sendTransaction(
      _customer,
      _assetId,
      _agreementId,
      Date.now(), {
        from : owner,
        gas : maxGas
      }
    )
    data = { txHash : accessAssetTx };    

    let info = "Agreement is accessible!";
    res.status(status.OK)
      .send(successReponse(response.Success,info,data));

  } catch (error) {
    console.log("error!");
    let info = "Error in accessing agreement!";
    res.status(status.INTERNAL_SERVER_ERROR)
      .send(failureResponse(response.Fail,info,error.message))
  }   
});


function assetType() {
    if(assetType == AssetType.Image) {

        return pHash.get(filePath,function(err,data){
            return data;
        });

      }
      
      else {
        console.log("Not phash!")
        file = fs.readdirSync(filePath)
        fileBuffer = new Buffer(file)
        uniqId = web3.sha3(fileBuffer)
        return uniqId;
      }
}

// api.get('/assets')


function successReponse(status,info,data) {
    responseData = {
      status : status,
      info : info,
      data : data
    }
    return responseData;
}

function failureResponse(status,info,error) {
    responseData = {
      status : status,
      info : info,
      error : error
    }
    return responseData;
}

function getpHash(file) {
  pHash.get(fs.readFile(file))
    //  function(err, data) {
    // //console.log(JSON.stringify(data.pHash));
    // //console.log("===>",data.pHash);
    // //return JSON.stringify(data.pHash[0]);
    // return data.pHash[0];
//  });
}


async function watermarkAsset(name,source,ext) {
    let path = dest+name+".jpg";
    let options = {
        'text' : "hashright",
        'dstPath' : path
    }
    //console.log((options.dstPath));
    //file = fs.readFileSync(source);
    //console.log("source",source)
    return watermark.embedWatermark(source, options);
}

module.exports = api;