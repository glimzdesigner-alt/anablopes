import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Settings, Check, Calendar, Image as ImageIcon, Phone, Info, Save, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSettings() {
  const [dailyLimit, setDailyLimit] = useState(10);
  const [adminPhone, setAdminPhone] = useState('5581992765391');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [heroBgUrl, setHeroBgUrl] = useState('');
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
          setAddress(data.address || '');
          setContactEmail(data.contactEmail || '');
          setLogoUrl(data.logoUrl || '');
          setHeroBgUrl(data.heroBgUrl || '');
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
        address,
        contactEmail,
        logoUrl,
        heroBgUrl,
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
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-2">Configurações</h1>
          <p className="text-nude-500 font-light">Gerencie as configurações do sistema e aparência.</p>
        </div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-pink/10">
          <Settings className="w-8 h-8 text-brand-pink" />
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-green-50 border border-green-200 rounded-3xl flex items-center gap-4 shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-green-800 font-bold text-lg">
              Configurações salvas com sucesso!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[48px] shadow-3xl border border-nude-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="bg-brand-black p-8 md:p-10 border-b border-white/10 relative z-10">
          <h2 className="text-2xl font-serif text-white flex items-center gap-4">
            <Sparkles className="w-7 h-7 text-brand-pink" />
            Painel de Controle
          </h2>
        </div>
        
        <div className="p-8 md:p-12 relative z-10">
          <form onSubmit={handleSave} className="space-y-12">
            
            {/* Seção de Aparência */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-nude-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif text-brand-black">Aparência da Página Inicial</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">
                    URL da Logo
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                  <p className="text-xs text-nude-400 font-light italic">
                    Link da imagem da sua logo (deixe vazio para usar texto)
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">
                    URL da Imagem de Fundo
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/fundo.jpg"
                    value={heroBgUrl}
                    onChange={(e) => setHeroBgUrl(e.target.value)}
                    className="w-full px-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                  <p className="text-xs text-nude-400 font-light italic">
                    Link da imagem de fundo principal (Hero)
                  </p>
                </div>
              </div>
            </div>

            {/* Seção de Agendamento */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-nude-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif text-brand-black">Regras de Agendamento</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">
                    Capacidade Diária
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-nude-400 font-light italic">
                    Máximo de atendimentos por dia
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">
                    WhatsApp da Administradora
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                    <input
                      type="text"
                      placeholder="5581992765391"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-nude-400 font-light italic">
                    Exemplo: 5581992765391 (55 = Brasil, 81 = DDD)
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    placeholder="contato@anablopes.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Rua Exemplo, 123 - Bairro, Cidade - PE"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                  <p className="text-xs text-nude-400 font-light italic">
                    Este endereço será usado para exibir o mapa na página inicial.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">
                  Dias de Trabalho
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-nude-50 p-8 rounded-[32px] border border-nude-100">
                  {daysOfWeek.map((day) => (
                    <label key={day.key} className="flex items-center space-x-4 cursor-pointer group p-3 rounded-xl hover:bg-white transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={(workingDays as any)[day.key]}
                          onChange={() => handleDayToggle(day.key)}
                          className="peer sr-only"
                        />
                        <div className="w-7 h-7 border-2 border-nude-300 rounded-lg bg-white peer-checked:bg-brand-pink peer-checked:border-brand-pink transition-all flex items-center justify-center">
                          <Check className="w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-nude-700 group-hover:text-brand-black transition-colors">
                        {day.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-nude-100">
              <div className="bg-brand-black p-8 rounded-[32px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/10 blur-[40px] rounded-full -mr-16 -mt-16"></div>
                <h3 className="text-xl font-serif flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-brand-pink" />
                  Informações Importantes
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-nude-400 font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink font-bold">•</span>
                    A primeira conta criada no sistema é automaticamente admin.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink font-bold">•</span>
                    Notificações de novos agendamentos são enviadas via WhatsApp.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink font-bold">•</span>
                    A cliente recebe confirmação após você validar no painel.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-pink font-bold">•</span>
                    Dias desmarcados não aparecem no calendário de agendamento.
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-black text-white py-6 rounded-2xl font-bold text-xl hover:bg-brand-pink transition-all disabled:opacity-50 mt-8 shadow-2xl shadow-brand-black/20 uppercase tracking-widest flex items-center justify-center gap-3 group"
            >
              {saving ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
              )}
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';

