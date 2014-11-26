package tv.matchstick.demo.dashboard;

import org.json.JSONException;
import org.json.JSONObject;

import tv.matchstick.fling.Fling;
import tv.matchstick.fling.FlingDevice;
import tv.matchstick.fling.FlingManager;
import tv.matchstick.fling.ResultCallback;
import tv.matchstick.fling.Status;
import android.util.Log;

public abstract class DashBoardChannel implements Fling.MessageReceivedCallback {
    private static final String TAG = DashBoardChannel.class.getSimpleName();

    private static final String DASHBOARD_NAMESPACE = "urn:flint:tv.matchstick.demo.dashboard";

    // Commands
    private static final String KEY_COMMAND = "command";
    private static final String KEY_JOIN = "join";
    private static final String KEY_SHOW = "show";
    private static final String KEY_LEAVE = "leave";

    private static final String KEY_USER = "user";
    private static final String KEY_INFO = "info";

    protected DashBoardChannel() {
    }

    /**
     * Returns the namespace for this fling channel.
     */
    public String getNamespace() {
        return DASHBOARD_NAMESPACE;
    }

    public final void show(FlingManager apiClient, String user, String info) {
        try {
            Log.d(TAG, "show: " + info);
            JSONObject payload = new JSONObject();
            payload.put(KEY_COMMAND, KEY_SHOW);
            payload.put(KEY_USER, user);
            payload.put(KEY_INFO, info);
            sendMessage(apiClient, payload.toString());
        } catch (JSONException e) {
            Log.e(TAG, "Cannot create object to show file", e);
        }
    }

    public final void join(FlingManager apiClient, String user) {
        try {
            Log.d(TAG, "join: " + user);
            JSONObject payload = new JSONObject();
            payload.put(KEY_COMMAND, KEY_JOIN);
            payload.put(KEY_USER, user);
            sendMessage(apiClient, payload.toString());
        } catch (JSONException e) {
            Log.e(TAG, "Cannot create object to show file", e);
        }
    }

    /**
     * Sends a command to leave the current game.
     */
    public final void leave(FlingManager apiClient, String user) {
        try {
            Log.d(TAG, "leave");
            JSONObject payload = new JSONObject();
            payload.put(KEY_COMMAND, KEY_LEAVE);
            payload.put(KEY_USER, user);
            sendMessage(apiClient, payload.toString());
        } catch (JSONException e) {
            Log.e(TAG, "Cannot create object to leave", e);
        }
    }

    @Override
    public void onMessageReceived(FlingDevice flingDevice, String namespace,
            String message) {
        Log.d(TAG, "onTextMessageReceived: " + message);

    }

    private final void sendMessage(FlingManager apiClient, String message) {
        Log.d(TAG, "Sending message: (ns=" + DASHBOARD_NAMESPACE + ") "
                + message);
        Fling.FlingApi.sendMessage(apiClient, DASHBOARD_NAMESPACE, message)
                .setResultCallback(new SendMessageResultCallback(message));
    }

    private final class SendMessageResultCallback implements
            ResultCallback<Status> {
        String mMessage;

        SendMessageResultCallback(String message) {
            mMessage = message;
        }

        @Override
        public void onResult(Status result) {
            if (!result.isSuccess()) {
                Log.d(TAG,
                        "Failed to send message. statusCode: "
                                + result.getStatusCode() + " message: "
                                + mMessage);
            }
        }
    }

}
