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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Authenticator;
import java.net.MalformedURLException;
import java.net.PasswordAuthentication;
import java.net.URL;
import java.net.URLEncoder;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.Provider;
import java.security.SecureRandom;
import java.security.Security;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.exoplatform.model.videocall.VideoCallModel;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.security.ConversationState;
import org.exoplatform.utils.videocall.PropertyManager;




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
    VideoCallService videoCallService = new VideoCallService();
    VideoCallModel videoCallModel = videoCallService.getVideoCallProfile();
    if(videoCallModel != null) {
      domain_id = videoCallModel.getDomainId();      
      clientId = videoCallModel.getAuthId();
      clientSecret = videoCallModel.getAuthSecret();
      caFile = videoCallService.getPemCertInputStream();
      p12File = videoCallService.getP12CertInputStream();
      passphrase = videoCallModel.getCustomerCertificatePassphrase();
    } else {
      domain_id = PropertyManager.getProperty(PropertyManager.PROPERTY_DOMAIN_ID);
      clientId = PropertyManager.getProperty(PropertyManager.PROPERTY_CLIENT_KEY_AUTH);
      clientSecret = PropertyManager.getProperty(PropertyManager.PROPERTY_CLIENT_SECRET_AUTH);
      caFile = videoCallService.getPemCertInputStream();
      p12File = videoCallService.getP12CertInputStream();
      passphrase = PropertyManager.getProperty(PropertyManager.PROPERTY_PASSPHRASE);
    }
  }
  
  
  public String authenticate(HttpServletRequest servletRequest, String profile_id) {
    String responseContent = null;
    if(StringUtils.isEmpty(passphrase)) return null;
    if(caFile == null || p12File == null) return null;
        
    try {
      String userId = ConversationState.getCurrent().getIdentity().getUserId();     
      SSLContext ctx = SSLContext.getInstance("SSL");
      URL url = null;
      try {
        String urlStr = authUrl + "?client_id=" + clientId + "&client_secret=" + clientSecret + "&uid=weemo_" + userId;
        LOG.info("Request URL: " + urlStr);
        url = new URL(urlStr);
      }
      catch (MalformedURLException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not create valid URL with base (see log for full URL)");
        }
      }
      HttpsURLConnection connection = null;
      try {
        connection = (HttpsURLConnection) url.openConnection();
      } catch (IOException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not connect (see log for full URL)");
        }
      }
      
      String post = "identifier_client=" + URLEncoder.encode(domain_id, "UTF-8")
          +  "&id_profile=" + URLEncoder.encode(profile_id, "UTF-8");
      LOG.info("Post: " + post);      
      
      TrustManager[] trustManagers = getTrustManagers(caFile, passphrase);
      KeyManager[] keyManagers = getKeyManagers("PKCS12", p12File, passphrase);
                
      ctx.init(keyManagers, trustManagers, new SecureRandom());      
      try {
        connection.setSSLSocketFactory(ctx.getSocketFactory());
        connection.setRequestMethod("GET");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        connection.setRequestProperty("Content-Length", String.valueOf(post.getBytes().length));
      } catch (Exception e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not configure request for POST (see log for full URL & post body)");
        }
      }
      
      try {
        LOG.info("Connecting");
        connection.connect();
      } catch (IOException e) {
        if (LOG.isErrorEnabled()) {
          LOG.error("Could not connect request (see log for full URL)");
        }
      }
      
      BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
      StringBuilder sbuilder = new StringBuilder();
      String line;
      while ((line = br.readLine()) != null) {
        sbuilder.append(line+"\n");
      }
      br.close();
      responseContent = sbuilder.toString();
      
    } catch(Exception ex) {
      LOG.error("Have problem during authenticating process.");
    }    
    return responseContent;
  } 
  
  
  protected static KeyManager[] getKeyManagers(String keyStoreType, InputStream keyStoreFile, String keyStorePassword) throws Exception {
    KeyStore keyStore = null;
    try{
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
      e.printStackTrace();
      if (LOG.isErrorEnabled()) {
        LOG.error("PKCS12 password is incorrect or keystore is inconsistent: " + keyStoreFile);
      }      
    }
    
    KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
    kmf.init(keyStore, keyStorePassword.toCharArray());   
    return kmf.getKeyManagers();
}

protected static TrustManager[] getTrustManagers(InputStream trustStoreFile, String trustStorePassword) throws Exception {
    CertificateFactory certificateFactory = null;
    try {
      certificateFactory = CertificateFactory.getInstance("X.509");
    }
    catch (CertificateException e) {
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
        LOG.error("Could not initialize truststore ", e.getMessage());
      }
    } catch (CertificateException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not initialize truststore ", e.getMessage());
      }
    } catch (IOException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not initialize truststore ", e.getMessage());
      }
    }    
    
    try {
      trustStore.setCertificateEntry("CA", caCert);
    } catch (KeyStoreException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error(trustStoreFile + " cannot be used as a CA");
      }
    }
    
    TrustManagerFactory tmf = null;
    try {
      tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
      tmf.init(trustStore);
    } catch (NoSuchAlgorithmException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate " + KeyStore.getDefaultType() + " trusts");
      }
    } catch (KeyStoreException e) {
      LOG.error("Java implementation cannot manipulate " + KeyStore.getDefaultType() + " trusts");
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
      e.printStackTrace();
    } finally {
      if (inputStream != null) {
        try {
          inputStream.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
      if (outputStream != null) {
        try {
          // outputStream.flush();
          outputStream.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
   
      }
    }
    return file;
  }
  
  //////////////////////////////////////////////////////
  public static void main(String[] args) {
    try {
      SSLContext ctx = SSLContext.getInstance("SSL"); 
      URL url ;  
      String urlStr = "https://oauths-ppr.weemo.com/auth/" + "?client_id=33cc7f1e82763049a4944a702c880d&client_secret=3569996f0d03b2cd3880223747c617";
      String post = "uid=" + URLEncoder.encode("1033a56f0e68", "UTF-8")
          + "&identifier_client=" + URLEncoder.encode("exo_domain", "UTF-8")
          + "&id_profile=" + URLEncoder.encode("basic", "UTF-8");      
      url = new URL(urlStr);      
      HttpsURLConnection connection = (HttpsURLConnection) url.openConnection(); 
      InputStream p12InputStream = new URL("http://localhost:8080/rest/private/jcr/repository/collaboration/exo:applications/VideoCallsProfile/client.p12").openStream();
      //InputStream p12InputStream = new URL("http://plfent-4.1.x-pkgpriv-weemo-addon-snapshot.acceptance4.exoplatform.org/weemo-extension/resources/client.p12").openStream();
      //InputStream p12InputStream = AuthService.class.getResourceAsStream("http://localhost:8080/rest/private/jcr/repository/collaboration/exo:applications/VideoCallsProfile/client.p12");
      File p12File = convertInputStreamToFile(p12InputStream, "client.p12");
      
      InputStream pemInputStream = new URL("http://localhost:8080/rest/private/jcr/repository/collaboration/exo:applications/VideoCallsProfile/weemo-ca.pem").openStream();
      //InputStream pemInputStream = new URL("http://plfent-4.1.x-pkgpriv-weemo-addon-snapshot.acceptance4.exoplatform.org/weemo-extension/resources/weemo-ca.pem").openStream();
      //InputStream pemInputStream = AuthService.class.getResourceAsStream("http://localhost:8080/rest/private/jcr/repository/collaboration/exo:applications/VideoCallsProfile/weemo-ca.pem");
      File pemFile = convertInputStreamToFile(pemInputStream, "weemo-ca.pem");
      
      //KeyManager[] keyManagers = getKeyManagers("PKCS12", new FileInputStream(new File("/home/tanhq/java/eXoProjects/weemo-extension/weemo-extension-webapp/src/main/webapp/resources/client.p12")), "XnyexbUF");      
      //TrustManager[] trustManagers = getTrustManagers(new FileInputStream(new File("/home/tanhq/java/eXoProjects/weemo-extension/weemo-extension-webapp/src/main/webapp/resources/weemo-ca.pem")), "XnyexbUF");
      
      KeyManager[] keyManagers = getKeyManagers("PKCS12", new FileInputStream(p12File), "XnyexbUF");
      TrustManager[] trustManagers = getTrustManagers(new FileInputStream(pemFile), "XnyexbUF");
      HostnameVerifier hv = new HostnameVerifier() {
        public boolean verify(String hostname, SSLSession session) { return true; }

       
      };
      
      ctx.init(keyManagers, trustManagers, new SecureRandom());
      connection.setSSLSocketFactory(ctx.getSocketFactory());
      connection.setRequestMethod("POST");
      connection.setDoOutput(true);
      connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
      connection.setRequestProperty("Content-Length", String.valueOf(post.getBytes().length));
      connection.connect();
      
      connection.getOutputStream().write(post.getBytes());
      
      
      BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
      StringBuilder sb = new StringBuilder();
      String line;
      while ((line = br.readLine()) != null) {
          sb.append(line+"\n");
      }
      br.close();
      System.out.println(sb.toString());
    } catch(Exception ex) {
      ex.printStackTrace();
    }
    
  }
  
}
