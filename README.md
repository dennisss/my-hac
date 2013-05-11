My HAC
======

Version
-------
> The current code represents version 1.0 in the iOS and Android app stores  
> Phonegap version: 2.6.0 (iOS), 2.7.0rc1 (Android)


Background
----------

My HAC is a smartphone and tablet application designed for students in school districts that use the eSchoolPlus Home Access Center system for managing grades and other student information. The interface is designed to better conform to a small screen size with improved ease of use. Currently you can view grades and attendance information. Some of the planned features include: live class schedules, disable sound during school, calendar integration, and much more. Please note, as this is a free app created by an active student, do not expect this to be a perfect app. Created and tested by a student at Council Rock High school North.

Why Open Source?
----------------
- As an app designed for students and involving potentially sensitive data, keeping the app totally open source means that schools and students can trust the product they are endorsing by using this app. All the code available here is identical to what is released onto the app stores for public use.
- In the spirit of education, seeing the code behind the apps they are using can teach students how to make similiar programs.
- Anyone can contribute. This means that the app can stay up-to-date and bug free longer.
- Free!

School Administrators
---------------------
> Some features of this app use the user's location to automatically configure the app for their school.
> Unfortunately, many of the schools can have HAC are not yet listed when using these features due to the lack of any reliable database for this data.
> If you are a school official, you can request that your school district be added.
> For more information visit [this page.]("http://my-hac.appspot.com/")

File Structure
-------------

>master  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ios : iOS Xcode project and code  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/android : Android Eclipse project and code  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/www : Common HTML/Javascript code  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/script  


Changelog
---------

Version 1.0.1:

- Fixed minor bugs on older android versions
- Fixed data corruption issues when updating that caused the app to stay on the splash screen 
- Other minor compatibility fixes

Version 1.0:

- First open source release
- Unified code between iOS and Android
- Support for sites with multiple districts
- Added an quick schedule viewer on the home page
- You can now find your school info with your GPS
- Pick any color as your background theme
- Multi-student data is now saved so you only have to chose once
- Added grade notifications to android

Version: 0.9.1 (iOS Only):

- Notifications fixed


Version: 0.9 (iOS Only):

- App store release


Version: 0.8 (Android Only):

- Initial public beta release


License
-------
- MIT

    