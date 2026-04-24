from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import tempfile
import os

app = Flask(__name__)

try:
    model = WhisperModel("medium", device="cuda", compute_type="float16")
except Exception:
    model = WhisperModel("medium", device="cpu", compute_type="int8")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    try:
        file.save(tmp.name)
        segments, _ = model.transcribe(tmp.name)
        result = [
            {"start": segment.start, "end": segment.end, "text": segment.text}
            for segment in segments
        ]
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp.name)

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
