# Spills – Monorepo

A full-stack, TypeScript-first implementation of a **“round-up” savings feature** for bank customers.

This repository contains:
- a **React + Vite client**
- a **secure Express proxy server** for the Starling Bank public API
- a **full observability stack** (logs, traces, metrics)

The backend is designed as a production-style API gateway with strong typing, structured logging, tracing, and token lifecycle management.

---

## Project Structure

```sh
├── client/                 # React + Vite frontend
│   └── README.md           # Client-specific setup & docs
├── server/                 # Express + TypeScript backend proxy
│   └── README.md           # Server-specific setup, observability & API docs
└── README.md               # (this file)
