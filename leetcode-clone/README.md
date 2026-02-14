# LeetCode Clone (InsForge Edition)

A full-stack LeetCode clone built with React, InsForge, and Docker.

## Project Structure
- `frontend/`: React + Vite + InsForge SDK (The User Interface)
- `execution-service/`: Node.js Express Server + Dockerode (Runs user code safely)
- `insforge/`: Database Schema and Policies (Managed in InsForge)

## Prerequisites
- Node.js 18+
- Docker Desktop (Running)
- InsForge Account & Project

## Setup Instructions

### 1. Database Setup
This project uses InsForge for the database. Access your InsForge dashboard to view tables.
Tables created: `problems`, `submissions`, `profiles`.

### 2. Execution Service (Docker Runner)
This service must be running locally to execute code.

```bash
cd leetcode-clone/execution-service
npm install
npm start
```
*Runs on http://localhost:3001*

### 3. Frontend Application

```bash
cd leetcode-clone/frontend
npm install
npm run dev
```
*Opens at http://localhost:5173*

## Features
- **Authentication**: Sign Up / Sign In (InsForge Auth)
- **Problem List**: Browse problems with difficulty filters.
- **Code Editor**: Monaco Editor with syntax highlighting.
- **Code Execution**: Run code against test cases in isolated Docker containers.
- **Submissions**: Save and view your submission history.

## Environment Variables
Ensure `.env` in `frontend/` has your InsForge credentials:
```env
VITE_INSFORGE_DATABASE_URL=...
VITE_INSFORGE_DATABASE_ANON_KEY=...
```
