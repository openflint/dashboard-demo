/*
 * Copyright (C) 2013-2014, The OpenFlint Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package tv.matchstick.demo.dashboard;

import org.json.JSONException;
import org.json.JSONObject;

import tv.matchstick.flint.Flint;
import tv.matchstick.flint.FlintDevice;
import tv.matchstick.flint.FlintManager;
import tv.matchstick.flint.ResultCallback;
import tv.matchstick.flint.Status;
import android.util.Log;

public abstract class DashBoardChannel implements Flint.MessageReceivedCallback {
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

    public final void show(FlintManager apiClient, String user, String info) {
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

    public final void join(FlintManager apiClient, String user) {
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
    public final void leave(FlintManager apiClient, String user) {
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
    public void onMessageReceived(FlintDevice flingDevice, String namespace,
            String message) {
        Log.d(TAG, "onTextMessageReceived: " + message);

    }

    private final void sendMessage(FlintManager apiClient, String message) {
        Log.d(TAG, "Sending message: (ns=" + DASHBOARD_NAMESPACE + ") "
                + message);
        Flint.FlintApi.sendMessage(apiClient, DASHBOARD_NAMESPACE, message)
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
