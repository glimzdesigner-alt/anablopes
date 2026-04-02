import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarHeart, Sparkles, Star, MessageSquare, ArrowRight, MessageCircle, Percent, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [models, setModels] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [adminPhone, setAdminPhone] = useState('5581992765391');
  const [logoUrl, setLogoUrl] = useState('');
  const [heroBgUrl, setHeroBgUrl] = useState('');

  useEffect(() => {
    // Fetch settings for WhatsApp and Appearance
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.adminPhone) setAdminPhone(data.adminPhone);
          if (data.logoUrl) setLogoUrl(data.logoUrl);
          if (data.heroBgUrl) setHeroBgUrl(data.heroBgUrl);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();

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

    const qReviews = query(collection(db, 'reviews'), where('approved', '==', true));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(reviewsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });

    return () => {
      unsubModels();
      unsubPromos();
      unsubReviews();
    };
  }, []);

  const handleWhatsAppClick = () => {
    const message = `Olá! Gostaria de saber mais informações sobre os serviços do Studio Ana B. Lopes.`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const calculateDiscount = (original: number | null, promotional: number | null) => {
    if (!original || !promotional) return 0;
    return Math.round(((original - promotional) / original) * 100);
  };

  const defaultHeroBg = "https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative text-center py-24 px-4 bg-nude-900 rounded-3xl overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url('${heroBgUrl || defaultHeroBg}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-nude-900 via-nude-900/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Studio Logo" 
                  className="h-32 object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(223,184,133,0.4)]">
                  <Sparkles className="w-10 h-10 text-nude-900" />
                </div>
              )}
            </div>
            
            {!logoUrl && (
              <h1 className="text-4xl md:text-7xl font-serif text-nude-50 mb-6 leading-tight">
                Bem-vinda ao <br/>
                <span className="text-gold-400 italic">Studio Ana B. Lopes</span>
              </h1>
            )}
            
            <p className="text-lg md:text-2xl text-nude-200 mb-12 font-light tracking-wide max-w-2xl mx-auto mt-6">
              Realce sua beleza natural com nossos cílios exclusivos. Agende seu horário e transforme seu olhar!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/schedule"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gold-400 text-nude-900 px-8 py-4 rounded-full font-medium text-lg hover:bg-gold-300 transition-all hover:scale-105 shadow-[0_0_20px_rgba(223,184,133,0.3)]"
              >
                <CalendarHeart className="w-5 h-5" />
                Agendar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button
                onClick={handleWhatsAppClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-transparent border-2 border-nude-200 text-nude-100 px-8 py-4 rounded-full font-medium text-lg hover:bg-nude-800 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Falar no WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <section>
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Tag className="w-8 h-8 text-gold-500" />
              <h2 className="text-3xl md:text-4xl font-serif text-nude-900">Promoções Especiais</h2>
            </div>
            <p className="text-nude-500 font-light text-lg">Aproveite nossas ofertas exclusivas!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => {
              const discount = calculateDiscount(promo.original_price, promo.promotional_price);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={promo.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-nude-200/50 border border-gold-200 relative group flex flex-col"
                >
                  {discount > 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1 text-sm">
                      <Percent className="w-4 h-4" />
                      {discount}% OFF
                    </div>
                  )}
                  
                  {promo.imageUrl && (
                    <div className="h-56 overflow-hidden relative">
                      <div className="absolute inset-0 bg-nude-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="inline-block bg-gold-100 text-gold-800 text-xs font-bold px-3 py-1 rounded-full mb-4 self-start uppercase tracking-wider">
                      Promoção Especial
                    </div>
                    <h3 className="text-2xl font-serif text-nude-900 mb-3">{promo.title}</h3>
                    <p className="text-nude-600 font-light mb-6 flex-1">{promo.description}</p>
                    
                    {promo.promotional_price && (
                      <div className="mb-6 bg-nude-50 p-4 rounded-2xl border border-nude-100">
                        {promo.original_price && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-nude-400 line-through text-sm">
                              De R$ {promo.original_price.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-nude-500">Por apenas</span>
                          <span className="text-3xl font-serif text-gold-600">
                            R$ {promo.promotional_price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Link
                      to={`/schedule?promo=${promo.id}${promo.model_id ? `&model=${promo.model_id}` : ''}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-nude-900 text-gold-300 font-medium py-4 rounded-xl hover:bg-nude-800 transition-colors shadow-lg shadow-nude-200/50"
                    >
                      <Calendar className="w-5 h-5" />
                      Agendar com Promoção
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Models Section */}
      <section className="bg-nude-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-gold-500" />
              <h2 className="text-3xl md:text-4xl font-serif text-nude-900">Nossos Modelos</h2>
            </div>
            <p className="text-nude-500 font-light text-lg">Escolha o estilo perfeito para você</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {models.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Sparkles className="w-16 h-16 text-nude-200 mx-auto mb-4" />
                <p className="text-nude-500 text-lg font-light">Nenhum modelo disponível no momento</p>
              </div>
            ) : (
              models.map((model, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={model.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-nude-200/50 border border-nude-100 flex flex-col group hover:shadow-xl transition-all"
                >
                  {model.imageUrl ? (
                    <div className="h-64 overflow-hidden relative">
                      <div className="absolute inset-0 bg-nude-900/5 group-hover:bg-transparent transition-colors z-10"></div>
                      <img
                        src={model.imageUrl}
                        alt={model.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-nude-100 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-gold-300" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-serif text-nude-900 mb-3">{model.name}</h3>
                    {model.description && (
                      <p className="text-nude-600 font-light mb-6 flex-1">{model.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-nude-100">
                      <span className="text-3xl font-serif text-gold-600">
                        R$ {model.price.toFixed(2)}
                      </span>
                      <Link
                        to={`/schedule?model=${model.id}`}
                        className="bg-gold-400 text-nude-900 px-6 py-3 rounded-xl font-medium hover:bg-gold-300 transition-colors shadow-md"
                      >
                        Agendar
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Star className="w-8 h-8 text-gold-500 fill-gold-500" />
              <h2 className="text-3xl md:text-4xl font-serif text-nude-900">O que dizem nossas clientes</h2>
            </div>
            <p className="text-nude-500 font-light text-lg">A satisfação de quem já transformou o olhar conosco</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={review.id}
                className="bg-white rounded-3xl p-8 shadow-lg shadow-nude-200/50 border border-nude-100 flex flex-col relative"
              >
                <div className="absolute top-8 right-8 text-gold-100">
                  <MessageSquare className="w-16 h-16" />
                </div>
                <div className="flex gap-1 mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-nude-200'}`}
                    />
                  ))}
                </div>
                <p className="text-nude-700 font-light italic mb-8 flex-1 relative z-10 leading-relaxed text-lg">"{review.comment}"</p>
                <div className="mt-auto relative z-10 flex items-center gap-4 pt-6 border-t border-nude-100">
                  <div className="w-12 h-12 bg-nude-100 rounded-full flex items-center justify-center text-gold-600 font-serif text-xl">
                    {review.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-nude-900">{review.clientName}</h3>
                    <p className="text-sm text-nude-400">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-nude-900 rounded-3xl overflow-hidden shadow-2xl text-center mt-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512496015851-a1dc8a477b00?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <Sparkles className="w-16 h-16 mx-auto mb-8 text-gold-400" />
          <h2 className="text-4xl md:text-5xl font-serif text-nude-50 mb-6 leading-tight">
            Pronta para transformar seu olhar?
          </h2>
          <p className="text-xl text-nude-200 mb-10 font-light">
            Agende seu horário agora e descubra a beleza que você merece!
          </p>
          <Link
            to="/schedule"
            className="inline-flex items-center justify-center gap-3 bg-gold-400 text-nude-900 px-10 py-5 rounded-full font-medium text-xl hover:bg-gold-300 transition-all hover:scale-105 shadow-[0_0_30px_rgba(223,184,133,0.3)]"
          >
            <CalendarHeart className="w-6 h-6" />
            Agendar Meu Horário
          </Link>
          
          <div className="mt-16 pt-8 border-t border-nude-800">
            <Link
              to="/admin/login"
              className="text-nude-500 hover:text-gold-400 text-sm transition-colors uppercase tracking-wider font-medium"
            >
              Acesso Administrativo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
