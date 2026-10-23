import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandMark from '../components/BrandMark';

const CONTACT = {
  email: 'contact1@digital-porokhane.com',
  phones: '+221 33 830 61 57 / +221 71 058 90 88',
};

const PAGES = {
  cgu: {
    title: "Conditions Générales d'Utilisation",
    sections: [
      {
        h: 'Objet',
        p: "NAFISSA est une plateforme de mise en relation entre des clientes et des prestataires de services à domicile au Sénégal. La cliente décrit son besoin ; l'équipe NAFISSA vérifie la demande et attribue un prestataire vérifié. La cliente ne choisit pas directement le prestataire.",
      },
      {
        h: 'Demandes et attribution',
        p: "Toute demande comprend le type de service, la date, l'heure, le lieu, la durée estimée et le détail du besoin. Les prix affichés sur les offres sont indicatifs : le prix définitif est confirmé par l'équipe selon le besoin réel, au moment de l'attribution du prestataire.",
      },
      {
        h: 'Prestataires',
        p: "Les prestataires fournissent une pièce d'identité et sont validés par l'équipe avant de recevoir des missions. Un prestataire peut accepter ou refuser une mission attribuée ; en cas de refus, l'équipe attribue un autre prestataire.",
      },
      {
        h: 'Paiement',
        p: `Le paiement s'effectue après acceptation de la mission par le prestataire. Le montant est conservé de manière sécurisée et n'est libéré au prestataire qu'après confirmation de la fin de la mission. En cas de litige, contactez l'équipe : ${CONTACT.phones} ou ${CONTACT.email}.`,
      },
      {
        h: 'Responsabilités',
        p: "NAFISSA agit comme intermédiaire de mise en relation. Les prestations sont réalisées par les prestataires, qui restent responsables de leur exécution. NAFISSA vérifie l'identité des prestataires et intervient en cas de litige signalé.",
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    sections: [
      {
        h: 'Données collectées',
        p: "Nom, numéro de téléphone, adresse email, adresse d'intervention, photo de profil et, pour les prestataires, pièces d'identité. Les demandes précisent le lieu, la date et la nature du service souhaité.",
      },
      {
        h: 'Utilisation',
        p: "Ces données servent uniquement à traiter vos demandes : attribution d'un prestataire, suivi de mission, paiement et notifications (application et WhatsApp). Elles ne sont ni vendues ni partagées à des tiers à des fins commerciales.",
      },
      {
        h: 'Visibilité',
        p: "La cliente ne voit l'identité du prestataire qu'après attribution, et jamais ses coordonnées complètes. Le prestataire ne voit que les informations nécessaires à la mission. Les pièces d'identité ne sont visibles que par l'administration.",
      },
      {
        h: 'Vos droits',
        p: `Vous pouvez modifier vos informations depuis « Mon profil », ou demander la suppression de votre compte à tout moment. Contact : ${CONTACT.email}.`,
      },
    ],
  },
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        h: 'Éditeur',
        p: `NAFISSA — plateforme de services à domicile, Dakar, Sénégal. Contact : ${CONTACT.email} — ${CONTACT.phones}.`,
      },
      {
        h: 'Hébergement',
        p: 'Site hébergé par Hostinger. Les données sont stockées de manière sécurisée et les fichiers téléversés sont contrôlés (formats vérifiés).',
      },
      {
        h: 'Propriété',
        p: 'L\'ensemble des contenus du site (logo, textes, interface) appartient à NAFISSA. Toute reproduction sans autorisation est interdite.',
      },
    ],
  },
};

export default function Legal({ page = 'cgu' }) {
  const doc = PAGES[page] ?? PAGES.cgu;
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-gray-100 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between px-4 sm:px-6">
          <BrandMark to="/" compact logoClassName="h-12 w-auto" />
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary">
            <ArrowLeft size={16} /> Accueil
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold text-gray-900">{doc.title}</h1>
        <div className="mt-8 space-y-8">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-bold text-gray-900">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.p}</p>
            </section>
          ))}
        </div>
        <nav className="mt-12 flex flex-wrap gap-4 border-t border-gray-200 pt-6 text-xs font-semibold text-gray-500">
          <Link to="/cgu" className="hover:text-primary">CGU</Link>
          <Link to="/confidentialite" className="hover:text-primary">Confidentialité</Link>
          <Link to="/mentions-legales" className="hover:text-primary">Mentions légales</Link>
        </nav>
      </main>
    </div>
  );
}
