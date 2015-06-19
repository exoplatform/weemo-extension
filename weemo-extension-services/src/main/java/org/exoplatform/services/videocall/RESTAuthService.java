/*
 * Copyright (C) 2003-2013 eXo Platform SAS.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.exoplatform.services.videocall;


import org.exoplatform.model.videocall.MessageInfo;
import org.exoplatform.services.rest.resource.ResourceContainer;
import org.exoplatform.services.security.ConversationState;
import org.exoplatform.utils.videocall.PropertyManager;
import org.json.JSONObject;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/weemo/")
public class  RESTAuthService implements ResourceContainer{
  private AuthService authService;
  
  public RESTAuthService() {     
  }
  
  @GET
  @Path("/auth/")
  @RolesAllowed("users")
  public Response auth() {
    authService = new AuthService();
    String profileId = PropertyManager.getProperty(PropertyManager.PROPERTY_VIDEO_PROFILE);
    String content = authService.authenticate(null, profileId);
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }
  
  @GET
  @Path("/verify/")
  @RolesAllowed("users")
  public Response verifyPermission(@QueryParam("permissionId") String permissionId) throws Exception {
    authService = new AuthService(); 
    JSONObject json = authService.verifyPermission(permissionId);     
    return Response.ok(json.toString(), MediaType.APPLICATION_JSON).build();    
  }
  
  @GET
  @Path("/auth/{profileId}/")
  @RolesAllowed("users")
  public Response auth(@PathParam("profileId") String profileId) {
    authService = new AuthService(); 
    String content = authService.authenticate(null, profileId);    
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }

  @GET
  @Path("/hasOneOneCallPermission/{userId}/")
  @RolesAllowed("users")
  public Response hasOneOneCallPermission(@PathParam("userId") String userId) throws Exception {
    VideoCallService videoCallService = new VideoCallService();
    boolean hasOneOneCallPermission = !videoCallService.isTurnOffVideoCallForUser(false, userId);
    return Response.ok(String.valueOf(hasOneOneCallPermission)).build();
  }

  @GET
  @Path("/sendMessage/{callee}/{messageType}/{callMode}")
  @RolesAllowed("users")
  public Response sendMessage(@PathParam("callee") String callee, @PathParam("messageType") String messageType,
                              @PathParam("callMode") String callMode) throws Exception {
    CacheControl cacheControl = new CacheControl();
    cacheControl.setNoCache(true);

    MessageInfo messageInfo = new MessageInfo(messageType, ConversationState
            .getCurrent().getIdentity().getUserId(), callee, "one");

    WebNotificationSender.sendJsonMessage(callee, messageInfo);
    return Response.ok().cacheControl(cacheControl).build();
  }
}
