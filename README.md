# e-commerce-we-app

Next.js + Tailwind frontend for the Spring Boot e-commerce API.

## Features

- Product catalog with filters and search
- Cart management and checkout
- Payment flow with approve/decline handling
- Saved payment methods (add, default, disable/enable)
- Customer profile update screen
- Orders and order detail views with payment attempts
- Admin dashboards (orders, users, products, categories)

## Run

```bash
npm install
npm run dev
```

Set API URL in `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

## Customer Checkout Flow

1. Add items to cart.
2. Click `Checkout` on cart page to create an order.
3. User is redirected to `/checkout/payment?orderId={id}`.
4. Select saved payment method (or add one inline), enter CVV, then pay.
5. If approved, order status changes to `PAID`; if declined, attempt is logged and user can retry.

## Profile + Payments

- `/profile` lets customers:
  - Update name/email/phone/address
  - Add payment methods
  - Set default payment method
  - Disable or re-enable a payment method
