import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Star, Check, X, Trash2, MessageSquare, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Ordenar por data mais recente
      reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(reviewsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${id}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `reviews/${id}`);
      }
    }
  };

  const pendingReviews = reviews.filter(r => !r.approved);
  const approvedReviews = reviews.filter(r => r.approved);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-brand-black">
        <Loader2 className="w-12 h-12 animate-spin text-brand-pink mb-4" />
        <p className="text-nude-500 font-light tracking-widest uppercase text-sm">Carregando avaliações...</p>
      </div>
    );
  }

  const ReviewCard = ({ review, isPending, key }: { review: any, isPending: boolean, key?: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-[40px] p-8 shadow-2xl border border-nude-100 flex flex-col h-full relative group hover:border-brand-pink/30 transition-all"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-[40px] rounded-full -mr-16 -mt-16"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-2xl font-serif text-brand-black mb-2">{review.clientName}</h3>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'fill-brand-pink text-brand-pink' : 'text-nude-200'}`}
              />
            ))}
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-widest uppercase border ${
          isPending 
          ? 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' 
          : 'bg-green-50 text-green-600 border-green-100'
        }`}>
          {isPending ? 'Pendente' : 'Aprovada'}
        </span>
      </div>
      
      <div className="flex-1 relative z-10">
        {review.comment && (
          <div className="relative">
            <Sparkles className="absolute -left-2 -top-2 w-4 h-4 text-brand-pink/30" />
            <p className="text-nude-600 font-light italic mb-6 leading-relaxed text-lg">"{review.comment}"</p>
          </div>
        )}
        <p className="text-xs text-nude-400 font-bold uppercase tracking-widest mb-8">
          {new Date(review.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      <div className="flex gap-3 mt-auto pt-6 border-t border-nude-100 relative z-10">
        {isPending ? (
          <button
            onClick={() => handleApprove(review.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-black text-white py-3.5 rounded-2xl font-bold hover:bg-brand-pink transition-all text-xs uppercase tracking-widest shadow-lg shadow-brand-black/10"
          >
            <Check className="w-4 h-4" />
            Aprovar
          </button>
        ) : (
          <button
            onClick={() => handleReject(review.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-nude-50 text-nude-600 py-3.5 rounded-2xl font-bold hover:bg-nude-100 transition-all text-xs uppercase tracking-widest border border-nude-200"
          >
            <EyeOff className="w-4 h-4" />
            Ocultar
          </button>
        )}
        <button
          onClick={() => handleDelete(review.id)}
          className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-lg shadow-red-500/5"
          title="Excluir"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-2">Avaliações</h1>
          <p className="text-nude-500 font-light">Gerencie os depoimentos e feedbacks das clientes.</p>
        </div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-pink/10">
          <MessageSquare className="w-8 h-8 text-brand-pink" />
        </div>
      </div>

      {/* Pendentes */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 border-b border-nude-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
            <EyeOff className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-serif text-brand-black">
            Pendentes de Aprovação <span className="text-brand-pink ml-2 opacity-50">({pendingReviews.length})</span>
          </h2>
        </div>
        
        <AnimatePresence mode="popLayout">
          {pendingReviews.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[40px] p-16 text-center border border-nude-100 shadow-3xl"
            >
              <p className="text-nude-400 font-light text-lg italic">Tudo em dia! Nenhuma avaliação pendente.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {pendingReviews.map((review) => (
                <ReviewCard key={review.id} review={review} isPending={true} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Aprovadas */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 border-b border-nude-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-serif text-brand-black">
            Avaliações Aprovadas <span className="text-green-600 ml-2 opacity-50">({approvedReviews.length})</span>
          </h2>
        </div>
        
        <AnimatePresence mode="popLayout">
          {approvedReviews.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[40px] p-16 text-center border border-nude-100 shadow-3xl"
            >
              <p className="text-nude-400 font-light text-lg italic">Ainda não há avaliações aprovadas para exibição.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {approvedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} isPending={false} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

