package org.exoplatform.portlet.videocall;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import javax.portlet.MimeResponse;
import javax.portlet.PortletException;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.filter.FilterChain;
import javax.portlet.filter.FilterConfig;
import javax.portlet.filter.RenderFilter;

import org.w3c.dom.Element;

import org.exoplatform.services.videocall.VideoCallService;



public class ResponseFilter implements RenderFilter
{
  
  public static final String INVALID_WEEMO_JS_MESSAGE = "/* Not allowed (disabled) */";
  
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
      if(checkWeemoJavaScript()){
        jQuery1.setAttribute("src", "https://download.rtccloud.net/js/webappid/"+weemoKey+" ");
      }else{
        jQuery1.setTextContent("console.log('Can not load https://download.rtccloud.net/js/webappid/" + weemoKey + "');");
      }
      response.addProperty(MimeResponse.MARKUP_HEAD_ELEMENT, jQuery1);
    }
    chain.doFilter(request, response);
  }
  
  private boolean checkWeemoJavaScript(){
    VideoCallService videoCallService = new VideoCallService();  
    String weemoKey = videoCallService.getWeemoKey();
    URL url;
    try {
      url = new URL("https://download.rtccloud.net/js/webappid/" + weemoKey);
      URLConnection conn = url.openConnection();
      BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
      StringBuilder stringBuilder = new StringBuilder();
      String inputLine;
      while ((inputLine = br.readLine()) != null) {
        stringBuilder.append(inputLine);
      }
      br.close();
      return ! (stringBuilder.toString().toUpperCase().equals(INVALID_WEEMO_JS_MESSAGE.toUpperCase()));
    } catch (Exception e) {
      e.printStackTrace();
    }
    return false;
  }

  public void destroy()
  {
  }
}
