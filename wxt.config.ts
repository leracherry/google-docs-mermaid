import { defineConfig } from 'wxt';
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Mermaid for Google Docs',
    description: 'Render Mermaid diagrams locally inside Google Docs.',
    permissions: ['storage', 'activeTab'],
    icons: { 16: '/icons/16.png', 32: '/icons/32.png', 48: '/icons/48.png', 128: '/icons/128.png' },
    action: { default_icon: { 16: '/icons/16.png', 32: '/icons/32.png', 48: '/icons/48.png' } },
    web_accessible_resources: [{ resources: ['icons/32.png'], matches: ['https://docs.google.com/*'] }],
  },
});
