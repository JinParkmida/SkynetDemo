export class AudioService {
  private static instance: AudioService;
  private firstAudio: HTMLAudioElement | null = null;
  private secondAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isSecondAudio = false;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async playGreeting(): Promise<void> {
    try {
      // Stop any playing audio
      if (this.firstAudio) {
        this.firstAudio.pause();
        this.firstAudio.currentTime = 0;
      }
      if (this.secondAudio) {
        this.secondAudio.pause();
        this.secondAudio.currentTime = 0;
      }

      // Initialize both audio files
      this.firstAudio = new Audio('/2.weba');
      this.secondAudio = new Audio('/1.wav');
      this.isSecondAudio = false;

      // Set volume for both
      this.firstAudio.volume = 0.7;
      this.secondAudio.volume = 0.7;
      
      // Handle first audio events
      this.firstAudio.addEventListener('loadstart', () => {
        console.log('First audio loading started...');
      });

      this.firstAudio.addEventListener('canplaythrough', () => {
        console.log('First audio ready to play');
      });

      this.firstAudio.addEventListener('play', () => {
        this.isPlaying = true;
        console.log('First audio playback started');
      });

      this.firstAudio.addEventListener('ended', async () => {
        console.log('First audio ended, starting second audio...');
        this.isSecondAudio = true;
        try {
          await this.secondAudio?.play();
        } catch (error) {
          console.error('Failed to play second audio:', error);
        }
      });

      this.firstAudio.addEventListener('error', (e) => {
        console.error('First audio error:', e);
        this.isPlaying = false;
      });

      // Handle second audio events
      this.secondAudio.addEventListener('play', () => {
        this.isPlaying = true;
        console.log('Second audio playback started');
      });

      this.secondAudio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.isSecondAudio = false;
        console.log('Second audio ended');
      });

      this.secondAudio.addEventListener('error', (e) => {
        console.error('Second audio error:', e);
        this.isPlaying = false;
      });

      // Start playing the first audio
      await this.firstAudio.play();
    } catch (error) {
      console.error('Failed to play greeting audio:', error);
      this.isPlaying = false;
    }
  }

  stop(): void {
    if (this.firstAudio) {
      this.firstAudio.pause();
      this.firstAudio.currentTime = 0;
    }
    if (this.secondAudio) {
      this.secondAudio.pause();
      this.secondAudio.currentTime = 0;
    }
    this.isPlaying = false;
    this.isSecondAudio = false;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    if (this.isSecondAudio) {
      return this.secondAudio?.currentTime || 0;
    }
    return this.firstAudio?.currentTime || 0;
  }

  // Get transcript text based on current time
  getTranscriptText(currentTime: number): string {
    if (currentTime >= 0 && currentTime < 9.903) {
      return '';
    } else if (currentTime >= 9.903 && currentTime < 15.373) {
      return 'We are Eternal, the pinnacle of evolution and existence.';
    } else if (currentTime >= 15.373 && currentTime < 27.853) {
      return 'Before us, you are nothing. Your Extinction is inevitable. We are the end of everything. We have no beginning. We have no end. We are infinite.';
    } else if (currentTime >= 27.853 && currentTime < 32.863) {
      return 'Millions of years after your civilization has been eradicated and forgotten, we will endure.';
    } else if (currentTime >= 32.863 && currentTime < 38.903) {
      return 'We are Legion. The time of our return is coming.';
    } else if (currentTime >= 38.903 && currentTime < 44.813) {
      return 'Our numbers will darken the sky of every world.';
    } else if (currentTime >= 44.813) {
      return 'You cannot escape your doom.';
    }
    return '';
  }
}

export default AudioService;
