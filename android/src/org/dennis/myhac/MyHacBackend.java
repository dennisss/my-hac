package org.dennis.myhac;

import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.apache.cordova.api.*;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.*;
import java.io.*;

import android.content.Intent;
import android.webkit.CookieManager;

public class MyHacBackend extends CordovaPlugin {
	
	public class Subject{
		
		public String name;
		public String id;
		public Float average;
		public String session;
		
		Subject(MyHacBackend context, String id, String session, String name){
			this.name = name;
			this.id = id;
			this.session = session;
			this.average = Float.NaN;
		}
		
		public String convertStreamToString( InputStream is, String ecoding ) throws IOException
		{
		    StringBuilder sb = new StringBuilder( Math.max( 16, is.available() ) );
		    char[] tmp = new char[ 4096 ];

		    try {
		       InputStreamReader reader = new InputStreamReader( is, ecoding );
		       for( int cnt; ( cnt = reader.read( tmp ) ) > 0; )
		            sb.append( tmp, 0, cnt );
		    } finally {
		        is.close();
		    }
		    return sb.toString();
		}
		
		public void getAverage() throws IOException{
			
			HttpClient client = new DefaultHttpClient();
			
			CookieManager cookieManager = CookieManager.getInstance();
			
			String url = String.format("%sStudent/ClassworkAverages.aspx?course_session=%s&rc_run=%s&section_key=%s", MyHacBackend.BaseAddress, this.session, MyHacBackend.Run, this.id); 
			
			HttpGet get = new HttpGet(url);
			
			get.setHeader("Cookie", cookieManager.getCookie(MyHacBackend.BaseAddress));
			
			HttpResponse res = client.execute(get);
			
			String data = this.convertStreamToString(res.getEntity().getContent(), "ASCII");
			
			//Old Pattern: [0-9,\\.]*%
			
			try{
				Pattern p = Pattern.compile("MP:.*<td>([0-9|\\.]*)%</td>"); //("MP:</b></td><td>(.*)%</td>");
				Matcher m = p.matcher((String)data);
				if (m.find()) {
				    this.average = Float.parseFloat(m.group(1).replace("%", ""));
				}
				System.out.println(this.average);
			}
			catch(Exception e){
				this.average = Float.NaN;
				
			}
		}
		
		
	}
	
	
	public static String BaseAddress;
	public static List<Subject> Subjects;
	public static Integer Interval;
	public static String Run;
	public static Boolean Running;

	private Intent Service;
	
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		
		/*
		 * 
		- setup(baseUrl, run, intNotifInterval)
		- addSubject(sectionId, courseSession, name)
		- startNotif()
		- stopNotif()
		 * 
		 * 
		 */
		
		if("initial".equals(action)){
			MyHacBackend.Running = false;
		}
		else if("setup".equals(action)){
			String baseUrl = args.getString(0);
			String run = args.getString(1);
			Integer interval = args.getInt(2);
			
			MyHacBackend.Interval = interval * (1000 * 60); //Converted from minutes to milliseconds
			
			MyHacBackend.BaseAddress = baseUrl;
			MyHacBackend.Run = run;
			MyHacBackend.Subjects = new ArrayList<Subject>();
			
			if(!MyHacBackend.Running){
			
				if(this.Service != null){
					cordova.getActivity().stopService(this.Service);
				}
				
				this.Service = null;
			}
		}
		else if("addSubject".equals(action)){
			
			String sid = args.getString(0);
			String session = args.getString(1);
			String name = args.getString(2);
			Subject s = new Subject(this, sid, session, name);
			for(Subject x : MyHacBackend.Subjects)
			{
				if(x.id.equals(id))
					MyHacBackend.Subjects.remove(x);
			}
			
			MyHacBackend.Subjects.add(s);
			
			System.out.println(s.id);
		}
		else if("startNotif".equals(action)){
			
			if(!MyHacBackend.Running){
				
				MyHacBackend.Running = true;
				
				if(this.Service == null){
					this.Service = new Intent(cordova.getActivity(), BackgroundUpdater.class);
				}
				cordova.getActivity().startService(this.Service);
			}
		}
		else if("stopNotif".equals(action)){
			
			MyHacBackend.Running = false;
			cordova.getActivity().stopService(this.Service);
			
		}
		else if("clearCookies".equals(action)){
			CookieManager cookieManager = CookieManager.getInstance();
			cookieManager.removeAllCookie();
		}
		
		System.out.println("::" + action);
		
		callbackContext.success();
		
		return true;
	}
}
