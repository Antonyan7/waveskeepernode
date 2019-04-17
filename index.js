var express = require('express');
var app = express();
var mail = require('./mail');

// app.get('/', function(req, res){
//     res.send('hello world');
// });


app.get('/send', function(req, res){
  mail.main().catch(console.error);
});

app.use(express.static('public'))

app.listen(3000);
