const mongoose = require("../mongo");

const MenuScheduleSchema = new mongoose.Schema({
    schedule_name: String, // e.g., "Breakfast Menu", "Late Night Menu"
    start_time: String, // "06:00"
    end_time: String, // "11:00"
    days_of_week: [Number], // 0=Sun, 1=Mon, ..., 6=Sat
    categories_included: [String], // ["Breakfast", "Beverages"]
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MenuSchedule", MenuScheduleSchema);
