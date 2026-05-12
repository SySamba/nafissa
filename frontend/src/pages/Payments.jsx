import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../api/services';
import { CreditCard, ArrowRight } from 'lucide-react';

const METHOD_LABELS = {
  wave: { label: 'Wave', icon: '🌊' },
  orange_money: { label: 'Orange Money', icon: '🟠' },
  free_money: { label: 'Free Money', icon: '🟢' },
  stripe: { label: 'Carte bancaire', icon: '💳' },
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    paymentAPI.history({ page })
      .then(({ data }) => {
        setPayments(data.data || []);
        setLastPage(data.last_page || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-muted text-sm mt-1">Historique de vos transactions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-gray-100">
          <CreditCard size={48} className="mx-auto text-muted/30 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Aucun paiement</h3>
          <p className="text-muted text-sm mt-1">Vos transactions apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-gray-100 divide-y divide-gray-50">
          {payments.map((payment) => {
            const method = METHOD_LABELS[payment.method] || { label: payment.method, icon: '💰' };
            return (
              <Link key={payment.id} to={`/bookings/${payment.booking_id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg">
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{payment.booking?.service?.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {method.label} • {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{Number(payment.amount).toLocaleString()} FCFA</p>
                  <p className={`text-xs font-medium ${payment.escrow_status === 'released' ? 'text-secondary' : 'text-amber-600'}`}>
                    {payment.escrow_status === 'held' ? 'Retenu' : payment.escrow_status === 'released' ? 'Libéré' : 'Remboursé'}
                  </p>
                </div>
                <ArrowRight size={16} className="text-muted group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Précédent
          </button>
          <span className="text-sm text-muted">Page {page} / {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
