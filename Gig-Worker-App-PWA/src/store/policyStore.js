import { create } from 'zustand'
import { MOCK_PLANS } from '../constants/mock'

export const usePolicyStore = create((set, get) => ({
  activePlan: MOCK_PLANS[1], // Standard Shield default
  availablePlans: MOCK_PLANS,
  selectPlan: (planId) => set({ activePlan: MOCK_PLANS.find(p => p.id === planId) }),
}))
