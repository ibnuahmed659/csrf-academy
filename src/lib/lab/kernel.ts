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
      'Diyaarin',
      'Weeraryahanku wuxuu diyaariyay dabinka',
      `Weeraryahan ku jira bog uu isagu maamulo ayaa ku dhex daray ${spec.label.toLowerCase()} oo u jeeda ${url}.`,
      'info',
    ),
  )

  trace.push(
    step(
      'Dhibanaha',
      `${scn.victim.name} wuxuu furaa boggii weeraryahanka`,
      `${scn.victim.name} wuxuu soo galay ${scn.victim.site}, isla browser-kaasna wuxuu furtaa boggii weeraryahanka.`,
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
      label: 'Same-site iyada oo loo marayo XSS domain-walaal',
      detail: `SameSite=${defense.sameSite.toUpperCase()} wuxuu xannibaa codsiyada cross-site, laakiin weeraryahanku wuxuu koodh ku orodsiyaa domain-walaal la wadaago isla site-ka. Codsigaasi waa same-site, sidaas darteed browser-ku wuu ku daraa cookie-ga — waa dariiqa CSWSH.`,
    }
  } else if (defense.clientRedirect && topLevelGetNav) {
    cookieSent = true
    bypass = {
      label: 'Same-site iyada oo loo marayo redirect client-side',
      detail: `GET-ga cross-site wuxuu ku dhacaa gadget redirect same-site ah oo isla markiiba browser-ka (client-side) u leexiya URL-ka beddelaya xaaladda. Tallaabada labaad waa same-site, sidaas darteed cookie-ga waa la daray inkastoo SameSite=${defense.sameSite.toUpperCase()}.`,
    }
  } else if (defense.cookieInjection === 'refresh' && defense.sameSite === 'lax') {
    cookieSent = true
    bypass = {
      label: 'Daaqadda Lax oo lagu furay cookie refresh',
      detail:
        'Weeraryahanku marka hore wuxuu top-level u rarayaa bartilmaameedka, kaas oo dib u soo saara cookie-ga Lax oo fura daaqadda 2-da daqiiqo ah ee Lax u dhaqmo sida None. POST-ga cross-site ee xiga markaas waa la aqoonsadaa.',
    }
  } else if (defense.sameSite === 'lax') {
    cookieSent = topLevelGetNav
  } else {
    cookieSent = false
  }

  if (!cookieSent) {
    const reason =
      defense.sameSite === 'strict'
        ? 'SameSite=STRICT marnaba cookies-ka kuma daro codsiyada cross-site — xitaa top-level navigations.'
        : `SameSite=LAX wuxuu cookies-ka ku daraa oo keliya top-level GET navigations. ${spec.kind === 'navigation' ? spec.method + ' navigation' : 'background ' + spec.method} ma aha mid ka mid ah, sidaas darteed cookie lama diro.`
    trace.push(step('Browser-ka', 'Cookie-ga waa la celiyay', reason, 'block'))
    trace.push(
      step(
        'Server-ka',
        'Codsigu waa mid aan la aqoonsan',
        'Maadaama uusan jirin session, server-ku ma awoodo inuu falka u nisbeeyo dhibanaha — waxba ma isbeddelaan.',
        'info',
      ),
    )
    return { pwned: false, blockedBy: `SameSite=${defense.sameSite.toUpperCase()}`, trace }
  }

  trace.push(
    step(
      'Browser-ka',
      'Session cookie-ga waa la daray',
      `Cookie-gu waa SameSite=${defense.sameSite.toUpperCase()}, sidaas darteed browser-ku wuxuu request-kan ku daraa session-ka dhibanaha.`,
      'ok',
    ),
  )
  if (bypass) trace.push(step('Browser-ka', bypass.label, bypass.detail, 'warn'))

  // --- 2. Method discipline + method override -------------------------------
  const overridden = defense.methodOverride && spec.method === 'GET'
  const effectiveMethod: Method = overridden ? 'POST' : spec.method
  if (overridden) {
    trace.push(
      step(
        'Server-ka',
        'Method override waa la aqbalay',
        'Codsigu wuxuu yimaadaa isagoo GET ah laakiin wuxuu wataa _method=POST (ama X-HTTP-Method-Override). Server-ku wuu aqbalaa oo wuxuu falka u farsameeyaa sida POST.',
        'warn',
      ),
    )
  }

  if (defense.requirePost && effectiveMethod !== 'POST') {
    trace.push(
      step(
        'Server-ka',
        'Waa la diiday: method lama oggola',
        'Endpoint-ku wuxuu aqbalaa POST oo keliya, codsiganna waa GET aan la override-gelin.',
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'POST-only endpoint', trace }
  }

  // --- 3. Required custom header --------------------------------------------
  if (defense.customHeader) {
    trace.push(
      step(
        'Server-ka',
        'Waa la diiday: custom header ayaa maqan',
        'Endpoint-ku wuxuu dalbaa custom header (tusaale X-Requested-With). Codsi HTML cross-site ah ma dhigi karo mid la\'aantiis CORS preflight, oo server-ku diido.',
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'Required custom header', trace }
  }

  // --- 4. Origin validation --------------------------------------------------
  if (defense.originCheck) {
    trace.push(
      step(
        'Server-ka',
        'Waa la diiday: Origin khaldan',
        `Server-ku wuxuu isbarbardhigaa Origin/Referer. Wuxuu arkaa asalka weeraryahanka, ma aha ${origin}, sidaas darteed wuu diidaa codsiga.`,
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'Origin check', trace }
  }

  // --- 5. Referer validation -------------------------------------------------
  if (defense.refererCheck === 'exact') {
    trace.push(
      step(
        'Server-ka',
        'Waa la diiday: Referer khaldan',
        `Server-ku wuxuu dalbaa in Referer uu la mid noqdo ${origin}. Codsi cross-site ah had iyo jeer wuxuu wataa referer-ka weeraryahanka, sidaas darteed waa la diidaa.`,
        'block',
      ),
    )
    return { pwned: false, blockedBy: 'Referer check', trace }
  }
  if (defense.refererCheck === 'if-present') {
    trace.push(
      step(
        'Server-ka',
        'Referer-ka waa la boodaa marka uu maqan yahay',
        'Server-ku wuxuu xaqiijiyaa Referer oo keliya marka header-ku jiro. Weeraryahanku wuxuu ku daraa <meta name="referrer" content="no-referrer">, sidaas darteed header-ka waa la boodaa oo hubintu marnaba ma socoto.',
        'warn',
      ),
    )
  } else if (defense.refererCheck === 'contains') {
    trace.push(
      step(
        'Server-ka',
        'Referer-ku wuxuu dhaafaa imtixaanka substring',
        `Server-ku wuxuu oo keliya hubiyaa haddii Referer *ku jiro* "${scn.victim.site}". Weeraryahanku wuxuu bixiyaa https://evil.example/?${scn.victim.site}, kaas oo ku jira, sidaas darteed wuu dhaafaa.`,
        'warn',
      ),
    )
  }

  // --- 6. Anti-CSRF token ----------------------------------------------------
  if (defense.token === 'none') {
    trace.push(
      step(
        'Server-ka',
        'Token lama filayo',
        'Endpoint-ku marnaba ma dalbado anti-CSRF token — waxba lama xaqiijinayo.',
        'warn',
      ),
    )
  } else if (defense.tokenMethodBound && spec.method === 'GET') {
    trace.push(
      step(
        'Server-ka',
        'Token-ka lama hubiyo GET-ka',
        'Token-ka waxaa la xaqiijiyaa oo keliya codsiyada POST. Maadaama codsigan been-abuurka ahi yahay GET, shuruudda token-ka gebi ahaanba waa la boodaa.',
        'warn',
      ),
    )
  } else if (defense.token === 'presence') {
    trace.push(
      step(
        'Server-ka',
        'Token-ka waxaa la hubiyaa oo keliya haddii uu jiro',
        'Server-ku wuxuu xaqiijinta token-ka ku duubay shuruud "haddii parameter-ku jiro". Weeraryahanku si fudud ayuu u boodaa parameter-ka csrf, sidaas darteed hubinta waa la dhaafaa.',
        'warn',
      ),
    )
  } else {
    const hasToken = attack.token.trim().length > 0
    if (!hasToken) {
      trace.push(
        step(
          'Server-ka',
          'Waa la diiday: CSRF token ayaa maqan',
          'Endpoint-ku wuxuu filayaa CSRF token laakiin codsigii been-abuurka ahaa midna ma qaadan.',
          'block',
        ),
      )
      return { pwned: false, blockedBy: 'Missing CSRF token', trace }
    }
    if (defense.token === 'unbound') {
      trace.push(
        step(
          'Server-ka',
          'Token waa la aqbalay (laakiin session kuma xidhna!)',
          `Server-ku wuxuu token-ka la bixiyay ("${attack.token}") ku barbardhigaa keyd la wadaago halkii session-ka dhibanaha. Token kasta oo u eg mid sax ah waa la aqbalaa — sidaas darteed token-ka weeraryahanka ayaa si fudud u dhaafaa.`,
          'warn',
        ),
      )
    } else if (defense.token === 'cookie') {
      if (defense.cookieInjection === 'crlf') {
        trace.push(
          step(
            'Server-ka',
            'Token-ka cookie-ga ku xidhan waxaa lagu been-abuuray CRLF',
            'Token-ka waxaa lala barbardhigaa qiime cookie. CRLF la soo celiyay oo ku jira endpoint-ka raadinta ayaa u oggolaanaya weeraryahanka inuu dhex geliyo cookie u dhigma browser-ka dhibanaha, sidaas darteed labada dhinac waxay noqdaan qiimaha weeraryahanka.',
            'warn',
          ),
        )
      } else {
        trace.push(
          step(
            'Server-ka',
            'Waa la diiday: token cookie-ga ku xidhan',
            'Token-ku waa inuu la mid noqdaa qiimaha cookie-ga dhibanaha, kaas oo weeraryahanku aanu dhigi ama akhrin karin.',
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
            'Server-ka',
            'Waa la diiday: CSRF token aan sax ahayn',
            `Token-ku waa inuu la mid noqdaa qiimaha lagu abuuray session-ka ${scn.victim.name}. Weeraryahanku ma akhrin karo, sidaas darteed qiimaha been-abuurka ah waa la diidaa.`,
            'block',
          ),
        )
        return { pwned: false, blockedBy: 'Session-bound CSRF token', trace }
      }
      trace.push(
        step(
          'Server-ka',
          'Token waa la aqbalay',
          'Token-ka la bixiyay wuxuu la mid yahay session-ka dhibanaha. Tan waxay dhacdaa oo keliya marka token-ku soo daadegay ama la qiyaasi karo.',
          'warn',
        ),
      )
    }
  }

  // --- 7. Impact -------------------------------------------------------------
  trace.push(
    step(
      'Saamaynta',
      'Xaaladdii waa isbeddeshay — weerarkii waa guulaystay',
      `${scn.action.label}: "${scn.action.before}" → "${scn.action.after}". Dhibanuhu marnaba ma ujeedin tan.`,
      'ok',
    ),
  )

  trace.push(step('Falanqayn', pwnedNote(defense), reusedHint(defense), 'info'))

  return { pwned: true, trace }
}

function pwnedNote(defense: Defense): string {
  const gaps: string[] = []
  if (defense.token === 'none') gaps.push('anti-CSRF token')
  if (defense.token === 'presence') gaps.push('token la xaqiijiyo oo keliya marka uu jiro')
  if (defense.token === 'unbound') gaps.push('token aan session-ka ku xidhnayn')
  if (defense.token === 'cookie' && defense.cookieInjection === 'crlf')
    gaps.push('token cookie-ga ku xidhan oo CRLF been-abuuri karo')
  if (defense.tokenMethodBound) gaps.push('token la hubiyo oo keliya POST-ka')
  if (!defense.originCheck) gaps.push('xaqiijinta Origin')
  if (defense.refererCheck === 'if-present') gaps.push('xaqiijinta Referer oo booda header-ka maqan')
  if (defense.refererCheck === 'contains') gaps.push('isbarbardhigga Referer substring')
  if (!defense.requirePost) gaps.push('endpoint lagu kicin karo GET')
  if (!defense.customHeader) gaps.push('custom header loo baahan yahay')
  if (defense.methodOverride) gaps.push('parameter method-override')
  if (defense.cookieInjection === 'refresh') gaps.push('daaqadda Lax cookie oo la refresh-gelin karo')
  if (defense.clientRedirect) gaps.push('gadget redirect client-side')
  if (defense.siblingXss) gaps.push('XSS domain-walaal')
  if (defense.sameSite === 'none') gaps.push('SameSite=None')
  return gaps.length
    ? 'Codsigu wuu dhaafay sababtoo ah endpoint-ka waxaa ka maqnaa ' + joinList(gaps) + '.'
    : 'Difaacyo badan ayaa maqnaa.'
}

function reusedHint(defense: Defense): string {
  if (defense.token === 'presence')
    return 'Xal: dalbo in token-ku jiro OO uu sax yahay — marnaba ha ku duubin hubinta "haddii uu jiro".'
  if (defense.tokenMethodBound)
    return 'Xal: token-ka u xaqiiji method kasta, ma aha POST oo keliya.'
  if (defense.token === 'cookie' && defense.cookieInjection === 'crlf')
    return 'Xal: jooji soo-celinta CRLF (input-ku wuxuu dib ugu soo noqdaa sida header output), oo token-ka server-side kaga xidh session-ka.'
  if (defense.refererCheck === 'if-present')
    return 'Xal: haddii aad xaqiijinayso Referer, sidoo kale diid codsiyada aan isaga lahayn (ama kiisaska Origin madhan).'
  if (defense.refererCheck === 'contains')
    return 'Xal: isbarbardhig asalka buuxa si isku mid ah — marnaba ha isticmaalin substring.'
  if (defense.cookieInjection === 'refresh')
    return 'Xal: deji SameSite=Strict, ama Lax kula lammaani token session-ka ku xidhan.'
  if (!defense.originCheck && defense.token === 'none')
    return 'Xal: ku dar token session-ka ku xidhan OO xaqiiji Origin — mid kasta keligiisba waa cabsi-adag.'
  if (defense.token === 'unbound')
    return 'Xal: token-ka ku xidh session-ka isticmaalaha (sir gaar u ah session kasta), ma aha qiime la wadaago.'
  return 'Xal: daar difaacyada haray ee Panel-ka difaaca oo mar kale orodsiiso.'
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} iyo ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, iyo ${items[items.length - 1]}`
}

export function attackSnippet(scn: LabScenario, attack: AttackInput): string {
  const spec = VECTORS[attack.vector]
  const url = `https://${scn.victim.site}${scn.action.path}`
  const params = attack.token.trim()
    ? { ...scn.action.params, csrf_token: attack.token.trim() }
    : { ...scn.action.params }
  return spec.snippet(url, params)
}
