# Security Architecture & Risk Controls

## 1. Authentication & Password Security
- **Password Hashing**: Uses salted PBKDF2-HMAC-SHA256 with 100,000 iterations and cryptographically generated salts (`secrets.token_hex(16)`).
- **Session Tokens**: Tamper-evident JWT tokens using HMAC-SHA256 signatures with expiration validation (`exp` claims).
- **Zero Plaintext Secrets**: No secrets, database passwords, or JWT keys are committed to source control.

## 2. API & Injection Protection
- **Strict Schema Validation**: Incoming payloads are validated via Pydantic v2 schemas; requests with invalid data types or out-of-bound numerical inputs are rejected before processing.
- **SQL Injection Prevention**: All database queries are executed through SQLAlchemy parameterized expressions; zero raw string interpolation is permitted.
- **Cross-Origin Resource Sharing (CORS)**: Configured with explicit origin whitelists.
- **Client Security**: Sanitized rendering for educational markdown content to prevent Cross-Site Scripting (XSS).

## 3. Financial Integrity & Calculation Isolation
- **AI Sandboxing**: The AI Finance Tutor does **not** have access to the execution or financial calculation engines. It is an educational conversational interface backed by vetted static citations.
- **Deterministic Calculations**: Financial indicators (SMA, EMA, RSI, ATR), position sizing, and backtests execute deterministic Python code verified against mathematical test fixtures.
- **Monetary Precision**: All monetary calculations preserve 2-decimal precision (INR paise) and apply integer floor constraints on share allocation.

## 4. Compliance & Privacy (DPDP Act)
- User data is isolated per account.
- Guest sessions do not store personally identifiable documents or Aadhaar/PAN cards.
- Paper trading records are completely isolated from real-money broker networks.
