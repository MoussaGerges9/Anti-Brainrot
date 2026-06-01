import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'Anti-Brainrot'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
}))
