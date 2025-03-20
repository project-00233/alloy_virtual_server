const { supabase, supabaseURL } = require("../supabaseClient");

function handleNewImage(obj, folderName) {
  const imageName = `${Math.floor(Math.random() * 1000000000000000)
    .toString()
    .padStart(15, "0")}-${obj?.image?.name}`.replaceAll("/", "");

  let imageURL = `${supabaseURL}/storage/v1/object/public/service-images/${folderName}/${imageName}`;
  let imagePath = `${folderName}/${imageName}`;
  let imageObj = obj?.image;

  return { imageURL, imagePath, imageObj };
}

const update_gsp = async (id, obj, request_for, callback) => {
  let options = supabase;

  if (request_for === "gs_user" || request_for === "gsu") {
    options = options
      .from("gs_user")
      .update(obj)
      .eq("id", id);
  }
  if (request_for === "gs_user_settings" || request_for === "gsus") {
    options = options
      .from("gs_user_settings")
      .update(obj)
      .eq("id", id);
  }
  if (request_for === "gs_requests" || request_for === "gsr") {
    options = options
      .from("requests")
      .update(obj)
      .eq("id", id);
  }

  const { data, error } = await options.select("*").single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const update_admin = async (id, obj, request_for, callback) => {
  let options = supabase;

  if (request_for === "service_providers" || request_for === "sp") {
    options = options
      .from("service_providers")
      .update(obj)
      .eq("id", id);
  }

  if (request_for === "services" || request_for === "sv") {
    options = options
      .from("services")
      .update(obj)
      .eq("id", id);
  }

  if (request_for === "services_images" || request_for === "svi") {
    let newServiceImage = obj?.imageList?.filter(
      (item) => item?.type || item?.type === "new"
    );
    let oldImages = obj?.imageList?.filter(
      (item) => !item?.type || item?.type !== "new"
    );
    if (newServiceImage?.length > 0) {
      const serviceImg = newServiceImage[0];
      const { imageURL, imagePath, imageObj } = handleNewImage(
        serviceImg,
        "attraction"
      );

      const { error: storageError } = await supabase.storage
        .from("service-images")
        .upload(imagePath, imageObj);

      if (storageError) {
        callback(JSON.stringify(storageError), null);
      }

      const oldImagURLs = oldImages?.map((obj) => obj?.image);
      let newArr = { list: [imageURL, ...oldImagURLs] };
      options = options
        .from("services")
        .update({ images: newArr })
        .eq("id", id);
    } else {
      const oldImagURLs = oldImages?.map((obj) => obj?.image);
      let oldArr = { list: oldImagURLs };
      options = options
        .from("services")
        .update({ images: oldArr })
        .eq("id", id);
    }
  }
  if (request_for === "request_charges" || request_for === "rc") {
    options = options
      .from("request_charges")
      .update(obj)
      .eq("id", id);
  }
  if (request_for === "requests" || request_for === "rq") {
    options = options
      .from("requests")
      .update(obj)
      .eq("order_ticket", id);
  }

  const { data, error } = await options.select("*").single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

module.exports = { update_gsp, update_admin };
