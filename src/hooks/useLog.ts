import { supabase } from "@/lib/supabaseClient";

const newLog = async (action: string, description: string) => {
  try {
    const { error } = await supabase.from("log").insert({
      action: action,
      description: description,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    throw error;
  }
};

export default newLog;
