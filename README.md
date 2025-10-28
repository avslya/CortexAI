# Cortex AI

> AI-Powered Data Analytics Platform with Intelligent Agents

## Overview

Cortex AI is an open-source platform that combines AI agents with advanced data analytics capabilities. It enables natural language querying of databases, automated SQL generation, and intelligent business insights through a semantic layer architecture.

## Core Features

### 🤖 AI Agent System
- **Natural Language Interface**: Query databases using plain language
- **Intelligent SQL Generation**: Automatic conversion of questions to optimized SQL queries
- **Multi-Model Support**: Compatible with OpenAI, Anthropic, Google, Azure, AWS Bedrock, and more
- **Context-Aware Responses**: Agents understand your data schema and business context

### 📊 Data Analytics Platform
- **Multi-Source Connectivity**: Connect to PostgreSQL, MySQL, BigQuery, Snowflake, Redshift, and more
- **Real-Time Analytics**: Generate charts, summaries, and insights on demand
- **Semantic Layer**: MDL (Metric Definition Language) ensures consistent metrics across queries
- **Automated Insights**: AI-generated summaries and recommendations

## Architecture

Cortex AI consists of several key components:

- **AI Service**: Core intelligence engine powered by LLMs
- **UI Service**: Web-based interface for data exploration
- **Engine**: Query processing and execution layer
- **Semantic Layer**: Metadata and relationship management

## Getting Started

### Prerequisites
- Docker and Docker Compose
- API keys for your chosen LLM provider

### Quick Start

1. Clone the repository
2. Navigate to the `docker` directory
3. Configure your environment variables
4. Run `docker-compose up`

The platform will be available at `http://localhost:3000`


## Supported Data Sources

- Amazon Athena (Trino)
- Amazon Redshift
- Google BigQuery
- DuckDB
- PostgreSQL
- MySQL
- Microsoft SQL Server
- ClickHouse
- Oracle Database
- Trino
- Snowflake

## Supported LLM Providers

Cortex AI integrates with multiple AI providers:

- **OpenAI** (GPT-4, GPT-3.5)
- **Azure OpenAI**
- **Anthropic** (Claude models)
- **Google** (Gemini via AI Studio and Vertex AI)
- **AWS Bedrock** (Multiple model providers)
- **DeepSeek**
- **Groq**
- **Ollama** (Local deployment)
- **Databricks**

> **Note**: Performance depends on the LLM capabilities. We recommend using the most advanced models available for optimal results.

## Project Structure

```
cortex-ai/
├── cortex-ai-service/    # AI agent engine and processing
├── cortex-ui/            # Web interface
├── cortex-engine/        # Query execution engine
├── cortex-launcher/      # Deployment utilities
├── cortex-mdl/           # Semantic layer schema
├── docker/             # Docker configurations
└── deployment/         # Kubernetes deployments
```

## Development

### Configuration

Configuration files can be customized for different LLM providers and deployment scenarios. See `cortex-ai-service/docs/config_examples/` for examples.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the terms specified in the LICENSE file.
