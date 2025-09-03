# 🎬 Movie Streaming Service  

A full-stack movie streaming web application built with **Next.js**, **Prisma**, **PostgreSQL**, and **TailwindCSS**, powered by the **TDBM API**.  
Users can browse, search, and stream movies with a modern UI and optimized performance.  

---

## 🚀 Tech Stack  

- **Frontend:** [Next.js](https://nextjs.org), [TailwindCSS](https://tailwindcss.com)  
- **Backend:** [Prisma](https://www.prisma.io), [Next.js](https://nextjs.org)  
- **Database:** [PostgreSQL](https://www.postgresql.org)  
- **API:** TDBM API (Movies data)  
- **Deployment:** [Vercel](https://vercel.com) (frontend) + [Supabase](https://supabase.com) (backend)  

---

## ⚡️ Features  

- 🔍 **Search & Browse** movies from TDBM API  
- 🎥 **Stream movies** with responsive video player  
- 👤 **User authentication & profiles** *(if implemented)*  
- ❤️ **Save favorites / watchlist**  
- 📱 **Responsive UI** with TailwindCSS  
- ⚡️ Optimized API calls with Prisma + PostgreSQL  

---

## 🌐 Demo  

🔗 **Live Frontend:** [movie-streaming-service.vercel.app](#)  
🔗 **Live Backend API:** [movie-streaming-service.onrender.com](#)  

*(replace `#` with your actual deployment links)*  

---

## 📸 Screenshots  

### 🎥 Homepage  
![Homepage Screenshot](./screenshots/homepage.jpg)  

### 🔍 Movie Details Page  
![Movie Details Screenshot](./screenshots/movie-details.jpg)  

### ❤️ Watchlist / Favorites  
![Watchlist Screenshot](./screenshots/watchlist.jpg)  

*(Save your screenshots inside a `/screenshots` folder in the repo and update the paths above.)*  

---

## 🛠 Getting Started  

### 1. Clone the repository  

```bash
git clone https://github.com/your-username/movie-streaming-service-next.git
cd movie-streaming-service-next
```
### 2. Install dependencies

```bash
npm install
# or
yarn install
```
### 3. Configure environment variables
Create a `.env` file in the root directory:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/moviedb
NEXT_PUBLIC_TDBM_API_KEY=your_api_key_here
```
### 4. Run database migrations

```bash
npx prisma migrate dev
```
### 5. Start the development server
```bash
npm run dev
```
## 📦 Deployment
- Frontend → Deployed on Vercel
- Backend → Deployed on Render
