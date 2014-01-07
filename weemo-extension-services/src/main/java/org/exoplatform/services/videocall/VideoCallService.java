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

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import javax.jcr.LoginException;
import javax.jcr.NoSuchWorkspaceException;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import org.exoplatform.commons.utils.CommonsUtils;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.cache.CacheService;
import org.exoplatform.services.cache.ExoCache;
import org.exoplatform.services.jcr.RepositoryService;
import org.exoplatform.services.jcr.access.PermissionType;
import org.exoplatform.services.jcr.core.ExtendedNode;
import org.exoplatform.services.jcr.ext.common.SessionProvider;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.wcm.utils.WCMCoreUtils;
import org.apache.commons.lang.StringUtils;



public class VideoCallService {
  private static ExoCache<Serializable, VideoCallModel> videoProfileCache;
  private static String VIDEO_PROFILE_KEY = "videoCallsProfile" + CommonsUtils.getRepository().getConfiguration().getName();
  public static String BASE_PATH = "exo:applications";
  public static String VIDEOCALL_BASE_PATH = "VideoCall";
  public static String VIDEOCALL_NODETYPE = "exo:videoCallProfile";
  public static String DISABLEVIDEOCALL_PROP ="exo:disableVideoCall";
  public static String WEEMOKEY_PROP = "exo:weemoKey";
  public static String VIDEO_PERMISSIONS_PROP = "exo:videoCallPermissions";
  public static String VIDEO_TOKEN_KEY = "exo:tokenKey";
  
  private static final Log LOG = ExoLogger.getLogger(VideoCallService.class.getName());
  
  protected static final String WORKSPACE_NAME = "collaboration";
  
  public VideoCallService() {
    videoProfileCache = WCMCoreUtils.getService(CacheService.class).getCacheInstance(VideoCallService.class.getName());
  }
  
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
    try {
      sessionProvider = SessionProvider.createSystemProvider();
      RepositoryService repositoryService = WCMCoreUtils.getService(RepositoryService.class);
      Session session = sessionProvider.getSession(WORKSPACE_NAME, repositoryService.getCurrentRepository());
      
      Node rootNode = session.getRootNode();
      Node baseNode = rootNode.getNode(BASE_PATH);
      Node videoCallNode = null;
      if(baseNode.hasNode(VIDEOCALL_BASE_PATH)) {
        videoCallNode = baseNode.getNode(VIDEOCALL_BASE_PATH);
      } else {
        videoCallNode = baseNode.addNode(VIDEOCALL_BASE_PATH, VIDEOCALL_NODETYPE);       
      }
      session.save();
      videoCallNode.setProperty(DISABLEVIDEOCALL_PROP, Boolean.valueOf(disbaleVideoCall));
      videoCallNode.setProperty(WEEMOKEY_PROP, weemoKey);
      videoCallNode.setProperty(VIDEO_TOKEN_KEY, videoCallModel.getTokenKey());
      videoCallNode.setProperty(VIDEO_PERMISSIONS_PROP, permissions);
      ExtendedNode node = (ExtendedNode) videoCallNode;
      if (node.canAddMixin("exo:privilegeable")) { 
        node.addMixin("exo:privilegeable");
        node.setPermission("*:/platform/users",new String[] { PermissionType.READ });
      }
      session.save();  
      videoProfileCache.put(VIDEO_PROFILE_KEY, videoCallModel);
    } catch (LoginException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("saveVideoCallProfile() failed because of ", e);
      }
    } catch (NoSuchWorkspaceException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("saveVideoCallProfile() failed because of ", e);
      }
    } catch (RepositoryException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("saveVideoCallProfile() failed because of ", e);
      }
    } finally {
      if (sessionProvider != null) {
        sessionProvider.close();
      }
    }
  }
  
  public VideoCallModel getVideoCallProfile() {
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_PROFILE_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_PROFILE_KEY);
    } else {
      SessionProvider sessionProvider = null;
      RepositoryService repositoryService = WCMCoreUtils.getService(RepositoryService.class);
      sessionProvider = WCMCoreUtils.getUserSessionProvider();
      Session session;
      try {
        session = sessionProvider.getSession(WORKSPACE_NAME, repositoryService.getCurrentRepository());    
        Node rootNode = session.getRootNode();
        Node baseNode = rootNode.getNode(BASE_PATH);
        if(baseNode.hasNode(VIDEOCALL_BASE_PATH)) {
          Node videoCallNode = baseNode.getNode(VIDEOCALL_BASE_PATH);
          videoCallModel = new VideoCallModel();
          videoCallModel.setWeemoKey(videoCallNode.getProperty(WEEMOKEY_PROP).getString());
          videoCallModel.setDisableVideoCall(videoCallNode.getProperty(DISABLEVIDEOCALL_PROP).getString());
          videoCallModel.setTokenKey(videoCallNode.getProperty(VIDEO_TOKEN_KEY).getString());
          videoProfileCache.put(VIDEO_PROFILE_KEY, videoCallModel);
        }
      } catch (LoginException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("getWeemoKey() failed because of ", e);
        }
      } catch (NoSuchWorkspaceException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("getWeemoKey() failed because of ", e);
        }
      } catch (RepositoryException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("getWeemoKey() failed because of ", e);
        }
      }
    }
    return videoCallModel;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////  
  public String getWeemoKey() {
    String weemoKey = null;
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_PROFILE_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_PROFILE_KEY);      
    } else {
      videoCallModel = getVideoCallProfile();      
    }
    weemoKey = videoCallModel.getWeemoKey();
    return weemoKey;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////  
  public String getTokenKey() {
    String tokenKey = null;
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_TOKEN_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_TOKEN_KEY);      
     } else {
       videoCallModel = getVideoCallProfile();      
     }
    tokenKey = videoCallModel.getWeemoKey();
    return tokenKey;
  }
  
  /////////////////////////////////
  public boolean isDisableVideoCall() {
    boolean disableVideoCall = false;
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_PROFILE_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_PROFILE_KEY);      
    } else {
      videoCallModel = getVideoCallProfile();
    }
    if(videoCallModel.getDisableVideoCall() != null) {
      disableVideoCall = Boolean.valueOf(videoCallModel.getDisableVideoCall());
    }
    return disableVideoCall;
  }
  
  //////////////////////////////////////////////////////
  public void setDisableVideoCall(boolean disableVideoCall) {
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_PROFILE_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_PROFILE_KEY);      
    } else {
      videoCallModel = getVideoCallProfile();
    }
    videoCallModel.setDisableVideoCall(String.valueOf(disableVideoCall));
    saveVideoCallProfile(videoCallModel);   
  }
  //////////////////////////////////////////////////////////
  public boolean isExistVideoCallProfile() {
    boolean isExist = false;
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_PROFILE_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_PROFILE_KEY); 
      if(videoCallModel != null) isExist = true;  
    } else {
      SessionProvider sessionProvider = null;
      RepositoryService repositoryService = WCMCoreUtils.getService(RepositoryService.class);
      sessionProvider = WCMCoreUtils.getSystemSessionProvider();
      Session session;
      try {
        session = sessionProvider.getSession(WORKSPACE_NAME, repositoryService.getCurrentRepository());    
        Node rootNode = session.getRootNode();
        Node baseNode = rootNode.getNode(BASE_PATH);
        if(baseNode.hasNode(VIDEOCALL_BASE_PATH)) {
          isExist = true;
        }
      } catch (LoginException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("getWeemoKey() failed because of ", e);
        }
      } catch (NoSuchWorkspaceException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("getWeemoKey() failed because of ", e);
        }
      } catch (RepositoryException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("getWeemoKey() failed because of ", e);
        }
      } finally {
        if (sessionProvider != null) {
          sessionProvider.close();
        }
      }
    }     
    return isExist;
  }
  ////////////////////////////////////////////////////////
  public boolean isTurnOffVideoCall() {
    boolean isTurnOff = false;
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_PROFILE_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_PROFILE_KEY);      
    } else {
      videoCallModel = getVideoCallProfile();
    }
    String weemoKey = videoCallModel.getWeemoKey();
    String str = videoCallModel.getDisableVideoCall();
    if(Boolean.valueOf(str) || StringUtils.isEmpty(weemoKey)) return true; 
    return isTurnOff;
  }

}
