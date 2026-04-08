# GuestGo Threat Model

## 1. Purpose
This threat model defines the security assumptions, assets, threat actors, attack vectors, and mitigations for GuestGo.
It is designed for the full system, including the frontend, backend, email services, Supabase integration, and the Python AI biometric microservice.

## 2. System Overview
GuestGo is a visitor management and gate access system with the following major components:

- **Frontend web application** built with Vite, TypeScript, Tailwind CSS
- **Authentication and authorization** using Supabase
- **Email sending endpoints** using Brevo and serverless APIs
- **QR code generation and scan workflows** for visit entry and exit
- **Face detection and verification** using a Python AI microservice and browser-based TFJS fallback
- **Encrypted biometric storage** for face images and templates
- **Dashboard and logs** for admin, guard, and personnel roles
- **ISO 25010 feedback survey** for post-visit quality assessment

## 3. Assets to Protect
GuestGo must protect these critical assets:

1. **Sensitive personal data**
   - visitor names, emails, phone numbers, visit purpose
   - visit IDs and schedule details
2. **Biometric data**
   - captured face images
   - encrypted face templates and embeddings
3. **Authentication credentials and sessions**
   - Supabase auth tokens
   - user roles and session state
4. **Email service secrets**
   - `BREVO_API_KEY`
   - email sender configuration
5. **Application integrity**
   - guard/dashboard logic
   - access control enforcement
   - visit status updates
6. **AI microservice endpoint**
   - `VITE_PYTHON_API_URL`
   - face detection and verification service
7. **Audit logs and analytics**
   - visit history
   - feedback survey results
   - face detection events

## 4. Trust Boundaries
The system crosses several trust boundaries that must be explicitly defended:

- **Client browser ↔ Supabase**
  - public frontend uses Supabase anon key
  - protected actions depend on Supabase RLS and auth
- **Client browser ↔ Serverless email API**
  - user input flows through `api/send-visit-email.ts` and `api/send-completion-email.ts`
- **Client/browser camera ↔ Python AI microservice**
  - face images are captured or sent to the AI endpoint
- **Frontend ↔ Backend/Serverless**
  - role-based UI is not a security boundary by itself
- **Cloud and deploy environment ↔ repository**
  - environment variables and secrets must remain confidential

## 5. Threat Actors
The main threat actors likely to target GuestGo include:

- **Random internet attackers** probing exposed services
- **Unauthorized visitors** trying to bypass gate controls
- **Malicious insiders** with access to Supabase or deployment configs
- **Competitors or attackers** interested in biometric data
- **Automated bots** abusing public API endpoints
- **Third parties** attempting to discover or exploit cloud secrets

## 6. Attack Vectors
These are the most relevant attack vectors for GuestGo:

### 6.1 API misuse and abuse
- Open CORS or permissive API response headers allow external sites to call email endpoints.
- Public POST endpoints can be abused to spam emails or reveal system behavior.

### 6.2 Authentication and authorization bypass
- Client-side role checks can be bypassed.
- If Supabase RLS or server-side access control is weak, attackers can manipulate visit data or access guard dashboards.

### 6.3 Data injection and malformed input
- Email content and HTML templates interpolate user input directly.
- Malicious names or visit fields could break display, cause injection, or enable social engineering.

### 6.4 Secret leakage
- `.env.local` or environment variables can leak API keys if not protected.
- Secrets in logs or public config files can expose the Brevo API or other services.

### 6.5 Biometric privacy abuse
- Face images and biometric templates are highly sensitive.
- If encryption is weak or access control fails, users can be re-identified or subject to privacy violations.

### 6.6 AI service exposure
- The Python AI microservice is client-facing via `VITE_PYTHON_API_URL`.
- If unauthenticated or poorly protected, it can be probed, abused, or used to reconstruct sensitive biometric data.

### 6.7 Dependency and deployment risk
- Third-party packages may contain vulnerabilities.
- Cloud deployments may have misconfigurations that expose data or services.

## 7. Impact Categories
If these threats are realized, the likely impacts are:

- **Privacy breach** of visitor and biometric data
- **Unauthorized gate access** or false check-in/check-out events
- **Account takeover** or unauthorized dashboard access
- **Reputational harm** from a security incident
- **Service abuse** via email or AI API misuse
- **Regulatory or compliance issues** from biometric data misuse

## 8. Mitigations and Controls
These controls should be implemented for GuestGo:

### 8.1 Secure authentication and authorization
- enforce Supabase RLS for all protected data
- validate user roles on the server side
- do not trust client-side role logic alone

### 8.2 Restrict API access
- limit CORS origins in production
- require authentication for sensitive endpoints when possible
- validate request methods and payloads strictly

### 8.3 Protect sensitive data
- encrypt biometric face data at rest with strong keys
- restrict access to face archives and only decrypt in authorized views
- store only the minimum biometric data needed for verification

### 8.4 Harden email handling
- escape or sanitize user content before placing it in HTML
- add request size limits and content validation
- prevent arbitrary HTML injection in email templates

### 8.5 Protect secrets and environment variables
- add `.env*` to `.gitignore`
- do not commit API keys or deployment secrets
- use secure secret storage in Vercel/Render/Supabase

### 8.6 Secure the AI microservice
- authenticate or rate-limit requests to `VITE_PYTHON_API_URL`
- validate face input before processing
- monitor AI service traffic for abnormal usage

### 8.7 Maintain secure deployment practices
- keep dependencies up to date and audit them regularly
- review Vercel/Render settings for exposed endpoints
- configure logging without leaking secrets

## 9. Recommended Threat Model Summary
For GuestGo, the most appropriate threat model is a combination of:

- **Web application data protection**
- **API abuse and authentication bypass**
- **Biometric privacy and face-data protection**
- **Cloud secret leakage and deployment risk**

This means your security focus should be on protecting both user data and the integrity of gate access flows, with extra attention placed on biometric data handling and public API exposure.

## 10. How to use this document
- include this section in your thesis as the security analysis
- map each threat vector to system components in your architecture diagram
- use the mitigations as acceptance criteria for security validation
- reference the design in your `SECURITY_TEST_RESULTS.md` and related thesis documentation
