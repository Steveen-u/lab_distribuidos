import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../Navbar";

// --- Constantes de Color ---
const COLORS = {
  bgDark: "#0A0E17",
  bgCard: "#111624",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0AABF",
  accentOrange: "#FF9F43",
  accentBlue: "#43B5F9",
  tagBg: "#211D12",
  tagText: "#FFD082",
};

export default function CristianSimulation() {
  // --- Tu Lógica Original ---
  const [clientOffset, setClientOffset] = useState(Math.random() * 5000 + 5000);
  const [serverTime, setServerTime] = useState(Date.now());
  const [clientTime, setClientTime] = useState(Date.now() + clientOffset);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setServerTime(now);
      setClientTime(now + clientOffset);
    }, 500);
    return () => clearInterval(interval);
  }, [clientOffset]);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const syncTime = async () => {
    addLog("Iniciando petición al servidor...");
    const t0 = Date.now();

    // Latencia de ida
    const latency1 = Math.random() * 1000;
    await sleep(latency1);

    const serverNow = Date.now();
    
    // Latencia de vuelta
    const latency2 = Math.random() * 1000;
    await sleep(latency2);

    const t1 = Date.now();
    const RTT = t1 - t0;

    const adjustedTime = serverNow + RTT / 2;
    const newOffset = adjustedTime - Date.now();
    
    setClientOffset(newOffset);
    addLog(`Respuesta recibida. RTT: ${RTT.toFixed(0)}ms`);
    addLog(`Ajuste por latencia aplicado: ${(RTT / 2).toFixed(0)}ms`);
    addLog("Reloj del cliente sincronizado.");
  };

  const addLog = (message) => {
    setLogs((prev) => [message, ...prev.slice(0, 12)]);
  };

  return (
    <Wrapper>
      <Navbar />
      <MainPage>
        {/* --- Encabezado --- */}
        <Header>
          <ProtocolTag>PROTOCOLO DE SINCRONIZACIÓN EXTERNA</ProtocolTag>
          <Title>
            Algoritmo de <Accent>Cristian</Accent>
          </Title>
        </Header>

        <ContentGrid>
          {/* --- Área de Simulación (Izquierda) --- */}
          <SimulationArea>
            <DescriptionCard>
              <p>
                A diferencia de Berkeley, el algoritmo de <strong>Cristian</strong> es pasivo. El cliente solicita el tiempo al servidor y, al recibirlo, mide el <strong>RTT (Round Trip Time)</strong>.
              </p>
              <p>
                El cliente asume que el tiempo de viaje es simétrico, por lo que ajusta su reloj sumando la mitad del RTT al tiempo recibido: 
                <code style={{color: COLORS.accentOrange, marginLeft: '10px'}}>
                  T_nuevo = T_servidor + (RTT / 2)
                </code>
              </p>
            </DescriptionCard>

            <GraphContainer>
              <NodeContainer>
                {/* Servidor */}
                <ServerBox>
                  <NodeLabel color={COLORS.accentBlue}>SERVIDOR (TIME SOURCE)</NodeLabel>
                  <TimeText>{new Date(serverTime).toLocaleTimeString()}</TimeText>
                  <StatusBadge>MASTER</StatusBadge>
                </ServerBox>

                {/* Flechas de flujo (decorativo) */}
                <FlowIndicator>
                   <Arrow>↑ Petición</Arrow>
                   <Arrow>↓ Respuesta</Arrow>
                </FlowIndicator>

                {/* Cliente */}
                <ClientBox>
                  <NodeLabel color={COLORS.accentOrange}>CLIENTE LOCAL</NodeLabel>
                  <TimeText>{new Date(clientTime).toLocaleTimeString()}</TimeText>
                  <OffsetLabel>Desfase: {(clientOffset / 1000).toFixed(2)}s</OffsetLabel>
                </ClientBox>
              </NodeContainer>
            </GraphContainer>

            <ControlsContainer>
              <SyncButton onClick={syncTime}>
                Sincronizar con el Servidor
              </SyncButton>
            </ControlsContainer>
          </SimulationArea>

          {/* --- Monitor (Derecha) --- */}
          <MonitorArea>
            <MonitorHeader>MONITOR DE RED</MonitorHeader>
            <LogListContainer>
              {logs.length === 0 ? (
                <LogItem empty>Listo para sincronizar...</LogItem>
              ) : (
                logs.map((msg, i) => <LogItem key={i}>{msg}</LogItem>)
              )}
            </LogListContainer>
          </MonitorArea>
        </ContentGrid>
      </MainPage>
    </Wrapper>
  );
}

// --- Styled Components ---

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${COLORS.bgDark};
  color: ${COLORS.textPrimary};
  font-family: 'Segoe UI', sans-serif;
`;

const MainPage = styled.main`
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const ProtocolTag = styled.span`
  background: ${COLORS.tagBg};
  color: ${COLORS.tagText};
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin: 0;
`;

const Accent = styled.span`
  color: ${COLORS.accentOrange};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 30px;
`;

const SimulationArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DescriptionCard = styled.div`
  background: ${COLORS.bgCard};
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid ${COLORS.accentOrange};
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
  line-height: 1.6;
`;

const GraphContainer = styled.div`
  background: ${COLORS.bgCard};
  border-radius: 12px;
  padding: 40px;
  display: flex;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.05);
`;

const NodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const BaseBox = styled.div`
  background: #0D111B;
  padding: 20px;
  border-radius: 12px;
  width: 220px;
  text-align: center;
  position: relative;
  border: 1px solid rgba(255,255,255,0.1);
`;

const ServerBox = styled(BaseBox)`
  border-top: 3px solid ${COLORS.accentBlue};
`;

const ClientBox = styled(BaseBox)`
  border-top: 3px solid ${COLORS.accentOrange};
`;

const NodeLabel = styled.div`
  font-size: 0.7rem;
  font-weight: bold;
  color: ${props => props.color};
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const TimeText = styled.div`
  font-size: 1.6rem;
  font-family: monospace;
  font-weight: bold;
`;

const StatusBadge = styled.span`
  font-size: 0.6rem;
  background: ${COLORS.accentBlue}22;
  color: ${COLORS.accentBlue};
  padding: 2px 8px;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const OffsetLabel = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};
  margin-top: 5px;
`;

const FlowIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${COLORS.textSecondary};
  font-family: monospace;
  font-size: 0.8rem;
`;

const Arrow = styled.div`
  margin: 2px 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const SyncButton = styled.button`
  background: ${COLORS.accentOrange};
  color: #000;
  border: none;
  padding: 14px 30px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    transform: scale(1.05);
    background: #FFB366;
  }
`;

const MonitorArea = styled.div`
  background: ${COLORS.bgCard};
  padding: 25px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
`;

const MonitorHeader = styled.h4`
  margin: 0 0 20px 0;
  font-size: 0.8rem;
  color: ${COLORS.textSecondary};
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`;

const LogListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LogItem = styled.div`
  font-family: monospace;
  font-size: 0.85rem;
  color: ${props => props.empty ? COLORS.textSecondary : COLORS.accentOrange};
  border-left: 2px solid ${props => props.empty ? 'transparent' : COLORS.accentOrange};
  padding-left: 10px;
`;