function Utils() {
  Utils.prototype.displaySuccessAlert = function() {
    var displaySuccessMsg = $("#videocalls-alert").attr("displaySuccessMsg");
    var successMsg = $("#videocalls-alert").attr("successMsg");
    if(displaySuccessMsg === "true") {
      $("#videocalls-alert").append(successMsg);
      $("#videocalls-alert").show();
    }
  };
};

var utils = new Utils();

$( document ).ready(function() {
  $("#chkTurnOff").change(function() {
    if ($("#chkTurnOff").is(':checked')) {
      $("#disableVideoCall").val("true");
    } else {
      $("#disableVideoCall").val("false");
      alert('test');
    }
  });
});

