import React, { useEffect, useState } from "react";
import styled from "styled-components";

export default function CristianSimulation() {
  const [clientOffset, setClientOffset] = useState(Math.random() * 5000 + 5000); //Esto muestra un pequeño desfase entre los nodos
  const [serverTime, setServerTime] = useState(Date.now());
  const [clientTime, setClientTime] = useState(Date.now() + clientOffset);
  const [log, setLog] = useState("");

  // Actualizar relojes cada 500ms
  useEffect(() => {
    //setInterval se actualiza cada 500ms
    const interval = setInterval(() => {
      const now = Date.now();
      //Desde el inicio se pone las horas tanto del servidor como del cliente, este último tiene un pequeño desfase
      //Ver línea 4
      setServerTime(now);
      setClientTime(now + clientOffset);
    }, 500);

    return () => clearInterval(interval);
  }, [clientOffset]);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const syncTime = async () => {
    const t0 = Date.now();

    //Simula la latencia que hay en la red(Solo ida)
    const latency1 = Math.random() * 1000;
    await sleep(latency1);

    const serverNow = Date.now();
    //Simula la latencia de vuelta
    const latency2 = Math.random() * 1000;
    await sleep(latency2);

    const t1 = Date.now();
    //t0 es la instancia en el que el cliente hace la peticion
    //t1 obtiene la hora en que la petición fue respondida con la latencia de red y llega al mismo cliente
    //Por lo que RTT fie la latencia total que le tomó al cliente hacer la petición de la hora
    const RTT = t1 - t0;

    //Esta es el tiempo que deberái tener el servidor después de todo ese proceso
    const adjustedTime = serverNow + RTT / 2;

    //newOffSet sería cuanto hay que ajustar el reloj para que coincida con el tiempo del servidor
    const newOffset = adjustedTime - Date.now();
    setClientOffset(newOffset);

    setLog(`RTT: ${RTT.toFixed(0)} ms | Ajuste aplicado: ${(RTT / 2).toFixed(0)} ms`);
  };

  /*
    Ejemplo:
    Cliente: 15:45:06
    Servidor: 15:50:01

    El cliente hace la petición a las 15:45:06, hay una latencia de ida de 2segundos y en ese entonces se hace
    un date.now() para el servidor que para este punto debe estar en 15:05:03

    Ahora hay un viaje de vuelta que dura otros 2 segundos, se hace el mismo date.now() pero esta vez para el cliente
    en ese entonces t1=15:45:10

    Se hace el calculo de RTT = t1 - t0 la cual sería RTT = 15:45:06 - 15:45:10, por lo tanto RTT = 4s

    adjustedTime = serverNow - RTT/2, por lo tanto sería algo así como 15:05:03 + 4s/2s = 15:05:05

    y pot ultimo

    offSet = 15:05:05 - 15:45:10
    offSet = 4 minutos y 55 segundos
  */

  return (
    <Container>
      <Title>Simulación - Algoritmo de Cristian</Title>

      <BoxContainer>
        <Box>
          <h3>Servidor</h3>
          <TimeText>
            {new Date(serverTime).toLocaleTimeString()}
          </TimeText>
        </Box>

        <Box>
          <h3>Cliente</h3>
          <TimeText>
            {new Date(clientTime).toLocaleTimeString()}
          </TimeText>
        </Box>
      </BoxContainer>

      <Button onClick={syncTime}>Sincronizar</Button>

      <Log>{log}</Log>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  margin-top: 40px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const BoxContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
`;

const Box = styled.div`
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 12px;
  width: 180px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const TimeText = styled.p`
  font-size: 18px;
  font-weight: bold;
`;

const Button = styled.button`
  margin-top: 25px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background-color: #4cafef;
  color: white;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #3a9edc;
  }
`;

const Log = styled.p`
  margin-top: 15px;
  color: #ccc;
`;