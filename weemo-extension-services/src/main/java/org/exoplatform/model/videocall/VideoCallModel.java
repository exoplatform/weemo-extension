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
package org.exoplatform.model.videocall;

import java.io.InputStream;
import java.io.Serializable;

import juzu.Mapped;

@Mapped
public class VideoCallModel implements Serializable {

  private static final long serialVersionUID = 1L;
  private String disableVideoCall = null;
  private String weemoKey = "";
  private String customerCertificatePassphrase = "";
  private String authId = "";
  private String authSecret = "";
  private String videoCallPermissions = "";
  private InputStream p12Cert = null;
  private InputStream pemCert = null;
  
  private String p12CertName = "";
  private String pemCertName = "";
  
  private String profileId = "";
  private String domainId = "";
  

  
  public String getDisableVideoCall() {
    return disableVideoCall;
  }
  
  public void setDisableVideoCall(String disableVideoCall) {
    this.disableVideoCall = disableVideoCall;
  }
  
  public String getWeemoKey() {
    return weemoKey;
  }
  
  public void setWeemoKey(String weemoKey) {
    this.weemoKey = weemoKey;
  }
  
  public String getCustomerCertificatePassphrase() {
    return customerCertificatePassphrase;
  }
  
  public void setCustomerCertificatePassphrase(String passPhrase) {
    this.customerCertificatePassphrase = passPhrase;
  }
  
  public String getAuthId() {
    return authId;
  }
  
  public void setAuthId(String authId) {
    this.authId = authId;
  }
  
  public String getAuthSecret() {
    return authSecret;
  }
  
  public void setAuthSecret(String authSecret) {
    this.authSecret = authSecret;
  }  
  
  public String getVideoCallPermissions() {
    return videoCallPermissions;
  }
  
  public void setVideoCallPermissions(String videoCallPermissions) {
    this.videoCallPermissions = videoCallPermissions;
  }
  
  public InputStream getP12Cert(){
    return p12Cert;
  }
  
  public void setP12Cert(InputStream p12Cert) {
    this.p12Cert = p12Cert;
  }
  
  public InputStream getPemCert() {
    return pemCert;
  }
  
  public void setPemCert(InputStream pemCert) {
    this.pemCert = pemCert;
  }
  
  public String getP12CertName(){
    return p12CertName;
  }
  
  public void setP12CertName(String p12CertName) {
    this.p12CertName = p12CertName;
  }
  
  public String getPemCertName() {
    return pemCertName;
  }
  
  public void setPemCertName(String pemCertName) {
    this.pemCertName = pemCertName;
  }
  
  public String getProfileId() {
    return profileId;
  }
  
  public void setProfileId(String profileId) {
    this.profileId = profileId;
  }
  
  public String getDomainId(){
    return domainId;
  }
  
  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

}
