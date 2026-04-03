import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Clock, Calendar as CalendarIcon, Sparkles, User, Phone, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedModel = searchParams.get('model');
  const promoId = searchParams.get('promo');

  const [models, setModels] = useState<any[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [settings, setSettings] = useState<any>({ dailyLimit: 5, adminPhone: '81992765391' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateAppointments, setDateAppointments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientCpf: '',
    modelId: preselectedModel || promoId || '',
    date: '',
    time: ''
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qModels = query(collection(db, 'models'), where('active', '==', true));
        const modelsSnap = await getDocs(qModels);
        setModels(modelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        if (promoId) {
          const promoSnap = await getDoc(doc(db, 'promotions', promoId));
          if (promoSnap.exists()) {
            setSelectedPromo({ id: promoSnap.id, ...promoSnap.data() });
          }
        }

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
  }, [promoId]);

  // Fetch appointments when date changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDate) {
        setDateAppointments([]);
        return;
      }
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      try {
        const q = query(collection(db, 'appointments'), where('date', '==', dateStr));
        const snap = await getDocs(q);
        setDateAppointments(snap.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching appointments for date", error);
      }
    };
    
    fetchAppointments();
  }, [selectedDate]);

  const getAvailableTimes = () => {
    const isSaturday = selectedDate && selectedDate.getDay() === 6;
    
    if (isSaturday) {
      return [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00"
      ];
    }
    
    return [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
      "16:00", "16:30", "17:00", "17:30", "18:00",
    ];
  };

  const isTimeAvailable = (time: string) => {
    if (!selectedDate) return true;
    const bookedAtTime = dateAppointments.filter(
      (apt) => apt.time === time && apt.status !== "cancelled"
    ).length;
    return bookedAtTime === 0;
  };

  const isDateFull = () => {
    if (!selectedDate) return false;
    const confirmedAppointments = dateAppointments.filter(
      (apt) => apt.status !== "cancelled"
    ).length;
    return confirmedAppointments >= (settings.dailyLimit || 5);
  };

  const isWorkingDay = (date: Date) => {
    const day = date.getDay();
    return day !== 0; // Sunday is 0
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !formData.time) {
      alert("Por favor, selecione uma data e um horário.");
      return;
    }

    if (isDateFull()) {
      alert("Esta data já atingiu o limite de agendamentos.");
      return;
    }

    if (!isTimeAvailable(formData.time)) {
      alert("Este horário não está mais disponível.");
      return;
    }

    setSubmitting(true);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dailyCountRef = doc(db, 'daily_counts', dateStr);
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

      const selectedModel = selectedPromo 
        ? { name: selectedPromo.title, price: selectedPromo.promotional_price }
        : models.find(m => m.id === formData.modelId);

      if (!selectedModel) {
        alert("Por favor, selecione um serviço.");
        setSubmitting(false);
        return;
      }

      const batch = writeBatch(db);

      const newAppointmentRef = doc(collection(db, 'appointments'));
      batch.set(newAppointmentRef, {
        ...formData,
        date: dateStr,
        modelName: selectedModel.name,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      if (dailyCountSnap.exists()) {
        batch.update(dailyCountRef, { count: currentCount + 1 });
      } else {
        batch.set(dailyCountRef, { count: 1 });
      }

      await batch.commit();

      const message = `Olá Ana! Gostaria de agendar uma extensão de cílios.\n\n*Nome:* ${formData.clientName}\n*Modelo:* ${selectedModel.name}\n*Data:* ${format(selectedDate, 'dd/MM/yyyy')}\n*Horário:* ${formData.time}`;
      const url = `https://wa.me/55${settings.adminPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
      navigate('/my-bookings');

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink"></div>
    </div>
  );

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-16 rounded-[32px] md:rounded-[48px] shadow-3xl border border-nude-100 relative overflow-hidden"
      >
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-brand-pink/10 mb-6">
              <CalendarIcon className="w-8 h-8 md:w-10 md:h-10 text-brand-pink" />
            </div>
            <h1 className="text-3xl md:text-6xl font-serif text-brand-black mb-4 md:mb-6">Agendar Horário</h1>
            <p className="text-nude-500 font-light text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Preencha os dados abaixo para solicitar seu agendamento e realçar sua beleza.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Step 1: Personal Info */}
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-brand-black text-white flex items-center justify-center font-bold text-sm md:text-base">1</div>
                <h2 className="text-xl md:text-2xl font-serif text-brand-black">Seus Dados</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                  <input
                    type="text"
                    placeholder="Nome Completo *"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 md:py-5 bg-nude-50 border border-nude-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all text-base md:text-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                    <input
                      type="tel"
                      placeholder="WhatsApp *"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className="w-full pl-14 pr-6 py-4 md:py-5 bg-nude-50 border border-nude-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all text-base md:text-lg"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                    <input
                      type="text"
                      placeholder="CPF (Opcional)"
                      value={formData.clientCpf}
                      onChange={(e) => setFormData({...formData, clientCpf: e.target.value})}
                      className="w-full pl-14 pr-6 py-4 md:py-5 bg-nude-50 border border-nude-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all text-base md:text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Service Selection */}
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-brand-black text-white flex items-center justify-center font-bold text-sm md:text-base">2</div>
                <h2 className="text-xl md:text-2xl font-serif text-brand-black">O Serviço</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {selectedPromo ? (
                  <div className="col-span-full">
                    <div className="p-6 md:p-8 border-2 border-brand-pink bg-brand-pink/5 rounded-[32px] relative overflow-hidden group">
                      <div className="absolute top-4 right-4 bg-brand-pink text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Promoção Ativa</div>
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        {selectedPromo.imageUrl && (
                          <div className="w-full md:w-48 h-32 md:h-32 rounded-2xl overflow-hidden shrink-0">
                            <img src={selectedPromo.imageUrl} alt={selectedPromo.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-2xl md:text-3xl font-serif text-brand-black mb-2">{selectedPromo.title}</h3>
                          <p className="text-nude-500 font-light text-sm md:text-base mb-4">{selectedPromo.description}</p>
                          <div className="flex items-center justify-center md:justify-start gap-4">
                            {selectedPromo.original_price && (
                              <span className="text-nude-400 line-through text-lg">R$ {selectedPromo.original_price.toFixed(2)}</span>
                            )}
                            <span className="text-2xl md:text-3xl font-bold text-brand-pink">R$ {selectedPromo.promotional_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedPromo(null);
                        setFormData(prev => ({ ...prev, modelId: '' }));
                        navigate('/schedule', { replace: true });
                      }}
                      className="mt-4 text-sm text-nude-400 hover:text-brand-pink transition-colors underline underline-offset-4"
                    >
                      Escolher outro modelo (sair da promoção)
                    </button>
                  </div>
                ) : (
                  models.map(model => (
                    <label 
                      key={model.id}
                      className={`relative flex flex-col p-4 md:p-6 border-2 rounded-2xl md:rounded-[32px] cursor-pointer transition-all group ${
                        formData.modelId === model.id 
                          ? 'border-brand-pink bg-brand-pink/5' 
                          : 'border-nude-100 hover:border-brand-pink/30 bg-white'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="model" 
                        value={model.id}
                        checked={formData.modelId === model.id}
                        onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                        className="sr-only"
                        required
                      />
                      {formData.modelId === model.id && (
                        <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 md:w-6 md:h-6 text-brand-pink" />
                      )}
                      {model.imageUrl && (
                        <div className="h-32 md:h-40 overflow-hidden rounded-xl md:rounded-2xl mb-4 md:mb-6">
                          <img
                            src={model.imageUrl}
                            alt={model.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <span className="font-serif text-xl md:text-2xl text-brand-black mb-1 md:mb-2">{model.name}</span>
                      <span className="text-xl md:text-2xl font-bold text-brand-pink">
                        R$ {model.price.toFixed(2)}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Step 3: Date & Time */}
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-brand-black text-white flex items-center justify-center font-bold text-sm md:text-base">3</div>
                <h2 className="text-xl md:text-2xl font-serif text-brand-black">Data e Horário</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
                <div className="flex flex-col items-center">
                  <style>{`
                    .rdp-root {
                      --rdp-accent-color: #ff4d8d;
                      --rdp-background-color: #fff5f8;
                      --rdp-day_button-border-radius: 1rem;
                    }
                    .rdp-day_selected {
                      background-color: var(--rdp-accent-color) !important;
                      color: white !important;
                      font-weight: bold;
                      box-shadow: 0 10px 20px rgba(255, 77, 141, 0.3);
                    }
                    .rdp-day_button:hover:not([disabled]):not(.rdp-day_selected) {
                      background-color: var(--rdp-background-color);
                      color: var(--rdp-accent-color);
                    }
                    .rdp-month_caption {
                      font-family: 'Playfair Display', serif;
                      font-size: 1.25rem;
                      margin-bottom: 1rem;
                    }
                    @media (max-width: 640px) {
                      .rdp-month {
                        width: 100%;
                      }
                      .rdp-table {
                        width: 100%;
                        max-width: none;
                      }
                    }
                  `}</style>
                  <div className="bg-nude-50 p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-nude-100 shadow-inner w-full flex justify-center">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setFormData({...formData, time: ''});
                      }}
                      disabled={(date) => {
                        if (date < minDate) return true;
                        return !isWorkingDay(date);
                      }}
                      locale={ptBR}
                      className="font-sans"
                    />
                  </div>
                  {selectedDate && isDateFull() && (
                    <p className="text-red-500 text-sm mt-4 font-medium">
                      Esta data já está com capacidade máxima.
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedDate && !isDateFull() ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {getAvailableTimes().map((time) => {
                        const available = isTimeAvailable(time);
                        const isSelected = formData.time === time;
                        return (
                          <label
                            key={time}
                            className={`flex flex-col items-center justify-center p-3 md:p-4 border-2 rounded-xl md:rounded-2xl cursor-pointer transition-all ${
                              !available
                                ? "opacity-30 cursor-not-allowed bg-nude-100 border-nude-200"
                                : isSelected
                                ? "border-brand-pink bg-brand-pink text-white shadow-xl shadow-brand-pink/20"
                                : "border-nude-100 hover:border-brand-pink/30 bg-white text-brand-black"
                            }`}
                          >
                            <input
                              type="radio"
                              name="time"
                              value={time}
                              checked={isSelected}
                              onChange={(e) => setFormData({...formData, time: e.target.value})}
                              disabled={!available}
                              className="sr-only"
                              required
                            />
                            <Clock className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : 'text-brand-pink'}`} />
                            <span className="font-bold text-sm md:text-base">{time}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 md:p-12 bg-nude-50 rounded-2xl md:rounded-[32px] border border-dashed border-nude-200 text-nude-400 text-center">
                      <CalendarIcon className="w-10 h-10 md:w-12 md:h-12 mb-4 opacity-20" />
                      <p className="text-sm md:text-base">Selecione uma data para ver os horários disponíveis</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedDate || !formData.time}
              className="w-full bg-brand-black text-white py-4 md:py-6 rounded-xl md:rounded-[24px] font-bold text-lg md:text-2xl hover:bg-brand-pink transition-all disabled:opacity-50 mt-8 md:mt-12 shadow-2xl flex items-center justify-center gap-4 group"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
                  Confirmar Agendamento
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

