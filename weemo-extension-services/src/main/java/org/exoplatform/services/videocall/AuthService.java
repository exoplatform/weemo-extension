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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.UnrecoverableKeyException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;


import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.conn.ssl.StrictHostnameVerifier;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.exoplatform.portal.application.PortalRequestContext;
import org.exoplatform.portal.webui.util.Util;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.webui.application.WebuiRequestContext;
import org.exoplatform.webui.application.portlet.PortletRequestContext;
import org.gatein.common.logging.Logger;
import org.gatein.common.logging.LoggerFactory;



public class AuthService {
  
  private String authUrl;  
  private String clientId = null;
  private String clientSecret = null;
  private String caFile = null;
  private String p12File = null;
  private String passphrase = null;
  private String app_id = null;
  private String domain_id = null;
  private SSLContext sslContext = null;
  
  private static final Log LOG = ExoLogger.getLogger(AuthService.class.getName());
  
  public AuthService(String app_id, String domain_id, String authUrl, String caFile, String p12File, String passphrase, String clientId, String clientSecret) {
    this.app_id = app_id;
    this.domain_id = domain_id;
    this.authUrl = authUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.caFile = caFile;
    this.p12File = p12File;
    this.passphrase = passphrase;
    
  }
  
  
  public String authenticate(HttpServletRequest servletRequest, String profile_id) {
    String weemoToken = null;
    
    DefaultHttpClient httpClient = new DefaultHttpClient();
    try {
      SSLContext ctx = SSLContext.getInstance("TLS");
      
      StringBuffer sb = new StringBuffer();
      String scheme = servletRequest.getScheme();
      String serverName = servletRequest.getServerName();
      int serverPort = servletRequest.getServerPort();
      sb.append(scheme).append("://").append(serverName);
      if(serverPort!=80 && serverPort!=43) {
        sb.append(":").append(serverPort);      
      }
      String relPath = sb.toString();
      
      
      InputStream p12InputStream = new URL(relPath + p12File).openStream();
      File p12File = convertInputStreamToFile(p12InputStream, "client.p12");
      InputStream pemInputStream = new URL(relPath + caFile).openStream();
      File pemFile = convertInputStreamToFile(pemInputStream, "weemo-ca.pem");      
      
      
      KeyManager[] keyManagers = getKeyManagers("PKCS12", new FileInputStream(p12File), "XnyexbUF");
      TrustManager[] trustManagers = getTrustManagers(new FileInputStream(pemFile), "XnyexbUF");     
      
      
      ctx.init(keyManagers, trustManagers, new SecureRandom());
      SSLSocketFactory factory = new SSLSocketFactory(ctx, new StrictHostnameVerifier());

      ClientConnectionManager manager = httpClient.getConnectionManager();
      manager.getSchemeRegistry().register(new Scheme("https", 443, factory));
      
      Scheme sch = new Scheme("https", 443, factory);
      httpClient.getConnectionManager().getSchemeRegistry().register(sch);

      httpClient.getConnectionManager().getSchemeRegistry().register(sch);
      
      HttpGet httpget = new HttpGet(authUrl);
      httpget.addHeader("client_id", clientId);
      httpget.addHeader("client_secret", clientSecret);
      httpget.addHeader("uid", app_id);
      httpget.addHeader("identifier_client", domain_id);
      httpget.addHeader("id_profile", profile_id);
      System.out.println("Executing request" + httpget.getRequestLine());
      HttpResponse response = httpClient.execute(httpget);
      HttpEntity entity = response.getEntity();

      System.out.println(response.getStatusLine());
      if (entity != null) {
          System.out.println("Response content length: " + entity.toString());
      }
      EntityUtils.consume(entity);
      
      
      
      

    } catch(Exception ex) {
      ex.printStackTrace();
    }    
    return weemoToken;
  }
  
  protected static KeyManager[] getKeyManagers(String keyStoreType, InputStream keyStoreFile, String keyStorePassword) throws Exception {
    KeyStore keyStore = null;
    try{
      keyStore = KeyStore.getInstance(keyStoreType);
      keyStore.load(keyStoreFile, keyStorePassword.toCharArray());
    } catch (NoSuchAlgorithmException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate PKCS12 keystores ", e);
      }
    } catch (KeyStoreException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate PKCS12 keystores ", e);
      }
    } catch (CertificateException e) {      
      if (LOG.isErrorEnabled()) {
        LOG.error("Bad key or certificate in " + keyStoreFile, e);
      }
    } catch (FileNotFoundException e) {      
      if (LOG.isErrorEnabled()) {
        LOG.error("Could not find or read " + keyStoreFile, e);
      }
    } catch (IOException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("PKCS12 password is incorrect or keystore is inconsistent: " + keyStoreFile, e);
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
      e.printStackTrace();
    }
    
    Certificate caCert = null;
    try {
      caCert = certificateFactory.generateCertificate(trustStoreFile);
    } catch (CertificateException e) {
      if (LOG.isErrorEnabled()) {
        LOG.error("Bad key or certificate in " + trustStoreFile, e);
      }
    } 
    
    KeyStore trustStore = null;
    try {
      trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
      trustStore.load(null, null);
    } catch (KeyStoreException e) {     
      if (LOG.isErrorEnabled()) {
        LOG.error("Java implementation cannot manipulate " + KeyStore.getDefaultType() + " keystores", e);
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
  
  public static void main(String[] args) {
    DefaultHttpClient httpClient = new DefaultHttpClient();
    try {
      SSLContext ctx = SSLContext.getInstance("TLS"); 
      
      
      InputStream p12InputStream = new URL("http://localhost:8080/weemo-extension/resources/client.p12").openStream();
      File p12File = convertInputStreamToFile(p12InputStream, "client.p12");
      
      InputStream pemInputStream = new URL("http://localhost:8080/weemo-extension/resources/weemo-ca.pem").openStream();
      File pemFile = convertInputStreamToFile(pemInputStream, "weemo-ca.pem");
      
      
      //TrustManager[] trustManagers = getTrustManagers(new FileInputStream(new File("/home/tanhq/java/eXoProjects/weemo-extension/weemo-extension-services/src/main/resources/conf/weemo-ca.pem")), "XnyexbUF");
      //KeyManager[] keyManagers = getKeyManagers("PKCS12", new FileInputStream(new File("/home/tanhq/java/eXoProjects/weemo-extension/weemo-extension-services/src/main/resources/conf/client.p12")), "XnyexbUF");
      
      KeyManager[] keyManagers = getKeyManagers("PKCS12", new FileInputStream(p12File), "XnyexbUF");
      TrustManager[] trustManagers = getTrustManagers(new FileInputStream(pemFile), "XnyexbUF");
      
      
      
      ctx.init(keyManagers, trustManagers, new SecureRandom());
      SSLSocketFactory factory = new SSLSocketFactory(ctx, new StrictHostnameVerifier());

      ClientConnectionManager manager = httpClient.getConnectionManager();
      manager.getSchemeRegistry().register(new Scheme("https", 443, factory));
      
      Scheme sch = new Scheme("https", 443, factory);
      httpClient.getConnectionManager().getSchemeRegistry().register(sch);

      httpClient.getConnectionManager().getSchemeRegistry().register(sch);
      
      HttpGet httpget = new HttpGet("https://oauths-ppr.weemo.com/auth/");
      httpget.addHeader("client_id", "33cc7f1e82763049a4944a702c880d");
      httpget.addHeader("client_secret", "3569996f0d03b2cd3880223747c617");
      httpget.addHeader("uid", "1033a56f0e68");
      httpget.addHeader("identifier_client", "exo_domain");
      httpget.addHeader("id_profile", "basic");
      System.out.println("Executing request" + httpget.getRequestLine());
      HttpResponse response = httpClient.execute(httpget);
      HttpEntity entity = response.getEntity();

      System.out.println("----------------------------------------");
      System.out.println(response.getStatusLine());
      if (entity != null) {
          System.out.println("Response content length: " + entity.toString());
      }
      EntityUtils.consume(entity);

    } catch(Exception ex) {
      ex.printStackTrace();
    }
    
  }
  
}
