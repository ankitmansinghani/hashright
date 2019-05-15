const IPFS = require('nano-ipfs-store')
const ipfs = IPFS.at("https://ipfs.infura.io:5001");

const openpgp = require('openpgp')
openpgp.initWorker({ path:'openpgp.worker.js' })

let msgRequest = {
    "patient_id":"0005",
    "gender":"female",
    "age_group":"25-30",
    "subject":"Enquiry on Lasek treatment",
    "arrival_from_date":"01-June-2018",
    "arrival_to_date":"10-June-2018",
    "estimated_budget":"100000",
    "currency":"KWR",
    "sentDate":"31-05-2018",
    "message_body":"I would like to visit for a treatment on Lasek."
};

let optionsPatient = {
    userIds: [{ username:'patient0001', email:'johndoe@medipedia.com' }], 
    curve: "ed25519",
    passphrase: 'super long and hard to guess secret'
};

let optionsProvider = {
    userIds: [{ username:'medicalProvider', email:'medical_provider@medipedia.com' }],
    curve: "ed25519",
    passphrase: 'super long and hard to guess secret of provider'
};

let patient = {
    privateKey: '',
    publicKey: ''
};

let medicalProvider = {
    privateKey: '',
    publicKey: ''
};

let patientKeys = openpgp.generateKey(optionsPatient).then(function(key) {
    console.log("success patientkeys!");
    patient.privateKey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
    patient.publicKey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
    //console.log(patient.publicKey);
});

let medicalProviderKeys = openpgp.generateKey(optionsProvider).then(function(key) {
    medicalProvider.privateKey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
    medicalProvider.publicKey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
});

patientKeys.then(function(res){
    console.log("Encrypting data!");
    encryptDecryptFunction(medicalProvider.privateKey, medicalProvider.publicKey, 
            patient.publicKey, patient.privateKey, optionsPatient.passphrase.toString())
});

const encryptDecryptFunction = async(medicalProviderPrivateKey, medicalProviderPublicKey, patientPubkey, patientPrikey, passphrase) => {
    //console.log((await openpgp.key.readArmored(patientPrikey)).keys[0]);
    var test = (await openpgp.key.readArmored(patientPrikey)).keys[0]
    console.log("test",test)
    const privKeyObj = test//await openpgp.key.readArmored(patientPrikey).keys[0]
    await privKeyObj.decrypt(passphrase)

    const providerPassphrase= 'super long and hard to guess secret of provider';
    const providerPrivKeyObj = (await openpgp.key.readArmored(medicalProviderPrivateKey)).keys[0]
    await providerPrivKeyObj.decrypt(providerPassphrase)
    
    const optionsPatient = {
        data: JSON.stringify(msgRequest), 
        publicKeys: openpgp.key.readArmored(medicalProviderPublicKey).keys, 
        privateKeys: [privKeyObj] 
    }
    
    console.log(optionsPatient.data);
    openpgp.encrypt(optionsPatient).then(ciphertext => {
        encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        console.log(encrypted)
        return encrypted
    }).then(encrypted => {
        const encryptedIpfsHash =  ipfs.add(encrypted);
        return encryptedIpfsHash;
    }).then(hash => {
        const encryptedMessage =  ipfs.cat(hash);
        return encryptedMessage;
    }).then(encryptedMessage => {
        return encryptedMessage;
    }).then(encrypted => {
        const optionsProvider = {
            message: openpgp.message.readArmored(encrypted),   
            publicKeys: openpgp.key.readArmored(medicalProviderPublicKey).keys,  
            privateKeys: [providerPrivKeyObj]                            
        }
         
        openpgp.decrypt(optionsProvider).then(decryptedMessage => {
            console.log(JSON.parse(decryptedMessage.data))
            return decryptedMessage.data 
        })
       
    })
    
}