# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Architecture

This is a React + TypeScript + Vite application that displays real-time Ethereum transaction feeds from the EthFollow protocol.

### Core Components

- **App.tsx** - Root component with context providers
- **Feed.tsx** - Main component that manages WebSocket connection and displays transaction list
- **Card.tsx** - Individual transaction card component with smart link behavior for normal/analytics modes
- **Modal.tsx** - Reusable modal component with backdrop, escape key handling, and scroll prevention

### Key Features

- **WebSocket Integration**: Connects to EthFollow Feed v2 service for real-time transaction streaming
- **Multi-chain Support**: Handles transactions from Ethereum, Optimism, Polygon, Base, Arbitrum, and other chains
- **EFP Integration**: Links to EFP (Ethereum Follow Protocol) profiles and supports EFP list streaming
- **Transaction Parsing**: Displays human-readable summaries, parsed logs, and method calls
- **Chain Explorers**: Generates links to appropriate block explorers (Etherscan, Polygonscan, etc.)

### WebSocket Modes

The application supports the EthFollow Feed v2 WebSocket API with three modes:
- **EFP Mode**: `?list={listId}` - Stream transactions for addresses in an EFP list
- **Legacy Mode**: `?stream=addr:{address}` - Stream transactions for a single address  
- **Multiplex Mode**: `?mode=multiplex` - Advanced filtering with custom address lists

### Environment Variables

- `VITE_SOCKET_URL` - WebSocket server URL for the feed service
- `VITE_ANALYTICS_URL` - Base URL for analytics HTTP API (defaults to http://localhost:8080/analytics)

### TypeScript Types

- **TxRecord** - Main transaction record interface
- **ParsedLog** - Parsed log event interface

The codebase follows standard React patterns with hooks for state management and effects for WebSocket lifecycle management.