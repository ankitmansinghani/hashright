const fs = require('fs')

file = fs.readFile('/home/jaydeep/Documents/Blockchain/hashright/modules/photo-1530285897338-d9d80e81d078.jpeg')

var pHash = require('phash-imagemagick');
let a,b;
pHash.get('/home/jaydeep/Documents/Blockchain/hashright/modules/photo-1530285897338-d9d80e81d078.jpeg', function(err, data) {
  console.log(data);
  a = data;
});

pHash.get('./j.jpg', function(err, data) {
	console.log(data);
	b = data;
});

pHash.eq(a,b);