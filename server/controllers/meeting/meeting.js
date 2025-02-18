const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

const add = async (req, res) => {
  try {
    req.body.createdDate = new Date();
    const meeting = new MeetingHistory(req.body);
    await meeting.save();
    res.status(200).json(meeting);
  } catch (err) {
    console.error('Failed to create Lead:', err);
    res.status(400).json({ error: 'Failed to create Lead' });
  }
};

const index = async (req, res) => {
  const query = req.query;
  query.deleted = false;

  let allData = await MeetingHistory.find(query).populate({
    path: 'createBy',
    match: { deleted: false } // Populate only if createBy.deleted is false
  }).exec();

  const result = allData.filter(item => item.createBy !== null);
  res.send(result);
};

const view = async (req, res) => {
  try {
    let result = await MeetingHistory.findOne({ _id: req.params.id });
    if (!result) return res.status(404).json({ message: "no Data Found." });

    res.status(200).json(result);
  } catch (err) {
    console.error('Failed :', err);
    res.status(400).json({ err, error: 'Failed ' });
  }
};

const deleteData = async (req, res) => {
  try {
    const meeting = await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true });
    res.status(200).json({ message: "done", meeting });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const deleteMany = async (req, res) => {
  try {
    const result = await MeetingHistory.updateMany(
      { _id: { $in: req.body } },
      { $set: { deleted: true } }
    );

    if (result?.matchedCount > 0 && result?.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "MeetingHistory Removed successfully", result });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Failed to remove MeetingHistory" });
    }
  } catch (err) {
    return res.status(404).json({ success: false, message: "error", err });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };