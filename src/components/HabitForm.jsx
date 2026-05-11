// HabitForm.jsx
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';


export default function HabitForm({ habit, handleEditHabit, handleDeleteHabit, isLoading }) {
  const [inputValue, setInputValue] = useState(habit.name);

  const handleCancel = () => {
    setInputValue(habit.name);
  };

  return (
    <Popover className="relative inline-block text-center">
      {({ open, close }) => (
        <>
          <PopoverButton
            disabled={isLoading}
            onClick={() => {
              setInputValue(habit.name);
            }}
            className="flex items-center justify-center origin-center hover:bg-black/20 p-1 h-8 w-8 rounded-full cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform-gpu will-change-transform"
          >
            <BsThreeDotsVertical size={18} />
          </PopoverButton>

          {open && (
            <div
              className="z-40 fixed inset-0"
              onClick={() => {
                close();
              }}
            />
          )}

          {open && (
            <PopoverPanel className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 z-50 bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 transform-gpu will-change-transform">
              <input
                id="edit-habit-name"
                name="editHabitName"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400 transform-gpu will-change-transform"
                placeholder="Alışkanlık adı"
                autoFocus
                disabled={isLoading}
              />

              <div className="flex justify-end gap-2">
                <button
                  disabled={isLoading}
                  onClick={() => {
                    handleEditHabit(habit.name, inputValue);
                    close();
                  }}
                  className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu will-change-transform transition-all"
                >
                  {isLoading ? 'Güncelleniyor...' : 'Tamam'}
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => {
                    handleDeleteHabit(habit.name);
                    close();
                  }}
                  className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu will-change-transform transition-all"
                >
                  {isLoading ? 'Siliniyor...' : 'Sil'}
                </button>
                <button
                  disabled={isLoading}
                  onClick={handleCancel}
                  className="px-3 py-1 text-white bg-gray-400 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu will-change-transform transition-all"
                >
                  İptal
                </button>
              </div>
            </PopoverPanel>
          )}
        </>
      )}
    </Popover>
  );
}
