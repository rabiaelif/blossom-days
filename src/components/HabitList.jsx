import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';

export default function HabitInputModal({ isOpen, setIsOpen, handleAddHabit }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (inputValue.trim() !== "") {
      handleAddHabit(inputValue);
      setInputValue("");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setInputValue("");
    setIsOpen(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Yeni Alışkanlık Ekle
                </DialogTitle>
                <div className="mt-2">
                  <input
                    type="text"
                   className="w-full text-black border border-gray-300 rounded px-3 py-2 mt-2 outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-all duration-150"

                    placeholder="Alışkanlık adı..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    onClick={handleCancel}
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    onClick={handleSubmit}
                  >
                    Tamam
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
