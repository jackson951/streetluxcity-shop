# StreetLuxCity - Modern E-Commerce Platform

A premium, full-featured e-commerce web application built with **Next.js** and **Tailwind CSS**, designed to deliver an exceptional shopping experience with seamless backend integration. StreetLuxCity combines modern frontend architecture with robust business logic to create a scalable, user-friendly online store.

## 🎯 Project Overview

**StreetLuxCity** is a production-ready e-commerce platform that provides a complete shopping ecosystem for customers and comprehensive business management tools for administrators. The application features a responsive, intuitive interface with advanced functionality including real-time cart management, secure payment processing, order tracking, and powerful administrative capabilities.

**Tech Stack:**
- **Framework:** Next.js 16.1.6 with React 19.2.3
- **Styling:** Tailwind CSS 4 with custom design system
- **Form Management:** React Hook Form with Zod validation
- **State Management & API:** TanStack React Query with custom HTTP client
- **Authentication:** JWT-based auth with role-based access control
- **Language:** TypeScript 5 with strict type safety
- **UI Components:** Lucide React icons with custom components
- **Additional:** React Hot Toast for notifications, Google Maps integration

---

## ✨ Key Features

### Customer Features
- 🛍️ **Advanced Product Catalog** - Browse products with intelligent search, category filtering, price range sliders, and real-time availability indicators
- 🛒 **Smart Shopping Cart** - Real-time cart updates, quantity management, instant price calculations, and seamless item removal
- 💳 **Multi-Payment Support** - Save multiple payment methods, set defaults, enable/disable cards, and secure CVV entry
- ✅ **Streamlined Checkout** - Two-step checkout process with delivery/collection options, address validation, and order summary
- 📦 **Complete Order Tracking** - View order history with real-time status updates, payment history, and delivery tracking
- 👤 **Comprehensive Profile** - Update personal information, manage delivery addresses, and track order preferences
- 🎯 **Personalized Experience** - Remembered preferences, saved payment methods, and order history for returning customers

### Admin Features
- 📊 **Real-Time Order Management** - Live order dashboard with status tracking, bulk operations, and detailed order analytics
- 👥 **Advanced User Management** - Complete user oversight with role management, account activation/deactivation, and activity monitoring
- 📦 **Intelligent Product Management** - Create/edit products with image uploads, inventory tracking, category assignment, and availability controls
- 🏷️ **Dynamic Category Management** - Create, edit, and organize product categories with descriptions and metadata
- 💹 **Business Analytics** - Revenue tracking, order volume metrics, user engagement statistics, and inventory insights
- 🔐 **Role-Based Access Control** - Admin and customer role management with granular permissions

### Payment & Security Features
- ✅ **Multi-Gateway Support** - Robust payment processing with automatic approval/decline handling and retry mechanisms
- 🔄 **Smart Payment Retry** - Customers can retry declined payments with different methods or updated CVV
- 📋 **Complete Payment Audit** - Full transaction history with gateway responses, timestamps, and status changes
- 🔒 **Bank-Level Security** - Encrypted payment data, CVV validation, secure token-based authentication
- 🛡️ **Fraud Prevention** - Rate limiting, input validation, and secure session management

### Advanced Features
- 📍 **Google Maps Integration** - Real-time address validation and location-based delivery options
- 📱 **Mobile-First Design** - Fully responsive interface optimized for all devices and screen sizes
- ⚡ **Real-Time Updates** - Live cart totals, inventory status, and order notifications
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface with smooth animations and micro-interactions
- 🔔 **Smart Notifications** - Toast notifications for all user actions with appropriate feedback
- 🌐 **Multi-Currency Support** - Automatic currency conversion and localized pricing display

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- Spring Boot e-commerce API running (default: `http://localhost:8080/api/v1`)
- Google Maps API key (optional, for address validation)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jackson951/streetluxcity-shop.git
cd streetluxcity-shop
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_USD_TO_ZAR=18.5
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Running the Application

**Development mode:**
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

**Production build:**
```bash
npm run build
npm run start
```

**Linting:**
```bash
npm run lint
```

**Type checking:**
```bash
npm run type-check
```

**Development with TypeScript checking:**
```bash
npm run dev:type-check
```

---

## 📱 User Experience

### Customer Journey

#### **Product Discovery & Shopping**
1. **Explore Products** - Browse through categorized products with advanced filtering
2. **Smart Search** - Use intelligent search to find specific items quickly
3. **Product Details** - View detailed product information with high-quality images
4. **Add to Cart** - Instantly add items with real-time cart updates
5. **Cart Management** - Modify quantities, remove items, and see live price calculations

#### **Checkout Experience**
1. **Delivery Options** - Choose between delivery (with Google Maps address validation) or collection
2. **Smart Cart Review** - Review items with clear pricing and availability status
3. **Free Shipping Threshold** - Visual progress indicator for free shipping eligibility
4. **Secure Payment** - Two-step payment process with saved cards or new payment methods
5. **Order Confirmation** - Instant confirmation with order number and next steps

#### **Post-Purchase Experience**
1. **Order Tracking** - Real-time order status updates with delivery progress
2. **Payment History** - Complete transaction history with gateway responses
3. **Profile Management** - Easy access to personal information and payment methods
4. **Reorder Options** - Quick reordering of previous purchases

### Admin Experience

#### **Dashboard Overview**
- **Real-time Analytics** - Live metrics on orders, revenue, and user activity
- **Quick Actions** - Fast access to common administrative tasks
- **System Health** - Monitor key performance indicators and system status

#### **Order Management**
- **Live Order Feed** - Real-time updates on new orders and status changes
- **Bulk Operations** - Process multiple orders efficiently
- **Detailed Order View** - Complete order information with customer and payment details
- **Status Tracking** - Advanced order status management with automated workflows

#### **User & Product Management**
- **User Insights** - Comprehensive user analytics and behavior tracking
- **Role Management** - Granular permission controls and role assignments
- **Product Catalog** - Intuitive product management with bulk editing capabilities
- **Inventory Control** - Real-time stock tracking and low-stock alerts

### Key User Interface Features
- **Responsive Design** - Perfect experience across desktop, tablet, and mobile
- **Accessibility** - WCAG-compliant interface with keyboard navigation
- **Performance** - Lightning-fast loading with optimized images and caching
- **Intuitive Navigation** - Clear menu structure and breadcrumb navigation
- **Visual Feedback** - Smooth animations and micro-interactions
- **Error Handling** - Clear, actionable error messages with recovery options

---

## 🏗️ Project Architecture

### Application Structure
```
streetluxcity-shop/
├── src/
│   ├── app/                    # Next.js 16 App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Homepage
│   │   ├── login/              # Authentication pages
│   │   ├── register/           # User registration
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Payment flow
│   │   ├── products/           # Product catalog
│   │   ├── profile/            # User account
│   │   ├── orders/             # Order history
│   │   └── admin/              # Admin dashboard
│   ├── components/             # Reusable UI components
│   │   ├── navbar.tsx          # Navigation header
│   │   ├── footer.tsx          # Site footer
│   │   ├── product-card.tsx    # Product display
│   │   ├── payment-method-form.tsx
│   │   ├── virtualized-product-grid.tsx
│   │   └── route-guards.tsx    # Authentication guards
│   ├── contexts/               # React context providers
│   │   ├── auth-context.tsx    # Authentication state
│   │   └── cart-context.tsx    # Shopping cart state
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core utilities and services
│   │   ├── api.ts              # API service layer
│   │   ├── web-api.ts          # HTTP client with caching
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── utils.ts            # Helper functions
│   │   ├── validation.ts       # Form validation schemas
│   │   ├── order-tracking.ts   # Order status management
│   │   └── get-server-side-props.ts
│   └── providers.tsx           # App providers wrapper
├── public/                     # Static assets
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.mjs         # PostCSS configuration
└── eslint.config.mjs          # ESLint configuration
```

### Key Architecture Decisions

#### **Next.js App Router**
- **File-based routing** with server components by default
- **Client components** where interactivity is required
- **Server-side rendering** for SEO and performance
- **Dynamic routing** for product and order pages

#### **State Management**
- **React Context** for global state (auth, cart)
- **TanStack Query** for server state and caching
- **Local state** for component-specific data
- **Optimistic updates** for better UX

#### **API Architecture**
- **Custom HTTP client** with built-in caching and error handling
- **Type-safe API calls** with TypeScript interfaces
- **Automatic token refresh** and retry logic
- **Request/response interceptors** for consistent error handling

#### **Security & Authentication**
- **JWT-based authentication** with role-based access
- **Secure token storage** with automatic cleanup
- **Route protection** with context-based guards
- **Input validation** with Zod schemas

#### **Performance Optimization**
- **Image optimization** with Next.js built-in features
- **Code splitting** with dynamic imports
- **Query caching** with intelligent cache invalidation
- **Bundle optimization** with tree-shaking

---

## 📦 Technology Stack

### Frontend Framework
- **Next.js 16.1.6** - React framework with App Router, SSR, and optimized builds
- **React 19.2.3** - Latest React with concurrent features and improved performance
- **TypeScript 5** - Type-safe development with strict configuration

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework with custom design system
- **Lucide React 0.575.0** - Modern, consistent icon library
- **Custom Components** - Reusable, accessible UI components

### State Management & Data Fetching
- **TanStack React Query 5.90.21** - Server state management with caching, background updates, and synchronization
- **React Context** - Global state for authentication and cart
- **Custom HTTP Client** - Built on fetch with caching, error handling, and retry logic

### Form Handling & Validation
- **React Hook Form 7.71.2** - Performant, uncontrolled form library
- **Zod 4.3.6** - TypeScript-first schema validation
- **@hookform/resolvers 5.2.2** - Integration between React Hook Form and Zod

### Development & Tooling
- **ESLint 9** - Code quality and style enforcement
- **Babel Plugin React Compiler 1.0.0** - Automatic memoization and performance optimization
- **React Hot Toast** - User-friendly notification system

### Additional Features
- **Google Maps API Integration** - Address validation and location services
- **JWT Authentication** - Secure token-based authentication
- **Multi-Currency Support** - Automatic currency conversion and display
- **Real-time Updates** - Live data synchronization with the backend

---

## 🔐 Authentication & Security

- **JWT Tokens** - Used for authentication with the Spring Boot API
- **Secure Token Storage** - Tokens stored securely (implementation varies by deployment)
- **CVV Validation** - Payment CVV never stored on client; validated server-side
- **HTTPS Recommended** - Use HTTPS in production for secure data transmission
- **CORS Configuration** - Configured for secure cross-origin requests to backend

---

## 🛠️ Development Guide

### Adding New Features

1. **Create components** in `src/components/` with TypeScript
2. **Define types** in `src/types/` for type safety
3. **Use React Hook Form** for form inputs with Zod validation
4. **Manage server state** with TanStack React Query
5. **Style with Tailwind CSS** for consistent design
6. **Add API calls** through the service layer

### Code Quality
- Run ESLint regularly: `npm run lint`
- Use TypeScript for type safety
- Follow React 19 best practices
- Optimize with React Compiler plugin

---

## 🔄 API Integration

The application connects to a Spring Boot e-commerce API. Key endpoints:

```
Base URL: http://localhost:8080/api/v1

Authentication:
  POST   /auth/login              - User login
  POST   /auth/refresh            - Refresh JWT token

Products:
  GET    /products                - List products with filters
  GET    /products/:id            - Get product details
  GET    /categories              - List categories

Shopping:
  GET    /cart                    - Get user cart
  POST   /cart                    - Add to cart
  DELETE /cart/:itemId            - Remove from cart

Orders:
  POST   /orders                  - Create order
  GET    /orders                  - List user orders
  GET    /orders/:id              - Get order details

Payments:
  POST   /payments                - Process payment
  GET    /payments/:orderId       - Get payment history

Profile:
  GET    /profile                 - Get user profile
  PUT    /profile                 - Update profile
  POST   /payment-methods         - Add payment method
  GET    /payment-methods         - List payment methods
  DELETE /payment-methods/:id     - Remove payment method
```

---

## 📋 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |

**Note:** Any variable prefixed with `NEXT_PUBLIC_` is exposed to the browser; keep sensitive data server-side.

---

## 🧪 Quality Assurance

### Code Quality & Type Safety
- **TypeScript Strict Mode** - Comprehensive type checking with strict configuration
- **ESLint Configuration** - Code quality enforcement with modern React and TypeScript rules
- **React Compiler Integration** - Automatic performance optimizations and memoization
- **Form Validation** - Runtime validation with Zod schemas for all user inputs

### Development Workflow
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Development with type checking
npm run dev:type-check

# Build verification
npm run build
```

### Testing Strategy
The project is designed with testability in mind:
- **Component Testing** - Individual component behavior and rendering
- **Integration Testing** - API integration and data flow
- **E2E Testing** - Complete user workflows and scenarios
- **Performance Testing** - Load testing and performance monitoring

**Future Test Framework Integration:**
```bash
# Jest + React Testing Library (planned)
npm run test
npm run test:coverage

# Cypress for E2E (planned)
npm run test:e2e
```

---

## 📈 Performance & Scalability

### Frontend Performance
- **Next.js Image Optimization** - Automatic image optimization with WebP support and lazy loading
- **Code Splitting** - Route-based and component-based code splitting for optimal bundle sizes
- **React Compiler** - Babel plugin for automatic memoization and performance optimizations
- **Query Caching** - Intelligent caching with background updates and cache invalidation
- **Tailwind CSS Purging** - Automatic removal of unused CSS in production builds
- **Bundle Optimization** - Tree-shaking and dead code elimination

### Backend Integration Performance
- **HTTP Caching** - Intelligent caching strategy with cache headers and ETags
- **Request Batching** - Optimized API calls with request deduplication
- **Background Sync** - Offline support with background data synchronization
- **Real-time Updates** - WebSocket integration for live order and inventory updates

### Scalability Features
- **State Management** - Efficient state management with minimal re-renders
- **Virtualization** - Product grid virtualization for large catalogs
- **Pagination** - Server-side pagination for product listings
- **Search Optimization** - Debounced search with caching for better UX
- **Image Loading** - Progressive image loading with placeholders

### Monitoring & Analytics
- **Performance Metrics** - Core Web Vitals monitoring and optimization
- **Error Tracking** - Comprehensive error logging and reporting
- **User Analytics** - Behavior tracking and conversion funnel analysis
- **A/B Testing Ready** - Framework ready for experimentation and optimization

---

## 🚢 Deployment & DevOps

### Vercel (Recommended for Next.js)
**Perfect for Next.js applications with zero configuration:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push
5. **Benefits:** Automatic SSL, CDN, preview deployments, and performance monitoring

### Docker Deployment
**Containerized deployment for any environment:**
```dockerfile
# Multi-stage Dockerfile for optimal performance
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose for development:**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8080/api/v1
    volumes:
      - .:/app
      - /app/node_modules
```

### Traditional Server Deployment
**For custom server environments:**
```bash
# Build the application
npm run build

# Start in production mode
npm run start

# PM2 for process management (recommended)
npm install -g pm2
pm2 start npm --name "streetluxcity" -- start
pm2 save
pm2 startup
```

### CI/CD Pipeline
**GitHub Actions workflow example:**
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run type-check
      - run: npm run lint
      - uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Environment Configuration
**Production environment variables:**
```bash
# Required
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_USD_TO_ZAR=18.5

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_api_key
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Monitoring & Observability
- **Performance Monitoring** - Core Web Vitals tracking
- **Error Tracking** - Sentry integration for error monitoring
- **Uptime Monitoring** - Health checks and uptime alerts
- **Analytics** - User behavior and conversion tracking

---

## 🐛 Troubleshooting & Support

### Common Issues & Solutions

#### **Development Environment**
```bash
# Port already in use
npm run dev -- --port 3001

# Clear all caches
rm -rf .next node_modules package-lock.json
npm cache clean --force
npm install
npm run build

# TypeScript errors
npm run type-check
# Fix auto-fixable issues
npx tsc --noEmit --skipLibCheck
```

#### **API Connection Issues**
- **Backend not running:** Ensure Spring Boot API is accessible at configured URL
- **CORS errors:** Verify backend CORS configuration allows frontend domain
- **Authentication failures:** Check JWT token validity and expiration
- **Network timeouts:** Verify network connectivity and firewall settings

#### **Build & Deployment Issues**
- **Memory errors:** Increase Node.js memory limit: `NODE_OPTIONS="--max-old-space-size=4096"`
- **Dependency conflicts:** Use exact versions in package.json
- **Environment variables:** Ensure all required variables are set in production
- **Bundle size:** Check for large dependencies and implement code splitting

#### **Payment Flow Issues**
- **CVV validation:** Ensure payment method has valid CVV format
- **Token expiration:** Implement automatic token refresh
- **Order validation:** Verify order data structure matches API expectations
- **Payment gateway:** Check gateway configuration and credentials

#### **Performance Issues**
- **Slow loading:** Enable image optimization and implement lazy loading
- **Memory leaks:** Monitor component unmounting and cleanup
- **API calls:** Implement proper caching and request deduplication
- **Bundle size:** Analyze bundle with `npm run build --analyze`

### Debugging Tools

#### **Browser Developer Tools**
- **Network tab:** Monitor API calls and response times
- **Console:** Check for JavaScript errors and warnings
- **Application tab:** Inspect local storage and cookies
- **Performance tab:** Analyze rendering and JavaScript performance

#### **Development Tools**
- **React DevTools:** Component inspection and state debugging
- **Redux DevTools:** State management debugging (if using Redux)
- **TanStack Query DevTools:** API state and cache debugging
- **ESLint:** Real-time code quality feedback

### Getting Help

#### **Documentation**
- [Next.js Troubleshooting Guide](https://nextjs.org/docs/app/building-your-application/configuring/troubleshooting)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [TanStack Query Debugging](https://tanstack.com/query/latest/docs/framework/react/guides/debugging)

#### **Community Support**
- **GitHub Issues:** Report bugs and request features
- **Stack Overflow:** Search for existing solutions
- **Next.js Discord:** Real-time community support
- **React Community:** Official React support channels

#### **Professional Support**
- **Enterprise Support:** Available for production deployments
- **Consulting Services:** Custom development and optimization
- **Training Programs:** Team training and best practices workshops

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [TanStack Query](https://tanstack.com/query)
- [Zod Validation](https://zod.dev)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team
- Check existing documentation

---

**Happy coding! 🎉**