(() => {
  const scene = (commands, target) => ({ commands, target });
  const scenes = {
    sA: scene([[[0,0,0],"x-",3],[[-1,0,0],"y+",2],[[-2,0,0],"z+",1]],[[-1,2,0],[-1,1,0]]),
    sB: scene([[[0,0,0],"x-",3],[[-2,0,0],"z+",2],[[-3,0,0],"y+",1]],[[-2,0,2],[-2,0,1]]),
    mA: scene([[[0,0,0],"x-",7],[[-2,0,0],"y+",3],[[-4,0,0],"z+",2],[[-6,0,0],"y+",2]],[[-2,3,0],[-2,2,0]]),
    mB: scene([[[0,0,0],"x-",7],[[-3,0,0],"z+",3],[[-5,0,0],"y+",2],[[-7,0,0],"z+",2]],[[-3,0,3],[-3,0,2]]),
    bA: scene([[[0,0,0],"x-",9],[[-2,0,0],"y+",5],[[-4,0,0],"z+",4],[[-6,0,0],"y+",4],[[-8,0,0],"z+",4]],[[-2,5,0],[-2,4,0]]),
    bB: scene([[[0,0,0],"x-",9],[[-3,0,0],"z+",5],[[-5,0,0],"y+",4],[[-7,0,0],"z+",4],[[-9,0,0],"y+",4]],[[-3,0,5],[-3,0,4]]),
    dA: scene([[[0,0,0],"x-",13],[[-1,0,0],"y+",7],[[-3,0,0],"z+",6],[[-5,0,0],"y+",6],[[-7,0,0],"z+",5],[[-9,0,0],"y+",5],[[-11,0,0],"z+",5],[[-13,0,0],"y+",5]],[[-1,7,0],[-1,6,0]]),
    dB: scene([[[0,0,0],"x-",13],[[-2,0,0],"z+",7],[[-4,0,0],"y+",6],[[-6,0,0],"z+",6],[[-8,0,0],"y+",5],[[-10,0,0],"z+",5],[[-12,0,0],"y+",5],[[-13,0,0],"z+",5]],[[-2,0,7],[-2,0,6]])
  };
  const trials = [
    ["N1A","N","N1","baseline","sA"],["N1B","N","N1","global","sB"],
    ["N2A","N","N2","global","mA"],["N2B","N","N2","baseline","mB"],
    ["N3A","N","N3","global","bA"],["N3B","N","N3","baseline","bB"],
    ["N4A","N","N4","baseline","dA"],["N4B","N","N4","global","dB"],
    ["A1A","A","A1","global","sB"],["A1B","A","A1","local","sA"],
    ["A2A","A","A2","local","mB"],["A2B","A","A2","global","mA"],
    ["A3A","A","A3","local","bA"],["A3B","A","A3","global","bB"],
    ["A4A","A","A4","global","dB"],["A4B","A","A4","local","dA"]
  ].map(([id,sub,pair,policy,scene]) => ({id,sub,pair,policy,scene}));
  window.__WER1_STUDY_DATA__ = Object.freeze({
    schema: "anvil-wer1-study-data/v1",
    executable: "74494178d169f988f6aa01f9c2d440a476c8e5ce",
    localWakeRadiusPx: 96,
    scenes: Object.freeze(scenes),
    trials: Object.freeze(trials),
    tasks: Object.freeze({
      N: "Znajdź i wybierz jedyny istniejący Bearing.",
      A: "Dodaj jeden Bearing na połączeniu końcowej komórki najdłuższego bocznego ramienia z jej poprzednią komórką."
    })
  });
})();
