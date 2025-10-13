##  Weather API Migration Notice

**Change:**
- Added a new additive field `weather` in the V2 response.
- V1 remains active but will be deprecated soon.

**Timeline:**  
- Suggested cutover date: **2025-12-01**  
- Deprecation of V1: **2026-01-15**

**Action Required:**  
- All clients should switch to `GET /v2/trips/search`.
- V2 includes the new `weather` field .
- No breaking changes — existing fields from V1 are preserved.

