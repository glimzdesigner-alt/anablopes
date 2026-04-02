import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const [dailyLimit, setDailyLimit] = useState(5);
  const [adminPhone, setAdminPhone] = useState('81992765391');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDailyLimit(data.dailyLimit || 5);
          setAdminPhone(data.adminPhone || '81992765391');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/global');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        dailyLimit: Number(dailyLimit),
        adminPhone
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>
      
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Limite de Clientes por Dia
          </label>
          <input
            type="number"
            min="1"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Quantos agendamentos o sistema deve aceitar por dia.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seu Número do WhatsApp (Admin)
          </label>
          <input
            type="text"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Apenas números, com DDD. Ex: 81992765391</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
