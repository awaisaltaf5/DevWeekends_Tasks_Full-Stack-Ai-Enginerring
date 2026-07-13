🌍 SnapTrips — Modern Travel & Tour Booking Platform
https://snaptour-trip.netlify.app/
https://react.dev/
https://vitejs.dev/
https://tailwindcss.com/
Live Demo: https://snaptour-trip.netlify.app/
✨ Overview
SnapTrips is a modern, fully responsive travel and tour booking web application built with React 18, Vite, and Tailwind CSS. It features real-time location validation, iconic photo fetching from Unsplash, dark mode support, and a polished mobile-first design.
Key Highlights
🔍 Real-time Location Search — Validates cities via OpenStreetMap (Nominatim) API
📸 Iconic Photo Gallery — Fetches landmark-specific photos from Unsplash
🌙 Dark Mode — Full theme switching with persistent state
📱 Mobile Responsive — Optimized for all screen sizes
⚡ Fast Performance — Built with Vite for lightning-fast HMR and builds
🎨 Modern UI — Clean design with smooth animations and transitions
🚀 Tech Stack
Table
Category	Technology
Framework	React 18.2+
Build Tool	Vite 5.0+
Styling	Tailwind CSS 3.4+
Routing	React Router DOM v6
Icons	Lucide React
APIs	Unsplash API, Nominatim (OpenStreetMap)
Deployment	Netlify
📁 Project Structure
plain
snaptrips/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── atoms/           # Button, Heading, LoadingSpinner
│   │   ├── molecules/       # LoginModal, ScrollToTop
│   │   ├── organisms/       # Navbar, Footer, Newsletter, DestinationGrid, TestimonialCarousel, PackageList
│   │   └── templates/       # MainLayout
│   ├── contexts/            # AuthContext, SearchContext, ThemeContext
│   ├── data/                # Static JSON data (destinations, testimonials, packages, about)
│   ├── pages/               # HomePage, DestinationsPage, PackagesPage, AboutPage
│   ├── App.jsx              # Root component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind directives
├── .env                     # Environment variables (API keys)
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
🛠️ Getting Started
Prerequisites
Node.js 18+ and npm 9+
Unsplash API Key (free at unsplash.com/developers)
Installation
bash
# Clone the repository
git clone https://github.com/yourusername/snaptrips.git
cd snaptrips

# Install dependencies
npm install

# Create environment file
cp .env.example .env
Environment Variables
Create a .env file in the root directory:
env
# Unsplash API Access Key (required for iconic photo fetching)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
⚠️ Note: The app works without the Unsplash key but will use fallback images instead of iconic landmark photos.
Run Development Server
bash
npm run dev
Open http://localhost:5173 in your browser.
Build for Production
bash
npm run build
🌐 Deployment (Netlify)
This project is deployed on Netlify. To deploy your own:
Build the project:
bash
npm run build
Deploy to Netlify:
Drag and drop the dist/ folder to Netlify Drop
Or connect your GitHub repo for continuous deployment
Add environment variables in Netlify Dashboard → Site Settings → Environment Variables:
plain
VITE_UNSPLASH_ACCESS_KEY = your_key_here
📸 Features in Detail
🏠 Home Page
Full-screen hero with search bar (destination, date, guests)
Popular destination quick-tags
Guest dropdown with +/- controls
Destination cards grid
Testimonial carousel with auto-play
Newsletter signup section
🗺️ Destinations Page
Auto-scroll on page load (pauses on interaction, resumes after 5s)
Real-time search with location validation
Iconic photo gallery fetched from Unsplash
Category filtering (All, City, Beach, Mountain, Trending)
Sort options (Popular, Rating, Price)
Favorite/save destinations
Empty state with clear filters
📦 Packages Page
Curated tour packages listing
Package details with pricing
Filter and sort capabilities
ℹ️ About Page
Company story and mission
Statistics counter
Core values cards
Team member profiles
Trust badges and awards
Call-to-action section
🧩 Shared Components
Navbar — Fixed top, scroll shadow, active link indicator, full-screen mobile menu
Footer — Newsletter signup, social links, site map, contact info
Scroll-to-Top — Appears after 400px scroll
Login Modal — Authentication UI (context-managed)
Dark Mode Toggle — Persistent theme switching
🔌 API Integrations
Table
API	Purpose	Endpoint
Unsplash	Fetch iconic landmark photos	api.unsplash.com/search/photos
Nominatim	Validate real-world locations	nominatim.openstreetmap.org/search
🎨 Design System
Colors
Primary: Teal (#14b8a6)
Primary Light: Light Teal (#5eead4)
Primary Dark: Dark Teal (#0f766e)
Secondary: Amber (#f59e0b)
Background: White / Dark Gray (#111827)
Typography
Headings: Inter / system-ui, bold weights
Body: Inter / system-ui, regular weights
Responsive scaling: text-3xl mobile → text-5xl desktop
Spacing
Container max-width: Custom container-custom class
Section padding: py-12 mobile → py-20 desktop
Card gap: gap-6 (24px)

🐛 Known Issues & TODOs
[ ] Add real backend for user authentication
[ ] Implement booking/payment flow
[ ] Add map integration (Leaflet/Google Maps)
[ ] Create user dashboard for saved favorites
[ ] Add multi-language support (i18n)
[ ] Implement service worker for offline support
📄 License
This project is licensed under the MIT License.
🙏 Acknowledgments
Unsplash for the beautiful travel photography
OpenStreetMap / Nominatim for geocoding services
Lucide for the icon library
Tailwind CSS for the utility-first styling
👤 Author
Muhammad Awais Altaf
