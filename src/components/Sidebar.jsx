import { useEffect, useState } from "react";
import HabitForm from "./HabitForm";
import HabitInputForm from "./HabitList";
import HabitInputModal from "./HabitList";

function Sidebar({ storageKey = 'habits', onSelectHabit }) {
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddHabit = (newHabit) => {
setHabits([...habits, { id: habits.length, name: newHabit }]); // ✅ object olarak kaydediyor
    };

    // Sayfa yüklendiğinde localStorage'dan alışkanlıkları al
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setHabits(JSON.parse(saved));
        }
    }, [storageKey]);

    // habits değiştiğinde localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(habits));
    }, [habits, storageKey]);

    const handleDeleteHabit = (index) => {
        const newHabits = habits.filter((_, i) => i !== index);
        setHabits(newHabits);
        setOpenMenuIndex(null);
    };
const handleEditHabit = (index, newName) => {
  const newHabits = [...habits];
  newHabits[index].name = newName;
  setHabits(newHabits);
  setOpenMenuIndex(null);
};



    return (
        <div className="text-black w-68 lef-0 top-0 bottom-0 fixed bg-[#FFE2D0]">
            <div className="neoza-text flex gap-2 justify-center select-none h-12 items-center">
                <div className="text-[25px] font-bold pt-2">HABİT TRACKER</div>
                <div className="relative inline-block">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-10 w-10 flex items-center justify-center cursor-pointer font-bold leading-none"
                    >
                        <span className="text-[80px]  block pointer-events-none">+</span>
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
                    <div key={index} className="relative flex justify-between items-center px-4 pl-5 text-lg">
                        <span
                            onClick={() => onSelectHabit({ id: index, name: habit })}
                            className="cursor-pointer hover:underline"
                        >
                            {habit}
                        </span>                        <HabitForm
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
    )
}
export default Sidebar;
