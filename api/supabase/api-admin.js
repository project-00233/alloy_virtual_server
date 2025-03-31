const { supabase } = require("../supabaseClient");

const verify_request_token = async (req_token, callback) => {
  let options = supabase.from("requests");

  const { data: arr } = await options
    .select("id, request_token, token_status, order_status")
    .eq("order_status", "processed");

  const newArr = arr?.filter((item) =>
    item?.request_token === req_token ? true : false
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
