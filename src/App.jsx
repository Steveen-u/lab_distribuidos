import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import BullySimulation from './pages/BullySimulation';
import RingSimulation from './pages/RingSimulation';
import DeadlockPreventionPage from './pages/DeadlockPrevention';
import DeadlockDetectionPage from './pages/DeadlockDetection';
import DeadlockRecoveryPage from './pages/DeadlockRecovery';

import BerkeleySimulation from './components/synchronization/Berkeley';
import CristianSimulation from './components/synchronization/Cristian';
import LamportSimulation from './components/synchronization/Lamport';
import VectorClocksSimulation from './components/synchronization/Vector';

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

        <Route path="/simulador/berkeley" element={<BerkeleySimulation />} />
        <Route path="/simulador/cristian" element={<CristianSimulation />} />
        <Route path="/simulador/lamport" element={<LamportSimulation />} />
        <Route path="/simulador/vectoriales" element={<VectorClocksSimulation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;