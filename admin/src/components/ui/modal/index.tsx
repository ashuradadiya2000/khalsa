import React, { useEffect } from 'react';
import Button from '../button/Button';


interface IModalOverlay {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onSave: () => void
  onClose: () => void
  size?: string
}

export const ModalOverlay: React.FC<IModalOverlay> = ({ children, isOpen, onClose, onSave, title, size = 'max-w-2xl' }) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-gray-500/75">
      <div className={"relative bg-white rounded-lg overflow-hidden w-full " + size}>
        {title && <div className='p-4 border-b text-left'><h3 className="text-base font-semibold text-gray-900" id="modal-title">{title}</h3></div>}
        <div className="sm:text-left p-6">
          {children}
        </div>
        <div className="bg-gray-50 px-4 py-3 flex justify-end gap-1">
          <Button variant='outline' onClick={onClose}>Cancel</Button>
          <Button variant='primary' onClick={onSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};
