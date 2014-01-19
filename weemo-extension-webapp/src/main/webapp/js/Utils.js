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
    console.log($videoAdminApplication);
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
    $('#UIListUsers tbody tr').find('td:first :checkbox').each(function () {
      if ($(this).is(':checked')) {
        isSelected = true;
        var tdElem = $(this).parent().next();
        var spanElem = $(tdElem).find('span:first');
        permissions = permissions.concat($(spanElem).text().concat(", "));        
      }
    });
    if(!isSelected) {
      $(".alert").show(permissions);
    } else {
      permissions = permissions.trim();
      permissions = permissions.substring(0, permissions.length-1);
      $("#userOrGroup").val(permissions);
      $('#userSelector').modal('hide');
    }
  };

  Utils.prototype.openGroupPermission = function(elem, modalId) {
    var $videoAdminApplication = $('#videocalls-alert');
    console.log($videoAdminApplication);
    var url = $(elem).attr("link");


    $.ajax({
      url: url,
      dataType: "json",
      context: this,
      success: function(data){
	$('#groupSelector').appendTo("body");	
	$('#groupSelector').modal('show');

        $.each(data, function (index, value) {
	  var obj = jQuery.parseJSON(value);
          var userName = obj.userName;
          var firstName = obj.firstName;
          var lastName = obj.lastName;
          var email = obj.email;
        });
      },
      error: function(){
      }
    });  
   
  };

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


});


