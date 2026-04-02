import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Link } from 'react-router-dom';
import { CalendarHeart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [models, setModels] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    const qModels = query(collection(db, 'models'), where('active', '==', true));
    const unsubModels = onSnapshot(qModels, (snapshot) => {
      setModels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'models');
    });

    const qPromos = query(collection(db, 'promotions'), where('active', '==', true));
    const unsubPromos = onSnapshot(qPromos, (snapshot) => {
      setPromotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'promotions');
    });

    return () => {
      unsubModels();
      unsubPromos();
    };
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-20 px-4 bg-nude-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif text-nude-50 mb-6 leading-tight">
              Realce o seu <span className="text-gold-400 italic">olhar</span>
            </h1>
            <p className="text-lg md:text-xl text-nude-200 mb-10 font-light tracking-wide">
              Especialista em extensão de cílios. Agende seu horário e sinta-se ainda mais linda todos os dias.
            </p>
            <Link
              to="/schedule"
              className="inline-flex items-center gap-3 bg-gold-400 text-nude-900 px-8 py-4 rounded-full font-medium text-lg hover:bg-gold-300 transition-all hover:scale-105 shadow-[0_0_20px_rgba(223,184,133,0.3)]"
            >
              <CalendarHeart className="w-5 h-5" />
              Agendar Meu Horário
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Promotions */}
      {promotions.length > 0 && (
        <section>
          <div className="flex items-center justify-center gap-3 mb-10">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <h2 className="text-3xl font-serif text-nude-900 text-center">Promoções Especiais</h2>
            <Sparkles className="w-5 h-5 text-gold-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promotions.map((promo, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={promo.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-nude-200/50 border border-nude-100 flex flex-col sm:flex-row group"
              >
                <div className="sm:w-2/5 relative overflow-hidden">
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-64 sm:h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-8 sm:w-3/5 flex flex-col justify-center">
                  <h3 className="text-2xl font-serif text-nude-900 mb-3">{promo.title}</h3>
                  <p className="text-nude-600 font-light leading-relaxed">{promo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Models */}
      <section>
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-px w-12 bg-gold-300"></div>
          <h2 className="text-3xl font-serif text-nude-900 text-center">Nossos Modelos</h2>
          <div className="h-px w-12 bg-gold-300"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              key={model.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-nude-200/50 border border-nude-100 flex flex-col"
            >
              <div className="relative h-72 overflow-hidden">
                <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
              <div className="p-6 text-center flex flex-col flex-1">
                <h3 className="text-xl font-serif text-nude-900 mb-2">{model.name}</h3>
                <p className="text-2xl font-medium text-gold-600 mb-6 mt-auto">R$ {model.price.toFixed(2)}</p>
                <Link
                  to={`/schedule?model=${model.id}`}
                  className="block w-full bg-nude-900 text-gold-300 font-medium py-3 rounded-xl hover:bg-nude-800 transition-colors uppercase tracking-wider text-sm"
                >
                  Escolher este
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
