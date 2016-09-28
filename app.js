const express = require('express');
var port = process.env.PORT || 3000;
var http = require('http'),
    app = express();
var bodyParser = require('body-parser')
var cors = require('cors');
var request = require("request");

var options = {};

app.use(cors());

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.use('/', express.static(__dirname + '/'));

app.use('/api/q', function(req, res) {
  var options = req.body;
  var dataType = options.respLang;
  var node = options.node;
  request(options, function (error, response, body) {
    if (error) {
      var obj = {};
      obj.raw = error;
      obj.html = "";
      obj.csv = "";
      res.send(obj);
    } else {
      parseOutput(dataType, body, node, function(obj) {
        res.send(obj);
      });
    }
  });
});

app.listen(port, function() {
  console.log("Listening on https://127.0.0.1:3000");
});

var xmlParser = require('simple-xml2json');
var js2table = require('json-to-table');

var parseOutput = function(dataType, body, node, callback) {
  if (dataType == 'xml') {
    var xmlText = body;
    var result = xmlParser.parser( xmlText );
    result = resolveJSON(result, node);
    jsonArraytoHTMLCSV(body,js2table(result), function(obj) {
      callback(obj);
    });
  } else {
    jsonArraytoHTMLCSV(body, body, function(obj) {
      callback(obj);
    });
  }
}

var jsonArraytoHTMLCSV = function(raw, jsarray, callback) {
  if (jsarray.length > 0) {
    var html = "<table class='table table-hover'><thead><tr>";
    var csv = "";
    var returnObj = {};
    returnObj.raw = raw;
    var headers = jsarray[0];
    for (var h = 0; h < headers.length; h++) {
      html += "<th>" + headers[h] + "</th>";
    }
    html += "</tr></thead><tbody>";
    for (var i = 1; i < jsarray.length; i++) {
      var data = jsarray[i].toString();
      data = data.replace("[object Object]","");
      html += "<tr><td>" + data.replace(/,/g,"</td><td>") + "</td></tr>"
    }
    html += "</tbody></table>";
    returnObj.html = html;
    for (var i=0; i < jsarray.length; i++) {
      var data = jsarray[i].toString()
      data = data.replace("[object Object]","");
      csv += data;
      csv += '<br/>'
    }
    returnObj.csv = csv;
    callback(returnObj);
  }
}

var resolveJSON = (function(){

    var UNRESOLVED = resolve.UNRESOLVED = {};
    return resolve;

    function resolve(cur, ns) {

        var undef;

        ns = ns.split('.');

        while (cur && ns[0])
            cur = cur[ns.shift()] || undef;

        if (cur === undef || ns[0]) {
            return UNRESOLVED;
        }

        return cur;

    }

}());
