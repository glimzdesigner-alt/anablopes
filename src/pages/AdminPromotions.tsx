import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Plus, Trash2, X, Tag, Percent, Edit, Sparkles, DollarSign, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    model_id: '',
    original_price: '',
    promotional_price: '',
    imageUrl: '',
    active: true
  });

  useEffect(() => {
    const unsubPromos = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'promotions');
    });

    const unsubModels = onSnapshot(collection(db, 'models'), (snapshot) => {
      setModels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'models');
    });

    return () => {
      unsubPromos();
      unsubModels();
    };
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      model_id: '',
      original_price: '',
      promotional_price: '',
      imageUrl: '',
      active: true
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (promo: any) => {
    setFormData({
      title: promo.title || '',
      description: promo.description || '',
      model_id: promo.model_id || '',
      original_price: promo.original_price?.toString() || '',
      promotional_price: promo.promotional_price?.toString() || '',
      imageUrl: promo.imageUrl || '',
      active: promo.active ?? true
    });
    setEditingId(promo.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const promoData = {
      title: formData.title,
      description: formData.description,
      model_id: formData.model_id || null,
      original_price: formData.original_price ? Number(formData.original_price) : null,
      promotional_price: formData.promotional_price ? Number(formData.promotional_price) : null,
      imageUrl: formData.imageUrl,
      active: formData.active
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'promotions', editingId), promoData);
      } else {
        await addDoc(collection(db, 'promotions'), promoData);
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'promotions');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      try {
        await deleteDoc(doc(db, 'promotions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `promotions/${id}`);
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'promotions', id), { active: !currentActive });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `promotions/${id}`);
    }
  };

  const calculateDiscount = (original: number | null, promotional: number | null) => {
    if (!original || !promotional) return 0;
    return Math.round(((original - promotional) / original) * 100);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-2">Promoções</h1>
          <p className="text-nude-500 font-light">Gerencie ofertas e pacotes especiais.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center gap-3 bg-brand-black text-white px-8 py-4 rounded-2xl hover:bg-brand-pink transition-all shadow-xl shadow-brand-black/10 font-bold text-lg group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" /> 
          Nova Promoção
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-10 md:p-12 rounded-[48px] shadow-3xl border border-nude-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
            
            <button onClick={resetForm} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-nude-50 flex items-center justify-center text-nude-400 hover:text-brand-black transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-serif text-brand-black mb-8 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-brand-pink" />
                {editingId ? 'Editar Promoção' : 'Cadastrar Nova Promoção'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Título da Oferta</label>
                    <div className="relative group">
                      <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                      <input
                        type="text"
                        placeholder="Ex: Combo de Inauguração"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Vincular a um Modelo</label>
                    <select
                      value={formData.model_id}
                      onChange={(e) => setFormData({...formData, model_id: e.target.value})}
                      className="w-full px-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all appearance-none"
                    >
                      <option value="">Nenhum modelo específico</option>
                      {models.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} (R$ {model.price?.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Descrição da Promoção</label>
                  <textarea
                    placeholder="Descreva os detalhes da oferta..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Preço Original (R$)</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.original_price}
                        onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Preço Promocional (R$)</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.promotional_price}
                        onChange={(e) => setFormData({...formData, promotional_price: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {formData.original_price && formData.promotional_price && (
                  <div className="bg-brand-pink/10 border border-brand-pink/20 rounded-2xl p-6 flex items-center gap-4 text-brand-pink">
                    <div className="w-12 h-12 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-lg">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest opacity-70">Economia Calculada</p>
                      <p className="text-xl font-serif">
                        {calculateDiscount(Number(formData.original_price), Number(formData.promotional_price))}% de Desconto
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">URL da Imagem da Promoção</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                    <input
                      type="url"
                      placeholder="https://exemplo.com/promo.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="relative flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-nude-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-nude-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-pink"></div>
                    <span className="ml-4 text-sm font-bold text-brand-black uppercase tracking-widest">Promoção Ativa</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-nude-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-4 rounded-2xl font-bold text-nude-600 hover:bg-nude-50 transition-all uppercase tracking-widest text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="bg-brand-black text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-brand-pink transition-all shadow-xl shadow-brand-black/10 uppercase tracking-widest"
                  >
                    {editingId ? 'Salvar Alterações' : 'Criar Promoção'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {promotions.length === 0 && !isAdding ? (
        <div className="bg-white rounded-[48px] p-20 text-center border border-nude-100 shadow-3xl">
          <div className="w-24 h-24 bg-nude-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Tag className="w-12 h-12 text-nude-200" />
          </div>
          <h3 className="text-2xl font-serif text-brand-black mb-2">Nenhuma promoção ativa</h3>
          <p className="text-nude-400 font-light">Comece criando sua primeira oferta especial.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {promotions.map((promo, index) => {
            const discount = calculateDiscount(promo.original_price, promo.promotional_price);
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={promo.id} 
                className={`bg-white rounded-[40px] shadow-2xl border border-nude-100 overflow-hidden flex flex-col relative transition-all hover:shadow-3xl hover:border-brand-pink/30 group ${!promo.active && 'opacity-60 grayscale-[0.5]'}`}
              >
                {discount > 0 && (
                  <div className="absolute top-6 right-6 z-10 bg-brand-pink text-white px-5 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl border border-white/20">
                    <Percent className="w-4 h-4" />
                    {discount}% OFF
                  </div>
                )}
                
                <div className="h-64 overflow-hidden relative">
                  {promo.imageUrl ? (
                    <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-nude-50 flex items-center justify-center">
                      <Tag className="w-16 h-16 text-nude-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-[40px] rounded-full -mr-16 -mt-16"></div>
                  
                  <div className="relative z-10 mb-6">
                    <h3 className="text-2xl font-serif text-brand-black mb-2">{promo.title}</h3>
                    {!promo.active && (
                      <span className="inline-block bg-nude-100 text-nude-500 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                        Inativa
                      </span>
                    )}
                  </div>
                  
                  <p className="text-nude-500 font-light text-sm mb-8 flex-1 leading-relaxed">{promo.description}</p>
                  
                  {promo.promotional_price && (
                    <div className="mb-8 bg-nude-50 p-6 rounded-3xl border border-nude-100 relative overflow-hidden group-hover:bg-brand-pink/5 transition-colors">
                      {promo.original_price && (
                        <p className="text-nude-400 line-through text-sm mb-1 font-light">
                          De R$ {promo.original_price.toFixed(2)}
                        </p>
                      )}
                      <p className="text-3xl font-serif text-brand-black">
                        Por <span className="text-brand-pink">R$ {promo.promotional_price.toFixed(2)}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-auto pt-6 border-t border-nude-100 relative z-10">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="flex-1 flex items-center justify-center gap-2 bg-nude-50 text-brand-black py-3 rounded-xl font-bold hover:bg-brand-pink hover:text-white transition-all text-xs uppercase tracking-widest border border-nude-200"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(promo.id, promo.active)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-widest border ${
                        promo.active 
                          ? 'bg-nude-50 text-nude-600 border-nude-200 hover:bg-nude-100' 
                          : 'bg-brand-pink/10 text-brand-pink border-brand-pink/20 hover:bg-brand-pink hover:text-white'
                      }`}
                    >
                      {promo.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {promo.active ? 'Pausar' : 'Ativar'}
                    </button>
                    <button 
                      onClick={() => handleDelete(promo.id)} 
                      className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-lg shadow-red-500/5"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

