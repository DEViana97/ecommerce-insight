# Project Guidelines

## Architecture
- Stack: Next.js App Router + React + TypeScript, styled-components, React Query, Zustand.
- App shell and providers are in app/layout.tsx.
- Page-level composition lives in features/dashboard.
- Reusable UI components are in components.
- API routes (server aggregation over local JSON data) are in app/api.
- Shared data logic is in utils/dataHelpers.ts.
- Global UI and filter state is centralized in store/filtersStore.ts.

## Build And Validate
- Install: npm install
- Dev server: npm run dev
- Production build: npm run build
- Start production server: npm run start
- Lint: npm run lint
- There is currently no test script configured.

## Code Conventions
- Use TypeScript for all app logic and keep existing strict typing style.
- For client-side interactivity, place 'use client' at the top of the file.
- Prefer colocated styled-components inside each component file.
- Read design tokens from the active theme (theme.colors, theme.shadows, theme.radii) instead of hardcoding values.
- Keep responsive behavior aligned with existing breakpoints used across components (640, 768, 1024, 1200).
- Keep dashboard data fetching in React Query with stable query keys that include active filters.
- Keep API routes in app/api/*/route.ts and return NextResponse.json(...) from GET handlers.
- Reuse utility formatters in utils/formatCurrency.ts for money, number, percent, and date displays.

## State And Data Patterns
- Zustand store in store/filtersStore.ts is the source of truth for period, channel, category, theme, sidebar, and search query.
- Use focused selectors (for example, s => s.period) instead of selecting the full store object to avoid unnecessary rerenders.
- Dashboard UI calls API routes with URLSearchParams based on active filters.
- API routes load from data/orders.json and data/products.json, filter/aggregate on the server, and return shaped datasets.

## Project-Specific Pitfalls
- Date filtering is anchored to a fixed reference date (2025-03-16) in utils/dataHelpers.ts; keep this in mind when changing period logic.
- suppressHydrationWarning is used in app/layout.tsx; avoid introducing client/server rendering divergence in theme or layout state.
- React Query is configured with staleTime=5min and refetchOnWindowFocus=false in components/QueryProvider.tsx.
- This project currently has no automated tests; validate changes with lint and targeted manual checks.

## Key Files
- app/layout.tsx: Provider stack and root HTML/body setup.
- features/dashboard/DashboardContent.tsx: Main data-fetching and dashboard composition.
- store/filtersStore.ts: Global filter/theme/sidebar state.
- app/api/analytics/sales/route.ts: Sales KPI and time-series aggregation.
- app/api/analytics/conversion/route.ts: Funnel and conversion analytics.
- app/api/products/route.ts: Product ranking/aggregation endpoint.
- utils/dataHelpers.ts: Core filter, date-window, and KPI helpers.
- styles/theme.ts: Theme tokens used by styled-components.
