package org.exoplatform.portlet.videocall;

import org.exoplatform.services.videocall.VideoCallService;
import org.w3c.dom.Element;

import javax.portlet.MimeResponse;
import javax.portlet.PortletException;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.filter.FilterChain;
import javax.portlet.filter.FilterConfig;
import javax.portlet.filter.RenderFilter;
import java.io.IOException;

public class ResponseFilter implements RenderFilter
{

  public void init(FilterConfig filterConfig) throws PortletException
  {
  }

  public void doFilter(RenderRequest request, RenderResponse response, FilterChain chain) throws IOException, PortletException
  {
    VideoCallService videoCallService = new VideoCallService();    
    String weemoKey = videoCallService.getWeemoKey();
    if (weemoKey!=null && !"".equals(weemoKey)) {
      Element jQuery1 = response.createElement("script");
      jQuery1.setAttribute("type", "text/javascript");
      jQuery1.setAttribute("src", "https://download.rtccloud.net/js/webappid/"+weemoKey+" ");
      response.addProperty(MimeResponse.MARKUP_HEAD_ELEMENT, jQuery1);
    }
    chain.doFilter(request, response);
  }

  public void destroy()
  {
  }
}
