import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(persist(
  (set) => ({
    worker: JSON.parse(localStorage.getItem('es_worker') || 'null'),
    token: localStorage.getItem('es_token'),
    logout: () => {
      localStorage.removeItem('es_token')
      localStorage.removeItem('es_worker')
      set({ worker: null, token: null })
    }
  }),
  { name: 'es-auth' }
))
