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
  this.weemoIntervalNotif = "";
  this.notifEventInt = "";
  this.isSupport = true;
  this.tokenKey = "";
  this.weemoKey = "";
  this.isValidWeemoKey = true;
  this.isTurnOffForUser = false;
  this.isTurnOffForGroupCall = 'true';
  this.isSameUserLogged = 'false';
  this.isTurnOff = false;
  this.connectedWeemoDriver = false;
  this.videoCallVersion = "";

  //This block code for fix the issue PLF-5688
  var platform = navigator.platform;
  if (platform.indexOf("Linux") < 0) {
    var wsUri = "wss://localhost:34679";
    var protocol = "weemodriver-protocol";
    if ('WebSocket' in window) {
      var websock = new WebSocket(wsUri, protocol);     
      websock.onerror = function(evt) {
        weemoExtension.setNotInstallWeemoDriver();
      };
      websock.onopen = function(evt) {
        weemoExtension.setInstallWeemoDriver();
      };
    } else {
      console.log("WebSocket is NOT supported by this browser.");
    }
  }

  try {
    this.weemo = new Weemo('', '', 'internal', '', '1');

  } catch (err) {
    console.log("WEEMO NOT AVAILABLE YET " + err);
    this.weemo = undefined;
    this.isValidWeemoKey = false;
    jqchat(".btn-weemo-conf").css('display', 'none');
    jqchat(".btn-weemo").addClass('disabled');    
  }
  
     
  this.callObj;

  this.callOwner = jzGetParam("callOwner", false);
  this.callActive = jzGetParam("callActive", "false").toLowerCase() === "true";
  this.callType = jzGetParam("callType", "");

  this.uidToCall = jzGetParam("uidToCall", "");
  this.displaynameToCall = jzGetParam("displaynameToCall", "");

  this.chatMessage = JSON.parse( jzGetParam("chatMessage", '{}') );

  this.isConnected = false;

  this.tiptipContentDOMNodeInsertedHandler = function() {
    weemoExtension.attachWeemoToPopups();
  };
}

WeemoExtension.prototype.setNotInstallWeemoDriver = function() {
  var isNotInstallWeemoDriver = weemoExtension.getCookie("isNotInstallWeemoDriver");      
  if(!isNotInstallWeemoDriver || 0 === isNotInstallWeemoDriver.length) {
    weemoExtension.setCookie("isNotInstallWeemoDriver", "true", 365);
    var downloadUrl = "https://download.weemo.com/file/release/3";
    if (this.weemo) downloadUrl = this.weemo.getDownloadUrl();
    weemoExtension.setCookie("downloadUrl", downloadUrl, 365);    
  }
  weemoExtension.showWeemoInstaller();
};

WeemoExtension.prototype.setInstallWeemoDriver = function() {
	var isNotInstallWeemoDriver = weemoExtension.getCookie("isNotInstallWeemoDriver"); 
        if(isNotInstallWeemoDriver == 'true') {          
          weemoExtension.setCookie("isNotInstallWeemoDriver", "false", 365);
        }
	jqchat("#weemo-alert").hide();
}

WeemoExtension.prototype.initOptions = function(options) {
  this.username = options.username;
  this.jzGetState = options.urlGetState;
  this.weemoIntervalNotif = options.notificationInterval;
  this.getStateURL = this.jzGetState;
};

WeemoExtension.prototype.checkWeemoDriver = function() {
    var platform = navigator.platform;
    if (platform.indexOf("Linux") < 0) {
      var wsUri = "wss://localhost:34679";
      var protocol = "weemodriver-protocol";
      if ('WebSocket' in window) {
        var websock = new WebSocket(wsUri, protocol);     
        websock.onerror = function(evt) {
          //weemoExtension.setNotInstallWeemoDriver();
        };   
        websock.onopen = function(evt) {
          weemoExtension.setInstallWeemoDriver();
        };
      } else {
        console.log("WebSocket is NOT supported by this browser.");
      }  
    }
};

WeemoExtension.prototype.log = function() {
  console.log("callOwner         :: "+this.callOwner);
  console.log("callActive        :: "+this.callActive);
  console.log("callType          :: "+this.callType);
  console.log("uidToCall         :: "+this.uidToCall);
  console.log("displayNameToCall :: "+this.displaynameToCall);
  console.log("chatMessage       :: "+this.chatMessage);
}  

WeemoExtension.prototype.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}  
WeemoExtension.prototype.removeCookie = function(cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
} 
WeemoExtension.prototype.getCookie = function(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) 
    {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}

WeemoExtension.prototype.showWeemoInstaller = function() {
  if(!weemoExtension.isSupport || weemoExtension.connectedWeemoDriver) {
    jqchat("#weemo-alert").hide();
    return;
  }
  var isDismiss = weemoExtension.getCookie('isDismiss');
  if(!weemoExtension.isConnected) {
    if ((typeof(isDismiss) == "undefined" && isDismiss == null) || !isDismiss ) {
      var uiToolbarContainer = jqchat("#UIToolbarContainer");
      var height = uiToolbarContainer.outerHeight() - jqchat(".alert").css("marginTop").replace('px', '');

      jqchat("#weemo-alert").css({ top: height+'px' });
      jqchat("#weemo-alert").show();   
      var downloadUrl = weemoExtension.getCookie("downloadUrl");
      jqchat("#weemo-alert-download").click(function() {
        jqchat("#weemo-alert").hide();
        location.href=downloadUrl;
      });  

      jqchat("#weemo-alert-dismiss").click(function() {
        weemoExtension.setCookie("isDismiss", "true", 365);
        jqchat("#weemo-alert").hide();
      });
      var closeElem = jqchat("#weemo-alert").find(".uiIconClose:first");
      jqchat(closeElem).click(function() {
        jqchat("#weemo-alert").hide();
      });
    }
  }
}

WeemoExtension.prototype.setKey = function(weemoKey) {
  this.weemoKey = weemoKey;
  jzStoreParam("weemoKey", weemoKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};

WeemoExtension.prototype.setTokenKey = function(tokenKey) {
  this.tokenKey = tokenKey;
  jzStoreParam("tokenKey", tokenKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};


WeemoExtension.prototype.setCallOwner = function(callOwner) {
  this.callOwner = callOwner;
  jzStoreParam("callOwner", callOwner, 14400);
};

WeemoExtension.prototype.setCallType = function(callType) {
  this.callType = callType;
  jzStoreParam("callType", callType, 14400);
};

WeemoExtension.prototype.setCallActive = function(callActive) {
  this.callActive = callActive;
  jzStoreParam("callActive", callActive, 14400);
};

WeemoExtension.prototype.setUidToCall = function(uidToCall) {
  this.uidToCall = uidToCall;
  jzStoreParam("uidToCall", uidToCall, 14400);
};

WeemoExtension.prototype.setDisplaynameToCall = function(displaynameToCall) {
  this.displaynameToCall = displaynameToCall;
  jzStoreParam("displaynameToCall", displaynameToCall, 14400);
};
/**
 * A JSON Object like :
 * { "url" : url,
 *   "user" : user,
 *   "targetUser" : targetUser,
 *   "room" : room,
 *   "token" : token
 * }
 * @param chatMessage
 */
WeemoExtension.prototype.setChatMessage = function(chatMessage) {
  this.chatMessage = chatMessage;
  jzStoreParam("chatMessage", JSON.stringify(chatMessage), 14400);
};

WeemoExtension.prototype.hasChatMessage = function() {
  return (this.chatMessage.url !== undefined);
};

WeemoExtension.prototype.initChatMessage = function() {
  this.setChatMessage({});
};

WeemoExtension.prototype.hangup = function() {
  if (this.callObj !== undefined) {
    this.callObj.hangup();
  }
};

WeemoExtension.prototype.changeStatus = function(status) {
  var $weemoStatus = jqchat(".uiNotifWeemoIcon");
  if (typeof status === "undefined") {
    $weemoStatus.removeClass("uiNotifWeemoGreen");
    return;
  }
  $weemoStatus.removeClass("uiNotifWeemoRed");
  $weemoStatus.removeClass("uiNotifWeemoBlue");
  $weemoStatus.removeClass("uiNotifWeemoWarning");
  $weemoStatus.removeClass("uiNotifWeemoGreen");

  if (weemoExtension.isSameUserLogged === 'true') {
    $weemoStatus.addClass("uiNotifWeemoWarning");
  } else {
    $weemoStatus.addClass("uiNotifWeemo" + status);
  }

}

/**
 * Init Weemo Call
 * @param $uid
 * @param $name
 */
WeemoExtension.prototype.initCall = function($uid, $name) {
  this.displayVideoCallOnTopNav();

  if (this.weemoKey!=="" && this.weemo !== undefined) {
    jqchat(".btn-weemo-conf").css('display', 'none');

    this.weemo.setDebugLevel(4); // Activate debug in JavaScript console
    this.weemo.setWebAppId(this.weemoKey);
    this.weemo.setToken("weemo"+$uid);
    this.weemo.initialize();
    var fn = jqchat(".label-user").text();
    var fullname = jqchat("#UIUserPlatformToolBarPortlet > a:first").text().trim();
    if (fullname!=="") {
      this.weemo.setDisplayName(fullname); // Configure the display name
    } else if (fn!=="") {
      this.weemo.setDisplayName(fn); // Configure the display name
    }
    this.changeStatus("Red");

    /**
     * Weemo Driver On Connection Javascript Handler
     *
     * @param message
     * @param code
     */
    this.weemo.onConnectionHandler = function(message, code) {
      if(window.console)
        console.log(" =========== Connection Handler : " + message + ' ' + code);
      switch(message) {
        case 'connectedWeemoDriver':
          weemoExtension.connectedWeemoDriver = true;
          weemoExtension.setInstallWeemoDriver();
          //this.authenticate();
          weemoExtension.changeStatus("Blue");
          break;
        case 'disconnectedWeemoDriver':
          weemoExtension.isConnected = false;
          break;
        case 'loggedasotheruser':
          // force weemo to kick previous user and replace it with current one
          this.authenticate(1);
          break;
        case 'unsupportedOS':
          weemoExtension.isSupport = false;
          weemoExtension.isConnected = false;
        case 'sipOk':
          weemoExtension.isConnected = true;
          weemoExtension.changeStatus("Green");

          var fn = jqchat(".label-user").text();
          var fullname = jqchat("#UIUserPlatformToolBarPortlet > a:first").text().trim();
          if (fullname!=="") {
            this.setDisplayName(fullname); // Configure the display name
          } else if (fn!=="") {
            this.setDisplayName(fn); // Configure the display name
          }
          break;
        case 'sipNok':
        case 'error':
        case 'kicked':
          weemoExtension.isConnected = false;
          weemoExtension.changeStatus("Warning");
          break;
      }
    }

    /**
     * Weemo Driver On Driver Started Javascript Handler
     *
     * @param downloadUrl
     */
    this.weemo.onWeemoDriverNotStarted = function(downloadUrl) {
      weemoExtension.setCookie("isNotInstallWeemoDriver", "true", 365);
      weemoExtension.setCookie("downloadUrl", downloadUrl, 365);
      weemoExtension.showWeemoInstaller();
      if (navigator.platform !== "Linux") {
        jqchat("#weemo-alert-download").click(function() {
          jqchat("#weemo-alert").hide();
          location.href=downloadUrl;
        });
      }
    };


    /**
     * Weemo Driver On Call Javascript Handler
     *
     * @param type
     * @param status
     */
    this.weemo.onCallHandler = function(callObj, args)
    {
      weemoExtension.callObj = callObj;
      var type = args.type;
      var status = args.status;
      console.log("WEEMO:onCallHandler  ::"+type+":"+status+":"+weemoExtension.callType+":"+weemoExtension.callOwner+":"+weemoExtension.hasChatMessage());
      var messageWeemo = "";
      var optionsWeemo = {};
      if(type==="call" && ( status==="active" || status==="terminated" || status==="proceeding"))
      {
        console.log("Call Handler : " + type + ": " + status);
        ts = Math.round(new Date().getTime() / 1000);

        if (status === "terminated") weemoExtension.setCallOwner(false);

        if (weemoExtension.callType==="internal" || status==="terminated") {
          messageWeemo = "Call "+status;
          optionsWeemo.timestamp = ts;
        } else if (weemoExtension.callType==="host") {
          messageWeemo = "Call "+status;
          optionsWeemo.timestamp = ts;
          optionsWeemo.uidToCall = weemoExtension.uidToCall;
          optionsWeemo.displaynameToCall = weemoExtension.displaynameToCall;
        }


        if (status==="active" && weemoExtension.callActive) return; //Call already active, no need to push a new message
        if (status==="terminated" && (!weemoExtension.callActive || weemoExtension.callType==="attendee"))  //Terminate a non started call or a joined call, no message needed
        {
          weemoExtension.setCallActive(false);
          return;
        }

        if (weemoExtension.callType==="attendee" && status==="active") {
          weemoExtension.setCallActive(true);
          optionsWeemo.type = "call-join";
          optionsWeemo.username = weemoExtension.chatMessage.user;
          optionsWeemo.fullname = weemoExtension.chatMessage.fullname;

        }
        else if (status==="active") {
          weemoExtension.setCallActive(true);
          optionsWeemo.type = "call-on";
        }
        else if (status==="terminated") {
          weemoExtension.setCallActive(false);
          optionsWeemo.type = "call-off";
        }
        else if (status==="proceeding") {
          weemoExtension.setCallActive(false);
          optionsWeemo.type = "call-proceed";
        }

        if (weemoExtension.hasChatMessage()) {
          console.log("WEEMO:hasChatMessage::"+weemoExtension.chatMessage.user+":"+weemoExtension.chatMessage.targetUser);
          if (chatApplication !== undefined) {
            chatApplication.checkIfMeetingStarted(function(callStatus){
              if (callStatus === 1 && optionsWeemo.type==="call-on") {
                // Call is already created, not allowed.
                weemoExtension.initChatMessage();
                callObj.hangup();
                return;
              }
              if (callStatus === 0 && optionsWeemo.type==="call-off") {
                // Call is already terminated, no need to terminate again
                return;
              }

              chatApplication.chatRoom.sendFullMessage(
                weemoExtension.chatMessage.user,
                weemoExtension.chatMessage.token,
                weemoExtension.chatMessage.targetUser,
                weemoExtension.chatMessage.room,
                messageWeemo,
                optionsWeemo,
                "true"
              )

              if (status==="terminated") {
                weemoExtension.initChatMessage();
              }
            });
          }
        }
      }
    }
  } else {
    //jqchat(".btn-weemo").css('display', 'none');
  }
};

/**
 *
 */
WeemoExtension.prototype.createWeemoCall = function(targetUser, targetFullname, chatMessage) {
  if (this.weemoKey!=="") {

    if (chatMessage !== undefined) {
      this.setChatMessage(chatMessage);
    }

    if (targetUser.indexOf("space-")===-1 && targetUser.indexOf("team-")===-1) {
      this.setUidToCall("weemo"+targetUser);
      this.setDisplaynameToCall(targetFullname);
      this.setCallType("internal");
    } else {
      this.setUidToCall(this.weemo.getToken());
      this.setDisplaynameToCall(this.weemo.getDisplayName());
      this.setCallType("host");
    }
    this.setCallOwner(true);
    this.setCallActive(false);
    this.weemo.createCall(this.uidToCall, this.callType, this.displaynameToCall);

  }

};

/**
 *
 */
WeemoExtension.prototype.joinWeemoCall = function(chatMessage) {
  if (this.weemoKey!=="") {
    if (chatMessage !== undefined) {
      this.setChatMessage(chatMessage);
    }
    this.setCallType("attendee");
    this.setCallOwner(false);
    this.setCallActive(false);
    this.weemo.createCall(this.uidToCall, this.callType, this.displaynameToCall);

  }

};

/**
 * Gets target user status
 * @param targetUser
 */
WeemoExtension.prototype.getStatus = function(targetUser, callback) {
  var refreshURL = this.getStateURL + targetUser + "/";
  jqchat.ajax({
    url: refreshURL,
    dataType: "text",
    context: this,
    success: function(data){
      if (typeof callback === "function") {
        var obj = jQuery.parseJSON(data);
        if(obj != null) {
          var acticity = obj.activity;
          callback(targetUser, acticity);
        } else {
          callback(targetUser, "offline");
        }
      }
    },
    error: function(){
      if (typeof callback === "function") {
        callback(targetUser, "offline");
      }
    }
  });
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

  if (username !== "" && $uiElement.has(".weemoCallOverlay").size()===0 && weemoExtension.isSupport) {
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
      if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true
      && weemoExtension.tokenKey.length > 0) {
        var targetUser = jqchat(this).attr("data-username");
        var targetFullname = jqchat(this).attr("data-fullname");
        var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
        if (trialStatus.indexOf("disable") != -1) {
          weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
        } else {
          eXo.ecm.VideoCalls.showTrialInterceptor();
          jqchat("#currentUser").attr("data-username", targetUser);
          jqchat("#currentUser").attr("data-fullname", targetFullname);
        }
      } else if(!jqchat(this).hasClass("disabled")) {
        if(weemoExtension.isValidWeemoKey == false || weemoExtension.tokenKey.length == 0) {
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
    var weemoAddonStatus = jqchat("#weemo-status").attr("data-addonstatus");
    var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
    if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)) jqchat(".weemoCallOverlay").remove();
    weemoExtension.getStatus(username, cbGetStatus);

  }

  $tiptip_content.removeClass("DisabledEvent");
  $tiptip_content.unbind("DOMNodeInserted", this.tiptipContentDOMNodeInsertedHandler);
  $tiptip_content.bind("DOMNodeInserted", this.tiptipContentDOMNodeInsertedHandler);
};

WeemoExtension.prototype.attachWeemoToProfile = function() {
  if (window.location.href.indexOf("/portal/intranet/profile")==-1) return;

  var headerSecion = jqchat("#UIHeaderSection");
  if(headerSecion.html() === undefined) {
    setTimeout(jqchat.proxy(this.attachWeemoToProfile, this), 250);
    return;
  }
  
  var infoSection = jqchat("UIBasicInfoSection");
  var $h3Elem = jqchat(headerSecion).find("h3:first");
  var buttonInvite = jqchat(headerSecion).find("button:first");
  var fullName = $h3Elem.html();
  fullName = fullName.substring(0, fullName.indexOf("<"));
  var userName = window.location.href;
  userName = userName.substring(userName.lastIndexOf("/")+1, userName.length);

  if (userName != weemoExtension.username && userName !== "" && $h3Elem.has(".weemoCallOverlay").size()===0 && weemoExtension.isSupport) {
	  var callLabel = jqchat("#weemo-status").attr("call-label");
	  var makeCallLabel = jqchat("#weemo-status").attr("make-call-label");
	  var html = '<a type="button" class="btn weemoCallOverlay weemoCall-'+userName.replace('.', '-')+' disabled"   id="weemoCall-'+userName.replace('.', '-')+'" title="'+makeCallLabel+'"';
	  html += ' data-username="'+userName+'" data-fullname="'+fullName+'"';
	  html += ' style="margin-left:5px;"><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> '+callLabel+'</a>';

  	  $h3Elem.append(html);

      jqchat(".weemoCallOverlay").unbind( "click" );
	  jqchat(".weemoCallOverlay").on("click", function() {
		if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true
		&& weemoExtension.tokenKey.length > 0) {
		  var targetUser = jqchat(this).attr("data-username");
		  var targetFullname = jqchat(this).attr("data-fullname");
          console.log(targetUser + " == " + targetFullname.trim());
		  var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
		  if (trialStatus.indexOf("disable") != -1) {
			weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
		  } else {
			eXo.ecm.VideoCalls.showTrialInterceptor();
			jqchat("#currentUser").attr("data-username", targetUser);
			jqchat("#currentUser").attr("data-fullname", targetFullname);
		  }
		} else if(!jqchat(this).hasClass("disabled")) {
		  if(weemoExtension.isValidWeemoKey == false || weemoExtension.tokenKey.length == 0) {
		    eXo.ecm.VideoCalls.showInstallInterceptor();
		  } else if(weemoExtension.isTurnOffForUser == "true") {
		    eXo.ecm.VideoCalls.showPermissionInterceptor();
		  }
		}
	  });
	  
	  function cbGetProfileStatus(targetUser, activity) {
	    if (activity !== "offline") {
	      jqchat(".weemoCall-"+targetUser.replace('.', '-')).removeClass("disabled");
	    }
	  }

	  weemoExtension.getStatus(userName, cbGetProfileStatus);	

	}
	var weemoAddonStatus = jqchat("#weemo-status").attr("data-addonstatus");
	var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
	if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)) jqchat(".weemoCallOverlay").remove();

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
    if ($uiActionWeemo == undefined || $uiActionWeemo !== undefined && $uiActionWeemo.html() == undefined && weemoExtension.isSupport) {
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

  var weemoAddonStatus = jqchat("#weemo-status").attr("data-addonstatus");
  var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
  if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)) jqchat(".weemoCallOverlay").remove();

  jqchat(".weemoCallOverlay").unbind( "click" );
  jqchat(".weemoCallOverlay").on("click", function() {
        if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true
        && weemoExtension.tokenKey.length > 0) {
          var targetUser = jqchat(this).attr("data-username");
          var targetFullname = jqchat(this).attr("data-fullname");
          var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
          if (trialStatus.indexOf("disable") != -1) {
            weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
          } else {
            eXo.ecm.VideoCalls.showTrialInterceptor();
            jqchat("#currentUser").attr("data-username", targetUser);
            jqchat("#currentUser").attr("data-fullname", targetFullname);
          }
        } else if(!jqchat(this).hasClass("disabled")) {
          if(weemoExtension.isValidWeemoKey == false || weemoExtension.tokenKey.length == 0) {
            eXo.ecm.VideoCalls.showInstallInterceptor();
          } else if(weemoExtension.isTurnOffForUser == "true") {
            eXo.ecm.VideoCalls.showPermissionInterceptor();
          }
        }
      });

  setTimeout(function() { weemoExtension.attachWeemoToConnections() }, 500);
};

WeemoExtension.prototype.displayVideoCallOnTopNav = function() {
  if (typeof chatNotification === 'undefined') {
    return;
  }

  var $uiNotifChatIcon = jqchat(".uiNotifChatIcon");
  var $uiNotifWeemoIcon = jqchat(".uiNotifWeemoIcon", $uiNotifChatIcon);

  if ($uiNotifWeemoIcon.length === 0 ) {
    $uiNotifChatIcon.append("<span class=\"uiNotifWeemoIcon\"></span>");
    this.changeStatus("Red");
  }

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
      "notificationInterval": $notificationApplication.attr("data-weemo-interval-notif")      
    }); 

    var weemoAddonStatus = $notificationApplication.attr("data-addonstatus");
    var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
    if ((weemoAddonStatus.indexOf("false") != -1) || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)){
      $("#videoCallsPermissionForm").css("display", "none");
      $("#unavailableMsg").css("display", "block");
    } else {
      $("#videoCallsPermissionForm").css("display", "block");
      $("#unavailableMsg").css("display", "none");
    }  

    weemoExtension.isTurnOff = $notificationApplication.attr("data-weemo-turnoff");
    if(weemoExtension.isTurnOff == "true") return;
    if(navigator.platform.indexOf("Linux") >= 0) return;
    weemoExtension.isTurnOffForUser = $notificationApplication.attr("data-weemo-turnoff-user");
    weemoExtension.isTurnOffForGroupCall = $notificationApplication.attr("data-weemo-turnoff-group");
    weemoExtension.isSameUserLogged = $notificationApplication.attr("is-same-user-logged");

    var isNotInstallWeemoDriver = weemoExtension.getCookie("isNotInstallWeemoDriver");

    //var checkWeemoDriverEvent = window.clearInterval(checkWeemoDriverEvent);
    //checkWeemoDriverEvent = setInterval($.proxy(weemoExtension.checkWeemoDriver, weemoExtension), 3*1000);
    weemoExtension.checkWeemoDriver();

    weemoExtension.videoCallVersion = $notificationApplication.attr("videoCallVersion");
    if(weemoExtension.videoCallVersion.length > 0) {
      var oldVersion = weemoExtension.getCookie("videoCallVersion");
      //console.log(weemoExtension.videoCallVersion + " = " + oldVersion);
      //console.log(document.cookie);

      if(weemoExtension.videoCallVersion  > oldVersion) {
        if(isNotInstallWeemoDriver == 'true') {
          weemoExtension.removeCookie("isDismiss");
          weemoExtension.showWeemoInstaller();
        }
        weemoExtension.setCookie("videoCallVersion", weemoExtension.videoCallVersion, 365);
      }
    }

   
    if(isNotInstallWeemoDriver == 'true') {
      weemoExtension.showWeemoInstaller();
    }
    // WEEMO : GETTING AND SETTING KEY
    var weemoKey = $notificationApplication.attr("data-weemo-key");
    weemoExtension.setKey(weemoKey);

    var tokenKey = $notificationApplication.attr("data-token-key");
    weemoExtension.setTokenKey(tokenKey);
    
    var username = $notificationApplication.attr("data-username");
    weemoExtension.initCall(username, username);
    weemoExtension.attachWeemoToPopups();
    weemoExtension.attachWeemoToConnections();
    weemoExtension.attachWeemoToProfile();

    $(".startVideoCall").on("click", function() {
      var targetUserName = $("#currentUser").attr("data-username");
      var targetUserFullName = $("#currentUser").attr("data-fullname");
      weemoExtension.createWeemoCall(targetUserName.trim(), targetUserFullName.trim());
      $("#trial-interceptor").modal("hide");

      // Update trial info in BO
      var trialStatus = $notificationApplication.attr("data-trialstatus");
      var auth = $notificationApplication.attr("data-userkey");
      if (trialStatus.indexOf("none") != -1) {
        var tenantName = $notificationApplication.attr("data-tenantname");
        var url = "/rest/cloud/addons/trial/" + tenantName + "/EXO_VIDEO_CALL/active";
        $.ajax({
          url: url,
          dataType: "json",
          beforeSend: function(jqXHR) {
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
  });

})(jqchat);

