import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';

export default function TaxDocuments() {
  const navigate = useNavigate();
  const [docs, setDocs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/auth/tax-documents');
        setDocs(data?.documents || []);
      } catch {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-[100svh]">
      <TopBar />
      <div className="px-4 py-4 pb-24">
        <button onClick={() => navigate(-1)} className="mb-4 text-es-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="font-display text-xl text-white mb-3">Tax Documents</h1>

        {loading ? (
          <p className="text-es-secondary text-sm">Loading documents...</p>
        ) : docs.length === 0 ? (
          <GlassCard className="p-4 text-center">
            <FileText className="mx-auto text-es-muted mb-2" size={20} />
            <p className="text-es-secondary text-sm">No tax documents available yet.</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <GlassCard key={doc.id} className="p-4 flex items-center gap-3">
                <FileText className="text-es-teal" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{doc.title}</p>
                  <p className="text-es-muted text-xs">{doc.period}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-es-teal"
                >
                  <Download size={18} />
                </a>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
