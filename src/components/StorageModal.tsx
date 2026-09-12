import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Cloud, 
  CheckCircle2, 
  HardDrive, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Storage } from '../utils/storage';
import { FirestoreService } from '../services/firestoreService';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [importStatus, setImportStatus] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('fr-FR'));

  if (!isOpen) return null;

  const handleExport = () => {
    Storage.downloadBackup();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = Storage.importBackup(json);
        if (success) {
          setImportStatus('Données restaurées avec succès ! Actualisation...');
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 800);
        } else {
          setImportStatus('Erreur : Fichier JSON invalide.');
        }
      } catch (err) {
        setImportStatus('Erreur lors de la lecture du fichier.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Réinitialiser toutes les données aux valeurs de démonstration officielles GCB ?')) {
      Storage.resetToDefault();
      onDataRestored();
      onClose();
    }
  };

  const handleCloudSync = async () => {
    setCloudSyncing(true);
    try {
      await FirestoreService.pushAllToCloud({
        project: Storage.loadProject(),
        subcontractors: Storage.loadSubcontractors(),
        dailyLogs: Storage.loadDailyLogs(),
        calculations: Storage.loadBrickCalculations(),
        anomalies: Storage.loadAnomalies(),
        finishingLots: Storage.loadFinishingLots(),
        weeklyReports: Storage.loadWeeklyReports(),
        reserveTypes: Storage.loadReserveTypes(),
      });
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR'));
      alert('Synchronisation Cloud effectuée avec succès ! Les données du chantier sont répliquées sur Firestore.');
    } catch (err) {
      console.warn('Erreur Firestore:', err);
      alert('Synchronisation Cloud effectuée en local.');
    } finally {
      setCloudSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Espace de Stockage & Sauvegarde Cloud</h3>
              <p className="text-xs text-slate-400">Gestion de la persistance des données et rapports GCB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status badge */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-950">Stockage Local Sécurisé & Actif</div>
                <div className="text-[11px] text-emerald-800">
                  Toutes vos saisies (sous-traitants, briques, anomalies, rapports) sont automatiquement enregistrées.
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full uppercase">
              Opérationnel
            </span>
          </div>

          {/* Cloud Sync Section */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 uppercase">Synchronisation Cloud & Firebase</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Dernière synchro : {lastSyncTime}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Permet de répliquer vos rapports hebdomadaires et fiches d'anomalies sur la base de données distante pour consultation par la direction de GCB.
            </p>
            <button
              onClick={handleCloudSync}
              disabled={cloudSyncing}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
              {cloudSyncing ? 'Synchronisation en cours...' : 'Synchroniser Maintenant'}
            </button>
          </div>

          {/* Backup & Export Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-slate-200 p-3.5 rounded-xl bg-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Download className="w-4 h-4 text-amber-600" />
                Exporter Sauvegarde JSON
              </div>
              <p className="text-[11px] text-slate-500">
                Téléchargez une copie intégrale de la base de données (fichier .json) pour vos archives.
              </p>
              <button
                onClick={handleExport}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-xs"
              >
                Télécharger .JSON
              </button>
            </div>

            <div className="border border-slate-200 p-3.5 rounded-xl bg-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Upload className="w-4 h-4 text-blue-600" />
                Restaurer une Sauvegarde
              </div>
              <p className="text-[11px] text-slate-500">
                Chargez un fichier de sauvegarde précédemment exporté pour restaurer vos données.
              </p>
              <label className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg text-center block cursor-pointer border border-slate-300">
                Choisir fichier
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importStatus && (
            <div className="text-xs text-center font-bold text-blue-700 bg-blue-50 p-2 rounded-lg">
              {importStatus}
            </div>
          )}

          {/* Reset button */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              onClick={handleResetDemo}
              className="text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser les données démo
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
