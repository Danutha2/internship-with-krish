

## API Rollout Plan: v1 → v2 (Using Canary Deployment)

To ensure a smooth migration from API v1 to v2, we will use the **Canary design pattern** to gradually roll out v2 without disrupting existing clients.

### Rollout Steps:

1. **Internal Testing**  
   Release v2 to internal or beta clients first for testing and validation.

2. **Canary Release**  
   Gradually route a small percentage of traffic to v2 while the majority of clients continue using v1. Monitor for errors and performance issues.

3. **Full Rollout Monitoring**  
   Increase traffic to v2 progressively. Track usage metrics of v1 vs v2.  

4. **Adoption Threshold**  
   When **>95% of requests** are handled by v2, the system will switch **completely to v2**, and v1 will be retired.

5. **Sunset Date**  
   - v1 API will be officially deprecated on **2026-01-15**.
   - All clients should switch to `GET /v2/trips/search`.
   - V2 includes the new `weather` field .
   - No breaking changes — existing fields from V1 are preserved.


6. **Behavior After v1 Retirement**  
   Any request to **v1 after it has been retired** will receive a clear **HTTP 410 Gone** response (or a suitable error message) indicating that the client must upgrade to v2.  
   - This ensures users are explicitly informed that v1 is no longer available.  
   - Clients will need to update their integration to v2 to continue using the service.

7. **Timeline:**  
- Suggested cutover date: **2025-12-01**  
- Deprecation of V1: **2026-01-15**
