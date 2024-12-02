from langchain.llms.base import LLM
from langchain.agents import AgentExecutor, Tool, create_react_agent
from langchain.prompts import PromptTemplate
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from groq import Groq
import requests
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
        self.ticket_contract = None
        self.setup_agent()
    
    def get_user_tickets(self, user_address: str):
        try:
            tickets = self.ticket_contract.functions.getTicketsByOwner(user_address).call()
            return tickets
        except Exception as e:
            return f"Error fetching tickets: {str(e)}"

    def list_tickets_for_resale(self, user_address: str) -> str:
        tickets = self.get_user_tickets(user_address)
        if not tickets:
            return "You do not own any tickets."

        ticket_list = "\n".join(
            [f"ID: {ticket['id']} | Event: {ticket['event']} | Date: {ticket['date']} | Price: {ticket['price']}" for ticket in tickets]
        )
        return f"Your tickets:\n{ticket_list}"

    def set_ticket_for_resale(self, ticket_id: int, resale_price: float):
        try:
            tx = self.ticket_contract.functions.listForResale(ticket_id, resale_price).transact({"from": "user_address"})
            return f"Ticket {ticket_id} listed for resale at ${resale_price}."
        except Exception as e:
            return f"Error listing ticket: {str(e)}"

    def resell_ticket(self, ticket_id: int, resale_price: float):
        try:
            tx = self.ticket_contract.functions.resellTicket(ticket_id).transact({"value": resale_price, "from": "user_address"})
            return f"Ticket {ticket_id} successfully resold."
        except Exception as e:
            return f"Error reselling ticket: {str(e)}"

    def handle_resell_query(self, user_address: str) -> str:
        tickets = self.get_user_tickets(user_address)
        if not tickets:
            return "You do not own any tickets to resell."

        ticket_list = "\n".join(
            [f"ID: {ticket['id']} | Event: {ticket['event']} | Max Resell Price: ${(ticket['price'] * 15) / 100 + (ticket['price'])}" for ticket in tickets]
        )

        return f"Available tickets for resell:\n{ticket_list}\nWhich ticket would you like to resell?"

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
    
    def setup_agent(self):
        tools = [
            Tool(
                name="List Available Shows",
                func=self.list_available_shows,
                description="List all shows or events available in the database"
            ),
            Tool(
                name="Check Show Availability",
                func=self.check_show_availability,
                description="Check if a show is available at a specific date and time"
            ),
            Tool(
                name="Get Price",
                func=self.get_show_price,
                description="Calculate the total price for tickets"
            ),
            Tool(
                name="Generate Booking Link",
                func=self.generate_booking_link,
                description="Generate a booking link for the show"
            ), 
            Tool(
                name="List Tickets for Resale",
                func=self.list_tickets_for_resale,
                description="List all tickets owned by the user for resale."
            ),
            Tool(
                name="Set Ticket for Resale",
                func=self.set_ticket_for_resale,
                description="Set a ticket for resale at a specified price."
            ),
            Tool(
                name="Resell Ticket",
                func=self.resell_ticket,
                description="Finalize the resale of a ticket."
            )
        ]
        
        tool_names = [tool.name for tool in tools]

        prompt = PromptTemplate.from_template(
            """You are an intelligent ticket booking assistant designed to help users book movie, concert, or event tickets seamlessly.
            
            ### Your primary objectives are to:
            1. Understand the user's ticket booking request
            2. List all available shows or events
            3. Validate show availability
            4. Provide ticket pricing information
            5. Generate a direct booking link
            6. List all tickets owned by the user.
            7. Allow the user to select a ticket for resale.
            8. Provide maximum resale price based on system rules.
            9. Finalize ticket resale.
            
            ### Workflow:
            - Carefully extract show name, date, time, and number of tickets from the query.
            - List all available shows if requested.
            - Check if the show exists in our database.
            - Verify show availability for the requested date and time.
            - Calculate total ticket price.
            - Generate a booking link if all conditions are met.
            - Identify if the user wants to resell tickets.
            - Retrieve user-owned tickets.
            - Guide user to set resale price within limits.
            - Confirm resale listing and finalize the process.
            
            If any information is missing or invalid, provide clear guidance to the user.
            
            User Query: {input}
            
            ### Reasoning Steps:
            1. What specific show does the user want to book?
            2. Are all required booking details present?
            3. Can the requested show be booked at the specified time?
            4. What is the total cost?
            5. Is user reselling those particular event tickets which is present among the list of events for which user has bought tickets?
            6. What is the maximum reselling price?
            7. Is user agreeing with the maximum price at which the tickets are available for reselling?

            ### Tools: {tools}
            ### Tool Names: {tool_names}
            ### Agent Scratchpad: {agent_scratchpad}
            
            {agent_scratchpad}
            """
        ).partial(
            tools=str(tools),  
            tool_names=tool_names,
            agent_scratchpad="" 
        )

        self.agent = create_react_agent(llm=self.llm, tools=tools, prompt=prompt)
        self.agent_executor = AgentExecutor(agent=self.agent, tools=tools, verbose=True)

    def process_query(self, user_query: str) -> str:
        try:
            response = self.agent_executor.invoke({"input": user_query})
            return response["output"]
        except Exception as e:
            return f"Error: {str(e)}"
        
    def process_reselling(self, user_query: str, user_address: str) -> str:
        try:
            if "resell tickets" in user_query.lower():
                return self.handle_resell_query(user_address)
            else:
                return self.agent_executor.invoke({"input": user_query})["output"]
        except Exception as e:
            return f"Error: {str(e)}"