import { StatusCodes } from "http-status-codes";
import {
  createAnswerService,
  updateAnswerService,
  deleteAnswerService,
} from "../service/answer.service.js";

export const createAnswerController = async (req, res, next) => {
  try {
    const { questionId, content } = req.body;

    const answer = await createAnswerService({
      questionId,
      content,
      userId: req.user.id,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Answer posted successfully",
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnswerController = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;

    const answer = await updateAnswerService({
      answerId,
      content,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Answer updated successfully",
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnswerController = async (req, res, next) => {
  try {
    const { answerId } = req.params;

    await deleteAnswerService({
      answerId,
      userId: req.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
