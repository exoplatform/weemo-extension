package org.exoplatform.model.videocall;

import org.exoplatform.utils.videocall.MessageDigester;
import org.exoplatform.utils.videocall.PropertyManager;
import java.util.List;

public class RoomsBean {

  List<RoomBean> rooms;

  public List<RoomBean> getRooms() {
    return rooms;
  }

  public void setRooms(List<RoomBean> rooms) {
    this.rooms = rooms;
  }

  public String roomsToJSON()
  {
    StringBuffer sb = new StringBuffer();
    sb.append("{");
    sb.append("\"rooms\": [");
    boolean first=true;
    for (RoomBean roomBean:this.getRooms()) {
      if (!first) {
        sb.append(",");
      } else {
        first=false;
      }

      sb.append(roomBean.toJSON());

    }
    sb.append("],");
    sb.append("\"md5\": \"").append(MessageDigester.getHash(sb.toString())).append("\",");
    sb.append("\"timestamp\": \""+System.currentTimeMillis()+"\"");
    sb.append("}");


    return sb.toString();
  }

}
