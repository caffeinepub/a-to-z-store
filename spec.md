# A TO Z Store

## Current State
- Full e-commerce store with product listing, cart, checkout (3-step: details → pay via UPI → confirm)
- Orders are stored in backend but only with basic fields (userId, items, totalPrice, status)
- No customer contact info (name, phone, address) or payment proof stored in backend
- No admin panel to view orders
- Frontend uses local cart (no backend dependency for browsing)

## Requested Changes (Diff)

### Add
- `CustomerOrder` type in backend with: id, customerName, email, phone, address, items (with product names + prices), totalPrice, paymentProofUrl, status, createdAt
- `saveCustomerOrder(order)` public shared function (no auth required, any visitor can submit)
- `getAllOrders()` admin-only query to retrieve all customer orders
- Admin Orders Panel page at `/admin` route (or toggled via a secret button)
- Admin login with a hardcoded password (e.g. "atozadmin123") — frontend only, no backend auth needed
- Orders list showing: order ID, customer name, phone, address, items, total, payment proof image, timestamp
- Payment proof displayed as a thumbnail that expands on click

### Modify
- Checkout flow: on "Confirm Order", save the full order (customer details + items + payment proof) to backend via `saveCustomerOrder`
- Header: add a small hidden "Admin" link (e.g. at bottom of page in footer or accessible via URL)

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` to add `CustomerOrder` type, `saveCustomerOrder` (public, no auth), and `getAllOrders` (admin only)
2. Regenerate `backend.d.ts`
3. Add Admin page component with password gate → orders list
4. Update checkout flow to call `saveCustomerOrder` on order confirmation
5. Add route/toggle to access admin panel (via `/admin` path or hidden link in footer)
6. Validate and deploy
