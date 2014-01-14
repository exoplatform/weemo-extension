package org.exoplatform.portlet.administration;

import java.io.IOException;
import java.util.logging.Logger;

import juzu.*;
import juzu.request.RenderContext;
import juzu.template.Template;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;

import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;

public class VideoCallAdministration {

  @Inject
  @Path("index.gtmpl")
  Template index; 
  
  @Inject
  VideoCalls videoCalls;

  Logger log = Logger.getLogger("VideoCallAdministration");

  OrganizationService organizationService_;

  SpaceService spaceService_;
  
  VideoCallService videoCallService_;

  @Inject
  Provider<PortletPreferences> providerPreferences;

  @Inject
  public VideoCallAdministration(OrganizationService organizationService, SpaceService spaceService, VideoCallService videoCallService)
  {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
    videoCallService_ = videoCallService;
  }


  @View
  public void index(RenderContext renderContext) throws IOException
  {   
    String weemoKey = videoCallService_.getWeemoKey();
    boolean turnOffVideoCall = videoCallService_.isDisableVideoCall();
    index.with().set("turnOffVideoCall", turnOffVideoCall)
              .set("weemoKey", weemoKey)
              .render();
    videoCalls.setDisplaySuccessMsg(false);
  }  
  
  @Action
  @Route("/save")
  public Response save(VideoCallModel videoCallModel) {
     VideoCallService videoCallService = new VideoCallService();
     videoCallService.saveVideoCallProfile(videoCallModel);
     videoCalls.setDisplaySuccessMsg(true);    
     return VideoCallAdministration_.index();
  }
}
