import xss from 'xss';

// Sanitize user input to prevent XSS attacks
export const sanitizeInput = (req, res, next) => {
  // Sanitize body fields
  if (req.body) {
    if (req.body.title) req.body.title = xss(req.body.title);
    if (req.body.content) req.body.content = xss(req.body.content);
    if (req.body.answerText) req.body.answerText = xss(req.body.answerText);
  }
  next();
};