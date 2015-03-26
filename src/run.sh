#!/usr/bin/env bash
gunicorn app:app -p infoviz.pid -b 127.0.0.1:5000 -D
