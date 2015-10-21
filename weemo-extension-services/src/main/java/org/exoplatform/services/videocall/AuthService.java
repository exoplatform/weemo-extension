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

import org.apache.commons.lang.StringUtils;
import org.exoplatform.container.PortalContainer;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.portal.config.UserACL;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.organization.Group;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.organization.User;
import org.exoplatform.services.security.ConversationState;
import org.exoplatform.services.security.IdentityConstants;
import org.exoplatform.utils.videocall.PropertyManager;
import org.json.JSONObject;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;


public class AuthService {

  private String authUrl;
  private String clientId = null;
  private String clientSecret = null;
  private InputStream caFile = null;
  private InputStream p12File = null;
  private String passphrase = null;
  private String domain_id = null;

  private static final Log LOG = ExoLogger.getLogger(AuthService.class.getName());

  public AuthService() {
    authUrl = PropertyManager.getProperty(PropertyManager.PROPERTY_AUTH_URL);
  }

  public JSONObject verifyPermission(String entry) throws Exception {
    PortalContainer container = PortalContainer.getInstance();
    OrganizationService orgService = (OrganizationService) container.getComponentInstanceOfType(OrganizationService
            .class);
    UserACL userACL = (UserACL) container.getComponentInstanceOfType(UserACL.class);
    IDType idType;
    JSONObject json = new JSONObject();
    if (entry.startsWith("/")) {
      idType = IDType.GROUP;
    } else if (entry.contains(":")) {
      idType = IDType.MEMBERSHIP;
    } else {
      idType = IDType.USER;
    }
    boolean isExistEntry = false;

    if (idType == IDType.USER) {
      if (IdentityConstants.ANY.equalsIgnoreCase(entry) || userACL.getSuperUser().equalsIgnoreCase(entry)) {
        isExistEntry = true;
      }
      isExistEntry = orgService.getUserHandler().findUserByName(entry) != null;
      json.put("isExist", isExistEntry);
      if (isExistEntry) {
        User user = orgService.getUserHandler().findUserByName(entry);
        String userName = user.getDisplayName();
        if (userName == null) {
          userName = user.getFirstName() + " " + user.getLastName();
        }
        json.put("displayName", userName);
        json.put("type", "USER");
      }
      return json;
    }

    if (idType == IDType.GROUP) {
      isExistEntry = orgService.getGroupHandler().findGroupById(entry) != null;
      json.put("isExist", isExistEntry);
      if (isExistEntry) {
        json.put("displayName", orgService.getGroupHandler().findGroupById(entry).getLabel());
        json.put("type", "GROUP");
      }
    }

    String[] membership = entry.split(":");
    Group group = orgService.getGroupHandler().findGroupById(membership[1]);
    if (group == null) {
      isExistEntry = false;
    } else {
      if ("*".equals(membership[0])) {
        isExistEntry = true;
      } else {
        isExistEntry = orgService.getMembershipTypeHandler().findMembershipType(membership[0]) != null;
      }
    }
    json.put("isExist", isExistEntry);
    if (isExistEntry) {
      json.put("displayName", orgService.getGroupHandler().findGroupById(membership[1]).getLabel());
      json.put("type", "MEMBERSHIP");
    }
    return json;
  }


  public String authenticate(VideoCallModel videoCallModel, String profile_id) {
    VideoCallService videoCallService = new VideoCallService();
    if (videoCallModel == null) {
      caFile = videoCallService.getPemCertInputStream();
      p12File = videoCallService.getP12CertInputStream();
      videoCallModel = videoCallService.getVideoCallProfile();
    } else {
      caFile = videoCallModel.getPemCert();
      p12File = videoCallModel.getP12Cert();
    }

    if (videoCallModel != null) {
      domain_id = videoCallModel.getDomainId();
      clientId = videoCallModel.getAuthId();
      clientSecret = videoCallModel.getAuthSecret();
      passphrase = videoCallModel.getCustomerCertificatePassphrase();
    }
    String responseContent = null;
    if (StringUtils.isEmpty(passphrase)) return null;
    if (caFile == null || p12File == null) return null;

    try {
      String userId = ConversationState.getCurrent().getIdentity().getUserId();
      SSLContext ctx = SSLContext.getInstance("SSL");
      URL url = null;
      try {
        StringBuilder urlBuilder = new StringBuilder();
        urlBuilder.append(authUrl).append("?client_id=" + clientId).append("&client_secret=" + clientSecret).
          append("&uid=weemo" + userId);
        if (!VideoCallService.isCloudRunning()) {
          urlBuilder.append("&identifier_client=" + URLEncoder.encode(domain_id, "UTF-8")).append("&id_profile=" + URLEncoder.encode(profile_id, "UTF-8"));
        }
        url = new URL(urlBuilder.toString());
      } catch (MalformedURLException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not create valid URL with base", e);
        }
      }
      HttpsURLConnection connection = null;
      try {
        connection = (HttpsURLConnection) url.openConnection();
      } catch (IOException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not connect", e);
        }
      }
      TrustManager[] trustManagers = getTrustManagers(caFile, passphrase);
      KeyManager[] keyManagers = getKeyManagers("PKCS12", p12File, passphrase);

      ctx.init(keyManagers, trustManagers, new SecureRandom());
      try {
        connection.setSSLSocketFactory(ctx.getSocketFactory());
        connection.setRequestMethod("GET");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
      } catch (Exception e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not configure request for POST", e);
        }
      }

      try {
        connection.connect();
      } catch (IOException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not connect to weemo", e);
        }
      }

      BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
      StringBuilder sbuilder = new StringBuilder();
      String line;
      while ((line = br.readLine()) != null) {
        sbuilder.append(line + "\n");
      }
      br.close();
      responseContent = sbuilder.toString();
      // Set new token key
      String tokenKey = "";
      if (!StringUtils.isEmpty(responseContent) && responseContent.contains("token")) {
        JSONObject json = new JSONObject(responseContent);
        tokenKey = json.get("token").toString();
      } else {
        tokenKey = "";
      }
      videoCallService.setTokenKey(tokenKey);
    } catch (Exception ex) {
      LOG.error("Have problem during authenticating process.", ex);
      videoCallService.setTokenKey("");
    }
    return responseContent;
  }


  protected static KeyManager[] getKeyManagers(String keyStoreType, InputStream keyStoreFile,
                                               String keyStorePassword) throws Exception {
    KeyStore keyStore = null;
    try {
      keyStore = KeyStore.getInstance(keyStoreType);
      keyStore.load(keyStoreFile, keyStorePassword.toCharArray());
    } catch (NoSuchAlgorithmException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate PKCS12 keystores");
      }
    } catch (KeyStoreException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate PKCS12 keystores");
      }
    } catch (CertificateException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Bad key or certificate in " + keyStoreFile, e.getMessage());
      }
    } catch (FileNotFoundException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not find or read " + keyStoreFile, e.getMessage());
      }
    } catch (IOException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("PKCS12 password is incorrect or keystore is inconsistent: " + keyStoreFile);
      }
    }

    KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
    kmf.init(keyStore, keyStorePassword.toCharArray());
    return kmf.getKeyManagers();
  }

  protected static TrustManager[] getTrustManagers(InputStream trustStoreFile, String trustStorePassword) throws
          Exception {
    CertificateFactory certificateFactory = null;
    try {
      certificateFactory = CertificateFactory.getInstance("X.509");
    } catch (CertificateException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not initialize the certificate " + e.getMessage());
      }
    }

    Certificate caCert = null;
    try {
      caCert = certificateFactory.generateCertificate(trustStoreFile);
    } catch (CertificateException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Bad key or certificate in " + trustStoreFile, e.getMessage());
      }
    }

    KeyStore trustStore = null;
    try {
      trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
      trustStore.load(null, null);
    } catch (KeyStoreException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate " + KeyStore.getDefaultType() + " keystores");
      }
    } catch (NoSuchAlgorithmException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not initialize truststore ", e);
      }
    } catch (CertificateException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not initialize truststore ", e);
      }
    } catch (IOException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not initialize truststore ", e);
      }
    }

    try {
      trustStore.setCertificateEntry("CA", caCert);
    } catch (KeyStoreException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error(trustStoreFile + " cannot be used as a CA", e);
      }
    }

    TrustManagerFactory tmf = null;
    try {
      tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
      tmf.init(trustStore);
    } catch (NoSuchAlgorithmException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate " + KeyStore.getDefaultType() + " trusts", e);
      }
    } catch (KeyStoreException e) {
      LOG.error("Java implementation cannot manipulate " + KeyStore.getDefaultType() + " trusts", e);
    }
    return tmf.getTrustManagers();
  }

  ///////////////////////////////////////////////////////////////////
  public static File convertInputStreamToFile(InputStream inputStream, String fileName) {
    File file = null;
    OutputStream outputStream = null;
    try {
      file = new File(fileName);
      outputStream = new FileOutputStream(file);
      int read = 0;
      byte[] bytes = new byte[1024];
      while ((read = inputStream.read(bytes)) != -1) {
        outputStream.write(bytes, 0, read);
      }
    } catch (IOException e) {
      LOG.error("Unknown Exception", e);
    } finally {
      if (inputStream != null) {
        try {
          inputStream.close();
        } catch (IOException e) {
          LOG.error("Unknown Exception", e);
        }
      }
      if (outputStream != null) {
        try {
          // outputStream.flush();
          outputStream.close();
        } catch (IOException e) {
          LOG.error("Unknown Exception", e);
        }
      }
    }
    return file;
  }

}
