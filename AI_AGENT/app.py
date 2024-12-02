import streamlit as st
from langchain.agents import AgentExecutor
from model import TicketBookingAgent
from typing import Optional

# Instantiate the TicketBookingAgent class
agent_system = TicketBookingAgent()

# Streamlit UI
st.title("🎫 Autonomous AI Agent System")
st.subheader("Seamless ticket booking and resale powered by AI")

# Sidebar options
st.sidebar.title("Navigation")
options = st.sidebar.radio(
    "Choose an action",
    [
        "List Available Shows",
        "Check Show Availability",
        "Get Ticket Price",
        "Generate Booking Link",
        "List Tickets for Resale",
        "Set Ticket for Resale",
        "Resell Ticket",
    ],
)

# Main panel based on selection
if options == "List Available Shows":
    if st.button("Show All Events"):
        response = agent_system.list_available_shows()
        st.text_area("Available Shows:", value=response, height=200)

elif options == "Check Show Availability":
    st.write("Check if a show is available for a specific date and time.")
    show_name = st.text_input("Enter Show Name:")
    date = st.date_input("Select Date:")
    time = st.text_input("Enter Time (HH:MM):")
    if st.button("Check Availability"):
        response = agent_system.check_show_availability(show_name, str(date), time)
        st.text_area("Availability Response:", value=response)

elif options == "Get Ticket Price":
    st.write("Get ticket price for a specific show.")
    show_name = st.text_input("Enter Show Name:")
    tickets = st.number_input("Number of Tickets:", min_value=1, step=1)
    if st.button("Get Price"):
        response = agent_system.get_show_price(show_name, tickets)
        st.text_area("Price Details:", value=response)

elif options == "Generate Booking Link":
    st.write("Generate a booking link for a show.")
    show_name = st.text_input("Enter Show Name:")
    date = st.date_input("Select Date:")
    time = st.text_input("Enter Time (HH:MM):")
    tickets = st.number_input("Number of Tickets:", min_value=1, step=1)
    if st.button("Generate Link"):
        response = agent_system.generate_booking_link(show_name, str(date), time, tickets)
        st.text_area("Booking Link:", value=response)

elif options == "List Tickets for Resale":
    st.write("List all your tickets available for resale.")
    user_address = st.text_input("Enter your user address:")
    if st.button("List Tickets"):
        response = agent_system.list_tickets_for_resale(user_address)
        st.text_area("Resale Tickets:", value=response)

elif options == "Set Ticket for Resale":
    st.write("Set a ticket for resale.")
    ticket_id = st.number_input("Enter Ticket ID:", min_value=1, step=1)
    resale_price = st.number_input("Enter Resale Price:", min_value=1.0, step=0.1)
    if st.button("Set Resale"):
        response = agent_system.set_ticket_for_resale(ticket_id, resale_price)
        st.text_area("Resale Response:", value=response)

elif options == "Resell Ticket":
    st.write("Finalize a ticket resale.")
    ticket_id = st.number_input("Enter Ticket ID:", min_value=1, step=1)
    resale_price = st.number_input("Enter Resale Price:", min_value=1.0, step=0.1)
    if st.button("Resell Ticket"):
        response = agent_system.resell_ticket(ticket_id, resale_price)
        st.text_area("Resell Response:", value=response)

# Footer
st.markdown("---")
st.caption("Powered by Groq LLM and LangChain. Built with Streamlit.")