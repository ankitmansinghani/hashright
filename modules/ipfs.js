var ipfsAPI = require('ipfs-api')

var ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'})
const fs = require('fs');

let testFile = fs.readFileSync("/home/jaydeep/Pictures/photo-1530285897338-d9d80e81d078.jpeg");
let testBuffer = new Buffer(testFile);
 
ipfs.files.add(testBuffer,function(err, result){
    if(!err) {
        console.log("Success",result[0].hash);
    } else {
        console.log(err)
    }
})

async function upload(filePath) {
    file = fs.readFileSync(filePath);
    let fileBuffer = new Buffer(file);
    ipfs.files.add(fileBuffer,function(err, result){
        if(!err) {
            console.log("Success",result[0].hash);
            return result[0].hash;
        } else {
            console.log(err)
            return err;
        }
    })
}

module.exports = {

    uploadToIPFS : async(filePath) => {
        file = fs.readFileSync(filePath);
        let fileBuffer = new Buffer(file);
        ipfs.files.add(fileBuffer,function(err, result){
            if(!err) {
                console.log("Success",result[0].hash);
                return result[0].hash;
            } else {
                console.log(err)
                return err;
            }
        })
    }
    
};
