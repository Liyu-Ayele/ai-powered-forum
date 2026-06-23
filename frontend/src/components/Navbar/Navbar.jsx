import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Search, Sparkles, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

/* Placeholders adapt per mode */
const PLACEHOLDERS = {
  keyword:  'Search questions by keyword…',
  semantic: 'Ask anything — e.g. "async errors in React"',
};

export default function Navbar({ title, onMenuToggle }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const inputRef  = useRef(null);

  const urlParams = new URLSearchParams(location.search);
  const [query,     setQuery]    = useState(urlParams.get('q')    || '');
  const [mode,      setMode]     = useState(urlParams.get('mode') || 'keyword');
  const [isFocused, setIsFocused] = useState(false);

  /* ── push search to URL — only on explicit submit / clear ── */
  const pushSearch = useCallback((q, m) => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    p.set('mode', m);
    navigate(`/dashboard?${p.toString()}`, { replace: location.pathname === '/dashboard' });
  }, [navigate, location.pathname]);

  const handleChange = e => setQuery(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();
    if (query.trim()) pushSearch(query, mode);
  };

  const handleClear = () => {
    setQuery('');
    navigate('/dashboard');
    inputRef.current?.focus();
  };

  const handleModeChange = newMode => {
    setMode(newMode);
    inputRef.current?.focus();
  };

  /* ── Ctrl/Cmd+K ── */
  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape' && isFocused) inputRef.current?.blur();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFocused]);

  /* ── sync bar when URL changes externally ── */
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setQuery(p.get('q')    || '');
    setMode(p.get('mode')  || 'keyword');
  }, [location.search]);

  const isSemantic = mode === 'semantic';

  return (
    <header className={styles.navbar}>

      {/* Hamburger — visible ≤768px, order stays first naturally */}
      <button className={styles.menuToggle} onClick={onMenuToggle} aria-label='Open menu'>
        <Menu size={20} />
      </button>

      {/* Title — hidden ≤768px */}
      <div className={styles.navbar__titleBlock}>
        <h2 className={styles.navbar__pageTitle}>{title}</h2>
      </div>

      {/* Search wrapper — drops to its own row on ≤540px */}
      <div className={styles.navbar__searchWrapper} role='search' aria-label='Forum search'>

        <form onSubmit={handleSubmit} className={styles.navbar__searchForm}>

          {/* Bar container owns the focus ring */}
          <div className={[
            styles.navbar__searchBar,
            isFocused  ? styles['navbar__searchBar--focused']  : '',
            isSemantic ? styles['navbar__searchBar--semantic'] : '',
          ].filter(Boolean).join(' ')}>

            <span className={styles.navbar__searchLeadIcon} aria-hidden>
              {isSemantic
                ? <Sparkles size={15} className={styles.navbar__sparkle} />
                : <Search   size={15} className={styles.navbar__searchIcon} />
              }
            </span>

            {/* navbarSearchInput plain class neutralises the global !important focus rule */}
            <input
              ref={inputRef}
              type='text'
              className={`${styles.navbar__searchInput} navbarSearchInput`}
              placeholder={PLACEHOLDERS[mode]}
              value={query}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label='Search questions'
              autoComplete='off'
              spellCheck={false}
            />

            {query && (
              <button
                type='button'
                className={styles.navbar__clearBtn}
                onClick={handleClear}
                aria-label='Clear search'
              >
                <X size={13} />
              </button>
            )}

          
          </div>

          {/* Submit button */}
          <button
            type='submit'
            className={`${styles.navbar__searchSubmit} ${isSemantic ? styles['navbar__searchSubmit--ai'] : ''}`}
            aria-label={isSemantic ? 'AI semantic search' : 'Search'}
          >
            {isSemantic ? <Sparkles size={14} /> : <Search size={14} />}
            {/* submitLabel hidden on xs via CSS */}
            <span className={styles.navbar__submitLabel}>Search</span>
          </button>
        </form>

        {/* Mode segmented control */}
        <div className={styles.navbar__modeRow} role='radiogroup' aria-label='Search mode'>
          <div className={styles.navbar__segmented}>
            <button
              type='button'
              role='radio'
              aria-checked={mode === 'keyword'}
              className={`${styles.navbar__modeBtn} ${mode === 'keyword' ? styles['navbar__modeBtn--active'] : ''}`}
              onClick={() => handleModeChange('keyword')}
            >
              {/* span lets CSS hide just the text on xs without hiding the whole button */}
              <span className={styles.navbar__modeLabelKeyword}>Keyword</span>
              <span className={styles.navbar__modeLabelKeywordFull}> Search</span>
            </button>
            <button
              type='button'
              role='radio'
              aria-checked={mode === 'semantic'}
              className={`${styles.navbar__modeBtn} ${mode === 'semantic' ? styles['navbar__modeBtn--active'] : ''}`}
              onClick={() => handleModeChange('semantic')}
            >
              <Sparkles size={11} aria-hidden />
              <span>AI Semantic</span>
            </button>
          </div>

          {isSemantic && (
            <span className={styles.navbar__semanticBadge} aria-live='polite'>
              powered by Gemini
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
