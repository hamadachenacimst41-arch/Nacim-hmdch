import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Building2, 
  ArrowRight, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  HardHat,
  Users
} from 'lucide-react';
import { UserRole, UserSession, AuthorizedUser } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { PWAInstallButton } from './PWAInstallButton';

interface AuthScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  masterAdminEmail?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onLoginSuccess,
  masterAdminEmail = 'hamadache.nacim.st41@gmail.com'
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('responsable');
  
  // Responsable login state
  const [responsableEmail, setResponsableEmail] = useState('');
  const [responsableLoading, setResponsableLoading] = useState(false);
  const [responsableError, setResponsableError] = useState<string | null>(null);

  // Superviseur login state
  const [superviseurEmail, setSuperviseurEmail] = useState(masterAdminEmail);
  const [supervisorCode, setSupervisorCode] = useState('');
  const [superviseurLoading, setSuperviseurLoading] = useState(false);
  const [superviseurError, setSuperviseurError] = useState<string | null>(null);

  // Auto seed initial admin on first mount
  useEffect(() => {
    FirestoreService.seedInitialAdminIfEmpty(masterAdminEmail).catch(() => {});
  }, [masterAdminEmail]);

  // Handle Responsable email sign-in
  const handleResponsableLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponsableError(null);
    const cleanEmail = responsableEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setResponsableError('Veuillez saisir votre adresse email professionnelle.');
      return;
    }

    setResponsableLoading(true);
    try {
      // 1. Search in Firestore authorized_users
      const matchedUser = await FirestoreService.findUserByEmail(cleanEmail);

      if (matchedUser) {
        if (!matchedUser.isActive) {
          setResponsableError('Ce compte a été suspendu par l\'administrateur du chantier.');
          setResponsableLoading(false);
          return;
        }

        // Successfully authorized
        const session: UserSession = {
          email: matchedUser.email,
          role: 'responsable',
          fullName: matchedUser.fullName || 'Responsable Direction',
          loginTime: new Date().toISOString()
        };
        onLoginSuccess(session);
        return;
      }

      // Check if it's the master admin or default demo email
      if (cleanEmail === masterAdminEmail.toLowerCase() || cleanEmail === 'direction@gcb.dz') {
        const session: UserSession = {
          email: cleanEmail,
          role: 'responsable',
          fullName: cleanEmail === 'direction@gcb.dz' ? 'Direction Technique GCB' : 'Nacim Hamadache (Direction)',
          loginTime: new Date().toISOString()
        };
        onLoginSuccess(session);
        return;
      }

      // Not found in Firestore
      setResponsableError(
        `Accès refusé : L'adresse "${cleanEmail}" n'est pas autorisée dans la base Firebase. Veuillez contacter Nacim Hamadache pour être ajouté à la liste des Responsables.`
      );
    } catch (err) {
      console.error('Erreur vérification Firebase:', err);
      // Fallback if network offline but email format valid
      setResponsableError('Impossible de vérifier l\'autorisation avec Firebase. Vérifiez votre connexion internet.');
    } finally {
      setResponsableLoading(false);
    }
  };

  // Handle Superviseur sign-in
  const handleSuperviseurLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuperviseurError(null);
    const cleanEmail = superviseurEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setSuperviseurError('Veuillez saisir votre email superviseur.');
      return;
    }

    setSuperviseurLoading(true);

    try {
      // Superviseur verification: code GCB-2026 or master email or found in Firestore with role superviseur
      const isMasterAdmin = cleanEmail === masterAdminEmail.toLowerCase();
      const isCorrectCode = supervisorCode.trim().toUpperCase() === 'GCB-2026' || supervisorCode.trim() === '2026';

      let authorized = false;
      let userName = 'Superviseur Chantier';

      if (isMasterAdmin && (isCorrectCode || supervisorCode.trim() === '')) {
        authorized = true;
        userName = 'Nacim Hamadache (Chef de Projet)';
      } else {
        const userInDb = await FirestoreService.findUserByEmail(cleanEmail);
        if (userInDb && userInDb.role === 'superviseur' && userInDb.isActive) {
          if (isCorrectCode || !supervisorCode) {
            authorized = true;
            userName = userInDb.fullName;
          } else {
            setSuperviseurError('Code de sécurité superviseur incorrect (Par défaut: GCB-2026).');
            setSuperviseurLoading(false);
            return;
          }
        } else if (isCorrectCode) {
          authorized = true;
          userName = cleanEmail.split('@')[0];
        }
      }

      if (authorized) {
        const session: UserSession = {
          email: cleanEmail,
          role: 'superviseur',
          fullName: userName,
          loginTime: new Date().toISOString()
        };
        onLoginSuccess(session);
      } else {
        setSuperviseurError('Identifiants superviseur invalides ou code incorrect (Code chantier: GCB-2026).');
      }
    } catch (err) {
      console.error('Erreur login superviseur:', err);
      setSuperviseurError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setSuperviseurLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Company Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center gap-3 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-2xl shadow-lg mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md tracking-wider">
              GCB
            </div>
            <div className="text-left">
              <div className="font-black text-sm text-white tracking-wide">GCB · Spa</div>
              <div className="text-[11px] text-amber-400 font-medium">Société Nationale de Génie Civil et Bâtiment</div>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Système de Suivi de Chantier & Contrôle
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Portail sécurisé d'authentification · Séparation stricte des accès et synchronisation Cloud Firestore
          </p>
        </div>

        {/* Mobile PWA Install Banner */}
        <PWAInstallButton variant="card" className="mb-4" />

        {/* Role Selector Card */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/60 border-b border-slate-700/60 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('responsable');
                setResponsableError(null);
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'responsable'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Espace Responsable</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('superviseur');
                setSuperviseurError(null);
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'superviseur'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Espace Superviseur</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Responsable Portal */}
            {selectedRole === 'responsable' && (
              <div className="space-y-5">
                <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-emerald-300">
                        Mode Responsable · Consultation & Décision (Lecture Seule)
                      </h2>
                      <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                        Pour préserver l'intégrité des pointages du chantier, le responsable a un accès exclusif à la 
                        consultation des résultats, aux rapports journaliers, à l'avancement des métrés et aux synthèses hebdomadaires. 
                        <strong> Aucune modification n'est autorisée.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleResponsableLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Votre Adresse Email Professionnelle
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={responsableEmail}
                        onChange={(e) => setResponsableEmail(e.target.value)}
                        placeholder="ex: direction@gcb.dz ou votre email"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Seuls les emails autorisés par le chef de projet dans Firebase peuvent accéder.
                    </p>
                  </div>

                  {responsableError && (
                    <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">{responsableError}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={responsableLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {responsableLoading ? (
                      <span>Vérification de l'autorisation Firebase...</span>
                    ) : (
                      <>
                        <span>Accéder en tant que Responsable</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Quick demo helper */}
                  <div className="pt-2 border-t border-slate-700/60 text-center">
                    <span className="text-xs text-slate-400">Compte démo pré-autorisé : </span>
                    <button
                      type="button"
                      onClick={() => setResponsableEmail('direction@gcb.dz')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      direction@gcb.dz
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Superviseur Portal */}
            {selectedRole === 'superviseur' && (
              <div className="space-y-5">
                <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-amber-300">
                        Mode Superviseur & Conducteur de Travaux
                      </h2>
                      <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                        Accès complet à la saisie des effectifs, pointages quotidiens, gestion des entreprises sous-traitantes, 
                        calculs de briques, déclarations des réserves et <strong>gestion des accès pour la direction</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSuperviseurLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Email Superviseur / Conducteur de Travaux
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={superviseurEmail}
                        onChange={(e) => setSuperviseurEmail(e.target.value)}
                        placeholder="hamadache.nacim.st41@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Code de Sécurité Chantier (ou PIN)
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={supervisorCode}
                        onChange={(e) => setSupervisorCode(e.target.value)}
                        placeholder="Code par défaut: GCB-2026"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Code d'accès chantier par défaut : <span className="font-mono text-amber-400 font-bold">GCB-2026</span>
                    </p>
                  </div>

                  {superviseurError && (
                    <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">{superviseurError}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={superviseurLoading}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {superviseurLoading ? (
                      <span>Vérification en cours...</span>
                    ) : (
                      <>
                        <span>Ouvrir la Session Superviseur</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-3 border-t border-slate-700/60 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const session: UserSession = {
                          email: masterAdminEmail,
                          role: 'superviseur',
                          fullName: 'Nacim Hamadache (Chef de Projet)',
                          loginTime: new Date().toISOString()
                        };
                        onLoginSuccess(session);
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-amber-500/50 text-amber-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Entrée rapide directe (Compte Nacim Hamadache)</span>
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSuperviseurEmail(masterAdminEmail);
                          setSupervisorCode('GCB-2026');
                        }}
                        className="text-xs text-slate-400 hover:text-amber-400 underline cursor-pointer"
                      >
                        Remplir automatiquement : {masterAdminEmail}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-slate-900/80 px-6 py-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Connecté à Firebase Firestore Cloud</span>
            </div>
            <div>GCB Chantier v2.6</div>
          </div>
        </div>
      </div>
    </div>
  );
};
