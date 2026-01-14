#!/usr/bin/env python3
import argparse
import asyncio
import base64
import json
import os
import sys
import wave
from io import BytesIO
from pathlib import Path

import websockets
from dotenv import load_dotenv
from openai import OpenAI

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from scenario.realtime_bridge import relay_server


def pcm16_bytes_from_wav(path: Path) -> tuple[bytes, int]:
    with wave.open(str(path), "rb") as wav:
        if wav.getsampwidth() != 2:
            raise ValueError("WAV must be 16-bit PCM")
        if wav.getnchannels() != 1:
            raise ValueError("WAV must be mono")
        return wav.readframes(wav.getnframes()), wav.getframerate()


def generate_tts_pcm16(text: str) -> tuple[bytes, int]:
    client = OpenAI()
    response = client.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input=text,
        response_format="wav",
    )
    wav_bytes = response.read()
    if not wav_bytes:
        raise SystemExit("TTS returned empty audio.")
    with wave.open(BytesIO(wav_bytes), "rb") as wav:
        if wav.getsampwidth() != 2:
            raise SystemExit("TTS WAV must be 16-bit PCM.")
        if wav.getnchannels() != 1:
            raise SystemExit("TTS WAV must be mono.")
        audio_bytes = wav.readframes(wav.getnframes())
        sample_rate = wav.getframerate()
    return audio_bytes, sample_rate


async def run_client(
    ws_url: str,
    audio_bytes: bytes,
    chunk_ms: int,
    sample_rate: int,
    manual_commit: bool,
) -> None:
    chunk_size = int(sample_rate * (chunk_ms / 1000.0) * 2)
    got_transcript = False
    got_audio = False
    if not audio_bytes:
        raise SystemExit("Generated audio is empty.")
    print(f"Generated audio bytes: {len(audio_bytes)}")

    async with websockets.connect(ws_url) as ws:
        ready = False
        while not ready:
            message = await ws.recv()
            payload = json.loads(message)
            if payload.get("type") == "ready":
                ready = True
            if payload.get("type") == "error":
                raise SystemExit(payload.get("message", "Realtime connection failed"))

        for offset in range(0, len(audio_bytes), chunk_size):
            chunk = audio_bytes[offset : offset + chunk_size]
            payload = {
                "type": "input_audio_chunk",
                "audio": base64.b64encode(chunk).decode("ascii"),
                "sample_rate": sample_rate,
            }
            await ws.send(json.dumps(payload))
            await asyncio.sleep(chunk_ms / 1000.0)

        if not manual_commit:
            silence_ms = 300
            silence_bytes = b"\x00" * int(sample_rate * (silence_ms / 1000.0) * 2)
            silence_payload = {
                "type": "input_audio_chunk",
                "audio": base64.b64encode(silence_bytes).decode("ascii"),
                "sample_rate": sample_rate,
            }
            await ws.send(json.dumps(silence_payload))
            await asyncio.sleep(silence_ms / 1000.0)

        if manual_commit:
            await ws.send(json.dumps({"type": "input_audio_commit"}))

        timeout = asyncio.get_running_loop().time() + 30
        while asyncio.get_running_loop().time() < timeout:
            try:
                message = await asyncio.wait_for(ws.recv(), timeout=2)
            except asyncio.TimeoutError:
                continue
            payload = json.loads(message)
            event_type = payload.get("type")
            if event_type == "input_audio.transcript":
                got_transcript = True
                print(f"Transcript: {payload.get('transcript')}")
            if event_type == "response.audio.delta":
                got_audio = True
            if got_transcript and got_audio:
                break

    if not got_transcript:
        raise SystemExit("No transcript received from Realtime.")
    if not got_audio:
        raise SystemExit("No audio response received from Realtime.")


async def main_async(args) -> None:
    stop_event = asyncio.Event()
    server_task = asyncio.create_task(relay_server(args.host, args.port, stop_event))
    await asyncio.sleep(0.2)

    try:
        if args.audio_file:
            audio_bytes, file_rate = pcm16_bytes_from_wav(Path(args.audio_file))
        else:
            audio_bytes, file_rate = generate_tts_pcm16(args.tts_text)
        sample_rate = args.sample_rate or file_rate
        await run_client(args.ws_url, audio_bytes, args.chunk_ms, sample_rate, args.manual_commit)
        print("E2E realtime test passed.")
    finally:
        stop_event.set()
        await asyncio.sleep(0.2)
        server_task.cancel()


def main() -> None:
    parser = argparse.ArgumentParser(description="Python-only E2E test for Realtime + STT + scenario.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8002)
    parser.add_argument("--ws-url", default="ws://127.0.0.1:8002")
    parser.add_argument("--sample-rate", type=int, default=0)
    parser.add_argument("--chunk-ms", type=int, default=100)
    parser.add_argument("--audio-file", default="")
    parser.add_argument("--tts-text", default="I am at a cafe and want to order coffee.")
    parser.add_argument("--manual-commit", action="store_true")
    args = parser.parse_args()

    load_dotenv()
    if not os.getenv("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is required")

    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
