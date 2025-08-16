
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import './index.css';
import { useState } from "react";


export default function App() {
  const [selectedHabit, setSelectedHabit] = useState(null);

  return (
    <div className="app-layout">
      <Sidebar  onSelectHabit={setSelectedHabit}/>
      <MainContent habit={selectedHabit}/>

    </div>
  );
}
