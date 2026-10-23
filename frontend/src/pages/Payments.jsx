import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../api/services';
import { CreditCard, ArrowRight, Receipt, X, Printer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const METHOD_LABELS = {
  wave: { label: 'Wave', icon: '🌊' },
  orange_money: { label: 'Orange Money', icon: '🟠' },
  free_money: { label: 'Free Money', icon: '🟢' },
  stripe: { label: 'Carte bancaire', icon: '💳' },
};

const ESCROW_LABELS = { held: 'Retenu (séquestre)', released: 'Libéré au prestataire', refunded: 'Remboursé' };

/** Reçu de paiement consultable et imprimable. */
function ReceiptModal({ payment, isMaman, onClose }) {
  const method = METHOD_LABELS[payment.method] || { label: payment.method };
  const commission = Number(payment.commission ?? 0);
  const net = Number(payment.amount) - commission;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Receipt size={19} className="text-primary" /> Reçu de paiement
          </h2>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">NAFISSA — Reçu</p>
          <p className="mt-1 text-center font-mono text-xs text-gray-500">{payment.transaction_ref}</p>
          <dl className="mt-4 space-y-2.5">
            <div className="flex justify-between"><dt className="text-gray-500">Prestation</dt><dd className="font-semibold text-gray-900">{payment.booking?.service?.title ?? payment.booking?.category?.name ?? 'Demande'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Date</dt><dd className="font-medium">{new Date(payment.created_at).toLocaleString('fr-FR')}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Moyen</dt><dd className="font-medium">{method.label}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Statut</dt><dd className="font-medium">{ESCROW_LABELS[payment.escrow_status] ?? payment.escrow_status}</dd></div>
            <div className="flex justify-between border-t border-gray-200 pt-2.5"><dt className="font-bold text-gray-900">Montant</dt><dd className="font-bold text-secondary">{Number(payment.amount).toLocaleString('fr-FR')} FCFA</dd></div>
            {!isMaman && commission > 0 && (
              <>
                <div className="flex justify-between text-xs"><dt className="text-gray-400">Commission NAFISSA</dt><dd className="text-gray-500">−{commission.toLocaleString('fr-FR')} FCFA</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Net perçu</dt><dd className="font-bold text-gray-900">{net.toLocaleString('fr-FR')} FCFA</dd></div>
              </>
            )}
          </dl>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition hover:border-primary hover:text-primary">
            <Printer size={16} /> Imprimer
          </button>
          <Link to={`/bookings/${payment.booking_id}`} onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark">
            Voir la demande
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const { isMaman } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [receipt, setReceipt] = useState(null);

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
        <h1 className="text-2xl font-bold text-gray-900">{isMaman ? 'Mes paiements' : 'Mes revenus'}</h1>
        <p className="text-muted text-sm mt-1">
          {isMaman ? 'Montants, statuts et reçus disponibles' : 'Montants gagnés et paiements reçus'}
        </p>
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
              <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg">
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{payment.booking?.service?.title ?? payment.booking?.category?.name ?? 'Demande'}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {method.label} • {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{Number(payment.amount).toLocaleString()} FCFA</p>
                  <p className={`text-xs font-medium ${
                    payment.escrow_status === 'released' ? 'text-secondary'
                    : payment.escrow_status === 'refunded' ? 'text-danger'
                    : 'text-amber-600'
                  }`}>
                    {ESCROW_LABELS[payment.escrow_status] ?? payment.escrow_status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReceipt(payment)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-primary hover:text-primary"
                >
                  <Receipt size={14} /> Reçu
                </button>
                <Link to={`/bookings/${payment.booking_id}`} className="text-muted hover:text-primary transition-colors" aria-label="Voir la demande">
                  <ArrowRight size={16} />
                </Link>
              </div>
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

      {receipt && <ReceiptModal payment={receipt} isMaman={isMaman} onClose={() => setReceipt(null)} />}
    </div>
  );
}
