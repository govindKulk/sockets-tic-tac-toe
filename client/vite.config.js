import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // Specify the src folder as the root
  build: {
    outDir: "../dist", // Output the build files to the dist folder in the root
  },
});
