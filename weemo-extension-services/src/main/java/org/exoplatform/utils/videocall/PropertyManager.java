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

import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.videocall.VideoCallService;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Properties;

public class PropertyManager {
  private static Properties properties = null;

  private static final String PROPERTIES_PATH = System.getProperty("exo.conf.dir")+"/weemo/weemo.properties";
  private static final String PROPERTIES_CERT_BASE_PATH = System.getProperty("exo.conf.dir")+"/weemo/";
  
  public static final String PROPERTY_WEEMO_KEY = "weemo.webappId";
  public static final String PROPERTY_CLIENT_KEY_AUTH = "weemo.authClientId";
  public static final String PROPERTY_CLIENT_SECRET_AUTH = "weemo.authSecretId";
  public static final String PROPERTY_PASSPHRASE = "weemo.customerCertificatePassphrase";
  public static final String PROPERTY_AUTH_URL = "weemo.authURL";
  public static final String PROPERTY_DEFAULT_PERMISSION = "weemo.defaultPermission";
  public static final String PROPERTY_USER_ID_AUTH = "user_id_auth";
  public static final String PROPERTY_VIDEOCALL_VERSION = "videocall.version";
  
  
  public static final String PROPERTY_DOMAIN_ID = "domain_id";  
  
  public static final String PROPERTY_CA_FILE = "weemo.commonCertificateFile";
  public static final String PROPERTY_P12_FILE = "weemo.customerCertificateFile";  
  
  public static final String PROPERTY_PASS_AUTH = "pass_auth";  
  public static final String PROPERTY_USER_ID_ALLOW = "user_id_allow";
  public static final String PROPERTY_PASS_ALLOW = "pass_allow";
  public static final String PROPERTY_CLIENT_KEY_ALLOW = "client_key_allow";
  public static final String PROPERTY_CLIENT_SECRET_ALLOW = "client_secret_allow";
  public static final String PROPERTY_VIDEO_PROFILE = "video_profile";
  
  public static VideoCallService videoCallService = null;

  private static final Log LOG = ExoLogger.getLogger(PropertyManager.class.getName());

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
        LOG.warn("Cannot find " + PROPERTIES_PATH + ". Default values will be used instead.");
      }
            
      overridePropertyIfNotSet(PROPERTY_DOMAIN_ID, "");
      overridePropertyIfNotSet(PROPERTY_VIDEO_PROFILE, "basic");
      overridePropertyIfNotSet(PROPERTY_AUTH_URL, "https://auth.rtccloud.net/auth/");
      overridePropertyIfNotSet(PROPERTY_USER_ID_AUTH, "");
      
      overridePropertyIfNotSet(PROPERTY_WEEMO_KEY, "");
      overridePropertyIfNotSet(PROPERTY_CLIENT_KEY_AUTH, "");
      overridePropertyIfNotSet(PROPERTY_PASSPHRASE, "");
      overridePropertyIfNotSet(PROPERTY_CLIENT_SECRET_AUTH, "");
      overridePropertyIfNotSet(PROPERTY_DEFAULT_PERMISSION, "*:/platform/users#true#true");
      overridePropertyIfNotSet(PROPERTY_CA_FILE, "weemo.pem");
      overridePropertyIfNotSet(PROPERTY_P12_FILE, "client.p12");
      
      
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
        //Load pem file
        InputStream isPem = null;
        String pemName = null;
        try {
          isPem = new FileInputStream(PROPERTIES_CERT_BASE_PATH + properties().getProperty(PROPERTY_CA_FILE));
          if(isPem != null) pemName = properties().getProperty(PROPERTY_CA_FILE);
        } catch (FileNotFoundException ex) {
          isPem = null;
        }
        if(isPem == null) {
          isPem = videoCallService.getClass().getResourceAsStream("/cert/authCA.crt");
          if(isPem != null) pemName = "authCA.crt";
        }
        //Load p12 file
        InputStream isP12 = null;
        String p12Name = null;
        try {
          isP12 = new FileInputStream(PROPERTIES_CERT_BASE_PATH + properties().getProperty(PROPERTY_P12_FILE));
          if(isP12 != null) p12Name = properties().getProperty(PROPERTY_P12_FILE);
        } catch (FileNotFoundException ex) {
          isP12 = null;
        }       
        //Set default permission
        videoCallModel.setVideoCallPermissions(properties().getProperty(PROPERTY_DEFAULT_PERMISSION));
        videoCallModel.setCustomerCertificatePassphrase(passPhrase);
        videoCallModel.setAuthId(authId);
        videoCallModel.setAuthSecret(authSecret);
        videoCallModel.setDomainId(domainId);
        videoCallModel.setProfileId(profileId);
        if(isPem != null) {
          videoCallModel.setPemCert(isPem);
          videoCallModel.setPemCertName(pemName);
        }
        if(isP12 != null) {
          videoCallModel.setP12Cert(isP12);
          videoCallModel.setP12CertName(p12Name);
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
      
      if (System.getProperty(key)!=null) {
        properties().setProperty(key, System.getProperty(key));
      }
    }
  }
}
