export const SingleRecordOperation = async (action, Schema, data, dependency = []) => {
  try {
    const response = { status: 500, message: "Internal server error.", data: {} };

    switch (action) {
      case "i": {
        const document = new Schema(data);
        document.validateSync();
        const savedData = await document.save();
        response.status = 201;
        response.data = savedData.toObject();
        response.message = "Record created successfully.";
        break;
      }
      case "u": {
        const { _id, ...updateData } = data;
        const updateDoc = await Schema.findOneAndUpdate(
          { _id },
          { $set: updateData },
          { runValidators: true, new: true }
        ).lean();
        if (!updateDoc) {
          response.status = 400;
          response.message = "Record not found.";
        } else {
          response.status = 200;
          response.data = updateDoc;
          response.message = "Record updated successfully.";
        }
        break;
      }
      case "d": {
        const deleteDoc = await Schema.findOneAndDelete({ _id: data._id });
        if (!deleteDoc) {
          response.status = 400;
          response.message = "Record not found.";
        } else {
          response.status = 200;
          response.data = deleteDoc;
          response.message = "Record deleted successfully.";
        }
        break;
      }
      default:
        response.status = 400;
        response.message = "Invalid operation.";
    }
    return response;
  } catch (error) {
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message).join(" ");
      throw Object.assign(new Error(msg), { response: { status: 409, message: msg } });
    }
    if (error.code === 11000) {
      const msg = `${Object.keys(error.keyValue).join(", ")} already exists.`;
      throw Object.assign(new Error(msg), { response: { status: 409, message: msg } });
    }
    throw error;
  }
};

export const FindOne = async (Schema, query, populateKeys = "") => {
  try {
    const data = await Schema.findOne(query).populate(populateKeys).sort({ _id: -1 }).lean();
    return {
      status: data ? 200 : 400,
      data,
      message: data ? "Data found." : "Data not found.",
    };
  } catch (error) {
    throw error;
  }
};
