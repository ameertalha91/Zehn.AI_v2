from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat/")
async def chat(question: dict):
    # For now, just return a test response
    return {
        "answer": f"Pakistan Studies response to: {question['question']}",
        "success": True
    }

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8001)