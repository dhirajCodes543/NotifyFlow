import getNotificationEventsById from "../services/getNotificationEventsById.service.js";

export async function getNotificationEventsByIdController(req, res) {
  try {
    const { id } = req.params;

    const events = await getNotificationEventsById(id);

    const formattedEvents = events.map((event) => ({
      eventId: event.id,
      channel: event.channel,
      recipient: event.recipient,
      status: event.status,
      queuedAt: event.createdAt,
      processedAt:
        event.status === "SUCCESS" || event.status === "FAILED"
          ? event.updatedAt
          : null,
      providerMessageId: event.providerMessageId ?? null,
      errorMessage: event.errorMessage ?? null,
    }));

    return res.status(200).json({
      message: "notification events fetched successfully",
      notificationId: id,
      events: formattedEvents,
    });
  } catch (err) {
    if (err.message === "notification not found") {
      return res.status(404).json({
        error: err.message,
      });
    }

    return res.status(400).json({
      error: err.message,
    });
  }
}