import { useEffect, useState, useCallback, useMemo, startTransition } from "react";
import { db } from "../lib/firebase";
import { 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc, 
  query,
  where,
  writeBatch
} from "firebase/firestore";

import HabitForm from "./HabitForm";
import HabitInputModal from "./HabitList";

function Sidebar({ onSelectHabit, selectedHabit, userId }) {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 Optimized event handlers
  const handleHabitClick = useCallback((habit) => {
    // React 18 batching ile state güncellemelerini optimize et
    startTransition(() => {
      onSelectHabit(habit);
    });
  }, [onSelectHabit]);

  const handleAddButtonClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // 🔥 Sadece gerekli alışkanlık isimlerini çek (indexed query)
  useEffect(() => {
    if (!userId) return;
    const fetchHabits = async () => {
      try {
        console.log("🔍 Fetching unique habits with indexed query");
        
        // Sadece bu userId'e ait belgeleri çek
        const q = query(
          collection(db, "flowerPetals"),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log("📭 No habits found in flowerPetals collection");
          setHabits([]);
          return;
        }
        
        // Benzersiz alışkanlık isimlerini bul
        const habitNames = new Set();
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.habitName) {
            habitNames.add(data.habitName);
          }
        });
        
        const habitList = Array.from(habitNames).map(name => ({ 
          id: name,
          name: name 
        }));
        
        console.log(`📋 Found ${habitList.length} unique habits:`, habitList);
        setHabits(habitList);
      } catch (error) {
        console.error("❌ Error fetching habits:", error);
        setHabits([]);
      }
    };
    fetchHabits();
  }, [userId]);

  // 🔥 Yeni alışkanlık ekle (optimistic update + batch)
  const handleAddHabit = useCallback(async (newHabitName) => {
    if (!userId || isLoading) return;
    
    try {
      setIsLoading(true);
      console.log("➕ Adding new habit:", newHabitName);
      
      // Optimistic update - UI'ı hemen güncelle
      const newHabit = { id: newHabitName, name: newHabitName };
      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      
      // Yeni seç
      onSelectHabit(newHabit);
      
      // Firestore'u arka planda güncelle
      const firstDocId = `${userId}_${newHabitName}_0_0_1`;
      const firstDocRef = doc(db, "flowerPetals", firstDocId);
      
      await setDoc(firstDocRef, {
        userId,
        habitName: newHabitName,
        monthIndex: 0,
        monthName: "Jan 1 - Jan 28",
        uniqueKey: 0,
        startNumber: 1,
        petals: [],
        createdAt: new Date()
      });
      
      console.log("✅ Habit added successfully");
    } catch (error) {
      console.error("❌ Error adding habit:", error);
      // Rollback on error
      const rollbackHabits = habits.filter(h => h.name !== newHabitName);
      setHabits(rollbackHabits);
      onSelectHabit(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, habits, onSelectHabit, isLoading]);

  // 🔥 Alışkanlık sil (optimistic update + batch)
  const handleDeleteHabit = useCallback(async (habitName) => {
    if (isLoading) return;
    let deletedHabit = null;
    
    try {
      setIsLoading(true);
      console.log("🗑️ Deleting habit:", habitName);
      
      // Optimistic update - UI'dan hemen kaldır
      deletedHabit = habits.find(h => h.name === habitName);
      const newHabits = habits.filter(h => h.name !== habitName);
      setHabits(newHabits);

      if (selectedHabit && selectedHabit.name === habitName) {
        onSelectHabit(newHabits[0] || null);
      }
      
      // Firestore'u arka planda güncelle (batch ile)
      const q = query(
        collection(db, "flowerPetals"),
        where("userId", "==", userId),
        where("habitName", "==", habitName)
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`🗑️ Found ${querySnapshot.docs.length} documents to delete`);
      
      if (querySnapshot.docs.length > 0) {
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(docSnapshot => {
          batch.delete(docSnapshot.ref);
        });
        await batch.commit();
        console.log(`🗑️ Deleted ${querySnapshot.docs.length} documents`);
      }
      
      console.log("✅ Habit deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting habit:", error);
      // Rollback on error
      if (deletedHabit) {
        setHabits([...habits]);
        if (selectedHabit && selectedHabit.name === habitName) {
          onSelectHabit(deletedHabit);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, habits, selectedHabit, onSelectHabit, isLoading]);

  // 🔥 Alışkanlık ismini güncelle (basit ve hızlı)
  const handleEditHabit = useCallback(async (oldHabitName, newHabitName) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      console.log("✏️ Updating habit name:", oldHabitName, "→", newHabitName);
      
      // Optimistic update - UI'ı hemen güncelle
      const newHabits = habits.map(h => (h.name === oldHabitName ? { ...h, name: newHabitName, id: newHabitName } : h));
      setHabits(newHabits);
      
      // Seçili alışkanlığı da güncelle
      if (selectedHabit && selectedHabit.name === oldHabitName) {
        onSelectHabit({ ...selectedHabit, name: newHabitName, id: newHabitName });
      }
      
      // Sadece bir yaprak belgesini güncelle (ilk ay, ilk yaprak)
      const firstDocId = `${userId}_${oldHabitName}_0_0_1`;
      const firstDocRef = doc(db, "flowerPetals", firstDocId);
      
      // Yeni belge ID'si ile yeni belge oluştur
      const newDocId = `${userId}_${newHabitName}_0_0_1`;
      const newDocRef = doc(db, "flowerPetals", newDocId);
      
      // Yeni belgeyi oluştur
      await setDoc(newDocRef, {
        userId,
        habitName: newHabitName,
        monthIndex: 0,
        monthName: "Jan 1 - Jan 28",
        uniqueKey: 0,
        startNumber: 1,
        petals: [],
        createdAt: new Date()
      });
      
      // Eski belgeyi sil
      await deleteDoc(firstDocRef);
      
      console.log("✅ Habit name updated successfully (single document)");
    } catch (error) {
      console.error("❌ Error updating habit:", error);
      // Rollback on error
      const rollbackHabits = habits.map(h => (h.name === newHabitName ? { ...h, name: oldHabitName, id: oldHabitName } : h));
      setHabits(rollbackHabits);
      if (selectedHabit && selectedHabit.name === newHabitName) {
        onSelectHabit({ ...selectedHabit, name: oldHabitName, id: oldHabitName });
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, habits, selectedHabit, onSelectHabit, isLoading]);

  // 🔥 Memoized habits list ve optimizasyonlar
  const memoizedHabits = useMemo(() => habits, [habits]);
  
  // 🔥 Memoized selected habit state
  const isSelected = useCallback((habitId) => {
    return selectedHabit && selectedHabit.id === habitId;
  }, [selectedHabit]);

  // 🔥 Memoized button classes
  const getButtonClasses = useCallback((habitId) => {
    const baseClasses = "text-left outline-none focus:ring-2 focus:ring-orange-400 rounded px-1 transition-all disabled:opacity-50 transform-gpu will-change-transform";
    const selectedClasses = isSelected(habitId) 
      ? "font-bold text-orange-600 text-xl" 
      : "text-gray-700 hover:underline";
    
    return `${baseClasses} ${selectedClasses}`;
  }, [isSelected]);

  return (
    <nav role="navigation" aria-label="Alışkanlıklar" className="text-black w-full md:w-68 md:fixed md:top-0 md:bottom-0 bg-[#FFE2D0] border-r border-[#1E1E1E]/10 h-[100vh] flex flex-col">
      <div className="neoza-text flex gap-2 justify-center select-none h-12 items-center">
        <div className="text-[25px] font-bold pt-2">HABİT TRACKER</div>
        <div className="relative inline-block">
          <button
            aria-label="Yeni alışkanlık ekle"
            onClick={handleAddButtonClick}
            disabled={isLoading}
            className="h-10 w-10 flex items-center justify-center cursor-pointer font-bold leading-none hover:bg-black/10 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed transform-gpu will-change-transform"
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

      <div className="flex-col flex space-y-4 pt-4" role="list">
        {memoizedHabits.map((habit) => (
          <div key={habit.id} role="listitem" className="relative flex justify-between items-center px-4 pl-5 text-lg">
            <button
              type="button"
              aria-current={isSelected(habit.id) ? 'true' : 'false'}
              onClick={() => handleHabitClick(habit)}
              disabled={isLoading}
              className={getButtonClasses(habit.id)}
            >
              {habit.name}
            </button>
            <HabitForm
              habit={habit}
              handleEditHabit={handleEditHabit}
              handleDeleteHabit={handleDeleteHabit}
              isLoading={isLoading}
            />
          </div>
        ))}
      </div>
    </nav>
  );
}

export default Sidebar;
