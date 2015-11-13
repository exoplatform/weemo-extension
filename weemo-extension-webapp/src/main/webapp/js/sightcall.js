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
    this.tokenKey = "";
    this.weemoKey = "";
    this.isValidWeemoKey = true;
    this.meetingPoint;
    this.callMode = "";
    this.callee = "";
    this.firstLoad = true;
    this.caller = "";
    this.calleeFullName = "";
    this.callerFullName = "";
    this.hasChatMsg = "false";
    this.isSpace = "false";
    this.spaceOrTeamName = "";
    this.connectingTimeout = 0;

    try {
        var options = {
            mode_parameter: 'plugin_webrtc',
            container: 'video-container'
        };
        this.rtcc = new Rtcc('', '', 'internal', options);
    } catch (err) {
        console.log("WEEMO NOT AVAILABLE YET " + err);
        this.rtcc = undefined;
        this.isValidWeemoKey = false;
    }


    this.callObj;

    this.callType = jzGetParam("callType", "");

    this.uidToCall = jzGetParam("uidToCall", "");
    this.displaynameToCall = jzGetParam("displaynameToCall", "");

    this.chatMessage = JSON.parse(jzGetParam("chatMessage", '{}'));

    this.isConnected = false;
};

SightCallExtension.prototype.initOptions = function(options) {
    this.username = options.username;
    this.callMode = options.callMode; jzStoreParam("callMode", options.callMode, 14400);
    this.callee = options.callee;
    this.caller = options.caller;
    this.calleeFullName = options.calleeFullName;
    this.callerFullName = options.callerFullName;
    this.hasChatMsg = options.hasChatMsg;
    this.isSpace = options.isSpace;
    this.spaceOrTeamName = options.spaceOrTeamName;
};

SightCallExtension.prototype.setConnectionStatus = function(isConnected) {
    this.isConnected = isConnected;
    jzStoreParam("isSightCallConnected", isConnected);
};

SightCallExtension.prototype.setKey = function(weemoKey) {
    this.weemoKey = weemoKey;
    jzStoreParam("weemoKey", weemoKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};

SightCallExtension.prototype.setTokenKey = function(tokenKey) {
    this.tokenKey = tokenKey;
    jzStoreParam("tokenKey", tokenKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};


SightCallExtension.prototype.setCallType = function(callType) {
    this.callType = callType;
    jzStoreParam("callType", callType, 14400);
};

SightCallExtension.prototype.setUidToCall = function(uidToCall) {
    this.uidToCall = uidToCall;
    jzStoreParam("uidToCall", uidToCall, 14400);
};

SightCallExtension.prototype.setDisplaynameToCall = function(displaynameToCall) {
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

        this.rtcc.setDebugLevel(3); // Activate debug in JavaScript console
        this.rtcc.setWebAppId(this.weemoKey);
        this.rtcc.setToken(this.tokenKey);

        this.rtcc.on('client.connect', function(connectionMode) {
            if ("plugin" === connectionMode || "webrtc" === connectionMode) {

                if (sightcallExtension.hasChatMessage() && (chatNotification !== undefined)
                 && (sightcallExtension.callMode === "one" || sightcallExtension.callMode === "host")) {
                    var roomToCheck = sightcallExtension.chatMessage.room;
                    chatNotification.checkIfMeetingStarted(roomToCheck, function(callStatus, recordStatus) {
                        if (callStatus !== 1) { // Already terminated
                            return;
                        }

                        // Also Update record status
                        if (recordStatus === 1) {
                            var options = {
                                type: "type-meeting-stop",
                                fromUser: chatNotification.username,
                                fromFullname: chatNotification.username
                            };
                            chatNotification.sendFullMessage(
                              sightcallExtension.chatMessage.user,
                              sightcallExtension.chatMessage.token,
                              sightcallExtension.chatMessage.targetUser,
                              roomToCheck,
                              "",
                              options,
                              "true"
                            );
                        }

                        var options = {};
                        options.timestamp = Math.round(new Date().getTime() / 1000);
                        options.type = "call-off";
                        chatNotification.sendFullMessage(
                            sightcallExtension.chatMessage.user,
                            sightcallExtension.chatMessage.token,
                            sightcallExtension.chatMessage.targetUser,
                            roomToCheck,
                            chatBundleData.exoplatform_chat_call_terminated,
                            options,
                            "true"
                        );
                    });
                }
                sightcallExtension.initChatMessage();
            }
        });

        this.rtcc.on('client.disconnect', function() {
            if (sightcallExtension.rtcc.getConnectionMode() === "plugin" || sightcallExtension.rtcc.getConnectionMode() === "webrtc") {
                    sightcallExtension.setConnectionStatus(false);
                if (sightcallExtension.hasChatMessage() && (chatNotification !== undefined) 
                    && (sightcallExtension.callMode === "one" || sightcallExtension.callMode === "host")) {
                    var roomToCheck = sightcallExtension.chatMessage.room;
                    chatNotification.checkIfMeetingStarted(roomToCheck, function(callStatus, recordStatus) {
                        if (callStatus !== 1) { // Already terminated
                            return;
                        }

                        // Also Update record status
                        if (recordStatus === 1) {
                            var options = {
                                type: "type-meeting-stop",
                                fromUser: chatNotification.username,
                                fromFullname: chatNotification.username
                            };
                            chatNotification.sendFullMessage(
                              sightcallExtension.chatMessage.user,
                              sightcallExtension.chatMessage.token,
                              sightcallExtension.chatMessage.targetUser,
                              roomToCheck,
                              "",
                              options,
                              "true"
                            );
                        }

                        var options = {};
                        options.timestamp = Math.round(new Date().getTime() / 1000);
                        options.type = "call-off";
                        chatNotification.sendFullMessage(
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

                if (sightcallExtension.callMode === "one" || sightcallExtension.callMode === "one_callee") {
                    var toUser = jzGetParam("stToUser", "");
                    SightCallNotification.showConnectionLost(toUser);
                } else if (sightcallExtension.callMode === "host" || sightcallExtension.callMode === "attendee") {
                    var spaceName = sightcallExtension.spaceOrTeamName;
                    SightCallNotification.showGroupCallDroped(jzGetParam("isSpace"), spaceName);
                }
            }
        });

        this.rtcc.on('cloud.sip.ok', function() {
            if (sightcallExtension.rtcc.getConnectionMode() === "plugin" || sightcallExtension.rtcc.getConnectionMode() === "webrtc") {
                sightcallExtension.setConnectionStatus(true);

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
                } else if (sightcallExtension.callMode === "host" && sightcallExtension.firstLoad) {
                    var chatMessage = {
                        "url": jzGetParam("jzChatSend"),
                        "user": chatNotification.username,
                        "fullname": jzGetParam("targetFullname"),
                        "targetUser": jzGetParam("targetUser"),
                        "room": jzGetParam("room"),
                        "token": chatNotification.token
                    };
                    sightcallExtension.createWeemoCall(jzGetParam("targetUser"), jzGetParam("targetFullname"), chatMessage);
                    sightcallExtension.firstLoad = false;
                } else if (sightcallExtension.callMode === "attendee" && sightcallExtension.firstLoad) {
                    var chatMessage = {
                        "url": jzGetParam("jzChatSend"),
                        "user": chatNotification.username,
                        "fullname": jzGetParam("targetFullname"),
                        "targetUser": jzGetParam("targetUser"),
                        "room": jzGetParam("room"),
                        "token": chatNotification.token
                    };
                    sightcallExtension.joinWeemoCall(chatMessage);
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
                sightcallExtension.setConnectionStatus(false);

                if (sightcallExtension.callMode === "one" || sightcallExtension.callMode === "one_callee") {
                    var toUser = jzGetParam("stToUser", "");
                    SightCallNotification.showConnectionLost(toUser);
                } else if (sightcallExtension.callMode === "host" || sightcallExtension.callMode === "attendee") {
                    var spaceName = sightcallExtension.spaceOrTeamName;
                    SightCallNotification.showGroupCallDroped(jzGetParam("isSpace"), spaceName);
                }
            }
        });

        this.rtcc.on('error', function(errorMessage) {
            console.log("Unknown error: " + errorMessage);
        });

        this.rtcc.on('error.ossupport', function() {
            sightcallExtension.setConnectionStatus(false);
        });

        this.rtcc.on('plugin.missing', function(downloadUrl) {
            window.require(["SHARED/SightCallNotification"], function(sightCallNotification) {
                clearTimeout(sightcallExtension.connectingTimeout);

                SightCallNotification.initCometd(weemoExtension.username, weemoExtension.cometdUserToken, weemoExtension.cometdContextName);
                if (sightcallExtension.callMode === "one_callee") {

                    SightCallNotification.sendPluginNotInstalled(sightcallExtension.caller);

                    SightCallNotification.showPluginNotInstalled(downloadUrl);

                } else  {
                    SightCallNotification.showPluginNotInstalled(downloadUrl);
                }

            });
        });

        this.rtcc.on('meetingpoint.create.error', function(errorObject) {
            var spaceName = jzGetParam("targetFullname","").toLowerCase().split(" ").join("_");
            SightCallNotification.showGroupCallDroped(jzGetParam("isSpace"), spaceName);
        });

        this.rtcc.on('meetingpoint.create.success', function(meetinPointObject) {
            meetinPointObject.autoaccept_mode();
            meetinPointObject.host();
        });

        this.rtcc.on('call.create', function(callObj) {
            if ("outgoing" !== callObj.getDirection()) {
                callObj.accept();
            }
            sightcallExtension.callObj = callObj;
            callObj.on(['active', 'proceed', 'terminate'], function() {
                var eventName = this.eventName;

                if (eventName === "active") {
                    SightCallNotification.showVideoToCenter();
                } else if (eventName === "terminate") {
                    if (sightcallExtension.callMode === "one" || sightcallExtension.callMode === "one_callee") {
                        var toUser = jzGetParam("stToUser", "");
                        SightCallNotification.showCallDroped(toUser);
                    } else if (sightcallExtension.callMode === "host" || sightcallExtension.callMode === "attendee") {
                        SightCallNotification.showGroupCallDroped(sightcallExtension.isSpace, sightcallExtension.spaceOrTeamName);
                    }
                }

                // Process chat message
                var optionsWeemo = {};
                ts = Math.round(new Date().getTime() / 1000);
                if (sightcallExtension.callType === "internal" || eventName === "terminate") {
                    optionsWeemo.timestamp = ts;
                } else if (sightcallExtension.callType === "host") {
                    optionsWeemo.timestamp = ts;
                    optionsWeemo.uidToCall = sightcallExtension.uidToCall;
                    optionsWeemo.displaynameToCall = sightcallExtension.displaynameToCall;
                    optionsWeemo.meetingPointId = sightcallExtension.meetingPoint.id;
                }

                if (sightcallExtension.callType === "attendee" && eventName === "active") {
                    optionsWeemo.type = "call-join";
                    optionsWeemo.username = sightcallExtension.chatMessage.user;
                    optionsWeemo.fullname = sightcallExtension.chatMessage.fullname;

                } else if (eventName === "active") {
                    optionsWeemo.type = "call-on";
                } else if (eventName === "terminate") {
                    optionsWeemo.type = "call-off";
                } else if (eventName === "proceed") {
                    optionsWeemo.type = "call-proceed";
                }

                if (eventName === "terminate"  && sightcallExtension.callMode === "attendee") return;
                if (sightcallExtension.hasChatMessage()) {
                    if (chatNotification !== undefined) {
                        var roomToCheck = "";
                        if (sightcallExtension.chatMessage.room !== undefined)  roomToCheck = sightcallExtension.chatMessage.room;
                        chatNotification.checkIfMeetingStarted(roomToCheck, function(callStatus, recordStatus) {
                            if (callStatus === 1 && optionsWeemo.type==="call-on") {
                                // Call is already created, not allowed.
                                sightcallExtension.initChatMessage();
                                sightcallExtension.hangup();
                                return;
                            }
                            if (callStatus === 0 && optionsWeemo.type==="call-off") {
                                // Call is already terminated, no need to terminate again
                                return;
                            }

                            // Also Update record status
                            if (optionsWeemo.type === "call-off" && recordStatus === 1) {
                                var options = {
                                    type: "type-meeting-stop",
                                    fromUser: chatNotification.username,
                                    fromFullname: chatNotification.username
                                };
                                chatNotification.sendFullMessage(
                                  sightcallExtension.chatMessage.user,
                                  sightcallExtension.chatMessage.token,
                                  sightcallExtension.chatMessage.targetUser,
                                  sightcallExtension.chatMessage.room,
                                  "",
                                  options,
                                  "true"
                                );
                            }

                            chatNotification.sendFullMessage(
                              sightcallExtension.chatMessage.user,
                              sightcallExtension.chatMessage.token,
                              sightcallExtension.chatMessage.targetUser,
                              sightcallExtension.chatMessage.room,
                              "",
                              optionsWeemo,
                              "true"
                            );

                            // Also Update record status
                            if (optionsWeemo.type === "call-on" && recordStatus !== 1) {
                                var options = {
                                    type: "type-meeting-start",
                                    fromUser: chatNotification.username,
                                    fromFullname: chatNotification.username
                                };

                                chatNotification.sendFullMessage(
                                  sightcallExtension.chatMessage.user,
                                  sightcallExtension.chatMessage.token,
                                  sightcallExtension.chatMessage.targetUser,
                                  sightcallExtension.chatMessage.room,
                                  "",
                                  options,
                                  "true"
                                );
                            }

                            if (eventName==="terminate") {
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


    if (this.weemoKey !== "") {

        if (chatMessage !== undefined) {
            this.setChatMessage(chatMessage);
        }

        if (targetUser.indexOf("space-") === -1 && targetUser.indexOf("team-") === -1) {
            this.setUidToCall("weemo" + targetUser);
            this.setDisplaynameToCall(targetFullname);
            this.setCallType("internal");
            this.rtcc.createCall(this.uidToCall, this.callType, this.displaynameToCall);
        } else {
            this.setUidToCall("weemo" + sightcallExtension.username);
            this.setDisplaynameToCall(this.rtcc.getDisplayName());
            this.setCallType("host");
            this.meetingPoint = this.rtcc.createMeetingPoint('adhoc');
        }
    }
};

/**
 *
 */
SightCallExtension.prototype.joinWeemoCall = function(chatMessage) {
    if (this.weemoKey !== "") {
        if (chatMessage !== undefined) {
            this.setChatMessage(chatMessage);
        }
        this.setCallType("attendee");
        this.rtcc.joinConfCall(jzGetParam("meetingPointId"));
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
SightCallExtension.prototype.initPopup = function () {
    jqchat("#PlatformAdminToolbarContainer").css("display", "none");

    // Set popup title
    if ("one" === sightcallExtension.callMode) {
        document.title = weemoBundleData.exoplatform_videocall_popup_title.replace('{0}', sightcallExtension.calleeFullName);
        if (sightcallExtension.callee.length === 0) {
            sightcallExtension.showWrongParams();
        }
    } else if ("one_callee" === sightcallExtension.callMode) {
        document.title = weemoBundleData.exoplatform_videocall_popup_title.replace('{0}', sightcallExtension.callerFullName);
        if (jzGetParam("stMessageType", "") !== "accepted" || jzGetParam("rvMessageType", "") !== "calling") {
            window.require(["SHARED/SightCallNotification"], function (sightCallNotification) {
                SightCallNotification.showCallDroped(sightcallExtension.caller);
            });
        }
        if (sightcallExtension.caller.length === 0) {
            sightcallExtension.showWrongParams();
        }
    } else if ("host" === sightcallExtension.callMode) {
        document.title = weemoBundleData.exoplatform_videocall_popup_title.replace('{0}', jzGetParam("targetFullname"));
    } else if ("attendee" === sightcallExtension.callMode) {
        document.title = weemoBundleData.exoplatform_videocall_popup_title.replace('{0}', jzGetParam("targetFullname"));
    }
    else {
        sightcallExtension.showNotSupported();
    }
};

SightCallExtension.prototype.checkConnectingTimeout = function () {
    sightcallExtension.connectingTimeout = window.setTimeout(function () {
        if (sightcallExtension.isConnected == false && sightcallExtension.weemoKey !== "" && sightcallExtension.tokenKey.length > 0) {
            if ("one_callee" === sightcallExtension.callMode) {
                SightCallNotification.showConnectionLost(sightcallExtension.caller);
                SightCallNotification.sendConnectionLost(sightcallExtension.caller);
            } else if ("one" === sightcallExtension.callMode) {
                jzStoreParam("stTime", 0);
                SightCallNotification.showConnectionLost(sightcallExtension.callee);
            } else {
                var spaceName = sightcallExtension.spaceOrTeamName;
                SightCallNotification.showGroupCallDroped(jzGetParam("isSpace"), spaceName);            }
            if (sightcallExtension.rtcc !== undefined)
                sightcallExtension.rtcc.destroy();
        } else if (sightcallExtension.isConnected === true && sightcallExtension.callObj === undefined) {
            if ("one_callee" === sightcallExtension.callMode) {
                jzStoreParam("stTime", 0);
                SightCallNotification.showCallDroped(sightcallExtension.caller);
            }
        }
    }, 30000);
};

SightCallExtension.prototype.showNotSupported = function() {
    jqchat('body').html('<div class = "center">NOT SUPPORTED</div>')
};

SightCallExtension.prototype.showWrongParams =  function() {
    jqchat('body').html('<div class = "center">Wrong or missing query parameter(s)</div>')
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

        $(window).on('beforeunload unload', function(){
            sightcallExtension.setConnectionStatus(false);
            if (sightcallExtension.hasChatMessage() && (chatNotification !== undefined)
             && (sightcallExtension.callMode ==='one' || sightcallExtension.callMode ==='host' )) {
                var roomToCheck = sightcallExtension.chatMessage.room;

                chatNotification.checkIfMeetingStarted(roomToCheck, function(callStatus, recordStatus) {

                    if (callStatus !== 1) { // Already terminated
                        return;
                    }

                    // Also Update record status
                    if (recordStatus === 1) {
                        var options = {
                            type: "type-meeting-stop",
                            fromUser: chatNotification.username,
                            fromFullname: chatNotification.username
                        };
                        chatNotification.sendFullMessage(
                          sightcallExtension.chatMessage.user,
                          sightcallExtension.chatMessage.token,
                          sightcallExtension.chatMessage.targetUser,
                          roomToCheck,
                          "",
                          options,
                          "true"
                        );
                    }

                    var options = {};
                    options.timestamp = Math.round(new Date().getTime() / 1000);
                    options.type = "call-off";
                    chatNotification.sendFullMessage(
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
        });

        //GETTING DOM CONTEXT
        var $sightcallApplication = $("#sightcall-status");


        // WEEMO NOTIFICATION INIT
        sightcallExtension.initOptions({
            "username": $sightcallApplication.attr("data-username"),
            "callMode": $sightcallApplication.attr("data-call-mode"),
            "callee": $sightcallApplication.attr("data-callee"),
            "caller": $sightcallApplication.attr("data-caller"),
            "callerFullName": $sightcallApplication.attr("data-caller-full-name"),
            "calleeFullName": $sightcallApplication.attr("data-callee-full-name"),
            "hasChatMsg": $sightcallApplication.attr("data-has-chat-message"),
            "isSpace": $sightcallApplication.attr("data-is-space"),
            "spaceOrTeamName" :  $sightcallApplication.attr("data-space-or-team-name")
        });

        if ((navigator.platform.indexOf("Linux") >= 0 && !jqchat.browser.chrome) || window.opener === null  ) {
            sightcallExtension.showNotSupported();
            return;
        }

        sightcallExtension.cometdUserToken = $sightcallApplication.attr("cometd-user-token");
        sightcallExtension.cometdContextName = $sightcallApplication.attr("cometd-context-name");

        sightcallExtension.initPopup();

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
