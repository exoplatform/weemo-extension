package org.exoplatform.portlet.administration;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

import juzu.*;
import juzu.plugin.ajax.Ajax;
import juzu.request.RenderContext;
import juzu.template.Template;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;
import org.exoplatform.services.organization.Group;

import org.apache.commons.lang.StringUtils;
import org.exoplatform.commons.utils.ObjectPageList;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.organization.MembershipType;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.organization.Query;
import org.exoplatform.services.organization.User;
import org.exoplatform.services.organization.idm.ExtGroup;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;
import org.exoplatform.utils.videocall.PropertyManager;
import org.exoplatform.webui.core.UIPageIterator;
import org.json.JSONArray;
import org.json.JSONObject;

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
  
  public static String USER_NAME = "userName";

  public static String LAST_NAME = "lastName";

  public static String FIRST_NAME = "firstName";
  
  public static String EMAIL = "email";

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
  @Route("/")
  public void index(RenderContext renderContext) throws Exception
  {  
    String weemoKey = "";
    String passPhrase = "";
    String authId = "";
    String authSecret = "";
    String p12CertName = "";
    String pemCertName = "";
    String videoPermissions = "";
    boolean turnOffVideoCall = true;
    
    VideoCallModel videoModel = videoCallService_.getVideoCallProfile();
    if(videoModel != null) {
      weemoKey = videoModel.getWeemoKey();
      passPhrase = videoModel.getCustomerCertificatePassphrase();
      authId = videoModel.getAuthId();
      authSecret = videoModel.getAuthSecret();
      videoPermissions = videoModel.getVideoCallPermissions();
      turnOffVideoCall = Boolean.parseBoolean(videoModel.getDisableVideoCall());
      p12CertName = VideoCallService.VIDEO_P12_CERT_NODE_NAME;
      pemCertName = VideoCallService.VIDEO_PEM_CERT_NODE_NAME;    
    }    
    
    index.with().set("turnOffVideoCall", turnOffVideoCall)
              .set("isDisplaySuccessMsg", videoCalls.isDisplaySuccessMsg())
              .set("weemoKey", weemoKey)
              .set("customerCertificatePassphrase", passPhrase)
              .set("authId", authId)
              .set("authSecret", authSecret)
              .set("videoCallPermissions", getListOfPermissions(videoPermissions))
              .set("p12CertName", p12CertName)
              .set("pemCertName", pemCertName)
              .render();
    videoCalls.setDisplaySuccessMsg(false);
  }  
  
  @Action
  @Route("/save")
  public Response save(String disableVideoCall, String weemoKey, String authId, String authSecret, String customerCertificatePassphrase,
                       String videoCallPermissions, org.apache.commons.fileupload.FileItem p12Cert,
                       org.apache.commons.fileupload.FileItem pemCert) throws Exception{
    VideoCallService videoCallService = new VideoCallService();
    VideoCallModel videoCallModel = new VideoCallModel();
     if(StringUtils.isEmpty(disableVideoCall)) {
       videoCallModel.setDisableVideoCall("false");
     }    
     videoCallModel.setWeemoKey(weemoKey);
     videoCallModel.setAuthId(authId);
     videoCallModel.setAuthSecret(authSecret);
     videoCallModel.setCustomerCertificatePassphrase(customerCertificatePassphrase);
     videoCallModel.setVideoCallPermissions(videoCallPermissions);
     videoCallModel.setDomainId(PropertyManager.getProperty(PropertyManager.PROPERTY_DOMAIN_ID));
     videoCallModel.setProfileId(PropertyManager.getProperty(PropertyManager.PROPERTY_VIDEO_PROFILE));
     
     if(p12Cert != null) {
       videoCallModel.setP12Cert(p12Cert.getInputStream());
       videoCallModel.setP12CertName(p12Cert.getName());
     } else {
       videoCallModel.setP12CertName(VideoCallService.VIDEO_P12_CERT_NODE_NAME);
     }
     if(pemCert != null) {
       videoCallModel.setPemCert(pemCert.getInputStream());
       videoCallModel.setPemCertName(pemCert.getName());
     } else {
       videoCallModel.setP12CertName(VideoCallService.VIDEO_PEM_CERT_NODE_NAME);
     }
     
     videoCallService.saveVideoCallProfile(videoCallModel);
     videoCalls.setDisplaySuccessMsg(true);     
     return VideoCallAdministration_.index();
  }
  
  @Ajax
  @Resource
  public Response.Content openUserPermission() throws Exception {
    ObjectPageList objPageList = new ObjectPageList(organizationService_.getUserHandler().findUsers(new Query()).getAll(), 10);
    UIPageIterator uiIterator = new UIPageIterator();
    uiIterator.setPageList(objPageList);
    List<User> users = uiIterator.getCurrentPageData();
    JSONArray arrays = new JSONArray();
    for(int i=0; i< users.size(); i++) {
      User user = users.get(i);
      if(StringUtils.isEmpty(user.getDisplayName())) {
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
    return Response.ok(arrays.toString()).withMimeType("application/json; charset=UTF-8").withHeader("Cache-Control", "no-cache");
    
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
    for(int i=0; i< users.size(); i++) {
      User user = users.get(i);
      if(StringUtils.isEmpty(user.getDisplayName())) {
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
    return Response.ok(arrays.toString()).withMimeType("application/json; charset=UTF-8").withHeader("Cache-Control", "no-cache");
  }  
  
  
  @Ajax
  @Resource
  public Response.Content openGroupPermission(String groupId) throws Exception {
    Collection<?> collection = organizationService_.getMembershipTypeHandler().findMembershipTypes();
    List<String> listMemberhip = new ArrayList<String>(5);
    StringBuffer sb = new StringBuffer();
    String memberships = "";
    for(Object obj : collection){
      listMemberhip.add(((MembershipType)obj).getName());      
    }
    if (!listMemberhip.contains("*")) listMemberhip.add("*");
    Collections.sort(listMemberhip);
    for (String string : listMemberhip) {
      sb.append(string).append(",");
    }
    memberships = sb.toString();
    memberships = memberships.substring(0, memberships.length()-1);
    
    String groups = "[";
    StringBuffer sbGroups = new StringBuffer();
    Collection<?> sibblingsGroup = null;
    if(StringUtils.isEmpty(groupId)) {
      sibblingsGroup = organizationService_.getGroupHandler().findGroups(null);      
    } else {
      Group group = organizationService_.getGroupHandler().findGroupById(groupId);
      String parentId = group.getParentId();
      Group parentGroup = null;
      if(parentId != null) {
        parentGroup = organizationService_.getGroupHandler().findGroupById(parentId);
      }
      sibblingsGroup = organizationService_.getGroupHandler().findGroups(parentGroup);      
    }
    if(sibblingsGroup != null && sibblingsGroup.size() > 0) { 
      for(Object obj : sibblingsGroup){      
        String groupLabel = ((ExtGroup)obj).getLabel();
        if(groupId != null && ((ExtGroup)obj).getId().equalsIgnoreCase(groupId)) {
          String groupObj = loadChildrenGroups(groupId, groupLabel);
          sbGroups.append(groupObj).append(",");
        } else {
          sb = new StringBuffer();
          sb.append("{\"group\":\""+((ExtGroup)obj).getId()+"\",\"label\":\""+groupLabel+"\"}");
          sbGroups.append(sb.toString()).append(",");
        }
      }
    }
    
    
    groups = groups.concat(sbGroups.toString());
    if(groups.length() > 1) {
      groups = groups.substring(0, groups.length()-1);
    }
    groups = groups.concat("]");
    StringBuffer sbResponse = new StringBuffer();
    sbResponse.append("{\"memberships\":\""+memberships+"\", \"groups\":"+groups+"}");
    return Response.ok(sbResponse.toString()).withMimeType("application/json; charset=UTF-8").withHeader("Cache-Control", "no-cache");
  }
  
  public String loadChildrenGroups(String groupId, String groupLabel) throws Exception {
    JSONObject objGroup = new JSONObject();
    Group group = organizationService_.getGroupHandler().findGroupById(groupId);
    objGroup.put("group", groupId);
    objGroup.put("label", groupLabel);
    if(group != null) {
      Collection<?> collection = organizationService_.getGroupHandler().findGroups(group);
      if(collection.size() > 0) {
        StringBuffer sbChildren = new StringBuffer();
        sbChildren.append("[");
        for(Object obj : collection){          
          sbChildren.append("{\"group\":\""+((ExtGroup)obj).getId()+"\",\"label\":\""+((ExtGroup)obj).getLabel()+"\"},");
        } 
        String childrenGroups = sbChildren.toString();
        if(childrenGroups.length() > 1) {
          childrenGroups = childrenGroups.substring(0, childrenGroups.length()-1);
        }
        childrenGroups = childrenGroups.concat("]");
        objGroup.put("children", childrenGroups);
      }          
    }
    return objGroup.toString();
  }
  
  public String getListOfPermissions(String videoPermissions) throws Exception {
    String result = "";
    StringBuffer sb = new StringBuffer();
    if(videoPermissions != null && videoPermissions.length() > 0) {
      String[] arrPermissions = videoPermissions.split(",");
      for (String string : arrPermissions) {
        if(string.split("#").length < 2) continue;
        String permissionId = string.split("#")[0];
        String enableVideoCalls = string.split("#")[1];
        sb.append("#").append(permissionId).append(",").append(enableVideoCalls);
        if(permissionId.indexOf(":") > 0) {
          String membership = permissionId.split(":")[0].trim();
          String memebershipLabel = membership;
          if(memebershipLabel.equalsIgnoreCase("*")) memebershipLabel = "any";
          String groupId = permissionId.split(":")[1];
          Group group = organizationService_.getGroupHandler().findGroupById(groupId);
          sb.append(",").append(capitalize(memebershipLabel) + " in " + group.getLabel());
        } else {
          User user = organizationService_.getUserHandler().findUserByName(permissionId.trim());
          if(StringUtils.isEmpty(user.getDisplayName())) {
            user.setDisplayName(user.getFirstName() + " " + user.getLastName());
          }         
          sb.append(",").append(user.getDisplayName());
        }
      }
      if(sb.length() >= 1) result = sb.substring(1);      
    }
    return result;
  }
  
  public static String capitalize(String s) {
    if (s.length() == 0) return s;
    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
  }
  
}
