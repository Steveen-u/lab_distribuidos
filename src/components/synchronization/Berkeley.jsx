import React, { useEffect, useState } from "react";
import styled from "styled-components";

export default function BerkeleySimulation() {
  const [clients, setClients] = useState([
    { id: 1, offset: Math.random() * 5000 + 10000},
    { id: 2, offset: Math.random() * 5000 - 6500 },
    { id: 3, offset: Math.random() * 5000 + 6500 },
  ]);

  const [times, setTimes] = useState([]);
  const [log, setLog] = useState("");

  // Actualizar tiempos cada 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
    //map es como un for, simplemente crea una lista llamada updatedTimes 
      const updatedTimes = clients.map(c => ({
        id: c.id,
        time: now + c.offset
      }));

      setTimes(updatedTimes);
    }, 500);

    return () => clearInterval(interval);
  }, [clients]);

    const syncBerkeley = () => {
        const now = Date.now();

        //Toman los tiempos de los 3 clientes junto con su desfase
        const currentTimes = clients.map(c => now + c.offset);

        //Esto hace un promedio
        let total = 0
        currentTimes.forEach((element) => {
          total += element
        })
        const average = total/3

        //Esto arregla el desfase
        const newClients = clients.map(c => {
            const clientTime = now + c.offset;//El tiempo del cliente en específico
            const adjustment = average - clientTime;
            console.log(c)
            return {id:c.id, offset: c.offset + adjustment};
        });
        
        //Se agrega la nueva lista a la lista clients
        setClients(newClients);

        setLog("Sincronización realizada (promedio aplicado)");
    };  

  return (
    <Container>
      <Title>Simulación - Berkeley</Title>

      <ClientsContainer>
        {times.map(c => (
          <Box key={c.id}>
            <h3>Cliente {c.id}</h3>
            <TimeText>{new Date(c.time).toLocaleTimeString()}</TimeText>
          </Box>
        ))}
      </ClientsContainer>

      <Button onClick={syncBerkeley}>Sincronizar(Berkeley)</Button>

      <Log>{log}</Log>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const Title = styled.h2``;

const ClientsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Box = styled.div`
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 10px;
`;

const TimeText = styled.p`
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
  margin-top: 10px;
`;