import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), react()],
  build: { 
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html', // Make sure index.html is your entry point
    }
  },
  server: {
    historyApiFallback: true, // Important for React Router
  }
})
