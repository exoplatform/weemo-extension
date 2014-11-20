
@Application(defaultController = VideoCallApplication.class)
@Portlet(name="VideoCallPortlet")
@Bindings(
        {
                @Binding(value = org.exoplatform.services.organization.OrganizationService.class),
                @Binding(value = org.exoplatform.social.core.space.spi.SpaceService.class),
                @Binding(value = org.exoplatform.services.security.ConversationRegistry.class)
        }
)
@Scripts(location = AssetLocation.SERVER,
        value = {
            @Script(value = "js/jquery-1.8.3.min.js", id = "jquery"),
            @Script(value = "js/jquery-juzu-utils-0.1.0.js", depends = "jquery", id = "juzu-utils"),
            @Script(value = "js/notif.js", id = "notif", depends = {"jquery", "juzu-utils"})
        }
)
@Stylesheets({
        @Stylesheet(value = "css/style.css", location = AssetLocation.SERVER)
})
/*@Assets(
        location = AssetLocation.SERVER,
        scripts = {
            @Script(src = "js/jquery-1.8.3.min.js", id = "jquery"),
            @Script(src = "js/jquery-juzu-utils-0.1.0.js", depends = "jquery", id = "juzu-utils"),
            @Script(src = "js/notif.js", id = "notif", depends = {"jquery", "juzu-utils"})
        },
        stylesheets = {            
            @Stylesheet(src = "css/style.css")
        }
)*/
@Assets("*")


package org.exoplatform.portlet.videocall;

import juzu.Application;
import juzu.asset.AssetLocation;
import juzu.plugin.asset.*;
import juzu.plugin.binding.Binding;
import juzu.plugin.binding.Bindings;
import juzu.plugin.portlet.Portlet;

