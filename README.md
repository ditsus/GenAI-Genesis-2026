# REEL — Video Sanitization Pipeline

**REEL** is a full-stack application that takes a video, identifies segments that may be unsuitable for certain audiences (violence, language, romance, horror, etc.), and produces a **sanitized** version by replacing those segments with AI-generated, family-friendly clips while keeping the rest of the video intact.

The backend is built with **[Railtracks](https://github.com/RailtownAI/railtracks)** for observability and orchestration: the pipeline runs as a Railtracks **Flow** so you can inspect each run (Scan → Regen → Stitch) in the Railtracks dashboard.

---

## Table of Contents

- [What You Need (API Keys & Prerequisites)](#what-you-need-api-keys--prerequisites)
- [The Pipeline (How It Works)](#the-pipeline-how-it-works)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running the Stack](#running-the-stack)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Railtracks Observability](#railtracks-observability)
- [Troubleshooting](#troubleshooting)

---

## What You Need (API Keys & Prerequisites)

### 1. Google Cloud / Vertex AI

The pipeline uses **Google Gemini** (for analysis) and **VEO** (for video generation), and **Google Cloud Storage** for intermediate assets. You need:

| Requirement | Purpose |
|-------------|--------|
| **Google Cloud Project** | Must have Vertex AI API and (optionally) Gemini API enabled. |
| **Authentication** | [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials): either a **service account key JSON** or `gcloud auth application-default login`. |
| **GCS Bucket** | A bucket in the same project for uploading frames and storing VEO-generated clips. The backend uploads frames and writes VEO output to this bucket. |

**No separate “API key” file** is required if you use a service account JSON; the key file itself is the credential. If you use Gemini API (non–Vertex) in the future, you’d set a `GEMINI_API_KEY`-style env var; the current default uses Vertex.

**Environment variables** (see [Configuration](#configuration)):

- `GOOGLE_CLOUD_PROJECT` — Your GCP project ID.
- `GOOGLE_CLOUD_LOCATION` — e.g. `us-central1` (Vertex AI region).
- `GOOGLE_GENAI_USE_VERTEXAI` — `True` to use Vertex AI; set to `False` only if you switch to Gemini API with an API key.
- `GOOGLE_APPLICATION_CREDENTIALS` — Path to your service account JSON (if not using `gcloud auth`).
- `BUCKET_NAME` — Name of the GCS bucket used for frames and VEO outputs.

### 2. FFmpeg

**FFmpeg** must be installed and on your `PATH`. It is used to:

- Extract frames from the source video (for VEO).
- Cut the original video into “keep” segments.
- Concatenate keep segments + AI-generated clips into the final video.

Install:

- **Windows:** e.g. [ffmpeg.org](https://ffmpeg.org/download.html) or `winget install ffmpeg`.
- **macOS:** `brew install ffmpeg`.
- **Linux:** `apt install ffmpeg` / `yum install ffmpeg` (or your distro’s package).

### 3. Node.js and Python

- **Node.js** (e.g. 18+) for the Next.js frontend.
- **Python 3.10+** for the FastAPI backend (and Railtracks).

### 4. Railtracks (Optional but Recommended)

For observability, install the Railtracks CLI and run the dashboard:

```bash
pip install railtracks[cli]
railtracks init   # one-time setup
railtracks viz    # start the dashboard
```

No API key is required for the local Railtracks dashboard.

---

## The Pipeline (How It Works)

When you send a **video URL** to the backend, it runs a single **Railtracks Flow** named **REEL-Sanitization**. Each run is tied to a **job_id** (and `video_id` in context) so you can trace one user request end-to-end in the Railtracks UI.

High-level flow:

```
Video URL → Download → Scan (Gemini) → [optional] Regen (VEO) → Stitch (FFmpeg) → Output URL
```

### Step 0: Download

The backend downloads the video from the URL you provide and saves it to a temporary file. Supported formats are those accepted by the backend (e.g. MP4). Large files (e.g. >100 MB for analysis) may be rejected by the Scan step.

### Step 1: Scan (Sentinel — Gemini)

- **Input:** Video (local path or bytes), user preferences (violence, language, romance, horror, etc.), and an optional custom prompt.
- **What it does:** Sends the video to **Gemini** with a prompt that asks: “Which segments should be sanitized given these preferences?” Gemini returns a list of segments, each with:
  - `start` / `end` (seconds)
  - `target` (e.g. violence, language)
  - `replacement` (a short text prompt describing a family-friendly replacement clip).
- **Output:** A list of **sanitization segments**. If the list is empty, the pipeline skips Regen and Stitch and simply copies the original video as the “output.”

### Step 2: Regen (Forge — VEO)

- **Input:** Original video path, list of segments from Scan, job id, and paths for outputs/frames.
- **What it does:** For each segment:
  1. Uses **FFmpeg** to extract start/end frames.
  2. Uploads frames to **Google Cloud Storage**.
  3. Calls **VEO** (Vertex AI video generation) with the segment’s `replacement` prompt and frame(s).
  4. Downloads the generated clip from GCS to a local path.
- **Output:** A list of local file paths, one replacement clip per segment (in order).

### Step 3: Stitch (Assembler — FFmpeg)

- **Input:** Original video path, segments from Scan, replacement clip paths from Regen, and the desired output path.
- **What it does:**
  1. Cuts the original into “keep” segments (before, between, and after the sanitized ranges).
  2. Builds a concat list: keep₁, replacement₁, keep₂, replacement₂, … keepₙ.
  3. Uses the **FFmpeg concat demuxer** to produce a single output file.
- **Output:** Path to the final sanitized video. The backend serves it via `/processed/{job_id}.mp4`.

### Data Flow Summary

| Stage   | Input                          | Output                          |
|---------|--------------------------------|---------------------------------|
| Download| `video_url`                    | Temp file path                  |
| Scan    | Video + preferences + prompt   | `segments[]` (or empty)         |
| Regen   | Video + `segments`             | `replacement_paths[]`           |
| Stitch  | Video + `segments` + replacements | Final MP4 path              |

If **Scan** returns no segments, Regen and Stitch are skipped and the original is copied to the output path.

---

## Quick Start

1. **Clone and install**

   ```bash
   cd GenAI-Genesis-2026
   # Backend
   cd backend && pip install -r requirements.txt && cd ..
   # Frontend
   cd frontend && npm install && cd ..
   ```

2. **Configure environment**

   In `backend/`, copy `.env.example` to `.env` and set at least:

   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON)
   - `BUCKET_NAME`

   See [Configuration](#configuration) for all options.

3. **Run backend and frontend**

   **Option A — All-in-one (if you have the scripts):**

   ```bash
   # Windows
   start.bat

   # Linux/macOS
   chmod +x start.sh && ./start.sh
   ```

   **Option B — Manual:**

   Terminal 1 (backend):

   ```bash
   cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
   ```

   Terminal 2 (frontend):

   ```bash
   cd frontend && npm run dev
   ```

   Optional — Terminal 3 (Railtracks dashboard):

   ```bash
   railtracks viz
   ```

4. **Send a video URL**

   ```bash
   curl -X POST http://localhost:8000/process-video \
     -H "Content-Type: application/json" \
     -d '{"video_url": "https://example.com/some-video.mp4"}'
   ```

   You’ll get `{"job_id": "abc12345"}`. Poll status at `GET /api/jobs/abc12345` and logs at `GET /api/jobs/abc12345/logs`. When complete, the output is at `http://localhost:8000/processed/abc12345.mp4`.

---

## Configuration

### Backend (`backend/.env`)

Create `backend/.env` from `backend/.env.example`. Key variables:

| Variable | Description | Default (if any) |
|----------|-------------|------------------|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | `gen-lang-client-0326372924` |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI region | `us-central1` |
| `GOOGLE_GENAI_USE_VERTEXAI` | Use Vertex AI (True) or Gemini API | `True` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | — |
| `BUCKET_NAME` | GCS bucket for frames and VEO output | `reel-demo-videos` |
| `VIDEO_DOWNLOAD_TIMEOUT` | Max seconds to download video | `120` |
| `VEO_MAX_WAIT` | Max seconds to wait per VEO segment | `600` |
| `GEMINI_MODEL` | Model for Scan | `gemini-2.0-flash` |
| `GEMINI_FALLBACK_MODEL` | Fallback for Scan | `gemini-1.5-flash` |
| `VEO_MODEL` | Model for Regen | `veo-3.1-generate-001` |

Paths (`DATA_DIR`, `TRAILERS_DIR`, `OUTPUTS_DIR`, `PROCESSED_DIR`, `FRAMES_DIR`) default to directories under the backend root; override in `.env` if needed.

### Frontend

The frontend talks to the backend via `NEXT_PUBLIC_API_URL`. Default: `http://localhost:8000`. Set it in `.env.local` if your API runs elsewhere.

---

## Running the Stack

- **Backend:** `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
- **Frontend:** `cd frontend && npm run dev` → [http://localhost:3000](http://localhost:3000)
- **Railtracks:** `railtracks viz` → dashboard (e.g. http://localhost:3030)

Use `start.bat` (Windows) or `start.sh` (Linux/macOS) to start backend, frontend, and Railtracks in one go if those scripts are present.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check. |
| POST | `/process-video` | Start sanitization. Body: `{ "video_url": "...", "user_preferences": { ... }, "custom_prompt": "..." }`. Returns `{ "job_id": "..." }`. |
| GET | `/api/jobs/{job_id}` | Job status: `status`, `progress`, `output_path`, `error`. |
| GET | `/api/jobs/{job_id}/logs` | Log lines for the job. |
| GET | `/api/trailers` | List trailers (from `data/timestamps.json`). |
| GET | `/processed/{job_id}.mp4` | Download the sanitized video when the job is complete. |

---

## Project Structure

```
GenAI-Genesis-2026/
├── backend/
│   ├── main.py           # FastAPI app, Railtracks Flow, /process-video
│   ├── config.py         # Settings from env
│   ├── jobs.py           # In-memory job store
│   ├── models.py         # Pydantic models (ProcessVideoRequest, etc.)
│   ├── requirements.txt
│   ├── .env.example
│   ├── data/             # timestamps.json for trailers
│   ├── services/
│   │   ├── sentinel.py   # Scan (Gemini)
│   │   ├── forge.py      # Regen (VEO + GCS)
│   │   └── assembler.py  # Stitch (FFmpeg)
│   ├── trailers/         # Static trailer assets
│   ├── outputs/          # Per-job VEO clips
│   ├── processed/        # Final sanitized videos
│   └── frames/           # Extracted frames
├── frontend/              # Next.js app (dashboard, watch page)
├── start.sh / start.bat   # Run backend + frontend + railtracks viz
└── README.md
```

---

## Railtracks Observability

The pipeline is implemented as a **Railtracks Flow** named **REEL-Sanitization** with three **function_node** tasks:

1. **Scan** — Gemini analysis.
2. **Regen** — VEO generation per segment.
3. **Stitch** — FFmpeg concatenation.

Each `/process-video` request runs this flow in a background task. The flow context includes **video_id** (the job_id), so in **railtracks viz** you can:

- See each run under the REEL-Sanitization flow.
- Inspect the sequence Scan → Regen → Stitch and their inputs/outputs.
- Correlate a run with a specific job via `video_id`.

No API key is required for the local Railtracks dashboard.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| “Permission denied” / 403 from Google | `GOOGLE_APPLICATION_CREDENTIALS` and service account roles (Vertex AI User, Storage Object Admin or similar). |
| “Bucket not found” | `BUCKET_NAME` exists in the same project and the service account has access. |
| “FFmpeg not found” | FFmpeg is on your `PATH`; run `ffmpeg -version`. |
| Scan returns no segments | Video may be clean for the chosen preferences, or Gemini may be conservative. Try a video with obvious content and check the prompt in `services/sentinel.py`. |
| VEO timeout | Increase `VEO_MAX_WAIT` in `.env`; VEO can be slow for long segments. |
| Railtracks viz not showing runs | Ensure the backend is running and you’ve triggered at least one `POST /process-video`; runs appear when the Flow executes. |

---

## License & Credits

- **Built with [Railtracks](https://github.com/RailtownAI/railtracks)** for observability and orchestration.
- Backend: FastAPI, Google Gemini, VEO, FFmpeg.
- Frontend: Next.js.
