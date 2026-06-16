import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { castVoteController, removeVoteController } from "../controller/vote.controller.js";
import { castVoteValidation, removeVoteValidation } from "../validations/vote.validation.js";

const router = express.Router();

// All vote routes require authentication
router.use(authenticateUser);

router.post("/", castVoteValidation, castVoteController);
router.delete("/:targetType/:targetId", removeVoteValidation, removeVoteController);

export default router;
