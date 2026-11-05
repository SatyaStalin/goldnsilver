# DigiLocker KYC

DigiLocker (MeriPehchaan) is the live identity check on `/kyc`, next to manual document upload. A successful DigiLocker sign-in approves the customer immediately. Manual uploads stay on the admin KYC Review list until an admin approves or rejects them.

This note lists environment **names**, the browser flow, and what is stored. Client id and client secret belong only in `backend/.env`. Do not put them in `frontend/.env`.

Related documents:

- [Frontend and backend structure](./frontend-and-backend.md)
- [Database structure](./database.md)
- [Third-party integrations](./third-party-integrations.md)

Code:

- `backend/src/services/digilockerService.js` — authorize URL, token exchange, PAN and Aadhaar reads
- `backend/src/routes/kycRoutes.js` — start, finish, and the API callback
- `frontend/src/pages/KycPage.jsx` — consent, redirect, and the return from DigiLocker
- `backend/src/models/KycDocument.js` and `backend/src/models/User.js` — saved KYC

Spec used by the integration: Requester Meri Pehchaan API (OAuth 2.0 with PKCE S256). Authorize and token hosts default to `https://digilocker.meripehchaan.gov.in`.

## When KYC is required

Checkout asks for KYC only when the server-computed order value is at least ₹2,00,000. The gate reads `users.kycStatus`. `approved` unlocks checkout. SafeGold buy and sell do not use this KYC check.

Either method can set that status:

| Method | After a successful submit | Admin KYC Review |
| --- | --- | --- |
| DigiLocker | `kycStatus` and the KYC document are `approved` at once | Not listed |
| Manual upload | Both stay `pending` until an admin approves or rejects | Listed |

The Users tab shows **KYC Type** as DigiLocker or Manual from `users.kycMethod`.

## Credentials

Register the app in the API Setu / DigiLocker partner portal. The Call Back URL and `DIGILOCKER_REDIRECT_URI` must be the same string: scheme, host, path, and no extra slash or space.

Production value used by this shop:

`DIGILOCKER_REDIRECT_URI=https://goldnsilver.shop/kyc`

That is the public KYC page, not the API callback path. DigiLocker compares it to the portal Call Back URL before it shows login. A mismatch returns `redirect_uri_mismatch` and does not send the browser back to the shop.

| Variable | Purpose |
| --- | --- |
| `DIGILOCKER_CLIENT_ID` | Partner client id. Required. Server only |
| `DIGILOCKER_CLIENT_SECRET` | Partner secret. Required. Server only. Used on the token call |
| `DIGILOCKER_REDIRECT_URI` | Exact Call Back URL registered in the portal |
| `DIGILOCKER_BASE_URL` | DigiLocker host. Default `https://digilocker.meripehchaan.gov.in` |
| `FRONTEND_URL` | Used only if the API callback path redirects the browser. Production should be the public site origin, for example `https://goldnsilver.shop` |

If id, secret, or redirect URI is missing, `POST /api/kyc/digilocker/start` returns 503.

Restart the backend after changing these. The frontend does not read DigiLocker secrets.

## Sign-in sequence

1. The customer is logged in, opens `/kyc`, accepts consent, and clicks **Verify with DigiLocker**.
2. The page calls `POST /api/kyc/digilocker/start` with the customer access token and `{ consentAccepted: true }`. Checkout can also send `fromCheckout: true`.
3. The API builds a PKCE S256 verifier, stores it inside a 15-minute state JWT (`purpose: digilocker`, user id, verifier, checkout flag), and returns an authorize URL.
4. The browser goes to `GET /public/oauth2/1/authorize` with `response_type=code`, `client_id`, `redirect_uri`, `state`, `code_challenge`, `code_challenge_method=S256`, `purpose=kyc`, `req_doctype=PANCR,ADHAR`, and `consent_valid_till` (about one hour ahead).
5. The customer signs in on DigiLocker and consents to share PAN (`PANCR`) and Aadhaar (`ADHAR`).
6. DigiLocker sends the browser to the Call Back URL with `code` and `state`. For this shop that is `https://goldnsilver.shop/kyc?code=...&state=...`.
7. `KycPage` posts `code` and `state` once to `POST /api/kyc/digilocker/finish`. The authorization code is single-use, so a React remount must not exchange it twice.
8. The API checks the state JWT, exchanges the code at `POST /public/oauth2/1/token` (form body: `grant_type=authorization_code`, `code`, `client_id`, `client_secret`, `redirect_uri`, `code_verifier`), then reads the identity.
9. On success the customer sees “DigiLocker KYC verified” and `kycStatus` is `approved`.

`GET /api/kyc/digilocker/callback` is the older API-shaped return. It runs the same save, then redirects to `FRONTEND_URL/kyc?digilocker=success|error`. The portal Call Back URL is the shop page `/kyc`, so the normal path is step 7, not this GET.

These two routes stay public (no customer access token and no API gate token): `GET /kyc/digilocker/callback` and `POST /kyc/digilocker/finish`. Start still requires a logged-in customer.

Start is refused when KYC is already `approved` or already `pending` (a manual upload waiting for review).

## What DigiLocker is asked for

After the token returns, the server calls, with `Authorization: Bearer`:

| Call | What it is used for |
| --- | --- |
| `GET /public/oauth2/1/user` | Name, date of birth, DigiLocker id, eAadhaar flag, reference key |
| `GET /public/oauth2/3/xml/eaadhaar` | Aadhaar XML when eAadhaar is available: name, date of birth, address, UID |
| `GET /public/oauth2/2/files/issued` | Issued documents. PAN is the item whose type or URI contains `PANCR` |
| `GET /public/oauth2/1/xml/uri?uri=` and `GET /public/oauth2/1/xml/{uri}` | PAN XML if the number is not already on the token or the document URI |

The PAN is accepted from the first source that contains a valid PAN (`ABCDE1234F` shape):

1. `pan_number` on an `id_token`, when DigiLocker sends one
2. The access-token `scope` string (often `issued/in.gov.pan-PANCR-<PAN>`)
3. The issued PAN document URI
4. The PAN XML body
5. The eAadhaar XML, if a PAN happens to be present there

A name of at least two characters and a valid PAN are required. If the PAN is missing, the save is aborted and the customer is told to add PAN in DigiLocker or use Upload Documents. Tokens and XML are not written to logs.

Aadhaar is whatever DigiLocker returns on the UID. A full 12-digit UID is stored in `aadhaarNumber`. A masked UID still stores the last four digits. DigiLocker often returns only the last four.

## What is saved

One `kycdocuments` row per user. A later submit replaces that row.

On the user (`users`):

| Field | DigiLocker success |
| --- | --- |
| `kycStatus` | `approved` |
| `kycMethod` | `digilocker` |
| `kycSubmittedAt`, `kycVerifiedAt` | Time of the successful exchange |
| `kycRejectedReason` | Cleared |

On the KYC document:

| Field | Contents |
| --- | --- |
| `method` | `digilocker` |
| `status` | `approved` |
| `fullName`, `panNumber`, `dateOfBirth`, `address` | From the DigiLocker profile and eAadhaar |
| `aadhaarLast4` | Last four digits when a UID is present |
| `aadhaarNumber` | Full 12 digits only when DigiLocker sends them. Empty when the UID is masked |
| `digilocker.requestId` | DigiLocker account id (`digilockerid`) |
| `digilocker.status` | `completed` |
| `digilocker.verifiedName`, `verifiedPan`, `verifiedAadhaarLast4` | Values used for the approval |
| `digilocker.panUri` | Issued PAN document URI, when the issued-files call returns one |
| `digilocker.referenceKey` | DigiLocker account reference key, when the token or profile includes it |
| `consentAccepted`, `consentAt` | Consent from the KYC page |
| `reviewedBy` | Empty. No admin action |
| `documents` | Empty. Scans are only for manual upload |

The customer KYC page shows a masked PAN and the Aadhaar last four. It does not show the full Aadhaar number or the DigiLocker secret. Admin KYC Review does not list DigiLocker rows. Opening Users or KYC Review also approves any older DigiLocker row that already has a PAN but was still `pending`.

## Manual upload

**Upload Documents** is unchanged. It still requires name, PAN, consent, and the three scans, and it stays `pending` until an admin approves or rejects it on KYC Review. Rejected customers can submit again. An approved customer cannot submit either method again.

## Errors that show up in production

| What the customer sees | Cause |
| --- | --- |
| `redirect_uri_mismatch` on the DigiLocker host, before login | `DIGILOCKER_REDIRECT_URI` is not character-for-character the portal Call Back URL. Fix the env, restart the backend |
| Button stays on `/kyc` and a toaster says DigiLocker could not be opened | DigiLocker sent the browser back with `error` and no `code`. The page shows `error_description` |
| “PAN was not found in DigiLocker” after returning | Sign-in worked, but none of the PAN sources above contained a valid PAN. The customer must share the issued PAN, or use Upload Documents |
| “KYC is already approved” | This user already has `kycStatus: approved` |
| 503 DigiLocker is not configured | Client id, secret, or redirect URI is empty on the server that is actually running |

The authorize URL must stay the parameter set above. Extra `scope` or `acr` values are not sent. Adding them has caused DigiLocker to refuse the login page for this client.
