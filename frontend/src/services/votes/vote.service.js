import { apiClient } from "../core/api.client.js";

/**
 * Cast a vote on a question or answer
 * @param {string} targetType - 'question' or 'answer'
 * @param {number} targetId - The ID of the question or answer
 * @param {number} voteValue - 1 for upvote, -1 for downvote
 */
export async function castVote(targetType, targetId, voteValue) {
  try {
    const response = await apiClient.post("/api/votes", {
      targetType,
      targetId,
      voteValue,
    });
    return response.data;
  } catch (error) {
    throw handleVoteError(error);
  }
}

/**
 * Remove a previously cast vote
 * @param {string} targetType - 'question' or 'answer'
 * @param {number} targetId - The ID of the question or answer
 */
export async function removeVote(targetType, targetId) {
  try {
    const response = await apiClient.delete(`/api/votes/${targetType}/${targetId}`);
    return response.data;
  } catch (error) {
    throw handleVoteError(error);
  }
}

function handleVoteError(error) {
  if (!error.response) {
    return new Error("Unable to connect to server.");
  }
  const backendMessage =
    error.response.data?.msg ||
    error.response.data?.message ||
    error.response.data?.error;
  return new Error(backendMessage || "Failed to submit vote.");
}

export const voteService = {
  castVote,
  removeVote,
};
