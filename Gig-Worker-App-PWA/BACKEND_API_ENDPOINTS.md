# Earnings Shield Backend API Endpoints

Base URL (local): `http://localhost:5000/api`

Auth: Bearer JWT in `Authorization` header.

## 1. Authentication

### POST /auth/firebase
Create/login user from Firebase identity.

Request:
```json
{
  "email": "worker@example.com",
  "displayName": "Dharaneesh R S",
  "photoURL": "https://...",
  "uid": "firebase_uid",
  "providerId": "google.com"
}
```

Response:
```json
{
  "_id": "...",
  "name": "Dharaneesh R S",
  "email": "worker@example.com",
  "role": "worker",
  "profile": {
    "avatar": "https://...",
    "platform": "Rapido",
    "zone": "Coimbatore",
    "segment": "transportation",
    "dailyEarnings": 1200,
    "orderCapacity": 50,
    "workShift": "day",
    "workHours": 8
  },
  "policy": {
    "tier": "Standard Shield",
    "planId": "standard",
    "weeklyPremium": 45,
    "active": true,
    "claimBanUntil": null,
    "fraudStrikeCount": 0
  },
  "payout": { "method": "upi" },
  "token": "jwt"
}
```

### POST /auth/login
Phone/email login. Superuser credentials also supported.

### GET /auth/profile
Returns current user profile + policy + payout + token.

### PUT /auth/profile
Persist user work profile and payout settings.

Request:
```json
{
  "profile": {
    "segment": "commodity",
    "platform": "Amazon",
    "dailyEarnings": 1500,
    "workShift": "night",
    "workHours": 10,
    "zone": "Coimbatore"
  },
  "payout": {
    "method": "upi",
    "upiId": "name@upi"
  }
}
```

### POST /auth/upgrade-policy
Upgrade selected plan. Premium is dynamically recalculated from multiple factors.

Request:
```json
{
  "planId": "premium",
  "tier": "Premium Shield",
  "segment": "transportation",
  "dailyEarnings": 1800,
  "platform": "Rapido",
  "workShift": "night",
  "workHours": 12
}
```

Response includes persisted policy + profile.

### GET /auth/tax-documents
Returns tax docs metadata for logged-in user.

## 2. Claims

### POST /claims/create
Create claim with GPS coordinates.

Request:
```json
{
  "type": "Heavy Rain",
  "hours": 4,
  "lat": 10.998,
  "lng": 76.966,
  "note": "Flooded roads"
}
```

Behavior:
- Saves claim in MongoDB
- Calls FastAPI score endpoint (`FASTAPI_URL/score-claim`)
- Emits realtime updates
- Creates notifications
- If fraud flagged:
  - user moved to Basic plan
  - premium increased
  - claim submission ban for 3 days

### GET /claims/my-claims
Returns all claims of logged-in user.

### GET /claims/my-summary
Returns KPI summary for profile:
```json
{
  "protectedAmount": 1200,
  "claimsFiled": 6,
  "activeWeeks": 3,
  "approvedClaims": 3,
  "pendingClaims": 2,
  "rejectedClaims": 1
}
```

## 3. Location

### POST /location/update
Update live user GPS location and history log.

Request:
```json
{
  "lat": 10.998,
  "lng": 76.966,
  "accuracy": 8,
  "timestamp": 1710000000000,
  "source": "gps"
}
```

## 4. Notifications

### GET /notifications
List user notifications (claim received/approved/rejected/fraud).

### GET /notifications/unread-count
Get unread notification count for top bell indicator.

### POST /notifications/:id/read
Mark single notification read.

### POST /notifications/mark-all-read
Mark all notifications read.

## 5. Ticketed Support Chat

### GET /chat/tickets
List all tickets for logged-in user.

### GET /chat/claims
List recent claims for ticket linking.

### POST /chat/tickets
Create ticket after intake.

Request:
```json
{
  "category": "claim",
  "relatedClaimId": "665f....",
  "question": "Claim pending for 48 hours"
}
```

### POST /chat/tickets/:ticketId/message
Post message to ticket.

### POST /chat/tickets/:ticketId/escalate
Escalate to human agent.

### POST /chat/tickets/:ticketId/close
User closes ticket (cannot reopen).

### Admin ticket controls (for corporate dashboard)
- GET /chat/admin/tickets
- POST /chat/admin/tickets/:ticketId/close
- POST /chat/admin/tickets/:ticketId/reopen

## 6. Dashboard APIs (Corporate)

### GET /dashboard/summary
Real KPI aggregates from DB (no static values).

### GET /dashboard/kpis
Alias of summary metrics.

### GET /dashboard/live-claims
Optional query params:
- `status` = approved|pending|rejected
- `fraudFlag` = true|false
- `zone` = city
- `limit` = number

Returns claims with user profile + policy premium.

### PATCH /dashboard/claims/:claimId/status
Approve/reject/update claim by admin/superuser.

Request:
```json
{
  "status": "rejected",
  "reason": "Evidence mismatch",
  "instantAmount": 0,
  "heldAmount": 600
}
```

Creates user notification for decision.

### GET /dashboard/status
System connection status:
```json
{
  "status": "connected",
  "db_connected": true,
  "ai_connected": true,
  "dashboard_connected": true,
  "lastSync": "2026-..."
}
```

## 7. Swagger Docs

### GET /api-docs
Restricted to superuser role only.

## 8. Realtime Socket Events

Worker -> Server:
- `location:update`
- `claim:new`
- `chat:message`

Server -> Dashboard/Worker:
- `dashboard:location:update`
- `admin:claim:new`
- `claim_update`
- `notification`
- `chat:ticket:update`
- `chat:ticket:escalated`
