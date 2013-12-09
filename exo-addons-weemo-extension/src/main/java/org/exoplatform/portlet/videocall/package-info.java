
@Application(defaultController = VideoCallApplication.class)
@Portlet(name="VideoCallPortlet")
@Bindings(
        {
                @Binding(value = org.exoplatform.services.organization.OrganizationService.class),
                @Binding(value = org.exoplatform.social.core.space.spi.SpaceService.class)
        }
)

@Assets(
        location = AssetLocation.SERVER,
        scripts = {
        		@Script(src = "js/jquery-1.8.3.min.js", id = "jquery"),
                @Script(src = "js/jquery-juzu-utils-0.1.0.js", depends = "jquery", id = "juzu-utils"),
                @Script(src = "js/taffy-min.js", id="taffy"),
                @Script(src = "js/chat.js", depends = {"jquery","juzu-utils","taffy"} ),
                @Script(src = "js/sh_main.min.js"),
                @Script(src = "js/sh_html.min.js"),
                @Script(src = "js/sh_java.min.js"),
                @Script(src = "js/sh_javascript.min.js"),
                @Script(src = "js/sh_css.min.js"),
                @Script(src = "js/Weemo.js", depends = "jquery", id = "weemo" ),
                @Script(src = "js/Modal.js", depends = "weemo")
        }
)




package org.exoplatform.portlet.videocall;

import juzu.Application;
import juzu.asset.AssetLocation;
import juzu.plugin.asset.Assets;
import juzu.plugin.asset.Script;
import juzu.plugin.asset.Stylesheet;
import juzu.plugin.binding.Binding;
import juzu.plugin.binding.Bindings;
import juzu.plugin.less.Less;
import juzu.plugin.portlet.Portlet;
