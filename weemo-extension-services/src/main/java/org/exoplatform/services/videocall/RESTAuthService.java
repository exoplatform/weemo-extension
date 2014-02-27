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


import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.MediaType;

import org.apache.commons.lang.StringUtils;
import org.exoplatform.services.rest.resource.ResourceContainer;
import org.json.JSONException;
import org.json.JSONObject;

@Path("/weemo/")
public class RESTAuthService implements ResourceContainer{
  private AuthService authService;
  
  public RESTAuthService() {     
  }
  
  @GET
  @Path("/auth/")
  @RolesAllowed("users")
  public Response auth(@Context HttpServletRequest servletRequest) {
    authService = new AuthService(); 
    String content = authService.authenticate(servletRequest, "basic");    
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }
  
  @GET
  @Path("/auth/{profileId}/")
  @RolesAllowed("users")
  public Response auth(@Context HttpServletRequest servletRequest, @PathParam("profileId") String profileId) {
    authService = new AuthService(); 
    String content = authService.authenticate(servletRequest, profileId);    
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }
}
