import ErrorBoundary from '../ErrorBoundary';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import './index.css';
import { useState } from "react";

export default function App() {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const userId = "demoUser";

  return (
    <div className="app-layout">
      <ErrorBoundary>
        <Sidebar 
          onSelectHabit={setSelectedHabit} 
          selectedHabit={selectedHabit} // 🔥 Seçili habit'i gönder
          userId={userId}
        />
      <MainContent habit={selectedHabit} userId={userId} />
            </ErrorBoundary>

    </div>
  );
}