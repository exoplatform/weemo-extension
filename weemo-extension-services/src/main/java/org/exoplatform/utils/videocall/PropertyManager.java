/*
 * Copyright (C) 2012 eXo Platform SAS.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

package org.exoplatform.utils.videocall;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.videocall.VideoCallService;

public class PropertyManager {
  private static Properties properties = null;

  private static final String PROPERTIES_PATH = System.getProperty("catalina.base")+"/conf/weemo.properties";
  
  public static final String PROPERTY_WEEMO_KEY = "weemo.webappId";
  public static final String PROPERTY_CLIENT_KEY_AUTH = "weemo.authClientId";
  public static final String PROPERTY_CLIENT_SECRET_AUTH = "weemo.authSecretId";
  public static final String PROPERTY_PASSPHRASE = "weemo.customerCertificatePassphrase";
  public static final String PROPERTY_AUTH_URL = "weemo.authURL";
  public static final String PROPERTY_USER_ID_AUTH = "user_id_auth";
  
  public static final String PROPERTY_DOMAIN_ID = "domain_id";  
  
  public static final String PROPERTY_CA_FILE = "ca_file";
  public static final String PROPERTY_P12_FILE = "p12_file";  
  public static final String PROPERTY_PASS_AUTH = "pass_auth";  
  public static final String PROPERTY_USER_ID_ALLOW = "user_id_allow";
  public static final String PROPERTY_PASS_ALLOW = "pass_allow";
  public static final String PROPERTY_CLIENT_KEY_ALLOW = "client_key_allow";
  public static final String PROPERTY_CLIENT_SECRET_ALLOW = "client_secret_allow";
  public static final String PROPERTY_VIDEO_PROFILE = "video_profile";
  
  public static VideoCallService videoCallService = null;

  public static String getProperty(String key)
  {
    String value = (String)properties().get(key);    
    return value;
  }

  private static Properties properties()
  {
    if (properties==null)
    {
      properties = new Properties();
      InputStream stream = null;
      try
      {
        stream = new FileInputStream(PROPERTIES_PATH);
        properties.load(stream);
        stream.close();
      }
      catch (Exception e)
      {
      }     
      /*overridePropertyIfNotSet(PROPERTY_PASS_AUTH, "bc2e05cf11");
      overridePropertyIfNotSet(PROPERTY_PASS_ALLOW, "7625b9b08d");
      overridePropertyIfNotSet(PROPERTY_CLIENT_KEY_ALLOW, "33cc7f1e82763049a4944a702c880d");
      overridePropertyIfNotSet(PROPERTY_CLIENT_SECRET_ALLOW, "3569996f0d03b2cd3880223747c617");*/
      
      overridePropertyIfNotSet(PROPERTY_DOMAIN_ID, "exo_domain");
      overridePropertyIfNotSet(PROPERTY_VIDEO_PROFILE, "basic");
      overridePropertyIfNotSet(PROPERTY_AUTH_URL, "https://oauths-ppr.weemo.com/auth/");
      overridePropertyIfNotSet(PROPERTY_USER_ID_AUTH, "eXoCloud");
      
      overridePropertyIfNotSet(PROPERTY_WEEMO_KEY, "");
      overridePropertyIfNotSet(PROPERTY_CLIENT_KEY_AUTH, "");
      overridePropertyIfNotSet(PROPERTY_PASSPHRASE, "");
      overridePropertyIfNotSet(PROPERTY_CLIENT_SECRET_AUTH, "");
      
      
      videoCallService = new VideoCallService();
      if(!videoCallService.isExistVideoCallProfile()) {
        VideoCallModel videoCallModel = new VideoCallModel();
        videoCallModel.setDisableVideoCall(Boolean.toString(false));
        if(properties().getProperty(PROPERTY_WEEMO_KEY)==null) {
          videoCallModel.setWeemoKey("");
        } else {
          videoCallModel.setWeemoKey(properties().getProperty(PROPERTY_WEEMO_KEY));
        }
        String authId = (properties().getProperty(PROPERTY_CLIENT_KEY_AUTH)==null) ? "" : 
          properties().getProperty(PROPERTY_CLIENT_KEY_AUTH);
        String authSecret = (properties().getProperty(PROPERTY_CLIENT_SECRET_AUTH)==null) ? "" : 
          properties().getProperty(PROPERTY_CLIENT_SECRET_AUTH);
        String passPhrase = (properties().getProperty(PROPERTY_PASSPHRASE)==null) ? "" : 
          properties().getProperty(PROPERTY_PASSPHRASE);
        String domainId = (properties().getProperty(PROPERTY_DOMAIN_ID)==null) ? "" : 
          properties().getProperty(PROPERTY_DOMAIN_ID);
        String profileId = (properties().getProperty(PROPERTY_VIDEO_PROFILE)==null) ? "" : 
          properties().getProperty(PROPERTY_VIDEO_PROFILE);
        //Set default permission
        videoCallModel.setVideoCallPermissions("*:/platform/users#true");
        videoCallModel.setCustomerCertificatePassphrase(passPhrase);
        videoCallModel.setAuthId(authId);
        videoCallModel.setAuthSecret(authSecret);
        videoCallModel.setDomainId(domainId);
        videoCallModel.setProfileId(profileId);
        videoCallService.saveVideoCallProfile(videoCallModel);
      }
    }
    return properties;
  }

  private static void overridePropertyIfNotSet(String key, String value) {
    if (properties().getProperty(key)==null)
    {
      properties().setProperty(key, value);
      
      if (System.getProperty(key)!=null) {
        properties().setProperty(key, System.getProperty(key));
      }
    }
  }
}
