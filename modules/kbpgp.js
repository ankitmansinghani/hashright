const IPFS = require('nano-ipfs-store'),
        ipfs = IPFS.at("https://ipfs.infura.io:5001"),
        curveAlgo = "ed25519",
        fs = require('fs'),
        keyPath = "../keystore",
        openpgp = require('openpgp');
var kbpgp = require('kbpgp');


var F = kbpgp["const"].openpgp;

async function pgpKeyGenerator(name,email,signName,pass) {

    let opts = {
        userid: name+" <"+email+">",
        primary: {
          nbits: 4096,
          flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage,
          expire_in: 0  // never expire
        },
        subkeys: [
          {
            nbits: 2048,
            flags: F.sign_data,
            expire_in: 86400 * 365 * 8 // 8 years
          }, {
            nbits: 2048,
            flags: F.encrypt_comm | F.encrypt_storage,
            expire_in: 86400 * 365 * 8
          }
        ]
      };
      
    kbpgp.KeyManager.generate(opts, function(err, name) {
        if (!err) {
          // sign name's subkeys
          name.sign({}, function(err) {
            //console.log(name);
            // export demo; dump the private with a passphrase
            name.export_pgp_private ({
              passphrase: pass
            }, function(err, pgp_private) {
              //console.log("private key: ", pgp_private);
              fs.writeFileSync("../keystore/"+signName+".priv_key",pgp_private)
            });
            name.export_pgp_public({}, function(err, pgp_public) {
              //console.log("public key: ", pgp_public);
              fs.writeFileSync("../keystore/"+signName+".pub_key",pgp_public)
            });
          });
          console.log("success!");
          return true;
        } else {
            console.log("failure!");
            return false;
        }

      });

}


async function pubkeyLoader(name) {
    var pgp_pub_key = fs.readFileSync("../keystore/"+name+".pub_key");

    kbpgp.KeyManager.import_from_armored_pgp({
      armored: pgp_pub_key
    }, function(err, pub_key) {
      if (!err) {
        console.log("pub key is loaded");
        console.log(pub_key);
      }
    });
}


async function privkeyLoader(name, pass) {
    var pgp_priv_key = fs.readFileSync("../keystore/"+name+".priv_key");;
    var passphrase = pass;
    
    kbpgp.KeyManager.import_from_armored_pgp({
      armored: pgp_priv_key
    }, function(err, priv_key) {
      if (!err) {
        if (priv_key.is_pgp_locked()) {
          priv_key.unlock_pgp({
            passphrase: passphrase
          }, function(err) {
            if (!err) {
              console.log("Loaded private key with passphrase",priv_key);
            }
          });
        } else {
          console.log("Loaded private key w/o passphrase",priv_key);
        }
      }
    });
}



async function signEncrypt(filePath,encryptFor,signer) {
    var buffer = fs.readFileSync(filePath);
    var params = {
      msg:         buffer,
      encrypt_for: encryptFor,
      sign_with:   signer
    };
    
    kbpgp.box (params, function(err, result_string, result_buffer) {
      fs.writeFileSync('dirty_deeds.encrypted', result_buffer);
      return true;
    });
}


//pgpKeyGenerator("Alice","jaydeeplc@hotmail.com","alice","alice@123")
//pubkeyLoader("jaydeep");
// privkeyLoader("jaydeep","jadd@2207");
// pubkeyLoader("alice");
async function t() {
    try {
        let alice = await pubkeyLoader("alice");
        let jaydeep = await privkeyLoader("jaydeep","jadd@2207");
        let status = await signEncrypt("/home/jaydeep/Pictures/photo-1530285897338-d9d80e81d078.jpeg",alice,jaydeep);
    } catch(error) {
        console.log(error.message);
    }
}
t();
