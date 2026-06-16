# Multi-Agent Research Pipeline

This project is a simple multi-agent research workflow built with LangChain. It takes a topic, searches the web for recent information, scrapes a relevant source, writes a structured report, and then critiques that report.

## What It Does

The pipeline in [pipeline.py](/d:/learn_ml/Gen%20ai/Multi_Agent/pipeline.py) runs four stages:

1. Search agent finds recent and relevant web results.
2. Reader agent chooses a promising URL and scrapes its content.
3. Writer chain turns the gathered research into a structured report.
4. Critic chain reviews the report and gives feedback.

## Project Structure

- [agents.py](/d:/learn_ml/Gen%20ai/Multi_Agent/agents.py): LLM setup, search/reader agents, writer chain, critic chain.
- [tools.py](/d:/learn_ml/Gen%20ai/Multi_Agent/tools.py): Tavily search tool and URL scraping tool.
- [pipeline.py](/d:/learn_ml/Gen%20ai/Multi_Agent/pipeline.py): End-to-end execution flow.
- [requirements.txt](/d:/learn_ml/Gen%20ai/Multi_Agent/requirements.txt): Python dependencies.

## How It Works

The code uses:

- `TavilyClient` for web search
- `requests` + `BeautifulSoup` for scraping page text
- `ChatMistralAI` as the LLM
- LangChain agents/tools for orchestration

The default model configured in [agents.py](/d:/learn_ml/Gen%20ai/Multi_Agent/agents.py) is `mistral-small` with `temperature=0`.

## Setup

### 1. Create and activate a virtual environment

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
pip install langchain-mistralai
```

Note: the code imports `langchain_mistralai.ChatMistralAI`, but `langchain-mistralai` is not currently listed in [requirements.txt](/d:/learn_ml/Gen%20ai/Multi_Agent/requirements.txt).

### 3. Create a `.env` file

Add the required API keys:

```env
TAVILY_API_KEY=your_tavily_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

## Run

```powershell
python pipeline.py
```

Then enter a research topic when prompted.

## Example Flow

If you enter a topic such as `latest trends in multi-agent AI systems`, the pipeline will:

- search the web for relevant results
- scrape one selected resource
- generate a report with introduction, findings, conclusion, and sources
- generate a critique with a score and improvement suggestions

## Output

The script prints intermediate progress and returns a Python `dict` with:

- `search_results`
- `scraped_content`
- `report`
- `feedback`

## Current Limitations

- The reader agent is prompted to choose a URL from search results, but agent behavior depends on the model following that instruction correctly.
- Scraped content is truncated to the first 3000 characters.
- Search results shown to the reader are truncated to the first 800 characters.
- There is minimal error handling beyond the scraper fallback message.
- The project currently runs as a CLI script only.

## Possible Improvements

- Add `langchain-mistralai` to `requirements.txt`
- Save reports to Markdown or JSON files
- Support scraping multiple URLs instead of one
- Add retries and validation around agent outputs
- Add tests for tools and pipeline behavior
- Replace `print` statements with structured logging

## Requirements

- Python 3.10+
- Tavily API key
- Mistral API key

