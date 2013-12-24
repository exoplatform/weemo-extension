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
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
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


import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.conn.ssl.StrictHostnameVerifier;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.gatein.common.logging.Logger;
import org.gatein.common.logging.LoggerFactory;


public class AuthService {
  
  private String authUrl;  
  private String clientId = null;
  private String clientSecret = null;
  private String caFile = null;
  private String p12File = null;
  private String p12Pass = null;
  private String app_id = null;
  private String domain_id = null;
  private SSLContext sslContext = null;
  
  private Logger logger = LoggerFactory.getLogger(AuthService.class);
  
  public AuthService(String app_id, String domain_id, String authUrl, String caFile, String p12File, String p12Pass, String clientId, String clientSecret) {
    this.app_id = app_id;
    this.domain_id = domain_id;
    this.authUrl = authUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.caFile = caFile;
    this.p12File = p12File;
    this.p12Pass = p12Pass;
    
  }
  
  
  public String authenticate(String profile_id) {
    String weemoToken = null;
    
    DefaultHttpClient httpClient = new DefaultHttpClient();
    try {
      SSLContext ctx = SSLContext.getInstance("TLS");
      TrustManager[] trustManagers = getTrustManagers(new FileInputStream(new File(caFile)), p12Pass);
      KeyManager[] keyManagers = getKeyManagers("pkcs12", new FileInputStream(new File(p12File)), p12Pass);
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
      System.out.println("executing request" + httpget.getRequestLine());
      HttpResponse response = httpClient.execute(httpget);
      HttpEntity entity = response.getEntity();

      System.out.println(response.getStatusLine());
      if (entity != null) {
          System.out.println("Response content length: " + entity.getContentLength());
      }
      //EntityUtils.consume(entity);

    } catch(Exception ex) {
      ex.printStackTrace();
    }

    
    return weemoToken;
  }
  
  protected static KeyManager[] getKeyManagers(String keyStoreType, InputStream keyStoreFile, String keyStorePassword) throws Exception {
    KeyStore keyStore = KeyStore.getInstance(keyStoreType);
    keyStore.load(keyStoreFile, keyStorePassword.toCharArray());
    KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
    kmf.init(keyStore, keyStorePassword.toCharArray());
    return kmf.getKeyManagers();
}

protected static TrustManager[] getTrustManagers(InputStream trustStoreFile, String trustStorePassword) throws Exception {
    KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
    //trustStore.load(trustStoreFile,trustStorePassword.toCharArray());
    trustStore.load(null, null);
    CertificateFactory certificateFactory = null;
    try {
      certificateFactory = CertificateFactory.getInstance("X.509");
    }
    catch (CertificateException e) {
      e.printStackTrace();
    }
    Certificate caCert = certificateFactory.generateCertificate(trustStoreFile);
    trustStore.setCertificateEntry("CA", caCert);
    TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    tmf.init(trustStore);
    return tmf.getTrustManagers();
}
  
  public static void main(String[] args) {
    DefaultHttpClient httpClient = new DefaultHttpClient();
    try {
      SSLContext ctx = SSLContext.getInstance("TLS");
      TrustManager[] trustManagers = getTrustManagers(new FileInputStream(new File("/home/tanhq/java/eXoProjects/weemo-extension/weemo-extension-webapp/src/main/resources/weemo-ca.pem")), "XnyexbUF");
      KeyManager[] keyManagers = getKeyManagers("pkcs12", new FileInputStream(new File("/home/tanhq/java/eXoProjects/weemo-extension/weemo-extension-webapp/src/main/resources/client.p12")), "XnyexbUF");
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
      System.out.println("executing request" + httpget.getRequestLine());
      HttpResponse response = httpClient.execute(httpget);
      HttpEntity entity = response.getEntity();

      System.out.println("----------------------------------------");
      System.out.println(response.getStatusLine());
      if (entity != null) {
          System.out.println("Response content length: " + entity.getContentLength());
      }
      //EntityUtils.consume(entity);

    } catch(Exception ex) {
      ex.printStackTrace();
    }
    
  }
  
}
