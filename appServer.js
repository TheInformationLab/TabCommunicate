const express = require('express');
var port = process.env.PORT || 3000;
var http = require('http'),
    app = express();
var bodyParser = require('body-parser')
var cors = require('cors');
var request = require("request");

app.set('trust proxy', 'loopback, linklocal, 172.30.52.0/24, 172.30.51.0/24');

var ua = require('universal-analytics');
app.use(ua.middleware("UA-27427363-10", {cookieName: '_ga'}));
var visitor = ua('UA-27427363-10', {https: true}).debug();

console.log(visitor);

var options = {};

app.use(cors());

app.use( bodyParser.json({limit: '5000mb'}) );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({ extended:true, limit: '5000mb', parameterLimit: 10000000}));

app.use('/download', function(req, res) {
  console.log("download");
  var fs = require('fs');
  //var logStream = fs.createWriteStream('/var/log/tabcommunicate/log.txt', {'flags': 'a'});
  var clientInfo = {};
  clientInfo.timestamp = new Date();
  clientInfo.host = req.headers.host;
  clientInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  clientInfo.userAgent = req.headers['user-agent'];
  clientInfo.url = req.url;
  clientInfo.method = req.method;
  if (clientInfo.userAgent != "ELB-HealthChecker/1.0" && clientInfo.url == "/download") {
    //logStream.end(JSON.stringify(clientInfo)+"\n");
    var visitorParams = {
      dp: clientInfo.url,
      dt: "Publc",
      dh: clientInfo.host,
      uip: clientInfo.ip,
      ua: clientInfo.userAgent
    }
    visitor.pageview(visitorParams).send();
  }
  res.writeHead(301,
    {Location: 'http://www.theinformationlab.co.uk/tabcommunicate'}
  );
  res.end();
});


app.use('/', function(req, res, next) {
  var fs = require('fs');
  //var logStream = fs.createWriteStream('/var/log/tabcommunicate/log.txt', {'flags': 'a'});
  var clientInfo = {};
  clientInfo.timestamp = new Date();
  clientInfo.host = req.headers.host;
  clientInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  clientInfo.userAgent = req.headers['user-agent'];
  clientInfo.url = req.url;
  clientInfo.method = req.method;
  if (clientInfo.userAgent != "ELB-HealthChecker/1.0" && (clientInfo.url == "/index.html" || clientInfo.url == "/version.json" )) {
    //logStream.end(JSON.stringify(clientInfo)+"\n");
    var visitorParams = {
      dp: clientInfo.url,
      dt: "Public",
      dh: clientInfo.host,
      uip: clientInfo.ip,
      ua: clientInfo.userAgent
    }
    visitor.pageview(visitorParams).send();
  }
  next();
} , express.static(__dirname + '/'));

app.use('/api/q', function(req, res) {
  var options = req.body;
  var dataType = options.respLang;
  var node = options.node;
  var noResponse = false;
  if (node == "authinfo") {
    options.qs = { format: 'xml' };
  } else if (node == "none") {
    noResponse = true;
  }
  delete options.respLang;
  delete options.node;
  var fs = require('fs');
  //var logStream = fs.createWriteStream('/var/log/tabcommunicate/log.txt', {'flags': 'a'});
  var clientInfo = {};
  clientInfo.timestamp = new Date();
  clientInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  clientInfo.host = req.headers.host;
  clientInfo.userAgent = req.headers['user-agent'];
  clientInfo.url = req.url;
  clientInfo.method = req.method;
  //logStream.end(JSON.stringify(clientInfo)+"\n");
  var eventParams = {
    ec: "API",
    ea: "Query",
    el: "Node",
    ev: node,
    dp: "/index.html",
    uip: clientInfo.ip,
    ua: clientInfo.userAgent
  }
  visitor.event(eventParams).send();
  request(options, function (error, response, body) {
    if (error) {
      var obj = {};
      obj.raw = error;
      obj.html = error;
      obj.csv = error;
      res.send(obj);
    } else {
      if (noResponse) {
        var obj = {};
        obj.raw = "Command Executed. Tableau Server doesn't return a response body to this command.";
        obj.html = "Command Executed. Tableau Server doesn't return a response body to this command.";
        obj.csv = "Command Executed. Tableau Server doesn't return a response body to this command.";
        res.send(obj);
      } else {
        parseOutput(dataType, body, node, function(obj) {
          res.send(obj);
        });
      }
    }
  });
});

app.use('/api/tde', function(req, res) {
  var fs = require('fs');
  //var logStream = fs.createWriteStream('/var/log/tabcommunicate/log.txt', {'flags': 'a'});
  var clientInfo = {};
  clientInfo.timestamp = new Date();
  clientInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  clientInfo.host = req.headers.host;
  clientInfo.userAgent = req.headers['user-agent'];
  clientInfo.url = req.url;
  clientInfo.method = req.method;
  //logStream.end(JSON.stringify(clientInfo)+"\n");
  var eventParams = {
    ec: "API",
    ea: "TDE",
    el: "Node",
    ev: req.body.node,
    dp: "/index.html",
    uip: clientInfo.ip,
    ua: clientInfo.userAgent
  }
  visitor.event(eventParams).send();
  var PythonShell = require('python-shell');
  getAllData(req, '', 0, function(csv) {
    //var response = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
    //res.send(response);
    var fs = require('fs');
    var path = require('path');
    var randStr = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    var csvFile = 'TabCommunicate-' + randStr + '.csv';
    var iniFile = 'TabCommunicate-' + randStr + '.ini';
    var headers = csv.match(/^.*/g);
    var headArr = headers[0].split(',');
    var ini = '[/etc/tabcommunicate/files/' + csvFile + ']\n';
    ini += 'ColNameHeader=True\n';
    for (i=0;i<headArr.length;i++) {
      var colNo = i + 1;
      ini += 'col'+colNo+'=' + headArr[i] + ' Text\n';
    }
    fs.writeFile('./files/' + iniFile, ini, function(err) {
      if(err) {
          console.log(err);
      }
      fs.writeFile('./files/' + csvFile, csv, function(err) {
        if(err) {
            console.log(err);
        }
        fs.chmodSync('./files/' + csvFile, '744');
        fs.chmodSync('./files/' + iniFile, '744');
        var options = {
          scriptPath: '/etc/tabcommunicate/files',
          args: ['/etc/tabcommunicate/files/'+csvFile, '/etc/tabcommunicate/files/'+iniFile]
        };
        PythonShell.run('csv2tde.py', options, function (err) {
          if (err) throw err;
          res.send('./files/' + csvFile.replace('.csv','.tde'));
          setTimeout(function () {
            fs.unlinkSync('./files/' + iniFile);
            fs.unlinkSync('./files/' + csvFile);
            fs.unlinkSync('./files/' + csvFile.replace('.csv','.tde'));
          }, 5000);
        });
      });
    });
  });
});

app.use('/api/csv', function(req, res) {
  var fs = require('fs');
  //var logStream = fs.createWriteStream('/var/log/tabcommunicate/log.txt', {'flags': 'a'});
  var clientInfo = {};
  clientInfo.timestamp = new Date();
  clientInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  clientInfo.host = req.headers.host;
  clientInfo.userAgent = req.headers['user-agent'];
  clientInfo.url = req.url;
  clientInfo.method = req.method;
  //logStream.end(JSON.stringify(clientInfo)+"\n");
  var eventParams = {
    ec: "API",
    ea: "CSV",
    el: "Node",
    ev: req.body.node,
    dp: "/index.html",
    uip: clientInfo.ip,
    ua: clientInfo.userAgent
  }
  visitor.event(eventParams).send();
  getAllData(req, '', 0, function(csv) {
    //var response = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
    //res.send(response);
    var fs = require('fs');
    var mktemp = require('mktemp');
    var path = require('path');
    mktemp.createFile('./files/TabCommunicate-XXXXXXX.csv', function(err, tempFile) {
      if (err) throw err;
      fs.writeFile(tempFile, csv, function(err) {
        if(err) {
            return console.log(err);
        }
        res.send(tempFile);
        setTimeout(function () {
          fs.unlinkSync(tempFile);
        }, 5000);
      });
    });
  });
});

app.use('/remote/tde', function(req, res) {
  var fs = require('fs');
  //var logStream = fs.createWriteStream('/var/log/tabcommunicate/log.txt', {'flags': 'a'});
  var clientInfo = {};
  clientInfo.timestamp = new Date();
  clientInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  clientInfo.host = req.headers.host;
  clientInfo.userAgent = req.headers['user-agent'];
  clientInfo.url = req.url;
  clientInfo.method = req.method;
  //logStream.end(JSON.stringify(clientInfo)+"\n");
  var eventParams = {
    ec: "Remote",
    ea: "TDE",
    el: "Node",
    ev: req.body.node,
    uip: clientInfo.ip,
    ua: clientInfo.userAgent
  }
  visitor.event(eventParams).send();
  var data = req.body;
  var fs = require('fs');
  var path = require('path');
  parseOutput('json', data.content, data.node, function(obj) {
    var csv = obj.csv;
    csv = csv.replace(/<br\/>/g,'\n');
    var PythonShell = require('python-shell');
    var fs = require('fs');
    var path = require('path');
    var randStr = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    var csvFile = 'TabCommunicate-' + randStr + '.csv';
    var iniFile = 'TabCommunicate-' + randStr + '.ini';
    var headers = csv.match(/^.*/g);
    var headArr = headers[0].split(',');
    var ini = '[/etc/tabcommunicate/files/' + csvFile + ']\n';
    ini += 'ColNameHeader=True\n';
    for (i=0;i<headArr.length;i++) {
      var colNo = i + 1;
      ini += 'col'+colNo+'=' + headArr[i] + ' Text\n';
    }
    fs.writeFile('./files/' + iniFile, ini, function(err) {
      if(err) {
          console.log(err);
      }
      fs.writeFile('./files/' + csvFile, csv, function(err) {
        if(err) {
            console.log(err);
        }
        fs.chmodSync('./files/' + csvFile, '744');
        fs.chmodSync('./files/' + iniFile, '744');
        var options = {
          scriptPath: '/etc/tabcommunicate/files',
          args: ['/etc/tabcommunicate/files/'+csvFile, '/etc/tabcommunicate/files/'+iniFile]
        };
        PythonShell.run('csv2tde.py', options, function (err) {
          if (err) throw err;
          res.send('./files/' + csvFile.replace('.csv','.tde'));
          setTimeout(function () {
            fs.unlinkSync('./files/' + iniFile);
            fs.unlinkSync('./files/' + csvFile);
            fs.unlinkSync('./files/' + csvFile.replace('.csv','.tde'));
          }, 5000);
        });
      });
    });
  });

});

var getAllData = function (req, data, page, callback) {
  var options = req.body;
  var dataType = options.respLang;
  var node = options.node;
  var noResponse = false;
  if (node == "authinfo") {
    options.qs = { format: 'xml' };
  } else if (node == "none") {
    noResponse = true;
  }
  delete options.respLang;
  delete options.node;
  if (page > 1) {
    options.url = options.url + '?pageNumber=' + page;
;  }
  request(options, function (error, response, body) {
    if (error) {
      var obj = {};
      obj.raw = error;
      obj.html = error;
      obj.csv = error;
      res.send(obj);
    } else {
      if (noResponse) {
        var obj = {};
        obj.raw = "Command Executed. Tableau Server doesn't return a response body to this command.";
        obj.html = "Command Executed. Tableau Server doesn't return a response body to this command.";
        obj.csv = "Command Executed. Tableau Server doesn't return a response body to this command.";
        res.send(obj);
      } else {

        parseOutput(dataType, body, node, function(obj) {
          var csv = obj.csv;
          csv = csv.replace(/<br\/>/g,'\n');
          if (page > 1) {
            csv = csv.replace(/^.*\n/g,'');
          }
          data += csv;
          if(obj.more) {
            options.respLang = dataType;
            options.node = node;
            req.body = options;
            getAllData(req, data, obj.nextPage, callback);
          } else {
            callback(data);
          }
        });
      }
    }
  });
}

app.listen(port, function() {
  console.log("Listening on http://127.0.0.1:3000");
});

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(3080);

var xmlParser = require('simple-xml2json');
var js2table = require('json-to-table');

var parseOutput = function(dataType, body, node, callback) {
  if (dataType == 'xml') {
    var xmlText = body;
    var jsonResult = xmlParser.parser( xmlText );
    result = resolveJSON(jsonResult, node);
    pagination = resolveJSON(jsonResult, 'tsresponse.pagination');
    if(pagination) {
      if ((pagination.pagenumber * pagination.pagesize) >=  pagination.totalavailable) {
        var more = false;
        var nextPage = 0;
      } else {
        var more = true;
        var nextPage = pagination.pagenumber + 1;
      }
    }
    jsonArraytoHTMLCSV(body,js2table(result), function(obj) {
      obj.more = more;
      obj.nextPage = nextPage;
      callback(obj);
    });
  } else {
    var result = body[node];
    jsonArraytoHTMLCSV(body, js2table(result), function(obj) {
      callback(obj);
    });
  }
}

var jsonArraytoHTMLCSV = function(raw, jsarray, callback) {
  if (jsarray.length > 0) {
    var html = "<table class='table table-hover'><thead><tr>";
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
    buildData(jsarray, function(csv) {
      returnObj.csv = csv;
      callback(returnObj);
    });
  }
}

var buildData = function (dataArr, callback) {
  var data = ""
  if (dataArr.length > 0) {
    for(var i=0; i<dataArr.length; i++) {
      data += buildRow(dataArr[i]);
      data += "<br/>";
    }
    callback(data);
  }
}

var buildRow = function (rowArr) {
  var row = "";
  if (rowArr.length > 0) {
    for (var i=0; i<rowArr.length; i++) {
      if (i==0) {
        row += '"' + rowArr[i] + '"';
      } else {
        row += ',"' + rowArr[i] + '"';
      }
    }
  }
  return row;
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
