import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Plus, Trash2, X, Tag, Percent, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Tag className="w-10 h-10 text-gold-500" />
          <div>
            <h1 className="text-4xl font-serif text-nude-900">Gerenciar Promoções</h1>
            <p className="text-nude-500 font-light">Adicione e edite promoções</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center gap-2 bg-nude-900 text-gold-300 px-6 py-3 rounded-xl hover:bg-nude-800 transition-colors shadow-lg shadow-nude-200/50 font-medium"
        >
          <Plus className="w-5 h-5" /> Nova Promoção
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-nude-200/50 border border-nude-100 mb-8 relative"
        >
          <button onClick={resetForm} className="absolute top-6 right-6 text-nude-400 hover:text-nude-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-serif text-nude-900 mb-6">
            {editingId ? 'Editar Promoção' : 'Nova Promoção'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-nude-700">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-nude-700">Modelo Vinculado (Opcional)</label>
                <select
                  value={formData.model_id}
                  onChange={(e) => setFormData({...formData, model_id: e.target.value})}
                  className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                >
                  <option value="">Nenhum</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - R$ {model.price?.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-nude-700">Descrição *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-nude-700">Preço Original (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.original_price}
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-nude-700">Preço Promocional (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.promotional_price}
                  onChange={(e) => setFormData({...formData, promotional_price: e.target.value})}
                  className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                />
              </div>
            </div>

            {formData.original_price && formData.promotional_price && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-800">
                <Percent className="w-5 h-5" />
                <span className="font-medium">
                  Desconto: {calculateDiscount(Number(formData.original_price), Number(formData.promotional_price))}% OFF
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-nude-700">URL da Imagem</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden h-48 border border-nude-200">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-nude-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                <span className="ml-3 text-sm font-medium text-nude-700">Promoção Ativa</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-nude-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-medium text-nude-600 hover:bg-nude-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="bg-nude-900 text-gold-300 px-8 py-3 rounded-xl font-medium hover:bg-nude-800 transition-colors shadow-lg shadow-nude-200/50"
              >
                {editingId ? 'Salvar Alterações' : 'Criar Promoção'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {promotions.length === 0 && !isAdding ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-nude-100 shadow-sm">
          <Tag className="w-16 h-16 text-nude-200 mx-auto mb-4" />
          <p className="text-nude-500 text-lg font-light">Nenhuma promoção cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => {
            const discount = calculateDiscount(promo.original_price, promo.promotional_price);
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={promo.id} 
                className={`bg-white rounded-3xl shadow-lg shadow-nude-200/50 border border-nude-100 overflow-hidden flex flex-col relative transition-all hover:shadow-xl ${!promo.active && 'opacity-60 grayscale-[0.5]'}`}
              >
                {discount > 0 && (
                  <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Percent className="w-3 h-3" />
                    {discount}% OFF
                  </div>
                )}
                
                {promo.imageUrl ? (
                  <div className="h-56 overflow-hidden">
                    <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                ) : (
                  <div className="h-56 bg-nude-50 flex items-center justify-center">
                    <Tag className="w-12 h-12 text-nude-200" />
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-serif text-nude-900">{promo.title}</h3>
                    {!promo.active && (
                      <span className="text-xs bg-nude-100 text-nude-600 px-2 py-1 rounded-md font-medium">
                        Inativa
                      </span>
                    )}
                  </div>
                  
                  <p className="text-nude-600 font-light text-sm mb-4 flex-1">{promo.description}</p>
                  
                  {promo.promotional_price && (
                    <div className="mb-6 bg-nude-50 p-4 rounded-xl border border-nude-100">
                      {promo.original_price && (
                        <p className="text-nude-400 line-through text-sm mb-1">
                          De R$ {promo.original_price.toFixed(2)}
                        </p>
                      )}
                      <p className="text-2xl font-serif text-gold-600">
                        Por R$ {promo.promotional_price.toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-auto pt-4 border-t border-nude-100">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="flex-1 flex items-center justify-center gap-2 bg-nude-50 text-nude-700 py-2.5 rounded-xl font-medium hover:bg-nude-100 transition-colors text-sm border border-nude-200"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(promo.id, promo.active)}
                      className={`flex-1 flex items-center justify-center py-2.5 rounded-xl font-medium transition-colors text-sm border ${
                        promo.active 
                          ? 'bg-nude-50 text-nude-600 border-nude-200 hover:bg-nude-100' 
                          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      {promo.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button 
                      onClick={() => handleDelete(promo.id)} 
                      className="flex items-center justify-center p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
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
