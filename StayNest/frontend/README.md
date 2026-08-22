# StayNest Frontend

A React single-page application for the StayNest hotel booking system, built
with **Vite**, **React 19**, **Tailwind CSS v4**, **Redux Toolkit**, **React
Router**, **Axios**, and **Lucide React**. The UI is built with Tailwind
directly — no heavy component library.

## Tech Stack

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Build        | Vite 8                                      |
| UI           | React 19 (React DOM 19)                     |
| Routing      | React Router DOM 7                          |
| Styling      | Tailwind CSS v4 (PostCSS, no config file)   |
| State        | Redux Toolkit + React Redux                 |
| HTTP         | Axios (shared `hotelApi` instance)          |
| Icons        | Lucide React                                |
| Font         | Inter (Google Fonts)                        |

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── api/hotelApi.js      # shared axios instance (auth interceptor)
│   │   └── store.js             # Redux Toolkit store
│   ├── features/
│   │   └── auth/
│   │       └── authSlice.js     # auth slice (token + user)
│   ├── components/
│   │   ├── layout/              # Layout, Navbar (responsive), Footer
│   │   └── ui/                  # Button, Card primitives
│   ├── pages/                   # Home, Hotels, HotelDetail, Login, Register,
│   │                            # Bookings, Saved, Account (placeholders)
│   ├── App.jsx
│   ├── index.css                # Tailwind v4 theme + base + components
│   └── main.jsx
├── .env                         # VITE_API_URL (git-ignored)
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── vite.config.js               # proxies /api -> localhost:5000
└── README.md
```

## Design System

The base design system lives in `src/index.css` and reflects the hotel brand
language:

- **White and very light gray** backgrounds (`--color-background` / `--color-card`)
- **Blue primary** accent (`--color-primary`) with a **cyan/teal accent**
  (`--color-accent`)
- Subtle shadows, rounded cards (`rounded-xl`)
- Clean Inter typography, spacious layouts

Reusable primitives: `Button` (`primary`/`secondary`/`ghost`) and `Card`.

## Routing

All routes render inside a responsive `Layout` (sticky navbar + footer) via
`react-router-dom` v7 `<Outlet />`:

| Route          | Page              |
|----------------|-------------------|
| `/`            | HomePage          |
| `/hotels`      | HotelsPage        |
| `/hotels/:id`  | HotelDetailPage   |
| `/login`       | LoginPage         |
| `/register`    | RegisterPage      |
| `/bookings`    | BookingsPage      |
| `/saved`       | SavedPage         |
| `/account`     | AccountPage       |

The navbar is responsive: a horizontal menu on desktop and a hamburger drawer
on mobile.

## Environment Variables

```
VITE_API_URL=http://localhost:5000/api
```

Only variables prefixed with `VITE_` are exposed to the browser bundle.

## Development

The Vite dev server proxies `/api` to the Express backend (`localhost:5000`),
so no extra CORS configuration is needed locally.

```bash
npm install
npm run dev      # http://localhost:3000
```

Build:

```bash
npm run build
npm run preview
```
