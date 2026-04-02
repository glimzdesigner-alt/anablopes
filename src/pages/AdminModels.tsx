import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif text-nude-900">Modelos de Cílios</h1>
          <p className="text-nude-500 font-light">Gerencie os modelos disponíveis</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-nude-900 text-gold-300 px-6 py-3 rounded-xl hover:bg-nude-800 transition-colors shadow-lg shadow-nude-200/50 font-medium"
        >
          <Plus className="w-5 h-5" /> Adicionar Modelo
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-nude-200/50 border border-nude-100 mb-8 relative">
          <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-nude-400 hover:text-nude-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-serif text-nude-900 mb-6">Novo Modelo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Nome do Modelo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-nude-700 mb-1">URL da Imagem</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full px-4 py-3 bg-nude-50 border border-nude-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none transition-all"
                required
              />
            </div>
            <div className="pt-4">
              <button type="submit" className="bg-nude-900 text-gold-300 px-8 py-3 rounded-xl font-medium hover:bg-nude-800 transition-colors shadow-lg shadow-nude-200/50">
                Salvar Modelo
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.id} className={`bg-white rounded-3xl shadow-lg shadow-nude-200/50 border border-nude-100 overflow-hidden flex flex-col transition-all hover:shadow-xl ${!model.active && 'opacity-60 grayscale-[0.5]'}`}>
            <img src={model.imageUrl} alt={model.name} className="w-full h-56 object-cover" />
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif text-nude-900">{model.name}</h3>
                <span className="text-gold-600 font-medium bg-nude-50 px-3 py-1 rounded-lg border border-nude-100">R$ {model.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-nude-100">
                <button
                  onClick={() => toggleActive(model.id, model.active)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${model.active ? 'bg-nude-50 text-nude-700 hover:bg-nude-100' : 'bg-nude-100 text-nude-500 hover:bg-nude-200'}`}
                >
                  {model.active ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => handleDelete(model.id)} className="text-nude-400 hover:text-red-500 transition-colors p-2 bg-nude-50 rounded-lg hover:bg-red-50">
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
