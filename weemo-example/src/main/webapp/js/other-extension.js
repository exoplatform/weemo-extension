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
        $(".btn-weemo-call").removeAttr("disabled");
        $(".btn-weemo-host").removeAttr("disabled");
        $(".btn-weemo-join").removeAttr("disabled");
      } else {
        $(".btn-weemo-call").attr("disabled", "disabled");
        $(".btn-weemo-host").attr("disabled", "disabled");
        $(".btn-weemo-join").attr("disabled", "disabled");
      }
    }, 3000);
    $(".btn-weemo-call").click(function () {
      if (typeof weemoExtension !== 'undefined') {
        var targetUser = $("#callee").val();

        weemoExtension.setUidToCall("weemo"+targetUser); // userid which authenticated by weemo
        weemoExtension.setDisplaynameToCall(targetUser); // Full name of callee. Here we use the same userid for simply
        weemoExtension.setCallType("internal");
        weemoExtension.setCallOwner(true);
        weemoExtension.setCallActive(false);
        weemoExtension.rtcc.createCall(weemoExtension.uidToCall, weemoExtension.callType, weemoExtension.displaynameToCall);
      }
    });

    $(".btn-weemo-host").click(function () {
      if (typeof weemoExtension !== 'undefined') {
        var hostid = $("#teamid").val();

        weemoExtension.setUidToCall(hostid);
        weemoExtension.setDisplaynameToCall(hostid);
        weemoExtension.setCallType("host");
        weemoExtension.setCallOwner(true);
        weemoExtension.setCallActive(false);
        weemoExtension.rtcc.createCall(weemoExtension.uidToCall, weemoExtension.callType, weemoExtension.displaynameToCall);
      }
    });

    $(".btn-weemo-join").click(function () {
      if (typeof weemoExtension !== 'undefined') {
        var hostid = $("#teamid").val();

        weemoExtension.setUidToCall(hostid);
        weemoExtension.setDisplaynameToCall(hostid);
        weemoExtension.setCallType("attendee");
        weemoExtension.setCallOwner(false);
        weemoExtension.setCallActive(false);
        weemoExtension.rtcc.createCall(weemoExtension.uidToCall, weemoExtension.callType, weemoExtension.displaynameToCall);
      }
    });
  });
})(jquery);
