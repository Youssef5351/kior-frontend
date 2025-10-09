import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // 👈 this makes CSS and JS use relative paths
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist',
  },
})
