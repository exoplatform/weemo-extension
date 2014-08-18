/**
 * @constructor
 */

function OtherExtension() {
}

// GLOBAL VARIABLES
var otherExtension = new OtherExtension();

(function ($) {
  $(document).ready(function () {
    setInterval(function() {
      if ((typeof weemoExtension !== 'undefined') && weemoExtension.isConnected) {
        $(".btn-weemo").removeAttr("disabled");
        $(".btn-weemo-conf").removeAttr("disabled");
      } else {
        $(".btn-weemo").attr("disabled", "disabled");
        $(".btn-weemo-conf").attr("disabled", "disabled");
      }
    }, 3000);
    $(".btn-weemo").click(function () {
      if (typeof weemoExtension !== 'undefined') {
        var targetUser = $("#callee").val();
        console.log("targetUser : " + targetUser);
        weemoExtension.createWeemoCall(targetUser, targetUser);
      }
    });

    $(".btn-weemo-conf").click(function () {
      if (typeof weemoExtension !== 'undefined') {
        var hostid = $("#callee").val();
        console.log("Host ID : " + hostid);
        weemoExtension.setUidToCall(hostid);
        weemoExtension.joinWeemoCall();
      }
    });
  });
})(jquery);
