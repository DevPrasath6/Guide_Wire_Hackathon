import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const PLAN_NAME_TO_ID = {
  'Basic Shield': 'basic',
  'Standard Shield': 'standard',
  'Premium Shield': 'premium'
}

const makeInitials = (name = 'ES') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'ES'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const normalizeWorker = (payload = {}) => {
  const policy = payload.policy || {}
  const planId = policy.planId || payload.planId || PLAN_NAME_TO_ID[policy.tier] || 'standard'

  return {
    ...payload,
    name: payload.name || 'Worker',
    email: payload.email || '',
    phone: payload.phone || '',
    role: payload.role || 'worker',
    profile: {
      platform: payload.profile?.platform || payload.platform || 'Zomato',
      zone: payload.profile?.zone || payload.zone || 'Coimbatore',
      avatar: payload.profile?.avatar || payload.avatar || '',
      segment: payload.profile?.segment || payload.segment || 'food',
      dailyEarnings: Number(payload.profile?.dailyEarnings || payload.dailyEarnings || 1000),
      workShift: payload.profile?.workShift || payload.workShift || 'day',
      workHours: Number(payload.profile?.workHours || payload.workHours || 8)
    },
    payout: {
      method: payload.payout?.method || 'upi',
      upiId: payload.payout?.upiId || '',
      bankName: payload.payout?.bankName || '',
      accountNumber: payload.payout?.accountNumber || '',
      ifsc: payload.payout?.ifsc || '',
      walletNumber: payload.payout?.walletNumber || ''
    },
    policy: {
      tier: policy.tier || 'Standard Shield',
      planId,
      weeklyPremium: Number(policy.weeklyPremium || payload.weeklyPremium || 45),
      active: policy.active !== false
    },
    planId,
    initials: payload.initials || makeInitials(payload.name)
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      worker: null,
      token: null,

      setAuth: (data) => {
        const worker = normalizeWorker(data)
        const token = data?.token || get().token || null
        if (token) localStorage.setItem('es_token', token)
        localStorage.setItem('es_worker', JSON.stringify(worker))
        set({ worker, token })
      },

      patchWorker: (partial) => {
        const prev = get().worker || {}
        const next = normalizeWorker({
          ...prev,
          ...partial,
          profile: { ...(prev.profile || {}), ...(partial?.profile || {}) },
          payout: { ...(prev.payout || {}), ...(partial?.payout || {}) },
          policy: { ...(prev.policy || {}), ...(partial?.policy || {}) }
        })
        localStorage.setItem('es_worker', JSON.stringify(next))
        set({ worker: next })
      },

      refreshProfile: async () => {
        const { data } = await api.get('/auth/profile')
        get().setAuth({ ...get().worker, ...data, token: get().token })
        return data
      },

      loginWithFirebaseUser: async (firebaseUser) => {
        const { data } = await api.post('/auth/firebase', {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
          providerId: firebaseUser.providerData[0]?.providerId
        })
        get().setAuth(data)
        return data
      },

      logout: () => {
        localStorage.removeItem('es_token')
        localStorage.removeItem('es_worker')
        set({ worker: null, token: null })
      }
    }),
    {
      name: 'es-auth',
      partialize: (state) => ({ worker: state.worker, token: state.token }),
      onRehydrateStorage: () => (state) => {
        const token = localStorage.getItem('es_token')
        const workerStr = localStorage.getItem('es_worker')
        let worker = null
        try {
          worker = workerStr ? JSON.parse(workerStr) : null
        } catch {
          worker = null
        }
        if (state) {
          state.token = token || null
          state.worker = worker ? normalizeWorker(worker) : null
        }
      }
    }
  )
)
