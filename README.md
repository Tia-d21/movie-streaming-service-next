VIDEO:https://github.com/user-attachments/assets/81260a6e-ff61-47e4-96ac-e6cc890236de
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

🎬 Movie Streaming Service

Welcome to our Movie Streaming Service, a full-stack web application built to provide users with a smooth Netflix-like experience — but tailored for learning, exploration, and creativity.

This project was developed as part of our Final Internship Project, combining frontend, backend, and database technologies into one cohesive system.


👥 Team Members
Name  Role
[KENENISA]  Frontend Developer
[SURAFEL ABERA]  Frontend Developer
[MELKAMU AYALEW]  Backend Developer
[TIYA FIKRE ]  Backend Developer


🚀 Features
🔑 Authentication & Authorization (Signup, Login, Forgot Password, Logout)
🎥 Browse Movies by categories, trending, and recommendations
⭐️ Favorites & My List management
📝 Ratings & Feedback System
🛠 Admin Dashboard (manage users, movies, categories, and analytics)
📱 Responsive Design (works across desktop and mobile)
🔐 Middleware for Access Control (Admin & User separation)


🛠 Tech Stack
Frontend: Next.js (App Router, React, Tailwind CSS)
Backend: Next.js API Routes
Database: PostgreSQL (via Prisma ORM)
Auth: Custom JWT-based authentication
Deployment: Vercel (Frontend + API)


📂 Project Structure
src/
 ├── app/
 │   ├── api/              # Backend API routes
 │   ├── auth/             # Login, Signup, Forgot Password pages
 │   ├── main/             # Main app pages (browse, profile, etc.)
 │   └── components/       # Reusable UI components
 ├── middlewares/          # Authentication & Authorization logic
 ├── utils/                # Helper functions
 └── lib/                  # Prisma client

⚡️ Getting Started
1. Clone the repo
git clone https://github.com/your-username/movie-streaming-service.git
cd movie-streaming-service

2. Install dependencies
npm install

3. Set up environment variables

Create a .env file in the root directory and add:
DATABASE_URL=your_postgres_database_url
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

4. Run the database migrations
npx prisma migrate dev

5. Start the development server
npm run dev

🧑‍💻 Scripts
npm run dev → Start development server
npm run build → Build for production
npm run start → Run production build
npx prisma studio → Open Prisma Studio for DB visualization


🎥 Demo

📹 Demo Video: [(https://github.com/user-attachments/assets/81260a6e-ff61-47e4-96ac-e6cc890236de)]
🔗 Live Deployment: 

📊 Admin Dashboard Preview
View total users, favorites, ratings, and feedback
Role-based access (only admins allowed)


📝 Future Improvements
✅ Add subscription & payment system
✅ Add personalized movie recommendations with ML
✅ Add social features (share playlists, reviews)
✅ Improve video streaming with adaptive quality


🙏 Acknowledgements
The Movie Database (TMDb) for providing movie data.
Open source community for tools and libraries.

