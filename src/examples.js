function loadExample() {
    const exampleSelect = document.getElementById("exampleSelect");
    const sineFunctionTextarea = document.getElementById("sineFunction");
  
    // Define example functions for game sound effects
    const examples = {
      laserBlast: `function(index, sampleRate) {
        return Math.sin(2 * Math.PI * index / (sampleRate / 880)) * Math.exp(-index / 5000);
      }`,
      explosion: `function(index, sampleRate) {
        return (Math.random() * 2 - 1) * Math.exp(-index / 5000);
      }`,
      footstep: `function(index, sampleRate) {
        let stepFrequency = 300; // Frequency for a footstep
        return Math.sin(2 * Math.PI * index / (sampleRate / stepFrequency)) * Math.exp(-index / 1000) * (index % 500 < 250 ? 1 : -1);
      }`,
      wind: `function(index, sampleRate) {
        return Math.sin(index / 100) * 0.5 + Math.sin(index / 200) * 0.3 + (Math.random() * 2 - 1) * 0.05;
      }`,
      ambientDrone: `function(index, sampleRate) {
        let baseFreq = 55; // Low drone frequency
        return Math.sin(2 * Math.PI * index / (sampleRate / baseFreq)) * 0.5 + Math.sin(2 * Math.PI * index / (sampleRate / (baseFreq * 1.5))) * 0.3;
      }`
    };
  
    // Load the selected example into the textarea
    const selectedExample = exampleSelect.value;
    if (examples[selectedExample]) {
      sineFunctionTextarea.value = examples[selectedExample];
    }
  }
  