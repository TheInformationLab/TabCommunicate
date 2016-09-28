var lib = {};

lib.jsAjax = function(method, url, headers, body) {
  var codebase = 'var settings = {\n\
    "async": true,\n\
    "crossDomain": true,\n\
    "url":\ "'+url+'",\n\
    "method": "'+method+'",\n\
    "contentType": "text/xml",\n\
    "dataType": "xml"\n';
  if (headers != undefined) {
    codebase += '\t"headers": '+JSON.stringify(headers)+',\n';
  }
  if (body != undefined) {
    codebase += '\t"data": "'+body+'"\n';
  }
  codebase += '}\n\
  \n\
  $.ajax(settings).done(function (response) {\n\
    console.log(response);\n\
  });';

  return codebase;
}

lib.phpHttpRequest = function (method,url,headers,body) {
  var codebase = "<?php\n\
  $request = new HttpRequest();\n\
  $request->setUrl('" + url + "');\n\
  $request->setMethod(HTTP_METH_"+method+");\n\
  $request->setHeaders(array(\n\
    'Accept' => 'text/xml'\n\
    'Content-Type' => 'text/xml'\n";
  if (headers != undefined) {
    $.each(headers, function(name, val) {
      codebase += "\t'"+name+"' => '"+val+"'\n";
    });
  }
  codebase += "\t));\n"
  if (body != undefined) {
    codebase += "\t$request->setBody('"+body+"');\n"
  }
  codebase += "\ttry {\n\
    $response = $request->send();\n\
    echo $response->getBody();\n\
  } catch (HttpException $ex) {\n\
    echo $ex;\n\
  }\n\
}";

  return codebase;
}
