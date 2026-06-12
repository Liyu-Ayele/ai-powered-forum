import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { questionService } from '../../services/questions/question.service.js';
import styles from './PostQuestion.module.css';
import { Sparkles, Send, Bold, Italic, Code, Link as LinkIcon, Check } from 'lucide-react';

export default function PostQuestion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.title || formData.title.trim().length < 5 || formData.title.trim().length > 255) {
      errors.title = 'Question title must be at least 5 characters';
    }
    if (!formData.content || formData.content.trim().length < 10) {
      errors.content = 'Question content must be at least 10 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: null });
    }
    setError(null);
  };

  const handleCoachDraft = async () => {
    if (!formData.title || !formData.content) {
      validate();
      return;
    }
    setIsCoaching(true);
    setCoachFeedback(null);
    setError(null);
    try {
      const response = await questionService.generateQuestionDraftCoach(formData);
      setCoachFeedback(response.tips || response.feedback || []);
    } catch (err) {
      setError(err.message || 'Failed to get AI feedback. Please try again.');
    } finally {
      setIsCoaching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await questionService.createQuestion(formData);
      setSuccessData(response.data || response);
    } catch (err) {
      setError('Failed to post question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (successData) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <span className={styles.headerLabel}>ASK THE COHORT</span>
          <h1 className={styles.title}>Publish to the forum</h1>
          <p className={styles.subtitle}>
            Public threads help the whole cohort. Write as if a classmate will debug your issue tomorrow. They only know what you put on the page.
          </p>
        </div>

        <div className={styles.formCard}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className={styles.successTitle}>Thread published</h2>
            <p className={styles.successText}>
              Your post is indexed for keyword search and embedding-based similarity. Share the link in study groups, or stay on the thread to answer follow-up questions from peers.
            </p>
            <div className={styles.successActions}>
              <Link to="/dashboard" className={styles.dashboardLink}>Back to Dashboard</Link>
              {successData.questionHash || successData.id ? (
                <Link to={`/questions/${successData.questionHash || successData.id}`} className={styles.viewQuestionBtn}>
                  View Question
                </Link>
              ) : (
                <button className={styles.viewQuestionBtn} onClick={() => navigate('/dashboard')}>
                  View Question
                </button>
              )}
              <button className={styles.askAnotherBtn} onClick={() => {
                setSuccessData(null);
                setFormData({ title: '', content: '' });
              }}>
                Ask Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>ASK THE COHORT</span>
        <h1 className={styles.title}>Publish to the forum</h1>
        <p className={styles.subtitle}>
          Public threads help the whole cohort. Write as if a classmate will debug your issue tomorrow. They only know what you put on the page.
        </p>
      </div>

      <div className={styles.infoBanner}>
        <h3>Write questions people can answer in one pass</h3>
        <p>Mentors volunteer their time. Give them runnable context, expected vs actual behavior, and a tight scope so they can reproduce the issue without guessing your setup.</p>
        
        <h4 className={styles.infoSectionTitle}>Checklist before you post</h4>
        <ul className={styles.infoList}>
          <li><strong>Title as a headline</strong> that states the symptom and tech stack (e.g., "React 19: state resets after navigation").</li>
          <li><strong>Repro steps</strong> numbered, with environment (OS, browser, Node version) when it matters.</li>
          <li><strong>Minimal code</strong> in fenced markdown blocks; trim unrelated lines so readers scan faster.</li>
          <li><strong>Exact errors</strong> copied verbatim, including stack trace snippets when debugging backend routes.</li>
        </ul>

        <h4 className={styles.infoSectionTitle}>Validation rules (enforced by the form)</h4>
        <ul className={styles.infoList}>
          <li><strong>Title length:</strong> Must be between 5 and 255 characters.</li>
          <li><strong>Body length:</strong> Must contain a minimum of 10 characters detailing your problem.</li>
          <li><strong>Single topic:</strong> Split unrelated bugs into separate threads so search and embeddings stay precise.</li>
        </ul>
      </div>

      <div className={styles.formCard}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Title</label>
            <span className={styles.sublabel}>Be specific and imagine you're asking a question to another person.</span>
            <input
              type="text"
              id="title"
              name="title"
              className={`${styles.input} ${validationErrors.title ? styles.inputError : ''}`}
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {validationErrors.title && (
              <span className={styles.errorText}>{validationErrors.title}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>What are the details of your problem?</label>
            <span className={styles.sublabel}>Introduce the problem and expand on what you put in the title. Minimum 10 characters.</span>
            <div className={`${styles.textareaContainer} ${validationErrors.content ? styles.textareaContainerError : ''}`}>
              <div className={styles.toolbar}>
                <div className={styles.toolbarActions}>
                  <button type="button" className={styles.toolbarBtn}><Bold size={16} /></button>
                  <button type="button" className={styles.toolbarBtn}><Italic size={16} /></button>
                  <button type="button" className={styles.toolbarBtn}><Code size={16} /></button>
                  <button type="button" className={styles.toolbarBtn}><LinkIcon size={16} /></button>
                </div>
                <span className={styles.charCount}>{formData.content.length} characters</span>
              </div>
              <div className={styles.textareaWrapper}>
                <textarea
                  id="content"
                  name="content"
                  placeholder="Include all the information someone would need to answer your question... You can use Markdown to format your code!"
                  className={styles.textarea}
                  value={formData.content}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {validationErrors.content && (
              <span className={styles.errorText}>{validationErrors.content}</span>
            )}
          </div>

          <div className={styles.aiSection}>
            <button
              type="button"
              className={styles.aiBtn}
              onClick={handleCoachDraft}
              disabled={isCoaching || isSubmitting}
            >
              <Sparkles size={16} />
              AI suggestions
            </button>
            <span className={styles.aiDisclaimer}>Suggestions only. You still choose what to post.</span>
          </div>

          {coachFeedback && (
            <div className={styles.aiFeedbackPanel}>
              <div className={styles.aiFeedbackTitle}>
                <Sparkles size={16} /> AI Draft Coach Feedback
              </div>
              <ul className={styles.aiFeedbackList}>
                {Array.isArray(coachFeedback) ? (
                  coachFeedback.map((tip, idx) => <li key={idx}>{tip}</li>)
                ) : (
                  <li>{coachFeedback}</li>
                )}
              </ul>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Question'}
              {!isSubmitting && <Send size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
