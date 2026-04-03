import React, { useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Clock, Calendar, Sparkles, AlertCircle, X, Search, Check, Star, User, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const [searchPhone, setSearchPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [reviewingAppointment, setReviewingAppointment] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAppointments = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, "appointments"), where("clientPhone", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingAppointment) return;

    setSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        clientName: reviewingAppointment.clientName,
        rating,
        comment,
        approved: false,
        createdAt: new Date().toISOString(),
        appointmentId: reviewingAppointment.id
      });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      setReviewingAppointment(null);
      setRating(5);
      setComment("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "reviews");
    } finally {
      setSubmittingReview(false);
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

  const canCancel = (appointment: any) => {
    return appointment.status === "pending" || appointment.status === "confirmed";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 relative">
      {/* Modal de Confirmação */}
      <AnimatePresence>
        {cancelingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-brand-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-3xl border border-nude-100"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-serif text-brand-black text-center mb-4">Cancelar Agendamento?</h3>
              <p className="text-nude-500 font-light text-center mb-10 leading-relaxed">
                Tem certeza que deseja cancelar este agendamento? Esta ação não poderá ser desfeita.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setCancelingId(null)}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-brand-black bg-nude-50 hover:bg-nude-100 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-xl shadow-red-500/20"
                >
                  Sim, Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Avaliação */}
      <AnimatePresence>
        {reviewingAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-brand-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-3xl border border-nude-100"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-serif text-brand-black">Avaliar Atendimento</h3>
                <button onClick={() => setReviewingAppointment(null)} className="w-10 h-10 rounded-full bg-nude-50 flex items-center justify-center text-nude-400 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleReviewSubmit} className="space-y-8">
                <div className="text-center">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest mb-6">
                    Sua nota para {reviewingAppointment.modelName}
                  </label>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-all hover:scale-125"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= rating ? "fill-brand-pink text-brand-pink" : "text-nude-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest mb-4">
                    Seu comentário
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte-nos o que achou do resultado..."
                    className="w-full px-6 py-5 bg-nude-50 border border-nude-200 rounded-3xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none h-40 resize-none text-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-5 bg-brand-black text-white rounded-2xl font-bold text-xl hover:bg-brand-pink transition-all disabled:opacity-50 shadow-xl"
                >
                  {submittingReview ? "Enviando..." : "Enviar Avaliação"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-pink/10 mb-6">
          <Clock className="w-10 h-10 text-brand-pink" />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-brand-black mb-6">Meus Agendamentos</h1>
        <p className="text-nude-500 font-light text-xl max-w-xl mx-auto leading-relaxed">
          Digite seu WhatsApp para acompanhar o status dos seus agendamentos.
        </p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-3xl border border-nude-100 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
        
        <form onSubmit={handleSearch} className="relative z-10 flex flex-col sm:flex-row gap-6">
          <div className="flex-1 relative group">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
            <input
              type="tel"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Digite seu WhatsApp (ex: 81992765391)"
              className="w-full pl-14 pr-6 py-5 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all text-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-brand-black text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-brand-pink transition-all shadow-xl flex items-center justify-center gap-3 group"
          >
            <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Buscar
          </button>
        </form>
      </div>

      <AnimatePresence>
        {cancelSuccess && (
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
              Agendamento cancelado com sucesso!
            </p>
          </motion.div>
        )}

        {reviewSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-brand-pink/5 border border-brand-pink/20 rounded-3xl flex items-center gap-4 shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white">
              <Star className="h-6 w-6 fill-white" />
            </div>
            <p className="text-brand-pink font-bold text-lg">
              Obrigada! Sua avaliação foi enviada com sucesso.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!searched ? (
        <div className="bg-nude-50 rounded-[48px] p-20 text-center border border-dashed border-nude-200">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Search className="w-10 h-10 text-nude-200" />
          </div>
          <p className="text-nude-500 text-xl font-light">
            Digite seu WhatsApp acima para ver seus agendamentos
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink mb-6"></div>
          <p className="text-nude-500 font-light text-xl">Buscando agendamentos...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-nude-50 rounded-[48px] p-20 text-center border border-dashed border-nude-200">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <AlertCircle className="w-10 h-10 text-nude-200" />
          </div>
          <p className="text-nude-500 text-xl font-light mb-4">
            Você ainda não tem agendamentos
          </p>
          <Link to="/schedule" className="text-brand-pink font-bold hover:underline">
            Faça seu primeiro agendamento agora!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {appointments.map((appointment, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={appointment.id}
              className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-nude-100 flex flex-col hover:border-brand-pink/30 transition-all group"
            >
              <div className="bg-brand-black p-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-pink/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-pink" />
                  </div>
                  <h3 className="text-2xl font-serif text-white">
                    {appointment.modelName}
                  </h3>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
              
              <div className="p-10 space-y-8 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-brand-black">
                    <div className="w-10 h-10 rounded-xl bg-nude-50 flex items-center justify-center text-brand-pink">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-medium">
                      {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-brand-black">
                    <div className="w-10 h-10 rounded-xl bg-nude-50 flex items-center justify-center text-brand-pink">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-medium">{appointment.time}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-nude-100 flex items-center gap-3 text-xs text-nude-400 uppercase tracking-widest font-bold">
                  <User className="w-3 h-3" />
                  ID: {appointment.id.slice(0, 8)}
                </div>

                <div className="pt-4 mt-auto space-y-4">
                  {canCancel(appointment) && (
                    <button
                      onClick={() => setCancelingId(appointment.id)}
                      className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-5 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
                    >
                      <X className="w-5 h-5" />
                      Cancelar Agendamento
                    </button>
                  )}

                  {appointment.status === "confirmed" && (
                    <button
                      onClick={() => setReviewingAppointment(appointment)}
                      className="w-full flex items-center justify-center gap-3 bg-brand-pink text-white py-5 rounded-2xl font-bold hover:bg-brand-pink-dark transition-all shadow-xl shadow-brand-pink/20"
                    >
                      <Star className="w-5 h-5 fill-white" />
                      Avaliar Atendimento
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

