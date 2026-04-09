import supabase from "../db/index.js";

/**
 * Logs a system activity/event to Supabase for historical tracking.
 * @param {string} type - Event type (login, dataset_upload, model_trained, session_heartbeat)
 * @param {string} userEmail - User associated with the event
 * @param {object} details - Additional metadata
 */
export const logActivity = async (type, userEmail, details = {}) => {
    try {
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;

        while (attempts < maxAttempts && !success) {
            const { error } = await supabase.from("activity_logs").insert([
                {
                    event_type: type,
                    user_email: userEmail,
                    details: JSON.stringify(details),
                    created_at: new Date().toISOString()
                }
            ]);

            if (error) {
                // Table might not exist yet, we'll try to handle it silently in prod but log in dev
                if (error.code === '42P01') { // Undefined table
                    console.warn("Table 'activity_logs' does not exist. Please create it in Supabase.");
                    break; // No point in retrying if table doesn't exist
                } else {
                    console.error(`Error logging activity (attempt ${attempts + 1}):`, error.message);
                }
            } else {
                success = true;
            }
            attempts++;
            if (!success && attempts < maxAttempts) await new Promise(r => setTimeout(r, 1000));
        }
    } catch (err) {
        console.error("Activity logging failed:", err);
    }
};
