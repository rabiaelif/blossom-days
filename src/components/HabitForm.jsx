// HabitForm.jsx
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';


export default function HabitForm({ index, habit, handleEditHabit, handleDeleteHabit, editingIndex, setEditingIndex }) {
  const [inputValue, setInputValue] = useState(habit.name);

  const handleCancel = () => {
    setInputValue(habit.name);
    setEditingIndex(null);
  };

  return (
    <Popover className="relative inline-block text-center">
      {({ open, close }) => (
        <>
          <PopoverButton
            onClick={() => {
              setInputValue(habit.name);
              setEditingIndex(open ? null : habit.id); // 🔥 ID ile yönet
            }}
            className="flex items-center justify-center origin-center hover:bg-black/20 p-1 h-8 w-8 rounded-full cursor-pointer focus:outline-none"
          >
            <BsThreeDotsVertical size={18} />
          </PopoverButton>

          {open && (
            <div
              className="z-40 fixed inset-0"
              onClick={() => {
                close();
                setEditingIndex(null);
              }}
            />
          )}

          {open && (
            <PopoverPanel className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 z-50 bg-white rounded-lg shadow-md p-4 flex flex-col gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Alışkanlık adı"
                autoFocus // 🔥 Otomatik focus
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    handleEditHabit(index, inputValue);
                    close();
                  }}
                  className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Tamam
                </button>
                <button
                  onClick={() => {
                    handleDeleteHabit(index);
                    close();
                  }}
                  className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Sil
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-white bg-gray-400 rounded hover:bg-gray-500"
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