const { supabase } = require("../supabaseClient");

const verify_request_token = async (request_token, callback) => {
  let options = supabase.from("requests");

  const { data: arr } = await options
    .select("id, token, token_status, order_status")
    .eq("order_status", "processed");

  const newArr = arr?.filter((item) =>
    item?.token === request_token ? true : false
  );

  if (newArr?.length > 0) {
    const obj = newArr[0];
    if (obj?.token_status === "unverified") {
      const { error } = await options
        .update({ token_status: "verified" })
        .eq("id", obj?.id);

      if (error) {
        callback("Token verification error, try again!", null);
        return;
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
