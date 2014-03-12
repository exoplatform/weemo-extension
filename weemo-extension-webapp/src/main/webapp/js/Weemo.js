/*************************************************************************
 * 
 * WEEMO INC.
 * 
 *  Weemo.js - v 5.1.2507
 *  [2013] Weemo Inc.
 *  All Rights Reserved.
 * 
 * NOTICE:  All information contained herein is, and remains
 * the property of Weemo Inc.
 * The intellectual and technical concepts contained
 * herein are proprietary to Weemo Inc.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Weemo Inc.
 */

/*jslint browser: true*/
/*jslint bitwise: true*/
/*jslint evil: true*/
/*jslint eqeq: true*/
/*global console:true */
/*global XDomainRequest:true */
/*global XMLHttpRequest:true */
/*global alert:true */
/*global MozWebSocket:true */
/*global WebSocket:true*/
/*global DOMParser:true*/
/*global ActiveXObject:true*/
/*global confirm:true*/
/*global JsSIP:true*/
// Utils
if (!Object.create) {
    Object.create = (function(){
        function F(){}

        return function(o){
            if (arguments.length != 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F();
        };
    })();
}
var WeemoUtils = function () {
    "use strict";
    this.strpos = function (haystack, needle, offset) {
        var i = String(haystack).indexOf(needle, (offset || 0));
        if (i === -1) { i = false; }
        return i;
    };
    this.trim = function (str, charlist) {
        var i = 0,
            whitespace,
            l;
        str += '';
        if (!charlist) { // default list
            whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
        } else {
            // preg_quote custom list
            charlist += '';
            whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
        }
        l = str.length;
        for (i = 0; i < l; i += 1) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(i);
                break;
            }
        }
        l = str.length;
        for (i = l - 1; i >= 0; i -= 1) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(0, i + 1);
                break;
            }
        }
        return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
    };
    this.sha1 = function (str) {
        var rotate_left = function (n, s) {
            var t4 = (n << s) | (n >>> (32 - s));
            return t4;
        },
            cvt_hex = function (val) {
                var strr = "",
                    i,
                    v;
                for (i = 7; i >= 0; i -= 1) {
                    v = (val >>> (i * 4)) & 0x0f;
                    strr += v.toString(16);
                }
                return strr;
            },
            blockstart,
            i,
            j,
            W = new Array(80),
            H0 = 0x67452301,
            H1 = 0xEFCDAB89,
            H2 = 0x98BADCFE,
            H3 = 0x10325476,
            H4 = 0xC3D2E1F0,
            A,
            B,
            C,
            D,
            E,
            temp,
            word_array = [],
            str_len;
        str = this.utf8_encode(str);
        str_len = str.length;
        for (i = 0; i < str_len - 3; i += 4) {
            j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
            word_array.push(j);
        }
        switch (str_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
            break;
        }
        word_array.push(i);
        while ((word_array.length % 16) != 14) {
            word_array.push(0);
        }
        word_array.push(str_len >>> 29);
        word_array.push((str_len << 3) & 0x0ffffffff);
        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
            for (i = 0; i < 16; i += 1) {
                W[i] = word_array[blockstart + i];
            }
            for (i = 16; i <= 79; i += 1) {
                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
            }
            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;
            for (i = 0; i <= 19; i += 1) {
                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 20; i <= 39; i += 1) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 40; i <= 59; i += 1) {
                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 60; i <= 79; i += 1) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            H0 = (H0 + A) & 0x0ffffffff;
            H1 = (H1 + B) & 0x0ffffffff;
            H2 = (H2 + C) & 0x0ffffffff;
            H3 = (H3 + D) & 0x0ffffffff;
            H4 = (H4 + E) & 0x0ffffffff;
        }
        temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
        return temp.toLowerCase();
    };
    this.utf8_decode = function (str_data) {
        var tmp_arr = [],
            i = 0,
            ac = 0,
            c1 = 0,
            c2 = 0,
            c3 = 0,
            c4 = 0;
        str_data += '';
        while (i < str_data.length) {
            c1 = str_data.charCodeAt(i);
            if (c1 <= 191) {
                ac += 1;
                tmp_arr[ac] = String.fromCharCode(c1);
                i += 1;
            } else if (c1 <= 223) {
                c2 = str_data.charCodeAt(i + 1);
                ac += 1;
                tmp_arr[ac] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                i += 2;
            } else if (c1 <= 239) {
                c2 = str_data.charCodeAt(i + 1);
                c3 = str_data.charCodeAt(i + 2);
                ac += 1;
                tmp_arr[ac] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            } else {
                c2 = str_data.charCodeAt(i + 1);
                c3 = str_data.charCodeAt(i + 2);
                c4 = str_data.charCodeAt(i + 3);
                c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
                c1 -= 0x10000;
                ac += 1;
                tmp_arr[ac] = String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF));
                ac += 1;
                tmp_arr[ac] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));
                i += 4;
            }
        }
        return tmp_arr.join('');
    };
    this.utf8_encode = function (argString) {
        if (argString === null || argString === undefined) {
            return "";
        }
        var string = argString,
            utftext = '',
            start,
            end,
            stringl = 0,
            n,
            c1,
            enc,
            c2;

        start = end = 0;
        stringl = string.length;
        for (n = 0; n < stringl; n += 1) {
            c1 = string.charCodeAt(n);
            enc = null;
            if (c1 < 128) {
                end += 1;
            } else if (c1 > 127 && c1 < 2048) {
                enc = String.fromCharCode(
                    (c1 >> 6)        | 192,
                    (c1        & 63) | 128
                );
            } else if (c1 & 0xF800 != 0xD800) {
                enc = String.fromCharCode(
                    (c1 >> 12)       | 224,
                    ((c1 >> 6)  & 63) | 128,
                    (c1        & 63) | 128
                );
            } else { // surrogate pairs
                if (c1 & 0xFC00 != 0xD800) { throw new RangeError("Unmatched trail surrogate at " + n); }
                c2 = string.charCodeAt(++n);
                if (c2 & 0xFC00 != 0xDC00) { throw new RangeError("Unmatched lead surrogate at " + (n - 1)); }
                c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
                enc = String.fromCharCode(
                    (c1 >> 18)       | 240,
                    ((c1 >> 12) & 63) | 128,
                    ((c1 >> 6)  & 63) | 128,
                    (c1        & 63) | 128
                );
            }
            if (enc !== null) {
                if (end > start) {
                    utftext += string.slice(start, end);
                }
                utftext += enc;
                start = end = n + 1;
            }
        }
        if (end > start) {
            utftext += string.slice(start, stringl);
        }
        return utftext;
    };
};
/**
* @class Weemo
* @classdesc This javascript interacts with your application â€“ the host app â€“ and allows you to initiate peer to peer or group video chat from any browser and then be able to share your screen or transfer files.
* @version 5.1.2507
* @author julien bunel
* @constructor
* @param {string} webappid - value of the web application referer to set.
* @param {string} token - value to identify the session, it will be auto filed by <a href="https://github.com/weemo/User-Provisioning/wiki#-authentication-methods-">Auth process</a>. If you are in POC process, please enter your UID. If weemoType = 'external'[1], please enter the UID of the host user. <br /><br /> Token must respect naming rules: <br /> Min size = 6 characters; <br /> Max size = 90 characters; <br /> Authorized characters: UTF8 - unicode - Latin basic, except: & " # \ % ? [space] <br /> Case sensitive, no space character. <br /> [1]: Host must be authenticated before successfuly connect an external attendee. <br />
* @param {string} weemotype - this variable describes the type of user, it must be one of the following: "internal" or "external"
* @param {string} [hap] - this variable takes the token value of the platform ("prod/", "ppr/", "qualif/", "dev/"). if you don't set a platform, the platform is set by default at "prod/"
* @param {string} [debuglevel] - value of the debug level to set. 0 => No logs, 1 => First level of logs, 2 => First level + JsSIP logs, 3 => 2 + sip traces
* @param {string} [displayname] - value of the display name to set. <br /><br /> Display Name must respect naming rules: <br /> String â€“ max 127 characters <br /> Not Null <br /> UTF-8 Characters execpt: " ' <br />
* @param {bool}   [usejquery] - flag to use jquery or not (longpolling mode)
* @param {bool}   [pDefaultStyle] - Load default styles
*
*/
var Weemo = function (pAppId, pToken, pType, pHap, pDebugLevel, pDisplayName, pUseJquery, pDefaultStyle) {
    //"use strict";
    // Private properties
    var version = "5.1.2507",
        state = "NOT_CONNECTED",
        browser = "",
        browserVersion = "",
        os = "Unknown OS",
        protocol = "weemodriver-protocol",
        wsUri = "wss://localhost:34679",
        longpollUri = "https://localhost:34679",
        self = this,
        longpollId = null,
        token = pToken,
        webAppId = (pAppId != '' && pAppId != undefined) ? pAppId : "1033a56f0e68",
        endpointUrl = "/rest/weemo/auth/",
        force = false,
        debugLevel = 0,
        weemoType = pType,
        hap = (pHap != '' && pHap != undefined) ? pHap : 'ppr/',
        displayName = '',
        downloadTimeout = null,
        downloadTimeoutValue = 0,
        pollingTimeout = 16000,
        messageTimeout = 5000,
        downloadUrl="https://download.weemo.com/file/release/55",
        websock,
        connectionDelay = 2000,
        connectTimeout = null,
        callObjects = [],
        utils = new WeemoUtils(),
        calledContact = '',
        forceClose = false,
        debug = function (txt) { if (window.console && debugLevel > 0) { console.log(txt); } },
        mobile,
        screenSize,
        osVersion,
        mode="webrtc_wd",
        connectWith,
        attempt = 0,
        wdVersion,
        useJquery = (pUseJquery !== undefined) ? pUseJquery : false,
        loadCss = (pDefaultStyle !== undefined) ? pDefaultStyle : true,
        uid,
        password,
        providerid,
        domainid,
        localAddress,
        sid,
        configuration,
        weemoApp,
        globalcall,
        callout = 0,
        localusername,
        techdomain,
        server,
        name,
        latency = 0,
        reports = [],
        conf_level,
        domains = new Array(),
        timestampPrev = 0,
        bytesPrev = 0,
        hash_type,
        federation,
        loadDefaultStyle = function() {
            var headHTML = document.getElementsByTagName('head')[0].innerHTML,
                test = hap.substring(0,3);
            switch(test) {
                case "dev":
                    headHTML += '<link type="text/css" rel="stylesheet" href="https://static-dev.weemo.com/css/weemo.css">';
                    break;
                case "qua":
                    headHTML += '<link type="text/css" rel="stylesheet" href="https://static-qualif.weemo.com/css/weemo.css">';
                    break;
                case "ppr":
                    headHTML += '<link type="text/css" rel="stylesheet" href="https://static-ppr.weemo.com/css/weemo.css">';
                    break;
                default:
                    headHTML += '<link type="text/css" rel="stylesheet" href="https://static.weemo.com/css/weemo.css">';
            }
            document.getElementsByTagName('head')[0].innerHTML = headHTML;
        },

        webRTCCapabilities = function () {
            var WebRTC = Object.create(null),
                response;
            // getUserMedia
            if (window.navigator.webkitGetUserMedia) {
                WebRTC.getUserMedia = window.navigator.webkitGetUserMedia.bind(navigator);
            } else if (window.navigator.mozGetUserMedia) {
                WebRTC.getUserMedia = window.navigator.mozGetUserMedia.bind(navigator);
            } else if (window.navigator.getUserMedia) {
                WebRTC.getUserMedia = window.navigator.getUserMedia.bind(navigator);
            }

            // RTCPeerConnection
            if (window.webkitRTCPeerConnection) {
                WebRTC.RTCPeerConnection = window.webkitRTCPeerConnection;
            } else if (window.mozRTCPeerConnection) {
                WebRTC.RTCPeerConnection = window.mozRTCPeerConnection;
            } else if (window.RTCPeerConnection) {
                WebRTC.RTCPeerConnection = window.RTCPeerConnection;
            }

            // RTCSessionDescription
            if (window.webkitRTCSessionDescription) {
                WebRTC.RTCSessionDescription = window.webkitRTCSessionDescription;
            } else if (window.mozRTCSessionDescription) {
                WebRTC.RTCSessionDescription = window.mozRTCSessionDescription;
            } else if (window.RTCSessionDescription) {
                WebRTC.RTCSessionDescription = window.RTCSessionDescription;
            }

            // isSupported attribute.
            if (WebRTC.getUserMedia && WebRTC.RTCPeerConnection && WebRTC.RTCSessionDescription) {
                response = true;
            } else {
                response = false;
            }
            return response;
        },
        pingMgmt = function () {
            var xdr = getXDomainRequest(),
                url,
                action,
                params;
            xdr.onload = function () {
            	if(xdr.status === 200) {
	                action = "pingOk";
	                params = Object.create(null);
	                sm(action, params);
            	} else {
            		action = "pingNok";
                    params = Object.create(null);
                    sm(action, params);
            	}
            };
            xdr.onerror = function () {
                action = "pingNok";
                params = Object.create(null);
                sm(action, params);
            };
            xdr.ontimeout = function () {
                action = "pingNok";
                params = Object.create(null);
                sm(action, params);
            };
            xdr.onprogress = function () { };

            switch (hap) {
            case "dev/":
                url = "https://oauth-dev.weemo.com";
                break;

            case "qualif/":
                url = "https://oauth-qualif.weemo.com";
                break;

            case "ppr/":
                url = "https://oauth-ppr.weemo.com";
                break;

            default:
                url = "https://oauth.weemo.com";
            }
            xdr.open("GET", url);
            xdr.timeout = 16000;
            xdr.send();
        },
        callreport = function(ev, args) {
            var xdr = getXDomainRequest(),
                url,
                hardware_details = "desktop",
                latency_result = "";

            xdr.timeout = 16000;
            xdr.onload = function () {
                debug("---------------------------");
                debug("Call report ok => " + ev);
                debug("---------------------------");

            };
            xdr.onerror = function () {
                debug("---------------------------");
                debug("Call report error => " + ev);
                debug("---------------------------");
            };
            xdr.ontimeout = function () {
                debug("---------------------------");
                debug("Call report timeout => " + ev);
                debug("---------------------------");
            };
            switch (hap) {
                case "dev/":
                    url = "https://oauth-dev.weemo.com/mgmt/call/report?sid="+sid;
                    break;

                case "qualif/":
                    url = "https://oauth-qualif.weemo.com/mgmt/call/report?sid="+sid;
                    break;

                case "ppr/":
                    url = "https://oauth-ppr.weemo.com/mgmt/call/report?sid="+sid;
                    break;

                default:
                    url = "https://oauth.weemo.com/mgmt/call/report?sid="+sid;
            }

            switch (ev) {
                case 'start':
                    url +=  "&case=start&callid=" + args.callid + "&uri=" + args.uri + "&call_type=" + args.call_type+ "&displayname=" + args.displayname + "&call_origin=" + args.call_origin + "&voutres=" + args.voutres + "&voutrr=" + args.voutrr + "&voutgrab=" + args.voutgrab + "&vinres=" + args.vinres + "&vinrr=" + args.vinrr + "&vinlp=" + args.vinlp + "&ainlp=" + args.ainlp + "&inbw=" + args.inbw + "&outbw=" + args.outbw + "&video_on=1&video_off=0&sharing_out_off=0&sharing_out_on=0";
                    break;
                case 'update':
                    url +=  "&case=update&callid=" + args.callid + "&voutres=" + args.voutres + "&voutrr=" + args.voutrr + "&voutgrab=" + args.voutgrab + "&vinres=" + args.vinres + "&vinrr=" + args.vinrr + "&vinlp=" + args.vinlp + "&ainlp=" + args.ainlp + "&inbw=" + args.inbw + "&outbw=" + args.outbw + "&video_on=1&video_off=0&sharing_out_off=0&sharing_out_on=0";
                    break;
                case 'end':
                    url +=  "&case=end&callid=" + args.callid + "&call_duration=" + args.call_duration + "&voutres=" + args.voutres + "&voutrr=" + args.voutrr + "&voutgrab=" + args.voutgrab + "&vinres=" + args.vinres + "&vinrr=" + args.vinrr + "&vinlp=" + args.vinlp + "&ainlp=" + args.ainlp + "&inbw=" + args.inbw + "&outbw=" + args.outbw + "&video_on=1&video_off=0&sharing_out_off=0&sharing_out_on=0";
                    break;
                default:
            }
            xdr.open("GET", url);
            xdr.send();
        },
        random = function (length) {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
                string_length = length,
                randomstring = '',
                charCount = 0,
                numCount = 0,
                i,
                rnum;

            for (i = 0; i < string_length; i += 1) {
                // If random bit is 0, there are less than 3 digits already saved, and there are not already 5 characters saved, generate a numeric value. 
                if ((Math.floor(Math.random() * 2) === 0) && (numCount < 3 || charCount >= 5)) {
                    rnum = Math.floor(Math.random() * 10);
                    randomstring += rnum;
                    numCount += 1;
                } else {
                    // If any of the above criteria fail, go ahead and generate an alpha character from the chars string
                    rnum = Math.floor(Math.random() * chars.length);
                    randomstring += chars.substring(rnum, rnum + 1);
                    charCount += 1;
                }
            }
            return randomstring;
        },
        startup = function () {
            var xdr = getXDomainRequest(),
                url,
                hardware_details = "desktop",
                latency_result = "";

            xdr.timeout = 16000;
            xdr.onload = function () {
                action = "startupOk";
                params = Object.create(null);
                sm(action, params);
            };
            xdr.onerror = function () {
                debug("---------------------------");
                debug("Startup");
                debug(xdr.responseText);
                debug("---------------------------");

                action = "startupNok";
                params = Object.create(null);
                sm(action, params);
            };
            xdr.ontimeout = function () {
                debug("---------------------------");
                debug("Startup");
                debug(xdr.responseText);
                debug("---------------------------");

                action = "startupNok";
                params = Object.create(null);
                sm(action, params);
            };
            switch (hap) {
            case "dev/":
                url = "https://oauth-dev.weemo.com/mgmt/oss/startup";
                break;

            case "qualif/":
                url = "https://oauth-qualif.weemo.com/mgmt/oss/startup";
                break;

                case "ppr/":
                url = "https://oauth-ppr.weemo.com/mgmt/oss/startup";
                break;

            default:
                url = "https://oauth.weemo.com/mgmt/oss/startup";
            }
            if (mobile === true) { hardware_details = "mobile"; }
            url += "?sid=" + sid;
            url +=  "&os_details=" + os + "%20" + osVersion + "&hardware_details=" + hardware_details + "&latency_result=" + latency + "&browser_ua=" + browser + "%20" + browserVersion + "&init_dn=" + displayName + "&js_version=" + version + "&url_referer=" + document.URL + "&webrtc=" + true + "&hapoverride=" + hap + "&pub_ip=" + localAddress;
            xdr.open("GET", url);
            xdr.send();
        },
        weemoNewRTCSession = function (call, remote) {
            // Test if a call already exist
            if(globalcall === null || globalcall === undefined) {
                globalcall = call;

                var wc;
                if(globalcall.direction === "outgoing") {
                    var extraDN = globalcall.request.extraHeaders;
                    var dn;

                    for(var i = 0; i < extraDN.length; i++) {
                        if(extraDN[i].substring(0, 14) == "X-display-name") {
                            dn = extraDN[i].substring(16);
                        }
                    }

                    wc = new WeemoCall(globalcall.id, globalcall.direction,dn, self);
                    call_status = "proceeding";
                } else {
                    wc = new WeemoCall(globalcall.id, globalcall.direction, globalcall.remote_identity.display_name, self);
                    call_status = "incoming";
                }

                callObjects[globalcall.id] = wc;
                callObjects[globalcall.id].status.call = call_status;
                callObjects[globalcall.id].status.video_remote = 'stop';
                callObjects[globalcall.id].status.video_local = 'stop';
                callObjects[globalcall.id].status.sound = 'mute';

                if (typeof self.onCallHandler === "function") { self.onCallHandler(callObjects[globalcall.id], {type : "webRTCcall", status :  callObjects[globalcall.id].status.call}); }

                var mute = false,
                    novideo = false,
                    videobox,
                    style = document.createElement('style'),
                    remoteView,
                    selfView = document.createElement('video'),
                    buttons_bar = document.createElement('div'),
                    p,
                    w,
                    m,
                    button_nopip = document.createElement('div'),
                    button_mute = document.createElement('div'),
                    button_hangup = document.createElement('div'),
                    button_novideo = document.createElement('div'),
                    watermark = document.createElement('div'),
                    statsInterval,
                    callReportStartTimeout,
                    callReportUpdateTimeout,
                    callReportUpdateInterval,
                    durationInterval,
                    sipErrorCauses = {
                        busy: { value: 'Busy', codes:[486, 600], bits: "" },
                        rejected: { value: 'Rejected', codes: [403, 603], bits: "" },
                        redirected: { value: 'Redirected', codes: [300, 301, 302, 305, 380], bits: "" },
                        unavailable: { value: 'Unavailable', codes: [480, 410, 408, 430], bits: "" },
                        not_found: { value:'Not Found', codes: [404, 604], bits: "" },
                        address_incomplete: { value:'Address Incomplete', codes: [484], bits:"" },
                        incompatible_sdp: { value:'Incompatible SDP', codes: [488, 606], bits:"" },
                        authentication_error: { value: 'Authentication Error', codes:[401, 407], bits:"" }
                    },
                    endReport = {
                        error_code: 0,
                        state: "",
                        release_cause: "",
                        referer_uri: globalcall.remote_identity.uri.user+"@"+globalcall.remote_identity.uri.host,
                        call_duration: 0,
                        ice_candidate: 0,
                        sample_duration: 0
                    },
                    call_state = "",
                    call_duration = 0,
                    ice_candidate = "",
                    candidateDefined = false,
                    pipActive = true;

                style.type = 'text/css';
                style.innerHTML = '.userSelectNone { user-select: none; -o-user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; cursor:default!important; }';
                document.getElementsByTagName('head')[0].appendChild(style);


                if(globalcall.direction === "incoming") {
                    call_state = "proceeding";
                } else {
                    call_state = "initiate";
                }

                globalcall.on('started', function (e) {
                    debug('event started');

                    call_state = "start";

                    // Create weemo-videobox element
                    videobox = document.createElement('div');
                    document.body.appendChild(videobox);
                    videobox.setAttribute('id', 'weemo-videobox');
                    videobox.onmouseover = function () {
                        document.getElementById('weemo-buttonsbar').style.display = 'block';
                    };
                    videobox.onmouseout = function () {
                        document.getElementById('weemo-buttonsbar').style.display = 'none';
                    };
                    //////////////////////////////////

                    // Create weemo-remotevideo element
                    remoteView = document.createElement('video');
                    videobox.appendChild(remoteView);
                    remoteView.setAttribute('id', 'weemo-remotevideo');
                    remoteView.setAttribute('autoplay', 'autoplay');
                    remoteView.addEventListener( "loadedmetadata", function (e) {
                        var videoBoxWidth = parseInt(document.getElementById('weemo-videobox').offsetWidth);
                        var height = ((parseInt(this.videoHeight) * ((parseInt(document.getElementById('weemo-videobox').offsetWidth) * 100) / parseInt(this.videoWidth))) / 100) + "px";
                        document.getElementById('weemo-videobox').style.height = height;

                        var a = document.getElementById('weemo-buttonsbar');
                        var style = window.getComputedStyle(a);
                        var buttonsbarWidth = style.getPropertyValue('width');
                        buttonsbarWidth = buttonsbarWidth.replace('px', ''),
                            m = (videoBoxWidth / 2) - (buttonsbarWidth/2);
                        buttons_bar.style.left = m + 'px';


                    }, false );

//                    remoteView.addEventListener( "ended", function (e) {
//                        alert('ended');
//                    }, false);
//
//                    remoteView.addEventListener( "pause", function (e) {
//                        alert('pause');
//                    }, false);
//
//                    remoteView.addEventListener( "ratechange", function (e) {
//                        alert('ratechange');
//                    }, false);
//
//                    remoteView.addEventListener( "suspend", function (e) {
//                        alert('suspend');
//                    }, false);
//
//                    remoteView.addEventListener( "abort", function (e) {
//                        alert('abort');
//                    }, false);
//
//                    remoteView.addEventListener( "canplay", function (e) {
//                        alert('canplay');
//                    }, false);
//
//                    remoteView.addEventListener( "canplaythrough", function (e) {
//                        alert('canplaythrough');
//                    }, false);
//
//                    remoteView.addEventListener( "durationchange", function (e) {
//                        alert('durationchange');
//                    }, false);
//
//                    remoteView.addEventListener( "emptied", function (e) {
//                        alert('emptied');
//                    }, false);
//
//                    remoteView.addEventListener( "error", function (e) {
//                        alert('error');
//                    }, false);
//
//                    remoteView.addEventListener( "loadeddata", function (e) {
//                        alert('loadeddata');
//                    }, false);

                    //////////////////////////////////
                    // Create weemo-selfview element
                    videobox.appendChild(selfView);
                    selfView.setAttribute('id', 'weemo-selfview');
                    selfView.setAttribute('autoplay', 'autoplay');
                    selfView.setAttribute('muted', 'true');
                    selfView.addEventListener( "loadedmetadata", function (e) {
                        var height = ((parseInt(this.videoHeight) * ((120 * 100) / parseInt(this.videoWidth))) / 100) + "px";
                    }, false );
                    //////////////////////////////////

                    // Create weemo-buttonsbar element
                    videobox.appendChild(buttons_bar);
                    buttons_bar.setAttribute('id', 'weemo-buttonsbar');
                    if(mobile) buttons_bar.style.display = 'block';
                    else buttons_bar.style.display = 'none';
                    //////////////////////////////////

                    // Create weemo-buttonnopip element
                    buttons_bar.appendChild(button_nopip);
                    button_nopip.setAttribute('id', 'weemo-buttonnopip');
                    button_nopip.onclick = function () {
                        if(novideo !== true) {
                            if (pipActive === true) {
                                callObjects[globalcall.id].noPip();
                                pipActive = false;
                            } else {
                                callObjects[globalcall.id].pip();
                                pipActive = true;
                            }
                        }
                    };

                    //////////////////////////////////
                    // Create weemo-buttonmute element
                    buttons_bar.appendChild(button_mute);
                    button_mute.setAttribute('id', 'weemo-buttonmute');
                    button_mute.onclick = function () {
                        if(mute === true) {
                            callObjects[globalcall.id].audioUnMute();
                            mute = false;
                        } else {
                            callObjects[globalcall.id].audioMute();
                            mute = true;
                        }
                    };
                    //////////////////////////////////

                    //////////////////////////////////
                    // Create weemo-buttonnovideo element
                    buttons_bar.appendChild(button_novideo);
                    button_novideo.setAttribute('id', 'weemo-buttonnovideo');
                    button_novideo.onclick = function () {
                        if(novideo) {
                            callObjects[globalcall.id].videoStart();
                            novideo = false;
                            button_novideo.className = "";
                        } else {
                            callObjects[globalcall.id].videoStop();
                            novideo = true;
                            button_novideo.className = "active";
                        }
                    };

                    //////////////////////////////////
                    // Create weemo-buttonhangup element
                    buttons_bar.appendChild(button_hangup);
                    button_hangup.setAttribute('id', 'weemo-buttonhangup');
                    button_hangup.onclick = function () { callObjects[globalcall.id].hangup(); };
                    //////////////////////////////////

                    // Create weemo-watermark element
                    videobox.appendChild(watermark);
                    watermark.setAttribute('id', 'weemo-watermark');
                    watermark.style.zIndex = "99999999";
                    watermark.style.height = "48px";
                    watermark.style.width = "71px";
                    watermark.style.position = "absolute";
                    watermark.style.bottom = "2px";
                    watermark.style.display = "block";
                    watermark.style.backgroundImage =  "url('https://static-ppr.weemo.com/img/Watermark_Wide.png')";
                    //////////////////////////////////

                    if (globalcall.getLocalStreams().length > 0) {
                        selfView.src = window.URL.createObjectURL(globalcall.getLocalStreams()[0]);
                    }
                    if (globalcall.getRemoteStreams().length > 0) {
                        remoteView.src = window.URL.createObjectURL(globalcall.getRemoteStreams()[0]);
                        remoteView.volume = 1.0;
                    }

                    // Start statistics
                    statsInterval = setInterval(function() {
                        if (globalcall && globalcall.getRemoteStreams()[0]) {
                            if (globalcall.rtcMediaHandler.peerConnection.getStats) {
                                globalcall.rtcMediaHandler.peerConnection.getStats(function(rawStats) {
                                    var stats = new AugumentedStatsResponse(rawStats);
                                    var statsString = '';
                                    var results = stats.result();
                                    var videoFlowInfo = 'No bitrate stats';
                                    for (var i = 0; i < results.length; ++i) {
                                        var res = results[i];
                                        statsString = i;
                                        if (!res.local || res.local === res) {
                                            reports[i] = dumpStats(res);
                                            if (res.type == 'ssrc' && res.stat('googFrameHeightReceived')) {
                                                videoFlowInfo = extractVideoFlowInfo(res, stats);
                                            }

                                            if(res.type == "googCandidatePair" && candidateDefined === false) {
                                                var ele = reports[i].el;

                                                for (var k = 0; k < ele.length; k++) {
                                                    if(ele[k].name === "googRemoteAddress") {
                                                        ice_candidate = ele[k].value;
                                                    }

                                                    if(ele[k].name === "googActiveConnection" ) {
                                                        if(ele[k].value === "true") {
                                                            candidateDefined = true;
                                                        };
                                                    }
                                                }
                                            }
                                        } else {
                                            if (res.local) {
                                                reports[i] = {"local": dumpStats(res.local)};
                                            }
                                            if (res.remote) {
                                                reports[i] = {"remote": dumpStats(res.remote)};
                                            }
                                        }
                                    }
                                });
                            } else {
                                debug('No stats function. Use at least Chrome 24.0.1285');
                            }
                        } else {
                            debug('Not connected yet');
                        }
                    }, 5000);

                    durationInterval = setInterval(function() {
                        call_duration += 1;
                    }, 1000);

                    callReportStartTimeout = setTimeout(function() {
                        buildReport('start');
                    }, 60000);

                    callReportUpdateTimeout = setTimeout(function() {
                        buildReport('update');
                        callReportUpdateInterval = setInterval(function() { buildReport('update'); } , 60000);
                    }, 120000);


                    callObjects[globalcall.id].status.call = "active";
                    callObjects[globalcall.id].status.video_remote = 'start';
                    callObjects[globalcall.id].status.video_local = 'start';
                    callObjects[globalcall.id].status.sound = 'unmute';

                    if (typeof self.onCallHandler === "function") {
                        self.onCallHandler(callObjects[globalcall.id], {type : "webRTCcall", status : "active"});
                    }
                });
                globalcall.on('progress', function (e) {
                    debug('event progress');

                    if(globalcall.direction === "incoming") {
                        call_state = "ringing";
                    } else {
                        call_state = "proceeding";
                    }
                });
                globalcall.on('ended', function (e) {
                    debug('event ended');

                    if (typeof self.onCallHandler === "function") {
                        self.onCallHandler(callObjects[globalcall.id], {type : "webRTCcall", status : "terminated"});
                    }

                    endReport.call_duration = call_duration;
                    endReport.sample_duration = call_duration%60;
                    endReport.ice_candidate = ice_candidate;
                    if(e.data.message !== null) {
                        endReport.error_code = e.data.message.status_code
                    } else {
                        endReport.error_code = 0;
                    }
                    endReport.release_cause = "terminated";
                    endReport.state = call_state;



                    buildReport('end', endReport);
                    callout = 0;
                    button_hangup.parentNode.removeChild(button_hangup);
                    button_mute.parentNode.removeChild(button_mute);
                    button_nopip.parentNode.removeChild(button_nopip);
                    buttons_bar.parentNode.removeChild(buttons_bar);
                    selfView.parentNode.removeChild(selfView);
                    remoteView.parentNode.removeChild(remoteView);
                    videobox.parentNode.removeChild(videobox);

                    window.clearTimeout(callReportStartTimeout);
                    window.clearTimeout(callReportUpdateTimeout);
                    window.clearInterval(callReportUpdateInterval);
                    window.clearInterval(statsInterval);
                    window.clearInterval(durationInterval);
                    reports = [];

                    globalcall = null;
                    callObjects = new Array();
                });
                globalcall.on('failed', function (e) {
                    debug('event failed\n');

                    if(e.data.cause === "Canceled") {
                        callObjects[globalcall.id].status.call = "terminated";
                    } else {
                        callObjects[globalcall.id].status.call = "failed";
                    }

                    callout = 0;

                    btn_h = document.getElementById('weemo-videobox');
                    if(btn_h !== null) {
                        btn_h.parentNode.removeChild(btn_h);
                    }

                    if (typeof self.onCallHandler === "function") {
                        self.onCallHandler(callObjects[globalcall.id], {type: "webRTCcall", status: callObjects[globalcall.id].status.call, reason: e.data.cause});
                    }

                    /** SEND ENDREPORT **/
                    endReport.call_duration = call_duration;
                    endReport.sample_duration = call_duration%60;
                    endReport.ice_candidate = ice_candidate;

                    if(e.data.message !== null) {
                        endReport.error_code = e.data.message.status_code
                    } else {
                        endReport.error_code = "0";
                    }
                    endReport.release_cause = e.data.cause;
                    endReport.state = call_state;

                    buildReport('end', { referer_uri: "", call_duration: 0, ice_candidate: 0, sample_duration: 0});
                    /** END ENDREPORT **/

                    window.clearTimeout(callReportStartTimeout);
                    window.clearTimeout(callReportUpdateTimeout);
                    window.clearInterval(callReportUpdateInterval);
                    window.clearInterval(statsInterval);
                    window.clearInterval(durationInterval);
                    reports = [];

                    globalcall = null;
                    callObjects = new Array();
                });
                if (callout == 0) {
                    if (typeof self.onCallHandler === "function") {
                        //self.onCallHandler(globalcall, {type : "webRTCcall", status : "incoming"});
                    } else {
                        // Load html
                        var confirmStr;
                        if(call.remote_identity.display_name !== "undefined" && call.remote_identity.display_name !== undefined) {
                            confirmStr = call.remote_identity.display_name + ' invites you to video chat';
                        } else {
                            confirmStr = 'A person invites you to video chat';
                        }
                        if (confirm(confirmStr)) {

                            var constraints = {
                                mandatory: {
                                    minWidth: 320,
                                    minAspectRatio: 1.777,
                                    maxAspectRatio: 1.778
                                }
                            };


                            globalcall.answer({
                                mediaConstraints: { audio: true, video: constraints },
                                extraHeaders: ['User-Agent: ' + JsSIP.C.USER_AGENT]
                            });
                        } else {
                            globalcall.terminate({status_code: 603});
                        }
                    };
                }
            } else {
                debug("Already in call => Terminate()");
                call.terminate({status_code: 486});
            }
        },
        buildReport = function(ev, endArgs) {
            var args = {},
                googFrameWidthSent,
                googFrameHeightSent,
                googFrameWidthReceived,
                googFrameHeightReceived,
                elements,
                firstlp = false;

            /**
             * Case Start
             */
            if(globalcall !== null && globalcall != undefined) {
                args.uri = globalcall.remote_identity.uri.user + "@" + globalcall.remote_identity.uri.host;
                args.call_type = "internal";
                args.callid = globalcall.request.call_id;

                if(globalcall.direction === "out") {
                    args.call_origin = "out";
                } else {
                    args.call_origin = "in";
                    args.displayname = globalcall.remote_identity.display_name;
                }
            }

            /**
             * Case End
             */
            args.error_code = "";
            args.state = "";
            args.release_cause = "";
            args.referer_urin = "";
            args.call_duration = "";
            args.sample_duration = "";
            args.ice_candidate = "";

            /**
             * Case Update
             */
            args.video_on = true;
            args.video_off = false;
            args.sharing_out_off = false;
            args.sharing_out_on = false;

            for (var i = 0; i < reports.length; i++) {
                elements = reports[i].el;
                for (var k = 0; k < elements.length; k++) {

                    if(elements[k].name === "googAvailableReceiveBandwidth") {
                        args.inbw = elements[k].value;
                    }

                    if(elements[k].name === "googAvailableSendBandwidth") {
                        args.outbw = elements[k].value;
                    }

                    if(elements[k].name === "googFrameWidthSent") {
                        googFrameWidthSent = elements[k].value;
                    }

                    if(elements[k].name === "googFrameHeightSent") {
                        googFrameHeightSent = elements[k].value;
                    }

                    if(elements[k].name === "googFrameRateSent") {
                        args.voutrr = elements[k].value;
                    }

                    if(elements[k].name === "googFrameRateInput") {
                        args.voutgrab = elements[k].value;
                    }

                    if(elements[k].name === "googFrameWidthReceived") {
                        googFrameWidthReceived = elements[k].value;
                    }

                    if(elements[k].name === "googFrameHeightReceived") {
                        googFrameHeightReceived = elements[k].value;
                    }

                    if(elements[k].name === "googFrameRateOutput") {
                        args.vinrr = elements[k].value;
                    }

                    if(elements[k].name === "packetsLost") {
                        if(elements[k].name === "packetsLost" && firstlp === true) {
                            args.ainlp = elements[k].value;
                        }
                        firstlp = true;
                        args.vinlp = elements[k].value;
                    }
                }
            }
            args.voutres = googFrameWidthSent + "x" + googFrameHeightSent;
            args.vinres = googFrameWidthReceived + "x" + googFrameHeightReceived;
            callreport(ev, args);
        },
        dumpStats = function(obj) {
            var report = new Object();
            report.timestamp = obj.timestamp;
            if (obj.id) {
                report.id = obj.id;
            }
            if (obj.type) {
                report.type = obj.type;
            }

            if (obj.names) {
                names = obj.names();
                report.el = [];
                for (var i = 0; i < names.length; ++i) {
                    if(obj.stat(names[i]) != undefined) {
                        report.el[i] = { "name": names[i], "value": obj.stat(names[i]) } ;
                    }
                }
            } else {
                if (obj.stat('audioOutputLevel')) {
                    report.audioOutputLevel = obj.stat('audioOutputLevel');
                }
            }

            return report;
        },
        sipRegister = function () {
            var trace = false,
                port,
                level,
                builtinEnabled;
            if (debugLevel >= 2) { level = 2; builtinEnabled = true; } else { level = 0; builtinEnabled = false; }
            if (debugLevel >= 3) { trace = true; } else { trace = false; }

            if(hap.substring(0, 4) === "prod" || hap === "") {
                port = 82;
            } else {
                port = 81;
            }

            configuration = {
                'ws_servers': 'ws://'+server+':'+ port,
                'uri': 'sip:' + uid + '@' + techdomain,
                'password': password,
                'trace_sip': trace,
                'log': {'builtinEnabled': builtinEnabled, level: level},
                'display_name': displayName,
                'turn_servers': [
                    { urls:"turn:" + server + ":3478?transport=udp", username:"weemo", credential:"weemo" },
                    { urls:"turn:" + server + ":3478?transport=tcp", username:"weemo", credential:"weemo"}
                ]

//                'stun_servers': ["stun:" + server + ":3478"],
                //'turn_servers': [{urls: ["turn:" + server + ":3478?transport=tcp"], username: "weemo", password: "weemo"}]
//                turn_servers: [
//                    { urls:["turn:zddzdazdazd.weemo.com:3478?transport=udp", username:"weemo", credential:"weemo" },
//                    { urls:"turn:" + server + ":3478?transport=tcp", username:"weemo", credential:"weemo"}]
            };

            debug('---------------------------');

            localusername = uid;
            if(typeof JsSIP === "object") {
	            weemoApp = new JsSIP.UA(configuration);
	            weemoApp.on('newRTCSession', function (e) { debug('newRTCSession'); weemoNewRTCSession(e.data.session, e.data.originator); });
	            weemoApp.on('newMessage', function () { debug('New Message'); });
	            weemoApp.on('registered', function () { sm("sipOk"); });
	            weemoApp.on('unregistered', function () { sm('sipNok'); });
	            weemoApp.on('registrationFailed', function () { sm('sipNok'); });
                weemoApp.on('disconnected', function () { sm('sipNok'); });
	            weemoApp.start();
            } else {
            	setTimeout(function() {
            		sipRegister();
            	}, 1000);
            }
        },
        disconnectRTC = function () {
            var xdr = getXDomainRequest(),
                parser,
                xmlDoc,
                url;

            xdr.timeout = 16000;
            xdr.onload = function () {
                if (window.DOMParser) {
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(xdr.responseText, "text/xml");
                } else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xdr.responseText);
                }

                // Connected Node
                disconnectNode = xmlDoc.getElementsByTagName("disconnect")[0];

                if (disconnectNode !== undefined) {
                    var statusValue = disconnectNode.getElementsByTagName("status")[0].childNodes[0].nodeValue;

                    if(statusValue === "ok") {
                        sm("not_connected", params);
                    } else {
                        sm("disconnectError", params);
                    }
                } else {
                    debug("---------------------------");
                    debug("Disconnect response : ");
                    debug(xdr.responseText);
                    debug("---------------------------");
                }
            };
            xdr.onerror = function () {
                debug("---------------------------");
                debug("Disconnect error : ");
                debug(xdr.responseText);
                debug("---------------------------");
            };
            xdr.ontimeout = function () {
                debug("---------------------------");
                debug("Disconnect timeout : ");
                debug(xdr.responseText);
                debug("---------------------------");
            };
            switch (hap) {
                case "dev/":
                    url = "https://oauth-dev.weemo.com/mgmt/wd/disconnect";
                    break;

                case "qualif/":
                    url = "https://oauth-qualif.weemo.com/mgmt/wd/disconnect";
                    break;

                case "ppr/":
                    url = "https://oauth-ppr.weemo.com/mgmt/wd/disconnect";
                    break;

                default:
                    url = "https://oauth.weemo.com/mgmt/wd/disconnect";
            }
            url += "?sid=" + sid;

            xdr.open("GET", url);
            xdr.send();
        },
        getDomainsListRTC = function () {
            var xdr = getXDomainRequest(),
                parser,
                xmlDoc,
                url,
                k;

            xdr.timeout = 16000;
            xdr.onload = function () {
                if (window.DOMParser) {
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(xdr.responseText, "text/xml");
                } else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xdr.responseText);
                }

                // Connected Node
                var domainsNode = xmlDoc.getElementsByTagName("get_domain_list")[0];

                if (domainsNode !== undefined) {
                    var nodesValue = domainsNode.getElementsByTagName("node");//[0].childNodes[0].nodeValue

                    for (k = 0; k < nodesValue.length; k += 1) {
                        domains.push(nodesValue[k].getElementsByTagName("name")[0].childNodes[0].nodeValue);
                    }

                    sm('domainsListOk');
                } else {
                    debug("---------------------------");
                    debug("Domains list response : ");
                    debug(xdr.responseText);
                    debug("---------------------------");
                }

            };
            xdr.onerror = function () {
                debug("---------------------------");
                debug("Domains list error : ");
                debug(xdr.responseText);
                debug("---------------------------");
            };
            xdr.ontimeout = function () {
                debug("---------------------------");
                debug("Domains list timeout : ");
                debug(xdr.responseText);
                debug("---------------------------");
            };
            switch (hap) {
                case "dev/":
                    url = "https://oauth-dev.weemo.com/mgmt/wd/domains";
                    break;

                case "qualif/":
                    url = "https://oauth-qualif.weemo.com/mgmt/wd/domains";
                    break;

                case "ppr/":
                    url = "https://oauth-ppr.weemo.com/mgmt/wd/domains";
                    break;

                default:
                    url = "https://oauth.weemo.com/mgmt/wd/domains";
            }
            url += "?sid=" + sid;

            xdr.open("GET", url);
            xdr.send();
        },
        getStatusRTC = function (username) {
            var xdr = getXDomainRequest(),
                parser,
                xmlDoc,
                action,
                params,
                url;

            if(federation == 1) {
                usernameSha = utils.sha1(providerid + domainid + username);
            } else if(federation == 2) {
                usernameSha = utils.sha1(providerid + username);
            } else if (federation == 3)  {
                usernameSha = utils.sha1(hash_type + username);
            }

            xdr.timeout = 16000;
            xdr.onload = function () {
                if (window.DOMParser) {
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(xdr.responseText, "text/xml");
                } else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xdr.responseText);
                }

                // Connected Node
                getStatusNode = xmlDoc.getElementsByTagName("status")[0];

                if (getStatusNode !== undefined) {
                    uidSet = getStatusNode.getElementsByTagName("username")[0].childNodes[0].nodeValue;
                    statusSet = getStatusNode.getElementsByTagName("value")[0].childNodes[0].nodeValue;

                    params = new Object();
                    params.name = "status";
                    params.value = parseInt(statusSet);

                    if(usernameSha === uidSet) {
                        params.uid = username;
                    } else {
                        params.uid = usernameSha;
                    }


                    sm("set", params);
                } else {
                    debug("---------------------------");
                    debug("Status response : ");
                    debug(xdr.responseText);
                    debug("---------------------------");
                }

            };
            xdr.onerror = function () {
                debug("---------------------------");
                debug("Get status error : ");
                debug(xdr.responseText);
                debug("---------------------------");
            };
            xdr.ontimeout = function () {
                debug("---------------------------");
                debug("Get status timeout : ");
                debug(xdr.responseText);
                debug("---------------------------");
            };
            switch (hap) {
                case "dev/":
                    url = "https://oauth-dev.weemo.com/mgmt/wd/status";
                    break;

                case "qualif/":
                    url = "https://oauth-qualif.weemo.com/mgmt/wd/status";
                    break;

                case "ppr/":
                    url = "https://oauth-ppr.weemo.com/mgmt/wd/status";
                    break;

                default:
                    url = "https://oauth.weemo.com/mgmt/wd/status";
            }
            url += "?username=" + usernameSha;

            xdr.open("GET", url);
            xdr.send();
        },
        initRTC = function () {
            var xdr = getXDomainRequest(),
                parser,
                xmlDoc,
                action,
                params,
                url;
            xdr.timeout = 16000;
            xdr.onload = function () {
                if (window.DOMParser) {
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(xdr.responseText, "text/xml");
                } else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xdr.responseText);
                }

                // Connected Node
                getInitNode = xmlDoc.getElementsByTagName("getinit")[0];

                if (getInitNode !== undefined) {
                    call1_1_out = getInitNode.getElementsByTagName("call1_1_out")[0].childNodes[0].nodeValue;
                    call1_1_in = getInitNode.getElementsByTagName("call1_1_in")[0].childNodes[0].nodeValue;

                    host_capability = getInitNode.getElementsByTagName("host_capability")[0].childNodes[0].nodeValue;
                    dual_call = getInitNode.getElementsByTagName("dual_call")[0].childNodes[0].nodeValue;
                    nb_attendee = getInitNode.getElementsByTagName("nb_attendee")[0].childNodes[0].nodeValue;
                    external_user = getInitNode.getElementsByTagName("external_user")[0].childNodes[0].nodeValue;
                    p2p_only = getInitNode.getElementsByTagName("p2p_only")[0].childNodes[0].nodeValue;
                    media = getInitNode.getElementsByTagName("media")[0].childNodes[0].nodeValue;
                    call_duration = getInitNode.getElementsByTagName("call_duration")[0].childNodes[0].nodeValue;

                    providerid = getInitNode.getElementsByTagName("id_provider")[0].childNodes[0].nodeValue;
                    domainid = getInitNode.getElementsByTagName("id_domain")[0].childNodes[0].nodeValue;
                    conf_level = getInitNode.getElementsByTagName("conf_level")[0].childNodes[0].nodeValue;
                    federation = getInitNode.getElementsByTagName("federation")[0].childNodes[0].nodeValue;
                    hash_type = getInitNode.getElementsByTagName("hash_type")[0].childNodes[0].nodeValue;

                    sm("initOk");
                } else {
                    debug("---------------------------");
                    debug("Init response : ");
                    debug(xdr.responseText);
                    debug("---------------------------");

                    sm("initNok");
                }
            };
            xdr.onerror = function () {
                action = "initNok";
                params = {};
                sm(action, params);
            };
            xdr.ontimeout = function () {
                action = "initNok";
                params = {};
                sm(action, params);
            };
            switch (hap) {
                case "dev/":
                    url = "https://oauth-dev.weemo.com/mgmt/wd/init";
                    break;

                case "qualif/":
                    url = "https://oauth-qualif.weemo.com/mgmt/wd/init";
                    break;

                case "ppr/":
                    url = "https://oauth-ppr.weemo.com/mgmt/wd/init";
                    break;

                default:
                    url = "https://oauth.weemo.com/mgmt/wd/init";
            }
            url += "?sid=" + sid;

            xdr.open("GET", url);
            xdr.send();
        },
        checkUserRTC = function () {
            var xdr = getXDomainRequest(),
                parser,
                xmlDoc,
                action,
                params,
                url,
                localos,
                deviceId;
            xdr.timeout = 16000;
            xdr.onload = function (data) {
                if (window.DOMParser) {
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(data, "text/xml");
                } else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(data);
                }

                if (xdr.responseText === "PB : Suspended") {
                    action = "onVerifiedUserNok";
                    params = {};
                    sm(action, params);
                } else if (utils.strpos(xdr.responseText, 'OK') !== false) {
                    sid = xdr.responseText.substring(5);
                    startup();
                    action = "onVerifiedUserOk";
                    params = {};
                    initRTC();
                    sipRegister();
                    getDomainsListRTC();
                    setTimeout(function() {
                    	getNbConnected();
                    }, 1*60000);
                    sm(action, params);
                    
                    
                } else if (utils.strpos(xdr.responseText, 'UPDATE') !== false) {
                    sid = xdr.responseText.substring(9);
                    startup();
                    action = "onVerifiedUserOk";
                    params = {};
                    initRTC();
                    sipRegister();
                    getDomainsListRTC();
                    setTimeout(function() {
                    	getNbConnected();
                    }, 1*60000);
                    sm(action, params);
                    
                } else if (utils.strpos(xdr.responseText, 'Hold') !== false) {
                    action = "hold";
                    params = {};
                    sm(action, params);
                }
            };
            xdr.onerror = function () {
                debug("onerror");
                action = "onVerifiedUserKo";
                params = {};
                sm(action, params);
            };
            xdr.ontimeout = function () {
                debug("ontimeout");
                action = "onVerifiedUserKo";
                params = {};
                sm(action, params);
            };
            switch (hap) {
            case "dev/":
                url = "https://oauth-dev.weemo.com/mgmt/wd/check";
                break;

            case "qualif/":
                url = "https://oauth-qualif.weemo.com/mgmt/wd/check";
                break;

            case "ppr/":
                url = "https://oauth-ppr.weemo.com/mgmt/wd/check";
                break;

            default:
                url = "https://oauth.weemo.com/mgmt/wd/check";
            }
            // Detecting localStorage
            if (localStorage !== undefined) {
                deviceId = localStorage.getItem('deviceId');
                if (os === "macos") {
                    localos = "mac";
                } else {
                    localos = "pc";
                }
            } else {
                debug("localStorage not supported");
            }

            if (deviceId === null ||deviceId === undefined) {
                if (os === "macos") {
                    localos = "mac";
                    deviceId = "2";
                } else {
                    localos = "pc";
                    deviceId = "1";
                }
                deviceId += random(3);

                if (localStorage !== undefined) {
                    localStorage.setItem('deviceId', deviceId);
                } else {
                    debug("localStorage not supported");
                }
            }
            url += "?login=" + uid + "&password=" + password + "&version=" + version + "&os=" + localos + "&device_id=" + deviceId;

            if(force === true) {
                url += "&force=1";
            }
            
            xdr.open("GET", url);
            xdr.send();
        },
        getNbConnected = function () {
        	var xdr = getXDomainRequest(),
            url;

        xdr.timeout = 16000;
        xdr.onload = function () {
            if (window.DOMParser) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(xdr.responseText, "text/xml");
            } else { // Internet Explorer
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xdr.responseText);
            }

            // Connected Node
            keepaliveNode = xmlDoc.getElementsByTagName("keepalive")[0];

            if (keepaliveNode !== undefined) {
                status = keepaliveNode.getElementsByTagName("status")[0].childNodes[0].nodeValue;

                if(status === "ok") {
                    sm('keepaliveOk');
                } else {
                    sm('keepaliveNok');
                }
            } else {
                sm('keepaliveNok');
            }

            setTimeout(function() {
            	getNbConnected();
            }, 5*60000);
        };
        xdr.onerror = function () {
            debug("---------------------------");
            debug("Keep alive error");
            debug(xdr.responseText);
            debug("---------------------------");
        };
        xdr.ontimeout = function () {
            debug("---------------------------");
            debug("Keep alive timeout");
            debug(xdr.responseText);
            debug("---------------------------");
        };
        switch (hap) {
        case "dev/":
            url = "https://oauth-dev.weemo.com/mgmt/wd/keepalive";
            break;

        case "qualif/":
            url = "https://oauth-qualif.weemo.com/mgmt/wd/keepalive";
            break;

        case "ppr/":
            url = "https://oauth-ppr.weemo.com/mgmt/wd/keepalive";
            break;

        default:
            url = "https://oauth.weemo.com/mgmt/wd/keepalive";
        }
        
        url += "?sid=" + sid;
        xdr.open("GET", url);
        xdr.send();
        },
        verifyUserRTC = function () {
            var xdr = getXDomainRequest(),
                xmlDoc,
                parser,
                verifyUserNode,
                url,
                status;

            xdr.timeout = 16000;
            xdr.onload = function () {
                if (window.DOMParser) {
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(xdr.responseText, "text/xml");
                } else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xdr.responseText);
                }

                // Connected Node
                verifyUserNode = xmlDoc.getElementsByTagName("verify_user")[0];

                if (verifyUserNode !== undefined) {
                    status = verifyUserNode.getElementsByTagName("status")[0].childNodes[0].nodeValue;
                    if (status === "ok") {
                        uid = verifyUserNode.getElementsByTagName("login")[0].childNodes[0].nodeValue;
                        password = verifyUserNode.getElementsByTagName("password")[0].childNodes[0].nodeValue;
                        checkUserRTC();
                    } else {
                        debug("---------------------------");
                        debug("Verify user response : ");
                        debug(xdr.responseText);
                        debug("---------------------------");
                        
                        sm("onVerifiedUserNok");
                    }
                } else {
                    sm("onVerifiedUserNok");
                }
            };
            xdr.onerror = function (data) {
                debug("onerror");
                debug(data);

                sm("onVerifiedUserNok");
            };
            xdr.ontimeout = function (data) {
                debug("ontimeout");
                debug(data);

                sm("onVerifiedUserNok");
            };

            switch (hap) {
            case "dev/":
                url = "https://oauth-dev.weemo.com/mgmt/wd/verify";
                break;

            case "qualif/":
                url = "https://oauth-qualif.weemo.com/mgmt/wd/verify";
                break;

            case "ppr/":
                url = "https://oauth-ppr.weemo.com/mgmt/wd/verify";
                break;

            default:
                url = "https://oauth.weemo.com/mgmt/wd/verify";
            }
            url += "?token=" + token + "&appid=" + webAppId + "&type=" + weemoType;
            xdr.open("GET", url);
            xdr.send();
        },
        getHap = function (pHapUrl) {
            var xdr = getXDomainRequest(),
                xmlDoc,
                parser,
                jsonObj = {},
                nbTune,
                tuneName,
                tuneAddress,
                tuntab = [],
                t,
                l,
                i,
                j,
                tabWs = [],
                tabError = [],
                tabStart = [],
                tabEnd = [],
                tabIndex = [],
                tabTime = [],
                message = [],
                hapUrl = pHapUrl,
                url;
            if(hapUrl === undefined || hapUrl === '') {
            	hapUrl = 1;
            	url = "https://hap1.weemo.com/weemodriver5/" + hap;
            } else {
            	url = "https://hap2.weemo.com/weemodriver5/" + hap;
            }

            xdr.onload = function () {
                sm("hapOk");
            	var z = 0;
                function startProbeTest() {
                    var k;
                    for (k = 0; k < tuntab.length; k += 1) {
                        if (tabWs[k].readyState == 1) {
                            tabStart[k] = new Date().getTime();
                            message[k] = "00011:" + k + "IYvXv5ltJl";
                            tabWs[k].send(message[k]);
                            tabIndex[k] = 1;
                        }
                    }
                }
                function onCloseProbeTest(evt) {
        			if(evt.code === 1006) {
                		if(tabError.indexOf(evt.currentTarget.URL) === -1) {  
                			tabError[z] = evt.currentTarget.URL;
                			z++;
                			
                			if(tabError.length === tabWs.length) {
                                // unable to reah all probes
                            	if(hapUrl === 1) {
                            		getHap(2);
                            	} else {
                            		sm("probesNok");
                            	}
                            }
                		}
                	}
               }
                function handleProbeData(data) {
                    var index = data.substring(6, 7);
                    if (message[index] === data) {
                        if (tabIndex[index] === 16 && server === undefined && name === undefined) {

                            tabWs[index].close();
                            tabEnd[index] = new Date().getTime();
                            tabTime[index] = tabEnd[index] - tabStart[index];

                            debug("tabTime : " + tabTime);
                            debug("--------------------------");
                            latency = tabTime.indexOf(Math.min.apply(null, tabTime)) / 12;
                            server = tuntab[tabTime.indexOf(Math.min.apply(null, tabTime))].address;
                            name = tuntab[tabTime.indexOf(Math.min.apply(null, tabTime))].name;
                            debug("localAddress : " + localAddress);
                            debug("stunServer : " + server + " (" + name + ")");
                            debug("---------------------------");
                            var obj = new Object();
                            obj.server = server;
                            obj.name = name;
                            sm("probesOk", obj);
                            sm("connectedWebRTC");
                        } else {
                            tabIndex[index] += 1;
                            switch (tabIndex[index]) {
                            case 2:
                                message[index] = "00061:" + index + "GIRyqXYi86l7sUBFrWjBTxnbMYApbC6DDRvsuOPoMRfPXEZuODfmQA017jp9";
                                tabWs[index].send(message[index]);
                                break;
                            case 3:
                                message[index] = "00011:" + index + "MmHBnF8z71";
                                tabWs[index].send(message[index]);
                                break;
                            case 4:
                                message[index] = "00081:" + index + "wfYGKjig6NKgbEC0yRcmzMV9z8ItVzQGLVgAnQdszX1OE91GtPwZ3gohseopFOqv6oFpBAZwZTclpUEF";
                                tabWs[index].send(message[index]);
                                break;
                            case 5:
                                message[index] = "00011:" + index + "QxBPhzM1AW";
                                tabWs[index].send(message[index]);
                                break;
                            case 6:
                                message[index] = "00061:" + index + "kCQZxnrYKzZP0FD9tHMZynCETnrCpGI0R4ISFaqOWjoiXDXFgZsX8CUAKzOj";
                                tabWs[index].send(message[index]);
                                break;
                            case 7:
                                message[index] = "00011:" + index + "JrLzQYj6Tc";
                                tabWs[index].send(message[index]);
                                break;
                            case 8:
                                message[index] = "00021:" + index + "oauCHaIhrxgHG28NQ9sn";
                                tabWs[index].send(message[index]);
                                break;
                            case 9:
                                message[index] = "00011:" + index + "oZxEn6DTeb";
                                tabWs[index].send(message[index]);
                                break;
                            case 10:
                                message[index] = "00100:" + index + "ggjH9SwrsiWJ6Wth7XG8NfGBavVCTRLhNObl0GXRlyt6QyJSMFlXotpHIQTKzGpZ4wKU79GfyikXCRLf6WATsitixjBuu27vVmf";
                                tabWs[index].send(message[index]);
                                break;
                            case 11:
                                message[index] = "00011:" + index + "tB5dam3l1P";
                                tabWs[index].send(message[index]);
                                break;
                            case 12:
                                message[index] = "00021:" + index + "pd8svXmjPKFUZ3NVKM8n";
                                tabWs[index].send(message[index]);
                                break;
                            case 13:
                                message[index] = "00011:" + index + "igqbngOwcD";
                                tabWs[index].send(message[index]);
                                break;
                            case 14:
                                message[index] = "00041:" + index + "g9RhSuCJgPAPoJBAKMn3mJlaiFGi96JJfDzkrLJk";
                                tabWs[index].send(message[index]);
                                break;
                            case 15:
                                message[index] = "00061:" + index + "2Nuvxpin8YteNRX8myeQTegB84j3kuxCdvV5cT9fEI6SHxVnHlXygDKxG6FW";
                                tabWs[index].send(message[index]);
                                break;
                            case 16:
                                message[index] = "00021:" + index + "EI6SHxVnHlXygDKxG6FW";
                                tabWs[index].send(message[index]);
                                break;
                            }
                        }
                    }
                }
                
                if(xdr.status === 200) {
	                if (window.DOMParser) {
	                    parser = new DOMParser();
	                    xmlDoc = parser.parseFromString(xdr.responseText, "text/xml");
	                } else { // Internet Explorer
	                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	                    xmlDoc.async = false;
	                    xmlDoc.loadXML(xdr.responseText);
	                }
	                t = xmlDoc.getElementsByTagName("techdomain")[0];
	                if (t !== undefined) {
	                    techdomain = xmlDoc.getElementsByTagName("techdomain")[0].childNodes[0].nodeValue;
	                }
	                l = xmlDoc.getElementsByTagName("local")[0];
	                if (l !== undefined) {
	                    localAddress = xmlDoc.getElementsByTagName("local")[0].getAttribute('addr');
	                }

	                if(localAddress !== undefined) {
	                	if (localStorage !== undefined) {
	                        localStorage.setItem("localAddress", localAddress);
	                    } else {
	                        debug("localStorage not supported");
	                    }
	                }
	                nbTune = xmlDoc.getElementsByTagName("tun").length;
	                if (nbTune !== undefined) {
	                    if (nbTune === 1) {
	                        if (xmlDoc.getElementsByTagName("tun")[0] !== undefined) {
	                            tuneName = xmlDoc.getElementsByTagName("tun")[0].getAttribute('name');
	                            tuneAddress = xmlDoc.getElementsByTagName("tun")[0].getElementsByTagName("probe")[0].getAttribute('addr');
	                            server = tuneAddress;
	                            name = tuneName;
	                        }
	
	                        debug("---------------------------");
	                        debug("localAddress : " + localAddress);
	                        debug("stunServer : " + server + " (" + name + ")");
	                        debug("---------------------------");
	
	                        sm("connectedWebRTC");
	                    } else if (nbTune > 1) {
	                        for (i = 0, j = 0; i < nbTune; i += 1) {
	                            if (xmlDoc.getElementsByTagName("tun")[i] !== undefined) {
	                                tuneName = xmlDoc.getElementsByTagName("tun")[i].getAttribute('name');
	                                tuneAddress = xmlDoc.getElementsByTagName("tun")[i].getElementsByTagName("probe")[0].getAttribute('addr');
	                                tuntab[j] = {name: tuneName, address: tuneAddress};
	
	                                tabWs[j] = new WebSocket("ws://" + tuneAddress + ":444");
	                                tabWs[j].onopen = function () { startProbeTest(); };
	                                tabWs[j].onclose = function (evt) { onCloseProbeTest(evt); };
	                                tabWs[j].onmessage = function (evt) { handleProbeData(evt.data); };
	                                tabWs[j].onerror = function () {  debug("WEBSOCKET ERROR"); };
	
	                                tabTime[j] = 999999;
	                                j += 1;
	                            }
	                        }
	                        jsonObj.tun = tuntab;
	                    }
	                }
                } else {
                	if(hapUrl === 1) {
                		debug("ERROR TO GET HAP 1 FILE");
                		getHap(2);
                	} else {
                		debug("ERROR TO GET HAP 2 FILE");
                		var action = "hapNok";
                        sm(action);
                	}
                }
            };
            xdr.onerror = function () {
            	if(hapUrl === 1) {
            		debug("ERROR TO GET HAP 1 FILE");
            		getHap(2);
            	} else {
            		debug("ERROR TO GET HAP 2 FILE");
            		var action = "hapNok";
                    sm(action);
            	}
                
            };
            xdr.ontimeout = function () {
            	if(hapUrl === 1) {
            		debug("TIMEOUT TO GET HAP 1 FILE");
            		getHap(2);
            	} else {
            		debug("TIMEOUT TO GET HAP 2 FILE");
            		var action = "hapNok";
                    sm(action);
            	}
            };
            
            xdr.open("GET", url);
            xdr.timeout = 16000;
            xdr.send();
        },
        uniqid = function () { var newDate = new Date(); return (newDate.getTime() % (2147483648 - 1)); },
        getXDomainRequest = function () {
            var xdr = null;
            if (window.XDomainRequest) {
                xdr = new XDomainRequest();
            } else if (window.XMLHttpRequest) {
                xdr = new XMLHttpRequest();
            } else {
                debug("Your browser does not support AJAX cross-domain!");
            }
            return xdr;
        },
        polling = function() {
            if(useJquery === true && window.jQuery) {
                jQuery.ajax(longpollUri, {
                    data: {command:longpollId+":<poll></poll>"},
                    dataType: "jsonp",
                    timeout: pollingTimeout,
                    beforeSend: function() { },
                    success: function(data) {
                        sm('connected');
                        if(data != "" && data != undefined) {
                            var pos = utils.strpos(data.x, ":");
                            if(pos !== false) {
                                var responseId = data.x.substring(0, pos);
                                if(responseId == longpollId) {
                                    data.x = data.x.substring(pos+1);
                                    handleData(data.x);
                                    polling();
                                }
                            } else {
                                polling();
                            }
                        }
                    },
                    error: function (data, textStatus, errorThrown) {
                        sm('not_connected');
                    }
                });
            } else {
                var xdr = getXDomainRequest();
                xdr.timeout = 12000;
                xdr.onload = function() {
                    eval(xdr.responseText);

                    debug('########################');
                    debug('Completed (polling) !');
                    debug('########################');
                }
                xdr.onerror = function() {
                    debug('########################');
                    debug('An error occured (polling) !');
                    debug('########################');
                    debug(xdr);

                    sm('not_connected');

                }
                xdr.ontimeout = function() {
                    debug('########################');
                    debug('Timeout (polling) !');
                    debug('########################');
                    debug(xdr);

                    sm('not_connected');
                }
                xdr.onprogress = function() {
                    debug('########################');
                    debug('Request in progress (polling) !');
                    debug('########################');
                    debug(xdr);
                }
                uri = encodeURIComponent(longpollId+':<poll></poll>');
                var ts = (new Date().getTime() / 1000);

                xdr.open("GET", longpollUri+'?callback=jQueryPolling&command='+uri+'&_='+ts);
                xdr.send();
            }
    	},
        sendMessage = function(val, type) {
            if(useJquery === true && window.jQuery) {
                var message = new String();
                if(val != "" && val != undefined) { message = val; }

                if(browser == 'Microsoft Internet Explorer' && browserVersion < 11) {
                    jqXHR = jQuery.ajax(longpollUri, {
                        timeout: messageTimeout,
                        beforeSend: function() { },
                        data: { command:longpollId+':'+message },
                        dataType: "jsonp",
                        success: function(data) {
                            debug('BROWSER TO WEEMODRIVER >>>>>> '+message);
                            data = utils.trim(data.x);
                            var pos = utils.strpos(data, ":");
                            if(pos !== false) {
                                var responseId = data.substring(0, pos);
                                data = data.substring(pos+1);
                            }

                            if(data != "" && data != undefined && responseId != undefined && responseId == longpollId) {
                                try { handleData(data); }
                                catch(err) { debug(err); }
                            }
                        },
                        error: function (data) { debug(data); }
                    });
                } else {
                    if(websock != undefined && websock != null) {
                        websock.send(message);
                        debug('BROWSER TO WEEMODRIVER >>>>>> '+message);
                    }
                }
            } else {
                var message = new String();
                if(val != "" && val != undefined) { message = val; }

                if(browser == 'Microsoft Internet Explorer' && browserVersion < 11) {
                    var xdr = getXDomainRequest();
                    xdr.timeout = messageTimeout;
                    xdr.onload = function() {
                        debug('BROWSER TO WEEMODRIVER >>>>>> '+message);
                        eval(xdr.responseText);

                        debug('########################');
                        debug('Completed (sendMessage) !');
                        debug('########################');
                    }
                    xdr.onerror = function() {
                        debug('########################');
                        debug('An error occured (sendMessage) !');
                        debug('########################');
                        debug(xdr);
                    }
                    xdr.ontimeout = function() {
                        debug('########################');
                        debug('Timeout (sendMessage) !');
                        debug('########################');
                        debug(xdr);
                    }
                    xdr.onprogress = function() {
                        debug('########################');
                        debug('Request in progress (sendMessage) !');
                        debug('########################');
                        debug(xdr);
                    }
                    uri = encodeURIComponent(longpollId+':'+message);
                    var ts = (new Date().getTime());

                    xdr.open("GET", longpollUri+'?callback=jQuerySendMessage&command='+uri+'&_='+ts);
                    xdr.send();
                } else {
                    if(websock != undefined && websock != null) {
                        websock.send(message);
                        debug('BROWSER TO WEEMODRIVER >>>>>> '+message);
                    }
                }
            }
    	},
        connect = function () {
            if (connectWith === "webrtc") {
                pingMgmt();
            } else {
                if (hap === undefined || hap === null || hap === "") {
                    sendMessage("<connect hap=''></connect>");
                } else {
                    sendMessage("<connect hap='" + hap + "'></connect>");
                }
            }
        },
        handleData = function (data) {
            debug(data);
            var action = "",
                params = Object.create(null),
                parser,
                xmlDoc,
                connectedNode,
                connectedStatus,
                readyforauthenticationNode,
                verifieduserNode,
                statusVerified,
                errorVerifiedNode,
                statusNode,
                xmpp,
                sip,
                audio,
                set,
                displayNameSet,
                versionSet,
                statusSet,
                uidSet,
                createdcall,
                statuscall,
                video_local,
                video_remote,
                share_local,
                share_remote,
                sound,
                id,
                call,
                readyforconnectionNode,
                kickedNode,
                disconnectedNode,
                errorNode,
                holdNode;

            if (window.DOMParser) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(data, "text/xml");
            } else { // Internet Explorer
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(data);
            }

            // Connected Node
            connectedNode = xmlDoc.getElementsByTagName("connected")[0];
            if (connectedNode !== undefined && connectedNode !== null) {
                connectedStatus = xmlDoc.getElementsByTagName("connected")[0].childNodes[0].nodeValue;
                if (connectedStatus === "ok") { action = "onConnect"; } else { action = "onConnectionFailed"; }
            } else {
                // Readyforauthentication Node
                readyforauthenticationNode = xmlDoc.getElementsByTagName("readyforauthentication")[0];
                if (readyforauthenticationNode !== undefined && readyforauthenticationNode !== null) {
                    action = "onReadyforauthentication";
                } else {
                    // verifieduser Node
                    verifieduserNode = xmlDoc.getElementsByTagName("verifieduser")[0];
                    if (verifieduserNode !== undefined && verifieduserNode !== null) {
                        statusVerified = verifieduserNode.childNodes[0].nodeValue;
                        if (statusVerified === "ok") {
                            action = "onVerifiedUserOk";
                        } else if (statusVerified === "loggedasotheruser") {
                            action = "loggedasotheruser";
                        } else {
                            action = "onVerifiedUserNok";
                            errorVerifiedNode = verifieduserNode.getElementsByTagName("error")[0];
                            if (errorVerifiedNode !== undefined) {
                                params.error = errorVerifiedNode.getAttribute('code');
                            }
                        }
                    } else {
                        //Status Node
                        statusNode = xmlDoc.getElementsByTagName("status")[0];
                        if (statusNode !== undefined && statusNode !== null) {
                            xmpp = statusNode.getElementsByTagName("xmpp")[0];
                            if (xmpp !== undefined  && xmpp !== null) {
                                if (xmpp.childNodes[0].nodeValue === "ok") { action = "xmppOk"; } else { action = "xmppNok"; }
                            } else {
                                sip = statusNode.getElementsByTagName("sip")[0];
                                if (sip !== undefined && sip !== null) {
                                    if (sip.childNodes[0].nodeValue === "ok") {
                                        action = "sipOk";
                                    } else {
                                        action = "sipNok";
                                    }
                                } else {
                                    audio = statusNode.getElementsByTagName("audio")[0];
                                    if (audio !== undefined && audio !== null) {
                                        if (audio.childNodes[0].nodeValue === "ok") {
                                            action = "audioOk";
                                        } else {
                                            action = "audioNok";
                                        }
                                    }
                                }
                            }
                        } else {
                            //Set Node
                            set = xmlDoc.getElementsByTagName("set")[0];
                            if (set !== undefined && set !== null) {
                                action = "set";
                                displayNameSet = set.getAttribute("displayname");
                                if (displayNameSet !== undefined && displayNameSet !== null) {
                                    params.name = "displayName";
                                    params.value = displayNameSet;
                                } else {
                                    versionSet = set.getAttribute("version");
                                    if (versionSet !== undefined && versionSet !== null) {
                                        params.name = "version";
                                        params.value = versionSet;
                                    } else {
                                        statusSet = set.getAttribute("status");
                                        if (statusSet !== undefined && statusSet !== null) {
                                            uidSet = set.getAttribute("uid");
                                            params.name = "status";
                                            params.value = parseInt(statusSet);
                                            params.uid = uidSet;
                                        } else {
    										var callwindowDefaultPositionSet = set.getAttribute('callwindowDefaultPosition');
    										if(callwindowDefaultPositionSet != undefined && callwindowDefaultPositionSet !== null) {
    											params.name = 'callWindowDefaultPosition';
    											params.value = callwindowDefaultPositionSet;
    										} else {
    											var domainStatusSet = set.getAttribute("domainstatus");
    	                                        if (domainStatusSet !== undefined && domainStatusSet !== null) {
                                                    var domainSet = set.getAttribute("domain");
    	                                            params.name = "domainstatus";
    	                                            params.value = parseInt(domainStatusSet);
                                                    params.domain = domainSet;
    	                                        } else {
    	                                        	var profileSet = set.getAttribute("domainprofile");
        	                                        if (profileSet !== undefined && profileSet !== null) {
        	                                            params.name = "domainprofile";
        	                                            params.value = parseInt(profileSet);
        	                                        }
    	                                        }
    										}
    									}
                                    }
                                }
                            } else {
                                // CreatedCall Node 
                                createdcall = xmlDoc.getElementsByTagName("createdcall")[0];
                                if (createdcall !== undefined && createdcall !== null) {
                                    params.createdCallId = createdcall.getAttribute("id");
                                    params.direction = createdcall.getAttribute("direction");
                                    params.displayNameToCall = createdcall.getAttribute("displayname");
                                    action = "callCreated";
                                } else {
                                    // statuscall Node
                                    statuscall =  xmlDoc.getElementsByTagName("statuscall")[0];
                                    if (statuscall !== undefined && statuscall !== null) {
                                        action = "onCallStatusReceived";
                                        id = statuscall.getAttribute('id');
                                        params.id = id;
                                        call = statuscall.getElementsByTagName("call")[0];
                                        if (call !== undefined && call !== null) {
                                            params.type = "call";
                                            params.status = call.childNodes[0].nodeValue;
                                            if(params.status == "terminated") {
                                                var reason = statuscall.getElementsByTagName("reason")[0];
                                                params.reason = reason.childNodes[0].nodeValue;
                                            }
                                        } else {
                                            video_local = statuscall.getElementsByTagName("video_local")[0];
                                            if (video_local !== undefined && video_local !== null) {
                                                params.type = "video_local";
                                                params.status = video_local.childNodes[0].nodeValue;
                                            } else {
                                                video_remote = statuscall.getElementsByTagName("video_remote")[0];
                                                if (video_remote !== undefined && video_remote !== null) {
                                                    params.type = "video_remote";
                                                    params.status = video_remote.childNodes[0].nodeValue;
                                                } else {
                                                    share_local = statuscall.getElementsByTagName("share_local")[0];
                                                    if (share_local !== undefined && share_local !== null) {
                                                        params.type = "share_local";
                                                        params.status = share_local.childNodes[0].nodeValue;
                                                    } else {
                                                        share_remote = statuscall.getElementsByTagName("share_remote")[0];
                                                        if (share_remote !== undefined && share_remote !== null) {
                                                            params.type = "share_remote";
                                                            params.status = share_remote.childNodes[0].nodeValue;
                                                        } else {
                                                            sound = statuscall.getElementsByTagName("sound")[0];
                                                            if (sound !== undefined && sound !== null) {
                                                                params.type = "sound";
                                                                params.status = sound.childNodes[0].nodeValue;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        // Readyforconnection Node
                                        readyforconnectionNode = xmlDoc.getElementsByTagName("readyforconnection")[0];
                                        if (readyforconnectionNode !== undefined && readyforconnectionNode !== null) {
                                            action = "onReadyforconnection";
                                        } else {
                                            // kicked Node
                                            kickedNode = xmlDoc.getElementsByTagName("kicked")[0];
                                            if (kickedNode !== undefined && kickedNode !== null) {
                                                action = "kicked";
                                                params.kickedName = kickedNode.getAttribute("displayname");
                                                params.kickedUrl = kickedNode.getAttribute("urlreferer");
                                            } else {
                                                // dropped Node
                                                droppedNode = xmlDoc.getElementsByTagName("dropped")[0];
                                                if (droppedNode !== undefined && droppedNode !== null) {
                                                    action = "dropped";
                                                    params.droppedName = droppedNode.getAttribute("displayname");
                                                    params.droppedUrl = droppedNode.getAttribute("urlreferer");
                                                } else {
                                                    // Error Node
                                                    errorNode = xmlDoc.getElementsByTagName("error")[0];
                                                    if (errorNode !== undefined && errorNode !== null) {
                                                        action = "error";
                                                        params.message = errorNode.childNodes[0].nodeValue;
                                                    } else {
                                                        // Disconnected node
                                                        disconnectedNode = xmlDoc.getElementsByTagName("disconnected")[0];
                                                        if (disconnectedNode !== undefined && disconnectedNode !== null) {
                                                            action = "not_connected";
                                                        } else {
                                                            holdNode = xmlDoc.getElementsByTagName("hold")[0];
                                                            if (holdNode !== undefined && holdNode !== null) {
                                                                action = "hold";
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (action !== "") { sm(action, params, data); }
        },
        createConnection = function () {
            if (browser === "Microsoft Internet Explorer" && browserVersion < 11) {
                if (longpollId === null) { longpollId = uniqid(); }
                polling();
            } else {
                try {
                    if (typeof MozWebSocket === "function") { WebSocket = MozWebSocket; }
                    websock = new WebSocket(wsUri, protocol);
                    websock.onopen = function () { sm("connected"); debug("BROWSER >>>>> WEBSOCKET IS OPEN"); };
                    websock.onclose = function (evt) { debug("BROWSER >>>>> WEBSOCKET IS CLOSE"); sm("not_connected"); };
                    websock.onmessage = function (evt) { handleData(evt.data); };
                    websock.onerror = function () {  debug("BROWSER >>>>> WEBSOCKET ERROR"); };
                } catch (exception) {
                    debug("BROWSER >>>>> WEBSOCKET EXCEPTION");
                    debug(exception);
                }
            }
        },
        sendDisplayName = function () {
        	if(connectWith != "webrtc") {
                sendMessage("<set displayname='" + displayName + "'></set>");
        	}
        },
        verifyUser = function (force) {
            if (connectWith === "webrtc") {
                verifyUserRTC();
            } else {
                if (force === true) {
                    sendMessage("<verifyuser token='" + token + "' urlreferer='" + webAppId + "' type='" + weemoType + "' force='1'></verifyuser>");
                } else {
                    sendMessage("<verifyuser token='" + token + "' urlreferer='" + webAppId + "' type='" + weemoType + "'></verifyuser>");
                }
                force = false;
            }
        },
        getStatusInternal = function (uidStatus) {
            if(connectWith === "webrtc") {
                getStatusRTC(uidStatus);
            } else {
                sendMessage("<get type='status' uid='" + uidStatus + "' />");
            }
        },
        getProfileInternal = function() {
        	sendMessage("<get type='domainprofile' />");
        },
        getDomainStatusInternal = function(domain) {
        	sendMessage("<get type='domainstatus' domain='" + domain+ "' />");
        },
        downloadMethod = function() {
        	if((mode === "webrtc_wd" || mode === "wd_webrtc") && attempt === 1 && browser === "Chrome") {
        		connectWith = "webrtc";
        		//sm("not_connected");
        		downloadTimeout = null;
        	} else {
                debug("BROWSER >>>>> WeemoDriver not started | TIME : " + new Date().toLocaleTimeString());
                if (typeof (self.onWeemoDriverNotStarted) === "function") { self.onWeemoDriverNotStarted(downloadUrl); }
        	}
        },
        WeemoCall = function (callId, direction, dn, parent) {
            var controlCall = function (id, item, action) { sendMessage("<controlcall id='" + id + "'><" + item + ">" + action + "</" + item + "></controlcall>"); };
            this.dn = dn;
            this.parent = parent;
            this.direction = direction;
            this.callId = callId;
            this.status = {call : null, video_remote : null, video_local : null, sound : null};
            this.accept = function (constraints) {
                if(connectWith === "webrtc") {
                    if(constraints != undefined && constraints != null && constraints != "") {

                    } else {
                        constraints = {
                            mandatory: {
                                minWidth: 320,
                                minAspectRatio: 1.777,
                                maxAspectRatio: 1.778
                            }
                        };
                    }
                    globalcall.answer({'mediaConstraints': { 'audio': true, 'video': constraints }, 'extraHeaders': ['User-Agent: ' + JsSIP.C.USER_AGENT]});
                } else {
                    controlCall(this.callId, "call", "start");
                }
            };
            this.hangup = function () {
                if(connectWith === "webrtc") {
                    if(this.status !== "active") {
                        globalcall.terminate({status_code: 603});
                    } else {
                        globalcall.terminate();
                    }
                } else {
                    controlCall(this.callId, "call", "stop");
                }
            };
            this.videoStart = function () {
                if(connectWith === "webrtc") {
                    var videosTracks = globalcall.getLocalStreams()[0].getVideoTracks()[0];
                    videosTracks.enabled = true;

                    document.getElementById('weemo-selfview').style.display = "block";
                    document.getElementById('weemo-buttonnovideo').className = "";

                    this.status.video_remote = "start";
                    if (typeof self.onCallHandler === "function") { self.onCallHandler(this, {type : "video_local", status :  this.status.video_remote}); }
                } else {
                    controlCall(this.callId, "video_local", "start");
                }
            };
            this.videoStop = function () {
                if(connectWith === "webrtc") {
                    var videosTracks = globalcall.getLocalStreams()[0].getVideoTracks()[0];
                    videosTracks.enabled = false;

                    document.getElementById('weemo-selfview').style.display = "none";
                    document.getElementById('weemo-buttonnovideo').className = "active";

                    this.status.video_remote = "stop";
                    if (typeof self.onCallHandler === "function") { self.onCallHandler(this, {type : "video_local", status :  this.status.video_remote}); }
                } else {
                    controlCall(this.callId, "video_local", "stop");
                }
            };
            this.audioMute = function () {
                if(connectWith === "webrtc") {
                    var audioTracks = globalcall.getLocalStreams()[0].getAudioTracks(),
                        i,
                        l = audioTracks.length;
                    for (i = 0; i < l; i += 1) {
                        audioTracks[i].enabled = false;
                    }
                    document.getElementById('weemo-buttonmute').className = "active";
                    this.status.sound = "mute";
                    if (typeof self.onCallHandler === "function") { self.onCallHandler(this, {type : "sound", status :  this.status.sound}); }
                } else {
                    controlCall(this.callId, "sound", "mute");
                }
            };
            this.audioUnMute = function () {
                if(connectWith === "webrtc") {
                    var audioTracks = globalcall.getLocalStreams()[0].getAudioTracks(),
                        i,
                        l = audioTracks.length;
                    for (i = 0; i < l; i += 1) {
                        audioTracks[i].enabled = true;
                    }
                    document.getElementById('weemo-buttonmute').className = "";
                    this.status.sound = "unmute";
                    if (typeof self.onCallHandler === "function") { self.onCallHandler(this, {type : "sound", status :  this.status.sound}); }
                } else {
                    controlCall(this.callId, "sound", "unmute");
                }
            };
            this.settings = function () {
                if(connectWith === "webrtc") {
                    // Not use
                } else {
                    controlCall(this.callId, "settings", "show");
                }
            };
            this.shareStart = function () {
                if(connectWith === "webrtc") {
                    // Not use
                } else {
                    controlCall(this.callId, "share_local", "start");
                }
            };
            this.pip = function () {
                if(connectWith === "webrtc") {
                    var selfview = document.getElementById("weemo-selfview");
                    if(selfview != undefined) {
                        selfview.style.display = "block";
                    }
                    document.getElementById('weemo-buttonnopip').className = "";
                } else {
                    controlCall(this.callId, "pip", "show");
                }
            };
            this.noPip = function () {
                if(connectWith === "webrtc") {
                    var selfview = document.getElementById("weemo-selfview");
                    if(selfview != undefined) {
                        selfview.style.display = "none";
                    }
                    document.getElementById('weemo-buttonnopip').className = "active";
                } else {
                    controlCall(this.callId, "pip", "hide");
                }
            };
        },
        getCallwindowDefaultPositionInternal = function(){ sendMessage('<get type="callwindowdefaultposition" />'); },
        setCallwindowDefaultPositionInternal = function(val){ sendMessage('<set callwindowdefaultposition="'+val+'"></set>'); },
        sm = function (action, params, data) {
            var deb,
                webRTC = webRTCCapabilities(),
                xmlhttp,
                json,
                mvs,
                wc;
            if (data !== undefined && data !== '') {
                deb = 'WEEMODRIVER TO BROWSER >>>>> ' + data + ' | STATE = ' + state + ' | ACTION = ' + action + ' | TIME = ' + new Date().toLocaleTimeString();
            } else {
                deb = 'STATE = ' + state + ' | ACTION = ' + action + ' | TIME = ' + new Date().toLocaleTimeString();
            }
            debug(deb);

            switch (state) {
            case "NOT_CONNECTED":
            case "RECONNECT":
                if (action !== "") {
                    switch (action) {
                        case "not_connected":
                        case "connect":
                            forceClose = false;

                            if (webRTC === true) {
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("webRTCCapabilities", 1); }
                            } else {
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("webRTCCapabilities", 0); }
                            }

                            if(mode === "webrtc_only") {
                                connectWith = "webrtc";
                            } else if(mode === "wd_only") {
                                connectWith = "wd";
                            }

                            if((mode === "webrtc_only" || mode === "webrtc_wd" || mode === "wd_webrtc") && connectWith === "webrtc") {
                                if (webRTC === true) {
                                    if (browser === "Chrome") {
                                        debug("---------------------------");
                                        debug("Trying to connect with webRTC");
                                        debug("---------------------------");
                                        connectWith = "webrtc";
                                    } else if(mode === "webrtc_wd" || mode === "wd_webrtc") {
                                        connectWith = "wd";
                                    } else {
                                        connectWith = "error";
                                    }
                                } else if(mode === "webrtc_wd" || mode === "wd_webrtc") {
                                    connectWith = "wd";
                                } else {
                                    connectWith = "error";
                                }
                            }

                            if (connectWith === "webrtc") {
                                if(mode === "webrtc_wd" || mode === "wd_webrtc") {
                                    attempt = 2;
                                }
                                getHap();
                            } else if(connectWith !== "error") {
                                if(attempt === 0 && (mode === "webrtc_wd" || mode === "wd_webrtc")) {
                                    attempt = 1;
                                }
                                debug("---------------------------");
                                debug("Attemp : " + attempt);
                                debug("---------------------------");

                                if (os !== "linux" && os !== "unix" && os !== "Linux" && os !== "Unix") {
                                        if (websock !== null && websock !== undefined) {
                                            debug("BROWSER WEBSOCKET READYSTATE : " + websock.readyState);
                                            websock.onopen = null;
                                            websock.onclose = null;
                                            websock.onmessage = null;
                                            websock.onerror = null;
                                            websock = null;
                                        }

                                        if (downloadTimeout === null) {
                                            downloadTimeout = setTimeout(function () {
                                                downloadMethod();
                                            }, downloadTimeoutValue);
                                        }
                                        connectTimeout = setTimeout(createConnection, connectionDelay);
                                    } else {
                                        if (typeof self.onConnectionHandler  === "function") { self.onConnectionHandler("unsupportedOS", 0); }
                                        if(mode === "webrtc_wd" || mode === "wd_webrtc") {
                                            connectWith = "webrtc";
                                            sm("not_connected");
                                        }
                                    }
                            } else {
                                if (typeof (self.onConnectionHandler) === "function") { self.onConnectionHandler("browserCompatibilityError", 0); };
                            }
                            break;

                        case "hapNok":
                            if (typeof self.onConnectionHandler  === "function") { self.onConnectionHandler("unableToReachHap", 0); }
                            if(mode === "webrtc_wd" || mode === "wd_webrtc") {
                                connectWith = "wd";
                                sm("connect");
                            }
                            break;

                        case "hapOk":
                            if (typeof self.onConnectionHandler  === "function") { self.onConnectionHandler("hapOk", 0); }
                            break;

                        case "probesOk":
                            if (typeof self.onConnectionHandler  === "function") { self.onConnectionHandler("probesOk", params); }
                            break;

                        case "probesNok":
                            if (typeof self.onConnectionHandler  === "function") { self.onConnectionHandler("unableToReachProbes", 0); }
                            if(mode === "webrtc_wd" || mode === "wd_webrtc") {
                                connectWith = "wd";
                                sm("connect");
                            }
                            break;

                        case "connected":
                        case "connectedWebRTC":
                            clearTimeout(connectTimeout);
                            clearTimeout(downloadTimeout);
                            /*if (state === "RECONNECT") {
                             state = "CONNECTED_WEEMO_DRIVER";
                             //sm("connect");
                             } else {*/
                            state = "CONNECTED_WEEMO_DRIVER";
                            //}

                            if (action === "connectedWebRTC") {
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("connectedWebRTC", 0); }
                            } else {
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("connectedWeemoDriver", 0); }
                            }
                            sm('connect');
                            break;

                        case "createCall":
                        case "getStatus":
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("initializationIncomplete", 0); }// Initialization not completed
                            break;
                    }
                }
                break;

            case "CONNECTED_WEEMO_DRIVER":
                if (action !== "") {
                    switch (action) {
                    case "forceConnect":
                    case "onReadyforconnection":
                    case "connect":
                        connect();
                        state = "AUTHENTICATING";
                        break;
                    case "not_connected":
                        if (typeof self.onConnectionHandler  === "function") { self.onConnectionHandler("disconnectedWeemoDriver", 0); }
                        state = "NOT_CONNECTED";
                        if (forceClose === false) { sm("connect"); }
                        break;

                    case "createCall":
                    case "getStatus":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("initializationIncomplete", 0); }// Initialization not completed
                        break;

                    case "hold":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler(action, 0); }
                        break;
                        
                    case "getWdVersion":
                    	sendMessage("<get type='version'></get>");
                        break;

                    default:
                    }
                }
                break;

            case "AUTHENTICATING":
                if (action !== "") {
                    switch (action) {
                    case "onConnect":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("connectedWeemoDriver", 0); }
                        break;

                    case "onConnectionFailed":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("disconnectedWeemoDriver", 0); }
                        break;

                    case "onReadyforconnection":
                        clearTimeout(connectTimeout);
                        connect();
                        break;
                    case 'pingNok': // WebRTC
                    	if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("unableToReachMgmt", 0); }
                        if(mode === "wd_webrtc" || mode === "webrtc_wd") { 
                            state = "NOT_CONNECTED"; connectWith = "wd"; sm("not_connected"); // switch to wd
                        }
                        break;
                    case 'pingOk':  // WebRTC
                    case "forceConnect":
                    case "onReadyforauthentication":
                        clearTimeout(connectTimeout);
                        if (weemoType === "internal" || weemoType === "external") {
                            if (endpointUrl !== "" && weemoType === "internal") {
                                if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                                    xmlhttp = new XMLHttpRequest();
                                } else {// code for IE6, IE5
                                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                                }
                                xmlhttp.onreadystatechange = function () {
                                    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                                        data = JSON.parse(xmlhttp.responseText);
                                        token = data.token;
                                        verifyUser(force);
                                    }

                                    if (xmlhttp.readyState === 4 && xmlhttp.status === 500) {
                                        json = JSON.parse(xmlhttp.responseText);
                                        if (json.error) {
                                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("weemoAuthApiError", json.error); }
                                        }
                                        if (json.error_description) {
                                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("weemoAuthApiError", json.error_description); }
                                        }
                                    }
                                };
                                xmlhttp.open("GET", endpointUrl, true);
                                xmlhttp.setRequestHeader("Cache-Control", "no-cache");
                                xmlhttp.send();
                            } else {
                                verifyUser(force);
                            }

                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("connectedCloud", 0); }
                        } else {
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("weemoTypeNotExist", 0); }
                        }
                        break;

                    case "onVerifiedUserOk":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("authenticated", 0); }
                        break;

                    case "loggedasotheruser":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("loggedasotheruser", 0); }
                        break;

                    case "hold":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("loggedonotherdevice", 0); }
                        state = "CONNECTED_WEEMO_DRIVER";
                        break;

                    case "audioOk":
                    case "audioNok":
                    case "sipNok":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler(action, 0) };
                            if(connectWith === "webrtc" && (mode === "wd_webrtc" || mode === "webrtc_wd")) {
                                connectWith = "wd";
                                state = "NOT_CONNECTED";
                                sm('connect');
                            }
                        break;

                    case "sipOk":
                    	if(connectWith != "webrtc") {
                    		sendMessage("<get type='version'></get>");
                    	}
                        callObjects.splice(0, callObjects.length);
                        state = "CONNECTED";
                        if (displayName !== undefined && displayName !== "" && displayName !== null) { sendDisplayName(); }
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler(action, 0); }
                        break;

                    case "onVerifiedUserNok":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("unauthenticated", 0); }
                        state = "CONNECTED_WEEMO_DRIVER";

                        // Error
                        if (params.error) {
                            switch (params.error) {
                            case "9":
                                state = "CONNECTED_WEEMO_DRIVER";
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 9); }
                                debug("Allocation: Provider not recognized (err " + params.error + ")");
                                break;

                            case "10":
                                state = "CONNECTED_WEEMO_DRIVER";
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 10); }
                                debug("Allocation: Domain not recognized (err " + params.error + ")");
                                break;

                            case "11":
                                state = "CONNECTED_WEEMO_DRIVER";
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 11); }
                                debug("Allocation: Provider not enabled (err " + params.error + ")");
                                break;

                            case "12":
                                state = "CONNECTED_WEEMO_DRIVER";
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 12); }
                                debug("Allocation: Domain not enabled (err " + params.error + ")");
                                break;

                            case "13":
                                state = "CONNECTED_WEEMO_DRIVER";
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 13); }
                                debug("Allocation: No such user (err " + params.error + ")");
                                break;

                            case "14":
                                state = "CONNECTED_WEEMO_DRIVER";
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 14); }
                                debug("Token: token is too short (err " + params.error + ")");
                                break;

                            case "15":
                                state = "CONNECTED_WEEMO_DRIVER";
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 15); }
                                debug("WeemoDriver: Internal error (err " + params.error + ")");
                                break;

                            default:
                                debug("Error message : General error. Please contact support (err " + params.error + ")");
                            }
                        }
                        break;

                    case "not_connected":
                        if(connectWith === "webrtc")
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("disconnectedWebRTC", 0); }
                        else
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("disconnectedWeemoDriver", 0); }


                        if (forceClose === false) {
                            state = "RECONNECT";
                            sm("connect");
                        } else {
                            state = "NOT_CONNECTED";
                        }
                        break;

                    case "createCall":
                    case "getStatus":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("initializationIncomplete", 0); }// Initialization not completed
                        break;

                    case "dropped":
                    case "kicked":
                        break;
                        
                    case "getProfile":
                    	getProfileInternal();
                    	break;
                    	
                    case "getDomainStatus":
                    	getDomainStatusInternal(params.domain);
                    	break;
                    	
                    case "set":
                        if (params.name === "displayName") { displayName = params.value; }
                        if (typeof self.onGetHandler === "function") { self.onGetHandler(params.name, params); }
                        break;
                        
                    case "getWdVersion":
                    	sendMessage("<get type='version'></get>");
                        break;

                    default:
                    }
                }
                break;

            case "CONNECTED":
                if (action !== "") {
                    switch (action) {
                    case "createCall":
                        if (connectWith === "webrtc") {
                            if(globalcall === undefined || globalcall === null) {
                                callout = 1;
                                debug('-------------------')
                                debug('Federation: ' + federation);
                                debug('Hash_type: ' + hash_type);
                                if(params.type === "attendee" || params.type === "host") {
                                    mvs = params.uidToCall.substr(0, 4);
                                    if (mvs !== "nyc1" && mvs !== "par1" && mvs !== "par2" && mvs !== "ldn1" && mvs !== "ldn2" && mvs !== "nyc2" && mvs !== "sfo2" && mvs !== "hkg2") {
                                        if (hap === "ppr/") { mvs = "ldn2"; } else { mvs = "nyc2"; }
                                    } else {
                                        params.uidToCall = params.uidToCall.substring(4);
                                    }

                                    if(params.type === "attendee") {
                                        if(federation == 1) {
                                            params.uidToCall = "999-" + mvs +  utils.sha1(providerid + domainid + params.uidToCall);
                                            debug("Uid called : " + params.uidToCall);
                                        } else if(federation == 2) {
                                            params.uidToCall = "999-" + mvs +  utils.sha1(providerid + params.uidToCall);
                                            debug("Uid called : " + params.uidToCall);
                                        } else if (federation == 3)  {
                                            params.uidToCall = "999-" + mvs +  utils.sha1(hash_type + params.uidToCall);
                                            debug("Uid called : " + params.uidToCall);
                                        }
                                    }

                                    if(params.type === "host") {
                                        params.uidToCall = "998-" + mvs + uid;
                                        debug("Uid called : " + "998-" + mvs + uid);
                                    }

                                    var constraints = {
                                        mandatory: {
                                            minWidth: 320,
                                            minAspectRatio: 1.777,
                                            maxAspectRatio: 1.778
                                        }
                                    };

                                    weemoApp.call('sip:' + params.uidToCall, {'mediaConstraints': { 'audio': true, 'video': constraints}});
                                } else {
                                    if(weemoType !== "external") {
                                        var constraints = {
                                            mandatory: {
                                                minWidth: 320,
                                                minAspectRatio: 1.777,
                                                maxAspectRatio: 1.778
                                            }
                                        };
                                        if(federation == 1) {
                                            weemoApp.call('sip:' + utils.sha1(providerid + domainid + params.uidToCall), {'mediaConstraints': { 'audio': true, 'video': constraints}, 'extraHeaders':['X-display-name: ' + params.displayNameToCall]} );
                                            debug("Uid called : " + utils.sha1(providerid + domainid + params.uidToCall));
                                        } else if(federation == 2) {
                                            weemoApp.call('sip:' + utils.sha1(providerid + params.uidToCall), {'mediaConstraints': { 'audio': true, 'video': constraints}, 'extraHeaders':['X-display-name: ' + params.displayNameToCall]});
                                            debug("Uid called : " + utils.sha1(providerid + params.uidToCall));
                                        } else if (federation == 3) {
                                            weemoApp.call('sip:' + utils.sha1(hash_type + params.uidToCall), {'mediaConstraints': { 'audio': true, 'video': constraints}, 'extraHeaders':['X-display-name: ' + params.displayNameToCall]});
                                            debug("Uid called : " + utils.sha1(hash_type + params.uidToCall));
                                        }
                                    } else {
                                        var call = new WeemoCall();
                                        if (typeof self.onCallHandler === "function") { self.onCallHandler(call, {type : "webRTCcall", status : "failed", reason: "not allowed"}); }
                                    }
                                }
                            } else {
                                var call = new WeemoCall();
                                if (typeof self.onCallHandler === "function") { self.onCallHandler(call, {type : "webRTCcall", status : "failed", reason: "not allowed"}); }
                            }
                        } else {
                            if (displayName !== "" && displayName !== undefined) {
                                if (params.uidToCall !== undefined && params.uidToCall !== "" && params.type !== undefined && params.type !== "" && params.displayNameToCall !== undefined && params.displayNameToCall !== "") {
                                    if (params.type === "host" || params.type === "attendee") {
                                        mvs = params.uidToCall.substr(0, 4);
                                        if (mvs !== "nyc1" && mvs !== "par1" && mvs !== "par2" && mvs !== "ldn1" && mvs !== "ldn2" && mvs !== "nyc2" && mvs !== "sfo2" && mvs !== "hkg2") {
                                            if (hap === "ppr/") { params.uidToCall = "ldn2" + params.uidToCall; } else { params.uidToCall = "nyc2" + params.uidToCall; }
                                        }
                                    }
                                    calledContact = params.displayNameToCall;
                                    debug("Uid called : " + params.uidToCall);
                                    sendMessage("<createcall uid='" + params.uidToCall + "' displayname='" + params.displayNameToCall + "' type='" + params.type + "'></createcall>");
                                } else {
                                    debug("uidToCall, type and displayNameToCall must be set");
                                }
                            } else {
                                if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 16); }// Displayname is empty
                            }
                        }
                        break;

                    case "callCreated":
                        if (params.createdCallId !== "-1") {
                            wc = new WeemoCall(params.createdCallId, params.direction, params.displayNameToCall, self);
                            callObjects[params.createdCallId] = wc;
                            if (params.direction === "out") {
                                if (calledContact === params.displayNameToCall) {
                                    callObjects[params.createdCallId].accept();
                                }
                                calledContact = '';
                            } else {
                                callObjects[params.createdCallId].status.call = "incoming";
                                if (typeof self.onCallHandler === "function") { self.onCallHandler(callObjects[params.createdCallId], {type : "call", status : "incoming"}); }
                            }
                        }
                        break;

                    case "dropped":
                    case "kicked":
                        calledContact = "";
                        longpollId = null;
                        token = null;
                        displayName = '';
                        callObjects = [];
                        attempt = 0;
//                        state = "CONNECTED_WEEMO_DRIVER";
                        state = "NOT_CONNECTED";

                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler(action, 0); }
                        break;

                    case "setDisplayName":
                        sendDisplayName();
                        break;

                    case 'setCallwindowDefaultPosition':
                        if(connectWith === "webrtc") {
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("notUseInThisMode", 0); }
                        } else {
                            setCallwindowDefaultPositionInternal(params.value);
                        }
						break;
					    
                    case 'getCallwindowDefaultPosition':
                        if(connectWith === "webrtc") {
                            // Call an handler ?
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("notUseInThisMode", 0); }
                        } else {
                            getCallwindowDefaultPositionInternal();
                        }
					    break;

                    case "audioOk":
                    case "audioNok":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler(action, 0); }
                        break;

                    case "sipNok":
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("sipNok", 0); }
                        calledContact = "";

                        if (connectWith !== "webrtc") {
                            state = "CONNECTED_WEEMO_DRIVER";
                        } else {
                            state = "AUTHENTICATING";
                        }
                        break;

                    case "set":
                        if (params.name === "displayName") { displayName = params.value; }

                        if (typeof self.onGetHandler === "function") { self.onGetHandler(params.name, params); }
                        break;

                    case "getStatus":
                        getStatusInternal(params.uidStatus);
                        break;

                    case "onCallStatusReceived":
                        switch (params.type) {
                        case "call":
                            callObjects[params.id].status.call = params.status;
                            if(params.status === "terminated") {
                                callObjects[params.id].status.reason = params.reason;
                            }

                            break;

                        case "video_local":
                            callObjects[params.id].status.video_local = params.status;
                            break;

                        case "video_remote":
                            callObjects[params.id].status.video_remote = params.status;
                            break;

                        case "sound":
                            callObjects[params.id].status.sound = params.status;
                            break;
                        }
                        if (typeof self.onCallHandler === "function") {
                            if(params.reason != "" && params.reason != undefined && params.reason != null) {
                                self.onCallHandler(callObjects[params.id], {type : params.type, status : params.status, reason: params.reason});
                            } else {
                                self.onCallHandler(callObjects[params.id], {type : params.type, status : params.status});
                            }

                        }
                        if (params.status === "terminated") {
                            callObjects[params.id] = new Object();
                        }
                        break;

                    case "not_connected":
                        calledContact = "";

                        if(connectWith === "webrtc") {
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("disconnectedWebRTC", 0); }
                        } else {
                            if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("disconnectedWeemoDriver", 0); }
                        }

                        if (forceClose === false) {
                            state = "RECONNECT";
                            sm("connect");
                        } else {
                            state = "NOT_CONNECTED";
                        }
                        break;
                        
                    case "getProfile":
                    	getProfileInternal();
                    	break;
                    	
                    case "getDomainStatus":
                    	getDomainStatusInternal(params.domain);
                    	break;
                    	
                    case "getWdVersion":
                    	sendMessage("<get type='version'></get>");
                        break;
                    }
                }
                break;

            default:
            }

            // Error
            if (action === "error") {
                debug("Error id : " + params.message);
                switch (params.message) {
                case "1":
                    state = "CONNECTED_WEEMO_DRIVER";
                    debug("Long poll: Internal WebService init error (err " + params.error + ")");
                    sm("connect");
                    break;

                case "2":
                    debug("Long poll: Wrong WebService init session (err " + params.error + ")");
                    polling();
                    break;

                case "3":
                    debug("Long poll: WebService init syntax error (err " + params.error + ")");
                    break;

                case "4":
                    debug("Long poll: Internal WebService verify error (err " + params.error + ")");
                    break;

                case "5":
                    debug("WebService verify syntax error (err " + params.error + ")");
                    break;

                case "6":
                    debug("Wrong credentials (err " + params.error + ")");
                    state = "CONNECTED_WEEMO_DRIVER";
                    sm("connect");
                    break;

                case "7":
                    state = "CONNECTED_WEEMO_DRIVER";
                    if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 7); }
                    debug("Cloud connection: Can\'t connect to the Cloud (err " + params.error + ")");
                    clearTimeout(connectTimeout);
                    connectTimeout = setTimeout(function () { sm("connect"); }, 3000);
                    break;

                case "8":
                    if (state !== "AUTHENTICATING" && state !== "CONNECTED_WEEMO_DRIVER") {
                        state = "CONNECTED_WEEMO_DRIVER";
                        if (typeof self.onConnectionHandler === "function") { self.onConnectionHandler("error", 8); }
                        debug("Cloud connection: Disconnected from the Cloud (err " + params.error + ")");
                        clearTimeout(connectTimeout);
                        connectTimeout = setTimeout(function () { sm("connect"); }, 3000);
                    }
                    break;

                default:
                    debug("Error message : General error. Please contact support (err " + params.error + ")");
                }
            }
        },
        jQuerySendMessage = function(obj) {
    		data = obj;
    		data = utils.trim(data.x);
    		var pos = utils.strpos(data, ":");
    		if(pos !== false) { 
    			var responseId = data.substring(0, pos);
    			data = data.substring(pos+1); 
    		}
            if(data != "" && data != undefined && responseId != undefined && responseId == longpollId) {
        		try { handleData(data); }
        		catch(err) { debug(err); }
            }
            
    	},
        jQueryPolling = function(obj) {
    		sm('connected');
    		data = obj;
    		if(data != "" && data != undefined) {
                var pos = utils.strpos(data.x, ":");
                if(pos !== false) {
                	var responseId = data.x.substring(0, pos);
                	if(responseId == longpollId) {
                		data.x = data.x.substring(pos+1);
                        handleData(data.x);
                        polling();
                    }
                } else {
                	polling();
                }
            }
    	},
        extractVideoFlowInfo = function(res, allStats) {
        var description = '';
        var bytesNow = res.stat('bytesReceived');
        if (timestampPrev > 0) {
            var bitRate = Math.round((bytesNow - bytesPrev) * 8 / (res.timestamp - timestampPrev));
            description = bitRate + ' kbits/sec';
        }
        timestampPrev = res.timestamp;
        bytesPrev = bytesNow;
        if (res.stat('transportId')) {
            component = allStats.get(res.stat('transportId'));
            if (component) {
                addresses = allStats.collectAddressPairs(component.id);
                if (addresses.length > 0) {
                    description += ' from IP ';
                    description += addresses[0].stat('googRemoteAddress');
                } else {
                    description += ' no address';
                }
            } else {
                description += ' No component stats';
            }
        } else {
            description += ' No component ID';
        }
        return description;
        },
    	setBrowserInfo = function () {
            var unknown = 'Unbekannt';
            // screen
            var width,
                height;
            if (screen.width) {
                width = (screen.width) ? screen.width : '';
                height = (screen.height) ? screen.height : '';
                screenSize = width + " x " + height;
            }

            //browser
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            browser = navigator.appName;
            browserVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // Opera
            if ((verOffset = nAgt.indexOf('Opera')) != -1) {
                browser = 'Opera';
                browserVersion = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                	browserVersion = nAgt.substring(verOffset + 8);
                }
            }
            // MSIE
            else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
                browser = 'Microsoft Internet Explorer';
                browserVersion = nAgt.substring(verOffset + 5);
            }

            //IE11
            else if ((verOffset = nAgt.indexOf('Trident/7.')) != -1) {
                browser = 'Microsoft Internet Explorer';
                if ((verOffset = nAgt.indexOf('rv:')) != -1) {
                    browserVersion = nAgt.substring(verOffset + 3, verOffset + 7);
                }
            }
            // Chrome
            else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
                browser = 'Chrome';
                browserVersion = nAgt.substring(verOffset + 7);
            }
            // Safari
            else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
                browser = 'Safari';
                browserVersion = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                	browserVersion = nAgt.substring(verOffset + 8);
                }
            }
            // Firefox
            else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
                browser = 'Firefox';
                browserVersion = nAgt.substring(verOffset + 8);
            }
            // Other browsers
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browser = nAgt.substring(nameOffset, verOffset);
                browserVersion = nAgt.substring(verOffset + 1);
                if (browser.toLowerCase() == browser.toUpperCase()) {
                    browser = navigator.appName;
                }
            }
            // trim the version string
            if ((ix = browserVersion.indexOf(';')) != -1) browserVersion = browserVersion.substring(0, ix);
            if ((ix = browserVersion.indexOf(' ')) != -1) browserVersion = browserVersion.substring(0, ix);

            majorVersion = parseInt('' + browserVersion, 10);
            if (isNaN(majorVersion)) {
            	browserVersion = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            // mobile version
            mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

            // cookie
            var cookieEnabled = (navigator.cookieEnabled) ? true : false;

            if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
                document.cookie = 'testcookie';
                cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
            }

            // system
            os = unknown;
            var clientStrings = [
                {s:'Windows 3.11', r:/Win16/},
                {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
                {s:'Windows 98', r:/(Windows 98|Win98)/},
                {s:'Windows CE', r:/Windows CE/},
                {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
                {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
                {s:'Windows Server 2003', r:/Windows NT 5.2/},
                {s:'Windows Vista', r:/Windows NT 6.0/},
                {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
                {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
                {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
                {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
                {s:'Windows ME', r:/Windows ME/},
                {s:'Android', r:/Android/},
                {s:'Open BSD', r:/OpenBSD/},
                {s:'Sun OS', r:/SunOS/},
                {s:'Linux', r:/(Linux|X11)/},
                {s:'iOS', r:/(iPhone|iPad|iPod)/},
                {s:'Mac OS X', r:/Mac OS X/},
                {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
                {s:'QNX', r:/QNX/},
                {s:'UNIX', r:/UNIX/},
                {s:'BeOS', r:/BeOS/},
                {s:'OS/2', r:/OS\/2/},
                {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
            ];
            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(nAgt)) {
                    os = cs.s;
                    break;
                }
            }

            osVersion = unknown;
            if (/Windows/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS X':
                    osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'Android':
                    osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'iOS':
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    break;

            }
        };
        
    if (pDebugLevel !== undefined) { debugLevel = pDebugLevel; }
    if (pDisplayName !== undefined) { displayName = pDisplayName; }
    if (browser === 'Microsoft Internet Explorer' && browserVersion < 11) { downloadTimeoutValue = 20000; } else { downloadTimeoutValue = 8000; } // 6000 is not long enough
    /**
     * <b>WeemoDriver only</b>
     * This function generates a coredump.
     *
     */
    this.coredump = function () { sendMessage('<coredump></coredump>'); };
    /**
     * <b>WeemoDriver only</b>
     * This function returns the download url.
     *
     * @returns {string} Value of the download url.
     */
    this.getDownloadUrl = function() {
        return downloadUrl;
    };

    /**
     * <b>WeemoDriver only</b>
     * This function returns the version of the WeemoDriver url.
     *
     * @returns {string} Value of the vweemodriver version.
     */
    this.getWdVersion = function () { sm('getWdVersion'); };

    /**
     * <b>WeemoDriver only</b>
     * Sets the default coordinates of the callwindow when appearing.
     * @param {string} value - The value of the coordinates.
     */
    this.setCallWindowDefaultPosition = function(value) { callwindowDefaultPosition = value; var obj = new Object(); obj.value = value; sm('setCallwindowDefaultPosition', obj); };

    /**
     * <b>WeemoDriver only</b>
     * Gets the default coordinates of the callwindow
     * @return {string} The value of the position.
     */
    this.getCallWindowDefaultPosition = function() { sm('getCallwindowDefaultPosition'); };
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This function set the unique Token value to identify the session.
     * <br/>
     * Token must respect naming rules:<br/>
     * Min size = 6 characters;<br/>
     * Max size = 90 characters;<br/>
     * Authorized characters: UTF8 - unicode - Latin basic, except: & " # \ % ? [space]<br/>
     * Case sensitive, no space character.<br/>
     * 
     * @param {string} Value of the token to set.
     * 
     */
    this.setToken = function (value) { token = value; };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This function set the assigned Web Application Referer to WeemoDriver, Web Application Referer is provided by Weemo.
     * 
     * @param {string} Value of the Web Application Referer to set.
     * 
     */
    this.setWebAppId = function (value) { webAppId = value; };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This function is used in case of debugging and activates the console log into browser.
     * 
     * values are:<br />
     * <br />
     * 0: To desactivate debug messages<br />
     * 1: To activate first level of debug messages<br />
     * 2: 1 + JsSIP logs<br />
     * 3: 2 + sip traces<br /><br />
     * @param {string} Value of the debug level to set.
     * 
     */
    this.setDebugLevel = function (value) { debugLevel = value; };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This method set the name of the user displayed on Weemo applications.
     * 
     * Display Name must respect naming rules:<br />
     * <ul>
     * <li>String â€“ max 127 characters</li>
     * <li>Not Null</li>
     * <li>UTF-8 Characters execpt: " '</li>
     * </ul>
     * Case sensitive, no space character.
     * 
     * @param {string} Value of the display name to set.
     * 
     */
    this.setDisplayName = function (value) { displayName = value; sm('setDisplayName'); };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This method permits to set the type of user.
     * 
     * @param {string} weemoType - This variable can takes 2 values: "internal" or "attendee"
     */
    this.setWeemoType = function (value) { weemoType = value; };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This method permits to set the platform where WeemoDriver connects.
     * 
     * @param {string} value - This variable takes the token value of the platform ("prod/", "ppr/", "qualif/", "dev/"). If you don't set a platform, the platform is set by default at "prod/"
     */
    this.setHap = function (value) { hap = value; };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This method returns the value of the current Javascript API version.
     * 
     * @returns {string} Weemo.js version.
     */
    this.getVersion = function () { return version; }; // Js version or wd version ?
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * Get the current user's display name.
     * 
     * @returns {String} Value of the current user's display name. 
     */
    this.getDisplayName = function () { return displayName; };

    /**
     * <b>WeemoDriver and WebRTC</b>
     * This method fetches the Allocation register status of an UID and returns two values into a callback (0 or 1) and the value of requested UID, to identify the request. <br />
     * Allocation register status are linked to server configuration, the SIP timeout could be a bit longer in case of crash or network problem. <br />
     * In case of a normal Disconnect by UID contact, the WeemoDriver signs out the user from the allocation server immediately. <br />
     * In case of a normal Disconnect by UID contact, the WeemoDriver signs out the user from the allocation server immediately. <br />
     * You need to use the onGetHandler to catch the answer. <br />
     * 
     * @param {string} Value of the target user uid.
     * @returns {int} 0: the requested user isnâ€™t registered on Weemo SIP Servers or 1: the requested user is registered on Weemo SIP Servers.
     * @returns {String} the requested UID
     *  
     */
    this.getStatus = function (uidStatus) { var obj = Object.create(null); obj.uidStatus = uidStatus; sm('getStatus', obj); };

    /**
     * <b>WeemoDriver and WebRTC</b>
     * This method returns the token in use on your session.
     * 
     * @returns {String} Value of the current user's token.
     */
    this.getToken = function () { return token; };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This method returns the last Web Application Identifier set on the WeemoDriver.
     * 
     * @returns {String} Last Web Application Identifier.
     */
    this.getWebAppId = function () { return webAppId; };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * Launches the connection between WeemoDriver and Javascript.<br />
     * <br />
     * If the connection with WeemoDriver worked, you should receive a notification by a callback in onConnectionHandler to inform that you are correctly connected to WeemoDriver:<br />
     * <br />
     * onConnectionHandler("connectedWeemoDriver")<br />
     * <br />
     * If the initialize method don't find WeemoDriver (can't open a socket to talk with), the applicaion will receive a dedicated callback:<br />
     * <br />
     * onWeemoDriverNotStarted(downloadUrl)<br />
     * <br />
     * This callback is used only in case of WeemoDriver detection failed, you can have the downlink url in "downloadUrl" variable.<br />
     * <br />
     * Other possible Callbacks during initialization phase:<br />
     * <br />
     * onConnectionHandler("webRTCCapabilities")<br />
     * Used when the Javascript API detects our WebRTC browser capability.<br />
     * <br />
     * onConnectionHandler("unsupportedOS")<br />
     * Used when the Javascript API detects that your Operating System is not compatible with any WeemoDriver or WebRTC protocol.<br />
     */
    this.initialize = function () { sm('connect');  };
    
    /**
     * <b>WeemoDriver & WebRTC</b>
     * This method starts<b>[1]</b> the connection from WeemoDriver to Weemoâ€™s Cloud<br />
     * You have to use this method after you receive a "connectedToWeemoDriver" call back.<br />
     * <br />
     * Basic Authenticate:<br />
     * For a normal authentication you should receive 3 callbacks from the connectionHandler to inform you if you are correctly conencted to the Weemo Cloud: <br />
     * <br />
     * onConnectionHandler("authenticated")<br />
     * onConenctionHandler("audioOk")<br />
     * onConnectionHandler("sipOk")<br />
     * <br />
     * Once you received "sipOk" notification, you can receive or send a call.<br />
     * <br />
     * Force Authenticate:<br />
     * Socket A is connected, Socket B begins authentication with a different token. The socket B will begins authenticate, and should receive a notification by a callback from the connectionHandler that a other user is already logged with WeemoDriver:<br />
     * <br />
     * onConnectionHandler("loggedasotheruser")<br />
     * <br />
     * If you want to take the hand with you application talking on socket B, you have to resend a authenticate method with a integer in parameter:<br />
     * <br />
     * weemo.authenticate(1);<br />
     * <br />
     * ... and you will receive 3 callbacks from the connectionHandler to inform you if you are correctly conencted to the Weemo Cloud:<br />
     * <br />
     * onConnectionHandler("authenticated")<br />
     * onConenctionHandler("audioOk")<br />
     * onConnectionHandler("sipOk")<br />
     * <br />
     * After the first callback "authenticated", the socket A will receive a notification in onConnectionHandler to inform the application that she is kicked.<br />
     * <br />
     * onConnectionHandler("kicked")<br />
     * <br />
     * Once socket B received "sipOk" notification, the aplication B is ready to receive or send a call.<br />
     * <br />
     * Multiple Authenticate:<br />
     * Socket A is connected, Socket B begins authentication with same credentials (WebAppId & Token) but with a different display name. After the basic authenticate the weemodriver will broadcast the new displayName (last entered) to all open sockets by a onGetHandler.<br />
     * <br />
     * onGetHandler("displayName", "the last Displayname");<br /><br />
     * <b>[1] This method is automatically called since 5.0.2104</b>
     *
     * @param {bool} force - Set true or 1 to enable force connection
     *
     */
    this.authenticate = function (f) { if (f !== undefined && f !== false) { force = true; sm('forceConnect'); } };
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * This command is used to handle a call process, regardless the type of the call.<br />
     * <br />
     * 1 to 1 call:<br />
     * <br />
     * weemo.createCall("CALLEE_UID", "internal", "CALLEE_DISPLAYNAME")<br />
     * <br />
     * <br />
     * Value of uidToCall is the destination uid (the callee)<br />
     * Value of type is "internal"<br />
     * Value of displayNameToCall is the destination Display Name (the callee)<br />
     * <br />
     * Create a conference room:<br />
     * <br />
     * weemo.createCall("YOUR_UID", "host", "YOUR_DISPLAYNAME")<br />
     * <br />
     * <br />
     * Value of uidToCall is you uid (conference host)<br />
     * Value of type is "host"<br />
     * Value of displayNameToCall is your Display Name (conference host)<br />
     * <br />
     * Join a conference room:<br />
     * <br />
     * weemo.createCall("HOST_UID", "attendee", "YOUR_DISPLAYNAME")<br />
     * <br />
     * <br />
     * Value of uidToCall is the host of the conference<br />
     * Value of type is "attendee"<br />
     * Value of displayNameToCall is your Display Name (attendee)<br />
     * <br />
     * UID must respect naming rules:<br />
     * Min size = 6 characters;<br />
     * Max size = 90 characters;<br />
     * Authorized characters: UTF8 - unicode - Latin basic, except: & " # \ % ? [space] <br />
     * Case sensitive, no space character.<br />
     * <br />
     * <br />
     * Display Name must respect naming rules:<br />
     * String â€“ max 127 characters<br />
     * Not Null<br />
     * UTF-8 Characters execpt: " ' <br />
     * 
     * @param {string} uidToCall This variable takes the uid value of the user to call.
     * @param {string} type	This variable describes the type of call you are going to do
     * @param {string} displaynameToCall	This variable takes the displayed name value of the user to call.
     */
    this.createCall = function (uidToCall, type, displayNameToCall) {
        var obj = Object.create(null);
        obj.uidToCall = uidToCall;
        obj.type = type;
        obj.displayNameToCall = displayNameToCall;
        sm('createCall', obj);
    };

    /**
     * <b>WeemoDriver and WebRTC</b>
     * Get the profile of the authenticated user
     */
    this.getProfile = function () {
        if(connectWith === "webrtc") {
            if(conf_level != undefined) {
                var obj = new Object();
                obj.name = "domainprofile";
                obj.value = parseInt(conf_level);
                sm('set', obj);
            }
        } else {
            sm('getProfile');
        }
    };

    /**
     * <b>WeemoDriver and WebRTC</b>
     * Returns if the domain belongs to the same provider than the authenticated user
     * 
     * @param {string} domain to compare
     * @returns {string} 1 : OK, 0 : NOK
     */
    this.getDomainStatus = function (domain) {
        if(connectWith === "webrtc") {
            params.name = "domainstatus";
            params.domain = domain;
            if(domains.indexOf(domain) !== -1) {
                params.value = 1;
            } else {
                params.value = 0;
            }
            sm("set", params);
        }  else {
            var obj = Object.create(null);
            obj.domain = domain;
            sm('getDomainStatus', obj); };
        }
    
    /**
     * <b>WeemoDriver and WebRTC</b>
     * Restarts WeemoDriver completely and disconnect from the cloud
     */
    this.reset = function () {
        if(connectWith === "webrtc") {
            disconnectRTC();
        } else {
            sendMessage('<reset></reset>');
        }

        forceClose = true;
        token = null;
        webAppId = '';
        longpollId = null;
        displayName = '';
        calledContact = '';
        callObjects = [];
        attempt = 0;
    };

    // Set browser vars
    setBrowserInfo();
    debug("OS : " + os);
    debug("OS version : " + osVersion);
    debug("Is mobile : " + mobile);
    debug("Browser : " + browser);
    debug("Browser version : " + browserVersion);
    debug("JS version : " + version);
    debug("Screensize : " + screenSize);
    debug("Mode : " + mode);
    debug("---------------------------");
    debug("Use jQuery : " + useJquery);
    debug("jQuery is loaded : " + ((window.jQuery) ? 'true' : 'false'));
    debug("---------------------------");
    if(mode === "webrtc_only" || mode === "webrtc_wd" || mode === "wd_webrtc") {
    	(function(d, t) {
    	    var g = d.createElement(t),
    	        s = d.getElementsByTagName(t)[0];
    	    switch(hap) {
    	    case "dev/":
    	    	g.src = 'https://static-dev.weemo.com/2.0/js/jssip-0.4.0-devel.min.js';
    	    break;
    	    case "qualif/":
    	    	g.src = 'https://static-qualif.weemo.com/js/jssip-0.4.0-devel.min.js';
    	    break;
    	    case "ppr/":
    	    	g.src = 'https://static-ppr.weemo.com/js/jssip-0.4.0-devel.min.js';
    	    break;
    	    default:
    	    	g.src = 'https://static.weemo.com/js/jssip-0.4.0-devel.min.js';
    	    }
    	    
    	    s.parentNode.insertBefore(g, s);
    	}(document, 'script'));

        if(loadCss === true) {
            loadDefaultStyle();
        }
    }
};

/**
 * @class AugumentedStatsResponse
 * @param response
 * @constructor
 */
function AugumentedStatsResponse(response) {
    this.response = response;
    this.addressPairMap = [];
}

AugumentedStatsResponse.prototype.collectAddressPairs = function(componentId) {
    if (!this.addressPairMap[componentId]) {
        this.addressPairMap[componentId] = [];
        for (var i = 0; i < this.response.result().length; ++i) {
            var res = this.response.result()[i];
            if (res.type == 'googCandidatePair' && res.stat('googChannelId') == componentId) {
                this.addressPairMap[componentId].push(res);
            }
        }
    }
    return this.addressPairMap[componentId];
}

AugumentedStatsResponse.prototype.result = function() {
    return this.response.result();
}

// The indexed getter isn't easy to prototype.
AugumentedStatsResponse.prototype.get = function(key) {
    return this.response[key];
}
