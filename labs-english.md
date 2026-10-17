# CSRF Labs — English Content

This file contains all learner-facing text for the 20 labs. Translate the
values only. Each lab is keyed by its `id` — keep the ids and the field
names unchanged.

Fields:
- **title** — lab title
- **summary** — one-line description
- **takeaway** — short lesson shown after solving
- **victimDisclosure** — where the victim is signed in
- **actionLabel** — name of the action
- **actionBefore** / **actionAfter** — account state before/after
- **objectives** — lab goals
- **hints** — progressive hints ("Nudges")
- **walkthrough** — recap cards (title + body)

---

## 1. `classic-post`

**title:** The classic form forgery

**summary:** Vault Bank lets you change your email with a plain POST and no token. Forge the request while the victim is signed in.

**takeaway:** A state-changing request with no anti-CSRF token can be forged from any site the victim visits.

**victimDisclosure:** Signed in to Vault Bank in this browser.

**actionLabel:** Change account email

**actionBefore:** amina@vault.example

**actionAfter:** attacker@evil.example

**objectives:**
1. Forge a request that changes Amina’s email to attacker@evil.example
2. Watch how the session cookie rides along automatically

**hints:**
1. A cross-site POST from a hidden form is the canonical CSRF vector.
2. Pick “Form → POST” and run the attack.

**walkthrough:**
- **Why it works:** The endpoint trusts any request that carries a valid session cookie. The browser attaches that cookie automatically to cross-site requests when SameSite=None.
- **The fix:** Require a per-session CSRF token. The attacker cannot read the victim’s token, so the forged request fails.

---

## 2. `samesite-lax`

**title:** When SameSite=Lax is not enough

**summary:** The cookie is now SameSite=Lax, so a cross-site POST loses it — but the endpoint still accepts GET. Find the vector that still works.

**takeaway:** SameSite=Lax blocks cross-site POST, but still attaches cookies to top-level GET navigations. Allowing GET on a state-changing endpoint reopens the hole.

**victimDisclosure:** Signed in to KeepSafe in this browser.

**actionLabel:** Disable two-factor recovery

**actionBefore:** Recovery enabled

**actionAfter:** Recovery disabled

**objectives:**
1. Disable recovery on Daniel’s account using a GET-based vector
2. Notice that the POST form is blocked by SameSite=Lax

**hints:**
1. POST won’t carry the cookie under Lax — but a top-level GET navigation will.
2. Try the “Link / redirect” or “Image (GET)” vector… only the navigation one counts.

**walkthrough:**
- **Lax semantics:** Lax sends cookies on top-level GET navigations only. An <img> is a background subresource, so it is blocked; a link the victim clicks is a navigation, so it is allowed.
- **The fix:** Never let GET change state. Require POST *and* a session-bound token so neither navigation nor form forgery works.

---

## 3. `get-image`

**title:** The invisible image

**summary:** A metrics endpoint accepts settings changes over GET through query parameters. Slip one in with an <img> that fires as the page loads.

**takeaway:** Any state-changing GET can be triggered by a subresource such as an image, stylesheet, or iframe — no click required.

**victimDisclosure:** Signed in to Streamly in this browser.

**actionLabel:** Follow an attacker account

**actionBefore:** Not following evil_actor

**actionAfter:** Following evil_actor

**objectives:**
1. Make Priya follow evil_actor without her clicking anything

**hints:**
1. An <img> GET fires silently during page load.
2. Choose “Image (GET)” and run it.

**walkthrough:**
- **Silent subresources:** Browsers fetch images, iframes, and stylesheets automatically. If those can change state, the attacker needs no interaction at all.
- **The fix:** Keep reads on GET and writes on POST, then protect the writes with a token.

---

## 4. `samesite-strict`

**title:** Reading a strong defense

**summary:** This target sets SameSite=Strict. Try every vector and explain why none of them can carry the victim’s session.

**takeaway:** SameSite=Strict withholds the cookie from all cross-site requests — a cheap, powerful baseline.

**victimDisclosure:** Signed in to OneStore in this browser.

**actionLabel:** Add attacker address as default

**actionBefore:** Default: home

**actionAfter:** Default: attacker drop

**objectives:**
1. Run at least three different vectors and confirm the cookie is never sent
2. State the defense in one sentence

**hints:**
1. With Strict, no cross-site request — GET or POST — is authenticated.
2. Try the form, the image, and a link. All should be blocked at the browser.

**walkthrough:**
- **Why nothing lands:** Strict omits the cookie on every cross-site request. The forged request arrives anonymous and the server attributes it to nobody.
- **Caveat:** Strict can break legitimate top-level navigation flows, which is why many sites pair Lax with a token.

---

## 5. `token-unbound`

**title:** A token that trusts everyone

**summary:** The endpoint now demands a CSRF token — but it only checks that the token is valid, not that it belongs to the victim. Bring your own.

**takeaway:** A token that is checked against a shared pool rather than the session provides no protection: the attacker supplies their own valid token.

**victimDisclosure:** Signed in to PayFlow in this browser.

**actionLabel:** Add a payee

**actionBefore:** Payees: none

**actionAfter:** Payees: DE00EVIL0000

**objectives:**
1. Add an attacker payee even though a token is required
2. Type your own token value into the forged request

**hints:**
1. The server accepts any well-formed token. Supply one yourself.
2. Pick the POST form, put anything into the token field, and run.

**walkthrough:**
- **Unbound tokens:** If the server validates tokens against a global list, an authenticated attacker can fetch a token for their own account and reuse it against the victim.
- **The fix:** Store the token in the victim’s session and compare against that exact value.

---

## 6. `token-bound`

**title:** A token with no way in

**summary:** Now the token is bound to the session and SameSite is Lax. Prove that without reading the victim’s page there is no way to forge the request.

**takeaway:** A session-bound token defeats CSRF because the attacker can neither read nor predict the victim’s secret.

**victimDisclosure:** Signed in to MediBook in this browser.

**actionLabel:** Reassign appointment

**actionBefore:** Assigned to Lena

**actionAfter:** Assigned to attacker

**objectives:**
1. Try to forge the request and confirm the token check stops you
2. Explain why the attacker cannot obtain the token

**hints:**
1. The POST form is stopped by SameSite=Lax — switch to the Link / GET navigation to actually reach the server.
2. You do not know Lena’s token, so the server rejects the request at the token check.

**walkthrough:**
- **The barrier:** Reading the token requires the attacker’s code to run in the victim’s origin (an XSS). CSRF alone cannot reach it.
- **Belt and braces:** Pairing the token with SameSite=Lax means even a leaked token is hard to use cross-site.

---

## 7. `token-leak`

**title:** The token left in the open

**summary:** The token is session-bound — but the app also reflects it into the page URL, where an attacker can steal it. Chain the leak into a forged request.

**takeaway:** A session-bound token is only as strong as its secrecy. Leaking it (URLs, logs, referrers) rebuilds the CSRF path.

**victimDisclosure:** Signed in to DocuHub; the token appears in his profile URL.

**actionLabel:** Change account password

**actionBefore:** Password: user-chosen

**actionAfter:** Password: controlled by attacker

**objectives:**
1. Recover Tomas’s leaked token and paste it into the forged POST
2. Change his password despite the session-bound token

**hints:**
1. The victim’s leaked token is shown in the victim panel — copy it.
2. Paste it into the token field of the POST form vector.

**walkthrough:**
- **Where tokens leak:** Putting a token in a URL exposes it via the Referer header, browser history, server logs, and shared links. Once leaked, the defense collapses.
- **The fix:** Keep tokens out of URLs, validate Origin as a second gate, and bind them to the session.

---

## 8. `custom-header`

**title:** Fetch metadata, enforced

**summary:** This API requires an X-Requested-With header. Try to forge the request with HTML and discover why a cross-site page cannot.

**takeaway:** Requiring a custom header forces a CORS preflight that the server can refuse — a robust defense for JSON APIs.

**victimDisclosure:** Signed in to CloudDesk in this browser.

**actionLabel:** Revoke a security key

**actionBefore:** Key k-2039 active

**actionAfter:** Key k-2039 revoked

**objectives:**
1. Attempt every vector and confirm the custom header requirement blocks them
2. Explain the role of the CORS preflight

**hints:**
1. HTML-only requests cannot set custom headers.
2. A fetch would need the header, which triggers a preflight the server denies.

**walkthrough:**
- **Preflight wall:** Adding X-Requested-With turns the request into a non-simple CORS request. The browser sends an OPTIONS preflight first; if the server does not allow it, the real request is never sent.
- **Combine it:** Custom-header checks layer well with SameSite and tokens for defense in depth.

---

## 9. `origin-check`

**title:** The Origin gate

**summary:** No token — just strict Origin/Referer validation on every state-changing request. Prove that a forged request cannot fake the source origin.

**takeaway:** Origin/Referer checks reject cross-site requests because a page cannot forge its own origin header.

**victimDisclosure:** Signed in to AdminPanel in this browser.

**actionLabel:** Grant admin role

**actionBefore:** attacker: member

**actionAfter:** attacker: admin

**objectives:**
1. Try to forge the request and confirm the Origin check rejects it
2. Explain why the attacker cannot spoof Origin

**hints:**
1. Origin is set by the browser and is not scriptable.
2. Run any vector; the server drops the request with a bad-Origin error.

**walkthrough:**
- **Not spoofable:** Unlike a cookie or a hidden form field, the Origin (and Referer) header is chosen by the browser for the actual request. The attacker page can only advertise its own origin.
- **Handle null:** Watch out for sandboxed iframes and redirects that produce a null Origin — validate that explicitly too.

---

## 10. `double-submit`

**title:** Double-submit, half-validated

**summary:** The app uses a double-submit cookie but never randomizes the value or binds it — inject a matching pair and the endpoint is fooled.

**takeaway:** Double-submit only works if the cookie value is unpredictable and the cookie itself cannot be planted by the attacker.

**victimDisclosure:** Signed in to Marketplace in this browser.

**actionLabel:** Accept a malicious listing

**actionBefore:** item pending

**actionAfter:** item approved

**objectives:**
1. Submit a matching cookie/body token pair to beat the double-submit check
2. Approve the malicious listing

**hints:**
1. The accepted value is static — a known constant, not a random secret.
2. Use the POST form and enter the known token value.

**walkthrough:**
- **Why double-submit can fail:** If the cookie value is fixed or predictable, or if the attacker can set cookies on the target’s domain (e.g. via a related subdomain), they can supply a matching pair.
- **Harden it:** Randomize the token per session, sign it, bind it to the session, and mark the cookie Secure + HttpOnly where possible.

---

## 11. `method-override`

**title:** The token that only guards POST

**summary:** The token is validated on POST requests only. Switch the method to GET and the check is skipped — the email still changes.

**takeaway:** A method is not a defense. If the token is only validated when the method is POST, a GET slips past it.

**victimDisclosure:** Signed in to the lab in this browser.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Change the email even though a token is enforced
2. Switch the method to GET so the token check is skipped

**hints:**
1. The token is only validated on POST — try GET.
2. Choose “Form → GET” and run the request.

**walkthrough:**
- **Method-bound token:** The server validates the token only when the method is POST. A GET carries no token requirement, so the attacker uses GET.
- **Fix:** Validate the token on every method, and never let GET change state.

---

## 12. `token-presence`

**title:** A token that must merely exist

**summary:** A CSRF token exists and is checked — but only if it is present. Delete the token from the request and the check never runs.

**takeaway:** Presence is not validity. If the check is wrapped in “if it exists”, removing the token bypasses it.

**victimDisclosure:** Signed in to the lab in this browser.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Change the email by deleting the token from the request
2. Build the exploit form with no csrf input at all

**hints:**
1. The server validates the token only if it is present.
2. Choose “Form → POST” and leave the token field empty.

**walkthrough:**
- **Presence-bound token:** The code says: if csrf exists, validate it. If it is missing, no check runs. The attacker simply omits the token.
- **Fix:** The token must be present AND valid — never wrap the check in “if it exists”.

---

## 13. `token-cookie-crlf`

**title:** A token tied to the wrong cookie

**summary:** The csrfKey cookie is not tied to the session, and a CRLF injection lets the attacker plant a cookie in the victim’s browser.

**takeaway:** Two “secure” parts composed badly can cancel out. When text becomes code, headers break.

**victimDisclosure:** Signed in to the lab; csrfKey is a non-HttpOnly cookie.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Plant the csrfKey cookie in the victim’s browser using CRLF injection
2. Change the email using the cookie you control

**hints:**
1. The search endpoint reflects input — %0d%0a becomes a header boundary.
2. Choose “Form → POST” — make the planted cookie and the body token match.

**walkthrough:**
- **Composition problem:** The session cookie is HttpOnly, but csrfKey is not, and the two are unrelated. If the attacker can set the csrfKey cookie, the cookie-bound token collapses.
- **CRLF bridge:** input = test%0d%0aSet-Cookie:%20csrfKey=attacker — the server emits a second Set-Cookie, so the attacker controls the cookie.

---

## 14. `double-submit-crlf`

**title:** The token duplicated in a cookie

**summary:** Double submit: the csrf cookie must equal the csrf body. The attacker uses CRLF injection to plant csrf=fake in the victim’s browser.

**takeaway:** Double submit rests on an assumption: “the attacker cannot set cookies”. CRLF injection makes that assumption wrong.

**victimDisclosure:** Signed in to the lab; the endpoint compares the csrf cookie with the csrf body.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Use CRLF injection to plant a csrf=fake cookie
2. Send the same value in the body so the double-submit check passes

**hints:**
1. The server compares the body token with the cookie token.
2. If both are the same (fake), the request is accepted.

**walkthrough:**
- **Statelessness is a trade-off:** Double submit makes state stateless via the cookie. But if the attacker can control the cookie (CRLF), both sides can be made equal.
- **Fix:** Randomize, sign, and bind the token to the session; never let reflected input become a header.

---

## 15. `referer-present`

**title:** Referer validation that trusts absence

**summary:** Referer validation only runs when the header is present. If Referer is missing, the server accepts the request.

**takeaway:** Referer is optional. If the server validates it only when present, the attacker can simply omit it.

**victimDisclosure:** Signed in to the lab in this browser.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Strip the Referer header and bypass the check
2. Change the email with the Referer absent

**hints:**
1. A missing Referer is possible — use <meta name="referrer" content="no-referrer">.
2. Choose “Form → POST” and run the request.

**walkthrough:**
- **Referer is context:** The browser sends Referer automatically, but the attacker can strip it. If the server does not validate absence, the request sails through.
- **Fix:** Reject requests with no Referer (or empty Origin), or validate Origin properly.

---

## 16. `referer-substring`

**title:** A Referer check that only looks for a substring

**summary:** Referer validation uses a substring match. It accepts Referer: https://evil.example/?web-security-academy.net.

**takeaway:** Contains is inclusion; equals is identity. When you validate identity, compare for equality — never containment.

**victimDisclosure:** Signed in to the lab in this browser.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Make a Referer that contains the target domain but points anywhere
2. Change the email by defeating the substring check

**hints:**
1. A substring match accepts https://evil.example/?web-security-academy.net.
2. Use history.pushState("", "", "/?web-security-academy.net") and send the POST.

**walkthrough:**
- **Contains vs equals:** The domain can appear in the host, query, fragment, subdomain, or path. A substring test catches none of that — only equality does.
- **Fix:** Validate that Origin/Referer fully equals your domain.

---

## 17. `samesite-lax-override`

**title:** SameSite=Lax via method override

**summary:** SameSite=Lax sends the cookie on top-level GET navigations. The server honours _method=POST — so a GET becomes a POST.

**takeaway:** SameSite=Lax trusts top-level navigation, but navigation can be attacker-controlled. Method override fills in the POST requirement.

**victimDisclosure:** Signed in to the lab; the cookie is SameSite=Lax.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Use a top-level GET navigation so the Lax cookie is sent
2. Add _method=POST so the endpoint accepts it

**hints:**
1. A Lax cookie is not sent on cross-site POST — but it is on a top-level GET navigation.
2. Add &_method=POST to the query string and use “Link / redirect”.

**walkthrough:**
- **The gap:** SameSite=Lax sees a GET; the server sees a POST. The two disagree — and that gap is what the attacker exploits.
- **Fix:** Never let a method override change state; use SameSite=Strict and a token.

---

## 18. `samesite-strict-redirect`

**title:** SameSite=Strict via a client-side redirect

**summary:** SameSite=Strict withholds the cookie from every cross-site request. But the site has a client-side redirect gadget that fires a second, same-site request.

**takeaway:** SameSite=Strict fails when the site itself has a gadget. Request 1 is the bridge (same-site), request 2 is the action.

**victimDisclosure:** Signed in to the lab; the cookie is SameSite=Strict.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Find the client-side redirect gadget on the site
2. Chain the bridge (request 1) into the action (request 2)

**hints:**
1. The gadget takes a cross-site GET and redirects it client-side to a same-site URL.
2. Choose “Link / redirect” and run the request.

**walkthrough:**
- **Client-side redirect:** Request 1 is a cross-site GET (no cookie needed). The gadget bounces the browser to a same-site URL, and the Strict cookie is sent.
- **Fix:** Defense in depth: token, Origin validation, and input-hardening on every page that could act as a gadget.

---

## 19. `samesite-strict-sibling`

**title:** SameSite=Strict via a sibling-domain CSWSH

**summary:** SameSite=Strict withholds the cookie from cross-site requests. But a sibling domain has XSS, so the attacker makes a same-site request (CSWSH).

**takeaway:** “Site” is bigger than “origin”. A sibling domain is the same site — XSS there bypasses SameSite=Strict.

**victimDisclosure:** Signed in to the lab; the cookie is SameSite=Strict.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Find the XSS on the sibling domain (cms-...)
2. Make a same-site request that bypasses SameSite=Strict

**hints:**
1. The sibling domain (cms.example.com) shares the same site.
2. XSS on the sibling lets the attacker issue same-site requests.

**walkthrough:**
- **Site vs origin:** Strict is based on site. A sibling domain is the same site but a different origin — so XSS there bypasses Strict.
- **CSWSH:** The WebSocket handshake carries no CSRF token. A same-site request sends the cookie, and the chat history is stolen.

---

## 20. `samesite-lax-refresh`

**title:** SameSite=Lax via a cookie refresh

**summary:** SameSite=Lax has a 2-minute window — a freshly re-issued cookie behaves like None.

**takeaway:** A cookie refresh opens the Lax window. The attacker refreshes the cookie, then sends the POST.

**victimDisclosure:** Signed in to the lab; the cookie is SameSite=Lax.

**actionLabel:** Change account email

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Open the target site in a new tab so the cookie is re-issued
2. Send the POST while the window is open

**hints:**
1. Open the page top-level (window.open) so the Lax cookie is re-issued.
2. Wait a moment, then send the POST (form).

**walkthrough:**
- **The window:** A freshly re-issued cookie behaves like None for 2 seconds — so a cross-site POST carries it.
- **Fix:** SameSite=Strict and a session-bound token close this window.
