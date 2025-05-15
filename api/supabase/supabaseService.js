const { supabase } = require("./supabaseClient");

function fetchUser(given_id, callback) {
  const { data, error } = supabase
    .from("user_meta")
    .select("*")
    .eq("given_id", given_id)
    .single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
}

async function fetchSupabase(request_for, given_id, callback) {
  let options = supabase;

  if (request_for === "device_tokens") {
    options = options
      .from("device_tokens")
      .select("*")
      .eq("given_id", given_id);
  }
  if (request_for === "reminders") {
    options = options
      .from("reminders")
      .select("*")
      .eq("given_id", given_id);
  }
  if (request_for === "medications") {
    options = options
      .from("medications")
      .select("*")
      .eq("given_id", given_id);
  }
  if (request_for === "tasks") {
    options = options
      .from("tasks")
      .select("*")
      .eq("given_id", given_id);
  }
  if (request_for === "emergency_lines") {
    options = options
      .from("emergency_lines")
      .select("*")
      .eq("given_id", given_id);
  }

  const { data, error } = await options.order("created_at", {
    ascending: false,
  });

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
}

// Insert
async function insertSupabase(request_for, client_data, callback) {
  let options = supabase;

  if (request_for === "device_tokens") {
    options = options
      .from("device_tokens")
      .insert([client_data])
      .select("*");
  }
  if (request_for === "user_meta") {
    options = options
      .from("user_meta")
      .insert([client_data])
      .select("*");
  }
  if (request_for === "reminders") {
    options = options
      .from("reminders")
      .insert([client_data])
      .select("*");
  }
  if (request_for === "tasks") {
    options = options
      .from("tasks")
      .insert([client_data])
      .select("*");
  }
  if (request_for === "emergency_lines") {
    options = options
      .from("emergency_lines")
      .insert([client_data])
      .select("*");
  }
  if (request_for === "medications") {
    options = options
      .from("medications")
      .insert([client_data])
      .select("*");
  }

  const { data, error } = await options.single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
}

// Update
async function updateSupabase(request_for, data_id, client_data, callback) {
  let options = supabase;

  if (request_for === "device_tokens") {
    options = options
      .from("device_tokens")
      .update(client_data)
      .eq("id", data_id);
  }
  if (request_for === "emergency_lines") {
    options = options
      .from("emergency_lines")
      .update(client_data)
      .eq("id", data_id);
  }

  const { data, error } = await options.select("*").single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
}

// Delete
async function deleteSupabase(request_for, data_id, callback) {
  let options = supabase;

  if (request_for === "medications") {
    options = options
      .from("medications")
      .delete()
      .eq("id", data_id);
  }
  if (request_for === "tasks") {
    options = options
      .from("tasks")
      .delete()
      .eq("id", data_id);
  }
  if (request_for === "reminders") {
    options = options
      .from("reminders")
      .delete()
      .eq("id", data_id);
  }
  if (request_for === "emergency_lines") {
    options = options
      .from("emergency_lines")
      .delete()
      .eq("id", data_id);
  }

  const { error } = await options;

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, true);
}

module.exports = {
  insertSupabase,
  updateSupabase,
  fetchSupabase,
  fetchUser,
  deleteSupabase,
};
