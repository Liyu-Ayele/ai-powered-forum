import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { bookmarkService } from "../../services/bookmarks/bookmark.service";
import { timeAgo } from "../../lib/utils";
import {
  Bookmark,
  ChevronRight,
  User,
  Clock,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  BookmarkPlus,
} from "lucide-react";
import styles from "./MyBookmarks.module.css";
import ui from "../../styles/pageStates.module.css";

export default function MyBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bookmarkService.getBookmarks({ limit: 50 }); // Fetch first 50
      setBookmarks(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (e, questionId) => {
    e.preventDefault(); // Prevent navigating to the question link
    try {
      await bookmarkService.toggleBookmark(questionId);
      // Optimistically remove from list
      setBookmarks((prev) => prev.filter((b) => b.id !== questionId));
    } catch (err) {
      console.error("Failed to remove bookmark", err);
      // Optional: show a toast here
    }
  };

  if (isLoading) {
    return (
      <div className={styles.bookmarksPage}>
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonMeta}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonBadge} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.bookmarksPage}>
        <div
          className={`${ui.pageStates__message} ${ui["pageStates__message--error"]} ${styles.errorMessage}`}
        >
          <AlertCircle size={36} className={styles.errorIcon} />
          <h4>Failed to load bookmarks</h4>
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchBookmarks}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className={styles.bookmarksPage}>
        <div
          className={`${ui.pageStates__message} ${ui["pageStates__message--empty"]} ${styles.emptyState}`}
        >
          <BookmarkPlus size={48} className={styles.emptyIcon} />
          <h4>No bookmarks yet</h4>
          <p>
            When you find an interesting question, click the bookmark icon to
            save it here for later reference.
          </p>
          <div className={styles.emptyActions}>
            <Link to="/dashboard" className={styles.browseButton}>
              Browse Questions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookmarksPage}>
      <div className={styles.header}>
        <h2>Your Saved Questions ({bookmarks.length})</h2>
        <p className={styles.subtitle}>
          Questions you've bookmarked for future reference.
        </p>
      </div>

      <div className={styles.questionsList}>
        {bookmarks.map((question) => {
          const authorName = question.author
            ? `${question.author.firstName} ${question.author.lastName}`
            : "Anonymous";

          return (
            <Link
              key={question.questionHash || question.id}
              to={`/questions/${question.questionHash}`}
              className={styles.questionCard}
            >
              <div className={styles.cardContent}>
                <div className={styles.titleRow}>
                  <h4 className={styles.questionTitle}>{question.title}</h4>
                  <button
                    className={styles.bookmarkBtn}
                    onClick={(e) => handleRemoveBookmark(e, question.id)}
                    title="Remove bookmark"
                    aria-label="Remove bookmark"
                  >
                    <Bookmark size={20} className={styles.bookmarkedIcon} fill="currentColor" />
                  </button>
                </div>
                <p className={styles.questionSnippet}>
                  {question.content
                    ? question.content.replace(/[#*`]/g, "").slice(0, 140) +
                      (question.content.length > 140 ? "..." : "")
                    : ""}
                </p>
                <div className={styles.questionMeta}>
                  <span
                    className={`${styles.metaItem} ${styles.authorNameItem}`}
                  >
                    <User size={14} />
                    <span className={styles.authorName}>{authorName}</span>
                  </span>
                  <span className={styles.metaItem}>
                    <Clock size={14} />
                    <span title={`Saved ${timeAgo(question.bookmarkedAt)}`}>
                      {timeAgo(question.createdAt)}
                    </span>
                  </span>
                  <span className={styles.metaItem}>
                    <MessageSquare size={14} />
                    <span>
                      {question.answerCount ?? 0}{" "}
                      {(question.answerCount ?? 0) === 1 ? "answer" : "answers"}
                    </span>
                  </span>
                  <span className={styles.metaItem}>
                    <ThumbsUp size={14} />
                    <span>{question.likes ?? 0}</span>
                  </span>
                </div>
              </div>
              <ChevronRight className={styles.cardArrow} size={20} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
