import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        student: resolve(__dirname, "student.html"),
        teacherMonitor: resolve(__dirname, "teacherMonitor.html")
      }
    }
  }
});
