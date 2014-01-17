package org.exoplatform.portlet.administration;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import juzu.*;
import juzu.Response.Render;
import juzu.plugin.ajax.Ajax;
import juzu.request.RenderContext;
import juzu.template.Template;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;

import org.exoplatform.commons.utils.ObjectPageList;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.webui.page.PageIterator;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.organization.Query;
import org.exoplatform.services.organization.User;
import org.exoplatform.services.videocall.VideoCallService;
import org.exoplatform.social.core.space.spi.SpaceService;
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
      JSONObject obj = new JSONObject();
      obj.put("userName", user.getUserName());
      obj.put("firstName", user.getFirstName());
      obj.put("lastName", user.getLastName());
      obj.put("email", user.getEmail());
      arrays.put(obj.toString());
    }
    
    return Response.ok(arrays.toString()).withMimeType("application/json; charset=UTF-8").withHeader("Cache-Control", "no-cache");
  }
}
