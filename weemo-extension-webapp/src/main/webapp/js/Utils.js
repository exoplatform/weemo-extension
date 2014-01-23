var Map = {};

function Utils() {

  Utils.prototype.displaySuccessAlert = function() {
    var displaySuccessMsg = $("#videocalls-alert").attr("displaySuccessMsg");
    var successMsg = $("#videocalls-alert").attr("successMsg");
    if(displaySuccessMsg === "true") {
      $("#videocalls-alert").append(successMsg);
      $("#videocalls-alert").show();
    }
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
	$('#userSelector').modal('show');

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
        permissions = permissions.concat($(spanElem).text().concat(", "));   
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
      $('#userSelector').modal('hide');
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
	$('#groupSelector').modal('show');
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
            'onClick':'utils.selectGroupPermision(this);',
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
        $(upLevelElement).attr('onClick','utils.selectGroupPermision(this);');
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
	$('#groupSelector').modal('show');
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
		  'onClick':'utils.selectGroupPermision(this);',
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
            'onClick':'utils.selectGroupPermision(this);',
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
        $(upLevelElement).attr('onClick','utils.selectGroupPermision(this);');
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
            var li = $('<li/>', {});
            var span = $('<span/>', {
	    'class':'uiIconMiniArrowRight'
	    });
            var a = $('<a/>', {
	      'class':'ItemIcon',
              'href':'javascript:void(0);',
              'onClick':'utils.selectGroupPermision(this);',
              'rel':'tooltip',
              'data-placement':'bottom',
              'text':utils.capitaliseFirstLetter(arrMemberships[i]),
              'title':utils.capitaliseFirstLetter(arrMemberships[i])
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
        $(ulTree).append(li);

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

  Utils.prototype.capitaliseFirstLetter = function(string)
  {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

};

var utils = new Utils();




$( document ).ready(function() {
  $("#chkTurnOff").change(function() {
    if ($("#chkTurnOff").is(':checked')) {
      $("#disableVideoCall").val("true");
    } else {
      $("#disableVideoCall").val("false");	      
    }
  });

  $('#selectAllUsers').click (function () {
     var checkedStatus = this.checked;
     $('#UIListUsers tbody tr').find('td:first :checkbox').each(function () {
        $(this).prop('checked', checkedStatus);
     });
  });  

  $( '#UIListUsers' ).on( 'change', 'input[type="checkbox"]', function() {
    if (!$(this).is(':checked')) {
      $('#selectAllUsers').attr('checked',false);
    }
  });

  
  $("#keyword").bind('keypress keydown keyup', function(e){
    if(e.keyCode == 13) { 
      if ($("#keyword").val().trim() != "") {
        var searchLinkElem = $("#searchLink");          
        utils.searchUserPermission(searchLinkElem); 
      }
      e.preventDefault(); 
    }
  });


});


