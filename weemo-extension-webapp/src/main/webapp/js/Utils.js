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
        //Create modal object
        /*$('#userSelector').remove();
        var modalObj = $('<div/>', {
	    'id':'userSelector',
	    'class':'modal fade',
	    'tabindex':-1,
	    'role':'dialog',
            'aria-labelledby':'myModalLabel',
            'aria-hidden':'true',
	    'style':'display: none;'
	});
        $("body").append(modalObj);
        var modalDialog = $('<div/>', {
	    'class':'modal-dialog'
	});
        $(modalObj).append(modalDialog);
	var modalContent = $('<div/>', {
	    'class':'modal-content'
	});
        $(modalDialog).append(modalContent);
        // Modal Header
	var modalHeader = $('<div/>', {
	    'class':'modal-header'
	});
	$(modalContent).append(modalHeader);
        var closeButton = $('<button/>', {
	    'class':'close',
	    'type':'button',
	    'data-dismiss':'modal',
            'aria-hidden':'true',
            'text':'x'
	});
        $(modalHeader).append(closeButton);
        var modalTitle = $('<h4/>', {
	    'class':'modal-title',
	    'id':'modalTitle',	
            'text':'User Selector'
	});
	$(modalHeader).append(modalTitle);

	//Modal Body
	var modalBody = $('<div/>', {
	    'class':'modal-body'
	});
	$(modalContent).append(modalBody);

	//Modal Footer
	var modalFooter = $('<div/>', {
	    'class':'modal-footer'
	});
	$(modalContent).append(modalFooter);
        var closeButton = $('<button/>', {
	    'class':'btn btn-default',
	    'type':'button',
	    'data-dismiss':'modal',            
            'text':'Close'
	});
	var addButton = $('<button/>', {
	    'class':'btn btn-primary',
	    'type':'button',
	    'data-dismiss':'modal',            
            'text':'Add'
	});
	$(modalFooter).append(closeButton);
	$(modalFooter).append(addButton);*/

	
        var listUsers = $("#UIListUsers");
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
	  var span = $('<span/>', {
	    'class':'uiCheckbox'
	  });
	  $(td).append(span);
	  var input = $('<input/>', {
	    'class':'checkbox',
	    'type':'checkbox',
            'name':userName,
            'id':userName
	  });
	  $(span).append(input);
          
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
    
    //$('#userSelector').appendTo("body");
    //$('#userSelector').modal('show');
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
});



