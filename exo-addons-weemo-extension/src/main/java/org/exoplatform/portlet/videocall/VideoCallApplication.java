package org.exoplatform.portlet.videocall;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.logging.Logger;

import juzu.*;
import juzu.plugin.ajax.Ajax;
import juzu.request.RenderContext;
import juzu.template.Template;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.portlet.PortletPreferences;

import org.exoplatform.listener.videocall.ServerBootstrap;
import org.exoplatform.model.videocall.SpaceBean;
import org.exoplatform.services.videocall.UserService;
import org.exoplatform.utils.videocall.PropertyManager;
import org.exoplatform.commons.utils.ListAccess;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.organization.User;
import org.exoplatform.social.core.space.model.Space;
import org.exoplatform.social.core.space.spi.SpaceService;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.social.core.space.spi.SpaceService;

public class VideoCallApplication {

  @Inject
  @Path("index.gtmpl")
  Template index;
  
  String token_ = "---";
  String remoteUser_ = null;
  String fullname_ = null;
  boolean isAdmin_=false;

  boolean profileInitialized_ = false;

  Logger log = Logger.getLogger("ChatApplication");

  OrganizationService organizationService_;

  SpaceService spaceService_;

  @Inject
  Provider<PortletPreferences> providerPreferences;

  @Inject
  public VideoCallApplication(OrganizationService organizationService, SpaceService spaceService)
  {
    organizationService_ = organizationService;
    spaceService_ = spaceService;
  }


  @View
  public void index(RenderContext renderContext) throws IOException
  {
    remoteUser_ = renderContext.getSecurityContext().getRemoteUser();
    String chatIntervalStatus = PropertyManager.getProperty(PropertyManager.PROPERTY_INTERVAL_STATUS);
    String chatIntervalNotif = PropertyManager.getProperty(PropertyManager.PROPERTY_INTERVAL_NOTIF);
    String chatWeemoKey = PropertyManager.getProperty(PropertyManager.PROPERTY_WEEMO_KEY);

    index.with().set("user", remoteUser_).set("chatIntervalStatus", chatIntervalStatus)
            .set("chatIntervalNotif", chatIntervalNotif)
            .set("weemoKey", chatWeemoKey)
            .render();
  }

  @Ajax
  @Resource
  public Response.Content initChatProfile()
  {
    String out = "{\"token\": \""+token_+"\", \"fullname\": \""+fullname_+"\", \"msg\": \"nothing to update\", \"isAdmin\": \""+isAdmin_+"\"}";
    if (!profileInitialized_ && !UserService.ANONIM_USER.equals(remoteUser_))
    {
      try
      {
        // Generate and store token if doesn't exist yet.
        token_ = ServerBootstrap.getTokenService().getToken(remoteUser_);

        // Add User in the DB
        addUser(remoteUser_, token_);

        // Set user's Full Name in the DB
        saveFullNameAndEmail(remoteUser_);

        // Set user's Spaces in the DB
        saveSpaces(remoteUser_);

        if ("true".equals(PropertyManager.getProperty(PropertyManager.PROPERTY_PUBLIC_MODE)))
        {
          Collection ms = organizationService_.getMembershipHandler().findMembershipsByUserAndGroup(remoteUser_, PropertyManager.getProperty(PropertyManager.PROPERTY_PUBLIC_ADMIN_GROUP));
          isAdmin_= (ms!=null && ms.size()>0);
        }

        if (!UserService.ANONIM_USER.equals(remoteUser_))
        {
          fullname_ = ServerBootstrap.getUserService().getUserFullName(remoteUser_);
          ServerBootstrap.getUserService().setAsAdmin(remoteUser_, isAdmin_);
        }

        out = "{\"token\": \""+token_+"\", \"fullname\": \""+fullname_+"\", \"msg\": \"updated\", \"isAdmin\": \""+isAdmin_+"\"}";
        profileInitialized_ = true;
      }
      catch (Exception e)
      {
        e.printStackTrace();
        profileInitialized_ = false;
        return Response.notFound("Error during init, try later");
      }
    }

    return Response.ok(out).withMimeType("text/event-stream; charset=UTF-8").withHeader("Cache-Control", "no-cache");

  }
  
  protected void addUser(String remoteUser, String token)
  {
    ServerBootstrap.getTokenService().addUser(remoteUser, token);
  }

  protected String saveFullNameAndEmail(String username)
  {
    String fullname = username;
    try
    {

      fullname = ServerBootstrap.getUserService().getUserFullName(username);
      if (fullname==null)
      {
        User user = organizationService_.getUserHandler().findUserByName(username);
        if (user!=null)
        {
          fullname = user.getFirstName()+" "+user.getLastName();
          ServerBootstrap.getUserService().addUserFullName(username, fullname);
          ServerBootstrap.getUserService().addUserEmail(username, user.getEmail());
        }
      }


    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return fullname;
  }

  protected void setAsAdmin(String username, boolean isAdmin)
  {
    try
    {

      ServerBootstrap.getUserService().setAsAdmin(username, isAdmin);

    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  protected void saveSpaces(String username)
  {
    try
    {
      ListAccess<Space> spacesListAccess = spaceService_.getAccessibleSpacesWithListAccess(username);
      List<Space> spaces = Arrays.asList(spacesListAccess.load(0, spacesListAccess.getSize()));
      List<SpaceBean> beans = new ArrayList<SpaceBean>();
      for (Space space:spaces)
      {
        SpaceBean spaceBean = new SpaceBean();
        spaceBean.setDisplayName(space.getDisplayName());
        spaceBean.setGroupId(space.getGroupId());
        spaceBean.setId(space.getId());
        spaceBean.setShortName(space.getShortName());
        beans.add(spaceBean);
      }
      ServerBootstrap.getUserService().setSpaces(username, beans);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }

  }

  protected void saveDemoSpace(String username)
  {
    try
    {
      List<SpaceBean> beans = new ArrayList<SpaceBean>();
      SpaceBean spaceBean = new SpaceBean();
      spaceBean.setDisplayName("Welcome Space");
      spaceBean.setGroupId("/public");
      spaceBean.setId("welcome_space");
      spaceBean.setShortName("welcome_space");
      beans.add(spaceBean);

      ServerBootstrap.getUserService().setSpaces(username, beans);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }

  }
}
