/*************************************************************************
 * 
 * WEEMO INC.
 * 
 *  Weemo.js - v 4.0.1785
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

var Weemo = function (pAppId, pToken, pType, pHap, pDebugLevel, pDisplayName) {
    // Private properties
    var version = "4.0.1785";
    var state = "NOT_CONNECTED";
    var browser = '';
    var browserVersion = '';
    var os = 'Unknown OS';
    var protocol = "weemodriver-protocol";
    var wsUri = "wss://localhost:34679";
    var longpollUri = "https://localhost:34679";
    var self = this;
    var longpollId = null;
    var token = pToken;
    var webAppId = (pAppId != '' && pAppId != undefined) ? pAppId : "1033a56f0e68"
    var weemoAuth = true;
    var endpointUrl = '/weemo/auth/';
    var force = false;
	
	var debugLevel = 0;
	if(pDebugLevel != undefined) debugLevel = pDebugLevel;
	
	var weemoType = pType;
	
	var hap = (pHap != '' && pHap != undefined) ? pHap : 'ppr/';
	
	var displayName = '';
	if(pDisplayName != undefined) displayName = pDisplayName;
	
	var downloadTimeout = null;
	var downloadTimeoutValue = 0;
	
	if(browser == 'Explorer') {
		downloadTimeoutValue = 20000; // 15000
	} else {
		downloadTimeoutValue = 8000; // 6000 is not long enough
	}
	var pollingTimeout = 16000;
	var messageTimeout = 5000;
	var downloadUrl = '';
	var websock;
	var connectionDelay = 2000;
	var connectTimeout = null;
	var callObjects = new Array();
	var utils = new WeemoUtils();
	var calledContact = '';	
	var forceClose = false;
	
	//  Public methods
	this.setToken = function(value) { token = value; };
	this.setWebAppId = function(value) { webAppId = value; };
	this.setDebugLevel = function(value) { debugLevel = value; };
	this.setDisplayName = function(value) { displayName = value; sm('setDisplayName'); };
	this.setCallwindowDefaultPosition = function(value) { callwindowDefaultPosition = value; var obj = new Object(); obj.value = value; sm('setCallwindowDefaultPosition', obj); };
	this.setWeemoType = function(value) { weemoType = value; };
	this.setHap = function(value) { hap = value; };

	this.getVersion = function() { return version; }; // Js version or wd version ?
	this.getDisplayName = function() { return displayName; };
	this.getCallwindowDefaultPosition = function() { sm('getCallwindowDefaultPosition'); };
	this.getStatus = function(uidStatus) { var obj = new Object(); obj.uidStatus = uidStatus; sm('getStatus', obj); };
	this.getToken = function() { return token; };
	this.getWebAppId = function() { return webAppId; };
	
	this.initialize = function() { sm('connect');  };
	this.authenticate = function(f) { if(f != undefined) { force = true; sm('forceConnect'); } else { sm('connect'); }  };
	this.createCall = function(uidToCall, type, displayNameToCall) {
		var obj = new Object(); 
		obj.uidToCall = uidToCall;
		obj.type = type;
		obj.displayNameToCall = displayNameToCall;
		sm('createCall', obj);
	};
	this.coredump = function() { sendMessage('<coredump></coredump>'); };
	
	this.reset = function() { 
		sendMessage('<reset></reset>');
		forceClose = true; 
		token = '';
		webAppId = '';
		longpollId = '';
		displayName = '';
	};
	
	this.disconnect = function() {
		forceClose = true; 
		if(browser == 'Explorer') sendMessage('<disconnect></disconnect>'); else  websock.close(); 
	};

	var sm = function(action, params, data) {
		
		if(data != undefined && data != '') {
			deb = 'WEEMODRIVER TO BROWSER >>>>> ' + data + ' | STATE = ' + state + ' | ACTION = ' + action + ' | TIME = ' + new Date().toLocaleTimeString();
		} else {
			deb = 'STATE = ' + state + ' | ACTION = ' + action + ' | TIME = ' + new Date().toLocaleTimeString();
		}
		debug(deb);
		
		switch(state) {
			case "NOT_CONNECTED":
			case "RECONNECT":
				if(action != "") {
					switch(action) {
						case 'not_connected':
						case 'connect':
							forceClose = false;
							var webRTC = webRTCCapabilities();
							if(webRTC == true) {if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('webRTCCapabilities', 1); }
							else { if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('webRTCCapabilities', 0); }
							
							if(os != 'linux' && os != 'unix') {
								if(websock != null && websock != undefined) {
									debug('BROWSER WEBSOCKET READYSTATE : ' + websock.readyState);
									
									websock.onopen = null;
									websock.onclose = null;
									websock.onmessage = null;
									websock.onerror = null;
									
									websock = null;
								}
								
								if(downloadTimeout == null) {
									downloadTimeout = setTimeout(function() {
										downloadUrl = 'https://download.weemo.com/file/release/3'
										debug('BROWSER >>>>> WeemoDriver not started | TIME : ' + new Date().toLocaleTimeString());
										if(typeof(self.onWeemoDriverNotStarted) != undefined && typeof(self.onWeemoDriverNotStarted) == 'function') self.onWeemoDriverNotStarted(downloadUrl); 
									}, downloadTimeoutValue);
								}
								connectTimeout = setTimeout(createConnection, connectionDelay);
							} else {
								if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('unsupportedOS', 0);
							}
						break;
						
						case 'connected':
							clearTimeout(connectTimeout);
							clearTimeout(downloadTimeout);
							
							if(state=='RECONNECT') { state='CONNECTED_WEEMO_DRIVER'; sm('connect'); }
							else { state = 'CONNECTED_WEEMO_DRIVER'; }
							
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('connectedWeemoDriver',0);
						break;
						
						case 'createCall':
						case 'getStatus':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('initializationIncomplete', 0); // Initialization not completed
						break;
						
						
					}
				}
			break;

			case "CONNECTED_WEEMO_DRIVER":
				if(action != "") {
					switch(action) {
						case 'forceConnect':
						case 'onReadyforconnection':						
						case 'connect':
							connect();
							state = 'AUTHENTICATING';
						break;
						
						case 'not_connected':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('disconnectedWeemoDriver',0);
							state = 'NOT_CONNECTED';
							
							if(forceClose == false) { 
								sm('connect');
							} 
						break;
						
						case 'createCall':
						case 'getStatus':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('initializationIncomplete', 0); // Initialization not completed
						break;
						
						case 'hold':
                            if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler(action,0);
                    	break;

						default:	
					}
				}
			break;

			case "AUTHENTICATING":
				if(action != "") {
					switch(action) {
						case 'onConnect':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('connectedWeemoDriver', 0);
						break;
					
						case 'onConnectionFailed':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('disconnectedWeemoDriver', 0);
						break;
						
                        case 'onReadyforconnection':
                        	clearTimeout(connectTimeout);
                        	connect();
                        break;
                        
                        //case 'forceConnect':
						case 'onReadyforauthentication':
							clearTimeout(connectTimeout);
							if(weemoType == 'internal' || weemoType == 'external') {
								if(weemoAuth === true &&  weemoType == 'internal') {
									var xmlhttp;
									if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
										xmlhttp = new XMLHttpRequest();
									} else {// code for IE6, IE5
										xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
									}
									xmlhttp.onreadystatechange=function() { 
										if (xmlhttp.readyState==4 && xmlhttp.status==200) {
											data = JSON.parse(xmlhttp.responseText);
											token = data.token;
								      		verifyUser(force); 
									    }
										
										if (xmlhttp.readyState==4 && xmlhttp.status==500) {
											json = JSON.parse(xmlhttp.responseText);
											
											if (json.error) {
												if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('weemoAuthApiError',json.error);
									      	}
									      	    
									      	if(json.error_description) {
									      		if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('weemoAuthApiError',json.error_description);
									      	}
									    }
									}
									xmlhttp.open("GET",endpointUrl,true);
									xmlhttp.setRequestHeader("Cache-Control", "no-cache");
									xmlhttp.send();
								} else {
									verifyUser(force); 
								}
							
								if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('connectedCloud',0);
							} else {
								if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('weemoTypeNotExist',0);
							}
						break;
						
						case 'onVerifiedUserOk':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('authenticated',0);
						break;
						
						case 'loggedasotheruser':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('loggedasotheruser',0);
						break;
						
						case 'hold':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('loggedonotherdevice',0);
							state = 'CONNECTED_WEEMO_DRIVER';
						break;
						
						case 'audioOk':
						case 'audioNok':
						case 'sipNok':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler(action,0);
						break;
						
						case 'sipOk':
							callObjects.splice(0, callObjects.length);
							state = 'CONNECTED';
							if(displayName != undefined && displayName != '' && displayName != null) sendDisplayName();
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler(action, 0);
						break;
						
						
						case 'onVerifiedUserNok':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('unauthenticated',0);
							 state = 'CONNECTED_WEEMO_DRIVER';
							 
							 // Error
							 if(params.error) {
								switch(params.error) {								
									case '9':
										state= 'CONNECTED_WEEMO_DRIVER'; 
										if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',9);
										debug('Allocation: Provider not recognized (err '+params.error+')');
									break;
									
									case '10':
										state= 'CONNECTED_WEEMO_DRIVER'; 
										if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',10);
										debug('Allocation: Domain not recognized (err '+params.error+')');
									break;
									
									case '11':
										state= 'CONNECTED_WEEMO_DRIVER'; 
										if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',11);
										debug('Allocation: Provider not enabled (err '+params.error+')');
									break;
									
									case '12':
										state= 'CONNECTED_WEEMO_DRIVER'; 
										if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',12);
										debug('Allocation: Domain not enabled (err '+params.error+')');
									break;
									
									case '13':
										state= 'CONNECTED_WEEMO_DRIVER'; 
										if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',13);
										debug('Allocation: No such user (err '+params.error+')');
									break;
									
									
									case '14':
										state= 'CONNECTED_WEEMO_DRIVER'; 
										if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',14);
										debug('Token: token is too short (err '+params.error+')');
									break;
									
									
									case '15':
										state= 'CONNECTED_WEEMO_DRIVER'; 
										if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',15);
										debug('WeemoDriver: Internal error (err '+params.error+')');
									break;
										
									default:
										debug('Error message : General error. Please contact support (err '+params.error+')');
									}
								}
						break;
						
						case 'not_connected':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('disconnectedWeemoDriver',0);
							
							if(forceClose == false) { 
								state = 'RECONNECT';
								sm('connect');
							} else {
								state = 'NOT_CONNECTED';
							}
						break;
						
						case 'createCall':
						case 'getStatus':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('initializationIncomplete', 0); // Initialization not completed
						break;
						
						 case 'kicked':
                            
						 break;

						
						default:	
					}
				}
			break;
			
			case "CONNECTED":
				if(action != "") {
					switch(action) {
						case 'createCall':							
							if(displayName != "" && displayName != undefined) {
								if(params.uidToCall != undefined && params.uidToCall != "" && params.type != undefined && params.type != "" && params.displayNameToCall != undefined && params.displayNameToCall != "") {
										if(params.type == 'host' || params.type == 'attendee') {
											var mvs = params.uidToCall.substr(0,4);
											if(mvs != 'nyc1' && mvs != 'par1' && mvs != 'ldn1' && mvs != 'ldn2' && mvs != 'nyc2' && mvs != 'sfo2' && mvs != 'hkg2') {
												if(hap == 'ppr/') { params.uidToCall = 'ldn1'+params.uidToCall; } else { params.uidToCall = 'nyc1'+params.uidToCall; }
											}
										}
										calledContact = params.displayNameToCall;
										sendMessage('<createcall uid="'+params.uidToCall+'" displayname="'+params.displayNameToCall+'" type="'+params.type+'"></createcall>');
									
								} else {
									debug('uidToCall, type and displayNameToCall must be set');
								}
							} else {
								if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error', 16); // Displayname is empty
							}
						break;
						
						case 'callCreated':
							if(params.createdCallId != -1) {
								var wc = new WeemoCall(params.createdCallId, params.direction, params.displayNameToCall, self);
								callObjects[params.createdCallId] = wc;
								
								if(params.direction == "out") {
									if(calledContact == params.displayNameToCall) {
										callObjects[params.createdCallId].accept();	
									}
									calledContact = '';
								} else {
									callObjects[params.createdCallId].status.call = 'incoming';
									if(typeof(self.onCallHandler) != undefined && typeof(self.onCallHandler) == 'function') self.onCallHandler(callObjects[params.createdCallId], {type:'call', status:'incoming'});
								}
							}
						break;
						
						case 'kicked':
                            if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler(action,0);
                            calledContact = '';
                            state = "CONNECTED_WEEMO_DRIVER";
                    	break;

                    
						case 'setDisplayName':
							sendDisplayName();
						break;
						
						case 'audioOk':
						case 'audioNok':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler(action,0);
						break;
						
						case 'sipNok':
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('sipNok', 0);
							calledContact = '';
							state = 'CONNECTED_WEEMO_DRIVER'; 
						break;
						
						case 'set':
							if(params.name == 'displayName') { displayName = params.value; }
							
							if(typeof(self.onGetHandler) != undefined && typeof(self.onGetHandler) == 'function') self.onGetHandler(params.name, params);
						break;
						
						case 'getDisplayName':
							getDisplayNameInternal();
						break;
						
						case 'setCallwindowDefaultPosition':
							setCallwindowDefaultPositionInternal(params.value);
						break;
						
						case 'getCallwindowDefaultPosition':
							getCallwindowDefaultPositionInternal();
						break;
						
						case 'getStatus':
							getStatusInternal(params.uidStatus);
						break;
						
						case 'onCallStatusReceived':
							switch(params.type) {
								case 'call':
									callObjects[params.id].status.call = params.status;
								break;
								
								case 'video_local':
									callObjects[params.id].status.video_local = params.status;
								break;
								
								case 'video_remote':
									callObjects[params.id].status.video_remote = params.status;
								break;
								
								case 'sound':
									callObjects[params.id].status.sound = params.status;
								break;
							}
							
							if(typeof(self.onCallHandler) != undefined && typeof(self.onCallHandler) == 'function') self.onCallHandler(callObjects[params.id], {type:params.type, status: params.status});
							if(params.status == 'terminated') {
								callObjects.splice(params.id, 1);
							}
						break;
						
						case 'not_connected':
							calledContact = '';
							if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('disconnectedWeemoDriver', 0);
							if(forceClose == false) { 
								state = 'RECONNECT';
								sm('connect');
							} else {
								state = 'NOT_CONNECTED';
							}
						break;
					}
				}
			break;
			
			default: 
				
		}
		
		// Error
		if(action == 'error') {
			debug('Error id : ' + params.message);

			switch(params.message) {
				
			case '1':
				state= 'CONNECTED_WEEMO_DRIVER'; 
				debug('Long poll: Internal WebService init error (err '+params.error+')');
				sm('connect');
			break;
				
			case '2':
				debug('Long poll: Wrong WebService init session (err '+params.error+')');
				polling();
			break;
				
			case '3':
				debug('Long poll: WebService init syntax error (err '+params.error+')'); 
			break;
			
			case '4':
				debug('Long poll: Internal WebService verify error (err '+params.error+')');
			break;

			case '5':
				debug('WebService verify syntax error (err '+params.error+')'); 
			break;
			
			case '6':
				debug('Wrong credentials (err '+params.error+')'); 
				state = 'CONNECTED_WEEMO_DRIVER';
				sm('connect');
			break;

			case '7':
				state= 'CONNECTED_WEEMO_DRIVER'; 
				if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',7);
				debug('Cloud connection: Can\'t connect to the Cloud (err '+params.error+')');
				
				clearTimeout(connectTimeout);
				connectTimeout = setTimeout(function() { sm('connect'); }, 3000);
				
			break;
				
			case '8':
				if (state !== "AUTHENTICATING" && state !== "CONNECTED_WEEMO_DRIVER") {
					state= 'CONNECTED_WEEMO_DRIVER';
					if(typeof(self.onConnectionHandler) != undefined && typeof(self.onConnectionHandler) == 'function') self.onConnectionHandler('error',8);
					debug('Cloud connection: Disconnected from the Cloud (err '+params.error+')');
					
					clearTimeout(connectTimeout);
					connectTimeout = setTimeout(function() { sm('connect'); }, 3000);
				}
			break;
					
				default:
					debug('Error message : General error. Please contact support (err '+params.error+')');
			}
		}
	};
	
	//  Private methods
	var createConnection = function() {
		if(browser == 'Explorer') {
			if(longpollId == null) longpollId = uniqid();
			polling();
		} else {
			try {
		    	if(typeof MozWebSocket == 'function') WebSocket = MozWebSocket;
		    	websock = new WebSocket(wsUri, protocol);
		    	websock.onopen = function(evt) { sm('connected'); debug('BROWSER >>>>> WEBSOCKET OPEN'); };
		    	websock.onclose = function(evt) { debug('BROWSER >>>>> WEBSOCKET CLOSE'); sm('not_connected'); };
		    	websock.onmessage = function(evt) { handleData(evt.data); };
		    	websock.onerror = function(evt) {  debug('BROWSER >>>>> WEBSOCKET ERROR'); };
		    } catch(exception) {
		    	debug('BROWSER >>>>> WEBSOCKET EXCEPTION');
		    	debug(exception);
		    }
			
		}
	};

var webRTCCapabilities = function() {
	var WebRTC = new Object();
	
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
    if(WebRTC.getUserMedia && WebRTC.RTCPeerConnection && WebRTC.RTCSessionDescription) {
       return  true;
    } else {
      return false;
    }                                                   
};
	
	var setBrowserInfo = function() {
		if (navigator.userAgent.search("MSIE") >= 0) {
		    browser = 'Explorer';
		    var position = navigator.userAgent.search("MSIE") + 5;
		    var end = navigator.userAgent.search("; Windows");
		    browserVersion = parseInt(navigator.userAgent.substring(position,end));
		} else if (navigator.userAgent.search("Chrome") >= 0){
			browser = 'Chrome';// For some reason in the browser identification Chrome contains the word "Safari" so when detecting for Safari you need to include Not Chrome
		    var position = navigator.userAgent.search("Chrome") + 7;
		    var end = navigator.userAgent.search(" Safari");
		    browserVersion = parseInt(navigator.userAgent.substring(position,end));
		}
		else if (navigator.userAgent.search("Firefox") >= 0){
			browser = 'Firefox';
		    var position = navigator.userAgent.search("Firefox") + 8;
		    browserVersion = parseInt(navigator.userAgent.substring(position));
		}
		else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0){//<< Here
			browser = 'Safari';
		    var position = navigator.userAgent.search("Version") + 8;
		    var end = navigator.userAgent.search(" Safari");
		    browserVersion = parseInt(navigator.userAgent.substring(position,end));
		}
		else if (navigator.userAgent.search("Opera") >= 0){
			browser = 'Opera';
		    var position = navigator.userAgent.search("Version") + 8;
		    browserVersion = parseInt(navigator.userAgent.substring(position));
		}
		else{
			browser = 'Other';
		}
	};
	var setOsInfo = function() {
		if (navigator.appVersion.indexOf("Win")!=-1) os="windows";
		if (navigator.appVersion.indexOf("Mac")!=-1) os="macos";
		if (navigator.appVersion.indexOf("X11")!=-1) os="unix";
		if (navigator.appVersion.indexOf("Linux")!=-1) os="linux";
	};
	var debug = function(txt) { if(window.console && debugLevel > 0) console.log(txt); };
	var uniqid = function() { var newDate = new Date; return (newDate.getTime()%(2147483648-1)); };
	var connect = function() { 
		if(hap == undefined || hap == null || hap == '') sendMessage('<connect hap=""></connect>'); 
		else sendMessage('<connect hap="'+hap+'"></connect>');
	};
	
	var verifyUser = function(force) {
		if(force === true) {
			sendMessage('<verifyuser token="'+token+'" urlreferer="'+webAppId+'" type="'+weemoType+'" force="1"></verifyuser>'); 
		} else {
			sendMessage('<verifyuser token="'+token+'" urlreferer="'+webAppId+'" type="'+weemoType+'"></verifyuser>'); 
		}
		force = false;
	};
	
	var sendDisplayName = function(){ sendMessage('<set displayname="'+displayName+'"></set>'); };
	var getCallwindowDefaultPositionInternal = function(){ sendMessage('<get type="callwindowdefaultposition" />'); };
    var setCallwindowDefaultPositionInternal = function(val){ sendMessage('<set callwindowdefaultposition="'+val+'"></set>');};
	
	var getStatusInternal = function (uidStatus)  { sendMessage('<get type="status" uid="'+uidStatus+'" />'); };
	var sendMessage = function(val, type) { 
		var message = new String();
		if(val != "" && val != undefined) { message = val; }
		
		if(browser == 'Explorer') {
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
			debug(websock);
			if(websock != undefined && websock != null) {
				websock.send(message);
    			debug('BROWSER TO WEEMODRIVER >>>>>> '+message);
    		}
		}
	};
	var handleData = function(data) {
		debug(data);
		var action = "";
	    var params = new Object();
	    
	    if (window.DOMParser) { 
	    	parser = new DOMParser(); 
	    	xmlDoc = parser.parseFromString(data,"text/xml");
	    } else { // Internet Explorer
		    xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		    xmlDoc.async=false;
		    xmlDoc.loadXML(data); 
	    }
		
		// Connected Node
	    var connectedNode = xmlDoc.getElementsByTagName("connected")[0];
	    if(connectedNode != undefined) {
		    var connectedStatus = xmlDoc.getElementsByTagName("connected")[0].childNodes[0].nodeValue;
		    var connectedType = xmlDoc.getElementsByTagName("connected")[0].getAttribute("type");
	    	if(connectedStatus == 'ok') { action = "onConnect"; } else { action = "onConnectionFailed"; }
	    } else {
	    	// Readyforauthentication Node
		    var readyforauthenticationNode = xmlDoc.getElementsByTagName("readyforauthentication")[0];
		    if(readyforauthenticationNode != undefined) {
		    	action = "onReadyforauthentication";
		    } else {
		    	// verifieduser Node
		        var verifieduserNode = xmlDoc.getElementsByTagName("verifieduser")[0];
		        if(verifieduserNode != undefined) {
		        	var statusVerified = verifieduserNode.childNodes[0].nodeValue;
		        	if(statusVerified == 'ok') { action = "onVerifiedUserOk"; } 
		        	else if(statusVerified == "loggedasotheruser") { action = "loggedasotheruser"; }
		        	else {
		        		action = "onVerifiedUserNok";
		        		var errorVerifiedNode = verifieduserNode.getElementsByTagName("error")[0];
					    if(errorVerifiedNode != undefined) {
					    	params.error = errorVerifiedNode.getAttribute('code');
					    }
		        	}
		        } else {
		        	//Status Node
				    var statusNode = xmlDoc.getElementsByTagName("status")[0];
				    if(statusNode != undefined) {
				    	var xmpp = statusNode.getElementsByTagName("xmpp")[0];
				    	if(xmpp != undefined) { 
				    		if(xmpp.childNodes[0].nodeValue == 'ok') {
				    			action = "xmppOk";
				    		} else {
				    			action = "xmppNok";
				    		}
				    	} else {
				    		var sip = statusNode.getElementsByTagName("sip")[0];
						    if(sip != undefined) { 
						    	if(sip.childNodes[0].nodeValue == 'ok') {
					    			action = "sipOk";
					    		} else {
					    			action = "sipNok";
					    		}
						    } else {
						    	var audio = statusNode.getElementsByTagName("audio")[0];
							    if(audio != undefined) { 
							    	if(audio.childNodes[0].nodeValue == 'ok') {
						    			action = "audioOk";
						    		} else {
						    			action = "audioNok";
						    		}
							    }
						    }
				    	}
				    } else {
				    	//Set Node
					    var set = xmlDoc.getElementsByTagName("set")[0];
					    if(set != undefined) {
					    	action = 'set';
					    	var displayNameSet = set.getAttribute('displayname');
					    	if(displayNameSet != undefined) { 
								params.name = 'displayName';
								params.value = displayNameSet;
							} else {
								var versionSet = set.getAttribute('version');
								if(versionSet != undefined) {
									 params.name = 'version';
									 params.value = versionSet;
								} else {
									var statusSet = set.getAttribute('status');
									if(statusSet != undefined) {
										var uidSet = set.getAttribute('uid');
										params.name = 'status';
										params.value = statusSet;
										params.uid = uidSet;
									} else {
										var callwindowDefaultPositionSet = set.getAttribute('callwindowDefaultPosition');
										if(callwindowDefaultPositionSet != undefined) {
											params.name = 'callwindowDefaultPosition';
											params.value = callwindowDefaultPositionSet;
										}
									}
								}
							}
					    } else {
					    	// CreatedCall Node 
						    var createdcall = xmlDoc.getElementsByTagName("createdcall")[0];
						    if(createdcall != undefined) {
							    params.createdCallId = createdcall.getAttribute('id');
							    params.direction = createdcall.getAttribute('direction');
							    params.displayNameToCall = createdcall.getAttribute('displayname');
							    action = "callCreated";
						    } else {
						    	// statuscall Node
							    var statuscall =  xmlDoc.getElementsByTagName("statuscall")[0];
							    if(statuscall != undefined) {
							    	action = "onCallStatusReceived";
							    	var id = statuscall.getAttribute('id');
							    	params.id = id;
								    var call = statuscall.getElementsByTagName("call")[0];
									if(call != undefined) {
										 params.type = 'call';
										 params.status = call.childNodes[0].nodeValue;
									} else {
										var video_local = statuscall.getElementsByTagName("video_local")[0];
										if(video_local != undefined)  {
											params.type = 'video_local';
											params.status = video_local.childNodes[0].nodeValue;
										} else {
											var video_remote = statuscall.getElementsByTagName("video_remote")[0];
											if(video_remote != undefined)  {
												params.type = 'video_remote';
												params.status = video_remote.childNodes[0].nodeValue;
											} else {
												var share_local = statuscall.getElementsByTagName("share_local")[0];
												if(share_local != undefined) { 
											    	params.type = 'share_local';
													params.status = share_local.childNodes[0].nodeValue;
											    } else {
											    	var share_remote = statuscall.getElementsByTagName("share_remote")[0];
											    	if(share_remote != undefined) { 
												    	params.type = 'share_remote';
														params.status = share_remote.childNodes[0].nodeValue;
												    } else {
												    	var sound = statuscall.getElementsByTagName("sound")[0];
												    	if(sound != undefined) { 
													    	params.type = 'sound';
															params.status = sound.childNodes[0].nodeValue;
													    }
												    }
											    }
											}
										}
									}
							    } else {
							    	// Readyforconnection Node
								    var readyforconnectionNode = xmlDoc.getElementsByTagName("readyforconnection")[0];
								    if(readyforconnectionNode != undefined) {
								    	action = "onReadyforconnection";
								    } else {
								    	// kicked Node
									    var kickedNode = xmlDoc.getElementsByTagName("kicked")[0];
									    if(kickedNode != undefined) {
									    	action = "kicked";  
									    	params.kickedName = kickedNode.getAttribute("displayname");
									    	params.kickedUrl = kickedNode.getAttribute("urlreferer");
									    } else {
									    	// Error Node
										    var errorNode = xmlDoc.getElementsByTagName("error")[0];
										    if(errorNode != undefined) {
										    	action = "error"; 
										    	params.message = errorNode.childNodes[0].nodeValue;
										    } else {
										    	// Disconnected node
											    var disconnectedNode = xmlDoc.getElementsByTagName("disconnected")[0];
											    if(disconnectedNode != undefined) {
											    	action = "not_connected"; 
											    } else {
											    	var holdNode = xmlDoc.getElementsByTagName("hold")[0];
											    	if(holdNode != undefined) {
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
		if(action != '') sm(action, params, data);
	};
	
	var jQuerySendMessage = function(obj) {
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
        
	}
	
	var jQueryPolling = function(obj) {
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
	}
	
	var polling = function() {
		var xdr = getXDomainRequest();
		xdr.timeout = 16000;
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
	};
	
	var getXDomainRequest = function() {
	    var xdr = null;
	    if (window.XDomainRequest) {	
	        xdr = new XDomainRequest(); 
	    } else if (window.XMLHttpRequest) {
	        xdr = new XMLHttpRequest(); 
	    } else {
	        alert("Your browser does not support AJAX cross-domain!");
	    }
	    return xdr;
	}

	
	// WeemoCall Class
	var WeemoCall = function(callId, direction, dn, parent) {
		this.dn = dn;
		this.parent = parent;
		this.direction = direction;
		this.callId = callId;
		this.status = {call: null, video_remote: null, video_local: null, sound: null};
		
		this.accept = function() { controlCall(this.callId, 'call', 'start'); };
		this.hangup = function() { controlCall(this.callId, 'call', 'stop'); };
		this.videoStart = function() { controlCall(this.callId, 'video_local', 'start'); };
		this.videoStop = function() { controlCall(this.callId, 'video_local', 'stop'); };
		this.audioMute = function() { controlCall(this.callId, 'sound', 'mute'); };
		this.audioUnMute = function() { controlCall(this.callId, 'sound', 'unmute'); };
		this.settings = function() { controlCall(this.callId, 'settings', 'show'); };
		this.shareStart = function() { controlCall(this.callId, 'share_local', 'start'); };
		this.pip = function() { controlCall(this.callId, 'pip', 'show'); };
		this.noPip = function() { controlCall(this.callId, 'pip', 'hide'); };
		
		var controlCall = function(id, item, action) {	 sendMessage('<controlcall id="'+id+'"><'+item+'>'+action+'</'+item+'></controlcall>'); };
	};
	
	// Set browser vars
	setBrowserInfo();
	setOsInfo();
	debug(version);
};

// Utils
WeemoUtils = function() {};
WeemoUtils.prototype.strpos = function(haystack, needle, offset) { var i = (haystack + '').indexOf(needle, (offset || 0)); return i === -1 ? false : i; };
WeemoUtils.prototype.trim = function(str, charlist) {
	i = 0;
	str += '';

	if (!charlist) { // default list
	whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
	} else {
	// preg_quote custom list
	charlist += ''; whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
	}

	l = str.length;
	for (i = 0; i < l; i++) { 
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(i);
			break;
		}
	}
	
	l = str.length;
	for (i = l - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
		str = str.substring(0, i + 1); break;
		}
	}

	return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
};
