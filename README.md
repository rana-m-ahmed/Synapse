<div align="center">
  
  # 🧠 Synapse
  
  **The Autonomous SaaS Chatbot Platform for Modern Teams**
  
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a>
  </p>

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![pgvector](https://img.shields.io/badge/pgvector-HNSW-336791?style=for-the-badge&logo=postgresql)](https://github.com/pgvector/pgvector)
</div>

---

## ✨ Overview

Synapse is an end-to-end suite designed to help you build, train, and deploy intelligent AI agents without the friction of traditional infrastructure. Upload your data, configure your agent's persona, and deploy a highly-responsive chat widget to your website with just a single line of code.

Designed with a premium **Deep Space** aesthetic, Synapse prioritizes speed, reliability, and an incredible user experience.

## 🚀 Features

- **📚 Retrieval-Augmented Generation (RAG):** Ingest raw text and documents (PDF, DOCX, TXT). Our engine automatically chunks, embeds, and indexes your data into a high-performance HNSW vector database.
- **⚡ Live Playground:** Test your agent's responses in real-time. Experience lightning-fast token streaming powered by Server-Sent Events (SSE).
- **🌐 1-Line Deployment:** Once your agent is trained, deploy it instantly to any website using a secure, isolated Web Component snippet.
- **🎛️ Agent Control Center:** Provision and manage a fleet of specialized AI agents from a centralized dashboard. Monitor states and configure system personas.
- **📊 System Telemetry & Analytics:** Beautiful, Recharts-powered interactive dashboards to monitor daily conversation trends, vector chunk usage, and average latencies.

## 💻 Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Charts:** [Recharts](https://recharts.org/)

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Vector Search:** `pgvector` with HNSW indices
- **Authentication:** Supabase Auth

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Supabase Project

### 1. Clone the repository
```bash
git clone https://github.com/rana-m-ahmed/Synapse.git
cd Synapse
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

Run the backend server:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Architecture

Synapse is built on a highly decoupled architecture:
1. **The Dashboard (Next.js):** Provides the control plane for users to manage their agents.
2. **The Inference Engine (FastAPI):** Handles RAG pipeline orchestration, chunking, semantic caching, and LLM communication.
3. **The Widget (`widget.js`):** A lightweight Web Component that can be embedded securely on any external domain, communicating directly with the Inference Engine via SSE.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

