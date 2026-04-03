import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarHeart, Sparkles, Star, MessageSquare, ArrowRight, MessageCircle, Percent, Calendar, Tag, ShieldCheck, Award, Heart } from 'lucide-react';
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
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
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

  const defaultHeroBg = "https://images.unsplash.com/photo-1512496015851-a1dc8a477b00?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-hidden bg-brand-black">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ 
            backgroundImage: `url('${heroBgUrl || defaultHeroBg}')`,
            filter: 'brightness(0.4) saturate(1.2)'
          }}
        ></div>
        
        {/* Pink Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-black via-transparent to-brand-pink/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-brand-black to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-brand-pink" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Studio Ana B. Lopes</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-serif text-white mb-8 leading-[1.1] tracking-tight">
              Agende seu <br/>
              <span className="text-brand-pink italic">Horário de Cílios</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 mb-12 font-light tracking-wide max-w-xl leading-relaxed">
              Tenha cílios fabulosos com nossas especialistas. Realce sua beleza natural com nossos cílios exclusivos.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/schedule"
                className="inline-flex items-center justify-center gap-3 bg-brand-pink text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-pink-dark transition-all hover:scale-105 shadow-2xl shadow-brand-pink/30"
              >
                Agendar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center justify-center gap-3 glass text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 glass-dark p-8 rounded-[40px] border-white/20">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Especialistas Experientes</p>
                    <p className="text-white/50 text-xs">Artistas de cílios profissionais</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Produtos Premium</p>
                    <p className="text-white/50 text-xs">Materiais de alta qualidade</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Ambiente Aconchegante</p>
                    <p className="text-white/50 text-xs">Ambiente relaxante</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-pink/30 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section (Mobile Optimized) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Award, title: "Especialistas Experientes", desc: "Artistas de cílios profissionais com anos de experiência." },
            { icon: ShieldCheck, title: "Produtos Premium", desc: "Usamos apenas materiais da mais alta qualidade para seus olhos." },
            { icon: Heart, title: "Ambiente Aconchegante", desc: "Um ambiente relaxante e confortável para o seu dia de beleza." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[32px] bg-white shadow-xl shadow-nude-200/50 border border-nude-100 flex flex-col items-center text-center group hover:border-brand-pink/30 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-pink/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-brand-pink" />
              </div>
              <h3 className="text-xl font-serif text-brand-black mb-4">{feature.title}</h3>
              <p className="text-nude-500 font-light leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-8 h-8 text-brand-pink" />
                <h2 className="text-3xl md:text-5xl font-serif text-brand-black">Promoções Especiais</h2>
              </div>
              <p className="text-nude-500 font-light text-lg">Aproveite nossas ofertas exclusivas!</p>
            </div>
            <Link to="/schedule" className="text-brand-pink font-bold flex items-center gap-2 hover:gap-4 transition-all group">
              Ver todos os serviços <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => {
              const discount = calculateDiscount(promo.original_price, promo.promotional_price);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={promo.id}
                  className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-nude-200/50 border border-nude-100 relative group flex flex-col"
                >
                  {discount > 0 && (
                    <div className="absolute top-6 right-6 z-10 bg-brand-pink text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-1 text-sm">
                      <Percent className="w-4 h-4" />
                      {discount}% OFF
                    </div>
                  )}
                  
                  {promo.imageUrl && (
                    <div className="h-64 overflow-hidden relative">
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  )}
                  <div className="p-10 flex flex-col flex-1">
                    <h3 className="text-2xl font-serif text-brand-black mb-4">{promo.title}</h3>
                    <p className="text-nude-500 font-light mb-8 flex-1 leading-relaxed">{promo.description}</p>
                    
                    <div className="mb-8 flex items-center justify-between">
                      <div>
                        {promo.original_price && (
                          <p className="text-nude-400 line-through text-sm mb-1">
                            R$ {promo.original_price.toFixed(2)}
                          </p>
                        )}
                        <p className="text-3xl font-serif text-brand-pink">
                          R$ {promo.promotional_price.toFixed(2)}
                        </p>
                      </div>
                      <Link
                        to={`/schedule?promo=${promo.id}${promo.model_id ? `&model=${promo.model_id}` : ''}`}
                        className="w-14 h-14 bg-brand-black text-white rounded-2xl flex items-center justify-center hover:bg-brand-pink transition-colors shadow-lg"
                      >
                        <ArrowRight className="w-6 h-6" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Models Section */}
      <section className="bg-brand-black -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-brand-pink" />
              <h2 className="text-4xl md:text-6xl font-serif text-white">Nossos Modelos</h2>
            </div>
            <p className="text-white/50 font-light text-xl">Escolha o estilo perfeito para você</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {models.map((model, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={model.id}
                className="glass-dark rounded-[48px] overflow-hidden flex flex-col group hover:border-brand-pink/50 transition-all"
              >
                {model.imageUrl ? (
                  <div className="h-80 overflow-hidden relative">
                    <img
                      src={model.imageUrl}
                      alt={model.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="h-80 bg-brand-gray flex items-center justify-center">
                    <Sparkles className="w-20 h-20 text-white/10" />
                  </div>
                )}
                <div className="p-10 flex flex-col flex-1">
                  <h3 className="text-3xl font-serif text-white mb-4">{model.name}</h3>
                  <p className="text-white/60 font-light mb-10 flex-1 leading-relaxed">{model.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-3xl font-serif text-brand-pink">
                      R$ {model.price.toFixed(2)}
                    </span>
                    <Link
                      to={`/schedule?model=${model.id}`}
                      className="bg-white text-brand-black px-8 py-4 rounded-2xl font-bold hover:bg-brand-pink hover:text-white transition-all shadow-xl"
                    >
                      Agendar
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-20">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Star className="w-8 h-8 text-brand-pink fill-brand-pink" />
              <h2 className="text-4xl md:text-6xl font-serif text-brand-black">Depoimentos</h2>
            </div>
            <p className="text-nude-500 font-light text-xl">A satisfação de quem já transformou o olhar conosco</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {reviews.map((review, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={review.id}
                className="bg-white rounded-[40px] p-10 shadow-2xl shadow-nude-200/50 border border-nude-100 flex flex-col relative"
              >
                <div className="absolute top-10 right-10 text-brand-pink/5">
                  <MessageSquare className="w-24 h-24" />
                </div>
                <div className="flex gap-1 mb-8 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < review.rating ? 'fill-brand-pink text-brand-pink' : 'text-nude-200'}`}
                    />
                  ))}
                </div>
                <p className="text-brand-black font-light italic mb-10 flex-1 relative z-10 leading-relaxed text-xl">"{review.comment}"</p>
                <div className="mt-auto relative z-10 flex items-center gap-5 pt-8 border-t border-nude-100">
                  <div className="w-14 h-14 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink font-serif text-2xl">
                    {review.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-brand-black">{review.clientName}</h3>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative py-32 px-8 bg-brand-black rounded-[64px] overflow-hidden shadow-3xl text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <Sparkles className="w-20 h-20 mx-auto mb-10 text-brand-pink" />
            <h2 className="text-4xl md:text-7xl font-serif text-white mb-8 leading-tight">
              Pronta para <br/>
              <span className="text-brand-pink italic">transformar seu olhar?</span>
            </h2>
            <p className="text-xl text-white/60 mb-12 font-light leading-relaxed">
              Agende seu horário agora e descubra a beleza que você merece!
            </p>
            <Link
              to="/schedule"
              className="inline-flex items-center justify-center gap-4 bg-brand-pink text-white px-12 py-6 rounded-3xl font-bold text-2xl hover:bg-brand-pink-dark transition-all hover:scale-105 shadow-2xl shadow-brand-pink/40"
            >
              <CalendarHeart className="w-8 h-8" />
              Agendar Agora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

