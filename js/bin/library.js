var lib = {};

lib.jsAjax = function(method, url, headers, body, publish, reqPayload) {
  if (!publish) {
    var codebase = 'var settings = {\n\
      "async": true,\n\
      "crossDomain": true,\n\
      "url":\ "'+url+'",\n\
      "method": "'+method+'",\n';
    if (headers != undefined) {
      var headerStr = JSON.stringify(headers);
      headerStr = headerStr.replace(/({|\",)/g,"$1\n\t");
      headerStr = headerStr.replace(/(})/g,"\n\t$1");
      codebase += '    "headers": '+headerStr+',\n';
    }
    if (body != undefined) {
      codebase += '    "data": \''+body+'\'\n';
    }
    codebase += '}\n\
    \n\
    $.ajax(settings).done(function (response) {\n\
      console.log(response);\n\
    });';
  } else {
    var codebase = '<input type="file" id="file"/>\n\
<input type="button" id="submit" value="Submit"></input>\n\
\n\
<script>\n\
  $("#submit").click(function () {\n\
    var form = new FormData();\n\
    form.append("request_payload", "'+reqPayload+'");\n\
    var fileInput = document.getElementById("file");\n\
    var file = fileInput.files[0];\n\
    form.append("'+publish+'", file);\n\
\n\
    var settings = {\n\
      "async": true,\n\
      "crossDomain": true,\n\
      "url": "'+url+'",\n\
      "method": "'+method+'",\n\
      "headers": {\n\
        "X-Tableau-Auth": "'+headers["X-Tableau-Auth"]+'"\n\
      },\n\
      "processData": false,\n\
      "contentType": false,\n\
      "mimeType": "multipart/mixed",\n\
      "data": form\n\
    }\n\
\n\
    $.ajax(settings).done(function(response) {\n\
      console.log(response);\n\
    });\n\
  });\n\
\n\
</script>';
  }

  return codebase;
}

lib.nodeRequest = function(method, url, headers, body, publish, reqPayload) {
  if (!publish) {
    var codebase = 'var request = require("request");\n\n\
    var options = { \n  method: "'+method+'",\n\
    url:\ "'+url+'",\n';
    if (headers != undefined) {
      codebase += '  headers: '+JSON.stringify(headers)+',\n';
    }
    if (body != undefined) {
      codebase += '  body: \''+body+'\'\n';
    }
    codebase += '};\n\
    \n\
    request(options, function (error, response, body) {\n\
    if (error) throw new Error(error);\n\
    console.log(body);\n\
    });';
  } else {
    var codebase = 'const { URL } = require("url");\n\
const servURL = new URL("'+url+'");\n\
\n\
if (servURL.port) {\n\
  var servPort = servURL.port;\n\
} else if (servURL.protocol == "https:") {\n\
  var servPort = 443;\n\
} else {\n\
  var servPort = 80;\n\
}\n\
\n\
var fs = require("fs");\n\
var form = new FormData();\n\
form.append("request_payload", "'+reqPayload+'", {contentType: "text/xml"});\n\
//Replace workbook.twbx with location of workbook or datasource file\n\
form.append("'+publish+'", fs.createReadStream("workbook.twbx",{contentType: "application/octet-stream"}));\n\
form.submit(\n\
  {\n\
    protocol: servURL.protocol,\n\
    host: servURL.hostname,\n\
    port: servPort,\n\
    path: servURL.pathname + servURL.search,\n\
    method: '+method+',\n\
    headers: {\n\
        "X-Tableau-Auth": "'+headers['X-Tableau-Auth']+'",\n\
        "Content-Type": "multipart/mixed; boundary=" + form.getBoundary()\n\
    }\n\
}, function(err, response) {\n\
      if (err) {\n\
        console.log(err);\n\
      }\n\
      var resp = "";\n\
      response.on("data", function (chunk) {\n\
        resp += chunk;\n\
      });\n\
      response.on("end", function () {\n\
        console.log(resp);\n\
      });\n\
  });'
  }
  return codebase;
}

lib.phpHttpRequest = function(method, url, headers, body, publish, reqPayload) {
  if (!publish) {
    var codebase = "<?php\n\
    $request = new HttpRequest();\n\
    $request->setUrl( '" + url + "' );\n\
    $request->setMethod(HTTP_METH_"+method+");\n\
    $request->setHeaders(array(\n";
    if (headers != undefined) {
      $.each(headers, function(name, val) {
        codebase += "\t'"+name+"' => '"+val+"',\n";
      });
    }
    codebase += "\t));\n"
    if (body != undefined) {
      codebase += '\t$request->setBody(\''+body+'\');\n'
    }
    codebase += "  try {\n\
      $response = $request->send();\n\
      echo $response->getBody();\n\
    } catch (HttpException $ex) {\n\
      echo $ex;\n\
    }\n";

    return codebase;
  } else {
    return "";
  }
}

lib.phpcURL = function (method,url,headers,body, publish, reqPayload) {
  if (!publish) {
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
  codebase += 'CURLOPT_HTTPHEADER => array(\n';
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
  } else {
    var codebase = '<?php\n\
  $curl = curl_init();\n\
  //Replace workbook.twbx with location of workbook or datasource file\n\
  $file = new CurlFile(\'workbook.twbx\');\n\
  curl_setopt_array($curl, array(\n\
  CURLOPT_URL => "'+url+'",\n\
  CURLOPT_RETURNTRANSFER => true,\n\
  CURLOPT_ENCODING => "",\n\
  CURLOPT_MAXREDIRS => 10,\n\
  CURLOPT_TIMEOUT => 30,\n\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n\
  CURLOPT_CUSTOMREQUEST => "'+method+'",\n\
  CURLOPT_POSTFIELDS => array(\n\
    \'request_payload\' => \''+reqPayload+'\',\n\
    \'tableau_workbook\' => $file\n\
  ),\n\
  CURLOPT_HTTPHEADER => array(\n\
    "X-Tableau-Auth: '+headers['X-Tableau-Auth']+'",\n\
    "Content-Type:multipart/mixed"\n\
  ),\n\
  ));\n\
  $curlOptions = curl_getinfo($curl);\n\
  var_dump($curlOptions);\n\
  $response = curl_exec($curl);\n\
  $err = curl_error($curl);\n\
  curl_close($curl);\n\
  if ($err) {\n\
    echo "cURL Error #:" . $err;\n\
  } else {\n\
    $tsResponse = simplexml_load_string($response);\n\
    var_dump($tsResponse);\n\
  }'
  }

  return codebase;
}

lib.pyRequests = function(method, url, headers, body, publish, reqPayload) {
  if (!publish) {
    var codebase = 'import requests\n\n\
  url = "'+url+'"\n\n'
    if (body != undefined) {
      codebase += 'payload = \''+body.replace(/\\\n\s+/g,'\\n  ') + '\'\n\n';
    }
    if (headers != undefined) {
      codebase += 'headers = ' + JSON.stringify(headers) + '\n\n';
    }
    codebase += 'response = requests.request("'+method+'", url, data=payload, headers=headers)\n\n\
  print(response.text)';

    return codebase;
  } else {
    return "";
  }
}

lib.pyHttp = function(method, url, headers, body, publish, reqPayload) {
  if (!publish) {
    var parser = document.createElement('a');
    parser.href = url;
    if (parser.protocol == "https:") {
      var codebase = 'import http.client\n\n\
  conn = http.client.HTTPSConnection("'+parser.hostname+'")\n\n'
    } else {
      var codebase = 'import http.client\n\n\
  conn = http.client.HTTPConnection("'+parser.hostname+'")\n\n';
    }
    if (body != undefined) {
      codebase += 'payload = \''+body.replace(/\\\n\s+/g,'\\n  ') + '\'\n\n';
    }
    if (headers != undefined) {
      codebase += 'headers = ' + JSON.stringify(headers) + '\n\n';
    }
    codebase += 'conn.request("'+method+'", "'+parser.pathname+'", payload, headers)\n\n\
  res = conn.getresponse()\n\
  data = res.read()\n\n\
  print(data.decode("utf-8"))';

    return codebase;
  } else {
    return "";
  }
}

lib.alteryx = function(method, url, headers, body, publish, reqPayload) {
    if (!publish) {
    var codebase = `
  // Input field named URL set to value `+url+`

    <Configuration>
      <URLField>URL</URLField>
      <OutputMode>String</OutputMode>
      <CodePage>65001</CodePage>
      <EncodeURLs value="False" />
      <Headers>
        <NameValues>
          <Item name='Content-Type' value='text/xml'/>\n`;
    if (headers != undefined) {
      $.each(headers, function(name, val) {
        codebase += "       <Item name='"+name+"' value='"+val+"'/>\n";
      });
    }
    codebase += `     </NameValues>
        <Fields orderChanged="False">
          <Field name="URL" selected="False" />
          <Field name="*Unknown" selected="False" />
        </Fields>
      </Headers>
      <Payload>\n`;
    if (method == "PUT") {
      codebase += `     <HTTPAction>Custom</HTTPAction>
        <CustomHTTPAction>PUT</CustomHTTPAction>\n`;
    } else {
      codebase += `     <HTTPAction>`+method+`</HTTPAction>\n`;
    }
    if (body != undefined) {
      body = body.replace(/</g,'&lt;');
      body = body.replace(/>/g,'&gt;');
      body = body.replace(/\n/g,'');
      body = body.replace(/\t/g,'');
      body = body.replace(/\\/g,'');
      codebase += `     <QueryStringBodyMode>Text</QueryStringBodyMode>
          <Text>`+body+`</Text>`;
    }
    codebase += `
      </Payload>
      <UserName />
      <Password />
      <numConnections>2</numConnections>
      <Timeout>600</Timeout>
    </Configuration>`;

    return codebase;
  } else {
    return "";
  }
}
