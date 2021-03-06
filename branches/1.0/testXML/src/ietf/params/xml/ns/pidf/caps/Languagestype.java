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
package ietf.params.xml.ns.pidf.caps;

import java.util.ArrayList;
import java.util.List;

import org.simpleframework.xml.Default;
import org.simpleframework.xml.DefaultType;
import org.simpleframework.xml.Element;
import org.simpleframework.xml.Namespace;
import org.simpleframework.xml.Root;

@Root(name = "languagestype", strict=false)
@Namespace(reference = "urn:ietf:params:xml:ns:pidf:caps")
@Default(DefaultType.FIELD)
public class Languagestype {

    protected Languagestype.Supported supported;
    protected Languagestype.Notsupported notsupported;
    
    public Languagestype.Supported getSupported() {
        return supported;
    }
    
    public void setSupported(Languagestype.Supported value) {
        this.supported = value;
    }
    
    public Languagestype.Notsupported getNotsupported() {
        return notsupported;
    }
    
    public void setNotsupported(Languagestype.Notsupported value) {
        this.notsupported = value;
    }    
    
    @Root(strict=false)
    @Namespace(reference = "urn:ietf:params:xml:ns:pidf:caps")
	@Default(DefaultType.FIELD)
    public static class Notsupported {
        @Element(required = true)
        protected List<String> l;

        
        public List<String> getL() {
            if (l == null) {
                l = new ArrayList<String>();
            }
            return this.l;
        }
    }    
    
    @Root(strict=false)
    @Namespace(reference = "urn:ietf:params:xml:ns:pidf:caps")
	@Default(DefaultType.FIELD)
    public static class Supported {

        @Element(required = true)
        protected List<String> l;
        
        public List<String> getL() {
            if (l == null) {
                l = new ArrayList<String>();
            }
            return this.l;
        }
    }
}
