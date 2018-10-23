var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname)));
app.use("/pubilc/css", express.static(__dirname));
app.use("/pubilc/assets", express.static(__dirname));
app.use("/pubilc/js", express.static(__dirname));

// viewed at based directory http://localhost:8080/
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.listen(process.env.PORT || 8080);
