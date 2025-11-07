# 🧪 Science Web Lab

**Science Web Lab** is a React + Firebase powered educational web application that allows students and teachers to explore and visualize physics experiments in an interactive virtual environment.

---

## 🚀 Features

- 🧭 Virtual physics experiments (e.g., pendulum simulation)
- 👨‍🏫 Role-based access (Teacher / Student)
- 🔐 Firebase Authentication
- ☁️ Firestore Database integration for saving experiments
- 💡 Responsive UI using Material UI (MUI)
- ⚡ Built with Vite for fast development
- 🔄 Modular and scalable architecture

---

## 🧰 Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| **Frontend**     | React, Vite, TypeScript             |
| **UI Framework** | Material UI (MUI)                   |
| **Backend**      | Firebase (Auth, Firestore, Hosting) |
| **Build Tool**   | Vite                                |
| **Language**     | TypeScript / JavaScript             |

---

## 📁 Project Structure

```
science-web-lab/
├── src/
│   ├── assets/           # Images, icons, and static resources
│   ├── components/       # Reusable UI components
│   ├── pages/            # App pages (Home, Dashboard, Experiments)
│   ├── lib/              # Firebase setup and utilities
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types and interfaces
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static public assets
├── .env.example          # Example of environment variables
├── vite.config.ts        # Vite configuration
├── package.json
└── README.md
```

---

## ⚙️ Installation and Setup

**1️⃣ Clone the Repository**

```bash
git clone https://github.com/amin076/science-web-lab.git
cd science-web-lab
```

**2️⃣ Install Dependencies**

```bash
npm install
```

**3️⃣ Create Firebase Config**
Create a file named `src/lib/firebase.ts`:

```ts
// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

> ⚠️ Remember to create a `.env` file (never push it to GitHub).

**4️⃣ Run the App Locally**

```bash
npm run dev
```

**5️⃣ Build for Production**

```bash
npm run build
```

**6️⃣ Deploy to Firebase Hosting**

```bash
firebase login
firebase init
firebase deploy
```

---

## 🧪 Current Experiments

- 🎯 Pendulum Simulation (with adjustable parameters)
- ⚙️ [Coming Soon] Projectile Motion
- 🔬 [Coming Soon] Circular Motion
- 🌊 [Coming Soon] Waves and Oscillation

---

## 🔐 Authentication Flow

1. Users can sign up or log in with email/password.
2. Firebase assigns each user a role (teacher/student).
3. Teachers can create and manage classes and experiments.
4. Students can join and interact with virtual experiments.

---

## 🧠 Future Roadmap

- ✅ Add experiment result saving in Firestore
- ✅ Implement role-based dashboard
- 🚧 Add AI-driven experiment assistance
- 🚧 Integrate voice-based interaction
- 🚧 Advanced 3D visualizations (Three.js)

---

## 🧑‍💻 Development Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start development server   |
| `npm run build`   | Build production bundle    |
| `npm run preview` | Preview production build   |
| `firebase deploy` | Deploy to Firebase Hosting |

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`feature/your-feature-name`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push to your branch (`git push origin feature/your-feature-name`)
5. Create a Pull Request

---

## 🧾 License

MIT License © 2025 [Amin Nazari](https://github.com/amin076)

---

## 🌟 Acknowledgements

- React + Vite Community
- Firebase Team
- Material UI
- All educators contributing to Science Web Lab’s mission ❤️
