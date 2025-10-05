# Place these imports at the top, and ensure no duplications from earlier imports
from fastapi import FastAPI, File, UploadFile, HTTPException, Path
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
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as tf_image
from transformers import BertTokenizer, BertForSequenceClassification
from sentence_transformers import SentenceTransformer

# ============================================================
# INITIALIZE APP AND CORS
# ============================================================
app = FastAPI(title="Unified Age Group Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust for production to be more secure
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD ALL MODELS
# ============================================================

# Image/Age - PyTorch
from models.pretrained_backbone import EfficientNetBackbone
from models.manual_branch import ManualBranch
from models.fusion import GatedFusion
from models.hybrid_model import HybridModel
from models.cnn_lstm import CNN_LSTM

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
image_model.load_state_dict(torch.load("models/image-model.pth", map_location=device))
image_model.eval()
image_transform = T.Compose([
    T.Resize(256), T.CenterCrop(224), T.ToTensor()
])

# Audio
df = pd.read_csv("models/meta.csv")
age_bins = sorted(df["new_age_bin"].unique())
audio_model = CNN_LSTM(n_mfcc=13, sample_length=170, num_classes=len(age_bins))
audio_model.load_state_dict(torch.load("models/audio-model.pth", map_location=device)["model_state_dict"])
audio_model.to(device)
audio_model.eval()

def audio_to_mfcc(audio_bytes, sr=16000, n_mfcc=13, sample_length=170):
    y, _ = librosa.load(audio_bytes, sr=sr)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    t = mfcc.shape[1]
    if t < sample_length:
        mfcc = np.pad(mfcc, ((0, 0), (0, sample_length-t)), mode="constant")
    elif t > sample_length:
        mfcc = mfcc[:, :sample_length]
    amin, amax = mfcc.min(), mfcc.max()
    if amax > amin:
        mfcc = (mfcc - amin) / (amax - amin)
    else:
        mfcc = mfcc - amin
    return torch.from_numpy(mfcc).unsqueeze(0).unsqueeze(0).float()

# Text
tokenizer = BertTokenizer.from_pretrained("tokenizer")
label_encoder = joblib.load("models/label_encoder.pkl")
num_labels = len(label_encoder.classes_)
text_model = BertForSequenceClassification.from_pretrained(
    "bert-base-uncased", num_labels=num_labels
)
text_model.load_state_dict(torch.load("models/text-model.pth", map_location="cpu"))
text_model.eval()

# Iris - Keras (TF)
iris_model = load_model("models/iris-model.h5")
iris_age_bins = [(i, i+4) for i in range(1, 101, 5)]
def iris_preprocess(img: Image.Image):
    img = img.resize((224,224))
    arr = tf_image.img_to_array(img)
    arr = np.expand_dims(arr, axis=0)
    arr = arr / 255.0
    return arr

# ============================================================
# API ENDPOINTS
# ============================================================

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        input_tensor = image_transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            output = image_model(input_tensor)
            pred_bin = torch.argmax(output, dim=1).item()
            pred_range = AGE_BIN_RANGES[pred_bin]
        return JSONResponse({"label": pred_range, "confidence": 0.9})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

@app.post("/predict-audio")
async def predict_audio(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        temp_path = "temp_audio.wav"
        with open(temp_path, "wb") as f: f.write(contents)
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
        inputs = tokenizer(req.text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = text_model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=1)
            pred_idx = torch.argmax(probs, dim=1).item()
        label = label_encoder.inverse_transform([pred_idx])[0]
        confidence = float(probs[0][pred_idx])
        return {"label": label, "confidence": confidence}
    except Exception as e:
        return {"error": str(e)}

# -- IRIS model endpoints --
@app.post("/predict-iris")
async def predict_iris(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_array = iris_preprocess(img)
        preds = iris_model.predict(img_array)
        class_idx = int(np.argmax(preds[0]))
        confidence = float(np.max(preds[0]))
        age_range = iris_age_bins[class_idx]
        return JSONResponse({
            "label": f"{age_range[0]}-{age_range[1]}",
            "confidence": round(confidence, 2)
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# app_text_only.py
# ==========================
# LOAD MODELS
# ==========================
TEXT_MODEL_SENTENCE_PATH = "models/sentence_model"
TEXT_MODEL_CLASSIFIER_PATH = "models/classifier_st.pkl"
TEXT_MODEL_ENCODER_PATH = "models/label_encoder_st.pkl"

embedder = SentenceTransformer(TEXT_MODEL_SENTENCE_PATH)  # SentenceTransformer model folder
clf = joblib.load(TEXT_MODEL_CLASSIFIER_PATH)              # Logistic Regression classifier
label_encoder = joblib.load(TEXT_MODEL_ENCODER_PATH)       # Age group label encoder

# ==========================
# PREDICT TEXT ENDPOINT
# ==========================
@app.post("/predict-text1")
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