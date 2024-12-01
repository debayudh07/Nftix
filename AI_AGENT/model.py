from langchain.llms.base import LLM
from langchain.agents import AgentExecutor, Tool, create_react_agent
from langchain.prompts import PromptTemplate
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from groq import Groq
import os
import dotenv

dotenv.load_dotenv()

# Custom Groq LLM Wrapper
class GroqLLM(LLM):
    client: Groq = Field(default_factory=lambda: Groq(api_key=os.getenv("GROQ_API_KEY")))
    model_name: str = "llama-3.1-70b-versatile"
    temperature: float = 0.1
    max_tokens: int = 2000

    class Config:
        arbitrary_types_allowed = True

    @property
    def _llm_type(self) -> str:
        return "groq"

    def _call(self, prompt: str, stop: Optional[List[str]] = None, **kwargs: Any) -> str:
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
    

# Define BookingDetails Schema
class BookingDetails(BaseModel):
    show_name: str = Field(description="Name of the movie")
    date: str = Field(description="Date in DD-MM-YYYY format")
    time: str = Field(description="Time in HH:MM 24-hour format")
    number_of_tickets: int = Field(description="Number of tickets requested", default=1)