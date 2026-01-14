#!/usr/bin/env python3
import argparse
import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from scenario.realtime_bridge import relay_server


def main() -> None:
    parser = argparse.ArgumentParser(description="Realtime WS relay for PCM16 E2E tests.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8001)
    args = parser.parse_args()

    load_dotenv()
    if not os.getenv("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is required")

    asyncio.run(relay_server(args.host, args.port))


if __name__ == "__main__":
    main()
