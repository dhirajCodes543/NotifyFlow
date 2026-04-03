import getNotificationById from "../services/getNotificationById.service.js";

export async function getNotificationByIdController(req, res) {
  try {
    const { id } = req.params;

    const notification = await getNotificationById(id);

    return res.status(200).json({
      message: "notification fetched successfully",
      notification,
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