const IPFS = require('nano-ipfs-store'),
        ipfs = IPFS.at("https://ipfs.infura.io:5001"),
        curveAlgo = "ed25519",
        fs = require('fs'),
        keyPath = "../keystore",
        openpgp = require('openpgp');

openpgp.initWorker({ path:'openpgp.worker.js' })

let newKey = {
    privateKey: '',
    publicKey: ''
};

/*
    New PGP Key creator
*/

async function keyGenerator(userName,emailAddress,pswd) {
    // optionsInfo = {
    //     userIds: [{username : userName, email : emailAddress}],
    //     curve: curveAlgo,
    //     passphrase: pswd    
    // }
    // let generator = await openpgp.generateKey(optionsInfo)
    // //let newKey = {
    //     newKey.privateKey = generator.privateKeyArmored;
    //     newKey.publicKey = generator.publicKeyArmored;
    // //};
    // //fs.writeFileSync(keyPath+"/"+userName+"/")
    //  console.log("privKey",typeof(await openpgp.key.readArmored(newKey.privateKey)));
    // console.log(optionsInfo.passphrase)
    // console.log(newKey);
    await encryptDecryptFunction(userName,emailAddress,JSON.stringify(pswd))
    //console.log("Keys\n", newKey.privateKey)
    return newKey;
};

//encryptDecryptFunction("123");

async function encryptDecryptFunction(userName,emailAddress,passphrase) {
    optionsInfo = {
        userIds: [{username : userName, email : emailAddress}],
        curve: curveAlgo,
        passphrase: passphrase    
    }
    let generator = await openpgp.generateKey(optionsInfo)
    //let newKey = {
        newKey.privateKey = generator.privateKeyArmored;
        newKey.publicKey = generator.publicKeyArmored;
    passphrase = "123"
    console.log("pass",passphrase);
    const privKeyObj = (await openpgp.key.readArmored(newKey.privateKey)).key[0]
    console.log(privKeyObj)
    await privKeyObj.decrypt(passphrase)
    
    const options = {
        message: await openpgp.message.read(fs.readFileSync("./one.txt",'utf8')),       // input as Message object
        publicKeys: (await openpgp.key.readArmored(newKey.publicKey)).keys, // for encryption
        privateKeys: [privKeyObj]                                 // for signing (optional)
    }
    console.log("options",options);
    openpgp.encrypt(options).then(ciphertext => {
        encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        console.log("kuch toh hoga",ciphertext);
        return encrypted
    })
    // .then(encrypted => {
    //     const options = {
    //         message: await openpgp.message.readArmored(encrypted),    // parse armored message
    //         publicKeys: (await openpgp.key.readArmored(newKey.publicKey)).keys, // for verification (optional)
    //         privateKeys: [privKeyObj]                                 // for decryption
    //     }
         
    //     openpgp.decrypt(options).then(plaintext => {
    //         console.log(plaintext.data)
    //         return plaintext.data // 'Hello, World!'
    //     })
       
    // })
}


keyGenerator("jay","j@123.com","123");

