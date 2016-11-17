var fs = require('fs');
var path = require('path');
var request = require("request");
var pjson = require('./package.json');

var options = {
  "url": "https://tabcommunicate.theinformationlab.co.uk/version.json",
  "method": "GET"
}

request(options, function (error, response, body) {
  if (error) {
    console.log(JSON.stringify(error));
  } else {
    localStorage.download = false;
    var resp = JSON.parse(body);
    var localVersion = pjson.version;
    localVersion = localVersion.replace(/.0$/,"");
    localVersion = localVersion * 1;
    console.log(localVersion);
    buildUpdateList(localVersion, resp, 0, [], function(updatedFiles) {
      for (var i=0; i < updatedFiles.length; i++) {
        var options = {
          "url": "https://tabcommunicate.theinformationlab.co.uk/" + updatedFiles[i],
          "method": "GET"
        }
        request(options, function (error, response, body) {
          if (error) {
            console.log(JSON.stringify(error));
          } else {
            fs.writeFile("." + response.request.path, body, {flag : 'w'}, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log("Updated " + "." + response.request.path);
              }
            });
          }
        });
      }
      if (localStorage.download == false) {
        pjson.version = resp[0].version;
        fs.writeFile("./package.json", JSON.stringify(pjson), {flag : 'w'}, function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }
});

var buildUpdateList = function (curVersion, versionJson, i, updateList, callback) {
  var newVersion = versionJson[i].version;
  newVersion = newVersion.replace(/.0$/,"");
  newVersion = newVersion * 1;
  if (newVersion > curVersion) {
    var files = versionJson[i].updatedFiles;
    for (var j=0; j < files.length; j++) {
      if (files[j] == "download") {
        localStorage.download = true;
      }
      else if (arrayDoesNotContain(files[j], updateList)) {
        updateList.push(files[j]);
      }
    }
  }
  i = i + 1;
  if (i < versionJson.length) {
    buildUpdateList(curVersion, versionJson, i, updateList, callback);
  } else {
    callback(updateList);
  }
}

function arrayDoesNotContain(needle, arrhaystack)
{
  return (arrhaystack.indexOf(needle) == -1);
}
