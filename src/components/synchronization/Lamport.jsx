import React, { useState } from "react";
import styled from "styled-components";
import Navbar from "../Navbar";

export default function LamportSimulation() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [message, ...prev.slice(0, 12)]);
  };

  // Evento local en P1
  const eventP1 = () => {
    const newTime = p1 + 1;
    setP1(newTime);
    addLog(`P1: Evento interno → Tick: ${newTime}`);
  };

  // Evento local en P2
  const eventP2 = () => {
    const newTime = p2 + 1;
    setP2(newTime);
    addLog(`P2: Evento interno → Tick: ${newTime}`);
  };

  // Enviar mensaje de P1 a P2
  const sendP1toP2 = () => {
    const sendTime = p1 + 1;
    setP1(sendTime);
    
    // Lógica Lamport: max(local, remoto) + 1
    const receiveTime = Math.max(p2, sendTime) + 1;
    setP2(receiveTime);

    addLog(`MSG: P1 (${sendTime}) ➔ P2 (${receiveTime})`);
  };

  // Enviar mensaje de P2 a P1
  const sendP2toP1 = () => {
    const sendTime = p2 + 1;
    setP2(sendTime);

    // Lógica Lamport: max(local, remoto) + 1
    const receiveTime = Math.max(p1, sendTime) + 1;
    setP1(receiveTime);

    addLog(`MSG: P2 (${sendTime}) ➔ P1 (${receiveTime})`);
  };

  return (
    <Wrapper>
      <Navbar />
      <MainPage>
        {/* --- Encabezado --- */}
        <Header>
          <ProtocolTag>ORDENAMIENTO CAUSAL</ProtocolTag>
          <Title>
            Relojes Lógicos de <Accent>Lamport</Accent>
          </Title>
        </Header>

        <ContentGrid>
          {/* --- Área de Simulación (Izquierda) --- */}
          <SimulationArea>
            <DescriptionCard>
              <p>
                Este algoritmo asegura que si un evento <strong>A</strong> causa un evento <strong>B</strong>, el tiempo lógico de A sea menor que el de B.
              </p>
              <p>
                <strong>Regla de Mensaje:</strong> Al recibir un mensaje con tiempo <em>t</em>, el receptor actualiza su reloj a: 
                <code style={{color: COLORS.accentOrange, marginLeft: '10px'}}>
                  L = max(L_local, t) + 1
                </code>
              </p>
            </DescriptionCard>

            <GraphContainer>
              <ProcessesRow>
                {/* Proceso 1 */}
                <ProcessBox border={COLORS.accentBlue}>
                  <NodeLabel>PROCESO P1</NodeLabel>
                  <CounterValue>{p1}</CounterValue>
                  <ActionButton onClick={eventP1}>Evento Local</ActionButton>
                </ProcessBox>

                {/* Flechas de Comunicación Intermedia */}
                <TransferActions>
                   <TransferButton onClick={sendP1toP2}>Enviar a P2 ➔</TransferButton>
                   <TransferButton onClick={sendP2toP1}>❮ Enviar a P1</TransferButton>
                </TransferActions>

                {/* Proceso 2 */}
                <ProcessBox border={COLORS.accentOrange}>
                  <NodeLabel>PROCESO P2</NodeLabel>
                  <CounterValue>{p2}</CounterValue>
                  <ActionButton onClick={eventP2}>Evento Local</ActionButton>
                </ProcessBox>
              </ProcessesRow>
            </GraphContainer>
          </SimulationArea>

          {/* --- Monitor de Eventos (Derecha) --- */}
          <MonitorArea>
            <MonitorHeader>HISTORIAL DE EVENTOS</MonitorHeader>
            <LogListContainer>
              {logs.length === 0 ? (
                <LogItem empty>No hay eventos registrados</LogItem>
              ) : (
                logs.map((l, i) => <LogItem key={i}>{l}</LogItem>)
              )}
            </LogListContainer>
          </MonitorArea>
        </ContentGrid>
      </MainPage>
    </Wrapper>
  );
}

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
  grid-template-columns: 2fr 1fr;
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
  border: 1px solid rgba(255,255,255,0.05);
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
  line-height: 1.6;
`;

const GraphContainer = styled.div`
  background: ${COLORS.bgCard};
  border-radius: 12px;
  padding: 50px 20px;
  border: 1px solid rgba(255,255,255,0.05);
`;

const ProcessesRow = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 20px;
`;

const ProcessBox = styled.div`
  background: #0D111B;
  padding: 25px;
  border-radius: 15px;
  width: 180px;
  text-align: center;
  border: 1px solid ${props => props.border || 'rgba(255,255,255,0.1)'};
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

const NodeLabel = styled.div`
  font-size: 0.75rem;
  letter-spacing: 1px;
  margin-bottom: 15px;
  color: ${COLORS.textSecondary};
`;

const CounterValue = styled.div`
  font-size: 3rem;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  margin-bottom: 15px;
  color: ${COLORS.textPrimary};
`;

const ActionButton = styled.button`
  background: transparent;
  color: ${COLORS.textPrimary};
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: 0.2s;
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

const TransferActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TransferButton = styled.button`
  background: ${COLORS.accentOrange}11;
  color: ${COLORS.accentOrange};
  border: 1px solid ${COLORS.accentOrange}44;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: ${COLORS.accentOrange};
    color: #000;
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
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`;

const LogListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LogItem = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: ${props => props.empty ? COLORS.textSecondary : COLORS.accentBlue};
  background: rgba(67, 181, 249, 0.05);
  padding: 8px;
  border-radius: 4px;
`;