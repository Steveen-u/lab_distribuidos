import React, { useState } from "react";
import styled from "styled-components";
import Navbar from "../Navbar";

export default function VectorClocksSimulation() {
  const [p1, setP1] = useState([0, 0]);
  const [p2, setP2] = useState([0, 0]);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [message, ...prev.slice(0, 10)]);
  };

  // Evento interno P1
  const eventP1 = () => {
    const newV = [...p1];
    newV[0]++;
    setP1(newV);
    addLog(`P1: Evento local → [${newV.join(", ")}]`);
  };

  // Evento interno P2
  const eventP2 = () => {
    const newV = [...p2];
    newV[1]++;
    setP2(newV);
    addLog(`P2: Evento local → [${newV.join(", ")}]`);
  };

  // P1 → P2
  const sendP1toP2 = () => {
    const sendV = [...p1];
    sendV[0]++; // Incrementa antes de enviar
    setP1(sendV);

    const merged = p2.map((v, i) => Math.max(v, sendV[i]));
    merged[1]++; // Incrementa al recibir
    setP2(merged);

    addLog(`MSG: P1 [${sendV.join(", ")}] ➔ P2 [${merged.join(", ")}]`);
  };

  // P2 → P1
  const sendP2toP1 = () => {
    const sendV = [...p2];
    sendV[1]++;
    setP2(sendV);

    const merged = p1.map((v, i) => Math.max(v, sendV[i]));
    merged[0]++;
    setP1(merged);

    addLog(`MSG: P2 [${sendV.join(", ")}] ➔ P1 [${merged.join(", ")}]`);
  };

  return (
    <Wrapper>
      <Navbar />
      <MainPage>
        {/* --- Encabezado --- */}
        <Header>
          <ProtocolTag>ESTADO GLOBAL PARCIAL</ProtocolTag>
          <Title>
            Relojes <Accent>Vectoriales</Accent>
          </Title>
        </Header>

        <ContentGrid>
          {/* --- Área de Simulación (Izquierda) --- */}
          <SimulationArea>
            <DescriptionCard>
              <p>
                A diferencia de Lamport, los <strong>Relojes Vectoriales</strong> mantienen un contador por cada proceso en el sistema.
              </p>
              <p>
                Al recibir un mensaje, el proceso toma el <strong>máximo componente a componente</strong> del vector recibido y su propio vector, incrementando luego su propia posición. Esto permite identificar eventos <em>concurrentes</em>.
              </p>
            </DescriptionCard>

            <GraphContainer>
              <VectorGrid>
                {/* Proceso 1 */}
                <ProcessNode border={COLORS.accentBlue}>
                  <NodeLabel>PROCESO P1</NodeLabel>
                  <VectorDisplay>
                    <Bracket>[</Bracket>
                    <Val highlight>{p1[0]}</Val>
                    <Separator>,</Separator>
                    <Val>{p1[1]}</Val>
                    <Bracket>]</Bracket>
                  </VectorDisplay>
                  <ActionButton onClick={eventP1}>Evento Local</ActionButton>
                </ProcessNode>

                {/* Controles de Comunicación */}
                <ControlGroup>
                   <TransferBtn onClick={sendP1toP2}>Enviar a P2 ➔</TransferBtn>
                   <TransferBtn onClick={sendP2toP1}>❮ Enviar a P1</TransferBtn>
                </ControlGroup>

                {/* Proceso 2 */}
                <ProcessNode border={COLORS.accentOrange}>
                  <NodeLabel>PROCESO P2</NodeLabel>
                  <VectorDisplay>
                    <Bracket>[</Bracket>
                    <Val>{p2[0]}</Val>
                    <Separator>,</Separator>
                    <Val highlight>{p2[1]}</Val>
                    <Bracket>]</Bracket>
                  </VectorDisplay>
                  <ActionButton onClick={eventP2}>Evento Local</ActionButton>
                </ProcessNode>
              </VectorGrid>
            </GraphContainer>
          </SimulationArea>

          {/* --- Monitor (Derecha) --- */}
          <MonitorArea>
            <MonitorHeader>HISTORIAL DE VECTORES</MonitorHeader>
            <LogListContainer>
              {logs.length === 0 ? (
                <LogItem empty>Sincronización lista...</LogItem>
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
`;

const GraphContainer = styled.div`
  background: ${COLORS.bgCard};
  border-radius: 12px;
  padding: 60px 20px;
  border: 1px solid rgba(255,255,255,0.05);
`;

const VectorGrid = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const ProcessNode = styled.div`
  background: #0D111B;
  padding: 30px 20px;
  border-radius: 15px;
  width: 200px;
  text-align: center;
  border: 1px solid ${props => props.border};
  box-shadow: 0 8px 25px rgba(0,0,0,0.4);
`;

const NodeLabel = styled.div`
  font-size: 0.7rem;
  color: ${COLORS.textSecondary};
  margin-bottom: 20px;
  letter-spacing: 1px;
`;

const VectorDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Bracket = styled.span` color: ${COLORS.textSecondary}; `;
const Val = styled.span` color: ${props => props.highlight ? COLORS.accentOrange : COLORS.textPrimary}; `;
const Separator = styled.span` color: ${COLORS.textSecondary}; margin: 0 5px; `;

const ActionButton = styled.button`
  background: transparent;
  color: ${COLORS.textPrimary};
  border: 1px solid rgba(255,255,255,0.2);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  &:hover { background: rgba(255,255,255,0.05); }
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TransferBtn = styled.button`
  background: ${COLORS.accentBlue}11;
  color: ${COLORS.accentBlue};
  border: 1px solid ${COLORS.accentBlue}44;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: ${COLORS.accentBlue};
    color: #000;
  }
`;

const MonitorArea = styled.div`
  background: ${COLORS.bgCard};
  padding: 25px;
  border-radius: 12px;
`;

const MonitorHeader = styled.h4`
  font-size: 0.8rem;
  color: ${COLORS.textSecondary};
  margin: 0 0 20px 0;
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
  font-size: 0.8rem;
  color: ${props => props.empty ? COLORS.textSecondary : COLORS.accentOrange};
  background: rgba(255, 159, 67, 0.05);
  padding: 8px;
  border-radius: 4px;
`;