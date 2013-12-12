package org.exoplatform.jobs.videocall;

import org.exoplatform.services.videocall.NotificationService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import java.util.logging.Logger;

public class NotificationCleanupJob implements Job
{
  Logger log = Logger.getLogger("NotificationCleanupJob");
  @Override
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    log.info("Job started");
    NotificationService.cleanupNotifications();
    log.info("Job finished");
  }
}
