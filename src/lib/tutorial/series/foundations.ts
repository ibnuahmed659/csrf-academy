import type { Tutorial } from '../types'
import { ATTACKER, BROWSER, TARGET, VICTIM } from '../cast'

export const foundationsTutorials: Tutorial[] = [
  {
    id: 'browser-loves-cookies',
    title: 'Why your browser sends cookies for you',
    subtitle: 'The automatic attachment that makes CSRF possible.',
    category: 'Foundations',
    level: 'beginner',
    summary:
      'Before tokens or SameSite make sense, you have to see the one behaviour behind every CSRF bug: the browser lightly attaches your cookies to requests — without being asked.',
    keyPoints: [
      'Cookies are attached by the browser, not by the page.',
      'The server identifies you by the cookie alone.',
      'Any site can cause the request; only your browser decides to attach the cookie.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'It starts with trust',
        duration: 9,
        caption: 'Every time you visit a site you are signed into, your browser quietly proves who you are. It does this with a cookie.',
        visual: {
          kind: 'title',
          badge: 'Foundations',
          title: 'Why your browser sends cookies for you',
          subtitle: 'The automatic attachment behind CSRF.',
        },
      },
      {
        id: 's2',
        title: 'What a cookie is',
        duration: 11,
        caption: 'A cookie is a small piece of text the site stored in your browser earlier. One of them usually holds your session.',
        visual: {
          kind: 'bullets',
          heading: 'A cookie is just text',
          items: [
            'The server sets it once, with Set-Cookie.',
            'The browser stores it for that site.',
            'It usually identifies your logged-in session.',
          ],
        },
      },
      {
        id: 's3',
        title: 'The browser attaches it',
        duration: 13,
        caption: 'When a request goes to that site, your browser adds the cookie automatically. You never see it, and the page never has to ask.',
        visual: {
          kind: 'flow',
          nodes: [VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'victim', to: 'browser', label: 'opens vault.example', at: 0.05, tone: 'request' },
            { from: 'browser', to: 'target', label: 'GET /account', at: 0.4, tone: 'request' },
            { from: 'browser', to: 'target', label: '+ session cookie', at: 0.62, tone: 'cookie' },
          ],
          note: 'The cookie rides along automatically — this is the whole lever.',
        },
      },
      {
        id: 's4',
        title: 'What the server sees',
        duration: 11,
        caption: 'On the wire, the request simply carries a Cookie header. To the server, that is proof you are signed in.',
        visual: {
          kind: 'code',
          lang: 'http',
          title: 'The request the server sees',
          code: 'GET /account HTTP/1.1\nHost: vault.example\nCookie: session=8f3a9c2e7b41\n\n=> "Welcome back, Amina"',
        },
      },
      {
        id: 's4b',
        title: 'The automated weather app',
        duration: 10,
        caption: 'Imagine a popular bookmarking site that always attaches your cookies to its own requests. The browser does the same, silently.',
        visual: {
          kind: 'browser',
          url: 'https://vault.example/account',
          title: 'Signed in as amina',
          lines: [
            { type: 'text', value: 'Welcome back, amina' },
            { type: 'field', label: 'Email', value: 'amina@vault.example' },
            { type: 'note', value: 'session cookie sent automatically' },
          ],
        },
      },
      {
        id: 's4b2',
        title: 'One rule, everywhere',
        duration: 10,
        caption: 'That automatic behaviour applies to every request to that site — including requests another website caused.',
        visual: {
          kind: 'bullets',
          heading: 'The browser does not ask why',
          items: [
            'It attaches cookies based on the destination.',
            'It does not check who triggered the request.',
            'That is exactly what an attacker exploits.',
          ],
        },
      },
      {
        id: 's5',
        title: 'Another site can trigger it',
        duration: 13,
        caption: 'Now imagine an attacker page causes your browser to request vault.example. The cookie still rides along, because the browser only looks at the destination.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'browser', to: 'attacker', label: 'loads evil.example', at: 0.08, tone: 'forged' },
            { from: 'attacker', to: 'browser', label: 'hidden request', at: 0.35, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'GET /account + cookie', at: 0.62, tone: 'cookie' },
          ],
          note: 'The victim never touched the target site — yet the cookie was sent.',
        },
      },
      {
        id: 's6',
        title: 'Why this matters',
        duration: 12,
        caption: 'If that request changes something — an email, a password, a payment — the change happens as you. That is Cross-Site Request Forgery.',
        visual: {
          kind: 'impact',
          heading: 'A request you never made',
          before: 'email: amina@vault.example',
          after: 'email: attacker@evil.example',
          note: 'No password, no token — just your cookie.',
        },
      },
      {
        id: 's7',
        title: 'The takeaway',
        duration: 11,
        caption: 'The browser attaches cookies automatically and forgets who asked. Every CSRF defence exists to add back the missing proof of intent.',
        visual: {
          kind: 'bullets',
          heading: 'Remember',
          items: [
            'Cookies are attached by the browser, for the destination.',
            'The server trusts the cookie as proof of you.',
            'The fix is to prove the request came from your own page.',
          ],
        },
      },
    ],
  },
  {
    id: 'confused-deputy',
    title: 'The confused deputy',
    subtitle: 'Why the browser happily helps the attacker.',
    category: 'Foundations',
    level: 'beginner',
    summary:
      'Security people call the browser a “confused deputy”: it holds your authority (your cookies) but cannot tell a good request from a bad one. This is the mental model for all CSRF.',
    keyPoints: [
      'A deputy is something that acts on your behalf.',
      'The browser is confused because it obeys any page, not just yours.',
      'CSRF is not a browser bug — it is a missing check on the server.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'A deputy with your keys',
        duration: 10,
        caption: 'Think of your browser as a deputy that carries your keys — your cookies — and unlocks doors for whoever asks.',
        visual: {
          kind: 'title',
          badge: 'Foundations',
          title: 'The confused deputy',
          subtitle: 'Your browser holds your authority.',
        },
      },
      {
        id: 's2',
        title: 'What a deputy is',
        duration: 11,
        caption: 'A deputy is anything that acts on your behalf. That is useful — until it cannot tell friend from stranger.',
        visual: {
          kind: 'bullets',
          heading: 'A deputy in one line',
          items: [
            'It holds your authority.',
            'It acts when someone asks.',
            'It is “confused” when it cannot tell who should be asking.',
          ],
        },
      },
      {
        id: 's3',
        title: 'Two sites, one deputy',
        duration: 14,
        caption: 'Here is the trap. The attacker page and your bank both talk to the same deputy. The deputy carries your bank key for both.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'victim', to: 'browser', label: 'browsing normally', at: 0.05, tone: 'request' },
            { from: 'browser', to: 'attacker', label: 'visits evil.example', at: 0.3, tone: 'forged' },
            { from: 'attacker', to: 'browser', label: 'asks for a favour', at: 0.5, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'unlocks the bank', at: 0.7, tone: 'cookie' },
          ],
          note: 'The deputy never asks why the bank door needs opening.',
        },
      },
      {
        id: 's4',
        title: 'Confusion, not malice',
        duration: 11,
        caption: 'The deputy is not evil. It simply lacks a way to check intent, so it does exactly what it is told.',
        visual: {
          kind: 'bullets',
          heading: 'Why “confused”',
          items: [
            'It cannot see which page asked.',
            'It only knows the destination.',
            'So it applies your authority anyway.',
          ],
        },
      },
      {
        id: 's5',
        title: 'What the attacker asks for',
        duration: 12,
        caption: 'The favour is a request to the target site — maybe a hidden form that changes your email the moment the page loads.',
        visual: {
          kind: 'code',
          title: 'the favour',
          lang: 'html',
          code: '<form action="https://vault.example/account/email"\n      method="POST">\n  <input type="hidden" name="email"\n         value="attacker@evil.example">\n</form>\n<script>document.forms[0].submit()</script>',
        },
      },
      {
        id: 's6',
        title: 'The door opens',
        duration: 12,
        caption: 'Because the cookie came along, the bank sees a fully authorised request. The email changes, and the deputy is none the wiser.',
        visual: {
          kind: 'impact',
          heading: 'Authorised… by mistake',
          before: 'email: amina@vault.example',
          after: 'email: attacker@evil.example',
          note: 'The server trusted the cookie, not the intent.',
        },
      },
      {
        id: 's7',
        title: 'The real fix',
        duration: 12,
        caption: 'You cannot un-confuse the browser. So the server must demand proof that the request came from its own pages.',
        visual: {
          kind: 'bullets',
          heading: 'Where the fix belongs',
          items: [
            'Not in the browser — it is doing its job.',
            'In the server, by checking a token or the Origin.',
            'Every state-changing action needs that proof.',
          ],
        },
      },
    ],
  },
  {
    id: 'get-vs-post',
    title: 'GET, POST and unsafe reads',
    subtitle: 'Why changing state on GET invites CSRF.',
    category: 'Foundations',
    level: 'beginner',
    summary:
      'A single design rule kills a whole class of CSRF bugs: use GET only to read, and POST to change. Here is exactly why an unsafe GET is so easy to trigger.',
    keyPoints: [
      'GET should be safe: it must not change anything.',
      'An <img> or <link> fires a GET with no click at all.',
      'Changing state on GET turns a harmless tag into an attack.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'Two verbs, two jobs',
        duration: 10,
        caption: 'HTTP gives us verbs. GET is meant to read. POST is meant to change. Mixing them up is where trouble starts.',
        visual: {
          kind: 'title',
          badge: 'Foundations',
          title: 'GET, POST and unsafe reads',
          subtitle: 'The rule that removes a whole class of bugs.',
        },
      },
      {
        id: 's2',
        title: 'Safe vs unsafe',
        duration: 12,
        caption: 'A safe request only reads — it changes nothing. An unsafe request writes. The verb should tell you which one you are doing.',
        visual: {
          kind: 'bullets',
          heading: 'The contract',
          items: [
            'GET and HEAD: safe, read-only.',
            'POST, PUT, PATCH, DELETE: unsafe, they change state.',
            'A GET that writes breaks the contract.',
          ],
        },
      },
      {
        id: 's3',
        title: 'What a GET looks like',
        duration: 10,
        caption: 'A GET puts everything in the URL, which is why images and links can carry one without any JavaScript.',
        visual: {
          kind: 'code',
          title: 'a normal GET',
          lang: 'http',
          code: 'GET /search?q=csrf HTTP/1.1\nHost: shop.example\nCookie: session=abc123',
        },
      },
      {
        id: 's4',
        title: 'What a POST looks like',
        duration: 10,
        caption: 'A POST carries its data in the body, usually from a form. It is the right verb for changing things.',
        visual: {
          kind: 'code',
          title: 'a normal POST',
          lang: 'http',
          code: 'POST /account/email HTTP/1.1\nHost: vault.example\nCookie: session=abc123\n\nemail=amina@vault.example',
        },
      },
      {
        id: 's5',
        title: 'The dangerous GET',
        duration: 13,
        caption: 'Now suppose the site changes your email with a GET: /account/email?value=… An attacker only needs you to load an image with that URL.',
        visual: {
          kind: 'code',
          title: 'attacker page',
          lang: 'html',
          code: '<!-- no click, no script needed -->\n<img src="https://vault.example/account/email\n     ?value=attacker@evil.example">',
        },
      },
      {
        id: 's6',
        title: 'It fires by itself',
        duration: 13,
        caption: 'The moment the page loads, the browser fetches the image. The GET runs, the cookie rides along, and the email changes.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, VICTIM, BROWSER, TARGET],
          packets: [
            { from: 'browser', to: 'attacker', label: 'loads page', at: 0.06, tone: 'forged' },
            { from: 'attacker', to: 'browser', label: '<img src=…>', at: 0.32, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'GET changes email', at: 0.6, tone: 'cookie' },
          ],
          note: 'An image tag is enough. No form, no script.',
        },
      },
      {
        id: 's7',
        title: 'The rule',
        duration: 12,
        caption: 'Keep GET honest: reading only. Every write goes through POST, and then most naive triggers simply stop working.',
        visual: {
          kind: 'bullets',
          heading: 'The rule',
          items: [
            'Read on GET. Write on POST.',
            'Never change state from a URL alone.',
            'Then add a token so POST is safe too.',
          ],
        },
      },
    ],
  },
  {
    id: 'same-origin-plainly',
    title: 'The same-origin policy, plainly',
    subtitle: 'What it blocks — and the huge gap it leaves.',
    category: 'Foundations',
    level: 'beginner',
    summary:
      'People assume the same-origin policy protects them from CSRF. It does not. Here is precisely what it stops, and what it never even tries to stop.',
    keyPoints: [
      'An origin is scheme + host + port.',
      'The policy blocks reading cross-site responses.',
      'It does not block sending cross-site requests — the CSRF gap.',
    ],
    scenes: [
      {
        id: 's1',
        title: 'The guard of the web',
        duration: 10,
        caption: 'The same-origin policy is the rule that keeps one website from reading another website’s data. It is essential — but it has a blind spot.',
        visual: {
          kind: 'title',
          badge: 'Foundations',
          title: 'The same-origin policy',
          subtitle: 'What it stops — and what it does not.',
        },
      },
      {
        id: 's2',
        title: 'What counts as an origin',
        duration: 12,
        caption: 'An origin is three things together: the scheme, the host, and the port. Change any one and it is a different origin.',
        visual: {
          kind: 'bullets',
          heading: 'Origin = scheme + host + port',
          items: [
            'https://vault.example is one origin.',
            'http://vault.example is a different origin.',
            'https://evil.example is different again.',
          ],
        },
      },
      {
        id: 's3',
        title: 'What it blocks',
        duration: 12,
        caption: 'Script running on evil.example cannot read the response from vault.example. That stops a lot of quiet data theft.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, BROWSER, TARGET],
          packets: [
            { from: 'attacker', to: 'browser', label: 'fetch bank data', at: 0.1, tone: 'forged' },
            { from: 'browser', to: 'target', label: 'request sent', at: 0.4, tone: 'request' },
            { from: 'target', to: 'browser', label: 'response', at: 0.6, tone: 'good' },
            { from: 'browser', to: 'attacker', label: 'blocked by SOP', at: 0.8, tone: 'blocked' },
          ],
          note: 'Cross-site reads are refused.',
        },
      },
      {
        id: 's4',
        title: 'What it does not block',
        duration: 13,
        caption: 'But the policy never said the request could not be sent. It only guards the response. That single gap is CSRF.',
        visual: {
          kind: 'bullets',
          heading: 'The blind spot',
          items: [
            'Sending a cross-site request is allowed.',
            'The request still carries your cookies.',
            'Only reading the reply is blocked.',
          ],
        },
      },
      {
        id: 's5',
        title: 'Send yes, read no',
        duration: 13,
        caption: 'An attacker does not need to read anything. If the request changes state, the damage is already done.',
        visual: {
          kind: 'flow',
          nodes: [ATTACKER, BROWSER, TARGET],
          packets: [
            { from: 'browser', to: 'target', label: 'POST /transfer + cookie', at: 0.4, tone: 'cookie' },
            { from: 'target', to: 'browser', label: 'response (unread)', at: 0.7, tone: 'blocked' },
          ],
          note: 'A CSRF attack is often blind — and still devastating.',
        },
      },
      {
        id: 's6',
        title: 'So who checks intent?',
        duration: 12,
        caption: 'With the browser only guarding responses, the server must guard the request. That is the job of CSRF tokens and Origin checks.',
        visual: {
          kind: 'bullets',
          heading: 'The division of labour',
          items: [
            'Browser: stops cross-site reads.',
            'Server: must verify request intent.',
            'Never assume the browser did it for you.',
          ],
        },
      },
      {
        id: 's7',
        title: 'The takeaway',
        duration: 10,
        caption: 'The same-origin policy is a reader-guard, not a sender-guard. CSRF lives entirely in that gap.',
        visual: {
          kind: 'bullets',
          heading: 'Remember',
          items: [
            'SOP blocks reading, not sending.',
            'Cookies ride along with cross-site sends.',
            'Prove intent on the server, every time.',
          ],
        },
      },
    ],
  },
]
