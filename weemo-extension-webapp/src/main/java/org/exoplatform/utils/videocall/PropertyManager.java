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
  private static Properties properties;

  private static final String PROPERTIES_PATH = System.getProperty("catalina.base")+"/conf/weemo.properties";
  public static final String PROPERTY_SYSTEM_PREFIX = "weemo.";
  public static final String PROPERTY_INTERVAL_NOTIF = "weemoIntervalNotif";
  public static final String PROPERTY_WEEMO_KEY = "weemoKey";
  
  public static final String PROPERTY_APP_ID = "app_id";
  public static final String PROPERTY_DOMAIN_ID = "domain_id";
  public static final String PROPERTY_PASSPHRASE = "passphrase";
  public static final String PROPERTY_AUTH_URL = "auth_url";
  public static final String PROPERTY_CA_FILE = "ca_file";
  public static final String PROPERTY_P12_FILE = "p12_file";
  
  public static final String PROPERTY_USER_ID_AUTH = "user_id_auth";
  public static final String PROPERTY_PASS_AUTH = "pass_auth";
  public static final String PROPERTY_CLIENT_KEY_AUTH = "client_key_auth";
  public static final String PROPERTY_CLIENT_SECRET_AUTH = "client_secret_auth";
  
  public static final String PROPERTY_USER_ID_ALLOW = "user_id_allow";
  public static final String PROPERTY_PASS_ALLOW = "pass_allow";
  public static final String PROPERTY_CLIENT_KEY_ALLOW = "client_key_allow";
  public static final String PROPERTY_CLIENT_SECRET_ALLOW = "client_secret_allow";
  
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
      overridePropertyIfNotSet(PROPERTY_INTERVAL_NOTIF, "3000");      
      //overridePropertyIfNotSet(PROPERTY_WEEMO_KEY, "");
      videoCallService = new VideoCallService();
      if(!videoCallService.isExistVideoCallProfile()) {
        VideoCallModel videoCallModel = new VideoCallModel();
        videoCallModel.setDisableVideoCall(Boolean.toString(false));
        if(properties().getProperty(PROPERTY_WEEMO_KEY)==null) {
          videoCallModel.setWeemoKey("");
        } else {
          videoCallModel.setWeemoKey(properties().getProperty(PROPERTY_WEEMO_KEY));
        }
        videoCallService.saveVideoCallProfile(videoCallModel);
      }
    }
    return properties;
  }

  private static void overridePropertyIfNotSet(String key, String value) {
    if (properties().getProperty(key)==null)
    {
      properties().setProperty(key, value);
    }
    if (System.getProperty(PROPERTY_SYSTEM_PREFIX+key)!=null) {
      properties().setProperty(key, System.getProperty(PROPERTY_SYSTEM_PREFIX+key));
    }

  }
}
