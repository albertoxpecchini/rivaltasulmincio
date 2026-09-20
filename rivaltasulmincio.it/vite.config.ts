import { defineConfig } from 'vite';
import { atlante } from './scripts/vite-plugin-atlante.ts';

/*
 * Pipeline: le pagine sono HTML statico generato a build time.
 *
 *   vite build            → client (index.html + assets) e server (entry-server)
 *   node scripts/prerender.ts → una pagina HTML per ogni percorso, 404.html,
 *                               indice di ricerca; poi rimuove dist/server
 *
 * In sviluppo il plugin `atlante` rende ogni richiesta HTML con lo stesso
 * entry-server, così dev e build condividono un solo codice di rendering.
 */
export default defineConfig({
  appType: 'custom',
  plugins: [atlante()],
  environments: {
    ssr: {
      build: {
        outDir: 'dist/server',
        rollupOptions: { input: 'src/entry-server.ts' },
      },
    },
  },
  builder: {
    async buildApp(builder) {
      await builder.build(builder.environments.client!);
      await builder.build(builder.environments.ssr!);
    },
  },
});
