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


# Main Ticket Booking Agent
class TicketBookingAgent:
    def __init__(self):
        self.llm = GroqLLM()
        self.shows_db = {
            "interstellar": {
                "type": "movie",
                "showtimes": {
                    "2024-12-02": ["11:00", "14:00", "16:00", "19:30"],
                },
                "booking_url": "https://yourapp.com/movies/interstellar",
                "price": 150.00,
            }
        }
        self.setup_agent()

    def list_available_shows(self) -> str:
        if not self.shows_db:
            return "No shows are currently available."
        
        shows_list = []
        for show_name, show_info in self.shows_db.items():
            show_details = f"{show_name.title()} ({show_info['type']})"
            shows_list.append(show_details)
        
        return "Available shows or events:\n" + "\n".join(shows_list)
    
    def check_show_availability(self, show_name: str, date: str, time: str) -> str:
        show_name = show_name.lower()
        if show_name not in self.shows_db:
            return f"Show '{show_name}' not found in our database."
        
        show_info = self.shows_db[show_name]
        if date not in show_info["showtimes"]:
            return f"No shows available on {date}."
        
        if time not in show_info["showtimes"][date]:
            available_times = ", ".join(show_info["showtimes"][date])
            return f"Show not available at {time}. Available times: {available_times}."
        
        return f"Show is available at {time} on {date}."
    
    def get_show_price(self, show_name: str, number_of_tickets: int = 1) -> str:
        show_name = show_name.lower()
        if show_name not in self.shows_db:
            return f"Show '{show_name}' not found in our database."
        
        price = self.shows_db[show_name]["price"] * number_of_tickets
        return f"Total price for {number_of_tickets} ticket(s): ${price:.2f}"
    
    def generate_booking_link(self, show_name: str, date: str, time: str, number_of_tickets: int = 1) -> str:
        show_name = show_name.lower()
        if show_name not in self.shows_db:
            return f"Cannot generate booking link: Show '{show_name}' not found."
        
        show_info = self.shows_db[show_name]
        if date not in show_info["showtimes"] or time not in show_info["showtimes"][date]:
            return "Cannot generate booking link: Show not available at specified date/time."
        
        booking_url = (f"{show_info['booking_url']}?date={date}&time={time}&tickets={number_of_tickets}")
        return booking_url