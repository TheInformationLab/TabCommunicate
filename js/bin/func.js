var selectedLang = 'jsAjax',
    credsToken = siteid = contentUrl = userid = "",
    productVersion = 10.0,
    apiVersion = 2.3,
    formRows = 1,
    method = url = headers = body = response = undoVal = undefined;

if (getCookie('apiVersion')) {
  apiVersion = getCookie('apiVersion');
}

var func = {};

func.getServerSettingsUnauthenticated = function() {
  method = 'GET',
  url = $('#serverUrl').val()+'/manual/auth?format=xml',
  headers = {
    'User-Agent' : 'TabCommunicate'
  };
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  var callVars = {
    "url": url,
    "method": method,
    "headers" : headers,
    "respLang": "xml",
    "node" : "authinfo"
  };
  var settings = {
    url : "/api/q",
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
    $('#resp-csv #text').html(response.csv);
  }).fail(function (jqXHR, textStatus) {
    writeResponse('xml',jqXHR.responseXML);
  });
}

func.apiSignin = function () {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/auth/signin',
  headers = undefined,
  body = "<tsRequest>\\\n\t\t<credentials name='"+$('#username').val()+"' password='"+$('#password').val()+"'>\\\n\t\t\t<site contentUrl='"+$('#site').val()+"'/>\\\n\t\t</credentials>\\\n\t</tsRequest>";
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
    url : "/api/q",
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
    $('#resp-csv #text').html(response.csv);
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

func.apiAddTagstoWorkbook = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/tags',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t<tags>\n';
  $.each($('.row.multiple input'), function(i, row) {
    if($(row).val()) {
      body+= '\t\t<tag label="' + $(row).val() + '" />\n'
    }
  });
  body += '\t</tags>\n  </tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.tags.tag', "form") }
}

func.apiAddUsertoSite = function(run) {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<user name="'+$('#user-name').val()+'"\n\t\tsiteRole="'+$('#site-role').val()+'" \n\t\tauthSetting="'+$('#auth-setting').val()+'" />\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.user', 'user.id') }
}

func.apiCreateGroup = function(run) {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/groups',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<group name="'+$('#new-tableau-server-group-name').val()+'"/>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.group', 'group.id') }
}

func.apiDeleteGroup = function(run) {
  method = 'DELETE';
  if ($('#group-id').val()) {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/groups/'+$('#group-id').val();
  } else {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/groups/'+undoVal;
    undoVal = undefined;
  }
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('none') }
}

func.apiDeleteTagfromWorkbook = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if (undoVal != "form") {
    $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/tags/'+$('#tag-name').val();
    writeCode(selectedLang,method,url,headers,body);
    if (run) { queryAPI('none') }
  } else {
    $.each($('.row.multiple input'), function(i, row) {
      if($(row).val()) {
        url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/tags/'+$(row).val();
        writeCode(selectedLang,method,url,headers,body);
        if (run) { queryAPI('none'), 'form' }
      }
    });
    undoVal = undefined;
  }
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

func.apiQueryWorkbooksforUser = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users/'+$('#user-id').val()+'/workbooks',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.workbooks.workbook') }
}

func.apiRemoveUserfromSite = function(run) {
  method = 'DELETE';
  if ($('#user-id').val()) {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users/'+$('#user-id').val();
  } else {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users/'+ undoVal;
    undoVal = undefined;
  }
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('none') }
}

func.apiSignOut = function() {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/auth/signout',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  queryAPI('none');
}

func.apiUpdateUser = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users/'+$('#user-id').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t<user\n\t';
  if ($('#new-full-name').val()) { body += '  fullName="'+$('#new-full-name').val()+'"\n\t' }
  if ($('#new-email').val()) { body += '  email="'+$('#new-email').val()+'"\n\t' }
  if ($('#new-password').val()) { body += '  password="'+$('#new-password').val()+'"\n\t' }
  if ($('#new-site-role').val() != '- New Site Role -') { body += '  siteRole="'+$('#new-site-role').val()+'"\n\t' }
  if ($('#new-auth-setting').val() != '- New Auth Setting -') { body += '  authSetting="'+$('#new-auth-setting').val()+'"\n\t' }
  body += '/>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.user') }
}

var queryAPI = function (xmlPath, undoVar) {
  var callVars = {
    "url": url,
    "method": method,
    "body": body,
    "headers" : headers,
    "respLang": "xml",
    "node" : xmlPath
  };
  var settings = {
    url : "/api/q",
    method : "POST",
    data : callVars,
    contentType : "application/x-www-form-urlencoded"
  }
  $.ajax(settings).done(function (response) {
    writeResponse('xml',response.raw);
    $('#resp-table').html(response.html);
    $('#resp-csv #text').html(response.csv);
    if (undoVar) {
      if(undoVar != "form") {
        var attrs = undoVar.split('.');
        if (attrs.length == 2) {
          undoVal = $(response.raw).find(attrs[0]).attr(attrs[1]);
        } else {
          undoVal = $(response.raw).find(attrs[0]);
        }
      } else {
        undoVal = "form";
      }
    }
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
    case 'nodeRequest':
    $('#code').html('<pre><code class="JavaScript" id="scriptOutput"></code></pre>');
      output = lib.nodeRequest(method, url, headers, body);
      break;
    case 'phpHttpRequest':
    $('#code').html('<pre><code class="PHP" id="scriptOutput"></code></pre>');
      output = lib.phpHttpRequest(method, url, headers, body);
      break;
    case 'phpcURL':
    $('#code').html('<pre><code class="PHP" id="scriptOutput"></code></pre>');
      output = lib.phpcURL(method, url, headers, body);
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


var refreshVariables = function () {
  setCookie('apiVersion', apiVersion);
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

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}
