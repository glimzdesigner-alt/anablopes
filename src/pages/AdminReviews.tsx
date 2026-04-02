import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      <div className="flex items-center justify-center h-64">
        <p className="text-nude-500 font-light">Carregando avaliações...</p>
      </div>
    );
  }

  const ReviewCard = ({ review, isPending }: { review: any, isPending: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg shadow-nude-200/50 border border-nude-100 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-serif text-nude-900">{review.clientName}</h3>
          <div className="flex gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-nude-200'}`}
              />
            ))}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase ${
          isPending ? 'bg-gold-50 text-gold-700 border border-gold-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {isPending ? 'Pendente' : 'Aprovada'}
        </span>
      </div>
      
      <div className="flex-1">
        {review.comment && (
          <p className="text-nude-600 font-light italic mb-4">"{review.comment}"</p>
        )}
        <p className="text-xs text-nude-400 mb-6">
          {new Date(review.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      <div className="flex gap-3 mt-auto pt-4 border-t border-nude-100">
        {isPending ? (
          <button
            onClick={() => handleApprove(review.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-nude-900 text-gold-300 py-2.5 rounded-xl font-medium hover:bg-nude-800 transition-colors text-sm"
          >
            <Check className="w-4 h-4" />
            Aprovar
          </button>
        ) : (
          <button
            onClick={() => handleReject(review.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-nude-50 text-nude-600 py-2.5 rounded-xl font-medium hover:bg-nude-100 transition-colors text-sm border border-nude-200"
          >
            <X className="w-4 h-4" />
            Ocultar
          </button>
        )}
        <button
          onClick={() => handleDelete(review.id)}
          className="flex items-center justify-center p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-gold-500" />
          <h1 className="text-3xl font-serif text-nude-900">Gerenciar Avaliações</h1>
        </div>
        <p className="text-nude-500 font-light">Aprove e gerencie os depoimentos das suas clientes.</p>
      </div>

      {/* Pendentes */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-serif text-nude-900">
            Pendentes de Aprovação <span className="text-gold-600 text-lg">({pendingReviews.length})</span>
          </h2>
        </div>
        
        {pendingReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-nude-100 shadow-sm">
            <p className="text-nude-400 font-light">Nenhuma avaliação pendente no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingReviews.map((review) => (
              <ReviewCard key={review.id} review={review} isPending={true} />
            ))}
          </div>
        )}
      </section>

      {/* Aprovadas */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-serif text-nude-900">
            Avaliações Aprovadas <span className="text-green-600 text-lg">({approvedReviews.length})</span>
          </h2>
        </div>
        
        {approvedReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-nude-100 shadow-sm">
            <p className="text-nude-400 font-light">Nenhuma avaliação aprovada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} isPending={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
