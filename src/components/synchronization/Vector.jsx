import React, { useState } from "react";
import styled from "styled-components";

export default function VectorClocksSimulation() {
  const [p1, setP1] = useState([0, 0]);
  const [p2, setP2] = useState([0, 0]);
  const [log, setLog] = useState([]);

  // Evento interno P1
  const eventP1 = () => {
    const newV = [...p1];
    newV[0]++;
    setP1(newV);
    setLog(prev => [...prev, `P1 evento → [${newV}]`]);
  };

  // Evento interno P2
  const eventP2 = () => {
    const newV = [...p2];
    newV[1]++;
    setP2(newV);
    setLog(prev => [...prev, `P2 evento → [${newV}]`]);
  };

  // P1 → P2
  const sendP1toP2 = () => {
    // P1 incrementa antes de enviar
    const sendV = [...p1];
    sendV[0]++;
    setP1(sendV);

    // P2 recibe y hace merge
    const merged = p2.map((v, i) => Math.max(v, sendV[i]));
    merged[1]++; // evento de recepción

    setP2(merged);

    setLog(prev => [
      ...prev,
      `P1 envía [${sendV}] → P2 recibe [${merged}]`
    ]);
  };

  // P2 → P1
  const sendP2toP1 = () => {
    const sendV = [...p2];
    sendV[1]++;
    setP2(sendV);

    const merged = p1.map((v, i) => Math.max(v, sendV[i]));
    merged[0]++;

    setP1(merged);

    setLog(prev => [
      ...prev,
      `P2 envía [${sendV}] → P1 recibe [${merged}]`
    ]);
  };

  return (
    <Container>
      <Title>Relojes Vectoriales</Title>

      <Processes>
        <Box>
          <h3>Proceso 1</h3>
          <Time>[{p1.join(", ")}]</Time>
          <Button onClick={eventP1}>Evento</Button>
        </Box>

        <Box>
          <h3>Proceso 2</h3>
          <Time>[{p2.join(", ")}]</Time>
          <Button onClick={eventP2}>Evento</Button>
        </Box>
      </Processes>

      <ButtonsRow>
        <Button onClick={sendP1toP2}>P1 → P2</Button>
        <Button onClick={sendP2toP1}>P2 → P1</Button>
      </ButtonsRow>

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
  font-family: Arial, sans-serif;
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
  font-size: 22px;
  font-weight: bold;
`;

const ButtonsRow = styled.div`
  margin-top: 20px;
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background-color: #4cafef;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #3a9edc;
  }
`;

const LogBox = styled.div`
  margin-top: 20px;
  text-align: left;
  max-width: 400px;
  margin-inline: auto;
`;