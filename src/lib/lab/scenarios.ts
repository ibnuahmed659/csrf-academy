import type { Defense, LabScenario } from './types'

const weak: Defense = {
  requirePost: false,
  token: 'none',
  sameSite: 'none',
  originCheck: false,
  customHeader: false,
  tokenMethodBound: false,
  methodOverride: false,
  refererCheck: 'off',
  cookieInjection: 'none',
  clientRedirect: false,
  siblingXss: false,
}

const hard: Defense = {
  requirePost: true,
  token: 'bound',
  sameSite: 'strict',
  originCheck: true,
  customHeader: true,
  tokenMethodBound: false,
  methodOverride: false,
  refererCheck: 'exact',
  cookieInjection: 'none',
  clientRedirect: false,
  siblingXss: false,
}

export const LAB_SCENARIOS: LabScenario[] = [
  {
    id: 'classic-post',
    title: 'The classic form forgery',
    stage: 'beginner',
    category: 'Reflected',
    mode: 'exploit',
    summary:
      'Vault Bank lets you change your email with a plain POST and no token. Forge the request while the victim is signed in.',
    takeaway:
      'A state-changing request with no anti-CSRF token can be forged from any site the victim visits.',
    victim: {
      name: 'Amina',
      site: 'vault.example',
      disclosure: 'Signed in to Vault Bank in this browser.',
    },
    action: {
      label: 'Change account email',
      path: '/account/email',
      params: { email: 'attacker@evil.example' },
      before: 'amina@vault.example',
      after: 'attacker@evil.example',
    },
    defense: { ...weak },
    secure: { ...hard },
    objectives: [
      'Forge a request that changes Amina’s email to attacker@evil.example',
      'Watch how the session cookie rides along automatically',
    ],
    hints: [
      'A cross-site POST from a hidden form is the canonical CSRF vector.',
      'Pick “Form → POST” and run the attack.',
    ],
    walkthrough: [
      {
        title: 'Why it works',
        body: 'The endpoint trusts any request that carries a valid session cookie. The browser attaches that cookie automatically to cross-site requests when SameSite=None.',
      },
      {
        title: 'The fix',
        body: 'Require a per-session CSRF token. The attacker cannot read the victim’s token, so the forged request fails.',
      },
    ],
  },
  {
    id: 'samesite-lax',
    title: 'When SameSite=Lax is not enough',
    stage: 'beginner',
    category: 'SameSite',
    mode: 'exploit',
    summary:
      'The cookie is now SameSite=Lax and the endpoint already requires POST — but nothing stops a GET. Find the vector that still works.',
    takeaway:
      'SameSite=Lax blocks cross-site POST, but still attaches cookies to top-level GET navigations. Allowing GET on a state-changing endpoint reopens the hole.',
    victim: {
      name: 'Daniel',
      site: 'keepsafe.example',
      disclosure: 'Signed in to KeepSafe in this browser.',
    },
    action: {
      label: 'Disable two-factor recovery',
      path: '/settings/recovery/disable',
      params: { confirm: '1' },
      before: 'Recovery enabled',
      after: 'Recovery disabled',
    },
    defense: { ...weak, sameSite: 'lax', requirePost: true },
    secure: { ...hard },
    sessionToken: undefined,
    objectives: [
      'Disable recovery on Daniel’s account using a GET-based vector',
      'Notice that the POST form is blocked by SameSite=Lax',
    ],
    hints: [
      'POST won’t carry the cookie under Lax — but a top-level GET navigation will.',
      'Try the “Link / redirect” or “Image (GET)” vector… only the navigation one counts.',
    ],
    walkthrough: [
      {
        title: 'Lax semantics',
        body: 'Lax sends cookies on top-level GET navigations only. An <img> is a background subresource, so it is blocked; a link the victim clicks is a navigation, so it is allowed.',
      },
      {
        title: 'The fix',
        body: 'Never let GET change state. Require POST *and* a session-bound token so neither navigation nor form forgery works.',
      },
    ],
  },
  {
    id: 'get-image',
    title: 'The invisible image',
    stage: 'intermediate',
    category: 'Reflected',
    mode: 'exploit',
    summary:
      'A metrics endpoint accepts settings changes over GET through query parameters. Slip one in with an <img> that fires as the page loads.',
    takeaway:
      'Any state-changing GET can be triggered by a subresource such as an image, stylesheet, or iframe — no click required.',
    victim: {
      name: 'Priya',
      site: 'streamly.example',
      disclosure: 'Signed in to Streamly in this browser.',
    },
    action: {
      label: 'Follow an attacker account',
      path: '/social/follow',
      params: { user: 'evil_actor' },
      before: 'Not following evil_actor',
      after: 'Following evil_actor',
    },
    defense: { ...weak },
    secure: { ...hard },
    objectives: ['Make Priya follow evil_actor without her clicking anything'],
    hints: [
      'An <img> GET fires silently during page load.',
      'Choose “Image (GET)” and run it.',
    ],
    walkthrough: [
      {
        title: 'Silent subresources',
        body: 'Browsers fetch images, iframes, and stylesheets automatically. If those can change state, the attacker needs no interaction at all.',
      },
      {
        title: 'The fix',
        body: 'Keep reads on GET and writes on POST, then protect the writes with a token.',
      },
    ],
  },
  {
    id: 'samesite-strict',
    title: 'Reading a strong defense',
    stage: 'intermediate',
    category: 'SameSite',
    mode: 'assess',
    summary:
      'This target sets SameSite=Strict. Try every vector and explain why none of them can carry the victim’s session.',
    takeaway:
      'SameSite=Strict withholds the cookie from all cross-site requests — a cheap, powerful baseline.',
    victim: {
      name: 'Marco',
      site: 'onestore.example',
      disclosure: 'Signed in to OneStore in this browser.',
    },
    action: {
      label: 'Add attacker address as default',
      path: '/account/address/default',
      params: { id: '9911' },
      before: 'Default: home',
      after: 'Default: attacker drop',
    },
    defense: { ...weak, sameSite: 'strict', requirePost: true },
    secure: { ...weak, sameSite: 'strict', requirePost: true },
    objectives: [
      'Run at least three different vectors and confirm the cookie is never sent',
      'State the defense in one sentence',
    ],
    hints: [
      'With Strict, no cross-site request — GET or POST — is authenticated.',
      'Try the form, the image, and a link. All should be blocked at the browser.',
    ],
    walkthrough: [
      {
        title: 'Why nothing lands',
        body: 'Strict omits the cookie on every cross-site request. The forged request arrives anonymous and the server attributes it to nobody.',
      },
      {
        title: 'Caveat',
        body: 'Strict can break legitimate top-level navigation flows, which is why many sites pair Lax with a token.',
      },
    ],
  },
  {
    id: 'token-unbound',
    title: 'A token that trusts everyone',
    stage: 'intermediate',
    category: 'Token',
    mode: 'exploit',
    summary:
      'The endpoint now demands a CSRF token — but it only checks that the token is valid, not that it belongs to the victim. Bring your own.',
    takeaway:
      'A token that is checked against a shared pool rather than the session provides no protection: the attacker supplies their own valid token.',
    victim: {
      name: 'Sofia',
      site: 'payflow.example',
      disclosure: 'Signed in to PayFlow in this browser.',
    },
    action: {
      label: 'Add a payee',
      path: '/payees/add',
      params: { iban: 'DE00EVIL0000', alias: 'landlord' },
      before: 'Payees: none',
      after: 'Payees: DE00EVIL0000',
    },
    defense: { ...weak, requirePost: true, token: 'unbound' },
    secure: { ...hard },
    objectives: [
      'Add an attacker payee even though a token is required',
      'Type your own token value into the forged request',
    ],
    hints: [
      'The server accepts any well-formed token. Supply one yourself.',
      'Pick the POST form, put anything into the token field, and run.',
    ],
    walkthrough: [
      {
        title: 'Unbound tokens',
        body: 'If the server validates tokens against a global list, an authenticated attacker can fetch a token for their own account and reuse it against the victim.',
      },
      {
        title: 'The fix',
        body: 'Store the token in the victim’s session and compare against that exact value.',
      },
    ],
  },
  {
    id: 'token-bound',
    title: 'A token with no way in',
    stage: 'advanced',
    category: 'Token',
    mode: 'assess',
    summary:
      'Now the token is bound to the session and SameSite is Lax. Prove that without reading the victim’s page there is no way to forge the request.',
    takeaway:
      'A session-bound token defeats CSRF because the attacker can neither read nor predict the victim’s secret.',
    victim: {
      name: 'Lena',
      site: 'medibook.example',
      disclosure: 'Signed in to MediBook in this browser.',
    },
    action: {
      label: 'Reassign appointment',
      path: '/appointments/reassign',
      params: { id: '4471', to: 'attacker' },
      before: 'Assigned to Lena',
      after: 'Assigned to attacker',
    },
    defense: { ...weak, requirePost: true, token: 'bound', sameSite: 'lax' },
    secure: { ...weak, requirePost: true, token: 'bound', sameSite: 'lax' },
    sessionToken: 'tk_9f31c7a4e0',
    objectives: [
      'Try to forge the request and confirm the token check stops you',
      'Explain why the attacker cannot obtain the token',
    ],
    hints: [
      'You do not know Lena’s token — guessing it is not a strategy.',
      'Run any vector; watch the server reject the request at the token check.',
    ],
    walkthrough: [
      {
        title: 'The barrier',
        body: 'Reading the token requires the attacker’s code to run in the victim’s origin (an XSS). CSRF alone cannot reach it.',
      },
      {
        title: 'Belt and braces',
        body: 'Pairing the token with SameSite=Lax means even a leaked token is hard to use cross-site.',
      },
    ],
  },
  {
    id: 'token-leak',
    title: 'The token left in the open',
    stage: 'advanced',
    category: 'Token',
    mode: 'exploit',
    summary:
      'The token is session-bound — but the app also reflects it into the page URL, where an attacker can steal it. Chain the leak into a forged request.',
    takeaway:
      'A session-bound token is only as strong as its secrecy. Leaking it (URLs, logs, referrers) rebuilds the CSRF path.',
    victim: {
      name: 'Tomas',
      site: 'docuhub.example',
      disclosure: 'Signed in to DocuHub; the token appears in his profile URL.',
    },
    action: {
      label: 'Change account password',
      path: '/account/password',
      params: { password: 'pwn3d-n3w' },
      before: 'Password: user-chosen',
      after: 'Password: controlled by attacker',
    },
    defense: { ...weak, requirePost: true, token: 'bound', sameSite: 'lax' },
    secure: {
      ...weak,
      requirePost: true,
      token: 'bound',
      sameSite: 'lax',
      originCheck: true,
    },
    sessionToken: 'tk_5b28d1f09c',
    leakedToken: true,
    objectives: [
      'Recover Tomas’s leaked token and paste it into the forged POST',
      'Change his password despite the session-bound token',
    ],
    hints: [
      'The victim’s leaked token is shown in the victim panel — copy it.',
      'Paste it into the token field of the POST form vector.',
    ],
    walkthrough: [
      {
        title: 'Where tokens leak',
        body: 'Putting a token in a URL exposes it via the Referer header, browser history, server logs, and shared links. Once leaked, the defense collapses.',
      },
      {
        title: 'The fix',
        body: 'Keep tokens out of URLs, validate Origin as a second gate, and bind them to the session.',
      },
    ],
  },
  {
    id: 'custom-header',
    title: 'Fetch metadata, enforced',
    stage: 'advanced',
    category: 'Headers',
    mode: 'assess',
    summary:
      'This API requires an X-Requested-With header. Try to forge the request with HTML and discover why a cross-site page cannot.',
    takeaway:
      'Requiring a custom header forces a CORS preflight that the server can refuse — a robust defense for JSON APIs.',
    victim: {
      name: 'Kofi',
      site: 'clouddesk.example',
      disclosure: 'Signed in to CloudDesk in this browser.',
    },
    action: {
      label: 'Revoke a security key',
      path: '/api/keys/revoke',
      params: { id: 'k-2039' },
      before: 'Key k-2039 active',
      after: 'Key k-2039 revoked',
    },
    defense: { ...weak, customHeader: true },
    secure: { ...weak, customHeader: true },
    objectives: [
      'Attempt every vector and confirm the custom header requirement blocks them',
      'Explain the role of the CORS preflight',
    ],
    hints: [
      'HTML-only requests cannot set custom headers.',
      'A fetch would need the header, which triggers a preflight the server denies.',
    ],
    walkthrough: [
      {
        title: 'Preflight wall',
        body: 'Adding X-Requested-With turns the request into a non-simple CORS request. The browser sends an OPTIONS preflight first; if the server does not allow it, the real request is never sent.',
      },
      {
        title: 'Combine it',
        body: 'Custom-header checks layer well with SameSite and tokens for defense in depth.',
      },
    ],
  },
  {
    id: 'origin-check',
    title: 'The Origin gate',
    stage: 'professional',
    category: 'Headers',
    mode: 'assess',
    summary:
      'No token — just strict Origin/Referer validation on every state-changing request. Prove that a forged request cannot fake the source origin.',
    takeaway:
      'Origin/Referer checks reject cross-site requests because a page cannot forge its own origin header.',
    victim: {
      name: 'Hana',
      site: 'adminpanel.example',
      disclosure: 'Signed in to AdminPanel in this browser.',
    },
    action: {
      label: 'Grant admin role',
      path: '/admin/users/promote',
      params: { user: 'attacker', role: 'admin' },
      before: 'attacker: member',
      after: 'attacker: admin',
    },
    defense: { ...weak, originCheck: true },
    secure: { ...weak, originCheck: true },
    objectives: [
      'Try to forge the request and confirm the Origin check rejects it',
      'Explain why the attacker cannot spoof Origin',
    ],
    hints: [
      'Origin is set by the browser and is not scriptable.',
      'Run any vector; the server drops the request with a bad-Origin error.',
    ],
    walkthrough: [
      {
        title: 'Not spoofable',
        body: 'Unlike a cookie or a hidden form field, the Origin (and Referer) header is chosen by the browser for the actual request. The attacker page can only advertise its own origin.',
      },
      {
        title: 'Handle null',
        body: 'Watch out for sandboxed iframes and redirects that produce a null Origin — validate that explicitly too.',
      },
    ],
  },
  {
    id: 'double-submit',
    title: 'Double-submit, half-validated',
    stage: 'professional',
    category: 'Token',
    mode: 'exploit',
    summary:
      'The app uses a double-submit cookie but never randomizes the value or binds it — inject a matching pair and the endpoint is fooled.',
    takeaway:
      'Double-submit only works if the cookie value is unpredictable and the cookie itself cannot be planted by the attacker.',
    victim: {
      name: 'Noor',
      site: 'marketplace.example',
      disclosure: 'Signed in to Marketplace in this browser.',
    },
    action: {
      label: 'Accept a malicious listing',
      path: '/moderation/approve',
      params: { item: 'phishing-post', decision: 'approve' },
      before: 'item pending',
      after: 'item approved',
    },
    defense: { ...weak, requirePost: true, token: 'unbound' },
    secure: {
      ...weak,
      requirePost: true,
      token: 'bound',
      sameSite: 'strict',
    },
    sessionToken: 'static-value',
    leakedToken: true,
    objectives: [
      'Submit a matching cookie/body token pair to beat the double-submit check',
      'Approve the malicious listing',
    ],
    hints: [
      'The accepted value is static — a known constant, not a random secret.',
      'Use the POST form and enter the known token value.',
    ],
    walkthrough: [
      {
        title: 'Why double-submit can fail',
        body: 'If the cookie value is fixed or predictable, or if the attacker can set cookies on the target’s domain (e.g. via a related subdomain), they can supply a matching pair.',
      },
      {
        title: 'Harden it',
        body: 'Randomize the token per session, sign it, bind it to the session, and mark the cookie Secure + HttpOnly where possible.',
      },
    ],
  },
  {
    id: 'method-override',
    title: 'Lab-ka 2: Method Override',
    stage: 'beginner',
    category: 'Token',
    mode: 'exploit',
    summary:
      'Token-ka waxaa lagu xaqiijiyaa POST kaliya. Markaad u beddesho GET, token-ka lama xaqiijiyo — oo email-ka waa la beddelaa.',
    takeaway:
      'Method-ku ma aha defense. Haddii token-ka lagu xaqiijiyo method-ka POST kaliya, GET wuu dhaafi karaa.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka oo isla markiiba wuu joogaa gudaha.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, token: 'bound', tokenMethodBound: true },
    secure: { ...hard },
    sessionToken: 'WIENER_TOKEN',
    objectives: [
      'Beddel email-ka inkastoo token-ka la xaqiijiyo',
      'U beddel method-ka GET si token-ka loo dhaafo',
    ],
    hints: [
      'Token-ka waxaa lagu xaqiijiyaa POST kaliya — tijaabi GET.',
      'Dooro “Form → GET” oo samee request-ka.',
    ],
    walkthrough: [
      {
        title: 'Method-bound token',
        body: 'Server-ku wuxuu xaqiijiyaa token-ka kaliya marka method-ku POST yahay. GET ma qaato token, sidaas darteed attacker-ku GET ayuu isticmaalaa.',
      },
      {
        title: 'Fix',
        body: 'Xaqiiji token-ka method kasta, oo ha u oggolayn GET inuu beddelo state.',
      },
    ],
  },
  {
    id: 'token-presence',
    title: 'Lab-ka 3: Token Presence',
    stage: 'beginner',
    category: 'Token',
    mode: 'exploit',
    summary:
      'CSRF token wuxuu jiraa, laakiin waxaa lagu xaqiijiyaa presence kaliya — haddii uu jiro. Markaad tirtirto token-ka, ma jiro xaqiijin.',
    takeaway:
      'Presence ma aha validity. Haddii xaqiijinta lagu xiro “haddii uu jiro”, tirtirista token-ka ayaa dhaafi karta.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka oo isla markiiba wuu joogaa gudaha.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, token: 'presence' },
    secure: { ...hard },
    objectives: [
      'Beddel email-ka adigoo tirtiray token-ka',
      'Samee exploit form-ka oo aan lahayn csrf input',
    ],
    hints: [
      'Server-ku wuxuu xaqiijiyaa token-ka kaliya haddii uu jiro.',
      'Dooro “Form → POST” oo ha gelin token (ha ka tagin faaruq).',
    ],
    walkthrough: [
      {
        title: 'Presence-bound token',
        body: 'Code-ku wuxuu yiraahdaa: haddii csrf uu jiro, xaqiiji. Haddii maqan yahay, xaqiijintu ma socoto. Attacker-ku token-ka wuu tirtiraa.',
      },
      {
        title: 'Fix',
        body: 'Waa in token-ka uu jiraa oo sax yahay — ha xirin xaqiijinta “haddii uu jiro”.',
      },
    ],
  },
  {
    id: 'token-cookie-crlf',
    title: 'Lab-ka 5: Token Tied to Non-Session Cookie',
    stage: 'advanced',
    category: 'CRLF',
    mode: 'exploit',
    summary:
      'csrfKey cookie lama xiriirin session cookie, oo CRLF injection ayaa u oggolaanaysa attacker-ka inuu cookie-ga ku soo dhex geliyo browser-ka victim.',
    takeaway:
      'Lab-kan wuxuu ku barayaa in laba qaybood oo ammaan ay isku dari karaan si qaldan. Qoraalku marka uu code noqdo, xuduudaha wuu jajabaa.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka; csrfKey waa cookie aan HttpOnly ahayn.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, token: 'cookie', cookieInjection: 'crlf' },
    secure: { ...hard },
    objectives: [
      'Ku soo dhex geli csrfKey cookie browser-ka victim adigoo isticmaalaya CRLF injection',
      'Beddel email-ka isagoo isticmaalaya cookie-ga aad maamusho',
    ],
    hints: [
      'Search endpoint-ku wuxuu dib u celiyaa input-ka — %0d%0a ayaa xuduud u noqonaysa.',
      'Dooro “Form → POST” — cookie-ga la rakibay iyo body token-ka isku mid ka dhig.',
    ],
    walkthrough: [
      {
        title: 'Composition problem',
        body: 'session cookie waa HttpOnly, laakiin csrfKey cookie ma aha; labaduba kala duwan. Haddii attacker-ku cookie-ga csrfKey geliyo, token-ka cookie-bound wuu jabaa.',
      },
      {
        title: 'CRLF bridge',
        body: 'input = test%0d%0aSet-Cookie:%20csrfKey=attacker — server-ku wuxuu soo saaraa Set-Cookie labaad, sidaas darteed attacker-ku wuxuu maamulaa cookie-ga.',
      },
    ],
  },
  {
    id: 'double-submit-crlf',
    title: 'Lab-ka 6: Token Duplicated in Cookie',
    stage: 'advanced',
    category: 'CRLF',
    mode: 'exploit',
    summary:
      'Double submit: csrf cookie == csrf body. Attacker wuxuu isticmaalaa CRLF injection si uu csrf=fake ugu soo dhex geliyo browser-ka victim.',
    takeaway:
      'Double submit wuxuu ku salaysan yahay male-awaal: “attacker-ku ma dhigi karo cookie-ga.” CRLF injection ayaa male-awaalkaas khaldan ka dhiga.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka; endpoint-ku wuxuu barbardhigaa csrf cookie iyo csrf body.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, token: 'cookie', cookieInjection: 'crlf' },
    secure: { ...hard },
    objectives: [
      'Isticmaal CRLF injection si aad ugu rakibto csrf=fake cookie-ga',
      'Dir body token-ka isla qiimaha si double submit loo dhaafo',
    ],
    hints: [
      'Server-ku wuxuu barbardhigaa body token-ka iyo cookie token-ka.',
      'Haddii labadaba isku mid yihiin (fake), request-ka waa la aqbalayaa.',
    ],
    walkthrough: [
      {
        title: 'Statelessness waa trade-off',
        body: 'Double submit wuxuu ka dhiga state steteless cookie-ga. Laakiin haddii attacker-ku cookie-ga maamuli karo (CRLF), labada dhinac wuu isku mid ka dhigi karaa.',
      },
      {
        title: 'Fix',
        body: 'Randomize, sign, and bind the token to the session; never let reflected input become a header.',
      },
    ],
  },
  {
    id: 'referer-present',
    title: 'Lab-ka 7: Referer Validation Depends on Header Being Present',
    stage: 'advanced',
    category: 'Referer',
    mode: 'exploit',
    summary:
      'Referer validation wuxuu ku xiran yahay jiritaanka header-ka. Haddii Referer maqan yahay, server-ku wuu aqbalayaa.',
    takeaway:
      'Referer waa optional. Haddii server-ku xaqiijiyo kaliya marka header-ku jiro, attacker-ku wuu tirtiri karaa (no-referrer).',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka oo isla markiiba wuu joogaa gudaha.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, refererCheck: 'if-present' },
    secure: { ...hard },
    objectives: [
      'Tirtir Referer header-ka oo dhaafi xaqiijinta',
      'Beddel email-ka iyadoo Referer maqan yahay',
    ],
    hints: [
      'Maqnaanshaha Referer waa possible — isticmaal <meta name="referrer" content="no-referrer">.',
      'Dooro “Form → POST” oo samee request-ka.',
    ],
    walkthrough: [
      {
        title: 'Referer waa context',
        body: 'Browser-ku wuxuu si toos ah u diraa Referer, laakiin attacker-ku wuu tirtiri karaa. Haddii server-ku aanu xaqiijin maqnaanshaha, wuu dhaafi karaa.',
      },
      {
        title: 'Fix',
        body: 'Waa in la diido request-ka aan Referer lahayn, ama la isticmaalo Origin si sax ah.',
      },
    ],
  },
  {
    id: 'referer-substring',
    title: 'Lab-ka 8: Broken Referer Validation',
    stage: 'advanced',
    category: 'Referer',
    mode: 'exploit',
    summary:
      'Referer validation wuxuu isticmaalaa substring match. Wuxuu aqbalayaa Referer: https://evil.com/?target.com.',
    takeaway:
      'Contains waa inclusion, Equals waa identity. Marka aad xaqiijinayso identity, isticmaal Equals — ma aha Contains.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka oo isla markiiba wuu joogaa gudaha.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, refererCheck: 'contains' },
    secure: { ...hard },
    objectives: [
      'Samee Referer oo ay ku jirto target.com laakiin meel kasta oo kale',
      'Beddel email-ka iyadoo xaqiijinta substring la dhaafo',
    ],
    hints: [
      'Substring wuxuu aqbalayaa https://evil.com/?target.com.',
      'Isticmaal history.pushState("", "", "/?target.com") oo dir POST-ka.',
    ],
    walkthrough: [
      {
        title: 'Contains vs Equals',
        body: 'target.com wuxuu ku jiri karaa host, query, fragment, subdomain, ama path. Substring keliya wuu qabtaa — maahan identity.',
      },
      {
        title: 'Fix',
        body: 'Xaqiiji in Origin/Referer uu si buuxda ula mid yahay domain-kaaga.',
      },
    ],
  },
  {
    id: 'samesite-lax-override',
    title: 'Lab-ka 9: SameSite Lax via Method Override',
    stage: 'professional',
    category: 'SameSite',
    mode: 'exploit',
    summary:
      'SameSite=Lax wuxuu dirayaa cookie-ga GET top-level navigation. Server-ku wuxuu aqbalayaa _method=POST — marka GET noqdaa POST.',
    takeaway:
      'SameSite=Lax wuxuu aaminsan yahay top-level navigation, laakiin navigation wuxuu noqon karaa attacker-controlled. Method override wuxuu buuxiya shuruudaha POST-ka.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka; cookie-ga waa SameSite=Lax.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com', _method: 'POST' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, sameSite: 'lax', methodOverride: true },
    secure: { ...hard },
    objectives: [
      'Isticmaal GET top-level navigation si cookie-ga Lax loo diro',
      'Ku dar _method=POST si endpoint-ku u aqbalo',
    ],
    hints: [
      'POST-ku ma qaato cookie-ga Lax — laakiin GET top-level navigation wuu qaataa.',
      'Ku dar &_method=POST query string-ka oo isticmaal “Link / redirect”.',
    ],
    walkthrough: [
      {
        title: 'Gap-ka',
        body: 'SameSite=Lax wuxuu u arkaa GET; server-ku wuxuu u arkaa POST. Labaduba kala duwan — waa gap attacker-ku ka faa’iidaysto.',
      },
      {
        title: 'Fix',
        body: 'Ha u oggolayn method override kasta inuu beddelo state; isticmaal SameSite=Strict iyo token.',
      },
    ],
  },
  {
    id: 'samesite-strict-redirect',
    title: 'Lab-ka 10: SameSite Strict via Client-Side Redirect',
    stage: 'professional',
    category: 'SameSite',
    mode: 'exploit',
    summary:
      'SameSite=Strict wuxuu diidayaa cookie-ga cross-site. Laakiin site-ku wuxuu leeyahay client-side redirect gadget oo sameeya request labaad oo same-site ah.',
    takeaway:
      'SameSite=Strict ma ilaalin haddii site-ku leeyahay gadget. Request 1 waa bridge (same-site), request 2 waa action.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka; cookie-ga waa SameSite=Strict.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, sameSite: 'strict', clientRedirect: true },
    secure: { ...hard },
    objectives: [
      'Hel gadget-ka client-side redirect ee site-ka',
      'Isku xir bridge (request 1) iyo action (request 2)',
    ],
    hints: [
      'Gadget-ka wuxuu qaataa GET cross-site oo si client-side ah u leexda same-site.',
      'Dooro “Link / redirect” oo samee request-ka.',
    ],
    walkthrough: [
      {
        title: 'Client-side redirect',
        body: 'Request 1 waa cross-site GET (ma u baahna cookie). Gadget-ku wuxuu browser-ka u leexdaa same-site URL, markaas cookie-ga Strict waa la diraa.',
      },
      {
        title: 'Fix',
        body: 'Defense-in-depth: token, Origin validation, iyo foojarin bogan kasta oo gadget u noqon kara.',
      },
    ],
  },
  {
    id: 'samesite-strict-sibling',
    title: 'Lab-ka 11: SameSite Strict via Sibling Domain CSWSH',
    stage: 'professional',
    category: 'WebSocket',
    mode: 'exploit',
    summary:
      'SameSite=Strict wuxuu diidayaa cross-site. Laakiin sibling domain wuxuu leeyahay XSS, oo attacker-ku wuxuu sameeyaa same-site request (CSWSH).',
    takeaway:
      '“Site” wuxuu ka weyn yahay “origin”. Sibling domain waa isla site — XSS on sibling wuxuu dhaafi karaa SameSite=Strict.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka; cookie-ga waa SameSite=Strict.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, sameSite: 'strict', siblingXss: true },
    secure: { ...hard },
    objectives: [
      'Hel XSS ku jirta sibling domain (cms-...)',
      'Samee same-site request oo dhaafi SameSite=Strict',
    ],
    hints: [
      'Sibling domain (cms.example.com) wuxuu wadaagaa isla site-ka.',
      'XSS on sibling wuxuu u oggolaanayaa attacker-ka same-site requests.',
    ],
    walkthrough: [
      {
        title: 'Site vs Origin',
        body: 'Strict wuxuu ku salaysan yahay site. Sibling domain waa isla site laakiin origin kala duwan — sidaas darteed XSS halkaas wuxuu dhaafi karaa Strict.',
      },
      {
        title: 'CSWSH',
        body: 'WebSocket handshake ma leh CSRF token. Haddii attacker-ku same-site request sameeyo, cookie-ga waa la diraa oo chat history-ga waa la xadaa.',
      },
    ],
  },
  {
    id: 'samesite-lax-refresh',
    title: 'Lab-ka 12: SameSite Lax via Cookie Refresh',
    stage: 'professional',
    category: 'SameSite',
    mode: 'exploit',
    summary:
      'SameSite=Lax wuxuu leeyahay 2-minute window — haddii cookie la cusboonaysiiyo, wuxuu u dhaqmaa sida None.',
    takeaway:
      'Cookie refresh wuxuu furaa window-ka Lax. Attacker-ku wuxuu cusboonaysiin karaa cookie-ga kadibna wuxuu diraa POST.',
    victim: {
      name: 'wiener',
      site: 'web-security-academy.net',
      disclosure: 'Wuu ku soo galay lab-ka; cookie-ga waa SameSite=Lax.',
    },
    action: {
      label: 'Beddel email-ka',
      path: '/my-account/change-email',
      params: { email: 'attacker@evil.com' },
      before: 'test@test.com',
      after: 'attacker@evil.com',
    },
    defense: { ...weak, requirePost: true, sameSite: 'lax', cookieInjection: 'refresh' },
    secure: { ...hard },
    objectives: [
      'Furi target.com (bog cusub) si cookie-ga loo cusboonaysiiyo',
      'Dir POST-ka inta window-ka furan yahay',
    ],
    hints: [
      'Furi page top-level (window.open) si cookie-ga Lax dib loo soo saaro.',
      'Sug 1 ilbiriqsi kadib dir POST-ka (form).',
    ],
    walkthrough: [
      {
        title: 'Window-ka',
        body: 'Cookie la cusboonaysiiyay wuxuu 2 ilbiriqsi gudaha u dhaqmaa sida None — sidaas darteed cross-site POST wuu qaataa cookie-ga.',
      },
      {
        title: 'Fix',
        body: 'SameSite=Strict iyo session-bound token ayaa xidha window-kan.',
      },
    ],
  },
]

export const LAB_BY_ID = Object.fromEntries(LAB_SCENARIOS.map((s) => [s.id, s]))
