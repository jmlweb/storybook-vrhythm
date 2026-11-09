import { useEffect, useState } from 'react';

const FEEDBACK_MS = 1600;

export const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }
    const timer = setTimeout(() => setIsCopied(false), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      // Clipboard access can be denied; the text stays selectable by hand.
    }
  };

  return (
    <button type="button" className="copy-button" onClick={copy}>
      <span aria-live="polite">{isCopied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};
