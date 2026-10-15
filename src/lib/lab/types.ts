export type Method = 'GET' | 'POST'

export type SameSite = 'none' | 'lax' | 'strict'

/** How the server validates the anti-CSRF token, if at all. */
export type TokenMode = 'none' | 'presence' | 'unbound' | 'bound' | 'cookie'

/** How the server validates the Referer header. */
export type RefererCheck = 'off' | 'if-present' | 'contains' | 'exact'

/** A reflected-CRLF endpoint that lets the attacker plant or refresh cookies. */
export type CookieInjection = 'none' | 'crlf' | 'refresh'

/** How a forged request is launched from the attacker's page. */
export type Vector =
  | 'img'
  | 'form-get'
  | 'form-post'
  | 'link'
  | 'iframe'
  | 'fetch'

/**
 * The server-side defenses protecting the sensitive action. A vulnerable
 * scenario starts with most of these switched off.
 */
export type Defense = {
  /** Only accept POST (blocks method-confusion via GET images/links). */
  requirePost: boolean
  /** How the anti-CSRF token is validated. */
  token: 'none' | 'presence' | 'unbound' | 'bound' | 'cookie'
  /** Cookie SameSite attribute controlling cross-site attachment. */
  sameSite: SameSite
  /** Reject requests whose Origin/Referer is not the target site. */
  originCheck: boolean
  /** Require a custom header that a cross-site HTML request cannot set. */
  customHeader: boolean
  /** Token is only validated on POST — a GET slips past the check. */
  tokenMethodBound: boolean
  /** The server honours an `_method` parameter, turning a GET into a POST. */
  methodOverride: boolean
  /** How strictly the Referer header is validated. */
  refererCheck: 'off' | 'if-present' | 'contains' | 'exact'
  /** Reflective CRLF lets the attacker plant (crlf) or refresh (refresh) cookies. */
  cookieInjection: 'none' | 'crlf' | 'refresh'
  /** A client-side redirect gadget exists on the target site. */
  clientRedirect: boolean
  /** The attacker has XSS on a same-site sibling domain (enables CSWSH). */
  siblingXss: boolean
}

export type DefenseKey = keyof Defense

type VectorSpec = {
  id: Vector
  label: string
  method: Method
  kind: 'subresource' | 'navigation' | 'fetch'
  auto: boolean
  carriesBody: boolean
  blurb: string
  /** Build the snippet the attacker would paste into their page. */
  snippet: (url: string, params: Record<string, string>) => string
}

export const VECTORS: Record<Vector, VectorSpec> = {
  img: {
    id: 'img',
    label: 'Image (GET)',
    method: 'GET',
    kind: 'subresource',
    auto: true,
    carriesBody: false,
    blurb: 'An <img> fires a GET the instant the victim loads the attacker page.',
    snippet: (url, params) => `<img src="${withQuery(url, params)}">`,
  },
  'form-get': {
    id: 'form-get',
    label: 'Form → GET',
    method: 'GET',
    kind: 'navigation',
    auto: true,
    carriesBody: false,
    blurb: 'An auto-submitting form runs a top-level GET navigation.',
    snippet: (url, params) =>
      `<form action="${url}" method="GET">\n  <input name="email" value="${params.email}">\n</form>\n<script>document.forms[0].submit()</script>`,
  },
  'form-post': {
    id: 'form-post',
    label: 'Form → POST',
    method: 'POST',
    kind: 'navigation',
    auto: true,
    carriesBody: true,
    blurb: 'The classic: a hidden form auto-submits a cross-site POST.',
    snippet: (url, params) =>
      `<form action="${url}" method="POST">\n  <input name="email" value="${params.email}">\n</form>\n<script>document.forms[0].submit()</script>`,
  },
  link: {
    id: 'link',
    label: 'Link / redirect',
    method: 'GET',
    kind: 'navigation',
    auto: false,
    carriesBody: false,
    blurb: 'A lure the victim clicks (or a redirect) issues a top-level GET.',
    snippet: (url, params) => `<a href="${withQuery(url, params)}">Click to claim your prize</a>`,
  },
  iframe: {
    id: 'iframe',
    label: 'Hidden iframe',
    method: 'GET',
    kind: 'subresource',
    auto: true,
    carriesBody: false,
    blurb: 'A 0×0 iframe silently requests the endpoint in the background.',
    snippet: (url, params) => `<iframe src="${withQuery(url, params)}" width="0" height="0"></iframe>`,
  },
  fetch: {
    id: 'fetch',
    label: 'fetch() request',
    method: 'POST',
    kind: 'fetch',
    auto: true,
    carriesBody: true,
    blurb: 'A scripted fetch — the response may be blocked by CORS, but the request still fires.',
    snippet: (url, params) =>
      `fetch("${url}", {\n  method: "POST",\n  body: new URLSearchParams(${JSON.stringify(params)})\n});`,
  },
}

function withQuery(url: string, params: Record<string, string>) {
  const q = new URLSearchParams(params).toString()
  return q ? `${url}?${q}` : url
}

export type TraceStatus = 'ok' | 'block' | 'info' | 'warn'

export type TraceStep = {
  phase: string
  label: string
  detail: string
  status: TraceStatus
}

export type AttackInput = {
  vector: Vector
  /** A token the attacker scrapes/guesses and pastes into the forged request. */
  token: string
}

export type AttackResult = {
  /** Did the victim's account actually change? */
  pwned: boolean
  /** The first defense that stopped the request, if any. */
  blockedBy?: string
  trace: TraceStep[]
}

export type CsrfAction = {
  /** Human label, e.g. "Change account email". */
  label: string
  /** Endpoint path on the target origin. */
  path: string
  /** The state change the attacker wants. */
  params: Record<string, string>
  /** What the account looked like before / after. */
  before: string
  after: string
}

export type Stage = 'beginner' | 'intermediate' | 'advanced' | 'professional'

export type LabScenario = {
  id: string
  title: string
  stage: Stage
  category: string
  /** `exploit` = win by changing the victim's state; `assess` = prove it's blocked. */
  mode: 'exploit' | 'assess'
  summary: string
  /** One-line lesson surfaced after solving. */
  takeaway: string
  victim: { name: string; site: string; disclosure: string }
  action: CsrfAction
  /** The vulnerable configuration the lab opens with. */
  defense: Defense
  /** The configuration that fully blocks the attack. */
  secure: Defense
  /** Optional real token the server expects (for bound-token labs). */
  sessionToken?: string
  /** Whether the scenario reveals the victim's token (leaked / predictable). */
  leakedToken?: boolean
  objectives: string[]
  hints: string[]
  /** Short guided walkthrough shown in the "help" panel. */
  walkthrough: { title: string; body: string }[]
}

export const STAGE_ORDER: Stage[] = [
  'beginner',
  'intermediate',
  'advanced',
  'professional',
]

export const STAGE_LABEL: Record<Stage, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  professional: 'Professional',
}

export function defaultTrace(): TraceStep[] {
  return []
}
