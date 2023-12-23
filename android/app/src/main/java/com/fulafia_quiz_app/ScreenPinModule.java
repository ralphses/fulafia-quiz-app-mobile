// ScreenPinModule.java
package com.fulafia_quiz_app;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ScreenPinModule extends ReactContextBaseJavaModule {

    public ScreenPinModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "ScreenPinModule";
    }

    @ReactMethod
    public void startScreenPin() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            ActivityManager activityManager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
            if (activityManager != null) {
                Intent intent = new Intent(activity, MainActivity.class); // Replace with your quiz activity
                activity.startLockTask();
                //activityManager.moveTaskToFront(intent.getComponent().getPackageName(), ActivityManager.MOVE_TASK_NO_USER_ACTION);
            }
        }
    }

    @ReactMethod
    public void stopScreenPin() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            activity.stopLockTask();
        }
    }
}
