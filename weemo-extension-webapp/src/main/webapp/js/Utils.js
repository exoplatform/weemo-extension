function Utils() {

  Utils.prototype.displaySuccessAlert = function() {
    var displaySuccessMsg = $("#videocalls-alert").attr("displaySuccessMsg");
    var successMsg = $("#videocalls-alert").attr("successMsg");
    if(displaySuccessMsg === "true") {
      $("#videocalls-alert").append(successMsg);
      $("#videocalls-alert").show();
    }
  };

  Utils.prototype.openUserPermission = function(modalId) {
    var $videoAdminApplication = $('#videocalls-alert');
    console.log($videoAdminApplication);
    var url = $videoAdminApplication.jzURL("VideoCallAdministration.openUserPermission");
    console.log(" URL = " + url);
    $('#'+modalId).appendTo("body");
    $('#'+modalId).modal('show');
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



