import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePolicyStore } from '../store/policyStore';
import { 
  Shield, 
  CreditCard, 
  FileText, 
  Bell, 
  Globe, 
  HelpCircle, 
  Phone, 
  Wallet,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import { esApi } from '../services/api';
import { toast } from '../components/ui/Toast';

const MetricCardHoriz = ({ label, value }) => (
  <div className="glass p-3 flex flex-col items-center justify-center flex-1 gap-1">
    <span className="font-display text-[20px] font-bold text-white leading-none">{value}</span>
    <span className="font-body text-[10px] text-es-muted leading-none text-center">{label}</span>
  </div>
);

const SectionLabel = ({ text }) => (
  <div className="font-mono text-[10px] tracking-[0.1em] text-es-muted uppercase mt-6 mb-2 px-1">
    {text}
  </div>
);

const ProfileRow = ({ icon: Icon, label, rightElement, onClick }) => (
  <div 
    onClick={onClick}
    className="glass glass-hover p-[14px] px-4 flex items-center gap-3 mb-2 cursor-pointer"
  >
    <Icon size={18} className="text-es-muted" />
    <span className="font-body text-[14px] text-white flex-1">{label}</span>
    {rightElement || <ChevronRight size={16} className="text-es-muted" />}
  </div>
);

const ToggleSwitch = ({ isOn, onToggle }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-[40px] h-[22px] rounded-full p-[2px] transition-colors duration-300 ease-in-out cursor-pointer ${isOn ? 'bg-es-teal' : 'bg-[rgba(255,255,255,0.1)]'}`}
  >
    <div 
      className={`w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 ease-in-out ${isOn ? 'translate-x-[18px]' : 'translate-x-0'}`}
      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
    />
  </div>
);

const PLATFORM_GROUPS = {
  commodity: ['Amazon', 'BigBasket', 'Blinkit', 'Flipkart', 'Dunzo', 'PharmEasy'],
  food: ['Zomato', 'Swiggy', 'Dunzo'],
  transportation: ['Ola', 'Uber', 'Rapido', 'Porter', 'Urban Company']
};

const PLATFORM_LOGOS = {
  Amazon: '/icons/Amazon-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  BigBasket: '/icons/Bigbasket-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Blinkit: '/icons/Blinkit-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Dunzo: '/icons/Dunzo-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Flipkart: '/icons/Flipkart-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Ola: '/icons/Ola-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  PharmEasy: '/icons/PharmEasy-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Porter: '/icons/Porter-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Rapido: '/icons/Rapido-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Swiggy: '/icons/Swiggy-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Uber: '/icons/Uber-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  'Urban Company': '/icons/Urban-Company-Best-Companies-for-Gig-Workers-StartupTalky.jpg',
  Zomato: '/icons/Zomato-Best-Companies-for-Gig-Workers-StartupTalky.jpg'
};

export default function Profile() {
  const navigate = useNavigate();
  const { worker, logout, patchWorker } = useAuthStore();
  const { availablePlans, activePlan } = usePolicyStore();
  const [notifications, setNotifications] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPayout, setSavingPayout] = React.useState(false);
  const [openPlatformMenu, setOpenPlatformMenu] = React.useState(false);
  const [openPayoutMenu, setOpenPayoutMenu] = React.useState(false);
  const [kpi, setKpi] = React.useState({ protectedAmount: 0, claimsFiled: 0, activeWeeks: 0 });

  const [segment, setSegment] = React.useState(worker?.profile?.segment || 'food');
  const [platform, setPlatform] = React.useState(worker?.profile?.platform || 'Zomato');
  const [dailyEarnings, setDailyEarnings] = React.useState(worker?.profile?.dailyEarnings || 1000);
  const [workShift, setWorkShift] = React.useState(worker?.profile?.workShift || 'day');
  const [workHours, setWorkHours] = React.useState(worker?.profile?.workHours || 8);

  const [payoutMethod, setPayoutMethod] = React.useState(worker?.payout?.method || 'upi');
  const [upiId, setUpiId] = React.useState(worker?.payout?.upiId || '');
  const [bankName, setBankName] = React.useState(worker?.payout?.bankName || '');
  const [accountNumber, setAccountNumber] = React.useState(worker?.payout?.accountNumber || '');
  const [ifsc, setIfsc] = React.useState(worker?.payout?.ifsc || '');
  const [walletNumber, setWalletNumber] = React.useState(worker?.payout?.walletNumber || '');

  if (!worker) return null;

  const claimBanUntil = worker?.policy?.claimBanUntil ? new Date(worker.policy.claimBanUntil) : null;
  const claimBanActive = claimBanUntil && claimBanUntil > new Date();

  const filteredPlatforms = PLATFORM_GROUPS[segment] || PLATFORM_GROUPS.food;

  React.useEffect(() => {
    if (!filteredPlatforms.includes(platform)) {
      setPlatform(filteredPlatforms[0]);
    }
  }, [segment]);

  React.useEffect(() => {
    let mounted = true;
    esApi.getMyClaimSummary()
      .then((data) => {
        if (!mounted) return;
        setKpi({
          protectedAmount: Number(data?.protectedAmount || 0),
          claimsFiled: Number(data?.claimsFiled || 0),
          activeWeeks: Number(data?.activeWeeks || 0)
        });
      })
      .catch(() => {
        if (!mounted) return;
        setKpi({ protectedAmount: 0, claimsFiled: 0, activeWeeks: 0 });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const segmentMultipliers = {
    commodity: 1.15,
    food: 1,
    transportation: 0.9
  };

  const getCapacity = (selectedPlatform) => {
    const name = String(selectedPlatform || '').toLowerCase();
    if (name.includes('amazon') || name.includes('flipkart') || name.includes('bigbasket') || name.includes('blinkit')) return 200;
    if (name.includes('zomato') || name.includes('swiggy') || name.includes('dunzo') || name.includes('pharmeasy')) return 100;
    if (name.includes('ola') || name.includes('uber') || name.includes('porter')) return 50;
    return 80;
  };

  const estimatePremium = (base) => {
    const segmentFactor = segmentMultipliers[segment] || 1;
    const earningFactor = dailyEarnings >= 3000 ? 1.35 : dailyEarnings >= 2000 ? 1.25 : dailyEarnings >= 1200 ? 1.1 : dailyEarnings < 600 ? 0.95 : 1;
    const shiftFactor = workShift === 'night' ? 1.22 : workShift === 'mixed' ? 1.12 : 1;
    const hoursFactor = Number(workHours) >= 12 ? 1.22 : Number(workHours) >= 10 ? 1.12 : Number(workHours) <= 5 ? 0.9 : 1;
    const capacity = getCapacity(platform);
    const capacityFactor = capacity >= 180 ? 1.2 : capacity >= 120 ? 1.1 : capacity <= 60 ? 0.92 : 1;
    return Math.max(20, Math.round((base * segmentFactor * earningFactor * shiftFactor * hoursFactor * capacityFactor) / 5) * 5);
  };

  const quotedPlans = availablePlans.map((plan) => ({
    ...plan,
    dynamicPremium: estimatePremium(plan.weeklyPremium)
  }));

  const currentPlanName = worker?.policy?.tier || activePlan?.name || 'Standard Shield';
  const currentWeeklyPremium = Number(worker?.policy?.weeklyPremium || activePlan?.weeklyPremium || 45);

  const saveWorkProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        profile: {
          segment,
          platform,
          dailyEarnings: Number(dailyEarnings),
          workShift,
          workHours: Number(workHours),
          zone: worker?.profile?.zone || worker?.zone || 'Coimbatore'
        }
      };
      const { data } = await api.put('/auth/profile', payload);
      patchWorker(data.user || payload);
      toast.success?.('Your changes saved');
    } catch (err) {
      console.error(err);
      toast.error?.('Failed to save work profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePayoutDetails = async () => {
    setSavingPayout(true);
    try {
      const payload = {
        payout: {
          method: payoutMethod,
          upiId,
          bankName,
          accountNumber,
          ifsc,
          walletNumber
        }
      };
      const { data } = await api.put('/auth/profile', payload);
      patchWorker(data.user || payload);
      toast.success?.('Payout settings saved');
    } catch (err) {
      console.error(err);
      toast.error?.('Failed to save payout settings');
    } finally {
      setSavingPayout(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  const handleMockAction = (msg) => {
    toast.info && toast.info(msg) || alert(msg);
  };

  return (
    <div className="px-4 py-6 scroll-smooth pb-24 h-full overflow-y-auto">
      
      <div className="flex flex-col items-center text-center mb-8">
        {worker?.profile?.avatar ? (
          <img
            src={worker.profile.avatar}
            alt={worker.name}
            className="w-[72px] h-[72px] rounded-full object-cover border border-white/20 shadow-lg shadow-[rgba(0,200,150,0.2)] mb-4"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-es-teal to-[#009E76] flex items-center justify-center shadow-lg shadow-[rgba(0,200,150,0.2)] mb-4">
            <span className="font-display text-[28px] font-bold text-white tracking-widest">{worker.initials || 'ES'}</span>
          </div>
        )}
        <h2 className="font-display text-[20px] font-bold text-white">{worker.name}</h2>
        <p className="font-body text-[14px] text-es-muted mt-1">{worker?.profile?.platform || worker.platform} delivery partner</p>
        <p className="font-body text-[12px] text-es-muted mt-1 flex items-center justify-center gap-1">
          📍 {worker?.profile?.zone || worker.zone}
        </p>
        <button className="text-es-teal text-[12px] font-body mt-3 font-medium cursor-pointer p-1">
          Edit Profile
        </button>
      </div>

      {claimBanActive && (
        <div className="glass p-3 mb-4 border border-es-red/40 bg-es-red/10">
          <p className="text-es-red text-sm font-medium">Claim access paused due to fraud anomaly</p>
          <p className="text-es-secondary text-xs mt-1">You can submit claims again after {claimBanUntil.toLocaleString()}.</p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <MetricCardHoriz label="Protected" value={`₹${kpi.protectedAmount}`} />
        <MetricCardHoriz label="Claims Filed" value={`${kpi.claimsFiled}`} />
        <MetricCardHoriz label="Active Weeks" value={`${kpi.activeWeeks}`} />
      </div>

      <div>
        <SectionLabel text="My Plan" />
        <ProfileRow 
          icon={Shield} 
          label={`${currentPlanName} - ₹${currentWeeklyPremium}/week`} 
          onClick={() => navigate('/policy')} 
        />

        <SectionLabel text="Work Profile" />
        <div className="glass p-4 mb-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { id: 'commodity', label: 'Commodity' },
              { id: 'food', label: 'Food' },
              { id: 'transportation', label: 'Transport' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSegment(item.id)}
                className={`rounded-xl px-2 py-2 text-[11px] ${segment === item.id ? 'bg-es-teal text-white' : 'bg-white/5 text-es-secondary'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="text-[11px] text-es-secondary">Platform</label>
          <div className="relative mt-1 mb-3">
            <button
              type="button"
              onClick={() => setOpenPlatformMenu((v) => !v)}
              className="glass-input !h-[44px] !flex !items-center !justify-between !text-white"
            >
              <span className="flex items-center gap-2 min-w-0">
                <img
                  src={PLATFORM_LOGOS[platform]}
                  alt={platform}
                  className="w-6 h-6 rounded object-cover border border-white/15"
                />
                <span className="truncate">{platform}</span>
              </span>
              <ChevronDown size={16} className="text-es-secondary" />
            </button>

            {openPlatformMenu && (
              <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0F1629] shadow-xl">
                {filteredPlatforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPlatform(p);
                      setOpenPlatformMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                      p === platform ? 'bg-es-teal/20 text-white' : 'hover:bg-white/5 text-gray-200'
                    }`}
                  >
                    <img
                      src={PLATFORM_LOGOS[p]}
                      alt={p}
                      className="w-6 h-6 rounded object-cover border border-white/15"
                    />
                    <span className="text-sm">{p}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="text-[11px] text-es-secondary">Daily earnings (INR)</label>
          <input
            type="number"
            min="100"
            step="50"
            value={dailyEarnings}
            onChange={(e) => setDailyEarnings(Number(e.target.value || 0))}
            className="glass-input mt-1 mb-3 !h-[44px]"
          />

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[11px] text-es-secondary">Work shift</label>
              <select
                value={workShift}
                onChange={(e) => setWorkShift(e.target.value)}
                className="glass-input mt-1 !h-[44px]"
              >
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-es-secondary">Work hours/day</label>
              <input
                type="number"
                min="1"
                max="18"
                value={workHours}
                onChange={(e) => setWorkHours(Number(e.target.value || 0))}
                className="glass-input mt-1 !h-[44px]"
              />
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-3 mb-3">
            <div className="text-[12px] text-es-secondary">Estimated capacity/day</div>
            <div className="text-[14px] text-white font-semibold">{getCapacity(platform)} orders/rides</div>
            <div className="text-[11px] text-es-secondary mt-2">Dynamic weekly premium estimates:</div>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {quotedPlans.map((plan) => (
                <div key={plan.id} className="rounded-lg bg-white/5 p-2 text-center">
                  <div className="text-[10px] text-es-secondary">{plan.name.split(' ')[0]}</div>
                  <div className="text-[13px] text-es-teal font-semibold">₹{plan.dynamicPremium}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/policy')}
            className="w-full rounded-full border border-es-teal/40 text-es-teal py-2 text-[13px] mb-3"
          >
            View Updated Policy
          </button>

          <button
            onClick={saveWorkProfile}
            disabled={savingProfile}
            className="w-full rounded-full bg-es-teal text-white py-2 text-[13px] disabled:opacity-60"
          >
            {savingProfile ? 'Saving...' : 'Save Work Profile'}
          </button>
        </div>

        <SectionLabel text="Payout Settings" />
        <ProfileRow
          icon={Wallet}
          label={`Payout Method: ${payoutMethod.toUpperCase()}`}
          rightElement={<ChevronDown size={16} className={`text-es-muted transition-transform ${openPayoutMenu ? 'rotate-180' : ''}`} />}
          onClick={() => setOpenPayoutMenu((v) => !v)}
        />

        {openPayoutMenu && (
          <div className="glass p-4 mb-3">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: 'upi', label: 'UPI' },
                { id: 'bank', label: 'Bank' },
                { id: 'wallet', label: 'Wallet' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPayoutMethod(item.id)}
                  className={`rounded-xl px-2 py-2 text-[11px] ${payoutMethod === item.id ? 'bg-es-teal text-white' : 'bg-white/5 text-es-secondary'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {payoutMethod === 'upi' && (
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@upi"
                className="glass-input !h-[44px]"
              />
            )}

            {payoutMethod === 'bank' && (
              <div className="grid grid-cols-1 gap-2">
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" className="glass-input !h-[44px]" />
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" className="glass-input !h-[44px]" />
                <input value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="IFSC" className="glass-input !h-[44px]" />
              </div>
            )}

            {payoutMethod === 'wallet' && (
              <input
                value={walletNumber}
                onChange={(e) => setWalletNumber(e.target.value)}
                placeholder="Wallet mobile number"
                className="glass-input !h-[44px]"
              />
            )}

            <button
              onClick={savePayoutDetails}
              disabled={savingPayout}
              className="w-full rounded-full bg-es-teal text-white py-2 text-[13px] mt-3 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Wallet size={14} />
              {savingPayout ? 'Saving...' : 'Save Payout Settings'}
            </button>
          </div>
        )}

        {worker.role === 'superuser' && (
          <>
            <SectionLabel text="Developer Tools" />
            <ProfileRow 
              icon={FileText} 
              label="API Documentation" 
              onClick={() => window.open(import.meta.env.VITE_API_URL.replace('/api', '/api-docs'), '_blank')} 
            />
            <ProfileRow 
              icon={Globe} 
              label="AI / Dashboard Status" 
              onClick={() => navigate('/system-status')} 
            />
          </>
        )}
        <SectionLabel text="Earnings" />
        <ProfileRow icon={CreditCard} label="Payment History" rightElement={<ChevronRight size={16} className="text-es-muted" />} onClick={() => navigate('/claims')} />
        <ProfileRow icon={FileText} label="Tax Documents" onClick={() => navigate('/tax-documents')} />

        <SectionLabel text="Account" />
        <ProfileRow 
          icon={Bell} 
          label="Recent Notifications" 
          rightElement={<ChevronRight size={16} className="text-es-muted" />}
          onClick={() => navigate('/notifications')}
        />
        <ProfileRow icon={Globe} label="Language" rightElement={<span className="text-[12px] text-es-muted">English &rarr;</span>} onClick={() => handleMockAction('Language selection coming soon')} />

        <SectionLabel text="Support" />
        <ProfileRow icon={HelpCircle} label="Help & FAQs" onClick={() => handleMockAction('Opening Help Center...')} />
        <ProfileRow icon={Phone} label="AI Support Chat" rightElement={<ChevronRight size={16} className="text-es-muted" />} onClick={() => navigate('/support')} />
      </div>

      <div className="mt-8 pt-4 flex justify-center pb-8 border-t border-[rgba(255,255,255,0.05)]">
        <button 
          onClick={handleLogout}
          className="text-es-red text-[14px] font-body py-2 px-6 hover:bg-[rgba(239,68,68,0.05)] rounded-full transition-colors"
        >
          Sign Out
        </button>
      </div>

    </div>
  );
}
