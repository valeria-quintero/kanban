import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Los tests de integración usan su propia base (kanban_test), nunca la de desarrollo.
const env = config({ path: '.env.test', override: true, quiet: true }).parsed;

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.int-spec.ts'],
    env,
    globalSetup: ['./test/int-setup.ts'],
    // Todos los archivos comparten la misma base de datos.
    fileParallelism: false,
  },
});
