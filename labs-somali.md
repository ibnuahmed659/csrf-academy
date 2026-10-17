# CSRF Labs — Somali Content

This file contains all learner-facing text for the 20 labs. Translate the
values only. Each lab is keyed by its `id` — keep the ids and the field
names unchanged.

Fields:
- **title** — cinwaanka lab-ka
- **summary** — sharaxaad kooban
- **takeaway** — casharka kooban ee la muujiyo marka la xalliyo
- **victimDisclosure** — halka victim-ku ka signed in yahay
- **actionLabel** — magaca ficilka
- **actionBefore** / **actionAfter** — xaaladda account-ka ka hor/ka dib
- **objectives** — yoolalka lab-ka
- **hints** — tilmaamo tartiib-tartiib ah ("Nudges")
- **walkthrough** — kaarar dib-u-eegis (cinwaan + qoraal)

---

## 1. `classic-post`

**title:**  form-ka ee caadiga ah

**summary:** Vault Bank wuxuu kuu oggolaanayaa inaad email-kaaga ku beddesho POST caadi ah oo aan lahayn token. Samee request been-abuur ah iyadoo victim-ku signed in yahay.

**takeaway:** Request wax ka beddelaya xaaladda oo aan lahayn anti-CSRF token waxa laga been-abuuri karaa website kasta oo victim-ku booqdo.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay Vault Bank.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** amina@vault.example

**actionAfter:** attacker@evil.example

**objectives:**
1. Samee request been-abuur ah oo Amina email-keeda u beddelaya attacker@evil.example
2. U fiirso sida session cookie-gu si toos ah ula socdo request-ka

**hints:**
1. Cross-site POST laga soo diro form qarsoon waa CSRF vector-ka caadiga ah.
2. Dooro “Form → POST” oo weerarka bilow.

**walkthrough:**
- **Sababta uu u shaqeeyo:** Endpoint-ku wuxuu aaminaa request kasta oo wata session cookie sax ah. Browser-ku si toos ah ayuu cookie-ga ugu daraa cross-site requests marka SameSite=None yahay.
- **Xalka:** Dalbo CSRF token u gaar ah session kasta. Weeraryahanku ma akhrin karo token-ka victim-ka, sidaas darteed request-ka been-abuurka ahi wuu fashilmaa.

---

## 2. `samesite-lax`

**title:** Marka SameSite=Lax aanu ku filnayn

**summary:** Cookie-gu hadda waa SameSite=Lax, sidaas darteed cross-site POST kuma raaco — balse endpoint-ku weli GET ayuu aqbalaa. Raadi vector-ka weli shaqaynaya.

**takeaway:** SameSite=Lax wuxuu xannibaa cross-site POST, laakiin cookies-ka weli wuxuu ku daraa top-level GET navigations. Oggolaanshaha GET ee endpoint wax ka beddelaya xaaladda wuxuu dib u furayaa nuglaanta.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay KeepSafe.

**actionLabel:** Demi two-factor recovery

**actionBefore:** Recovery waa daaran yahay

**actionAfter:** Recovery waa dansan yahay

**objectives:**
1. Demi recovery-ga account-ka Daniel adigoo adeegsanaya GET-based vector
2. Ogaaw in POST form-ka uu xannibmo sababo la xiriira SameSite=Lax

**hints:**
1. POST-ku cookie-ga ma wato marka Lax la adeegsanayo — balse top-level GET navigation ayaa wadata.
2. Isku day vector-ka “Link / redirect” ama “Image (GET)”… navigation-ka oo keliya ayaa shaqaynaya.

**walkthrough:**
- **Macnaha Lax:** Lax wuxuu cookies-ka diraa oo keliya marka ay jiraan top-level GET navigations. `<img>` waa subresource gadaal ka shaqeeya, sidaas darteed waa la xannibaa; link-ga victim-ku gujiyo se waa navigation, sidaas darteed waa la oggolaadaa.
- **Xalka:** Marna ha u oggolaan GET inuu xaalad beddelo. Dalbo POST iyo session-bound token labadaba si navigation iyo form forgery midna u shaqayn waayaan.

---

## 3. `get-image`

**title:** Sawirka aan muuqan

**summary:** Metrics endpoint-ku wuxuu aqbalaa isbeddellada settings-ka isagoo adeegsanaya GET iyo query parameters. Ku dhex geli request adigoo adeegsanaya `<img>` kiciya marka boggu furmo.

**takeaway:** GET kasta oo xaalad beddela waxa kicin kara subresource sida image, stylesheet ama iframe — gujin looma baahna.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay Streamly.

**actionLabel:** Raac account-ka weeraryahanka

**actionBefore:** Ma raacayo evil_actor

**actionAfter:** Wuxuu raacayaa evil_actor

**objectives:**
1. Ka dhig Priya inay raacdo evil_actor iyada oo aan waxba gujin

**hints:**
1. GET-ka `<img>` si qarsoodi ah ayuu u kiciyaa inta boggu load-garaysanayo.
2. Dooro “Image (GET)” oo orodsiiso.

**walkthrough:**
- **Subresources-ka aamusan:** Browsers-ku si toos ah ayay u soo fetch-gareeyaan images, iframes iyo stylesheets. Haddii kuwaasi xaalad beddeli karaan, weeraryahanku uma baahna wax interaction ah.
- **Xalka:** GET ku koob akhriska, qoraalladana ku samee POST; dabadeed qoraallada ku ilaali token.

---

## 4. `samesite-strict`

**title:** Fahamka difaac adag

**summary:** Bartilmaameedkani wuxuu dejinayaa SameSite=Strict. Isku day vector kasta oo sharax sababta midkoodna u qaadi karin session-ka victim-ka.

**takeaway:** SameSite=Strict wuxuu cookie-ga ka reebaa dhammaan cross-site requests — waa difaac aasaasi ah oo fudud oo waxtar badan.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay OneStore.

**actionLabel:** Cinwaanka weeraryahanka u deji default ahaan

**actionBefore:** Default: home

**actionAfter:** Default: attacker drop

**objectives:**
1. Orodsiiso ugu yaraan saddex vector oo kala duwan, kuna xaqiiji in cookie-ga aan la dirin
2. Difaaca ku sharax hal jumlad

**hints:**
1. Marka Strict la joogo, cross-site request — GET ama POST — midna ma noqonayo mid authenticated ah.
2. Isku day form-ka, image-ka iyo link-ga. Browser-ku dhammaantood waa inuu xannibaa.

**walkthrough:**
- **Sababta aan waxba u gudbin:** Strict wuxuu cookie-ga ka reebaa cross-site request kasta. Request-ka been-abuurka ahi wuxuu yimaadaa isagoo anonymous ah, server-kuna cidna kuma xiro.
- **Xaddidaad:** Strict wuxuu carqaladayn karaa hababka saxda ah ee top-level navigation; taas awgeed websites badan waxay Lax ku lammaaniyaan token.

---

## 5. `token-unbound`

**title:** Token qof walba aamina

**summary:** Endpoint-ku hadda wuxuu dalbanayaa CSRF token — laakiin wuxuu hubiyaa oo keliya in token-ku sax yahay, mana hubiyo inuu victim-ka leeyahay. Adigu keen token-kaaga.

**takeaway:** Token lagu hubiyo kayd guud halkii session-ka lagu xiri lahaa wax difaac ah ma bixiyo: weeraryahanku wuxuu adeegsan karaa token isaga u gaar ah oo sax ah.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay PayFlow.

**actionLabel:** Ku dar payee

**actionBefore:** Payees: midna ma jiro

**actionAfter:** Payees: DE00EVIL0000

**objectives:**
1. Ku dar payee weeraryahan leeyahay inkastoo token loo baahan yahay
2. Request-ka been-abuurka ah geli token adigu kuu gaar ah

**hints:**
1. Server-ku wuxuu aqbalaa token kasta oo qaab sax ah leh. Adigu mid keen.
2. Dooro POST form-ka, wax ku qor token field-ka, dabadeed orodsiiso.

**walkthrough:**
- **Tokens aan la xidhin:** Haddii server-ku tokens-ka ku xaqiijiyo liis guud, attacker authenticated ah wuxuu token ka soo qaadan karaa account-kiisa oo dib ugu adeegsan karaa kan victim-ka.
- **Xalka:** Token-ka ku kaydi session-ka victim-ka oo la barbar dhig qiimahaas saxda ah.

---

## 6. `token-bound`

**title:** Token aan laga geli karin

**summary:** Hadda token-ku wuxuu ku xidhan yahay session-ka, SameSite-na waa Lax. Caddee in aanay suurtagal ahayn in request-ka la been-abuuro adigoon akhrin bogga victim-ka.

**takeaway:** Session-bound token-ku wuxuu joojiyaa CSRF sababtoo ah weeraryahanku ma akhrin karo mana saadaalin karo sirta victim-ka.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay MediBook.

**actionLabel:** Dib ugu meelee ballanta

**actionBefore:** Waxaa loo qoondeeyay Lena

**actionAfter:** Waxaa loo qoondeeyay weeraryahanka

**objectives:**
1. Isku day inaad request-ka been-abuurto, kuna xaqiiji in token check-ku ku joojinayo
2. Sharax sababta aanu weeraryahanku token-ka u heli karin

**hints:**
1. POST form-ka waxaa joojinaya SameSite=Lax — u beddel Link / GET navigation si request-ku dhab ahaan server-ka u gaaro.
2. Ma taqaanid token-ka Lena, sidaas darteed server-ku token check-ga ayuu request-ka ku diidayaa.

**walkthrough:**
- **Caqabadda:** Token-ka akhrintiisu waxay u baahan tahay in code-ka weeraryahanku ka dhex shaqeeyo origin-ka victim-ka (XSS). CSRF keligiis ma gaadhi karo.
- **Difaac is-dulsaaran:** Token-ka oo lala isticmaalo SameSite=Lax wuxuu adkaynayaa in token la faafiyay cross-site loogu adeegsado.

---

## 7. `token-leak`

**title:** Token-kii bannaanka yaallay

**summary:** Token-ku session-ka ayuu ku xidhan yahay — laakiin app-ku sidoo kale wuxuu ku daraa URL-ka bogga, halkaas oo weeraryahanku ka xadi karo. Isku xidh xog-baxa iyo request been-abuur ah.

**takeaway:** Session-bound token-ku waxa uu u xoog badan yahay inta uu sir yahay oo keliya. Haddii uu baxo (URLs, logs, referrers), jidkii CSRF dib ayuu u furmaa.

**victimDisclosure:** Waxaad signed in uga tahay DocuHub; token-ku wuxuu ka muuqdaa profile URL-kiisa.

**actionLabel:** Beddel password-ka account-ka

**actionBefore:** Password: user-ku doortay

**actionAfter:** Password: weeraryahanku maamulo

**objectives:**
1. Soo hel token-ka Tomas ee baxay oo ku dheji POST-ga been-abuurka ah
2. Beddel password-kiisa inkastoo token-ku session-ka ku xidhan yahay

**hints:**
1. Token-ka victim-ka ee baxay waxa lagu muujiyay victim panel-ka — koobi garee.
2. Ku dheji token field-ka ee POST form vector-ka.

**walkthrough:**
- **Meelaha tokens-ku ka baxaan:** Token-ka URL-ka oo la geliyo wuxuu ka muuqan karaa Referer header-ka, browser history-ga, server logs-ka iyo links la wadaago. Marka uu baxo, difaacu wuu burburaa.
- **Xalka:** Tokens-ka ka ilaali URLs, Origin-na u xaqiiji difaac labaad ahaan, kuna xidh session-ka.

---

## 8. `custom-header`

**title:** Fetch metadata oo la dhaqan-geliyay

**summary:** API-gani wuxuu u baahan yahay X-Requested-With header. Isku day inaad request-ka HTML ku been-abuurto oo ogow sababta bog cross-site ahi u samayn kari waayo.

**takeaway:** Dalbashada custom header-ku waxay khasab ka dhigtaa CORS preflight, kaas oo server-ku diidi karo — waa difaac adag oo JSON APIs ah.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay CloudDesk.

**actionLabel:** Ka noqo security key

**actionBefore:** Key k-2039 waa active

**actionAfter:** Key k-2039 waa la revoke-gareeyay

**objectives:**
1. Isku day vector kasta oo xaqiiji in custom header-ka loo baahan yahay uu xannibayo
2. Sharax doorka CORS preflight

**hints:**
1. Requests HTML keliya ahi ma dejin karaan custom headers.
2. Fetch-ku wuxuu u baahan lahaa header-ka, taas oo dhalinaysa preflight uu server-ku diido.

**walkthrough:**
- **Caqabadda preflight-ka:** Ku darista X-Requested-With waxay request-ka ka dhigtaa non-simple CORS request. Browser-ku marka hore wuxuu diraa OPTIONS preflight; haddii server-ku aanu oggolaan, request-ka dhabta ahi marnaba ma baxo.
- **Isku dar difaacyada:** Custom-header checks-ku si fiican ayay ula shaqeeyaan SameSite iyo tokens si loo helo difaac heerar badan leh.

---

## 9. `origin-check`

**title:** Albaabka Origin

**summary:** Token ma jiro — waxa keliya oo jira waa xaqiijin adag oo Origin/Referer ah oo lagu sameeyo request kasta oo xaalad beddela. Caddee inaan request been-abuur ahi iska dhigi karin origin-ka ilaha.

**takeaway:** Origin/Referer checks-ku waxay diidaan cross-site requests sababtoo ah boggu ma been-abuuri karo origin header-kiisa.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay AdminPanel.

**actionLabel:** Sii role-ka admin

**actionBefore:** attacker: member

**actionAfter:** attacker: admin

**objectives:**
1. Isku day inaad request-ka been-abuurto, kuna xaqiiji in Origin check-ku diido
2. Sharax sababta aanu weeraryahanku Origin u spoof-gareyn karin

**hints:**
1. Origin-ka browser-ka ayaa dejinaya, script-na ma maamuli karo.
2. Orodsiiso vector kasta; server-ku request-ka wuu tuurayaa isagoo soo celinaya badbaadinta badnayn ee Origin.

**walkthrough:**
- **Lama spoof-gareyn karo:** Cookie ama hidden form field kama duwana, Origin (iyo Referer) header-ka browser-ka ayaa u doorta request-ka dhabta ah. Bogga weeraryahanku waxa keliya oo uu sheegi karaa origin-kiisa.
- **Ka taxaddar null:** Ka digtoonow sandboxed iframes iyo redirects keeni kara null Origin — taasna si cad u xaqiiji.

---

## 10. `double-submit`

**title:** Double-submit oo qayb ahaan la xaqiijiyay

**summary:** App-ku wuxuu adeegsadaa double-submit cookie, balse qiimaha marna random kama dhigo mana xidho — geli lammaane is-waafaqa, endpoint-kana waa la khiyaaneeyaa.

**takeaway:** Double-submit-ku wuxuu shaqeeyaa oo keliya haddii cookie value-gu yahay mid aan la saadaalin karin, cookie-gana aanu weeraryahanku beeran karin.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay Marketplace.

**actionLabel:** Aqbal listing xaasidnimo leh

**actionBefore:** item-ku wuu sugayaa

**actionAfter:** item-ka waa la ansixiyay

**objectives:**
1. Gudbi cookie/body token pair is-waafaqa si aad uga gudubto double-submit check-ga
2. Ansixi listing-ka xaasidnimada leh

**hints:**
1. Qiimaha la aqbalo waa mid joogto ah — waa constant la yaqaan, mana aha sir random ah.
2. Isticmaal POST form-ka oo geli qiimaha token-ka la yaqaan.

**walkthrough:**
- **Sababta double-submit-ku u fashilmi karo:** Haddii cookie value-gu joogto yahay ama la saadaalin karo, ama weeraryahanku cookies ka dejin karo domain-ka bartilmaameedka (tusaale, subdomain la xidhiidha), wuxuu keeni karaa lammaane is-waafaqa.
- **Adkee:** Token-ka session kasta ka dhig random, saxeex, session-ka ku xidh, cookie-gana calaamadee Secure + HttpOnly marka ay suurtagal tahay.

---

## 11. `method-override`

**title:** Token-ka POST oo keliya ilaaliya

**summary:** Token-ka waxa la xaqiijiyaa oo keliya marka request-ku yahay POST. Habka u beddel GET si check-ga looga boodo — email-ku weli wuu isbeddelayaa.

**takeaway:** Method-ku difaac ma aha. Haddii token-ka la xaqiijiyo oo keliya marka method-ku yahay POST, GET ayaa ka dhex baxsanaya.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay lab-ka.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Beddel email-ka inkastoo token khasab yahay
2. Method-ka u beddel GET si token check-ga looga boodo

**hints:**
1. Token-ka waxa la xaqiijiyaa oo keliya marka POST la adeegsado — isku day GET.
2. Dooro “Form → GET” oo orodsiiso request-ka.

**walkthrough:**
- **Token ku xidhan method-ka:** Server-ku token-ka wuxuu xaqiijiyaa oo keliya marka method-ku yahay POST. GET uma baahna token, sidaas darteed weeraryahanku GET ayuu adeegsadaa.
- **Xalka:** Token-ka ku xaqiiji method kasta, marna ha u oggolaan GET inuu xaalad beddelo.

---

## 12. `token-presence`

**title:** Token ay tahay inuu keliya jiro

**summary:** CSRF token wuu jiraa waana la hubiyaa — laakiin keliya haddii uu request-ka ku jiro. Token-ka ka tirtir request-ka, check-guna ma shaqaynayo.

**takeaway:** Jiritaanku saxnaansho ma aha. Haddii check-ga lagu xidho “haddii uu jiro”, token-ka oo la saaro ayaa ka boodsiinaya.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay lab-ka.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Beddel email-ka adigoo token-ka ka tirtiraya request-ka
2. Dhis exploit form aan lahayn csrf input haba yaraatee

**hints:**
1. Server-ku token-ka wuxuu xaqiijiyaa oo keliya haddii uu request-ka ku jiro.
2. Dooro “Form → POST” oo token field-ka madhan ka tag.

**walkthrough:**
- **Token ku xidhan jiritaanka:** Code-ku wuxuu leeyahay: haddii csrf jiro, xaqiiji. Haddii uu maqan yahay, check ma shaqaynayo. Weeraryahanku si fudud ayuu token-ka uga tagaa request-ka.
- **Xalka:** Token-ku waa inuu jiraa waana inuu sax noqdaa — waligaa check-ga ha ku duubin “haddii uu jiro”.

---

## 13. `token-cookie-crlf`

**title:** Token ku xidhan cookie khaldan

**summary:** csrfKey cookie-gu kuma xidhna session-ka, CRLF injection-na wuxuu weeraryahanka u oggolaanayaa inuu cookie ku beero browser-ka victim-ka.

**takeaway:** Laba qaybood oo “secure” ah oo si xun la isugu daray way is-baabi'in karaan. Marka qoraalku code isu beddelo, headers-ku way jabi karaan.

**victimDisclosure:** Waxaad signed in uga tahay lab-ka; csrfKey waa cookie aan HttpOnly ahayn.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. CRLF injection ku beer csrfKey cookie-ga browser-ka victim-ka
2. Beddel email-ka adigoo adeegsanaya cookie-ga aad maamusho

**hints:**
1. Search endpoint-ku input-ka ayuu dib u soo bandhigaa — %0d%0a wuxuu noqdaa xadka header-ka.
2. Dooro “Form → POST” — ka dhig cookie-ga la beeray iyo body token-ku inay is-waafaqaan.

**walkthrough:**
- **Dhibaatada isku-darka:** Session cookie-gu waa HttpOnly, balse csrfKey sidaas ma aha, labadooduna isma xidhna. Haddii weeraryahanku dejin karo csrfKey cookie-ga, cookie-bound token-ku wuu fashilmaa.
- **Buundada CRLF:** input = test%0d%0aSet-Cookie:%20csrfKey=attacker — server-ku wuxuu soo saaraa Set-Cookie labaad, sidaas darteed weeraryahanku cookie-ga ayuu maamulaa.

---

## 14. `double-submit-crlf`

**title:** Token-ka cookie-ga lagu nuqulay

**summary:** Double submit: csrf cookie-gu waa inuu la mid noqdaa csrf body-ga. Weeraryahanku wuxuu adeegsadaa CRLF injection si uu csrf=fake ugu beero browser-ka victim-ka.

**takeaway:** Double submit-ku wuxuu ku tiirsan yahay qiyaas ah: “weeraryahanku cookies ma dejin karo”. CRLF injection-ku qiyaastaas ayuu burinayaa.

**victimDisclosure:** Waxaad signed in uga tahay lab-ka; endpoint-ku wuxuu isbarbardhigaa csrf cookie-ga iyo csrf body-ga.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Adeegso CRLF injection si aad u beerato csrf=fake cookie
2. Body-ga ku dir isla qiimahaas si double-submit check-gu u gudbo

**hints:**
1. Server-ku wuxuu isbarbardhigaa body token-ka iyo cookie token-ka.
2. Haddii labaduba isku mid yihiin (fake), request-ka waa la aqbalayaa.

**walkthrough:**
- **Statelessness-ku waa tanaasul:** Double submit-ku state-ka stateless ayuu ka dhigaa isagoo cookie adeegsanaya. Laakiin haddii weeraryahanku cookie-ga maamuli karo (CRLF), labada dhinacba waa laga dhigi karaa isku qiime.
- **Xalka:** Token-ka random ka dhig, saxeex oo session-ka ku xidh; waligaa ha u oggolaan input dib loo soo bandhigay inuu header noqdo.

---

## 15. `referer-present`

**title:** Referer validation oo maqnaanshaha aaminta

**summary:** Referer validation-ku wuxuu shaqeeyaa oo keliya marka header-ku jiro. Haddii Referer maqan yahay, server-ku request-ka wuu aqbalaa.

**takeaway:** Referer khasab ma aha. Haddii server-ku xaqiijiyo oo keliya marka uu jiro, weeraryahanku si fudud ayuu uga tagi karaa.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay lab-ka.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Ka saar Referer header-ka oo ka gudub check-ga
2. Beddel email-ka iyadoo Referer maqan yahay

**hints:**
1. Referer wuu maqnaan karaa — adeegso `<meta name="referrer" content="no-referrer">`.
2. Dooro “Form → POST” oo orodsiiso request-ka.

**walkthrough:**
- **Referer waa xogta macnaha guud:** Browser-ku si toos ah ayuu Referer u diraa, balse weeraryahanku wuu ka saari karaa. Haddii server-ku aanu hubin maqnaanshaha, request-ku wuu gudbayaa.
- **Xalka:** Diid requests aan lahayn Referer (ama leh Origin madhan), ama Origin si sax ah u xaqiiji.

---

## 16. `referer-substring`

**title:** Referer check eegaya qayb qoraal ah oo keliya

**summary:** Referer validation-ku wuxuu adeegsadaa substring match. Wuxuu aqbalaa Referer: https://evil.example/?web-security-academy.net.

**takeaway:** Contains waa ku-jirid; equals waa isku-mid ahaansho. Marka aad aqoonsi xaqiijinayso, sinnaanta hubi — marna ha ku tiirsanaan inuu qoraal meel ku jiro.

**victimDisclosure:** Browser-kan waxaad signed in uga tahay lab-ka.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Samee Referer uu domain-ka bartilmaameedku ku jiro balse meel kale tilmaamayo
2. Ka gudub substring check-ga oo beddel email-ka

**hints:**
1. Substring match-ku wuxuu aqbalaa https://evil.example/?web-security-academy.net.
2. Adeegso history.pushState("", "", "/?web-security-academy.net") dabadeed dir POST-ga.

**walkthrough:**
- **Contains iyo equals:** Domain-ku wuxuu ka muuqan karaa host, query, fragment, subdomain ama path. Substring test-ku waxyaalahan midkoodna si sax ah uma kala saaro — equality oo keliya ayaa sidaas samaynaysa.
- **Xalka:** Hubi in Origin/Referer oo dhammaystirani la mid yahay domain-kaaga.

---

## 17. `samesite-lax-override`

**title:** SameSite=Lax oo loo adeegsaday method override

**summary:** SameSite=Lax wuxuu cookie-ga diraa marka ay jiraan top-level GET navigations. Server-ku wuxuu aqbalaa _method=POST — sidaas darteed GET ayaa POST isu beddelaya.

**takeaway:** SameSite=Lax wuxuu aamminaa top-level navigation, balse navigation-ka weeraryahanku wuu maamuli karaa. Method override-ku wuxuu buuxinayaa shuruudda POST.

**victimDisclosure:** Waxaad signed in uga tahay lab-ka; cookie-gu waa SameSite=Lax.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Adeegso top-level GET navigation si Lax cookie-gu u baxo
2. Ku dar _method=POST si endpoint-ku u aqbalo

**hints:**
1. Lax cookie laguma diro cross-site POST — balse waxaa lagu diraa top-level GET navigation.
2. Query string-ka ku dar &_method=POST, dabadeed adeegso “Link / redirect”.

**walkthrough:**
- **Farqiga:** SameSite=Lax wuxuu arkaa GET; server-kuna POST ayuu arkaa. Labadu way is-khilaafaan — farqigaas ayaana weeraryahanku ka faa'iidaystaa.
- **Xalka:** Marna ha u oggolaan method override inuu xaalad beddelo; adeegso SameSite=Strict iyo token.

---

## 18. `samesite-strict-redirect`

**title:** SameSite=Strict oo loo adeegsaday client-side redirect

**summary:** SameSite=Strict wuxuu cookie-ga ka reebaa cross-site request kasta. Laakiin website-ku wuxuu leeyahay client-side redirect gadget oo kiciya request labaad oo same-site ah.

**takeaway:** SameSite=Strict wuu fashilmaa marka website-ka laftiisu leeyahay gadget. Request 1 waa buundada (same-site), request 2-na waa ficilka.

**victimDisclosure:** Waxaad signed in uga tahay lab-ka; cookie-gu waa SameSite=Strict.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Ka hel website-ka client-side redirect gadget-ka
2. Buundada (request 1) ku xidh ficilka (request 2)

**hints:**
1. Gadget-ku wuxuu qaataa cross-site GET, dabadeedna client-side ayuu ugu redirect-gareeyaa URL same-site ah.
2. Dooro “Link / redirect” oo orodsiiso request-ka.

**walkthrough:**
- **Client-side redirect:** Request 1 waa cross-site GET (cookie looma baahna). Gadget-ku browser-ka ayuu u leexiyaa URL same-site ah, Strict cookie-gana waa la diraa.
- **Xalka:** Adeegso difaac heerar badan leh: token, Origin validation iyo adkaynta input-ka bog kasta oo gadget ahaan u shaqayn kara.

---

## 19. `samesite-strict-sibling`

**title:** SameSite=Strict oo loo adeegsaday sibling-domain CSWSH

**summary:** SameSite=Strict wuxuu cookie-ga ka reebaa cross-site requests. Laakiin sibling domain ayaa leh XSS, sidaas darteed weeraryahanku wuxuu sameeyaa same-site request (CSWSH).

**takeaway:** “Site” ayaa ka ballaadhan “origin”. Sibling domain-ku waa isla site-ka — XSS-kaas ayaa ka gudba SameSite=Strict.

**victimDisclosure:** Waxaad signed in uga tahay lab-ka; cookie-gu waa SameSite=Strict.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Ka hel XSS-ka sibling domain-ka (cms-...)
2. Samee same-site request ka gudba SameSite=Strict

**hints:**
1. Sibling domain-ka (cms.example.com) wuxuu la wadaagaa isla site-ka.
2. XSS-ka sibling-ka ku jira wuxuu weeraryahanka u oggolaanayaa inuu diro same-site requests.

**walkthrough:**
- **Site iyo origin:** Strict wuxuu ku salaysan yahay site. Sibling domain-ku waa isla site-ka balse origin kale ayuu leeyahay — sidaas darteed XSS-kaas ayaa ka gudba Strict.
- **CSWSH:** WebSocket handshake-ku ma wato CSRF token. Same-site request-ku cookie-ga ayuu diraa, chat history-gana waa la xadaa.

---

## 20. `samesite-lax-refresh`

**title:** SameSite=Lax oo loo adeegsaday cookie refresh

**summary:** SameSite=Lax wuxuu leeyahay daaqad 2 daqiiqo ah — cookie hadda dib loo soo saaray wuxuu u dhaqmaa sida None.

**takeaway:** Cookie refresh-ku wuxuu furaa daaqadda Lax. Weeraryahanku cookie-ga ayuu refresh-gareeyaa, dabadeedna POST ayuu diraa.

**victimDisclosure:** Waxaad signed in uga tahay lab-ka; cookie-gu waa SameSite=Lax.

**actionLabel:** Beddel email-ka account-ka

**actionBefore:** test@test.com

**actionAfter:** attacker@evil.com

**objectives:**
1. Bogga bartilmaameedka ka fur tab cusub si cookie-ga dib loo soo saaro
2. Dir POST-ga inta daaqaddu furan tahay

**hints:**
1. Bogga top-level u fur (window.open) si Lax cookie-ga dib loo soo saaro.
2. Wax yar sug, dabadeed dir POST-ga (form).

**walkthrough:**
- **Daaqadda:** Cookie hadda dib loo soo saaray wuxuu 2 ilbiriqsi u dhaqmaa sida None — sidaas darteed cross-site POST ayaa wadan kara.
- **Xalka:** SameSite=Strict iyo session-bound token ayaa xidhaya daaqaddan.
