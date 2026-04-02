import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Link } from 'react-router-dom';
import { CalendarHeart, Star } from 'lucide-react';
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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-b from-pink-100 to-pink-50 rounded-3xl border border-pink-200 shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Realce o seu <span className="text-pink-600">olhar</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto px-4">
          Especialista em extensão de cílios. Agende seu horário e sinta-se ainda mais linda todos os dias.
        </p>
        <Link
          to="/schedule"
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-transform hover:scale-105 shadow-lg shadow-pink-200"
        >
          <CalendarHeart className="w-6 h-6 text-pink-400" />
          Agendar Meu Horário
        </Link>
      </section>

      {/* Promotions */}
      {promotions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold">Promoções Especiais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={promo.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-pink-100 flex flex-col sm:flex-row"
              >
                <img src={promo.imageUrl} alt={promo.title} className="w-full sm:w-48 h-48 object-cover" />
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-pink-600 mb-2">{promo.title}</h3>
                  <p className="text-gray-600">{promo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Models */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Nossos Modelos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={model.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
              <img src={model.imageUrl} alt={model.name} className="w-full h-64 object-cover" />
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold mb-2">{model.name}</h3>
                <p className="text-2xl font-black text-pink-600 mb-4">R$ {model.price.toFixed(2)}</p>
                <Link
                  to={`/schedule?model=${model.id}`}
                  className="block w-full bg-pink-100 text-pink-800 font-bold py-3 rounded-xl hover:bg-pink-200 transition-colors"
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
