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

import javax.jcr.LoginException;
import javax.jcr.NoSuchWorkspaceException;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.cache.ExoCache;
import org.exoplatform.services.jcr.RepositoryService;
import org.exoplatform.services.jcr.ext.common.SessionProvider;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.wcm.utils.WCMCoreUtils;
import org.apache.commons.lang.StringUtils;



public class VideoCallService {
  
  public static String BASE_PATH = "exo:applications";
  public static String VIDEOCALL_BASE_PATH = "VideoCall";
  public static String VIDEOCALL_NODETYPE = "exo:videoCallProfile";
  public static String DISABLEVIDEOCALL_PROP ="exo:disableVideoCall";
  public static String WEEMOKEY_PROP = "exo:weemoKey";
  public static String VIDEO_PROFILES_PROP = "exo:videoCallPermissions";
  
  private static final Log LOG = ExoLogger.getLogger(VideoCallService.class.getName());
  
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
    try {
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
      session.save();
      videoCallNode.setProperty(DISABLEVIDEOCALL_PROP, Boolean.valueOf(disbaleVideoCall));
      videoCallNode.setProperty(WEEMOKEY_PROP, weemoKey);
      session.save();      
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
    }
  }
  
  public String getWeemoKey() {
    String weemoKey = null;
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
        weemoKey = videoCallNode.getProperty(WEEMOKEY_PROP).getString();
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
    return weemoKey;
  }
  /////////////////////////////////
  public boolean isDisableVideoCall() {
    boolean disableVideoCall = false;
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
        String str = videoCallNode.getProperty(DISABLEVIDEOCALL_PROP).getString();
        disableVideoCall = Boolean.valueOf(str);
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
    return disableVideoCall;
  }
  
  //////////////////////////////////////////////////////
  public void setDisableVideoCall(boolean disableVideoCall) {
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
        videoCallNode.setProperty(VIDEOCALL_BASE_PATH, disableVideoCall);
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
  //////////////////////////////////////////////////////////
  public boolean isExistVideoCallProfile() {
    boolean isExist = false;
    SessionProvider sessionProvider = null;
    RepositoryService repositoryService = WCMCoreUtils.getService(RepositoryService.class);
    sessionProvider = WCMCoreUtils.getUserSessionProvider();
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
    }  
    return isExist;
  }
  ////////////////////////////////////////////////////////
  public boolean isTurnOffVideoCall() {
    boolean isTurnOff = false;
    SessionProvider sessionProvider = null;
    RepositoryService repositoryService = WCMCoreUtils.getService(RepositoryService.class);
    sessionProvider = WCMCoreUtils.getUserSessionProvider();
    try {
      Session session = sessionProvider.getSession(WORKSPACE_NAME, repositoryService.getCurrentRepository());      
      Node rootNode = session.getRootNode();
      Node baseNode = rootNode.getNode(BASE_PATH);
      Node videoCallNode = null;
      if(baseNode.hasNode(VIDEOCALL_BASE_PATH)) {
        videoCallNode = baseNode.getNode(VIDEOCALL_BASE_PATH);
        String weemoKey = videoCallNode.getProperty(WEEMOKEY_PROP).getString();
        String str = videoCallNode.getProperty(DISABLEVIDEOCALL_PROP).getString();
        if(Boolean.valueOf(str) || StringUtils.isEmpty(weemoKey)) return true;
      } else {
        return true;
      }      
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
    }
    
    return isTurnOff;
  }

}
