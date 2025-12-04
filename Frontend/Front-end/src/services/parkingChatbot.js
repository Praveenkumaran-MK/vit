// File: src/services/parkingChatbot.js
// Chatbot service tuned for PostgreSQL database (NO firebase, NO rating, NO slot grid)

class ParkingChatbot {
  constructor(backendUrl = "http://localhost:3000") {
    this.backendUrl = backendUrl;
  }

  // ---------------------------
  // 1. Parse the user message
  // ---------------------------
  parseUserMessage(message) {
    const parsed = {
      location: null,
      date: null,
      startTime: null,
      endTime: null,
    };

    // Extract common locations (Indian cities + major areas)
    const locationPatterns = [
      /(?:in|at|near|around)\s+([a-zA-Z\s]+)/i,
      /(bengaluru|bangalore|mumbai|delhi|chennai|hyderabad|pune|kolkata)/gi,
      /(electronic city|koramangala|indiranagar|airport|bus stand|railway station)/gi,
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        parsed.location = match[1] || match[0];
        break;
      }
    }

    // Extract time range
    const timeMatch = message.match(
      /from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
    );
    if (timeMatch) {
      parsed.startTime = timeMatch[1];
      parsed.endTime = timeMatch[2];
    }

    // Extract date
    const dateMatch =
      message.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/) ||
      message.match(/\b(today|tomorrow)\b/i);

    if (dateMatch) parsed.date = dateMatch[1];

    return parsed;
  }

  // ---------------------------
  // 2. Search parking spaces (PostgreSQL)
  // ---------------------------
  async searchParkingSpaces(location) {
    try {
      const response = await fetch(`${this.backendUrl}/v1/display_areas`);
      const data = await response.json();

      // Filter by name/address/city
      const filtered = data.filter((spot) => {
        const loc = location.toLowerCase();
        return (
          spot.name?.toLowerCase().includes(loc) ||
          spot.address?.toLowerCase().includes(loc) ||
          spot.city?.toLowerCase().includes(loc)
        );
      });

      return {
        success: true,
        count: filtered.length,
        data: filtered,
      };
    } catch (error) {
      console.error("Chatbot search error:", error);
      return {
        success: false,
        message:
          "I couldn't connect to the parking service. Please try again later.",
      };
    }
  }

  // ---------------------------
  // 3. Format results for chat UI
  // ---------------------------
  formatParkingResults(results) {
    if (!results.success || !results.data || results.data.length === 0) {
      return (
        "❌ **No parking spaces found.**\n\n" +
        "Try phrases like:\n" +
        "• *Parking in Electronic City*\n" +
        "• *Find parking near Koramangala*\n" +
        "• *Parking in Chennai*"
      );
    }

    let msg = `🅿️ **Found ${results.count} parking area${
      results.count > 1 ? "s" : ""
    }:**\n\n`;

    results.data.slice(0, 3).forEach((spot, i) => {
      msg += `**${i + 1}. ${spot.name}**\n`;
      msg += `📍 ${spot.address}\n`;
      msg += `💰 ₹${spot.amount} per hour\n`;
      msg += `🚗 Total Slots: ${spot.totalslots}\n`;
      msg += `🖼 Image: ${spot.image ? "Available" : "Not Provided"}\n\n`;
    });

    if (results.data.length > 3) {
      msg += `...and **${results.count - 3} more**.\n\n`;
    }

    msg += `🔗 **You can tap a parking card above to book instantly!**`;

    return msg;
  }

  // ---------------------------
  // 4. Main handler
  // ---------------------------
  async handleUserMessage(message) {
    const clean = message.toLowerCase();

    // Greetings
    if (this.isGreeting(clean)) {
      return (
        "👋 **Hello! I'm Parky, your parking assistant!**\n\n" +
        "Tell me where you need a parking spot.\n\n" +
        "**Try:**\n" +
        "• *Find parking in Electronic City*\n" +
        "• *Parking near Koramangala*\n"
      );
    }

    // Parking requests
    if (this.isParkingQuery(clean)) {
      const parsed = this.parseUserMessage(message);

      if (!parsed.location) {
        return (
          "🔍 Tell me where you need parking.\n\n" +
          "**Example:**\n• *Find parking in Chennai*\n• *Parking near Airport*"
        );
      }

      const results = await this.searchParkingSpaces(parsed.location);
      return this.formatParkingResults(results);
    }

    // Booking confirmation
    if (clean.includes("book") && clean.includes("yes")) {
      return (
        "🚗 **Great!**\n\n" +
        "Select a parking card from above → choose time → pay → get your QR ticket instantly!"
      );
    }

    // Help
    if (clean.includes("help")) {
      return (
        "🤖 **I can help you find and book parking!**\n\n" +
        "Try:\n" +
        "• *Find parking in Delhi*\n" +
        "• *Parking near Bus Stand*\n" +
        "• *Show parking options in Chennai*"
      );
    }

    // Default fallback
    return (
      "🤔 I didn't understand that.\n\n" +
      "Tell me where you need parking.\n\n" +
      "**Example:** *Parking in Koramangala*"
    );
  }

  // ---------------------------
  // Helper
  // ---------------------------
  isParkingQuery(message) {
    const keys = ["parking", "park", "spot", "find", "near", "book", "reserve"];
    return keys.some((k) => message.includes(k));
  }

  isGreeting(msg) {
    const g = ["hi", "hello", "hey", "good morning", "good evening"];
    return g.some((x) => msg.includes(x));
  }
}

export default ParkingChatbot;
