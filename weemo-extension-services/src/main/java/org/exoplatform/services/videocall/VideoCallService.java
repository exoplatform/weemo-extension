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
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.jcr.LoginException;
import javax.jcr.NoSuchWorkspaceException;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import org.exoplatform.commons.utils.CommonsUtils;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.config.UserACL;
import org.exoplatform.services.cache.CacheService;
import org.exoplatform.services.cache.ExoCache;
import org.exoplatform.services.jcr.RepositoryService;
import org.exoplatform.services.jcr.access.PermissionType;
import org.exoplatform.services.jcr.core.ExtendedNode;
import org.exoplatform.services.jcr.ext.common.SessionProvider;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.organization.Membership;
import org.exoplatform.services.organization.MembershipType;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.security.ConversationState;
import org.exoplatform.services.wcm.utils.WCMCoreUtils;
import org.apache.commons.lang.StringUtils;
import org.exoplatform.services.organization.User;
import org.exoplatform.services.organization.idm.ExtGroup;

import com.sun.xml.internal.xsom.impl.scd.Iterators.Map;



public class VideoCallService {
  private static ExoCache<Serializable, VideoCallModel> videoProfileCache;
  private static String VIDEO_PROFILE_KEY = "videoCallsProfile" + CommonsUtils.getRepository().getConfiguration().getName();
  public static String BASE_PATH = "exo:applications";
  public static String VIDEOCALL_BASE_PATH = "VideoCallsProfile";
  public static String VIDEOCALL_NODETYPE = "exo:videoCallProfile";
  public static String DISABLEVIDEOCALL_PROP ="exo:disableVideoCall";
  public static String WEEMOKEY_PROP = "exo:weemoKey";
  public static String VIDEO_PERMISSIONS_PROP = "exo:videoCallPermissions";
  public static String VIDEO_TOKEN_KEY = "exo:tokenKey";
  public static String VIDEO_PASSPHARSE = "exo:passPhrase";
  public static String VIDEO_AUTH_ID = "exo:authId";
  public static String VIDEO_AUTH_SECRET = "exo:authSecret";
  
  private static final Log LOG = ExoLogger.getLogger(VideoCallService.class.getName());
  
  protected static final String WORKSPACE_NAME = "collaboration";
  
  public VideoCallService() {
    videoProfileCache = WCMCoreUtils.getService(CacheService.class).getCacheInstance(VideoCallService.class.getName());
  }
  
  public void saveVideoCallProfile(VideoCallModel videoCallModel) {
    String disbaleVideoCall = videoCallModel.getDisableVideoCall();
    String weemoKey = videoCallModel.getWeemoKey();
    String videoCallPermissions = videoCallModel.getVideoCallPermissions(); 
    String passPharse = videoCallModel.getCustomerCertificatePassphrase();
    String authId = videoCallModel.getAuthId();
    String authSecret = videoCallModel.getAuthSecret();
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
      videoCallNode.setProperty(DISABLEVIDEOCALL_PROP, Boolean.valueOf(disbaleVideoCall));
      videoCallNode.setProperty(WEEMOKEY_PROP, weemoKey);
      videoCallNode.setProperty(VIDEO_TOKEN_KEY, videoCallModel.getTokenKey());
      videoCallNode.setProperty(VIDEO_PERMISSIONS_PROP, videoCallPermissions);
      videoCallNode.setProperty(VIDEO_PASSPHARSE, passPharse);
      videoCallNode.setProperty(VIDEO_AUTH_ID, authId);
      videoCallNode.setProperty(VIDEO_AUTH_SECRET, authSecret);
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
          videoCallModel.setVideoCallPermissions(videoCallNode.getProperty(VIDEO_PERMISSIONS_PROP).getString());
          videoCallModel.setCustomerCertificatePassphrase(videoCallNode.getProperty(VIDEO_PASSPHARSE).getString());
          videoCallModel.setAuthId(videoCallNode.getProperty(VIDEO_AUTH_ID).getString());
          videoCallModel.setAuthId(videoCallNode.getProperty(VIDEO_AUTH_SECRET).getString());
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
    if(videoCallModel != null) {
      weemoKey = videoCallModel.getWeemoKey();
    }
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
  public boolean isTurnOffVideoCall() throws Exception {
    boolean isTurnOff = true;
    VideoCallModel videoCallModel = null;
    if(videoProfileCache != null && videoProfileCache.get(VIDEO_PROFILE_KEY) != null) {
      videoCallModel = videoProfileCache.get(VIDEO_PROFILE_KEY);      
    } else {
      videoCallModel = getVideoCallProfile();
    }
    if(videoCallModel == null) return true;
    String weemoKey = videoCallModel.getWeemoKey();
    String str = videoCallModel.getDisableVideoCall();    
    if(Boolean.valueOf(str)) {
      return true; 
    } else {
      String videoCallsPermissions = videoCallModel.getVideoCallPermissions();
      if(StringUtils.isEmpty(videoCallsPermissions)) return true;
      
      String userId = ConversationState.getCurrent().getIdentity().getUserId();
      //Put list of permission into a map
      HashMap<String, String> permissionsMap = new HashMap<String, String>();
      String[] arrs = videoCallsPermissions.split(",");
      ArrayList<String> memberships = new ArrayList();
      for (String string : arrs) {
        String permission = string.split("#")[0];
        String value = string.split("#")[1];    
        permissionsMap.put(permission, value);
        if(permission.contains(":")) {
          memberships.add(permission);
        }
      }
      if(permissionsMap.get(userId) != null) {
        //Check permisson for user
        return !Boolean.valueOf(permissionsMap.get(userId));
      } else {
        //Check permission for membership
        UserACL userACL = WCMCoreUtils.getService(UserACL.class);
        for (String string : memberships) {
          if(userACL.hasPermission(string)) {
            boolean value = Boolean.valueOf(permissionsMap.get(string));
            if(value) return !value;
          }
        }       
      }
    }    
    return isTurnOff;
  }

}
