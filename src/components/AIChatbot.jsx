// src/components/AIChatbot.jsx
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm LocalHostel AI Assistant. How can I help you today? Ask me anything about hostels, booking, facilities, prices, or locations.",
      isBot: true
    }
  ]);
  const [input, setInput] = useState('');

  const getBotReply = (userInput) => {
    const msg = userInput.toLowerCase().trim();

    // Greetings
    if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
      return "Hello! Welcome to LocalHostel. How can I help you find the perfect hostel today?";
    }

    // Booking Process
    if (msg.includes("book") || msg.includes("booking") || msg.includes("how to book")) {
      return "To book a hostel: 1. Login or Register → 2. Browse hostels → 3. Select room type and check-in date → 4. Click 'Book a Seat Now'. Your request will be sent to the owner for approval.";
    }

    // Price & Cost
    if (msg.includes("price") || msg.includes("cost") || msg.includes("fee") || msg.includes("charge") || msg.includes("rent")) {
      return "Hostel prices typically range from ₹4,000 to ₹8,500 per month. Single rooms are more expensive, while triple sharing is cheaper. Food and WiFi may be included or charged extra depending on the hostel.";
    }

    // Facilities & Amenities
    if (msg.includes("facility") || msg.includes("amenity") || msg.includes("what is included") || msg.includes("provide")) {
      return "Most hostels offer Free WiFi, Mess Food, Laundry Service, 24/7 Security, Power Backup, Study Room, and CCTV. Some premium hostels also provide AC rooms and RO water.";
    }

    // Location
    if (msg.includes("location") || msg.includes("where") || msg.includes("near") || msg.includes("city")) {
      return "We have hostels in Vijayawada, Guntur, Rajahmundry, Kakinada, Eluru, Bhimavaram, and other major educational cities in Andhra Pradesh. You can filter by city on the homepage.";
    }

    // Availability
    if (msg.includes("available") || msg.includes("vacant") || msg.includes("seat left") || msg.includes("empty")) {
      return "Seat availability is shown in real-time on each hostel page. You can check current vacancies by selecting a room type.";
    }

    // Status & Confirmation
    if (msg.includes("confirmed") || msg.includes("status") || msg.includes("approved") || msg.includes("rejected")) {
      return "Once the owner accepts your booking request, the status changes to 'Confirmed' in your Profile. You will also receive an email notification.";
    }

    // Owner Related
    if (msg.includes("owner") || msg.includes("become owner") || msg.includes("register as owner")) {
      return "If you are a hostel owner, register by selecting 'Owner' role during signup. After login, you can add your hostel, manage bookings, and receive notifications.";
    }

    // Safety & Rules
    if (msg.includes("safe") || msg.includes("safety") || msg.includes("girls") || msg.includes("security") || msg.includes("rule")) {
      return "All listed hostels have 24/7 security and CCTV. Girls' hostels have separate entry rules. You can check specific hostel rules on the details page.";
    }

    // Registration & Login
    if (msg.includes("register") || msg.includes("signup") || msg.includes("login") || msg.includes("forgot password")) {
      return "Click on 'Register' to create an account. Choose your role (Student or Owner). If you already have an account, use the Login button.";
    }

    // Cancellation & Refund
    if (msg.includes("cancel") || msg.includes("refund") || msg.includes("return")) {
      return "You can cancel a pending booking from your Profile. Once approved by the owner, cancellation depends on the hostel's policy.";
    }

    // Comparison & Best Hostel
    if (msg.includes("best") || msg.includes("compare") || msg.includes("which is better")) {
      return "The best hostel depends on your budget, location preference, and required facilities. You can compare hostels using filters on the Hostels page.";
    }

    // Payment & Advance
    if (msg.includes("payment") || msg.includes("advance") || msg.includes("deposit")) {
      return "Currently, booking is free. You pay directly to the owner after approval. Some hostels may ask for a security deposit.";
    }

    // Rare / Specific Questions
    if (msg.includes("co-ed") || msg.includes("mixed")) {
      return "Yes, we have some co-ed hostels. You can filter by 'Co-ed' type while searching.";
    }
    if (msg.includes("ac") || msg.includes("air conditioner")) {
      return "Some premium hostels offer AC rooms. You can filter hostels with AC facility on the search page.";
    }
    if (msg.includes("food") || msg.includes("mess") || msg.includes("veg") || msg.includes("non-veg")) {
      return "Most hostels provide mess food (Veg/Non-Veg options). You can check the facilities section of each hostel.";
    }
    if (msg.includes("distance") || msg.includes("near college") || msg.includes("walking")) {
      return "You can check the location and approximate distance from your college on the hostel details page.";
    }

    // Default / Helpful Reply
    return "I'm here to help! You can ask me about booking process, prices, facilities, locations, safety, or anything related to hostels. What would you like to know?";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isBot: false }]);

    const botReply = getBotReply(input);

    setTimeout(() => {
      setMessages(prev => [...prev, { text: botReply, isBot: true }]);
    }, 700);

    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00b894, #009b85)',
          color: 'white',
          border: 'none',
          boxShadow: '0 6px 20px rgba(0,184,148,0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Chat with LocalHostel AI"
      >
        <MessageCircle size={32} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '25px',
          width: 'min(90vw, 400px)',
          height: 'min(80vh, 520px)',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #00b894, #009b85)',
            color: 'white',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            LocalHostel AI Assistant
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: '15px',
                textAlign: msg.isBot ? 'left' : 'right'
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '12px 16px',
                  borderRadius: msg.isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                  background: msg.isBot ? '#e3f2fd' : '#00b894',
                  color: msg.isBot ? '#1e3a8a' : 'white',
                  maxWidth: '85%'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: '15px', borderTop: '1px solid #eee', background: 'white' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything about hostels..."
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  border: '1px solid #ddd',
                  borderRadius: '30px',
                  outline: 'none'
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: '14px 24px',
                  background: '#00b894',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;