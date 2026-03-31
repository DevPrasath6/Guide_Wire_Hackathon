import { create } from 'zustand'
import { MOCK_CLAIMS } from '../constants/mock'

export const useClaimsStore = create((set, get) => ({
  claims: MOCK_CLAIMS,
  isSubmitting: false,
  submitResult: null,
  
  addClaim: (claim) => set(s => ({ claims: [claim, ...s.claims] })),
  setSubmitting: (val) => set({ isSubmitting: val }),
  setResult: (result) => set({ submitResult: result }),
  clearResult: () => set({ submitResult: null }),
}))
