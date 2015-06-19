package org.exoplatform.portlet.videocallpopup;

import juzu.Path;
import juzu.Response;
import juzu.View;
import juzu.request.SecurityContext;
import juzu.template.Template;
import org.apache.commons.lang3.StringUtils;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.application.PortalRequestContext;
import org.exoplatform.portal.webui.util.Util;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.security.ConversationRegistry;
import org.exoplatform.services.videocall.AuthService;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;
import org.exoplatform.utils.videocall.PropertyManager;
import org.exoplatform.ws.frameworks.cometd.ContinuationService;
import org.json.JSONObject;
import org.mortbay.cometd.continuation.EXoContinuationBayeux;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.InputStream;
import java.util.Hashtable;
import java.util.Properties;

public class VideoCallPopupApplication {

  private static final String MODE_ONEONE_CALLER = "oneone_caller";

  @Inject
  @Path("index.gtmpl")
  Template index;

  String remoteUser_ = null;

  OrganizationService organizationService_;

  SpaceService spaceService_;

  VideoCallService videoCallService_;

  ConversationRegistry conversationRegistry_;

  ContinuationService continuationService_;

  EXoContinuationBayeux exoContinuationBayeux_;

  @Inject
  public VideoCallPopupApplication(OrganizationService organizationService, SpaceService spaceService,
                                   VideoCallService videoCallService, ConversationRegistry conversationRegistry,
                                   ContinuationService continuationService, EXoContinuationBayeux exoContinuationBayeux) {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
    videoCallService_ = videoCallService;
    conversationRegistry_ = conversationRegistry;
    continuationService_ = continuationService;
    exoContinuationBayeux_ = exoContinuationBayeux;
  }

  @View
  public Response.Content index(SecurityContext securityContext) throws Exception {
    HttpServletRequest requestContext = Util.getPortalRequestContext().getRequest();
    remoteUser_ = securityContext.getRemoteUser();

    // Process parameters
    String callMode = getParam("mode");
    String callee = getParam("callee");
    String caller = getParam("caller");


    VideoCallModel videoCallModel = videoCallService_.getVideoCallProfile();
    if (videoCallModel == null) videoCallModel = new VideoCallModel();

    // Get Weemo Key, Token Key
    String weemoKey = videoCallModel.getWeemoKey();

    String tokenKey = null;
    HttpSession httpSession = requestContext.getSession();
    if (httpSession.getAttribute("tokenKey") != null) {
      tokenKey = httpSession.getAttribute("tokenKey").toString();
    } else {
      tokenKey = videoCallService_.getTokenKey();
    }

    AuthService authService = new AuthService();
    if (tokenKey == null) {
      String profile_id = videoCallModel.getProfileId();
      String content = authService.authenticate(null, profile_id);
      if (!StringUtils.isEmpty(content)) {
        JSONObject json = new JSONObject(content);
        tokenKey = json.get("token").toString();
        httpSession.setAttribute("tokenKey", tokenKey);
        videoCallService_.setTokenKey(tokenKey);
      } else {
        tokenKey = "";
        videoCallService_.setTokenKey("");
      }
    }

    // Load videocalls version
    String videoCallVersion = null;
    InputStream isProperties = videoCallService_.getClass().getResourceAsStream("/extension.properties");
    if (isProperties != null) {
      Properties properties = new Properties();
      properties.load(isProperties);
      videoCallVersion = properties.getProperty(PropertyManager.PROPERTY_VIDEOCALL_VERSION);
    }
    videoCallVersion = (videoCallVersion == null) ? StringUtils.EMPTY : videoCallVersion;

    return index.with().set("user", remoteUser_)
            .set("mode", callMode)
            .set("callee", callee)
            .set("caller", caller)
            .set("weemoKey", weemoKey)
            .set("tokenKey", tokenKey)
            .set("videoCallVersion", videoCallVersion)
            .set("cometdUserToken", continuationService_.getUserToken(remoteUser_))
            .set("cometdContextName", (exoContinuationBayeux_ == null ? "cometd" : exoContinuationBayeux_
                    .getCometdContextName()))
            .ok();

  }

  private String getParam(String paramName) {
    HttpServletRequest requestContext = Util.getPortalRequestContext().getRequest();
    String paramValue = requestContext.getParameter(paramName);
    if (paramValue == null) paramValue = StringUtils.EMPTY;
    return paramValue;
  }
}
