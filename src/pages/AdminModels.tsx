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
        <h1 className="text-3xl font-bold">Modelos de Cílios</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Adicionar Modelo
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 relative">
          <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">Novo Modelo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Modelo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                />
              </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${!model.active && 'opacity-60'}`}>
            <img src={model.imageUrl} alt={model.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{model.name}</h3>
                <span className="text-pink-600 font-bold">R$ {model.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(model.id, model.active)}
                  className={`text-sm font-medium ${model.active ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {model.active ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => handleDelete(model.id)} className="text-red-500 hover:text-red-700 p-2">
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
