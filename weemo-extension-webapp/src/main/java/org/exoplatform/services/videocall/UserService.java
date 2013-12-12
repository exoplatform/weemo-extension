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

/**
 * Created by The eXo Platform SAS
 * Author : eXoPlatform
 *          exo@exoplatform.com
 * Dec 10, 2013  
 */
import com.mongodb.*;
import org.exoplatform.listener.videocall.ConnectionManager;
import org.exoplatform.model.videocall.SpaceBean;
import org.exoplatform.model.videocall.UserBean;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.List;

@Named("userService")
@ApplicationScoped
public class UserService
{

  private static final String M_USERS_COLLECTION = "users";
  private static final String M_SPACES_COLLECTION = "spaces";

  public static final String STATUS_AVAILABLE = "available";
  public static final String STATUS_DONOTDISTURB = "donotdisturb";
  public static final String STATUS_AWAY = "away";
  public static final String STATUS_INVISIBLE = "invisible";
  public static final String STATUS_OFFLINE = "offline";
  public static final String STATUS_NONE = "none";
  public static final String STATUS_SPACE = "space";

  public static final String ANONIM_USER = "__anonim_";
  public static final String SUPPORT_USER = "__support_";


  private DB db()
  {
    return ConnectionManager.getInstance().getDB();
  }

  public void toggleFavorite(String user, String targetUser)
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      List<String> favorites = new ArrayList<String>();
      if (doc.containsField("favorites")) {
        favorites = (List<String>)doc.get("favorites");
      }
      if (favorites.contains(targetUser))
        favorites.remove(targetUser);
      else
        favorites.add(targetUser);

      doc.put("favorites", favorites);
      coll.save(doc, WriteConcern.SAFE);
    }
  }

  public boolean isFavorite(String user, String targetUser)
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      if (doc.containsField("favorites")) {
        List<String> favorites = (List<String>)doc.get("favorites");
        if (favorites.contains(targetUser))
          return true;
      }
    }
    return false;
  }

  public void addUserFullName(String user, String fullname)
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (!cursor.hasNext())
    {
      BasicDBObject doc = new BasicDBObject();
      doc.put("_id", user);
      doc.put("user", user);
      doc.put("fullname", fullname);
      coll.insert(doc);
    }
    else
    {
      DBObject doc = cursor.next();
      doc.put("fullname", fullname);
      coll.save(doc);

    }
  }

  public void addUserEmail(String user, String email)
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (!cursor.hasNext())
    {
      BasicDBObject doc = new BasicDBObject();
      doc.put("_id", user);
      doc.put("user", user);
      doc.put("email", email);
      coll.insert(doc);
    }
    else
    {
      DBObject doc = cursor.next();
      doc.put("email", email);
      coll.save(doc);

    }
  }

  public void setSpaces(String user, List<SpaceBean> spaces)
  {
    List<String> spaceIds = new ArrayList<String>();
    DBCollection coll = db().getCollection(M_SPACES_COLLECTION);
    for (SpaceBean bean:spaces)
    {
      spaceIds.add(bean.getId());

      BasicDBObject query = new BasicDBObject();
      query.put("_id", bean.getId());
      DBCursor cursor = coll.find(query);
      if (!cursor.hasNext())
      {
        BasicDBObject doc = new BasicDBObject();
        doc.put("_id", bean.getId());
        doc.put("displayName", bean.getDisplayName());
        doc.put("groupId", bean.getGroupId());
        doc.put("shortName", bean.getShortName());
        coll.insert(doc);
      }
      else
      {
        DBObject doc = cursor.next();
        doc.put("_id", bean.getId());
        doc.put("displayName", bean.getDisplayName());
        doc.put("groupId", bean.getGroupId());
        doc.put("shortName", bean.getShortName());
        coll.save(doc);
      }


    }
    coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      doc.put("spaces", spaceIds);
      coll.save(doc, WriteConcern.SAFE);
    }
    else
    {
      BasicDBObject doc = new BasicDBObject();
      doc.put("_id", user);
      doc.put("user", user);
      doc.put("spaces", spaceIds);
      coll.insert(doc);
    }
  }

  private SpaceBean getSpace(String spaceId)
  {
    SpaceBean spaceBean = null;
    DBCollection coll = db().getCollection(M_SPACES_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("_id", spaceId);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      spaceBean = new SpaceBean();
      spaceBean.setId(spaceId);
      spaceBean.setDisplayName(doc.get("displayName").toString());
      spaceBean.setGroupId(doc.get("groupId").toString());
      spaceBean.setShortName(doc.get("shortName").toString());
    }

    return spaceBean;
  }

  public List<SpaceBean> getSpaces(String user)
  {
    List<SpaceBean> spaces = new ArrayList<SpaceBean>();
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();

      List<String> listspaces = ((List<String>)doc.get("spaces"));
      if (listspaces!=null)
      {
        for (String space:listspaces)
        {
          spaces.add(getSpace(space));
        }
      }

    }
    return spaces;
  }

  public String setStatus(String user, String status)
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      doc.put("status", status);
      coll.save(doc, WriteConcern.SAFE);
    }
    else
    {
      BasicDBObject doc = new BasicDBObject();
      doc.put("_id", user);
      doc.put("user", user);
      doc.put("status", status);
      coll.insert(doc);
    }
    return status;
  }

  public void setAsAdmin(String user, boolean isAdmin)
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      doc.put("isSupportAdmin", isAdmin);
      coll.save(doc, WriteConcern.SAFE);
    }
    else
    {
      BasicDBObject doc = new BasicDBObject();
      doc.put("_id", user);
      doc.put("user", user);
      doc.put("isSupportAdmin", isAdmin);
      coll.insert(doc);
    }
  }

  public boolean isAdmin(String user)
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      String isAdmin = doc.get("isSupportAdmin").toString();
      return (isAdmin!=null && "true".equals(isAdmin));
    }
    return false;
  }

  public String getStatus(String user)
  {
    String status = STATUS_NONE;
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      if (doc.containsField("status"))
        status = doc.get("status").toString();
      else
        status = setStatus(user, STATUS_AVAILABLE);
    }
    else
    {
      status = setStatus(user, STATUS_AVAILABLE);
    }

    return status;
  }

  public String getUserFullName(String user)
  {
    String fullname = null;
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      if (doc.get("fullname")!=null)
        fullname = doc.get("fullname").toString();
    }

    return fullname;
  }

  public UserBean getUser(String user)
  {
    return getUser(user, false);
  }

  public UserBean getUser(String user, boolean withFavorites)
  {
    UserBean userBean = new UserBean();
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("user", user);
    DBCursor cursor = coll.find(query);
    if (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      userBean.setName(user);
      if (doc.get("fullname")!=null)
        userBean.setFullname( doc.get("fullname").toString() );
      if (doc.get("email")!=null)
        userBean.setEmail(doc.get("email").toString());
      if (doc.get("status")!=null)
        userBean.setStatus(doc.get("status").toString());
      if (doc.containsField("favorites")) {
        userBean.setFavorites ((List<String>) doc.get("favorites"));
      }
    }

    return userBean;
  }

  public List<String> getUsersFilterBy(String user, String space)
  {
    ArrayList<String> users = new ArrayList<String>();
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    query.put("spaces", space);
    DBCursor cursor = coll.find(query);
    while (cursor.hasNext())
    {
      DBObject doc = cursor.next();
      String target = doc.get("user").toString();
      if (!user.equals(target))
        users.add(target);
    }

    return users;
  }

  public int getNumberOfUsers()
  {
    DBCollection coll = db().getCollection(M_USERS_COLLECTION);
    BasicDBObject query = new BasicDBObject();
    DBCursor cursor = coll.find(query);
    return cursor.count();
  }


}

