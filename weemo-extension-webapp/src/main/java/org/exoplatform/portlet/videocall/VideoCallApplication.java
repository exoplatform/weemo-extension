package org.exoplatform.portlet.videocall;

import java.io.IOException;
import java.util.logging.Logger;

import juzu.*;
import juzu.request.RenderContext;
import juzu.template.Template;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;

import org.exoplatform.utils.videocall.PropertyManager;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.social.core.space.spi.SpaceService;

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

  @Inject
  Provider<PortletPreferences> providerPreferences;

  @Inject
  public VideoCallApplication(OrganizationService organizationService, SpaceService spaceService)
  {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
  }


  @View
  public void index(RenderContext renderContext) throws IOException
  {
    remoteUser_ = renderContext.getSecurityContext().getRemoteUser();
    String chatIntervalNotif = PropertyManager.getProperty(PropertyManager.PROPERTY_INTERVAL_NOTIF);
    String chatWeemoKey = PropertyManager.getProperty(PropertyManager.PROPERTY_WEEMO_KEY);

    index.with().set("user", remoteUser_).set("chatIntervalNotif", chatIntervalNotif)
            .set("weemoKey", chatWeemoKey)
            .render();
  }  
}
