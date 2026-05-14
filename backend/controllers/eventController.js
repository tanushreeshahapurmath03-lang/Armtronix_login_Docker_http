// controllers/eventController.js
const Event = require('../models/Event');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addOrUpdateEvent = async (req, res) => {
  const { date, event } = req.body;
  try {
    let record = await Event.findOne({ date });
    if (record) {
      if (!record.events.includes(event)) {
        record.events.push(event);
        await record.save();
      }
    } else {
      record = new Event({ date, events: [event] });
      await record.save();
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// exports.deleteEvent = async (req, res) => {
//   const { date, event } = req.body;
//   try {
//     const result = await Event.updateOne(
//       { date },
//       { $pull: { events: event } }
//     );

//     if (result.modifiedCount === 0) {
//       return res.status(404).json({ message: 'Event not found or already removed' });
//     }

//     // Optionally, remove the entire document if events array becomes empty
//     const updatedDoc = await Event.findOne({ date });
//     if (updatedDoc && updatedDoc.events.length === 0) {
//       await Event.deleteOne({ date });
//     }

//     res.json({ success: true, message: 'Event deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.deleteEvent = async (req, res) => {
  const { date, event } = req.body;
  
  try {
    // First, try to pull the event from the events array
    const result = await Event.updateOne(
      { date },
      { $pull: { events: event } }
    );

    // If no modification happened, the event wasn't found
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Event not found or already removed' });
    }

    // After pulling the event, check if the events array is empty
    const updatedDoc = await Event.findOne({ date });
    if (updatedDoc && updatedDoc.events.length === 0) {
      // If the array is empty, delete the whole document
      await Event.deleteOne({ date });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    // If an error occurs, send a 500 response with the error message
    res.status(500).json({ success: false, message: error.message });
  }
};
