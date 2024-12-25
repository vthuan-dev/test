import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { checker } from 'vite-plugin-checker';
import dynamicImport from 'vite-plugin-dynamic-import';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd(), '');

   return {
      plugins: [checker({ typescript: false }), react(), svgr(), dynamicImport(), tsconfigPaths()],
      server: {
         port: 3001,
      },
      define: {
         'process.env': env,
      },
      resolve: {
         alias: {
            '~': path.resolve(__dirname, './src'),
         },
      },
   };
});
