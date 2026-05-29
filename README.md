# Recurrly

Recurrly is a mobile subscription tracker built with Expo and React Native. It helps users see their active
subscriptions, upcoming renewals, monthly spending, and account settings in one simple app.

## Main Features

- Sign up, sign in, email verification, and sign out using Clerk authentication.
- Home dashboard with the user's account email, avatar, monthly subscription total, and next renewal date.
- Upcoming subscriptions section showing renewals that are coming soon.
- Full subscriptions screen with search by name, plan, category, billing, status, or payment method.
- Add a new subscription with name, price, billing frequency, and category.
- Expand a subscription card to view payment method, category, start date, renewal date, and status.
- Delete a specific subscription from the expanded subscription card.
- Insights screen with monthly spend, active subscription count, weekly spending chart, recent history, and upcoming
  renewals.
- Settings screen with signed-in account details and sign out support.
- Bottom tab navigation for Home, Subscriptions, Insights, and Settings.

## Project Skills

- React Native app development with Expo.
- File-based routing with Expo Router.
- Authentication flow with Clerk.
- Shared state management with React Context.
- Reusable UI components for headings, cards, modals, and tab icons.
- Form handling for creating subscriptions.
- Filtering and searching subscription data.
- Date handling with Day.js for renewals and spending insights.
- Currency formatting for subscription prices.
- Responsive mobile styling with NativeWind and global CSS classes.
- TypeScript interfaces for app data and component props.

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Clerk
- NativeWind
- Day.js

## Project Structure

- `app/` contains the app routes, tabs, auth screens, and screen-level UI.
- `app/components/` contains reusable app components like subscription cards and list headings.
- `src/components/` contains shared feature components like the create subscription modal.
- `src/context/` contains shared subscription state.
- `lib/utils/` contains formatting and subscription insight helpers.
- `constants/` contains app data, icons, images, and theme values.

## Notes

The app currently uses local in-memory subscription state. Added and deleted subscriptions update while the app is
running, but they are not persisted to a database yet.
