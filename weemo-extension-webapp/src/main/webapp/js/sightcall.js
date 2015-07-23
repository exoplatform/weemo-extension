/**
 ##################                           ##################
 ##################                           ##################
 ##################   SightCall EXTENSION     ##################
 ##################                           ##################
 ##################                           ##################
 */


/**
 * SightCallExtension Class
 * @constructor
 */
function SightCallExtension() {
    this.username = "";
    this.weemoIntervalNotif = "";
    this.notifEventInt = "";
    this.isSupport = true;
    this.tokenKey = "";
    this.weemoKey = "";
    this.isValidWeemoKey = true;
    this.connectedWeemoDriver = false;
    this.videoCallVersion = "";
    this.meetingPoint;
    this.meetingPointId = "";
    this.callMode = "";
    this.callee = "";
    this.firstLoad = true;
    this.caller = "";
    this.calleeFullName = "";
    this.callerFullName = "";

    var ieVersionNumber = GetIEVersion();

    try {
        if (ieVersionNumber < 11 && ieVersionNumber > 0) {
            var options = {
                useJquery: true,
                mode_parameter: 'plugin_webrtc',
                container: 'video-container'

            };
            this.rtcc = new Rtcc('', '', 'internal', options);
        } else {
            var options = {
                mode_parameter: 'plugin_webrtc',
                container: 'video-container'
            };
            this.rtcc = new Rtcc('', '', 'internal', options);
        }

    } catch (err) {
        console.log("WEEMO NOT AVAILABLE YET " + err);
        this.rtcc = undefined;
        this.isValidWeemoKey = false;
    }


    this.callObj;

    this.callOwner = false; //jzGetParam("callOwner", false);
    this.callActive = false; //jzGetParam("callActive", "false").toLowerCase() === "true";
    this.callType = jzGetParam("callType", "");

    this.uidToCall = jzGetParam("uidToCall", "");
    this.displaynameToCall = jzGetParam("displaynameToCall", "");

    this.chatMessage = JSON.parse(jzGetParam("chatMessage", '{}'));

    this.isConnected = false;


};

SightCallExtension.prototype.initOptions = function(options) {
    this.username = options.username;
    this.callMode = options.callMode;
    this.callee = options.callee;
    this.caller = options.caller;
    this.calleeFullName = options.calleeFullName;
    this.callerFullName = options.callerFullName;
};


SightCallExtension.prototype.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

SightCallExtension.prototype.removeCookie = function(cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}
SightCallExtension.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

SightCallExtension.prototype.showSightcallInstaller = function() {
    if (!sightcallExtension.isSupport || sightcallExtension.connectedWeemoDriver || weemoExtension.isTurnOff === "true") {
        jqchat("#sightcall-alert").hide();
        return;
    }
    var isDismiss = sightcallExtension.getCookie('isDismiss');
    if (!sightcallExtension.isConnected) {
        if ((typeof(isDismiss) == "undefined" && isDismiss == null) || !isDismiss) {
            var uiToolbarContainer = jqchat("#UIToolbarContainer");
            var height = uiToolbarContainer.outerHeight() - jqchat(".alert").css("marginTop").replace('px', '');

            jqchat("#sightcall-alert").css({
                top: height + 'px'
            });
            jqchat("#sightcall-alert").show();
            var downloadUrl = sightcallExtension.getCookie("downloadUrl");
            jqchat("#sightcall-alert-download").click(function() {
                jqchat("#sightcall-alert").hide();
                location.href = downloadUrl;
            });

            jqchat("#sightcall-alert-dismiss").click(function() {
                sightcallExtension.setCookie("isDismiss", "true", 365);
                jqchat("#sightcall-alert").hide();
            });
            var closeElem = jqchat("#sightcall-alert").find(".uiIconClose:first");
            jqchat(closeElem).click(function() {
                jqchat("#sightcall-alert").hide();
            });
        }
    }
}

SightCallExtension.prototype.setKey = function(weemoKey) {
    this.weemoKey = weemoKey;
    jzStoreParam("weemoKey", weemoKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};

SightCallExtension.prototype.setTokenKey = function(tokenKey) {
    this.tokenKey = tokenKey;
    jzStoreParam("tokenKey", tokenKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};


SightCallExtension.prototype.setCallOwner = function(callOwner) {
    this.callOwner = callOwner;
    jzStoreParam("callOwner", callOwner, 14400);
};

SightCallExtension.prototype.setCallType = function(callType) {
    this.callType = callType;
    jzStoreParam("callType", callType, 14400);
};

SightCallExtension.prototype.setCallActive = function(callActive) {
    this.callActive = callActive;
    jzStoreParam("callActive", callActive, 14400);
};

SightCallExtension.prototype.setUidToCall = function(uidToCall) {
    this.uidToCall = uidToCall;
    jzStoreParam("uidToCall", uidToCall, 14400);
};

SightCallExtension.prototype.setDisplaynameToCall = function(displaynameToCall) {
    this.displaynameToCall = displaynameToCall;
    jzStoreParam("displaynameToCall", displaynameToCall, 14400);
};

SightCallExtension.prototype.setMeetingPointId = function(meetingPointId) {
    this.meetingPointId = meetingPointId;
    jzStoreParam("meetingPointId", meetingPointId, 14400);
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
SightCallExtension.prototype.setChatMessage = function(chatMessage) {
    this.chatMessage = chatMessage;
    jzStoreParam("chatMessage", JSON.stringify(chatMessage), 14400);
};

SightCallExtension.prototype.hasChatMessage = function() {
    return (this.chatMessage.url !== undefined);
};

SightCallExtension.prototype.initChatMessage = function() {
    this.setChatMessage({});
};

SightCallExtension.prototype.hangup = function() {
    if (this.callObj !== undefined) {
        this.callObj.hangup();
    }
};

/**
 * Init Weemo Call
 * @param $uid
 * @param $name
 */
SightCallExtension.prototype.initCall = function($uid, $name) {

    if (this.weemoKey !== "" && this.rtcc !== undefined) {

        this.rtcc.setDebugLevel(1); // Activate debug in JavaScript console
        this.rtcc.setWebAppId(this.weemoKey);
        this.rtcc.setToken("weemo" + $uid);

        this.rtcc.on('client.connect', function(connectionMode) {
            if ("plugin" === connectionMode || "webrtc" === connectionMode) {
                sightcallExtension.connectedWeemoDriver = true;

                if (sightcallExtension.hasChatMessage() && (chatApplication !== undefined)) {
                    var roomToCheck = sightcallExtension.chatMessage.room;
                    chatApplication.checkIfMeetingStarted(roomToCheck, function(callStatus) {
                        if (callStatus === 0) { // Already terminated
                            return;
                        }
                        var options = {};
                        options.timestamp = Math.round(new Date().getTime() / 1000);
                        options.type = "call-off";
                        chatApplication.chatRoom.sendFullMessage(
                            sightcallExtension.chatMessage.user,
                            sightcallExtension.chatMessage.token,
                            sightcallExtension.chatMessage.targetUser,
                            roomToCheck,
                            chatBundleData.exoplatform_chat_call_terminated,
                            options,
                            "true"
                        );

                        sightcallExtension.initChatMessage();
                    });
                }
            }
        });

        this.rtcc.on('client.disconnect', function() {
            if (sightcallExtension.rtcc.getConnectionMode() === "plugin" || sightcallExtension.rtcc.getConnectionMode() === "webrtc") {
                sightcallExtension.isConnected = false;
                sightcallExtension.setCallActive(false);
                if (sightcallExtension.hasChatMessage() && (chatApplication !== undefined)) {
                    var roomToCheck = sightcallExtension.chatMessage.room;
                    chatApplication.checkIfMeetingStarted(roomToCheck, function(callStatus) {
                        if (callStatus === 0) { // Already terminated
                            return;
                        }
                        var options = {};
                        options.timestamp = Math.round(new Date().getTime() / 1000);
                        options.type = "call-off";
                        chatApplication.chatRoom.sendFullMessage(
                            sightcallExtension.chatMessage.user,
                            sightcallExtension.chatMessage.token,
                            sightcallExtension.chatMessage.targetUser,
                            roomToCheck,
                            chatBundleData.exoplatform_chat_call_terminated,
                            options,
                            "true"
                        );

                        sightcallExtension.initChatMessage();

                    });
                }
            }
        });

        this.rtcc.on('cloud.sip.ok', function() {
            if (sightcallExtension.rtcc.getConnectionMode() === "plugin" || sightcallExtension.rtcc.getConnectionMode() === "webrtc") {
                sightcallExtension.isConnected = true;

                var fn = jqchat(".label-user").text();
                var fullname = jqchat("#UIUserPlatformToolBarPortlet > a:first").text().trim();
                if (fullname !== "") {
                    sightcallExtension.rtcc.setDisplayName(fullname); // Configure the display name
                } else if (fn !== "") {
                    sightcallExtension.rtcc.setDisplayName(fn); // Configure the display name
                }
                if (sightcallExtension.firstLoad && sightcallExtension.callMode === "one") {
                    SightCallNotification.showCalling();
                    SightCallNotification.sendCalling(sightcallExtension.callee);
                    sightcallExtension.firstLoad = false;
                } else if (sightcallExtension.callMode === "one_callee" && sightcallExtension.firstLoad) {
                    SightCallNotification.sendReady(sightcallExtension.caller);
                    sightcallExtension.firstLoad = false;

                }

            }
        });

        this.rtcc.on('cloud.loggedasotheruser', function() {
            if (sightcallExtension.rtcc.getConnectionMode() === "plugin" || sightcallExtension.rtcc.getConnectionMode() === "webrtc") {
                sightcallExtension.rtcc.authenticate(1);
            }
        });

        this.rtcc.on('cloud.sip.ko', function() {
            if (sightcallExtension.rtcc.getConnectionMode() === "plugin" || sightcallExtension.rtcc.getConnectionMode() === "webrtc") {
                sightcallExtension.isConnected = false;
            }
        });

        this.rtcc.on('error', function(errorMessage) {
            console.log("Unknown error: " + errorMessage);
        });

        this.rtcc.on('error.ossupport', function() {
            sightcallExtension.isSupport = false;
            sightcallExtension.isConnected = false;
        });

        this.rtcc.on('plugin.missing', function(downloadUrl) {
            sightcallExtension.setCookie("isNotInstallWeemoPlugin", "true", 365);
            sightcallExtension.setCookie("downloadUrl", downloadUrl, 365);
            sightcallExtension.showSightcallInstaller();
            if (navigator.platform !== "Linux") {
                jqchat("#weemo-alert-download").click(function() {
                    jqchat("#weemo-alert").hide();
                    location.href = downloadUrl;
                });
            }
        });

        this.rtcc.on('meetingpoint.create.success', function(meetinPointObject) {
            meetinPointObject.autoaccept_mode();
            meetinPointObject.host();
        });

        this.rtcc.on('call.create', function(callObj) {
            if ("outgoing" !== callObj.getDirection()) {
                callObj.accept();
                return;
            }
            sightcallExtension.callObj = callObj;
            callObj.on(['active', 'proceed', 'terminate'], function() {
                var eventName = this.eventName;
                var messageWeemo = "";
                var optionsWeemo = {};
                ts = Math.round(new Date().getTime() / 1000);

                if (eventName === "terminate") sightcallExtension.setCallOwner(false);

                if (sightcallExtension.callType === "internal" || eventName === "terminate") {
                    messageWeemo = "Call " + status;
                    optionsWeemo.timestamp = ts;
                } else if (sightcallExtension.callType === "host") {
                    messageWeemo = "Call " + status;
                    optionsWeemo.timestamp = ts;
                    optionsWeemo.uidToCall = sightcallExtension.uidToCall;
                    optionsWeemo.displaynameToCall = sightcallExtension.displaynameToCall;
                    optionsWeemo.meetingPointId = sightcallExtension.meetingPoint.id;
                }

                if (eventName === "active" && sightcallExtension.callActive) return; //Call already active, no need to push a new message
                if (eventName === "terminate" && (!sightcallExtension.callActive || sightcallExtension.callType === "attendee")) //Terminate a non started call or a joined call, no message needed
                {
                    sightcallExtension.setCallActive(false);
                    return;
                }
                if (sightcallExtension.callType === "attendee" && eventName === "active") {
                    sightcallExtension.setCallActive(true);
                    optionsWeemo.type = "call-join";
                    optionsWeemo.username = sightcallExtension.chatMessage.user;
                    optionsWeemo.fullname = sightcallExtension.chatMessage.fullname;

                } else if (eventName === "active") {
                    sightcallExtension.setCallActive(true);
                    optionsWeemo.type = "call-on";
                } else if (eventName === "terminate") {
                    sightcallExtension.setCallActive(false);
                    optionsWeemo.type = "call-off";
                } else if (eventName === "proceed") {
                    sightcallExtension.setCallActive(false);
                    optionsWeemo.type = "call-proceed";
                }

                if (sightcallExtension.hasChatMessage()) {
                    console.log("WEEMO:hasChatMessage::" + sightcallExtension.chatMessage.user + ":" + sightcallExtension.chatMessage.targetUser);
                    if (chatApplication !== undefined) {
                        var roomToCheck = "";
                        if (sightcallExtension.chatMessage.room !== undefined) roomToCheck = sightcallExtension.chatMessage.room;
                        chatApplication.checkIfMeetingStarted(roomToCheck, function(callStatus) {
                            if (callStatus === 1 && optionsWeemo.type === "call-on") {
                                // Call is already created, not allowed.
                                sightcallExtension.initChatMessage();
                                sightcallExtension.hangup();
                                return;
                            }
                            if (callStatus === 0 && optionsWeemo.type === "call-off") {
                                // Call is already terminated, no need to terminate again
                                return;
                            }

                            chatApplication.chatRoom.sendFullMessage(
                                sightcallExtension.chatMessage.user,
                                sightcallExtension.chatMessage.token,
                                sightcallExtension.chatMessage.targetUser,
                                sightcallExtension.chatMessage.room,
                                messageWeemo,
                                optionsWeemo,
                                "true"
                            );

                            if (eventName === "terminate") {
                                sightcallExtension.initChatMessage();
                            }
                        });
                    }
                }

            });
        });

        try {
            this.rtcc.initialize();
        } catch (err) {
            if (window.console)
                console.log("Can not initialize weemo: " + err);
        }
        var fn = jqchat(".label-user").text();
        var fullname = jqchat("#UIUserPlatformToolBarPortlet > a:first").text().trim();
        if (fullname !== "") {
            this.rtcc.setDisplayName(fullname); // Configure the display name
        } else if (fn !== "") {
            this.rtcc.setDisplayName(fn); // Configure the display name
        }

    }
};

/**
 *
 */
SightCallExtension.prototype.createWeemoCall = function(targetUser, targetFullname, chatMessage) {


    if (this.weemoKey !== "" && this.callActive === false) {

        if (chatMessage !== undefined) {
            this.setChatMessage(chatMessage);
        }

        if (targetUser.indexOf("space-") === -1 && targetUser.indexOf("team-") === -1) {
            this.setUidToCall("weemo" + targetUser);
            this.setDisplaynameToCall(targetFullname);
            this.setCallType("internal");
            this.setCallOwner(true);
            this.rtcc.createCall(this.uidToCall, this.callType, this.displaynameToCall);
        } else {
            this.setUidToCall(this.rtcc.getToken());
            this.setDisplaynameToCall(this.rtcc.getDisplayName());
            this.setCallType("host");
            this.setCallOwner(true);
            this.meetingPoint = this.rtcc.createMeetingPoint('adhoc');
        }
    }
};

/**
 *
 */
SightCallExtension.prototype.joinWeemoCall = function(chatMessage) {
    if (this.weemoKey !== "" && this.callActive === false) {
        if (chatMessage !== undefined) {
            this.setChatMessage(chatMessage);
        }
        this.setCallType("attendee");
        this.setCallOwner(false);
        this.rtcc.joinConfCall(this.meetingPointId);
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
    log: function() {},
    warn: function() {},
    error: function() {}
};

/**
 * Init Chat Interval
 */
SightCallExtension.prototype.initPopup = function() {
    jqchat("#PlatformAdminToolbarContainer").css("display", "none");

    // Set popup title
    if ("one" === sightcallExtension.callMode) {
        document.title = "Video Call : " + sightcallExtension.calleeFullName;
    } else if ("one_callee" === sightcallExtension.callMode) {
        document.title = "Video Call : " + sightcallExtension.callerFullName;
    }
};

SightCallExtension.prototype.checkConnectingTimeout = function() {
    window.setTimeout(function() {
        if (sightcallExtension.isConnected == false && sightcallExtension.weemoKey !== "" && sightcallExtension.tokenKey.length > 0 ) {
            if ("one_callee" === sightcallExtension.callMode) {
                SightCallNotification.showConnectionLost(sightcallExtension.caller);
                SightCallNotification.sendConnectionLost(sightcallExtension.caller);
            } else if ("one" === sightcallExtension.callMode) {
                SightCallNotification.showConnectionLost(sightcallExtension.callee);
            }
            if (sightcallExtension.rtcc !== undefined)
                sightcallExtension.rtcc.destroy();
        }
    }, 30000);
};

/**
 ##################                           ##################
 ##################                           ##################
 ##################   GLOBAL                  ##################
 ##################                           ##################
 ##################                           ##################
 */

// GLOBAL VARIABLES

var sightcallExtension = new SightCallExtension();


(function($) {

    $(document).ready(function() {
        //GETTING DOM CONTEXT
        var $sightcallApplication = $("#sightcall-status");


        // WEEMO NOTIFICATION INIT
        sightcallExtension.initOptions({
            "username": $sightcallApplication.attr("data-username"),
            "callMode": $sightcallApplication.attr("data-call-mode"),
            "callee": $sightcallApplication.attr("data-callee"),
            "caller": $sightcallApplication.attr("data-caller"),
            "callerFullName": $sightcallApplication.attr("data-caller-full-name"),
            "calleeFullName": $sightcallApplication.attr("data-callee-full-name")
        });

        if (navigator.platform.indexOf("Linux") >= 0 && !jqchat.browser.chrome) return;

        sightcallExtension.cometdUserToken = $sightcallApplication.attr("cometd-user-token");
        sightcallExtension.cometdContextName = $sightcallApplication.attr("cometd-context-name");


        var isNotInstallWeemoPlugin = sightcallExtension.getCookie("isNotInstallWeemoPlugin");

        sightcallExtension.videoCallVersion = $sightcallApplication.attr("videoCallVersion");
        if (sightcallExtension.videoCallVersion.length > 0) {
            var oldVersion = sightcallExtension.getCookie("videoCallVersion");

            if (sightcallExtension.videoCallVersion > oldVersion) {
                if (isNotInstallWeemoPlugin == 'true') {
                    sightcallExtension.removeCookie("isDismiss");
                    sightcallExtension.showSightcallInstaller();
                }
                sightcallExtension.setCookie("videoCallVersion", sightcallExtension.videoCallVersion, 365);
            }
        }

        sightcallExtension.initPopup();

        if (isNotInstallWeemoPlugin == 'true') {
            sightcallExtension.showSightcallInstaller();
        }
        // WEEMO : GETTING AND SETTING KEY
        var weemoKey = $sightcallApplication.attr("data-weemo-key");
        sightcallExtension.setKey(weemoKey);

        var tokenKey = $sightcallApplication.attr("data-token-key");
        sightcallExtension.setTokenKey(tokenKey);

        // Check conneting to sight call server timeout
        sightcallExtension.checkConnectingTimeout();

        var username = $sightcallApplication.attr("data-username");
        sightcallExtension.initCall(username, username);

    });

})(jqchat);
