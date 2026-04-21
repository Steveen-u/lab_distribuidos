import React, { useState } from "react";
import styled from "styled-components";

export default function LamportSimulation() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [log, setLog] = useState([]);

  const eventP1 = () => {
    const newTime = p1 + 1;
    setP1(newTime);
    setLog(prev => [...prev, `P1 evento → ${newTime}`]);
  };

  const eventP2 = () => {
    const newTime = p2 + 1;
    setP2(newTime);
    setLog(prev => [...prev, `P2 evento → ${newTime}`]);
  };

  const sendP1toP2 = () => {
    const sendTime = p1 + 1;
    setP1(sendTime);

    //Esto de aquí simula lo de enviar cosas, toma el máximo entre p1 y p2, el resultado se le suma 1 y se le agrega a p2
    const receiveTime = Math.max(p2, sendTime) + 1;
    setP2(receiveTime);

    setLog(prev => [...prev,`P1 envía (${sendTime}) → P2 recibe (${receiveTime})`]);
  };

  const sendP2toP1 = () => {
    const sendTime = p2 + 1;
    setP2(sendTime);

    //Esto de aquí simula lo de enviar cosas, toma el máximo entre p1 y p2, el resultado se le suma 1 y se le agrega a p1
    const receiveTime = Math.max(p1, sendTime) + 1;
    setP1(receiveTime);

    setLog(prev => [...prev,`P2 envía (${sendTime}) → P1 recibe (${receiveTime})`]);
  };

  return (
    <Container>
      <Title>Relojes Lógicos de Lamport</Title>

      <Processes>
        <Box>
          <h3>Proceso 1</h3>
          <Time>{p1}</Time>
          <Button onClick={eventP1}>Evento</Button>
        </Box>

        <Box>
          <h3>Proceso 2</h3>
          <Time>{p2}</Time>
          <Button onClick={eventP2}>Evento</Button>
        </Box>
      </Processes>

      <Button onClick={sendP1toP2}>P1 → P2</Button>
      <Button onClick={sendP2toP1}>P2 → P1</Button>

      <LogBox>
        {log.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </LogBox>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const Title = styled.h2``;

const Processes = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
`;

const Box = styled.div`
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 10px;
`;

const Time = styled.p`
  font-size: 24px;
  font-weight: bold;
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px;
`;

const LogBox = styled.div`
  margin-top: 20px;
  text-align: left;
  max-width: 400px;
  margin-inline: auto;
`;