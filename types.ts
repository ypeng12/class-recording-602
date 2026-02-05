
export interface Note {
  id: string;
  title: string;
  date: number;
  rawTranscript: string;
  formattedNotes: string;
  summary: string;
  duration: number;
}

export enum RecordingStatus {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  PROCESSING = 'PROCESSING'
}
