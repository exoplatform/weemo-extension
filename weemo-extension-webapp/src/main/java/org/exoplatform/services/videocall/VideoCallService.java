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

import java.util.HashMap;
import java.util.Iterator;

import javax.jcr.Node;
import javax.jcr.Session;

import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.cache.ExoCache;
import org.exoplatform.services.jcr.RepositoryService;
import org.exoplatform.services.jcr.ext.common.SessionProvider;
import org.exoplatform.services.wcm.utils.WCMCoreUtils;



public class VideoCallService {
  
  private ExoCache<String, Object> cache;
  public static String BASE_PATH = "exo:applications";
  public static String VIDEOCALL_BASE_PATH = "VideoCall";
  public static String VIDEOCALL_NODETYPE = "exo:videoCallProfile";
  public static String DISABLEVIDEOCALL_PROP ="exo:disableVideoCall";
  public static String WEEMOKEY_PROP = "exo:weemoKey";
  public static String VIDEO_PROFILES_PROP = "exo:videoCallPermissions";
  
  protected static final String WORKSPACE_NAME = "collaboration";
  
  public void saveVideoCallProfile(VideoCallModel videoCallModel) {
    String disbaleVideoCall = videoCallModel.getDisableVideoCall();
    String weemoKey = videoCallModel.getWeemoKey();
    StringBuffer sb = new StringBuffer();
    String permissions = null;
    HashMap<String, Boolean> videoCallPermissions = videoCallModel.getVideoCallPermissions();
    if(videoCallPermissions != null && videoCallPermissions.size() > 0) {
      Iterator<String> keys = videoCallPermissions.keySet().iterator();
      Iterator<Boolean> values = videoCallPermissions.values().iterator();
      
      while(keys.hasNext() && values.hasNext()) {
        sb.append(keys.next() + ":" + values.next() + ",");
      }
      permissions = sb.toString();
      permissions = permissions.substring(0, permissions.length()-1);
    }
    
    
    SessionProvider sessionProvider = null;
    try{
      RepositoryService repositoryService = WCMCoreUtils.getService(RepositoryService.class);
      sessionProvider = WCMCoreUtils.getUserSessionProvider();
      Session session = sessionProvider.getSession(WORKSPACE_NAME, repositoryService.getCurrentRepository());
      Node rootNode = session.getRootNode();
      Node baseNode = rootNode.getNode(BASE_PATH);
      Node videoCallNode = null;
      if(baseNode.hasNode(VIDEOCALL_BASE_PATH)) {
        videoCallNode = baseNode.getNode(VIDEOCALL_BASE_PATH);
      } else {
        videoCallNode = baseNode.addNode(VIDEOCALL_BASE_PATH, VIDEOCALL_NODETYPE);       
      }
      videoCallNode.setProperty(DISABLEVIDEOCALL_PROP, disbaleVideoCall);
      videoCallNode.setProperty(WEEMOKEY_PROP, weemoKey);
      session.save();
      
      
    } catch(Exception ex) {
      
    }
  }

}
