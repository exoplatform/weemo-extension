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

  Logger log = Logger.getLogger("VideoCallAdministration");

  OrganizationService organizationService_;

  SpaceService spaceService_;

  @Inject
  Provider<PortletPreferences> providerPreferences;

  @Inject
  public VideoCallAdministration(OrganizationService organizationService, SpaceService spaceService)
  {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
  }


  @View
  public void index(RenderContext renderContext) throws IOException
  {   
    index.render();
  }  
  
  @Action
  @Route("/save")
  public Response.View save(VideoCallModel videoCallModel) {
     System.out.println("==== disableVideoCalls : " + videoCallModel.getDisableVideoCall());
     System.out.println("==== weemoKey : " + videoCallModel.getWeemoKey());
     VideoCallService videoCallService = new VideoCallService();
     videoCallService.saveVideoCallProfile(videoCallModel);
     return VideoCallAdministration_.index();
  }
}
