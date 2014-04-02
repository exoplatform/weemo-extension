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
  this.isTurnOff = false;
  this.connectedWeemoDriver = false;
  this.videoCallVersion = "";

  //This block code for fix the issue PLF-5688
  var platform = navigator.platform;
  if (platform.indexOf("Linux") < 0) {
    var wsUri = "wss://localhost:34679";
    var protocol = "weemodriver-protocol";
    if(typeof MozWebSocket == 'function') WebSocket = MozWebSocket;
    var websock = new WebSocket(wsUri, protocol);     
    websock.onerror = function(evt) {
      weemoExtension.setNotInstallWeemoDriver();
    };   
    websock.onopen = function(evt) {
      weemoExtension.setInstallWeemoDriver();
    };  
  }

  try {
    this.weemo = new Weemo("", "", "internal", "ppr/");
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
          this.authenticate();
          break;       
        case 'loggedasotheruser':
          // force weemo to kick previous user and replace it with current one
          this.authenticate(1);
          break;
        case 'unsupportedOS':
          weemoExtension.isSupport = false;
        case 'sipOk':
          weemoExtension.isConnected = true; 
          var fn = jqchat(".label-user").text();
          var fullname = jqchat("#UIUserPlatformToolBarPortlet > a:first").text().trim();
          if (fullname!=="") {
            this.setDisplayName(fullname); // Configure the display name
          } else if (fn!=="") {
            this.setDisplayName(fn); // Configure the display name
          }
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
      if(type==="call" && ( status==="active" || status==="terminated" ))
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
        if (status==="terminated" && (!weemoExtension.callActive || weemoExtension.callType==="attendee")) return; //Terminate a non started call or a joined call, no message needed


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
        
      }
    }

  } catch (err) {
    console.log("WEEMO NOT AVAILABLE YET " + err);
    this.weemo = undefined;
    this.isValidWeemoKey = false;
    jqchat(".btn-weemo-conf").css('display', 'none');
    jqchat(".btn-weemo").addClass('disabled');    
  }
  
     
  this.callObj;

  this.callOwner = jzGetParam("callOwner", false);
  this.callActive = jzGetParam("callActive", false);
  this.callType = jzGetParam("callType", "");

  this.uidToCall = jzGetParam("uidToCall", "");
  this.displaynameToCall = jzGetParam("displaynameToCall", "");

  this.chatMessage = JSON.parse( jzGetParam("chatMessage", '{}') );

  this.isConnected = false;
}

WeemoExtension.prototype.setNotInstallWeemoDriver = function() {
  var isNotInstallWeemoDriver = weemoExtension.getCookie("isNotInstallWeemoDriver");      
  if(!isNotInstallWeemoDriver || 0 === isNotInstallWeemoDriver.length) {
    weemoExtension.setCookie("isNotInstallWeemoDriver", "true", 365);
    weemoExtension.setCookie("downloadUrl", "https://download.weemo.com/file/release/55", 365);    
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
      if(typeof MozWebSocket == 'function') WebSocket = MozWebSocket;
      var websock = new WebSocket(wsUri, protocol);     
      websock.onerror = function(evt) {
        //weemoExtension.setNotInstallWeemoDriver();
      };   
      websock.onopen = function(evt) {
        weemoExtension.setInstallWeemoDriver();
      };  
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

/**
 * Init Weemo Call
 * @param $uid
 * @param $name
 */
WeemoExtension.prototype.initCall = function($uid, $name) {
  if (this.weemoKey!=="" && this.weemo !== undefined) {
    jqchat(".btn-weemo-conf").css('display', 'none');

    this.weemo.setDebugLevel(0); // Activate debug in JavaScript console
    this.weemo.setWebAppId(this.weemoKey);
    this.weemo.setToken(this.tokenKey); 
    this.weemo.initialize(); 

  } else {
    jqchat(".btn-weemo").css('display', 'none');
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
      this.setUidToCall("weemo_"+targetUser);
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
  var checkTiptip = jqchat('#tiptip_content').html();
  if (checkTiptip === undefined) {
    setTimeout(jqchat.proxy(this.attachWeemoToPopups, this), 250);
    return;
  }
  jqchat('#tiptip_content').bind('DOMNodeInserted', function() {
    var username = "";
    var fullname = "";
    var addStyle = "";
    var $uiElement;

    var $uiAction = jqchat(".uiAction", this).first();
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
      var out = '<a type="button" class="btn weemoCallOverlay weemoCall-'+username.replace('.', '-')+' disabled" title="'+makeCallLabel+'"';
      out += ' data-fullname="'+fullname+'"';
      out += ' data-username="'+username+'" style="margin-left:5px;'+addStyle+'">';
      out += '<i class="uiIconWeemoVideoCalls uiIconLightGray"></i> '+callLabel+'</a>';

      $uiElement.append(out);
      jqchat(".weemoCallOverlay").unbind( "click" );
      jqchat(".weemoCallOverlay").on("click", function() {
        if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true
        && weemoExtension.tokenKey.length > 0) {
          var targetUser = jqchat(this).attr("data-username");
          var targetFullname = jqchat(this).attr("data-fullname");
          weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
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

    }

  });

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
		  weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
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

  jqchat(".weemoCallOverlay").unbind( "click" );
  jqchat(".weemoCallOverlay").on("click", function() {
        if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true
        && weemoExtension.tokenKey.length > 0) {
          var targetUser = jqchat(this).attr("data-username");
          var targetFullname = jqchat(this).attr("data-fullname");
          weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
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

    weemoExtension.isTurnOff = $notificationApplication.attr("data-weemo-turnoff");
    if(weemoExtension.isTurnOff == "true") return;
    if(navigator.platform.indexOf("Linux") >= 0) return;
    weemoExtension.isTurnOffForUser = $notificationApplication.attr("data-weemo-turnoff-user");

    var isNotInstallWeemoDriver = weemoExtension.getCookie("isNotInstallWeemoDriver");

    var checkWeemoDriverEvent = window.clearInterval(checkWeemoDriverEvent);
    checkWeemoDriverEvent = setInterval($.proxy(weemoExtension.checkWeemoDriver, weemoExtension), 3*1000);
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
  });

})(jqchat);





