import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import Navbar from "../Navbar";
export default function BerkeleySimulation() {
  // --- Tu Lógica Original (Mantenida) ---
  const [clients, setClients] = useState([
    { id: 1, offset: Math.random() * 5000 + 10000 },
    { id: 2, offset: Math.random() * 5000 - 6500 },
    { id: 3, offset: Math.random() * 5000 + 6500 },
  ]);

  const [times, setTimes] = useState([]);
  const [logs, setLogs] = useState([]); // Cambiado a un array para historial de logs

  // Actualizar tiempos cada 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updatedTimes = clients.map((c) => ({
        id: c.id,
        time: now + c.offset,
      }));

      setTimes(updatedTimes);
    }, 500);

    return () => clearInterval(interval);
  }, [clients]);

  // Tu función syncBerkeley original (Mantenida con ligeros ajustes de log)
  const syncBerkeley = () => {
    const now = Date.now();
    const currentTimes = clients.map((c) => now + c.offset);

    let total = 0;
    currentTimes.forEach((element) => {
      total += element;
    });
    const average = total / clients.length; // Usar length es más flexible

    const adjustmentsList = [];
    const newClients = clients.map((c) => {
      const clientTime = now + c.offset;
      const adjustment = average - clientTime;
      adjustmentsList.push({ id: c.id, adj: (adjustment / 1000).toFixed(2) }); // Segundos
      return { id: c.id, offset: c.offset + adjustment };
    });

    setClients(newClients);

    // Formatear los nuevos logs para el "Monitor de Seguridad"
    const newLogMessages = adjustmentsList.map(
      (a) => `Cliente ${a.id} ajustado por ${a.adj}s.`
    );
    addLog(`Sincronización finalizada. Promedio aplicado.`);
    newLogMessages.forEach((msg) => addLog(msg));
  };

  // Función auxiliar para añadir logs al panel derecho
  const addLog = (message) => {
    setLogs((prevLogs) => [message, ...prevLogs.slice(0, 15)]); // Mantiene los últimos 16 logs
  };

  // Tiempo del servidor de referencia (hora del sistema actual)
  const serverTimeFormatted = useMemo(() => {
    return new Date().toLocaleTimeString();
  }, [times]);

  return (
    <MainPage>
      <Navbar />
      {/* --- Encabezado --- */}
      <Header>
        <ProtocolTag>PROTOCOLO DE SINCRONIZACIÓN</ProtocolTag>
        <Title>
          Algoritmo de <Accent>Berkeley</Accent>
        </Title>
      </Header>

      {/* --- Contenido Principal (Grid de dos columnas) --- */}
      <ContentGrid>
        {/* --- Área de Simulación (Izquierda) --- */}
        <SimulationArea>
          <DescriptionCard>
            <p>
              El algoritmo de Berkeley es un método de sincronización de relojes
              en sistemas distribuidos. Un nodo actúa como <strong>coordinador</strong> 
              (Servidor) y solicita periódicamente la hora a los otros nodos (Clientes).
            </p>
            <p>
              El coordinador calcula un <strong>promedio</strong> de los tiempos recibidos 
              (incluyéndose a sí mismo, pero ignorando valores atípicos si se desea). 
              Luego, envía el ajuste necesario (positivo o negativo) a cada cliente 
              para que actualicen sus relojes locales, logrando un consenso global.
            </p>
          </DescriptionCard>

          <GraphContainer>
            {/* Visualización de los nodos */}
            <NodeGrid>
              {/* Servidor (Coordinador) */}
              <ServerNode>
                <NodeTitle server>Coordinador</NodeTitle>
                <TimeDisplay server>{serverTimeFormatted}</TimeDisplay>
              </ServerNode>

              {/* Clientes */}
              {times.map((c) => (
                <ClientNode key={c.id}>
                  <NodeTitle>Cliente {c.id}</NodeTitle>
                  <TimeDisplay>
                    {new Date(c.time).toLocaleTimeString()}
                  </TimeDisplay>
                </ClientNode>
              ))}
            </NodeGrid>
          </GraphContainer>

          <ControlsContainer>
            <ControlButton onClick={syncBerkeley}>
              Iniciar Sincronización (Berkeley)
            </ControlButton>
          </ControlsContainer>
        </SimulationArea>

        {/* --- Monitor de Seguridad / Logs (Derecha) --- */}
        <MonitorArea>
          <MonitorHeader>MONITOR DE SINCRONIZACIÓN</MonitorHeader>
          <LogListContainer>
            {logs.length === 0 ? (
              <LogItem empty>Esperando sincronización...</LogItem>
            ) : (
              logs.map((log, index) => <LogItem key={index}>{log}</LogItem>)
            )}
          </LogListContainer>
        </MonitorArea>
      </ContentGrid>
    </MainPage>
  );
}

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

// --- Componentes Estilizados (Styled Components) ---

// Contenedor principal de la página
const MainPage = styled.div`
  background-color: ${COLORS.bgDark};
  color: ${COLORS.textPrimary};
  min-height: 100vh;
  padding: 20px 40px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

// Estilos del Encabezado
const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
`;

const ProtocolTag = styled.div`
  background-color: ${COLORS.tagBg};
  color: ${COLORS.tagText};
  padding: 6px 12px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
`;

const Accent = styled.span`
  color: ${COLORS.accentOrange};
`;

// Estilos de la Cuadrícula de Contenido
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr; // 2/3 para simulación, 1/3 para monitor
  gap: 25px;
`;

// --- Área de Simulación (Izquierda) ---
const SimulationArea = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// Tarjeta de descripción
const DescriptionCard = styled.div`
  background-color: ${COLORS.bgCard};
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
  color: ${COLORS.textSecondary};
  line-height: 1.5;

  p {
    margin-top: 0;
    margin-bottom: 10px;
  }
  strong {
    color: ${COLORS.textPrimary};
  }
`;

// Contenedor del gráfico/nodos
const GraphContainer = styled.div`
  background-color: ${COLORS.bgCard};
  padding: 40px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

// Cuadrícula para posicionar los nodos
const NodeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  justify-items: center;
`;

// Estilos base para los nodos (servidor y clientes)
const BaseNode = styled.div`
  background-color: #0d111b; // Un poco más claro que el fondo de la tarjeta
  border: 1px solid ${COLORS.accentBlue};
  border-radius: 10px;
  width: 160px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(67, 181, 249, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(67, 181, 249, 0.3);
  }
`;

const ServerNode = styled(BaseNode)`
  border-color: ${COLORS.accentOrange};
  grid-column: 1 / -1; // Ocupa las dos columnas, arriba
  box-shadow: 0 4px 15px rgba(255, 159, 67, 0.2);

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 159, 67, 0.3);
  }
`;

const ClientNode = styled(BaseNode)``;

// Textos dentro de los nodos
const NodeTitle = styled.div`
  font-size: 0.8rem;
  color: ${COLORS.textSecondary};
  color: ${(props) => (props.server ? COLORS.accentOrange : COLORS.accentBlue)};
  text-transform: uppercase;
  font-weight: bold;
`;

const TimeDisplay = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
  letter-spacing: 1px;
  color: ${(props) => (props.server ? COLORS.accentOrange : COLORS.textPrimary)};
`;

// Contenedor del botón
const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const ControlButton = styled.button`
  background-color: ${COLORS.accentOrange};
  color: #000; // Texto negro para contraste
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(255, 159, 67, 0.3);

  &:hover {
    background-color: #f7a85c;
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(255, 159, 67, 0.4);
  }

  &:active {
    transform: translateY(1px);
  }
`;

// --- Monitor de Sincronización (Derecha) ---
const MonitorArea = styled.section`
  background-color: ${COLORS.bgCard};
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
`;

const MonitorHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 0.8rem;
  color: ${COLORS.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
`;

const LogListContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* Estilos de la barra de desplazamiento */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`;

const LogItem = styled.p`
  margin: 0;
  color: ${(props) => (props.empty ? COLORS.textSecondary : COLORS.accentOrange)};
  padding-left: 10px;
  border-left: 2px solid;
  border-left-color: ${(props) =>
    props.empty ? "transparent" : COLORS.accentOrange};
`;