# A TO Z Store

## Current State
- 16 static products with various prices stored in paise (price / 100 = Rs)
- ₹120 delivery charge added to every order at checkout
- Checkout sends email via EmailJS (fake keys) and falls back to opening `mailto:` which requires the customer to manually send the email

## Requested Changes (Diff)

### Add
- ₹130 added to each product's price (13000 paise added to each static product price)

### Modify
- Remove delivery charge (DELIVERY_CHARGE = 0, hide delivery line from UI)
- Fix email flow: remove the mailto fallback that opens the customer's email client. Order confirmation should complete automatically without requiring any manual action from the customer. Show a clean success state regardless of email outcome.

### Remove
- Delivery charge display in cart summary, checkout step 1, checkout step 2, checkout step 3
- Manual mailto fallback that opens the customer's email client

## Implementation Plan
1. Update all product prices in useQueries.ts by adding 13000 to each price
2. Set DELIVERY_CHARGE = 0 in CheckoutDialog.tsx
3. Hide delivery row from all 3 steps in CheckoutDialog (step 1 summary, step 2 amount display, step 3 items summary)
4. Remove openMailtoFallback function and its call from handleConfirmOrder — order should complete silently even if EmailJS fails
5. Hide delivery line in CartSheet footer if it shows delivery
