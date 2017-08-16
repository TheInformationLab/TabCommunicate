var agent = navigator.userAgent;
if(agent.includes("TabCommunicate")) {
        $('#baseUrl').val('http://127.0.0.1:3000');
} else {
        $('#baseUrl').val('');
}
var init = function() {
  $('#loading').hide();
  $('#input').append("<form onsubmit='return false;'>\
                        <div class='form-group'>\
                          <label class='sr-only' for='serverUrl'>Server URL</label>\
                          \
                          <input type='text' class='form-control' id='serverUrl' placeholder='Server URL' value=''/>\
                        </div>\
                        <div class='row'>\
                          <div class='col-xs-2'>\
                          <label class='sr-only' for='site'>Site ID</label>\
                          <input type='text' class='form-control' id='site' placeholder='Site ID' value=''/>\
                          </div>\
                          <div class='col-xs-3'>\
                          <label class='sr-only' for='username'>Username</label>\
                          <input type='text' class='form-control' id='username' placeholder='Username' value=''/>\
                          </div>\
                          <div class='col-xs-3'>\
                          <label class='sr-only' for='password'>Password</label>\
                          <input type='password' class='form-control' id='password' placeholder='Password' value=''/>\
                          </div>\
                          <div class='col-xs-2'>\
                          <button type='submit' id='loginBtn' class='btn btn-primary form-control'>Sign In</button>\
                          </div>\
                          <div class='col-xs-2'>\
                          <button type='submit' id='logoutBtn' class='btn btn-info form-control'>Sign Out</button>\
                          </div>\
                        </div>\
                      </form>");
  $('#serverBtn').click(func.getServerSettingsUnauthenticated);
  $('#loginBtn').click(function() {
    func.getServerSettingsUnauthenticated(function(apiVersion) {
      console.log(apiVersion);
      func.apiSignin();
    });
    $('#loading').show();
  });
  $('#logoutBtn').click(function () {
    func.apiSignOut();
    $('#apiControlForm').remove();
    $('#loading').show();
  });
  if ($('#baseUrl').val() == "") {
    $('#serverUrl').blur(function () {
      setCookie('serverUrl',$('#serverUrl').val());
      func.getServerSettingsUnauthenticated(function(apiVersion) {
        console.log(apiVersion);
      });
    });
    $('#site').blur(function () {
      setCookie('site',$('#site').val());
    });
    $('#username').blur(function () {
      setCookie('username',$('#username').val());
    });
    if (getCookie('serverUrl')) {
      $('#serverUrl').val(getCookie('serverUrl'));
    } else {
      $('#introModal').modal();
    }
    if (getCookie('site')) {
      $('#site').val(getCookie('site'));
    }
    if (getCookie('username')) {
      $('#username').val(getCookie('username'));
    }
  } else {
    $('#serverUrl').blur(function () {
      localStorage.serverUrl = $('#serverUrl').val();
      func.getServerSettingsUnauthenticated(function(apiVersion) {
        console.log(apiVersion);
      });
    });
    $('#site').blur(function () {
      localStorage.site = $('#site').val();
    });
    $('#username').blur(function () {
      localStorage.username = $('#username').val();
    });
    if (localStorage.serverUrl) {
      $('#serverUrl').val(localStorage.serverUrl);
    } else {
      $('#introModal').modal();
    }
    if (localStorage.site) {
      $('#site').val(localStorage.site);
    }
    if (localStorage.username ) {
      $('#username').val(localStorage.username );
    }
  }


  $('#codeLang').append('<div class="btn-group" role="group" aria-label="Select Code Language">\
      <button type="button" class="btn btn-primary btn-sm" data-lang="jsAjax">JS AJAX</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="nodeRequest">NodeJS Request</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="phpcURL">PHP cURL</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="phpHttpRequest">PHP HttpRequest</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="pyHttp">Python http.client</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="pyRequests">Python Requests</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="alteryx">Alteryx Download</button>\
    </div>');

  if (credsToken.length > 0) {
    apiControls();
  }

  $('#exportCsv').hide();
  $('#help').click( function() {
    $('#introModal').modal();
  });
  $('#downloadUpdate').click( function() {
    var win = window.open('https://tabcommunicate.theinformationlab.co.uk/download', '_blank');
    $('#updateModal').modal('hide');
    win.focus();
  });
  if (window.addEventListener) {
    window.addEventListener("storage", onStorage, false);
  } else {
    window.attachEvent("onstorage", onStorage);
  };

}

var onStorage = function(data) {
  if (data.key == "download" && data.newValue == "true") {
    $('#updateModal').modal('show');
  }
}

var apiControls = function () {
  if (!$('.funcForm').length) {
    var listFunctions = {
      nofunc : {label : ' - Select API Endpoint -', version : 1.0, formItems : []},
      apiAddDatasourcePermissions : {label : 'Add Datasource Permissions', version : 2.0, formItems : [
        {
          label: 'datasource-id',
          type: 'text'
        },
        {
          type: 'multiple',
          items: [
            {
              label: 'switch',
              type: 'dropdown',
              values: ['group','user'],
              size: 2
            },
            {
              label: '-id',
              type : 'text'
            },
            {
              label: 'capability-name',
              type: 'dropdown',
              values: ['ChangePermissions','Connect','Delete','ExportXml','Read','Write']
            },
            {
              label: 'capability-mode',
              type: 'dropdown',
              values: ['Allow','Deny']
            }
          ]
        }
      ], undoFunction: 'apiDeleteDatasourcePermission', undoVersion: 2.0, helpLink: 'Add_Datasource_Permissions'},
      apiAddDatasourceFavorites : {label : 'Add Datasource to Favorites', version : 2.3, formItems : [
        {
          label: 'user-id',
          type: 'text'
        },
        {
          label: 'favorite-label',
          type: 'text'
        },
        {
          label: 'datasource-id',
          type: 'text'
        }
      ], helpLink: 'Add_Datasource_to_Favorites'},
      apiAddDefaultPermissions : {label : 'Add Default Permissions', version : 2.1, formItems : [
        {
          label: 'target',
          type: 'dropdown',
          values: ['workbooks','datasources']
        },
        {
          label: 'project-id',
          type: 'text'
        },
        {
          type: 'multiple',
          items: [
            {
              label: 'switch',
              type: 'dropdown',
              values: ['group','user'],
              size: 2
            },
            {
              label: '-id',
              type : 'text'
            },
            {
              label: 'capability-name',
              type: 'dropdown',
              values: ['AddComment','ChangeHierarchy','ChangePermissions','Connect','Delete','ExportData','ExportImage','ExportXml','Filter','Read','ShareView','ViewComments','ViewUnderlyingData','WebAuthoring','Write']
            },
            {
              label: 'capability-mode',
              type: 'dropdown',
              values: ['Allow','Deny']
            }
          ]
        }
      ], undoFunction: 'apiDeleteDefaultPermission', undoVersion: 2.1, helpLink: 'Add_Default_Permissions'},
      apiAddTagstoWorkbook : {label : 'Add Tags to Workbook', version : 1.0, formItems : [
        {
          label: 'workbook-id',
          type: 'text'
        },
        {
          type: 'multiple',
          items: [
            {
              label: 'tag',
              type : 'text'
            }
          ]
        }
      ], undoFunction: 'apiDeleteTagfromWorkbook', undoVersion: 1.0, helpLink: 'Add_Tags_to_Workbook'},
      apiAddUsertoSite : {label : 'Add User to Site', version : 1.0, formItems : [
        {
          label: 'user-name',
          type : 'text'
        },
        {
          label: 'site-role',
          type: 'dropdown',
          values: ['Interactor','Publisher','SiteAdministrator','Unlicensed','UnlicensedWithPublish','Viewer','ViewerWithPublish']
        },
        {
          label: 'auth-setting',
          type: 'dropdown',
          values: ['ServerDefault','SAML']
        }
      ], undoFunction: 'apiRemoveUserfromSite', undoVersion: 1.0, helpLink : 'Add_User_to_Site'},
      apiAddWorkbookPermissions : {label : 'Add Workbook Permissions', version : 2.0, formItems : [
        {
          label: 'workbook-id',
          type: 'text'
        },
        {
          type: 'multiple',
          items: [
            {
              label: 'switch',
              type: 'dropdown',
              values: ['group','user'],
              size: 2
            },
            {
              label: '-id',
              type : 'text'
            },
            {
              label: 'capability-name',
              type: 'dropdown',
              values: ['AddComment','ChangeHierarchy','ChangePermissions','Delete','ExportData','ExportImage','ExportXml','Filter','Read','ShareView','ViewComments','ViewUnderlyingData','WebAuthoring','Write']
            },
            {
              label: 'capability-mode',
              type: 'dropdown',
              values: ['Allow','Deny']
            }
          ]
        }
      ], helpLink: 'Add_Workbook_Permissions'},
      apiCreateGroup : {label : 'Create Group', version : 2.0, formItems : [
        {
          label: 'new-tableau-server-group-name',
          type : 'text'
        }
      ], undoFunction: 'apiDeleteGroup', undoVersion : 2.1, helpLink: 'Create_Group'},
      apiDeleteDatasourcePermission : {label : 'Delete Datasource Permission', version : 2.0, formItems : [
        {
          label: 'datasource-id',
          type: 'text'
        },
        {
          label: 'switch',
          type: 'dropdown',
          values: ['group','user'],
          size: 2
        },
        {
          label: '-id',
          type : 'text',
          size: 5
        },
        {
          label: 'capability-name',
          type: 'dropdown',
          values: ['ChangePermissions','Connect','Delete','ExportXml','Read','Write'],
          size: 3
        },
        {
          label: 'capability-mode',
          type: 'dropdown',
          values: ['Allow','Deny'],
          size: 2
        }
      ], helpLink: 'Delete_Datasource_Permission'},
      apiDeleteDefaultPermission : {label : 'Delete Default Permission', version : 2.1, formItems : [
        {
          label: 'target',
          type: 'dropdown',
          values: ['workbooks','datasources']
        },
        {
          label: 'project-id',
          type: 'text'
        },
        {
          label: 'switch',
          type: 'dropdown',
          values: ['group','user'],
          size: 2
        },
        {
          label: '-id',
          type : 'text',
          size: 5
        },
        {
          label: 'capability-name',
          type: 'dropdown',
          values: ['AddComment','ChangeHierarchy','ChangePermissions','Connect','Delete','ExportData','ExportImage','ExportXml','Filter','Read','ShareView','ViewComments','ViewUnderlyingData','WebAuthoring','Write'],
          size: 3
        },
        {
          label: 'capability-mode',
          type: 'dropdown',
          values: ['Allow','Deny'],
          size: 2
        }
      ], helpLink: 'Delete_Datasource_Permission'},
      apiDeleteGroup : {label : 'Delete Group', version : 2.1, formItems : [
        {
          label: 'group-id',
          type : 'text'
        }
      ], helpLink: 'Delete_Group'},
      apiDeleteTagfromWorkbook : {label : 'Delete Tag from Workbook', version : 1.0, formItems : [
        {
          label: 'workbook-id',
          type : 'text'
        },
        {
          label: 'tag-name',
          type : 'text'
        }
      ], helpLink: 'Delete_Tag_from_Workbook'},
      apiDeleteWorkbookPermission : {label : 'Delete Workbook Permission', version : 2.0, formItems : [
        {
          label: 'workbook-id',
          type: 'text'
        },
        {
          label: 'switch',
          type: 'dropdown',
          values: ['group','user'],
          size: 2
        },
        {
          label: '-id',
          type : 'text',
          size: 5
        },
        {
          label: 'capability-name',
          type: 'dropdown',
          values: ['AddComment','ChangeHierarchy','ChangePermissions','Delete','ExportData','ExportImage','ExportXml','Filter','Read','ShareView','ViewComments','ViewUnderlyingData','WebAuthoring','Write'],
          size: 3
        },
        {
          label: 'capability-mode',
          type: 'dropdown',
          values: ['Allow','Deny'],
          size: 2
        }
      ], helpLink: 'Delete_Workbook_Permission'},
      apiGetUsersonSite : {label : 'Get Users on Site', version : 1.0, formItems : [], helpLink: 'Get_Users_on_Site'},
      apiQueryDatasource : {label : 'Query Datasource', version : 1.0, formItems : [
        {
          label : 'datasource-id',
          type : 'text'
        }
      ], csvNode: 'tsresponse.datasources.datasource'},
      apiQueryDatasourceConnections : {label : 'Query Datasource Connections', version : 2.3, formItems : [
        {
          label : 'datasource-id',
          type : 'text'
        }
      ], helpLink: 'Query_Datasource_Connections', csvNode: 'tsresponse.connections.connection'},
      apiQueryDatasourcePermissions : {label : 'Query Datasource Permissions', version : 2.0, formItems : [
        {
          label : 'datasource-id',
          type : 'text'
        }
      ], helpLink: 'Query_Datasource_Permissions', csvNode: 'tsresponse.permissions'},
      apiQueryDatasources : {label : 'Query Datasources', version : 1.0, formItems : [], helpLink: 'Query_Datasources', csvNode: 'tsresponse.datasources.datasource'},
      apiQueryDefaultPermissions : {label : 'Query Default Permissions', version : 2.1, formItems : [
        {
          label : 'project-id',
          type : 'text'
        },
        {
          label : 'object',
          type : 'dropdown',
          values : ['datasources','workbooks']
        }
      ], helpLink: 'Query_Datasource_Permissions', csvNode: 'tsresponse.permissions'},
      apiQueryExtractRefreshTasks : {label : 'Query Extract Refresh Tasks', version : 2.2, formItems : [
        {
          label : 'schedule-id',
          type : 'text'
        }
      ], helpLink: 'Query_Extract_Refresh_Tasks', csvNode: 'tsresponse.extracts.extract'},
      apiQueryGroups : {label : 'Query Groups', version : 2.0, formItems : [], helpLink: 'Query_Groups', csvNode: 'tsresponse.groups.group'},
      apiQueryJob : {label : 'Query Job', version : 2.0, formItems : [
        {
          label : 'job-id',
          type : 'text'
        }
      ], helpLink: 'Query_Job', csvNode: 'tsresponse.job'},
      apiQuerySchedules : {label : 'Query Schedules', version : 2.2, formItems : [], helpLink: 'Query_Schedules', csvNode: 'tsresponse.schedules.schedule'},
      apiQuerySites : {label : 'Query Sites', version : 1.0, formItems : [], helpLink: 'Query_Sites', csvNode: 'tsresponse.sites.site'},
      apiQueryProjects : {label : 'Query Projects', version : 2.0, formItems : [], helpLink: 'Query_Projects', csvNode: 'tsresponse.projects.project'},
      apiQueryViewsforSite : {label : 'Query Views for Site', version : 2.2, formItems : [], helpLink: 'Query_Views_for_Site', csvNode: 'tsresponse.views.view'},
      apiQueryWorkbooksforSite : {label : 'Query Workbooks for Site', version : 2.3, formItems : [], helpLink: 'Query_Workbooks_for_Site', csvNode: 'tsresponse.workbooks.workbook'},
      apiQueryWorkbooksforUser : {label : 'Query Workbooks for User', version : 1.0, formItems : [
        {
          label : 'user-id',
          type : 'text'
        }
      ], helpLink: 'Query_Workbooks_for_User', csvNode: 'tsresponse.workbooks.workbook'},
      apiRemoveUserfromSite : {label : 'Remove User from Site', version : 1.0, formItems : [
        {
          label : 'user-id',
          type : 'text'
        }
      ], helpLink: 'Remove_User_from_Site'},
      apiUpdateUser : {label : 'Update User', version : 1.0, formItems : [
        {
          label : 'user-id',
          type : 'text'
        },
        {
          label : 'new-full-name',
          type : 'text'
        },
        {
          label : 'new-email',
          type : 'text'
        },
        {
          label : 'new-password',
          type : 'text'
        },
        {
          label : 'new-site-role',
          type: 'dropdown',
          values: ['- New Site Role -','Interactor','Publisher','SiteAdministrator','Unlicensed','UnlicensedWithPublish','Viewer','ViewerWithPublish']
        },
        {
          label : 'new-auth-setting',
          type: 'dropdown',
          values: ['- New Auth Setting -','ServerDefault','SAML']
        }
      ], helpLink: 'Update_User'}
    };
    $('#input').append("<form onsubmit='return false;' id='apiControlForm'><div class='form-group funcForm'>\
                        <select id='listItems' class='form-control'></select>\
                        </div><button type='submit' id='updateBtn' class='btn btn-secondary btn-sm'>Update</button>\
                        <button type='submit' id='listBtn' class='btn btn-primary btn-sm'>Run</button>\
                        <button type='submit' id='undoBtn' class='btn btn-info btn-sm'>Undo</button>\
                        <button type='submit' id='endpointHelp' class='btn btn-secondary btn-sm'><i class='fa fa-question-circle' aria-hidden='true'></i></button></form>");
    var listSelect = $('#listItems');
    $.each(listFunctions, function(val, opt) {
      var label = opt.label;
      var funcVer = opt.version;
      if(apiVersion>=funcVer) {
        listSelect.append(
            $('<option undoFunction="'+((opt.undoFunction) ? opt.undoFunction : "")+'" undoVersion="'+((opt.undoVersion) ? opt.undoVersion : "")+'" helpLink="'+((opt.helpLink) ? opt.helpLink : "")+'" csvNode="'+((opt.csvNode) ? opt.csvNode : "")+'"></option>').val(val).html(label)
        );
      }
    });

    var newVarsRow = function(html) {
      $('.funcForm').append(html);
      $('#newRow'+formRows).click( function () {
        func[$('#listItems').val()](false);
        $('#newRow'+formRows).hide();
        var nextRow = formRows+1;
        html = html.replace('newRow'+formRows,'newRow'+nextRow);
        formRows++;
        newVarsRow(html);
      });
    }

    listSelect.change(function() {
      $('.funcForm .dynamic').remove();
      $('.funcForm form').remove();
      $('.funcForm div').remove();
      var opt = listFunctions[$('#listItems').val()];
      var formItems = opt.formItems;
      $.each(formItems, function(i, val) {
        if (val.size) {
          var objSize = '<div class="col-xs-'+val.size+' rowwrap">';
        } else {
          var objSize = '';
        }
        switch (val.type) {
          case 'text':
            $('.funcForm').append(objSize+'<label class="sr-only dynamic" for="'+val.label+'">'+val.label+'</label><input type="text" class="form-control dynamic" id="'+val.label+'" placeholder="'+val.label+'"></input>'+((objSize!='') ? '</div>' : ''));
            break;
          case 'dropdown':
            $('.funcForm').append(objSize+'<select class="form-control dynamic" id="'+val.label+'"></select>'+((objSize!='') ? '</div>' : ''));
            var dynDrop = $('#' + val.label);
            var dropItems = val.values;
            $.each(dropItems, function(i, val) {
              dynDrop.append(
                  $('<option></option>').val(val).html(val)
              );
            });
            break;
          case 'multiple':
            var html = "<form onsubmit='return false;'><div class='row multiple'>";
            $.each(val.items, function(j, subVal) {
              if (subVal.size) {
                var objSize = subVal.size;
              } else {
                var objSize = 3;
              }
              switch (subVal.type) {
                case 'text':
                  html += '<div class="col-xs-'+objSize+'"><label class="sr-only dynamic" for="'+subVal.label+'">'+val.label+'</label><input type="text" class="form-control dynamic" id="'+subVal.label+'" placeholder="'+subVal.label+'"></input></div>';
                  break;
                case 'dropdown':
                  html += '<div class="col-xs-'+objSize+'"><select class="form-control dynamic" id="'+subVal.label+'">';
                  var dropItems = subVal.values;
                  $.each(dropItems, function(k, drop) {
                    html += '<option value="'+drop+'">'+drop+'</option>';
                  });
                  html += '</select></div>'
                  break;
              }
            });
            html+='<div class="col-xs-1"><button type="submit" id="newRow'+formRows+'" class="btn btn-info form-control">+</button></div></div></form>'
            newVarsRow(html);
        }
      });
      $('.rowwrap').wrapAll('<div class="row"></div>');
      func[$('#listItems').val()](false);
      writeCode(selectedLang,method,url,headers,body);
      /*$('.funcForm .dynamic').blur(function( event ) {
        func[$('#listItems').val()](false);
      });*/
      $('#listBtn').show();
      $('#undoBtn').hide();
      if (opt.undoFunction && opt.undoVersion <= apiVersion) {
        $('#undoBtn').show();
      };
      $('#endpointHelp').show();
      if ($("#listItems option:selected").attr("csvNode")) {
        $('#exportCsv').show();
      } else {
        $('#exportCsv').hide();
      }
    });
    $('#listBtn').hide();
    $('#undoBtn').hide();
    $('#endpointHelp').hide();
    $('#updateBtn').click(function() {
      func[$('#listItems').val()](false);
    });
    $('#listBtn').click(function() {
      func[$('#listItems').val()](true);
      $('#loading').show();
    });
    $('#undoBtn').click(function() {
      func[$("#listItems option:selected").attr("undoFunction")](true);
    });
    $('#endpointHelp').click(function() {
      var win = window.open('https://onlinehelp.tableau.com/current/api/rest_api/en-us/help.htm#REST/rest_api_ref.htm#'+$("#listItems option:selected").attr("helpLink"), '_blank');
      win.focus();
    })
    $('.funcForm .dynamic').blur(function( event ) {
      func[$('#listItems').val()](false);
    });
    $('#csvExportBtn').click(function() {
      var callVars = {
        "url": url,
        "method": method,
        "body": body,
        "headers" : headers,
        "respLang": "xml",
        "node" : $("#listItems option:selected").attr("csvNode")
      };
      if (apiVersion >= 2.2) {
        callVars.respLang = "json";
      }
      var settings = {
        url : $('#baseUrl').val() + "/api/csv",
        method : "POST",
        data : callVars,
        contentType : "application/x-www-form-urlencoded"
      }
      $('.fa.fa-file-excel-o').attr('class','fa fa-spinner fa-pulse fa-3x fa-fw');
      $.ajax(settings).done(function (response) {
        window.open(response, '_blank');
        $('.fa.fa-spinner.fa-pulse.fa-3x.fa-fw').attr('class','fa fa-file-excel-o');
        //window.location.href = response;
      });
    });
    $('#tdeExportBtn').click(function() {
      var callVars = {
        "url": url,
        "method": method,
        "body": body,
        "headers" : headers,
        "respLang": "xml",
        "node" : $("#listItems option:selected").attr("csvNode")
      };
      if (apiVersion >= 2.2) {
        callVars.respLang = "json";
      }
      var settings = {
        url : $('#baseUrl').val() + "/api/tde",
        method : "POST",
        data : callVars,
        contentType : "application/x-www-form-urlencoded"
      }
      $('.fa.fa-file-text-o').attr('class','fa fa-spinner fa-pulse fa-3x fa-fw');
      $.ajax(settings).done(function (response) {
        window.open(response, '_blank');
        $('.fa.fa-spinner.fa-pulse.fa-3x.fa-fw').attr('class','fa fa-file-text-o');
        //window.location.href = response;
      });
    });
  }
}

$(document).ready(function(){

  init();

	$('ul.nav li a').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.nav li a').removeClass('active');
		$('.tab-content').removeClass('current');

		$(this).addClass('active');
		$("#"+tab_id).addClass('current');
	});

  $('#codeLang button').click(function() {

    $('#codeLang button.btn-primary').addClass('btn-secondary');
    $('#codeLang button.btn-secondary').removeClass('btn-primary');

    $(this).addClass('btn-primary');
    $(this).removeClass('btn-secondary');
    selectedLang = $(this).attr('data-lang');
    writeCode(selectedLang,method,url,headers,body);
  });

  var clipboard = new Clipboard('.copyBtn');
  $('#copyCode').hide();
  $('#codeDiv').hover( function() {
    $('#copyCode').fadeToggle("slow");
  });

});
