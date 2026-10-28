import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                {message}
              </p>
              {itemName && (
                <div className="mt-3 p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl text-xs font-mono font-semibold text-rose-900 break-all">
                  {itemName}
                </div>
              )}
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isLoading ? 'Menghapus...' : 'Ya, Hapus Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
