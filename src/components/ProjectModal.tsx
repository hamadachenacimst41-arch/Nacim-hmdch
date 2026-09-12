import React, { useState } from 'react';
import { X, Building2, Save, MapPin, User, Calendar, Plus, Trash2 } from 'lucide-react';
import { ProjectInfo } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectInfo;
  onSave: (updated: ProjectInfo) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProjectInfo>({ ...project });
  const [newBloc, setNewBloc] = useState('');
  const [newFloor, setNewFloor] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addBloc = () => {
    if (!newBloc.trim()) return;
    if (!formData.blocs.includes(newBloc.trim())) {
      setFormData({
        ...formData,
        blocs: [...formData.blocs, newBloc.trim()],
      });
    }
    setNewBloc('');
  };

  const removeBloc = (blocToRemove: string) => {
    setFormData({
      ...formData,
      blocs: formData.blocs.filter((b) => b !== blocToRemove),
    });
  };

  const addFloor = () => {
    if (!newFloor.trim()) return;
    if (!formData.floors.includes(newFloor.trim())) {
      setFormData({
        ...formData,
        floors: [...formData.floors, newFloor.trim()],
      });
    }
    setNewFloor('');
  };

  const removeFloor = (floorToRemove: string) => {
    setFormData({
      ...formData,
      floors: formData.floors.filter((f) => f !== floorToRemove),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Paramètres du Projet GCB</h2>
              <p className="text-xs text-slate-400">Identification du chantier, responsables et taux d'avancement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-project-modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Nom du projet & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nom du Projet / Chantier *
              </label>
              <input
                type="text"
                required
                id="project-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden font-medium"
                placeholder="Ex: Projet 350 Logements LPP & Équipements"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Code Projet GCB *
              </label>
              <input
                type="text"
                required
                id="project-code-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden font-mono"
                placeholder="Ex: GCB-DIR-BAT-2025/118"
              />
            </div>
          </div>

          {/* Maître d'ouvrage & Localisation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Maître d'Ouvrage / Client
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                placeholder="Ex: ENPI, AADL, DLEP..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Localisation du Chantier
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                  placeholder="Ex: Pôle Urbain Oued Romane - Alger"
                />
              </div>
            </div>
          </div>

          {/* Responsables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Conducteur de Travaux / Superviseur (Votre Nom)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden bg-white"
                  placeholder="Ex: Conducteur Travaux Suivi GCB"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Responsable Premier des Travaux (Chef de Projet)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.worksManagerName}
                  onChange={(e) => setFormData({ ...formData, worksManagerName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden bg-white"
                  placeholder="Ex: Ingénieur Chef de Projet GCB"
                />
              </div>
            </div>
          </div>

          {/* Taux Global d'avancement des travaux globaux */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Taux d'Avancement des Travaux Globaux du Projet (%)
              </label>
              <span className="text-base font-extrabold text-amber-700 font-mono">
                {formData.globalProgressPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              id="project-progress-slider"
              value={formData.globalProgressPercentage}
              onChange={(e) => setFormData({ ...formData, globalProgressPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-amber-800 mt-1 font-medium">
              <span>0% (Démarrage)</span>
              <span>50% (Gros-œuvre / Maçonnerie)</span>
              <span>100% (Livraison finale)</span>
            </div>
          </div>

          {/* Configuration des Blocs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Blocs / Bâtiments du Chantier
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.blocs.map((bloc) => (
                <span
                  key={bloc}
                  className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800"
                >
                  {bloc}
                  <button
                    type="button"
                    onClick={() => removeBloc(bloc)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBloc}
                onChange={(e) => setNewBloc(e.target.value)}
                placeholder="Ajouter un bloc (ex: Bloc E)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden"
              />
              <button
                type="button"
                onClick={addBloc}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Configuration des Étages */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Niveaux / Étages
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.floors.map((fl) => (
                <span
                  key={fl}
                  className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800"
                >
                  {fl}
                  <button
                    type="button"
                    onClick={() => removeFloor(fl)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                placeholder="Ajouter un étage (ex: 6ème Étage)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden"
              />
              <button
                type="button"
                onClick={addFloor}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="save-project-btn"
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-md transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
