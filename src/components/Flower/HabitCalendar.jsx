import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const HabitCalendar = ({ habit }) => {
  const months = [
    "Jan 1 - Jan 28", "Jan 29 - Feb 25", "Feb 26 - Mar 24",
    "Mar 25 - Apr 21", "Apr 22 - May 19", "May 20 - Jun 16",
    "Jun 17 - Jul 14", "Jul 15 - Aug 11", "Aug 12 - Sep 8",
    "Sep 9 - Oct 6", "Oct 7 - Nov 3", "Nov 4 - Dec 1", "Dec 2 - Dec 29"
  ];

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedDays, setSelectedDays] = useState([]);

  // Firestore'dan seçili günleri çek
  useEffect(() => {
    const fetchSelectedDays = async () => {
      const docRef = doc(db, "habits", habit.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const monthKey = months[currentMonthIndex];
        setSelectedDays(docSnap.data().months?.[monthKey] || []);
      }
    };
    fetchSelectedDays();
  }, [currentMonthIndex, habit.id]);

  const toggleDay = async (day) => {
    const monthKey = months[currentMonthIndex];
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelectedDays);
    
    // Firestore'u güncelle
    const docRef = doc(db, "habits", habit.id);
    await updateDoc(docRef, {
      [`months.${monthKey}`]: newSelectedDays
    });
  };

  return (
    <div className="habit-calendar">
      <div className="month-navigation">
        <button onClick={() => setCurrentMonthIndex(prev => (prev - 1 + 13) % 13)}>
          <BsArrowLeft />
        </button>
        <h3>{months[currentMonthIndex]}</h3>
        <button onClick={() => setCurrentMonthIndex(prev => (prev + 1) % 13)}>
          <BsArrowRight />
        </button>
      </div>

      <div className="flower-grid">
        {/* 4 çiçek için render */}
        {[1, 8, 15, 22].map((startDay, flowerIndex) => (
          <div key={flowerIndex} className="flower-container">
            <Icon 
              petalColor="#FFE2D0" 
              startNumber={startDay}
              selectedDays={selectedDays}
              onDaySelect={toggleDay}
              storageKey={`${habit.id}-${currentMonthIndex}-flower-${flowerIndex}`}
              userId={habit.userId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default HabitCalendar;