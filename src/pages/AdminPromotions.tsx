import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Plus, Trash2, X } from 'lucide-react';

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', active: true });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'promotions');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'promotions'), {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        active: formData.active
      });
      setIsAdding(false);
      setFormData({ title: '', description: '', imageUrl: '', active: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'promotions');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta promoção?')) {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Promoções</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Adicionar Promoção
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 relative">
          <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">Nova Promoção</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
                required
              />
            </div>
            <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Salvar
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row ${!promo.active && 'opacity-60'}`}>
            <img src={promo.imageUrl} alt={promo.title} className="w-full md:w-48 h-48 object-cover" />
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
              <p className="text-gray-600 text-sm flex-1">{promo.description}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(promo.id, promo.active)}
                  className={`text-sm font-medium ${promo.active ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {promo.active ? 'Ativa' : 'Inativa'}
                </button>
                <button onClick={() => handleDelete(promo.id)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
