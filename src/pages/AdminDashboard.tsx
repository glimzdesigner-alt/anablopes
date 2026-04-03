import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Phone, User, CheckCircle2, Loader2, Sparkles, Search, Filter, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'appointments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date and time
      data.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      setAppointments(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });
    return () => unsubscribe();
  }, []);

  const handleConfirm = async (appointment: any) => {
    setConfirmingId(appointment.id);
    try {
      // Update status in system if not already confirmed
      if (appointment.status !== 'confirmed') {
        await updateDoc(doc(db, 'appointments', appointment.id), {
          status: 'confirmed'
        });
      }

      // Open WhatsApp to confirm
      const message = `Olá ${appointment.clientName}! Seu agendamento para ${appointment.modelName} no dia ${appointment.date} às ${appointment.time} foi confirmado com sucesso. Te aguardo no Studio Ana B. Lopes!`;
      const url = `https://wa.me/55${appointment.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${appointment.id}`);
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string, className: string }> = {
      pending: { label: "Pendente", className: "bg-brand-gray/10 text-brand-black border-brand-black/10" },
      confirmed: { label: "Confirmado", className: "bg-green-50 text-green-600 border-green-200" },
      cancelled: { label: "Cancelado", className: "bg-red-50 text-red-600 border-red-200" },
      completed: { label: "Concluído", className: "bg-brand-pink/10 text-brand-pink border-brand-pink/20" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-brand-pink animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-pink/40" />
      </div>
      <p className="text-nude-500 font-light text-xl">Carregando agendamentos...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-2">Agendamentos</h1>
          <p className="text-nude-500 font-light">Gerencie os atendimentos do Studio Ana B. Lopes.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl border border-nude-100">
          <div className="px-6 py-3 bg-brand-black text-white rounded-xl font-bold text-lg">
            {appointments.length} <span className="text-white/60 font-normal text-sm ml-1 uppercase tracking-widest">Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-[48px] p-24 text-center border border-dashed border-nude-200 shadow-3xl">
            <div className="w-24 h-24 bg-nude-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Calendar className="w-10 h-10 text-nude-200" />
            </div>
            <p className="text-nude-500 font-light text-xl">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((apt, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={apt.id} 
                className="bg-white rounded-[40px] p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:shadow-3xl transition-all border border-nude-100 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-brand-pink/10 transition-colors"></div>
                
                <div className="relative z-10 space-y-6 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-14 h-14 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif text-brand-black">{apt.clientName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-3 py-1 bg-brand-gray/10 text-brand-black text-[10px] rounded-full font-bold uppercase tracking-widest border border-brand-black/5">
                          {apt.modelName}
                        </span>
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-brand-black/70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nude-50 flex items-center justify-center text-brand-pink">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nude-50 flex items-center justify-center text-brand-pink">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nude-50 flex items-center justify-center text-brand-pink">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{apt.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nude-50 flex items-center justify-center text-brand-pink">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-xs">CPF: {apt.clientCpf}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex gap-4 shrink-0">
                  <button
                    onClick={() => handleConfirm(apt)}
                    disabled={confirmingId === apt.id}
                    className={`flex-1 lg:flex-none px-8 py-5 rounded-2xl transition-all font-bold text-lg shadow-xl flex items-center justify-center gap-3 ${
                      apt.status === 'confirmed' 
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-green-500/10' 
                      : 'bg-brand-black text-white hover:bg-brand-pink shadow-brand-black/10'
                    }`}
                  >
                    {confirmingId === apt.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : apt.status === 'confirmed' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Phone className="w-6 h-6" />
                    )}
                    {apt.status === 'confirmed' ? 'Reenviar WhatsApp' : 'Confirmar no WhatsApp'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


