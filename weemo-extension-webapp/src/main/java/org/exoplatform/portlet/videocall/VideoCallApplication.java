package org.exoplatform.portlet.videocall;

import java.util.logging.Logger;

import juzu.*;
import juzu.request.RenderContext;
import juzu.template.Template;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.application.PortalRequestContext;
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
    PortalRequestContext requestContext = Util.getPortalRequestContext();
    HttpSession httpSession = requestContext.getRequest().getSession();
    remoteUser_ = renderContext.getSecurityContext().getRemoteUser();   
    VideoCallModel videoCallModel = videoCallService_.getVideoCallProfile();
    if(videoCallModel == null) videoCallModel = new VideoCallModel();
    String weemoKey = videoCallModel.getWeemoKey();
    String tokenKey = videoCallService_.getTokenKey();   
    boolean turnOffVideoCallForUser = videoCallService_.isTurnOffVideoCallForUser();
    boolean turnOffVideoCall = videoCallService_.isTurnOffVideoCall();
    if(tokenKey == null) {
      HttpServletRequest request = Util.getPortalRequestContext().getRequest();    
      String profile_id = videoCallModel.getProfileId();      
      AuthService authService = new AuthService();      
      String content = authService.authenticate(request, profile_id);      
      if(!StringUtils.isEmpty(content)) {
        JSONObject json = new JSONObject(content);
        tokenKey = json.get("token").toString();
        httpSession.setAttribute("tokenKey", tokenKey);
      } else {
        tokenKey = ""; 
        videoCallService_.setTokenKey("");
      }
    }
    
    index.with().set("user", remoteUser_)           
            .set("weemoKey", weemoKey)
            .set("tokenKey", tokenKey)
            .set("turnOffVideoCallForUser", turnOffVideoCallForUser)
            .set("turnOffVideoCall", turnOffVideoCall)
            .render();
  }  
}
