import { CopyButton } from './copy-button';
import { INSTALL_COMMAND, Links } from './links';

export const Hero = () => (
  <header className="hero">
    <div className="hero__grid" aria-hidden="true" />
    <nav className="nav" aria-label="Main">
      <a className="nav__brand" href="./">
        <span className="nav__mark" aria-hidden="true" />
        storybook-vrhythm
      </a>
      <div className="nav__links">
        <a className="nav__link nav__link--optional" href="#playground">
          Playground
        </a>
        <a className="nav__link nav__link--optional" href="#setup">
          Setup
        </a>
        <a className="nav__link" href={Links.STORYBOOK}>
          Storybook
        </a>
        <a className="nav__link" href={Links.REPO}>
          GitHub
        </a>
      </div>
    </nav>

    <div className="hero__content">
      <p className="pill">Storybook 10 and 11 · zero dependencies</p>
      <h1 className="hero__title">
        Keep every story <span className="gradient-text">on the beat</span>
      </h1>
      <p className="hero__pitch">
        A baseline grid for Storybook that coding agents can run: a measured
        audit with exact pixel deltas, plus a visual overlay.
      </p>

      <div className="install">
        <code className="install__command">
          <span className="install__prompt" aria-hidden="true">
            $
          </span>
          {INSTALL_COMMAND}
        </code>
        <CopyButton text={INSTALL_COMMAND} />
      </div>

      <div className="hero__actions">
        <a className="button button--primary" href="#playground">
          Try the playground
        </a>
        <a className="button button--ghost" href={Links.STORYBOOK}>
          Open the Storybook
        </a>
      </div>
    </div>
  </header>
);
