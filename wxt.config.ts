import { defineConfig } from 'wxt';
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Mermaid for Google Docs',
    description: 'Render Mermaid diagrams locally inside Google Docs.',
    permissions: ['storage'],
  },
});
