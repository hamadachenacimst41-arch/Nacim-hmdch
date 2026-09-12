import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Mail, 
  User, 
  Building2, 
  Check, 
  RefreshCw,
  Eye,
  HardHat
} from 'lucide-react';
import { AuthorizedUser, UserRole } from '../types';
import { FirestoreService } from '../services/firestoreService';

interface AccessManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export const AccessManagementModal: React.FC<AccessManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
}) => {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('responsable');
  const [organization, setOrganization] = useState('GCB');

  // Load authorized users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await FirestoreService.getAuthorizedUsers();
      if (data.length === 0) {
        // Seed if empty
        await FirestoreService.seedInitialAdminIfEmpty(currentUserEmail);
        const refreshed = await FirestoreService.getAuthorizedUsers();
        setUsers(refreshed);
      } else {
        setUsers(data);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Listen for real-time changes
      const unsubscribe = FirestoreService.subscribeAuthorizedUsers((updatedUsers) => {
        if (updatedUsers.length > 0) {
          setUsers(updatedUsers);
        }
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Add new authorized user to Firebase Firestore
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage({ type: 'error', text: 'Veuillez renseigner un email valide.' });
      return;
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setMessage({ type: 'error', text: `L'email "${cleanEmail}" est déjà présent dans la liste des accès.` });
      return;
    }

    setSaving(true);
    try {
      const newUser: AuthorizedUser = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        fullName: fullName.trim() || cleanEmail.split('@')[0],
        role,
        organization: organization.trim() || 'GCB',
        isActive: true,
        createdAt: new Date().toISOString(),
        addedBy: currentUserEmail
      };

      await FirestoreService.saveAuthorizedUser(newUser);
      setUsers(prev => [newUser, ...prev]);

      setEmail('');
      setFullName('');
      setMessage({ 
        type: 'success', 
        text: `Accès accordé avec succès à "${cleanEmail}" en tant que ${role === 'responsable' ? 'Responsable (Consultation seule)' : 'Superviseur (Saisie complète)'}. Synchronisé avec Firebase !` 
      });
    } catch (err) {
      console.error('Erreur ajout utilisateur:', err);
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement dans Firebase Firestore.' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (user: AuthorizedUser) => {
    try {
      const updated = { ...user, isActive: !user.isActive };
      await FirestoreService.saveAuthorizedUser(updated);
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    } catch (err) {
      console.error('Erreur mise à jour utilisateur:', err);
    }
  };

  // Delete user from Firestore
  const handleDeleteUser = async (user: AuthorizedUser) => {
    if (user.email.toLowerCase() === currentUserEmail.toLowerCase()) {
      alert('Vous ne pouvez pas supprimer votre propre compte administrateur.');
      return;
    }

    if (confirm(`Confirmez-vous le retrait définitif des accès de "${user.fullName || user.email}" ?`)) {
      try {
        await FirestoreService.deleteAuthorizedUser(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setMessage({ type: 'success', text: `Accès révoqué pour ${user.email}.` });
      } catch (err) {
        console.error('Erreur suppression:', err);
        setMessage({ type: 'error', text: 'Erreur lors de la suppression sur Firebase.' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                Gestion des Accès Chantier & Rôles Firebase
              </h2>
              <p className="text-xs text-slate-400">
                Donnez accès aux Responsables (lecture seule) ou aux Superviseurs (saisie)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Info notification */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Contrôle strict des accès : </span>
              Tout responsable ajouté ici pourra se connecter avec son email et consulter en temps réel l'avancement, les métrés et les rapports, <strong>sans pouvoir modifier ni supprimer aucune donnée du chantier</strong>.
            </div>
          </div>

          {/* Add user form */}
          <form onSubmit={handleAddUser} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>Autoriser un nouvel utilisateur (Ajouter au Cloud Firebase)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Adresse Email Professionnelle *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: directeur@gcb.dz"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Nom Complet & Titre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex: M. Benali (Directeur Travaux)"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Rôle Attribué *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="responsable">Responsable · Consultation Seule (Lecture)</option>
                  <option value="superviseur">Superviseur · Saisie & Gestion Complète</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Entité / Organisation
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="ex: Direction Générale GCB"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Enregistrement Firebase...' : 'Accorder l\'Accès & Enregistrer'}</span>
            </button>
          </form>

          {/* List of current authorized users */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Utilisateurs Autorisés dans Firebase ({users.length})</span>
              </h3>
              <button
                type="button"
                onClick={fetchUsers}
                disabled={loading}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Chargement des autorisations depuis Firestore...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                Aucun utilisateur supplémentaire enregistré.
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const isCurrentUser = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                  return (
                    <div
                      key={user.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          user.role === 'superviseur' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.role === 'superviseur' ? <HardHat className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {user.fullName || user.email}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                                Vous (Admin)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono truncate">{user.email}</div>
                          <div className="text-[11px] text-slate-400">
                            {user.organization || 'GCB'} · Ajouté le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          user.role === 'superviseur'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}>
                          {user.role === 'superviseur' ? 'Superviseur' : 'Responsable (Lecture)'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          title={user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                          className={`text-xs px-2 py-1 rounded font-bold border transition-colors ${
                            user.isActive 
                              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-red-50 hover:text-red-700' 
                              : 'bg-red-50 text-red-700 border-red-300 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          {user.isActive ? 'Actif' : 'Suspendu'}
                        </button>

                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            title="Supprimer définitivement"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs sm:text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
