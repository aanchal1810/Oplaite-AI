<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Yfq8JPi0wOoK-Qi2rdHMHiWUsflFN5Nv

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file and set the `VITE_GEMINI_API_KEY` to your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. In Vercel project settings, go to **Environment Variables** and add:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** Your Gemini API key
   - **Environment:** Production, Preview, and Development (select all)
4. Deploy! Vercel will automatically detect Vite and build your app

**Note:** Environment variables in Vite must be prefixed with `VITE_` to be accessible in the client-side code.
