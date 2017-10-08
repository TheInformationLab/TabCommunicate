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
    $('#introModal').modal('show');
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
    $('#input').append("<form onsubmit='return false;' id='apiControlForm'><div class='form-group funcForm'>\
                        <select id='listItems' class='form-control'></select>\
                        </div><button type='submit' id='updateBtn' class='btn btn-secondary btn-sm'>Update</button>\
                        <button type='submit' id='listBtn' class='btn btn-primary btn-sm'>Run</button>\
                        <button type='submit' id='undoBtn' class='btn btn-info btn-sm'>Undo</button>\
                        <button type='submit' id='endpointHelp' class='btn btn-outline-light'><i class='fa fa-question-circle' aria-hidden='true'></i></button></form>");
    var listSelect = $('#listItems');
    $.each(apilist, function(val, opt) {
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
      $('.funcForm .form-control-file').remove();
      var opt = apilist[$('#listItems').val()];
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
    if ($('#listItems').val() == "nofunc") {
      writeCode(selectedLang,method,url,headers,body);
    } else {
      func[$('#listItems').val()](false);
    }
  });

  var clipboard = new Clipboard('.copyBtn');
  $('#copyCode').hide();
  $('#codeDiv').hover( function() {
    $('#copyCode').fadeToggle("slow");
  });

});
