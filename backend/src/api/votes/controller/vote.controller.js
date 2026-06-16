import { StatusCodes } from "http-status-codes";
import { castVoteService, removeVoteService } from "../service/vote.service.js";

export const castVoteController = async (req, res, next) => {
  try {
    const { targetType, targetId, voteValue } = req.body;
    const userId = req.user.id; // from authenticateUser middleware

    await castVoteService({ userId, targetType, targetId, voteValue });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Vote cast successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const removeVoteController = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user.id;

    await removeVoteService({ userId, targetType, targetId: parseInt(targetId, 10) });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Vote removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
