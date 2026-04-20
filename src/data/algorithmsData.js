export const algorithmsData = [
  {
    category: "Sincronización",
    algorithms: [
      { id: "berkeley", name: "Algoritmo de Berkeley", desc: "Sincronizar relojes mediante promedio entre nodos." },
      { id: "cristian", name: "Algoritmo de Cristian", desc: "Sincronizar reloj cliente con servidor de tiempo." },
      { id: "lamport", name: "Relojes lógicos de Lamport", desc: "Ordenar eventos lógicamente sin relojes físicos." },
      { id: "vectoriales", name: "Relojes vectoriales", desc: "Detectar causalidad y concurrencia entre eventos." },
    ],
  },
  {
    category: "Exclusión mutua",
    algorithms: [
      { id: "centralizado", name: "Algoritmo Centralizado", desc: "Coordinador controla acceso exclusivo a recurso." },
      { id: "distribuido", name: "Algoritmo distribuido", desc: "Nodos coordinan acceso mediante solicitudes y permisos." },
      { id: "token-ring", name: "Algoritmo Token ring", desc: "Token circula; quien lo posee accede al recurso." },
    ],
  },
  {
    category: "Elección",
    algorithms: [
      { id: "bully", name: "Algoritmo de Bully", desc: "Mayor ID reemplaza coordinador tras detectar fallo." },
      { id: "anillo", name: "Algoritmo de anillo", desc: "Elección circula; mayor ID elegido como coordinador." },
    ],
  },
  {
    category: "Bloqueos",
    algorithms: [
      { id: "prevention", name: "Prevención de Deadlocks", desc: "Evitar el ciclo de espera mediante reglas de asignación." },
      { id: "detection", name: "Detección de Deadlocks", desc: "Algoritmos para encontrar ciclos en grafos de recursos." },
      { id: "recovery", name: "Recuperación de Deadlocks", desc: "Estrategias para romper el bloqueo: aborto y rollback." },
    ],
  }
];