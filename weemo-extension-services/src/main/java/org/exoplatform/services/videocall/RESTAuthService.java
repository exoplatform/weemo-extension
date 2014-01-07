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
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.MediaType;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.rest.resource.ResourceContainer;
import org.exoplatform.utils.videocall.PropertyManager;
import org.json.JSONArray;

@Path("/weemo/")
public class RESTAuthService implements ResourceContainer{
  private static final Log LOG = ExoLogger.getLogger(RESTAuthService.class);
  private final AuthService authService;
  
  public RESTAuthService() {
    String app_id = PropertyManager.getProperty(PropertyManager.PROPERTY_APP_ID);
    String domain_id = PropertyManager.getProperty(PropertyManager.PROPERTY_DOMAIN_ID);
    String authUrl = PropertyManager.getProperty(PropertyManager.PROPERTY_AUTH_URL);
    String client_id = PropertyManager.getProperty(PropertyManager.PROPERTY_CLIENT_KEY_AUTH);
    String clientSecret = PropertyManager.getProperty(PropertyManager.PROPERTY_CLIENT_SECRET_AUTH);
    String caFile = PropertyManager.getProperty(PropertyManager.PROPERTY_CA_FILE);
    String p12File = PropertyManager.getProperty(PropertyManager.PROPERTY_P12_FILE);
    String passphrase = PropertyManager.getProperty(PropertyManager.PROPERTY_PASSPHRASE);
    authService = new AuthService(app_id, domain_id, authUrl, caFile, p12File, passphrase, client_id, clientSecret);
  }
  
  @GET
  @Path("/auth/")
  @RolesAllowed("users")
  public Response auth(@Context HttpServletRequest servletRequest) {
    String content = authService.authenticate(servletRequest, "basic");    
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }
  
  @GET
  @Path("/auth/{profileId}/")
  @RolesAllowed("users")
  public Response auth(@Context HttpServletRequest servletRequest, @PathParam("profileId") String profileId) {
    String content = authService.authenticate(servletRequest, profileId);    
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }
}
