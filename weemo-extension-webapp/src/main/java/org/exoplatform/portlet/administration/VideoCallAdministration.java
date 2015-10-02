package org.exoplatform.portlet.administration;

import juzu.Action;
import juzu.HttpMethod;
import juzu.Path;
import juzu.Resource;
import juzu.Response;
import juzu.Route;
import juzu.View;
import juzu.impl.request.Request;
import juzu.plugin.ajax.Ajax;
import juzu.request.HttpContext;
import juzu.template.Template;
import org.apache.commons.lang.StringUtils;
import org.exoplatform.commons.utils.ObjectPageList;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.application.PortalRequestContext;
import org.exoplatform.portal.webui.util.Util;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.organization.Group;
import org.exoplatform.services.organization.MembershipType;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.organization.Query;
import org.exoplatform.services.organization.User;
import org.exoplatform.services.videocall.AuthService;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;
import org.exoplatform.utils.videocall.PropertyManager;
import org.exoplatform.webui.core.UIPageIterator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;
import javax.servlet.http.HttpSession;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;
import java.util.Scanner;


public class VideoCallAdministration {

  @Inject
  @Path("index.gtmpl")
  Template index;

  @Inject
  VideoCalls videoCalls;

  Log log = ExoLogger.getLogger("VideoCallAdministration");

  OrganizationService organizationService_;

  SpaceService spaceService_;

  VideoCallService videoCallService_;

  public static String USER_NAME = "userName";

  public static String LAST_NAME = "lastName";

  public static String FIRST_NAME = "firstName";

  public static String EMAIL = "email";

  public static String MODEL_FROM_AUTH = "VideoCallsAuth";

  private static final Log LOG = ExoLogger.getLogger(VideoCallAdministration.class.getName());

  @Inject
  Provider<PortletPreferences> providerPreferences;

  @Inject
  public VideoCallAdministration(OrganizationService organizationService, SpaceService spaceService,
                                 VideoCallService videoCallService) {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
    videoCallService_ = videoCallService;
  }


  @View
  @Route("/")
  public Response.Content index() throws Exception {
    String weemoKey = "";
    String passPhrase = "";
    String authId = "";
    String authSecret = "";
    String p12CertName = "";
    String pemCertName = "";
    String videoPermissions = "";
    boolean turnOffVideoCall = true;
    boolean isFromAuth = false;

    VideoCallModel videoModel = null;
    PortalRequestContext requestContext = Util.getPortalRequestContext();
    HttpSession httpSession = requestContext.getRequest().getSession();
    if (httpSession.getAttribute(MODEL_FROM_AUTH) != null) {
      videoModel = (VideoCallModel) httpSession.getAttribute(MODEL_FROM_AUTH);
      isFromAuth = true;
      httpSession.removeAttribute(MODEL_FROM_AUTH);
    } else {
      videoModel = videoCallService_.getVideoCallProfile();
      isFromAuth = false;
    }

    if (videoModel != null) {
      weemoKey = videoModel.getWeemoKey();
      passPhrase = videoModel.getCustomerCertificatePassphrase();
      authId = videoModel.getAuthId();
      authSecret = videoModel.getAuthSecret();
      videoPermissions = videoModel.getVideoCallPermissions();
      turnOffVideoCall = Boolean.parseBoolean(videoModel.getDisableVideoCall());
      if (videoCallService_.getP12CertInputStream() != null) {
        p12CertName = videoModel.getP12CertName();
      }
      if (videoCallService_.getPemCertInputStream() != null) {
        pemCertName = videoModel.getPemCertName();
      }
    } else {
      weemoKey = PropertyManager.getProperty(PropertyManager.PROPERTY_WEEMO_KEY);
      passPhrase = PropertyManager.getProperty(PropertyManager.PROPERTY_PASSPHRASE);
      authId = PropertyManager.getProperty(PropertyManager.PROPERTY_CLIENT_KEY_AUTH);
      authSecret = PropertyManager.getProperty(PropertyManager.PROPERTY_CLIENT_SECRET_AUTH);
      videoPermissions = PropertyManager.getProperty(PropertyManager.PROPERTY_DEFAULT_PERMISSION);
    }

    boolean isDisplaySuccessMsg = videoCalls.isDisplaySuccessMsg();
    boolean isDisplayAuthSuccessMsg = videoCalls.isDisplayAuthSuccessMsg();

    // Reset message status
    videoCalls.setDisplaySuccessMsg(false);
    videoCalls.setAuthDisplaySuccessMsg(false);

    return index.with().set("turnOffVideoCall", turnOffVideoCall)
            .set("isDisplaySuccessMsg", isDisplaySuccessMsg)
            .set("isDisplayAuthSuccessMsg", isDisplayAuthSuccessMsg)
            .set("weemoKey", weemoKey)
            .set("isFromAuth", isFromAuth)
            .set("customerCertificatePassphrase", passPhrase)
            .set("authId", authId)
            .set("authSecret", authSecret)
            .set("videoCallPermissions", getListOfPermissions(videoPermissions))
            .set("p12CertName", p12CertName)
            .set("pemCertName", pemCertName)
            .set("isCloudRunning", VideoCallService.isCloudRunning())
            .ok();
  }

  @Action
  @Route("/saveCloud")
  public Response saveCloud(String disableVideoCall, String videoCallPermissions, HttpContext context) throws Exception{
    if (context.getMethod().equals(HttpMethod.GET)) {
      videoCalls.setDisplaySuccessMsg(false);
      return VideoCallAdministration_.index();

    }
    VideoCallService videoCallService = new VideoCallService();
    VideoCallModel videoCallModel = new VideoCallModel();
    if (videoCallService != null) {
      VideoCallModel jcrModel = videoCallService.getVideoCallProfile();
      if (jcrModel != null){
        videoCallModel.setWeemoKey(jcrModel.getWeemoKey());
        videoCallModel.setAuthId(jcrModel.getAuthId());
        videoCallModel.setAuthSecret(jcrModel.getAuthSecret());
        videoCallModel.setCustomerCertificatePassphrase(jcrModel.getCustomerCertificatePassphrase());
        videoCallModel.setDomainId(jcrModel.getDomainId());
        videoCallModel.setProfileId(jcrModel.getProfileId());
        videoCallModel.setVideoCallPermissions(jcrModel.getVideoCallPermissions());
      }
    }

    boolean disableCall = StringUtils.isEmpty(disableVideoCall) ? false : Boolean.parseBoolean(disableVideoCall);
    videoCallModel.setDisableVideoCall(disableVideoCall);

    if(!disableCall) {
      if(videoCallPermissions == null) videoCallPermissions = "";
      videoCallModel.setVideoCallPermissions(videoCallPermissions.trim());
    }
    videoCallService.saveVideoCallProfile(videoCallModel);
    videoCalls.setDisplaySuccessMsg(true);
    return VideoCallAdministration_.index();
  }

  @Action
  @Route("/save")
  public Response save(String disableVideoCall, String weemoKey, String authId, String authSecret,
                       String customerCertificatePassphrase,
                       String videoCallPermissions, org.apache.commons.fileupload.FileItem p12Cert,
                       org.apache.commons.fileupload.FileItem pemCert, HttpContext context) throws Exception {
    if (context.getMethod().equals(HttpMethod.GET)) {
      videoCalls.setDisplaySuccessMsg(false);
      return VideoCallAdministration_.index();

    }
    VideoCallService videoCallService = new VideoCallService();
    VideoCallModel videoCallModel = new VideoCallModel();
    if (StringUtils.isEmpty(disableVideoCall)) {
      videoCallModel.setDisableVideoCall("false");
    } else {
      videoCallModel.setDisableVideoCall(disableVideoCall);
    }

    if (Boolean.parseBoolean(disableVideoCall)) {
      videoCallModel = videoCallService.getVideoCallProfile();
      videoCallModel.setDisableVideoCall(disableVideoCall);
    } else {
      if (weemoKey == null) weemoKey = "";
      if (authId == null) authId = "";
      if (authSecret == null) authSecret = "";
      if (customerCertificatePassphrase == null) customerCertificatePassphrase = "";
      if (videoCallPermissions == null) videoCallPermissions = "";

      videoCallModel.setWeemoKey(weemoKey.trim());
      videoCallModel.setAuthId(authId.trim());
      videoCallModel.setAuthSecret(authSecret.trim());
      videoCallModel.setCustomerCertificatePassphrase(customerCertificatePassphrase.trim());
      videoCallModel.setVideoCallPermissions(videoCallPermissions.trim());
      videoCallModel.setDomainId(PropertyManager.getProperty(PropertyManager.PROPERTY_DOMAIN_ID));
      videoCallModel.setProfileId(PropertyManager.getProperty(PropertyManager.PROPERTY_VIDEO_PROFILE));
      if (p12Cert != null) {
        videoCallModel.setP12Cert(p12Cert.getInputStream());
        videoCallModel.setP12CertName(p12Cert.getName());
      }
      if (pemCert != null) {
        videoCallModel.setPemCert(pemCert.getInputStream());
        videoCallModel.setPemCertName(pemCert.getName());
      }
    }
    videoCallService.saveVideoCallProfile(videoCallModel);
    videoCalls.setDisplaySuccessMsg(true);
    return VideoCallAdministration_.index();
  }

  @Action
  @Route("/auth")
  public Response auth(String disableVideoCall, String weemoKey, String authId, String authSecret,
                       String customerCertificatePassphrase,
                       String videoCallPermissions, org.apache.commons.fileupload.FileItem p12Cert,
                       org.apache.commons.fileupload.FileItem pemCert, HttpContext context) throws Exception {
    PortalRequestContext requestContext = Util.getPortalRequestContext();
    HttpSession httpSession = requestContext.getRequest().getSession();

    if (context.getMethod().equals(HttpMethod.GET)) {
      httpSession.removeAttribute(MODEL_FROM_AUTH);
      return VideoCallAdministration_.index();
    }

    VideoCallModel videoCallModel = new VideoCallModel();
    VideoCallService videoCallService = new VideoCallService();
    String p12CertName = "";
    String pemCertName = "";

    InputStream isP12 = null;
    InputStream isPem = null;

    if (weemoKey == null) weemoKey = "";
    if (authId == null) authId = "";
    if (authSecret == null) authSecret = "";
    if (customerCertificatePassphrase == null) customerCertificatePassphrase = "";
    if (videoCallPermissions == null) videoCallPermissions = "";

    VideoCallModel profile = videoCallService.getVideoCallProfile();
    if (p12Cert == null) {
      isP12 = videoCallService.getP12CertInputStream();
      p12CertName = profile.getP12CertName();
    } else {
      isP12 = p12Cert.getInputStream();
      p12CertName = p12Cert.getName();
    }
    if (pemCert == null) {
      isPem = videoCallService.getPemCertInputStream();
      pemCertName = profile.getPemCertName();
    } else {
      isPem = pemCert.getInputStream();
      pemCertName = pemCert.getName();
    }

    videoCallModel.setWeemoKey(weemoKey);
    videoCallModel.setDisableVideoCall(disableVideoCall);
    videoCallModel.setAuthId(authId.trim());
    videoCallModel.setAuthSecret(authSecret.trim());
    videoCallModel.setCustomerCertificatePassphrase(customerCertificatePassphrase.trim());
    videoCallModel.setP12Cert(isP12);
    videoCallModel.setPemCert(isPem);
    videoCallModel.setP12CertName(p12CertName);
    videoCallModel.setPemCertName(pemCertName);
    videoCallModel.setVideoCallPermissions(videoCallPermissions.trim());
    videoCallModel.setDomainId(PropertyManager.getProperty(PropertyManager.PROPERTY_DOMAIN_ID));
    videoCallModel.setProfileId(PropertyManager.getProperty(PropertyManager.PROPERTY_VIDEO_PROFILE));
    videoCallModel.setVideoCallPermissions(videoCallPermissions);

    //Check weemo key is right or not
    if (StringUtils.isEmpty(weemoKey)) {
      videoCalls.setAuthDisplaySuccessMsg(false);
      httpSession.setAttribute(MODEL_FROM_AUTH, videoCallModel);
      return VideoCallAdministration_.index();
    } else {
      URL url = new URL("https://cjs.weemo.com/js/webappid/" + weemoKey + "");
      InputStream in = url.openStream();
      Scanner scan = new Scanner(in);
      StringBuffer sb = new StringBuffer();
      while (scan.hasNext()) {
        String str = scan.nextLine();
        sb.append(str);
      }
      scan.close();
      if (sb.toString().contains("Not allowed (disabled)")){
        videoCalls.setAuthDisplaySuccessMsg(false);
        httpSession.setAttribute(MODEL_FROM_AUTH, videoCallModel);
        return VideoCallAdministration_.index();
      }
    }
    //Check for other parametters in case weemoKey is right
    AuthService authService = new AuthService();
    String profileId = PropertyManager.getProperty(PropertyManager.PROPERTY_VIDEO_PROFILE);
    String content = authService.authenticate(videoCallModel, profileId);
    if (content != null && content.contains("token")) {
      videoCalls.setAuthDisplaySuccessMsg(true);
    } else {
      videoCalls.setAuthDisplaySuccessMsg(false);
    }
    httpSession.setAttribute(MODEL_FROM_AUTH, videoCallModel);
    return VideoCallAdministration_.index();

  }

  @Ajax
  @Resource
  public Response.Content openUserPermission() throws Exception {
    ObjectPageList objPageList = new ObjectPageList(organizationService_.getUserHandler().findUsers(new Query())
            .getAll(), 10);
    UIPageIterator uiIterator = new UIPageIterator();
    uiIterator.setPageList(objPageList);
    List<User> users = uiIterator.getCurrentPageData();
    JSONArray arrays = new JSONArray();
    for (int i = 0; i < users.size(); i++) {
      User user = users.get(i);
      if (StringUtils.isEmpty(user.getDisplayName())) {
        user.setDisplayName(user.getFirstName() + " " + user.getLastName());
      }
      JSONObject obj = new JSONObject();
      obj.put("userName", user.getUserName());
      obj.put("firstName", user.getFirstName());
      obj.put("lastName", user.getLastName());
      obj.put("displayName", user.getDisplayName());
      obj.put("email", user.getEmail());
      arrays.put(obj.toString());
    }
    return Response.ok(arrays.toString()).withMimeType("application/json; charset=UTF-8").withHeader("Cache-Control",
            "no-cache");

  }

  @Ajax
  @Resource
  public Response.Content searchUserPermission(String keyword, String filter) throws Exception {
    Query q = new Query();
    if (keyword != null && (keyword = keyword.trim()).length() != 0) {
      if (keyword.indexOf("*") < 0) {
        if (keyword.charAt(0) != '*')
          keyword = "*" + keyword;
        if (keyword.charAt(keyword.length() - 1) != '*')
          keyword += "*";
      }
      keyword = keyword.replace('?', '_');
      if (USER_NAME.equals(filter)) {
        q.setUserName(keyword);
      }
      if (LAST_NAME.equals(filter)) {
        q.setLastName(keyword);
      }
      if (FIRST_NAME.equals(filter)) {
        q.setFirstName(keyword);
      }
      if (EMAIL.equals(filter)) {
        q.setEmail(keyword);
      }
    }

    List<User> users = organizationService_.getUserHandler().findUsers(q).getAll();
    JSONArray arrays = new JSONArray();
    for (int i = 0; i < users.size(); i++) {
      User user = users.get(i);
      if (StringUtils.isEmpty(user.getDisplayName())) {
        user.setDisplayName(user.getFirstName() + " " + user.getLastName());
      }
      JSONObject obj = new JSONObject();
      obj.put("userName", user.getUserName());
      obj.put("firstName", user.getFirstName());
      obj.put("lastName", user.getLastName());
      obj.put("displayName", user.getDisplayName());
      obj.put("email", user.getEmail());
      arrays.put(obj.toString());
    }
    return Response.ok(arrays.toString()).withMimeType("application/json; charset=UTF-8").withHeader("Cache-Control",
            "no-cache");
  }


  @Ajax
  @Resource
  public Response.Content openGroupPermission(String groupId) throws Exception {
    Collection<?> collection = organizationService_.getMembershipTypeHandler().findMembershipTypes();
    List<String> listMemberhip = new ArrayList<String>(5);
    StringBuffer sb = new StringBuffer();
    String memberships = "";
    for (Object obj : collection) {
      listMemberhip.add(((MembershipType) obj).getName());
    }
    if (!listMemberhip.contains("*")) listMemberhip.add("*");
    Collections.sort(listMemberhip);
    for (String string : listMemberhip) {
      sb.append(string).append(",");
    }
    memberships = sb.toString();
    memberships = memberships.substring(0, memberships.length() - 1);

    String groups = "[";
    StringBuffer sbGroups = new StringBuffer();
    Collection<?> sibblingsGroup = null;
    if (StringUtils.isEmpty(groupId)) {
      sibblingsGroup = organizationService_.getGroupHandler().findGroups(null);
    } else {
      Group group = organizationService_.getGroupHandler().findGroupById(groupId);
      String parentId = group.getParentId();
      Group parentGroup = null;
      if (parentId != null) {
        parentGroup = organizationService_.getGroupHandler().findGroupById(parentId);
      }
      sibblingsGroup = organizationService_.getGroupHandler().findGroups(parentGroup);
    }
    if (sibblingsGroup != null && sibblingsGroup.size() > 0) {
      for (Object obj : sibblingsGroup) {
        String groupLabel = ((Group) obj).getLabel();
        String groupIdObj = ((Group) obj).getId();
        if (groupId != null && groupIdObj.equalsIgnoreCase(groupId)) {
          String groupObj = loadChildrenGroups(groupId, groupLabel);
          sbGroups.append(groupObj).append(",");
        } else {
          sb = new StringBuffer();
          sb.append("{\"group\":\"").append(groupIdObj).append("\",\"label\":\"").append(groupLabel).append("\"}");
          sbGroups.append(sb.toString()).append(",");
        }
      }
    }

    groups = groups.concat(sbGroups.toString());
    if (groups.length() > 1) {
      groups = groups.substring(0, groups.length() - 1);
    }
    groups = groups.concat("]");
    StringBuffer sbResponse = new StringBuffer();
    sbResponse.append("{\"memberships\":\"").append(memberships).append("\", \"groups\":").append(groups).append("}");
    return Response.ok(sbResponse.toString()).withMimeType("application/json; charset=UTF-8").withHeader
            ("Cache-Control", "no-cache");
  }

  public String loadChildrenGroups(String groupId, String groupLabel) throws Exception {
    JSONObject objGroup = new JSONObject();
    Group group = organizationService_.getGroupHandler().findGroupById(groupId);
    objGroup.put("group", groupId);
    objGroup.put("label", groupLabel);
    if (group != null) {
      Collection<?> collection = organizationService_.getGroupHandler().findGroups(group);
      if (collection.size() > 0) {
        StringBuffer sbChildren = new StringBuffer();
        sbChildren.append("[");
        for (Object obj : collection) {
          String groupIdObj = ((Group) obj).getId();
          String groupLabelObj = ((Group) obj).getLabel();
          sbChildren.append("{\"group\":\"").append(groupIdObj).append("\",\"label\":\"").append(groupLabelObj)
                  .append("\"},");
        }
        String childrenGroups = sbChildren.toString();
        if (childrenGroups.length() > 1) {
          childrenGroups = childrenGroups.substring(0, childrenGroups.length() - 1);
        }
        childrenGroups = childrenGroups.concat("]");
        objGroup.put("children", childrenGroups);
      }
    }
    return objGroup.toString();
  }

  public String getListOfPermissions(String videoPermissions) {
    String result = "";
    Request request = Request.getCurrent();
    Locale locale = request.getUserContext().getLocale();
    ResourceBundle resoureBundle = request.getApplicationContext().resolveBundle(locale);

    StringBuffer sb = new StringBuffer();
    try {
      if (videoPermissions != null && videoPermissions.length() > 0) {
        String[] arrPermissions = videoPermissions.split(",");
        for (String string : arrPermissions) {
          if (string.split("#").length < 3) continue;
          String permissionId = string.split("#")[0];
          String enableVideoCalls = string.split("#")[1];
          sb.append("#").append(permissionId).append(",").append(enableVideoCalls);
          String enableVideoGroupCalls = string.split("#")[2];
          sb.append(",").append(enableVideoGroupCalls);

          if (permissionId.indexOf(":") > 0) {
            String membership = permissionId.split(":")[0].trim();
            String memebershipLabel = membership;
            String groupId = permissionId.split(":")[1];
            Group group = organizationService_.getGroupHandler().findGroupById(groupId);
            if (group != null) {
              sb.append(",").append(capitalize(memebershipLabel)).append(" ").append(resoureBundle.getString
                      ("exoplatform.videocall.administration.permission.in")).append(" ").append(group.getLabel())
                      .append(" (").append(permissionId).
                      append(")");
            }
          } else {
            User user = organizationService_.getUserHandler().findUserByName(permissionId.trim());
            if (user != null) {
              if (StringUtils.isEmpty(user.getDisplayName())) {
                user.setDisplayName(user.getFirstName() + " " + user.getLastName());
              }
              sb.append(",").append(user.getDisplayName()).append(" (").append(user.getUserName()).append(")");
            }
          }
        }
        if (sb.length() >= 1) result = sb.substring(1);
      }
    } catch (Exception ex) {
      if (log.isErrorEnabled()) {
        log.error("getListOfPermissions() failed because of ", ex);
      }
    }
    return result;
  }

  public static String capitalize(String s) {
    if (s.length() == 0) return s;
    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
  }

}
