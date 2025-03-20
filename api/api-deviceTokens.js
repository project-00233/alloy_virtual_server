const { supabase } = require("./supabaseClient");

const fetchGSUserDeviceToken = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("gs_user_device_tokens")
      .select("device_token")
      .eq("app_user_id", userId)
      .single();

    if (error) throw error;

    const token = data.device_token;
    return token;
  } catch (err) {
    console.error("Error fetching device tokens:", err);
    throw err;
  }
};

const fetchMultiStaffDeviceTokens = async (propId, requestType) => {
  try {
    const { data, error } = await supabase
      .from("staff_device_tokens")
      .select(
        "device_token, propertyStaff(hasAccessToReports,hasAccessToInRoom,hasAccessToRestaurant,hasAccessToAttractions,hasAccessToRequests)"
      )
      .eq("propId", propId);

    if (error) throw error;

    let arr = [];

    if (data) {
      if (requestType === "request") {
        arr = data.filter((item) => item.propertyStaff?.hasAccessToRequests);
      }
      if (requestType === "report") {
        arr = data.filter((item) => item.propertyStaff?.hasAccessToReports);
      }
      if (requestType === "approval" || requestType === "guest") {
        arr = data.filter((item) =>
          item.propertyStaff?.hasAccessToReports ||
          item.propertyStaff?.hasAccessToRequests
            ? true
            : false
        );
      }
    }

    const tokens = arr.map((row) => row.device_token);
    return tokens;
  } catch (err) {
    console.error("Error fetching device tokens:", err);
    throw err;
  }
};

const fetchStaffDeviceToken = async (staffId) => {
  try {
    const { data, error } = await supabase
      .from("staff_device_tokens")
      .select("device_token")
      .eq("staff_user_id", staffId)
      .single();

    if (error) throw error;

    const token = data.device_token;
    return token;
  } catch (err) {
    console.error("Error fetching device tokens:", err);
    throw err;
  }
};

module.exports = {
  fetchGSUserDeviceToken,
  fetchMultiStaffDeviceTokens,
  fetchStaffDeviceToken,
};
