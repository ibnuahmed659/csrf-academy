import type { Tutorial } from './types'
import { foundationsTutorials } from './series/foundations'
import { attackTutorials } from './series/attacks'
import { defenseTutorials } from './series/defenses'
import { bypassTutorials } from './series/bypass'
import { realWorldTutorials } from './series/realworld'

/*
 * A shared cast for the animated flow diagrams.
 * Positions are normalised (0–100) so they scale to any stage size.
 */
const ATTACKER = { id: 'attacker', label: 'Attacker site', sub: 'evil.example', x: 15, y: 22, tone: 'attacker' as const }
const VICTIM = { id: 'victim', label: 'Victim', sub: 'signed in', x: 15, y: 80, tone: 'victim' as const }
const BROWSER = { id: 'browser', label: "Victim's browser", sub: 'trusts cookies', x: 50, y: 51, tone: 'browser' as const }
const TARGET = { id: 'target', label: 'Target site', sub: 'vault.example', x: 85, y: 51, tone: 'target' as const }

export const TUTORIALS: Tutorial[] = [
  {
    id: 'what-is-csrf',
    title: 'What CSRF actually is',
    subtitle: 'A forged request, sent by the victim’s own browser.',
    category: 'Foundations',
    level: 'beginner',
    accent: 'ember',
    summary:
      'In six animated minutes, see why the browser’s automatic trust in cookies is the whole game.',
    keyPoints: [
      'CSRF abuses the browser’s automatic cookie attachment.',
      'The attacker never reads the response — they only cause a side effect.',
      'The victim never clicks the malicious request directly.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'Cold open',
        duration: 6,
        caption: 'Cross-Site Request Forgery makes a victim’s browser send a request the victim never intended.',
        visual: {
          kind: 'title',
          badge: 'Tutorial 01',
          title: 'Cross-Site Request Forgery',
          subtitle: 'Forge the request. Break the trust.',
        },
      },
      {
        id: 's2',
        title: 'The core idea',
        duration: 9,
        caption: 'A website trusts requests that carry a valid session cookie — no matter who or what caused them.',
        visual: {
          kind: 'bullets',
          heading: 'The problem in one line',
          items: [
            'Cookies are attached automatically by the browser.',
            'The server can’t tell a real click from a forged request.',
            'So an attacker just needs the victim to load their page.',
          ],
        },
      },
      {
        id: 's3',
        title: 'The cast',
        duration: 10,
        caption: 'Four actors: the victim, their browser, the attacker’s page, and the target site.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'victim', to: 'browser', label: 'opens a page', at: 0.05, tone: 'request' },
            { from: 'browser', to: 'attacker', label: 'loads attacker page', at: 0.3, tone: 'forged' },
          ],
          note: 'The browser is the confused deputy: it obeys both sites at once.',
        },
      },
      {
        id: 's4',
        title: 'The forged request',
        duration: 12,
        caption: 'The attacker’s page silently triggers a request to the target. The browser adds the session cookie automatically.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'hidden form / img', at: 0.1, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'POST /account/email', at: 0.45, tone: 'request' },
            { from: 'browser', to: 'target', label: '+ session cookie', at: 0.62, tone: 'cookie' },
          ],
          note: 'SameSite=None → the cookie rides along cross-site.',
        },
      },
      {
        id: 's5',
        title: 'The payload',
        duration: 9,
        caption: 'The entire attack can be a hidden form the attacker auto-submits when the page loads.',
        visual: {
          kind: 'code',
          title: 'attacker.html',
          lang: 'html',
          code: '<form action="https://vault.example/account/email"\n      method="POST">\n  <input type="hidden" name="email"\n         value="attacker@evil.example">\n</form>\n<script>document.forms[0].submit()</script>',
        },
      },
      {
        id: 's6',
        title: 'Impact',
        duration: 7,
        caption: 'The victim’s account changes — they never typed a thing.',
        visual: {
          kind: 'impact',
          heading: 'Account email changed',
          before: 'amina@vault.example',
          after: 'attacker@evil.example',
          note: 'From there: password reset goes to the attacker.',
        },
      },
      {
        id: 's7',
        title: 'Recap',
        duration: 8,
        caption: 'No token, no origin check → the request is indistinguishable from a legitimate one.',
        visual: {
          kind: 'bullets',
          heading: 'Remember',
          items: [
            'CSRF causes a side effect — it doesn’t need to read data.',
            'Automatic cookies are the lever.',
            'The fix is to prove the request came from your own site.',
          ],
        },
      },
    ],
  },
  {
    id: 'samesite-story',
    title: 'The SameSite story',
    subtitle: 'How one cookie attribute quietly defuses most CSRF.',
    category: 'SameSite',
    level: 'beginner',
    accent: 'steel',
    summary:
      'Walk through Strict, Lax and None with an animated cross-site POST to see exactly when the cookie travels.',
    keyPoints: [
      'SameSite=Strict: never cross-site.',
      'SameSite=Lax: only top-level GET navigations.',
      'SameSite=None: always (and requires Secure).',
    ],
    scenes: [
      {
        id: 's1',
        title: 'Cold open',
        duration: 5,
        caption: 'SameSite decides whether your cookie crosses site boundaries.',
        visual: { kind: 'title', badge: 'Tutorial 02', title: 'The SameSite story', subtitle: 'One attribute, three behaviours.' },
      },
      {
        id: 's2',
        title: 'What counts as cross-site',
        duration: 9,
        caption: 'Any request from a different registrable domain is cross-site — including subresources and form posts.',
        visual: {
          kind: 'bullets',
          heading: 'Cross-site means…',
          items: [
            'Another registrable domain (evil.example vs vault.example).',
            'A form post, an image, an iframe, or a fetch.',
            'The browser decides, using the cookie’s SameSite value.',
          ],
        },
      },
      {
        id: 's3',
        title: 'None',
        duration: 10,
        caption: 'SameSite=None: the browser attaches the cookie to a cross-site POST. Wide open.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'form POST', at: 0.1, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'cookie SENT', at: 0.5, tone: 'cookie' },
          ],
        },
      },
      {
        id: 's4',
        title: 'Lax',
        duration: 12,
        caption: 'SameSite=Lax: a cross-site POST is blocked, but a top-level GET navigation still carries the cookie.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'form POST', at: 0.1, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'cookie withheld', at: 0.5, tone: 'blocked' },
            { from: 'victim', to: 'browser', label: 'clicks a link (GET)', at: 0.68, tone: 'request' },
            { from: 'browser', to: 'target', label: 'cookie SENT', at: 0.84, tone: 'cookie' },
          ],
        },
      },
      {
        id: 's5',
        title: 'Strict',
        duration: 8,
        caption: 'SameSite=Strict: no cross-site request is ever authenticated.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'form POST', at: 0.15, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'cookie withheld', at: 0.55, tone: 'blocked' },
          ],
          note: 'Powerful — but Strict can break normal navigation flows.',
        },
      },
      {
        id: 's6',
        title: 'Recap',
        duration: 8,
        caption: 'Lax is the modern default, but it still lets GET navigations through — never change state on GET.',
        visual: {
          kind: 'bullets',
          heading: 'Rules of thumb',
          items: [
            'Set Secure + HttpOnly + SameSite=Lax on session cookies.',
            'Never let GET change state.',
            'Pair SameSite with a token for state-changing routes.',
          ],
        },
      },
    ],
  },
  {
    id: 'tokens-that-work',
    title: 'Tokens that work',
    subtitle: 'Synchronizer tokens, double-submit, and the ways they break.',
    category: 'Tokens',
    level: 'intermediate',
    accent: 'danger',
    summary:
      'Not all anti-CSRF tokens are equal. See a session-bound token defeat an attack, then watch three weak variants fall.',
    keyPoints: [
      'The token must be bound to the session and unpredictable.',
      'Never put tokens in URLs — they leak via Referer and logs.',
      'Double-submit only works when the cookie can’t be planted by the attacker.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'Cold open',
        duration: 5,
        caption: 'A good token makes the forged request unauthenticated.',
        visual: { kind: 'title', badge: 'Tutorial 03', title: 'Tokens that work', subtitle: '…and the ones that only look like they do.' },
      },
      {
        id: 's2',
        title: 'Synchronizer token',
        duration: 11,
        caption: 'The server mints a random token into the victim’s session and expects it back exactly.',
        visual: {
          kind: 'flow',
          nodes: [VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'target', to: 'browser', label: 'token tk_9f31…', at: 0.1, tone: 'good' },
            { from: 'browser', to: 'target', label: 'action + tk_9f31…', at: 0.5, tone: 'good' },
          ],
          note: 'The attacker cannot read the token, so they cannot echo it.',
        },
      },
      {
        id: 's3',
        title: 'Attack fails',
        duration: 9,
        caption: 'A forged request carries no token — or the wrong one — and the server rejects it outright.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'forged POST', at: 0.1, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'no valid token', at: 0.55, tone: 'blocked' },
          ],
        },
      },
      {
        id: 's4',
        title: 'Weak #1 — unbound',
        duration: 10,
        caption: 'If the server accepts any valid token from a shared pool, the attacker brings their own.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'own valid token', at: 0.12, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'token accepted!', at: 0.58, tone: 'forged' },
          ],
          note: 'Tokens must be tied to the session, not to the site.',
        },
      },
      {
        id: 's5',
        title: 'Weak #2 — leaked',
        duration: 10,
        caption: 'A token in the URL leaks through Referer, history and logs — and the defense collapses.',
        visual: {
          kind: 'code',
          title: 'leaky URL',
          lang: 'text',
          code: 'https://docuhub.example/me?csrf_token=tk_5b28d1f09c\n\n→ Referer header to any third party\n→ Browser history\n→ Server access logs',
        },
      },
      {
        id: 's6',
        title: 'Weak #3 — double-submit',
        duration: 11,
        caption: 'Double-submit compares a cookie to a body value. If the cookie value is fixed or plantable, it fails.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'plant cookie + body', at: 0.12, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'pair matches → accepted', at: 0.6, tone: 'forged' },
          ],
        },
      },
      {
        id: 's7',
        title: 'Recap',
        duration: 8,
        caption: 'Random per-session secrets, out of URLs, bound to the session — that’s the recipe.',
        visual: {
          kind: 'bullets',
          heading: 'A token is only as strong as',
          items: [
            'Randomness (unguessable).',
            'Binding (tied to this user’s session).',
            'Secrecy (never in URLs, never in logs).',
          ],
        },
      },
    ],
  },
  {
    id: 'anatomy-forged-request',
    title: 'Anatomy of a forged request',
    subtitle: 'Follow one request, hop by hop, from lured click to changed state.',
    category: 'Foundations',
    level: 'intermediate',
    accent: 'ember',
    summary:
      'A frame-by-frame trace of a real CSRF: the attacker page, the auto-submit, the cookie, the server’s blind trust.',
    keyPoints: [
      'The victim only has to load (or click) the attacker’s page.',
      'The request looks identical to a legitimate one.',
      'Defenses inspect the request’s provenance, not its appearance.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'Cold open',
        duration: 5,
        caption: 'One request. Five hops. Zero user intent.',
        visual: { kind: 'title', badge: 'Tutorial 04', title: 'Anatomy of a forged request', subtitle: 'A frame-by-frame trace.' },
      },
      {
        id: 's2',
        title: 'Hop 1 — the lure',
        duration: 8,
        caption: 'The victim opens the attacker’s page — anything from a forum post to a malvertising redirect.',
        visual: {
          kind: 'browser',
          url: 'https://evil.example/win-a-prize',
          title: 'Congratulations, you won!',
          lines: [
            { type: 'text', value: 'Claim your prize now…' },
            { type: 'note', value: '<!-- the page hides a form -->' },
          ],
        },
      },
      {
        id: 's3',
        title: 'Hop 2 — the auto-submit',
        duration: 10,
        caption: 'A hidden form submits itself the moment the page parses. No click required.',
        visual: {
          kind: 'browser',
          url: 'https://evil.example/win-a-prize',
          title: 'Rendering…',
          lines: [
            { type: 'hidden', label: 'email', value: 'attacker@evil.example' },
            { type: 'button', label: 'Submitting…', danger: true },
            { type: 'flash', value: 'Request fired to vault.example' },
          ],
        },
      },
      {
        id: 's4',
        title: 'Hop 3 — the cookie',
        duration: 10,
        caption: 'The browser attaches the vault.example session cookie — it doesn’t know this request was forged.',
        visual: {
          kind: 'flow',
          nodes: [BROWSER, TARGET],
          packets: [
            { from: 'browser', to: 'target', label: 'POST /account/email', at: 0.12, tone: 'request' },
            { from: 'browser', to: 'target', label: 'Cookie: session=…', at: 0.42, tone: 'cookie' },
          ],
          note: 'SameSite=None is what makes this possible.',
        },
      },
      {
        id: 's5',
        title: 'Hop 4 — blind trust',
        duration: 9,
        caption: 'The server sees a valid session and performs the action. It never asks “did the user mean this?”',
        visual: {
          kind: 'bullets',
          heading: 'What the server checks',
          items: [
            'Is there a valid session cookie? ✅',
            'Did the user intend this? ❓ — never asked',
          ],
        },
      },
      {
        id: 's6',
        title: 'Hop 5 — impact',
        duration: 7,
        caption: 'State changes. The attacker is now in control of a recovery channel.',
        visual: {
          kind: 'impact',
          heading: 'Email changed',
          before: 'marco@onestore.example',
          after: 'attacker@evil.example',
          note: 'Next: password reset lands in the attacker’s inbox.',
        },
      },
    ],
  },
  {
    id: 'defending-an-api',
    title: 'Defending an API',
    subtitle: 'Origin checks, required headers, and defense in depth.',
    category: 'Defense',
    level: 'advanced',
    accent: 'steel',
    summary:
      'Layer the modern defenses: validate Origin, require a custom header, bind a token, and set SameSite correctly.',
    keyPoints: [
      'Origin/Referer can’t be forged by a web page.',
      'A required custom header forces a CORS preflight.',
      'Layer SameSite + token + Origin for defense in depth.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'Cold open',
        duration: 5,
        caption: 'Strong defense isn’t one control — it’s several that cover each other.',
        visual: { kind: 'title', badge: 'Tutorial 05', title: 'Defending an API', subtitle: 'Origin, headers, tokens, SameSite.' },
      },
      {
        id: 's2',
        title: 'Control 1 — Origin',
        duration: 10,
        caption: 'The browser sets Origin for the real request. An attacker page can only advertise its own origin.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'forged POST', at: 0.12, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'Origin: evil.example', at: 0.55, tone: 'blocked' },
          ],
          note: 'Server: expected Origin mismatch → reject.',
        },
      },
      {
        id: 's3',
        title: 'Control 2 — custom header',
        duration: 10,
        caption: 'Require X-Requested-With. A cross-site HTML request can’t set it, and fetch triggers a preflight the server denies.',
        visual: {
          kind: 'code',
          title: 'server expectation',
          lang: 'http',
          code: 'POST /api/keys/revoke HTTP/1.1\nOrigin: https://clouddesk.example\nX-Requested-With: XMLHttpRequest   ← required\nCookie: session=…',
        },
      },
      {
        id: 's4',
        title: 'Control 3 — session token',
        duration: 9,
        caption: 'A random token, stored in the session and echoed in a header or hidden field, defeats the forgery outright.',
        visual: {
          kind: 'bullets',
          heading: 'Token hygiene',
          items: [
            'Random per session — never a constant.',
            'Delivered in a header or hidden field, not the URL.',
            'Compared against the session’s stored value.',
          ],
        },
      },
      {
        id: 's5',
        title: 'Control 4 — SameSite',
        duration: 9,
        caption: 'Mark session cookies Secure + HttpOnly + SameSite=Lax as a cheap, browser-enforced baseline.',
        visual: {
          kind: 'code',
          title: 'Set-Cookie',
          lang: 'http',
          code: 'Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax; Path=/',
        },
      },
      {
        id: 's6',
        title: 'Defense in depth',
        duration: 9,
        caption: 'Any one control can have a gap. Together they make the forged request fail at multiple layers.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'forged POST', at: 0.12, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'blocked ×4', at: 0.5, tone: 'blocked' },
          ],
          note: 'SameSite + token + Origin + header requirement.',
        },
      },
      {
        id: 's7',
        title: 'Recap',
        duration: 7,
        caption: 'You now have the full picture: how the forgery works, and how to make it impossible.',
        visual: {
          kind: 'bullets',
          heading: 'Your checklist',
          items: [
            'Reads on GET, writes on POST.',
            'Session-bound CSRF token on every write.',
            'Validate Origin/Referer.',
            'Secure + HttpOnly + SameSite cookies.',
          ],
        },
      },
    ],
  },
  ...foundationsTutorials,
  ...attackTutorials,
  ...defenseTutorials,
  ...bypassTutorials,
  ...realWorldTutorials,
]

export const TUTORIAL_BY_ID = Object.fromEntries(TUTORIALS.map((t) => [t.id, t]))
