
(function(gj, bts_modal, bts_popover) {

  

  function VideoCalls() {} ;

  
  VideoCalls.prototype.showPopover = function (element,place) {
    var isTurnOff = weemoExtension.isTurnOff;
    if (weemoExtension.isCloudRunning === 'true') {
      var weemoAddonStatus = jqchat("#weemo-status").attr("data-addonstatus");
      var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
      if ((isTurnOff === "true") || (weemoAddonStatus === "false") || (weemoAddonStatus.indexOf("neutral") != -1 && trialStatus.indexOf("disable") != -1)) return;
    } else {
      if (isTurnOff === "true") return;
    }
    var userElem = gj(element).find("a:first");
    var userName = gj(userElem).attr("href");
    var popElem = gj(element).find(".avatarXSmall:first");
    userName = userName.substring(userName.lastIndexOf("/") + 1, userName.length);
    var peopleInfo = gj(element).next();
    var peopleName = gj(peopleInfo).find(".peopleName:first");
    var peopleLink = gj(peopleName).find("a:first");
    var fullName = gj(peopleName).find("a:first").html();
    var avatarUrl = popElem.find("img").attr("src");

    var realPopElem = place ? peopleLink: popElem;
    gj(realPopElem).popover({placement: 'left', html:true,template: '<div class="popover left" style="width: 240px;"><div class="arrow"></div><div class="inner"><h3 class="popover-title" style="display:none;"></h3><div class="popover-content" style="padding: 0px;"><p></p></div></div></div>',
    					 content:function (){ 
						    var callLabel = gj("#weemo-status").attr("call-label");
						    var makeCallLabel = gj("#weemo-status").attr("make-call-label");
						    return '<div id="tiptip_content" style="border: none; box-shadown: none;"><table id="tipName"><tbody><tr><td style="width: 50px;"><a target="_parent" href="/portal/intranet/activities/"'+userName+'><img src="'+avatarUrl+'"></a></td><td><a target="_parent" href="/portal/intranet/activities/'+userName+'">'+fullName+'</a></td></tr></tbody></table><div class="connectAction"><a type="button" class="btn weemoCallOverlay weemoCall-'+userName+' disabled" title="'+makeCallLabel+'" data-fullname="'+fullName+'" data-username="'+userName+'" style="margin-left:5px;"><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> '+callLabel+'</a></div></div>';
    					 }
    					});
    gj(realPopElem).popover('show');


    weemoExtension.getStatus(userName, cbGetSuggestionStatus);
    
    function cbGetSuggestionStatus(targetUser, activity) {
      if (activity !== "offline") {
        gj(".weemoCall-"+targetUser.replace('.', '-')).removeClass("disabled");
      }
    }

    gj(".weemoCallOverlay").unbind( "click" );
    gj(".weemoCallOverlay").on("click", function() {
        if (!gj(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.tokenKey.length > 0) {
          var targetUser = gj(this).attr("data-username");
          var targetFullname = gj(this).attr("data-fullname");
          if (weemoExtension.isCloudRunning === 'true') {
            var trialStatus = jqchat("#weemo-status").attr("data-trialstatus");
            if (trialStatus.indexOf("disable") != -1) {
              weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
            } else {
              eXo.ecm.VideoCalls.showTrialInterceptor();
              gj("#currentUser").attr("data-username", targetUser);
              gj("#currentUser").attr("data-fullname", targetFullname);
            }
          } else {
            if (weemoExtension.hasOneOneCallPermission(targetUser.trim()) === "false") {
              eXo.ecm.VideoCalls.showReceivingPermissionInterceptor(targetFullname.trim());
            } else {
              weemoExtension.showVideoPopup('/portal/intranet/videocallpopup?callee=' + targetUser.trim() + '&mode=one');
            }
          }
        } else if(!jqchat(this).hasClass("disabled")) {
          if(weemoExtension.isValidWeemoKey == false || weemoExtension.tokenKey.length == 0) {
            eXo.ecm.VideoCalls.showInstallInterceptor();
          } else if(weemoExtension.isTurnOffForUser == "true") {
            eXo.ecm.VideoCalls.showPermissionInterceptor();
          }
        }
      });

  };
   

  VideoCalls.prototype.hidePopover = function (element) {
    gj(element).popover('hide');
  };

  VideoCalls.prototype.showInstallInterceptor = function(title, message) {
    var interceptor = gj("#install-interceptor");
    gj(interceptor).appendTo("body");       
    gj(interceptor).modal('show');
    gj(".modal-backdrop").remove();
  };

  VideoCalls.prototype.showPermissionInterceptor = function(title, message) {
    var interceptor = gj("#permission-interceptor");
    gj(interceptor).appendTo("body");       
    gj(interceptor).modal('show');
    gj(".modal-backdrop").remove();
  };

  VideoCalls.prototype.showReceivingPermissionInterceptor = function(fullName) {
    var interceptor = gj("#receive-permission-interceptor");
    gj(interceptor).appendTo("body");
    var $message = gj("#receive-permission-interceptor-message", interceptor);
    $message.html(interceptor.attr("data-message").replace("{0}", fullName));
    gj(interceptor).modal('show');
    gj(".modal-backdrop").remove();
  };

  VideoCalls.prototype.showTrialInterceptor = function() {
    var interceptor = gj("#trial-interceptor");
    gj(interceptor).modal('show');
    var weemoStatus = gj("#weemo-status");
    var trialStatus = weemoStatus.attr("data-trialstatus");
    if (trialStatus.indexOf("none") != -1){
      var info = gj("#noneStatus");
      info.css("display", "block");
      var trialDay = weemoStatus.attr("data-trialday");
      var dayText = trialDay + " ";
      if (parseInt(trialDay) > 1) dayText += gj("#plurialday").val();
      else dayText += gj("#singleday").val();
      var msg = gj("span",info).text();
      msg = msg.replace("{0}", dayText).replace("{1}", dayText);
      gj("span",info).text(msg);
    }
    if (trialStatus.indexOf("active") != -1){
      var warning = gj("#activeStatus");
      warning.css("display", "block");
      var remainDay = weemoStatus.attr("data-remainday");
      var replaceText = remainDay + " ";
      if (parseInt(remainDay) > 1) replaceText += gj("#plurialday").val();
      else replaceText += gj("#singleday").val();
      var msg = gj("span",warning).text();
      msg = msg.replace("{0}", replaceText);
      gj("span",warning).text(msg);
    }
    if (trialStatus.indexOf("expired") != -1) gj("#expiredStatus").css("display", "block");

    gj(".modal-backdrop").remove();
  };

  gj(document).ready(function() {

    var peopleSuggest = gj("#peopleSuggest");
    var platform = navigator.platform;

    if((peopleSuggest && platform.indexOf("Linux") < 0) || jqchat.browser.chrome) {     
     var suggestions = gj(peopleSuggest).find("#suggestions");
     setTimeout(function(){       

	     gj(suggestions).find("li").each(function(i) { 
	       
	       var peoplePicture = gj(this).find(".peoplePicture:first");
	       gj(peoplePicture).mouseenter(function() {
                 var popElem = gj(peoplePicture).find(".avatarXSmall:first");
				 gj(popElem).attr("data-toggle","popover");		
				 gj(popElem).attr("data-placement","left");
				 eXo.ecm.VideoCalls.showPopover(peoplePicture);      
	       });       

	       gj(peoplePicture).mouseleave(function() {
                 var popElem = gj(peoplePicture).find(".avatarXSmall:first");
                 eXo.ecm.VideoCalls.hidePopover(popElem);
	       });
	       //-----------
	       var peopleInfo = gj(this).find(".peopleInfo:first");
	       var nameDiv = gj(peopleInfo).find(".peopleName:first");
	       var nameLink = gj(peopleInfo).find("a:first");
	       
	       gj(nameDiv).mouseenter(function() {
               var popElem = nameDiv;
				 gj(popElem).attr("data-toggle","popover");		
				 gj(popElem).attr("data-placement","left");
				 eXo.ecm.VideoCalls.showPopover(peoplePicture, true);      
	       });       

	       gj(nameDiv).mouseleave(function() {
               var popElem = nameLink.parentNode;
               eXo.ecm.VideoCalls.hidePopover(nameLink);
	       });
	       

	     });


     },1000);

     
    }
  });
  
  eXo.ecm.VideoCalls = new VideoCalls();
  return {
    VideoCalls : eXo.ecm.VideoCalls
  };
})(gj, bts_modal, bts_popover);
