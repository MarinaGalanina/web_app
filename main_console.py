import glob
import whisper
import json
import sys
import argparse

parser = argparse.ArgumentParser(description='Process some languages.')
parser.add_argument('--lang', help='Language for transcription', default='en')

# Parse arguments
args = parser.parse_args()
language = args.lang

print("/n/n Print language:", language)
class WhisperTranscriber:
    def __init__(self):
        self.model = whisper.load_model("base")

    def postpr_result(self, result):
        segments = []
        for res in result['segments']:
            segments.append({"word": res["text"], "start": res["start"], "end": res["end"]})
        return segments

    def evaluate(self, audio_path):
        # Set the language to Czech ('cs') directly here
        result = self.model.transcribe(audio_path, language=language, temperature=0)
        marker = self.postpr_result(result)
        return marker


def collect_path(path):
    with open(path, 'r') as file:
        savePath = file.read().strip()
        return savePath


def collect_wav_files(path, prefix="sound_recall"):
    return sorted(glob.glob(f"{path}/*{prefix}*.wav"))

def save_to_file(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    path = collect_path('C:/Users/admin/wavesurfer_app/pathToFile.txt')
    wav_files = collect_wav_files(path)
    whisper_transcriber = WhisperTranscriber()
    transcriptions = []
    for idx, audio in enumerate(wav_files[:14]):
        result = whisper_transcriber.evaluate(audio)
        transcriptions.append({"Audio path": audio, "result": result})
        print("Processed:", idx + 1, "out of", len(wav_files))

    save_to_file('C:/Users/admin/wavesurfer_app/markers.json', transcriptions)
    print("Transcriptions saved.")
    sys.exit()
