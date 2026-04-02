import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Phone, User } from 'lucide-react';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleConfirm = (appointment: any) => {
    // Open WhatsApp to confirm
    const message = `Olá ${appointment.clientName}! Seu agendamento para ${appointment.modelName} no dia ${appointment.date} às ${appointment.time} foi confirmado com sucesso. Te aguardo no Studio Ana B. Lopes!`;
    const url = `https://wa.me/55${appointment.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div>Carregando agendamentos...</div>;

  return (
    <div>
      <h1 className="text-4xl font-serif text-nude-900 mb-8">Agendamentos</h1>
      
      <div className="bg-white rounded-3xl shadow-xl shadow-nude-200/50 border border-nude-100 overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-8 text-center text-nude-500 font-light">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="divide-y divide-nude-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-nude-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-serif text-nude-900">{apt.clientName}</h3>
                    <span className="px-3 py-1 bg-nude-100 text-nude-700 text-xs rounded-full font-medium border border-nude-200">
                      {apt.modelName}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-nude-600 font-light">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold-500" /> {apt.date}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold-500" /> {apt.time}</div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-500" /> {apt.clientPhone}</div>
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gold-500" /> CPF: {apt.clientCpf}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirm(apt)}
                    className="px-6 py-3 bg-nude-900 text-gold-300 rounded-xl hover:bg-nude-800 transition-colors text-sm font-medium shadow-lg shadow-nude-200/50"
                  >
                    Confirmar no WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
