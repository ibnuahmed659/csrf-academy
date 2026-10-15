import {
  VECTORS,
  type AttackInput,
  type AttackResult,
  type Defense,
  type LabScenario,
  type Method,
  type TraceStep,
} from './types'

function step(
  phase: string,
  label: string,
  detail: string,
  status: TraceStep['status'],
): TraceStep {
  return { phase, label, detail, status }
}

/**
 * Simulate a forged cross-site request against the target's defenses.
 * The browser model is intentionally faithful to SameSite semantics so the
 * learner can reason about *why* a request is (not) authenticated.
 */
export function runCsrf(
  scn: LabScenario,
  defense: Defense,
  attack: AttackInput,
): AttackResult {
  const spec = VECTORS[attack.vector]
  const origin = `https://${scn.victim.site}`
  const url = origin + scn.action.path
  const trace: TraceStep[] = []

  trace.push(
    step(
      'Craft',
      'Attacker builds the lure',
      `An attacker on a page they control embeds a ${spec.label.toLowerCase()} targeting ${url}.`,
      'info',
    ),
  )

  trace.push(
    step(
      'Victim',
      `${scn.victim.name} opens the attacker page`,
      `${scn.victim.name} is signed in to ${scn.victim.site} and, in the same browser, loads the attacker's page.`,
      'info',
    ),
  )

  // --- 1. Does the browser attach the session cookie cross-site? ------------
  const topLevelGetNav = spec.kind === 'navigation' && spec.method === 'GET'
  let cookieSent: boolean
  let bypass: { label: string; detail: string } | undefined

  if (defense.sameSite === 'none') {
    cookieSent = true
  } else if (defense.siblingXss) {
    cookieSent = true
    bypass = {
      label: 'Same-site via sibling-domain XSS',
      detail: `SameSite=${defense.sameSite.toUpperCase()} blocks cross-site requests, but the attacker runs code on a sibling domain that shares the same site. That request is same-site, so the browser attaches the cookie — the CSWSH path.`,
    }
  } else if (defense.clientRedirect && topLevelGetNav) {
    cookieSent = true
    bypass = {
      label: 'Same-site via client-side redirect',
      detail: `The cross-site GET lands on a same-site redirect gadget which immediately bounces the browser (client-side) to the state-changing URL. That second hop is same-site, so the cookie is attached despite SameSite=${defense.sameSite.toUpperCase()}.`,
    }
  } else if (defense.cookieInjection === 'refresh' && defense.sameSite === 'lax') {
    cookieSent = true
    bypass = {
      label: 'Lax window opened by cookie refresh',
      detail:
        'The attacker first loads the target top-level, which re-issues the Lax cookie and opens the 2-minute window in which Lax behaves like None. The following cross-site POST is then authenticated.',
    }
  } else if (defense.sameSite === 'lax') {
    cookieSent = topLevelGetNav
  } else {
    cookieSent = false
  }

  if (!cookieSent) {
    const reason =
      defense.sameSite === 'strict'
        ? 'SameSite=STRICT never attaches cookies to cross-site requests — not even top-level navigations.'
        : `SameSite=LAX attaches cookies only to top-level GET navigations. This ${spec.kind === 'navigation' ? spec.method + ' navigation' : 'background ' + spec.method} is not one, so no cookie is sent.`
    trace.push(step('Browser', 'Cookie withheld', reason, 'block'))
    trace.push(
      step(
        'Server',
        'Request is anonymous',
        'Without a session the server cannot attribute the action to the victim — nothing changes.',
        'info',
      ),
    )
    return { pwned: false, blockedBy: `SameSite=${defense.sameSite.toUpperCase()}`, trace }
  }

  trace.push(
    step(
      'Browser',
      'Session cookie attached',
      `Cookie is SameSite=${defense.sameSite.toUpperCase()}, so the browser attaches the victim's session to this request.`,
      'ok',
    ),
  )
  if (bypass) trace.push(step('Browser', bypass.label, bypass.detail, 'warn'))

  // --- 2. Method discipline + method override -------------------------------
  const overridden = defense.methodOverride && spec.method === 'GET'
  const effectiveMethod: Method = overridden ? 'POST' : spec.method
  if (overridden) {
    trace.push(
      step(
        'Server',
        'Method override accepted',
        'The request arrives as GET but carries _method=POST (or X-HTTP-Method-Override). The server honours it and processes the action as a POST.',
        'warn',
      ),
    )
  }

  if (defense.requirePost && effectiveMethod !== 'POST') {
    trace.push(
      step(
        'Server',
        'Rejected: method not allowed',
        'The endpoint only accepts POST, and this request is a GET that was not overridden.',
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'POST-only endpoint', trace }
  }

  // --- 3. Required custom header --------------------------------------------
  if (defense.customHeader) {
    trace.push(
      step(
        'Server',
        'Rejected: missing custom header',
        'The endpoint requires a custom header (e.g. X-Requested-With). A cross-site HTML request cannot set one without a CORS preflight, which the server refuses.',
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'Required custom header', trace }
  }

  // --- 4. Origin validation --------------------------------------------------
  if (defense.originCheck) {
    trace.push(
      step(
        'Server',
        'Rejected: bad Origin',
        `The server compares Origin/Referer. It sees the attacker's origin, not ${origin}, and drops the request.`,
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'Origin check', trace }
  }

  // --- 5. Referer validation -------------------------------------------------
  if (defense.refererCheck === 'exact') {
    trace.push(
      step(
        'Server',
        'Rejected: bad Referer',
        `The server requires the Referer to equal ${origin}. A cross-site request always carries the attacker's referer, so it is dropped.`,
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'Referer check', trace }
  }
  if (defense.refererCheck === 'if-present') {
    trace.push(
      step(
        'Server',
        'Referer skipped when absent',
        'The server validates the Referer only when the header is present. The attacker adds <meta name="referrer" content="no-referrer">, so the header is omitted and the check never runs.',
        'warn',
      ),
    )
  } else if (defense.refererCheck === 'contains') {
    trace.push(
      step(
        'Server',
        'Referer passes a substring test',
        `The server only checks whether the Referer *contains* "${scn.victim.site}". The attacker supplies https://evil.example/?${scn.victim.site}, which contains it, and passes.`,
        'warn',
      ),
    )
  }

  // --- 6. Anti-CSRF token ----------------------------------------------------
  if (defense.token === 'none') {
    trace.push(
      step(
        'Server',
        'No token expected',
        'The endpoint never asks for an anti-CSRF token — there is nothing to verify.',
        'warn',
      ),
    )
  } else if (defense.tokenMethodBound && effectiveMethod === 'GET') {
    trace.push(
      step(
        'Server',
        'Token not checked on GET',
        'The token is only validated for POST requests. Because this forged request is a GET, the token requirement is skipped entirely.',
        'warn',
      ),
    )
  } else if (defense.token === 'presence') {
    trace.push(
      step(
        'Server',
        'Token only checked if present',
        'The server wraps token validation in an "if the parameter exists" condition. The attacker simply omits the csrf parameter, so the check is bypassed.',
        'warn',
      ),
    )
  } else {
    const hasToken = attack.token.trim().length > 0
    if (!hasToken) {
      trace.push(
        step(
          'Server',
          'Rejected: missing CSRF token',
          'The endpoint expects a CSRF token but the forged request carried none.',
          'block',
        ),
      )
      return { pwned: false, blockedBy: 'Missing CSRF token', trace }
    }
    if (defense.token === 'unbound') {
      trace.push(
        step(
          'Server',
          'Token accepted (but not session-bound!)',
          `The server checks the supplied token ("${attack.token}") against a shared pool instead of the victim's session. Any valid-looking token is accepted — so the attacker's own token sails through.`,
          'warn',
        ),
      )
    } else if (defense.token === 'cookie') {
      if (defense.cookieInjection === 'crlf') {
        trace.push(
          step(
            'Server',
            'Cookie-bound token forged via CRLF',
            'The token is compared with a cookie value. A reflected CRLF in the search endpoint lets the attacker plant a matching cookie in the victim browser, so both sides equal the attacker value.',
            'warn',
          ),
        )
      } else {
        trace.push(
          step(
            'Server',
            'Rejected: cookie-bound token',
            'The token must equal the value in the victim cookie, which the attacker cannot set or read.',
            'block',
          ),
        )
        return { pwned: false, blockedBy: 'Cookie-bound CSRF token', trace }
      }
    } else {
      // bound to the session
      if (attack.token !== scn.sessionToken) {
        trace.push(
          step(
            'Server',
            'Rejected: invalid CSRF token',
            `The token must match the value minted into ${scn.victim.name}'s session. The attacker cannot read it, so the forged value is rejected.`,
            'block',
          ),
        )
        return { pwned: false, blockedBy: 'Session-bound CSRF token', trace }
      }
      trace.push(
        step(
          'Server',
          'Token accepted',
          'The supplied token matches the victim session. This only happens when the token leaked or is guessable.',
          'warn',
        ),
      )
    }
  }

  // --- 7. Impact -------------------------------------------------------------
  trace.push(
    step(
      'Impact',
      'State changed — attack succeeded',
      `${scn.action.label}: "${scn.action.before}" → "${scn.action.after}". The victim never intended this.`,
      'ok',
    ),
  )

  trace.push(step('Analysis', pwnedNote(defense), reusedHint(defense), 'info'))

  return { pwned: true, trace }
}

function pwnedNote(defense: Defense): string {
  const gaps: string[] = []
  if (defense.token === 'none') gaps.push('no anti-CSRF token')
  if (defense.token === 'presence') gaps.push('a token only validated when present')
  if (defense.token === 'unbound') gaps.push('a token not bound to the session')
  if (defense.token === 'cookie' && defense.cookieInjection === 'crlf')
    gaps.push('a cookie-bound token that CRLF can forge')
  if (defense.tokenMethodBound) gaps.push('a token only checked on POST')
  if (!defense.originCheck) gaps.push('no Origin validation')
  if (defense.refererCheck === 'if-present') gaps.push('Referer validation that skips a missing header')
  if (defense.refererCheck === 'contains') gaps.push('substring Referer matching')
  if (!defense.requirePost) gaps.push('a GET-triggerable endpoint')
  if (!defense.customHeader) gaps.push('no required custom header')
  if (defense.methodOverride) gaps.push('a method-override parameter')
  if (defense.cookieInjection === 'refresh') gaps.push('a refreshable Lax cookie window')
  if (defense.clientRedirect) gaps.push('a client-side redirect gadget')
  if (defense.siblingXss) gaps.push('a sibling-domain XSS')
  if (defense.sameSite === 'none') gaps.push('SameSite=None')
  return gaps.length
    ? 'The request slipped through because the endpoint had ' + joinList(gaps) + '.'
    : 'Multiple defenses were missing.'
}

function reusedHint(defense: Defense): string {
  if (defense.token === 'presence')
    return 'Fix: require the token to be present AND valid — never wrap the check in "if it exists".'
  if (defense.tokenMethodBound)
    return 'Fix: validate the token for every method, not just POST.'
  if (defense.token === 'cookie' && defense.cookieInjection === 'crlf')
    return 'Fix: stop reflecting CRLF (input comes back as an output header), and bind the token to the session server-side.'
  if (defense.refererCheck === 'if-present')
    return 'Fix: if you validate Referer, reject requests that omit it (or empty-Origin cases) too.'
  if (defense.refererCheck === 'contains')
    return 'Fix: compare the full origin for equality — never a substring.'
  if (defense.cookieInjection === 'refresh')
    return 'Fix: set SameSite=Strict, or pair Lax with a session-bound token.'
  if (!defense.originCheck && defense.token === 'none')
    return 'Fix: add a session-bound token AND validate Origin — either alone is a strong deterrent.'
  if (defense.token === 'unbound')
    return 'Fix: bind the token to the user session (per-session secret), not a shared value.'
  return 'Fix: turn on the remaining defenses in the Defense panel and re-run.'
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export function attackSnippet(scn: LabScenario, attack: AttackInput): string {
  const spec = VECTORS[attack.vector]
  const url = `https://${scn.victim.site}${scn.action.path}`
  const params = attack.token.trim()
    ? { ...scn.action.params, csrf_token: attack.token.trim() }
    : { ...scn.action.params }
  return spec.snippet(url, params)
}
