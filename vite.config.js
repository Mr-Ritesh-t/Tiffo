import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'b610-2409-40c2-1016-1fd3-1d66-d370-5fa3-b5e.ngrok-free.app'
    ]
  }
})
