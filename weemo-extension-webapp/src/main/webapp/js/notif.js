/**
 ##################                           ##################
 ##################                           ##################
 ##################   WEEMO EXTENSION         ##################
 ##################                           ##################
 ##################                           ##################
 */


/**
 * WeemoExtension Class
 * @constructor
 */
function WeemoExtension() {
  this.username = "";
  this.jzGetState = "";
  this.getStateURL = "";
  this.urlHasOneOneCallPermission = "";
  this.tokenKey = "";
  this.weemoKey = "";
  this.isTurnOffForUser = false;
  this.isTurnOffForGroupCall = 'true';
  this.isTurnOff = false;
  this.meetingPointId = "";
  this.uidToCall = "";
  this.displaynameToCall = "";
  this.isCloudRunning = 'false';

  this.tiptipContentDOMNodeInsertedHandler = function() {
    weemoExtension.attachWeemoToPopups();
  };
}

WeemoExtension.prototype.initOptions = function(options) {
  this.username = options.username;
  this.jzGetState = options.urlGetState;
  this.urlHasOneOneCallPermission = options.urlHasOneOneCallPermission;
  this.getStateURL = this.jzGetState;
};

WeemoExtension.prototype.setKey = function(weemoKey) {
  this.weemoKey = weemoKey;
  jzStoreParam("weemoKey", weemoKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};

WeemoExtension.prototype.setTokenKey = function(tokenKey) {
  this.tokenKey = tokenKey;
  jzStoreParam("tokenKey", tokenKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};

WeemoExtension.prototype.setUidToCall = function(uidToCall) {
  this.uidToCall = uidToCall;
  jzStoreParam("uidToCall", uidToCall, 14400);
};

WeemoExtension.prototype.setDisplaynameToCall = function(displaynameToCall) {
  this.displaynameToCall = displaynameToCall;
  jzStoreParam("displaynameToCall", displaynameToCall, 14400);
};

WeemoExtension.prototype.setMeetingPointId = function(meetingPointId) {
  this.meetingPointId = meetingPointId;
  jzStoreParam("meetingPointId", meetingPointId, 14400);
};
/**
 * Gets target user status
 * @param targetUser
 */
WeemoExtension.prototype.getStatus = function(targetUser, callback) {
  if (typeof chatNotification !== 'undefined') {
    chatNotification.getStatus(targetUser, callback);
  } else {
    var refreshURL = this.getStateURL + targetUser + "/";
    jqchat.ajax({
      url: refreshURL,
      dataType: "text",
      context: this,
      success: function (data) {
        if (typeof callback === "function") {
          var obj = jQuery.parseJSON(data);
          if (obj != null) {
            var acticity = obj.activity;
            callback(targetUser, acticity);
          } else {
            callback(targetUser, "offline");
          }
        }
      },
      error: function () {
        if (typeof callback === "function") {
          callback(targetUser, "offline");
        }
      }
    });
  }
};

WeemoExtension.prototype.hasOneOneCallPermission = function(userId) {
  var hasPermission = "false";
  jqchat.ajax({
    url: this.urlHasOneOneCallPermission + userId,
    async: false,
    dataType: "text",
    success: function (data) {
      hasPermission = data;
    }
  });
  return hasPermission;
};

WeemoExtension.prototype.attachWeemoToPopups = function() {
  var $tiptip_content = jqchat("#tiptip_content");
  if ($tiptip_content.length == 0 || $tiptip_content.hasClass("DisabledEvent")) {
    setTimeout(jqchat.proxy(this.attachWeemoToPopups, this), 250);
    return;
  }

  $tiptip_content.addClass("DisabledEvent");
  var username = "";
  var fullname = "";
  var addStyle = "";
  var $uiElement;

  var $uiAction = jqchat(".uiAction", $tiptip_content).first();
  if ($uiAction !== undefined && $uiAction.html() !== undefined) {
    var $uiFullname = jqchat('#tiptip_content').children('#tipName').children("tbody").children("tr").children("td").children("a");
    $uiFullname.each(function() {
      var html = jqchat(this).html();
      if (html.indexOf("/rest/")==-1) {
        fullname = html;
      }
      var href = jqchat(this).attr("href");
      if (href.indexOf("/portal/intranet/activities/")>-1) {
        username = href.substr(28);
      }
    });
    $uiElement = $uiAction;
  }

  if (username !== "" && $uiElement.has(".weemoCallOverlay").size()===0) {
    var callLabel = jqchat("#weemo-status").attr("call-label");
    var makeCallLabel = jqchat("#weemo-status").attr("make-call-label");
    var strWeemoLink = '<a type="button" class="btn weemoCallOverlay weemoCall-'+username.replace('.', '-')+' disabled" title="'+makeCallLabel+'"';
    strWeemoLink += ' data-fullname="'+fullname+'"';
    strWeemoLink += ' data-username="'+username+'" style="margin-left:5px;'+addStyle+'">';
    strWeemoLink += '<i class="uiIconWeemoVideoCalls uiIconWeemoLightGray"></i> '+callLabel+'</a>';

    var $btnChat = jqchat(".chatPopupOverlay", $uiElement);
    if ($btnChat.length > 0) {
      var $btnConnect = jqchat(".connect", $uiElement);
      $btnConnect.wrap("<div></div>");
      $uiElement.addClass("twice-line");
      $btnChat.before(strWeemoLink);
    } else {
      $uiElement.append(strWeemoLink);
    }

    jqchat(".weemoCallOverlay").unbind( "click" );
    jqchat(".weemoCallOverlay").on("click", function() {
      if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.tokenKey.length > 0) {
        var targetUser = jqchat(this).attr("data-username");
        var targetFullname = jqchat(this).attr("data-fullname");
        if (weemoExtension.hasOneOneCallPermission(targetUser.trim()) === "false") {
            eXo.ecm.VideoCalls.showReceivingPermissionInterceptor(targetFullname.trim());
          } else {
        if (weemoExtension.isCloudRunning === 'true') {
          var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
          if (trialStatus.indexOf("disable") != -1) {
            weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
          } else {
            eXo.ecm.VideoCalls.showTrialInterceptor();
            jqchat("#currentUser").attr("data-username", targetUser);
            jqchat("#currentUser").attr("data-fullname", targetFullname);
          }
        } else {
            weemoExtension.showVideoPopup('/portal/intranet/videocallpopup?callee=' + targetUser.trim() + '&mode=one');
          }
        }
      } else if(!jqchat(this).hasClass("disabled")) {
        if(weemoExtension.tokenKey.length == 0) {
          eXo.ecm.VideoCalls.showInstallInterceptor();
        } else if(weemoExtension.isTurnOffForUser == "true") {
          eXo.ecm.VideoCalls.showPermissionInterceptor();
        }
      }
    });

    function cbGetStatus(targetUser, activity) {
    if (activity !== "offline") {
        jqchat(".weemoCall-"+targetUser.replace('.', '-')).removeClass("disabled");
      }
    }
    weemoExtension.getStatus(username, cbGetStatus);
    if (weemoExtension.isCloudRunning === 'true') {
      var weemoAddonStatus = jqchat("#weemo-status").attr("data-addonstatus");
      var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
      if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)) jqchat(".weemoCallOverlay").remove();
      weemoExtension.getStatus(username, cbGetStatus);
    }
  }

  $tiptip_content.removeClass("DisabledEvent");
  $tiptip_content.unbind("DOMNodeInserted", this.tiptipContentDOMNodeInsertedHandler);
  $tiptip_content.bind("DOMNodeInserted", this.tiptipContentDOMNodeInsertedHandler);
};

WeemoExtension.prototype.attachWeemoToProfile = function() {
  if (window.location.href.indexOf("/portal/intranet/profile")==-1) return;

  var $UIStatusProfilePortlet = jqchat("#UIStatusProfilePortlet");
  if($UIStatusProfilePortlet.html() === undefined) {
    setTimeout(jqchat.proxy(this.attachWeemoToProfile, this), 250);
    return;
  }

  var userName = jqchat(".user-status", $UIStatusProfilePortlet).attr('data-userid');
  var fullName = jqchat(".user-status span", $UIStatusProfilePortlet).text();
  var $userActions = jqchat("#UIActionProfilePortlet .user-actions");

  if (userName != weemoExtension.username && userName !== "" && $userActions.has(".weemoCallOverlay").length===0 && $userActions.has("button").length) {
	  var callLabel = jqchat("#weemo-status").attr("call-label");
	  var makeCallLabel = jqchat("#weemo-status").attr("make-call-label");
	  var html = '<a type="button" class="btn weemoCallOverlay weemoCall-'+userName.replace('.', '-')+' disabled"   id="weemoCall-'+userName.replace('.', '-')+'" title="'+makeCallLabel+'"';
	  html += ' data-username="'+userName+'" data-fullname="'+fullName+'"';
	  html += ' style=""><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> '+callLabel+'</a>';

     $userActions.prepend(html);
	  
      jqchat(".weemoCallOverlay").unbind( "click" );
	  jqchat(".weemoCallOverlay").on("click", function() {                
		  
		if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.tokenKey.length > 0) {
		  var targetUser = jqchat(this).attr("data-username");
		  var targetFullname = jqchat(this).attr("data-fullname");
          console.log(targetUser + " == " + targetFullname.trim());
          if (weemoExtension.hasOneOneCallPermission(targetUser.trim()) === "false") {
	          eXo.ecm.VideoCalls.showReceivingPermissionInterceptor(targetFullname.trim());
	        } else {
      if (weemoExtension.isCloudRunning === 'true') {
        var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
        if (trialStatus.indexOf("disable") != -1) {
          weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
        } else {
          eXo.ecm.VideoCalls.showTrialInterceptor();
          jqchat("#currentUser").attr("data-username", targetUser);
          jqchat("#currentUser").attr("data-fullname", targetFullname);
        }
      } else {
          weemoExtension.showVideoPopup('/portal/intranet/videocallpopup?callee=' + targetUser.trim() + '&mode=one');
        }
      }
		} else if(!jqchat(this).hasClass("disabled")) {
		  if(weemoExtension.tokenKey.length == 0) {
		    eXo.ecm.VideoCalls.showInstallInterceptor();
		  } else if(weemoExtension.isTurnOffForUser == "true") {
		    eXo.ecm.VideoCalls.showPermissionInterceptor();
		  }
		}
	  });

    // Fix PLF-6493: Only let hover happens on connection buttons instead of all in .user-actions
    var $btnConnections = jqchat(".show-default, .hide-default", $userActions);
    var $btnShowConnection = jqchat(".show-default", $userActions);
    var $btnHideConnection = jqchat(".hide-default", $userActions);
    $btnShowConnection.show();
    $btnConnections.css('font-style', 'italic');
    $btnHideConnection.hide();
    $btnConnections.removeClass('show-default hide-default');
    $btnConnections.hover(function(e) {
      $btnConnections.toggle();
    });
	  
	  function cbGetProfileStatus(targetUser, activity) {
	    if (activity !== "offline") {
	      jqchat(".weemoCall-"+targetUser.replace('.', '-')).removeClass("disabled");
	    }
	  }

	  weemoExtension.getStatus(userName, cbGetProfileStatus);	

	}

  if (weemoExtension.isCloudRunning === 'true') {
    var weemoAddonStatus = jqchat("#weemo-status").attr("data-addonstatus");
    var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
    if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)) jqchat(".weemoCallOverlay").remove();
  }
	setTimeout(function() { weemoExtension.attachWeemoToProfile() }, 250);

};



WeemoExtension.prototype.attachWeemoToConnections = function() {
  if (window.location.href.indexOf("/portal/intranet/connexions")==-1 && window.location.href.indexOf("/portal/intranet/connections")==-1) return;
	  
  var $uiPeople = jqchat('.uiTabInPage').first();
  if ($uiPeople.html() === undefined) {
    setTimeout(jqchat.proxy(this.attachWeemoToConnections, this), 250);
    return;
  }

  jqchat(".contentBox", ".uiTabInPage").each(function() {
	  
    var $uiUsername = jqchat(this).children(".spaceTitle").children("a").first();
    var username = $uiUsername.attr("href");
    username = username.substring(username.lastIndexOf("/")+1);
    var fullname = $uiUsername.html();

    var $uiActionWeemo = jqchat(".weemoCallOverlay", jqchat(this).next()).first();
    if ($uiActionWeemo == undefined || $uiActionWeemo !== undefined && $uiActionWeemo.html() == undefined) {
      var nextElem = jqchat(this).next();

      var callLabel = jqchat("#weemo-status").attr("call-label");
      var makeCallLabel = jqchat("#weemo-status").attr("make-call-label");
      var html = '<a type="button" class="btn weemoCallOverlay weemoCall-'+username.replace('.', '-')+' pull-right disabled" id="weemoCall-'+username.replace('.', '-')+'" title="'+makeCallLabel+'"';

      html += ' data-username="'+username+'" data-fullname="'+fullname+'"';
      html += ' style="margin-left:5px;"><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> '+callLabel+'</a>';
      html += jqchat(nextElem).html();
      jqchat(nextElem).html(html);
      
      function cbGetConnectionStatus(targetUser, activity) {
        if (activity !== "offline") {
         jqchat(".weemoCall-"+targetUser.replace('.', '-')).removeClass("disabled");
        }
      }

      weemoExtension.getStatus(username, cbGetConnectionStatus);
    }
  });

  if (weemoExtension.isCloudRunning === 'true') {
    var weemoAddonStatus = jqchat("#weemo-status").attr("data-addonstatus");
    var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
    if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)) jqchat(".weemoCallOverlay").remove();
  }
  jqchat(".weemoCallOverlay").unbind( "click" );
  jqchat(".weemoCallOverlay").on("click", function() {
        if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.tokenKey.length > 0) {
          var targetUser = jqchat(this).attr("data-username");
          var targetFullname = jqchat(this).attr("data-fullname");
          if (weemoExtension.hasOneOneCallPermission(targetUser.trim()) === "false") {
              eXo.ecm.VideoCalls.showReceivingPermissionInterceptor(targetFullname.trim());
            } else {
          if (weemoExtension.isCloudRunning === 'true') {
            var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
            if (trialStatus.indexOf("disable") != -1) {
              weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
            } else {
              eXo.ecm.VideoCalls.showTrialInterceptor();
              jqchat("#currentUser").attr("data-username", targetUser);
              jqchat("#currentUser").attr("data-fullname", targetFullname);
            }
          } else {
              weemoExtension.showVideoPopup('/portal/intranet/videocallpopup?callee=' + targetUser.trim() + '&mode=one');
            }
          }
        } else if(!jqchat(this).hasClass("disabled")) {
          if(weemoExtension.tokenKey.length == 0) {
            eXo.ecm.VideoCalls.showInstallInterceptor();
          } else if(weemoExtension.isTurnOffForUser == "true") {
            eXo.ecm.VideoCalls.showPermissionInterceptor();
          }
        }
      });

  setTimeout(function() { weemoExtension.attachWeemoToConnections() }, 500);
};

WeemoExtension.prototype.showVideoPopup = function(url) {
  var w = Math.floor(screen.width * 0.8 );
  var h = Math.floor(screen.height * 0.8 );
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2);
  sightCallPopup = window.open(url, 'VideoCall', 'toolbar=no, menubar=no,scrollbars=no,resizable=no,location=no,directories=no,status=no, width='+w+', height='+h+', top='+top+', left='+left);
  sightCallPopup.focus();
};

/**
 ##################                           ##################
 ##################                           ##################
 ##################   HACK                    ##################
 ##################                           ##################
 ##################                           ##################
 */



/**
 * Hack to ignore console on for Internet Explorer (without testing its existence
 * @type {*|{log: Function, warn: Function, error: Function}}
 */
var console = console || {
  log:function(){},
  warn:function(){},
  error:function(){}
};



/**
 ##################                           ##################
 ##################                           ##################
 ##################   GLOBAL                  ##################
 ##################                           ##################
 ##################                           ##################
 */

// GLOBAL VARIABLES

var weemoExtension = new WeemoExtension();


(function($) {

  $(document).ready(function() {

    //GETTING DOM CONTEXT
    var $notificationApplication = $("#weemo-status");
    
    
    // WEEMO NOTIFICATION INIT
    weemoExtension.initOptions({      
      "username": $notificationApplication.attr("data-username"),
      "urlNotification": "/rest/state/ping/",
      "urlGetState": "/rest/state/status/",
      "urlHasOneOneCallPermission":"/rest/weemo/hasOneOneCallPermission/",
    });   

    weemoExtension.isCloudRunning = $notificationApplication.attr("is-cloud-running");
    if (weemoExtension.isCloudRunning === 'true') {
      var weemoAddonStatus = $notificationApplication.attr("data-addonstatus");
      var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
      if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)){
        $("#videoCallsPermissionForm").css("display", "none");
        $("#unavailableMsg").css("display", "block");
      } else {
        $("#videoCallsPermissionForm").css("display", "block");
        $("#unavailableMsg").css("display", "none");
      }
    }
    weemoExtension.isTurnOff = $notificationApplication.attr("data-weemo-turnoff");
    if(weemoExtension.isTurnOff == "true") return;
    if(navigator.platform.indexOf("Linux") >= 0 && !jqchat.browser.chrome) return;
    weemoExtension.isTurnOffForUser = $notificationApplication.attr("data-weemo-turnoff-user");
    weemoExtension.isTurnOffForGroupCall = $notificationApplication.attr("data-weemo-turnoff-group");
    weemoExtension.cometdUserToken = $notificationApplication.attr("cometd-user-token");
    weemoExtension.cometdContextName = $notificationApplication.attr("cometd-context-name");

    // WEEMO : GETTING AND SETTING KEY
    var weemoKey = $notificationApplication.attr("data-weemo-key");
    weemoExtension.setKey(weemoKey);

    var tokenKey = $notificationApplication.attr("data-token-key");
    weemoExtension.setTokenKey(tokenKey);

    
    var username = $notificationApplication.attr("data-username");
    weemoExtension.attachWeemoToPopups();
    weemoExtension.attachWeemoToConnections();
    weemoExtension.attachWeemoToProfile();

    window.require(["SHARED/SightCallNotification"], function(sightCallNotification) {
      SightCallNotification.initCometd(weemoExtension.username, weemoExtension.cometdUserToken, weemoExtension.cometdContextName);
    });

    if (weemoExtension.isCloudRunning === "true") {
      $(".startVideoCall").on("click", function () {
        var targetUserName = $("#currentUser").attr("data-username");
        var targetUserFullName = $("#currentUser").attr("data-fullname");
        weemoExtension.createWeemoCall(targetUserName.trim(), targetUserFullName.trim());
        $("#trial-interceptor").modal("hide");

        // Update trial info in BO
        var trialStatus = $notificationApplication.attr("data-trialstatus");
        var auth = $notificationApplication.attr("data-userkey");
        if (trialStatus.indexOf("none") != -1) {
          var tenantName = $notificationApplication.attr("data-tenantname");
          var url = "/mgt-rest/v1/addons/trial/" + tenantName + "/EXO_VIDEO_CALL/active";
          $.ajax({
            url: url,
            type: "PUT",
            dataType: "json",
            beforeSend: function (jqXHR) {
              jqXHR.setRequestHeader('Authorization', auth);
            }
          })
            .done(function (json) {
              $notificationApplication.attr("data-trialstatus", json.status);
              $notificationApplication.attr("data-trialday", json.trialDay);
              $notificationApplication.attr("data-remainday", json.trialDay); //just activated
              $("#noneStatus").css("display", "none");
              console.log("Update status of trial successfully");
            })
            .fail(function (jqxhr, textStatus, error) {
              var err = textStatus + ', ' + error;
              console.log("Request Failed: " + err);
            });
        }
      });
    }
  });
})(jqchat);
