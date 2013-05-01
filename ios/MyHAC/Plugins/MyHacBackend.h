//
//  MyHacBackend.h
//  My HAC
//
//  Created by Dennis on 1/26/13.
//
//

#import <Cordova/CDV.h>

@interface hClass : NSObject
{
    NSString* Name;
    NSString* SectionID;
    //NSString* Average;
    double Average;
    NSString* CourseSession;
}

@property (retain) NSString *Name;
@property (retain) NSString *SectionID;
@property (retain) NSString *CourseSession;
@property double Average;

@end

@interface MyHacBackend : CDVPlugin
{
    NSMutableArray* Classes;
    BOOL LoggedIn;
    NSString* BaseAddress;
    NSString* Run;
    int CurrentSubject;
    int NotifInterval;
    
    CLLocationManager *locationManager;
    NSDate* lastUpdate;
    
    dispatch_block_t expirationHandler;
    dispatch_block_t script;
    UIBackgroundTaskIdentifier bgTask;
    

}

+ (MyHacBackend *) instance;

- (id) init;
- (void) setup:(CDVInvokedUrlCommand*)command;
- (void) gradeUpdater:(CDVInvokedUrlCommand*)command;
- (void) addSubject:(CDVInvokedUrlCommand*)command;

- (void) initialize:(CDVInvokedUrlCommand*)command;
- (void) startNotification:(CDVInvokedUrlCommand*)command;
- (void) stopNotification:(CDVInvokedUrlCommand*)command;
- (void) queryNotification:(CDVInvokedUrlCommand*)command;
- (void) clearCookies:(CDVInvokedUrlCommand*)command;
- (NSString *)stringWithUrl:(NSURL *)url;

- (void)locationManager:(CLLocationManager *)manager
     didUpdateLocations:(NSArray *)locations;

@end
