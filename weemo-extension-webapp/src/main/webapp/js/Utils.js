
(function(gj, bts_alert, bts_modal, bts_popover) {

  var Map = {};

  function Utils() {} ;

  Utils.prototype.saveVideoCallsPermission = function() {
    var ajaxLink = $("#videoCallsPermissionForm").attr("action");
    var disableVideoCall = $("#disableVideoCall").val();
    var weemoKey = $("#weemoKey").val();
    var authId = $("#authId").val();
    var authSecret = $("#authSecret").val();
    var passPhrase = $("#customerCertificatePassphrase").val();
    var permissionData = "";
    //Get list of permissions
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
            permissionData = permissionData + "," + $(tdPermission).find("div:first").attr("permission") + "#" + value;
          }
        });
      }
      permissionData = permissionData.substring(1);
    }
    $.ajax({
      url: ajaxLink,
      dataType: "text",
      data: {
      "disableVideoCall": disableVideoCall,
      "weemoKey": weemoKey,
      "authId":authId,
      "authSecret":authSecret,
      "customerCertificatePassphrase":passPhrase,
      "videoCallPermissions":permissionData
      },
      success: function(data){
        eXo.ecm.VideoCallsUtils.displaySuccessAlert();
      },
      error: function(){
      }
    });  
    
  };

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
    }, 3000);
  };

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
      $("#userOrGroup").val(permissions);
      $("#txtUserOrGroup").val(permissionsLabel);
      gj('#userSelector').modal('hide');
    }
  };

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

  Utils.prototype.selectGroupPermision = function(elem)
  {
    var ajaxLink = $(elem).attr("ajaxLink");
    var groupId = $(elem).attr("groupId");
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
        var groupSelector = $("#UIGroupMemberSelector");
        var treeContainer = $("#UIGroupMemberSelector .treeContainer");
        $("#UIGroupMemberSelector .nodeGroup").remove();
        var nodeGroup = $('<ul/>', {
	    'class':'nodeGroup'
	});
        $(treeContainer).append(nodeGroup);
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
            if(children && currentIcon.indexOf("collapseIcon")>=0) {
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
        //Build memberships
        $("#UIGroupMemberSelector .uiContentBox").find("ul").remove();
        var contentBox = $("#UIGroupMemberSelector .uiContentBox:first");
    
        var arrMemberships = memberships.split(",");
        if(arrMemberships.length > 0) {          
          var ulElem = $('<ul/>', {});
          $(contentBox).append(ulElem);    
          for(var i=0; i < arrMemberships.length; i++) {
            var membershipLabel = "";
            if(arrMemberships[i] === "*") {
	      membershipLabel = "Any ";
	    } else {
	      membershipLabel = eXo.ecm.VideoCallsUtils.capitaliseFirstLetter(arrMemberships[i] + " ");
	    }
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
              'membership':arrMemberships[i] + ":" +groupId,
              'membershipLabel':membershipLabel + "in " + eXo.ecm.VideoCallsUtils.capitaliseFirstLetter(groupId.substring(groupId.lastIndexOf("/")+1)),
              'text':eXo.ecm.VideoCallsUtils.capitaliseFirstLetter(arrMemberships[i]),
              'title':eXo.ecm.VideoCallsUtils.capitaliseFirstLetter(arrMemberships[i])
	    });
            $(li).append(span);
	    $(li).append(a);
	    $(ulElem).append(li);
          }
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

  Utils.prototype.selectMembership = function(elem)
  {
    var membership = $(elem).attr("membership");   
    var membershipLabel = $(elem).attr("membershipLabel");    
    $("#userOrGroup").val(membership);
    $("#txtUserOrGroup").val(membershipLabel);
    gj('#groupSelector').modal('hide');
  }

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
        "data-placement":"bottom",
	"rel":"tooltip",
        "permission":arrPermissions[i],
	"data-original-title":arrPermissionsLabel[i],
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
      var inputIcon = $('<input/>', { 
        "type":"checkbox",
        "id":"enableVideoCalls",
        "name":"enableVideoCalls",
        "value":"true",
        "data-yes":"YES",
	"data-no":"NO",
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
        "class":"uiIconDelete"
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
