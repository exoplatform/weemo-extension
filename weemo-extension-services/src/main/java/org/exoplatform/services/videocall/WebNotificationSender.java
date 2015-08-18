package org.exoplatform.services.videocall;

import org.exoplatform.commons.utils.CommonsUtils;
import org.exoplatform.model.videocall.MessageInfo;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.ws.frameworks.cometd.ContinuationService;
import org.exoplatform.ws.frameworks.json.impl.JsonGeneratorImpl;
import org.exoplatform.ws.frameworks.json.value.JsonValue;

public class WebNotificationSender {
  private final static Log LOG = ExoLogger.getLogger(WebNotificationSender.class);
  private final static String SIGHT_CALL_CHANNEL = "/eXo/Application/web/SightCall";

  /**
   * @param remoteId
   * @param message
   */
  public static void sendJsonMessage(String remoteId, MessageInfo message) {
    try {
      if (message != null) {
        ContinuationService continuation = CommonsUtils.getService(ContinuationService.class);
        if (continuation.isPresent(remoteId)) {
          JsonValue json = new JsonGeneratorImpl().createJsonObject(message);
          continuation.sendMessage(remoteId, SIGHT_CALL_CHANNEL, json);
        }
      }
    } catch (Exception e) {
      LOG.error("Failed to send notification message:" + e.getMessage());
    }
  }
}
