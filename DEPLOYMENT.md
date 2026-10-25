# Deployment

The Vercel frontend and Express API are separate services. The frontend cannot call an API running on a developer's `localhost`.

## Deploy the API

1. Create a Render Blueprint from this repository and use the included `render.yaml`.
2. Provide `MONGO_URI` when prompted. It must point to a MongoDB instance reachable from Render; a local `mongodb://127.0.0.1...` URI will not work in production.
3. Render generates `JWT_SECRET`. Keep it private.
4. Wait for the API service to finish deploying and copy its public HTTPS URL.

## Connect Vercel to the API

1. In the Vercel project settings, add `NEXT_PUBLIC_API_URL` with the Render API URL (for example, `https://crypto-dashboard-api.onrender.com`).
2. Redeploy the frontend so the public environment variable is included in its build.
3. The API accepts browser CORS requests from the frontend; no CORS environment variable is required.

The login, registration, and dashboard API requests go through the frontend's same-origin `/api` proxy, which forwards them to the backend. In production it uses `API_URL`, then `NEXT_PUBLIC_API_URL`, then the Render URL above. In local development it forwards to `http://localhost:5000`.
