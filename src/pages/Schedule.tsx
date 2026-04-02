import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Clock, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedModel = searchParams.get('model');

  const [models, setModels] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ dailyLimit: 5, adminPhone: '81992765391' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateAppointments, setDateAppointments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientCpf: '',
    modelId: preselectedModel || '',
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

  // For now, assume working days are Monday to Saturday
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

      const selectedModel = models.find(m => m.id === formData.modelId);

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

  if (loading) return <div className="text-center py-12">Carregando...</div>;

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-nude-200/50 border border-nude-100">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-3 mb-4">
            <CalendarIcon className="w-10 h-10 text-gold-500" />
            <h1 className="text-4xl font-serif text-nude-900">Agendar Horário</h1>
          </div>
          <p className="text-nude-500 font-light">Preencha os dados abaixo para solicitar seu agendamento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-gold-600 border-b border-nude-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Seus Dados
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-2">Nome Completo *</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-2">WhatsApp *</label>
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
                <label className="block text-sm font-medium text-nude-700 mb-2">CPF *</label>
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

          <div className="space-y-6 pt-4">
            <h2 className="text-2xl font-serif text-gold-600 border-b border-nude-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              O Serviço
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-4">Escolha o Serviço *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {models.map(model => (
                  <label 
                    key={model.id}
                    className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.modelId === model.id 
                        ? 'border-gold-500 bg-gold-50/50' 
                        : 'border-nude-200 hover:border-gold-300 bg-white'
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
                    {model.imageUrl && (
                      <img
                        src={model.imageUrl}
                        alt={model.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <span className="font-serif text-lg text-nude-900">{model.name}</span>
                    <span className="text-xl font-bold text-gold-600 mt-2">
                      R$ {model.price.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h2 className="text-2xl font-serif text-gold-600 border-b border-nude-100 pb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Data e Horário
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-4 text-center">Escolha a Data *</label>
              <div className="flex justify-center">
                <style>{`
                  .rdp-root {
                    --rdp-accent-color: #d4af37;
                    --rdp-background-color: #fdfbf7;
                    --rdp-accent-background-color: #fdfbf7;
                    --rdp-day_button-border-radius: 0.5rem;
                    --rdp-selected-border: 2px solid #d4af37;
                  }
                  .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                    background-color: #d4af37;
                    color: white;
                    font-weight: bold;
                  }
                  .rdp-day_button:hover:not([disabled]):not(.rdp-day_selected) {
                    background-color: #fdfbf7;
                    color: #d4af37;
                  }
                `}</style>
                <div className="bg-white p-4 rounded-2xl border border-nude-200 shadow-sm">
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
              </div>
              {selectedDate && isDateFull() && (
                <p className="text-red-500 text-sm mt-3 text-center font-medium">
                  Esta data já está com capacidade máxima. Escolha outra data.
                </p>
              )}
            </div>

            {selectedDate && !isDateFull() && (
              <div className="pt-6">
                <label className="block text-sm font-medium text-nude-700 mb-4 text-center">Horário Disponível *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {getAvailableTimes().map((time) => {
                    const available = isTimeAvailable(time);
                    const isSelected = formData.time === time;
                    return (
                      <label
                        key={time}
                        className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                          !available
                            ? "opacity-40 cursor-not-allowed bg-nude-100 border-nude-200"
                            : isSelected
                            ? "border-gold-500 bg-gold-50 text-gold-700 font-medium"
                            : "border-nude-200 hover:border-gold-300 bg-white text-nude-700"
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
                        <Clock className="w-4 h-4" />
                        {time}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedDate || !formData.time}
            className="w-full bg-nude-900 text-gold-300 py-5 rounded-xl font-medium text-lg hover:bg-nude-800 transition-colors disabled:opacity-50 mt-10 shadow-xl shadow-nude-200/50 uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {submitting ? 'Processando...' : (
              <>
                <CalendarIcon className="w-5 h-5" />
                Confirmar Agendamento
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
