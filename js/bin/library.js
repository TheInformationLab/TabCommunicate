var lib = {};

lib.jsAjax = function(method, url, headers, body) {
  var codebase = 'var settings = {\n\
    "async": true,\n\
    "crossDomain": true,\n\
    "url":\ "'+url+'",\n\
    "method": "'+method+'",\n\
    "contentType": "text/xml",\n\
    "dataType": "xml",\n';
  if (headers != undefined) {
    codebase += '    "headers": '+JSON.stringify(headers)+',\n';
  }
  if (body != undefined) {
    codebase += '    "data": "'+body+'"\n';
  }
  codebase += '}\n\
  \n\
  $.ajax(settings).done(function (response) {\n\
    console.log(response);\n\
  });';

  return codebase;
}

lib.nodeRequest = function(method, url, headers, body) {
  var codebase = 'var request = require("request");\n\n\
var options = { \n  method: "'+method+'",\n\
  url:\ "'+url+'",\n';
  if (headers != undefined) {
    codebase += '  headers: '+JSON.stringify(headers)+',\n';
  }
  if (body != undefined) {
    codebase += '  body: "'+body+'"\n';
  }
  codebase += '};\n\
  \n\
request(options, function (error, response, body) {\n\
  if (error) throw new Error(error);\n\
  console.log(body);\n\
});';

  return codebase;
}

lib.phpHttpRequest = function (method,url,headers,body) {
  var codebase = "<?php\n\
  $request = new HttpRequest();\n\
  $request->setUrl( '" + url + "' );\n\
  $request->setMethod(HTTP_METH_"+method+");\n\
  $request->setHeaders(array(\n\
  \t'Accept' => 'text/xml'\n\
  \t'Content-Type' => 'text/xml'\n";
  if (headers != undefined) {
    $.each(headers, function(name, val) {
      codebase += "\t'"+name+"' => '"+val+"',\n";
    });
  }
  codebase += "\t));\n"
  if (body != undefined) {
    codebase += '\t$request->setBody("'+body+'");\n'
  }
  codebase += "  try {\n\
    $response = $request->send();\n\
    echo $response->getBody();\n\
  } catch (HttpException $ex) {\n\
    echo $ex;\n\
  }\n";

  return codebase;
}

lib.phpcURL = function (method,url,headers,body) {
  var codebase = '$curl = curl_init();\n\n\
curl_setopt_array($curl, array(\n\
CURLOPT_URL => "'+url+'",\n\
CURLOPT_RETURNTRANSFER => true,\n\
CURLOPT_ENCODING => "",\n\
CURLOPT_MAXREDIRS => 10,\n\
CURLOPT_TIMEOUT => 30,\n\
CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n\
CURLOPT_CUSTOMREQUEST => "'+method+'",\n'
  if (body != undefined) {
    codebase += 'CURLOPT_POSTFIELDS => "'+body.replace(/\"/g,'\\"')+'",\n';
  }
  codebase += 'CURLOPT_HTTPHEADER => array(\n\
    \t"content-type: text/xml",\n';
    if (headers != undefined) {
      $.each(headers, function(name, val) {
        codebase += '\t"'+name+': '+val+'",\n';
      });
    }
  codebase += '  ),\n\
));\n\
$response = curl_exec($curl);\n\
$err = curl_error($curl);\n\
curl_close($curl);\n\
if ($err) {\n\
  echo "cURL Error #:" . $err;\n\
} else {\n\
  $tsResponse = simplexml_load_string($response);\n\
  var_dump($tsResponse);\n\
}';

  return codebase;
}
