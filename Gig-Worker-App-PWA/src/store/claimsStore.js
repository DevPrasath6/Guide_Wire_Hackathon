import { create } from 'zustand'
import { MOCK_CLAIMS } from '../constants/mock'

export const useClaimsStore = create((set, get) => ({
  claims: MOCK_CLAIMS,
  addClaim: (claim) => set({ claims: [claim, ...get().claims] })
}))
