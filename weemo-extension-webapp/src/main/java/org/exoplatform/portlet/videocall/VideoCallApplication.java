package org.exoplatform.portlet.videocall;

import juzu.Path;
import juzu.Response;
import juzu.View;
import juzu.request.SecurityContext;
import juzu.template.Template;
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
import org.json.JSONException;
import org.exoplatform.ws.frameworks.cometd.ContinuationService;
import org.json.JSONObject;
import org.mortbay.cometd.continuation.EXoContinuationBayeux;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Properties;

public class VideoCallApplication {

  @Inject
  @Path("index.gtmpl")
  Template                 index;

  String                   REST_URL         = "/mgt-rest/v1/addons/";

  String                   DEFAULT_PROTOCOL = "http";

  String                   WEEMO_ADDON_ID   = "EXO_VIDEO_CALL";

  String                   remoteUser_      = null;

  private static final Log LOG = ExoLogger.getLogger(VideoCallApplication.class.getName());

  OrganizationService      organizationService_;

  SpaceService             spaceService_;

  VideoCallService         videoCallService_;

  ConversationRegistry     conversationRegistry_;

  ContinuationService continuationService_;

  EXoContinuationBayeux exoContinuationBayeux_;

  @Inject
  public VideoCallApplication(OrganizationService organizationService, SpaceService spaceService,
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
    PortalRequestContext requestContext = Util.getPortalRequestContext();

    HttpServletRequest request = requestContext.getRequest();
    HttpSession httpSession = request.getSession();

    remoteUser_ = securityContext.getRemoteUser();
    VideoCallModel videoCallModel = videoCallService_.getVideoCallProfile();
    if (videoCallModel == null) videoCallModel = new VideoCallModel();

    // Get Weemo Key, Token Key
    String weemoKey = videoCallModel.getWeemoKey();
    String tokenKey = null;
    if (httpSession.getAttribute("tokenKey") != null) {
      tokenKey = httpSession.getAttribute("tokenKey").toString();
    } else {
      tokenKey = videoCallService_.getTokenKey();
    }

    if (tokenKey == null) {
      String profile_id = PropertyManager.getProperty(PropertyManager.PROPERTY_VIDEO_PROFILE);
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

    // Load videocalls version
    String videoCallVersion = null;
    InputStream isProperties = videoCallService_.getClass().getResourceAsStream("/extension.properties");
    if (isProperties != null) {
      Properties properties = new Properties();
      properties.load(isProperties);
      videoCallVersion = properties.getProperty(PropertyManager.PROPERTY_VIDEOCALL_VERSION);
    }
    videoCallVersion = (videoCallVersion == null) ? StringUtils.EMPTY : videoCallVersion;

    // Check permission for using weemo of user
    boolean turnOffVideoCallForUser = videoCallService_.isTurnOffVideoCallForUser();
    boolean turnOffVideoCall = videoCallService_.isTurnOffVideoCall();

    // Check if same account loggin on other place
    boolean isSameUserLogged = false;
    if (!remoteUser_.equals("__anonim_") && conversationRegistry_.getStateKeys(remoteUser_).size() > 1) {
      isSameUserLogged = true;
    }

    juzu.template.Template.Builder builder =  index.with().set("user", remoteUser_)
            .set("weemoKey", weemoKey)
            .set("tokenKey", tokenKey)
            .set("turnOffVideoCallForUser", turnOffVideoCallForUser)
            .set("turnOffVideoCall", turnOffVideoCall)
            .set("videoCallVersion", videoCallVersion)
            .set("isSameUserLogged", isSameUserLogged)
            .set("isCloudRunning", VideoCallService.isCloudRunning())
            .set("cometdUserToken", continuationService_.getUserToken(remoteUser_))
            .set("cometdContextName", (exoContinuationBayeux_ == null ? "cometd" : exoContinuationBayeux_.getCometdContextName()));

    // Get trial information from BO
    if (VideoCallService.isCloudRunning()) {

      String serverName = request.getServerName();
      String tenantName = "";
      if (serverName.indexOf(".") != -1) {
        tenantName = serverName.substring(0, serverName.indexOf("."));
      } else {
        tenantName = serverName;
      }

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
        try {
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
        } catch (JSONException jse) {
          LOG.warn("Cannot load addon's trial information");
        }
      }

      // Get addon status on tenant from BO
      String statusRestUrl = getBaseUrl() + "isActive/" + tenantName + "/" + WEEMO_ADDON_ID;
      String addonstatus = callBOService(statusRestUrl, username, password);
      if (addonstatus == null)
        addonstatus = StringUtils.EMPTY;

      builder.set("trialStatus", trialStatus)
              .set("trialDay", trialDay)
              .set("remainDay", remainDay)
              .set("tenantName", tenantName)
              .set("encodedKey", encodedKey)
              .set("addonstatus", addonstatus)
              .set("turnOffVideoGroupCallForUser", true);;

    } else {
      boolean turnOffVideoGroupCallForUser = videoCallService_.isTurnOffVideoCallForUser(true);
      builder.set("turnOffVideoGroupCallForUser", turnOffVideoGroupCallForUser);
    }

    return builder.ok();
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
      LOG.error("The service url " + url + " is in wrong format", urie);
    } catch (IOException ioe) {
      LOG.error("Cannot read data from response - Cause : " + ioe.getMessage(), ioe);
    } catch (Exception e) {
      LOG.error("A problem happened while calling backoffice service - Cause : " + e.getMessage(),
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
