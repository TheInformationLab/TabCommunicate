var //nsh =  require('node-syntaxhighlighter'),
    //codeLang =  nsh.getLanguage('js'),
    selectedLang = 'jsAjax',
    credsToken = siteid = contentUrl = userid = "",
    productVersion = 10.0,
    apiVersion = 2.3,
    method = url = headers = body = undefined;

var func = {};

func.getServerSettingsUnauthenticated = function() {
  method = 'GET',
  url = $('#serverUrl').val()+'/manual/auth?language=en&format=xml&client_type=desktop',
  headers = body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  var callVars = {
    "url": url,
    "method": method,
    "body": body,
    "respLang": "xml",
    "node" : "authinfo"
  };
  var settings = {
    url : "https://127.0.0.1:3000/api/q",
    method : "POST",
    data : callVars,
    contentType : "application/x-www-form-urlencoded"
  };
  $.ajax(settings).done(function (response) {
    writeResponse('xml',response.raw);
    productVersionXML = $(response.raw).find("product_version");
    productVersion = parseFloat(productVersionXML[0].innerHTML);
    if (productVersion >= 10) { apiVersion = 2.3 } else
    if (productVersion >= 9.3) { apiVersion = 2.2 } else
    if (productVersion >= 9.2) { apiVersion = 2.1 } else
    { apiVersion = 2.0 }
    refreshVariables();
    $('#resp-table').html(response.html);
    $('#resp-csv').html(response.csv);
  }).fail(function (jqXHR, textStatus) {
    writeResponse('xml',jqXHR.responseXML);
  });
}

func.apiSignin = function () {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/auth/signin',
  headers = undefined,
  body = "<tsRequest>\n\t\t<credentials name='"+$('#username').val()+"' password='"+$('#password').val()+"'>\n\t\t\t<site contentUrl='"+$('#site').val()+"'/>\n\t\t</credentials>\n\t</tsRequest>";
  var callVars = {
    "url": url,
    "method": method,
    "body": body,
    "respLang": "xml",
    "node" : "tsresponse.credentials"
  };
  body = body.replace(/(?:password=')(.*)(?:'>)/,"password='****'>");
  writeCode(selectedLang,method,url,headers,body);
  var settings = {
    url : "https://127.0.0.1:3000/api/q",
    method : "POST",
    data : callVars,
    contentType : "application/x-www-form-urlencoded"
  }
  $.ajax(settings).done(function (response) {
    writeResponse('xml',response.raw);
    credsToken = $(response.raw).find("credentials").attr("token");
    siteid = $(response.raw).find("site").attr("id");
    contentUrl = $(response.raw).find("site").attr("contentUrl");
    userid = $(response.raw).find("user").attr("id");
    refreshVariables();
    apiControls();
    $('#resp-table').html(response.html);
    $('#resp-csv').html(response.csv);
  }).fail(function (jqXHR, textStatus) {
    writeResponse('json',textStatus);
  });
}

func.apiAddDatasourceFavorites = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/favorites/'+$('#user-id').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n<favorite label="'+$('#favorite-label').val()+'">\n<datasource id="'+$('#datasource-id').val()+'" />\n</favorite>\n</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.favorites.favorite') }
}

func.apiGetUsersonSite = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.users.user') }
}

func.apiQueryDatasource = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.datasource') }
}

func.apiQueryDatasourceConnections = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val()+'/connections',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.connections.connection') };
}

func.apiQueryDatasourcePermissions = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val()+'/permissions',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.permissions') }
}

func.apiQueryDatasources = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.datasources.datasource') }
}

func.apiQueryDefaultPermissions = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects/'+$('#project-id').val()+'/default-permissions/'+$('#object').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.permissions') }
}

func.apiQueryExtractRefreshTasks = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/schedules/'+$('#schedule-id').val()+'/extracts',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.extracts.extract') }
}

func.apiQueryGroups = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/groups',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.groups.group') }
}

func.apiQueryJob = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/jobs/'+$('#job-id').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.job') }
}

func.apiQuerySchedules = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/schedules',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.schedules.schedule') }
}

func.apiQuerySites = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.sites.site') }
}

func.apiQueryProjects = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.projects.project') }
}

func.apiQueryViewsforSite = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/views?includeUsageStatistics=true',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.views.view') }
}

func.apiQueryWorkbooksforSite = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.workbooks.workbook') }
}

func.apiQueryWorkbooksforUser = function() {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users/'+$('#user-id').val()+'/workbooks',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.workbooks.workbook') }
}

var queryAPI = function (xmlPath) {
  var callVars = {
    "url": url,
    "method": method,
    "body": body,
    "headers" : headers,
    "respLang": "xml",
    "node" : xmlPath
  };
  var settings = {
    url : "https://127.0.0.1:3000/api/q",
    method : "POST",
    data : callVars,
    contentType : "application/x-www-form-urlencoded"
  }
  $.ajax(settings).done(function (response) {
    writeResponse('xml',response.raw);
    $('#resp-table').html(response.html);
    $('#resp-csv').html(response.csv);
  }).fail(function (jqXHR, textStatus) {
    writeResponse('xml',jqXHR.responseXML);
  });
}

var writeCode = function(language, method, url, headers, body) {
  var output = "";
  switch (language) {
    case 'jsAjax':
      $('#code').html('<pre><code class="JavaScript" id="scriptOutput"></code></pre>');
      output = lib.jsAjax(method, url, headers,body);
      break;
    case 'phpHttpRequest':
    $('#code').html('<pre><code class="PHP" id="scriptOutput"></code></pre>');
      output = lib.phpHttpRequest(method, url, headers, body);
      break;
  }
  $('#code #scriptOutput').text(output);
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}

var writeResponse = function(dataType, body) {
  switch (dataType) {
    case 'xml':
      $('#response').html('<pre><code class="XML" id="scriptOutput"></code></pre>');
      var output = formatXml(body);
      break;
    case 'json':
      $('#response').html('<pre><code class="json" id="scriptOutput"></code></pre>');
      var output = JSON.stringify(body, undefined, 2);
      break;
  }
  $('#response #scriptOutput').text(output);
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}

var writeTable = function(dataType, body, node) {
  var xmlParser = require('simple-xml2json');
  var js2table = require('json-to-table');
  if (dataType == 'xml') {
    var xmlText = new XMLSerializer().serializeToString(body);
    var result = xmlParser.parser( xmlText );
    result = resolveJSON(result, node);
    jsonArraytoHTML(js2table(result), function(htmlStr) {
      $('#resp-table').html(htmlStr);
    });
  } else {
    jsonArraytoHTML(body, function(htmlStr) {
      $('#resp-table').html(htmlStr);
    });
  }
}

var writeCSV = function(dataType, body, node) {
  var xmlParser = require('simple-xml2json');
  var js2table = require('json-to-table');
  if (dataType == 'xml') {
    var xmlText = new XMLSerializer().serializeToString(body);
    var result = xmlParser.parser( xmlText );
    result = resolveJSON(result, node);
    jsonArraytoCSV(js2table(result), function(csvStr) {
      $('#resp-csv').html(csvStr);
    });
  } else {
    jsonArraytoCSV(body, function(csvStr) {
      $('#resp-csv').html(csvStr);
    });
  }
}

var refreshVariables = function () {
  var html = '<strong>API Version</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ apiVersion + '<br/>\
  <strong>Token</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ credsToken + '<br/>\
    <strong>Site ID</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ siteid + '<br/>\
    <strong>Content URL</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ contentUrl + '<br/>\
    <strong>User ID</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ userid + '<br/>';
  $('#resp-variables').html(html);
}

function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    jQuery.each(xml.split('\r\n'), function(index, node) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }
        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }
        formatted += padding + node + '\r\n';
        pad += indent;
    });
    return formatted;
}
