// build.mjs
import { build } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

async function runBuild() {
  try {
    await build({
      plugins: [tailwindcss(), react()],
      build: {
        outDir: 'dist',
      },
    });
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();
