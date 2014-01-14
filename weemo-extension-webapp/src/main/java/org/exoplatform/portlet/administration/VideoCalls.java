/*
 * Copyright (C) 2003-2014 eXo Platform SAS.
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
package org.exoplatform.portlet.administration;

import juzu.FlashScoped;

import javax.inject.Named;
import java.io.Serializable;

@Named("videoCalls")
@FlashScoped
public class VideoCalls implements Serializable {
  
  private boolean displaySuccessMsg = false;
 
  public void setDisplaySuccessMsg(boolean displaySuccessMsg) {
    this.displaySuccessMsg = displaySuccessMsg;
  }
  
  public boolean isDisplaySuccessMsg() {
    return displaySuccessMsg;
  }
}
