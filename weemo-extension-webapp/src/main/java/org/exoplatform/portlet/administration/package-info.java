
@Application(defaultController = VideoCallAdministration.class)
@Portlet(name="VideoCallAdministrationPortlet")
@Bindings({
    @Binding(org.exoplatform.portlet.administration.VideoCalls.class), 
    @Binding(org.exoplatform.services.organization.OrganizationService.class),
    @Binding(org.exoplatform.social.core.space.spi.SpaceService.class)
})


@Assets(
        location = AssetLocation.SERVER       
)




package org.exoplatform.portlet.administration;

import juzu.Application;
import juzu.asset.AssetLocation;
import juzu.plugin.asset.Assets;
import juzu.plugin.binding.Binding;
import juzu.plugin.binding.Bindings;
import juzu.plugin.portlet.Portlet;
