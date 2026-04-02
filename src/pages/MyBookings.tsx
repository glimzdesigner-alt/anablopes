import React, { useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Clock, Calendar, Sparkles, AlertCircle, X, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyBookings() {
  const [searchPhone, setSearchPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchAppointments = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, "appointments"), where("clientPhone", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAppointments(data);
      setSearched(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPhone(searchPhone);
    fetchAppointments(searchPhone);
  };

  const confirmCancel = async () => {
    if (!cancelingId) return;
    
    try {
      await updateDoc(doc(db, "appointments", cancelingId), { status: "cancelled" });
      setCancelSuccess(true);
      setTimeout(() => setCancelSuccess(false), 3000);
      fetchAppointments(phone);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${cancelingId}`);
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string, className: string }> = {
      pending: { label: "Pendente", className: "bg-gold-100 text-gold-800 border-gold-200" },
      confirmed: { label: "Confirmado", className: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" },
      completed: { label: "Concluído", className: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const canCancel = (appointment: any) => {
    return appointment.status === "pending" || appointment.status === "confirmed";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {/* Modal de Confirmação */}
      <AnimatePresence>
        {cancelingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-nude-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-nude-100"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif text-nude-900 text-center mb-4">Cancelar Agendamento?</h3>
              <p className="text-nude-600 font-light text-center mb-8">
                Tem certeza que deseja cancelar este agendamento? Esta ação não poderá ser desfeita.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setCancelingId(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-nude-700 bg-nude-50 hover:bg-nude-100 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                >
                  Sim, Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-3 mb-4">
          <Clock className="w-10 h-10 text-gold-500" />
          <h1 className="text-4xl font-serif text-nude-900">Meus Agendamentos</h1>
        </div>
        <p className="text-nude-500 font-light text-lg">Digite seu WhatsApp para ver seus agendamentos</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-nude-200/50 border border-nude-100 mb-12">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="tel"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Digite seu WhatsApp (ex: 81992765391)"
            className="flex-1 px-5 py-4 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all text-lg"
            required
          />
          <button
            type="submit"
            className="bg-nude-900 text-gold-300 px-8 py-4 rounded-xl font-medium text-lg hover:bg-nude-800 transition-colors shadow-lg shadow-nude-200/50 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </form>
      </div>

      {cancelSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
        >
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Agendamento cancelado com sucesso!
          </p>
        </motion.div>
      )}

      {!searched ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-nude-100 shadow-sm">
          <Search className="w-16 h-16 text-nude-200 mx-auto mb-4" />
          <p className="text-nude-500 text-lg font-light mb-2">
            Digite seu WhatsApp acima para ver seus agendamentos
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <p className="text-nude-500 font-light text-lg">Buscando agendamentos...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-nude-100 shadow-sm">
          <AlertCircle className="w-16 h-16 text-nude-200 mx-auto mb-4" />
          <p className="text-nude-500 text-lg font-light mb-2">
            Você ainda não tem agendamentos
          </p>
          <p className="text-nude-400 font-light">
            Faça seu primeiro agendamento e transforme seu olhar!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {appointments.map((appointment, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={appointment.id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-nude-200/50 border border-nude-100 flex flex-col hover:shadow-xl transition-all"
            >
              <div className="bg-nude-50 p-6 border-b border-nude-100 flex justify-between items-start">
                <h3 className="text-xl font-serif text-nude-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  {appointment.modelName}
                </h3>
                {getStatusBadge(appointment.status)}
              </div>
              <div className="p-6 space-y-4 flex-1">
                <div className="flex items-center gap-3 text-nude-700">
                  <Calendar className="w-5 h-5 text-gold-500" />
                  <span className="font-medium">
                    {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-nude-700">
                  <Clock className="w-5 h-5 text-gold-500" />
                  <span className="font-medium">{appointment.time}</span>
                </div>
                
                <div className="pt-4 border-t border-nude-100 text-xs text-nude-400">
                  Agendado em: {new Date(appointment.createdAt).toLocaleString('pt-BR')}
                </div>

                {canCancel(appointment) && (
                  <div className="pt-4 mt-auto">
                    <button
                      onClick={() => setCancelingId(appointment.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <X className="w-4 h-4" />
                      Cancelar Agendamento
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
