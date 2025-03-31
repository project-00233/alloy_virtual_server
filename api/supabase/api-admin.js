const { supabase } = require("../supabaseClient");

const verify_request_token = async (request_token, callback) => {
  let options = supabase.from("requests");

  const { data: arr, error } = await options
    .select("id, token, token_status, order_status")
    .eq("order_status", "processed");

  console.log(error);

  const newArr = arr?.filter((item) =>
    item?.token === request_token ? true : false
  );

  if (newArr?.length > 0) {
    const obj = newArr[0];

    if (obj.token_status === "unverified") {
      const { error } = await options
        .update({ token_status: "verified" })
        .eq("id", obj.id);

      if (error) {
        return callback("Token verification error, try again!", null);
      }

      callback(null, { status: "current_verification" });
    } else {
      callback(null, { status: "past_verification" });
    }
  } else {
    callback("Token does not exist!", null);
  }
};

module.exports = {
  verify_request_token,
};
