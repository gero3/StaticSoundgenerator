let audioContext;
let source;
let isPlaying = false;

async function generateSound() {
  // Check if a sound is currently playing
  if (isPlaying) {
    cancelSound();
    return;
  }

  // Initialize the audio context and set it up
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = parseInt(document.getElementById("sampleRate").value);
  const soundLength = parseFloat(document.getElementById("soundLength").value);
  const numSamples = Math.floor(sampleRate * soundLength);
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Get the custom wave function from the textarea
  const functionText = document.getElementById("sineFunction").value;

  // Create the wave function from the user's input
  let customWaveFunction;
  try {
    customWaveFunction = new Function("index", "sampleRate", `"use strict"; return (${functionText})(index, sampleRate);`);
  } catch (error) {
    console.error("Error in function definition:", error);
    alert("Error in function definition. Please check your syntax.");
    return;
  }

  // Generate the sound data
  for (let i = 0; i < data.length; i++) {
    try {
      data[i] = customWaveFunction(i, sampleRate);
    } catch (error) {
      console.error("Error evaluating function:", error);
      alert("Error evaluating function. Please check your function logic.");
      return;
    }
  }

  // Set up the audio buffer source
  source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();

  // Update the button to "Cancel Sound" while playing
  isPlaying = true;
  document.getElementById('generate-sound').textContent = "Cancel Sound";

  // Stop sound when playback ends
  source.onended = () => {
    resetButton();
  };

  // Create WAV Blob for download
  const wavBlob = await bufferToWaveBlob(buffer, sampleRate);
  const downloadLink = document.getElementById('download-link');
  downloadLink.href = URL.createObjectURL(wavBlob);
  downloadLink.style.display = 'inline-block';
}

// Cancel sound by stopping the audio source
function cancelSound() {
  if (source) {
    source.stop();
  }
  resetButton();
}

// Reset the button state back to "Generate Sound"
function resetButton() {
  isPlaying = false;
  document.getElementById('generate-sound').textContent = "Generate Sound";
}

// Convert AudioBuffer to WAV Blob
async function bufferToWaveBlob(buffer, sampleRate) {
  const audioData = buffer.getChannelData(0);
  const wavBuffer = new ArrayBuffer(44 + audioData.length * 2);
  const view = new DataView(wavBuffer);

  // WAV file header
  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + audioData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, audioData.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < audioData.length; i++, offset += 2) {
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

// Event listener for "Generate Sound" button
document.getElementById('generate-sound').addEventListener('click', generateSound);
