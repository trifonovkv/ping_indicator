all : ping_indicator@trifonovkv.gmail.com.zip 

ping_indicator@trifonovkv.gmail.com.zip : 
	zip -r $@ . -x@exclude.lst

