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

	$('#userSelector').appendTo("body");	
	$('#userSelector').modal('show');

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
    
    //$('#userSelector').appendTo("body");
    //$('#userSelector').modal('show');
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



