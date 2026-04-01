import { create } from 'zustand'
import { MOCK_PLANS } from '../constants/mock'
import api from '../services/api'
import { useAuthStore } from './authStore'

export const usePolicyStore = create((set, get) => ({
  activePlan: MOCK_PLANS[1], // Standard Shield default
  availablePlans: MOCK_PLANS,
  syncFromWorker: () => {
    const worker = useAuthStore.getState().worker
    const planId = worker?.policy?.planId || worker?.planId
    if (!planId) return
    const matched = MOCK_PLANS.find((p) => p.id === planId)
    if (matched) set({ activePlan: matched })
  },
  selectPlan: (planId) => set({ activePlan: MOCK_PLANS.find(p => p.id === planId) }),
  upgradePlan: async (planId, context = {}) => {
    try {
      const plan = MOCK_PLANS.find(p => p.id === planId);
      if(!plan) return;
      const { data } = await api.post('/auth/upgrade-policy', {
        planId,
        tier: plan.name,
        segment: context.segment,
        dailyEarnings: context.dailyEarnings,
        platform: context.platform,
        workShift: context.workShift,
        workHours: context.workHours
      });
      set({ activePlan: plan });
      useAuthStore.getState().patchWorker({
        policy: data?.policy || {
          tier: plan.name,
          planId,
          weeklyPremium: plan.weeklyPremium,
          active: true
        },
        profile: data?.profile || undefined
      });
      return data;
    } catch (err) {
      console.error("Upgrade failed", err);
      // Fallback local update if backend fails
      set({ activePlan: MOCK_PLANS.find(p => p.id === planId) });
    }
  }
}))
