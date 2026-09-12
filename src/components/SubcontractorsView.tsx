import React, { useState } from 'react';
import { 
  HardHat, 
  Plus, 
  Search, 
  Phone, 
  User, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Edit, 
  Trash2, 
  SlidersHorizontal,
  TrendingUp,
  Users,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { Subcontractor, TradeType, ProjectInfo } from '../types';

interface SubcontractorsViewProps {
  subcontractors: Subcontractor[];
  project?: ProjectInfo;
  onAddSubcontractor: (sub: Subcontractor) => void;
  onUpdateSubcontractor: (sub: Subcontractor) => void;
  onDeleteSubcontractor: (id: string) => void;
  onSelectForLog?: (subId: string) => void;
}

export const SubcontractorsView: React.FC<SubcontractorsViewProps> = ({
  subcontractors,
  onAddSubcontractor,
  onUpdateSubcontractor,
  onDeleteSubcontractor,
  onSelectForLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<'all' | TradeType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcontractor | null>(null);

  // Form State
  const initialFormState: Subcontractor = {
    id: '',
    name: '',
    companyName: '',
    trade: 'maconnerie',
    tradesList: ['Maçonnerie brique 8T/12T'],
    assignedZone: 'Bloc A - Tous étages',
    phone: '',
    managerName: '',
    contractualProgress: 0,
    realProgress: 0,
    activeWorkers: 4,
    status: 'actif',
    contractNumber: '',
    notes: '',
  };

  const [formData, setFormData] = useState<Subcontractor>(initialFormState);
  const [tradeInput, setTradeInput] = useState('');

  const filteredSubcontractors = subcontractors.filter((sub) => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.assignedZone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrade = 
      selectedTradeFilter === 'all' || 
      sub.trade === selectedTradeFilter || 
      sub.trade === 'both';

    return matchesSearch && matchesTrade;
  });

  const totalWorkers = subcontractors.reduce((sum, s) => sum + (s.status === 'actif' ? s.activeWorkers : 0), 0);
  const maconnerieSubs = subcontractors.filter(s => s.trade === 'maconnerie' || s.trade === 'both').length;
  const finitionSubs = subcontractors.filter(s => s.trade === 'finition' || s.trade === 'both').length;

  const handleOpenAddModal = () => {
    setEditingSub(null);
    setFormData({
      ...initialFormState,
      id: `sub-${Date.now()}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subcontractor) => {
    setEditingSub(sub);
    setFormData({ ...sub });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSub) {
      onUpdateSubcontractor(formData);
    } else {
      onAddSubcontractor(formData);
    }
    setIsModalOpen(false);
  };

  const addTradeTag = () => {
    if (!tradeInput.trim()) return;
    if (!formData.tradesList.includes(tradeInput.trim())) {
      setFormData({
        ...formData,
        tradesList: [...formData.tradesList, tradeInput.trim()],
      });
    }
    setTradeInput('');
  };

  const removeTradeTag = (tradeToRemove: string) => {
    setFormData({
      ...formData,
      tradesList: formData.tradesList.filter((t) => t !== tradeToRemove),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Sous-Traitants
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {subcontractors.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" />
              {subcontractors.filter(s => s.status === 'actif').length} actifs sur chantier
            </div>
          </div>
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <HardHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Lots Maçonnerie
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {maconnerieSubs}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Brique 8T, 12T & Double paroi
            </div>
          </div>
          <div className="p-3 bg-orange-100 text-orange-800 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Lots Finition
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {finitionSubs}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Enduits, Carrelage, Peinture
            </div>
          </div>
          <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Effectif Mobilisé
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalWorkers} <span className="text-xs font-normal text-slate-500">ouvriers</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Maçons, poseurs & manœuvres
            </div>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="search-subcontractor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, entreprise, zone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedTradeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTradeFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedTradeFilter('maconnerie')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTradeFilter === 'maconnerie' ? 'bg-white shadow-xs text-orange-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maçonnerie
            </button>
            <button
              onClick={() => setSelectedTradeFilter('finition')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTradeFilter === 'finition' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Finition
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          id="add-subcontractor-btn"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau Sous-Traitant
        </button>
      </div>

      {/* Subcontractors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubcontractors.map((sub) => {
          const progressDelta = sub.realProgress - sub.contractualProgress;
          const isLate = progressDelta < -5;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900">
                        {sub.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          sub.trade === 'maconnerie'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : sub.trade === 'finition'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {sub.trade === 'maconnerie' ? 'Maçonnerie' : sub.trade === 'finition' ? 'Finition' : 'Maçonnerie & Finition'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          sub.status === 'actif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'en_arret'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.status === 'actif' ? 'En activité' : sub.status === 'en_arret' ? 'En arrêt' : 'Achevé'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Raison sociale : {sub.companyName} {sub.contractNumber && `· Réf : ${sub.contractNumber}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(sub)}
                      title="Modifier les données du sous-traitant"
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Voulez-vous vraiment supprimer le sous-traitant "${sub.name}" ?`)) {
                          onDeleteSubcontractor(sub.id);
                        }
                      }}
                      title="Supprimer"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Assigned zone and manager */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">Zone :</span>
                    <span className="truncate">{sub.assignedZone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">Gérant :</span>
                    <span className="truncate">{sub.managerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sub.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{sub.activeWorkers} ouvriers</span> présents
                  </div>
                </div>

                {/* Trades tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {sub.tradesList.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Progress bars: Réel vs Contractuel */}
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">Taux Réel Réalisé</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{sub.realProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-150 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, sub.realProgress))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Objectif Contractuel à date</span>
                      <span className="font-mono">{sub.contractualProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, sub.contractualProgress))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isLate && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md mb-3">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Retard de {(Math.abs(progressDelta)).toFixed(1)}% par rapport au planning contractuel</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 italic">
                  {sub.notes ? sub.notes.slice(0, 45) + '...' : 'Aucune réserve particulière'}
                </span>
                {onSelectForLog && (
                  <button
                    onClick={() => onSelectForLog(sub.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    Nouveau pointage
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredSubcontractors.length === 0 && (
          <div className="col-span-2 p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Aucun sous-traitant trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Ajoutez vos sous-traitants pour la maçonnerie et les finitions</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Ajouter un sous-traitant
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Subcontractor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingSub ? 'Modifier le Sous-Traitant' : 'Ajouter un Sous-Traitant GCB'}
                  </h3>
                  <p className="text-xs text-slate-400">Entreprise contractante, corps d'état et avancements</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nom Usuel / Entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: SARL Bâtiment Moderne"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Raison Sociale Complète
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Ex: SARL MBM Bâtiment & Travaux"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Corps d'État Principal *
                  </label>
                  <select
                    value={formData.trade}
                    onChange={(e) => setFormData({ ...formData, trade: e.target.value as TradeType })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                  >
                    <option value="maconnerie">Maçonnerie</option>
                    <option value="finition">Finition</option>
                    <option value="both">Maçonnerie & Finition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Statut sur Chantier
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                  >
                    <option value="actif">Actif sur chantier</option>
                    <option value="en_arret">En arrêt temporaire</option>
                    <option value="termine">Contrat terminé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Effectif Actif (Ouvriers)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.activeWorkers}
                    onChange={(e) => setFormData({ ...formData, activeWorkers: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Tâches détaillées confiées */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Types d'Ouvrages et Tâches Confiées
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.tradesList.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-medium"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTradeTag(t)}
                        className="hover:text-red-600 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tradeInput}
                    onChange={(e) => setTradeInput(e.target.value)}
                    placeholder="Ex: Pose brique 8T, Enduit plâtre, Carrelage 45x45..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={addTradeTag}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Zone affectée & Contrat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Zone / Bâtiments Affectés
                  </label>
                  <input
                    type="text"
                    value={formData.assignedZone}
                    onChange={(e) => setFormData({ ...formData, assignedZone: e.target.value })}
                    placeholder="Ex: Bloc A & B (RDC au 5ème)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Numéro de Contrat / Marché
                  </label>
                  <input
                    type="text"
                    value={formData.contractNumber || ''}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    placeholder="Ex: CT-GCB-ST-042/2025"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nom du Gérant / Chef de Chantier
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="Ex: M. Belkacem"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: 0550 12 34 56"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Avancements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Taux Réel Réalisé (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.realProgress}
                    onChange={(e) => setFormData({ ...formData, realProgress: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-bold font-mono text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Objectif Contractuel Prévu (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.contractualProgress}
                    onChange={(e) => setFormData({ ...formData, contractualProgress: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-mono text-slate-700"
                  />
                </div>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Observations / Remarques du Conducteur GCB
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Cadence, respect de la qualité, propreté du poste de travail..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm shadow-sm"
                >
                  {editingSub ? 'Mettre à jour' : 'Enregistrer le sous-traitant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
