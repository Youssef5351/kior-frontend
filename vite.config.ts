import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/', // ✅ use root path for Vercel
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist',
  },
})
