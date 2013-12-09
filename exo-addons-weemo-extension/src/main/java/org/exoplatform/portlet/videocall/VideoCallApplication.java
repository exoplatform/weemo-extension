package org.exoplatform.portlet.videocall;

import juzu.*;
import juzu.request.RenderContext;
import juzu.template.Template;
import javax.inject.Inject;

public class VideoCallApplication {

	@Inject
	@Path("index.gtmpl")
	Template index;
	
	@View
	public Response.Content index(RenderContext renderContext)
	{
		return index.with().ok();
	}
}
