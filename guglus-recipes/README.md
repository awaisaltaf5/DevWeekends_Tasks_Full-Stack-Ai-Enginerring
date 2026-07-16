# 🍲 Guglu's Recipes

A responsive recipe discovery and organization web app built with **React**, **Vite**, and **Tailwind CSS**. Search thousands of global dishes, filter by diet and nutrition, view detailed step-by-step cooking guides, and save your favorites — all wrapped in a warm light mode and a sleek dark mode.

**🔗 Live App:** [guglus-recipes.vercel.app](https://guglus-recipes.vercel.app/)

---

## ✨ Features

- **Dual Theme** — Toggle between a warm, organic light mode and a sleek, premium dark mode
- **Smart Search** — Real-time recipe search with category filter pills (Breakfast, Lunch, Dinner, etc.)
- **Advanced Filtering** — Filter recipes by diet type, health labels, and calorie range powered by the Edamam API
- **Recipe Cards** — Clean cards showing title, image, cooking time, and category at a glance
- **Detailed Recipe View** — Dual-tab layout separating Ingredients (visual cards) from step-by-step Instructions
- **Bookmarks & Collections** — Save recipes and organize them into custom folders
- **Persistent Bottom Navigation** — Mobile-first nav bar (Home, Search, Saved, Profile) that adapts to a sidebar on larger screens
- **Fully Responsive** — Optimized layouts for mobile, tablet, and desktop
- **Animated Welcome Screen** — Smooth entrance animations on first launch

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS v3.4.19 |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Animations | Framer Motion |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge |
| Recipe Data | [TheMealDB API](https://www.themealdb.com/api.php) |
| Filtering & Nutrition | [Edamam Recipe Search API](https://developer.edamam.com/edamam-recipe-api) |
| Persistence | LocalStorage (bookmarks, collections, theme) |
| Deployment | Vercel |

---

## 📱 How It Works

- **TheMealDB** powers the core recipe search, categories, ingredients, and instructions.
- **Edamam** powers advanced filtering — diet type (balanced, high-protein, low-carb, low-fat), health labels (vegan, vegetarian, keto, gluten-free, dairy-free, and more), and calorie range.
- Search results and filtered results are merged into a consistent recipe card format regardless of which API the data came from.

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── ui/             # Buttons, cards, inputs, loaders, empty states
│   ├── layout/          # AppShell, BottomNav, ThemeToggle
│   ├── recipe/          # RecipeCard, HeroCard, FilterModal, IngredientCard, InstructionStep, ToggleTabs
│   └── profile/         # CollectionFolder, UserBioCard
├── pages/                # WelcomePage, HomePage, RecipeDetailPage, ProfilePage
├── hooks/                # useTheme, useRecipes, useRecipeDetail, useCollections
├── services/             # api.js, mealdb.js, edamam.js
├── context/              # ThemeContext
├── utils/                # helpers.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🧭 Routes

| Page | Route | Description |
|---|---|---|
| Welcome | `/welcome` | Onboarding screen with animated intro |
| Home | `/` | Search, category filters, featured recipe, recipe grid |
| Recipe Detail | `/recipe/:id` | Full recipe with ingredients and instructions tabs |
| Profile | `/profile` | User bio, saved recipes, and collections |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/awaisaltaf5/guglus-recipes.git
cd guglus-recipes

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

The app uses the Edamam Recipe API for filtering. Create a `.env` file in the project root:

```
VITE_EDAMAM_APP_ID=your_app_id
VITE_EDAMAM_APP_KEY=your_app_key
```

> TheMealDB requires no API key.

### Build for Production

```bash
npm run build
```

---

## 🎨 Design

Guglu's Recipes uses a custom Tailwind color palette:

- **Light mode** — warm coral primary (`#E07A5F`) on a soft cream background (`#FEFAE0`)
- **Dark mode** — golden amber primary (`#F2CC8F`) on a deep navy background (`#1A1A2E`)

Icons are provided entirely by [Lucide React](https://lucide.dev/) for a clean, consistent, emoji-free UI.

---

## 📸 Preview

Visit the live app: **[guglus-recipes.vercel.app](https://guglus-recipes.vercel.app/)**

---

## 👤 Author

**Muhammad Awais Altaf**
- GitHub: [@awaisaltaf5](https://github.com/awaisaltaf5)
- LinkedIn: [muhammad-awais-562087418](https://www.linkedin.com/in/muhammad-awais-562087418)

---

## 📄 License

This project is open source and available for personal and educational use.
