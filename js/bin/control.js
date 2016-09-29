var init = function() {
  $('#input').append("<form class='form-inline' onsubmit='return false;'>\
                        <div class='form-group'>\
                          <label class='sr-only' for='serverUrl'>Server URL</label>\
                          <input type='text' class'form-control' id='serverUrl' placeholder='Server URL' value=''/>\
                        </div>\
                        <button type='submit' id='serverBtn' class='adv btn btn-primary btn-sm'>Go</button>\
                      </form>");
  $('#input').append("<form class='form-inline' onsubmit='return false;'>\
                        <div class='form-group'>\
                          <label class='sr-only' for='site'>Site ID</label>\
                          <input type='text' id='site' placeholder='Site ID' value=''/>\
                        </div>\
                        <div class='form-group'>\
                          <label class='sr-only' for='username'>Username</label>\
                          <input type='text' id='username' placeholder='Username' value=''/>\
                        </div>\
                        <div class='form-group'>\
                          <label class='sr-only' for='password'>Password</label>\
                          <input type='password' id='password' placeholder='Password' value=''/>\
                        </div>\
                        <button type='submit' id='loginBtn' class='btn btn-primary btn-sm'>Sign In</button>\
                      </form>");
  $('#serverBtn').click(func.getServerSettingsUnauthenticated);
  $('#loginBtn').click(func.apiSignin);

  $('#serverUrl').blur(function () {
    setCookie('serverUrl',$('#serverUrl').val());
    func.getServerSettingsUnauthenticated();
  });
  $('#site').blur(function () {
    setCookie('site',$('#site').val());
  });
  $('#username').blur(function () {
    setCookie('username',$('#username').val());
  });

  if (getCookie('serverUrl')) {
    $('#serverUrl').val(getCookie('serverUrl'));
  }
  if (getCookie('site')) {
    $('#site').val(getCookie('site'));
  }
  if (getCookie('username')) {
    $('#username').val(getCookie('username'));
  }

  $('#codeLang').append('<div class="btn-group" role="group" aria-label="Basic example">\
      <button type="button" class="btn btn-primary btn-sm" data-lang="jsAjax">JS AJAX</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="nodeRequest">NodeJS Request</button>\
      <button type="button" class="btn btn-secondary btn-sm" data-lang="phpHttpRequest">PHP HttpRequest</button>\
    </div>');

  if (credsToken.length > 0) {
    apiControls();
  }
}

var apiControls = function () {
  if (!$('.funcForm').length) {
    var listFunctions = {
      nofunc : {label : ' - Select API Endpoint -', version : 1.0, formItems : []},
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
      ]},
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
      ]},
      apiGetUsersonSite : {label : 'Get Users on Site', version : 1.0, formItems : []},
      apiQueryDatasource : {label : 'Query Datasource', version : 1.0, formItems : [
        {
          label : 'datasource-id',
          type : 'text'
        }
      ]},
      apiQueryDatasourceConnections : {label : 'Query Datasource Connections', version : 2.3, formItems : [
        {
          label : 'datasource-id',
          type : 'text'
        }
      ]},
      apiQueryDatasourcePermissions : {label : 'Query Datasource Permissions', version : 2.0, formItems : [
        {
          label : 'datasource-id',
          type : 'text'
        }
      ]},
      apiQueryDatasources : {label : 'Query Datasources', version : 1.0, formItems : []},
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
      ]},
      apiQueryExtractRefreshTasks : {label : 'Query Extract Refresh Tasks', version : 2.2, formItems : [
        {
          label : 'schedule-id',
          type : 'text'
        }
      ]},
      apiQueryGroups : {label : 'Query Groups', version : 2.0, formItems : []},
      apiQueryJob : {label : 'Query Job', version : 2.0, formItems : [
        {
          label : 'job-id',
          type : 'text'
        }
      ]},
      apiQuerySchedules : {label : 'Query Schedules', version : 2.2, formItems : []},
      apiQuerySites : {label : 'Query Sites', version : 1.0, formItems : []},
      apiQueryProjects : {label : 'Query Projects', version : 2.0, formItems : []},
      apiQueryViewsforSite : {label : 'Query Views for Site', version : 2.2, formItems : []},
      apiQueryWorkbooksforSite : {label : 'Query Workbooks for Site', version : 2.3, formItems : []},
      apiQueryWorkbooksforUser : {label : 'Query Workbooks for User', version : 1.0, formItems : [
        {
          label : 'user-id',
          type : 'text'
        }
      ]}
    };
    $('#input').append("<form onsubmit='return false;'><div class='form-group funcForm'>\
                        <select id='listItems' class='form-control'></select>\
                        </div><button type='submit' id='listBtn' class='btn btn-primary btn-sm'>Run</button>");
    var listSelect = $('#listItems');
    $.each(listFunctions, function(val, opt) {
      var label = opt.label;
      var funcVer = opt.version;
      if(apiVersion>=funcVer) {
        listSelect.append(
            $('<option></option>').val(val).html(label)
        );
      }
    });

    listSelect.change(function() {
      $('.funcForm .dynamic').remove();
      var opt = listFunctions[$('#listItems').val()];
      var formItems = opt.formItems;
      $.each(formItems, function(i, val) {
        switch (val.type) {
          case 'text':
            $('.funcForm').append('<label class="sr-only dynamic" for="'+val.label+'">'+val.label+'</label><input type="text" class="form-control dynamic" id="'+val.label+'" placeholder="'+val.label+'"></input>');
            break;
          case 'dropdown':
            $('.funcForm').append('<select class="form-control dynamic" id="'+val.label+'"></select>');
            var dynDrop = $('#' + val.label);
            var dropItems = val.values;
            $.each(dropItems, function(i, val) {
              dynDrop.append(
                  $('<option></option>').val(val).html(val)
              );
            });
            break;
        }
      });
      func[$('#listItems').val()](false);
      writeCode(selectedLang,method,url,headers,body);
      $('.funcForm input.dynamic').keypress(function( event ) {
        if ( event.which == 13 ) {
           event.preventDefault();
        }
        func[$('#listItems').val()](false);
      });
      $('.funcForm select.dynamic').change(function() {
        func[$('#listItems').val()](false);
      });
    });

    $('#listBtn').click(function() {
      func[$('#listItems').val()](true);
    });

    //Set form for first selected value
    var opt = listFunctions[$('#listItems').val()];
    var formItems = opt.formItems;
    $.each(formItems, function(i, val) {
      switch (val.type) {
        case 'text':
          $('.funcForm').append('<label class="sr-only dynamic" for="'+val.label+'">'+val.label+'</label><input type="text" class="form-control dynamic" id="'+val.label+'" placeholder="'+val.label+'"></input>');
          break;
        case 'dropdown':
          $('.funcForm').append('<select class="form-control dynamic" id="'+val.label+'"></select>');
          var dynDrop = $('#' + val.label);
          var dropItems = val.values;
          $.each(dropItems, function(i, val) {
            dynDrop.append(
                $('<option></option>').val(val).html(val)
            );
          });
          break;
      }
    });
    $('.funcForm input.dynamic').keypress(function( event ) {
      if ( event.which == 13 ) {
         event.preventDefault();
      }
      func[$('#listItems').val()](false);
    });
    $('.funcForm select.dynamic').change(function() {
      func[$('#listItems').val()](false);
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

});
