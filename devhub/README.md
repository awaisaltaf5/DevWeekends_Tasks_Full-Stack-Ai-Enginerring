# 🚀 DevHub — GitHub Repository Discoverer

A modern, responsive **GitHub Repository Discovery Platform** built with **React 18**, **Redux Toolkit**, **Vite**, and **Tailwind CSS**. DevHub helps developers discover, bookmark, organize, and manage GitHub repositories with an intuitive UI, smart search, advanced filtering, dark mode, and persistent local storage.

🌐 **Live Demo:** https://devhub-nu-five.vercel.app/

---

## ✨ Features

- 🔍 Smart GitHub repository search with debounced input
- 🏷️ Filter repositories by programming language
- 📊 Sort repositories by Stars, Forks, or Recently Updated
- 🔖 Bookmark repositories with custom notes and tags
- 💾 Persistent bookmarks, search history, and theme using Local Storage
- 🌙 Light & Dark Mode with system preference detection
- 📋 Copy clone URL and quickly open repositories on GitHub
- 📤 Export bookmarked repositories as JSON
- 🔔 Beautiful animated toast notifications
- 🧭 Recent search history for quick access
- 📱 Fully responsive design for Mobile, Tablet, and Desktop
- ⚡ Fast and optimized performance powered by Vite

---

# 🛠️ Tech Stack

- **React 18**
- **Redux Toolkit**
- **Context API**
- **Vite**
- **Tailwind CSS**
- **React Router DOM**
- **Axios**
- **Lucide React**

---

# 🔌 API Used

## 🐙 GitHub Search API

Used for:

- Repository Search
- Repository Details
- Repository README
- Repository Statistics
- Repository Metadata

No API key is required for public repository searches.

---

# 📸 Screenshots

Home:

<img width="951" height="414" alt="1" src="https://github.com/user-attachments/assets/8b7ae8cf-fada-4144-ac83-b53bac2a2f1b" />

Search:

<img width="947" height="440" alt="2" src="https://github.com/user-attachments/assets/159743c4-7a87-413d-bf35-17eac4233ecb" />

Bookmark:

<img width="945" height="438" alt="3" src="https://github.com/user-attachments/assets/d40ac96a-54ad-4651-a82f-db3ec7626452" />

Export Option:

<img width="940" height="440" alt="4" src="https://github.com/user-attachments/assets/28d59df0-2d20-43fb-9f94-6ad2ad6a49b5" />

---

# 📂 Project Structure

```bash
devhub/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── search/
│   │   ├── repo/
│   │   └── bookmark/
│   │
│   ├── pages/
│   ├── context/
│   ├── store/
│   │   ├── store.js
│   │   └── slices/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── styles/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

# 🏗️ Architecture

## State Management

| Context API | Redux Toolkit |
|-------------|---------------|
| 🌙 Theme Management | 🔍 Repository Search |
| 🔔 Toast Notifications | 🔖 Bookmarks |
| UI Preferences | Search Filters |
| Modal States | API Data |

> **Rule:** UI state is managed with **Context API**, while application data and business logic are managed with **Redux Toolkit**.

---

# 🔄 Application Flow

```text
User Searches Repository
        │
        ▼
Debounced Search (500ms)
        │
        ▼
Redux Dispatch
        │
        ▼
GitHub Search API
        │
        ▼
Redux Store Updated
        │
        ▼
Repository Cards Render
        │
        ▼
Bookmark Repository
        │
        ▼
Save to Local Storage
        │
        ▼
Toast Notification
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js v18+
- npm or yarn

---

## Installation

Clone the repository

```bash
git clone https://github.com/yourusername/devhub.git
```

Navigate into the project

```bash
cd devhub
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# 🌐 API Reference

### Search Repositories

```http
GET /search/repositories
```

### Repository Details

```http
GET /repos/:owner/:repo
```

### Repository README

```http
GET /repos/:owner/:repo/readme
```

Example:

```http
https://api.github.com/search/repositories?q=react+language:javascript&sort=stars&order=desc
```




# 🎨 Design System

## Responsive Layout

| Device | Layout |
|---------|--------|
| 📱 Mobile | Single Column |
| 📟 Tablet | Two Columns |
| 🖥️ Desktop | Three Columns |

---

## Theme

- 🌞 Light Mode
- 🌙 Dark Mode
- 💾 Theme persistence using Local Storage

---

# 🧠 Key Concepts Demonstrated

- React Component Architecture
- Redux Toolkit State Management
- Context API
- Async Thunks
- API Integration
- Debounced Search
- Local Storage Persistence
- Custom React Hooks
- Responsive Design
- Error Handling
- Loading Skeletons
- Component Reusability
- Clean Folder Structure

---

# 📦 Major Dependencies

- React 18
- Redux Toolkit
- React Redux
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React

---

# 🚢 Deployment

The application is deployed on **Vercel**.

🌐 **Live Demo**

https://devhub-nu-five.vercel.app/

---

# 🔮 Future Improvements

- ⭐ GitHub OAuth Login
- 👥 User Profiles
- 📈 Repository Analytics
- 🌍 Trending Repositories
- 📌 Favorite Collections
- 🔄 Repository Comparison
- 🌐 Multi-language Support
- 📱 Progressive Web App (PWA)

---

# 🤝 Contributing

Contributions are always welcome.

If you'd like to improve DevHub:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# 👨‍💻 Author

**Muhammad Awais Altaf**

GitHub:
https://github.com/awaisaltaf5

---

# 🙏 Acknowledgements

Special thanks to:

- GitHub API
- React
- Redux Toolkit
- Vite
- Tailwind CSS
- Lucide React
- Axios

---

# ⭐ Support

If you found this project useful, please consider giving it a **⭐ Star** on GitHub.

---

<div align="center">

### 🚀 Built with ❤️ using React, Redux Toolkit & Tailwind CSS

### 🌐 Live Demo

https://devhub-nu-five.vercel.app/

</div>
