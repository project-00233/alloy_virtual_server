const { supabase, supabaseURL } = require("../supabaseClient");

function handleCreateImage(imageObj, folderName) {
  const imageName = `${Math.floor(Math.random() * 1000000000000000)
    .toString()
    .padStart(15, "0")}-${imageObj?.name}`.replaceAll("/", "");

  let imageURL = `${supabaseURL}/storage/v1/object/public/service-images/${folderName}/${imageName}`;
  let imagePath = `${folderName}/${imageName}`;

  return { imageURL, imagePath };
}

const insert_gsp = async (obj, request_for, callback) => {
  let options = supabase;

  if (request_for === "gs_user" || request_for === "gsu") {
    options = options
      .from("gs_user")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_user_billing_source" || request_for === "gsubs") {
    options = options
      .from("gs_user_billing_source")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_user_settings" || request_for === "gsus") {
    options = options
      .from("gs_user_settings")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_user_device_tokens" || request_for === "gsudt") {
    options = options
      .from("gs_user_device_tokens")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_requests" || request_for === "gsr") {
    options = options
      .from("requests")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_saved_requests" || request_for === "gssr") {
    options = options
      .from("saved_requests")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_request_invoice" || request_for === "gsri") {
    options = options
      .from("request_invoice")
      .insert([obj])
      .select("*, requests!request_invoice_order_ticket_fkey(*)");
  }
  if (request_for === "gs_request_messaging" || request_for === "gsrm") {
    options = options
      .from("request_messaging")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_rate_n_review" || request_for === "gsrnr") {
    options = options
      .from("rate_n_review")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_services" || request_for === "gss") {
    options = options
      .from("services")
      .insert([obj])
      .select("*");
  }
  if (request_for === "gs_request_transaction" || request_for === "gsrt") {
    options = options
      .from("gs_request_transaction")
      .insert([obj])
      .select("*, requests!gs_request_transaction_order_ticket_fkey(*)");
  }

  const { data, error } = await options.single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const insert_admin = async (obj, request_for, callback) => {
  let options = supabase;

  if (request_for === "service_providers" || request_for === "sp") {
    options = options.from("service_providers");
  }
  if (request_for === "request_charges" || request_for === "rc") {
    options = options.from("request_charges");
  }
  if (request_for === "target_properties" || request_for === "tp") {
    options = options.from("target_properties");
  }

  const { data, error } = await options
    .insert([obj])
    .select("*")
    .single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const insert_admin_image_obj = async (obj, request_for, callback) => {
  let options = supabase;
  // add image
  const hasImage = obj?.images?.list?.length > 0 ? true : false;

  if (request_for === "services" || request_for === "sv") {
    options = options.from("services");
  }

  if (hasImage) {
    let imageObj = obj?.images?.list[0];

    const { imageURL, imagePath } = handleCreateImage(imageObj, "attraction");
    // Upload
    const { error: storageError } = await supabase.storage
      .from("service-images")
      .upload(imagePath, imageObj);

    if (storageError) {
      return callback(
        JSON.stringify("Image upload error, Failed to add object"),
        null
      );
    }

    options = options.insert([{ ...obj, images: { list: [imageURL] } }]);
  } else {
    options = options.insert([obj]);
  }

  const { data, error } = await options.select("*").single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

module.exports = { insert_gsp, insert_admin, insert_admin_image_obj };
