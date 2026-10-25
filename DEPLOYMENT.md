# Deploy on Vercel

The Next.js app now contains the authentication and investment API routes, so the frontend and API are deployed together on Vercel. Render is not required.

## Vercel project settings

Set the Vercel project root directory to `client/crypto-dashboard`, with the standard Next.js build command (`npm run build`).

Add these environment variables for Production, Preview, and Development as needed:

- `MONGO_URI`: a MongoDB Atlas connection string reachable from Vercel. A local `127.0.0.1` or `localhost` database URL only works on your computer.
- `JWT_SECRET`: a long, random, private signing secret. Do not use the example or commit the real value.

For MongoDB Atlas, add the database user and configure Atlas Network Access so Vercel functions can connect. Protect the database with a strong password and grant only the required database permissions.

After setting the variables, redeploy the Vercel project. Authentication uses `/api/auth/register` and `/api/auth/login`; investment endpoints are under `/api/investments`.

## Local development

Set `MONGO_URI` and `JWT_SECRET` in `client/crypto-dashboard/.env.local`, then start Next.js with `npm run dev` from `client/crypto-dashboard`. Local MongoDB is fine for local development; Vercel requires a hosted MongoDB database.
