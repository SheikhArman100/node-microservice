/**
 * Check if message should be retried based on RabbitMQ x-death headers
 * @param msg RabbitMQ message
 * @param maxRetries Maximum number of retries (default: 2)
 * @returns Object with retry count and whether to retry
 */
export const checkRetryLimit = (msg: any, maxRetries: number = 2) => {
  const retryCount = msg.properties?.headers?.['x-death']?.[0]?.count || 0;
  return {
    retryCount,
    shouldRetry: retryCount < maxRetries,
    isLastRetry: retryCount === maxRetries - 1
  };
};

/**
 * Handle message retry logic
 * @param channel RabbitMQ channel
 * @param msg Message to process
 * @param error Error that occurred
 * @param logger Logger instance
 * @param dlqLogger DLQ logger for dead letter messages
 * @param maxRetries Maximum retries (default: 2)
 */
export const handleMessageRetry = (
  channel: any,
  msg: any,
  error: any,
  logger: any,
  dlqLogger: any,
  maxRetries: number = 2
) => {
  const { retryCount, shouldRetry, isLastRetry } = checkRetryLimit(msg, maxRetries);

  if (!shouldRetry) {
    // Log to DLQ and remove from queue
    dlqLogger.error(`🚫 DLQ: Message failed permanently after ${retryCount} retries`, {
      error: error.message,
      retryCount,
      messageId: msg.properties?.messageId,
      timestamp: new Date().toISOString(),
      originalMessage: JSON.parse(msg.content.toString())
    });
    channel.ack(msg); // Remove from queue
    return;
  }

  // Calculate delay: (retryCount + 1) * 5 seconds
  const delay = (retryCount + 1) * 5000;

  if (isLastRetry) {
    logger.warn(`⏰ Last retry (${retryCount + 1}/${maxRetries + 1}) in ${delay/1000}s: ${error.message}`);
  } else {
    logger.warn(`⏰ Retry ${retryCount + 1}/${maxRetries + 1} in ${delay/1000}s: ${error.message}`);
  }

  // Schedule retry with calculated delay
  setTimeout(() => {
    channel.reject(msg, false); // Requeue for retry
  }, delay);
};
