import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import BullySimulation from './pages/BullySimulation';
import RingSimulation from './pages/RingSimulation';
import DeadlockPreventionPage from './pages/DeadlockPrevention';
import DeadlockDetectionPage from './pages/DeadlockDetection';
import DeadlockRecoveryPage from './pages/DeadlockRecovery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulador/bully" element={<BullySimulation />} />
        <Route path="/simulador/anillo" element={<RingSimulation />} />
        <Route path="/simulador/prevention" element={<DeadlockPreventionPage />} />
        <Route path="/simulador/detection" element={<DeadlockDetectionPage />} />
        <Route path="/simulador/recovery" element={<DeadlockRecoveryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;