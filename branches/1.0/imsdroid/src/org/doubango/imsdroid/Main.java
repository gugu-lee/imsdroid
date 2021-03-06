/*
* Copyright (C) 2010 Mamadou Diop.
*
* Contact: Mamadou Diop <diopmamadou(at)doubango.org>
*	
* This file is part of imsdroid Project (http://code.google.com/p/imsdroid)
*
* imsdroid is free software: you can redistribute it and/or modify it under the terms of 
* the GNU General Public License as published by the Free Software Foundation, either version 3 
* of the License, or (at your option) any later version.
*	
* imsdroid is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
* without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
* See the GNU General Public License for more details.
*	
* You should have received a copy of the GNU General Public License along 
* with this program; if not, write to the Free Software Foundation, Inc., 
* 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
*
*/


/*
 * Performance: http://developer.android.com/guide/practices/design/performance.html
 * Services: http://developer.android.com/reference/android/app/Service.html
 * Activity LifeCycle: http://developer.android.com/reference/android/app/Activity.html
 * Application Fundamentals: http://developer.android.com/guide/topics/fundamentals.html#acttask
 * Activity Launch Modes: http://www.justinlee.sg/2010/03/13/android-activity-launch-modes/
 * Hello Views: http://developer.android.com/guide/tutorials/views/index.html
 * Dialogs: http://developer.android.com/guide/topics/ui/dialogs.html#AlertDialog
 * Hard Keys: http://android-developers.blogspot.com/2009/12/back-and-other-hard-keys-three-stories.html
 * Menus: http://developer.android.com/guide/topics/ui/menus.html
 * Toasts: http://developer.android.com/guide/topics/ui/notifiers/toasts.html
 * 
 * SMS Manager: http://www.damonkohler.com/2009/02/android-recipes.html
 * 
 * Audio Recorder/Trac: http://stackoverflow.com/questions/2416365/android-how-to-add-my-own-audio-codec-to-audiorecord
 * 						http://androidforums.com/android-media/8974-can-system-sleep-while-audiorecord-recording.html
 * 						-->http://groups.google.co.in/group/android-developers/browse_thread/thread/1bf74961d3480bde
 * Video Recorder:		onPreviewFrame(byte[] data, Camera camera) 
 * 
 * Media Formats: http://developer.android.com/guide/appendix/media-formats.html
 * Android FFMPeg: http://oo-androidnews.blogspot.com/2010/02/ffmpeg-and-androidmk.html
 * 					http://groups.google.com/group/android-ndk/browse_thread/thread/f25d5c7f519bf0c5
 * 
 * front camera (Sprint): https://docs.google.com/View?id=dhtsnvs6_57d2hpqtgr
 * 
 * OMA documents: http://member.openmobilealliance.org/ftp/Public_documents/PAG/Permanent_documents/
 */
package org.doubango.imsdroid;

import java.io.File;

import org.doubango.imsdroid.Model.Configuration;
import org.doubango.imsdroid.Model.Configuration.CONFIGURATION_ENTRY;
import org.doubango.imsdroid.Model.Configuration.CONFIGURATION_SECTION;
import org.doubango.imsdroid.Screens.Screen;
import org.doubango.imsdroid.Screens.ScreenAV;
import org.doubango.imsdroid.Screens.ScreenAVQueue;
import org.doubango.imsdroid.Screens.ScreenFileTransferQueue;
import org.doubango.imsdroid.Screens.ScreenHistory;
import org.doubango.imsdroid.Screens.ScreenHome;
import org.doubango.imsdroid.Screens.ScreenMsrpInc;
import org.doubango.imsdroid.Screens.ScreenPresence;
import org.doubango.imsdroid.Screens.Screen.SCREEN_TYPE;
import org.doubango.imsdroid.Services.IConfigurationService;
import org.doubango.imsdroid.Services.IScreenService;
import org.doubango.imsdroid.Services.ISipService;
import org.doubango.imsdroid.Services.Impl.ServiceManager;
import org.doubango.imsdroid.events.IRegistrationEventHandler;
import org.doubango.imsdroid.events.RegistrationEventArgs;
import org.doubango.imsdroid.events.RegistrationEventTypes;
import org.doubango.imsdroid.media.MediaType;
import org.doubango.imsdroid.sip.MyAVSession;
import org.doubango.imsdroid.sip.PresenceStatus;

import android.app.ActivityGroup;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.View.OnClickListener;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

public class Main extends ActivityGroup
implements IRegistrationEventHandler
{
    private final ISipService sipService;
    private final IScreenService screenService;
    private final IConfigurationService configurationService;
    
    private volatile String progressInfoText = "";
    
    private RelativeLayout rlTop;
    private LinearLayout llBottom;
    private TextView tvTitle;
    private TextView tvDisplayName;
    private TextView tvFreeText;
    private TextView tvProgressInfo;
    private ImageView ivStatus;
    private ImageView ivAvatar;
   
    private final Handler handler;
    
    public static final int ACTION_NONE = 0;
    public static final int ACTION_SHOW_AVSCREEN = 1;
    public static final int ACTION_RESTORE_LAST_STATE = 2;
    public static final int ACTION_SHOW_HISTORY = 3;
    public static final int ACTION_SHOW_MSRP_INC_SCREEN = 4;
    public static final int ACTION_SHOW_CONTSHARE_SCREEN = 5;
    public static final int ACTION_SHOW_AVCALLS_SCREEN = 6;
    public static final int ACTION_INTERCEPT_OUTGOING_CALL = 7;
    
    private static String TAG = Main.class.getCanonicalName();
    
    public Main()
    {
    	super();
    	
    	// Sets main activity (should be done before starting services)
    	ServiceManager.setMainActivity(this);    
    	
    	// Gets services to avoid calling ServiceManager.get*() each time we want one
    	this.sipService = ServiceManager.getSipService();
    	this.screenService = ServiceManager.getScreenService();	
    	this.configurationService = ServiceManager.getConfigurationService();
    	
    	this.handler = new Handler();
    }

    /* ===================== Activity ========================*/
    
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // remove title bar
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.main);
        
        // Gets controls
        this.rlTop = (RelativeLayout)this.findViewById(R.id.main_relativeLayout_top);
        this.llBottom = (LinearLayout)this.findViewById(R.id.main_linearLayout_bottom);
        this.tvTitle = (TextView)this.findViewById(R.id.main_textView_title);
        this.tvDisplayName = (TextView)this.findViewById(R.id.main_textView_displayname);
        this.tvFreeText = (TextView)this.findViewById(R.id.main_textView_freetext);
        this.tvProgressInfo = (TextView)this.findViewById(R.id.main_textView_progressinfo);
        this.ivStatus = (ImageView)this.findViewById(R.id.main_imageView_status);
        this.ivAvatar = (ImageView)this.findViewById(R.id.main_imageView_avatar);
        
        // starts our services (will do nothing if already started)
        if(!ServiceManager.start()){
        	Log.e(Main.TAG, "Failed to start services");
        	return; // Should exit
        }
        
        // set values
        //this.rlTop.setVisibility(this.sipService.isRegistered() ? View.VISIBLE : View.INVISIBLE);
		this.tvDisplayName.setText(this.configurationService.getString(
				CONFIGURATION_SECTION.IDENTITY, CONFIGURATION_ENTRY.DISPLAY_NAME, Configuration.DEFAULT_DISPLAY_NAME));
        this.tvFreeText.setText(this.configurationService.getString(CONFIGURATION_SECTION.RCS, CONFIGURATION_ENTRY.FREE_TEXT, Configuration.DEFAULT_RCS_FREE_TEXT));
        this.ivStatus.setImageResource(ScreenPresence.getStatusDrawableId(Enum.valueOf(PresenceStatus.class, this.configurationService.getString(
						CONFIGURATION_SECTION.RCS,
						CONFIGURATION_ENTRY.STATUS,
						Configuration.DEFAULT_RCS_STATUS.toString()))));
        
       String avatarPath = String.format("%s/%s", ServiceManager.getStorageService().getCurrentDir(), "/avatar.png");
       if(new File(avatarPath).exists()){
    	   this.ivAvatar.setImageURI(new Uri.Builder().path(avatarPath).build());
       }

        // set event listeners
        this.ivStatus.setOnClickListener(this.ivStatus_OnClickListener);
        
        // add event handlers
        this.sipService.addRegistrationEventHandler(this);
        
        Bundle bundle = savedInstanceState;
        if(bundle == null){
	        Intent intent = getIntent();
	        bundle = intent == null ? null : intent.getExtras();
        }
        
        if(bundle != null && bundle.getInt("action", Main.ACTION_NONE) != Main.ACTION_NONE){
        	this.handleAction(bundle);
        }
        else{
            /* shows the home screen */
            this.screenService.show(ScreenHome.class);
        }
                
        //setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
        //setVolumeControlStream(AudioManager.STREAM_MUSIC);
    }

	@Override
	protected void onDestroy() {
        // remove event handlers : do it after stop() to continue to receive Sip events
        this.sipService.removeRegistrationEventHandler(this);
        
        super.onDestroy();
	}
	
	@Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
		Screen current = this.screenService.getCurrentScreen();
		if(current != null){
			if (keyCode == KeyEvent.KEYCODE_BACK && event.getRepeatCount() == 0 && current.getType() != SCREEN_TYPE.HOME_T) {
				this.screenService.back();
				return true;
			}
			else if(keyCode == KeyEvent.KEYCODE_MENU && event.getRepeatCount() == 0){
				if(!current.haveMenu()){
					this.screenService.show(ScreenHome.class);
					return true;
				}
				else{
					return current.onKeyDown(keyCode, event);
				}
			}
		}
		return super.onKeyDown(keyCode, event);
	}
    
	//@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		if(this.screenService.getCurrentScreen().haveMenu()){
			return this.screenService.getCurrentScreen().createOptionsMenu(menu);
		}
		
		return false;
	}

	//@Override
	public boolean onPrepareOptionsMenu(Menu menu){
		if(this.screenService.getCurrentScreen().haveMenu()){
			menu.clear();
			return this.screenService.getCurrentScreen().createOptionsMenu(menu);
		}
		return false;
	}
	
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		return this.screenService.getCurrentScreen().onOptionsItemSelected(item);
	}	

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		
		Bundle bundle = intent.getExtras();
		if(bundle != null){
			this.handleAction(bundle);
		}
		
		//setIntent(intent);
	}
	
	@Override
	protected void onSaveInstanceState(Bundle outState) {
		outState.putString("progressInfoText", this.progressInfoText);
		Screen screen = this.screenService.getCurrentScreen();
		if(screen != null){
			outState.putInt("action", Main.ACTION_RESTORE_LAST_STATE);
			outState.putString("screen-id", screen.getId());
			outState.putString("screen-type", screen.getType().toString());
		}
		
		super.onSaveInstanceState(outState);
	}
	
	@Override
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		super.onRestoreInstanceState(savedInstanceState);

		this.handleAction(savedInstanceState);
	}

	/* ===================== Public functions ======================== */
	public void setScreenTitle(String value){
		this.tvTitle.setText(value);
	}
	
	public void setProgressInfo(String value){
		this.tvProgressInfo.setText(value);
	}
	
	public void setDisplayName(String value){
		this.tvDisplayName.setText(value);
	}
	
	public void setFreeText(String value){
		this.tvFreeText.setText(value);
	}
	
	public void setStatus(int drawableId){
		this.ivStatus.setImageResource(drawableId);
	}
	
	public void setTopBarVisibility(int visibility){
		this.rlTop.setVisibility(visibility);
	}
	
	public void setBottomBarVisibility(int visibility){
		this.llBottom.setVisibility(visibility);
	}
	
	public void exit(){
		this.handler.post(new Runnable() {
			public void run() {
				if (!ServiceManager.stop()) {
					Log.e(Main.this.getClass().getName(), "Failed to stop services");
				}				
				Main.this.finish();
			}
		});
	}
	
	/* ===================== UI Events ======================== */	
	private OnClickListener ivStatus_OnClickListener = new OnClickListener() {
		public void onClick(View v) {
			Main.this.screenService.show(ScreenPresence.class);
		}
	};
	
	
    /* ===================== Sip Events ========================*/
	public boolean onRegistrationEvent(Object sender, RegistrationEventArgs e) {
		Log.i(this.getClass().getName(), "onRegistrationEvent");
		
		final RegistrationEventTypes type = e.getType();
		final short code = e.getSipCode();
		final String phrase = e.getPhrase();
		
		switch(type){
			case REGISTRATION_OK:
			this.handler.post(new Runnable() {
				public void run() {
					Main.this.progressInfoText = String.format("Registered: %s", phrase);
					Main.this.screenService.setProgressInfoText(Main.this.progressInfoText);
				}});
				break;
			
			case UNREGISTRATION_OK:
				this.handler.post(new Runnable() {
					public void run() {
						Main.this.progressInfoText = String.format("UnRegistered: %s", phrase);
						Main.this.screenService.setProgressInfoText(Main.this.progressInfoText);
						
						if(!Main.this.screenService.getCurrentScreen().getId().equals(ScreenHome.class.getCanonicalName())){
							Main.this.screenService.show(ScreenHome.class);
						}
					}});
				break;
				
			case REGISTRATION_INPROGRESS:
			case UNREGISTRATION_INPROGRESS:
				this.handler.post(new Runnable() {
					public void run() {
						Main.this.progressInfoText = String.format("Trying to %s...", (type == RegistrationEventTypes.REGISTRATION_INPROGRESS) ? "register" : "unregister");
						Main.this.screenService.setProgressInfoText(Main.this.progressInfoText);
					}});
				break;
				
			case REGISTRATION_NOK:
			case UNREGISTRATION_NOK:
			default:
			{
				Log.d(this.getClass().getName(), String.format("Registration/unregistration failed. code=%d and phrase=%s", code, phrase));
				break;
			}
		}
		
		return true;
	}
	
	/* ===================== Private functions ======================== */
	private void handleAction(Bundle bundle){
		final String id;
		switch(bundle.getInt("action", Main.ACTION_NONE)){
			case Main.ACTION_SHOW_AVSCREEN:
				id = bundle.getString("session-id");
				if(id != null){
					ServiceManager.getScreenService().show(ScreenAV.class, id);
				}
				break;
				
			case Main.ACTION_SHOW_AVCALLS_SCREEN:
				if(MyAVSession.getSessions().size()>1){
					ServiceManager.getScreenService().show(ScreenAVQueue.class);
				}
				else if(MyAVSession.getSessions().size() == 1){
					MyAVSession session = MyAVSession.getSessions().getAt(0);
					if(session != null){
						ServiceManager.getScreenService().show(ScreenAV.class, Long.toString(session.getId()));
					}
				}
				break;
				
			case ACTION_SHOW_MSRP_INC_SCREEN:
				id = bundle.getString("session-id");
				if(id != null){
					ServiceManager.getScreenService().show(ScreenMsrpInc.class, id);
				}
				break;
				
			case Main.ACTION_SHOW_HISTORY:
				ServiceManager.getScreenService().show(ScreenHistory.class);
				break;
				
			case Main.ACTION_INTERCEPT_OUTGOING_CALL:
				String number = bundle.getString("number");
				ScreenAV.makeCall(number, MediaType.AudioVideo);
				break;
				
			case Main.ACTION_SHOW_CONTSHARE_SCREEN:
				ServiceManager.getScreenService().show(ScreenFileTransferQueue.class);
				break;
				
			case Main.ACTION_RESTORE_LAST_STATE:
				id = bundle.getString("screen-id");
				Screen.SCREEN_TYPE screenType = Screen.SCREEN_TYPE.valueOf(bundle.getString("screen-type"));
				switch(screenType){
					case AV_T:
						ServiceManager.getScreenService().show(ScreenAV.class, id);
						break;
					default:
						if(!ServiceManager.getScreenService().show(id)){
							ServiceManager.getScreenService().show(ScreenHome.class);
						}
						break;
				}
				
				this.progressInfoText = bundle.getString("progressInfoText");
				this.screenService.setProgressInfoText(this.progressInfoText);
				this.ivStatus.setImageResource(ScreenPresence.getStatusDrawableId(Enum.valueOf(PresenceStatus.class, this.configurationService.getString(
						CONFIGURATION_SECTION.RCS,
						CONFIGURATION_ENTRY.STATUS,
						Configuration.DEFAULT_RCS_STATUS.toString()))));
				break;
		}
	}
}