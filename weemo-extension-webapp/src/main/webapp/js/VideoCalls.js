
(function(gj, bts_modal, bts_popover) {

  

  function VideoCalls() {} ;

  
  VideoCalls.prototype.showPopover = function (element) { 
    var userName = gj(element).find("a:first").attr("href");
    var popElem = gj(element).find(".avatarXSmall:first");
    userName = userName.substring(userName.lastIndexOf("/") + 1, userName.length);
    var peopleInfo = gj(element).next();
    var peopleName = gj(peopleInfo).find(".peopleName:first");
    var fullName = gj(peopleName).find("a:first").html();
    gj(popElem).popover({html:true,template: '<div class="popover"><div class="arrow"></div><div class="inner"><h3 class="popover-title" style="display:none;"></h3><div class="popover-content" style="padding: 0px;"><p></p></div></div></div>',content:function (){ 
  

  return '<div id="tiptip_content" style="border: none; box-shadown: none;"><table id="tipName"><tbody><tr><td style="width: 50px;"><a target="_parent" href="/portal/intranet/activities/"'+userName+'><img src="/social-resources/skin/images/ShareImages/UserAvtDefault.png"></a></td><td><a target="_parent" href="/portal/intranet/activities/'+userName+'">'+fullName+'</a></td></tr></tbody></table><div class="connectAction"><a type="button" class="btn weemoCallOverlay weemoCall-'+userName+' disabled" title="Make a Video Call" data-fullname="'+fullName+'" data-username="'+userName+'" style="margin-left:5px;"><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> Call</a></div></div>';
            }});
    gj(popElem).popover('show');

   

    weemoExtension.getStatus(userName, cbGetSuggestionStatus);
    
    function cbGetSuggestionStatus(targetUser, activity) {
      if (activity !== "offline" && weemoExtension.isTurnOffForUser == false && weemoExtension.isValidWeemoKey == false 
        && weemoExtension.tokenKey.length == 0) {
        gj(".weemoCall-"+targetUser.replace('.', '-')).removeClass("disabled");
      }
    }

    
    gj(".weemoCallOverlay").on("click", function() {
        if (!gj(this).hasClass("disabled")) {
          var targetUser = gj(this).attr("data-username");
          var targetFullname = gj(this).attr("data-fullname");
          weemoExtension.createWeemoCall(targetUser, targetFullname);
        } else {
          if(weemoExtension.isValidWeemoKey == false) {
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
  } 

  VideoCalls.prototype.showPermissionInterceptor = function(title, message) {
    var interceptor = gj("#permission-interceptor");
    gj(interceptor).appendTo("body");       
    gj(interceptor).modal('show');
    gj(".modal-backdrop").remove();
  } 


  gj(document).ready(function() {

    var peopleSuggest = gj("#peopleSuggest");
    var platform = navigator.platform;

    if(peopleSuggest && platform.indexOf("Linux") < 0) {     
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

	     });


     },1000);

     
    }
  });
  
  eXo.ecm.VideoCalls = new VideoCalls();
  return {
    VideoCalls : eXo.ecm.VideoCalls
  };

  
  

})(gj, bts_modal, bts_popover);
