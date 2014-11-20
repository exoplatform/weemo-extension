
@Application(defaultController = VideoCallAdministration.class)
@Portlet(name="VideoCallAdministrationPortlet")
@Bindings({
    @Binding(org.exoplatform.portlet.administration.VideoCalls.class), 
    @Binding(org.exoplatform.services.organization.OrganizationService.class),
    @Binding(org.exoplatform.social.core.space.spi.SpaceService.class)
})

@Scripts(
        location = AssetLocation.SERVER,
        value = {
          @Script(value = "js/jquery-1.8.3.min.js", id = "jquery"),
          @Script(value = "js/jquery-juzu-utils-0.1.0.js", depends = "jquery", id = "juzu-utils")
        }
)
/*@Assets(
        location = AssetLocation.SERVER,
        scripts = {
            @Script(src = "js/jquery-1.8.3.min.js", id = "jquery"),
            @Script(src = "js/jquery-juzu-utils-0.1.0.js", depends = "jquery", id = "juzu-utils")
        }
)*/
@Assets("*")
package org.exoplatform.portlet.administration;

import juzu.Application;
import juzu.asset.AssetLocation;
import juzu.plugin.asset.Assets;
import juzu.plugin.asset.Script;
import juzu.plugin.asset.Scripts;
import juzu.plugin.binding.Binding;
import juzu.plugin.binding.Bindings;
import juzu.plugin.portlet.Portlet;
