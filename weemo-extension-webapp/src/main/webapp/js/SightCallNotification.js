(function(gj, webNotif, cCometD) {

    SightCallNotification = {
        initCometd: function(eXoUser, eXoToken, contextName) {
            var me = SightCallNotification;
            if (!me.Cometd) me.Cometd = cCometD;
            var loc = window.location;
            me.Cometd.configure({
                url: loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '') + '/' + contextName + '/cometd',
                'exoId': eXoUser,
                'exoToken': eXoToken,
                logLevel: 'debug'
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

                this.sendMessage(toUser, "calling", "one");


                window.setTimeout(function() {
                    if (SightCallNotification.isCalleeAnswerTimeout()) {
                        SightCallNotification.showNoAnswer();
                    }
                }, 15000);
            }
        },
        sendDecline: function(toUser) {
            if (!this.isBeingOnPopup()) {

            // Hide imcomming message

            // Update state

            // Send
                this.sendMessage(toUser, "decline", "one");
            }
        },

        sendAccepting: function(toUser) {
            if (!this.isBeingOnPopup()) {
                this.sendMessage(toUser, "accepted", "one");
            }
        },
        sendMute: function(toUser) {
            if (!this.isBeingOnPopup()) {
                this.sendMessage(toUser, "mute", "one");
            }
        },
        sendPluginNotInstalled: function(toUser) {
            if (this.isBeingOnPopup() && jzGetParam("stMessageType", "") === "accepted" && jzGetParam("rvMessageType","") === "calling") {
                this.sendMessage(toUser, "notinstalled", "one");
            }
        },
        sendReady: function(toUser) {
            if (this.isBeingOnPopup()) {
                this.sendMessage(toUser, "ready", "one");
            }
        },
        sendBusy: function(toUser) {
            if (!this.isBeingOnPopup()) {
              this.sendMessage(toUser, "busy", "one");
            }
        },
        sendConnectionLost: function(toUser) {
            if (this.isBeingOnPopup()) {
               this.sendMessage(toUser, "connectionlost", "one");
            }
        },
        sendMessage: function(toUser, messageType, callMode) {

            // Send message
            gj.ajax("/rest/weemo/sendMessage/" + toUser + "/" + messageType + "/" + callMode)
                .done(function() {
                    SightCallNotification.storeLastSentMessage(SightCallNotification.currentUser, toUser, callMode, messageType);
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
            }
        },
        receivingMute: function(message) {
            if (this.isBeingOnPopup() && !this.isCallerReceivingCallingTimeout() && jzGetParam("stMessageType", "") === "calling") {
                SightCallNotification.showNoAnswer();

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
        receivingReady: function(message) {
            if (this.isBeingOnPopup() && jzGetParam("rvMessageType", "") === "accepted" && jzGetParam("stMessageType","") === "calling") {
                if (!this.isCalleeConnectingTimeout()) {
                    sightcallExtension.createWeemoCall(message.fromUser, message.fromUser);
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
            incommingHtml += '    		<img src="/weemo-extension/img/MaryJane36x36.png" alt="#" />';
            incommingHtml += '    	</div>';
            incommingHtml += '    	<div class="name pull-left">' + fromFullName + ' Calling</div>';
            incommingHtml += '    </div>';
            incommingHtml += '    <div class="actionBtn center">';
            incommingHtml += '    	<a class="btn btn-primary video" href="#" id ="sightCallAcceptButton"><i class="uiIconWeemoWhite"></i>&nbsp;Accept</a>';
            incommingHtml += '    	<a class="btn ignore" href="#" id="sightCallDecleinButton"><i class="iconCallDecline"></i>&nbsp;Decline</a>';
            incommingHtml += '    </div>';
            incommingHtml += '	</div>';
            gj('body').append(incommingHtml);

            gj("#sightCallDecleinButton").click(function(e) {
                SightCallNotification.sendDecline(fromUser);
                SightCallNotification.hideIncomming();
            });

            gj("#sightCallAcceptButton").click(function(e) {
                weemoExtension.showVideoPopup('/portal/intranet/videocallpopup?caller=' + fromUser + '&mode=one_callee');

                SightCallNotification.sendAccepting(fromUser);
                SightCallNotification.hideIncomming();
            });

            window.setTimeout(function() {
                SightCallNotification.hideIncomming();
            }, 150000);

        },
        hideIncomming: function() {
            gj("#sightCallOneOneIncommingForm").remove();
            jzStoreParam("isBusy", false, 15);

        },
        showCalling: function() {
            var callingForm =
                             '<div id="sightCallConnectionStatus" class="callling center">';
            callingForm  +=  '  <div class="calleeAvatar">';
            callingForm  +=  '    <img src="/rest/weemo/getAvatarURL/' + sightcallExtension.callee  + '" alt="' + sightcallExtension.calleeFullName + '" />';
            callingForm  +=  '  </div>';
            callingForm  +=  '<div class="inProgress">Calling...</div>';

            gj("#sightCallConnectionStatus").replaceWith(callingForm);

        },
        showBusy: function() {
            var busyForm =
                         '<div id="sightCallConnectionStatus" class="callling center">';
            busyForm +=  '  <div class="calleeAvatar">';
            busyForm +=  '    <img src="/rest/weemo/getAvatarURL/' + sightcallExtension.callee  + '" alt="' + sightcallExtension.calleeFullName + '" />';
            busyForm +=  '  </div>';
            busyForm +=  '  <div class="calleeStatus">' + sightcallExtension.calleeFullName + ' is busy</div>';
            busyForm +=  '  <div class="callingStt"><i class="iconCallDropped"></i>Call dropped</div>';
            busyForm +=  '  <div class="actionBtn">';
            busyForm +=  '    <button class="btn btn-primary"><i class="uiIconWeemoWhite"></i>Call</button>';
            busyForm +=  '    <button class="btn">Close</button>';
            busyForm +=  '  </div>';
            busyForm +=  '</div>';

            gj("#sightCallConnectionStatus").replaceWith(busyForm);

            this.clearHistory();
        },
        showCallDroped: function(toUserId) {
            var callDropForm =
                             '<div id="sightCallConnectionStatus" class="callling center">';
            callDropForm +=  '  <div class="calleeAvatar">';
            callDropForm +=  '    <img src="/rest/weemo/getAvatarURL/' + toUserId  + '" alt="' + toUserId + '" />';
            callDropForm +=  '  </div>';
            callDropForm +=  '  <div class="callingStt"><i class="iconCallDropped"></i>Call dropped</div>';
            callDropForm +=  '  <div class="actionBtn">';
            callDropForm +=  '    <button class="btn btn-primary"><i class="uiIconWeemoWhite"></i>Call</button>';
            callDropForm +=  '    <button class="btn">Close</button>';
            callDropForm +=  '  </div>';
            callDropForm +=  '</div>';

            gj("#sightCallConnectionStatus").replaceWith(callDropForm);

            this.clearHistory();
        },
        showNoAnswer: function() {
            var noAnserForm  =
                           '<div id="sightCallConnectionStatus" class="callling center">';
            noAnserForm += '  <div class="calleeAvatar">';
            noAnserForm += '    <img src="/rest/weemo/getAvatarURL/' + sightcallExtension.callee  + '" alt="' + sightcallExtension.calleeFullName + '" />';
            noAnserForm += '  </div>';
            noAnserForm += '  <div class="callingStt"><i class="iconCallIdle"></i>No answer</div>';
            noAnserForm += '  <div class="actionBtn">';
            noAnserForm += '    <button class="btn btn-primary"><i class="uiIconWeemoWhite"></i>Call</button>';
            noAnserForm += '    <button class="btn">Close</button>';
            noAnserForm += '  </div>';
            noAnserForm += '</div>';

            gj("#sightCallConnectionStatus").replaceWith(noAnserForm);

            this.clearHistory();
        },
        showConnectionLost: function(toUserId) {
            var connectionLostForm =
                                  '<div id="sightCallConnectionStatus" class="callling center">';
            connectionLostForm += '  <div class="calleeAvatar">';
            connectionLostForm += '    <img src="/rest/weemo/getAvatarURL/' + toUserId  + '" alt="' + toUserId + '" />';
            connectionLostForm += '  </div>';
            connectionLostForm += '  <div class="calleeStatus">Connection Lost</div>';
            connectionLostForm += '  <div class="callingStt"><i class="iconCallDropped"></i>Call dropped</div>';
            connectionLostForm += '  <div class="actionBtn">';
            connectionLostForm += '    <button class="btn btn-primary"><i class="uiIconWeemoWhite"></i>Call</button>';
            connectionLostForm += '    <button class="btn">Close</button>';
            connectionLostForm += '  </div>';
            connectionLostForm += '</div>';

            gj("#sightCallConnectionStatus").replaceWith(connectionLostForm);

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
        isConnectingTimeout: function() {
            var currentTime = Math.floor(new Date() / 1000);
            var lastReceivedTime = Math.floor(jzGetParam("stTime", 0));
            return (currentTime >= lastReceivedTime + 30);
        },
        isBeingOnPopup: function() {
            return (jqchat("#sightcall-status").length > 0);
        }

    };
    return SightCallNotification;
})(gj, webNotifications, cCometD);
