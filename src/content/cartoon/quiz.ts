import type { CartoonQuiz } from '@/lib/cartoon/types'

export const cartoonQuizzes: Record<string, CartoonQuiz> = {
  cf1: {
    questions: [
      { q: 'What is CSRF?', options: ['Forcing a logged-in user’s browser to send an unintended request', 'Stealing the database password', 'Encrypting traffic'], answer: 0 },
      { q: 'Why does CSRF work?', options: ['The browser automatically attaches the session cookie', 'The password is weak', 'The server has no firewall'], answer: 0 },
      { q: 'A key trait of CSRF is that the attacker…', options: ['Rides the victim’s authenticated session', 'Reads every response', 'Owns the server'], answer: 0 },
    ],
  },
  cf2: {
    questions: [
      { q: 'What does the browser attach to requests to your site?', options: ['The session cookie', 'The user’s password', 'The disk encryption key'], answer: 0 },
      { q: 'Why can the attacker not just read the cookie?', options: ['The same-origin policy blocks cross-site reads', 'Cookies are invisible', 'The cookie is encrypted'], answer: 0 },
      { q: 'CSRF abuses…', options: ['Automatic credential attachment', 'Weak TLS', 'Open ports'], answer: 0 },
    ],
  },
  cf3: {
    questions: [
      { q: 'The same-origin policy mainly prevents…', options: ['Reading responses from another origin', 'Sending any request cross-site', 'Using cookies at all'], answer: 0 },
      { q: 'It does NOT prevent…', options: ['Sending cross-site requests', 'Rendering HTML', 'Using HTTPS'], answer: 0 },
      { q: 'CSRF defenses exist to verify…', options: ['Proof of intent', 'The user’s height', 'The server’s uptime'], answer: 0 },
    ],
  },
  cf4: {
    questions: [
      { q: 'Which method should change state?', options: ['POST', 'GET', 'HEAD'], answer: 0 },
      { q: 'Why is state change on GET dangerous?', options: ['It can be triggered by an image or link', 'GET is slower', 'GET cannot use TLS'], answer: 0 },
      { q: 'The safe rule is…', options: ['Never change state on GET', 'Always use GET', 'Avoid POST'], answer: 0 },
    ],
  },
  cf5: {
    questions: [
      { q: 'The first step of a CSRF attack is to…', options: ['Identify a state-changing action', 'Delete logs', 'Scan ports'], answer: 0 },
      { q: 'The attack needs the victim to…', options: ['Be logged in and visit the attacker page', 'Share their password', 'Install a plugin'], answer: 0 },
      { q: 'A common defense is…', options: ['Tokens, SameSite and Origin checks', 'A bigger logo', 'Faster servers'], answer: 0 },
    ],
  },
  ct1: {
    questions: [
      { q: 'A GET-based CSRF is often delivered with…', options: ['An <img> tag', 'A JSON body', 'A WebSocket'], answer: 0 },
      { q: 'Why does the <img> trick work?', options: ['Browsers fetch image URLs automatically', 'Images run JavaScript', 'The server trusts images'], answer: 0 },
      { q: 'The fix is…', options: ['No state change on GET and use tokens', 'Block all images', 'Drop cookies'], answer: 0 },
    ],
  },
  ct2: {
    questions: [
      { q: 'POST CSRF is often delivered with…', options: ['An auto-submitting form', 'A favicon', 'A DNS query'], answer: 0 },
      { q: 'SameSite may not always stop it because…', options: ['It depends on the attribute and browser defaults', 'SameSite is broken', 'Cookies expire'], answer: 0 },
      { q: 'Best fix is…', options: ['CSRF tokens plus SameSite', 'Longer passwords', 'Rate limiting only'], answer: 0 },
    ],
  },
  ct3: {
    questions: [
      { q: 'Login CSRF forces the victim to…', options: ['Log in as the attacker', 'Reset the server', 'Change DNS'], answer: 0 },
      { q: 'The impact of login CSRF is…', options: ['The victim acts inside the attacker’s account, leaking data', 'Slower logins', 'Cookies deleted'], answer: 0 },
      { q: 'The defense is…', options: ['Anti-CSRF token on the login form', 'A CAPTCHA only', 'Hiding the form'], answer: 0 },
    ],
  },
  ct4: {
    questions: [
      { q: 'Logout CSRF does what?', options: ['Forces the victim to log out', 'Deletes the site', 'Steals the password'], answer: 0 },
      { q: 'Why does logout CSRF matter?', options: ['It enables nuisance or other attacks', 'It speeds up loading', 'It saves bandwidth'], answer: 0 },
      { q: 'The defense is…', options: ['Put a token on the logout action too', 'Never log out', 'Use GET for logout'], answer: 0 },
    ],
  },
  ct5: {
    questions: [
      { q: 'Why are JSON APIs often safer?', options: ['A custom content type triggers a CORS preflight', 'JSON is encrypted', 'JSON cannot be forged'], answer: 0 },
      { q: 'When is a JSON API still at risk?', options: ['When the server parses leniently or authenticates with cookies', 'When it uses HTTPS', 'When it compresses responses'], answer: 0 },
      { q: 'The fix is…', options: ['Header tokens and strict CORS/content-type checks', 'Bigger payloads', 'Longer URLs'], answer: 0 },
    ],
  },
  cd1: {
    questions: [
      { q: 'A CSRF token is…', options: ['A random, per-session value verified server-side', 'The user’s password', 'The session cookie itself'], answer: 0 },
      { q: 'Why can the attacker not just guess it?', options: ['It is random and unpredictable', 'It is very short', 'It is public'], answer: 0 },
      { q: 'The server must check the token…', options: ['On every state-changing request', 'Only at login', 'Once a day'], answer: 0 },
    ],
  },
  cd2: {
    questions: [
      { q: 'Double-submit sends the token…', options: ['In a cookie and a matching request header', 'Only in the cookie', 'Only in the URL'], answer: 0 },
      { q: 'Why can the attacker not supply the header?', options: ['Cross-site scripts cannot read the cookie', 'Headers are encrypted', 'The header is secret'], answer: 0 },
      { q: 'A weakness of double-submit is…', options: ['Subdomains or stolen cookies can weaken it', 'It needs a database', 'It breaks HTTPS'], answer: 0 },
    ],
  },
  cd3: {
    questions: [
      { q: 'Who enforces SameSite?', options: ['The browser', 'The database', 'The CDN'], answer: 0 },
      { q: 'SameSite=Lax allows the cookie on…', options: ['Top-level GET navigations', 'Every request', 'No request at all'], answer: 0 },
      { q: 'SameSite=None must be paired with…', options: ['Secure', 'HttpOnly', 'SameSite again'], answer: 0 },
    ],
  },
  cd4: {
    questions: [
      { q: 'Browsers send which header describing the source?', options: ['Origin', 'Content-Length', 'Server'], answer: 0 },
      { q: 'A server using this defense should…', options: ['Reject requests from unexpected origins', 'Accept every origin', 'Ignore headers'], answer: 0 },
      { q: 'Which is generally preferred?', options: ['Origin, since Referer can be stripped', 'Referer only', 'Neither'], answer: 0 },
    ],
  },
  cd4b: {
    questions: [
      { q: 'Why does requiring a custom header help?', options: ['Simple forms cannot set it, forcing a preflight', 'It encrypts the body', 'It hides the URL'], answer: 0 },
      { q: 'Defense in depth means…', options: ['Stacking multiple controls', 'One perfect control', 'No controls'], answer: 0 },
      { q: 'Best practice is to…', options: ['Combine tokens, SameSite and Origin checks', 'Rely on one trick', 'Disable cookies'], answer: 0 },
    ],
  },
  cb1: {
    questions: [
      { q: 'XSS can defeat CSRF defenses because…', options: ['Scripts on the origin can read tokens and act same-origin', 'It deletes cookies', 'It changes DNS'], answer: 0 },
      { q: 'A defense that keeps tokens from scripts is…', options: ['HttpOnly cookies', 'A CDN', 'Gzip'], answer: 0 },
      { q: 'The lesson is…', options: ['Prevent XSS first; CSRF defenses assume no script runs', 'XSS is harmless', 'Tokens are useless'], answer: 0 },
    ],
  },
  cb2: {
    questions: [
      { q: 'A SameSite=Lax bypass often uses…', options: ['A top-level GET navigation', 'A POST form', 'A WebSocket'], answer: 0 },
      { q: 'Some browsers create a gap for…', options: ['Very recently set cookies', 'Old cookies', 'Deleted cookies'], answer: 0 },
      { q: 'To close the gap…', options: ['Use Strict, avoid GET state change, and add tokens', 'Lower SameSite', 'Remove cookies'], answer: 0 },
    ],
  },
  cb3: {
    questions: [
      { q: 'A weak token might be built from…', options: ['A timestamp or user id', 'A CSPRNG', 'A random UUID'], answer: 0 },
      { q: 'Replay means…', options: ['Reusing a valid token or request', 'Deleting a token', 'Encrypting a token'], answer: 0 },
      { q: 'Fix weak tokens with…', options: ['Strong randomness and rotation', 'Shorter tokens', 'Shared tokens'], answer: 0 },
    ],
  },
  cb4: {
    questions: [
      { q: 'A method-override trick can…', options: ['Turn a simple POST into another method', 'Read the database', 'Change DNS'], answer: 0 },
      { q: 'Content-type confusion works when…', options: ['The server parses a body it should reject', 'The cookie is secure', 'TLS is on'], answer: 0 },
      { q: 'The fix is…', options: ['Strict method and content-type validation plus a token', 'Bigger payloads', 'Longer URLs'], answer: 0 },
    ],
  },
  cm1: {
    questions: [
      { q: 'An SPA is still exposed to CSRF when…', options: ['It authenticates with cookies', 'It uses fetch', 'It sends JSON'], answer: 0 },
      { q: 'Why does JSON help by default?', options: ['A custom content type triggers a preflight', 'JSON is encrypted', 'JSON is secret'], answer: 0 },
      { q: 'The safe pattern is…', options: ['Tokens in a header plus strict CORS', 'Allow every origin', 'Trust the body'], answer: 0 },
    ],
  },
  cm2: {
    questions: [
      { q: 'A dangerous CORS pattern is…', options: ['Reflecting any origin while allowing credentials', 'An explicit allowlist', 'No CORS at all'], answer: 0 },
      { q: 'That misconfiguration can…', options: ['Reopen cross-site reads and writes', 'Speed up the site', 'Encrypt traffic'], answer: 0 },
      { q: 'The fix is…', options: ['Allow-list exact trusted origins', 'Allow every origin', 'Disable authentication'], answer: 0 },
    ],
  },
  cm2b: {
    questions: [
      { q: 'The OAuth state parameter exists to…', options: ['Prevent CSRF in the OAuth flow', 'Encrypt tokens', 'Store the password'], answer: 0 },
      { q: 'Without state validation an attacker can…', options: ['Inject their own authorization code', 'Read the database', 'Change DNS'], answer: 0 },
      { q: 'The fix is to…', options: ['Generate and validate the state parameter', 'Skip the callback', 'Trust any redirect'], answer: 0 },
    ],
  },
  cm3: {
    questions: [
      { q: 'Unlike fetch, a WebSocket handshake is…', options: ['Not protected by the same-origin policy', 'Always same-origin', 'Encrypted end to end'], answer: 0 },
      { q: 'The risk is a cross-site handshake that…', options: ['Carries the victim’s cookie', 'Deletes data', 'Runs a shell'], answer: 0 },
      { q: 'The fix is to…', options: ['Validate Origin and require a token', 'Allow all origins', 'Use only HTTP'], answer: 0 },
    ],
  },
  cw1: {
    questions: [
      { q: 'What was the core Netflix CSRF issue?', options: ['Account changes needed only the session cookie', 'Weak passwords', 'No HTTPS'], answer: 0 },
      { q: 'The impact was that an attacker could…', options: ['Change account details and the DVD queue', 'Crash the servers', 'Encrypt the data'], answer: 0 },
      { q: 'The fix added…', options: ['CSRF tokens on account actions', 'A new logo', 'Faster servers'], answer: 0 },
    ],
  },
  cw2: {
    questions: [
      { q: 'Which YouTube actions were affected?', options: ['Subscriptions, friend requests and messages', 'Video encoding', 'DNS resolution'], answer: 0 },
      { q: 'The impact included…', options: ['Spam and damaged trust', 'Server downtime', 'Data loss'], answer: 0 },
      { q: 'The fix was…', options: ['Per-request tokens on actions', 'Blocking users', 'Rate limiting only'], answer: 0 },
    ],
  },
  cw2b: {
    questions: [
      { q: 'On a marketplace, CSRF could…', options: ['Place forged bids or change listings', 'Encrypt the data', 'Speed up checkout'], answer: 0 },
      { q: 'The impact is serious because…', options: ['Real money and trust are involved', 'It slows browsing', 'It uses bandwidth'], answer: 0 },
      { q: 'The fix includes…', options: ['Tokens plus confirmation for high-value actions', 'Removing the cart', 'Disabling accounts'], answer: 0 },
    ],
  },
  cw3: {
    questions: [
      { q: 'The 2014 router campaign changed…', options: ['The router’s DNS settings', 'The Wi-Fi password', 'The firmware'], answer: 0 },
      { q: 'It was possible because routers had…', options: ['No CSRF protection and default credentials', 'Too much RAM', 'No Wi-Fi'], answer: 0 },
      { q: 'The lesson is to…', options: ['Protect devices on the local network too', 'Ignore routers', 'Use open Wi-Fi'], answer: 0 },
    ],
  },
  cw4: {
    questions: [
      { q: 'The WordPress issue was that a plugin…', options: ['Did not verify a CSRF nonce', 'Used HTTPS', 'Cached pages'], answer: 0 },
      { q: 'An attacker could trigger…', options: ['Admin actions when an admin visited a page', 'A kernel panic', 'A database backup'], answer: 0 },
      { q: 'The fix is to…', options: ['Verify the framework nonce and audit plugins', 'Remove the admin panel', 'Disable comments'], answer: 0 },
    ],
  },
  capcs1: {
    questions: [
      { q: 'The first recon step is to…', options: ['List every action that changes state', 'Delete the database', 'Run a port scan'], answer: 0 },
      { q: 'What looked suspicious?', options: ['The email change needed only the cookie', 'The login used TLS', 'The site was fast'], answer: 0 },
      { q: 'The signal was that…', options: ['A state change trusted only the cookie', 'The site was slow', 'The assets were large'], answer: 0 },
    ],
  },
  capcs2: {
    questions: [
      { q: 'Hood checked whether the action required…', options: ['A token, SameSite or an Origin check', 'A captcha', 'Two passwords'], answer: 0 },
      { q: 'The flaw worked because…', options: ['Only the session cookie was needed', 'The token was short', 'TLS was off'], answer: 0 },
      { q: 'This made the action…', options: ['Forgeable from another site', 'Faster', 'Encrypted'], answer: 0 },
    ],
  },
  capcs3: {
    questions: [
      { q: 'The forged request was delivered through…', options: ['A page the victim loaded', 'A USB stick', 'A phone call'], answer: 0 },
      { q: 'The request sent…', options: ["The victim’s cookies automatically", 'The attacker’s password', 'A DNS query'], answer: 0 },
      { q: 'The victim only had to…', options: ['Open a page while logged in', 'Enter a password', 'Install software'], answer: 0 },
    ],
  },
  capcs4: {
    questions: [
      { q: 'After changing the email, Hood…', options: ['Triggered a password reset to his own inbox', 'Deleted the account', 'Called support'], answer: 0 },
      { q: 'The end result was…', options: ['Full account takeover', 'A slower page', 'A cookie error'], answer: 0 },
      { q: 'The lesson is that a single unguarded state change…', options: ['Can start a chain leading to takeover', 'Is harmless', 'Only affects speed'], answer: 0 },
    ],
  },
  capcs5: {
    questions: [
      { q: 'Which fixes were applied?', options: ['Tokens, SameSite=Lax and Origin checks', 'A bigger blocklist', 'Longer passwords'], answer: 0 },
      { q: 'After the fix, the forged request was…', options: ['Rejected', 'Still successful', 'Ignored silently'], answer: 0 },
      { q: 'The closing lesson is…', options: ['No proof of intent, no action', 'Trust all requests', 'Disable cookies'], answer: 0 },
    ],
  },
}

export function getQuiz(id: string): CartoonQuiz | undefined {
  return cartoonQuizzes[id]
}
