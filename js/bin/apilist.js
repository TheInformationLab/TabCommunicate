var apilist = {
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
  ], undoFunction: 'apiDeleteDatasourceFavorites', undoVersion: 2.3, helpLink: 'Add_Datasource_to_Favorites'},
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
  apiAddTagstoDatasource : {label : 'Add Tags to Datasource', version : 1.0, formItems : [
    {
      label: 'datasource-id',
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
  ], undoFunction: 'apiDeleteTagfromDatasource', undoVersion: 1.0, helpLink: 'Add_Tags_to_Datasource'},
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
