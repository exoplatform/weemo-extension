(function(gj, webNotif, cCometD) {

    SightCallNotification = {
        initCometd: function(eXoUser, eXoToken, contextName) {
            var me = SightCallNotification;
            if (!me.Cometd) me.Cometd = cCometD;
            var loc = window.location;
            me.Cometd.configure({
                url: loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '') + '/' + contextName + '/cometd',
                'exoId': eXoUser,
                'exoToken': eXoToken
            });

            if (me.currentUser !== eXoUser || me.currentUser === '') {
                me.currentUser = eXoUser;
                me.Cometd.subscribe('/eXo/Application/web/SightCall', null, function(eventObj) {
                    var message = JSON.parse(eventObj.data);
                    SightCallNotification.receivingMessage(message);
                });
            }
        },
        sendCalling: function(toUser) {
            if (this.isBeingOnPopup()) {
                this.clearHistory();

                this.sendMessage(toUser, "calling");

                window.setTimeout(function() {
                    if (SightCallNotification.isCalleeAnswerTimeout() && jzGetParam("stMessageType","") === "calling") {
                        SightCallNotification.showNoAnswer();
                    }
                }, 15000);
            }
        },
        sendDecline: function(toUser) {
            if (!this.isBeingOnPopup()) {
                this.sendMessage(toUser, "decline");
            }
        },

        sendAccepting: function(toUser) {
            if (!this.isBeingOnPopup()) {
                this.sendMessage(toUser, "accepted");
            }
        },
        sendMute: function(toUser) {
            if (!this.isBeingOnPopup()) {
                this.sendMessage(toUser, "mute");
            }
        },
        sendPluginNotInstalled: function(toUser) {
            if (this.isBeingOnPopup() && jzGetParam("stMessageType", "") === "accepted" && jzGetParam("rvMessageType","") === "calling") {
                this.sendMessage(toUser, "notinstalled");
                this.clearHistory();
            }
        },
        sendReady: function(toUser) {
            if (this.isBeingOnPopup() && jzGetParam("stMessageType","") === "accepted") {
                this.sendMessage(toUser, "ready");
            }
        },
        sendBusy: function(toUser) {
            if (!this.isBeingOnPopup()) {
              this.sendMessage(toUser, "busy", "one");
            }
        },
        sendConnectionLost: function(toUser) {
            if (this.isBeingOnPopup()) {
               this.sendMessage(toUser, "connectionlost");
            }
        },
        sendCallDrop: function(toUser) {
            if (this.isBeingOnPopup() && (jzGetParam("stMessageType","") === "accepted" || jzGetParam("rvMessageType","") === "accepted")) {
                this.sendMessage(toUser, "callDropped");
            }
        },
        sendMessage: function(toUser, messageType) {
            // Send message
            gj.ajax("/rest/weemo/sendMessage/" + toUser + "/" + messageType + "/one")
                .done(function() {
                    SightCallNotification.storeLastSentMessage(SightCallNotification.currentUser, toUser, "one", messageType);
                  console.log("Sent " + toUser + "  " + messageType);

              })
                .fail(function() {
                    SightCallNotification.showConnectionLost(toUser);
                    console.log("Cannot send " + toUser + "  " + messageType);
                });
        },
        receivingMessage: function(message) {

            if (jzGetParam("isBusy") === "true" && message.fromUser !== jzGetParam("rvFromUser") && jzGetParam("rvFromUser") !== undefined) {
                this.sendBusy(message.fromUser);
                return;
            }
            if (message.type === "calling") {
                this.receivingCalling(message);
            } else if (message.type === "decline") {
                this.receivingDecline(message);
            } else if (message.type === "busy") {
                this.receivingBusy(message);
            } else if (message.type === "ready") {
                this.receivingReady(message);
            } else if (message.type === "accepted") {
                this.receivingAccepted(message);
            } else if (message.type === "notinstalled") {
                this.receivingNotInstalled(message);
            } else if (message.type === "mute") {
                this.receivingMute(message);
            } else if (message.type === "connectionlost") {
                this.receivingConnectionLost(message);
            } else if (message.type === "callDropped") {
                this.receivingCallDropped(message);
            }

        },
        receivingCalling: function(message) {
            if (!this.isBeingOnPopup()) {
              // Show incomming
              this.showIncomming(message.fromUser, message.fromFullName);

              SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingDecline: function(message) {
            if (this.isBeingOnPopup() && !this.isCallerReceivingCallingTimeout() && jzGetParam("stMessageType", "") === "calling") {
                SightCallNotification.showNoAnswer();
                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingAccepted: function(message) {
            if (this.isBeingOnPopup() && !this.isCallerReceivingCallingTimeout() && jzGetParam("stMessageType", "") === "calling") {
                SightCallNotification.storeLastReceivedMessage(message);
                window.setTimeout(function() {
                    if (jzGetParam("rvMessageType","") === "accepted") {
                        SightCallNotification.showConnectionLost(message.fromUser);
                    }
                }, 30000);
            }
        },
        receivingMute: function(message) {
            if (this.isBeingOnPopup() && !this.isCallerReceivingCallingTimeout() && jzGetParam("stMessageType", "") === "calling") {
                SightCallNotification.showCallDroped(message.fromUser);
                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingNotInstalled: function(message) {
            if (this.isBeingOnPopup() && !this.isCalleeConnectingTimeout() && jzGetParam("stMessageType", "") === "calling" && jzGetParam("rvMessageType","") === "accepted") {
                SightCallNotification.showCallDroped(message.fromUser);
                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingConnectionLost: function(message) {
            if (this.isBeingOnPopup() && jzGetParam("stMessageType", "") === "calling" && jzGetParam("rvMessageType","") === "accepted") {
                SightCallNotification.showConnectionLost(message.fromUser);
                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingCallDropped: function(message) {
            if (this.isBeingOnPopup() && (jzGetParam("stMessageType","") === "ready" || jzGetParam("rvMessageType","") === "ready")) {
                SightCallNotification.showCallDroped(message.fromUser);
                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingReady: function(message) {
            if (this.isBeingOnPopup() && jzGetParam("rvMessageType", "") === "accepted" && jzGetParam("stMessageType","") === "calling") {
                if (!this.isCalleeConnectingTimeout()) {
                    if (sightcallExtension.hasChatMsg === "true") {
                        var chatMessage = {
                            "url": jzGetParam("jzChatSend"),
                            "user": message.toUser,
                            "fullname": message.toFullName,
                            "targetUser": message.fromUser,
                            "room": jzGetParam("room"),
                            "token": chatNotification.token
                        };
                        sightcallExtension.createWeemoCall(message.fromUser, message.toFullName, chatMessage);
                    } else {
                        sightcallExtension.createWeemoCall(message.fromUser, message.fromUser);
                    }
                } else if (this.isCalleeConnectingTimeout()) {
                    SightCallNotification.showConnectionLost(message.fromUser);
                }

                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingBusy: function(message) {
            if (this.isBeingOnPopup() && !this.isCallerReceivingCallingTimeout() && jzGetParam("stMessageType", "") === "calling" ) {
                SightCallNotification.showBusy();

                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        showIncomming: function(fromUser, fromFullName) {
            if (window.location.href.indexOf("videocallpopup") > -1) return; // Not show this on popup
            jzStoreParam("isBusy", true, 15);

            var incommingHtml = '<div id="sightCallOneOneIncommingForm" class="incoming-call">';
            incommingHtml += '    <div class="picto clearfix">';
            incommingHtml += '    	<div class="pull-right">';
            incommingHtml += '    		<i class="uiIconClose uiIconWhite"></i>';
            incommingHtml += '    	</div>';
            incommingHtml += '    	<div class="avatar pull-left">';
            incommingHtml += '    		<img src="/rest/weemo/getAvatarURL/' + fromUser + '" alt="' + fromFullName + '" />';
            incommingHtml += '    	</div>';
            incommingHtml += '    	<div class="name pull-left">' + weemoBundleData.exoplatform_videocall_incomming_message.replace('{0}', fromFullName) + '</div>';
            incommingHtml += '    </div>';
            incommingHtml += '    <div class="actionBtn center">';
            incommingHtml += '    	<a class="btn btn-primary video" href="#" id ="sightCallAcceptButton"><i class="uiIconWeemoWhite"></i>&nbsp;' + weemoBundleData.exoplatform_videocall_action_accept +'</a>';
            incommingHtml += '    	<a class="btn ignore" href="#" id="sightCallDecleinButton"><i class="iconCallDecline"></i>&nbsp;' + weemoBundleData.exoplatform_videocall_action_decline + '</a>';
            incommingHtml += '    </div>';
            incommingHtml += '	</div>';
            gj('body').append(incommingHtml);

            gj("#sightCallDecleinButton").click(function(e) {
                SightCallNotification.hideIncomming();
            });

            gj(".uiIconClose", "#sightCallOneOneIncommingForm").click(function(e) {
              window.require(["SHARED/SightCallNotification"], function(sightCallNotification) {
                SightCallNotification.hideIncomming();
                SightCallNotification.sendMute(fromUser);
              });
            });

            gj("#sightCallAcceptButton").click(function(e) {
                weemoExtension.showVideoPopup('/portal/intranet/videocallpopup?caller=' + fromUser + '&mode=one_callee');

                SightCallNotification.sendAccepting(fromUser);
                SightCallNotification.hideIncomming();
            });

            window.setTimeout(function() {
                SightCallNotification.hideIncomming();
            }, 15000);

        },
        hideIncomming: function() {
            gj("#sightCallOneOneIncommingForm").remove();
            jzStoreParam("isBusy", false, 15);
        },
        showCalling: function() {
            var $sightCallConnectionStatus = gj("#sightCallConnectionStatus");
            gj(".calleeAvatar", $sightCallConnectionStatus).html('<img src="/rest/weemo/getAvatarURL/' + sightcallExtension.callee  + '" alt="' + sightcallExtension.calleeFullName + '" />');
            gj(".inProgress", $sightCallConnectionStatus).text(weemoBundleData.exoplatform_videocall_calling_message);
        },
        showBusy: function() {
            if (jzGetParam("stTime","") !== "" || jzGetParam("rvTime","") !== "") {

                var busyForm
                  = '<div id="sightCallConnectionStatus" class="callling center">';
                busyForm += '  <div class="calleeAvatar">';
                busyForm += '    <img src="/rest/weemo/getAvatarURL/' + sightcallExtension.callee + '" alt="' + sightcallExtension.calleeFullName + '" />';
                busyForm += '  </div>';
                busyForm += '  <div class="calleeStatus">' + weemoBundleData.exoplatform_videocall_busy_message.replace('{0}', sightcallExtension.calleeFullName) + '</div>';
                busyForm += '  <div class="callingStt"><i class="iconCallDropped"></i><span>' + weemoBundleData.exoplatform_videocall_callDrop_message + '</span></div>';
                busyForm += '  <div class="actionBtn">';
                busyForm += '    <button class="btn btn-primary" onclick="javascript:location.reload();"><i class="uiIconWeemoWhite"></i>&nbsp;' + weemoBundleData.exoplatform_videocall_action_call +  '</button>';
                busyForm += '    <button class="btn"  onclick="javascript:window.close();">' + weemoBundleData.exoplatform_videocall_action_close + '</button>';
                busyForm += '  </div>';
                busyForm += '</div>';

                gj("#sightCallConnectionStatus").replaceWith(busyForm);

                this.clearHistory();
            }
        },
        showCallDroped: function(toUserId) {
            if (jzGetParam("stTime","") !== "" || jzGetParam("rvTime","") !== "") {

                var callDropForm =
                  '<div id="sightCallConnectionStatus" class="callling center">';
                callDropForm += '  <div class="calleeAvatar">';
                callDropForm += '    <img src="/rest/weemo/getAvatarURL/' + toUserId + '" alt="' + toUserId + '" />';
                callDropForm += '  </div>';
                callDropForm += '  <div class="callingStt"><i class="iconCallDropped"></i><span>' + weemoBundleData.exoplatform_videocall_callDrop_message + '</span></div>';
                callDropForm += '  <div class="actionBtn">';
                //callDropForm += '    <button class="btn btn-primary"><i class="uiIconWeemoWhite"></i></i>&nbsp;Call</button>';
                //callDropForm += '    <button class="btn" onclick="javascript:window.close();">Close</button>';
                callDropForm += '  </div>';
                callDropForm += '</div>';

                gj("#sightCallConnectionStatus").replaceWith(callDropForm);

                this.clearHistory();

                sightcallExtension.hangup();
                if (sightcallExtension.rtcc !== undefined)
                    sightcallExtension.rtcc.destroy();
            }
        },
        showGroupCallDroped: function(isSpace, spaceOrTeamName) {
            var groupCallDropForm =
              '<div id="sightCallConnectionStatus" class="callling center">';
            groupCallDropForm += '  <div class="calleeAvatar">';
            if (isSpace === "true") {
                groupCallDropForm += '    <img src="/rest/weemo/getSpaceAvartar/' + spaceOrTeamName + '" alt="' + spaceOrTeamName + '" />';
            } else {
                groupCallDropForm += '    <img src="/weemo-extension/img/TeamChatAvatar.png" alt="' + spaceOrTeamName + '" />';
            }
            groupCallDropForm += '  </div>';
            groupCallDropForm += '  <div class="callingStt"><i class="iconCallDropped"></i><span>' + weemoBundleData.exoplatform_videocall_callDrop_message + '</span></div>';
            groupCallDropForm += '  <div class="actionBtn">';
            groupCallDropForm += '  </div>';
            groupCallDropForm += '</div>';

            gj("#sightCallConnectionStatus").replaceWith(groupCallDropForm);

            this.clearHistory();
        },
        showNoAnswer: function() {
            var noAnserForm =
              '<div id="sightCallConnectionStatus" class="callling noAnswer center">';
            noAnserForm += '  <div class="calleeAvatar">';
            noAnserForm += '    <img src="/rest/weemo/getAvatarURL/' + sightcallExtension.callee + '" alt="' + sightcallExtension.calleeFullName + '" />';
            noAnserForm += '  </div>';
            noAnserForm += '  <div class="callingStt"><i class="iconCallIdle"></i><span>' + weemoBundleData.exoplatform_videocall_noAnswer_message + '</span></div>';
            noAnserForm += '  <div class="actionBtn">';
            noAnserForm += '    <button class="btn btn-primary" onclick="javascript:location.reload(true);"><i class="uiIconWeemoWhite"></i>&nbsp;' + weemoBundleData.exoplatform_videocall_action_call + '</button>';
            noAnserForm += '    <button class="btn" onclick="javascript:window.close();">' + weemoBundleData.exoplatform_videocall_action_close + '</button>';
            noAnserForm += '  </div>';
            noAnserForm += '</div>';

            gj("#sightCallConnectionStatus").replaceWith(noAnserForm);

            this.clearHistory();
        },
        showConnectionLost: function(toUserId) {
            if (jzGetParam("stTime","") !== "" || jzGetParam("rvTime","") !== "" ) {

                var connectionLostForm =
                  '<div id="sightCallConnectionStatus" class="callling center">';
                connectionLostForm += '  <div class="calleeAvatar">';
                connectionLostForm += '    <img src="/rest/weemo/getAvatarURL/' + toUserId + '" alt="' + toUserId + '" />';
                connectionLostForm += '  </div>';
                connectionLostForm += '  <div class="calleeStatus">' + weemoBundleData.exoplatform_videocall_connectionLost_message + '</div>';
                connectionLostForm += '  <div class="callingStt"><i class="iconCallDropped"></i><span>' + weemoBundleData.exoplatform_videocall_callDrop_message + '</span></div>';
                connectionLostForm += '  <div class="actionBtn">';
                if (sightcallExtension.callMode === "one" && sightcallExtension.callee === toUserId) {
                    connectionLostForm += '    <button class="btn btn-primary" onclick="javascript:location.reload(true);"><i class="uiIconWeemoWhite"></i>&nbsp;' + weemoBundleData.exoplatform_videocall_action_call + '</button>';
                } else if (sightcallExtension.callMode === "one_callee" && sightcallExtension.caller === toUserId) {
                    connectionLostForm += '    <button class="btn btn-primary" onclick="javascript:window.location.replace(\'/portal/intranet/videocallpopup?mode=one&callee=' + toUserId +  '\')"><i class="uiIconWeemoWhite"></i>&nbsp;' + weemoBundleData.exoplatform_videocall_action_call + '</button>';
                }
                connectionLostForm += '    <button class="btn" onclick="javascript:window.close();">' + weemoBundleData.exoplatform_videocall_action_close + '</button>';
                connectionLostForm += '  </div>';
                connectionLostForm += '</div>';

                gj("#sightCallConnectionStatus").replaceWith(connectionLostForm);

                this.clearHistory();
            }
        },
        showVideoToCenter: function() {
            var $sightCallConnectionStatus = gj("#sightCallConnectionStatus");
            var width = Math.floor(screen.width * 0.8 * 0.7 );
            var height = Math.floor(screen.height * 0.8 * 0.7 );
            gj(".calleeAvatar", $sightCallConnectionStatus).remove();
            gj(".inProgress", $sightCallConnectionStatus).remove();
            gj("#video-container").show();
            gj("#video-container").width(width);
            gj("#video-container").height(height);
        },
        showPluginNotInstalled: function(downloadUrl) {
            var pluginNotInstalledForm =
                                      '<div id="sightCallConnectionStatus">';
            pluginNotInstalledForm += '  <div class="pluginIntro">';
            pluginNotInstalledForm += '    <div class="info">';
            pluginNotInstalledForm += '      <i class="iconWarning"></i>';
            pluginNotInstalledForm += '      <p>';
            pluginNotInstalledForm += '        You will need to install the plugin to enable video calls.';
            pluginNotInstalledForm += '        <br/>';
            pluginNotInstalledForm += '        <a onclick="javascript: window.open(\'' + downloadUrl + '\',\'_black\'); window.close();" href="#" title="Download the plugin">Download the plugin</a>';
            pluginNotInstalledForm += '       </p>';
            pluginNotInstalledForm += '    </div>';
            pluginNotInstalledForm += '    <div class="instruction center">';
            if (navigator.appVersion.indexOf("Win")!=-1) {
                pluginNotInstalledForm += '      <img src="/weemo-extension/img/windowInstructionImg.png" onload="window.location.replace(\'' + downloadUrl + '\');" />';
            }
            else if (navigator.appVersion.indexOf("Mac")!=-1) {
                pluginNotInstalledForm += '      <img src="/weemo-extension/img/macInstructionImg.png" onload="window.location.replace(\'' + downloadUrl + '\');"  />';
            }
            pluginNotInstalledForm += '      <ul>';
            pluginNotInstalledForm += '        <li><span>1</span><br/>Open the plugin </li>';
            pluginNotInstalledForm += '        <li><span>2</span><br/>Follow the instructions</li>';
            pluginNotInstalledForm += '        <li><span>3</span><br/>Enjoy Video Calls</li>';
            pluginNotInstalledForm += '      </ul>';
            pluginNotInstalledForm += '    </div>';
            pluginNotInstalledForm += '  </div>';
            pluginNotInstalledForm += '</div>';

            gj("#sightCallConnectionStatus").replaceWith(pluginNotInstalledForm);

            this.clearHistory();
        },
        storeLastSentMessage: function(fromUser, toUser, callMode, messageType) {
            jzStoreParam("stCallMode", callMode, 14400);
            jzStoreParam("stMessageType", messageType, 14400);
            jzStoreParam("stToUser", toUser, 14400);
            jzStoreParam("stFromUser", fromUser, 14400);
            jzStoreParam("stTime", Math.floor(new Date() / 1000), 14400);
        },
        storeLastReceivedMessage: function(message) {
            jzStoreParam("rvCallMode", message.callMode, 14400);
            jzStoreParam("rvMessageType", message.type, 14400);
            jzStoreParam("rvToUser", message.toUser, 14400);
            jzStoreParam("rvFromUser", message.fromUser, 14400);
            jzStoreParam("rvTime", Math.floor(new Date() / 1000), 14400);
            console.log("received " + message.fromUser + "  " + message.type);
        },
        clearHistory: function() {
            localStorage.removeItem("stCallMode");
            localStorage.removeItem("stMessageType");
            localStorage.removeItem("stToUser");
            localStorage.removeItem("stFromUser");
            localStorage.removeItem("stTime");
            localStorage.removeItem("rvCallMode");
            localStorage.removeItem("rvMessageType");
            localStorage.removeItem("rvToUser");
            localStorage.removeItem("rvFromUser");
            localStorage.removeItem("rvTime");
        },
        isCallerReceivingCallingTimeout: function() {
            var currentTime = Math.floor(new Date() / 1000);
            var lastSentTime = Math.floor(jzGetParam("stTime", 0));
            return (currentTime >= lastSentTime + 15);
        },
        isCalleeAnswerTimeout: function() {
            var currentTime = Math.floor(new Date() / 1000);
            var lastReceivedTime = Math.floor(jzGetParam("rvTime", 0));
            return (currentTime >= lastReceivedTime + 15);
        },
        isCalleeConnectingTimeout: function() {
            var currentTime = Math.floor(new Date() / 1000);
            var lastReceivedTime = Math.floor(jzGetParam("rvTime", 0));
            return (currentTime >= lastReceivedTime + 30);
        },
        isBeingOnPopup: function() {
            return (gj("#sightcall-status").length > 0);
        }
    };
    return SightCallNotification;
})(gj, webNotifications, cCometD);
