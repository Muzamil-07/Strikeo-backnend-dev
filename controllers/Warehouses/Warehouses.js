const {
  OkResponse,
  BadRequestResponse,
  NotFoundResponse,
} = require("express-http-response");
const Warehouse = require("../../models/Warehouse.js");
const mongoose = require("mongoose");
const filterObjectBySchema = require("../../utils/filterObject.js");

const warehouseSchema = {
  name: true,
  location: {
    addressLine: true,
    city: true,
    region: true,
    zone: true,
    area: true,
    country: true, // Default country can be handled in your logic
    zipCode: true,
    geoCoordinates: {
      latitude: true,
      longitude: true,
    },
  },
  storage: {
    type: true,
    totalCapacity: {
      value: true,
    },
    currentCapacity: {
      value: true,
    },
    capacityUnit: true,
  },
  isActive: true,
};

const getAllWarehouses = async (req, res, next) => {
  try {
    const { page, all, search } = req.query;

    const limit = 8;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const query = {
      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
    };

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
    };

    const warehouses = await Warehouse.paginate(query, options);

    return next(
      new OkResponse({
        warehouses: warehouses.docs,
        totalWarehouses: warehouses.totalDocs,
        totalPages: warehouses.totalPages,
        hasPrevPage: warehouses.hasPrevPage,
        hasNextPage: warehouses.hasNextPage,
        currentPage: warehouses.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const getWarehouseById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Warehouse ID is required"));

  try {
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) return next(new NotFoundResponse("Warehouse not found"));

    return next(new OkResponse(warehouse));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const createWarehouse = async (req, res, next) => {
  try {
    // Filter the payload based on the schema
    const createPayload = await filterObjectBySchema(req.body, warehouseSchema);

    const warehouse = new Warehouse(createPayload);
    await warehouse.save();
    return next(new OkResponse(warehouse));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const updateWarehouseById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Warehouse ID is required"));

  try {
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) return next(new NotFoundResponse("Warehouse not found"));

    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(req.body, warehouseSchema);
    const updatedWarehouse = await Warehouse.updateOne(
      { _id: id },
      { ...updatePayload }
    );

    return next(new OkResponse(updatedWarehouse));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const toggleWarehouseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate payload
    if (typeof isActive !== "boolean") {
      return next(new BadRequestResponse("Invalid status value"));
    }

    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return next(new BadRequestResponse("Invalid warehouse ID"));
    }

    // Update the warehouse's isActive status
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedWarehouse) {
      return next(new NotFoundResponse("Warehouse not found"));
    }

    return next(
      new OkResponse({
        message: `Successfully ${
          updatedWarehouse.isActive ? "Activated" : "Deactivated"
        }`,
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const deleteWarehouseById = async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse("Invalid warehouse ID"));
  }

  // Find the warehouse by ID and delete
  const warehouse = await Warehouse.findByIdAndDelete(id);

  // If the warehouse does not exist
  if (!warehouse) {
    return next(new NotFoundResponse("Warehouse not found"));
  }

  return next(
    new OkResponse({
      message: "Warehouse deleted successfully",
    })
  );
};

const WarehouseController = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouseById,
  toggleWarehouseStatus,
  deleteWarehouseById,
};

module.exports = WarehouseController;
