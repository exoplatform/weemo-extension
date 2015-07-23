package org.exoplatform.model.videocall;

import org.apache.commons.lang3.StringUtils;
import org.exoplatform.services.videocall.VideoCallService;

public class MessageInfo {
  private String type = StringUtils.EMPTY;
  private String fromUser = StringUtils.EMPTY;
  private String fromFullName = StringUtils.EMPTY;
  private String toUser = StringUtils.EMPTY;
  private String toFullName = StringUtils.EMPTY;
  private String callMode = StringUtils.EMPTY;
  private long createdTime;

  public MessageInfo(String type, String fromUser, String toUser, String mode) {
    this.type = type;
    this.fromUser = fromUser;
    this.toUser = toUser;
    this.callMode = mode;
    this.createdTime = System.currentTimeMillis();
    toFullName = VideoCallService.getFullName(toUser);
    fromFullName = VideoCallService.getFullName(fromUser);
  }

  public String getCallMode() {
    return callMode;
  }

  public void setCallMode(String callMode) {
    this.callMode = callMode;
  }

  public long getCreatedTime() {
    return createdTime;
  }

  public void setCreatedTime(long createdTime) {
    this.createdTime = createdTime;
  }

  public String getFromUser() {
    return fromUser;
  }

  public void setFromUser(String fromUser) {
    this.fromUser = fromUser;
  }

  public String getToUser() {
    return toUser;
  }

  public void setToUser(String toUser) {
    this.toUser = toUser;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getFromFullName() {
    return fromFullName;
  }

  public String getToFullName() {
    return toFullName;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    MessageInfo that = (MessageInfo) o;

    if (!fromUser.equals(that.fromUser)) return false;
    if (!toUser.equals(that.toUser)) return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = fromUser.hashCode();
    result = 31 * result + toUser.hashCode();
    return result;
  }
}
