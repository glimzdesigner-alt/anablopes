import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedModel = searchParams.get('model');

  const [models, setModels] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ dailyLimit: 5, adminPhone: '81992765391' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientCpf: '',
    modelId: preselectedModel || '',
    date: '',
    time: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch models
        const qModels = query(collection(db, 'models'), where('active', '==', true));
        const modelsSnap = await getDocs(qModels);
        setModels(modelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data());
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'models/settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Check daily limit
      const dailyCountRef = doc(db, 'daily_counts', formData.date);
      const dailyCountSnap = await getDoc(dailyCountRef);
      
      let currentCount = 0;
      if (dailyCountSnap.exists()) {
        currentCount = dailyCountSnap.data().count;
      }

      if (currentCount >= settings.dailyLimit) {
        alert('Desculpe, este dia já atingiu o limite máximo de agendamentos. Por favor, escolha outra data.');
        setSubmitting(false);
        return;
      }

      const selectedModel = models.find(m => m.id === formData.modelId);

      const batch = writeBatch(db);

      // Create appointment
      const newAppointmentRef = doc(collection(db, 'appointments'));
      batch.set(newAppointmentRef, {
        ...formData,
        modelName: selectedModel.name,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Update daily count
      if (dailyCountSnap.exists()) {
        batch.update(dailyCountRef, { count: currentCount + 1 });
      } else {
        batch.set(dailyCountRef, { count: 1 });
      }

      await batch.commit();

      // Open WhatsApp
      const message = `Olá Ana! Gostaria de agendar uma extensão de cílios.\n\n*Nome:* ${formData.clientName}\n*Modelo:* ${selectedModel.name}\n*Data:* ${format(new Date(formData.date + 'T00:00:00'), 'dd/MM/yyyy')}\n*Horário:* ${formData.time}`;
      const url = `https://wa.me/55${settings.adminPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
      navigate('/');

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-nude-200/50 border border-nude-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-nude-900 mb-3">Agende seu Horário</h1>
          <p className="text-nude-500 font-light">Preencha os dados abaixo para solicitar seu agendamento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <h2 className="text-xl font-serif text-gold-600 border-b border-nude-100 pb-3">Seus Dados</h2>
            
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-2">Nome Completo</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-2">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.clientCpf}
                  onChange={(e) => setFormData({...formData, clientCpf: e.target.value})}
                  className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-4">
            <h2 className="text-xl font-serif text-gold-600 border-b border-nude-100 pb-3">O Agendamento</h2>
            
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-2">Modelo de Cílios</label>
              <select
                value={formData.modelId}
                onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all appearance-none"
                required
              >
                <option value="">Selecione um modelo...</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - R$ {model.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-2">Data</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-2">Horário</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-nude-900 text-gold-300 py-4 rounded-xl font-medium text-lg hover:bg-nude-800 transition-colors disabled:opacity-50 mt-10 shadow-xl shadow-nude-200/50 uppercase tracking-wider"
          >
            {submitting ? 'Processando...' : 'Concluir Agendamento'}
          </button>
        </form>
      </div>
    </div>
  );
}
