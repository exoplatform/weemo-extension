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

import juzu.Mapped;

@Mapped
public class VideoCallModel {
  
  private String disableVideoCall = null;
  private String weemoKey = "";
  private String tokenKey = "";
  private String videoCallPermissions = "";
  

  
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
  
  public String getTokenKey() {
    return tokenKey;
  }
  
  public void setTokenKey(String tokenKey) {
    this.tokenKey = tokenKey;
  }
  
  public String getVideoCallPermissions() {
    return videoCallPermissions;
  }
  
  public void setVideoCallPermissions(String videoCallPermissions) {
    this.videoCallPermissions = videoCallPermissions;
  }

}
