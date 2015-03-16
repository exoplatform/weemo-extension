package org.exoplatform.portlet.videocall;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Properties;
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
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.application.PortalRequestContext;
import org.exoplatform.portal.webui.util.Util;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.security.ConversationRegistry;
import org.exoplatform.services.videocall.AuthService;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;
import org.exoplatform.utils.videocall.PropertyManager;
import org.json.JSONObject;

public class VideoCallApplication {

  @Inject
  @Path("index.gtmpl")
  Template                 index;

  String                   REST_URL         = "/rest/cloud/addons/";

  String                   DEFAULT_PROTOCOL = "http";

  String                   WEEMO_ADDON_ID   = "EXO_VIDEO_CALL";

  String                   remoteUser_      = null;

  private static final Log log              = ExoLogger.getLogger(VideoCallService.class.getName());

  OrganizationService      organizationService_;

  SpaceService             spaceService_;

  VideoCallService         videoCallService_;

  ConversationRegistry     conversationRegistry_;

  @Inject
  public VideoCallApplication(OrganizationService organizationService,
                              SpaceService spaceService,
                              VideoCallService videoCallService,
                              ConversationRegistry conversationRegistry) {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
    videoCallService_ = videoCallService;
    conversationRegistry_ = conversationRegistry;
  }

  @View
  public void index(RenderContext renderContext) throws Exception {
    PortalRequestContext requestContext = Util.getPortalRequestContext();
    HttpServletRequest request = requestContext.getRequest();
    HttpSession httpSession = request.getSession();

    String serverName = request.getServerName();
    String tenantName = "";
    if (serverName.indexOf(".") != -1) {
      tenantName = serverName.substring(0, serverName.indexOf("."));
    } else {
      tenantName = serverName;
    }

    remoteUser_ = renderContext.getSecurityContext().getRemoteUser();
    VideoCallModel videoCallModel = videoCallService_.getVideoCallProfile();
    if (videoCallModel == null) {
      videoCallModel = new VideoCallModel();
    }
    String weemoKey = videoCallModel.getWeemoKey();
    String tokenKey = null;
    if (httpSession.getAttribute("tokenKey") != null) {
      tokenKey = httpSession.getAttribute("tokenKey").toString();
    } else {
      tokenKey = videoCallService_.getTokenKey();
    }
    // Load videocalls version
    InputStream isProperties = null;
    isProperties = videoCallService_.getClass().getResourceAsStream("/extension.properties");

    String videoCallVersion = null;
    if (isProperties != null) {
      Properties properties = new Properties();
      properties.load(isProperties);
      videoCallVersion = properties.getProperty(PropertyManager.PROPERTY_VIDEOCALL_VERSION);
    }
    if (videoCallVersion == null) {
      videoCallVersion = "";
    }
    boolean turnOffVideoCallForUser = videoCallService_.isTurnOffVideoCallForUser();
    boolean turnOffVideoGroupCallForUser = videoCallService_.isTurnOffVideoCallForUser(true);
    boolean turnOffVideoCall = videoCallService_.isTurnOffVideoCall();
    if (tokenKey == null) {
      String profile_id = videoCallModel.getProfileId();
      AuthService authService = new AuthService();
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

    // Check if same account loggin on other place
    boolean isSameUserLogged = false;
    if (!remoteUser_.equals("__anonim_")
        && conversationRegistry_.getStateKeys(remoteUser_).size() > 1) {
      isSameUserLogged = true;
    }

    // Get trial information from BO
    String trialStatus = "";
    int trialDay = 0;
    int remainDay = 0;

    String username = System.getProperty("cloud.management.username");
    String password = System.getProperty("cloud.management.password");

    String restUrl = getBaseUrl() + "trial/" + tenantName + "/" + WEEMO_ADDON_ID;
    String trialInformation = callBOService(restUrl, username, password);
    String encodedKey = "Basic "
        + new sun.misc.BASE64Encoder().encode((username + ":" + password).getBytes());
    if (!StringUtils.isEmpty(trialInformation)) {
      JSONObject output = new JSONObject(trialInformation);
      trialStatus = output.getString("status");
      trialDay = output.getInt("trialDay");
      long endDate = output.getLong("endDate");
      long currentTime = System.currentTimeMillis();
      if ((currentTime > endDate) && trialStatus.equals("active")) {
        trialStatus = "expired";
        callBOService(restUrl + "/" + trialStatus, username, password);
      }
      if (trialStatus.equals("active")) {
        remainDay = (int) ((endDate - currentTime) / (24 * 60 * 60 * 1000)) + 1;
      }
    }

    // Get addon status on tenant from BO
    String statusRestUrl = getBaseUrl() + "isActive/" + tenantName + "/" + WEEMO_ADDON_ID;
    String addonstatus = callBOService(statusRestUrl, username, password);
    if (addonstatus == null)
      addonstatus = "";

    index.with()
         .set("user", remoteUser_)
         .set("weemoKey", weemoKey)
         .set("tokenKey", tokenKey)
         .set("turnOffVideoCallForUser", turnOffVideoCallForUser)
         .set("turnOffVideoGroupCallForUser", turnOffVideoGroupCallForUser)
         .set("turnOffVideoCall", turnOffVideoCall)
         .set("videoCallVersion", videoCallVersion)
         .set("isSameUserLogged", isSameUserLogged)
         .set("trialStatus", trialStatus)
         .set("trialDay", trialDay)
         .set("remainDay", remainDay)
         .set("tenantName", tenantName)
         .set("encodedKey", encodedKey)
         .set("addonstatus", addonstatus)
         .render();
  }

  private String callBOService(String url, String username, String password) {
    try {
      URI uri = new URI(url);
      DefaultHttpClient client = new DefaultHttpClient();

      client.getCredentialsProvider().setCredentials(new AuthScope(uri.getHost(), uri.getPort()),
                                                     new UsernamePasswordCredentials(username,
                                                                                     password));
      HttpGet request = new HttpGet(url);
      HttpResponse response = null;
      StringBuilder sb = new StringBuilder();
      String line;

      try {
        response = client.execute(request);
        if (response.getStatusLine().getStatusCode() != 200) {
          throw new Exception("Couldn't get information from backoffice. Response status code - "
              + response.getStatusLine().getStatusCode());
        }
        InputStream in = response.getEntity().getContent();
        BufferedReader rd = new BufferedReader(new InputStreamReader(in));
        while ((line = rd.readLine()) != null) {
          sb.append(line);
        }
        rd.close();

      } finally {
        if (response != null) {
          response.getEntity().getContent().close();
        }
      }
      return sb.toString();

    } catch (URISyntaxException urie) {
      log.error("The service url " + url + " is in wrong format", urie);
    } catch (IOException ioe) {
      log.error("Cannot read data from response - Cause : " + ioe.getMessage(), ioe);
    } catch (Exception e) {
      log.error("A problem happened while calling backoffice service - Cause : " + e.getMessage(),
                e);
    }
    return null;
  }

  private String getBaseUrl() {
    String mgtHost = System.getProperty("cloud.management.host");
    String mgtPort = System.getProperty("cloud.management.tomcat.port");

    String baseUrl = new StringBuilder(DEFAULT_PROTOCOL).append("://")
                                                        .append(mgtHost)
                                                        .append(":")
                                                        .append(mgtPort)
                                                        .append(REST_URL)
                                                        .toString();

    return baseUrl;
  }
}
