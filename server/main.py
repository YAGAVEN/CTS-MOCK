from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torchvision.transforms as T
import numpy as np
import pandas as pd
import librosa
import joblib
from PIL import Image
import io
import os
from sentence_transformers import SentenceTransformer

# ============================================================
# IMPORT CUSTOM MODELS
# ============================================================
from models.pretrained_backbone import EfficientNetBackbone
from models.manual_branch import ManualBranch
from models.fusion import GatedFusion
from models.hybrid_model import HybridModel
from models.cnn_lstm import CNN_LSTM

# ============================================================
# CONFIGURATIONS
# ============================================================
AUDIO_MODEL_PATH = "models/audio-model.pth"
TEXT_MODEL_SENTENCE_PATH = "models/sentence_model"
TEXT_MODEL_CLASSIFIER_PATH = "models/classifier_st.pkl"
TEXT_MODEL_ENCODER_PATH = "models/label_encoder_st.pkl"
LABEL_ENCODER_PATH = "models/label_encoder.pkl"
META_CSV = "models/meta.csv"
TOKENIZER_DIR = "tokenizer"
IMAGE_MODEL_PATH = "models/image-model.pth"
SAMPLE_LENGTH = 170
N_MFCC = 13

# ============================================================
# CREATE FASTAPI APP
# ============================================================
app = FastAPI(title="Unified Age Group Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust to your frontend domain if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# IMAGE MODEL SETUP
# ============================================================
AGE_BIN_RANGES = [
    "1-5", "6-10", "11-15", "16-20", "21-25", "26-30",
    "31-35", "36-40", "41-45", "46-50", "51-55", "56-60",
    "61-65", "66-70", "71-75", "76-80", "81-85", "86-90", "91-95", "95+"
]

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

image_model = HybridModel(
    EfficientNetBackbone(pretrained=False),
    ManualBranch(),
    GatedFusion(),
    num_bins=len(AGE_BIN_RANGES)
).to(device)
image_model.load_state_dict(torch.load(IMAGE_MODEL_PATH, map_location=device))
image_model.eval()

image_transform = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor()
])

# ============================================================
# AUDIO MODEL SETUP
# ============================================================
df = pd.read_csv(META_CSV)
age_bins = sorted(df["new_age_bin"].unique())
num_classes = len(age_bins)

audio_model = CNN_LSTM(n_mfcc=N_MFCC, sample_length=SAMPLE_LENGTH, num_classes=num_classes)
checkpoint = torch.load(AUDIO_MODEL_PATH, map_location=device)
audio_model.load_state_dict(checkpoint["model_state_dict"])
audio_model.to(device)
audio_model.eval()

def audio_to_mfcc(audio_bytes, sr=16000, n_mfcc=N_MFCC, sample_length=SAMPLE_LENGTH):
    y, _ = librosa.load(audio_bytes, sr=sr)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    t = mfcc.shape[1]
    if t < sample_length:
        mfcc = np.pad(mfcc, ((0, 0), (0, sample_length - t)), mode="constant")
    elif t > sample_length:
        mfcc = mfcc[:, :sample_length]
    amin, amax = mfcc.min(), mfcc.max()
    if amax > amin:
        mfcc = (mfcc - amin) / (amax - amin)
    else:
        mfcc = mfcc - amin
    return torch.from_numpy(mfcc).unsqueeze(0).unsqueeze(0).float()

# ============================================================
# TEXT MODEL SETUP
# ============================================================
embedder = SentenceTransformer(TEXT_MODEL_SENTENCE_PATH)  # folder where your SentenceTransformer model is
clf = joblib.load(TEXT_MODEL_CLASSIFIER_PATH)       # Logistic Regression classifier
label_encoder = joblib.load(TEXT_MODEL_ENCODER_PATH)  # Age group label encoder

# ============================================================
# API ENDPOINTS
# ============================================================

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    input_tensor = image_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = image_model(input_tensor)
        pred_bin = torch.argmax(output, dim=1).item()
        pred_range = AGE_BIN_RANGES[pred_bin]

    return JSONResponse(content={"label": pred_range, "confidence": 0.9})


@app.post("/predict-audio")
async def predict_audio(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        temp_path = "temp_audio.wav"
        with open(temp_path, "wb") as f:
            f.write(contents)
        x = audio_to_mfcc(temp_path).to(device)
        with torch.no_grad():
            logits = audio_model(x)
            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
            pred_idx = np.argmax(probs)
        label = age_bins[pred_idx]
        confidence = float(probs[pred_idx])
        os.remove(temp_path)
        return JSONResponse({"label": label, "confidence": confidence})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


class PredictTextRequest(BaseModel):
    text: str


@app.post("/predict-text")
def predict_text(req: PredictTextRequest):
    try:
        # 1️⃣ Convert input text to embedding
        user_embedding = embedder.encode([req.text], convert_to_tensor=False)

        # 2️⃣ Predict numeric label
        predicted_label = clf.predict(user_embedding)

        # 3️⃣ Predict probabilities to get confidence
        probs = clf.predict_proba(user_embedding)
        confidence = float(np.max(probs))

        # 4️⃣ Convert numeric label back to age group
        predicted_age_group = label_encoder.inverse_transform(predicted_label)

        return {
            "label": predicted_age_group[0],
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        return {"error": str(e)}