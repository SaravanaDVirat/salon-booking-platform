const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Salon = require("./models/Salon");
const User = require("./models/User");

dotenv.config();

const syncSalonOwners = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const salons = await Salon.find({
      owner: { $ne: null }
    });

    console.log(
      `Found ${salons.length} salons`
    );

    let updated = 0;
    let skipped = 0;

    for (const salon of salons) {

      const owner = await User.findById(
        salon.owner
      );

      if (!owner) {
        console.log(
          `Owner not found for salon: ${salon.name}`
        );

        skipped++;
        continue;
      }

      if (owner.role !== "SALON_OWNER") {
        console.log(
          `Skipping ${salon.name} - owner is not SALON_OWNER`
        );

        skipped++;
        continue;
      }

      owner.salon = salon._id;

      await owner.save();

      console.log(
        `Assigned "${salon.name}" → ${owner.name}`
      );

      updated++;
    }

    console.log("--------------------------------");
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log("--------------------------------");

    await mongoose.connection.close();

    console.log("MongoDB connection closed");

  } catch (error) {
    console.error(
      "Sync salon owners error:",
      error
    );

    process.exit(1);
  }
};

syncSalonOwners();