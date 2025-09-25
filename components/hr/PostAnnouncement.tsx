import React, { useState } from 'react';
import { Announcement } from '../../types';

interface PostAnnouncementProps {
  onSubmit: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
}

const PostAnnouncement: React.FC<PostAnnouncementProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('O campo Título é obrigatório.');
      return;
    }
    if (!content && !image) {
      setError('O informativo deve ter um conteúdo de texto ou uma imagem.');
      return;
    }
    setError('');

    const announcementData: Omit<Announcement, 'id' | 'date'> = { title };
    if (content) {
      announcementData.content = content;
    }
    if (image) {
      // In a real app, you would upload the image and get a URL.
      // Here, we simulate it with a placeholder from picsum.
      announcementData.imageUrl = `https://picsum.photos/800/400?random=${Date.now()}`;
    }

    onSubmit(announcementData);

    setTitle('');
    setContent('');
    setImage(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Publicar Novo Informativo</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full bg-white border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700">Conteúdo (Opcional)</label>
          <textarea
            id="content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-800"
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700">Imagem (Opcional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
            <div className="space-y-2 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex justify-center text-sm text-gray-600">
                <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-500">
                  <span>Carregar uma imagem</span>
                  <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} accept="image/png, image/jpeg" />
                </label>
              </div>
               {image ? (
                <p className="text-sm font-medium text-green-600">Arquivo selecionado: {image.name}</p>
              ) : (
                <p className="text-xs text-gray-500">PNG, JPG até 10MB</p>
              )}
            </div>
          </div>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Publicar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostAnnouncement;