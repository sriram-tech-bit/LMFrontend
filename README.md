# ShelfLife frontend

Typed React + TypeScript application for the ShelfLife library API.

## Run it

1. Start the backend from `LibrararyManagementBackend` (`npm run dev`).
2. Copy `.env.example` to `.env` if your API is not at `http://localhost:3000/api`, then set `VITE_API_URL`.
3. Run `npm install` and `npm run dev` from this folder.
4. Open `/register` to create the first librarian account on an empty database. After successful registration, sign in at `/login`. If a librarian already exists, attempting registration redirects to sign-in; authenticated admins can add more librarians from the registration page.

The frontend consumes the API response envelope (`{ success, message, data, pagination }`) and sends protected requests with `Authorization: Bearer <token>`. The registration and login pages call `POST /api/auth/register` and `POST /api/auth/login`; book/member reads, book issue, and member history use the corresponding `/api` routes from the backend.

## State management

Page-specific form, filter, and loading state uses React local state because the screens have small, isolated data flows. A small React Context shares only authentication and toast notifications across routes; introducing a global state library would add complexity without a shared-cache requirement.
