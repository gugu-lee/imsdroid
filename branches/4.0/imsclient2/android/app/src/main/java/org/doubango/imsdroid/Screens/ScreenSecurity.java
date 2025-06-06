/* Copyright (C) 2010-2011, Mamadou Diop.
*  Copyright (C) 2011, Doubango Telecom.
*
* Contact: Mamadou Diop <diopmamadou(at)doubango(dot)org>
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
*/
package org.doubango.imsdroid.Screens;

import com.imsclient2.R;
import org.doubango.ngn.services.INgnConfigurationService;
import org.doubango.ngn.utils.NgnConfigurationEntry;
import org.doubango.tinyWRAP.MediaSessionMgr;
import org.doubango.tinyWRAP.tmedia_srtp_mode_t;
import org.doubango.tinyWRAP.tmedia_srtp_type_t;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.Toast;
import android.widget.CompoundButton.OnCheckedChangeListener;

public class ScreenSecurity extends BaseScreen {
	private final static String TAG = ScreenSecurity.class.getCanonicalName();
	
	private final INgnConfigurationService mConfigurationService;
	
	private final static int REQUEST_CODE_PRIV_KEY = 1234;
	private final static int REQUEST_CODE_PUB_KEY = 12345;
	private final static int REQUEST_CODE_CA = 123456;
	
	private Spinner mSpSRtpMode;
	private Spinner mSpSRtpType;
	private LinearLayout mLlTlsFiles;
	private ImageButton mIbPrivKey;
	private ImageButton mIbPubKey;
	private ImageButton mIbCA;
	private EditText mEtAMF;
	private EditText mEtOpId;
	private EditText mEtPrivKey;
	private EditText mEtPubKey;
	private EditText mEtCA;
	private CheckBox mCbTlsSecAgree;
	private CheckBox mCbTlsFiles;
	
	private final static ScreenSecuritySRtpMode sSpinnerSRtpModeItems[] = new ScreenSecuritySRtpMode[] {
		new ScreenSecuritySRtpMode(tmedia_srtp_mode_t.tmedia_srtp_mode_none, "None"),
		new ScreenSecuritySRtpMode(tmedia_srtp_mode_t.tmedia_srtp_mode_optional, "Optional"),
		new ScreenSecuritySRtpMode(tmedia_srtp_mode_t.tmedia_srtp_mode_mandatory, "Mandatory"),
	};
	private final static ScreenSecuritySRtpType sSpinnerSRtpTypeItems[] = new ScreenSecuritySRtpType[] {
		new ScreenSecuritySRtpType(tmedia_srtp_type_t.tmedia_srtp_type_sdes, "SDES"),
		new ScreenSecuritySRtpType(tmedia_srtp_type_t.tmedia_srtp_type_dtls, "DTLS"),
		new ScreenSecuritySRtpType(tmedia_srtp_type_t.tmedia_srtp_type_sdes_dtls, "BOTH"),
	};
	
	public  ScreenSecurity() {
		super(SCREEN_TYPE.SECURITY_T, TAG);
		
		mConfigurationService = getEngine().getConfigurationService();
	}
	
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
        setContentView(R.layout.screen_security);
        
      // get controls
        mSpSRtpMode = (Spinner)findViewById(R.id.screen_security_spinner_srtp_modes);
        mSpSRtpType = (Spinner)findViewById(R.id.screen_security_spinner_srtp_types);
        mLlTlsFiles = (LinearLayout)findViewById(R.id.screen_security_linearLayout_tlsfiles);
        mCbTlsFiles = (CheckBox)findViewById(R.id.screen_security_checkBox_tlsfiles);
        mIbPrivKey = (ImageButton)findViewById(R.id.screen_security_imageButton_private_key);
        mIbPubKey = (ImageButton)findViewById(R.id.screen_security_imageButton_public_key);
        mIbCA = (ImageButton)findViewById(R.id.screen_security_imageButton_ca);
        mEtAMF = (EditText)findViewById(R.id.screen_security_editText_amf);
        mEtOpId = (EditText)findViewById(R.id.screen_security_editText_opid);
        mEtPrivKey = (EditText)findViewById(R.id.screen_security_editText_private_key);
        mEtPubKey = (EditText)findViewById(R.id.screen_security_editText_public_key);
        mEtCA = (EditText)findViewById(R.id.screen_security_editText_ca);
        mCbTlsSecAgree = (CheckBox)findViewById(R.id.screen_security_checkBox_tls_secagree);
        
        // load values from configuration file (do it before adding UI listeners)
        mEtAMF.setText(mConfigurationService.getString(NgnConfigurationEntry.SECURITY_IMSAKA_AMF, NgnConfigurationEntry.DEFAULT_SECURITY_IMSAKA_AMF));
        mEtOpId.setText(mConfigurationService.getString(NgnConfigurationEntry.SECURITY_IMSAKA_OPID, NgnConfigurationEntry.DEFAULT_SECURITY_IMSAKA_OPID));
        mEtPrivKey.setText(mConfigurationService.getString(NgnConfigurationEntry.SECURITY_TLS_PRIVKEY_FILE_PATH, NgnConfigurationEntry.DEFAULT_SECURITY_TLS_PRIVKEY_FILE_PATH));
        mEtPubKey.setText(mConfigurationService.getString(NgnConfigurationEntry.SECURITY_TLS_PUBKEY_FILE_PATH, NgnConfigurationEntry.DEFAULT_SECURITY_TLS_PUBKEY_FILE_PATH));
        mEtCA.setText(mConfigurationService.getString(NgnConfigurationEntry.SECURITY_TLS_CA_FILE_PATH, NgnConfigurationEntry.DEFAULT_SECURITY_TLS_CA_FILE_PATH));
        //mCbTlsSecAgree.setChecked(mConfigurationService.getBoolean(CONFIGURATION_SECTION.SECURITY, CONFIGURATION_ENTRY.TLS_SEC_AGREE, Configuration.DEFAULT_TLS_SEC_AGREE));
        
        ArrayAdapter<ScreenSecuritySRtpMode> adapterSrtpMode = new ArrayAdapter<ScreenSecuritySRtpMode>(this, android.R.layout.simple_spinner_item, ScreenSecurity.sSpinnerSRtpModeItems);
        adapterSrtpMode.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        mSpSRtpMode.setAdapter(adapterSrtpMode);
        mSpSRtpMode.setSelection(ScreenSecuritySRtpMode.getSpinnerIndex(tmedia_srtp_mode_t.valueOf(mConfigurationService.getString(
				NgnConfigurationEntry.SECURITY_SRTP_MODE,
				NgnConfigurationEntry.DEFAULT_SECURITY_SRTP_MODE))));
        
        ArrayAdapter<ScreenSecuritySRtpType> adapterType = new ArrayAdapter<ScreenSecuritySRtpType>(this, android.R.layout.simple_spinner_item, ScreenSecurity.sSpinnerSRtpTypeItems);
        adapterType.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        mSpSRtpType.setAdapter(adapterType);
        mSpSRtpType.setSelection(ScreenSecuritySRtpType.getSpinnerIndex(tmedia_srtp_type_t.valueOf(mConfigurationService.getString(
				NgnConfigurationEntry.SECURITY_SRTP_TYPE,
				NgnConfigurationEntry.DEFAULT_SECURITY_SRTP_TYPE))));
        
        addConfigurationListener(mEtAMF);
        addConfigurationListener(mEtOpId);
        addConfigurationListener(mSpSRtpMode);
        addConfigurationListener(mEtPrivKey);
        addConfigurationListener(mEtPubKey);
        addConfigurationListener(mEtCA);
        
        // local listeners
        mIbPrivKey.setOnClickListener(ibPrivKey_OnClickListener);
        mIbPubKey.setOnClickListener(ibPubKey_OnClickListener);
        mIbCA.setOnClickListener(ibCA_OnClickListener);
        mCbTlsSecAgree.setOnCheckedChangeListener(cbTlsSecAgree_OnCheckedChangeListener);
        mCbTlsFiles.setOnCheckedChangeListener(cbTlsFiles_OnCheckedChangeListener);
	}
	
	protected void onPause() {
		if(super.mComputeConfiguration){
			
			mConfigurationService.putString(NgnConfigurationEntry.SECURITY_IMSAKA_AMF, mEtAMF.getText().toString());
			mConfigurationService.putString(NgnConfigurationEntry.SECURITY_IMSAKA_OPID, mEtOpId.getText().toString());
			mConfigurationService.putString(NgnConfigurationEntry.SECURITY_SRTP_MODE, 
					sSpinnerSRtpModeItems[mSpSRtpMode.getSelectedItemPosition()].mMode.toString());
			mConfigurationService.putString(NgnConfigurationEntry.SECURITY_SRTP_TYPE, 
					sSpinnerSRtpTypeItems[mSpSRtpType.getSelectedItemPosition()].mType.toString());
			
			mConfigurationService.putString(NgnConfigurationEntry.SECURITY_TLS_PRIVKEY_FILE_PATH, mEtPrivKey.getText().toString());
			mConfigurationService.putString(NgnConfigurationEntry.SECURITY_TLS_PUBKEY_FILE_PATH, mEtPubKey.getText().toString());
			mConfigurationService.putString(NgnConfigurationEntry.SECURITY_TLS_CA_FILE_PATH, mEtCA.getText().toString());
			
			if(!mConfigurationService.commit()){
				Log.e(TAG, "Failed to Compute() configuration");
			}
			else{
				MediaSessionMgr.defaultsSetSRtpMode(sSpinnerSRtpModeItems[mSpSRtpMode.getSelectedItemPosition()].mMode);
				MediaSessionMgr.defaultsSetSRtpType(sSpinnerSRtpTypeItems[mSpSRtpType.getSelectedItemPosition()].mType);
			}
			
			super.mComputeConfiguration = false;
		}
		super.onPause();
	}
	
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		if (resultCode != Activity.RESULT_OK) {
			return;
		}

		if (requestCode == ScreenSecurity.REQUEST_CODE_PRIV_KEY) {
			Uri uri = data.getData();
			Log.d(TAG, uri.toString());
		}
		else if (requestCode == ScreenSecurity.REQUEST_CODE_PUB_KEY) {
			
		}
		else if (requestCode == ScreenSecurity.REQUEST_CODE_CA) {

		}
		else{
			Log.e(ScreenSecurity.TAG, String.format("%d is an unknown request code", requestCode));
		}
	}
	
	private OnClickListener ibPrivKey_OnClickListener = new OnClickListener(){
		public void onClick(View v) {
			
			// Files and directories !
			// Files and directories !
			

//			Intent intent = new Intent(Intent.ACTION_GET_CONTENT); 
//			//intent.setType("file:///sdcard/image/*");  
//			//startActivityForResult(intent, 1);
//			intent.setType("*/*");                    
//			intent.addCategory(Intent.CATEGORY_OPENABLE);          
//			ServiceManager.getMainActivity().startActivityForResult(intent, 1);
			
			
			
			/*Intent intent = new Intent();
			Uri startDir = Uri.fromFile(new File("/sdcard"));
			intent.setAction(Intent.ACTION_PICK);
			intent.setDataAndType(startDir, "vnd.android.cursor.dir/*");
			//intent.setDataAndType(startDir, "file://");
			// Title
			intent.putExtra("explorer_title", "Select a file");
			// Optional colors
			intent.putExtra("browser_title_background_color", "440000AA");
			intent.putExtra("browser_title_foreground_color", "FFFFFFFF");
			intent.putExtra("browser_list_background_color", "00000066");
			// Optional font scale
			intent.putExtra("browser_list_fontscale", "120%");
			// Optional 0=simple list, 1 = list with filename and size, 2 = list with filename, size and date.
			intent.putExtra("browser_list_layout", "2");
			startActivityForResult(intent, 999);*/
			
			/*Intent intent = new Intent();
			Uri directory = Uri.fromFile(new File("/sdcard"));
			intent.setAction(Intent.ACTION_PICK);
			intent.setDataAndType(directory, "vnd.android.cursor.dir/*");
			//intent.setDataAndType(directory, "file://");
			intent.putExtra("browser_list_layout", "2");
			intent.putExtra("explorer_title", "ca ne marche pas");
			startActivityForResult(intent, 666);*/
			
			//intent.setDataAndType(startDir, "vnd.android.cursor.dir/*");
			//intent.setDataAndType(startDir, "file://");
			//Intent intent = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.INTERNAL_CONTENT_URI);
			
			//ScreenSecurity.startActivityForResult(i, 999);
			//ScreenSecurity.startActivityForResult(new Intent(Intent.ACTION_GET_CONTENT), ScreenSecurity.REQUEST_CODE_PRIV_KEY);
		}
	};
	
	private OnClickListener ibPubKey_OnClickListener = new OnClickListener(){
		public void onClick(View v) {
		}
	};
	
	private OnClickListener ibCA_OnClickListener = new OnClickListener(){
		public void onClick(View v) {
		}
	};
	
	private OnCheckedChangeListener cbTlsFiles_OnCheckedChangeListener = new OnCheckedChangeListener(){
		public void onCheckedChanged(CompoundButton arg0, boolean isChecked) {
			// mLlTlsFiles.setVisibility(isChecked ? View.VISIBLE : View.INVISIBLE);
			// Toast.makeText(ScreenSecurity.this, "Not implemented", Toast.LENGTH_SHORT).show();
		}
	};
	
	private OnCheckedChangeListener cbTlsSecAgree_OnCheckedChangeListener = new OnCheckedChangeListener(){
		public void onCheckedChanged(CompoundButton arg0, boolean isChecked) {
			// mConfigurationService.setBoolean(CONFIGURATION_SECTION.SECURITY, CONFIGURATION_ENTRY.TLS_SEC_AGREE, isChecked);
		}
	};
	
	private static class ScreenSecuritySRtpMode {
		private final String mDescription;
		private final tmedia_srtp_mode_t mMode;

		private ScreenSecuritySRtpMode(tmedia_srtp_mode_t mode, String description) {
			mMode = mode;
			mDescription = description;
		}

		@Override
		public String toString() {
			return mDescription;
		}

		@Override
		public boolean equals(Object o) {
			return mMode.equals(((ScreenSecuritySRtpMode)o).mMode);
		}
		
		static int getSpinnerIndex(tmedia_srtp_mode_t mode){
			for(int i = 0; i< sSpinnerSRtpModeItems.length; i++){
				if(mode == sSpinnerSRtpModeItems[i].mMode){
					return i;
				}
			}
			return 0;
		}
	}
	
	private static class ScreenSecuritySRtpType {
		private final String mDescription;
		private final tmedia_srtp_type_t mType;

		private ScreenSecuritySRtpType(tmedia_srtp_type_t type, String description) {
			mType = type;
			mDescription = description;
		}

		@Override
		public String toString() {
			return mDescription;
		}

		@Override
		public boolean equals(Object o) {
			return mType.equals(((ScreenSecuritySRtpType)o).mType);
		}
		
		static int getSpinnerIndex(tmedia_srtp_type_t type){
			for(int i = 0; i< sSpinnerSRtpTypeItems.length; i++){
				if(type == sSpinnerSRtpTypeItems[i].mType){
					return i;
				}
			}
			return 0;
		}
	}
}
