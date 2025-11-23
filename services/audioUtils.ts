
/**
 * Decodes a Base64 string into a byte array.
 */
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  // Convert Uint8Array to Int16Array (PCM 16-bit)
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize 16-bit integer to float [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Main helper to process the base64 string from Gemini and return an AudioBuffer.
 */
export async function processGeminiAudio(
  base64Data: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const byteArray = decodeBase64(base64Data);
  // Gemini TTS typically uses 24000Hz sample rate
  return decodeAudioData(byteArray, audioContext, 24000, 1);
}

/**
 * Concatenates multiple AudioBuffers into a single continuous AudioBuffer.
 */
export function concatenateAudioBuffers(buffers: AudioBuffer[], context: AudioContext): AudioBuffer {
  if (buffers.length === 0) {
    return context.createBuffer(1, 1, 24000); // Return empty buffer if none
  }
  if (buffers.length === 1) {
    return buffers[0];
  }

  // Calculate total length
  const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  
  // Create new buffer (assuming mono 24k based on Gemini defaults)
  const output = context.createBuffer(
    buffers[0].numberOfChannels,
    totalLength,
    buffers[0].sampleRate
  );

  // Merge data
  for (let channel = 0; channel < output.numberOfChannels; channel++) {
    const outputData = output.getChannelData(channel);
    let offset = 0;
    for (const buf of buffers) {
      outputData.set(buf.getChannelData(channel), offset);
      offset += buf.length;
    }
  }

  return output;
}

/**
 * Plays an AudioBuffer on the given context with volume and speed control.
 * Returns the source node so it can be stopped if needed.
 */
export function playBuffer(
  buffer: AudioBuffer,
  context: AudioContext,
  volume: number = 1.0,
  playbackRate: number = 1.0,
  onEnded?: () => void
): AudioBufferSourceNode {
  const source = context.createBufferSource();
  source.buffer = buffer;
  
  // Set Playback Rate (Speed)
  source.playbackRate.value = playbackRate;

  // Create Gain Node for Volume
  const gainNode = context.createGain();
  gainNode.gain.value = volume;

  // Connect Source -> Gain -> Destination
  source.connect(gainNode);
  gainNode.connect(context.destination);

  source.onended = () => {
    if (onEnded) onEnded();
  };
  source.start();
  return source;
}

/**
 * Writes a string to a DataView.
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Encodes AudioBuffer to WAV format and triggers download.
 */
export function exportAudioAsWav(buffer: AudioBuffer, filename: string) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, buffer.length * numOfChan * 2, true);

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  offset = 44;
  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      // clamp
      sample = Math.max(-1, Math.min(1, channels[i][pos])); 
      // scale to 16-bit signed int
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; 
      view.setInt16(offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  // Create Blob and Link
  const blob = new Blob([view], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}.wav`;
  anchor.click();
  URL.revokeObjectURL(url);
}
