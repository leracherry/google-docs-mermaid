import { defineConfig } from 'wxt';
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // Chrome rejects raw Unicode noncharacters in extension script files.
  // Rolldown must escape them in dependency strings, including Mermaid regexes.
  vite: () => ({ build: { rolldownOptions: { output: { charset: 'ascii' } } } }),
  manifest: {
    name: 'Mermaid for Google Docs',
    description: 'Experimental local Mermaid previews for DOM-backed blocks on Google Docs pages. Native canvas blocks are not supported.',
    homepage_url: 'https://github.com/leracherry/google-docs-mermaid',
    content_security_policy: { extension_pages: "script-src 'self'; object-src 'none'; base-uri 'none'; connect-src 'none'" },
    permissions: ['storage', 'activeTab'],
    icons: { 16: '/icons/16.png', 32: '/icons/32.png', 48: '/icons/48.png', 128: '/icons/128.png' },
    action: { default_icon: { 16: '/icons/16.png', 32: '/icons/32.png', 48: '/icons/48.png' } },
    web_accessible_resources: [{ resources: ['icons/32.png'], matches: ['https://docs.google.com/*'] }],
  },
});
