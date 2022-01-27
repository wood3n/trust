import { defineConfig } from "hust";

export default defineConfig({
  name: "example",
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      pathRewrite: { "^/api": "" },
    },
  },
});
