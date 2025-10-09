import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // 👈 keeps asset paths relative
  plugins: [tailwindcss(), react()],
  build: { outDir: 'dist' },
})
