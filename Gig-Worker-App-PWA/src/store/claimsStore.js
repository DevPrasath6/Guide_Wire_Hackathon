import { create } from 'zustand'
import { MOCK_CLAIMS } from '../constants/mock'
import { esApi } from '../services/api'

export const useClaimsStore = create((set, get) => ({
  claims: [],
  pendingDisruption: null,
  loading: false,
  isSubmitting: false,
  submitResult: null,
  
  addClaim: (claim) => set(s => ({ claims: [claim, ...s.claims] })),
  setSubmitting: (val) => set({ isSubmitting: val }),
  setResult: (result) => set({ submitResult: result }),
  clearResult: () => set({ submitResult: null }),

  setPendingDisruption: (value) => set({ pendingDisruption: value }),

  fetchClaims: async (options = {}) => {
    const { silent = false } = options
    if (!silent) set({ loading: true })
    try {
      const claims = await esApi.getMyClaims()
      set({ claims })
    } catch (e) {
      console.error('Failed to fetch claims, using fallback mock data', e)
      set({ claims: MOCK_CLAIMS })
    } finally {
      if (!silent) set({ loading: false })
    }
  }
}))
