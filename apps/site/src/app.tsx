import { Features } from './features';
import { Hero } from './hero';
import { Links } from './links';
import { Playground } from './playground';
import { Setup } from './setup';

const FOOTER_LINKS = [
  { label: 'GitHub', href: Links.REPO },
  { label: 'npm', href: Links.NPM },
  { label: 'Reference', href: Links.REFERENCE },
  { label: 'llms.txt', href: Links.LLMS_TXT },
  { label: 'Agent Skill', href: Links.SKILL },
] as const;

export const App = () => (
  <>
    <Hero />
    <main>
      <Playground />
      <Features />
      <Setup />
    </main>
    <footer className="footer">
      <p>
        <a href={Links.LICENSE}>MIT licensed</a>. Built by jmlweb.
      </p>
      <ul className="footer__links">
        {FOOTER_LINKS.map(({ label, href }) => (
          <li key={label}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>
    </footer>
  </>
);
