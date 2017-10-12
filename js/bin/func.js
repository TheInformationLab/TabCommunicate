var selectedLang = 'jsAjax',
    credsToken = siteid = contentUrl = userid = "",
    productVersion = 10.1,
    apiVersion = 2.4,
    formRows = 1,
    method = url = headers = body = response = undoVal = undefined;

if (getCookie('apiVersion')) {
  apiVersion = getCookie('apiVersion');
}

var func = {};

func.getServerSettingsUnauthenticated = function(callback) {
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
    url : $('#baseUrl').val() + "/api/q",
    method : "POST",
    data : callVars,
    contentType : "application/x-www-form-urlencoded"
  };
  $.ajax(settings).done(function (response) {
    $('#loading').hide();
    writeResponse('xml',response.raw);
    productVersionXML = $(response.raw).find("product_version");
    productVersion = parseFloat(productVersionXML[0].innerHTML);
    if (productVersion >= 10.5) { apiVersion = 2.8 } else
    if (productVersion >= 10.4) { apiVersion = 2.7 } else
    if (productVersion >= 10.3) { apiVersion = 2.6 } else
    if (productVersion >= 10.2) { apiVersion = 2.5 } else
    if (productVersion >= 10.1) { apiVersion = 2.4 } else
    if (productVersion >= 10.0) { apiVersion = 2.3 } else
    if (productVersion >= 9.3) { apiVersion = 2.2 } else
    if (productVersion >= 9.2) { apiVersion = 2.1 } else
    { apiVersion = 2.0 }
    callback(apiVersion);
    refreshVariables();
    $('#resp-table').html(response.html);
    $('#resp-csv #text').html(response.csv);
  }).fail(function (jqXHR, textStatus) {
    $('#loading').hide();
    writeResponse('xml',jqXHR.responseXML);
  });
}

func.apiSignin = function () {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/auth/signin',
  headers = {
    'User-Agent' : 'TabCommunicate'
  },
  body = '<tsRequest>\\\n\t\t<credentials name="'+$('#username').val()+'" password="'+$('#password').val()+'">\\\n\t\t\t<site contentUrl="'+$('#site').val()+'"/>\\\n\t\t</credentials>\\\n\t</tsRequest>';
  var callVars = {
    "url": url,
    "method": method,
    "headers": headers,
    "body": body,
    "node" : "tsresponse.credentials"
  };
  if (apiVersion >= 2.2) {
    var respLang = "json";
  } else {
    var respLang = "xml";
  }
  callVars.respLang = respLang;
  body = body.replace(/(?:password=")(.*)(?:">)/,'password="****">');
  writeCode(selectedLang,method,url,headers,body);
  var settings = {
    url : $('#baseUrl').val() + "/api/q",
    method : "POST",
    data : callVars,
    contentType : "application/x-www-form-urlencoded"
  }
  $.ajax(settings).done(function (response) {
    $('#loading').hide();
    writeResponse(respLang,response.raw);
    if (respLang == "xml") {
      credsToken = $(response.raw).find("credentials").attr("token");
      siteid = $(response.raw).find("site").attr("id");
      contentUrl = $(response.raw).find("site").attr("contentUrl");
      userid = $(response.raw).find("user").attr("id");
    } else {
      creds = JSON.parse(response.raw);
      credsToken = creds.credentials.token;
      siteid = creds.credentials.site.id;
      contentUrl = creds.credentials.site.contentUrl;
      userid = creds.credentials.user.id;
    }
    refreshVariables();
    apiControls();
    $('#resp-table').html(response.html);
    $('#resp-csv #text').html(response.csv);
  }).fail(function (jqXHR, textStatus) {
    $('#loading').hide();
    writeResponse('json',textStatus);
  });
}

func.apiAddDatasourcePermissions = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val()+'/permissions',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<permissions>\n\t\t   <datasource id="'+$('#datasource-id').val()+'" />\n\t\t   <granteeCapabilities>';
    var userId = "";
  $.each($('.row.multiple'), function(i, row) {
    var switchObj = $(row.children[0]).find("select")[0];
    var userObj = $(row.children[1]).find("input")[0];
    var capNameObj = $(row.children[2]).find("select")[0];
    var capModeObj = $(row.children[3]).find("select")[0];
    if (userId == "" && userObj.value != "") {
      userId = userObj.value;
      body+='\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId != userObj.value && userObj.value != "") {
      userId = userObj.value;
      body+='\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t   <granteeCapabilities>\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId == userObj.value && userObj.value != "") {
      userId = userObj.value;
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    }
  });
  body += '\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t</permissions>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.permissions'), "form" }
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

func.apiAddDefaultPermissions = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects/'+$('#project-id').val()+'/default-permissions/'+$('#target').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<permissions>\n\t\t   <granteeCapabilities>';
    var userId = "";
  $.each($('.row.multiple'), function(i, row) {
    var switchObj = $(row.children[0]).find("select")[0];
    var userObj = $(row.children[1]).find("input")[0];
    var capNameObj = $(row.children[2]).find("select")[0];
    var capModeObj = $(row.children[3]).find("select")[0];
    if (userId == "" && userObj.value != "") {
      userId = userObj.value;
      body+='\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId != userObj.value && userObj.value != "") {
      userId = userObj.value;
      body+='\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t   <granteeCapabilities>\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId == userObj.value && userObj.value != "") {
      userId = userObj.value;
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    }
  });
  body += '\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t</permissions>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.permissions'), "form" }
}

func.apiAddProjectPermissions = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects/'+$('#project-id').val()+'/permissions',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<permissions>\n\t\t   <granteeCapabilities>';
    var userId = "";
  $.each($('.row.multiple'), function(i, row) {
    var switchObj = $(row.children[0]).find("select")[0];
    var userObj = $(row.children[1]).find("input")[0];
    var capNameObj = $(row.children[2]).find("select")[0];
    var capModeObj = $(row.children[3]).find("select")[0];
    if (userId == "" && userObj.value != "") {
      userId = userObj.value;
      body+='\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId != userObj.value && userObj.value != "") {
      userId = userObj.value;
      body+='\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t   <granteeCapabilities>\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId == userObj.value && userObj.value != "") {
      userId = userObj.value;
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    }
  });
  body += '\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t</permissions>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.permissions'), "form" }
}

func.apiAddTagstoDatasource = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/ddatasources/'+$('#datasource-id').val()+'/tags',
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

func.apiAddTagstoWorkbook = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/tags',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\\\n\t<tags>\\\n';
  $.each($('.row.multiple input'), function(i, row) {
    if($(row).val()) {
      body+= '\t\t<tag label="' + $(row).val() + '" />\\\n'
    }
  });
  body += '\t</tags>\\\n  </tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.tags.tag', "form") }
}

func.apiAddUsertoGroup = function(run) {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/groups/'+$('#group-id').val()+'/users',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t <user id="'+$('#user-id').val()+'" />\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.user', 'user.id') }
}

func.apiAddUsertoSite = function(run) {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/users',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t <user name="'+$('#user-name').val()+'"\n\t\t siteRole="'+$('#site-role').val()+'" \n\t\t authSetting="'+$('#auth-setting').val()+'" />\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.user', 'user.id') }
}

func.apiAddWorkbookPermissions = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/permissions',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<permissions>\n\t\t   <workbook id="'+$('#workbook-id').val()+'" />\n\t\t   <granteeCapabilities>';
    var userId = "";
  $.each($('.row.multiple'), function(i, row) {
    var switchObj = $(row.children[0]).find("select")[0];
    var userObj = $(row.children[1]).find("input")[0];
    var capNameObj = $(row.children[2]).find("select")[0];
    var capModeObj = $(row.children[3]).find("select")[0];
    if (userId == "") {
      userId = userObj.value;
      body+='\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId != userObj.value) {
      userId = userObj.value;
      body+='\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t   <granteeCapabilities>\n\t\t\t<'+switchObj.value+' id="'+userId+'" />\n\t\t\t<capabilities>\n';
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    } else if (userId == userObj.value) {
      userId = userObj.value;
      body+= '\t\t\t\t<capability name="' + capNameObj.value + '" mode="'+capModeObj.value+'" />\n';
    }
  });
  body += '\t\t\t</capabilities>\n\t\t   </granteeCapabilities>\n\t\t</permissions>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.permissions') }
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

func.apiCreateSite = function(run) {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<site name="'+$('#site-name').val()+'"\n\t\t  contentUrl="'+$('#content-url').val() + (($('#admin-mode').val() != ' - admin-mode - ') ? '"\n\t\t  adminMode="'+$('#admin-mode').val() : '') + (($('#num-users').val() != "") ? '"\n\t\t  userQuota="'+$('#num-users').val() : '') + '"\n\t\t  storageQuota="'+$('#storage-quota').val()+'"\n\t\t  disableSubscriptions="'+(($('#disable-subscriptions').prop('checked')) ? 'true' : 'false') + '"/>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.site') }
}

func.apiDeleteDatasourceFavorites = function(run) {
  method = 'DELETE',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/favorites/'+$('#user-id').val()+'/datasources/'+$('#datasource-id').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('none') }
}

func.apiDeleteDatasourcePermission = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if ($('.row.multiple').length == 0) {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val()+'/permissions/'+$('#switch').val()+'s/'+$('#-id').val()+'/'+$('#capability-name').val()+'/'+$('#capability-mode').val();
    writeCode(selectedLang,method,url,headers,body);
    if (run) { queryAPI('none') }
  } else {
    $.each($('.row.multiple'), function(i, row) {
      var switchObj = $(row.children[0]).find("select")[0];
      var userObj = $(row.children[1]).find("input")[0];
      var capNameObj = $(row.children[2]).find("select")[0];
      var capModeObj = $(row.children[3]).find("select")[0];
      if(userObj.value) {
        url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val()+'/permissions/'+switchObj.value+'s/'+userObj.value+'/'+capNameObj.value+'/'+capModeObj.value;
        writeCode(selectedLang,method,url,headers,body);
        if (run) { queryAPI('none'), 'form' }
      }
    });
    undoVal = undefined;
  }
}

func.apiDeleteDefaultPermission = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if ($('.row.multiple').length == 0) {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects/'+$('#project-id').val()+'/default-permissions/'+$('#target').val()+'/'+$('#switch').val()+'s/'+$('#-id').val()+'/'+$('#capability-name').val()+'/'+$('#capability-mode').val();
    writeCode(selectedLang,method,url,headers,body);
    if (run) { queryAPI('none') }
  } else {
    $.each($('.row.multiple'), function(i, row) {
      var switchObj = $(row.children[0]).find("select")[0];
      var userObj = $(row.children[1]).find("input")[0];
      var capNameObj = $(row.children[2]).find("select")[0];
      var capModeObj = $(row.children[3]).find("select")[0];
      if(userObj.value) {
        url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects/'+$('#project-id').val()+'/default-permissions/'+$('#target').val()+'/'+switchObj.value+'s/'+userObj.value+'/'+capNameObj.value+'/'+capModeObj.value;
        writeCode(selectedLang,method,url,headers,body);
        if (run) { queryAPI('none'), 'form' }
      }
    });
    undoVal = undefined;
  }
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

func.apiDeleteProjectPermission = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if ($('.row.multiple').length == 0) {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects/'+$('#project-id').val()+'/permissions/'+$('#switch').val()+'s/'+$('#-id').val()+'/'+$('#capability-name').val()+'/'+$('#capability-mode').val();
    writeCode(selectedLang,method,url,headers,body);
    if (run) { queryAPI('none') }
  } else {
    $.each($('.row.multiple'), function(i, row) {
      var switchObj = $(row.children[0]).find("select")[0];
      var userObj = $(row.children[1]).find("input")[0];
      var capNameObj = $(row.children[2]).find("select")[0];
      var capModeObj = $(row.children[3]).find("select")[0];
      if(userObj.value) {
        url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/projects/'+$('#project-id').val()+'/permissions/'+switchObj.value+'s/'+userObj.value+'/'+capNameObj.value+'/'+capModeObj.value;
        writeCode(selectedLang,method,url,headers,body);
        if (run) { queryAPI('none'), 'form' }
      }
    });
    undoVal = undefined;
  }
}

func.apiDeleteSite = function(run) {
  method = 'DELETE';
  if ($('#switch').val() == 'site-id') {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+$('#value').val();
  } else if ($('#switch').val() == 'site-name') {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+$('#value').val()+'?key=name';
  } else {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+$('#value').val()+'?key=contentUrl';
  }
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('none') }
}

func.apiDeleteTagfromDatasource = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if (undoVal != "form") {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val()+'/tags/'+$('#tag-name').val();
    writeCode(selectedLang,method,url,headers,body);
    if (run) { queryAPI('none') }
  } else {
    $.each($('.row.multiple input'), function(i, row) {
      if($(row).val()) {
        url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/datasources/'+$('#datasource-id').val()+'/tags/'+$(row).val();
        writeCode(selectedLang,method,url,headers,body);
        if (run) { queryAPI('none'), 'form' }
      }
    });
    undoVal = undefined;
  }
}

func.apiDeleteTagfromView = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if (undoVal != "form") {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/views/'+$('#view-id').val()+'/tags/'+$('#tag-name').val();
    writeCode(selectedLang,method,url,headers,body);
    if (run) { queryAPI('none') }
  } else {
    $.each($('.row.multiple input'), function(i, row) {
      if($(row).val()) {
        url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/views/'+$('#view-id').val()+'/tags/'+$(row).val();
        writeCode(selectedLang,method,url,headers,body);
        if (run) { queryAPI('none'), 'form' }
      }
    });
    undoVal = undefined;
  }
}

func.apiDeleteTagfromWorkbook = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if (undoVal != "form") {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/tags/'+$('#tag-name').val();
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

func.apiDeleteWorkbookPermission = function(run) {
  method = 'DELETE';
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  if ($('.row.multiple').length == 0) {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/permissions/'+$('#switch').val()+'s/'+$('#-id').val()+'/'+$('#capability-name').val()+'/'+$('#capability-mode').val();
    writeCode(selectedLang,method,url,headers,body);
    if (run) { queryAPI('none') }
  } else {
    $.each($('.row.multiple'), function(i, row) {
      var switchObj = $(row.children[0]).find("select")[0];
      var userObj = $(row.children[1]).find("input")[0];
      var capNameObj = $(row.children[2]).find("select")[0];
      var capModeObj = $(row.children[3]).find("select")[0];
      if(userObj.value) {
        url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val()+'/permissions/'+switchObj.value+'s/'+userObj.value+'/'+capNameObj.value+'/'+capModeObj.value;
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

func.apiPublishWorkbook = function(run) {
  var tcform = new FormData();
  var reqPayload = '<tsRequest><workbook name=\''+$('#workbook-name').val()+'\' '+(($('#show-tabs-flag').prop('checked')) ? 'showTabs="true"' : '')+'><project id=\''+$('#project-id').val()+'\' /></workbook></tsRequest>';
  tcform.append('request_payload', reqPayload);
  var workbookInput = document.getElementById('workbook');
  var workbook = workbookInput.files[0];
  tcform.append("tableau_workbook", workbook);
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks' + (($('#overwrite-flag').prop('checked')) ? '?overwrite=true' : ''),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = tcform;

  writeCode(selectedLang,method,url,headers,"","tableau_workbook",reqPayload);
  if (run) { queryAPI('tsresponse.workbook', undefined, true) }
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

func.apiQuerySite = function(run) {
  method = 'GET';
  if ($('#switch').val() == 'site-id') {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+$('#value').val();
  } else if ($('#switch').val() == 'site-name') {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+$('#value').val()+'?key=name';
  } else {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+$('#value').val()+'?key=contentUrl';
  }
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.site') }
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

func.apiQueryWorkbook = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/workbooks/'+$('#workbook-id').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.workbook') }
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

func.apiRemoveUserfromGroup = function(run) {
  method = 'DELETE';
  if ($('#user-id').val() && $('#group-id').val()) {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/groups/'+$('#group-id').val()+'/users/'+$('#user-id').val();
  } else {
    url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+siteid+'/groups/'+$('#group-id').val()+'/users/'+undoVal;
    undoVal = undefined;
  }
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('none') }
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

func.apiServerInfo = function(run) {
  method = 'GET',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/serverinfo',
  headers = {},
  body = undefined;
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.serverInfo') };
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

func.apiSwitchSite = function() {
  method = 'POST',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/auth/switchSite',
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t\t<site contentUrl="'+$('#content-url').val()+'"/>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  queryAPI('tsresponse.credentials');
}

func.apiUpdateSite = function(run) {
  method = 'PUT',
  url = $('#serverUrl').val()+'/api/'+apiVersion+'/sites/'+$('#site-id').val(),
  headers = {
    'X-Tableau-Auth' : credsToken
  },
  body = '<tsRequest>\n\t<site\n\t';
  if ($('#new-site-name').val()) { body += '  name="'+$('#new-site-name').val()+'"\n\t' }
  if ($('#new-content-url').val()) { body += '  contentUrl="'+$('#new-content-url').val()+'"\n\t' }
  if ($('#new-admin-mode').val() != '- New Admin Mode -') { body += '  adminMode="'+$('#new-admin-mode').val()+'"\n\t' }
  if ($('#new-num-users').val()) { body += '  userQuota="'+$('#new-num-users').val()+'"\n\t' }
  if ($('#new-state').val() != '- New State -') { body += '  state="'+$('#new-state').val()+'"\n\t' }
  if ($('#new-storage-quota').val()) { body += '  storageQuota="'+$('#new-storage-quota').val()+'"\n\t' }
  if ($('#new-disable-subscriptions').val() != '- New Disable Subscriptions -') { body += '  disableSubscriptions="'+$('#new-disable-subscriptions').val()+'"\n\t' }
  if ($('#revision-history-enabled').val() != '- Revision History Enabled -') { body += '  revisionHistoryEnabled="'+$('#revision-history-enabled').val()+'"\n\t' }
  if ($('#revision-limit').val()) { body += '  revisionLimit="'+$('#revision-limit').val()+'"\n\t' }
  body += '/>\n\t</tsRequest>';
  writeCode(selectedLang,method,url,headers,body);
  if (run) { queryAPI('tsresponse.site') }
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

var queryAPI = function (xmlPath, undoVar, publish) {
  if (apiVersion >= 2.2 && !publish) {
    var respLang = "json";
  } else {
    var respLang = "xml";
  }
  var callVars = {
    "url": url,
    "method": method,
    "body": body,
    "headers" : headers,
    "respLang": respLang,
    "node" : xmlPath
  };
  if (publish) {
    var publishSettings = {
      "url" : url,
      "method": method,
      "headers" : headers,
      "respLang" : respLang,
      "node" : xmlPath
    }
    var settings = {
      url: $('#baseUrl').val() + "/api/publish",
      method: "POST",
      processData: false,
      headers : {
        "TabCommunicate-Publish" : true,
        "TabCommunicate-Settings" : JSON.stringify(publishSettings)
      },
      contentType: false,
      mimeType: "multipart/mixed",
      data: body
    }
  } else {
    var settings = {
      url : $('#baseUrl').val() + "/api/q",
      method : "POST",
      data : callVars,
      contentType : "application/x-www-form-urlencoded"
    }
  }
  $.ajax(settings).done(function (resp) {
    $('#loading').hide();
    if (publish) {
      var response = JSON.parse(resp);
    } else {
      var response = resp;
    }
    writeResponse(respLang,response.raw);
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
    $('#loading').hide();
    writeResponse('xml',jqXHR.responseXML);
  });
}

var writeCode = function(language, method, url, headers, body, publish, reqPayload) {
  var output = "";
  if (apiVersion >= 2.2 && url.includes("/api/" + apiVersion)) {
    headers.Accept = "application/json";
  }
  switch (language) {
    case 'jsAjax':
      $('#code').html('<pre><code class="JavaScript" id="scriptOutput"></code></pre>');
      output = lib.jsAjax(method, url, headers,body, publish, reqPayload);
      break;
    case 'nodeRequest':
    $('#code').html('<pre><code class="JavaScript" id="scriptOutput"></code></pre>');
      output = lib.nodeRequest(method, url, headers, body, publish, reqPayload);
      break;
    case 'phpHttpRequest':
    $('#code').html('<pre><code class="PHP" id="scriptOutput"></code></pre>');
      output = lib.phpHttpRequest(method, url, headers, body, publish, reqPayload);
      break;
    case 'phpcURL':
    $('#code').html('<pre><code class="PHP" id="scriptOutput"></code></pre>');
      output = lib.phpcURL(method, url, headers, body, publish, reqPayload);
      break;
    case 'pyHttp':
    $('#code').html('<pre><code class="Python" id="scriptOutput"></code></pre>');
      output = lib.pyHttp(method, url, headers, body, publish, reqPayload);
      break;
    case 'pyRequests':
    $('#code').html('<pre><code class="Python" id="scriptOutput"></code></pre>');
      output = lib.pyRequests(method, url, headers, body, publish, reqPayload);
      break;
    case 'alteryx':
    $('#code').html('<pre><code class="XML" id="scriptOutput"></code></pre>');
      output = lib.alteryx(method, url, headers, body, publish, reqPayload);
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
      if (body != "Command Executed. Tableau Server doesn't return a response body to this command.") {
        var parsed = JSON.parse(body);
        $('#response').html('<pre><code class="json" id="scriptOutput"></code></pre>');
        var output = JSON.stringify(parsed, undefined, 2);
      } else {
        var output = body;
      }
      break;
  }
  $('#response #scriptOutput').text(output);
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}


var refreshVariables = function () {
  setCookie('apiVersion', apiVersion);
  var html = '<div id="#resp-variables-content"><strong>API Version</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ apiVersion + '<br/>\
  <strong>Token</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ credsToken + '<br/>\
    <strong>Site ID</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ siteid + '<br/>\
    <strong>Content URL</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ contentUrl + '<br/>\
    <strong>User ID</strong> <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span> '+ userid + '<br/></div>';
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
