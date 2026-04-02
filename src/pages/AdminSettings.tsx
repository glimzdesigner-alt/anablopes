import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Settings, Check, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [dailyLimit, setDailyLimit] = useState(10);
  const [adminPhone, setAdminPhone] = useState('5581992765391');
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const daysOfWeek = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDailyLimit(data.dailyLimit || 10);
          setAdminPhone(data.adminPhone || '5581992765391');
          if (data.workingDays) {
            setWorkingDays(data.workingDays);
          }
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
        adminPhone,
        workingDays
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setWorkingDays((prev: any) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-10 h-10 text-gold-500" />
          <h1 className="text-4xl font-serif text-nude-900">Configurações</h1>
        </div>
        <p className="text-nude-500 font-light">Gerencie as configurações do sistema</p>
      </div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
        >
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Configurações salvas com sucesso!
          </p>
        </motion.div>
      )}

      <div className="bg-white rounded-3xl shadow-xl shadow-nude-200/50 border border-nude-100 overflow-hidden">
        <div className="bg-nude-900 text-gold-300 p-6 border-b border-nude-800">
          <h2 className="text-xl font-serif flex items-center gap-3">
            <Settings className="w-6 h-6" />
            Configurações do Sistema
          </h2>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="block text-lg font-serif text-nude-900 mb-2">
                Capacidade Diária de Atendimentos
              </label>
              <p className="text-sm text-nude-500 font-light mb-3">
                Número máximo de clientes que podem ser atendidos por dia
              </p>
              <input
                type="number"
                min="1"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-serif text-nude-900 mb-2">
                WhatsApp da Administradora
              </label>
              <p className="text-sm text-nude-500 font-light mb-3">
                Número que receberá as notificações de agendamento (com código do país e DDD)
              </p>
              <input
                type="text"
                placeholder="5581992765391"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                required
              />
              <p className="text-xs text-nude-400 mt-2">
                Exemplo: 5581992765391 (55 = Brasil, 81 = DDD)
              </p>
            </div>

            <div>
              <label className="text-lg font-serif text-nude-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-500" />
                Dias de Trabalho
              </label>
              <p className="text-sm text-nude-500 font-light mb-4">
                Selecione os dias da semana que você irá atender clientes
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-nude-50 p-6 rounded-2xl border border-nude-100">
                {daysOfWeek.map((day) => (
                  <label key={day.key} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={(workingDays as any)[day.key]}
                        onChange={() => handleDayToggle(day.key)}
                        className="peer sr-only"
                      />
                      <div className="w-6 h-6 border-2 border-nude-300 rounded bg-white peer-checked:bg-gold-500 peer-checked:border-gold-500 transition-all flex items-center justify-center">
                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-nude-700 group-hover:text-nude-900 transition-colors">
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-nude-400 mt-3">
                Os dias desmarcados não aparecerão como disponíveis no calendário de agendamento
              </p>
            </div>

            <div className="pt-6 border-t border-nude-100">
              <div className="bg-gold-50 p-6 rounded-2xl border border-gold-200">
                <h3 className="font-serif text-gold-800 mb-3 text-lg">
                  ℹ️ Informações Importantes
                </h3>
                <ul className="text-sm text-gold-700/80 space-y-2 font-light">
                  <li>• A primeira conta criada no sistema é automaticamente admin</li>
                  <li>• Quando uma cliente agendar, uma mensagem será enviada via WhatsApp</li>
                  <li>• Após confirmar o agendamento, a cliente receberá uma confirmação automática</li>
                  <li>• Os dias não selecionados não estarão disponíveis para agendamento</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-nude-900 text-gold-300 py-5 rounded-xl font-medium text-lg hover:bg-nude-800 transition-colors disabled:opacity-50 mt-8 shadow-xl shadow-nude-200/50 uppercase tracking-wider"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
