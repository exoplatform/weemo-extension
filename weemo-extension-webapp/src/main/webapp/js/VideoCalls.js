
(function(gj, bts_modal, bts_popover) {

  

  function VideoCalls() {} ;

  
  VideoCalls.prototype.showPopover = function (element) { 
    var userName = gj(element).find("a:first").attr("href");
    userName = userName.substring(userName.lastIndexOf("/") + 1, userName.length);
    var suggestions = gj("#suggestions");
    var peopleName = gj(suggestions).find(".peopleName:first");
    var fullName = gj(peopleName).find("a:first").html();
    gj(element).popover({html:true,template: '<div class="popover"><div class="arrow"></div><div class="inner"><h3 class="popover-title" style="display:none;"></h3><div class="popover-content" style="padding: 0px;"><p></p></div></div></div>',content:function (){ 
  

  return '<div id="tiptip_content" style="border: none; box-shadown: none;"><table id="tipName"><tbody><tr><td style="width: 50px;"><a target="_parent" href="/portal/intranet/activities/"'+userName+'><img src="/social-resources/skin/images/ShareImages/UserAvtDefault.png"></a></td><td><a target="_parent" href="/portal/intranet/activities/'+userName+'">'+fullName+'</a></td></tr></tbody></table><div class="connectAction"><a type="button" class="btn weemoCallOverlay weemoCall-'+userName+' disabled" title="Make a Video Call" data-fullname="'+fullName+'" data-username="'+userName+'" style="margin-left:5px;"><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> Call</a></div></div>';
            }});
    gj(element).popover('show');

    //gj("#suggestion_content").mouseout(function() {
     // gj(element).popover('hide');
    //});

    weemoExtension.getStatus(userName, cbGetSuggestionStatus);
    
    function cbGetSuggestionStatus(targetUser, activity) {
      if (activity !== "offline") {
        jqchat(".weemoCall-"+targetUser.replace('.', '-')).removeClass("disabled");
      }
    }

  };
   

  VideoCalls.prototype.hidePopover = function (element) {
    gj(element).popover('hide');
  };

  gj(document).ready(function() {
    var peopleSuggest = gj("#peopleSuggest");
    if(peopleSuggest) {
     var suggestions = gj(peopleSuggest).find("#suggestions");
     gj(suggestions).find("li").each(function(i) {  
       var peoplePicture = gj(this).find(".peoplePicture:first");

       gj(peoplePicture).mouseover(function() {
         gj(peoplePicture).attr("data-toggle","popover");
         gj(peoplePicture).attr("data-original-title","<strong>A Title</strong>");
         gj(peoplePicture).attr("data-placement","left");
         window.setTimeout(100);
         eXo.ecm.VideoCalls.showPopover(peoplePicture);      
       });

       

       gj(peoplePicture).mouseout(function() {
         var popoverElem = gj(suggestions).find(".popover:first");
         if(!gj(popoverElem).is(':hover')) {
           eXo.ecm.VideoCalls.hidePopover(peoplePicture);
         }        
       });

     });
    }
  });
  
  eXo.ecm.VideoCalls = new VideoCalls();
  return {
    VideoCalls : eXo.ecm.VideoCalls
  };

  
  

})(gj, bts_modal, bts_popover);
