
(function(gj, bts_alert, bts_modal, bts_popover) {

  var Map = {};

  function Utils() {} ;  

  // Display success message after saving VideoCalls Profile
  Utils.prototype.displaySuccessAlert = function() {    
    var alertElem = $("#videocalls-alert");
    var successMsg = $(alertElem).attr("successMsg");
    var icon = $('<i/>', {
      'class':'uiIconSuccess'
    });
    $(alertElem).empty();
    $(alertElem).append(icon);  
    $(alertElem).append(successMsg);
    $("#videocalls-alert").show();
    setTimeout(function() {
      $("#videocalls-alert").hide();
    }, 5000);
  };

  // Display warning message when have some field is blank
  Utils.prototype.displayErrorAlert = function(title) {    
    var alertElem = $("#videocalls-alert-error");
    var successMsg = title + " " + $(alertElem).attr("errorMsg");
    var icon = $('<i/>', {
      'class':'uiIconError'
    });
    $(alertElem).empty();
    $(alertElem).append(icon);
  
    $(alertElem).append(successMsg);
    $("#videocalls-alert-error").show();
    setTimeout(function() {
      $("#videocalls-alert-error").hide();
    }, 5000);
  };

  // Open User Selector popup
  Utils.prototype.openUserPermission = function(elem, modalId) {
    var $videoAdminApplication = $('#videocalls-alert');
    var url = $(elem).attr("link");

    $.ajax({
      url: url,
      dataType: "json",
      context: this,
      success: function(data){
        
        var listUsers = $("#UIListUsers");
        $("#UIListUsers").children('tbody').remove();
        var tbody = $('<tbody/>');
        $(listUsers).append(tbody);

        $.each(data, function (index, value) {
	  var obj = jQuery.parseJSON(value);
          var userName = obj.userName;
          var firstName = obj.firstName;
          var lastName = obj.lastName;
          var displayName = obj.displayName;
          var email = obj.email;
          var tr = $('<tr/>');
          $(tbody).append(tr);
	  var td = $('<td/>', {
	    'class':'center'
	  });
	  $(tr).append(td);
          var span = $('<span/>', {
	    'class':'uiCheckbox'	   
	  });	
          $(td).append(span);
	  var input = $('<input/>', {
	    'class':'checkbox',
	    'type':'checkbox',
            'name':userName,
            'value':displayName,
            'id':userName
	  });	
          var spanLabel = $('<span/>', {
	    	   
	  });	
	  $(span).append(input);
          $(span).append(spanLabel);

 	  var td2 = $('<td/>');
	  var span2 = $('<span/>', {
	    'class':'text',
            'text':userName
	  });
	  $(td2).append(span2);
	  $(tr).append(td2);

	  var td3 = $('<td/>');
	  var span3 = $('<span/>', {
	    'class':'text',
            'text':firstName
	  });
	  $(td3).append(span3);
	  $(tr).append(td3);

	  var td4 = $('<td/>');
	  var span4 = $('<span/>', {
	    'class':'text',
            'text':lastName
	  });
	  $(td4).append(span4);
	  $(tr).append(td4);

	  var td5 = $('<td/>');
	  var a5 = $('<a/>', {
	    'class':'text',
            'href':'javascript:void(0);',
            'text':email
	  });
	  $(td5).append(a5);
	  $(tr).append(td5);

        });
	$('#userSelector').appendTo("body");
        $('#selectAllUsers').attr('checked', false);
	gj('#userSelector').modal('show');
        $(".modal-backdrop").remove();

      },
      error: function(){
      }
    });   
  };
  // Add a use from User Selector into the permission table
  Utils.prototype.addUserPermission = function(elem) {
    var isSelected = false;
    var permissions = "";
    var permissionsLabel = "";
    $('#UIListUsers tbody tr').find('td:first :checkbox').each(function () {
      if ($(this).is(':checked')) {
        isSelected = true;
        var tdElem = $(this).parent().next();
        var spanElem = $(tdElem).find('span:first');
        permissions = permissions.concat($(this).attr("name").concat(", "));   
        permissionsLabel = permissionsLabel.concat($(this).val().concat(", "));     
      }
    });
    if(!isSelected) {
      $(".alert").show(permissions);
    } else {
      permissions = permissions.trim();
      permissions = permissions.substring(0, permissions.length-1);
      permissionsLabel = permissionsLabel.trim();
      permissionsLabel = permissionsLabel.substring(0, permissionsLabel.length-1);
      permissionsLabel = permissionsLabel + " (" + permissions + ")" 
      $("#userOrGroup").val(permissions);
      $("#txtUserOrGroup").val(permissionsLabel);
      gj('#userSelector').modal('hide');
    }
  };

  // Search user by name in User Selector
  Utils.prototype.searchUserPermission = function(elem) {
    var ajaxLink = $(elem).attr("ajaxLink");
    var keyword = $("#keyword").val();
    var filter = $("#filter").val();
    $.ajax({
      url: ajaxLink,
      dataType: "json",
      data: {
      "keyword": keyword,
      "filter": filter
      },
      context: this,
      success: function(data){
        if($.isEmptyObject(data)) {
          var listUsers = $("#UIListUsers");
          $("#UIListUsers").children('tbody').remove();
          return;
        }
        var listUsers = $("#UIListUsers");
        $("#UIListUsers").children('tbody').remove();
        var tbody = $('<tbody/>');
        $(listUsers).append(tbody);

        $.each(data, function (index, value) {
	  var obj = jQuery.parseJSON(value);
          var userName = obj.userName;
          var firstName = obj.firstName;
          var lastName = obj.lastName;
          var displayName = obj.displayName;
          var email = obj.email;
          var tr = $('<tr/>');
          $(tbody).append(tr);
	  var td = $('<td/>', {
	    'class':'center'
	  });
	  $(tr).append(td);
	   var input = $('<input/>', {
	    'class':'checkbox',
	    'type':'checkbox',
            'name':userName,
            'value':displayName,
            'id':userName
	  });	
	  $(td).append(input);

 	  var td2 = $('<td/>');
	  var span2 = $('<span/>', {
	    'class':'text',
            'text':userName
	  });
	  $(td2).append(span2);
	  $(tr).append(td2);

	  var td3 = $('<td/>');
	  var span3 = $('<span/>', {
	    'class':'text',
            'text':firstName
	  });
	  $(td3).append(span3);
	  $(tr).append(td3);

	  var td4 = $('<td/>');
	  var span4 = $('<span/>', {
	    'class':'text',
            'text':lastName
	  });
	  $(td4).append(span4);
	  $(tr).append(td4);

	  var td5 = $('<td/>');
	  var a5 = $('<a/>', {
	    'class':'text',
            'href':'javascript:void(0);',
            'text':email
	  });
	  $(td5).append(a5);
	  $(tr).append(td5);

        });

	$('#userSelector').appendTo("body");
      },
      error: function(){
      }
    }); 
    return false; 
  }

  // Open Group Permission popup
  Utils.prototype.openGroupPermission = function(elem, modalId) {
    var $videoAdminApplication = $('#videocalls-alert');
    var ajaxLink = $(elem).attr("link");
    
    $.ajax({
      url: ajaxLink,
      dataType: "json",
      context: this,
      success: function(data){	
        
        $('#groupSelector').appendTo("body");	
	gj('#groupSelector').modal('show');
        $(".modal-backdrop").remove();
	var memberships = data.memberships;
        var groups = data.groups;   
        console.log(groups);     
        var groupSelector = $("#UIGroupMemberSelector");
        $("#UIGroupMemberSelector .nodeGroup").remove();
        var treeContainer = $("#UIGroupMemberSelector .treeContainer");
        var nodeGroup = $('<ul/>', {
	    'class':'nodeGroup'
	});
        $(treeContainer).append(nodeGroup);
        $.each(groups, function(index, obj){
          var node = $('<li/>', {
	    'class':'node'
	  });
          $(nodeGroup).append(node);
          Map[obj.group.substring(obj.group.lastIndexOf("/")+1)] = obj.label;
          var a = $('<a/>', {
	    'class':'uiIconNode collapseIcon',
            'href':'javascript:void(0);',
            'onClick':'eXo.ecm.VideoCallsUtils.selectGroupPermision(this);',
            'groupId':obj.group,
            'ajaxLink':ajaxLink,
            'title':obj.label
	  });
          var span = $('<span/>', {
	    'text':obj.label
	  });
          $(node).append(a);
          var item = $('<i/>', {
	    'class':'uiIconGroup uiIconLightGray'
	  });
          $(a).append(item);    
	  $(a).append(span);   
          
        })
        //Build link for up level icon
        var upLevelElement = $("#UIGroupMemberSelector .treeContainer:first").find("a:first"); 
        $(upLevelElement).attr('href','javascript:void(0);');
        $(upLevelElement).attr('onClick','eXo.ecm.VideoCallsUtils.selectGroupPermision(this);');
        $(upLevelElement).attr('ajaxLink',ajaxLink);
      },
      error: function(){

      }
    }); 
  };
 
  // Add a group into the permission field.
  Utils.prototype.selectGroupPermision = function(elem)
  {
    var ajaxLink = $(elem).attr("ajaxLink");
    var groupId = $(elem).attr("groupId");
    var groupTitle = $(elem).attr("title");
    var parentId = "";
    var arrGroups = "";
    if(groupId && groupId.length > 0) {
      arrGroups = groupId.split("/");
      if(arrGroups.length > 2) {
	for (var i = 1; i < arrGroups.length-1; i++) {
	  parentId = parentId.concat("/").concat(arrGroups[i]);
        }
      }
    }
    
    $.ajax({
      url: ajaxLink,
      dataType: "json",
      data: {
      "groupId": groupId      
      },
      context: this,
      success: function(data) {	
        $('#groupSelector').appendTo("body");	
	    gj('#groupSelector').modal('show');
        $(".modal-backdrop").remove();
	    var memberships = data.memberships;
        var groups = data.groups;        
        console.log(groups);
        var groupSelector = $("#UIGroupMemberSelector");
        var treeContainer = $("#UIGroupMemberSelector .treeContainer");
        $("#UIGroupMemberSelector .nodeGroup").remove();
        var nodeGroup = $('<ul/>', {
			'class':'nodeGroup'
		});
        $(treeContainer).append(nodeGroup);
        $("#UIGroupMemberSelector .uiContentBox").find("ul").remove();
        $.each(groups, function(index, obj){
          var node = $('<li/>', {
			'class':'node'
		  });
          $(nodeGroup).append(node);
          var aCSSClass = "uiIconNode";
          var nodeChildGroup = null;          
          // Check the current selected group
          if(groupId && obj.group.toUpperCase() === groupId.toUpperCase()) {
            var currentIcon = $(elem).attr("class");            
            if(currentIcon.indexOf("collapseIcon")>=0) {
              aCSSClass = aCSSClass + " expandIcon";
			} else {
			  aCSSClass = aCSSClass + " collapseIcon";
			}
            aCSSClass = aCSSClass + " nodeSelected";
            var children = $.parseJSON(obj.children);
			nodeChildGroup = $('<ul/>', {
				  'class':'nodeGroup'
			});	  
            // Check if current selected have chidren or not
            if(children) {
              // Build child groups for left panel
              if(currentIcon.indexOf("collapseIcon")>=0) {
				  $.each(children, function(index, child){
					var childNode = $('<li/>', {
					  'class':'node'
					});
					$(nodeChildGroup).append(childNode);
					Map[child.group.substring(child.group.lastIndexOf("/")+1)] = child.label;
					var aChild = $('<a/>', {
					  'class':'uiIconNode collapseIcon',
					  'href':'javascript:void(0);',
					  'onClick':'eXo.ecm.VideoCallsUtils.selectGroupPermision(this);',
					  'groupId':child.group,
					  'ajaxLink':ajaxLink,
					  'title':child.label
					});
					var spanChild = $('<span/>', {
					  'text':child.label
					});
					$(childNode).append(aChild);
					var itemChild = $('<i/>', {
					  'class':'uiIconGroup uiIconLightGray'
					});
					$(aChild).append(itemChild);    
					$(aChild).append(spanChild);                
				  }); 
			  }
              // Build child groups for right panel	      
              var contentBox = $("#UIGroupMemberSelector .uiContentBox:first");
              var ulElem = $('<ul/>', {});
              $(contentBox).append(ulElem);  
              $.each(children, function(index, child){
                 var li = $('<li/>', {});
				 var span = $('<span/>', {
				   'class':'uiIconMiniArrowRight'
				 });
  
                 var a = $('<a/>', {
					'class':'ItemIcon',
                   'href':'javascript:void(0);',
                   'onClick':'eXo.ecm.VideoCallsUtils.selectMembership(this);',
                   'rel':'tooltip',
                   'data-placement':'bottom',
                   'membership':child.group,
                   'membershipLabel':child.label,
                   'text':child.label,
                   'title':child.label
				 });
                 $(li).append(span);
				 $(li).append(a);
				 $(ulElem).append(li);				   

              });             
            } else {
			  var contentBox = $("#UIGroupMemberSelector .uiContentBox:first");
              var ulElem = $('<ul/>', {});
              $(contentBox).append(ulElem);
              var li = $('<li/>', {});
		      var span = $('<span/>', {
				'class':'uiIconMiniArrowRight'
			  });
			  var selectChildGroupLabel = $("#videocalls-label").attr("selectThisGroup");
		      var a = $('<a/>', {
				'class':'ItemIcon',
				'href':'javascript:void(0);',
				'onClick':'eXo.ecm.VideoCallsUtils.selectMembership(this);',
				'rel':'tooltip',
				'data-placement':'bottom',
				'membership':groupId,
				'membershipLabel':groupTitle,
				'text':selectChildGroupLabel,
				'title':groupTitle
			  });
              $(li).append(span);
              $(li).append(a);
              $(ulElem).append(li);
			}
          } else {
            aCSSClass = "uiIconNode collapseIcon";
          }
          var a = $('<a/>', {
	    'class':aCSSClass,
            'href':'javascript:void(0);',
            'onClick':'eXo.ecm.VideoCallsUtils.selectGroupPermision(this);',
            'groupId':obj.group,
            'ajaxLink':ajaxLink,
            'title':obj.label
	  });
          var span = $('<span/>', {
	    'text':obj.label
	  });
          $(node).append(a);
          $(node).append(nodeChildGroup);
          var item = $('<i/>', {
	    'class':'uiIconGroup uiIconLightGray'
	  });
          $(a).append(item);    
	  $(a).append(span);    
        })
        //Build link for up level icon
        var upLevelElement = $("#UIGroupMemberSelector .treeContainer:first").find("a:first"); 
        $(upLevelElement).attr('href','javascript:void(0);');
        $(upLevelElement).attr('onClick','eXo.ecm.VideoCallsUtils.selectGroupPermision(this);');
        $(upLevelElement).attr('ajaxLink',ajaxLink);
        if(parentId && parentId.length > 0) {
          $(upLevelElement).attr('groupId',parentId);
        } else {
          $(upLevelElement).removeAttr('groupId');
        }
       
        //Build breadcumb
        $("#UIGroupMemberSelector .breadcrumb").remove();
        var uiBreadCumb = $("#UIGroupMemberSelector .uiGrayLightBox:first");
        var ulTree = $('<ul/>', {
	    'class':'breadcrumb'
	});
        $(uiBreadCumb).append(ulTree);
        //Icon
        var li = $('<li/>', {});
        var item = $('<i/>', {
	  'class':'uiIconTree uiIconLightGray'
	});
        $(li).append(item);
        $(ulTree).append(li).append(" ");

        for(var i=1; i<arrGroups.length; i++) {
	  //Group label
          var liGroup;
          if(groupId && arrGroups[i].toUpperCase() === groupId.substring(groupId.lastIndexOf("/")+1, groupId.length).toUpperCase())   {            
            liGroup = $('<li/>', {
              "class":"active"
            });
          } else {
            liGroup = $('<li/>', {});
          }
          var a = $('<a/>', {
	    'text':Map[arrGroups[i]]
	  });
          $(liGroup).append(a);         
          if(i<arrGroups.length-1) {
            var itemGroup = $('<i/>', {
	      'class':'uiIconArrowRightMini uiIconLightGray'
	    });
            $(liGroup).append(itemGroup); 
          } 
          $(ulTree).append(liGroup); 
        }
        
      },
      error: function(){
      }

    });
  }

  // Select a membership add fill it into permission field.
  Utils.prototype.selectMembership = function(elem)
  {
    var membership = "*:" + $(elem).attr("membership");   
    var membershipLabel = $(elem).attr("membershipLabel");
    var permissionInLabel = $("#videocalls-label").attr("permissionIn");
    membershipLabel = "* " + permissionInLabel + " " + membershipLabel + " (" + membership + ")";
    $("#userOrGroup").val(membership);
    $("#txtUserOrGroup").val(membershipLabel);
    gj('#groupSelector').modal('hide');
  }
  
  // Add a permission into permission table
  Utils.prototype.addPermissions = function() {
    var permissions = $("#userOrGroup").val();  
    if(!permissions || permissions.length==0) return;
    var permissionsLabel = $("#txtUserOrGroup").val();  
    var arrPermissions = permissions.split(",");
    var arrPermissionsLabel = permissionsLabel.split(",");
    var tbody = $("#UIViewPermissionContainer").find("tbody:first");
    if(arrPermissions.length > 0) {
      $(tbody).find(".empty").remove();
    }

    
    //Get list of permissions
    var permissionsMap = {};
    var uiViewPermissionList = $("#UIViewPermissionList");
    if($(uiViewPermissionList).find(".empty").length>0) {
      permissionData = null;
    } else {
      var tbody = $(uiViewPermissionList).find("tbody:first");
      if($(tbody).find("tr").length>0) {
        $(tbody).find("tr").each(function(i) {
          if($(this).find("td").length>0) {
            var tdPermission = $(this).find("td")[0];
	    var tdOnOff = $(this).find("td")[1];
            var value = $(tdOnOff).find("input:first").val();
            permissionsMap[$(tdPermission).find("div:first").attr("permission").trim()] = value;
          }
        });
      }
    }
    
    
    for(var i=0; i < arrPermissions.length; i++) {
      if(permissionsMap[arrPermissions[i]]) continue;
      var tr = $('<tr/>', {});
      //td for permission
      var tdPermission = $('<td/>', {
        "class":"left"
      });
      var divPermission = $('<div/>', {
        "permission":arrPermissions[i],
	"title":arrPermissionsLabel[i],
	"text":arrPermissionsLabel[i],
        "class":"Text"
      });
      $(tdPermission).append(divPermission); 
      $(tr).append(tdPermission); 
      //td for switcher icon
      var tdIcon = $('<td/>', {
        "class":"center"
      });
      var divIcon = $('<div/>', {        
        "class":"spaceRole"
      });
      var yesLabel = $("#videocalls-label").attr("yesLabel");
      var noLabel = $("#videocalls-label").attr("noLabel");
      var inputIcon = $('<input/>', { 
        "type":"checkbox",
        "id":"enableVideoCalls",
        "name":"enableVideoCalls",
        "value":"true",
        "data-yes":yesLabel,
        "data-no":noLabel,
        "checked":"checked",
        "style":"visibility: hidden;",       
        "class":"yesno"
      });
      $(divIcon).append(inputIcon); 
      $(tdIcon).append(divIcon);
      $(tr).append(tdIcon); 
      // td for action
      var tdAction = $('<td/>', {
        "class":"center"
      });
      var aAction = $('<a/>', {
        "data-original-title":"Delete",
	"data-placement":"bottom",
	"rel":"tooltip",
	"onclick":"eXo.ecm.VideoCallsUtils.showDeleteConfirm(this);",
        "class":"actionIcon"
      });
      var iconDelete = $('<i/>', {
        "class":"uiIconDelete uiIconLightGray"
      });
      $(aAction).append(iconDelete); 
      $(tdAction).append(aAction);
      $(tr).append(tdAction);       
      $(tbody).append(tr);      
    }
    
    eXo.ecm.VideoCallsUtils.reloadSwitcherButton();
    
    $("#userOrGroup").val("");
    $("#txtUserOrGroup").val("");  
  }

  // Show confirmation message before removing a permission
  Utils.prototype.showDeleteConfirm = function(elem) {
    $('#deleteCofirmation').appendTo("body");
    var deleteButton = $('#deleteCofirmation').find(".btn-primary:first");
    $(deleteButton).click(function() {
      $(elem).closest('tr').remove();
      gj('#deleteCofirmation').modal('hide');
    });

    $('#deleteCofirmation').on('hidden', function () {
      $(deleteButton).unbind( "click" );
    });
    var tr = $(elem).closest('tr');
    var td = $(tr).find("td:first");
    var div = $(td).find("div:first");
    var owner = $(div).text();
    var span = $('#deleteCofirmation').find(".modal-body:first").find("span:first")
    var msg = $(span).attr("msg");    
    msg = msg + " <strong>" + owner + "</strong> ?";
    $(span).empty();
    $(span).append(msg);    
    gj('#deleteCofirmation').modal('show');
    $(".modal-backdrop").remove();
    
  }
  
  // Reload swithcer button to get right status
  Utils.prototype.reloadSwitcherButton = function() {

    $("div.spaceRole").each(function() {
      $(this).click(function()
      {
	var input = $(this).find("#enableVideoCalls");
	var remembermeOpt = input.attr("value") == "true" ? "false" : "true";
	input.attr("value", remembermeOpt);
      });
      var yeslabel;
      var nolabel;
     
      $(this).children('input:checkbox').each(function () {
        yeslabel = $(this).data("yes");
        nolabel = $(this).data("no");
        $(this).iphoneStyle({
          checkedLabel:yeslabel,
          uncheckedLabel:nolabel
        });
        $(this).change(function()
        {
          $(this).closest("div.spaceRole").trigger("click");
        });
      });     
     
    });
    
  }
  
  // Test Weemo connection with parametters getted from VideoCalls Profile
  Utils.prototype.testWeemoConnection = function() {
    var testWeemoURL = "/rest/weemo/auth";
    jqchat.ajax({
      url: testWeemoURL, 
      dataType: "text",   
      context: this,
      success: function(data){
        if(data.length>0) {
          eXo.ecm.VideoCallsUtils.showTestWeemoSuccess();
        } else {
          eXo.ecm.VideoCallsUtils.showTestWeemoError();
        } 

      },
      error: function(){
        eXo.ecm.VideoCallsUtils.showTestWeemoError();
      }
    });
  }
  
  // Test Weemo connection with parametters getted from VideoCalls Profile
  Utils.prototype.authWeemoConnection = function(elem) {
    var authLink = $(elem).attr("linkAuth");
    var formVideoAdmin = $("#videoCallsPermissionForm");
    $(formVideoAdmin).attr("action",authLink);
    $(formVideoAdmin).submit();
  }

  // Save VideoCalls Profile
  Utils.prototype.saveVideoCallsProfile = function(elem) {
    var saveLink = $(elem).attr("linkSave");
    var formVideoAdmin = $("#videoCallsPermissionForm");
    $(formVideoAdmin).attr("action",saveLink);
    $(formVideoAdmin).submit();
  }
  

  // Show message when connect to Weemo successfull
  Utils.prototype.showTestWeemoSuccess = function() {
    var testWeemoElem = $("#videocalls-alert-test-connection-error");
    var successTestConnMsg = $(testWeemoElem).attr("successTestConnMsg");
    var icon = $('<i/>', {
      'class':'uiIconSuccess'
    });
    $(testWeemoElem).empty();
    $(testWeemoElem).removeClass("alert-error videoCallsAlertError");
    $(testWeemoElem).addClass("alert-success videoCallsAlertSuccess");    
    $(testWeemoElem).append(icon);  
    $(testWeemoElem).append(successTestConnMsg);
    $(testWeemoElem).show();
    setTimeout(function() {
      $(testWeemoElem).hide();
    }, 5000);
  } 
  
  // Show the message when have problem while connecto to Weemo
  Utils.prototype.showTestWeemoError = function() {
    var testWeemoElem = $("#videocalls-alert-test-connection-error");
    var errorTestConnMsg = $(testWeemoElem).attr("errorTestConnMsg");
    var icon = $('<i/>', {
      'class':'uiIconError'
    });
    $(testWeemoElem).empty();    
    $(testWeemoElem).removeClass("alert-success videoCallsAlertSuccess");
    $(testWeemoElem).addClass("alert-error videoCallsAlertError");
    $(testWeemoElem).append(icon);  
    $(testWeemoElem).append(errorTestConnMsg);
    $(testWeemoElem).show();
    setTimeout(function() {
      $(testWeemoElem).hide();
    }, 5000);
  }

  // Remove the updated file for chosing another file
  Utils.prototype.removeUploadedFile = function(elem, id) {
    var container = $(elem).closest(".control-group");
    var control = $(container).find(".controls:first");
    var label = $(container).find("label:first");
    var id = $(label).attr("for");
    $(control).empty();    
    var divElem = $('<div/>', { 
      "style":"left: 0px; position: absolute; top: 0px; z-index: 1; white-space: nowrap;"      
    });

    var buttonUpload = $('<button/>', { 
      "type":"button",
      "class":"btn btn-small",
      "onkeypress":"return false;"
    });
    var iconUpload = $('<i/>', { 
      "class":"uiIconUpload uiIconLightGray"
    });    
    var uploadLabel = $("#videocalls-label").attr("uploadLabel");
    $(buttonUpload).append(iconUpload);
    $(buttonUpload).append(" ").append(uploadLabel);
    $(divElem).append(buttonUpload);
    $(control).append(divElem);

    var noFileLable = $("#videocalls-label").attr("noFileLabel");
    var spanElem = $('<span/>', {       
      "text":noFileLable,
      "style":"text-overflow: ellipsis; white-space: nowrap; width: 137px; overflow: hidden; height: 28px; display: inline-block; margin: 0px 10px; vertical-align: middle;"
    });
    $(divElem).append(spanElem);

    var inputUpload = $('<input/>', { 
      "type":"file",
      "id":id,
      "name":id,
      "class":"file fileHidden",
      "onkeypress":"return false;",
      "style":"margin: 0 8px 0 22px; width: 80px;"
    });
    $(control).append(inputUpload);
    $(inputUpload).width($(buttonUpload).width());
    
    
    //Listen onchange event of upload field
    $(inputUpload).change(function (){
      var fileName = $(this).val();
      if(fileName.length > 0) {
        fileName = eXo.ecm.VideoCallsUtils.getNameOfFile(fileName);
      }
      var containerElem = $(this).closest(".controls");
      var spanElem = $(containerElem).find("span:first");
      $(spanElem).html(fileName);
      
    });

  }
  // Get file's name from full path
  Utils.prototype.getNameOfFile = function(fileName) {
    fileName = fileName.replace(/^.*[\\\/]/, '');
    return fileName;
  }

  Utils.prototype.capitaliseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  Utils.prototype.showPopover = function (element) {
    gj(element).popover({template: '<div class="popover"><div class="arrow"></div><div class="inner"><h3 class="popover-title" style="display:none;"></h3><div class="popover-content"><p></p></div></div></div>'});
    gj(element).popover('show');       		
  };

  Utils.prototype.hidePopover = function (element) {
    gj(element).popover('hide');
  };


  eXo.ecm.VideoCallsUtils = new Utils();
  return {
    VideoCallsUtils : eXo.ecm.VideoCallsUtils
  };
  

})(gj, bts_alert, bts_modal, bts_popover);


