import pool from "../../config/sql"

export const getApartmentsByBuildingId = async (
  buildingId: number, 
  floorPlanId?: number, 
  limit = 10, 
  offset = 0,
  floorNumber?: number
) => {
  try {
    // Base query for counting total apartments
    let countQuery = "SELECT COUNT(*) FROM apartments WHERE building_id = $1";
    const countParams: any[] = [buildingId];

    if (floorPlanId) {
      countQuery += " AND floor_plan_id = $2";
      countParams.push(floorPlanId);
    }

    // Add floor filter to count query if specified
    if (floorNumber !== undefined) {
      countQuery += ` AND floor = $${countParams.length + 1}`;
      countParams.push(floorNumber);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = Number.parseInt(countResult.rows[0].count, 10);

    // Base query for selecting apartments - ADDED sqm_price TO THE SELECT STATEMENT
    let query = `SELECT flat_id, flat_number, status, images, floor, square_meters, 
                        mobile_paths, desktop_paths, floor_plan_id, sqm_price 
                 FROM apartments WHERE building_id = $1`;
    const queryParams: any[] = [buildingId];
 
    if (floorPlanId) {
      query += " AND floor_plan_id = $2";
      queryParams.push(floorPlanId);
    }

    // Add floor filter to select query if specified
    if (floorNumber !== undefined) {
      query += ` AND floor = $${queryParams.length + 1}`;
      queryParams.push(floorNumber);
    }
 
    // Order results
    query += " ORDER BY floor_plan_id, floor, flat_number";

    // Add pagination
    query += " LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2);
    queryParams.push(limit, offset);

    // Execute query
    const result = await pool.query(query, queryParams);
 
    // Group apartments by floor plan and floor
    const apartmentsGrouped = result.rows.reduce((acc: any, apartment: any) => {
      // Initialize floor plan if not exists
      if (!acc[apartment.floor_plan_id]) {
        acc[apartment.floor_plan_id] = {
          floor_plan_id: apartment.floor_plan_id,
          apartments: [],
        };
      }

      // Find floor group
      const floorGroup = acc[apartment.floor_plan_id].apartments.find(
        (floor: any) => floor.floor === apartment.floor
      );

      // Process apartment images
      let apartmentImages = apartment.images;
      if (typeof apartmentImages === "string") {
        try {
          apartmentImages = JSON.parse(apartmentImages);
        } catch (e) {
          apartmentImages = [];
        }
      }

      if (!Array.isArray(apartmentImages)) {
        apartmentImages = [];
      }

      // Handle paths
      const mobilePaths = apartment.mobile_paths || "";
      const desktopPaths = apartment.desktop_paths || "";

      // Add apartment to the appropriate floor group
      if (!floorGroup) {
        acc[apartment.floor_plan_id].apartments.push({
          floor: apartment.floor,
          apartments: [
            {
              flat_id: apartment.flat_id,
              flat_number: apartment.flat_number,
              status: apartment.status,
              images: apartmentImages,
              square_meters: apartment.square_meters,
              mobile_paths: mobilePaths,
              desktop_paths: desktopPaths,
              sqm_price: apartment.sqm_price, // ADDED sqm_price TO THE OUTPUT
            },
          ],
        });
      } else {
        floorGroup.apartments.push({
          flat_id: apartment.flat_id,
          flat_number: apartment.flat_number,
          status: apartment.status,
          images: apartmentImages,
          square_meters: apartment.square_meters,
          mobile_paths: mobilePaths,
          desktop_paths: desktopPaths,
          sqm_price: apartment.sqm_price, // ADDED sqm_price TO THE OUTPUT
        });
      }

      return acc;
    }, {});

    // Convert grouped apartments to array
    const groupedApartments = Object.values(apartmentsGrouped);

    return {
      apartments: groupedApartments,
      total,
    };
  } catch (error) {
    console.error("Error fetching apartments by building ID:", error);
    throw new Error("Database query error");
  }
};