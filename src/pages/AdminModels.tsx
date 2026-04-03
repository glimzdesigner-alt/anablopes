import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Plus, Trash2, Edit2, X, Sparkles, DollarSign, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminModels() {
  const [models, setModels] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', imageUrl: '', active: true });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'models'), (snapshot) => {
      setModels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'models');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'models'), {
        name: formData.name,
        price: Number(formData.price),
        imageUrl: formData.imageUrl,
        active: formData.active
      });
      setIsAdding(false);
      setFormData({ name: '', price: '', imageUrl: '', active: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'models');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo?')) {
      try {
        await deleteDoc(doc(db, 'models', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `models/${id}`);
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'models', id), { active: !currentActive });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `models/${id}`);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-2">Modelos de Cílios</h1>
          <p className="text-nude-500 font-light">Gerencie os modelos e técnicas disponíveis.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 bg-brand-black text-white px-8 py-4 rounded-2xl hover:bg-brand-pink transition-all shadow-xl shadow-brand-black/10 font-bold text-lg group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" /> 
          Novo Modelo
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
            
            <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-nude-50 flex items-center justify-center text-nude-400 hover:text-brand-black transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-serif text-brand-black mb-8 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-brand-pink" />
                Cadastrar Novo Modelo
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Nome da Técnica</label>
                    <div className="relative group">
                      <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                      <input
                        type="text"
                        placeholder="Ex: Volume Russo"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Valor do Serviço (R$)</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">URL da Imagem Demonstrativa</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-400 group-focus-within:text-brand-pink transition-colors" />
                    <input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-nude-50 border border-nude-200 rounded-2xl focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="bg-brand-black text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-brand-pink transition-all shadow-2xl shadow-brand-black/10">
                    Salvar Modelo
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {models.map((model, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            key={model.id} 
            className={`bg-white rounded-[40px] shadow-2xl border border-nude-100 overflow-hidden flex flex-col transition-all hover:shadow-3xl hover:border-brand-pink/30 group ${!model.active && 'opacity-60 grayscale-[0.5]'}`}
          >
            <div className="relative h-72 overflow-hidden">
              <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-6 right-6">
                <span className="bg-brand-black/80 backdrop-blur-md text-white px-5 py-2 rounded-2xl font-bold text-lg border border-white/10 shadow-xl">
                  R$ {model.price.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-1 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-[40px] rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10 mb-8">
                <h3 className="text-2xl font-serif text-brand-black mb-2">{model.name}</h3>
                <p className="text-nude-400 text-sm font-light uppercase tracking-widest">Técnica Profissional</p>
              </div>

              <div className="flex justify-between items-center mt-auto pt-6 border-t border-nude-100 relative z-10">
                <button
                  onClick={() => toggleActive(model.id, model.active)}
                  className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest ${
                    model.active 
                    ? 'bg-brand-pink/10 text-brand-pink hover:bg-brand-pink hover:text-white' 
                    : 'bg-nude-100 text-nude-500 hover:bg-nude-200'
                  }`}
                >
                  {model.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {model.active ? 'Ativo' : 'Inativo'}
                </button>
                
                <button 
                  onClick={() => handleDelete(model.id)} 
                  className="w-11 h-11 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-red-500/5"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

