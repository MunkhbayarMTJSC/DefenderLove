// @ts-ignore
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // 📁 relative path ашиглана
  build: {
    outDir: 'docs', // 📦 build output-г docs руу гаргана
    emptyOutDir: true, // 🧹 build хийх бүрт docs-г цэвэрлэнэ
  },
});
