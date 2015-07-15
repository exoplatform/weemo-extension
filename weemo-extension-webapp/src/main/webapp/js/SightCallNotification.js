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
                    SightCallNotification.showConnectionLost();
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
              this.showIncomming(message.fromUser);

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
            if (this.isBeingOnPopup() && jzGetParam("stMessageType", "") === "calling" && jzGetParam("rvMessageType","") === "accepted") {
                SightCallNotification.showCallDroped();

                SightCallNotification.storeLastReceivedMessage(message);

            }
        },
        receivingConnectionLost: function(message) {
            if (this.isBeingOnPopup() && jzGetParam("stMessageType", "") === "calling" && jzGetParam("rvMessageType","") === "accepted") {
                SightCallNotification.showConnectionLost();
                SightCallNotification.storeLastReceivedMessage(message);
            }
        },
        receivingReady: function(message) {
            if (this.isBeingOnPopup() && jzGetParam("rvMessageType", "") === "accepted" && jzGetParam("stMessageType","") === "calling") {
                if (!this.isCalleeConnectingTimeout()) {
                    sightcallExtension.createWeemoCall(message.fromUser, message.fromUser);
                } else if (this.isCalleeConnectingTimeout()) {
                    SightCallNotification.showConnectionLost();
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
        showIncomming: function(fromUser) {
            if (window.location.href.indexOf("videocallpopup") > -1) return; // Not show this on popup
            jzStoreParam("isBusy", true, 15);

            var incommingHtml = '<div id="sightCallOneOneIncommingForm" class=" incoming-call" style="position:fixed; top:100px;cursor: move;">';
            incommingHtml += '    <h4 class="name">' + fromUser + ' Calling</h4>';
            incommingHtml += '    <div class="picto"></div>';
            incommingHtml += '    <div class="button-actions">';
            incommingHtml += '        <div class="container">';
            incommingHtml += '            <a class="video" href="#" id ="sightCallAcceptButton">Accept</a>';
            incommingHtml += '        </div>';
            incommingHtml += '        <div class="container">';
            incommingHtml += '            <a class="ignore" href="#" id="sightCallDecleinButton">decline</a>';
            incommingHtml += '        </div>';
            incommingHtml += '        <div class="container">';
            incommingHtml += '            <a class="hangup" href="#"></a>';
            incommingHtml += '        </div>';
            incommingHtml += '    </div>';
            incommingHtml += '</div>';
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
            }, 15000);

        },
        hideIncomming: function() {
            gj("#sightCallOneOneIncommingForm").remove();
            jzStoreParam("isBusy", false, 15);

        },
        showBusy: function() {
            gj("#sightCallConnectionStatus").text(message.fromUser + " is Busy");
            this.clearHistory();
        },
        showCallDroped: function() {
            this.clearHistory();
        },
        showNoAnswer: function() {
            gj("#sightCallConnectionStatus").text("No answer");
            this.clearHistory();
        },
        showConnectionLost: function() {
            gj("#sightCallConnectionStatus").text("Connection Lost");
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
