import { useEffect, useState } from "react";
import HabitForm from "./HabitForm";
import HabitInputModal from "./HabitList";

function Sidebar({ storageKey = 'habits', onSelectHabit }) {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddHabit = (newHabit) => {
    const newHabitObj = { 
      id: Date.now().toString(),
      name: newHabit 
    };
    const updatedHabits = [...habits, newHabitObj];
    setHabits(updatedHabits);
    
    // 🔥 YENİ: Otomatik olarak yeni alışkanlığı seç
    onSelectHabit(newHabitObj);
  };

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(habits));
  }, [habits, storageKey]);

  // 🔥 YENİ: İlk açılışta ilk alışkanlığı otomatik seç
  useEffect(() => {
    if (habits.length > 0 && !openMenuIndex) {
      onSelectHabit(habits[0]);
    }
  }, [habits]); // Sadece habits değişince çalışsın

  const handleDeleteHabit = (index) => {
    const deletedHabit = habits[index];
    const newHabits = habits.filter((_, i) => i !== index);
    setHabits(newHabits);
    setOpenMenuIndex(null);
    
    // 🔥 YENİ: Silinen habit seçiliyse, ilk habit'i seç
    if (deletedHabit.id === openMenuIndex) {
      onSelectHabit(newHabits[0] || null);
    }
  };

  const handleEditHabit = (index, newName) => {
    const newHabits = [...habits];
    newHabits[index].name = newName;
    setHabits(newHabits);
    setOpenMenuIndex(null);
  };

  return (
    <div className="text-black w-68 fixed top-0 bottom-0 bg-[#FFE2D0]">
      <div className="neoza-text flex gap-2 justify-center select-none h-12 items-center">
        <div className="text-[25px] font-bold pt-2">HABİT TRACKER</div>
        <div className="relative inline-block">
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 w-10 flex items-center justify-center cursor-pointer font-bold leading-none"
          >
            <span className="text-[80px] block pointer-events-none">+</span>
          </button>
        </div>
        <HabitInputModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          handleAddHabit={handleAddHabit}
        />
      </div>

      <div className="flex-col flex space-y-4 pt-4">
        {habits.map((habit, index) => (
          <div key={habit.id} className="relative flex justify-between items-center px-4 pl-5 text-lg">
            <span
              onClick={() => {
                onSelectHabit(habit);
                setOpenMenuIndex(habit.id); // 🔥 Seçili habit'i işaretle
              }}
              className={`cursor-pointer hover:underline ${
                openMenuIndex === habit.id ? 'font-bold text-orange-600' : ''
              }`}
            >
              {habit.name}
            </span>
            <HabitForm
              index={index}
              habit={habit}
              handleEditHabit={handleEditHabit}
              handleDeleteHabit={handleDeleteHabit}
              editingIndex={openMenuIndex}
              setEditingIndex={setOpenMenuIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;