const watermark = require('image-watermark-2');
const msg = "HashRight";
const fs = require('fs')
const dest = './watermark/';
//watermark.embedWatermark('./drm.pdf', {'text' : msg});



async function watermarkAsset(name,source,ext) {
    let path = dest+name+"."+ext;
    let options = {
        'text' : msg,
        'dstPath' : path
    }
    console.log((options.dstPath));
    //file = fs.readFileSync(source);
    watermark.embedWatermark(source, options)
    return path;
}

//watermarkAsset("j","/home/jaydeep/Pictures/photo-1530285897338-d9d80e81d078.jpeg",'jpg');

module.exports = watermarkAsset;