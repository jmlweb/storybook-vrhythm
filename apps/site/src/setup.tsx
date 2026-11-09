import { CopyButton } from './copy-button';
import { INSTALL_COMMAND, Links } from './links';

// The snippets mirror the package README. Update both together.
const AUDIT_SNIPPET = `const preview = {
  parameters: {
    vrhythm: { lineHeight: '8px', audit: 'error' },
  },
};

export default preview;`;

const FAILURE_SNIPPET = `Expected elements on the 8px grid starting at y=0px, found 1 off-grid:
  button.storybook-button bottom: 36px, nearest 40px (delta -4px)
Fix from the top: move button.storybook-button bottom by 4px, then rerun.`;

const STEPS = [
  {
    title: 'Add it to Storybook',
    text: 'One command installs and registers the addon. The grid shows on every story, with a toolbar toggle.',
    file: 'terminal',
    code: INSTALL_COMMAND,
    canCopy: true,
  },
  {
    title: 'Turn on the audit',
    text: 'One parameter audits every story after it renders. No play functions to write.',
    file: '.storybook/preview.ts',
    code: AUDIT_SNIPPET,
    canCopy: true,
  },
  {
    title: 'Let the failure do the talking',
    text: 'An off-grid story now fails its test, and the message tells the agent what to move.',
    file: 'test output',
    code: FAILURE_SNIPPET,
    canCopy: false,
  },
] as const;

export const Setup = () => (
  <section className="section" id="setup">
    <div className="section__head">
      <p className="kicker">Setup</p>
      <h2 className="section__title">On the grid in three steps</h2>
    </div>

    <ol className="steps">
      {STEPS.map(({ title, text, file, code, canCopy }, index) => (
        <li key={title} className="step">
          <div className="step__intro">
            <span className="step__number" aria-hidden="true">
              {index + 1}
            </span>
            <h3 className="step__title">{title}</h3>
            <p className="step__text">{text}</p>
          </div>
          <div className="snippet">
            <div className="snippet__bar">
              <span className="snippet__file">{file}</span>
              {canCopy && <CopyButton text={code} />}
            </div>
            <pre className="snippet__code">
              <code>{code}</code>
            </pre>
          </div>
        </li>
      ))}
    </ol>

    <div className="cta-band">
      <h2 className="cta-band__title">See every option in a real Storybook</h2>
      <div className="hero__actions">
        <a className="button button--primary" href={Links.STORYBOOK}>
          Open the Storybook
        </a>
        <a className="button button--ghost" href={Links.REFERENCE}>
          Read the reference
        </a>
      </div>
    </div>
  </section>
);
