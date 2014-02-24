package org.exoplatform.portlet.videocall;

import java.io.InputStream;
import java.util.logging.Logger;

import juzu.*;
import juzu.request.RenderContext;
import juzu.template.Template;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.exoplatform.utils.videocall.PropertyManager;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.webui.util.Util;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.videocall.AuthService;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;
import org.json.JSONObject;

public class VideoCallApplication {

  @Inject
  @Path("index.gtmpl")
  Template index;
  
  String token_ = "---";
  String remoteUser_ = null;
  String fullname_ = null;
  boolean isAdmin_=false;

  boolean profileInitialized_ = false;

  Logger log = Logger.getLogger("ChatApplication");

  OrganizationService organizationService_;

  SpaceService spaceService_;
  
  VideoCallService videoCallService_;
  

  @Inject
  Provider<PortletPreferences> providerPreferences;

  @Inject
  public VideoCallApplication(OrganizationService organizationService, SpaceService spaceService, VideoCallService videoCallService)
  {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
    videoCallService_ = videoCallService;
  }


  @View
  public void index(RenderContext renderContext) throws Exception
  {
    remoteUser_ = renderContext.getSecurityContext().getRemoteUser();   
    VideoCallModel videoCallModel = videoCallService_.getVideoCallProfile();
    if(videoCallModel == null) videoCallModel = new VideoCallModel();
    String weemoKey = videoCallModel.getWeemoKey();
    String tokenKey = videoCallModel.getTokenKey();
    boolean turnOffVideoCall = videoCallService_.isTurnOffVideoCall();
    //if(StringUtils.isEmpty(tokenKey)) {
      HttpServletRequest request = Util.getPortalRequestContext().getRequest();    
      String profile_id = videoCallModel.getProfileId();      
      AuthService authService = new AuthService();      
      String content = authService.authenticate(request, profile_id);
      
      if(!StringUtils.isEmpty(content)) {
        JSONObject json = new JSONObject(content);
        tokenKey = json.get("token").toString();
        videoCallModel.setTokenKey(tokenKey);
      }      
      //videoCallService_.saveVideoCallProfile(videoCallModel);
    //}
    
    index.with().set("user", remoteUser_)           
            .set("weemoKey", weemoKey)
            .set("tokenKey", tokenKey)
            .set("turnOffVideoCall", turnOffVideoCall)
            .render();
  }  
}
