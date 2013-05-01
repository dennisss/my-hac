package org.dennis.myhac;

import java.io.IOException;

import org.dennis.myhac.MyHacBackend.Subject;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.IntentService;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.support.v4.app.NotificationCompat;


public class BackgroundUpdater extends IntentService {

	private static Integer NotifId = 0;
	public BackgroundUpdater() {
		super("BackgroundUpdater");
	}

	@Override
	protected void onHandleIntent(Intent inte) {
		while(MyHacBackend.Running){
	    	for(Subject s : MyHacBackend.Subjects)
	    	{
	    		try {
	    			Float old = s.average;
	    			s.getAverage();
	    			if(!old.isNaN() && Math.abs(old - s.average) > 0.001 && !s.average.isNaN())
	    			{

	    				// Prepare intent which is triggered if the
	    				// notification is selected

	    				Intent intent = new Intent(this, MyHAC.class);
	    				PendingIntent pIntent = PendingIntent.getActivity(this, 0, intent, 0);

	    				// Build notification
	    				// Actions are just fake
	    				
	    				Uri uri= RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

	    				
	    				Notification noti = new NotificationCompat.Builder(this)
	    						.setContentTitle("Average: " + s.average.toString() + "%")
	    				        .setContentText("New grades in " + s.name)
	    				        .setSmallIcon(R.drawable.icon)
	    				        .setSound(uri)
	    				        .setVibrate(new long[]{100, 1500})
	    						.setContentIntent(pIntent).build();
	    				    
	    				  
	    				NotificationManager notificationManager = 
	    				  (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

	    				// Hide the notification after its selected
	    				noti.flags |= Notification.FLAG_AUTO_CANCEL;

	    				notificationManager.notify(NotifId, noti);
	    				
	    				NotifId += 1;
	    			}
	    			
					
				} catch (IOException e) {
					continue;
				}
	    		
	    	}
			
			
			try {
				Thread.sleep(MyHacBackend.Interval);
			} catch (InterruptedException e) {
				return;
			}
		}
	}

}
