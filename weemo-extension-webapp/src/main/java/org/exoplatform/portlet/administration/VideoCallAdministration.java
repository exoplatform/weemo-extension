package org.exoplatform.portlet.administration;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.logging.Logger;

import juzu.*;
import juzu.Response.Render;
import juzu.impl.common.JSON;
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
import org.exoplatform.portal.webui.page.PageIterator;
import org.exoplatform.services.jcr.ext.organization.GroupImpl;
import org.exoplatform.services.organization.MembershipType;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.organization.Query;
import org.exoplatform.services.organization.User;
import org.exoplatform.services.organization.hibernate.GroupDAOImpl;
import org.exoplatform.services.organization.idm.ExtGroup;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;
import org.exoplatform.webui.core.UIPageIterator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.internal.runners.model.EachTestNotifier;

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
     if(videoCallModel.getDisableVideoCall() == null) {
       videoCallModel.setDisableVideoCall("false");
     }
     VideoCallService videoCallService = new VideoCallService();
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
  public Response.Content openGroupPermission() throws Exception {
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
    
    String groups = "";
    StringBuffer sbGroups = new StringBuffer();
    Collection<?> sibblingsGroup = organizationService_.getGroupHandler().findGroups(null);
    for(Object obj : sibblingsGroup){      
      String groupName = ((ExtGroup)obj).getGroupName();
      String groupObj = loadGroups(groupName);
      sbGroups.append(groupObj).append(",");
    }
    groups = sbGroups.toString();
    if(groups.length() > 0) {
      groups = groups.substring(0, groups.length()-1);
    }
    System.out.println(" == GROUP ==" + groups);
    JSONObject response = new JSONObject();
    response.put("memberships", memberships);
    response.put("groups", groups);
    System.out.println(" JSON OBJECT " + response.toString());
    return Response.ok(response.toString()).withMimeType("application/json; charset=UTF-8").withHeader("Cache-Control", "no-cache");
  }
  
  public String loadGroups(String groupName) throws Exception {
    JSONObject objGroup = new JSONObject();
    Queue<String> queue = new LinkedList<String>();
    queue.add(groupName);
    while (!queue.isEmpty()) {
      String groupId = queue.poll();     
      String children = "";
      StringBuffer sbChildren = new StringBuffer();
      Group group = organizationService_.getGroupHandler().findGroupById(groupId);
      if(group != null) {
        Collection<?> collection = organizationService_.getGroupHandler().findGroups(group);
        for(Object obj : collection){
          queue.add(((ExtGroup)obj).getGroupName());
          sbChildren.append(((ExtGroup)obj).getGroupName()).append(",");
        }     
        children = sbChildren.toString();
      }
      if(children.length() > 0) {        
        children = children.substring(0, children.length()-1);
        objGroup.put("children", children);
      }
      objGroup.put("group", groupId);
    }
    //System.out.println("  load group ==" + objGroup.toString());
    return objGroup.toString();
  }
  
}
